<script setup lang="ts">

import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import { WorkGroupIDRegex, dawgLinker } from '@/routing';

const props = defineProps<{ text: string }>()

enum LinkType {
    GoogleGroup,
    ServiceAccount,
    PhoneBook,
    WorkGroup,
    None
}

const tests = new Map<LinkType, RegExp>([
    [LinkType.GoogleGroup, /^group:([a-z0-9-]+)@((?:mozilla.com)|(?:firefox.gcp.mozilla.com))/],
    [LinkType.ServiceAccount, /^serviceAccount:(?:[a-z0-9-]+)@([a-z0-9-]+).iam.gserviceaccount.com/],
    [LinkType.PhoneBook, /([a-zA-Z0-9.]+@(?:(?:mozilla.com)|(?:thunderbird.net)|(?:mozillafoundation.org)))/],
    [LinkType.WorkGroup, WorkGroupIDRegex]
])

const formatters = new Map<LinkType, (input: string[]) => string>([
    [LinkType.GoogleGroup, (i) => `https://groups.google.com/a/${i[2]}/g/${i[1]}`],
    [LinkType.ServiceAccount, (i) => `https://console.cloud.google.com/iam-admin/serviceaccounts?organizationId=442341870013&project=${i[1]}`],
    [LinkType.PhoneBook, (i) => `https://people.mozilla.org/s?who=staff&query=${i[1]}`],
    [LinkType.WorkGroup, (i) => dawgLinker(i[1])]
])
type LinkInfo = { type: LinkType, matches: string[] }
const linkInfo = computed<LinkInfo>(() => {
    let result: LinkInfo = { type: LinkType.None, matches: [] }

    if (props.text) for (let [lt, test] of tests) {
        const results = test.exec(props.text)
        if (results && results.length > 1) {
            result.type = lt
            result.matches = results
            for (let i = 1; i < result.matches.length; i++) {
                result.matches[i] = encodeURIComponent(result.matches[i])
            }
            break
        }
    }

    return result
})
const noop = (i: string[]) => i[1];
const href = computed<string>(() => linkInfo.value.matches.length == 0 ? '' : (formatters.get(linkInfo.value.type) || noop)(linkInfo.value.matches))

</script>
<template>
    <RouterLink v-if="linkInfo.type == LinkType.WorkGroup" :to="href" />
    <span v-if="linkInfo.type == LinkType.None">{{ props.text }}</span>
    <a v-else :href="href">{{ props.text }}</a>
</template>
