import type { AxiosInstance } from 'axios'
import { isSuccess, handleBusinessError } from './error'

/**
 * 创建 API 请求辅助函数，绑定到指定的 axios 实例
 *
 * 用法：
 *   const { apiGet, apiPost, apiGetList } = createApiHelpers(httpInstance)
 *
 * 多实例场景：
 *   const mainApi = createApiHelpers(http)
 *   const fileApi = createApiHelpers(httpFile)
 */
export function createApiHelpers(http: AxiosInstance) {
  /**
   * GET 请求 — 返回解包后的 msg
   *
   * 适用场景：单个实体、树形数据、非分页列表
   */
  async function apiGet<T>(url: string, config?: Record<string, unknown>): Promise<T> {
    const { data: res } = await http.get<ApiResponse<T>>(url, config)
    if (!isSuccess(res)) {
      handleBusinessError(res)
      throw new Error(String(res.msg || '请求失败'))
    }
    return res.msg
  }

  /**
   * POST 请求 — 返回解包后的 msg
   *
   * 适用场景：增删改操作、非标准 GET 查询
   */
  async function apiPost<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T> {
    const { data: res } = await http.post<ApiResponse<T>>(url, data, config)
    if (!isSuccess(res)) {
      handleBusinessError(res)
      throw new Error(String(res.msg || '请求失败'))
    }
    return res.msg
  }

  /**
   * 分页列表 GET — 返回 { items, total }
   *
   * 后端分页接口将列表数据放在 msg 中，总条数放在顶层 total 中
   */
  async function apiGetList<T>(
    url: string,
    config?: Record<string, unknown>,
  ): Promise<{ items: T[]; total: number }> {
    const { data: res } = await http.get<ApiResponse<T[]>>(url, config)
    if (!isSuccess(res)) {
      handleBusinessError(res)
      throw new Error(String(res.msg || '请求失败'))
    }
    return { items: res.msg, total: res.total }
  }

  return { apiGet, apiPost, apiGetList }
}
