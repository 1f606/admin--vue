import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login/Login'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import ('../views/home/Home')
  }
  // {
  //   path: '/about',
  //   name: 'about',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

const whiteRoutes = ['/login'] // 路由白名单 无须token

router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem('token')

  if (whiteRoutes.indexOf(to.path) !== -1) {
    next()
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
