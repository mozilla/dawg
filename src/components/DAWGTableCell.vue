<script setup lang="ts">

import { DisplayMode, WorkGroupDisplayModes } from '@/workgroups';
import type { MapOfLists, WorkGroup } from '@/workgroups'

import IconLink from './IconLink.vue';
import AutoLinker from './AutoLinker.vue';


const props = defineProps<{
    contents: undefined | string | string[] | MapOfLists,
    fieldName: keyof WorkGroup,
}>()

const display = WorkGroupDisplayModes.get(props.fieldName)

</script>

<template>
    <td class="px-2 py-1">
        <template v-if="!props.contents">
            (no data)
        </template>
        <template v-if="display === DisplayMode.DAWGLink">
            <RouterLink :to="`/${encodeURIComponent(props.contents as string)}`">
                {{ props.contents }}
            </RouterLink>
        </template>
        <template v-if="display === DisplayMode.PlainText">
            <AutoLinker :text="(props.contents as string)" />
        </template>
        <template v-if="display === DisplayMode.ListOfLinks">
            <IconLink v-for="(link, i) in (props.contents as string[])" :key="i" :href="link" :auto-text="false" />
        </template>
        <ul v-else-if="display === DisplayMode.ListOfText">
            <li v-for="(line, index) in props.contents" :key="index">
                <AutoLinker :text="(line as string)" />
            </li>
        </ul>
        <dl v-else-if="display === DisplayMode.MapOfLists">
            <template v-for="(list, key) in (props.contents as MapOfLists)" :key="key">
                <dt>{{ key }}</dt>
                <dd>
                    <ul v-if="list.length > 0">
                        <li v-for="item in list">
                            <AutoLinker :text="item" />
                        </li>
                    </ul>
                    <span v-else>(no members)</span>
                </dd>
            </template>
        </dl>
    </td>
</template>

<style>
td {
    vertical-align: top;
}

td ul {
    list-style-position: inside;
    list-style-type: disc;
}

td a {
    color: var(--dawg-blue);
    transition: color 0.15s;
}

td a:hover {
    text-decoration: underline;
    color: var(--dawg-orange)
}

td dt {
    margin-top: 1rem;
}

td dd>span {
    margin-left: 0.3rem;
}

td dt:first-child {
    margin-top: 0;
}

td dt:has(+ dd > ul),
td dd:has(> ul) {
    display: block;
}

td dt:has(+ dd > span),
td dd:has(> span) {
    display: inline-block;
}
</style>