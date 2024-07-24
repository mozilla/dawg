<script setup lang="ts">
import { ref } from 'vue'

import DAWGTable from './DAWGTable.vue'

const props = defineProps<{
    data: any, 
}>()

const normalized = computed(() => {
    const workgroups = 
    return {}
})
// unused temporarily
const searchstring = defineModel<string>()
</script>

<template>
    <input type="text" v-model="searchstring" placeholder="Search"/>
    <span>{{ searchstring }}</span>
    <DAWGTable :headers="normalized.headers" :data="normalized.data"/>
</template>

<style>
/* Make it look like we care about it here  */
</style>