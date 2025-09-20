/**
 * 애플리케이션에서 사용할 모든 SQL 쿼리를 정의합니다.
 * 각 쿼리는 준비된 구문(prepared statement)을 사용하므로,
 * 매개변수(?)에 값을 바인딩하여 안전하게 실행할 수 있습니다.
 */
export const queries = {
  /**
   * ===============================================
   * SCHEMA & INITIAL DATA (최초 실행 관련)
   * ===============================================
   */

  // 앱이 처음 시작될 때 필요한 모든 테이블을 생성합니다.
  CREATE_SCHEMA: `
    CREATE TABLE IF NOT EXISTS MooringLines (
        id INTEGER PRIMARY KEY,
        length INTEGER NOT NULL,
        usageTime INTEGER DEFAULT 0,
        manufacturer TEXT,
        model TEXT
    );

    CREATE TABLE IF NOT EXISTS TensionLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lineId INTEGER NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        tension REAL NOT NULL,
        FOREIGN KEY (lineId) REFERENCES MooringLines (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AlertLogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lineId INTEGER NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        alertMessage TEXT NOT NULL,
        FOREIGN KEY (lineId) REFERENCES MooringLines (id) ON DELETE CASCADE
    );
  `,

  // 1번부터 8번까지의 초기 계류줄 데이터를 삽입합니다.
  // INSERT OR IGNORE: 이미 해당 번호의 데이터가 있으면 무시하고 넘어갑니다.
  SEED_INITIAL_LINES: `
    INSERT OR IGNORE INTO MooringLines (id, length, manufacturer, model) VALUES
    (1, 100, '대한로프', 'DR-100'),
    (2, 100, '대한로프', 'DR-100'),
    (3, 100, '해양물산', 'OS-250'),
    (4, 100, '해양물산', 'OS-250'),
    (5, 100, '대한로프', 'DR-150'),
    (6, 100, '대한로프', 'DR-150'),
    (7, 100, '글로벌마린', 'GM-X1'),
    (8, 100, '글로벌마린', 'GM-X1');
  `,


  /**
   * ===============================================
   * 계류줄 (MooringLines) 관련 쿼리
   * ===============================================
   */
  
  // 모든 계류줄 정보를 조회합니다.
  GET_ALL_MOORING_LINES: `
    SELECT * FROM MooringLines;
  `,

  // 특정 번호의 계류줄 상세 정보를 조회합니다.
  // 사용 예: db.prepare(queries.GET_MOORING_LINE_BY_ID).get(3);
  GET_MOORING_LINE_BY_ID: `
    SELECT * FROM MooringLines WHERE id = ?;
  `,

  // 특정 계류줄의 사용 시간을 업데이트합니다.
  // 사용 예: db.prepare(queries.UPDATE_USAGE_TIME).run(150, 5);
  UPDATE_USAGE_TIME: `
    UPDATE MooringLines SET usageTime = ? WHERE id = ?;
  `,

  /**
   * ===============================================
   * 장력이력 (TensionLogs) 관련 쿼리
   * ===============================================
   */

  // 특정 계류줄에 새로운 장력 값을 기록합니다.
  // 사용 예: db.prepare(queries.ADD_TENSION_LOG).run(2, 50.7);
  ADD_TENSION_LOG: `
    INSERT INTO TensionLogs (lineId, tension) VALUES (?, ?);
  `,

  // 특정 계류줄의 전체 장력 이력을 최신순으로 조회합니다.
  // 사용 예: db.prepare(queries.GET_TENSION_LOGS_BY_LINE_ID).all(2);
  GET_TENSION_LOGS_BY_LINE_ID: `
    SELECT * FROM TensionLogs WHERE lineId = ? ORDER BY time DESC;
  `,

  // 특정 계류줄의 최근 장력 이력을 N개만 조회합니다.
  // 사용 예: db.prepare(queries.GET_RECENT_TENSION_LOGS).all(2, 10);
  GET_RECENT_TENSION_LOGS: `
    SELECT * FROM TensionLogs WHERE lineId = ? ORDER BY time DESC LIMIT ?;
  `,


  /**
   * ===============================================
   * 경고이력 (AlertLogs) 관련 쿼리
   * ===============================================
   */

  // 특정 계류줄에 새로운 경고를 기록합니다.
  // 사용 예: db.prepare(queries.ADD_ALERT_LOG).run(7, '위험');
  ADD_ALERT_LOG: `
    INSERT INTO AlertLogs (lineId, alertMessage) VALUES (?, ?);
  `,

  // 특정 계류줄의 모든 경고 이력을 최신순으로 조회합니다.
  // 사용 예: db.prepare(queries.GET_ALERT_LOGS_BY_LINE_ID).all(7);
  GET_ALERT_LOGS_BY_LINE_ID: `
    SELECT * FROM AlertLogs WHERE lineId = ? ORDER BY time DESC;
  `,
  
  // 특정 경고 수준에 해당하는 모든 로그를 최신순으로 조회합니다.
  // 사용 예: db.prepare(queries.GET_ALERT_LOGS_BY_LEVEL).all('위험');
  GET_ALERT_LOGS_BY_LEVEL: `
    SELECT * FROM AlertLogs WHERE alertMessage = ? ORDER BY time DESC;
  `,
};