import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './style.css'

createApp(App).use(createPinia()).use(router).use(VueQueryPlugin).mount('#app')
