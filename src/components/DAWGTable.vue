<script setup lang="ts">
import FancyCell from './FancyCell.vue'
const props = defineProps<{
    headers: string[], // the headers for the table which probably won't change?
    rows: string[][], // an array of arrays of string, where each string[] is one row, data filter will mutate this when users search 
}>()
</script>

<template>
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3" v-for="header in props.headers" :key="header">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" v-for="(row, rowIndex) in props.rows" :key="rowIndex">
                    <td class="px-6 py-4" v-for="(cell, cellIndex) in row" :key="cellIndex">
                        <FancyCell :contents="cell" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


