<script setup lang="ts">
</script>

<template>
    <div class="container">
        <h1>Guide</h1>

        <section>
            <h2>What workgroups am I a member of?</h2>
            <p>Search DAWG for your email address. For any workgroups you find your email in, you can search for those
                workgroups to see what other access you have. For instance, if you search for your email address and find
                it under <code class="px-1.5 py-0.5 rounded text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">workgroup:dataplatform/developers</code>, you can search for
                <code class="px-1.5 py-0.5 rounded text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">workgroup:dataplatform/developers</code> to see what other workgroups it is associated with.
            </p>
        </section>

        <section>
            <h2>Who is in charge of this workgroup?</h2>
            <p>Search for the workgroup name in DAWG. The <strong>Sponsor</strong> and <strong>Managers</strong> are
                owners of the workgroup and should be able to answer questions about it.</p>
        </section>

        <section>
            <h2>What is this workgroup used for?</h2>
            <p>Search for the workgroup name in DAWG. Follow the links provided to get background information on the
                formation and purpose of the workgroup. If there are no links, there's a good chance the workgroup is
                deprecated.</p>
        </section>

        <section>
            <h2>What resources does this workgroup have access to?</h2>
            <p>Click the GitHub search link when viewing a workgroup. This searches for the workgroup identifier across
                Mozilla GitHub orgs to find configuration that references it. Note: you will need GitHub access, and you
                may not have access to all private repositories.</p>
        </section>

        <section>
            <h2>How do I join a workgroup?</h2>
            <p>Usually the first link under <strong>links</strong> for a workgroup will point to documentation on how to
                join. If it doesn't, you can ask the group manager (if one is listed) to add you.</p>
            <p>If you have access to and are comfortable filing a PR, you can go to the
                <a href="https://github.com/mozilla-it/global-platform-admin/tree/main/google-workspace-management/tf/workgroups"
                    target="_blank" rel="noopener noreferrer">workgroup definitions</a>,
                find your workgroup, and propose a change adding yourself.
            </p>
        </section>

        <section>
            <h2>Is this workgroup abandoned or deprecated?</h2>
            <p>If the Sponsor is "None", that is a pretty good sign the workgroup is deprecated. If you follow the
                GitHub search link and don't see any results, that's also a good indicator.</p>
            <p><a href="https://mozilla-hub.atlassian.net/jira/software/c/projects/SREIN/form/1344"
                    target="_blank" rel="noopener noreferrer">Contact Cloud Eng</a> if you think you should be a member of a
                workgroup that doesn't have a Sponsor.</p>
        </section>
    </div>
</template>

<style scoped>
.container {
    text-align: left;
    max-width: 48rem;
    margin: 0 auto;
}

h1 {
    font-size: 2rem;
    margin: 2rem 0;
}

h2 {
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
}

section {
    margin-bottom: 2rem;
}

p {
    margin-bottom: 0.75rem;
    line-height: 1.6;
}


a {
    color: var(--dawg-blue);
}

a:hover {
    text-decoration: underline;
    color: var(--dawg-orange);
}
</style>
