import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ruRu from 'element-plus/dist/locale/ru.mjs';
import '@fortawesome/fontawesome-free/css/all.css';


import './assets/css/style.css'

const app = createApp(App)
app.use(createPinia());
app.use(router)
app.use(ElementPlus, {
  locale: ruRu,
});

app.mount('#app')
