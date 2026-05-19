<script setup lang="ts">
import type { Ref } from 'vue';
import { inject, computed, onMounted, watch, ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';


import { type DAWG, type DAWGHouse, type ListOfLinks, formatDAWGID } from '@/workgroups';
import { shortVersions } from '@/metadata'

import IconLink from '@/components/IconLink.vue';
import DAWGTableCell from '@/components/DAWGTableCell.vue';
import { datamapinjection } from '@/injections';
import { ErrorCode, serializeErrorDetails } from '@/errors';


const router = useRouter();
const route = useRoute();
const details = ['sponsor', 'managers', 'members'] as const
const datamap = inject(datamapinjection)

const dawghouse: Ref<DAWGHouse | undefined> = ref()
const id = computed(() => formatDAWGID(route.params.id as string))

const loadWorkgroup = () => {
    if (!datamap) return router.push({ path: '/error', query: { err: ErrorCode.Application, detail: serializeErrorDetails(`datamap was not loaded got ${datamap}`) } })

    if (!datamap.value.has(id.value)) {
        console.warn('did not find workgroup so sending to 404')
        router.push({ path: '/error', query: { err: ErrorCode.NotFound404, dawgid: encodeURIComponent(id.value) } })
    }
    dawghouse.value = datamap.value.get(id.value)
}

watch(id, async () => {
    loadWorkgroup()
    await nextTick()
    scrollToHash()
})

loadWorkgroup()

const scrollToHash = () => {
    if (!window.location.hash) return

    const position = document.querySelector(window.location.hash)?.getBoundingClientRect().top
    if (!position) return

    window.scrollTo(0, position - 90)
}

onMounted(scrollToHash)

const hasManagers = computed(() => {
    const dawg = dawghouse.value?.values().next().value as DAWG | undefined
    if (!dawg) return false
    return dawg.managers.length > 0 && dawg.managers[0] !== '[no data]'
})

const hasSubgroupManagers = computed(() => {
    const dawg = dawghouse.value?.values().next().value as DAWG | undefined
    if (!dawg) return false
    return Object.values(dawg.subgroup_managers).some(m => m.length > 0)
})

const fieldHelp = computed(() => (field: string): string | undefined => {
    if (field === 'sponsor') {
        if (hasManagers.value || hasSubgroupManagers.value) {
            return 'This is the executive sponsor of this workgroup. Group management is delegated to managers.'
        }
        return 'This is the executive sponsor of this workgroup. This user is responsible for approving changes to members, or delegating that responsibility to managers.'
    }
    if (field === 'managers') {
        if (hasManagers.value) {
            return hasSubgroupManagers.value
                ? 'These users are responsible for approving changes to members of this workgroup. See also subgroup managers.'
                : 'These users are responsible for approving changes to members of this workgroup.'
        }
        return hasSubgroupManagers.value
            ? 'No top-level managers. The sponsor is responsible for managing members or delegating that to managers. See subgroup managers below.'
            : 'No managers. The sponsor is responsible for managing members or delegating that to managers.'
    }
    return undefined
})

const stats = computed(() => {
    const dawg = dawghouse.value?.values().next().value as DAWG | undefined
    if (!dawg) return null

    const entries = Object.entries(dawg.members)
    const subgroups = entries.length
    const uniqueMembers = new Set<string>()
    let users = 0
    let serviceAccounts = 0
    let groups = 0
    let workgroupRefs = 0

    for (const [, members] of entries) {
        for (const m of members) {
            uniqueMembers.add(m)
            if (m.startsWith('user:')) users++
            else if (m.startsWith('serviceAccount:') || m.includes('.iam.gserviceaccount.com')) serviceAccounts++
            else if (m.startsWith('group:')) groups++
            else if (m.startsWith('workgroup:')) workgroupRefs++
        }
    }

    return { subgroups, total: uniqueMembers.size, users, serviceAccounts, groups, workgroupRefs }
})


</script>

<template>
    <div class="container">
        <h1 class="monospace">
            <RouterLink :to="`/workgroup/${encodeURIComponent(route.params.id as string)}`">{{ id }}</RouterLink>
        </h1>
        <div v-if="stats" class="stats">
            <span><strong>{{ stats.subgroups }}</strong> subgroups</span>
            <span><strong>{{ stats.total }}</strong> members</span>
            <span v-if="stats.users"><strong>{{ stats.users }}</strong> users</span>
            <span v-if="stats.serviceAccounts"><strong>{{ stats.serviceAccounts }}</strong> service accounts</span>
            <span v-if="stats.groups"><strong>{{ stats.groups }}</strong> groups</span>
            <span v-if="stats.workgroupRefs"><strong>{{ stats.workgroupRefs }}</strong> workgroup refs</span>
        </div>
        <template v-for="ver in shortVersions">
            <div v-if="dawghouse?.has(ver)" :key="ver">

                <nav>
                    <IconLink v-for="link, key in (dawghouse.get(ver)?.links as ListOfLinks)" v-bind:key :href="link"
                        :autoText="true" />
                </nav>
                <div class="github-teams">
                    <span class="meta-label">GitHub teams:</span>
                    <template v-if="dawghouse.get(ver)?.github_teams?.length">
                        <a v-for="team in dawghouse.get(ver)?.github_teams" :key="`${team.org}/${team.team_slug}`"
                            class="team-chip"
                            :class="{ 'team-chip-empty': (team.members?.length ?? 0) === 0 }"
                            :href="`https://github.com/orgs/${team.org}/teams/${team.team_slug}`"
                            target="_blank" rel="noopener noreferrer">
                            <span class="team-org">{{ team.org }}</span>
                            <span class="team-slug">{{ team.team_slug }}</span>
                            <span v-if="team.members?.length" class="team-count">{{ team.members.length }}</span>
                            <span class="copy-tooltip">{{ team.org }}/{{ team.team_slug }} ({{ (team.members?.length ?? 0) === 0 ? 'no members' : `${team.members?.length} member${team.members?.length === 1 ? '' : 's'}` }})</span>
                        </a>
                    </template>
                    <a v-else class="no-teams-note"
                        href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/2492956683/Workgroups#Standard-Subgroups"
                        target="_blank" rel="noopener noreferrer">
                        none, only workgroups with standard subgroups get GitHub teams
                    </a>
                </div>
                <table>
                    <tr v-for="(field, i) in details" :key="i">
                        <td>{{ field }} <span v-if="fieldHelp(field)" class="help-wrapper"><span class="help-icon">?</span><span class="help-tooltip">{{ fieldHelp(field) }}</span></span></td>
                        <DAWGTableCell :fieldName="field" :contents="(dawghouse?.get(ver) || {})[field]"
                            :googleGroups="field === 'members' ? dawghouse?.get(ver)?.google_groups : undefined"
                            :subgroupManagers="field === 'members' ? dawghouse?.get(ver)?.subgroup_managers : undefined"
                            :memberMetadata="field === 'members' ? dawghouse?.get(ver)?.member_metadata : undefined"
                            :githubTeams="field === 'members' ? dawghouse?.get(ver)?.github_teams : undefined" />
                    </tr>
                </table>
            </div>
        </template>
    </div>


</template>

<style scoped>
.container {
    text-align: left;
}

h1 {
    font-size: 2.5rem;
    margin: 2rem 0;
    color: var(--dawg-blue);
}

.stats {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 1rem;
}

:global(.dark) .stats {
    color: #9ca3af;
}

.help-wrapper {
    position: relative;
    display: inline-block;
    vertical-align: middle;
}

.help-icon {
    display: inline-block;
    font-size: 0.7rem;
    width: 1rem;
    height: 1rem;
    line-height: 1rem;
    text-align: center;
    border-radius: 50%;
    background: #d1d5db;
    color: #374151;
    cursor: help;
}

:global(.dark) .help-icon {
    background: #4b5563;
    color: #d1d5db;
}

.help-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 0.5rem;
    white-space: nowrap;
    padding: 0.25rem 0.6rem;
    font-size: 0.75rem;
    font-weight: normal;
    text-transform: none;
    border-radius: 0.25rem;
    color: #374151;
    background: #f3f4f6;
    z-index: 10;
    transition: opacity 0.2s;
}

