<script setup lang="ts">
import { computed, inject } from 'vue';

import AutoLinker from '@/components/AutoLinker.vue';
import { datasetinjection } from '@/injections';

const dataset = inject(datasetinjection)

type UserSummary = {
    email: string
    github_login: string | null | undefined
    orgs: string[]
}

// Collect one row per (email, github identity) across all workgroups.
const allUsers = computed<UserSummary[]>(() => {
    if (!dataset?.value) return []
    const seen = new Map<string, UserSummary>()
    for (const wg of dataset.value) {
        for (const sub of Object.values(wg.member_metadata)) {
            for (const [email, meta] of Object.entries(sub)) {
                if (meta.member_type !== 'user') continue
                if (seen.has(email)) continue
                seen.set(email, {
                    email,
                    github_login: meta.github_login,
                    orgs: meta.github_orgs ?? [],
                })
            }
        }
    }
    return [...seen.values()].sort((a, b) => a.email.localeCompare(b.email))
})

const orgCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const u of allUsers.value) {
        for (const o of u.orgs) counts.set(o, (counts.get(o) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

const orgComboCounts = computed(() => {
    const counts = new Map<string, number>()
    for (const u of allUsers.value) {
        const key = u.orgs.length === 0 ? '(none)' : [...u.orgs].sort().join(', ')
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

// Same condition as the inline warning: user has some github identity we know
// about, but `mozilla` is not in their org list.
const usersMissingMozilla = computed<UserSummary[]>(() => {
    return allUsers.value.filter((u) => {
        const hasIdentity = !!u.github_login || u.orgs.length > 0
        if (!hasIdentity) return false
        return !u.orgs.includes('mozilla')
    })
})

const totalUsers = computed(() => allUsers.value.length)
const usersWithGithubLogin = computed(() => allUsers.value.filter((u) => !!u.github_login).length)
const usersInMozilla = computed(() => allUsers.value.filter((u) => u.orgs.includes('mozilla')).length)
</script>

<template>
    <div class="container">
        <h1>GitHub</h1>
        <p class="subtitle">Per-org membership for workgroup-managed users.</p>

        <section>
            <h2>Totals</h2>
            <dl class="totals">
                <dt>Distinct workgroup users</dt>
                <dd>{{ totalUsers }}</dd>
                <dt>With a resolved GitHub login</dt>
                <dd>{{ usersWithGithubLogin }}</dd>
                <dt>In the <code>mozilla</code> org</dt>
                <dd>{{ usersInMozilla }}</dd>
                <dt>
                    <span class="warning-icon">⚠</span>
                    Have a GitHub identity but are <strong>not</strong> in <code>mozilla</code>
                </dt>
                <dd>{{ usersMissingMozilla.length }}</dd>
            </dl>
        </section>

        <section>
            <h2>Users per org</h2>
            <table class="stat-table">
                <thead>
                    <tr><th>Org</th><th>Users</th></tr>
                </thead>
                <tbody>
                    <tr v-for="[org, count] in orgCounts" :key="org">
                        <td><code>{{ org }}</code></td>
                        <td class="numeric">{{ count }}</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section>
            <h2>Org-set distribution</h2>
            <table class="stat-table">
                <thead>
                    <tr><th>Orgs</th><th>Users</th></tr>
                </thead>
                <tbody>
                    <tr v-for="[combo, count] in orgComboCounts" :key="combo">
                        <td><code>{{ combo }}</code></td>
                        <td class="numeric">{{ count }}</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <section>
            <h2>
                <span class="warning-icon">⚠</span>
                Users missing from the <code>mozilla</code> org
                <span class="count">{{ usersMissingMozilla.length }}</span>
            </h2>
            <p class="note">
                Note: a user can appear here either because they really aren't in the <code>mozilla</code> GitHub org, or because they renamed their GitHub handle and the workgroup data hasn't caught up.
                See <a href="https://mozilla-hub.atlassian.net/browse/MZCLD-3067" target="_blank" rel="noopener noreferrer">MZCLD-3067</a> for the rename detection follow-up.
            </p>
            <p v-if="usersMissingMozilla.length === 0" class="empty">Everyone with a resolved GitHub identity is in the <code>mozilla</code> org.</p>
            <table v-else class="stat-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>GitHub</th>
                        <th>Orgs they're in</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="u in usersMissingMozilla" :key="u.email">
                        <td><AutoLinker :text="u.email" :expandable="false" /></td>
                        <td>
                            <a v-if="u.github_login"
                                :href="`https://github.com/${u.github_login}`"
                                class="github-handle"
                                target="_blank" rel="noopener noreferrer">@{{ u.github_login }}</a>
                            <span v-else class="empty">(no resolved github_login)</span>
                        </td>
                        <td>
                            <span v-if="u.orgs.length === 0" class="empty">(none)</span>
                            <code v-for="o in u.orgs" :key="o" class="org-inline">{{ o }}</code>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p class="footnote">
                See the <a href="https://mozilla-hub.atlassian.net/wiki/spaces/SRE/pages/1768030278/MozCloud+Onboarding" target="_blank" rel="noopener noreferrer">MozCloud Onboarding</a> doc for how to add a user to the <code>mozilla</code> GitHub organization.
            </p>
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
}

.subtitle {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 1.5rem;
}

section {
    margin-top: 2rem;
}

h2 {
    font-size: 1.2rem;
    margin: 0 0 0.75rem;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
}

.count {
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: normal;
}

.warning-icon {
    color: #b91c1c;
}

.totals {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.25rem 1rem;
    margin: 0;
}

.totals dt {
    color: #4b5563;
}

.totals dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
    text-align: right;
}

code {
    font-family: monospace;
    font-size: 0.9em;
}

.stat-table {
    width: 100%;
    border-collapse: collapse;
}

.stat-table th,
.stat-table td {
    padding: 0.4rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

.stat-table th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
}

.numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.org-inline {
    display: inline-block;
    margin-right: 0.4rem;
    padding: 0.05rem 0.4rem;
    border-radius: 0.3rem;
    background: #f3f4f6;
    font-size: 0.8em;
}

.empty {
    color: #9ca3af;
    font-style: italic;
}

.footnote {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #6b7280;
}

.footnote a {
    color: var(--dawg-blue);
}

.note {
    margin: 0 0 1rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
    color: #4b5563;
    background: #f3f4f6;
    border-left: 3px solid #d1d5db;
    border-radius: 0.25rem;
}

.note a {
    color: var(--dawg-blue);
}
</style>

<style>
/* Non-scoped overrides so the same dark mode the rest of the app uses work
   here too (Vue's :global() is silently dropped by this project's css
   pipeline; see SingleDAWG.vue for the same workaround). */
.dark .container .subtitle,
.dark .container .count,
.dark .container .footnote,
.dark .container .stat-table th,
.dark .container .totals dt {
    color: #9ca3af;
}

.dark .container .stat-table th,
.dark .container .stat-table td {
    border-bottom-color: #374151;
}

.dark .container .org-inline {
    background: rgba(63, 131, 248, 0.12);
    color: #cbd5e1;
}

.dark .container .empty {
    color: #6b7280;
}

.dark .container .note {
    background: #1f2937;
    color: #cbd5e1;
    border-left-color: #4b5563;
}
</style>
