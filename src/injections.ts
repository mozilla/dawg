import type { InjectionKey, ShallowRef } from 'vue'
import type { DAWGMap, DAWGSet } from './workgroups'
import type { MemberMetadata } from './ndjson'

export type GithubLookup = Map<string, Pick<MemberMetadata, 'github_login' | 'github_orgs'>>

// See: https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
export const datamapinjection = Symbol() as InjectionKey<ShallowRef<DAWGMap>>
export const datasetinjection = Symbol() as InjectionKey<ShallowRef<DAWGSet>>
export const githublookupinjection = Symbol() as InjectionKey<ShallowRef<GithubLookup>>
