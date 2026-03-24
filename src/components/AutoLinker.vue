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

const githubSearchUrl = (id: string) => {
    const encoded = encodeURIComponent(`"${id}"`)
    return `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+${encoded}&type=code`
}

const dawgUrl = (id: string) => {
    const name = id.replace('workgroup:', '')
    const base = id.includes('/') ? id.split('/')[0].replace('workgroup:', '') : name
    return `https://protosaur.dev/dawg/workgroup/${encodeURIComponent(base)}${id.includes('/') ? '#' + id.split('/')[1] : ''}`
}
const markdownLink = (id: string) => `[${id}](${dawgUrl(id)})`
const terraformSnippet = (id: string) => {
    const name = id.replace('workgroup:', '').replace(/\//g, '_')
    const moduleName = `${name}_workgroup`.replace(/-/g, '_')
    return `module "${moduleName}" {\n  source = "github.com/mozilla/terraform-modules//mozilla_workgroup?ref=main"\n  ids    = ["${id}"]\n}\n# module.${moduleName}.members`
}

const copiedVariant = ref<string | null>(null)
const copyVariant = (text: string, variant: string) => {
    navigator.clipboard.writeText(text)
    copiedVariant.value = variant
    setTimeout(() => copiedVariant.value = null, 1500)
}
</script>

<template>
    <span v-if="linkInfo.type == LinkType.WorkGroup || linkInfo.type == LinkType.SubGroup" class="wg-expandable">
        <RouterLink :to="href">{{ props.text }}</RouterLink>
        <span v-if="isExpandable" class="expand-toggle" @click="toggle">{{ expanded ? '▾' : '▸' }}<span class="copy-tooltip">{{ expanded ? 'collapse' : 'expand' }}</span></span>
        <span v-if="isExpandable" class="copy-buttons">
            <span class="copy-btn" @click="copyVariant(props.text, 'id')">🔗<span class="copy-tooltip">{{ copiedVariant === 'id' ? 'copied' : 'copy ID' }}</span></span>
            <span class="copy-btn" @click="copyVariant(markdownLink(props.text), 'md')">🗎<span class="copy-tooltip">{{ copiedVariant === 'md' ? 'copied' : 'copy Markdown' }}</span></span>
            <span class="copy-btn" @click="copyVariant(terraformSnippet(props.text), 'tf')"><svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.184 23.25.002-.01-.033-.017-8.388-4.611a1.6841 1.6841 0 0 1-.873-1.475V6.864c0-.614.335-1.18.873-1.476l9.424-5.18a1.6868 1.6868 0 0 1 1.622 0l8.31 4.568.022.012.006.002-.004-.001 1.09.599c.538.296.873.862.873 1.476v10.273c0 .614-.335 1.179-.873 1.475l-8.388 4.611-.03.016-1.006.553c-.505.277-1.117.277-1.622 0l-1.003-.552-.002.01Zm.603-1.158-.005-.001.012.006c.252.123.55-.055.558-.338l.001-9.147c0-.141-.078-.272-.202-.34L2.763 7.661c-.259-.142-.576.045-.576.341v9.135c0 .141.077.272.201.34l8.394 4.613.005.002Zm.556-.327Zm0 0Zm-2.539-4.802-.005.003-1.959-1.031-.003-.004c.001-.003.001-.007.001-.01.023-.305.153-.525.346-.632.194-.107.45-.101.72.041.272.143.508.397.671.691.163.293.252.628.229.935v.007ZM5.71 15.177l-.005.002-1.96-1.031-.002-.004.001-.01c.022-.304.152-.524.346-.632.194-.107.449-.101.72.042.271.143.508.396.671.69.162.294.252.628.229.935v.008Zm14.981-8.999-.003-.018a.382.382 0 0 0-.191-.25l-8.31-4.567a.3883.3883 0 0 0-.374 0L3.503 5.91c-.162.089-.226.265-.193.423l.009.007-.009-.007c.022.1.083.194.183.253l8.32 4.572c.116.064.258.064.374 0l8.321-4.573c.151-.089.212-.256.183-.407Zm-17.37.16Zm-.002.002c0-.001-.003-.003-.005-.006-.002-.002-.004-.004-.004-.003l.009.009Zm-.467-1.56-.003.002c.002.004.005.006.005.006l-.002-.008Zm.007.007c-.001.001-.002.001-.003.001h-.002l.005-.001Z" fill="currentColor"/></svg><span class="copy-tooltip">{{ copiedVariant === 'tf' ? 'copied' : 'copy HCL (Terraform)' }}</span></span>
            <a class="subgroup-gh-link" :href="githubSearchUrl(props.text)" target="_blank" rel="noopener noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.375 7.865 10.88.575.1.785-.25.785-.55v-1.98c-3.185.7-3.785-1.525-3.785-1.525-.515-1.34-1.26-1.69-1.26-1.69-1.03-.705.075-.695.075-.695 1.14.08 1.735 1.17 1.735 1.17 1.015 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.735-1.525-2.54-.3-5.215-1.27-5.215-5.635 0-1.245.44-2.26 1.165-3.06-.12-.3-.505-1.515.11-3.15 0 0 .95-.3 3.11 1.17.905-.25 1.87-.37 2.835-.375.965.005 1.93.13 2.835.38 2.15-1.47 3.1-1.17 3.1-1.17.62 1.635.24 2.845.12 3.145.725.8 1.165 1.82 1.165 3.065 0 4.37-2.675 5.325-5.225 5.625.41.35.785 1.055.785 2.125v3.16c0 .3.21.66.79.545C20.21 21.375 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z"
                        fill="currentColor" />
                </svg>
                <span class="copy-tooltip">search on GitHub</span>
            </a>
        </span>
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
    position: relative;
}

.expand-toggle:hover {
    opacity: 1;
}

.expand-toggle:hover .copy-tooltip {
    visibility: visible;
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
