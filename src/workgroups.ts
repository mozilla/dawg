export type MapOfLists = { [key: string]: string[] }
export type ListOfText = string[]
export type ListOfLinks = string[]
export type PlainText = string

export type WorkGroup = {
  id: string
  type?: PlainText
  links: ListOfLinks
  sponsor: PlainText
  managers: ListOfText
  members: MapOfLists
}
const nd = 'no data' as const
export const NullWorkGroup: WorkGroup = {
  id: nd,
  type: nd,
  links: [],
  sponsor: nd,
  managers: [],
  members: {}
} as const

export type WorkGroupMap = Map<string, WorkGroup>
export type WorkGroupSet = WorkGroup[]

export enum DisplayMode {
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
export const WorkGroupDisplayModes: Map<keyof WorkGroup, DisplayMode> = new Map([
  ['id', DisplayMode.DAWGLink],
  ['type', DisplayMode.PlainText],
  ['links', DisplayMode.ListOfLinks],
  ['sponsor', DisplayMode.PlainText],
  ['managers', DisplayMode.ListOfText],
  // ['subgroups', DisplayMode.ListOfText],
  // ['members_list', DisplayMode.ListOfText],
  ['members', DisplayMode.MapOfLists]
])

export const getFieldDisplayMode = (f: keyof WorkGroup, w: WorkGroup): DisplayMode => {
  return DisplayMode.PlainText
}

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
  const links: string[] = data?.metadata?.links || []
  // This seems redundant from the GH link already provided?
  links.push(
    `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3A${groupname}%22&type=code`
  )
  for (const project in data.team_projects) {
    links.push(`https://console.cloud.google.com/home/dashboard?project=${project}`)
  }

  return {
    id: `workgroup:${groupname}`,
    type: Sources.get(sourcename),
    links,
    sponsor: data?.metadata?.sponsor.length == 0 ? 'None' : data?.metadata?.sponsor,
    managers: data?.metadata?.managers.length == 0 ? ['None'] : data?.metadata?.managers,
    members:
      Object.keys(data?.members).length == 0
        ? {}
        : (Object.fromEntries(
            Object.entries(data?.members).filter(([key]) => !DefaultWorkGroupIDs.includes(key))
          ) as MapOfLists)
  }
}
