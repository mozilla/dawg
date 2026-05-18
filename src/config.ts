import type { LongVersion, ShortVersion } from './metadata'

export type SourceBundle = {
  ver: ShortVersion
  kind: LongVersion
  workgroups: string
  members: string
}

const v2Bundle: SourceBundle = {
  ver: 'v2',
  kind: 'Workgroup',
  workgroups: 'workgroups.ndjson',
  members: 'subgroup_members.ndjson',
}

const mockBundle: SourceBundle = {
  ver: 'm1',
  kind: 'mockdata',
  workgroups: 'mock_workgroups.ndjson',
  members: 'mock_subgroup_members.ndjson',
}

export const sources: SourceBundle[] = (() => {
  if (import.meta.env.MODE == 'production' || import.meta.env.VITE_USE_PROD_DATA == 'true')
    return [v2Bundle]

  return [mockBundle]
})()

export const routebase: string = import.meta.env.BASE_URL
