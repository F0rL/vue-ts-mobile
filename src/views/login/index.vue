<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from '@/utils/feedback'
import { useUserStore } from '@/stores/modules/user'
import { fetchTokenByUserId } from '@/api/weiXinWork'
import { fetchUserInfo } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = reactive({
  userid: '',
  pwd: 'F1D3A718-67BF-4FBB-8BD7-3A1A6C7684A4',
})

const submitting = ref(false)

/** 提交登录：换取 token → 拉取当前用户 → 跳转 */
async function onSubmit() {
  submitting.value = true
  try {
    const { data: token } = await fetchTokenByUserId(form)
    userStore.token = token
    const { data: info } = await fetchUserInfo()
    userStore.userInfo = info
    message.success('登录成功')
    const redirectPath =
      typeof route.query.redirect === 'string' && route.query.redirect
        ? route.query.redirect
        : '/'
    await router.push(redirectPath)
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-[320px]">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.userid"
            name="userid"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请填写用户名' }]"
          />
        </van-cell-group>
        <div class="mt-8 px-4">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="submitting"
          >
            登 录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped></style>
