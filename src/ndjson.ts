export type GithubTeam = {
  org: string
  team_id: string
  team_name: string
  team_node_id: string
  team_slug: string
  members?: string[]
}

export type WorkgroupRow = {
  workgroup: string
  sponsor: string
  managers?: string[]
  owners?: string[]
  tickets?: string[]
  github_teams?: GithubTeam[]
  subgroups?: Array<{
    name: string
    // Bare emails (YAML `users:` list).
    users?: string[]
    // IAM-resolved view (mixed `group:`/`serviceAccount:`/etc.). Surfaced
    // separately in the dashboard, not used for the user list.
    members?: string[]
    managers?: string[]
    workgroups?: string[]
    service_accounts?: string[]
    google_groups?: string[]
    workgroup_id?: string
  }>
}

export type SubgroupMemberRow = {
  workgroup: string
  subgroup: string
  value: string
  member_type: string
  github_login?: string | null
  github_node_id?: string | null
  resolved_email?: string | null
  github_orgs?: string[]
}

export type MemberMetadata = {
  member_type: string
  github_login?: string | null
  github_node_id?: string | null
  resolved_email?: string | null
  github_orgs?: string[]
}

export type MemberRowsByWorkgroup = Map<string, SubgroupMemberRow[]>

export type MergedWorkgroupInput = {
  metadata: { sponsor: string; managers: string[]; links: string[] }
  google_groups?: { [subgroup: string]: string[] }
  extra_google_groups?: { [subgroup: string]: string[] }
  subgroup_managers?: { [subgroup: string]: string[] }
  members?: { [subgroup: string]: string[] }
  member_metadata?: { [subgroup: string]: { [value: string]: MemberMetadata } }
  github_teams?: GithubTeam[]
}

export const parseNdjson = <T>(text: string): T[] => {
  const out: T[] = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    out.push(JSON.parse(trimmed) as T)
  }
  return out
}

export const groupMemberRowsByWorkgroup = (rows: SubgroupMemberRow[]): MemberRowsByWorkgroup => {
  const grouped: MemberRowsByWorkgroup = new Map()
  for (const row of rows) {
    let arr = grouped.get(row.workgroup)
    if (!arr) {
      arr = []
      grouped.set(row.workgroup, arr)
    }
    arr.push(row)
  }
  return grouped
}

const autoGoogleGroup = (wg: string, sg: string) =>
  `gcp-wg-${wg}--${sg}@firefox.gcp.mozilla.com`

const prefixForMemberType = (memberType: string): string | null => {
  switch (memberType) {
    case 'user': return 'user'
    case 'workgroup': return 'workgroup'
    case 'service_account': return 'serviceAccount'
    case 'google_group': return 'group'
    default: return null
  }
}

