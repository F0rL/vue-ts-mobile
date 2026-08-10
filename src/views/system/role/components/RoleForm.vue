<script setup lang="ts">
import { ref, reactive, computed, useTemplateRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { fetchRoleEntity, createRole, updateRole, type RolePayload } from '@/api/role'
import { fetchMenuTree, type MenuTreeNode } from '@/api/menu'
import type { FormRules } from 'element-plus'
import { message } from '@/utils/feedback'

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const editingId = ref('')
const formRef = useTemplateRef('formRef')
const treeRef = useTemplateRef('treeRef')
const loading = ref(false)
const expandFlag = ref(true)
const selectAllFlag = ref(false)
const formModel = reactive<{ name: string; status: number }>({
  name: '',
  status: 1,
})
const menuTreeData = ref<MenuTreeNode[]>([])
const defaultCheckedKeys = ref<string[]>([])
const treeProps = { children: 'children', label: 'title' }

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
}

const isEdit = computed(() => !!editingId.value)

const saveMutation = useMutation({
  mutationFn: (payload: RolePayload) =>
    payload.id ? updateRole(payload) : createRole(payload),
  onSuccess: () => {
    message.success('保存成功')
    visible.value = false
    emit('success')
  },
})

function resetForm() {
  expandFlag.value = true
  selectAllFlag.value = false
  formModel.name = ''
  formModel.status = 1
  formRef.value?.clearValidate()
  defaultCheckedKeys.value = []
}

function collectAllKeys(nodes: MenuTreeNode[]): string[] {
  return nodes.flatMap(n => [n.id, ...(n.children ? collectAllKeys(n.children) : [])])
}

function toggleExpandAll() {
  const expanded = !expandFlag.value
  expandFlag.value = expanded
  const tree = treeRef.value as any
  if (!tree) return
  const nodes = tree.store._getAllNodes()
  nodes.forEach((item: any) => {
    item.expanded = expanded
  })
}

function toggleSelectAll() {
  const select = !selectAllFlag.value
  selectAllFlag.value = select
  treeRef.value?.setCheckedKeys(select ? collectAllKeys(menuTreeData.value) : [])
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const tree = treeRef.value
  if (!tree) return

  const checkedNodes = tree.getCheckedNodes(false, false) ?? []
  const halfCheckedNodes = tree.getHalfCheckedNodes() ?? []
  const menuIds = [...checkedNodes.map((n: any) => n.id), ...halfCheckedNodes.map((n: any) => n.id)]
  const menuIdsJSON = JSON.stringify(checkedNodes.map((n: any) => n.id))

  if (menuIds.length === 0) {
    message.error('请选择权限菜单')
    return
  }

  const payload: RolePayload = {
    name: formModel.name,
    status: formModel.status,
    menuIds,
    menuIdsJSON,
  }

  if (isEdit.value) {
    payload.id = editingId.value
  }

  saveMutation.mutate(payload)
}

/** 打开新增/编辑角色抽屉 */
async function open(row?: { id: string }) {
  editingId.value = row?.id ?? ''
  visible.value = true
  loading.value = true
  resetForm()

  try {
    const treeData = await fetchMenuTree()
    menuTreeData.value = treeData ?? []

    if (isEdit.value) {
      const entity = await fetchRoleEntity(editingId.value)
      if (entity) {
        formModel.name = entity.name
        formModel.status = entity.status.value
        try {
          defaultCheckedKeys.value = JSON.parse(entity.menuIdsJSON || '[]')
        } catch {
          defaultCheckedKeys.value = []
        }
      }
    }
  } catch {
    visible.value = false
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    direction="rtl"
    size="480px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      v-loading="loading"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      :disabled="saveMutation.isPending.value"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formModel.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="状态">
        <el-switch v-model="formModel.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="菜单权限">
        <div>
          <div class="mb-2 flex h-8 gap-2">
            <el-button link type="primary" @click="toggleExpandAll"> 展开/折叠 </el-button>
            <el-button link type="primary" @click="toggleSelectAll"> 全选/全不选 </el-button>
          </div>
          <el-tree
            v-if="menuTreeData.length && !loading"
            ref="treeRef"
            :data="menuTreeData"
            :props="treeProps"
            :default-checked-keys="defaultCheckedKeys"
            node-key="id"
            show-checkbox
            default-expand-all
            highlight-current
          />
          <span v-else-if="!loading" class="text-sm text-gray-400">暂无菜单数据</span>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saveMutation.isPending.value" @click="handleSave">确定</el-button>
    </template>
  </el-drawer>
</template>
