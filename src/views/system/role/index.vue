<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/vue-query'
import ProTable from '@/components/ProTable/index.vue'
import type { ProTableColumn } from '@/components/ProTable/index.vue'
import { fetchRoleList, deleteRole, roleKeys, type RoleListItem } from '@/api/role'
import { confirm, message, withLoading } from '@/utils/feedback'
import RoleForm from './components/RoleForm.vue'

const queryClient = useQueryClient()

const pageIndex = ref(1)
const pageSize = ref(10)
const roleFormRef = useTemplateRef('roleFormRef')

const {
  data: listRes,
  isFetching: loading,
} = useQuery({
  queryKey: [...roleKeys.lists(), pageIndex, pageSize],
  queryFn: () => fetchRoleList({ pageIndex: pageIndex.value, pageSize: pageSize.value }),
  placeholderData: keepPreviousData,
})

const tableData = computed(() => listRes.value?.items ?? [])
const total = computed(() => listRes.value?.total ?? 0)

const columns: ProTableColumn<RoleListItem>[] = [
  { type: 'index', label: '序号', width: 80, align: 'center' },
  { prop: 'name', label: '角色名称', minWidth: 160 },
  { label: '操作', width: 160, align: 'center', fixed: 'right', slot: 'action' },
]

function isSystemRole(id: string): boolean {
  return id === '10086'
}

/** 打开新增角色抽屉 */
function handleAdd() {
  roleFormRef.value?.open()
}

/** 打开编辑角色抽屉 */
function handleEdit(row: any) {
  roleFormRef.value?.open(row)
}

/** 删除角色 */
async function handleDelete(row: any) {
  const ok = await confirm(`确定删除角色「${row.name}」？`, '删除确认', {
    type: 'error',
    confirmButtonText: '删除',
  })
  if (!ok) return
  await withLoading(deleteRole({ ids: [row.id] }), '删除中...')
  message.success('删除成功')
  await queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
}

function handleSuccess() {
  queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
}
</script>

<template>
  <div class="space-y-4">
    <div class="p-4 rounded bg-white shadow-sm">
      <div class="flex items-center mb-4">
        <el-button type="primary" @click="handleAdd">
          <template #icon><IconEpPlus /></template>
          新增
        </el-button>
      </div>
      <ProTable
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :total="total"
        paginated
      >
        <template #action="{ row }">
          <el-tooltip v-if="isSystemRole(row.id)" content="系统内置，不可编辑" placement="top">
            <el-button type="primary" link disabled>编辑</el-button>
          </el-tooltip>
          <el-button v-else type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
          <el-tooltip v-if="isSystemRole(row.id)" content="系统内置，不可删除" placement="top">
            <el-button type="danger" link disabled>删除</el-button>
          </el-tooltip>
          <el-button v-else type="danger" link @click="handleDelete(row)"> 删除 </el-button>
        </template>
      </ProTable>
    </div>
    <RoleForm ref="roleFormRef" @success="handleSuccess" />
  </div>
</template>
