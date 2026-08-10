<template>
  <router-view />
  <VueQueryDevtools v-if="showDevtools" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const showDevtools = import.meta.env.VITE_APP_ENABLE_DEVTOOLS === 'true'

// 动态导入：showDevtools 为 false 时该 chunk 不生成，生产构建不打包 devtools
const VueQueryDevtools = showDevtools
  ? defineAsyncComponent(
      () => import('@tanstack/vue-query-devtools').then((m) => m.VueQueryDevtools),
    )
  : null
</script>
