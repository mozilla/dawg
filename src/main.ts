import './index.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { routes, base } from './routing'

const router = createRouter({
  routes,
  history: createWebHistory(base),
  scrollBehavior() {
    // always scroll to top
    // SingleDAWG component has to handle its own scrolling
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
