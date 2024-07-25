<script setup lang="ts">
import { ref, Ref, computed, Computed } from 'vue'
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

// The state of the "Use Regex" toggle
const isRegex = defineModel<boolean>('isRegex');

// The user input string 
const searchstring = defineModel<string>('searchstring');

// A compiled RegExp from the user input string, or the error if one was encountered
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

// Returns the correct filter func based on the toggle state
const filterFunc: Computed<SearchFunc> = computed(() => {
    return isRegex.value
        ? (searchregexp.value instanceof Error == false) && searchregexp.value.test(contents)
        : contents.toLowerCase().includes(searchstring.value.toLowerCase())
})

// Returns the data set filtered by the seach term or regex
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

// Takes a null-ish workgroup and dumps the keys for the table headers
const headers = ref(((struct) => Object.keys(struct))(fromDataSource("none", "placeholder", {})))

</script>

<template>
    <div class="search-wrapper">
        <label for="search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative mb-4">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input :class="{ monospace: isRegex }" type="search" v-model="searchstring" id="search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search" required />
            <div class="regex-toggle absolute inset-y-0 start-100 flex items-center ps-3">
                <input v-model="isRegex"
                    type="checkbox"
                    name="regex"
                    value="regex"
                />
                <label for="regex"> .*</label>
            </div>
        </div>
        
        <span class="regex-err" v-if="isRegex && searchregexp instanceof Error == true">⚠️ {{ searchregexp }}</span>
    </div>
    <DAWGTable :headers="headers" :rows="filtered"/>
</template>

<style scoped>
input[type=text] {
    padding: 10px;
    margin-bottom: 0px;
    border: 1px solid #444;
    border-radius:  var(--border-radius) 0 0 var(--border-radius);
    background-color: #333;
    color: #f1f1f1;
    font-family: Arial, sans-serif;

}
input[type=text].monospace {
    font-family: monospace;
}

input[type=text]::placeholder {
    color: #e7efe8;
    opacity: 0.9;
}

.search-wrapper {
    --border-radius: 4px;
    width: 600px;
    vertical-align: top;
    padding: 0;
    margin-bottom: 0px;
    width: 100%;
}
.search-wrapper #search {
    width: calc(100% - 60px);
    display: inline-block;
    height: 40px;
    margin: 10px 0;
}
.regex-toggle {
    display: inline-block;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    width: 60px;
    height: 40px;
    background-color: #a5a5a5;
    float: right;
    text-align: center;
    padding: 5px 0 0 0 ;
}
.regex-toggle label {
    font-family: monospace;
}
.regex-err {
    display: block;
    width: 100%;
    background-color: #ffe674;
    color: #8e8a17;
    text-align: center;
    padding: 12px;

}
</style>
