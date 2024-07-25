<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WorkGroup } from '../workgroup'
import { fromDataSource } from '../workgroup'
import DataFilter from './DataFilter.vue'

const props = defineProps<{
    sources: string[], 
}>()

const data = ref<Record<string, Record<string, WorkGroup>>>({});

const loaded = computed(() => {
    // When we have an entry in data for each source, we are loaded
    return Object.keys(data.value).length == props.sources.length
})

const normalized = computed((): WorkGroup[] => {
    const result = [];
    for (const sourcename in data.value) {
        for (const groupname in data.value[sourcename]) {
            result.push(fromDataSource(sourcename, groupname, data.value[sourcename][groupname]))
        }
    }

    return result
})

Promise.all(props.sources.map(src => {
    return fetch(src).then(async (res) => { data.value[src] = await res.json()})
}))
</script>

<template>
    <h1 v-if="loaded == false">Loading ...</h1>
    <div v-else>
       <DataFilter :data="normalized" />
    </div>
</template>