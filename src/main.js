import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// === CSS ===
// import 'admin-lte/dist/css/adminlte.min.css'
import 'mdb-ui-kit/css/mdb.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/css/main.css'

// === jQuery, Bootstrap, AdminLTE ===
import $ from 'jquery'
window.$ = window.jQuery = $
// import 'bootstrap/dist/js/bootstrap.bundle'
// import 'admin-lte/dist/js/adminlte.min.js'

// === MDB ===
import * as mdb from 'mdb-ui-kit'
window.mdb = mdb

// === Mount App ===
const app = createApp(App)
app.use(router)
app.mount('#app')
