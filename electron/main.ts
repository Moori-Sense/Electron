import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
// dotenv import를 제거. Vite가 자동으로 .env 파일 처리.
// import dotenv from 'dotenv' 
import Database from 'better-sqlite3'
import { queries } from '../db/queries'
import {dirname} from "node:path";

// --- ⬇️ ES 모듈 환경을 위한 경로 설정 ⬇️ ---
// import.meta.url을 기반으로 __filename과 __dirname을 안전하게 생성합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dotenv.config() 호출을 제거했습니다. Vite가 이 역할을 대신합니다.
// --- ⬆️ 경로 설정 종료 ⬆️ ---


// 앱의 루트 경로 및 빌드 경로 설정
process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST


// ====================================================================
// ===== ⬇️ SQLite 데이터베이스 설정 시작 ⬇️ =====
// ====================================================================

// 1. 원본 DB 파일 경로 설정 (개발/배포 환경 자동 감지)
const srcDbPath = app.isPackaged
  ? path.join(process.resourcesPath, 'db', 'my.db')
  : path.join(process.env.APP_ROOT, 'db', 'my.db')

// 2. 사용자의 데이터 폴더(userData)에 저장될 DB 파일 경로 설정
const userDataPath = app.getPath('userData')
const destDbPath = path.join(userDataPath, 'my.db')

// 3. 앱 최초 실행 시, 원본 DB를 사용자 폴더로 복사
if (!fs.existsSync(destDbPath)) {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  fs.copyFileSync(srcDbPath, destDbPath)
  console.log('Database file copied to:', destDbPath);
}

// 4. 사용자 폴더의 DB 파일에 최종 연결
const db = new Database(destDbPath, { verbose: console.log });
console.log('Database connected at:', destDbPath);


// --- ⬇️ 데이터베이스 초기화 (테이블 생성 및 초기 데이터 삽입) ⬇️ ---
// 앱이 시작될 때마다 테이블이 존재하는지 확인하고,
// 초기 데이터가 없으면 삽입하도록 합니다.
try {
  db.exec(queries.CREATE_SCHEMA);
  db.exec(queries.SEED_INITIAL_LINES);
  console.log('Database schema and initial data verified.');
} catch (error) {
  console.error('Database initialization failed:', error);
}
// --- ⬆️ 데이터베이스 초기화 종료 ⬆️ ---

// ====================================================================
// ===== ⬆️ SQLite 데이터베이스 설정 종료 ⬆️ =====
// ====================================================================


let win: BrowserWindow | null

// ====================================================================
// ===== ⬇️ IPC 핸들러 등록 시작 ⬇️ =====
// ====================================================================

// --- 날씨 데이터 IPC 핸들러 ---
import { fetchWeatherDataMain } from '../src/services/weatherService'

ipcMain.handle('get-weather-data', async () => {
  try {
    return await fetchWeatherDataMain();
  } catch (error) {
    console.error('날씨 데이터 로드 실패:', error instanceof Error ? error.message : String(error));
    throw error;
  }
});

// --- 데이터베이스 IPC 핸들러 ---
ipcMain.handle('getMooringLineData', async (_event, lineId: number) => {
  try {
    const detailsStmt = db.prepare(queries.GET_MOORING_LINE_BY_ID);
    const details = detailsStmt.get(lineId);

    const historyStmt = db.prepare(queries.GET_LINE_TENSION_HISTORY);
    const history = historyStmt.all(lineId);

    return { details, history };
  } catch (error) {
    console.error('계류줄 데이터 조회 실패:', error);
    return null;
  }
});

// ====================================================================
// ===== ⬆️ IPC 핸들러 등록 종료 ⬆️ =====
// ====================================================================


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    win?.show()
  })

  win.webContents.on('render-process-gone', (_event: any, details: any) => {
    console.error('Renderer process gone:', details);
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

