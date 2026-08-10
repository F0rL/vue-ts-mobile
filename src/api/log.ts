import { apiGetList } from '@/utils/http'

// ==================== Types ====================

export interface LogListItem {
  /** 接口描述 */
  name: string
  /** 接口地址 */
  path: string
  /** 请求类型 */
  method: string
  /** 请求 Host */
  host: string
  /** 请求开始时间 */
  executeStartTime: string
  /** 请求结束时间 */
  executeEndTime: string
  /** 请求响应时长（毫秒） */
  elaspedTime: number
  /** 调用人员 */
  user: { name: string } | null
}

export interface LogListParams {
  page?: number
  row?: number
  searchKey?: string
  startTime?: string
  endTime?: string
}

// ==================== API Functions ====================

export function fetchLogList(params?: LogListParams) {
  return apiGetList<LogListItem>('/SysLog/GetHttpLogList', { params })
}

// ==================== Query Keys ====================

export const logKeys = {
  all: ['logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
}
