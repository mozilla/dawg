<script setup lang="ts">
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import PolyAssetLoader from './components/PolyAssetLoader.vue'

// initialize components based on data attribute selectors
onMounted(() => {
    initFlowbite();
})


const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon') as HTMLElement | null;
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon') as HTMLElement | null;

// Change the icons inside the button based on previous settings
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    themeToggleLightIcon?.classList.remove('hidden');
} else {
    themeToggleDarkIcon?.classList.remove('hidden');
}

const themeToggleBtn = document.getElementById('theme-toggle') as HTMLElement | null;

themeToggleBtn?.addEventListener('click', function() {

    // toggle icons inside button
    themeToggleDarkIcon?.classList.toggle('hidden');
    themeToggleLightIcon?.classList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }

});
</script>

<template>
  <header class="text-center">
    <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Effortlessly search and explore data access workgroups - Compiled from aggregated Terraform State data.</p>
  </header>
  <main>
    <RouterView />
    <!-- <PolyAssetLoader :sources="['gcpv1_enriched.json', 'gcpv2_merged.json']" /> -->
  </main>
</template>

<style scoped>
header {
  margin: 80px auto 2rem;
}
.whd-links {
  margin: 2rem 0;
}
.whd-links a {
  display: inline-block;
  margin: 0 2rem;
}
.whd-links a:hover {
  text-decoration: underline;
}
</style>
