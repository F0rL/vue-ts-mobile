<script setup lang="ts">
import { ref } from 'vue'
import LoginLayout from './components/LoginLayout.vue'
import AccountLogin from './components/AccountLogin.vue'
import QrcodeLogin from './components/QrcodeLogin.vue'
import { config } from '@/config'

const activeTab = ref<'account' | 'qrcode'>('account')
</script>

<template>
  <div
    class="relative h-full overflow-hidden bg-linear-to-br from-blue-50 via-white to-slate-50 lg:flex"
  >
    <!-- Decorative elements -->
    <div
      class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.04)_1px,transparent_1px)] bg-[length:48px_48px]"
    />
    <div
      class="pointer-events-none absolute -left-32 top-1/4 h-125 w-125 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-32 h-100 w-100 rounded-full bg-cyan-400/10 blur-[100px]"
    />

    <!-- Left: Branding panel -->
    <section
      class="relative z-10 hidden h-full flex-col justify-between px-16 py-10 lg:flex lg:flex-1"
    >
      <div>
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20"
          >
            {{ config.APP_TITLE.slice(0, 1) }}
          </div>
          <span class="text-lg font-semibold text-slate-900">{{ config.APP_TITLE }}管理后台</span>
        </div>
      </div>
      <div class="max-w-md">
        <h1 class="text-[40px] font-bold leading-[1.15] tracking-tight text-slate-900">
          高效管理
          <span class="text-blue-600">后台系统</span>
        </h1>
        <p class="mt-4 text-base leading-relaxed text-slate-500">
          一站式管理平台，涵盖用户、权限、数据看板等功能模块，助力团队高效协作。
        </p>
      </div>

      <div class="flex items-center gap-6 text-sm text-slate-400">
        <span>&copy; {{ new Date().getFullYear() }}</span>
        <span class="h-3 w-px bg-slate-200" />
      </div>
    </section>

    <!-- Right: Login form panel -->
    <section
      class="relative z-10 flex items-center justify-center py-8 lg: lg:w-160 lg:bg-white lg:shadow"
    >
      <div class="w-full max-w-120">
        <LoginLayout v-model:active-tab="activeTab" />
        <div class="relative min-h-100">
          <div v-show="activeTab === 'account'">
            <AccountLogin @switch-to-qrcode="activeTab = 'qrcode'" />
          </div>
          <div v-show="activeTab === 'qrcode'">
            <QrcodeLogin @switch-to-account="activeTab = 'account'" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
