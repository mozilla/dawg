import type { LongVersion, ShortVersion } from './metadata'

export const WorkGroupIDRegex = /^(?:workgroup:)([a-z0-9-]+)/
export const SubGroupIDRegex = /^(?:workgroup:)([a-z0-9-]+)\/([a-z0-9-]+)/

export type DAWG = {
  id: PlainText
  kind: LongVersion
  links: ListOfLinks
  sponsor: PlainText
  managers: ListOfText
  google_groups: MapOfLists
  subgroup_managers: MapOfLists
  members: MapOfLists
}

export type MapOfLists = { [key: string]: string[] }
export type ListOfText = string[]
export type ListOfLinks = string[]
export type PlainText = string
export type WorkGroupID = string

// I'm sorry for the clever naming but I'm stuck on what to call something that "houses" the different dawgs by kind
export type DAWGHouse = Map<ShortVersion, DAWG>
export type DAWGMap = Map<string, DAWGHouse>
export type DAWGSet = DAWG[]

const nd = '[no data]' as const
export const NullWorkGroup: DAWG = {
  id: nd,
  kind: nd as LongVersion,
  links: [nd],
  sponsor: nd,
  managers: [nd],
  google_groups: {},
  subgroup_managers: {},
  members: { none: [] }
} as const

const copy = (o: any) => JSON.parse(JSON.stringify(o))
export const formatDAWGID = (name: string) => `workgroup:${name}`
const transformSubGroupIDs = (wgID: string, subID: string) =>
  `${wgID}/${subID}`

export const newWorkGroup = (groupname: string, kind: LongVersion, data: any): DAWG => {
  const wg = copy(NullWorkGroup)
  wg.id = formatDAWGID(groupname)
  wg.kind = kind
  wg.links = data?.metadata?.links || []

  // This seems redundant from the GH link already provided?
  wg.links.push(
    `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3A${groupname}%22&type=code`
  )

  data.team_projects?.forEach((project: string) => {
    wg.links.push(`https://console.cloud.google.com/home/dashboard?project=${project}`)
  })

  if (data?.metadata?.sponsor) wg.sponsor = data.metadata.sponsor

  if (data?.metadata?.managers) wg.managers = data.metadata.managers

  const mergedGroups: { [key: string]: string[] } = {}
  for (const source of [data?.google_groups, data?.extra_google_groups]) {
    if (!source) continue
    for (const [key, value] of Object.entries(source)) {
      const subgroupID = transformSubGroupIDs(wg.id, key)
      const groups = (value as string[]).map((g: string) => g.startsWith('group:') ? g : `group:${g}`)
      if (!mergedGroups[subgroupID]) mergedGroups[subgroupID] = []
      for (const g of groups) {
        if (!mergedGroups[subgroupID].includes(g)) mergedGroups[subgroupID].push(g)
      }
    }
  }
  if (Object.keys(mergedGroups).length > 0)
    wg.google_groups = mergedGroups

  if (data?.subgroup_managers && Object.keys(data.subgroup_managers).length > 0)
    wg.subgroup_managers = Object.fromEntries(
      Object.entries(data.subgroup_managers)
        .filter(([, value]) => (value as string[]).length > 0)
        .map(([key, value]) => {
          return [transformSubGroupIDs(wg.id, key), value]
        })
    )

  if (Object.keys(data?.members).length > 0)
    wg.members = Object.fromEntries(
      Object.entries(data?.members)
        .map(([key, value]) => {
          const subgroupID = transformSubGroupIDs(wg.id, key)
          const existing = value as string[]
          const sas = (data?.service_accounts?.[key] || [])
            .filter((sa: string) => !existing.some((m: string) => m.includes(sa)))
            .map((sa: string) => `serviceAccount:${sa}`)
          return [subgroupID, [...existing, ...sas]]
        })
    )

  return wg
}
