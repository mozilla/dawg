<script setup lang="ts">

import { computed, defineProps, ref, type ComputedRef } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{ text: string }>()

enum LinkType {
    GoogleGroup,
    ServiceAccount,
    PhoneBook,
    WorkGroup,
    None
}

const tests = new Map<LinkType, RegExp>([
    [LinkType.GoogleGroup, /^group:[a-z0-9-]+@(?:mozilla.com)|(?:firefox.gcp.mozilla.com)/],
    [LinkType.ServiceAccount, /^serviceAccount:(?:[a-z0-9-]+)@([a-z0-9-]+).iam.gserviceaccount.com/],
    [LinkType.PhoneBook, /([a-zA-Z0-9.]+@(?:(?:mozilla.com)|(?:thunderbird.net)|(?:mozillafoundation.org)))/],
    [LinkType.WorkGroup, /^(workgroup:[a-z0-9-]+)/]
])

const formatters = new Map<LinkType, (input: string) => string>([
    [LinkType.GoogleGroup, (i) => `https://groups.google.com/a/mozilla.com/g/${i}`],
    [LinkType.ServiceAccount, (i) => `https://console.cloud.google.com/iam-admin/serviceaccounts?organizationId=442341870013&project=${i}`],
    [LinkType.PhoneBook, (i) => `https://people.mozilla.org/s?who=staff&query=${i}`]
])

const linkInfo = computed<{ type: LinkType, match: string }>(() => {
    let result = { type: LinkType.None, match: '' }

    if (props.text) for (let [lt, test] of tests) {
        const results = test.exec(props.text)
        if (results && results.length > 1) {
            result = { type: lt, match: results[1] }
            break
        }
    }

    return result
})
const noop = (i: string) => i
const href = computed<string>(() => (formatters.get(linkInfo.value.type) || noop)(encodeURIComponent(linkInfo.value.match || '')))

</script>
<template>
    <RouterLink v-if="linkInfo.type == LinkType.WorkGroup" :to="href" />
    <span v-if="linkInfo.type == LinkType.None">{{ props.text }}</span>
    <a v-else :href="href">{{ props.text }}</a>
</template>