import axios from 'axios'
import pinia from '@/stores'
import { useUserStore } from '@/stores/modules/user'
import { handleNetworkError } from './error'
import { config } from '@/config'
import { createApiHelpers } from './apiHelpers'

const http = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 15000,
})

// Token 注入 — 迁移自 alova beforeRequest bearer
http.interceptors.request.use((reqConfig) => {
  const userStore = useUserStore(pinia)
  if (userStore.token) {
    reqConfig.headers.Authorization = `Bearer ${userStore.token}`
  }
  return reqConfig
})

// HTTP 错误处理 — 迁移自 alova responded.onError
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // handleNetworkError 内部决定是否弹 toast（取消静默、401 跳转等）
    handleNetworkError(error)
    return Promise.reject(error)
  },
)

// 导出默认 axios 实例 + 预配置的 API 辅助函数
export default http
export const { apiGet, apiPost } = createApiHelpers(http)
