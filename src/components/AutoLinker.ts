import { SubGroupIDRegex, WorkGroupIDRegex } from '@/workgroups'
import { dawgLinker, wgroute } from '@/routing'

export type LinkInfo = { type: LinkType; matches: string[] }

export type LinkFormatter = (input: string[]) => string

export enum LinkType {
  GoogleGroup = 'GGroup',
  ServiceAccount = 'ServiceAcct',
  PhoneBook = 'PhoneBook',
  WorkGroup = 'WorkG',
  SubGroup = 'SubG',
  None = 'None'
}
const noop: LinkFormatter = (i) => i[1]

const tests = new Map<LinkType, RegExp>([
  [LinkType.GoogleGroup, /^group:([a-z0-9-]+)@((?:mozilla.com)|(?:firefox.gcp.mozilla.com))/],
  [LinkType.ServiceAccount, /^serviceAccount:(?:[a-z0-9-]+)@([a-z0-9-]+).iam.gserviceaccount.com/],
  [
    LinkType.PhoneBook,
    /([a-zA-Z0-9.]+@(?:(?:mozilla.com)|(?:thunderbird.net)|(?:mozillafoundation.org)))/
  ],
  [LinkType.SubGroup, SubGroupIDRegex], // like workgroup, but has a slash
  [LinkType.WorkGroup, WorkGroupIDRegex]
])

export const testLinkText = (text: string): LinkInfo => {
  let result: LinkInfo = { type: LinkType.None, matches: [] }

  if (text)
    for (let [lt, test] of tests) {
      const results = test.exec(text)
      if (results && results.length > 1) {
        result.type = lt
        result.matches = results
        for (let i = 1; i < result.matches.length; i++) {
          result.matches[i] = encodeURIComponent(result.matches[i])
        }
        break
      }
    }

  return result
}

const formatters = new Map<LinkType, LinkFormatter>([
  [LinkType.GoogleGroup, (i) => `https://groups.google.com/a/${i[2]}/g/${i[1]}`],
  [
    LinkType.ServiceAccount,
    (i) =>
      `https://console.cloud.google.com/iam-admin/serviceaccounts?organizationId=442341870013&project=${i[1]}`
  ],
  [LinkType.PhoneBook, (i) => `https://people.mozilla.org/s?who=staff&query=${i[1]}`],
  [LinkType.WorkGroup, (i) => dawgLinker(i[1])],
  [LinkType.SubGroup, (i) => dawgLinker(i[1], i[2])]
])

export const formatHref = (li: LinkInfo): string => {
  let fmt = noop

  if (li.matches.length > 0 && formatters.has(li.type))
    fmt = formatters.get(li.type) as LinkFormatter

  return fmt(li.matches)
}
