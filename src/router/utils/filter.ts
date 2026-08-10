import type { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
  id: string
  title: string
  icon?: string
  path?: string
  status?: number
  isMenuShow?: boolean
  children?: MenuItem[]
}

export function collectMenuPaths(menuTree: MenuItem[]): Set<string> {
  const paths = new Set<string>()
  function walk(nodes: MenuItem[]) {
    for (const node of nodes) {
      if (node.path) paths.add(node.path)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(menuTree)
  return paths
}

export function filterRoutes(
  routes: RouteRecordRaw[],
  allowedPaths: Set<string>,
): RouteRecordRaw[] {
  return routes
    .filter(route => allowedPaths.has(route.path))
    .map((route) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { redirect, ...rest } = route
      return rest as RouteRecordRaw
    })
}

export function getFirstVisiblePath(menuTree: MenuItem[]): string | null {
  for (const node of menuTree) {
    if (node.isMenuShow === false) continue
    if (node.children?.length) {
      const first = getFirstVisiblePath(node.children)
      if (first) return first
    }
    if (node.path) return node.path
  }
  return null
}
