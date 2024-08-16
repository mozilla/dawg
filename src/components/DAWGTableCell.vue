<script setup lang="ts">

import { computed } from 'vue'
import IconLink from './IconLink.vue';

// thank to https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
const urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator

const props = defineProps<{
    contents: undefined | string | Set<any> | Array<any> | Map<any, any>,
}>()

enum Kinds {
    DAWGLink,
    ListOfLinks,
    ListOfText,
    Text,
    NoData,
}

// computing this ahead of time to keep template 
const kind = computed<Kinds>((): Kinds => {
    switch (true) {
        case (props.contents instanceof Array && urlPattern.test(props?.contents[0] || "") == true):
            return Kinds.ListOfLinks
        case (props.contents instanceof Set):
        case (props.contents instanceof Array):
        case (props.contents instanceof Map):
            return Kinds.ListOfText
        case (props.contents == null):
        case (props.contents === undefined):
            return Kinds.NoData
        default:
            return Kinds.Text
    }
})
</script>

<template>
    <template v-if="kind === Kinds.Text">
        {{ props.contents }}
    </template>
    <template v-if="kind === Kinds.ListOfLinks">
        <IconLink v-for="(link) in props.contents" :key="link.id" :href="link" />
    </template>
    <template v-else-if="kind === Kinds.NoData">
        (no data)
    </template>
    <ul v-else-if="kind === Kinds.ListOfText">
        <li v-for="(line, index) in props.contents" :key="index">
            {{ line }}
        </li>
    </ul>
</template>
