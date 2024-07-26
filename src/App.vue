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
  <header class="text-center">
    <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Effortlessly search and explore data access workgroups - Compiled from aggregated Terraform State data.</p>
    <nav class="whd-links items-center">
      <a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/27924789/Data+Access+Workgroups">Data Access Workgroups Documentation</a>
      <a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/27919274/Using+workgroups">GCPv2 Documentation</a>
      <a href="https://wiki.mozilla.org/Security/Data_Classification">Data Classification at Mozilla</a>
      <a href="https://wiki.mozilla.org/Data_Collection#Data_Collection_Categories">Data Collection at Mozilla</a>
    </nav>
  </header>
  <main>
    <PolyAssetLoader :sources="['gcpv1_enriched.json','gcpv2_merged.json']" />
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
