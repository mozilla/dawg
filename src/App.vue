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
    <h1>Our super cool DAWG Dashboard, some imagination required</h1>
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
