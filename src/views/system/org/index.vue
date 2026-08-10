<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import ProTable from '@/components/ProTable/index.vue'
import type { ProTableColumn } from '@/components/ProTable/index.vue'
import {
  fetchDepartmentTree,
  fetchOrgUserList,
  refreshOrgUsers,
  orgKeys,
  type DepartmentTreeNode,
  type OrgUserItem,
} from '@/api/work'
import { message, withLoading } from '@/utils/feedback'

const queryClient = useQueryClient()

const searchKey = ref('')
const pageIndex = ref(1)
const pageSize = ref(10)
const currentDeptId = ref('')

// 部门树
const {
  data: deptTree,
  isPending: deptLoading,
  isSuccess: deptReady,
} = useQuery({
  queryKey: orgKeys.departments(),
  queryFn: () => fetchDepartmentTree(),
})

// 默认选中第一个部门后加载用户列表
const selectedDeptId = computed(() => currentDeptId.value || '')

const { data: userListData, isFetching: userLoading } = useQuery({
  queryKey: [...orgKeys.users(), selectedDeptId, searchKey, pageIndex, pageSize],
  queryFn: () =>
    fetchOrgUserList({
      departmentId: selectedDeptId.value,
      searchKey: searchKey.value || undefined,
      page: pageIndex.value,
      row: pageSize.value,
    }),
  placeholderData: keepPreviousData,
  enabled: () => !!selectedDeptId.value,
})

const tableData = computed(() => userListData.value?.items ?? [])
const total = computed(() => userListData.value?.total ?? 0)

const treeDefaultExpandedKeys = computed(() => {
  if (deptTree.value?.length) {
    return [deptTree.value[0].id]
  }
  return []
})

const columns: ProTableColumn<OrgUserItem>[] = [
  { prop: 'userid', label: '工号', align: 'center', width: 140 },
  { prop: 'name', label: '姓名', width: 120 },
  { label: '部门', minWidth: 160, slot: 'department' },
  { prop: 'mobile', label: '手机号', minWidth: 140 },
  { label: '性别', align: 'center', width: 80, slot: 'gender' },
  { prop: 'position', label: '职务', minWidth: 140 },
]

/** 点击部门树节点 */
function handleNodeClick(data: DepartmentTreeNode) {
  currentDeptId.value = data.id
  pageIndex.value = 1
}

/** 部门树加载完成后默认选中根节点 */
function handleDeptTreeReady() {
  if (deptTree.value?.length && !currentDeptId.value) {
    currentDeptId.value = deptTree.value[0].id
  }
}

watch(deptTree, handleDeptTreeReady, { immediate: true })

/** 搜索 */
function handleSearch() {
  pageIndex.value = 1
}

/** 重置 */
function handleReset() {
  searchKey.value = ''
  pageIndex.value = 1
}

/** 刷新缓存 */
async function handleRefresh() {
  await withLoading(refreshOrgUsers(), '刷新中...')
  message.success('缓存刷新成功')
  await queryClient.invalidateQueries({ queryKey: orgKeys.departments() })
  await queryClient.invalidateQueries({ queryKey: orgKeys.users() })
}
</script>

<template>
  <div class="flex gap-4">
    <!-- 左侧部门树 -->
    <div class="w-60 shrink-0 rounded bg-white shadow-sm p-4">
      <div class="flex items-center gap-2 mb-3">
        <IconEpList class="text-lg text-primary" />
        <span class="text-sm font-semibold text-text-primary">组织架构</span>
      </div>
      <el-tree
        v-if="deptReady && deptTree?.length"
        :data="deptTree"
        :props="{ children: 'children', label: 'name' }"
        node-key="id"
        :default-expanded-keys="treeDefaultExpandedKeys"
        highlight-current
        @node-click="handleNodeClick"
      />
      <el-skeleton v-else-if="deptLoading" :rows="6" animated />
      <span v-else class="text-sm text-text-placeholder">暂无部门数据</span>
    </div>

    <!-- 右侧成员列表 -->
    <div class="flex-1 rounded bg-white shadow-sm p-4 min-w-0">
      <!-- 操作栏 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <el-input
            v-model="searchKey"
            class="w-60!"
            placeholder="请输入姓名或工号"
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
        <el-button @click="handleRefresh">
          <template #icon><IconEpRefresh /></template>
          刷新缓存
        </el-button>
      </div>

      <!-- 表格 -->
      <ProTable
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :columns="columns"
        :data="tableData"
        :loading="userLoading"
        :total="total"
        paginated
      >
        <template #department="{ row }">
          {{ row.department[0]?.name }}
        </template>
        <template #gender="{ row }">
          {{ row.genderText }}
        </template>
      </ProTable>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
