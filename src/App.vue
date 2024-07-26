<script setup lang="ts">
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import PolyAssetLoader from './components/PolyAssetLoader.vue'

// initialize components based on data attribute selectors
onMounted(() => {
    initFlowbite();
})
</script>

<template>
  <header>
    <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Effortlessly search and explore data access workgroups - Compiled from aggregated Terraform State data.</p>
    <!-- FIXME move to navbar or something -->

    <h1><a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/27924789/Data+Access+Workgroups">Data Access Workgroups Documentation</a></h1>
    <h1><a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/27919274/Using+workgroups">GCPv2 Documentation</a></h1>
    <h1><a href="https://wiki.mozilla.org/Security/Data_Classification">Data Classification at Mozilla</a></h1>
    <h1><a href="https://wiki.mozilla.org/Data_Collection#Data_Collection_Categories">Data Collection at Mozilla</a></h1>
  </header>
  <main>
    <PolyAssetLoader :sources="['gcpv1_enriched.json','gcpv2_merged.json']" />
  </main>
</template>

<style scoped>
header {
  margin: 80px auto 2rem;
}
</style>
