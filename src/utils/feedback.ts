/**
 * Element Plus 反馈类组件统一封装
 *
 * ------------------------------------------------------------------
 * 导入
 * ------------------------------------------------------------------
 *   import {
 *     message, notify, confirm, alert, prompt,
 *     showLoading, withLoading,
 *     setupFeedback, feedbackDefaults,
 *   } from '@/utils/feedback'
 *
 * ------------------------------------------------------------------
 *   message — ElMessage 轻提示（页面顶部居中）
 * ------------------------------------------------------------------
 *   message.success('保存成功')                    // 成功
 *   message.error('操作失败')                      // 错误
 *   message.warning('请注意检查')                   // 警告
 *   message.info('权限变更，请重新登录')             // 提示
 *
 *   message.success('保存成功', { duration: 5000 })               // 覆盖时长
 *   message.error('失败', { grouping: false })   // 更细控制
 *   message.create({ message: '自定义', type: 'error', duration: 0 }) // 完全自定义
 *   message.closeAll()                             // 关闭所有弹窗
 *
 * ------------------------------------------------------------------
 *   notify — ElNotification 通知提醒（右上角弹窗）
 * ------------------------------------------------------------------
 *   notify.success('数据已同步')                // 仅描述
 *   notify.success('数据已同步', '操作成功')     // 描述 + 标题
 *   notify.success('数据已同步', { duration: 5000 })           // 描述 + 选项
 *   notify.success('数据已同步', '操作成功', { duration: 0 })  // 三元组
 *
 *   notify.error('文件上传失败')
 *   notify.warning('存储空间不足', '请及时清理')
 *   notify.info('新版本已发布', '系统通知', { duration: 10000 })
 *   notify.create({ title: '紧急', message: '服务器异常', type: 'error', position: 'bottom-right' })
 *   notify.closeAll()
 *
 * ------------------------------------------------------------------
 *   confirm — ElMessageBox.confirm（确定 / 取消）
 * ------------------------------------------------------------------
 *   // 返回 Promise<boolean>，true=确定，false=取消或关闭
 *   if (await confirm('确定删除该记录？')) {
 *     await api.delete(id)
 *     message.success('已删除')
 *   }
 *
 *   if (await confirm('确认批量删除？', '警告', {
 *     confirmButtonText: '永久删除',
 *     type: 'error',
 *   })) { ... }
 *
 * ------------------------------------------------------------------
 *   alert — ElMessageBox.alert
 * ------------------------------------------------------------------
 *   await alert('请先填写必填项')
 *   await alert('操作成功', '提示')
 *   await alert('文件过大', '上传失败', { type: 'error' })
 *
 * ------------------------------------------------------------------
 *   prompt — ElMessageBox.prompt（带输入框）
 * ------------------------------------------------------------------
 *   const newName = await prompt('请输入新名称')
 *   if (newName) await api.rename(id, newName)
 *
 *   try {
 *     const reason = await prompt('请输入驳回原因', '审核', {
 *       inputType: 'textarea',
 *       inputPlaceholder: '请详细说明...',
 *     })
 *     // reason 为用户输入内容；取消则抛异常
 *   } catch {
 *     // 用户点击了取消
 *   }
 *
 * ------------------------------------------------------------------
 *   showLoading / withLoading — ElLoading
 * ------------------------------------------------------------------
 *   // 手动控制
 *   const loading = showLoading('数据加载中...')
 *   await api.fetchData()
 *   loading.close()
 *
 *   // 自动跟随 Promise
 *   const list = await withLoading(api.getList(), '加载列表中...')
 *
 *   // 也支持函数（延迟执行）
 *   const result = await withLoading(() => api.submit(form), '提交中...')
 *
 *   // 接收选项对象
 *   const loading = showLoading({ text: '后台处理中...', background: 'rgba(0,0,0,0.7)' })
 *
 * ------------------------------------------------------------------
 *   setupFeedback / feedbackDefaults — 全局默认配置
 * ------------------------------------------------------------------
 *   // main.js 中统一覆盖
 *   setupFeedback({ message: { duration: 5000 } })
 *
 *   // 直接读写默认配置
 *   console.log(feedbackDefaults.message.duration) // 3000
 *   feedbackDefaults.messageBox.confirmButtonText = '确认'
 * ==================================================================
 */
