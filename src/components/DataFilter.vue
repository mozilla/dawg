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
        <input :class="{ monospace: isRegex }" type="text" v-model="searchstring" placeholder="Search All Fields"/>

        <div class="regex-toggle">
            <input v-model="isRegex"
                type="checkbox"
                name="regex"
                value="regex"
            />
            <label for="regex"> .*</label>
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
}
.search-wrapper [type=text] {
    width: calc(100% - 60px);
    display: inline-block;
    height: 40px;
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
