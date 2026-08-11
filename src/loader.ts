/**
 * Turns source bundles into the DAWG structures the views consume. Outside
 * DataLoader.vue because the background revalidate calls it too, and that has
 * no component to mount.
 */

import type { DAWG, DAWGMap, DAWGSet } from './workgroups'
import { newWorkGroup, formatDAWGID } from './workgroups'
import type { ShortVersion } from './metadata'
import { groupMemberRowsByWorkgroup, buildWorkgroupInput } from './ndjson'
import type { LoadMeta, LoadOptions, LoadResult, SourceBundle } from './datasources'

export type LoadedData = {
  map: DAWGMap
  set: DAWGSet
  meta: LoadMeta
}

export const loadAll = async (
  sources: SourceBundle[],
  opts: LoadOptions = {},
): Promise<LoadedData> => {
  const map: DAWGMap = new Map()
  const set: DAWGSet = []
  const loaded: LoadResult[] = []

  await Promise.all(
    sources.map(async (bundle) => {
      const data = await bundle.load(opts)
      loaded.push(data)

      const memberRowsByWg = groupMemberRowsByWorkgroup(data.members)

      for (const wgRow of data.workgroups) {
        const groupname = wgRow.workgroup
        const input = buildWorkgroupInput(wgRow, memberRowsByWg.get(groupname))
        const dawg = newWorkGroup(groupname, bundle.kind, input)
        const id = formatDAWGID(groupname)
        if (!map.has(id)) map.set(id, new Map<ShortVersion, DAWG>())
        map.get(id)?.set(bundle.ver, dawg)
        set.push(dawg)
      }
    }),
  )

  return {
    map,
    set,
    meta: {
      origin: sources.map((s) => s.origin).join(', '),
      // Oldest slice on show, and a cache hit only if every source was cached.
      fetchedAt: loaded.length ? Math.min(...loaded.map((r) => r.fetchedAt)) : Date.now(),
      fromCache: loaded.length > 0 && loaded.every((r) => r.fromCache),
      refreshable: sources.some((s) => s.refreshable),
    },
  }
}
