<script setup lang="ts">
import type { Ref } from 'vue';
import { inject, ref } from 'vue';
import { useRoute } from 'vue-router';

import type { WorkGroup, WorkGroupMap } from '@/workgroups';
import IconLink from '@/components/IconLink.vue';
import { DisplayAs, WorkGroupFieldKinds } from '@/workgroups';



const route = useRoute();

const datamap: Ref<WorkGroupMap> | undefined = inject('datamap')
const foundWorkgroup = ref(false)

let workgroup: WorkGroup

const id = decodeURIComponent(route.params.dawgid as string)

if (datamap && datamap.value.get(id)) {
    foundWorkgroup.value = true
    workgroup = datamap.value.get(id) as WorkGroup
}

const details = Array<keyof WorkGroup>('type', 'sponsor', 'managers', 'members')

</script>

<template>
    <template v-if="!foundWorkgroup">
        <h1>404 DAWG Not Found</h1>
        <h2>Could not find a Data Access Work Group with the id: <span class="monospaced">{{ id }}</span></h2>
    </template>
    <template v-else>
        <h1>{{ workgroup.name }}</h1>
        <nav>
            <IconLink v-for="link, key in workgroup.links" v-bind:key :href="link" :autoText="true" />
        </nav>
        <table>
            <tr v-for="(field, i) in details" :key="i">
                <td> {{ field }}</td>
                <td v-if="WorkGroupFieldKinds.get(field) == DisplayAs.PlainText"> {{ workgroup[field] }}</td>
                <td v-if="WorkGroupFieldKinds.get(field) == DisplayAs.ListOfText">
                    <ul v-for="item, i in workgroup[field]" :key="i">
                        <li>{{ item }}</li>
                    </ul>
                </td>
                <td v-if="WorkGroupFieldKinds.get(field) == DisplayAs.MapOfLists">
                    <dl v-for="list, key in workgroup[field]" :key="key">
                        <dt v-if="list.length > 0">{{ key }}</dt>
                        <dd v-if="list.length > 0">
                            <ul v-for="item, i in list" :key="i">
                                <li>{{ item }}</li>
                            </ul>
                        </dd>
                    </dl>
                </td>
            </tr>
        </table>
    </template>
</template>

<style>
h1 {
    font-size: 3rem;
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

td:first-child {
    text-transform: capitalize;
}

ul {
    list-style: disc;
    list-style-position: inside;
}
</style>
