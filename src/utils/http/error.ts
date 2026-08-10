import axios from 'axios'
import { message } from '@/utils/feedback'
import pinia from '@/stores'
import { useUserStore } from '@/stores/modules/user'
import { usePermissionStore } from '@/stores/modules/permission'
import router from '@/router'

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数有误',
  401: '登录已过期，请重新登录',
  403: '没有操作权限',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

let isRelogging = false

export function isSuccess(res: ApiResponse<unknown>): boolean {
  return res.code === 0
}

/** 情况③：有响应体，code≠0，业务错误 */
export function handleBusinessError(res: ApiResponse<unknown>) {
  message.error(res.msg ? String(res.msg) : '请求失败')
}

/** 401 鉴权失效：清缓存 + 跳登录页，带防重入锁 */
function handleUnauthorized() {
  if (isRelogging) return
  isRelogging = true

  const userStore = useUserStore(pinia)
  const permissionStore = usePermissionStore(pinia)
  userStore.resetToken()
  permissionStore.resetRoutes()
  message.error('登录已过期，请重新登录')
  router.push('/login').finally(() => {
    isRelogging = false
  })
}

/**
 * 情况①：无响应体（HTTP 非 200、网络异常、请求取消）
 * @returns true — 需要 reject，让调用方感知错误（loading 态关闭等）
 *          false — 已内部处理完毕，不 reject（401 跳转中、请求取消）
 */
export function handleNetworkError(error: any): boolean {
  if (axios.isCancel(error)) return false

  const status = error?.response?.status

  if (status === 401) {
    handleUnauthorized()
    return false
  }

  const serverMsg = error?.response?.data?.msg
  const msg =
    (serverMsg && String(serverMsg)) ||
    (status ? HTTP_STATUS_MESSAGES[status] : '') ||
    (status ? `请求失败 (${status})` : '网络连接失败，请检查网络')
  message.error(msg)
  return true
}
