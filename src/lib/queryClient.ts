import { QueryClient } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * 数据过期时间（0 = 立即过期）。
       * 配合默认 `refetchOnMount`（组件挂载时若缓存已过期则重新请求），
       * 保证每次进入页面 / 分页切换回旧 key 时都会重新拉取最新数据；
       * 缓存仅作为"请求前展示旧数据"的过渡，不会让数据长期停留在快照。
       */
      staleTime: 0,
      /** 缓存保留时长：请求结果在内存中保留 5 分钟，超出后若再次使用需重新请求 */
      gcTime: 5 * 60 * 1000,
      /** 请求失败自动重试 1 次（网络抖动等瞬时错误场景） */
      retry: 1,
      /**
       * 窗口重新聚焦时不自动重取。
       * 避免切回浏览器标签页触发一堆无谓请求；如需聚焦刷新可在具体 useQuery 上单独开启。
       */
      refetchOnWindowFocus: false,
    },
    mutations: {
      /** 写操作（增删改）失败不重试，避免幂等性不确定的操作重复执行 */
      retry: 0,
    },
  },
})
