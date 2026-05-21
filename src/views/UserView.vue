<script setup lang="ts">
import { computed, inject } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

import { datasetinjection, githublookupinjection, loginaliasesinjection } from '@/injections'

const route = useRoute()
const dataset = inject(datasetinjection)
const githubLookup = inject(githublookupinjection)
const loginAliases = inject(loginaliasesinjection)

const email = computed(() => decodeURIComponent(route.params.email as string))

const githubInfo = computed(() => githubLookup?.value.get(email.value) ?? null)

// All emails that share this user's github_login (the visited email plus any
// aliases). Falls back to just the visited email when there's no github
// identity to consolidate by.
const aliasEmails = computed<string[]>(() => {
    const login = githubInfo.value?.github_login
    if (!login) return [email.value]
    const aliases = loginAliases?.value.get(login)
    if (!aliases || aliases.length === 0) return [email.value]
    return aliases
})

const otherAliases = computed(() => aliasEmails.value.filter((e) => e !== email.value))

// people.mozilla.org keys off @mozilla.com / @mozillafoundation.org / @thunderbird.net,
// not @firefox.gcp.mozilla.com aliases. Pick a preferred alias if available.
const phonebookEmail = computed(() => {
    const preferred = aliasEmails.value.find(
        (e) => e.endsWith('@mozilla.com') || e.endsWith('@mozillafoundation.org') || e.endsWith('@thunderbird.net'),
    )
    return preferred ?? email.value
})

const phonebookUrl = computed(
    () => `https://people.mozilla.org/s?who=staff&query=${encodeURIComponent(phonebookEmail.value)}`,
)

const inMozillaOrg = computed(() =>
    (githubInfo.value?.github_orgs ?? []).includes('mozilla'),
)

type Membership = {
    workgroup: string
    subgroup: string
    subgroupID: string
    sponsor: string
    isSponsor: boolean
    isManager: boolean
}

const memberships = computed<Membership[]>(() => {
    if (!dataset?.value) return []
    const out: Membership[] = []
    // Scope strictly to the visited email — aliases are linked above but their
    // memberships render on their own user page.
    const e = email.value
    for (const wg of dataset.value) {
        const wgName = wg.id.replace('workgroup:', '')
        const isSponsor = wg.sponsor === e
        const isManager = wg.managers.includes(e)
        for (const [subgroupID, members] of Object.entries(wg.member_metadata)) {
            if (members[e]) {
                out.push({
                    workgroup: wgName,
                    subgroup: subgroupID.split('/').pop() ?? '',
                    subgroupID,
                    sponsor: wg.sponsor,
                    isSponsor,
                    isManager,
                })
            }
        }
        if ((isSponsor || isManager) && !out.some((m) => m.workgroup === wgName)) {
            out.push({
                workgroup: wgName,
                subgroup: '',
                subgroupID: wg.id,
                sponsor: wg.sponsor,
                isSponsor,
                isManager,
            })
        }
    }
    out.sort((a, b) => a.workgroup.localeCompare(b.workgroup) || a.subgroup.localeCompare(b.subgroup))
    return out
})

const sponsorOf = computed(() => memberships.value.filter((m) => m.isSponsor).map((m) => m.workgroup))
const managerOf = computed(() => memberships.value.filter((m) => m.isManager).map((m) => m.workgroup))
</script>

