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
  <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
  <div class="relative mb-4">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
      </svg>
    </div>
    <input type="search" v-model="searchstring" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
  </div>
  <DAWGTable :headers="headers" :rows="filtered"/>
</template>

