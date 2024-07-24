<script setup lang="ts">
import { ref } from 'vue'

import DAWGTable from './DAWGTable.vue'

const props = defineProps<{
    data: any, 
}>()

const searchstring = defineModel<string>()

// These will be generated from real data in the end
const headers = ref([
    "Name",
    "Favorite Editor",
    "Favorite Food",
    "Mouse Aware?"
])


const projection = ref([
    ["Mikael", "Nano", "Smoked Things", "Yes"],
    ["Wesley", "Emacs", "Cost effective Brisket", "Unlikely"],
    ["Corban", "VSCode", "Pizza", "Somewhat"],
])

</script>

<template>
    <input type="text" v-model="searchstring" placeholder="Search"/>
    <DAWGTable :headers="headers" :data="projection"/>
</template>

<style>
/* Make it look like we care about it here  */
</style>