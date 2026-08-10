<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="flex flex-col items-center text-center px-4">
      <img :src="errorSvg" class="h-[200px] w-auto object-contain mb-6" alt="错误" />
      <h2 class="text-2xl font-bold text-gray-800 mb-1">{{ displayTitle }}</h2>
      <p class="text-base text-gray-500 mb-6">{{ displayMessage }}</p>
      <div class="flex gap-3">
        <van-button round type="primary" @click="goHome">返回首页</van-button>
        <van-button round plain type="primary" @click="goBack">返回上一页</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import errorSvg from '@/assets/img/error.svg?url'

const route = useRoute()
const router = useRouter()

const statusMap: Record<string, { title: string; message: string }> = {
  '401': { title: '未授权', message: '登录已过期，请重新登录' },
  '403': { title: '没有权限', message: '抱歉，您没有权限访问此页面' },
  '404': { title: '页面不存在', message: '抱歉，您访问的页面不存在' },
  '500': { title: '服务器错误', message: '服务器内部错误，请稍后重试' },
  BusinessError: { title: '操作失败', message: '发生未知错误，请稍后重试' },
  NetworkError: { title: '网络错误', message: '网络连接失败，请检查网络后重试' },
}

const status = computed(() => (route.query.status as string) || '404')

const defaultInfo = computed(() => statusMap[status.value] || statusMap['404'])

const displayTitle = computed(() => route.query.title || defaultInfo.value.title)

const displayMessage = computed(() => route.query.message || defaultInfo.value.message)

function goHome() {
  router.push('/')
}

function goBack() {
  router.go(-1)
}
</script>
