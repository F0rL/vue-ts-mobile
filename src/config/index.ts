export const config: {
  /** 应用基础路径，用于路由 basename */
  BASE_URL: string

  /** axios 请求 baseURL，dev 代理 /api */
  API_BASE_URL: string

  /** 应用标题 */
  APP_TITLE: string

  /** localStorage 命名空间，格式：项目:端:环境 */
  STORAGE_NS: string
} = {
  BASE_URL: import.meta.env.VITE_APP_BASE_URL,
  API_BASE_URL: import.meta.env.VITE_APP_BASE_API,
  APP_TITLE: import.meta.env.VITE_APP_TITLE,
  STORAGE_NS: import.meta.env.VITE_APP_STORAGE_NS,
}
