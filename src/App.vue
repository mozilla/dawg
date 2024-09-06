<script setup lang="ts">

import { ref, provide } from 'vue';

import { sourceFiles } from './workgroups'
import type { DAWGMap, DAWGSet } from './workgroups';

import DataLoader from './components/DataLoader.vue'
import HeaderNav from './components/HeaderNav.vue'
import { datamapinjection, datasetinjection } from './data';

const filteredSourceFiles = (() => {
  // intentionally getting search param w/o vue router as it's initially empty and we don't want to wait on
  // vue lifecycle to start loading data
  return (/^protosaur/.test(window.location.host) || (new URLSearchParams(window.location.search).get('useProdData') == 'true'))
    ? sourceFiles.filter(src => src !== 'mockdata.json')
    : sourceFiles.filter(src => src == 'mockdata.json');
})()

const hasLoaded = ref(false)

const datamap = ref(new Map() as DAWGMap)
const dataset = ref([] as DAWGSet)

provide(datamapinjection, datamap)
provide(datasetinjection, dataset)

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
    <DataLoader v-if="!hasLoaded" :sources="filteredSourceFiles" @done="recieveData" />
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

.container {
  width: 100%;
  margin: 0px auto;
}
</style>
