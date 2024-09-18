export type MapOfLists = { [key: string]: string[] }
export type ListOfText = string[]
export type ListOfLinks = string[]
export type PlainText = string
export type WorkGroupID = string

export const WorkGroupIDRegex = /^(?:workgroup:)([a-z0-9-]+)/

export const sourceFiles = ['gcpv1_enriched.json', 'gcpv2_merged.json', 'mockdata.json'] as const
export const versions = ['v1', 'v2', 'm1'] as const
export const dawgKinds = ['Data Access Workgroup', 'GCPv2 Workgroup', 'mockdata'] as const

export type SourceFile = (typeof sourceFiles)[number]
export type Version = (typeof versions)[number]
export type DAWGKind = (typeof dawgKinds)[number]

export const sourceVersions = new Map<SourceFile, Version>(
  sourceFiles.map((val, i) => [val, versions[i]])
)
export const versionKinds = new Map<Version, DAWGKind>(
  versions.map((val, i) => [val, dawgKinds[i]])
)

export type DAWG = {
  id: PlainText
  kind: DAWGKind
  links: ListOfLinks
  sponsor: PlainText
  managers: ListOfText
  members: MapOfLists
}
// I'm sorry for the clever naming but I'm stuck on what to call something that "houses" the different dawgs by kind
export type DAWGHouse = Map<Version, DAWG>
export type DAWGMap = Map<string, DAWGHouse>
export type DAWGSet = DAWG[]

const nd = '[no data]' as const
export const NullWorkGroup: DAWG = {
  id: nd,
  kind: nd as DAWGKind,
  links: [nd],
  sponsor: nd,
  managers: [nd],
  members: { none: [] }
} as const

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
const WorkGroupDisplayModes: Map<keyof DAWG, DisplayMode> = new Map([
  ['id', DisplayMode.DAWGLink],
  ['kind', DisplayMode.PlainText],
  ['links', DisplayMode.ListOfLinks],
  ['sponsor', DisplayMode.PlainText],
  ['managers', DisplayMode.ListOfText],
  ['members', DisplayMode.MapOfLists]
])

export const getFieldDisplayMode = (f: keyof DAWG): DisplayMode => {
  return WorkGroupDisplayModes.get(f) || DisplayMode.PlainText
}

const copy = (o: any) => JSON.parse(JSON.stringify(o))
export const formatDAWGID = (name: string) => `workgroup:${name}`
const defaultWorkGroupIDs = [
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
const filterDefaultWorkgroups = (key: string) => !defaultWorkGroupIDs.includes(key)
const transformSubGroupIDs = (wgID: string, subID: string) =>
  subID != 'default' ? `${wgID}/${subID}` : subID

export const newWorkGroup = (groupname: string, kind: DAWGKind, data: any): DAWG => {
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

  if (Object.keys(data?.members).length > 0)
    wg.members = Object.fromEntries(
      Object.entries(data?.members)
        .filter(([key]) => filterDefaultWorkgroups(key))
        .map(([key, value]) => {
          return [transformSubGroupIDs(wg.id, key), value]
        })
    )

  return wg
}
