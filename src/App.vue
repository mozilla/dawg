<script setup lang="ts">

import { ref, provide, computed } from 'vue';
import type { Ref, ComputedRef } from 'vue';

import type { WorkGroupSet, WorkGroupMap } from './workgroups'
import { Sources, workgroupSetFromMap } from './workgroups'


import DataLoader from './components/DataLoader.vue'
import Nav from './components/Nav.vue'



const datamap: Ref<WorkGroupMap> = ref(new Map())
// TODO clarify naming
const dataset: ComputedRef<WorkGroupSet> = computed(() => {
  return workgroupSetFromMap(datamap.value)
})

// makes data reachable by nested child components
provide('dataset', dataset)
provide('datamap', datamap)

const recieveData = (d: WorkGroupMap) => {
  console.info("data loaded")
  datamap.value = d
}

const sourceFiles = Array.from(Sources.keys())

</script>

<template>
  <Nav />
  <header class="text-center">
    <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Effortlessly search and explore data
      access workgroups - Compiled from aggregated Terraform State data.</p>
  </header>
  <main>
    <DataLoader v-if="dataset.length == 0" :sources="sourceFiles" @done="recieveData" />
    <RouterView v-else />
  </main>
</template>

<style scoped>
header {
  margin: 80px auto 2rem;
}

.monospace {
  font-family: monospace;
}
</style>
