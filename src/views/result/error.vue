<template>
  <div class="ex-container">
    <img :src="errorSvg" class="h-[300px] w-auto object-contain" alt="错误" />
    <div class="ml-10">
      <div class="text-2xl text-text-5 font-bold">{{ displayTitle }}</div>
      <div class="mt-1 mb-6 text-base text-text-3">{{ displayMessage }}</div>
      <el-space>
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </el-space>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import errorSvg from '@/assets/img/error.svg?url'

const route = useRoute()
const router = useRouter()

const statusMap = {
  '401': { title: '未授权', message: '登录已过期，请重新登录' },
  '403': { title: '没有权限', message: '抱歉，您没有权限访问此页面' },
  '404': { title: '页面不存在', message: '抱歉，您访问的页面不存在' },
  '500': { title: '服务器错误', message: '服务器内部错误，请稍后重试' },
  'BusinessError': { title: '操作失败', message: '发生未知错误，请稍后重试' },
  'NetworkError': { title: '网络错误', message: '网络连接失败，请检查网络后重试' },
}

const status = computed(() => route.query.status || '404')

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

<style scoped lang="scss">
.ex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}
</style>
