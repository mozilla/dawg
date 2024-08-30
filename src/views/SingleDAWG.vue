<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue';
import { inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClipboard } from '@vueuse/core';

import type { WorkGroup, WorkGroupMap, ListOfText, MapOfLists, PlainText, ListOfLinks } from '@/workgroups';
import { DisplayMode, WorkGroupDisplayModes, NullWorkGroup } from '@/workgroups';

import IconLink from '@/components/IconLink.vue';
import AutoLinker from '@/components/AutoLinker.vue';
import DAWGTableCell from '@/components/DAWGTableCell.vue';

const route = useRoute();
const source = computed(() => window.location.href)
const { copy, copied } = useClipboard({ source })

const id = `workgroup:${decodeURIComponent(route.params.dawgid as string)}`


const details = Array<keyof WorkGroup>('type', 'sponsor', 'managers', 'members')
const datamap: Ref<WorkGroupMap> | undefined = inject('datamap')

const workgroup: ComputedRef<WorkGroup> = computed(() => {
    if (datamap?.value.get(id)) {
        return datamap.value.get(id) as WorkGroup
    }
    return NullWorkGroup
})

</script>

<template>
    <template v-if="workgroup === NullWorkGroup">
        <div class="message-404">
            <h1
                class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                404
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-400">
                    Workgroup
                </span>
                Not Found
            </h1>
            <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
                Could not find <span class="monospace text-blue-600 dark:text-blue-500">{{ id }}</span> data access
                workgroup
            </p>
            <RouterLink to="/">
                <button type="button"
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Return to search
                </button>
            </RouterLink>
        </div>
    </template>
    <template v-else>
        <h1 @click="copy(source)" v-bind:title="!copied ? 'copy to clipboard' : 'copied'">
            <span class="monospace">
                {{ workgroup?.id }}
            </span>
        </h1>
        <nav>
            <IconLink v-for="link, key in (workgroup?.links as ListOfLinks)" v-bind:key :href="link" :autoText="true" />
        </nav>
        <table>
            <tr v-for="(field, i) in details" :key="i">
                <td>{{ field }}</td>
                <DAWGTableCell :fieldName="field" :contents="workgroup[field]" />
            </tr>
        </table>
    </template>
</template>

<style scoped>
h1 {
    font-size: 2.5rem;
    text-align: center;
    margin: 2rem 0;
    cursor: pointer;
}

nav {
    text-align: center;
}

nav a {
    display: block;
}

h1,
nav {
    margin-bottom: 1rem;
}

td {
    padding: 1rem;
    vertical-align: top;
    display: block;
}

dd {
    margin-bottom: 1rem;
}

table {
    margin: 0px auto;
}

td:first-child {
    text-transform: capitalize;
    font-weight: bold;
}

ul {
    list-style: disc;
    list-style-position: inside;
}



.message-404 {
    text-align: center;
    margin: 0px auto;
    display: block;
}

.message-404 h1 {
    cursor: default;
    margin-top: 2rem;
}

.message-404 .monospaced {
    font-weight: bold;
}

.message-404 a {
    margin: 1rem auto 0;
    display: inline-block;
}

.message-404 a:hover {
    text-decoration: underline;
}


@media (min-width: 640px) {
    td {
        display: table-cell;
    }

    nav a {
        display: inline-block;
        margin: auto 1rem;
    }
}
</style>