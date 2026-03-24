<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRoute } from 'vue-router';

import AutoLinker from '@/components/AutoLinker.vue';
import { datasetinjection } from '@/injections';

const route = useRoute()
const dataset = inject(datasetinjection)

const typeParam = computed(() => route.params.type as string)

const typeLabels: Record<string, string> = {
    users: 'Users',
    'service-accounts': 'Service Accounts',
    groups: 'Groups',
    'workgroup-refs': 'Workgroup Refs'
}

const typePrefix: Record<string, (m: string) => boolean> = {
    users: (m) => m.startsWith('user:'),
    'service-accounts': (m) => m.startsWith('serviceAccount:') || m.includes('.iam.gserviceaccount.com'),
    groups: (m) => m.startsWith('group:'),
    'workgroup-refs': (m) => m.startsWith('workgroup:')
}

const label = computed(() => typeLabels[typeParam.value] || typeParam.value)
const matcher = computed(() => typePrefix[typeParam.value] || (() => false))

const entries = computed(() => {
    if (!dataset?.value) return []
    const set = new Set<string>()
    for (const wg of dataset.value) {
        for (const members of Object.values(wg.members)) {
            for (const m of members) {
                if (matcher.value(m)) set.add(m)
            }
        }
    }
    return [...set].sort()
})
</script>

<template>
    <div class="container">
        <h1>{{ label }}</h1>
        <p class="count">{{ entries.length }} total</p>
        <ul>
            <li v-for="entry in entries" :key="entry">
                <AutoLinker :text="entry" :expandable="false" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
.container {
    text-align: left;
    max-width: 64rem;
    margin: 0 auto;
}

h1 {
    font-size: 2rem;
    margin: 2rem 0 0.5rem;
}

.count {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
}

:global(.dark) .count {
    color: #9ca3af;
}

ul {
    list-style: disc;
    list-style-position: inside;
    columns: 2;
    column-gap: 2rem;
}

@media (max-width: 640px) {
    ul {
        columns: 1;
    }
}

li {
    break-inside: avoid;
    padding: 0.15rem 0;
}
</style>
