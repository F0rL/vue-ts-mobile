<script setup lang="ts">
import { useVModel } from '@vueuse/core'

interface Props {
  activeTab: 'account' | 'qrcode'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:activeTab': [value: 'account' | 'qrcode']
}>()

const activeTab = useVModel(props, 'activeTab', emit)
</script>

<template>
  <div class="w-full">
    <!-- Header -->
    <div class="text-center lg:text-left">
      <h1 class="text-2xl font-bold text-slate-900">欢迎回来</h1>
      <p class="mt-2 text-sm text-slate-500">登录您的账户以继续访问</p>
    </div>

    <!-- Tab switcher -->
    <div class="mt-8 relative flex w-full rounded-lg bg-slate-100 p-1">
      <!-- Sliding background indicator -->
      <div
        class="absolute top-1 left-1 z-0 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-blue-600 transition-transform duration-300 ease-out"
        :class="activeTab === 'qrcode' ? 'translate-x-full' : 'translate-x-0'"
      />
      <button
        type="button"
        class="relative z-10 flex flex-1 h-10 items-center justify-center gap-2 rounded-lg border-0 bg-transparent text-sm font-medium transition-colors duration-300 cursor-pointer select-none"
        :class="activeTab === 'account' ? 'text-white' : 'text-slate-500 hover:text-slate-700'"
        @click="activeTab = 'account'"
      >
        <IconRiUser3Line class="h-4 w-4 shrink-0" />
        <span>账号登录</span>
      </button>
      <button
        type="button"
        class="relative z-10 flex flex-1 h-10 items-center justify-center gap-2 rounded-lg border-0 bg-transparent text-sm font-medium transition-colors duration-300 cursor-pointer select-none"
        :class="activeTab === 'qrcode' ? 'text-white' : 'text-slate-500 hover:text-slate-700'"
        @click="activeTab = 'qrcode'"
      >
        <IconRiQrCodeLine class="h-4 w-4 shrink-0" />
        <span>扫码登录</span>
      </button>
    </div>
  </div>
</template>