<template>
    <div class="container">
        <h1 class="monospace">{{ email }}</h1>
        <p v-if="otherAliases.length > 0" class="aliases">
            <span class="alias-label">also:</span>
            <RouterLink v-for="a in otherAliases" :key="a"
                :to="`/user/${encodeURIComponent(a)}`" class="alias-link monospace">{{ a }}</RouterLink>
        </p>
        <p class="phonebook-link">
            <a :href="phonebookUrl" target="_blank" rel="noopener noreferrer">View {{ phonebookEmail }} in people.mozilla.org</a>
        </p>

        <section v-if="githubInfo">
            <h2>GitHub</h2>
            <dl>
                <template v-if="githubInfo.github_login">
                    <dt>Handle</dt>
                    <dd>
                        <a :href="`https://github.com/${githubInfo.github_login}`" target="_blank" rel="noopener noreferrer">@{{ githubInfo.github_login }}</a>
                    </dd>
                </template>
                <dt>Orgs</dt>
                <dd>
                    <template v-if="(githubInfo.github_orgs?.length ?? 0) > 0">
                        <a v-for="org in githubInfo.github_orgs" :key="org"
                            class="org-link"
                            :href="githubInfo.github_login
                                ? `https://github.com/orgs/${org}/people?query=${encodeURIComponent(githubInfo.github_login)}`
                                : `https://github.com/orgs/${org}/people`"
                            target="_blank" rel="noopener noreferrer">{{ org }}</a>
                    </template>
                    <span v-else class="empty">(none)</span>
                </dd>
            </dl>
            <p v-if="!inMozillaOrg" class="warning">
                <span class="warning-icon">⚠</span>
                Not a member of the <code>mozilla</code> GitHub org.
                <a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/1768030278/MozCloud+Onboarding" target="_blank" rel="noopener noreferrer">See MozCloud Onboarding</a>.
            </p>
        </section>

        <section v-if="sponsorOf.length > 0 || managerOf.length > 0">
            <h2>Roles</h2>
            <dl>
                <template v-if="sponsorOf.length > 0">
                    <dt>Sponsor of</dt>
                    <dd>
                        <RouterLink v-for="wg in sponsorOf" :key="wg"
                            :to="`/workgroup/${wg}`" class="role-link monospace">workgroup:{{ wg }}</RouterLink>
                    </dd>
                </template>
                <template v-if="managerOf.length > 0">
                    <dt>Manager of</dt>
                    <dd>
                        <RouterLink v-for="wg in managerOf" :key="wg"
                            :to="`/workgroup/${wg}`" class="role-link monospace">workgroup:{{ wg }}</RouterLink>
                    </dd>
                </template>
            </dl>
        </section>

        <section>
            <h2>Workgroup membership ({{ memberships.length }})</h2>
            <ul v-if="memberships.length > 0">
                <li v-for="m in memberships" :key="m.subgroupID">
                    <RouterLink class="monospace"
                        :to="m.subgroup
                            ? `/workgroup/${m.workgroup}#${m.subgroup}`
                            : `/workgroup/${m.workgroup}`">
                        {{ m.subgroupID }}
                    </RouterLink>
                </li>
            </ul>
            <p v-else class="empty">Not a member of any workgroup.</p>
        </section>
    </div>
</template>

<style scoped>
.container {
    text-align: left;
    max-width: 64rem;
    margin: 0 auto;
}

h1 {
    font-size: 2rem;
    margin: 2rem 0 0.25rem;
    color: var(--dawg-blue);
}

.monospace {
    font-family: monospace;
}

.phonebook-link {
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
}

.phonebook-link a {
    color: var(--dawg-blue);
}

.aliases {
    margin: 0.25rem 0 0.5rem;
    font-size: 0.85rem;
    color: #6b7280;
}

.alias-label {
    font-style: italic;
    margin-right: 0.4rem;
}

.alias-link {
    color: var(--dawg-blue);
    text-decoration: none;
    margin-right: 0.5rem;
}

.alias-link:hover {
    text-decoration: underline;
}

section {
    margin-top: 2rem;
}

h2 {
    font-size: 1.2rem;
    margin: 0 0 0.75rem;
}

dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.4rem 1rem;
    margin: 0;
}

dt {
    font-weight: 600;
    color: #4b5563;
}

dd {
    margin: 0;
}

dd a {
    color: var(--dawg-blue);
    margin-right: 0.5rem;
}

.org-link {
    display: inline-block;
    padding: 0.1rem 0.5rem;
    margin: 0 0.3rem 0.3rem 0;
    border-radius: 0.4rem;
    background: #f3f4f6;
    color: #374151;
    text-decoration: none;
    font-size: 0.85rem;
}

.org-link:hover {
    background: var(--dawg-blue);
    color: #ffffff;
    text-decoration: none;
}

.role-link {
    display: inline-block;
    margin-right: 0.75rem;
}

.warning {
    margin-top: 1rem;
    color: #b91c1c;
}

.warning-icon {
    margin-right: 0.25rem;
}

ul {
    list-style: disc;
    list-style-position: inside;
    columns: 2;
    column-gap: 2rem;
    padding-left: 0;
}

@media (max-width: 640px) {
    ul {
        columns: 1;
    }
}

li {
    break-inside: avoid;
    padding: 0.15rem 0;
}

li a {
    color: var(--dawg-blue);
    text-decoration: none;
}

li a:hover {
    text-decoration: underline;
}

.empty {
    color: #9ca3af;
    font-style: italic;
}
</style>

<style>
/* dark mode overrides (non-scoped per project convention) */
.dark .container dt,
.dark .container .aliases {
    color: #9ca3af;
}

.dark .container .org-link {
    background: rgba(63, 131, 248, 0.12);
    color: #cbd5e1;
}

.dark .container .org-link:hover {
    background: var(--dawg-blue);
    color: #ffffff;
}

.dark .container .warning {
    color: #fca5a5;
}

.dark .container .empty {
    color: #6b7280;
}
</style>
