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
  </header>
  <main>
    <PolyAssetLoader :sources="['mock.json']" />
  </main>
</template>

<style scoped>
header {
  margin: 3rem auto;
}
</style>
