import type MockAdapter from 'axios-mock-adapter'
import { makeResp } from '../utils'

let idCounter = 100

function genId(): string {
  idCounter++
  return String(idCounter)
}

interface MockMenu {
  id: string
  title: string
  path?: string
  icon?: string
  order: number
  createTime: string
  isMenuShow: boolean
  _disabled: boolean
  parentId: string | null
}

let menus: MockMenu[] = [
  { id: '1', title: '首页', path: 'dashboard', icon: 'ep:home-filled', order: 1, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: false, parentId: null },
  { id: '2', title: '系统设置', icon: 'ep:setting', order: 2, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: null },
  { id: '3', title: '菜单管理', path: 'sys-menu-list', icon: 'ep:menu', order: 1, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: '2' },
  { id: '4', title: '角色管理', path: 'sys-role-list', icon: 'ri:shield-user-line', order: 2, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: '2' },
  { id: '5', title: '账户管理', path: 'sys-user-list', icon: 'ep:user', order: 3, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: '2' },
  { id: '6', title: '组织架构', path: 'sys-org-list', icon: 'ep:list', order: 4, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: '2' },
  { id: '7', title: '日志管理', path: 'sys-log-list', icon: 'ep:document', order: 5, createTime: '2024-07-04 13:49:00', isMenuShow: true, _disabled: true, parentId: '2' },
]

function buildTree(items: MockMenu[]): unknown[] {
  const map = new Map<string, unknown>()
  const roots: unknown[] = []

  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of items) {
    const node = map.get(item.id)
    if (item.parentId && map.has(item.parentId)) {
      ;(map.get(item.parentId) as any).children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

function buildFlatList(items: MockMenu[], searchKey?: string): unknown[] {
  let filtered = items
  if (searchKey) {
    const kw = searchKey.toLowerCase()
    filtered = items.filter(
      (m) => m.title.toLowerCase().includes(kw) || (m.path || '').toLowerCase().includes(kw),
    )
  }
  return filtered.map((m) => ({ ...m, parent: m.parentId ? { id: m.parentId } : null }))
}

function toEntity(item: MockMenu): unknown {
  return {
    ...item,
    parent: item.parentId ? { id: item.parentId } : null,
  }
}

export function registerSysMenuMock(mock: MockAdapter) {
  mock.onPost('/api/SysMenu/GetUserRightMenu').reply(() => {
    const tree = buildTree(menus.filter((m) => m.isMenuShow))
    return [200, makeResp(tree, 0, tree.length)]
  })

  mock.onGet('/api/SysMenu/GetMenuTree').reply((config) => {
    const params = config.params || {}
    const searchKey = params.searchKey as string | undefined
    let filtered = menus
    if (searchKey) {
      const kw = searchKey.toLowerCase()
      filtered = menus.filter(
        (m) => m.title.toLowerCase().includes(kw) || (m.path || '').toLowerCase().includes(kw),
      )
    }
    const tree = buildTree(filtered)
    return [200, makeResp(tree, 0, tree.length)]
  })

  mock.onGet('/api/SysMenu/GetMenuList').reply((config) => {
    const params = config.params || {}
    const list = buildFlatList(menus, params.searchKey as string | undefined)
    return [200, makeResp(list, 0, list.length)]
  })

  mock.onGet('/api/SysMenu/GetMenuEntity').reply((config) => {
    const params = config.params || {}
    const id = params.id as string
    const item = menus.find((m) => m.id === id)
    if (!item) return [404, makeResp('菜单不存在', -1)]
    return [200, makeResp(toEntity(item))]
  })

  mock.onGet('/api/SysMenu/GetParentMenuAll').reply(() => {
    const list = menus.map((m) => ({ id: m.id, title: m.title }))
    return [200, makeResp(list)]
  })

  mock.onPost('/api/SysMenu/CreateMenu').reply((config) => {
    const data = JSON.parse(config.data)
    const item: MockMenu = {
      id: genId(),
      title: data.title || '',
      path: data.path || '',
      icon: data.icon || '',
      order: data.order ?? 99,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      isMenuShow: data.isMenuShow ?? true,
      _disabled: false,
      parentId: data.parentId || null,
    }
    menus.push(item)
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysMenu/UpdateMenu').reply((config) => {
    const data = JSON.parse(config.data)
    const idx = menus.findIndex((m) => m.id === data.id)
    if (idx === -1) return [404, makeResp('菜单不存在', -1)]
    menus[idx] = {
      id: data.id,
      title: data.title || '',
      path: data.path || '',
      icon: data.icon || '',
      order: data.order ?? 99,
      createTime: menus[idx].createTime,
      isMenuShow: data.isMenuShow ?? true,
      _disabled: menus[idx]._disabled,
      parentId: data.parentId || null,
    }
    return [200, makeResp(null)]
  })

  mock.onPost('/api/SysMenu/DeleteMenu').reply((config) => {
    const data = JSON.parse(config.data)
    const ids: string[] = data.ids || []
    const systemMenu = menus.find((m) => ids.includes(m.id) && m._disabled)
    if (systemMenu) {
      return [200, makeResp(`系统菜单「${systemMenu.title}」不可删除`, -1)]
    }
    menus = menus.filter((m) => !ids.includes(m.id))
    return [200, makeResp(null)]
  })
}
