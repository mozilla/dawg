<script setup lang="ts">
import { reactive, computed, ref } from 'vue'

const props = defineProps<{
    sources: string[], 
}>()

const data = ref({});

const loaded = computed(() => {
    // When we have an entry in data for each source, we are loaded
    return Object.keys(data.value).length == props.sources.length
})

Promise.all(props.sources.map(src => {
    return fetch(src).then(async (res) => { data.value[src] = await res.json()})
}))
</script>

<template>
    <h1>DAWG</h1>
    <h1 v-if="loaded == false">Loading ...</h1>
    <div v-else>
       <slot />
    </div>
</template>