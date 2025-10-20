import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// === CSS ===
import 'mdb-ui-kit/css/mdb.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/main.css'

// === jQuery ===
import $ from 'jquery'
window.$ = window.jQuery = $

// === MDB ===
import * as mdb from 'mdb-ui-kit'
window.mdb = mdb

// === Mount App ===
const app = createApp(App)
app.use(router)
app.mount('#app')
