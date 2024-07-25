<script setup lang="ts">

import { computed, ref } from 'vue'

const props = defineProps<{
    contents: String | Set | Array | Map, 
}>()

// computing this ahead of time to keep template 
const type = computed(() => {
    switch (true) {
        case (props.contents instanceof Set):
        case (props.contents instanceof Array):
        case (props.contents instanceof Map):
            return "list"
            break
        default:
            return "plain"
            break
    }
})
</script>

<template>
    <span v-if="type === 'plain'">
        {{ props.contents }}
    </span>
    <ul v-else-if="type === 'list'">
        <li v-for="line in props.contents">
            {{ line }}
        </li>
    </ul>
</template>
