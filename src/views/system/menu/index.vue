<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import ProTable from '@/components/ProTable/index.vue'
import type { ProTableColumn } from '@/components/ProTable/index.vue'
import iconMap from '@/icons'
import {
  fetchMenuTree,
  fetchMenuEntity,
  updateMenu,
  deleteMenu,
  menuKeys,
  type MenuTreeNode,
} from '@/api/menu'
import { usePermissionStore } from '@/stores/modules/permission'
import { confirm, message, withLoading } from '@/utils/feedback'
import MenuForm from './components/MenuForm.vue'

const queryClient = useQueryClient()
const permissionStore = usePermissionStore()

const searchKey = ref('')
const switchingId = ref('')
const proTableRef = useTemplateRef('proTableRef')
const menuFormRef = useTemplateRef('menuFormRef')

const {
  data: treeData,
  isPending: loading,
  refetch,
} = useQuery({
  queryKey: menuKeys.trees(),
  queryFn: () => fetchMenuTree(searchKey.value ? { searchKey: searchKey.value } : undefined),
})

const toggleShowMutation = useMutation({
  mutationFn: async ({ rowId, val }: { rowId: string; val: boolean }) => {
    const entity = await fetchMenuEntity(rowId)
    if (!entity) throw new Error()
    await updateMenu({
      id: rowId,
      title: entity.title || '',
      path: entity.path || '',
      icon: entity.icon || '',
      order: entity.order ?? 99,
      isMenuShow: val,
      parentId: entity.parent?.id ?? null,
    })
  },
  onMutate: ({ rowId }) => {
    switchingId.value = rowId
  },
  onSuccess: () => onMenuChanged(),
  onError: () => {
    message.error('操作失败')
  },
  onSettled: () => {
    switchingId.value = ''
  },
})

const columns: ProTableColumn<MenuTreeNode>[] = [
  { prop: 'title', label: '菜单标题', minWidth: 160 },
  { prop: 'path', label: '路由路径', minWidth: 140 },
  { label: '图标', width: 80, align: 'center', slot: 'icon' },
  { label: '侧边栏展示', width: 130, align: 'center', slot: 'show' },
  { prop: 'order', label: '排序号', width: 80, align: 'center' },
  { label: '操作', width: 160, align: 'center', fixed: 'right', slot: 'action' },
]

/** 菜单数据变更后刷新侧边栏导航 + 表格数据 */
async function onMenuChanged() {
  await permissionStore.refreshMenu()
  await queryClient.invalidateQueries({ queryKey: menuKeys.trees() })
}

function toggleRows(rows: MenuTreeNode[], expanded: boolean) {
  rows.forEach(row => {
    proTableRef.value?.elTableRef?.toggleRowExpansion(row, expanded)
    if (row.children?.length) {
      toggleRows(row.children, expanded)
    }
  })
}

function handleSearch() {
  refetch()
}

function handleReset() {
  searchKey.value = ''
}

function handleExpandAll() {
  toggleRows(treeData.value ?? [], true)
}

function handleCollapseAll() {
  toggleRows(treeData.value ?? [], false)
}

/** 打开新增菜单抽屉 */
function openCreate() {
  menuFormRef.value?.open()
}

/** 打开编辑菜单抽屉 */
function openEdit(row: any) {
  menuFormRef.value?.open(row)
}

function handleSuccess() {
  onMenuChanged()
}

/** 切换侧边栏展示状态 */
async function handleToggleShow(row: any, val: boolean) {
  toggleShowMutation.mutate({ rowId: row.id, val })
}

/** 删除菜单 */
async function handleDelete(row: any) {
  if (row._disabled) return
  const ok = await confirm(`确定删除菜单「${row.title}」？`, '删除确认', {
    type: 'error',
    confirmButtonText: '删除',
  })
  if (!ok) return
  await withLoading(deleteMenu({ ids: [row.id] }), '删除中...')
  message.success('删除成功')
  await onMenuChanged()
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded bg-white p-5 shadow-sm">
      <div class="flex items-center">
        <el-input
          class="w-60!"
          v-model="searchKey"
          placeholder="搜索菜单名称或路由"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button class="ml-3" type="primary" @click="handleSearch">
          <template #icon><IconEpSearch /></template>
          查询
        </el-button>
        <el-button @click="handleReset">
          <template #icon><IconEpRefresh /></template>
          重置
        </el-button>
      </div>
    </div>

    <div class="p-4 rounded bg-white shadow-sm">
      <div class="flex items-center mb-4">
        <el-button type="primary" @click="openCreate">
          <template #icon><IconEpPlus /></template>
          新增
        </el-button>
        <el-button @click="handleExpandAll">
          <template #icon><IconRiExpandVerticalLine /></template>
          展开全部
        </el-button>
        <el-button @click="handleCollapseAll">
          <template #icon><IconRiCollapseVerticalLine /></template>
          收起全部
        </el-button>
      </div>
      <ProTable
        ref="proTableRef"
        :columns="columns"
        :data="treeData"
        :loading="loading"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <template #icon="{ row }">
          <el-icon v-if="row.icon && iconMap[row.icon]" :size="18">
            <component :is="iconMap[row.icon]" />
          </el-icon>
          <span v-else class="text-xs text-gray-400">-</span>
        </template>
        <template #show="{ row }">
          <el-switch
            :model-value="row.isMenuShow !== false"
            :loading="switchingId === row.id"
            @change="(val: boolean) => handleToggleShow(row, val)"
          />
        </template>
        <template #action="{ row }">
          <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" link :disabled="row._disabled" @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </ProTable>
    </div>

    <MenuForm ref="menuFormRef" @success="handleSuccess" />
  </div>
</template>

<style lang="scss" scoped></style>
