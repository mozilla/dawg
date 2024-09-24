export enum Source {
  v1 = 'gcpv1_enriched.json',
  v2 = 'gcpv2_merged.json',
  mock = 'mockdata.json'
}

export const sources: Source[] = (() => {
  if (import.meta.env.MODE == 'production' || import.meta.env.VITE_USE_PROD_DATA == 'true')
    return [Source.v1, Source.v2]

  return [Source.mock]
})()

export const routebase: string = import.meta.env.BASE_URL
