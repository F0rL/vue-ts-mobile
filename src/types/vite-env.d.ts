/// <reference types="vite/client" />

/** vite.config.ts 中 define 的构建期字面量 */
declare const __USE_MOCK__: boolean

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_USE_MOCK: string
  readonly VITE_APP_ENABLE_DEVTOOLS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
