export type WorkGroup = {
  name: string
  type?: string
  links: string[]
  sponsor: string
  managers: string[]
  subgroups: string[]
  members_list: string[]
  members: { [key: string]: string[] }
}

export type WorkGroupMap = Map<string, WorkGroup>
export type WorkGroupSet = WorkGroup[]

export enum DisplayAs {
  PlainText,
  ListOfText,
  ListOfLinks,
  MapOfLists,
  DAWGLink
}
/* A map of WorkGroup properties to intended display modes
Creating this assignment here prevents the need for inferring it later
which can be difficult for things such as PlainText vs DAWGLink which
are both of type `string`
*/
export const WorkGroupFieldKinds: Map<keyof WorkGroup, DisplayAs> = new Map([
  ['name', DisplayAs.DAWGLink],
  ['type', DisplayAs.PlainText],
  ['links', DisplayAs.ListOfLinks],
  ['sponsor', DisplayAs.PlainText],
  ['managers', DisplayAs.ListOfText],
  ['subgroups', DisplayAs.ListOfText],
  ['members_list', DisplayAs.ListOfText],
  ['members', DisplayAs.MapOfLists]
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
  return Array.from(wgm.values())
}
//todo types
export const newWorkGroup = (sourcename: string, groupname: string, data: any): WorkGroup => {
  const subgroups: string[] = []
  const members_list: string[] = []

  for (const subgroup in data.members) {
    // skip a couple of internal groups
    if (!DefaultWorkGroupIDs.includes(subgroup)) {
      subgroups.push(subgroup)
      members_list.push(...data.members[subgroup])
    }
  }

  const links: string[] = data?.metadata?.links || []
  // This seems redundant from the GH link already provided?
  // links.push(
  //   `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3A${groupname}%22&type=code`
  // )
  for (const project in data.team_projects) {
    links.push(`https://console.cloud.google.com/home/dashboard?project=${project}`)
  }

  return {
    name: groupname,
    type: Sources.get(sourcename),
    links,
    sponsor: data?.metadata?.sponsor || 'not listed',
    managers: data?.metadata?.managers || [],
    subgroups,
    members_list,
    members: data?.members || {}
  }
}
