<script setup lang="ts">

import { ref, provide, computed, onMounted } from 'vue';
import type { Ref, ComputedRef } from 'vue';

import { initFlowbite } from 'flowbite'

import type { WorkGroupSet, WorkGroupMap } from './workgroups'
import { Sources, workgroupSetFromMap } from './workgroups'


import DataLoader from './components/DataLoader.vue'
import HeaderNav from './components/HeaderNav.vue'

// initialize components based on data attribute selectors
onMounted(() => {
  initFlowbite();
})

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
  <HeaderNav />
  <main>
    <DataLoader v-if="dataset.length == 0" :sources="sourceFiles" @done="recieveData" />
    <RouterView v-else />
  </main>
</template>

<style>
header {
  margin: 80px auto 2rem;
}

.monospace {
  font-family: monospace;
}
</style>
