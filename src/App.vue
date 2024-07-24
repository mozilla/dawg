<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import PolyAssetLoader from './components/PolyAssetLoader.vue'

import DAWGTable from './components/DAWGTable.vue'
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
