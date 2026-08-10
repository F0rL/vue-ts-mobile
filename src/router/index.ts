import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { config } from '@/config'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    hidden?: boolean
    affix?: boolean
    activeMenu?: string
  }
}

/** 自动加载 src/router/modules 下所有 .ts 路由模块 */
const autoRoutes: RouteRecordRaw[] = []
const routeModules = import.meta.glob<{ default: RouteRecordRaw[] }>('./modules/*.ts', {
  eager: true,
})
Object.values(routeModules).forEach(mod => {
  autoRoutes.push(...mod.default)
})

export const routes: RouteRecordRaw[] = [
  ...autoRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    component: () => import('@/views/result/error.vue'),
    meta: { hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(config.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
