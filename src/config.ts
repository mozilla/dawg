import { bigQueryBundle, ndjsonBundle, type SourceBundle } from './datasources'
import { isQuickHosted } from './quick'

export type { SourceBundle, SourceData, LoadResult } from './datasources'

export const routebase: string = import.meta.env.BASE_URL

export type DataSourceMode = 'bigquery' | 'prod-ndjson' | 'mock'

/**
 * Resolution order:
 *
 *  1. `VITE_DATA_SOURCE`, an explicit override for testing a specific backend.
 *  2. BigQuery whenever the Quick SDK is present, i.e. we're served from Quick.
 *  3. The static prod NDJSON pull, which keeps the legacy static-bucket build
 *     and `VITE_USE_PROD_DATA=true npm run dev` working unchanged.
 *  4. Mock fixtures, the local dev and e2e default.
 */
const resolveMode = (): DataSourceMode => {
  const override = import.meta.env.VITE_DATA_SOURCE as DataSourceMode | undefined
  if (override) return override

  if (isQuickHosted()) return 'bigquery'

  if (import.meta.env.MODE === 'production' || import.meta.env.VITE_USE_PROD_DATA === 'true')
    return 'prod-ndjson'

  return 'mock'
}

export const dataSourceMode: DataSourceMode = resolveMode()

const prodBundle = ndjsonBundle(
  {
    ver: 'v2',
    kind: 'Workgroup',
    origin: 'static export · workgroups.ndjson',
    workgroups: 'workgroups.ndjson',
    members: 'subgroup_members.ndjson',
  },
  routebase,
)

const mockBundle = ndjsonBundle(
  {
    ver: 'm1',
    kind: 'mockdata',
    origin: 'mock fixtures',
    workgroups: 'mock_workgroups.ndjson',
    members: 'mock_subgroup_members.ndjson',
  },
  routebase,
)

export const sources: SourceBundle[] = (() => {
  switch (dataSourceMode) {
    case 'bigquery':
      return [bigQueryBundle]
    case 'prod-ndjson':
      return [prodBundle]
    default:
      return [mockBundle]
  }
})()
