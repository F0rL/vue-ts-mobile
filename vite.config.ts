import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_APP_')

  return {
    base: env.VITE_APP_BASE_URL || '/',
    define: {
      // 构建期字面量，由 .env 驱动；false 时 mock 分支被 Rollup 彻底 tree-shake
      __USE_MOCK__: JSON.stringify(env.VITE_APP_USE_MOCK === 'true'),
    },
    plugins: [
      tailwindcss(),
      vue(),
      AutoImport({
        resolvers: [VantResolver()],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [VantResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        } as Record<string, unknown>,
      },
    },
    server: {
      port: 8080,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
