<script setup lang="ts" generic="T extends object">
import { computed, useAttrs, useTemplateRef } from 'vue'

export type ProTableTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface ProTableColumn<T = any> {
  type?: 'selection' | 'index' | 'expand' | 'tag'
  prop?: keyof T & string
  label?: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  showOverflowTooltip?: boolean
  /** 选择列：行是否可勾选 */
  selectable?: (row: T, index: number) => boolean
  /** 纯文本转换，`row: T` 类型安全 */
  formatter?: (row: T, column: any, cellValue: any, index: number) => unknown
  /** 字典映射；键为字段原始值，`text` 为显示文本，`type` 为 tag 颜色（仅 `type: 'tag'` 时生效） */
  valueEnum?: Partial<Record<string | number, { text: string; type?: ProTableTagType }>> & {
    true?: { text: string; type?: ProTableTagType }
    false?: { text: string; type?: ProTableTagType }
  }
  /**
   * 自定义单元格插槽名；存在时优先级最高，覆盖 type='tag' / valueEnum / formatter
   */
  slot?: string
}

const props = withDefaults(
  defineProps<{
    columns: ProTableColumn<T>[]
    data?: T[]
    loading?: boolean
    rowKey?: string
    treeProps?: Record<string, any>
    stripe?: boolean
    headerCellClassName?: string
    emptyText?: string
    paginated?: boolean
    total?: number
    pageSizes?: number[]
    currentPage?: number
    pageSize?: number
  }>(),
  {
    loading: false,
    rowKey: 'id',
    stripe: true,
    headerCellClassName: 'text-gray-600 bg-gray-50!',
    emptyText: '暂无数据',
    paginated: false,
    total: 0,
    pageSizes: () => [10, 20, 50],
    currentPage: 1,
    pageSize: 10,
  },
)

const emit = defineEmits<{
  'update:current-page': [value: number]
  'update:page-size': [value: number]
}>()

defineOptions({ name: 'ProTable', inheritAttrs: false })

const attrs = useAttrs()
const elTableRef = useTemplateRef('elTableRef')

const currentPage = computed(() => props.currentPage)
const pageSize = computed(() => props.pageSize)

/** 分页条数变更时将 `currentPage` 与 `pageSize` 合并为一次调用批量 emit，避免 vue-query 双重查询 */
function handleSizeChange(size: number) {
  emit('update:page-size', size)
  emit('update:current-page', 1)
}

// ---- 列工具函数 ----

function isPlainCol(col: ProTableColumn<T>) {
  return !col.type || col.type === 'tag'
}

function cellValue(col: ProTableColumn<T>, row: T): unknown {
  return col.prop ? (row as Record<string, unknown>)[col.prop] : undefined
}

/** 查找 valueEnum 中与当前行值匹配的条目（运行时 JS 会把 boolean → 字符串 key 自动转换，`Record<string|number>` 访问安全） */
function resolveEnum(col: ProTableColumn<T>, row: T) {
  return col.valueEnum?.[cellValue(col, row) as string | number]
}

/**
 * 单元格文本链：
 *   valueEnum 命中 → 显示 text → formatter 转换 → 原始值
 */
function cellText(col: ProTableColumn<T>, row: T, index: number): unknown {
  const item = resolveEnum(col, row)
  if (item) return item.text
  const raw = cellValue(col, row)
  if (col.formatter) return col.formatter(row, col as any, raw, index)
  return raw
}

/**
 * el-tag type 解析：
 *   仅从 valueEnum 条目获取 per-value 配色，未命中回退 `undefined` → 模板侧 `?? 'info'` 渲染默认灰色 tag
 */
function cellTagType(col: ProTableColumn<T>, row: T): ProTableTagType | undefined {
  return resolveEnum(col, row)?.type
}

/**
 * 剥离 ProTable 私有字段后透传给 el-table-column。
 * type='tag' 也会被剥离，因为 Element Plus 不认识该值。
 */
function columnProps(col: ProTableColumn<T>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { slot: _s, formatter: _f, valueEnum: _ve, ...rest } = col
  if (col.type === 'tag') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type, ...clean } = rest
    return clean
  }
  return rest
}

defineExpose({ elTableRef })
</script>

<template>
  <el-table
    ref="elTableRef"
    v-loading="props.loading"
    :data="props.data"
    :row-key="props.rowKey"
    :tree-props="props.treeProps"
    :stripe="props.stripe"
    :header-cell-class-name="props.headerCellClassName"
    :empty-text="props.emptyText"
    v-bind="attrs"
  >
    <el-table-column
      v-for="(col, index) in props.columns"
      :key="col.prop ?? index"
      v-bind="columnProps(col)"
    >
      <template v-if="isPlainCol(col)" #default="scope">
        <slot
          v-if="col.slot && $slots[col.slot]"
          :name="col.slot"
          :row="scope.row"
          :index="scope.$index"
          :column="scope.column"
        />
        <el-tag v-else-if="col.type === 'tag'" :type="cellTagType(col, scope.row) ?? 'info'">
          {{ cellText(col, scope.row, scope.$index) }}
        </el-tag>
        <span v-else>{{ cellText(col, scope.row, scope.$index) }}</span>
      </template>
    </el-table-column>

    <slot />
  </el-table>

  <div v-if="props.paginated" class="mt-4 flex justify-end">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="props.total"
      :page-sizes="props.pageSizes"
      layout="total, sizes, prev, pager, next"
      background
      @current-change="v => emit('update:current-page', v)"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<style lang="scss" scoped></style>
