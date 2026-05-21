<script setup lang="ts">

import { ref, provide, shallowRef, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { sources } from './config';
import type { DAWGMap, DAWGSet } from '@/workgroups';

import DataLoader from '@/components/DataLoader.vue'
import HeaderNav from '@/components/HeaderNav.vue'
import { datamapinjection, datasetinjection, githublookupinjection, loginaliasesinjection, type GithubLookup, type LoginAliases } from '@/injections';

const router = useRouter();

const hasLoaded = ref(false)

const datamap = shallowRef(new Map() as DAWGMap)
const dataset = shallowRef([] as DAWGSet)
const githubLookup = shallowRef(new Map() as GithubLookup)
const loginAliases = shallowRef(new Map() as LoginAliases)

provide(datamapinjection, datamap)
provide(datasetinjection, dataset)
provide(githublookupinjection, githubLookup)
provide(loginaliasesinjection, loginAliases)

const onSlash = (e: KeyboardEvent) => {
  if (e.key !== '/') return
  const tag = (e.target as HTMLElement)?.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  e.preventDefault()
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
  setTimeout(() => {
    const input = document.getElementById('search') as HTMLInputElement | null
    input?.focus()
  }, 50)
}

onMounted(() => document.addEventListener('keydown', onSlash))
onUnmounted(() => document.removeEventListener('keydown', onSlash))

const recieveData = (recievedMap: DAWGMap, recievedSet: DAWGSet) => {
  console.log('recieved data')
  datamap.value = recievedMap
  dataset.value = recievedSet
  // Build a global email -> {github_login, github_orgs} lookup so any
  // email-rendering site (sponsor, manager, member, nested expansion) can
  // surface the same github identity without needing subgroup context. Also
  // build the reverse github_login -> [emails] map so UserView can find all
  // aliases for the same human.
  const lookup: GithubLookup = new Map()
  const aliasBuilder = new Map<string, Set<string>>()
  for (const dawg of recievedSet) {
    for (const sub of Object.values(dawg.member_metadata)) {
      for (const [email, meta] of Object.entries(sub)) {
        if (!meta.github_login && !(meta.github_orgs?.length)) continue
        if (!lookup.has(email)) {
          lookup.set(email, { github_login: meta.github_login, github_orgs: meta.github_orgs })
        }
        if (meta.github_login) {
          let set = aliasBuilder.get(meta.github_login)
          if (!set) {
            set = new Set()
            aliasBuilder.set(meta.github_login, set)
          }
          set.add(email)
        }
      }
    }
  }
  githubLookup.value = lookup
  loginAliases.value = new Map(
    [...aliasBuilder.entries()].map(([login, emails]) => [login, [...emails].sort()]),
  )
  hasLoaded.value = true
}

</script>

<template>
  <HeaderNav />
  <main>
    <DataLoader v-if="!hasLoaded" :sources="sources" @done="recieveData" />
    <RouterView v-else />
  </main>
</template>

<style>
header {
  margin: 1rem auto 2rem;
}

.monospace {
  font-family: monospace;
}

.container {
  width: 100%;
  margin: 0px auto;
}
</style>
