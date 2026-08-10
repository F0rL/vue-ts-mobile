import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

// ==================== Mock Data ====================

interface MockDept {
  id: string
  name: string
  parentId: string | null
  userIds: string[]
}

const depts: MockDept[] = [
  { id: '1', name: '大兴路小学', parentId: null, userIds: [] },
  { id: '2', name: '一年级组', parentId: '1', userIds: ['liuyi', 'chener'] },
  { id: '3', name: '二年级组', parentId: '1', userIds: ['yangsi'] },
  { id: '4', name: '三年级组', parentId: '1', userIds: [] },
  { id: '5', name: '教务处', parentId: '1', userIds: ['sunqi', 'zhouba'] },
  { id: '6', name: '总务处', parentId: '1', userIds: ['wujiu', 'zhengshi'] },
  { id: '7', name: '技术部', parentId: '1', userIds: ['admin', 'zhangsan', 'lisi'] },
  { id: '8', name: '市场部', parentId: '1', userIds: ['wangwu', 'zhaoliu'] },
]

// User data mirroring sysUser.ts structure
const users: { userId: string; name: string; gender: number; position: string }[] = [
  { userId: 'admin', name: '管理员', gender: 1, position: '系统管理员' },
  { userId: 'zhangsan', name: '张三', gender: 1, position: '前端开发' },
  { userId: 'lisi', name: '李四', gender: 1, position: '后端开发' },
  { userId: 'wangwu', name: '王五', gender: 1, position: '市场专员' },
  { userId: 'zhaoliu', name: '赵六', gender: 2, position: '市场经理' },
  { userId: 'sunqi', name: '孙七', gender: 1, position: '教导主任' },
  { userId: 'zhouba', name: '周八', gender: 2, position: '班主任' },
  { userId: 'wujiu', name: '吴九', gender: 1, position: '后勤主管' },
  { userId: 'zhengshi', name: '郑十', gender: 1, position: '财务专员' },
  { userId: 'liuyi', name: '刘一', gender: 2, position: '语文教师' },
  { userId: 'chener', name: '陈二', gender: 2, position: '数学教师' },
  { userId: 'yangsi', name: '杨四', gender: 1, position: '英语教师' },
]

// ==================== Build Department Tree ====================

function buildDeptTree(): unknown[] {
  const map = new Map<string, unknown>()
  const roots: unknown[] = []

  for (const d of depts) {
    map.set(d.id, { id: d.id, name: d.name, children: [] })
  }

  for (const d of depts) {
    const node = map.get(d.id)
    if (d.parentId && map.has(d.parentId)) {
      ;(map.get(d.parentId) as any).children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function getUserList(departmentId: string, searchKey: string, page: number, row: number) {
  const dept = depts.find(d => d.id === departmentId)
  const userIds = dept?.userIds ?? []
  let matched = userIds
    .map(uid => users.find(u => u.userId === uid))
    .filter(Boolean)

  if (searchKey) {
    const kw = searchKey.toLowerCase()
    matched = matched.filter(
      u => u!.name.toLowerCase().includes(kw) || u!.userId.toLowerCase().includes(kw),
    )
  }

  const total = matched.length
  const start = (page - 1) * row
  const pageItems = matched.slice(start, start + row)

  return {
    items: pageItems.map(u => {
      const deptNames = depts
        .filter(d => d.userIds.includes(u!.userId))
        .map(d => ({ id: d.id, name: d.name }))
      return {
        userid: u!.userId,
        name: u!.name,
        mobile: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        gender: u!.gender,
        genderText: u!.gender === 1 ? '男' : '女',
        position: u!.position,
        department: deptNames,
      }
    }),
    total,
  }
}

// ==================== Register Mock ====================

export function registerSysOrgMock(mock: MockAdapter) {
  // 部门树
  mock.onPost('/api/WeiXinWork/GetTreeDepartmentList').reply(() => {
    const tree = buildDeptTree()
    return [200, makeResp(tree)]
  })

  // 组织成员列表
  mock.onGet('/api/WeiXinWork/GetUserList').reply(config => {
    const params = config.params || {}
    const departmentId = (params.departmentId as string) || '1'
    const searchKey = (params.searchKey as string) || ''
    const page = Number(params.page) || 1
    const row = Number(params.row) || 10

    const { items, total } = getUserList(departmentId, searchKey, page, row)
    return [200, makeResp(items, 0, total)]
  })

  // 刷新缓存
  mock.onGet('/api/WeiXinWork/UserRefresh').reply(() => {
    return [200, makeResp(null)]
  })
}
