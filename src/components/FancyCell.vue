<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps<{
    contents: String | Set<any> | Array<any> | Map<any, any>, 
}>()

// computing this ahead of time to keep template 
const type = computed(() => {
    switch (true) {
        case (props.contents instanceof Set):
        case (props.contents instanceof Array):
        case (props.contents instanceof Map):
            return "list"
        default:
            return "plain"
    }
})
</script>

<template>
    <span v-if="type === 'plain'">
        {{ props.contents }}
    </span>
    <ul v-else-if="type === 'list'">
        <li v-for="(line, index) in props.contents" :key="index">
            {{ line }}
        </li>
    </ul>
</template>
