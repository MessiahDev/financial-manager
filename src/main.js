import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'
import router from './router'
import VueGoogleCharts from 'vue-google-charts'

import '@fortawesome/fontawesome-free/css/all.css';

import './assets/style.css'

const app = createApp(App)
app.use(VueGoogleCharts)
app.use(createPinia())
app.use(router)
app.mount('#app')