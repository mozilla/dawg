<script setup lang="ts">
import { ref, Ref, computed, Computed } from 'vue'
import { WorkGroup, fromDataSource } from '../workgroup.ts'
import DAWGTable from './DAWGTable.vue'

type CellContent = string | Map | Set;
type SearchFunc = (contents: CellContent) => boolean;

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

const searchstring = defineModel<string>('searchstring');

const isRegex = defineModel<boolean>('isRegex');
const searchregexp  = computed<RegExp | Error>((): RegExp => {
    let regexp: Regexp;

    try {
        regexp = RegExp(searchstring.value)
    } catch (error) {
        console.warn(`Error compiling regex ${searchstring.value} got ${error}`)
        return error
    }

    return regexp;
     
})


// Match plain strings
const regularFilter: SearchFunc = (contents: string ): boolean => {
    if (contents.toLowerCase == undefined) {
        console.log(contents)
        return false
    }
    return contents.toLowerCase().includes(searchstring.value.toLowerCase())
}

// match against regex
// regex is pre-compiled via computed value so ignore first param
const regexFilter: SearchFunc = (contents: string): boolean => {
    return (searchregexp.value instanceof Error == false) && searchregexp.value.test(contents)
}

// Returns the correct filter func based on the toggle state
const filterFunc: Computed<SearchFunc> = computed(() => {
    return isRegex.value ? regexFilter : regularFilter;
})

const filtered = computed(() => {
    if (!searchstring.value) {
        return normalized.value
    }
    return normalized.value.filter(row => {       
        return Object.values(row).some(contents => {
            if (contents instanceof Set) {
                console.log("found a set")
                return Array.from(contents).some((item) => filterFunc.value(item))
            }
            return filterFunc.value(contents)
        })
    })
})

const headers = ref((() => {
    // get a null-ish workgroup and dump the keys
    return Object.keys(fromDataSource("none", "placeholder", {}))
})())

</script>

<template>
    <div class="search-wrapper">
        <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative mb-2">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input :class="{ monospace: isRegex }" type="search" v-model="searchstring" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
        </div>
        <div class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300" role="alert" v-if="isRegex && searchregexp instanceof Error == true">
          <span class="font-medium" v-if="isRegex && searchregexp instanceof Error == true">⚠️ {{ searchregexp }}</span>
        </div>
    </div>
    <div class="relative mb-2">
      <label class="inline-flex items-center cursor-pointer">
        <input v-model="isRegex" type="checkbox" name="regex" value="regex" class="sr-only peer">
        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Use Regex</span>
      </label>
    </div>

    <DAWGTable :headers="headers" :rows="filtered"/>
</template>

<style scoped>


</style>
