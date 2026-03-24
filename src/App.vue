<script setup lang="ts">

import { ref, provide, shallowRef, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

import { sources } from './config';
import type { DAWGMap, DAWGSet } from '@/workgroups';

import DataLoader from '@/components/DataLoader.vue'
import HeaderNav from '@/components/HeaderNav.vue'
import { datamapinjection, datasetinjection } from '@/injections';

const router = useRouter();

const hasLoaded = ref(false)

const datamap = shallowRef(new Map() as DAWGMap)
const dataset = shallowRef([] as DAWGSet)

provide(datamapinjection, datamap)
provide(datasetinjection, dataset)

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
