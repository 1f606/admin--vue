import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/login/Login'
import Welcome from '../views/home/components/Welcome'
const Users = () => import('../views/home/components/Users')
const Rights = () => import('../views/home/components/rights')
const Roles = () => import('../views/home/components/roles')
const category = () => import('../views/goods/category')
const params = () => import('../views/goods/params')
const GoodsList = () => import('../views/goods/GoodsList')
const AddPage = () => import('../views/goods/AddPage')
const OrderList = () => import('../views/order/OrderList')
const DataStatistics = () => import('../views/statistics/DataStatistics.vue')

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
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: AddPage
      },
      {
        path: '/orders',
        component: OrderList
      },
      {
        path: '/reports',
        component: DataStatistics
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
