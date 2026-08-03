import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { enablePwa } from './pwa'

const app = createApp(App)

app.use(createPinia())
app.use(router)

enablePwa()

app.mount('#app')
