export type WorkGroup = {
  name: string
  id: string
  type?: string
  links: string[]
  sponsor: string
  managers: string[]
  subgroups: string[]
  members: string[]
  team_projects: string[]
}

export type WorkGroupMap = Map<string, WorkGroup>
export type WorkGroupSet = WorkGroup[]

export enum DisplayAs {
  PlainText,
  ListOfText,
  ListOfLinks,
  DAWGLink
}
/* A map of WorkGroup properties to intended display modes
Creating this assignment here prevents the need for inferring it later
which can be difficult for things such as PlainText vs DAWGLink which
are both of type `string`
*/
export const WorkGroupFieldKinds: Map<keyof WorkGroup, DisplayAs> = new Map([
  ['name', DisplayAs.DAWGLink],
  ['id', DisplayAs.PlainText],
  ['type', DisplayAs.PlainText],
  ['links', DisplayAs.ListOfLinks],
  ['sponsor', DisplayAs.PlainText],
  ['managers', DisplayAs.ListOfText],
  ['subgroups', DisplayAs.ListOfText],
  ['members', DisplayAs.ListOfText],
  ['team_projects', DisplayAs.ListOfText]
])

const DefaultWorkGroupIDs = [
  '_default',
  'analysis-writer',
  'udf',
  'udf-writer',
  'team',
  'default-compute',
  'syndicate',
  'syndicated',
  'unmanaged',
  'client-managed',
  'application',
  'application-noanalysis'
]

export const Sources: Map<string, string> = new Map(
  Object.entries({
    'gcpv1_enriched.json': 'Data Access Workgroup',
    'gcpv2_merged.json': 'GCPv2 Workgroup'
  })
)
export const workgroupSetFromMap = (wgm: WorkGroupMap): WorkGroupSet => {
  console.warn('was called', Array.from(wgm.values()))

  return Array.from(wgm.values())
}
//todo types
export const fromDataSource = (sourcename: string, groupname: string, data: any): WorkGroup => {
  const subgroups: string[] = []
  const members: string[] = []

  for (const subgroup in data.members) {
    // skip a couple of internal groups
    if (!DefaultWorkGroupIDs.includes(subgroup)) {
      subgroups.push(subgroup)
      members.push(...data.members[subgroup])
    }
  }

  return {
    name: groupname,
    id: `workgroup:${groupname}`,
    // fixme: link to github code search e.g. https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3Acontextual-services%22&type=code
    type: Sources.get(sourcename),
    links: data?.metadata?.links || [],
    sponsor: data?.metadata?.sponsor || 'not listed',
    managers: data?.metadata?.managers || [],
    subgroups: subgroups,
    members: members,
    // fixme linkify e.g. https://console.cloud.google.com/home/dashboard?project=moz-fx-data-dataops
    team_projects: data.team_projects
  }
}
