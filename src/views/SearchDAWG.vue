<script setup lang="ts">

import { ref, computed, inject } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { WorkGroupSet, WorkGroup } from '../workgroups'
import { newWorkGroup } from '../workgroups'
import DAWGTable from '../components/DAWGTable.vue'

// Defines the subset of fields that are shown from the WorkGroup object
// the 'as const' statement lets TS inspect the array values as types to avoid redundant definitions
const showFields = [
    "name",
    "links",
    "managers",
    "sponsor",
    "subgroups",
    "members_list",
] as const

// Using Pick from WorkGroup prevents us from trying to showfields that dont exist. e.g. adding `foobar` to showFields will error here
export type SimpleWorkGroup = Pick<WorkGroup, typeof showFields[number]>

const simplifyWorkGroup = (wg: WorkGroup): SimpleWorkGroup => {

    let simple: any = {}
    showFields.forEach(key => {
        simple[key] = wg[key]
    })
    return simple as SimpleWorkGroup
}

const dataset = computed(() => {
    const ds = inject('dataset') as ComputedRef<WorkGroupSet>
    return !ds ? [] : ds.value.map(wg => simplifyWorkGroup(wg))
})

// The state of the "Use Regex" toggle
const isRegex = defineModel<boolean>('isRegex');

// The user input string 
const searchstring = defineModel<string>('searchstring');

// A compiled RegExp from the user input string, or the error if one was encountered
const searchregexp = computed((): RegExp | Error => {
    let regexp: RegExp;

    if (!searchstring.value) {
        return RegExp("")
    }

    try {
        regexp = RegExp(searchstring.value)
    } catch (err) {
        console.warn(`Error compiling regex ${searchstring.value} got ${err}`)
        return err as Error
    }

    return regexp;
})

// Returns the correct filter func based on the toggle state
const filterFunc = computed(() => {
    return isRegex.value
        ? (c: string): boolean => searchregexp.value instanceof Error == false && searchregexp.value.test(c)
        : (c: string): boolean => !!searchstring.value && c.toLowerCase().includes(searchstring.value.toLowerCase());
})

// Returns the data set filtered by the seach term or regex
const filteredSet: ComputedRef<SimpleWorkGroup[]> = computed(() => {
    if (!dataset?.value) {
        return []
    }
    if (!searchstring.value) {
        return Array.from(dataset.value)
    }
    return Array.from(dataset.value).filter(row => {
        return Object.values(row).some(contents => {
            if (contents instanceof Array) {
                return contents.some((item) => filterFunc.value(item))
            }
            return filterFunc.value(contents)
        })
    })
})

// Takes a null-ish workgroup and dumps the keys for the table headers
const headers = Object.keys(simplifyWorkGroup(newWorkGroup("none", "placeholder", {})))

</script>

<template>
    <div class="search-wrapper">
        <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative mb-2">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
            </div>
            <input :class="{ monospace: isRegex }" type="search" v-model="searchstring" id="search"
                class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search" required />
        </div>
        <div class="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300"
            role="alert" v-if="isRegex && searchregexp instanceof Error == true">
            <span class="font-medium">⚠️ {{ searchregexp }}</span>
        </div>
    </div>
    <div class="relative mb-2">
        <label class="inline-flex items-center cursor-pointer">
            <input v-model="isRegex" type="checkbox" name="regex" value="regex" class="sr-only peer">
            <div
                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600">
            </div>
            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Use Regex</span>
        </label>
    </div>

    <DAWGTable :headers="headers" :rows="filteredSet" />
</template>
