<template>
  <div class="flex-1 overflow-x-hidden transition-all duration-300" :class="isCollapse ? 'w-16' : 'w-56'">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        :unique-opened="true"
        router
        background-color="transparent"
        text-color="#475569"
        active-text-color="#2563eb"
      >
        <SidebarItem
          v-for="item in menuData"
          :key="item.id"
          :item="item"
        />
      </el-menu>
    </el-scrollbar>
  </div>

  <!-- collapse toggle -->
  <div class="flex items-center justify-start px-5 py-2 cursor-pointer transition-colors">
    <div
      class="flex items-center justify-center p-1 bg-gray-100 hover:bg-gray-200 rounded-md"
      @click="appStore.toggleSidebarIconOnly()"
    >
      <el-icon :size="16">
        <IconEpDArrowRight v-if="isCollapse" />
        <IconEpDArrowLeft v-else />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import type { MenuItem } from '@/router/utils/filter'
import { usePermissionStore } from '@/stores/modules/permission'
import SidebarItem from './SidebarItem.vue'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const isCollapse = computed(() => appStore.sidebarIconOnly)

const activeMenu = computed(() => (route.meta?.activeMenu as string) || route.path)

const menuData = computed(() =>
  permissionStore.menuData.filter((item: MenuItem) => item.isMenuShow !== false),
)
</script>

<style scoped>
:deep(.el-menu) {
  border-right: none;
}
:deep(.el-menu-item.is-active) {
  background-color: #eff6ff !important;
  border-right: 3px solid #2563eb;
}
:deep(.el-menu-item:hover) {
  background-color: #f1f5f9 !important;
}
</style>
