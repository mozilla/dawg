import './index.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import SearchDAWG from './views/SearchDAWG.vue'
import SingleDAWG from './views/SingleDAWG.vue'

const routes = [
  { path: '/', component: SearchDAWG, name: 'Search Page' },
  { path: '/:dawgid', component: SingleDAWG, name: 'View DAWG' }
]

const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    // always scroll to top
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
