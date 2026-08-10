<template>
  <div class="select-icon">
    <el-popover
      v-model:visible="visible"
      placement="bottom-start"
      :width="420"
      trigger="click"
      :teleported="true"
    >
      <template #reference>
        <el-input
          :model-value="modelValue"
          readonly
          :placeholder="placeholder"
          class="cursor-pointer"
        >
          <template #prefix>
            <el-icon v-if="modelValue && iconMap[modelValue]" :size="16">
              <component :is="iconMap[modelValue]" />
            </el-icon>
          </template>
        </el-input>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Element Plus" name="ep">
          <el-scrollbar max-height="260px">
            <div class="icon-grid">
              <div
                v-for="key in epKeys"
                :key="key"
                :class="['icon-cell', { 'icon-cell--active': modelValue === key }]"
                :title="key"
                @click="select(key)"
              >
                <el-icon :size="20">
                  <component :is="iconMap[key]" />
                </el-icon>
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="RemixIcon" name="ri">
          <el-scrollbar max-height="260px">
            <div class="icon-grid">
              <div
                v-for="key in riKeys"
                :key="key"
                :class="['icon-cell', { 'icon-cell--active': modelValue === key }]"
                :title="key"
                @click="select(key)"
              >
                <el-icon :size="20">
                  <component :is="iconMap[key]" />
                </el-icon>
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import iconMap from '@/icons'
import epMap from '@/icons/ep'
import riMap from '@/icons/ri'

defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const visible = ref(false)
const activeTab = ref('ep')

const epKeys = Object.keys(epMap)
const riKeys = Object.keys(riMap)

function select(key: string) {
  emit('update:modelValue', key)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.select-icon {
  display: inline-block;
  width: 100%;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  gap: 4px;
}

.icon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  transition: all 0.15s;

  &:hover {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &--active {
    background-color: #ecf5ff;
    color: #409eff;
    outline: 2px solid #409eff;
    outline-offset: -2px;
  }
}
</style>
