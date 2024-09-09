import './index.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { routes } from './routing'

const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
