import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface UserInfo {
  id: string
  name: string
  avatar: string
  roles: string[]
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref<UserInfo>({
      id: '',
      name: '',
      avatar: '',
      roles: [],
    })

    const resetToken = () => {
      token.value = ''
    }

    return {
      token,
      userInfo,
      resetToken,
    }
  },
  {
    persist: {
      pick: ['token', 'userInfo'],
    },
  },
)
