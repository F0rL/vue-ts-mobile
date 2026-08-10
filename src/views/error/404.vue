<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <van-empty image="error" description="抱歉，您访问的页面不存在">
      <van-button round type="primary" @click="$router.push('/')">返回首页</van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
</script>
