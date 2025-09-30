import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { queries } from '../db/queries'

// --- ES 모듈 환경을 위한 경로 설정 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- dotenv 실행 코드 ---
dotenv.config();

// --- 앱 경로 설정 ---
process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST


// ====================================================================
// ===== ⬇️ SQLite 데이터베이스 설정 ⬇️ =====
// ====================================================================

const srcDbPath = app.isPackaged
  ? path.join(process.resourcesPath, 'db', 'my.db')
  : path.join(process.env.APP_ROOT, 'db', 'my.db')

const userDataPath = app.getPath('userData')
const destDbPath = path.join(userDataPath, 'my.db')

if (!fs.existsSync(destDbPath)) {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  fs.copyFileSync(srcDbPath, destDbPath)
  console.log('Database file copied to:', destDbPath);
}

const db = new Database(destDbPath);
console.log('Database connected at:', destDbPath);

try {
  db.exec(queries.CREATE_SCHEMA);
  db.exec(queries.SEED_INITIAL_LINES);
  console.log('Database schema and initial data verified.');
} catch (error) {
  console.error('Database initialization failed:', error);
}

// ====================================================================
// ===== ⬆️ SQLite 데이터베이스 설정 종료 ⬆️ =====
// ====================================================================

// ====================================================================
// ===== ⬇️ 개발용 모의 데이터 자동 생성 ⬇️ =====
// ====================================================================
if (!app.isPackaged) {
  try {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM TensionLogs');
    const result = countStmt.get() as { count: number };

    if (result.count < 1000) {
      console.log('TensionLogs에 모의 데이터를 생성합니다...');
      const seedStmt = db.prepare(queries.INSERT_BULK_MOCK_TENSION_LOGS);
      const info = seedStmt.run(1000);
      console.log(`✅ ${info.changes}개의 모의 데이터가 성공적으로 추가되었습니다.`);
    } else {
      console.log('ℹ️ TensionLogs에 이미 충분한 데이터가 있어 모의 데이터 생성을 건너뜁니다.');
    }
  } catch (error) {
    console.error('❗️ 모의 데이터 생성에 실패했습니다:', error);
  }
}
// ====================================================================
// ===== ⬆️ 개발용 모의 데이터 자동 생성 종료 ⬆️ =====
// ====================================================================


let win: BrowserWindow | null

// ====================================================================
// ===== ⬇️ IPC 핸들러 등록 ⬇️ =====
// ====================================================================

import { fetchWeatherDataMain } from '../src/services/weatherService'

ipcMain.handle('get-weather-data', async () => {
  try {
    return await fetchWeatherDataMain();
  } catch (error) {
    console.error('날씨 데이터 로드 실패:', error instanceof Error ? error.message : String(error));
    throw error;
  }
});

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

// --- ✨ [수정됨] 그래프용 장력 이력 데이터 조회 핸들러 ---
ipcMain.handle('get-tension-history', async () => {
  try {
    console.log('[Main Process] 전체 장력 이력 조회를 시작합니다.');
    
;

    const stmt = db.prepare(queries.PIVOT_GET_TENSION_HISTORY);
    const reshapedData = stmt.all();
    
    console.log(`[Main Process] ${reshapedData.length}개의 시간대별 데이터로 변환 완료. 렌더러로 전송합니다.`);
    
    // 2. 가공된 데이터를 바로 반환
    return reshapedData;

  } catch (error) {
    console.error("DB 조회 중 오류 발생:", error);
    return [];
  }
});

// ====================================================================
// ===== ⬆️ IPC 핸들러 등록 종료 ⬆️ =====
// ====================================================================




// ====================================================================
// ===== ⬇️ [수정됨] 개발용 모의 데이터 자동 생성 ⬇️ =====
// ====================================================================
if (!app.isPackaged) {
  try {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM TensionLogs');
    const result = countStmt.get() as { count: number };

    if (result.count < 1000) {
      console.log('TensionLogs에 연속적인 모의 데이터를 생성합니다...');
      
      // 1. 대량 삽입을 위한 트랜잭션 시작 (훨씬 빠름)
      const insert = db.transaction((logs) => {
        const stmt = db.prepare(queries.INSERT_TENSION_LOG); // 개별 로그 삽입 쿼리
        for (const log of logs) {
          stmt.run(log.lineId, log.time, log.tension);
        }
      });

      // 2. 1초씩 줄어드는 연속적인 데이터 생성
      const mockLogs = [];
      let currentTime = new Date(); // 현재 시간에서 시작

      // 125개의 타임스탬프 * 8개 라인 = 1000개 데이터
      for (let i = 0; i < 125; i++) {
        // 모든 라인(1~8)에 대해 데이터 생성
        for (let lineId = 1; lineId <= 8; lineId++) {
          mockLogs.push({
            lineId: lineId,
            time: currentTime.toISOString(), // ISO 형식으로 시간 저장
            // tension 값을 약간의 무작위성을 더해 생성
            tension: 25 + (lineId * 0.5) + (Math.random() * 5 - 2.5)
          });
        }
        // 다음 데이터 포인트를 위해 1초씩 시간을 과거로 이동
        currentTime.setSeconds(currentTime.getSeconds() - 1);
      }
      
      // 3. 생성된 모든 데이터를 한 번에 DB에 삽입
      insert(mockLogs);

      console.log(`✅ ${mockLogs.length}개의 연속적인 모의 데이터가 성공적으로 추가되었습니다.`);
    } else {
      console.log('ℹ️ TensionLogs에 이미 충분한 데이터가 있어 모의 데이터 생성을 건너뜁니다.');
    }
  } catch (error) {
    console.error('❗️ 모의 데이터 생성에 실패했습니다:', error);
  }
}
// ====================================================================
// ===== ⬆️ [코드 수정 완료] ⬆️ =====
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
    width: 1920,
    height: 1080,
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