import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { storageKey } from '@/utils/storage'

const pinia = createPinia()
pinia.use(
  createPersistedState({
    key: (id: string) => storageKey(id),
  }),
)

export default pinia