export const buildWorkgroupInput = (
  wgRow: WorkgroupRow,
  memberRows: SubgroupMemberRow[] | undefined,
): MergedWorkgroupInput => {
  const subgroup_managers: { [s: string]: string[] } = {}
  const extra_google_groups: { [s: string]: string[] } = {}
  const members: { [s: string]: string[] } = {}
  const google_groups: { [s: string]: string[] } = {}
  const member_metadata: { [s: string]: { [v: string]: MemberMetadata } } = {}

  const sgIndex = new Map<string, NonNullable<WorkgroupRow['subgroups']>[number]>()
  for (const sg of wgRow.subgroups ?? []) sgIndex.set(sg.name, sg)

  const memberRowsBySubgroup = new Map<string, SubgroupMemberRow[]>()
  for (const r of memberRows ?? []) {
    let arr = memberRowsBySubgroup.get(r.subgroup)
    if (!arr) {
      arr = []
      memberRowsBySubgroup.set(r.subgroup, arr)
    }
    arr.push(r)
  }

  // A subgroup in workgroups.ndjson is a "template" (not a real subgroup,
  // just a spec terraform expands into multiple concrete subgroups) when its
  // only non-empty field is a wildcard SA reference. Skip those.
  const isTemplateSubgroup = (sg: NonNullable<WorkgroupRow['subgroups']>[number]): boolean => {
    const hasMembers = (sg.members?.length ?? 0) > 0
    const hasWorkgroups = (sg.workgroups?.length ?? 0) > 0
    const hasManagers = (sg.managers?.length ?? 0) > 0
    const hasGoogleGroups = (sg.google_groups?.length ?? 0) > 0
    const hasConcreteSAs = (sg.service_accounts ?? []).some((sa) => !sa.endsWith('.*'))
    return !(hasMembers || hasWorkgroups || hasManagers || hasGoogleGroups || hasConcreteSAs)
      && (sg.service_accounts?.some((sa) => sa.endsWith('.*')) ?? false)
  }

  const subgroupNames = new Set<string>()
  for (const sg of wgRow.subgroups ?? []) {
    if (!isTemplateSubgroup(sg)) subgroupNames.add(sg.name)
  }
  for (const sg of memberRowsBySubgroup.keys()) subgroupNames.add(sg)

  for (const sgName of subgroupNames) {
    const sg = sgIndex.get(sgName)
    const rows = memberRowsBySubgroup.get(sgName) ?? []

    if (sg?.managers && sg.managers.length > 0) {
      subgroup_managers[sgName] = [...sg.managers]
    }

    if (sg?.google_groups && sg.google_groups.length > 0) {
      extra_google_groups[sgName] = [...sg.google_groups]
    }

    const enriched: string[] = []
    const seen = new Set<string>()
    const add = (s: string) => {
      if (seen.has(s)) return
      seen.add(s)
      enriched.push(s)
    }

    for (const r of rows) {
      // Custom Google groups belong on extra_google_groups (which gets merged
      // into wg.google_groups), not on wg.members. Same shape the OLD pipeline
      // produced via enrich.py's extra_google_groups field.
      if (r.member_type === 'google_group') {
        if (!extra_google_groups[sgName]) extra_google_groups[sgName] = []
        if (!extra_google_groups[sgName].includes(r.value)) extra_google_groups[sgName].push(r.value)
        continue
      }

      const prefix = prefixForMemberType(r.member_type)
      if (!prefix) continue
      add(`${prefix}:${r.value}`)

      if (!member_metadata[sgName]) member_metadata[sgName] = {}
      member_metadata[sgName][r.value] = {
        member_type: r.member_type,
        github_login: r.github_login,
        github_node_id: r.github_node_id,
        resolved_email: r.resolved_email,
        github_orgs: r.github_orgs,
      }
    }

    // Fall back to workgroups.ndjson subgroup data if subgroup_members.ndjson
    // had no rows for this subgroup. `users` is bare emails; `members` is the
    // IAM-resolved mix (`group:`/`serviceAccount:`/etc.) and will get its own
    // dedicated rendering when the dashboard surfaces it.
    if (rows.length === 0 && sg) {
      for (const m of sg.users ?? []) add(`user:${m}`)
      for (const w of sg.workgroups ?? []) add(`workgroup:${w}`)
      for (const sa of sg.service_accounts ?? []) {
        if (sa.includes('@')) add(`serviceAccount:${sa}`)
      }
    }

    // Mirror the auto-emitted `group:` entry terraform produces for any
    // subgroup that has no other terraform-managed members.
    if (enriched.length === 0) {
      add(`group:${autoGoogleGroup(wgRow.workgroup, sgName)}`)
    }

    members[sgName] = enriched
    google_groups[sgName] = [autoGoogleGroup(wgRow.workgroup, sgName)]
  }

  return {
    metadata: {
      sponsor: wgRow.sponsor,
      managers: wgRow.managers ?? [],
      links: wgRow.tickets ?? [],
    },
    google_groups,
    extra_google_groups,
    subgroup_managers,
    members,
    member_metadata,
    github_teams: wgRow.github_teams,
  }
}
