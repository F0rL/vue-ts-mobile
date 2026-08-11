import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { isSuccess, handleBusinessError } from './error'

/**
 * Signal 取消链路：
 *   useQuery queryFn({ signal }) → fetch* 函数(signal) →
 *   apiGet/apiPost(url, config) 中的 config.signal →
 *   http.get/post(url, { ...config, signal }) → axios 原生消费
 *
 * 组件卸载时 vue-query 自动 abort signal → axios 抛出 CanceledError →
 *   error.ts handleNetworkError 中 axios.isCancel 静默处理
 */

/**
 * 创建 API 请求辅助函数，绑定到指定的 axios 实例
 *
 * 用法：
 *   const { apiGet, apiPost } = createApiHelpers(httpInstance)
 *
 * 多实例场景：
 *   const mainApi = createApiHelpers(http)
 *   const fileApi = createApiHelpers(httpFile)
 */
export function createApiHelpers(http: AxiosInstance) {
  /**
   * GET 请求 — 返回 { data: msg, total }
   *
   * 适用场景：单个实体、树形数据、分页/非分页列表
   */
  async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T; total: number }> {
    const { data: res } = await http.get<ApiResponse<T>>(url, config)
    if (!isSuccess(res)) {
      handleBusinessError(res)
      throw new Error(String(res.msg || '请求失败'))
    }
    return { data: res.msg, total: res.total }
  }

  /**
   * POST 请求 — 返回解包后的 msg
   *
   * 适用场景：增删改操作、非标准 GET 查询
   */
  async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data: res } = await http.post<ApiResponse<T>>(url, data, config)
    if (!isSuccess(res)) {
      handleBusinessError(res)
      throw new Error(String(res.msg || '请求失败'))
    }
    return res.msg
  }

  return { apiGet, apiPost }
}
