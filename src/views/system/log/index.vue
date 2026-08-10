<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import ProTable from '@/components/ProTable/index.vue'
import type { ProTableColumn } from '@/components/ProTable/index.vue'
import { fetchLogList, logKeys, type LogListItem } from '@/api/log'

const searchKey = ref('')
const pageIndex = ref(1)
const pageSize = ref(10)

const dateRange = ref<[string, string] | null>(null)

const { data: listRes, isFetching: loading } = useQuery({
  queryKey: [...logKeys.lists(), pageIndex, pageSize, searchKey, dateRange],
  queryFn: () =>
    fetchLogList({
      page: pageIndex.value,
      row: pageSize.value,
      searchKey: searchKey.value || undefined,
      startTime: dateRange.value?.[0] || undefined,
      endTime: dateRange.value?.[1] || undefined,
    }),
  placeholderData: keepPreviousData,
})

const tableData = computed(() => listRes.value?.items ?? [])
const total = computed(() => listRes.value?.total ?? 0)

const columns: ProTableColumn<LogListItem>[] = [
  { prop: 'path', label: '接口地址', minWidth: 200, showOverflowTooltip: true },
  { prop: 'name', label: '接口描述', minWidth: 160, showOverflowTooltip: true },
  { prop: 'method', label: '请求类型', align: 'center', width: 100 },
  { prop: 'host', label: '请求Host', align: 'center', minWidth: 160 },
  { prop: 'executeStartTime', label: '请求开始时间', align: 'center', width: 180 },
  { prop: 'executeEndTime', label: '请求结束时间', align: 'center', width: 180 },
  { prop: 'elaspedTime', label: '请求响应时长(ms)', align: 'center', width: 160 },
  { label: '调用人员', align: 'center', width: 120, slot: 'user' },
]

const disabledDate = (date: Date) => date.getTime() > Date.now()

/** 查询 */
function handleSearch() {
  pageIndex.value = 1
}

/** 重置 */
function handleReset() {
  searchKey.value = ''
  dateRange.value = null
  pageIndex.value = 1
}
</script>

<template>
  <div class="space-y-4">
    <!-- 搜索筛选区 -->
    <div class="rounded bg-white p-5 shadow-sm">
      <el-form class="g-filter-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="搜索条件">
              <el-input
                v-model="searchKey"
                placeholder="请输入搜索条件"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled-date="disabledDate"
                :editable="false"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <div class="flex justify-end gap-2 w-full">
                <el-button type="primary" @click="handleSearch">
                  <template #icon><IconEpSearch /></template>
                  查询
                </el-button>
                <el-button @click="handleReset">
                  <template #icon><IconEpRefresh /></template>
                  重置
                </el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 表格区 -->
    <div class="rounded bg-white p-5 shadow-sm">
      <ProTable
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :total="total"
        paginated
      >
        <template #user="{ row }">
          {{ row.user?.name ?? '' }}
        </template>
      </ProTable>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
