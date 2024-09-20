import './index.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import { routes, routebase } from './routing'

const router = createRouter({
  routes,
  history: createWebHistory(routebase),
  scrollBehavior() {
    // always scroll to top
    // SingleDAWG component has to handle its own scrolling
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
