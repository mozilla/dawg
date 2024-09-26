<script setup lang="ts">

import { deserializeErrorDetails, ErrorCode } from '@/errors';

import { useUrlSearchParams } from '@vueuse/core';


const params = useUrlSearchParams('history')
const dawgID = decodeURIComponent(params.dawgid as string)
const errCode = parseInt(params.err as string) as ErrorCode
const errDetails = params.details ? deserializeErrorDetails(params.details as string) : '';

</script>

<template>
    <div class="container" v-if="errCode === ErrorCode.NotFound404">
        <h1
            class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            404
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-400">
                Workgroup
            </span>
            Not Found
        </h1>
        <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
            Could not find <span class="monospace text-blue-600 dark:text-blue-500">{{ dawgID }}</span> data access
            workgroup
        </p>
        <p class="monospace" v-if="errDetails">{{ errDetails }}</p>
        <RouterLink to="/">
            <button type="button"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Return to search
            </button>
        </RouterLink>
    </div>
    <div class="container" v-if="errCode === ErrorCode.Application">
        <h1
            class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Well this is
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-orange-400">
                embarassing
            </span>
        </h1>
        <h2>We seem to have encountered an unexpected issue</h2>
        <p class="monospace" v-if="errDetails">{{ errDetails }}</p>
    </div>

</template>
<style scoped>
.container {
    text-align: center;
    margin: 0px auto;
    display: block;
}

h1 {
    cursor: default;
    margin-top: 2rem;
}

h2 {
    font-size: 1.2rem;
}

.monospaced {
    font-weight: bold;
}

a {
    margin: 1rem auto 0;
    display: inline-block;
}

a:hover {
    text-decoration: underline;
}
</style>