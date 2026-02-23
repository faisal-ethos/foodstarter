import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const config = defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  return {
    plugins: [
      devtools(),
      // Only use Cloudflare plugin in production to allow Node.js fs module in development
      !isDev && cloudflare({ viteEnvironment: { name: 'ssr' } }),
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ].filter(Boolean),
    // Ensure Node.js modules are available in development
    ssr: {
      noExternal: isDev ? [] : undefined,
    },
  }
})

export default config
