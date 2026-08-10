<script setup lang="ts">
defineEmits<{
  switchToAccount: []
}>()
</script>

<template>
  <div class="mt-6">
    <div
      class="mx-auto flex aspect-square w-full max-w-55 items-center justify-center rounded-2xl bg-slate-50 p-5"
    >
      <div class="qrcode-placeholder" />
    </div>

    <p class="mt-5 text-center text-sm text-slate-400">
      打开企业微信或移动端管理应用扫码
    </p>
  </div>

  <div class="mt-8 text-center">
    <button
      type="button"
      class="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent text-sm font-medium text-blue-600 transition hover:text-blue-700"
      @click="$emit('switchToAccount')"
    >
      <el-icon><IconEpArrowLeft /></el-icon>
      返回账号登录
    </button>
  </div>
</template>

<style scoped>
.qrcode-placeholder {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  border-radius: 16px;
  background:
    linear-gradient(90deg, #0f172a 10px, transparent 10px),
    linear-gradient(#0f172a 10px, transparent 10px),
    linear-gradient(135deg, #1e293b 0%, #2563eb 100%);
  background-position: 0 0, 0 0, 0 0;
  background-size: 22px 22px, 22px 22px, 100% 100%;
  box-shadow: inset 0 0 0 14px #fff;
}

.qrcode-placeholder::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 16px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 8px solid #fff;
  background: rgba(255, 255, 255, 0.4);
}

.qrcode-placeholder::after {
  content: '';
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 8px solid #fff;
  background: rgba(255, 255, 255, 0.4);
}
</style>
