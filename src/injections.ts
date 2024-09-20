import type { InjectionKey, Ref } from 'vue'
import type { DAWGMap, DAWGSet } from './workgroups'

// See: https://vuejs.org/guide/typescript/composition-api.html#typing-provide-inject
export const datamapinjection = Symbol() as InjectionKey<Ref<DAWGMap>>
export const datasetinjection = Symbol() as InjectionKey<Ref<DAWGSet>>
