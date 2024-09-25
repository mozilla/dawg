import './index.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory, type RouterScrollBehavior } from 'vue-router'

import App from './App.vue'
import { routes } from './routing'
import { routebase } from './config'

const router = createRouter({
  routes,
  history: createWebHistory(routebase),
  scrollBehavior(to) {
    // always scroll to top
    if (to.hash) {
      return {
        el: to.hash,
        top: 90
      }
    }
    // SingleDAWG component has to handle its own scrolling
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
