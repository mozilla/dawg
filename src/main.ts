import './index.css'

import {  createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import Search from './views/Search.vue'
import Single from './views/Single.vue'

const routes = [
  { path: '/', component: Search, name: "Search Page"},
  { path: '/dawg', component: Single, name: "View DAWG" },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
