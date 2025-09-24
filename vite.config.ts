import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname } from "node:path";

// ESM 환경에서 __dirname을 사용하기 위한 코드입니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // 렌더러 프로세스에서 React를 사용하기 위해 플러그인을 추가합니다.
    react(),
    electron({
      main: {
        // 메인 프로세스의 진입점 파일입니다.
        entry: 'electron/main.ts',
        // 👇 'better-sqlite3'가 번들링에 포함되지 않도록 vite 설정을 추가합니다.
        vite: {
          build: {
            rollupOptions: {
              // 이 라이브러리는 외부 모듈로 취급하여 require()로 불러오게 됩니다.
              external: ['better-sqlite3']
            },
          },
        },
      },
      preload: {
        // 프리로드 스크립트의 진입점 파일입니다.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // 렌더러 프로세스를 위한 폴리필입니다.
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
})

