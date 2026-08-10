import { apiGet } from '@/utils/http'

// ==================== Types ====================

/** 企业微信/账号登录表单 */
export interface LoginByUserIdPayload {
  userid: string
  pwd: string
}

// ==================== API Functions ====================

/** 通过账号密码获取 token */
export function fetchTokenByUserId(data: LoginByUserIdPayload) {
  return apiGet<string>('/WeiXinWork/GetTokenByUserId', { params: data })
}
