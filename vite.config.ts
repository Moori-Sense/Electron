import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            sourcemap: process.env.NODE_ENV === 'development',
            lib: {
              entry: 'electron/main.ts',
              name: 'my-electron-main',
              formats: ['cjs'],
              fileName: () => 'main.cjs',
            },
            rollupOptions: {
              external: ['electron', 'better-sqlite3', 'serialport'],
            },
          },
        },
      },
      // ⬇️ [핵심 수정] preload 스크립트도 CommonJS(.cjs)로 만들도록 강제합니다. ⬇️
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            sourcemap: process.env.NODE_ENV === 'development',
            lib: {
              entry: 'electron/preload.ts',
              name: 'my-electron-preload',
              formats: ['cjs'],
              fileName: () => 'preload.cjs',
            },
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      renderer: {},
    }),
  ],
})
