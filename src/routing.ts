import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'
import BadDAWG from './views/BadDAWG.vue'
import { routebase } from './config'

export { routebase }

export const wgroute = (s: string): string => `/workgroup/${s}`

export const routes = [
  { path: '/', component: SearchDAWG, name: 'SearchPage' },
  { path: '/error', component: BadDAWG, name: 'ErrorPage' },
  { path: wgroute(':id'), component: SingleDAWG, name: 'ViewDAWG' }
]

export const dawgLinker = (wg: string, sg?: string): string => {
  // const matches = WorkGroupIDRegex.exec(t)
  // if (!matches || matches?.length < 2) return wgroute('404')
  const wgpath = wgroute(encodeURIComponent(wg.replace('workgroup:', '')))

  return !sg ? wgpath : wgpath + `#${encodeURIComponent(sg)}`
}
