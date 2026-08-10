import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

const methods = ['GET', 'POST', 'PUT', 'DELETE']
const paths = [
  '/SysUser/GetUserList',
  '/SysRole/GetRoleList',
  '/SysMenu/GetMenuTree',
  '/SysOrg/GetDepartmentTree',
  '/SysLog/GetHttpLogList',
  '/SysUser/CreateUser',
  '/SysRole/UpdateRole',
  '/SysMenu/DeleteMenu',
  '/SysUser/ResetPwd',
  '/SysOrg/RefreshOrgUsers',
]

const hosts = ['192.168.1.100', '192.168.1.101', '10.0.0.5', '172.16.0.1']

const users = [
  { name: '张三' },
  { name: '李四' },
  { name: '王五' },
  { name: '赵六' },
  { name: '孙七' },
  null,
  null,
  null,
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function randomTime(today: Date): string {
  const h = randomInt(0, 23)
  const m = randomInt(0, 59)
  const s = randomInt(0, 59)
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} ${pad(h)}:${pad(m)}:${pad(s)}`
}

function generateLogs(): Array<{
  name: string
  path: string
  method: string
  host: string
  executeStartTime: string
  executeEndTime: string
  elaspedTime: number
  user: { name: string } | null
}> {
  const today = new Date()
  return Array.from({ length: 38 }, () => {
    const exePath = randomItem(paths)
    const startTime = randomTime(today)
    const elapsed = randomInt(5, 2800)

    // 解析 startTime 并加上 elapsed ms 得到 endTime
    const startDate = new Date(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}T${startTime.split(' ')[1]}`)
    const endDate = new Date(startDate.getTime() + elapsed)
    const endTime = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())} ${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:${pad(endDate.getSeconds())}`

    return {
      name: `${randomItem(['获取', '创建', '更新', '删除', '查询'])}${exePath.split('/').pop()}`,
      path: exePath,
      method: randomItem(methods),
      host: randomItem(hosts),
      executeStartTime: startTime,
      executeEndTime: endTime,
      elaspedTime: elapsed,
      user: randomItem(users),
    }
  })
}

const logs = generateLogs()

export function registerSysLogMock(mock: MockAdapter) {
  mock.onGet('/api/SysLog/GetHttpLogList').reply(config => {
    const params = config.params || {}
    const searchKey = ((params.searchKey as string) || '').toLowerCase()
    const startTime = (params.startTime as string) || ''
    const endTime = (params.endTime as string) || ''

    let filtered = [...logs]

    if (searchKey) {
      filtered = filtered.filter(
        l =>
          l.name.toLowerCase().includes(searchKey) ||
          l.path.toLowerCase().includes(searchKey) ||
          l.method.toLowerCase().includes(searchKey) ||
          l.host.toLowerCase().includes(searchKey) ||
          (l.user?.name || '').toLowerCase().includes(searchKey),
      )
    }

    if (startTime) {
      filtered = filtered.filter(l => l.executeStartTime >= startTime)
    }
    if (endTime) {
      const end = endTime.length === 10 ? `${endTime} 23:59:59` : endTime
      filtered = filtered.filter(l => l.executeStartTime <= end)
    }

    const pageIndex = Number(params.page) || 1
    const pageSize = Number(params.row) || 10
    const total = filtered.length
    const start = (pageIndex - 1) * pageSize
    const page = filtered.slice(start, start + pageSize)

    return [200, makeResp(page, 0, total)]
  })
}
