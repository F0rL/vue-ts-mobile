import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { encryptText, decryptText } from '@/utils/encrypt'

// 7 days in milliseconds
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

// 业务专属 passphrase，与通用加解密方法配合使用
const PASSPHRASE = 'admin-remember-key'

interface StoredCredentials {
  username: string
  password: string
  expiry: number
}

export const useRememberStore = defineStore(
  'remember',
  () => {
    // 持久化的是密文字符串，localStorage 中不会出现明文密码
    const cipherText = ref('')

    const hasSaved = computed(() => !!cipherText.value)

    /**
     * 读取已保存的账号密码，过期或损坏时自动清理。
     */
    function load(): { username: string; password: string } | null {
      if (!cipherText.value) return null
      try {
        const data: StoredCredentials = JSON.parse(decryptText(cipherText.value, PASSPHRASE))
        if (Date.now() > data.expiry) {
          clear()
          return null
        }
        return { username: data.username, password: data.password }
      } catch {
        clear()
        return null
      }
    }

    /**
     * 保存账号密码到本地（带过期时间）。
     * 登录成功时调用会刷新过期时间。
     */
    function save(username: string, password: string): void {
      const data: StoredCredentials = {
        username,
        password,
        expiry: Date.now() + EXPIRY_MS,
      }
      cipherText.value = encryptText(JSON.stringify(data), PASSPHRASE)
    }

    /**
     * 清除已保存的账号密码。
     */
    function clear(): void {
      cipherText.value = ''
    }

    return { cipherText, hasSaved, load, save, clear }
  },
  {
    persist: {
      pick: ['cipherText'],
    },
  },
)
