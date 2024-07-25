<script setup lang="ts">
import { ref, computed, Computed } from 'vue'
import { WorkGroup, fromDataSource } from '../workgroup.ts'
import DAWGTable from './DAWGTable.vue'


const props = defineProps<{
    data: any, 
}>()

const normalized: Computed<WorkGroup[]> = computed(() => {
    const result = [];
    for (const sourcename in props.data) {
        for (const groupname in props.data[sourcename]) {
            result.push(fromDataSource(sourcename, groupname, props.data[sourcename][groupname]))
        }
    }

    return result
})

// unused temporarily
const searchstring = defineModel<string>()

// These will be generated from real data in the end
const headers = ref((() => {
    // get a null-ish workgroup and dump the keys
    return Object.keys(fromDataSource("none", "placeholder", {}))
})())

const filtered = computed(() => {
    if (!searchstring.value) {
        return normalized.value
    }
    return normalized.value.filter(row => {
       
        return Object.values(row).some(cell => {
            let contents: string = cell

            if (cell instanceof Set || cell instanceof Map ) {
                contents = Array.from(cell).join(" ")
            }

            return contents.toLowerCase().includes(searchstring.value.toLowerCase())
        })
    })
})
</script>

<template>
    <input type="text" v-model="searchstring" placeholder="Search All Fields"/>
    <DAWGTable :headers="headers" :rows="filtered"/>
</template>

<style>
input {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #444;
    border-radius: 4px;
    background-color: #333;
    color: #f1f1f1;
    font-family: Arial, sans-serif;
}

input::placeholder {
    color: #e7efe8;
    opacity: 0.9;
}
</style>
