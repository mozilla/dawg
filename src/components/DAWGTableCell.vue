<script setup lang="ts">
import { ref } from 'vue';
import { dawgLinker } from '@/routing';
import { DisplayMode, getFieldDisplayMode } from '@/metadata';
import type { DAWG, ListOfText, MapOfLists, PlainText } from '@/workgroups'

import IconLink from './IconLink.vue';
import AutoLinker from './AutoLinker.vue';

const props = defineProps<{
  contents: undefined | PlainText | ListOfText | MapOfLists,
  fieldName: keyof DAWG,
  googleGroups?: MapOfLists,
}>()

const display = getFieldDisplayMode(props.fieldName)

const githubSearchUrl = (subgroupId: string) => {
  const encoded = encodeURIComponent(`"${subgroupId}"`)
  return `https://github.com/search?q=%28org%3Amozilla+OR+org%3Amozilla-services+OR+org%3Amozilla-it%29+${encoded}&type=code`
}

const copiedGroup = ref<string | null>(null)
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text.replace(/^group:/, ''))
  copiedGroup.value = text
  setTimeout(() => copiedGroup.value = null, 1500)
}
const copySubgroup = (text: string) => {
  navigator.clipboard.writeText(text)
  copiedGroup.value = text
  setTimeout(() => copiedGroup.value = null, 1500)
}
</script>

<template>
  <td class="px-2 py-1">
    <template v-if="!props || !props.contents || props.contents == undefined">
      (no data)
    </template>
    <template v-if="display === DisplayMode.DAWGLink">
      <RouterLink :to="dawgLinker(props.contents as string)">
        {{ props.contents }}
      </RouterLink>
    </template>
    <template v-if="display === DisplayMode.PlainText">
      <AutoLinker :text="(props.contents as string)" />
    </template>
    <template v-if="display === DisplayMode.ListOfLinks">
      <IconLink v-for="(link, i) in (props.contents as ListOfText)" :key="i" :href="link" :auto-text="false" />
    </template>
    <ul v-else-if="display === DisplayMode.ListOfText && props.contents && (props.contents as string[]).length > 1">
      <li v-for="(line, index) in props.contents" :key="index">
        <AutoLinker :text="(line as PlainText)" />
      </li>
    </ul>
    <span v-else-if="display === DisplayMode.ListOfText && props.contents && (props.contents as string[]).length == 1">
      <AutoLinker :text="props.contents && (props.contents as ListOfText)[0]" />
    </span>
    <dl v-else-if="display === DisplayMode.MapOfLists">

      <ul v-if="(props.contents as MapOfLists).hasOwnProperty('default')">
        <li v-for="member in (props.contents as MapOfLists).default" :key="member">
          <AutoLinker :text="member" />
        </li>
      </ul>

      <template v-for="(list, key) in (props.contents as MapOfLists)" :key="key">
        <template v-if="key != 'default'">
          <dt class="monospace" v-bind:id="(key as string).split('/')[1]">
            <AutoLinker :text="(key as string)" />
            <span class="copy-link" @click="copySubgroup(key as string)">
              🔗<span class="copy-tooltip">{{ copiedGroup === key ? 'copied' : 'copy to clipboard' }}</span>
            </span>
            <a class="subgroup-gh-link" :href="githubSearchUrl(key as string)" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.375 7.865 10.88.575.1.785-.25.785-.55v-1.98c-3.185.7-3.785-1.525-3.785-1.525-.515-1.34-1.26-1.69-1.26-1.69-1.03-.705.075-.695.075-.695 1.14.08 1.735 1.17 1.735 1.17 1.015 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.735-1.525-2.54-.3-5.215-1.27-5.215-5.635 0-1.245.44-2.26 1.165-3.06-.12-.3-.505-1.515.11-3.15 0 0 .95-.3 3.11 1.17.905-.25 1.87-.37 2.835-.375.965.005 1.93.13 2.835.38 2.15-1.47 3.1-1.17 3.1-1.17.62 1.635.24 2.845.12 3.145.725.8 1.165 1.82 1.165 3.065 0 4.37-2.675 5.325-5.225 5.625.41.35.785 1.055.785 2.125v3.16c0 .3.21.66.79.545C20.21 21.375 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z"
                  fill="currentColor" />
              </svg>
              <span class="copy-tooltip">search on GitHub</span>
            </a>
            <ul v-if="props.googleGroups?.[key as string]?.length" class="google-groups">
              <li v-for="group in props.googleGroups[key as string]" :key="group">
                <AutoLinker :text="group" />
                <span class="copy-link" @click="copyToClipboard(group)">
                  🔗<span class="copy-tooltip">{{ copiedGroup === group ? 'copied' : 'copy to clipboard' }}</span>
                </span>
              </li>
            </ul>
          </dt>
          <dd>
            <ul v-if="list.length > 0">
              <li v-for="item, i in list" :key="i">
                <AutoLinker :text="item" />
              </li>
            </ul>
            <span v-else>(no members)</span>
          </dd>
        </template>

      </template>
    </dl>
  </td>
</template>

<style>
td {
  vertical-align: top;
}

td ul {
  list-style-position: inside;
  list-style-type: disc;
}

td a {
  color: var(--dawg-blue);
  transition: color 0.15s;
}

td a:hover {
  text-decoration: underline;
  color: var(--dawg-orange)
}

td dt {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: bold;
}

td dd>span {
  margin-left: 0.3rem;
}

td dt:first-child {
  margin-top: 0;
}

.google-groups {
  font-weight: normal;
  font-size: 0.85rem;
  list-style-type: none;
  margin: 0.15rem 0 0 0;
  padding-left: 0;
}

.google-groups li {
  display: flex;
  align-items: center;
}

.copy-link,
.subgroup-gh-link {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  margin-left: 0.4rem;
}

.copy-link {
  position: relative;
}

.subgroup-gh-link {
  color: #6b7280;
  position: relative;
  transition: color 0.15s;
}

.subgroup-gh-link:hover {
  color: #1f2937;
  text-decoration: none !important;
}

.dark .subgroup-gh-link:hover {
  color: #9ca3af;
}

.subgroup-gh-link:hover .copy-tooltip {
  visibility: visible;
  opacity: 1;
}


.copy-tooltip {
  visibility: hidden;
  position: absolute;
  left: 100%;
  white-space: nowrap;
  padding-left: 4px;
  font-size: 0.75rem;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s;
}

.copy-link:hover .copy-tooltip {
  visibility: visible;
  opacity: 1;
}

td dd {
  margin-left: 0;
}

td dt:has(+ dd > ul),
td dd:has(> ul) {
  display: block;
}

td dt:has(+ dd > span),
td dd:has(> span) {
  display: block;
}
</style>
