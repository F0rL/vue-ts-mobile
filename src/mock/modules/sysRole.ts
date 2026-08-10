import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

let idCounter = 738088897698856960

function genId(): string {
  idCounter++
  return String(idCounter)
}

interface MockRole {
  id: string
  name: string
  status: number
  menuIdsJSON: string
}

let roles: MockRole[] = [
  { id: '10086', name: '超级管理员组', status: 1, menuIdsJSON: '[]' },
  { id: '738088897698856960', name: '测试角色', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000001', name: '系统管理员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000002', name: '普通用户', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000003', name: '访客', status: 0, menuIdsJSON: '[]' },
  { id: '740000000000000004', name: '财务专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000005', name: '人事专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000006', name: '运营专员', status: 0, menuIdsJSON: '[]' },
  { id: '740000000000000007', name: '市场专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000008', name: '客服专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000009', name: '采购专员', status: 0, menuIdsJSON: '[]' },
  { id: '740000000000000010', name: '仓储专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000011', name: '质检专员', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000012', name: '数据分析师', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000013', name: '内容编辑', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000014', name: '视觉设计师', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000015', name: '前端开发', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000016', name: '后端开发', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000017', name: '测试工程师', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000018', name: '运维工程师', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000019', name: '项目经理', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000020', name: '产品经理', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000021', name: '部门主管', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000022', name: '部门经理', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000023', name: '数据录入员', status: 0, menuIdsJSON: '[]' },
  { id: '740000000000000024', name: '培训讲师', status: 1, menuIdsJSON: '[]' },
  { id: '740000000000000025', name: '区域负责人', status: 1, menuIdsJSON: '[]' },
]

export function registerSysRoleMock(mock: MockAdapter) {
  mock.onGet('/api/SysRole/GetRoleList').reply(config => {
    const params = config.params || {}
    const keyword = ((params.keyword as string) || '').toLowerCase()
    const sorted = [...roles]
    const filtered = keyword ? sorted.filter(r => r.name.toLowerCase().includes(keyword)) : sorted

    const pageIndex = Number(params.pageIndex) || 1
    const pageSize = Number(params.pageSize) || 10
    const total = filtered.length
    const start = (pageIndex - 1) * pageSize
    const page = filtered.slice(start, start + pageSize)

    const list = page.map(r => ({
      id: r.id,
      name: r.name,
    }))

    return [200, makeResp(list, 0, total)]
  })

  mock.onGet('/api/SysRole/GetRoleEntity').reply(config => {
    const params = config.params || {}
    const id = params.id as string
    const role = roles.find(r => r.id === id)
    if (!role) return [404, makeResp('角色不存在', -1)]
    return [
      200,
      makeResp({
        id: role.id,
        name: role.name,
        isDelHandle: role.id !== '10086',
        status: { value: role.status, text: role.status === 1 ? '启用' : '禁用' },
        menuList: [],
        localUser: [],
        workUser: [],
        menuIdsJSON: role.menuIdsJSON,
      }),
    ]
  })

  mock.onPost('/api/SysRole/CreateRole').reply(config => {
    const data = JSON.parse(config.data)
    const role: MockRole = {
      id: genId(),
      name: data.name || '',
      status: data.status ?? 1,
      menuIdsJSON: data.menuIdsJSON || '[]',
    }
    roles.push(role)
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysRole/UpdateRole').reply(config => {
    const data = JSON.parse(config.data)
    const idx = roles.findIndex(r => r.id === data.id)
    if (idx === -1) return [404, makeResp('角色不存在', -1)]
    roles[idx] = {
      id: data.id,
      name: data.name || '',
      status: data.status ?? 1,
      menuIdsJSON: data.menuIdsJSON || '[]',
    }
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysRole/DeleteRole').reply(config => {
    const data = JSON.parse(config.data)
    const ids: string[] = data.ids || []
    roles = roles.filter(r => !ids.includes(r.id))
    return [200, makeResp(null)]
  })
}
