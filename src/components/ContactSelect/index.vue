<script setup lang="ts">
import { ref, computed } from 'vue'
import { fetchOrgTree, type OrgTreeNode } from '@/api/work'

interface SelectedItem {
  id: string
  name: string
  type: number
}

interface OpenOptions {
  selectType?: 'user' | 'dept' | 'all'
  selectNum?: 'min' | 'max'
  selected?: SelectedItem[]
}

const visible = ref(false)
const selectType = ref<'user' | 'dept' | 'all'>('all')
const selectNum = ref<'min' | 'max'>('max')
const searchKey = ref('')
const treeKey = ref(0)
const selectedMap = ref<Map<string, SelectedItem>>(new Map())
const resolvePromise = ref<((value: SelectedItem[] | null) => void) | null>(null)

const selectedList = computed(() => Array.from(selectedMap.value.values()))

const treeType = computed(() => {
  if (selectType.value === 'user') return 2
  if (selectType.value === 'dept') return 1
  return 0
})

function isSelectable(data: OrgTreeNode): boolean {
  if (selectType.value === 'all') return true
  if (selectType.value === 'user') return data.type === 2
  return data.type === 1
}

function toggleSelected(data: OrgTreeNode): void {
  if (!isSelectable(data)) return

  const key = `${data.type}-${data.id}`
  const item: SelectedItem = { id: data.id, name: data.name, type: data.type }

  if (selectNum.value === 'min') {
    selectedMap.value = new Map([[key, item]])
    return
  }

  const next = new Map(selectedMap.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.set(key, item)
  }
  selectedMap.value = next
}

function isSelected(data: OrgTreeNode): boolean {
  return selectedMap.value.has(`${data.type}-${data.id}`)
}

function removeSelected(item: SelectedItem): void {
  const next = new Map(selectedMap.value)
  next.delete(`${item.type}-${item.id}`)
  selectedMap.value = next
}

async function loadTree(node: any, resolve: (data: OrgTreeNode[]) => void): Promise<void> {
  const params: { departmentId: number; searchKey?: string; type: number } = {
    departmentId: node.level === 0 ? 0 : Number(node.data.id),
    type: treeType.value,
  }
  if (node.level === 0) {
    params.searchKey = searchKey.value
  }
  const data = await fetchOrgTree(params)
  resolve(data)
}

function handleNodeClick(data: OrgTreeNode): void {
  toggleSelected(data)
}

function handleSearch(): void {
  treeKey.value += 1
}

function handleClear(): void {
  searchKey.value = ''
  treeKey.value += 1
}

function handleRemoveFromTree(event: MouseEvent, item: SelectedItem): void {
  event.stopPropagation()
  removeSelected(item)
  treeKey.value += 1
}

/** 打开选人弹窗 */
function open(options?: OpenOptions): Promise<SelectedItem[] | null> {
  selectType.value = options?.selectType ?? 'all'
  selectNum.value = options?.selectNum ?? 'max'
  searchKey.value = ''
  selectedMap.value = new Map(
    (options?.selected ?? []).map(item => [`${item.type}-${item.id}`, item]),
  )
  treeKey.value += 1
  visible.value = true

  return new Promise(resolve => {
    resolvePromise.value = resolve
  })
}

function handleClose(): void {
  visible.value = false
  resolvePromise.value?.(null)
  resolvePromise.value = null
}

function handleConfirm(): void {
  visible.value = false
  resolvePromise.value?.(selectedList.value)
  resolvePromise.value = null
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="visible"
    title="组织架构"
    width="720px"
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClose"
  >
    <div class="flex h-[55vh]">
      <div class="flex w-2/3 shrink-0 flex-col overflow-hidden border-r border-border-lighter pr-4">
        <div class="mb-3 shrink-0">
          <el-input
            v-model="searchKey"
            placeholder="搜索姓名、工号"
            clearable
            size="default"
            @clear="handleClear"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <IconEpSearch class="text-text-secondary" />
            </template>
          </el-input>
        </div>
        <div class="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <el-tree
            :key="treeKey"
            node-key="id"
            :props="{ label: 'name', children: 'children', isLeaf: 'isLeaf' }"
            :load="loadTree"
            lazy
            highlight-current
            :indent="18"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <div
                class="flex h-full min-w-0 flex-1 items-center"
                :class="!isSelectable(data) ? 'cursor-not-allowed' : ''"
              >
                <span
                  class="mr-2 flex shrink-0 items-center text-base"
                  :class="!isSelectable(data) ? 'text-gray-300' : 'text-primary'"
                >
                  <IconEpOfficeBuilding v-if="data.type === 1" />
                  <IconEpAvatar v-else />
                </span>
                <span
                  class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                  :class="!isSelectable(data) ? 'text-gray-400' : 'text-text-primary'"
                >
                  {{ data.name }}
                </span>
                <IconEpCheck
                  v-if="isSelected(data)"
                  class="ml-1.5 shrink-0 text-base text-primary"
                />
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col overflow-hidden pl-4">
        <div class="mb-3 flex shrink-0 items-center gap-1.5 text-sm font-semibold">
          已选择
          <span
            v-if="selectedList.length"
            class="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium leading-none text-white"
          >
            {{ selectedList.length }}
          </span>
        </div>
        <ul class="scroll-thin m-0 flex-1 list-none overflow-y-auto p-0">
          <li
            v-for="item in selectedList"
            :key="`${item.type}-${item.id}`"
            class="mb-0.5 flex items-center justify-between rounded-md px-2.5 py-2 transition-colors hover:bg-fill-light"
          >
            <div class="flex min-w-0 flex-1 items-center">
              <span class="mr-2 flex shrink-0 items-center text-[15px] text-primary">
                <IconEpOfficeBuilding v-if="item.type === 1" />
                <IconEpAvatar v-else />
              </span>
              <span
                class="mr-2 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-text-primary"
              >
                {{ item.name }}
              </span>
              <span
                class="shrink-0 rounded bg-primary-light-9 px-1.5 py-0.5 text-[11px] text-primary"
              >
                {{ item.type === 1 ? '部门' : '人员' }}
              </span>
            </div>
            <IconEpClose
              class="shrink-0 cursor-pointer rounded p-0.5 text-sm text-text-placeholder transition-colors hover:bg-danger-light-9 hover:text-danger"
              @click="(e: MouseEvent) => handleRemoveFromTree(e, item)"
            />
          </li>
          <li
            v-if="!selectedList.length"
            class="py-8 text-center text-[13px] text-text-placeholder"
          >
            暂无选择
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
:deep(.el-tree) {
  background: transparent;

  .el-tree-node__content {
    height: 36px;
    border-radius: 6px;
    margin: 1px 0;
    padding-right: 8px;
  }
}
</style>
