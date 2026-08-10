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

export const routes: RouteRecordRaw[] = [
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
