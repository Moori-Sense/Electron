"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaugeCluster = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_gauge_chart_1 = require("react-gauge-chart");
const TensionGauge = ({ name, tension, maxTension = 200 }) => {
    const percent = tension / maxTension;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { width: '100%', textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)(react_gauge_chart_1.default, { id: name, percent: percent, nrOfLevels: 3, colors: ['#4caf50', '#ffc107', '#ff4d4d'], arcWidth: 0.1, needleColor: "#e0e0e0", needleBaseColor: "#e0e0e0", textColor: "#ffffff", formatTextValue: (_value) => `${tension.toFixed(1)}t`, animate: false, style: { fontSize: '8px' } }), (0, jsx_runtime_1.jsx)("h3", { style: { marginTop: '-5px', color: 'white', fontWeight: 'normal' }, children: name })] }));
};
const GaugeCluster = () => {
    // 계기판 4개의 데이터를 관리할 state (라인 1,2,3,4로 복구)
    const [lines, setLines] = (0, react_1.useState)([
        { id: 5, name: 'LINE 5', tension: 0 },
        { id: 6, name: 'LINE 6', tension: 0 },
        { id: 7, name: 'LINE 7', tension: 0 },
        { id: 8, name: 'LINE 8', tension: 0 },
    ]);
    // 5초마다 최신 장력 데이터를 가져와 state를 업데이트
    (0, react_1.useEffect)(() => {
        const fetchLatestTensions = async () => {
            try {
                const latest = await window.api.getLatestTensions() || [];
                const latestMap = new Map();
                for (const row of latest) {
                    latestMap.set(row.lineId, Number(row.tension) || 0);
                }
                setLines(prevLines => prevLines.map(line => ({
                    ...line,
                    tension: latestMap.get(line.id) ?? line.tension,
                })));
            }
            catch (e) {
                console.error('최신 장력 데이터 로드 실패 (GaugeCluster):', e);
            }
        };
        const intervalId = setInterval(fetchLatestTensions, 5000);
        fetchLatestTensions(); // 초기 로드
        return () => clearInterval(intervalId);
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            display: 'grid',
            // 2x2 그리드 레이아웃
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '0px',
            padding: '0px',
            width: '100px',
            height: '80px',
            boxSizing: 'border-box',
        }, children: lines.map(line => ((0, jsx_runtime_1.jsx)(TensionGauge, { name: line.name, tension: line.tension }, line.id))) }));
};
exports.GaugeCluster = GaugeCluster;
// 이 파일의 '대표 상품'은 GaugeCluster 이므로 이것만 default로 export 합니다.
exports.default = exports.GaugeCluster;
