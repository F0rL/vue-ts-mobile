<script setup lang="ts">
import { ref, reactive, computed, useTemplateRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import type { FormRules, UploadFile, UploadRawFile, UploadRequestOptions } from 'element-plus'
import { fetchRoleList, type RoleListItem } from '@/api/role'
import { fetchUserEntity, createUser, updateUser, resetUserPwd, type UserPayload } from '@/api/user'
import { fetchWorkUserEntity } from '@/api/work'
import { useUserStore } from '@/stores/modules/user'
import { apiPost } from '@/utils/http'
import { confirm, message, notify } from '@/utils/feedback'
import ContactSelect from '@/components/ContactSelect/index.vue'

interface ContactSelectInstance {
  open(options: {
    selectType: string
    selectNum: string
  }): Promise<{ id: string; name: string; type: number }[] | null | undefined>
}

const emit = defineEmits<{
  success: []
}>()

const visible = ref(false)
const editingId = ref('')
const formRef = useTemplateRef('formRef')
const contactRef = useTemplateRef<ContactSelectInstance>('contactRef')
const loading = ref(false)
const fileList = ref<UploadFile[]>([])
const roleOptions = ref<RoleListItem[]>([])

const formModel = reactive({
  userId: '',
  name: '',
  pwd: '',
  pwd1: '',
  avatar: '',
  roleIds: [] as string[],
  status: 1,
  wechat_UserId: null as string | null,
  wechat_DepId: null as string | null,
  wechat_DepName: null as string | null,
})

const isEdit = computed(() => !!editingId.value)
const isSuperAdmin = computed(() => useUserStore().roles.some(role => role.id === '10086'))

const rules = computed<FormRules>(() => ({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  userId: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  pwd: [
    { required: !isEdit.value, message: '请输入密码', trigger: 'blur' },
    {
      required: !isEdit.value,
      pattern: /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/,
      message: '最少6位数字或者字母，且至少有1个特殊字符',
      trigger: 'blur',
    },
  ],
  pwd1: [
    {
      required: !isEdit.value,
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入确认密码'))
        } else if (value !== formModel.pwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  avatar: [{ required: true, message: '请上传头像', trigger: 'change' }],
  roleIds: [{ required: true, type: 'array', message: '请选择角色', trigger: 'change' }],
}))

const saveMutation = useMutation({
  mutationFn: (payload: UserPayload) => (isEdit.value ? updateUser(payload) : createUser(payload)),
  onSuccess: () => {
    message.success('保存成功')
    visible.value = false
    emit('success')
  },
})

function resetForm() {
  formModel.userId = ''
  formModel.name = ''
  formModel.pwd = ''
  formModel.pwd1 = ''
  formModel.avatar = ''
  formModel.roleIds = []
  formModel.status = 1
  formModel.wechat_UserId = null
  formModel.wechat_DepId = null
  formModel.wechat_DepName = null
  fileList.value = []
  roleOptions.value = []
  formRef.value?.clearValidate()
}

/** 打开新增/编辑账户抽屉 */
async function open(row?: { id: string }) {
  editingId.value = row?.id ?? ''
  visible.value = true
  loading.value = true
  resetForm()

  try {
    const roleList = await fetchRoleList({ pageIndex: 1, pageSize: 100 })
    roleOptions.value = roleList.items ?? []

    if (isEdit.value) {
      const entity = await fetchUserEntity(editingId.value)
      formModel.name = entity.name
      formModel.userId = entity.id
      formModel.avatar = entity.avatar
      formModel.roleIds = entity.roleList.map(role => role.id)
      formModel.status = entity.status.value
      formModel.wechat_UserId = entity.userid ?? null
      formModel.wechat_DepName = entity.depName ?? null
      formModel.wechat_DepId = entity.depId ?? null
      fileList.value = entity.avatar
        ? [{ name: 'avatar', url: entity.avatar, status: 'success', uid: Date.now() }]
        : []
    }
  } catch {
    visible.value = false
  } finally {
    loading.value = false
  }
}

/** 保存账户 */
async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const payload: UserPayload = {
    userId: formModel.userId,
    name: formModel.name,
    pwd: isEdit.value ? null : formModel.pwd ? btoa(formModel.pwd) : null,
    status: formModel.status,
    avatar: formModel.avatar,
    roleIds: formModel.roleIds,
    wechat_UserId: formModel.wechat_UserId,
    wechat_DepId: formModel.wechat_DepId,
    wechat_DepName: formModel.wechat_DepName,
  }
  if (isEdit.value) {
    payload.id = editingId.value
  }
  saveMutation.mutate(payload)
}

function handleBeforeUpload(file: UploadRawFile) {
  const isValid =
    /\.(jpg|jpeg|png|bmp)$/i.test(file.name) ||
    ['image/jpeg', 'image/png', 'image/bmp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 <= 2
  if (!isValid) {
    message.error('只支持 jpg/jpeg/png/bmp 格式')
    return false
  }
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

async function handleUpload(options: UploadRequestOptions) {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    const res = await apiPost<{ url: string }>('/SysUpload/UploadFile', formData)
    formModel.avatar = res.url
    options.onSuccess(res)
  } catch {
    message.error('上传失败')
    options.onError({ status: -1, method: 'post', url: options.action } as any)
  }
}

function handleRemove() {
  formModel.avatar = ''
}

/** 打开企业微信联系人选择并回填账号 */
async function handleSearchContact() {
  const picked = await contactRef.value?.open({ selectType: 'user', selectNum: 'min' })
  if (!picked?.length) return
  const entity = await fetchWorkUserEntity({ userId: picked[0].id })
  formModel.name = entity.name
  formModel.userId = entity.userid || entity.mobile || ''
  formModel.pwd = formModel.userId + '@123'
  formModel.pwd1 = formModel.userId + '@123'
  formModel.wechat_UserId = entity.userid
  formModel.wechat_DepName = entity.departmentNames?.[0] ?? null
  formModel.wechat_DepId = entity.department?.[0] ? String(entity.department[0]) : null
}

/** 重置账号密码 */
async function handleResetPwd() {
  const ok = await confirm('确认重置此账号密码？', '提示')
  if (!ok) return
  await resetUserPwd({ userId: editingId.value })
  notify.success('重置成功，新密码为: 账号 + @258   （示例: user@258）')
}

defineExpose({ open })
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="isEdit ? '编辑账户' : '新增账户'"
    direction="rtl"
    size="560px"
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
      <div class="text-base font-bold mt-4 mb-3">基本信息</div>

      <el-form-item label="姓名" prop="name">
        <div class="flex items-center gap-2">
          <el-input v-model="formModel.name" placeholder="请输入姓名" class="flex-1" />
          <el-button v-if="!isEdit" @click="handleSearchContact">关联人员</el-button>
        </div>
      </el-form-item>

      <el-form-item label="账号" prop="userId">
        <el-input v-model="formModel.userId" :disabled="isEdit" placeholder="请输入账号" />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="密码" prop="pwd">
        <el-input v-model="formModel.pwd" type="password" show-password placeholder="请输入密码" />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="确认密码" prop="pwd1">
        <el-input
          v-model="formModel.pwd1"
          type="password"
          show-password
          placeholder="请再次输入密码"
        />
      </el-form-item>

      <el-form-item v-if="isSuperAdmin && isEdit" label="重置密码">
        <el-button type="warning" @click="handleResetPwd">重置密码</el-button>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-upload
          v-model:file-list="fileList"
          list-type="picture-card"
          :limit="1"
          :before-upload="handleBeforeUpload"
          :http-request="handleUpload"
          :on-remove="handleRemove"
        >
          <IconEpPlus />
        </el-upload>
      </el-form-item>

      <div class="text-base font-bold mt-6 mb-3">权限配置</div>

      <el-form-item label="角色" prop="roleIds">
        <el-select v-model="formModel.roleIds" multiple placeholder="请选择角色">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-switch
          v-model="formModel.status"
          :active-value="1"
          :inactive-value="-1"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    <ContactSelect ref="contactRef" />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saveMutation.isPending.value" @click="handleSave"
        >确定</el-button
      >
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped></style>
