import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { config } from '@/config'

const NS = config.STORAGE_NS

if (!NS) console.warn('[stores] STORAGE_NS 未配置，存在 key 冲突风险')

const storageKey = (name: string): string => `${NS}:${name}`

const pinia = createPinia()
pinia.use(
  createPersistedState({
    key: (id: string) => storageKey(id),
  }),
)

export default pinia