import { ElMessage, ElNotification, ElMessageBox, ElLoading } from 'element-plus'
import type {
  MessageOptions,
  NotificationOptions,
  ElMessageBoxOptions,
  LoadingOptions,
  LoadingInstance,
} from 'element-plus'

const DEFAULTS = {
  message: {
    duration: 3000,
    grouping: true,
  } as Partial<MessageOptions>,
  notification: {
    duration: 4500,
    position: 'top-right' as const,
  } as Partial<NotificationOptions>,
  messageBox: {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning' as const,
    closeOnClickModal: false,
  } as Partial<ElMessageBoxOptions>,
  loading: {
    fullscreen: true,
    lock: true,
    text: '加载中...',
  } as Partial<LoadingOptions>,
}

// ============== Message ==============
function makeMessage(type: MessageOptions['type']) {
  return (message: string, options: Partial<MessageOptions> = {}) =>
    ElMessage({ ...DEFAULTS.message, message, type, ...options })
}

export const message = {
  success: makeMessage('success'),
  error: makeMessage('error'),
  warning: makeMessage('warning'),
  info: makeMessage('info'),
  create: (options: Partial<MessageOptions> = {}) => ElMessage({ ...DEFAULTS.message, ...options }),
  closeAll: ElMessage.closeAll,
}

// ============== Notification ==============
/**
 * notify.success(message, title?, options?)
 * notify.success('同步完成')                        // 仅描述
 * notify.success('同步完成', '操作成功')              // 标题+描述
 * notify.success('同步完成', { duration: 5000 })     // 描述+选项
 * notify.success('同步完成', '操作成功', { ... })     // 全都指定
 */
function makeNotify(type: NotificationOptions['type']) {
  return (
    message: string,
    titleOrOptions?: string | NotificationOptions,
    options?: NotificationOptions,
  ) => {
    let title = ''
    let opts: NotificationOptions = {} as NotificationOptions
    if (typeof titleOrOptions === 'string') {
      title = titleOrOptions
      if (options) opts = options
    } else if (titleOrOptions) {
      opts = titleOrOptions
    }
    return ElNotification({ ...DEFAULTS.notification, title, message, type, ...opts })
  }
}

export const notify = {
  success: makeNotify('success'),
  error: makeNotify('error'),
  warning: makeNotify('warning'),
  info: makeNotify('info'),
  create: (options: Partial<NotificationOptions> = {}) =>
    ElNotification({ ...DEFAULTS.notification, ...options }),
  closeAll: ElNotification.closeAll,
}

// ============== MessageBox ==============

export function confirm(
  message: string,
  title = '提示',
  options: Partial<ElMessageBoxOptions> = {},
) {
  return ElMessageBox.confirm(message, title, {
    ...DEFAULTS.messageBox,
    ...options,
  })
    .then(() => true)
    .catch(() => false)
}

export function alert(message: string, title = '提示', options: Partial<ElMessageBoxOptions> = {}) {
  return ElMessageBox.alert(message, title, {
    ...DEFAULTS.messageBox,
    type: 'info',
    ...options,
  })
}

export function prompt(
  message: string,
  title = '提示',
  options: Partial<ElMessageBoxOptions> = {},
) {
  return ElMessageBox.prompt(message, title, {
    ...DEFAULTS.messageBox,
    type: 'info',
    ...options,
  }).then(({ value }) => value)
}

// ============== Loading ==============

export function showLoading(
  text?: string | LoadingOptions,
  options: Partial<LoadingOptions> = {},
): LoadingInstance {
  const textResolved = typeof text === 'string' ? text : DEFAULTS.loading.text
  const extraOptions = typeof text === 'string' ? options : text || {}
  return ElLoading.service({
    ...DEFAULTS.loading,
    text: textResolved,
    ...extraOptions,
  })
}

export async function withLoading<T>(
  task: (() => Promise<T>) | Promise<T>,
  text?: string | LoadingOptions,
): Promise<T> {
  const loading = showLoading(text)
  try {
    return await (typeof task === 'function' ? task() : task)
  } finally {
    loading.close()
  }
}

// ============== 配置入口 ==============

export function setupFeedback(config: Partial<typeof DEFAULTS> = {}) {
  Object.entries(config).forEach(([key, value]) => {
    if (DEFAULTS[key as keyof typeof DEFAULTS]) {
      Object.assign(DEFAULTS[key as keyof typeof DEFAULTS], value)
    }
  })
}

export { DEFAULTS as feedbackDefaults }
