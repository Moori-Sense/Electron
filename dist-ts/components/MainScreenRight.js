"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScreenRight = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// --- Image Imports (기존 구조 유지) ---
const ship_png_1 = require("../assets/ship.png");
const icon_graph_png_1 = require("../assets/icon_graph.png");
const icon_setting_png_1 = require("../assets/icon_setting.png");
const dock_good_nu5_png_1 = require("../assets/dock_good_nu5.png");
// --- Component Imports (기존 구조 유지) ---
const WeatherDisplay_1 = require("./WeatherDisplay"); // 경로 오류 해결을 위해 아래 인라인 정의 사용
// --- ✨ Import ViewMode type from App.tsx (기존 구조 유지) ---
// import { ViewMode } from './types'; // 경로 오류 해결을 위해 아래 인라인 정의 사용
// --- ✨ MooringLineInfo.tsx로부터 필요한 LineInfoModal과 MooringLineData를 임포트합니다 ---
const MooringLineInfo_1 = require("./MooringLineInfo");
const TensionGauge_tsx_1 = require("./TensionGauge.tsx");
const getLineColorByTension = (tension) => {
    if (tension >= 120)
        return '#ff4d4d';
    if (tension >= 100)
        return '#ffc107';
    if (tension === 0.0)
        return '#a6aaad'; // '#a6aaadff'에서 ff 제거
    return '#4caf50';
};
const MooringLine = ({ line, onClick }) => {
    const LINE_THICKNESS = 4;
    return ((0, jsx_runtime_1.jsxs)("g", { style: { cursor: 'pointer' }, onClick: onClick, children: [(0, jsx_runtime_1.jsx)("line", { x1: line.startX, y1: line.startY, x2: line.endX, y2: line.endY, stroke: getLineColorByTension(line.tension), strokeWidth: LINE_THICKNESS }), (0, jsx_runtime_1.jsx)("text", { x: (line.startX + line.endX) / 2, y: (line.startY + line.endY) / 2 - 15, fill: "white", fontSize: "16", textAnchor: "middle", children: `${line.id}: ${line.tension.toFixed(1)}t` })] }));
};
const IconWithLabel = ({ href, x, y, width, height, label, onClick }) => {
    const yAlignmentCorrection = 2;
    return ((0, jsx_runtime_1.jsxs)("g", { style: { cursor: 'pointer' }, onClick: onClick, children: [(0, jsx_runtime_1.jsx)("image", { href: href, x: x, y: y, width: width, height: height }), (0, jsx_runtime_1.jsx)("text", { x: x + width + 15, y: y + height / 2 + yAlignmentCorrection, fill: "white", fontSize: "18", dominantBaseline: "middle", children: label })] }));
};
// --- 메인 컴포넌트: MainScreenRight ---
const MainScreenRight = ({ onNavigate }) => {
    // All the existing logic from MooringDiagram remains the same
    const SHIP_WIDTH = 650;
    const SHIP_HEIGHT = 1300;
    const SHIP_CENTER_X = 760;
    const SHIP_CENTER_Y = 400;
    const shipX = SHIP_CENTER_X - SHIP_WIDTH / 2;
    const shipY = SHIP_CENTER_Y - SHIP_HEIGHT / 2;
    const DOCK_WIDTH = 700;
    const DOCK_HEIGHT = 1600;
    const DOCK_CENTER_Y = SHIP_CENTER_Y;
    const dockX = 670;
    const dockY = DOCK_CENTER_Y - DOCK_HEIGHT / 2;
    const bollardPositions = {
        line_1: { x: 286, y: 390 }, line_2: { x: 273, y: 440 },
        line_3: { x: 268, y: 850 }, line_4: { x: 272, y: 900 },
        line_5: { x: 365, y: 900 }, line_6: { x: 374, y: 850 },
        line_7: { x: 370, y: 440 }, line_8: { x: 351, y: 390 },
    };
    const pierCleatPositions = {
        cleat1: { x: 650, y: 130 }, cleat2: { x: 650, y: 230 },
        cleat3: { x: 650, y: 590 }, cleat4: { x: 650, y: 660 },
        cleat5: { x: 920, y: 655 }, cleat6: { x: 920, y: 530 },
        cleat7: { x: 920, y: 283 }, cleat8: { x: 920, y: 130 },
    };
    const iconPositions = {
        graph: { x: 120, y: 700, width: 20, height: 20, label: '계류줄 장력 그래프' },
        setting: { x: 350, y: 700, width: 20, height: 20, label: '설정' },
    };
    const [lines, setLines] = (0, react_1.useState)([]);
    const [selectedLine, setSelectedLine] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchLines = async () => {
            try {
                // 1. 세 종류의 데이터를 모두 한 번에 가져옵니다.
                const [details, latest, alerts] = await Promise.all([
                    window.api.getAllMooringLines(),
                    window.api.getLatestTensions(),
                    window.api.getAlertCount(), // API 이름이 다를 경우 여기에 맞게 수정해주세요.
                ]);
                // 2. 'latest'와 'alerts' 데이터를 Map으로 변환하여 준비합니다.
                const latestMap = new Map();
                if (latest) {
                    for (const row of latest)
                        latestMap.set(row.lineId, row);
                }
                const alertMap = new Map();
                if (alerts) {
                    for (const row of alerts)
                        alertMap.set(row.lineId, row);
                }
                // 3. 화면에 표시할 순서대로 lineId 배열을 순회하며 객체를 조립합니다.
                const displayOrder = [8, 7, 6, 5, 4, 3, 2, 1];
                const mapped = displayOrder.map((lineId, i) => {
                    const posIndex = i + 1;
                    const key = `line_${posIndex}`;
                    const cleatKey = `cleat${posIndex}`;
                    const d = (details || []).find((x) => x.id === lineId) || {};
                    const lt = latestMap.get(lineId);
                    const ac = alertMap.get(lineId);
                    // 4. 모든 데이터를 조합하여 하나의 MooringLineData 객체를 생성합니다.
                    const assembledLine = {
                        id: `Line ${lineId}`,
                        tension: lt ? Number(lt.tension) || 0 : 0,
                        startX: shipX + bollardPositions[key].x,
                        startY: shipY + bollardPositions[key].y,
                        endX: pierCleatPositions[cleatKey].x,
                        endY: pierCleatPositions[cleatKey].y,
                        manufacturer: d.manufacturer ?? 'N/A',
                        model: d.model ?? 'N/A',
                        usageHours: d.usageTime ?? 0,
                        lastInspected: d.maintenanceDate,
                        cautionCount: ac?.cautionCount ?? 0,
                        warningCount: ac?.warningCount ?? 0,
                    };
                    // ✅ [로그 1] 조립된 객체 하나하나를 콘솔에 출력하여 확인합니다.
                    console.log(`[map] lineId: ${lineId} 조립 완료`, assembledLine);
                    return assembledLine;
                });
                // ✅ [로그 2] 최종적으로 완성된 8개 객체의 전체 배열을 콘솔에 출력합니다.
                console.log("--- 최종 조립된 전체 데이터 (mapped) ---", mapped);
                // 5. 완성된 객체 배열을 state에 저장하여 화면을 업데이트합니다.
                setLines(mapped);
            }
            catch (e) {
                console.error('계류줄 데이터 로드 실패:', e);
            }
        };
        // 💡 1. 컴포넌트가 마운트되면 즉시 한 번 호출 (첫 로딩을 위해)
        fetchLines();
        // 💡 2. 5초(5000ms)마다 fetchLines 함수를 반복 호출하는 인터벌 설정
        const intervalId = setInterval(fetchLines, 5000);
        // 💡 3. 컴포넌트가 언마운트될 때 인터벌을 정리(clean-up)
        return () => {
            clearInterval(intervalId);
        };
    }, []); // 의존성 배열은 비워두어 이 로직이 마운트 시 한 번만 실행되도록 합니다.
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', width: '100%', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: '90px', // 수정: 날씨 정보를 더 아래로 이동
                    left: '50px', // 수정: 날씨 정보를 오른쪽으로 이동
                    zIndex: 10,
                    color: 'white',
                    backgroundColor: 'rgba(44, 62, 80, 0.85)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid #7f8c8d',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }, children: (0, jsx_runtime_1.jsx)(WeatherDisplay_1.WeatherDisplay, {}) })
            /**자동차 계기판 처럼 장력의 정도를 나타냄 */
            , "/**\uC790\uB3D9\uCC28 \uACC4\uAE30\uD310 \uCC98\uB7FC \uC7A5\uB825\uC758 \uC815\uB3C4\uB97C \uB098\uD0C0\uB0C4 */", (0, jsx_runtime_1.jsx)("div", { style: {
                    position: 'absolute',
                    top: '400px', // 수정: 라인 계기판을 아래로 이동
                    left: '0px',
                }, children: (0, jsx_runtime_1.jsx)(TensionGauge_tsx_1.default, {}) }), (0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 1200 800", style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }, children: [(0, jsx_runtime_1.jsx)("image", { href: dock_good_nu5_png_1.default, x: dockX, y: dockY, width: DOCK_WIDTH, height: DOCK_HEIGHT }), (0, jsx_runtime_1.jsx)("image", { href: ship_png_1.default, x: shipX, y: shipY, width: SHIP_WIDTH, height: SHIP_HEIGHT }), lines.map((line) => ((0, jsx_runtime_1.jsx)(MooringLine, { line: line, onClick: () => setSelectedLine(line) }, line.id))), (0, jsx_runtime_1.jsx)(IconWithLabel, { href: icon_graph_png_1.default, ...iconPositions.graph, onClick: () => onNavigate('allTension') }), (0, jsx_runtime_1.jsx)(IconWithLabel, { href: icon_setting_png_1.default, ...iconPositions.setting, onClick: () => onNavigate('settings') })] }), selectedLine && ((0, jsx_runtime_1.jsx)(MooringLineInfo_1.LineInfoModal, { line: selectedLine, onClose: () => setSelectedLine(null) }))] }));
};
exports.MainScreenRight = MainScreenRight;
exports.default = exports.MainScreenRight;
