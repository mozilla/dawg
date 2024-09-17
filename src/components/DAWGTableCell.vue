<script setup lang="ts">

import { dawgLinker } from '@/routing';
import { DisplayMode, getFieldDisplayMode } from '@/workgroups';
import type { DAWG, ListOfText, MapOfLists, PlainText } from '@/workgroups'

import IconLink from './IconLink.vue';
import AutoLinker from './AutoLinker.vue';
import { computed } from 'vue';

const props = defineProps<{
    contents: undefined | PlainText | ListOfText | MapOfLists,
    fieldName: keyof DAWG,
}>()

const display = getFieldDisplayMode(props.fieldName)
</script>

<template>
    <td class="px-2 py-1">
        <template v-if="!props || !props.contents || props.contents == undefined">
            (no data)
        </template>
        <template v-if="display === DisplayMode.DAWGLink">
            <RouterLink :to="dawgLinker(props.contents as string)">
                {{ props.contents }}
            </RouterLink>
        </template>
        <template v-if="display === DisplayMode.PlainText">
            <AutoLinker :text="(props.contents as string)" />
        </template>
        <template v-if="display === DisplayMode.ListOfLinks">
            <IconLink v-for="(link, i) in (props.contents as ListOfText)" :key="i" :href="link" :auto-text="false" />
        </template>
        <ul v-else-if="display === DisplayMode.ListOfText && props.contents && (props.contents as string[]).length > 1">
            <li v-for="(line, index) in props.contents" :key="index">
                <AutoLinker :text="(line as PlainText)" />
            </li>
        </ul>
        <span
            v-else-if="display === DisplayMode.ListOfText && props.contents && (props.contents as string[]).length == 1">
            <AutoLinker :text="props.contents && (props.contents as ListOfText)[0]" />
        </span>
        <dl v-else-if="display === DisplayMode.MapOfLists">

            <ul v-if="(props.contents as MapOfLists).hasOwnProperty('default')">
                <li v-for="member in (props.contents as MapOfLists).default" :key="member">
                    {{ member }}
                </li>
            </ul>

            <template v-for="(list, key) in (props.contents as MapOfLists)" :key="key">
                <template v-if="key != 'default'">
                    <dt class="monospace">{{ key }}</dt>
                    <dd>
                        <ul v-if="list.length > 0">
                            <li v-for="item, i in list" :key="i">
                                <AutoLinker :text="item" />
                            </li>
                        </ul>
                        <span v-else>(no members)</span>
                    </dd>
                </template>

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
