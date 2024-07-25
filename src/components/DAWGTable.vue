<script setup lang="ts">
import FancyCell from './FancyCell.vue'
const props = defineProps<{
    headers: string[], // the headers for the table which probably won't change?
    rows: string[][], // an array of arrays of string, where each string[] is one row, data filter will mutate this when users search 
}>()
</script>

<template>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th v-for="header in props.headers" :key="header">{{ header }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in props.rows" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                        <FancyCell :contents="cell" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
.table-container {
    overflow-x: auto;
    margin: 20px 0;
    border: 1px solid #444;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    background-color: #333;
    color: #f1f1f1;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
}

th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #555;
}

th {
    background-color: #444;
    font-weight: bold;
}

tr:hover {
    background-color: #555;
}

td {
    white-space: nowrap;
    vertical-align: top;

}
</style>
