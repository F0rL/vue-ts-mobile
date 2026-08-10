/**
 * Vant v4 反馈类组件统一封装
 *
 * ------------------------------------------------------------------
 * 导入
 * ------------------------------------------------------------------
 *   import {
 *     message, notify, confirm, alert, prompt,
 *     showLoading, withLoading,
 *   } from '@/utils/feedback'
 *
 * ------------------------------------------------------------------
 *   message — Toast 轻提示
 * ------------------------------------------------------------------
 *   message.success('保存成功')
 *   message.error('操作失败')
 *   message.warning('请注意检查')
 *   message.info('权限变更，请重新登录')
 *
 *   message.success('保存成功', { duration: 5000 })
 *   message.error('失败', { position: 'top' })
 *
 * ------------------------------------------------------------------
 *   notify — Notify 通知提醒
 * ------------------------------------------------------------------
 *   notify.success('数据已同步')
 *   notify.success('数据已同步', '操作成功')
 *   notify.success('数据已同步', undefined, { duration: 5000 })
 *
 *   notify.error('文件上传失败')
 *   notify.warning('存储空间不足', '请及时清理')
 *   notify.info('新版本已发布', '系统通知', { duration: 10000 })
 *
 * ------------------------------------------------------------------
 *   confirm — ConfirmDialog（确定 / 取消）
 * ------------------------------------------------------------------
 *   // 返回 Promise<boolean>，true=确定，false=取消或关闭
 *   if (await confirm('确定删除该记录？')) {
 *     await api.delete(id)
 *     message.success('已删除')
 *   }
 *
 *   if (await confirm('确认批量删除？', '警告', {
 *     confirmButtonText: '永久删除',
 *   })) { ... }
 *
 * ------------------------------------------------------------------
 *   alert — Dialog 提示
 * ------------------------------------------------------------------
 *   await alert('请先填写必填项')
 *   await alert('操作成功', '提示')
 *   await alert('文件过大', '上传失败')
 *
 * ------------------------------------------------------------------
 *   prompt — Vant 不提供原生输入框 Dialog，现仅作占位返回 null
 * ------------------------------------------------------------------
 *   const newName = await prompt('请输入新名称')
 *   if (newName) await api.rename(id, newName)
 *
 * ------------------------------------------------------------------
 *   showLoading / withLoading — LoadingToast
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
 * ==================================================================
 */
import {
  showToast,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  showDialog,
  showConfirmDialog,
  showNotify,
  closeToast,
} from 'vant'
import type {
  ToastOptions,
  NotifyOptions,
  DialogOptions as ShowDialogOptions,
} from 'vant'

// ============== Message ==============

export const message = {
  success: (msg: string, options?: Partial<ToastOptions>) =>
    showSuccessToast({ message: msg, ...options }),
  error: (msg: string, options?: Partial<ToastOptions>) =>
    showFailToast({ message: msg, ...options }),
  warning: (msg: string, options?: Partial<ToastOptions>) =>
    showToast({ message: msg, className: 'toast-warning', ...options }),
  info: (msg: string, options?: Partial<ToastOptions>) =>
    showToast({ message: msg, ...options }),
}

// ============== Notification ==============

function makeNotify(type: NotifyOptions['type']) {
  return (
    msg: string,
    title?: string,
    options?: NotifyOptions,
  ) => {
    const message = title ? `${title}\n${msg}` : msg
    return showNotify({ type, message, ...options })
  }
}

export const notify = {
  success: makeNotify('success'),
  error: makeNotify('danger'),
  warning: makeNotify('warning'),
  info: makeNotify('primary'),
}

// ============== Dialog ==============

/** 确认弹窗，返回 Promise<boolean> */
export async function confirm(
  msg: string,
  title = '提示',
  options?: Partial<ShowDialogOptions>,
): Promise<boolean> {
  return showConfirmDialog({ title, message: msg, ...options })
    .then(() => true)
    .catch(() => false)
}

/** 警告弹窗 */
export async function alert(
  msg: string,
  title = '提示',
  options?: Partial<ShowDialogOptions>,
): Promise<void> {
  await showDialog({ title, message: msg, ...options })
}

/**
 * Vant 没有原生 prompt 输入框 Dialog，该方法仅作兼容占位。
 * 如需输入框，请在页面中使用 <van-field> + <van-dialog> 自行实现。
 */
export async function prompt(
  msg: string,
  title = '提示',
  options?: Partial<ShowDialogOptions>,
): Promise<string | null> {
  await showDialog({ title, message: msg, ...options })
  return null
}

// ============== Loading ==============

/** 显示加载 Toast，返回关闭函数 */
export function showLoading(
  text?: string,
  options?: Partial<ToastOptions>,
): { close: () => void } {
  showLoadingToast({
    message: text,
    forbidClick: true,
    duration: 0,
    ...options,
  })
  return { close: () => closeToast() }
}

/** 自动管理加载 Toast 的 Promise 包装器 */
export async function withLoading<T>(
  task: (() => Promise<T>) | Promise<T>,
  text?: string,
): Promise<T> {
  const loading = showLoading(text)
  try {
    return await (typeof task === 'function' ? task() : task)
  } finally {
    loading.close()
  }
}
