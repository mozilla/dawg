<script setup lang="ts">
import type { Ref } from 'vue';
import { inject, computed, onMounted, onBeforeMount, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useClipboard } from '@vueuse/core';

import { type DAWG, type DAWGHouse, type ListOfLinks, formatDAWGID } from '@/workgroups';
import { shortVersions, versionShortToLong, } from '@/metadata'

import IconLink from '@/components/IconLink.vue';
import DAWGTableCell from '@/components/DAWGTableCell.vue';
import { datamapinjection } from '@/injections';
import { ErrorCode, serializeErrorDetails } from '@/errors';


const router = useRouter();
const route = useRoute();
const source = computed(() => window.location.href)
const { copy, copied } = useClipboard({ source })




const details = Array<keyof DAWG>('sponsor', 'managers', 'members')
const datamap = inject(datamapinjection)

const dawghouse: Ref<DAWGHouse | undefined> = ref()
const id = ref(formatDAWGID(route.params.id as string))


onBeforeMount(() => {

    if (!datamap) return router.push({ path: '/error', query: { err: ErrorCode.Application, detail: serializeErrorDetails(`datamap was not loaded got ${datamap}`) } })

    if (!datamap.value.has(id.value)) {
        console.warn('did not find workgroup so sending to 404')
        router.push({ path: '/error', query: { err: ErrorCode.NotFound404, dawgid: encodeURIComponent(id.value) } })
    }
    dawghouse.value = datamap.value.get(id.value)
})

onMounted(() => {
    if (!window.location.hash) return

    const position = document.querySelector(window.location.hash)?.getBoundingClientRect().top
    if (!position) return

    window.scrollTo(0, position - 90)
})


</script>

<template>
    <div class="container">
        <h1 class="monospace">
            {{ id }}
            <span @click="copy(source)" v-bind:title="!copied ? 'copy to clipboard' : 'copied'">
                🔗
            </span>
        </h1>
        <template v-for="ver in shortVersions">
            <div v-if="dawghouse?.has(ver)" :key="ver">

                <h2>{{ versionShortToLong.get(ver) }} ({{ ver }})</h2>

                <nav>
                    <IconLink v-for="link, key in (dawghouse.get(ver)?.links as ListOfLinks)" v-bind:key :href="link"
                        :autoText="true" />
                </nav>
                <table>
                    <tr v-for="(field, i) in details" :key="i">
                        <td>{{ field }}</td>
                        <DAWGTableCell :fieldName="field" :contents="(dawghouse?.get(ver) || {})[field]" />
                    </tr>
                </table>
            </div>
        </template>
    </div>


</template>

<style scoped>
.container {
    text-align: left;
}

h1 {
    font-size: 2.5rem;
    margin: 2rem 0;
}

h2 {
    font-size: 1.2rem;
    margin: 3rem 0 0 0;
}

nav {
    text-align: left;
    margin-top: 1rem;
}

nav a {
    display: block;
}

h1,
nav {
    margin-bottom: 1rem;
}

td {
    padding: 0 1rem 1rem 0;
    display: block;
    text-align: left;
}

td a {
    margin-top: 0;
}

dd {
    margin-bottom: 1rem;
}

td:first-child {
    text-transform: capitalize;
    font-weight: bold;
}

ul {
    list-style: disc;
    list-style-position: inside;
}

@media (min-width: 640px) {
    td {
        display: table-cell;
        vertical-align: top;
    }

    nav a {
        display: inline-block;
        margin: auto 1rem;
    }
}
</style>
