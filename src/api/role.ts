import { apiGet, apiGetList, apiPost } from '@/utils/http'

// ==================== Types ====================

export interface RoleEntity {
  id: string
  name: string
  isDelHandle?: boolean
  status: { value: number; text: string }
  menuList: { id: string; title: string }[]
  localUser: { id: string; name: string }[]
  workUser: { id: string; name: string }[]
  menuIdsJSON?: string
}

export interface RoleListItem {
  id: string
  name: string
}

export interface RoleListParams {
  pageIndex?: number
  pageSize?: number
}

export interface RolePayload {
  id?: string
  name: string
  status: number
  menuIds: string[]
  menuIdsJSON: string
}

// ==================== API Functions ====================

export function fetchRoleList(params?: RoleListParams) {
  return apiGetList<RoleListItem>('/SysRole/GetRoleList', { params })
}

export function fetchRoleEntity(id: string) {
  return apiGet<RoleEntity>('/SysRole/GetRoleEntity', { params: { id } })
}

export function createRole(data: RolePayload) {
  return apiPost('/SysRole/CreateRole', data)
}

export function updateRole(data: RolePayload) {
  return apiPost('/SysRole/UpdateRole', data)
}

export function deleteRole(data: { ids: string[] }) {
  return apiPost('/SysRole/DeleteRole', data)
}

// ==================== Query Keys ====================

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
}
