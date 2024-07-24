<script setup lang="ts">
import { ref, computed } from 'vue'
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

const filteredProjection = computed(() => {
    if (!searchstring.value) {
        return projection.value
    }
    return projection.value.filter(row => 
        row.some(cell => cell.toLowerCase().includes(searchstring.value.toLowerCase()))
    )
})
</script>

<template>
    <input type="text" v-model="searchstring" placeholder="Search"/>
    <DAWGTable :headers="headers" :rows="filteredProjection"/>
</template>

<style>
input[type="text"] {
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #444;
    border-radius: 4px;
    background-color: #333;
    color: #f1f1f1;
    font-family: Arial, sans-serif;
}

input[type="text"]::placeholder {
    color: #bbb;
}
</style>