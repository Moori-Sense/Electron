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
        model TEXT,
        maintenanceDate DATETIME
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
    INSERT OR IGNORE INTO MooringLines (id, length, manufacturer, model, maintenanceDate) VALUES
    (1, 100, 'korean rope', 'DR-100', '2025-08-01'),
    (2, 100, 'korean rope', 'DR-100', '2025-08-02'),
    (3, 100, 'korean marine', 'OS-250', '2025-08-03'),
    (4, 100, 'korean marine', 'OS-250', '2025-08-04'),
    (5, 100, 'korean rope', 'DR-150', '2025-09-11'),
    (6, 100, 'korean rope', 'DR-150', '2025-09-12'),
    (7, 100, 'global marine', 'GM-X1', '2025-09-13'),
    (8, 100, 'global marine', 'GM-X1', '2025-09-14');
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

  GET_LINE_DETAILS: `
    SELECT * FROM MooringLines WHERE id = ?;
  `,

  
  //---------------------------------계류줄 정보 조회 관련 쿼리------------------------------------//

  // 특정 계류줄 번호의 제조사, 모델 정보를 조회
  GET_LINE_MANUFACTURER_MODEL: `
    SELECT manufacturer, model FROM MooringLines WHERE id = ?;
  `,

  // 특정 계류줄 번호의 최근 12시간의 장력 이력 조회
  GET_LINE_TENSION_HISTORY: `
    SELECT * FROM TensionLogs 
    WHERE lineId = ? AND time >= datetime('now', '-12 hours')
    ORDER BY time DESC;
  `,
  // 특정 계류줄 번호의 총 경고 횟수 조회
  GET_LINE_WARNING_COUNT: `
    SELECT COUNT(alertMessage) AS alertCount FROM AlertLogs WHERE lineId = ? AND alertMessage = 'WARNING';
  `,

  // 특정 계류줄 번호의 최근 위험 횟수 조회
  GET_LINE_DANGER_COUNT: `
    SELECT COUNT(alertMessage) AS alertCount FROM AlertLogs WHERE lineId = ? AND alertMessage = 'DANGER';
  `,

  // 특정 계류줄 번호의 마지막 정비 일자 조회
  GET_LINE_LAST_MAINTENANCE: `
    SELECT maintenanceDate FROM MooringLines WHERE id = ?;
  `,

  // 특정 계류줄 번호의 사용시간 조회
  GET_LINE_USAGE_TIME: `
    SELECT usageTime FROM MooringLines WHERE id = ?;
  `,

  GET_TENSION_HISTORY: `
    SELECT lineId, time, tension FROM TensionLogs ORDER BY time DESC LIMIT 1000
  `,

  // 모든 라인의 최신 장력 1건씩을 조회합니다.
  GET_LATEST_TENSIONS_ALL: `
    SELECT tl.lineId, tl.time, tl.tension
    FROM TensionLogs tl
    JOIN (
      SELECT lineId, MAX(time) AS maxTime
      FROM TensionLogs
      GROUP BY lineId
    ) latest ON latest.lineId = tl.lineId AND latest.maxTime = tl.time
    ORDER BY tl.lineId ASC;
  `,

  PIVOT_GET_TENSION_HISTORY: `
      SELECT
        time AS timestamp,
        MAX(CASE WHEN lineId = 1 THEN tension END) AS line_1,
        MAX(CASE WHEN lineId = 2 THEN tension END) AS line_2,
        MAX(CASE WHEN lineId = 3 THEN tension END) AS line_3,
        MAX(CASE WHEN lineId = 4 THEN tension END) AS line_4,
        MAX(CASE WHEN lineId = 5 THEN tension END) AS line_5,
        MAX(CASE WHEN lineId = 6 THEN tension END) AS line_6,
        MAX(CASE WHEN lineId = 7 THEN tension END) AS line_7,
        MAX(CASE WHEN lineId = 8 THEN tension END) AS line_8
      FROM
        TensionLogs
      GROUP BY
        time
      ORDER BY
        time DESC
      LIMIT 1000;
    `,

  //================================== MooringLineInfo 에서 사용 ==================================//
    // 특정 계류줄의 장력 이력을 시간 내림차순으로 조회합니다.
    GET_TENSION_HISTORY_BY_ID: `
      SELECT tension, time AS timestamp
      FROM TensionLogs  
      WHERE lineId = ?
      ORDER BY time DESC
      LIMIT 100;
  `,
  // 특정 계류줄의 제조사, 모델명, 최종정비, 총 사용 시간 데이터를 조회한다
  GET_LINE_INFO_BY_ID: `
    SELECT manufacturer, model, maintenanceDate, usageTime
    FROM MooringLines
    WHERE id = ?;
  `,

  // 특정 계류줄의 caution, warning 횟수를 조회한다.
  GET_LINE_ALERT_COUNTS: `
    SELECT
      SUM(CASE WHEN alertMessage = 'CAUTION' THEN 1 ELSE 0 END) AS cautionCount,
      SUM(CASE WHEN alertMessage = 'WARNING' THEN 1 ELSE 0 END) AS warningCount
    FROM AlertLogs
    WHERE lineId = ?;
  `,

  //---------------------------------MooringLineInfo 에서 사용------------------------------------//

  
  //---------------------------------mock data 쿼리------------------------------------//

  INSERT_MOCK_TENSION_LOG: `
    INSERT INTO TensionLogs (lineId, tension, time) VALUES (?, ?, ?);
  `,

// ✨ [여기에 추가] 개별 장력 로그를 삽입하는 쿼리
  INSERT_TENSION_LOG: `
    INSERT INTO TensionLogs (lineId, time, tension) VALUES (?, ?, ?);
  `,

  /**
   * (추가) 지정된 개수(예: 1000개)만큼의 무작위 TensionLog 모의 데이터를 한 번에 생성합니다.
   * ? 에 생성할 데이터의 개수를 넘겨주세요.
   * 사용 예: db.prepare(queries.INSERT_BULK_MOCK_TENSION_LOGS).run(1000);
   */
  INSERT_BULK_MOCK_TENSION_LOGS: `
    WITH RECURSIVE generate_series(n) AS (
      SELECT 1
      UNION ALL
      SELECT n + 1 FROM generate_series WHERE n < ?
    )
    INSERT INTO TensionLogs (lineId, tension, time)
    SELECT
      abs(random()) % 8 + 1,                              -- lineId: 1~8번 줄 중에서 무작위 선택
      round(80.0 + (abs(random()) % 400) / 10.0, 2),      -- tension: 80.0 ~ 120.0 사이의 무작위 장력
      datetime('now', '-' || n || ' minutes')             -- time: 현재로부터 n분 전
    FROM generate_series;
  `

};