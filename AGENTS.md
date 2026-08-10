# AGENTS.md

## 技术栈

Vue 3（TypeScript）+ Vite 8 + Pinia 3 + Vue Router 5 + Element Plus 2 + Tailwind CSS 4 + SCSS + @tanstack/vue-query。

## 命令

```
pnpm dev           # 开发服务器
pnpm build         # 生产构建 → dist/
pnpm preview       # 预览生产构建
pnpm lint          # ESLint 检查 .vue/.js 文件
pnpm typecheck     # vue-tsc 类型检查
```

仅允许使用 `pnpm`——由 `packageManager`（corepack）+ `devEngines.packageManager` 强制执行。

## 工程原则

### 验证

代码编写完成后必须同时通过 `pnpm lint` 和 `pnpm typecheck`。两者职责不同：`lint` 管风格和语法，`typecheck` 管类型推断（编辑器红色报错靠 typecheck 捕获）。

### 优先使用成熟的第三方包

在编写自定义代码前，先检查是否有维护良好的社区包已解决该问题（日期→`dayjs`、工具函数→`@vueuse/core`、图表→`echarts`、拖拽→`vuedraggable`、Excel→`xlsx`、富文本→`md-editor-v3`）。不要从零构建事件总线、防抖/节流、剪贴板、全屏、暗色模式切换或 localStorage 封装——`@vueuse/core` 已覆盖。可先查阅其目录。

### 路径别名

`@` → `src/`（在 `vite.config.ts` 和 `jsconfig.json` 中均已配置）。

## 架构

### 自动导入

- Element Plus API（`ElMessage`、`ElLoading`）自动注入，无需手动导入。
- Element Plus 组件自动导入，直接使用 `<el-button>` 等标签。
- 图标组件前缀 `Icon`（如 `<IconEpUser />`），无需手动注册。
- **注意**：`vue`、`vue-router`、`pinia` 的自动导入已禁用，必须显式 `import`。

### Store 规范

- 所有 store 使用 Setup 语法：`defineStore('id', () => { ... })`，`persist` 配置放第三个参数。禁止 Options API 形式。
- pinia 实例由 `src/stores/index.ts` 创建并默认导出。非组件代码（如 axios 拦截器）导入该实例以在 `<script setup>` 上下文之外使用 store。

### Token 存储

Token 和用户状态通过 `pinia-plugin-persistedstate` 持久化，key 使用 `src/utils/storage.ts` 的 `storageKey()` 辅助函数（`import.meta.env.BASE_URL` + store id）。每个 store 的 `persist` 配置控制持久化哪些 ref。

`src/utils/auth.ts` 已删除——token 完全通过 Pinia 持久化管理。

### 动态图标必须使用 iconMap

`unplugin-vue-components` 仅能解析静态标签形式的图标。动态方式 `<component :is="iconName" />` 会静默失败，必须使用 `src/icons` 导出的 iconMap。

新增侧边栏菜单图标时：EP 图标 → `src/icons/ep.js` 新增条目；RemixIcon → `src/icons/ri.js` 新增条目。

### Tailwind CSS v4（CSS 优先，无配置文件）

使用 `@tailwindcss/vite` 插件，通过 CSS 的 `@theme` / `@source` 指令配置——**没有 `tailwind.config.js` 和 `postcss.config.js`**。

已禁用 Preflight 以避免与 Element Plus 基础样式冲突——从 `src/styles/tailwind.css` 中省略 preflight 导入即可，无需 corePlugins 配置。

### sass-embedded

使用 `api: 'modern-compiler'`——SCSS 文件必须使用 `@use`/`@forward` 语法，不能使用 `@import`。

## 数据层规范

### API 文件结构

每个领域一个文件，放在 `src/api/{domain}.ts`。单文件内按"类型 → API 函数 → 查询键"顺序排列：

```
src/api/
├── auth.ts    # 类型 + fetchCaptcha / fetchToken / fetchUserInfo
├── menu.ts    # 类型 + fetch* / create* / update* / delete* + menuKeys
└── role.ts    # 类型 + fetch* / create* / update* / delete* + roleKeys
```

API 函数是**纯异步函数**，对 vue-query 零感知——只负责请求和返回数据，不涉及缓存/失效/重取。具体写法参考现有 `src/api/menu.ts`。

### 响应解包

后端统一返回 `ApiResponse<T>`（`{ flag, msg, total, time, code }`）。解包逻辑集中在 `@/utils/http`：

