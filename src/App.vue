<script setup lang="ts">
import PolyAssetLoader from './components/PolyAssetLoader.vue'

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