:global(.dark) .help-tooltip {
    color: #e5e7eb;
    background: #1f2937;
}

.help-wrapper:hover .help-tooltip {
    visibility: visible;
    opacity: 1;
}

h2 {
    font-size: 1.2rem;
    margin: 3rem 0 0 0;
}

nav {
    text-align: left;
    margin-top: 1rem;
}

nav a {
    display: block;
}

h1,
nav {
    margin-bottom: 1rem;
}

td {
    padding: 0 1rem 1rem 0;
    display: block;
    text-align: left;
}

td a {
    margin-top: 0;
}

dd {
    margin-bottom: 1rem;
}

td:first-child {
    text-transform: capitalize;
    font-weight: bold;
}

ul {
    list-style: disc;
    list-style-position: inside;
}

@media (min-width: 640px) {
    td {
        display: table-cell;
        vertical-align: top;
    }

    nav a {
        display: inline-block;
        margin: auto 1rem;
    }
}

.github-teams {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    margin: 0.75rem 0 1rem;
    font-size: 0.85rem;
}
</style>

<style>
/* Non-scoped so `.dark .team-chip` actually wins over scoped base rules. */
.team-chip .meta-label {
    color: #6b7280;
    font-style: italic;
}

.team-chip {
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    border-radius: 0.75rem;
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #e5e7eb;
    text-decoration: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    position: relative;
}

