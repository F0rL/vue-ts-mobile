<script setup lang="ts">
import { reactive, ref, useTemplateRef, onMounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { message } from '@/utils/feedback'
import { useUserStore } from '@/stores/modules/user'
import { useRememberStore } from '@/stores/modules/remember'
import { md5Hash } from '@/utils/encrypt'
import { fetchCaptcha as fetchCaptchaApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const rememberStore = useRememberStore()

const formRef = useTemplateRef<FormInstance>('formRef')
const submitting = ref(false)
const rememberMe = ref(false)
const captchaImage = ref('')

const otpValidator = (value: string) => /^[0-9a-zA-Z]$/.test(value)

interface LoginForm {
  username: string
  password: string
  captchaCode: string
  captchaKey: string
}

const form = reactive<LoginForm>({
  username: '',
  password: '',
  captchaCode: '',
  captchaKey: '',
})

const rules = ref({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号长度不能少于 3 位', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
})

async function loadCaptcha() {
  const { base64, key } = await fetchCaptchaApi()
  captchaImage.value = 'data:image/png;base64,' + base64
  form.captchaKey = key
}

onMounted(async () => {
  // 默认不勾选；仅当存在未过期的已保存凭据时才恢复勾选并填充表单
  if (rememberStore.hasSaved) {
    const saved = rememberStore.load()
    if (saved) {
      rememberMe.value = true
      form.username = saved.username
      form.password = saved.password
    }
  }
  loadCaptcha().catch(() => {})
})

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    const verifyCode = md5Hash(form.captchaCode.toUpperCase())
    await userStore.login({
      username: form.username,
      password: form.password,
      verifyCode,
      verifyKey: form.captchaKey,
    })
    if (rememberMe.value) {
      rememberStore.save(form.username, form.password)
    } else {
      rememberStore.clear()
    }
    await userStore.loadUserInfo()
    message.success('登录成功')
    const redirectPath =
      typeof route.query.redirect === 'string' && route.query.redirect ? route.query.redirect : '/'
    await router.push(redirectPath)
  } catch (error) {
    console.error(error)
    loadCaptcha()
    form.captchaCode = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mt-6">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
      <el-form-item prop="username">
        <el-input v-model="form.username" :disabled="submitting" placeholder="请输入账号">
          <template #prefix>
            <el-icon><IconEpUser /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          :disabled="submitting"
          type="password"
          show-password
          placeholder="请输入密码"
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <el-icon><IconEpLock /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="captchaCode">
        <div class="flex gap-3">
          <el-input-otp
            v-model="form.captchaCode"
            :length="4"
            :disabled="submitting"
            :validator="otpValidator"
            inputmode="numeric"
            @finish="handleSubmit"
          />
          <div
            class="h-10 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200"
            @click="loadCaptcha"
          >
            <img
              v-if="captchaImage"
              :src="captchaImage"
              alt="验证码"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400"
            >
              加载中
            </div>
          </div>
        </div>
      </el-form-item>

      <div class="flex items-center justify-between">
        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        <!-- <button
          type="button"
          class="cursor-pointer border-0 bg-transparent text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          忘记密码？
        </button> -->
      </div>

      <el-button
        class="w-full mt-8"
        type="primary"
        size="large"
        :loading="submitting"
        @click="handleSubmit"
      >
        登&nbsp;&nbsp;录
      </el-button>
    </el-form>
  </div>
</template>

<style scoped></style>
