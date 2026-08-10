<script setup lang="ts">
import { useAppStore } from '@/stores/modules/app'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()
</script>

<template>
  <div
    class="h-14 px-2 flex items-center justify-center bg-white overflow-hidden transition-all duration-300 cursor-pointer"
    @click="router.push('/')"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="w-8 h-8 shrink-0 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md"
      >
        <span class="text-white font-bold text-sm">A</span>
      </div>
      <span
        v-show="!appStore.sidebarIconOnly"
        class="text-base font-semibold text-slate-700 whitespace-nowrap"
      >
        Admin
      </span>
    </div>
  </div>
</template>
