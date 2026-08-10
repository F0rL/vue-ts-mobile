import { apiGet, apiGetList, apiPost } from '@/utils/http'

// ==================== Types ====================

export interface UserRole {
  id: string
  name: string
}

/** 用户状态：1 启用 / -1 禁用 */
export interface UserStatus {
  value: number
  text: string
}

/** 列表行数据（id 即登录账号） */
export interface UserListItem {
  id: string
  userId: string
  name: string
  avatar: string
  status: UserStatus
  roleList: UserRole[]
  isDelHandle?: boolean
  _disabled?: boolean
}

export interface UserEntity {
  id: string
  name: string
  pwd?: string
  avatar: string
  status: UserStatus
  roleList: UserRole[]
  userid?: string
  depName?: string
  depId?: string
}

export interface UserListParams {
  pageIndex?: number
  pageSize?: number
  searchKey?: string
}

export interface UserPayload {
  id?: string
  userId: string
  name: string
  pwd: string | null
  status: number
  avatar: string
  roleIds: string[]
  wechat_UserId?: string | null
  wechat_DepId?: string | null
  wechat_DepName?: string | null
}

// ==================== API Functions ====================

export function fetchUserList(params?: UserListParams) {
  return apiGetList<UserListItem>('/SysUser/GetUserList', { params })
}

export function fetchUserEntity(id: string) {
  return apiGet<UserEntity>('/SysUser/GetUserEntity', { params: { id } })
}

export function createUser(data: UserPayload) {
  return apiPost('/SysUser/CreateUser', data)
}

export function updateUser(data: UserPayload) {
  return apiPost('/SysUser/UpdateUser', data)
}

export function deleteUser(data: { ids: string[] }) {
  return apiPost('/SysUser/DeleteUser', data)
}

export function resetUserPwd(data: { userId: string }) {
  return apiPost('/SysUser/ResetPwd', data)
}

// ==================== Query Keys ====================

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
}
