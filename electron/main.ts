import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'node:path'
import * as fs from 'node:fs'
import * as dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { queries } from '../db/queries'
<<<<<<< HEAD
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { fetchWeatherDataMain } from '../src/services/weatherService'
=======
// ===== ⬇️ [추가] 시리얼 통신 모듈 임포트 ⬇️ =====
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
// ===== ⬆️ [추가] 시리얼 통신 모듈 임포트 ⬆️ =====


// --- ES 모듈 환경을 위한 경로 설정 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca

// --- dotenv 실행 코드 ---
dotenv.config();

// --- 앱 경로 설정 ---
// CommonJS 환경에서는 __dirname이 자동으로 제공되므로 별도 생성 코드가 필요 없습니다.
process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// ====================================================================
// ===== ⬇️ SQLite 데이터베이스 설정 ⬇️ =====
// ====================================================================

const srcDbPath = app.isPackaged
  // 패키징된 앱의 리소스 경로를 올바르게 찾습니다.
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

<<<<<<< HEAD

// ====================================================================
// ===== ⬇️ 개발용 모의 데이터 자동 생성 ⬇️ =====
// ====================================================================
if (!app.isPackaged) {
  try {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM TensionLogs');
    const result = countStmt.get() as { count: number };
=======
>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca

// (기존의 '개발용 모의 데이터 자동 생성' 로직은 그대로 둡니다)
// ... (기존 코드와 동일) ...


let win: BrowserWindow | null

// ====================================================================
// ===== ⬇️ IPC 핸들러 등록 ⬇️ =====
// ====================================================================

<<<<<<< HEAD
ipcMain.handle('get-weather-data', async () => {
  try {
    return await fetchWeatherDataMain();
  } catch (error) {
    console.error('날씨 데이터 로드 실패:', error instanceof Error ? error.message : String(error));
    throw error;
  }
});

ipcMain.handle('get-all-mooring-lines', async () => {
  try {
    const stmt = db.prepare(queries.GET_ALL_MOORING_LINES);
    return stmt.all();
  } catch (error) {
    console.error('모든 계류줄 조회 실패:', error);
    return [];
  }
});

ipcMain.handle('get-latest-tensions', async () => {
  try {
    const stmt = db.prepare(queries.GET_LATEST_TENSIONS_ALL);
    return stmt.all();
  } catch (error) {
    console.error('최신 장력 조회 실패:', error);
    return [];
  }
});

ipcMain.handle('getMooringLineData', async (_event: IpcMainInvokeEvent, lineId: number) => {
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

ipcMain.handle('get-tension-history', async () => {
  try {
    const stmt = db.prepare(queries.PIVOT_GET_TENSION_HISTORY);
    return stmt.all();
  } catch (error) {
    console.error("DB 조회 중 오류 발생:", error);
    return [];
  }
});

ipcMain.handle('get-tension-history-by-id', (_event: IpcMainInvokeEvent, lineId: string) => {
  if (!lineId || typeof lineId !== 'string') return [];
  try {
    const numericId = parseInt(lineId.replace('Line ', ''), 10);
    if (isNaN(numericId)) {
      console.error("Invalid lineId format received:", lineId);
      return [];
    }
    const stmt = db.prepare(queries.GET_TENSION_HISTORY_BY_ID);
    return stmt.all(numericId);
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    return [];
  }
});

ipcMain.handle('get-dashboard-data', (_event: IpcMainInvokeEvent, lineId: string) => {
  if (!lineId || typeof lineId !== 'string') return [];
  try {
    const numericId = parseInt(lineId.replace('Line ', ''), 10);
    if (isNaN(numericId)) {
      console.error("Invalid lineId format received:", lineId);
      return [];
    }
    const lineStmt = db.prepare(queries.GET_LINE_INFO_BY_ID);
    const line_info = lineStmt.all(numericId);
    const weatherStmt = db.prepare(queries.GET_LINE_ALERT_COUNTS);
    const alert = weatherStmt.all(numericId);
    return { line_info, alert };
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    return [];
  }
});

ipcMain.handle('get-alert-count', () => {
  try {
    const stmt = db.prepare(`
      SELECT
        lineId,
        SUM(CASE WHEN alertMessage = 'caution' THEN 1 ELSE 0 END) AS cautionCount,
        SUM(CASE WHEN alertMessage = 'warning' THEN 1 ELSE 0 END) AS warningCount
      FROM AlertLogs
      GROUP BY lineId
    `);
    return stmt.all();
  } catch (error) {
    console.error('전체 경고/위험 횟수 조회 오류:', error);
    return [];
  }
});

ipcMain.handle('get-line-info', (_event: IpcMainInvokeEvent, lineId: string) => {
  if (!lineId || typeof lineId !== 'string') return [];
  try {
    const numericId = parseInt(lineId.replace('Line ', ''), 10);
    if (isNaN(numericId)) {
      console.error("Invalid lineId format received:", lineId);
      return [];
    }
    const stmt = db.prepare(queries.GET_LINE_INFO_BY_ID);
    return stmt.all(numericId);
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    return [];
  }
});
=======
// ... (기존의 모든 ipcMain.handle 코드는 그대로 둡니다) ...
// 'get-weather-data', 'get-all-mooring-lines', 등등 모두 그대로 유지합니다.

>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca
// ====================================================================
// ===== ⬆️ IPC 핸들러 등록 종료 ⬆️ =====
// ====================================================================


// ====================================================================
<<<<<<< HEAD
// ===== ⬇️ [핵심 수정] 시리얼 통신 설정 ⬇️ =====
// ====================================================================
function setupSerialCommunication() {
  const PORT_NAME = 'COM3'; // ★★★★★ 실제 포트 이름으로 반드시 변경하세요! ★★★★★
  const BAUD_RATE = 9600;
  
  const port = new SerialPort({ path: PORT_NAME, baudRate: BAUD_RATE });

  // 1. 포트 열기 실패를 포함한 모든 오류를 처리하는 리스너를 먼저 등록합니다.
  port.on('error', (err) => {
    console.error(`❗️ 시리얼 포트(${PORT_NAME}) 오류: ${err.message}`);
    // 여기서 앱을 종료하지 않으므로, 다른 기능들은 계속 작동합니다.
  });

  // 2. 포트가 성공적으로 열렸을 때만 데이터 처리 로직을 설정합니다.
  port.on('open', () => {
    console.log(`✅ 시리얼 포트(${PORT_NAME})를 성공적으로 열었습니다.`);
    
    // JSON 메시지가 한 줄에 들어오도록 줄바꿈으로 파싱합니다.
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    // 경고 설정 (필요에 따라 조정)
    const WARNING_TENSION = 120.0;
    const CAUTION_TENSION = 100.0;
    
    // DB 준비된 구문
    const insertTensionStmt = db.prepare(queries.INSERT_TENSION_LOG);
    const insertDistanceStmt = db.prepare(queries.INSERT_VESSEL_STATUS_LOG); // bowDistance, sternDistance 사용
    const insertLengthStmt = db.prepare(queries.INSERT_LENGTH_LOG); // 새 쿼리 필요
    const insertAlertStmt = db.prepare(queries.INSERT_ALERT_LOG);

    // 계류줄 데이터 맵핑 (JSON 키와 Line ID 매칭)
    const WINCH_KEYS = [
      { id: 1, tension: 'winch1_tension', length: 'winch1_length' },
      { id: 2, tension: 'winch2_tension', length: 'winch2_length' },
      { id: 3, tension: 'winch3_tension', length: 'winch3_length' },
      { id: 4, tension: 'winch4_tension', length: 'winch4_length' },
      { id: 5, tension: 'winch5_tension', length: 'winch5_length' },
      { id: 6, tension: 'winch6_tension', length: 'winch6_length' },
      { id: 7, tension: 'winch7_tension', length: 'winch7_length' },
      { id: 8, tension: 'winch8_tension', length: 'winch8_length' },
    ];


    // 모든 DB 작업을 트랜잭션으로 묶어 고속 처리
    const processFullData = db.transaction((data: any, now: string) => {
      // 1. DistanceLogs 저장 (distance1 -> bowDistance, distance2 -> sternDistance로 맵핑)
      insertDistanceStmt.run(now, data.distance1, data.distance2);

      for (const keyMap of WINCH_KEYS) {
        const tension = data[keyMap.tension];
        const length = data[keyMap.length];

        if (tension !== undefined) {
          // 2. TensionLogs 저장
          insertTensionStmt.run(keyMap.id, now, tension);
        }

        if (length !== undefined) {
          // 3. LengthLogs 저장 (새 쿼리: INSERT_LENGTH_LOG 필요)
          insertLengthStmt.run(now, keyMap.id, length);
        }

        // 4. AlertLogs 저장 및 렌더러 알림
        if (tension !== undefined) {
          let alertMessage: 'warning' | 'caution' | null = null;
          if (tension >= WARNING_TENSION) {
            alertMessage = 'warning';
          } else if (tension >= CAUTION_TENSION) {
            alertMessage = 'caution';
          }
          
          if (alertMessage) {
            insertAlertStmt.run(keyMap.id, now, alertMessage);
            win?.webContents.send('new-alert', { 
              lineId: keyMap.id,
              time: now,
              tension: tension,
              message: alertMessage 
            });
          }
        }
      }
    });

    // 시리얼 데이터 수신 핸들러 (JSON 파싱 로직)
    parser.on('data', (data: string) => {
      const now = new Date().toISOString();
      let parsedData: any;
      
      try {
        // JSON 문자열 파싱 시도
        parsedData = JSON.parse(data.trim());
      } catch (error) {
        console.error(`❗️ JSON 파싱 오류: ${error instanceof Error ? error.message : String(error)}. 수신 데이터: ${data.trim()}`);
        return; // 유효하지 않은 데이터는 무시
      }
      
      // 필수 필드 존재 여부 확인 (최소한의 검증)
      if (!parsedData.distance1 || !parsedData.distance2) {
        console.warn("경고: 필수 거리 필드가 JSON에 누락되었습니다.");
        // 데이터 처리는 계속 진행할 수 있으나, 완전한 레코드는 아닐 수 있습니다.
      }
      
      try {
        // 트랜잭션을 실행하고, 렌더러로 새 데이터를 보냅니다.
        processFullData(parsedData, now);
        win?.webContents.send('new-vessel-data', parsedData);
      } catch (error) {
        console.error('❗️ DB 작업 실패:', error);
      }
    });
  });
}
// ====================================================================
// ===== ⬆️ 시리얼 통신 설정 종료 ⬆️ =====
// ====================================================================
=======
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
>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca


// ====================================================================
// ===== ⬇️ Electron 앱 기본 설정 ⬇️ =====
// ====================================================================
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    width: 1920,
    height: 1080,
  });

  win.webContents.on('did-finish-load', () => {
<<<<<<< HEAD
    win?.show();
  });
=======
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
    win?.show()
  })
  
  // ... (기존 win.webContents 이벤트 핸들러들) ...
>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

<<<<<<< HEAD
app.whenReady().then(() => {
  createWindow();
  setupSerialCommunication();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
=======
// ... (기존 app 이벤트 핸들러들) ...

app.whenReady().then(() => {
  createWindow();
  // ===== ⬇️ [추가] 앱이 준비되면 시리얼 통신 시작 ⬇️ =====
  setupSerialCommunication();
  // ===== ⬆️ [추가] 앱이 준비되면 시리얼 통신 시작 ⬆️ =====
>>>>>>> e19e7d91451dfbf9adb312043808801ac671d4ca
});