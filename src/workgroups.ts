export type MapOfLists = { [key: string]: string[] }
export type ListOfText = string[]
export type ListOfLinks = string[]
export type PlainText = string

export const WorkGroupIDRegex = /^(?!workgroup:)?([a-z0-9-]+)/

export type WorkGroup = {
  id: string
  type: PlainText
  links: ListOfLinks
  sponsor: PlainText
  managers: ListOfText
  members: MapOfLists
}
const nd = '[no data]' as const
export const NullWorkGroup: WorkGroup = {
  id: nd,
  type: nd,
  links: [nd],
  sponsor: nd,
  managers: [nd],
  members: { none: [] }
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
const WorkGroupDisplayModes: Map<keyof WorkGroup, DisplayMode> = new Map([
  ['id', DisplayMode.DAWGLink],
  ['type', DisplayMode.PlainText],
  ['links', DisplayMode.ListOfLinks],
  ['sponsor', DisplayMode.PlainText],
  ['managers', DisplayMode.ListOfText],
  ['members', DisplayMode.MapOfLists]
])

export const getFieldDisplayMode = (f: keyof WorkGroup): DisplayMode => {
  return WorkGroupDisplayModes.get(f) || DisplayMode.PlainText
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

const none = 'None' as const

const copy = (o: any) => JSON.parse(JSON.stringify(o))

export const newWorkGroup = (sourcename: string, groupname: string, data: any): WorkGroup => {
  const wg = copy(NullWorkGroup)

  wg.links = data?.metadata?.links || []

  // This seems redundant from the GH link already provided?
  wg.links.push(
    `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+%22workgroup%3A${groupname}%22&type=code`
  )
  for (const project in data.team_projects) {
    wg.links.push(`https://console.cloud.google.com/home/dashboard?project=${project}`)
  }

  wg.id = `workgroup:${groupname}`

  if (Sources.has(sourcename)) wg.type = Sources.get(sourcename)

  if (data?.metadata?.sponsor) wg.sponsor = data.metadata.sponsor

  if (data?.metadata?.managers) wg.managers = data.metadata.managers

  if (Object.keys(data?.members).length > 0)
    wg.members = Object.fromEntries(
      Object.entries(data?.members).filter(([key]) => !DefaultWorkGroupIDs.includes(key))
    )

  return wg
}
