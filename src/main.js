import Vue from 'vue'
import ElementUI from 'element-ui'
//  导入element-ui
import 'element-ui/lib/theme-chalk/index.css'
//  导入全局样式
import './assets/css/global.scss'
//  导入字体图标
import './assets/fonts/iconfont.css'
import App from './App.vue'
import router from './router'
import store from './store'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
