<script setup lang="ts">
import { ref, reactive, computed, useTemplateRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import type { FormRules } from 'element-plus'
import SelectIcon from '@/components/SelectIcon/index.vue'
import {
  fetchParentMenuAll,
  fetchMenuEntity,
  createMenu,
  updateMenu,
  type MenuPayload,
  type MenuTreeNode,
} from '@/api/menu'
import { message } from '@/utils/feedback'

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const editingRow = ref<MenuTreeNode | null>(null)
const formRef = useTemplateRef('formRef')
const loading = ref(false)
const parentList = ref<{ id: string; title: string }[]>([])

function createDefaultMenu(): MenuPayload {
  return {
    title: '',
    path: '',
    icon: 'ep:menu',
    order: 99,
    isMenuShow: true,
    parentId: null,
  }
}

const model = reactive<MenuPayload>(createDefaultMenu())
const rules: FormRules = {
  parentId: [{ required: true, message: '请选择父级菜单', trigger: 'change' }],
  title: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
  order: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
}

const isEdit = computed(() => !!editingRow.value)

const saveMutation = useMutation({
  mutationFn: (payload: MenuPayload) =>
    payload.id ? updateMenu(payload) : createMenu(payload),
  onSuccess: () => {
    message.success('保存成功')
    visible.value = false
    emit('success')
  },
})

function resetForm() {
  Object.assign(model, createDefaultMenu())
  formRef.value?.clearValidate()
}

async function loadParents() {
  try {
    const data = await fetchParentMenuAll()
    let list: { id: string; title: string }[] = data
    if (isEdit.value && editingRow.value?.id) {
      list = list.filter(item => item.id !== editingRow.value!.id)
    }
    parentList.value = list
  } catch {
    parentList.value = []
  }
}

async function loadEntity() {
  if (!editingRow.value?.id) return
  try {
    const entity = await fetchMenuEntity(editingRow.value.id)
    if (!entity) return
    model.title = entity.title || ''
    model.path = entity.path || ''
    model.icon = entity.icon || 'ep:menu'
    model.order = entity.order ?? 99
    model.isMenuShow = entity.isMenuShow ?? true
    model.parentId = entity.parent?.id ?? '-1'
  } catch {
    visible.value = false
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (model.parentId !== '-1' && !model.path) {
    message.error('非顶级菜单请输入路由路径')
    return
  }

  const payload: MenuPayload = { ...model }
  if (payload.parentId === '-1') {
    payload.parentId = null
  }

  if (isEdit.value) {
    payload.id = editingRow.value!.id
  }

  saveMutation.mutate(payload)
}

/** 打开新增/编辑菜单抽屉 */
async function open(row?: MenuTreeNode) {
  editingRow.value = row ?? null
  visible.value = true
  loading.value = true
  try {
    await loadParents()
    if (isEdit.value) {
      await loadEntity()
    } else {
      resetForm()
    }
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    direction="rtl"
    size="480px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="model"
      :rules="rules"
      label-width="120px"
      :disabled="saveMutation.isPending.value"
    >
      <el-form-item label="父级菜单" prop="parentId">
        <el-select v-model="model.parentId" class="w-full">
          <el-option value="-1" label="无（顶级菜单）" />
          <el-option
            v-for="item in parentList"
            :key="item.id"
            :value="item.id"
            :label="item.title"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="菜单标题" prop="title">
        <el-input v-model="model.title" placeholder="请输入菜单标题" />
      </el-form-item>

      <el-form-item label="路由路径" prop="path">
        <el-input v-model="model.path" placeholder="请输入路由路径" />
      </el-form-item>

      <el-form-item label="侧边栏展示">
        <el-switch v-model="model.isMenuShow" />
      </el-form-item>

      <el-form-item label="图标">
        <SelectIcon v-model="model.icon" placeholder="请选择图标" />
      </el-form-item>

      <el-form-item label="排序号" prop="order">
        <el-input-number
          v-model="model.order"
          :min="1"
          :max="1000000000"
          placeholder="请输入排序号"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saveMutation.isPending.value" @click="handleSave">保存</el-button>
    </template>
  </el-drawer>
</template>
