import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  // 全局忽略
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/auto-imports.d.ts',
      'src/components.d.ts',
    ],
  },

  // 基础 JS 推荐规则
  js.configs.recommended,

  // TypeScript 推荐规则（类型检查关闭，仅语法规则）
  ...tseslint.configs.recommended,

  // Vue 3 推荐规则（含 .vue 文件解析器与处理器）
  ...pluginVue.configs['flat/essential'],

  // 对 .vue 文件使用 TypeScript 解析器
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 全局变量声明
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        // vite.config.ts 中 define 的构建期字面量
        __USE_MOCK__: 'readonly',
      },
    },
  },

  // 自定义规则覆盖
  {
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      // 允许单词组件名（如 Login、Dashboard）
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      // 允许使用 any（渐进式迁移）
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Prettier 规则覆盖（关闭与 Prettier 冲突的 ESLint 规则，必须放最后）
  eslintConfigPrettier,
]