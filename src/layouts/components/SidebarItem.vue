<template>
  <!-- Single child or no children -->
  <el-menu-item v-if="!hasVisibleChildren" :index="`/${item.path}`">
    <el-icon v-if="resolvedIcon">
      <component :is="iconMap[resolvedIcon]" />
    </el-icon>
    <template #title>
      <span class="font-medium">{{ item.title }}</span>
    </template>
  </el-menu-item>

  <!-- Has children -->
  <el-sub-menu v-else :index="item.path || item.id">
    <template #title>
      <el-icon v-if="resolvedIcon">
        <component :is="iconMap[resolvedIcon]" />
      </el-icon>
      <span class="font-medium">{{ item.title }}</span>
    </template>
    <SidebarItem
      v-for="child in visibleChildren"
      :key="child.id"
      :item="child"
    />
  </el-sub-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import iconMap from '@/icons'
import type { MenuItem } from '@/router/utils/filter'
import SidebarItem from './SidebarItem.vue'

const props = defineProps<{
  item: MenuItem
}>()

const resolvedIcon = computed(() => props.item.icon || null)

const visibleChildren = computed(() =>
  (props.item.children || []).filter(c => c.isMenuShow !== false),
)

const hasVisibleChildren = computed(() => visibleChildren.value.length > 0)
</script>
