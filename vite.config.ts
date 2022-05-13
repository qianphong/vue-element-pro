import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Unocss from 'unocss/vite'

const customImports = {
  'element-pro-components': [
    'defineFormColumns',
    'defineFormMenuColumns',
    'defineFormSubmit',
    'defineTableColumns',
    'defineTableMenuColumns',
    'defineTableSelectionColumns',
    'defineTableIndexColumns',
    'defineTableExpandColumns',
    'defineCrudColumns',
    'defineCrudMenuColumns',
    'defineCrudBeforeOpen',
    'defineCrudBeforeClose',
    'defineCrudSearch',
    'defineCrudSubmit',
    'defineDescriptionsColumns',
  ],
}

function ElementProResolver(name: string) {
  if (name.startsWith('Pro')) {
    const fileName = name
      .slice(3)
      .replace(/\B([A-Z])/g, '-$1')
      .toLocaleLowerCase()
    return {
      name,
      from: 'element-pro-components',
      sideEffects: `element-pro-components/lib/styles/${fileName}`,
    }
  }
}

function ElementIconResolver(componentName: string) {
  if (componentName.startsWith('Icon')) {
    const name = componentName.slice(4)
    return {
      name,
      from: '@element-plus/icons-vue',
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
          'vue/macros',
          customImports,
        ],
        resolvers: [
          ElementPlusResolver(),
          ElementProResolver,
          ElementIconResolver,
        ],
        dts: 'types/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          ElementProResolver,
          ElementIconResolver,
        ],
        dts: 'types/components.d.ts',
      }),
      Unocss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
        '#': fileURLToPath(new URL('types', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      proxy: {
        '/admin/': env.VITE_PROXY_URL,
      },
    },
    build: {
      rollupOptions: {
        output: {
          inlineDynamicImports: false,
          manualChunks: {
            'modules-vue': ['vue', 'vue-router'],
            'modules-vueuse': ['@vueuse/core'],
            'modules-quill': ['quill'],
            'modules-element-plus': ['element-plus'],
            'modules-element-pro': ['element-pro-components'],
            'modules-element-icon': ['@element-plus/icons-vue'],
          },
        },
      },
    },
  }
})
