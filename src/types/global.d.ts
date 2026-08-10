/**
 * 后端接口统一响应结构
 *
 * 所有后端接口均返回此结构，msg 承载主要业务数据：
 * - 登录接口：msg 为 JWT Token 字符串
 * - 详情接口：msg 为单个对象
 * - 分页列表接口：msg 为数组，total 字段表示总条数
 * - 业务错误时：msg 为错误提示文本
 */
interface ApiResponse<T = unknown> {
  /** 是否成功（true 表示成功） */
  flag: boolean
  /** 主要业务数据 */
  msg: T
  /** 当 msg 为分页数组时，表示总条数；非分页接口通常为 0 */
  total: number
  /** 服务器响应时间 */
  time: string
  /** 业务状态码（0 表示成功） */
  code: number
}

/**
 * 分页列表响应（msg 为数组，total 在响应顶层）
 */
type PaginatedResponse<T> = ApiResponse<T[]>
