<script setup lang="ts">

import { ref, provide } from 'vue';

import type { WorkGroup } from './workgroups'
import { Sources } from './workgroups'


import PolyAssetLoader from './components/PolyAssetLoader.vue'
import Nav from './components/Nav.vue'

export type WorkGroupData = WorkGroup[]

const data = ref<WorkGroup[]>([])

// makes data reachable by nested child components
provide('data', data)

const recieveData = (d: WorkGroup[]) => {
  console.info("data loaded")
  data.value = d
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
    <PolyAssetLoader v-if="data.length == 0" :sources="sourceFiles" @done="recieveData" />
    <RouterView v-else />
  </main>
</template>

<style scoped>
header {
  margin: 80px auto 2rem;
}
</style>
