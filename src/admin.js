import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vant from 'vant';
import AdminApp from './AdminApp.vue';
import router from './router/admin.js';
import 'vant/lib/index.css';
import './assets/main.css';

const app = createApp(AdminApp);
app.use(createPinia());
app.use(router);
app.use(Vant);
app.mount('#admin-app');
