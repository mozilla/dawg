<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue';
import { ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClipboard } from '@vueuse/core';

import type { WorkGroup, WorkGroupMap, ListOfText, MapOfLists, PlainText, ListOfLinks } from '@/workgroups';
import IconLink from '@/components/IconLink.vue';
import { DisplayMode, WorkGroupDisplayModes, } from '@/workgroups';

const source = computed(() => window.location.href)
const { copy, copied } = useClipboard({ source })

const details = Array<keyof WorkGroup>('type', 'sponsor', 'managers', 'members')
const noData = "(nodata)"

const route = useRoute();

const id = decodeURIComponent(route.params.dawgid as string)

const datamap: Ref<WorkGroupMap> | undefined = inject('datamap')

const workgroup: ComputedRef<WorkGroup> = computed(() => {

    if (datamap && datamap.value.get(id)) {
        return datamap.value.get(id) as WorkGroup
    }
    return {} as WorkGroup
})

const foundWorkgroup: ComputedRef<boolean> = computed(() => {
    return Object.prototype.hasOwnProperty.call(workgroup.value, 'name')
})
</script>

<template>
    <template v-if="!foundWorkgroup">
        <div class="message-404">
            <h1>404 DAWG Not Found</h1>
            <h2>Could not find a Data Access Work Group with the id: <span class="monospaced">{{ id }}</span></h2>
            <RouterLink to="/">Return To Search Table ↩️</RouterLink>
        </div>
    </template>
    <template v-else>
        <h1 @click="copy(source)" v-bind:title="!copied ? 'copy to clipboard' : 'copied'"><span class="monospace">{{
            workgroup.name }}</span></h1>
        <nav>
            <IconLink v-for="link, key in workgroup.links as ListOfLinks" v-bind:key :href="link" :autoText="true" />
        </nav>
        <table>
            <tr v-for="(field, i) in details" :key="i">
                <td> {{ field }}</td>
                <td v-if="WorkGroupDisplayModes.get(field) == DisplayMode.PlainText">
                    {{ (workgroup[field] as PlainText).length > 0 ? workgroup[field] : noData }}
                </td>
                <td v-if="WorkGroupDisplayModes.get(field) == DisplayMode.ListOfText">
                    <ul v-for="item, i in workgroup[field] as ListOfText" :key="i">
                        <li>{{ item.length > 0 ? item : noData }}</li>
                    </ul>
                </td>
                <td v-if="WorkGroupDisplayModes.get(field) == DisplayMode.MapOfLists">
                    <dl v-for="list, k in workgroup[field] as MapOfLists " :key="k">
                        <dt v-if="list.length > 0">{{ k }}</dt>
                        <dd v-if="list.length > 0">
                            <ul v-for="item, i in list" :key="i">
                                <li>{{ item.length > 0 ? item : noData }}</li>
                            </ul>
                        </dd>
                    </dl>
                </td>
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
    display: inline-block;
}

h1,
nav {
    margin-bottom: 1rem;
}

td {
    padding: 1rem;
    vertical-align: top;
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
    text-align: right;
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
</style>