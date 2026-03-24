<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { formatHref, testLinkText, LinkType, type LinkInfo } from './AutoLinker';
import { datamapinjection } from '@/injections';
import { WorkGroupIDRegex, SubGroupIDRegex, formatDAWGID } from '@/workgroups';

const props = withDefaults(defineProps<{ text: string, expandable?: boolean, forceExpanded?: boolean, depth?: number }>(), {
    expandable: true,
    forceExpanded: false,
    depth: 0
})

const linkInfo = computed<LinkInfo>(() => testLinkText(props.text))
const href = computed<string>(() => formatHref(linkInfo.value))

const datamap = inject(datamapinjection)
const localToggled = ref<boolean | null>(null)
const expanded = computed(() => localToggled.value !== null ? localToggled.value : props.forceExpanded)

const isExpandable = computed(() =>
    props.expandable && (linkInfo.value.type === LinkType.WorkGroup || linkInfo.value.type === LinkType.SubGroup)
)

const isSA = (m: string) => m.startsWith('serviceAccount:') || m.includes('.iam.gserviceaccount.com')

const resolvedMembers = computed<string[]>(() => {
    if (!expanded.value || !datamap?.value) return []

    const text = props.text
    const subMatch = SubGroupIDRegex.exec(text)
    const wgMatch = WorkGroupIDRegex.exec(text)
    let raw: string[] = []

    if (subMatch) {
        const wgId = formatDAWGID(subMatch[1])
        const subgroup = subMatch[2]
        const house = datamap.value.get(wgId)
        if (!house) return []
        for (const dawg of house.values()) {
            const key = Object.keys(dawg.members).find(k => k.endsWith(`/${subgroup}`))
            if (key && dawg.members[key]) { raw = dawg.members[key]; break }
        }
    } else if (wgMatch) {
        const wgId = formatDAWGID(wgMatch[1])
        const house = datamap.value.get(wgId)
        if (!house) return []
        for (const dawg of house.values()) {
            for (const list of Object.values(dawg.members)) {
                for (const m of list) {
                    if (!raw.includes(m)) raw.push(m)
                }
            }
        }
    }

    return raw
})

const toggle = () => { localToggled.value = !expanded.value }
</script>

<template>
    <span v-if="linkInfo.type == LinkType.WorkGroup || linkInfo.type == LinkType.SubGroup" class="wg-expandable">
        <RouterLink :to="href">{{ props.text }}</RouterLink>
        <span v-if="isExpandable" class="expand-toggle" @click="toggle">{{ expanded ? '▾' : '▸' }}</span>
        <ul v-if="expanded && resolvedMembers.length > 0" class="expanded-members">
            <li v-for="member in resolvedMembers" :key="member">
                <AutoLinker :text="member" :forceExpanded="props.forceExpanded" :depth="props.depth + 1" :expandable="props.depth < 10" />
            </li>
        </ul>
        <span v-if="expanded && resolvedMembers.length === 0" class="expanded-empty">(no members found)</span>
    </span>
    <span v-else-if="linkInfo.type == LinkType.None">{{ props.text }}</span>
    <a v-else :href="href" target="_blank" rel="noopener noreferrer">{{ props.text }}</a>
</template>

<style>
.wg-expandable {
    display: inline;
}

.expand-toggle {
    cursor: pointer;
    margin-left: 0.3rem;
    font-size: 0.75rem;
    opacity: 0.5;
    user-select: none;
}

.expand-toggle:hover {
    opacity: 1;
}

.expanded-members {
    list-style-type: disc;
    list-style-position: inside;
    margin: 0.25rem 0 0.25rem 1rem;
}

.expanded-empty {
    display: block;
    margin: 0.25rem 0 0.25rem 1rem;
    font-size: 0.85rem;
    color: #9ca3af;
}
</style>
