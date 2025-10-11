"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TensionGraphScreen = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const recharts_1 = require("recharts");
const lineColors = [
    '#ffffffff', '#ffffffff', '#ffffffff', '#ffffffff',
    '#ffffffff', '#ffffffff', '#ffffffff', '#ffffffff',
];
const TensionGraphScreen = ({ onGoBack }) => {
    const [history, setHistory] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const dataFromDB = await window.api.getTensionHistory();
                // DB에서 받은 데이터 배열의 순서를 뒤집어 시간순(과거 -> 최신)으로 만듭니다.
                const sortedData = dataFromDB.reverse();
                setHistory(sortedData); // 정렬된 데이터로 state 업데이트
            }
            catch (error) {
                console.error("데이터베이스 조회에 실패했습니다:", error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    const lineKeys = history.length > 0 ? Object.keys(history[0]).filter(key => key !== 'timestamp') : [];
    if (isLoading) {
        return ((0, jsx_runtime_1.jsx)("div", { style: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }, children: (0, jsx_runtime_1.jsx)("h1", { children: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4\uC5D0\uC11C \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { style: { width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box', color: 'white', display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }, children: [(0, jsx_runtime_1.jsx)("h1", { style: { margin: 0 }, children: "\uACC4\uB958\uC904 \uC7A5\uB825 \uC774\uB825" }), (0, jsx_runtime_1.jsx)("button", { onClick: onGoBack, style: { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }, children: "\uB3CC\uC544\uAC00\uAE30" })] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    flexGrow: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gap: '15px'
                }, children: lineKeys.length === 0 && !isLoading ? ((0, jsx_runtime_1.jsx)("h2", { style: { gridColumn: '1 / -1', textAlign: 'center' }, children: "\uD45C\uC2DC\uD560 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (lineKeys.map((key, index) => ((0, jsx_runtime_1.jsxs)("div", { style: { backgroundColor: 'rgba(44, 62, 80, 0.5)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 5px 0', textAlign: 'center', color: lineColors[index % lineColors.length] }, children: key.replace('_', ' ') }), (0, jsx_runtime_1.jsx)("div", { style: { flexGrow: 1 }, children: (0, jsx_runtime_1.jsx)(recharts_1.ResponsiveContainer, { width: "100%", height: "100%", children: (0, jsx_runtime_1.jsxs)(recharts_1.LineChart, { data: history, margin: { top: 5, right: 15, left: -15, bottom: 0 }, children: [(0, jsx_runtime_1.jsx)(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "#555" }), (0, jsx_runtime_1.jsx)(recharts_1.XAxis, { dataKey: "timestamp", stroke: "#ccc", tick: { fontSize: 9 } }), (0, jsx_runtime_1.jsx)(recharts_1.YAxis, { stroke: "#ccc", tick: { fontSize: 9 } }), (0, jsx_runtime_1.jsx)(recharts_1.Tooltip, { contentStyle: { backgroundColor: 'rgba(44, 62, 80, 0.9)', border: '1px solid #7f8c8d' }, labelStyle: { color: '#fff' } }), (0, jsx_runtime_1.jsx)(recharts_1.Line, { type: "monotone", dataKey: key, stroke: lineColors[index % lineColors.length], dot: false, strokeWidth: 2 })] }) }) })] }, key)))) })] }));
};
exports.TensionGraphScreen = TensionGraphScreen;
exports.default = exports.TensionGraphScreen;
