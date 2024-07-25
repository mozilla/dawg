<script setup lang="ts">
import { computed, ref } from 'vue'
import DataFilter from './DataFilter.vue'

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
    <h1 v-if="loaded == false">Loading ...</h1>
    <div v-else>
       <DataFilter :data="data" />
    </div>
</template>