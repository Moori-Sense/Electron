import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path, { dirname } from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { queries } from '../db/queries'
// ===== ⬇️ [추가] 시리얼 통신 모듈 임포트 ⬇️ =====
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
// ===== ⬆️ [추가] 시리얼 통신 모듈 임포트 ⬆️ =====


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


// (기존의 '개발용 모의 데이터 자동 생성' 로직은 그대로 둡니다)
// ... (기존 코드와 동일) ...


let win: BrowserWindow | null

// ====================================================================
// ===== ⬇️ IPC 핸들러 등록 ⬇️ =====
// ====================================================================

// ... (기존의 모든 ipcMain.handle 코드는 그대로 둡니다) ...
// 'get-weather-data', 'get-all-mooring-lines', 등등 모두 그대로 유지합니다.

// ====================================================================
// ===== ⬆️ IPC 핸들러 등록 종료 ⬆️ =====
// ====================================================================


// ====================================================================
// ===== ⬇️ [추가] 시리얼 통신 설정 및 데이터 처리 ⬇️ =====
// ====================================================================
// main.ts 파일의 setupSerialCommunication 함수를 아래 코드로 교체하세요.

// [최종 수정본] main.ts의 setupSerialCommunication 함수를 이 코드로 교체하세요.

function setupSerialCommunication() {
  const PORT_NAME = 'COM3'; // ★★★ 실제 포트 이름으로 변경! ★★★
  const BAUD_RATE = 9600;
  
  // ✅ [1단계] 두 가지 장력 임계치 설정
  const WARNING_TENSION = 120.0; // 'warning' 레벨 임계치
  const CAUTION_TENSION = 100.0; // 'caution' 레벨 임계치

  try {
    const port = new SerialPort({ path: PORT_NAME, baudRate: BAUD_RATE });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    console.log(`✅ 시리얼 포트(${PORT_NAME})를 성공적으로 열었습니다.`);

    // 4종류의 데이터를 삽입하기 위한 쿼리 준비 (이전과 동일)
    const insertTensionStmt = db.prepare(queries.INSERT_WINCH_LOG);
    const insertLengthStmt = db.prepare(queries.INSERT_VESSEL_STATUS_LOG);
    const insertAlertStmt = db.prepare(queries.INSERT_ALERT_LOG);

    // 모든 DB 작업을 하나의 트랜잭션으로 처리
    const processFullData = db.transaction((data) => {
      // 1. 기본 데이터 저장 (이전과 동일)
      insertLengthStmt.run(data.time, data.bowDistance, data.sternDistance);
      for (const winch of data.winchData) {
        insertTensionStmt.run(winch.lineId, data.time, winch.tension);
      }
      
      // ✅ [2단계] 수정된 임계치 검사 및 AlertLog 저장 로직
      for (const winch of data.winchData) {
        let alertMessage = null; // 경고 메시지를 담을 변수

        if (winch.tension >= WARNING_TENSION) {
          // 120 이상이면 'warning'
          alertMessage = 'warning';
          console.log(`🚨 [위험] Line ${winch.lineId} 장력(${winch.tension})이 임계치(${WARNING_TENSION})를 초과했습니다!`);

        } else if (winch.tension >= CAUTION_TENSION) {
          // 100 이상 120 미만이면 'caution'
          alertMessage = 'caution';
          console.log(`⚠️ [주의] Line ${winch.lineId} 장력(${winch.tension})이 임계치(${CAUTION_TENSION})를 초과했습니다.`);
        }

        // 경고 메시지가 있을 경우에만 DB에 저장
        if (alertMessage) {
          insertAlertStmt.run(winch.lineId, data.time, alertMessage);
          
          // (선택) UI에도 실시간으로 경고 알림 전송
          win?.webContents.send('new-alert', { 
            lineId: winch.lineId,
            time: data.time,
            tension: winch.tension,
            message: alertMessage 
          });
        }
      }
    });

    // 데이터 수신 이벤트 리스너 (이전과 동일)
    parser.on('data', (data: string) => {
      // ... (데이터 파싱 및 객체화 로직은 이전과 동일합니다) ...
      const now = new Date().toISOString();
      const values = data.trim().split(',').map(parseFloat);

      if (values.length !== 18) {
        console.error(`❗️ 수신 데이터 개수 오류 (기대: 18, 실제: ${values.length})`);
        return;
      }

      const [bowDistance, sternDistance, ...rest] = values;
      const tensions = rest.slice(0, 8);
      const lengths = rest.slice(8);
      const winchData = tensions.map((tension, index) => ({
        lineId: index + 1,
        tension: tension,
        length: lengths[index],
      }));
      const fullData = { time: now, bowDistance, sternDistance, winchData };

      try {
        processFullData(fullData);
        win?.webContents.send('new-vessel-data', fullData);
      } catch (error) {
        console.error('❗️ DB 작업 실패:', error);
      }
    });

    port.on('error', (err) => console.error('❗️ 시리얼 포트 오류:', err.message));

  } catch (error) {
    console.error(`❗️ 시리얼 포트(${PORT_NAME}) 열기 실패.`, error);
  }
}


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
  
  // ... (기존 win.webContents 이벤트 핸들러들) ...

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// ... (기존 app 이벤트 핸들러들) ...

app.whenReady().then(() => {
  createWindow();
  // ===== ⬇️ [추가] 앱이 준비되면 시리얼 통신 시작 ⬇️ =====
  setupSerialCommunication();
  // ===== ⬆️ [추가] 앱이 준비되면 시리얼 통신 시작 ⬆️ =====
});