export enum Source {
  v1 = 'gcpv1_enriched.json',
  v2 = 'gcpv2_merged.json',
  mock = 'mockdata.json'
}

export const sources: Source[] = (() => {
  console.warn(import.meta.env)
  switch (true) {
    case import.meta.env.PROD:
    case import.meta.env.VITE_USE_PROD_DATA == 'true':
      return [Source.v1, Source.v2]

    case import.meta.env.DEV:
    default:
      return [Source.mock]
  }
})()

export const routebase: string = import.meta.env.BASE_URL
