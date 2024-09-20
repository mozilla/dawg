export enum Source {
  v1 = 'gcpv1_enriched.json',
  v2 = 'gcpv2_merged.json',
  mock = 'mockdata.json'
}

export const sources: Source[] =
  import.meta.env.PROD || import.meta.env.USE_PROD ? [Source.v1, Source.v2] : [Source.mock]

export const routebase: string = import.meta.env.PROD ? '/dawg/' : '/'
