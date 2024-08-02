<script setup lang="ts">

import { computed } from 'vue'
import jiraLogo from '@/assets/jira.svg'

// thank to https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
const urlPattern =  new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	    '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator

const props = defineProps<{
    contents: undefined | string | Set<any> | Array<any> | Map<any, any>, 
}>()

// computing this ahead of time to keep template 
const type = computed(() => {
    switch (true) {
        case (props.contents instanceof Array && urlPattern.test(props?.contents[0] || "") == true):
            return "link"
        case (props.contents instanceof Set):
        case (props.contents instanceof Array):
        case (props.contents instanceof Map):
            return "list"
        case (props.contents == null):
        case (props.contents === undefined):
            return "none"
        default:
            return "plain"
    }
})
</script>

<template>
    <template v-if="type === 'plain'">
        {{ props.contents }}
    </template>
    <!-- All links are lists so handled accordingly -->
    <template v-if="type === 'link'">
      <a v-for="(link) in props.contents" :key="link.id" :href="link">
          <template v-if="link.includes('github.com')">
              <!-- GitHub SVG -->
              <svg width="23px" height="23px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.375 7.865 10.88.575.1.785-.25.785-.55v-1.98c-3.185.7-3.785-1.525-3.785-1.525-.515-1.34-1.26-1.69-1.26-1.69-1.03-.705.075-.695.075-.695 1.14.08 1.735 1.17 1.735 1.17 1.015 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.735-1.525-2.54-.3-5.215-1.27-5.215-5.635 0-1.245.44-2.26 1.165-3.06-.12-.3-.505-1.515.11-3.15 0 0 .95-.3 3.11 1.17.905-.25 1.87-.37 2.835-.375.965.005 1.93.13 2.835.38 2.15-1.47 3.1-1.17 3.1-1.17.62 1.635.24 2.845.12 3.145.725.8 1.165 1.82 1.165 3.065 0 4.37-2.675 5.325-5.225 5.625.41.35.785 1.055.785 2.125v3.16c0 .3.21.66.79.545C20.21 21.375 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z" fill="currentColor"/>
              </svg>
          </template>
          <template v-else-if="link.includes('mozilla-hub.atlassian.net')">
              <!-- Jira SVG -->
              <img :src="jiraLogo" width="25px" height="25px" alt="Jira Logo" />
          </template>
          <template v-else>
              <!-- Default SVG -->
              <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="Interface / External_Link">
                      <path id="Vector"
                            d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"
                            class="stroke-current text-blue-600 dark:text-blue-300"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                  </g>
              </svg>
          </template>
      </a>
    </template>
    <template v-else-if="type === 'none'">
        (no data)
    </template>
    <ul v-else-if="type === 'list'">
        <li v-for="(line, index) in props.contents" :key="index">
            {{ line }}
        </li>
    </ul>
</template>
