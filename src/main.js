import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Vant from 'vant';
import App from './App.vue';
import router from './router/index.js';
import 'vant/lib/index.css';
import './assets/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Vant);
app.mount('#app');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
