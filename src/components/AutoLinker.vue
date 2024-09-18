<script setup lang="ts">

import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatHref, testLinkText, LinkType, type LinkInfo } from './AutoLinker';

const props = defineProps<{ text: string }>()

const linkInfo = computed<LinkInfo>(() => testLinkText(props.text))
const href = computed<string>(() => formatHref(linkInfo.value))
</script>

<template>
    <RouterLink v-if="linkInfo.type == LinkType.WorkGroup" :to="href" />
    <span v-if="linkInfo.type == LinkType.None">{{ props.text }}</span>
    <a v-else :href="href">{{ props.text }}</a>
</template>
