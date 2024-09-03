<script setup lang="ts">

import { onMounted, ref } from 'vue';

import { newWorkGroup } from '../workgroups'
import type { WorkGroupMap } from '../workgroups'

const props = defineProps<{
    sources: string[],
}>()

const emit = defineEmits<{
    done: [WorkGroupMap]
}>()

const data: WorkGroupMap = new Map();

enum Status {
    Loading,
    Completed,
    Errored
}

const status = ref(Status.Loading)
const message = ref("Loading...");

if (props?.sources?.length == 0) {
    message.value = "No sources provided"
    status.value = Status.Errored
}

onMounted(() => {
    let response: Response;

    Promise
        .all(props.sources && props.sources.map(src => {
            return fetch(`//${window.location.host}/${src}`).then(async (res) => {
                const tmp = await res.json()
                for (const groupname in tmp) {
                    const dawg = newWorkGroup(src, groupname, tmp[groupname])
                    data.set(dawg.id, dawg)
                }
            })
        }))
        .catch((err: Error) => {
            console.warn(err, response)
            status.value = Status.Errored
            message.value = err.toString()
        })
        .then(() => {
            emit('done', data)
        })
})


</script>

<template>
    <div class="loading-message">
        <svg v-if="status == Status.Loading" aria-hidden="true"
            class="loading-icon w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor" />
            <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill" />
        </svg>
        <img class="loading-icon" v-if="status == Status.Errored"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAACB0lEQVR4nO2Yz0sCQRiG59LMJQiiQzf7aWVZYkHXDnkpLIKKICSCCPppJVgRUUIQBEFEaBAEQRCBdAw6hLMd/Au6BHbrGv4BCV+4ymim7uzq2kjzwAtz/F5m99mPRUgikUgkEhMASlxA8buaCBlG1QREUT1Q8gkKgXTiEKltQNUCUBzKGj4dHETVALxgGyjk63cBkgBaY0eiAxQ/5Rk+FYqfkcgAxWMFh8+UcCMRgVeEgZI3zQIKjsEjIkg0gGKf9vDsFraQ4NoEjYilVcirTc1HSQytFtLmutsJnqFBNRvjThBWq1BAm74JByvgn3SIqVUoos3d6T5WYG+mVzytgoY2D2btrEDAYxdPq6ChzaO5HlbgeL5bLK0ChzZPFmyswOlil1haBQ5tni11sgLnKx3iaBUKb5s/ElyzsgKXXivPtyFREa0W3TazcrXZzgpc+9r4Pm7UZK1ybZvp3PhbWYHbnRa+AoqJWuXfNlO522tmBe73m/gLKCZpVde2qRAIH1pYgYeARUcBUn6tGtg2S028rFo1tm2WGhysqDZz8xGug5DXqio0eTZQIlEWrfJqMzfbU5llLnk2dAu0RK3q0WZulkcGWIHk2fCjRA1qVa82cxO9aITV0X41yXMJ70LMkFb1atPUUANaVX/K/vXgSuYW/mMB4lKfPwGGh2r7PS+RSCQSVCm+AQ0vLbmgWFIkAAAAAElFTkSuQmCC">
        <h2>{{ message }}</h2>
    </div>
</template>

<style>
.loading-message {
    width: 100%;
    text-align: center;
}

.loading-icon {
    display: inline-block;
}

.loading-icon+h2 {
    display: inline-block;
    margin-left: 1rem;
    font-style: italic;
}
</style>