import { apiGet, apiPost } from '@/utils/http'

// ==================== Types ====================

export interface MenuTreeNode {
  id: string
  title: string
  path?: string
  icon?: string
  order?: number
  createTime?: string
  isMenuShow?: boolean
  _disabled?: boolean
  parent?: { id: string } | null
  sysFile?: { sysFileId: string; url: string }
  children?: MenuTreeNode[]
}

export interface MenuPayload {
  id?: string
  title: string
  path?: string
  icon?: string
  order: number
  isMenuShow: boolean
  parentId: string | null
}

// ==================== API Functions ====================

export function fetchUserRightMenu(): Promise<unknown> {
  return apiPost('/SysMenu/GetUserRightMenu')
}

export function fetchMenuTree(params?: { searchKey?: string }) {
  return apiGet<MenuTreeNode[]>('/SysMenu/GetMenuTree', { params })
}

export function fetchMenuEntity(id: string) {
  return apiGet<MenuTreeNode>('/SysMenu/GetMenuEntity', { params: { id } })
}

export function fetchParentMenuAll() {
  return apiGet<MenuTreeNode[]>('/SysMenu/GetParentMenuAll')
}

export function createMenu(data: MenuPayload) {
  return apiPost('/SysMenu/CreateMenu', data)
}

export function updateMenu(data: MenuPayload) {
  return apiPost('/SysMenu/UpdateMenu', data)
}

export function deleteMenu(data: { ids: string[] }) {
  return apiPost('/SysMenu/DeleteMenu', data)
}

// ==================== Query Keys ====================

export const menuKeys = {
  all: ['menus'] as const,
  trees: () => [...menuKeys.all, 'tree'] as const,
}
