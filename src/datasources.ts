/**
 * Where workgroup data comes from: BigQuery via `quick.query` when served from
 * Quick, else static NDJSON under `public/` for dev and tests. Both produce the
 * identical row shape, since the BigQuery loader selects TO_JSON_STRING.
 */

import type { LongVersion, ShortVersion } from './metadata'
import { parseNdjson, type WorkgroupRow, type SubgroupMemberRow } from './ndjson'
import { queryJsonRows } from './quick'
import { readCache, writeCache } from './cache'

export type SourceData = {
  workgroups: WorkgroupRow[]
  members: SubgroupMemberRow[]
}

export type LoadResult = SourceData & {
  /** Epoch ms the rows were pulled from the backend, cache hits included. */
  fetchedAt: number
  fromCache: boolean
}

export type LoadOptions = {
  /** Skip the cache and re-query the backend. */
  force?: boolean
}

/** Provenance of the data just loaded. Drives the background revalidate. */
export type LoadMeta = {
  origin: string
  fetchedAt: number
  fromCache: boolean
  refreshable: boolean
}

export type SourceBundle = {
  ver: ShortVersion
  kind: LongVersion
  /** Human-readable provenance, for logging. Not shown to the reader. */
  origin: string
  /** True when the backend is live, so a background re-query is meaningful. */
  refreshable: boolean
  load: (opts?: LoadOptions) => Promise<LoadResult>
}

const WORKGROUPS_VIEW = '`mozdata.mozcloud.workgroups`'
const MEMBERS_VIEW = '`mozdata.mozcloud.workgroup_subgroup_members`'

// Both keys verified unique against the live views. OFFSET paging drops or
// repeats rows if the sort key isn't unique and non-null.
const WORKGROUPS_ORDER = 't.workgroup'
const MEMBERS_ORDER = 't.workgroup, t.subgroup, t.member_type, t.value'

const BQ_CACHE_KEY = 'bigquery_v2'

// Bounds how stale the *first frame* may be, not freshness — App.vue re-queries
// in the background moments later. Past this, show a spinner instead.
const SERVE_STALE_MS = 24 * 60 * 60 * 1000 // 24 hours

export const bigQueryBundle: SourceBundle = {
  ver: 'v2',
  kind: 'Workgroup',
  origin: 'BigQuery · mozdata.mozcloud',
  refreshable: true,
  load: async ({ force = false }: LoadOptions = {}) => {
    if (!force) {
      const hit = readCache<SourceData>(BQ_CACHE_KEY, SERVE_STALE_MS)
      if (hit) return { ...hit.data, fetchedAt: hit.at, fromCache: true }
    }

    const [workgroups, members] = await Promise.all([
      queryJsonRows<WorkgroupRow>(WORKGROUPS_VIEW, WORKGROUPS_ORDER),
      queryJsonRows<SubgroupMemberRow>(MEMBERS_VIEW, MEMBERS_ORDER),
    ])

    const data: SourceData = { workgroups, members }
    writeCache(BQ_CACHE_KEY, data)
    return { ...data, fetchedAt: Date.now(), fromCache: false }
  },
}

const fetchText = async (base: string, path: string): Promise<string> => {
  const res = await fetch(`//${window.location.host}${base}${path}`)
  if (!res.ok) throw new Error(`fetch ${path} failed: ${res.status} ${res.statusText}`)
  return res.text()
}

export const ndjsonBundle = (
  spec: {
    ver: ShortVersion
    kind: LongVersion
    origin: string
    workgroups: string
    members: string
  },
  base: string,
): SourceBundle => ({
  ver: spec.ver,
  kind: spec.kind,
  origin: spec.origin,
  refreshable: false,
  load: async () => {
    const [wgText, memberText] = await Promise.all([
      fetchText(base, spec.workgroups),
      fetchText(base, spec.members),
    ])
    return {
      workgroups: parseNdjson<WorkgroupRow>(wgText),
      members: parseNdjson<SubgroupMemberRow>(memberText),
      fetchedAt: Date.now(),
      fromCache: false,
    }
  },
})
