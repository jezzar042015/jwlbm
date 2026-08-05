import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { enablePwa } from './pwa'
import { runHydration } from './bootstrap'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

enablePwa()

app.mount('#app')

void runHydration()
