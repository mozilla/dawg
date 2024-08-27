<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{ text: string }>()

const formatters: [RegExp, (i: string) => string][] = [
    [
        /^group:(.*)@(:?mozilla.com)|(?:firefox.gcp.mozilla.com)/,
        (i) => `https://groups.google.com/a/mozilla.com/g/${i}`
    ],
    [
        /^serviceAccount:.*@([a-z0-9-]+).iam.gserviceaccount.com/,
        (i) => `https://console.cloud.google.com/iam-admin/serviceaccounts?organizationId=442341870013&project=${i}`
    ],
    [
        // TODO thunderbird and foundation user names are not captured
        /([a-zA-Z0-9.]+@(?:(?:mozilla.com)|(?:thunderbird.net)|(?:mozillafoundation.org)))/,
        (i) => `https://people.mozilla.org/s?who=staff&query=${i}`
    ],
]


const href = computed(() => {
    let result = ''
    for (const f in formatters) {
        const regx = formatters[f][0]
        const fmt = formatters[f][1]
        const matches = regx.exec(props.text)
        console.log(`tested: ${props.text} against ${regx} got ${matches}`)
        if (matches && matches?.length > 0) {
            // for now all our formatting takes 1 substring so we can do this by convention
            result = fmt(encodeURIComponent(matches[1]))
            break
        }
    }
    return result
})

</script>
<template>
    <a v-if="href != ''" :href="href">{{ props.text }}</a>
    <span v-else>{{ props.text }}</span>
</template>