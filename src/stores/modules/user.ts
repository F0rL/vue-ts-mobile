import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchToken, fetchUserInfo, type LoginPayload, type UserInfo } from '@/api/auth'
import { encryptPwdRsa } from '@/utils/encrypt'

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

    const isLoggedIn = computed(() => !!token.value)
    const roles = computed(() => userInfo.value.roles)

    async function login(loginForm: LoginPayload) {
      const password = encryptPwdRsa(loginForm.password)
      const tokenStr = await fetchToken({ ...loginForm, password })
      token.value = tokenStr
    }

    async function loadUserInfo() {
      const user = await fetchUserInfo()
      userInfo.value = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        roles: user.roles,
      }
      return user
    }

    async function logout() {
      resetToken()
    }

    function resetToken() {
      token.value = ''
      userInfo.value = {
        id: '',
        name: '',
        avatar: '',
        roles: [],
      }
    }

    return {
      token,
      userInfo,
      isLoggedIn,
      roles,
      login,
      loadUserInfo,
      logout,
      resetToken,
    }
  },
  {
    persist: {
      pick: ['token', 'userInfo'],
    },
  },
)
