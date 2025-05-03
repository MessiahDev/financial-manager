import { createApp } from 'vue';
import App from './App.vue';

import Swal from 'sweetalert2';
import { createPinia } from 'pinia';
import router from './router';
import VueGoogleCharts from 'vue-google-charts';
import { mask } from 'vue-the-mask';

import '@fortawesome/fontawesome-free/css/all.css';
import './assets/style.css';
import './assets/scripts/custom';

const app = createApp(App);

app.use(VueGoogleCharts);
app.config.globalProperties.$swal = Swal;
app.directive('mask', mask);
app.use(createPinia());
app.use(router);
app.mount('#app');