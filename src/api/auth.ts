import { apiGet, apiPost } from '@/utils/http'

// ==================== Types ====================

/** PC 端账号密码登录表单 */
export interface LoginPayload {
  username: string
  password: string
  verifyCode: string
  verifyKey: string
}

export interface UserInfo {
  id: string
  name: string
  avatar: string
  roles: { id: string; name: string }[]
}

// ==================== API Functions ====================

export function fetchCaptcha() {
  return apiGet<{ base64: string; key: string }>('/Auth/GetLoginVerCode')
}

export function fetchToken(data: LoginPayload) {
  return apiPost<string>('/Auth/GetTokenPC', data)
}

export function fetchUserInfo() {
  return apiGet<UserInfo>('/Auth/GetUserInfo')
}