- `apiGet<T>` — 单实体/树形数据，返回 `msg`（即 `T`）
- `apiGetList<T>` — 分页列表，返回 `{ items: T[], total }`
- `apiPost<T>` — 增删改，返回 `msg`

业务错误（`code !== 0`）由解包层统一处理并 reject，调用方无需重复判断。

### vue-query 使用约束

| 场景                                          | 用              | 不用                    |
| --------------------------------------------- | --------------- | ----------------------- |
| 组件内数据获取                                | `useQuery`      | 裸 axios / 手动 loading |
| 需要生命周期钩子的写操作                      | `useMutation`   | 裸调用 + try/catch      |
| 一次性调用（loading 已由 withLoading 接管）   | 直接调 API 函数 | `useMutation`           |
| Store 中的命令式请求（login、generateRoutes） | 直接调 API 函数 | vue-query               |

**useQuery 必须内联写在视图中**，queryKey 和 queryFn 同处可见。不为单一使用者创建 `queryOptions` 工厂或独立查询文件——那会增加跳转且不带来复用价值。

**useMutation 仅在确实用到 onMutate / onSuccess / onError / onSettled 时使用**；生命周期内完成副作用（失效缓存、提示、loading 清理），不要在事件处理函数里重复写。

### 查询键

查询键工厂放在 API 文件末尾，**仅保留实际用于 `invalidateQueries` 的条目**，不为未来需求预建。

键采用层级前缀结构（通用 → 具体），使失效能按粒度控制：

```
['menus']           ← menuKeys.all       失效所有菜单缓存
['menus', 'tree']   ← menuKeys.trees()   只失效树形数据
```

### 缓存失效

写操作成功后通过 `queryClient.invalidateQueries({ queryKey: 对应键 })` 精确失效相关缓存，驱动关联查询自动重取。禁止手动调用 refetch 刷新。

### Store 与查询边界

Store 持有跨页面共享的**应用状态**（token、用户信息、路由菜单）；vue-query 管理**服务端数据缓存**。二者不混用：login、generateRoutes 这类一次性命令式操作直接调 API 函数，不进查询缓存。

## HTTP 层

`src/utils/http/` 结构：

```
├── index.ts        # axios 实例 + 拦截器（token 注入、HTTP 错误处理）
├── apiHelpers.ts   # createApiHelpers(http) 响应解包工厂
└── error.ts        # isSuccess / handleBusinessError / handleNetworkError
```

`apiGet`/`apiPost`/`apiGetList` 是绑定默认实例的解包函数。多实例场景使用 `createApiHelpers(新实例)` 工厂生成同款解包函数。

## 页面代码规范

### 方法排列顺序

```text
imports → defineProps/defineEmits → composables（无状态依赖） → ref/reactive 状态 →
computed → composables（依赖状态，如 useQuery/useMutation）→ 共享辅助函数 →
事件处理（按界面区域分组）→ defineExpose
```

要点：无状态依赖的 composables（`useQueryClient`、`useStore`）前置；依赖本地 ref 的 `useQuery`/`useMutation` 后置。工厂函数紧邻其初始化的状态声明。不需要分块注释标记——代码结构自然表达分块。

### 注释

**仅在关键交互入口**（打开抽屉、删除确认、切换状态）添加 JSDoc 风格短注释，方便排查时搜索定位。内部辅助函数和工具方法不加注释——函数名应能表达用途。

### loading 选择

- 全局 loading 遮罩 → `withLoading(promise, '文案')`
- 按钮/表单内联 loading → `mutation.isPending`

二选一，不要同时使用。反馈提示统一走 `@/utils/feedback` 的 `message` / `confirm` 等封装。

## Mock

Mock 由 `vite.config.ts` 的 `__USE_MOCK__` 构建期变量控制（当前为 true，上线前改为 false）。启用时 `src/mock/index.ts` 动态注册 `axios-mock-adapter` 拦截 `src/utils/http` 实例。

登录走完整 API 层（fetchToken → apiPost），mock 在 HTTP 适配层拦截响应，**不是**页面直接设置 mock token。

## Git 提交规范

提交信息必须遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>: <简短描述>

<详细说明（可选）>
```

- **type**：英文，可选 `feat`、`fix`、`refactor`、`perf`、`style`、`test`、`docs`、`chore`、`ci` 等。
- **描述**：中文撰写，准确概括更改内容和原因。
- 重要的业务/功能/样式修改放在前面，文档等其它修改放在后面。
