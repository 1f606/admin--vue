import Vue from 'vue'
import ElementUI from 'element-ui'
//  导入element-ui
import 'element-ui/lib/theme-chalk/index.css'
//  导入全局样式
import './assets/css/global.scss'
//  导入字体图标
import './assets/fonts/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.component('tree-table', ZkTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
