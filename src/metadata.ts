import { Source } from './config'
import type { DAWG } from './workgroups'

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

export const shortVersions = ['v1', 'v2', 'm1'] as const
export const longVersions = ['Data Access Workgroup', 'GCPv2 Workgroup', 'mockdata'] as const

export type ShortVersion = (typeof shortVersions)[number]
export type LongVersion = (typeof longVersions)[number]

export const sourceShortVersions = new Map<Source, ShortVersion>([
  [Source.v1, 'v1'],
  [Source.v2, 'v2'],
  [Source.mock, 'm1']
])

export const versionShortToLong = new Map<ShortVersion, LongVersion>([
  ['v1', 'Data Access Workgroup'],
  ['v2', 'GCPv2 Workgroup'],
  ['m1', 'mockdata']
])
