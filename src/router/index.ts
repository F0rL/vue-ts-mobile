import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import { config } from '@/config'

import dashboardRoutes from './modules/dashboard'
import systemRoutes from './modules/system'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    affix?: boolean
    activeMenu?: string
  }
}

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { hidden: true, title: '登录' },
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('@/views/result/error.vue'),
    meta: { hidden: true, title: '错误' },
  },
  {
    path: '/404',
    redirect: '/error?status=404',
    meta: { hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    component: () => import('@/views/result/error.vue'),
    meta: { hidden: true },
  },
]

export const asyncRoutes: RouteRecordRaw[] = [...dashboardRoutes, ...systemRoutes]

const router = createRouter({
  history: createWebHistory(config.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

const whiteList = ['/login', '/404', '/error']

router.beforeEach(async to => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  if (userStore.token) {
    if (to.path === '/login') return '/'
    if (!permissionStore.isRoutesLoaded) {
      try {
        if (!userStore.userInfo.name) {
          await userStore.loadUserInfo()
        }
        await permissionStore.generateRoutes()
        return { path: to.path, query: to.query, replace: true }
      } catch {
        userStore.resetToken()
        permissionStore.resetRoutes()
        return `/login?redirect=${to.path}`
      }
    }
    return
  }

  if (whiteList.includes(to.path)) return
  return `/login?redirect=${to.path}`
})

router.afterEach(() => {
  NProgress.done()
})

export default router
