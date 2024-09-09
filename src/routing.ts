import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'
import BadDAWG from './views/BadDAWG.vue'

export const WorkGroupIDRegex = /^(?:workgroup:)([a-z0-9-]+)/

const wgroute = (s: string): string => `/workgroup/${s}`

export const dawgLinker = (t: string): string => {
  const matches = WorkGroupIDRegex.exec(t)
  if (!matches || matches?.length < 2) return wgroute('404')

  return wgroute(encodeURIComponent(matches[1]))
}
export const base = window.location.host.includes('localhost') ? '/' : '/dawg'

export const routes = [
  { path: '/', component: SearchDAWG, name: 'SearchPage' },
  { path: '/error', component: BadDAWG, name: 'ErrorPage' },
  { path: wgroute(':id'), component: SingleDAWG, name: 'ViewDAWG' }
]
