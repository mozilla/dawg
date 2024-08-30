import { WorkGroupIDRegex } from './workgroups'
import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'

export const routes = [
  { path: '/', component: SearchDAWG, name: 'Search Page' },
  { path: '/workgroup/:dawgid', component: SingleDAWG, name: 'View DAWG' }
]

export const dawgLinker = (t: string | undefined) => {
  if (!t || typeof t !== 'string' || t === '') return ''

  const matches = WorkGroupIDRegex.exec(t)

  if (!matches || matches?.length < 2) return ''

  return `/workgroup/${encodeURIComponent(matches[1])}`
}
