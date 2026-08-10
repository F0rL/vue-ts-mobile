import { apiGet, apiPost, apiGetList } from '@/utils/http'

// ==================== Types ====================

/** 组织树节点（部门 type=1 / 用户 type=2） */
export interface OrgTreeNode {
  id: string
  name: string
  type: number
  isLeaf?: boolean
  children?: OrgTreeNode[]
}

/** 关联的企业微信用户详情 */
export interface WorkUserEntity {
  name: string
  userid: string
  mobile?: string
  avatar?: string
  department?: number[]
  departmentNames?: string[]
}

/** 部门树节点 */
export interface DepartmentTreeNode {
  id: string
  name: string
  children?: DepartmentTreeNode[]
}

/** 组织成员列表项 */
export interface OrgUserItem {
  userid: string
  name: string
  mobile: string
  gender: number
  genderText: string
  position: string
  department: { id: string; name: string }[]
}

/** 组织成员列表请求参数 */
export interface OrgUserListParams {
  departmentId: string
  searchKey?: string
  page: number
  row: number
}

// ==================== API Functions ====================

/**
 * 获取组织架构树（部门/用户）
 * @param departmentId 部门 id，0 表示根节点
 * @param searchKey 按姓名/工号搜索
 * @param type 0 全部 / 1 部门 / 2 用户
 */
export function fetchOrgTree(params: {
  departmentId: number
  searchKey?: string
  type?: number
}) {
  return apiGet<OrgTreeNode[]>('/WeiXinWork/GetOrgTree', { params })
}

/** 获取企业微信用户详情（关联人员时自动填充账号信息） */
export function fetchWorkUserEntity(params: { userId: string }) {
  return apiGet<WorkUserEntity>('/WeiXinWork/GetUserEntity', { params })
}

/**
 * 获取部门树（全部一次性返回）
 * @param type 部门类型筛选，不传获取全部
 */
export function fetchDepartmentTree(params?: { type?: number }) {
  return apiPost<DepartmentTreeNode[]>('/WeiXinWork/GetTreeDepartmentList', params)
}

/**
 * 获取组织架构成员列表（分页）
 */
export function fetchOrgUserList(params: OrgUserListParams) {
  return apiGetList<OrgUserItem>('/WeiXinWork/GetUserList', { params })
}

/** 刷新组织架构缓存 */
export function refreshOrgUsers() {
  return apiGet<void>('/WeiXinWork/UserRefresh')
}

// ==================== Query Keys ====================

export const orgKeys = {
  all: ['org'] as const,
  departments: () => [...orgKeys.all, 'departments'] as const,
  users: () => [...orgKeys.all, 'users'] as const,
}
