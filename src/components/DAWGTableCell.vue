<script setup lang="ts">

import { DisplayMode, WorkGroupDisplayModes } from '@/workgroups';
import type { WorkGroup } from '@/workgroups'

import IconLink from './IconLink.vue';


const props = defineProps<{
    contents: undefined | string | Set<any> | Array<any> | Map<any, any>,
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
            {{ props.contents }}
        </template>
        <template v-if="display === DisplayMode.ListOfLinks">
            <IconLink v-for="(link) in props.contents" :key="link.id" :href="link" :auto-text="false" />
        </template>
        <ul v-else-if="display === DisplayMode.ListOfText">
            <li v-for="(line, index) in props.contents" :key="index">
                {{ line }}
            </li>
        </ul>
    </td>
</template>