<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/vue-query'
import ProTable from '@/components/ProTable/index.vue'
import type { ProTableColumn } from '@/components/ProTable/index.vue'
import { fetchUserList, deleteUser, userKeys, type UserListItem } from '@/api/user'
import { confirm, message, withLoading } from '@/utils/feedback'
import UserForm from './components/UserForm.vue'

const queryClient = useQueryClient()

const searchKey = ref('')
const pageIndex = ref(1)
const pageSize = ref(10)
const selectedRows = ref<UserListItem[]>([])
const userFormRef = useTemplateRef('userFormRef')

const {
  data: listRes,
  isFetching: loading,
  refetch,
} = useQuery({
  queryKey: [...userKeys.lists(), pageIndex, pageSize, searchKey],
  queryFn: () =>
    fetchUserList({
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      searchKey: searchKey.value || undefined,
    }),
  placeholderData: keepPreviousData,
})

const tableData = computed(() => listRes.value?.items ?? [])
const total = computed(() => listRes.value?.total ?? 0)

const columns: ProTableColumn<UserListItem>[] = [
  {
    type: 'selection',
    width: 55,
    align: 'center',
    selectable: (row: UserListItem) => !row._disabled,
  },
  { prop: 'id', label: '账号', align: 'center' },
  { prop: 'name', label: '姓名' },
  { label: '头像', align: 'center', slot: 'avatar' },
  { label: '状态', align: 'center', slot: 'status' },
  { label: '角色', slot: 'roles' },
  { label: '操作', width: 160, align: 'center', fixed: 'right', slot: 'action' },
]

/** 删除单个或批量账户 */
async function handleDelete(ids: string[], name?: string) {
  const tip = name ? `确定删除账户「${name}」？` : `确定删除选中的 ${ids.length} 个账户？`
  const ok = await confirm(tip, '删除确认', {
    type: 'error',
    confirmButtonText: '删除',
  })
  if (!ok) return
  await withLoading(deleteUser({ ids }), '删除中...')
  message.success('删除成功')
  await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
  selectedRows.value = []
}

function handleSearch() {
  pageIndex.value = 1
  refetch()
}

function handleReset() {
  searchKey.value = ''
  pageIndex.value = 1
  refetch()
}

function handleSelectionChange(rows: UserListItem[]) {
  selectedRows.value = rows
}

/** 新增账户 */
function handleAdd() {
  userFormRef.value?.open()
}

/** 批量删除账户 */
function handleBatchDelete() {
  if (!selectedRows.value.length) {
    message.warning('请先勾选要删除的账户')
    return
  }
  handleDelete(selectedRows.value.map(row => row.id))
}

function handleEdit(row: UserListItem) {
  userFormRef.value?.open(row)
}

function handleSuccess() {
  queryClient.invalidateQueries({ queryKey: userKeys.lists() })
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded bg-white p-5 shadow-sm">
      <div class="flex items-center">
        <el-input
          v-model="searchKey"
          class="w-60!"
          placeholder="请输入账号或姓名"
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

    <div class="rounded bg-white p-5 shadow-sm">
      <div class="flex items-center mb-4">
        <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
          <template #icon><IconEpDelete /></template>
          批量删除
        </el-button>
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
        @selection-change="handleSelectionChange"
      >
        <template #avatar="{ row }">
          <el-avatar :src="row.avatar" :size="34">
            <IconEpUser />
          </el-avatar>
        </template>

        <template #status="{ row }">
          <el-tag :type="row.status.value === 1 ? 'success' : 'danger'">
            {{ row.status.text }}
          </el-tag>
        </template>

        <template #roles="{ row }">
          <el-tag v-for="role in row.roleList" :key="role.id" class="mr-1">
            {{ role.name }}
          </el-tag>
        </template>

        <template #action="{ row }">
          <el-button v-if="row.isDelHandle !== false" type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.isDelHandle !== false"
            type="danger"
            link
            @click="handleDelete([row.id], row.name)"
          >
            删除
          </el-button>
        </template>
      </ProTable>
    </div>
    <UserForm ref="userFormRef" @success="handleSuccess" />
  </div>
</template>

<style lang="scss" scoped></style>
