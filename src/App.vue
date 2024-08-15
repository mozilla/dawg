<script setup lang="ts">

import { computed, ref } from 'vue';

import type { WorkGroup } from './workgroups'
import { Sources } from './workgroups'


import PolyAssetLoader from './components/PolyAssetLoader.vue'
import Nav from './components/Nav.vue'

export type WorkGroupData = Record<string, Record<string, WorkGroup>>

const model = defineModel<WorkGroupData>({
  default: []
})

const loaded = computed(() => {
  // When we have an entry in data for each source, we are loaded
  return Object.keys(model.value).length == Object.keys(Sources).length
})
</script>

<template>
  <Nav />
  <header class="text-center">
    <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Effortlessly search and explore data
      access workgroups - Compiled from aggregated Terraform State data.</p>
  </header>
  <main>
    <PolyAssetLoader :sources="['gcpv1_enriched.json', 'gcpv2_merged.json']" :data="model" />
    <!-- <RouterView v-else /> -->
  </main>
</template>

<style scoped>
header {
  margin: 80px auto 2rem;
}

.whd-links {
  margin: 2rem 0;
}

.whd-links a {
  display: inline-block;
  margin: 0 2rem;
}

.whd-links a:hover {
  text-decoration: underline;
}
</style>
