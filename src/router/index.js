import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login/Login'
import Welcome from '../views/home/components/Welcome'
import Users from '../views/home/components/Users'
import Rights from '../views/home/components/rights'
import Roles from '../views/home/components/roles'
import category from '../views/home/components/category'
import params from '../views/home/components/params'

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
    redirect: '/welcome',
    component: () => import ('../views/home/Home'),
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: category
      },
      {
        path: '/params',
        component: params
      }
    ]
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
