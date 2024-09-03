<script setup lang="ts">

import { ref, provide, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

import type { WorkGroupSet, WorkGroupMap } from './workgroups'
import { Sources, workgroupSetFromMap } from './workgroups'


import DataLoader from './components/DataLoader.vue'
import HeaderNav from './components/HeaderNav.vue'

const datamap: Ref<WorkGroupMap> = ref(new Map())
// TODO clarify naming
const dataset: ComputedRef<WorkGroupSet> = computed(() => {
  return workgroupSetFromMap(datamap.value)
})

// makes data reachable by nested child components
provide('dataset', dataset)
provide('datamap', datamap)

const recieveData = (d: WorkGroupMap) => {
  datamap.value = d
}

const sourceFiles = computed(() => {
  // intentionally getting search param w/o vue router as it's initially empty and we don't want to wait on
  // vue lifecycle to start loading data
  return (/^protosaur/.test(window.location.host) || (new URLSearchParams(window.location.search).get('useProdData') == 'true'))
    ? Array.from(Sources.keys())
    : ['mockdata.json'];
})
</script>

<template>
  <HeaderNav />
  <main>
    <DataLoader v-if="dataset.length == 0" :sources="sourceFiles" @done="recieveData" />
    <RouterView v-else />
  </main>
</template>

<style>
body {
  --dawg-blue: #3F83F8;
  --dawg-orange: #FF8A4C;
}

header {
  margin: 80px auto 2rem;
}

.monospace {
  font-family: monospace;
}
</style>
