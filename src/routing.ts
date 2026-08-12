import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'
import SadDAWG from './views/SadDAWG.vue'
import BadDAWG from './views/BadDAWG.vue'
import FAWG from './views/FAWG.vue'
import MemberList from './views/MemberList.vue'
import GithubStats from './views/GithubStats.vue'
import UserView from './views/UserView.vue'
import { routebase } from './config'

export { routebase }

export const wgroute = (s: string): string => `/workgroup/${s}`
export const userroute = (email: string): string => `/user/${encodeURIComponent(email)}`

/** Absolute link to a workgroup, or to a subgroup anchor within one. */
export const dawgUrl = (id: string): string => {
  const name = id.replace('workgroup:', '')
  const base = id.includes('/') ? id.split('/')[0].replace('workgroup:', '') : name
  return `${window.location.origin}${wgroute(encodeURIComponent(base))}${id.includes('/') ? '#' + id.split('/')[1] : ''}`
}

export const markdownLink = (id: string): string => `[${id}](${dawgUrl(id)})`

export const githubSearchUrl = (id: string): string => {
  const encoded = encodeURIComponent(`"${id}"`)
  return `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+${encoded}&type=code`
}

// workgroup:datasre -> the YAML terraform builds the workgroup from.
export const sourceUrl = (id: string): string => {
  const name = id.replace(/^workgroup:/, '').split('/')[0]
  return 'https://github.com/mozilla/global-platform-admin/blob/main' +
    `/google-workspace-management/tf/workgroups/${encodeURIComponent(name)}.yaml`
}

export const backstageUrl = (subgroupId: string): string => {
  const slug = subgroupId.replace(/^workgroup:/, '').replace('/', '-')
  return `https://backstage.mozilla.cloud/catalog/workgroups/Group/${encodeURIComponent(slug)}`
}

export const routes = [
  { path: '/', component: SearchDAWG, name: 'SearchPage' },
  { path: '/guide', component: FAWG, name: 'GuidePage' },
  { path: '/members/:type', component: MemberList, name: 'MemberList' },
  { path: '/github', component: GithubStats, name: 'GithubStats' },
  { path: '/user/:email', component: UserView, name: 'UserView' },
  { path: '/error', component: BadDAWG, name: 'ErrorPage' },
  { path: wgroute(':id'), component: SingleDAWG, name: 'ViewDAWG' },
  { path: '/hot', component: SadDAWG, name: 'SadDAWG' }
]

export const dawgLinker = (wg: string, sg?: string): string => {
  // const matches = WorkGroupIDRegex.exec(t)
  // if (!matches || matches?.length < 2) return wgroute('404')
  const wgpath = wgroute(encodeURIComponent(wg.replace('workgroup:', '')))

  return !sg ? wgpath : wgpath + `#${encodeURIComponent(sg)}`
}
