<script setup lang="ts">
import { computed, reactive, shallowRef, ref } from 'vue'
import type { Ref, ShallowRef } from 'vue'
import type { EChartsOption } from 'echarts'
import { useECharts } from '@/hooks/useECharts'
import iconMap from '@/icons'

// ─── 模拟指标数据（后续替换为 API 请求） ───
const metrics = reactive({
  todayPv: 28460,
  todayUv: 3852,
  conversionRate: 3.42,
  pendingOrders: 37,
  monthlyRevenue: 468500,
  monthlyOrders: 5632,
  newUsers: 486,
  activeUsers: 12840,
})

const chartDailyRef: Ref<HTMLDivElement | null> = ref(null)
const chartChannelRevenueRef: Ref<HTMLDivElement | null> = ref(null)
const chartOrderStatusRef: Ref<HTMLDivElement | null> = ref(null)
const chartOrderTypeRef: Ref<HTMLDivElement | null> = ref(null)

// 近7日访问趋势（PV/UV）
const dailyTrendOption: ShallowRef<EChartsOption> = shallowRef({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['访问量(PV)', '访客数(UV)'],
    bottom: 4,
    icon: 'circle',
    itemWidth: 8,
  },
  grid: { left: 44, right: 16, bottom: 52, top: 8 },
  xAxis: {
    type: 'category',
    data: ['06日', '07日', '08日', '09日', '10日', '11日', '今日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '访问量(PV)',
      type: 'line',
      smooth: true,
      data: [18650, 22400, 19800, 25600, 24300, 26800, 28460],
      lineStyle: { color: '#409EFF', width: 2 },
      itemStyle: { color: '#409EFF' },
      areaStyle: { color: 'rgba(64,158,255,0.08)' },
    },
    {
      name: '访客数(UV)',
      type: 'line',
      smooth: true,
      data: [3240, 3680, 3150, 4020, 3860, 4100, 3852],
      lineStyle: { color: '#67C23A', width: 2 },
      itemStyle: { color: '#67C23A' },
      areaStyle: { color: 'rgba(103,194,58,0.08)' },
    },
  ],
})

// 本月各渠道营收
const channelRevenueOption: ShallowRef<EChartsOption> = shallowRef({
  tooltip: { trigger: 'axis' },
  legend: { data: ['线上', '线下'], bottom: 4, icon: 'circle', itemWidth: 8 },
  grid: { left: 44, right: 16, bottom: 52, top: 8 },
  xAxis: {
    type: 'category',
    data: ['第1周', '第2周', '第3周', '第4周'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '线上',
      type: 'bar',
      data: [68500, 75200, 82600, 95600],
      itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] },
    },
    {
      name: '线下',
      type: 'bar',
      data: [43200, 49800, 55600, 64300],
      itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] },
    },
  ],
})

// 近7日待处理工单状态
const orderStatusOption: ShallowRef<EChartsOption> = shallowRef({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['待处理', '处理中', '已完成'],
    bottom: 4,
    icon: 'circle',
    itemWidth: 8,
  },
  grid: { left: 44, right: 16, bottom: 52, top: 8 },
  xAxis: {
    type: 'category',
    data: ['06日', '07日', '08日', '09日', '10日', '11日', '今日'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '待处理',
      type: 'bar',
      stack: 'total',
      data: [23, 18, 31, 27, 15, 22, 16],
      itemStyle: { color: '#E6A23C' },
    },
    {
      name: '处理中',
      type: 'bar',
      stack: 'total',
      data: [45, 52, 48, 61, 55, 43, 59],
      itemStyle: { color: '#409EFF' },
    },
    {
      name: '已完成',
      type: 'bar',
      stack: 'total',
      data: [186, 215, 198, 242, 238, 256, 278],
      itemStyle: { color: '#67C23A' },
    },
  ],
})

