import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

let idCounter = 748088897698856

function genId(): string {
  idCounter++
  return String(idCounter)
}

const AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#c0c4cc"/><text x="50" y="64" font-size="44" text-anchor="middle" fill="#fff">人</text></svg>',
  )

interface MockUser {
  id: string
  userId: string
  name: string
  avatar: string
  status: number
  roleIds: string[]
  isDelHandle: boolean
  _disabled: boolean
  wechat_UserId?: string
  wechat_DepId?: string
  wechat_DepName?: string
}

const ROLE_NAMES: Record<string, string> = {
  '10086': '超级管理员组',
  '740000000000000001': '系统管理员',
  '740000000000000002': '普通用户',
  '740000000000000003': '访客',
}

let users: MockUser[] = [
  { id: 'admin', userId: 'admin', name: '管理员', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['10086'], isDelHandle: false, _disabled: true, wechat_UserId: 'admin', wechat_DepId: '1', wechat_DepName: '技术部' },
  { id: 'zhangsan', userId: 'zhangsan', name: '张三', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000001'], isDelHandle: true, _disabled: false, wechat_UserId: 'zhangsan', wechat_DepId: '1', wechat_DepName: '技术部' },
  { id: 'lisi', userId: 'lisi', name: '李四', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000002'], isDelHandle: true, _disabled: false, wechat_UserId: 'lisi', wechat_DepId: '1', wechat_DepName: '技术部' },
  { id: 'wangwu', userId: 'wangwu', name: '王五', avatar: AVATAR_PLACEHOLDER, status: -1, roleIds: ['740000000000000002'], isDelHandle: true, _disabled: false, wechat_UserId: 'wangwu', wechat_DepId: '2', wechat_DepName: '市场部' },
  { id: 'zhaoliu', userId: 'zhaoliu', name: '赵六', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000003'], isDelHandle: true, _disabled: false, wechat_UserId: 'zhaoliu', wechat_DepId: '2', wechat_DepName: '市场部' },
  { id: 'sunqi', userId: 'sunqi', name: '孙七', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000002'], isDelHandle: true, _disabled: false, wechat_UserId: 'sunqi', wechat_DepId: '3', wechat_DepName: '教务处' },
  { id: 'zhouba', userId: 'zhouba', name: '周八', avatar: AVATAR_PLACEHOLDER, status: -1, roleIds: ['740000000000000003'], isDelHandle: true, _disabled: false, wechat_UserId: 'zhouba', wechat_DepId: '3', wechat_DepName: '教务处' },
  { id: 'wujiu', userId: 'wujiu', name: '吴九', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000001'], isDelHandle: true, _disabled: false, wechat_UserId: 'wujiu', wechat_DepId: '4', wechat_DepName: '总务处' },
  { id: 'zhengshi', userId: 'zhengshi', name: '郑十', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000002'], isDelHandle: true, _disabled: false, wechat_UserId: 'zhengshi', wechat_DepId: '4', wechat_DepName: '总务处' },
  { id: 'liuyi', userId: 'liuyi', name: '刘一', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000003'], isDelHandle: true, _disabled: false, wechat_UserId: 'liuyi', wechat_DepId: '5', wechat_DepName: '一年级组' },
  { id: 'chener', userId: 'chener', name: '陈二', avatar: AVATAR_PLACEHOLDER, status: 1, roleIds: ['740000000000000002'], isDelHandle: true, _disabled: false, wechat_UserId: 'chener', wechat_DepId: '5', wechat_DepName: '一年级组' },
  { id: 'yangsi', userId: 'yangsi', name: '杨四', avatar: AVATAR_PLACEHOLDER, status: -1, roleIds: ['740000000000000003'], isDelHandle: true, _disabled: false, wechat_UserId: 'yangsi', wechat_DepId: '6', wechat_DepName: '二年级组' },
]

function toListItem(u: MockUser) {
  return {
    id: u.id,
    userId: u.userId,
    name: u.name,
    avatar: u.avatar,
    status: { value: u.status, text: u.status === 1 ? '启用' : '禁用' },
    roleList: u.roleIds.map(id => ({ id, name: ROLE_NAMES[id] || '未知角色' })),
    isDelHandle: u.isDelHandle,
    _disabled: u._disabled,
  }
}

// 企业微信组织树（部门 type=1 / 用户 type=2）
const ORG_DEPTS: Record<string, { id: string; name: string; userIds: string[] }> = {
  '0': { id: '0', name: '根', userIds: [] },
  '1': { id: '1', name: '技术部', userIds: ['zhangsan', 'lisi'] },
  '2': { id: '2', name: '市场部', userIds: ['wangwu', 'zhaoliu'] },
  '3': { id: '3', name: '教务处', userIds: ['sunqi', 'zhouba'] },
  '4': { id: '4', name: '总务处', userIds: ['wujiu', 'zhengshi'] },
  '5': { id: '5', name: '一年级组', userIds: ['liuyi', 'chener'] },
  '6': { id: '6', name: '二年级组', userIds: ['yangsi'] },
}

const ROOT_DEPT_IDS = ['1', '2', '3', '4', '5', '6']

export function registerSysUserMock(mock: MockAdapter) {
  // ==================== SysUser ====================

  mock.onGet('/api/SysUser/GetUserList').reply(config => {
    const params = config.params || {}
    const searchKey = ((params.searchKey as string) || '').toLowerCase()

    let filtered = [...users]
    if (searchKey) {
      filtered = filtered.filter(
        u => u.userId.toLowerCase().includes(searchKey) || u.name.toLowerCase().includes(searchKey),
      )
    }

    const pageIndex = Number(params.pageIndex) || 1
    const pageSize = Number(params.pageSize) || 10
    const total = filtered.length
    const start = (pageIndex - 1) * pageSize
    const page = filtered.slice(start, start + pageSize)

    return [200, makeResp(page.map(toListItem), 0, total)]
  })

  mock.onGet('/api/SysUser/GetUserEntity').reply(config => {
    const params = config.params || {}
    const id = params.id as string
    const user = users.find(u => u.id === id)
    if (!user) return [404, makeResp('用户不存在', -1)]
    return [
      200,
      makeResp({
        id: user.id,
        name: user.name,
        pwd: '',
        avatar: user.avatar,
        status: { value: user.status, text: user.status === 1 ? '启用' : '禁用' },
        roleList: user.roleIds.map(rid => ({ id: rid, name: ROLE_NAMES[rid] || '未知角色' })),
        isDelHandle: user.isDelHandle,
        userid: user.wechat_UserId,
        depName: user.wechat_DepName,
        depId: user.wechat_DepId,
      }),
    ]
  })

  mock.onPost('/api/SysUser/CreateUser').reply(config => {
    const data = JSON.parse(config.data)
    const user: MockUser = {
      id: data.userId,
      userId: data.userId,
      name: data.name || '',
      avatar: data.avatar || '',
      status: data.status ?? 1,
      roleIds: data.roleIds || [],
      isDelHandle: true,
      _disabled: false,
      wechat_UserId: data.wechat_UserId,
      wechat_DepId: data.wechat_DepId,
      wechat_DepName: data.wechat_DepName,
    }
    users.push(user)
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysUser/UpdateUser').reply(config => {
    const data = JSON.parse(config.data)
    const idx = users.findIndex(u => u.id === data.userId)
    if (idx === -1) return [404, makeResp('用户不存在', -1)]
    users[idx] = {
      ...users[idx],
      name: data.name || users[idx].name,
      avatar: data.avatar ?? users[idx].avatar,
      status: data.status ?? users[idx].status,
      roleIds: data.roleIds || users[idx].roleIds,
      wechat_UserId: data.wechat_UserId,
      wechat_DepId: data.wechat_DepId,
      wechat_DepName: data.wechat_DepName,
    }
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysUser/DeleteUser').reply(config => {
    const data = JSON.parse(config.data)
    const ids: string[] = data.ids || []
    users = users.filter(u => !ids.includes(u.id))
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysUser/ResetPwd').reply(config => {
    const data = JSON.parse(config.data)
    const user = users.find(u => u.id === data.userId)
    if (!user) return [404, makeResp('用户不存在', -1)]
    return [200, makeResp(null)]
  })

  // ==================== SysUpload ====================

  mock.onPost('/api/SysUpload/UploadFile').reply(config => {
    const file = config.data instanceof FormData ? (config.data.get('file') as File | null) : null
    const name = file?.name || ''
    return [200, makeResp({ id: genId(), url: AVATAR_PLACEHOLDER, oldName: name, newName: name })]
  })

  // ==================== WeiXinWork ====================

  mock.onGet('/api/WeiXinWork/GetOrgTree').reply(config => {
    const params = config.params || {}
    const departmentId = String(params.departmentId ?? '0')
    const searchKey = ((params.searchKey as string) || '').toLowerCase()

    if (searchKey) {
      const matched = users.filter(
        u => u.name.toLowerCase().includes(searchKey) || u.userId.toLowerCase().includes(searchKey),
      )
      return [
        200,
        makeResp(
          matched.map(u => ({
            id: u.userId,
            name: `${u.name}（${u.userId}）`,
            type: 2,
            isLeaf: true,
          })),
        ),
      ]
    }

    if (departmentId === '0') {
      return [200, makeResp(ROOT_DEPT_IDS.map(id => ({ id, name: ORG_DEPTS[id].name, type: 1, isLeaf: false })))]
    }

    const dept = ORG_DEPTS[departmentId]
    if (!dept) return [200, makeResp([])]
    return [
      200,
      makeResp(
        dept.userIds
          .map(uid => users.find(u => u.userId === uid))
          .filter(Boolean)
          .map(u => ({ id: u!.userId, name: `${u!.name}（${u!.userId}）`, type: 2, isLeaf: true })),
      ),
    ]
  })

  mock.onGet('/api/WeiXinWork/GetUserEntity').reply(config => {
    const params = config.params || {}
    const userId = params.userId as string
    const user = users.find(u => u.userId === userId)
    if (!user) return [404, makeResp('用户不存在', -1)]
    return [
      200,
      makeResp({
        name: user.name,
        userid: user.userId,
        mobile: '13800000000',
        department: user.wechat_DepId ? [Number(user.wechat_DepId)] : [],
        departmentNames: user.wechat_DepName ? [user.wechat_DepName] : [],
      }),
    ]
  })
}