.team-chip:hover > .copy-tooltip {
    visibility: visible;
    opacity: 1;
}

.team-chip > .copy-tooltip {
    left: 50%;
    top: auto;
    bottom: 100%;
    margin-bottom: 0.3rem;
    transform: translateX(-50%);
}

.no-teams-note {
    color: #6b7280;
    font-style: italic;
    text-decoration: none;
    border-bottom: 1px dotted #9ca3af;
}

.no-teams-note:hover {
    color: var(--dawg-blue);
    border-bottom-color: var(--dawg-blue);
    text-decoration: none;
}

.dark .no-teams-note {
    color: #9ca3af;
    border-bottom-color: #4b5563;
}

.dark .no-teams-note:hover {
    color: #93c5fd;
    border-bottom-color: #93c5fd;
}

.team-chip:hover {
    background: #e5e7eb;
    color: #111827;
    border-color: var(--dawg-blue);
    text-decoration: none;
}

.team-org {
    font-size: 0.7rem;
    color: #6b7280;
}

.team-chip:hover .team-org {
    color: inherit;
    opacity: 0.85;
}

.team-slug {
    font-family: monospace;
}

.dark .team-chip {
    background: rgba(63, 131, 248, 0.15);
    color: #e5e7eb;
    border-color: rgba(63, 131, 248, 0.4);
}

.dark .team-chip:hover {
    background: rgba(63, 131, 248, 0.28);
    color: #ffffff;
    border-color: var(--dawg-blue);
}

.dark .team-org {
    color: #9ca3af;
}

.dark .team-slug {
    color: #93c5fd;
}

.dark .team-chip:hover .team-slug {
    color: #ffffff;
}

.team-chip-empty {
    opacity: 0.45;
}

.team-chip-empty:hover {
    opacity: 1;
}

.team-count {
    margin-left: 0.15rem;
    padding: 0 0.35rem;
    border-radius: 0.5rem;
    background: rgba(0, 0, 0, 0.08);
    color: inherit;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
}

.dark .team-count {
    background: rgba(255, 255, 255, 0.1);
}
</style>
