<script setup lang="ts">

import IconLink from './IconLink.vue';
import { DisplayAs, WorkGroupFieldKinds } from '@/workgroups';
import type { WorkGroup } from '@/workgroups'

const props = defineProps<{
    contents: undefined | string | Set<any> | Array<any> | Map<any, any>,
    fieldName: keyof WorkGroup,
}>()

const display = WorkGroupFieldKinds.get(props.fieldName)

</script>

<template>
    <td class="px-2 py-1">
        <template v-if="!props.contents">
            (no data)
        </template>
        <template v-if="display === DisplayAs.DAWGLink">
            <RouterLink :to="`/dawg/${encodeURIComponent(props.contents as string)}`">
                {{ props.contents }}
            </RouterLink>
        </template>
        <template v-if="display === DisplayAs.PlainText">
            {{ props.contents }}
        </template>
        <template v-if="display === DisplayAs.ListOfLinks">
            <IconLink v-for="(link) in props.contents" :key="link.id" :href="link" />
        </template>
        <ul v-else-if="display === DisplayAs.ListOfText">
            <li v-for="(line, index) in props.contents" :key="index">
                {{ line }}
            </li>
        </ul>
    </td>
</template>
