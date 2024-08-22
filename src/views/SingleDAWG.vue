<script setup lang="ts">
import type { Ref, ComputedRef } from 'vue';
import { inject, computed } from 'vue';
import { useRoute } from 'vue-router';

import type { WorkGroup, WorkGroupMap, ListOfText, MapOfLists, PlainText, ListOfLinks } from '@/workgroups';
import IconLink from '@/components/IconLink.vue';
import { DisplayMode, WorkGroupDisplayModes, } from '@/workgroups';

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
        <h1>404 DAWG Not Found</h1>
        <h2>Could not find a Data Access Work Group with the id: <span class="monospaced">{{ id }}</span></h2>
    </template>
    <template v-else>
        <h1><span class="monospace">{{ workgroup.name }}</span></h1>
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
    padding: 0.5rem;
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
</style>
