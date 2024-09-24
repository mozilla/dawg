import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'
import BadDAWG from './views/BadDAWG.vue'
import { WorkGroupIDRegex } from './workgroups'
import { routebase } from './config'

export { routebase }

export const wgroute = (s: string): string => `/workgroup/${s}`

export const routes = [
  { path: '/', component: SearchDAWG, name: 'SearchPage' },
  { path: '/error', component: BadDAWG, name: 'ErrorPage' },
  { path: wgroute(':id'), component: SingleDAWG, name: 'ViewDAWG' }
]

export const dawgLinker = (t: string): string => {
  const matches = WorkGroupIDRegex.exec(t)
  if (!matches || matches?.length < 2) return wgroute('404')

  return routebase + wgroute(encodeURIComponent(matches[1]))
}
