<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, useSlots } from 'vue';

import jiraLogo from '@/assets/jira.svg'
import gitHubLogo from '@/assets/github.svg'
import externalLink from '@/assets/externallink.svg'
import gcpLogo from '@/assets/gcp.png'

const slots = useSlots()

enum LinkTypes {
    Jira,
    GitHub,
    GCP,
    Internal,
    External
}
const props = withDefaults(defineProps<{
    href: string,
    autoText?: boolean,
    setType?: LinkTypes | null
}>(), {
    href: "",
    autoText: true,
    setType: null
})

const LinkTypeMap: Map<LinkTypes, RegExp> = new Map([
    [LinkTypes.Jira, new RegExp('mozilla-hub.atlassian.net')],
    [LinkTypes.GitHub, new RegExp('github.com')],
    [LinkTypes.GCP, new RegExp('console.cloud.google.com')],
    [LinkTypes.Internal, new RegExp(`^/|${window.location.host}`)] // starts with a slash or contains the current page URL
])

const type: ComputedRef<LinkTypes> = computed(() => {
    for (let [type, regexp] of LinkTypeMap) {
        if (regexp.test(props.href)) return type
    }
    return LinkTypes.External
})

const hasSlot = () => {
    return !!slots.length
}

const text: ComputedRef<string> = computed(() => {
    switch (true) {
        case hasSlot():
            return ""
        case type.value == LinkTypes.Jira:
            return "Jira Ticket"
        case type.value == LinkTypes.GitHub:
            return "Search on Github"
        case URL.canParse(props.href):
            return new URL(props.href).host
        default:
            return props.href
    }
})
</script>
<template>
    <a :href="props.href">
        <img v-if="type == LinkTypes.GCP" :src="gcpLogo" width="25px" height="25px" alt="GCP Logo" />
        <img v-else-if="type == LinkTypes.Jira" :src="jiraLogo" width="25px" height="25px" alt="Jira Logo" />
        <img v-else-if="type == LinkTypes.GitHub" :src="gitHubLogo" width="23px" height="23px" alt="Github Logo" />
        <img v-else :src="externalLink" width="23px" height="23px" alt="External Link" />
        <span>
            <slot v-if="hasSlot()"></slot>
            <template v-else-if="autoText">{{ text }}</template>
        </span>
    </a>
</template>
<style scoped>
a,
a span,
a img {
    display: inline-block;
}

a span {
    padding: 0 0.5rem;
}

a:first-child {
    margin-left: 0;
}

a:hover {
    display: inline-block;
    text-decoration: underline;
}
</style>