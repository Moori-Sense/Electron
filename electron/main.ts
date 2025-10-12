import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'node:path'
import * as fs from 'node:fs'
import * as dotenv from 'dotenv'
import Database from 'better-sqlite3'
import { queries } from '../db/queries'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { fetchWeatherDataMain } from '../src/services/weatherService'

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
// ===== ⬇️ [핵심 수정] 시리얼 포트 전역 변수 및 설정 ⬇️ =====
// ====================================================================
// 💡 모듈 스코프에 인스턴스 변수를 선언해야 IPC 핸들러에서 접근 가능합니다.
let arduinoPort: SerialPort | null = null;
const PORT_NAME = 'COM8'; // ★★★★★ 실제 포트 이름으로 반드시 변경하세요! ★★★★★
const BAUD_RATE = 115200;
// ====================================================================


// ====================================================================
// ===== ⬇️ IPC 핸들러 등록 ⬇️ =====
// ====================================================================

// --- 기존 IPC 핸들러 생략 (동일) ---
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

// ===== ⬇️ [핵심 수정] 아두이노로 거리 전송 핸들러 ⬇️ =====
ipcMain.handle('send-distance-to-arduino', async (event, distance) => {
    return new Promise((resolve, reject) => {
        // 전송할 데이터 형식: '150.7\n' (숫자 + 개행문자)
        const dataString = `${distance}\n`; 

        // 💡 수정! 전역 변수 arduinoPort를 사용하여 포트 인스턴스 상태 확인
        if (arduinoPort && arduinoPort.isOpen) {
            // 💡 수정! arduinoPort 인스턴스의 write() 메서드를 사용
            arduinoPort.write(dataString, (err) => {
                if (err) {
                    reject(new Error(err.message));
                } else {
                    console.log(`[Serial Send] 아두이노로 전송: ${dataString.trim()}`);
                    resolve(true);
                }
            });
        } else {
            reject(new Error("시리얼 포트가 열려있지 않거나 초기화되지 않았습니다."));
        }
    });
});
// ====================================================================
// ===== ⬆️ IPC 핸들러 등록 종료 ⬆️ =====
// ====================================================================


// ====================================================================
// ===== ⬇️ [핵심 수정] 시리얼 통신 설정 및 arduinoPort 초기화 ⬇️ =====
// ====================================================================
function setupSerialCommunication() {
  // 💡 모듈 스코프에 선언된 arduinoPort 변수에 포트 인스턴스를 할당
  arduinoPort = new SerialPort({ path: PORT_NAME, baudRate: BAUD_RATE });

  // 1. 포트 열기 실패를 포함한 모든 오류를 처리하는 리스너를 먼저 등록합니다.
  arduinoPort.on('error', (err) => {
    console.error(`❗️ 시리얼 포트(${PORT_NAME}) 오류: ${err.message}`);
  });

  // 2. 포트가 성공적으로 열렸을 때만 데이터 처리 로직을 설정합니다.
  arduinoPort.on('open', () => {
    console.log(`✅ 시리얼 포트(${PORT_NAME})를 성공적으로 열었습니다.`);
    
    // JSON 메시지가 한 줄에 들어오도록 줄바꿈으로 파싱합니다.
    const parser = arduinoPort!.pipe(new ReadlineParser({ delimiter: '\n' })); // 확실하게 초기화되므로 '!' 사용

    // 경고 설정 (필요에 따라 조정)
    const WARNING_TENSION = 120.0;
    const CAUTION_TENSION = 100.0;
    
    // DB 준비된 구문 (기존 로직 유지)
    const insertTensionStmt = db.prepare(queries.INSERT_TENSION_LOG);
    const insertDistanceStmt = db.prepare(queries.INSERT_VESSEL_STATUS_LOG); 
    const insertLengthStmt = db.prepare(queries.INSERT_LENGTH_LOG); 
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
        // 이 오류는 아두이노에서 보낸 JSON이 아닌, 우리가 보낸 거리 값("150.7\n")을 수신했을 때 발생할 수 있습니다.
        // 따라서 이 에러를 무시하거나, JSON 수신 로직을 거리 수신 로직과 분리해야 더 명확해집니다.
        // 현재는 JSON 수신이 주된 목적이라고 가정하고 오류를 출력합니다.
        console.error(`❗️ JSON 파싱 오류: ${error instanceof Error ? error.message : String(error)}. 수신 데이터: ${data.trim()}`);
        return; // 유효하지 않은 데이터는 무시
      }
      
      // 필수 필드 존재 여부 확인 (최소한의 검증)
      if (!parsedData.distance1 || !parsedData.distance2) {
        console.warn("경고: 필수 거리 필드가 JSON에 누락되었습니다.");
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
    win?.show();
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  setupSerialCommunication(); // 시리얼 포트 초기화 및 리스너 등록
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 앱 종료 시 포트를 닫아주는 것이 좋습니다.
    if (arduinoPort && arduinoPort.isOpen) {
        arduinoPort.close();
    }
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