// 本月订单类型分布
const orderTypeOption: ShallowRef<EChartsOption> = shallowRef({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 单 ({d}%)' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '50%'],
      label: { formatter: '{b}\n{d}%', fontSize: 12 },
      data: [
        { value: 2856, name: '新订单', itemStyle: { color: '#409EFF' } },
        { value: 1632, name: '退款单', itemStyle: { color: '#F56C6C' } },
        { value: 952, name: '售后单', itemStyle: { color: '#E6A23C' } },
        { value: 192, name: '投诉单', itemStyle: { color: '#909399' } },
      ],
    },
  ],
})

useECharts(chartDailyRef, dailyTrendOption)
useECharts(chartChannelRevenueRef, channelRevenueOption)
useECharts(chartOrderStatusRef, orderStatusOption)
useECharts(chartOrderTypeRef, orderTypeOption)

// ─── 指标卡片 ───
const cards = computed(() => [
  {
    label: '今日访问',
    value: metrics.todayPv.toLocaleString(),
    unit: 'PV',
    trend: '+12.5%',
    trendUp: true,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: 'View',
  },
  {
    label: '独立访客',
    value: metrics.todayUv.toLocaleString(),
    unit: 'UV',
    trend: '+8.3%',
    trendUp: true,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    icon: 'User',
  },
  {
    label: '转化率',
    value: metrics.conversionRate.toFixed(2),
    unit: '%',
    trend: '-0.6%',
    trendUp: false,
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: 'TrendCharts',
  },
  {
    label: '待处理工单',
    value: metrics.pendingOrders,
    unit: '单',
    trend: '+5',
    trendUp: true,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    icon: 'Document',
  },
  {
    label: '本月营收',
    value: `¥${metrics.monthlyRevenue.toLocaleString()}`,
    trend: '+15.2%',
    trendUp: true,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: 'Coin',
  },
  {
    label: '本月订单',
    value: metrics.monthlyOrders.toLocaleString(),
    unit: '单',
    trend: '+9.8%',
    trendUp: true,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    icon: 'ShoppingCartFull',
  },
  {
    label: '新增用户',
    value: metrics.newUsers.toLocaleString(),
    unit: '人',
    trend: '+22.3%',
    trendUp: true,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    icon: 'Plus',
  },
  {
    label: '活跃用户',
    value: metrics.activeUsers.toLocaleString(),
    unit: '人',
    trend: '+5.1%',
    trendUp: true,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    icon: 'Monitor',
  },
])
</script>

<template>
  <div class="space-y-4">
    <!-- 指标卡片 -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="relative flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div
          :class="`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${card.bg}`"
        >
          <el-icon :size="22" :class="card.color">
            <component :is="iconMap[card.icon]" />
          </el-icon>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2">
            <span class="truncate text-xl font-semibold text-gray-800">{{
              card.value
            }}</span>
            <span v-if="card.unit" class="text-xs text-gray-400">{{
              card.unit
            }}</span>
          </div>
          <div class="mt-0.5 flex items-center gap-2 text-sm">
            <span class="text-gray-400">{{ card.label }}</span>
            <span
              v-if="card.trend"
              :class="card.trendUp ? 'text-red-500' : 'text-green-500'"
              class="text-xs"
            >
              {{ card.trend }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <!-- 访问趋势 -->
      <div class="rounded-lg bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-medium text-gray-700">
          近 7 日访问趋势
        </h3>
        <div ref="chartDailyRef" class="h-72 w-full" />
      </div>

      <!-- 渠道营收 -->
      <div class="rounded-lg bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-medium text-gray-700">本月各渠道营收</h3>
        <div ref="chartChannelRevenueRef" class="h-72 w-full" />
      </div>

      <!-- 工单状态 -->
      <div class="rounded-lg bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-medium text-gray-700">
          近 7 日工单状态
        </h3>
        <div ref="chartOrderStatusRef" class="h-72 w-full" />
      </div>

      <!-- 订单类型分布 -->
      <div class="rounded-lg bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-medium text-gray-700">
          本月订单类型分布
        </h3>
        <div ref="chartOrderTypeRef" class="h-72 w-full" />
      </div>
    </div>
  </div>
</template>
