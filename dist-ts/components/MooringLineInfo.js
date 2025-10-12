"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineInfoModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// --- 장력 그래프 컴포넌트 (✨ 최종 수정본) ---
const TensionGraphPlaceholder = ({ lineId }) => {
    // 1. 데이터 및 UI 상태 관리
    const [historyData, setHistoryData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [tooltip, setTooltip] = (0, react_1.useState)(null);
    // 2. 데이터 가져오기
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setTooltip(null);
            try {
                const data = await window.api.getTensionHistoryById(lineId);
                setHistoryData(data);
            }
            catch (err) {
                console.error(`'${lineId}'의 장력 이력 조회에 실패했습니다:`, err);
                setError("데이터를 불러오는 데 실패했습니다.");
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [lineId]);
    // 3. 로딩, 에러, 데이터 없음 UI 처리
    if (isLoading) {
        return (0, jsx_runtime_1.jsx)("div", { style: { color: '#ccc', textAlign: 'center', padding: '80px 0' }, children: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..." });
    }
    if (error) {
        return (0, jsx_runtime_1.jsxs)("div", { style: { color: '#ff4d4d', textAlign: 'center', padding: '80px 0' }, children: ["\uC624\uB958: ", error] });
    }
    if (historyData.length === 0) {
        return (0, jsx_runtime_1.jsx)("div", { style: { color: '#ccc', textAlign: 'center', padding: '80px 0' }, children: "\uD45C\uC2DC\uD560 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." });
    }
    // 4. 그래프 계산 로직
    const tensionValues = historyData.map(item => item.tension);
    const maxVal = Math.ceil(Math.max(...tensionValues, 12)) + 1;
    const minVal = Math.floor(Math.min(...tensionValues, 7)) - 1;
    const width = 600;
    const height = 200;
    const padding = 40; // 💡 축 눈금 텍스트를 위한 패딩 증가
    const scaleX = (i) => {
        if (tensionValues.length <= 1)
            return width / 2;
        return padding + i * ((width - 2 * padding) / (tensionValues.length - 1));
    };
    const scaleY = (val) => {
        if (maxVal === minVal)
            return height / 2;
        return height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    };
    const points = tensionValues.map((val, i) => `${scaleX(i)},${scaleY(val)}`).join(' ');
    // 💡 5. 축 눈금(Ticks) 데이터 생성
    // Y축(장력) 눈금 생성
    const yAxisTicks = [];
    const tickCount = 5; // 5개의 눈금을 생성
    const tickIncrement = (maxVal - minVal) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
        yAxisTicks.push(minVal + (i * tickIncrement));
    }
    // X축(시간) 눈금 생성 (데이터의 시작, 중간, 끝 지점 등)
    const xAxisTicks = [];
    const numDataPoints = historyData.length;
    if (numDataPoints > 1) {
        const numTicksToShow = Math.min(numDataPoints, 5); // 최대 5개의 시간 눈금
        for (let i = 0; i < numTicksToShow; i++) {
            const index = Math.floor(i * (numDataPoints - 1) / (numTicksToShow - 1));
            xAxisTicks.push({ index, timestamp: historyData[index].timestamp });
        }
    }
    else if (numDataPoints === 1) {
        xAxisTicks.push({ index: 0, timestamp: historyData[0].timestamp });
    }
    // 6. 마우스 이벤트 핸들러
    const handleMouseMove = (event) => {
        const svgRect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const index = Math.round(((mouseX - padding) / (width - 2 * padding)) * (historyData.length - 1));
        if (index >= 0 && index < historyData.length) {
            const dataPoint = historyData[index];
            setTooltip({
                x: scaleX(index),
                y: scaleY(dataPoint.tension),
                timestamp: dataPoint.timestamp,
                tension: dataPoint.tension,
            });
        }
    };
    const handleMouseLeave = () => {
        setTooltip(null);
    };
    // 7. SVG 그래프 렌더링
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', backgroundColor: '#2c3e50', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'white', marginBottom: '15px', textAlign: 'center' }, children: "\uCD5C\uADFC \uC7A5\uB825 \uADF8\uB798\uD504" }), (0, jsx_runtime_1.jsxs)("svg", { viewBox: `0 0 ${width} ${height}`, width: "100%", height: "250px", style: { border: '1px solid #34495e', borderRadius: '4px', overflow: 'visible' }, children: [yAxisTicks.map((tick, i) => ((0, jsx_runtime_1.jsxs)("g", { className: "y-tick", children: [(0, jsx_runtime_1.jsx)("line", { x1: padding, y1: scaleY(tick), x2: width - padding, y2: scaleY(tick), stroke: "#34495e", strokeWidth: "1" }), (0, jsx_runtime_1.jsx)("text", { x: padding - 8, y: scaleY(tick), fill: "#7f8c8d", fontSize: "10", textAnchor: "end", alignmentBaseline: "middle", children: tick.toFixed(1) })] }, `y-tick-${i}`))), xAxisTicks.map((tick, i) => ((0, jsx_runtime_1.jsxs)("g", { className: "x-tick", children: [(0, jsx_runtime_1.jsx)("line", { x1: scaleX(tick.index), y1: padding, x2: scaleX(tick.index), y2: height - padding, stroke: "#34495e", strokeWidth: "1" }), (0, jsx_runtime_1.jsx)("text", { x: scaleX(tick.index), y: height - padding + 15, fill: "#7f8c8d", fontSize: "10", textAnchor: "middle", children: new Date(tick.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) })] }, `x-tick-${i}`))), (0, jsx_runtime_1.jsx)("text", { x: width / 2, y: height - 5, fill: "#7f8c8d", fontSize: "12", textAnchor: "middle", children: "\uC2DC\uAC04 \u2192" }), (0, jsx_runtime_1.jsx)("text", { transform: `rotate(-90, 15, ${height / 2})`, x: "15", y: height / 2, fill: "#7f8c8d", fontSize: "12", textAnchor: "middle", children: "\uC7A5\uB825 (t)" }), (0, jsx_runtime_1.jsx)("line", { x1: padding, y1: scaleY(100), x2: width - padding, y2: scaleY(100), stroke: "#ffc107", strokeDasharray: "4 4", strokeOpacity: "0.7" }), (0, jsx_runtime_1.jsx)("line", { x1: padding, y1: scaleY(120), x2: width - padding, y2: scaleY(120), stroke: "#ff4d4d", strokeDasharray: "4 4", strokeOpacity: "0.7" }), (0, jsx_runtime_1.jsx)("polyline", { fill: "none", stroke: "#3498db", strokeWidth: "2", points: points }), (0, jsx_runtime_1.jsx)("rect", { x: padding, y: padding, width: width - 2 * padding, height: height - 2 * padding, fill: "transparent", onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }), tooltip && ((0, jsx_runtime_1.jsxs)("g", { style: { pointerEvents: 'none' }, children: [(0, jsx_runtime_1.jsx)("line", { x1: tooltip.x, y1: padding, x2: tooltip.x, y2: height - padding, stroke: "#7f8c8d", strokeDasharray: "3 3" }), (0, jsx_runtime_1.jsx)("circle", { cx: tooltip.x, cy: tooltip.y, r: "5", fill: "#3498db", stroke: "white", strokeWidth: "2" }), (0, jsx_runtime_1.jsxs)("g", { transform: `translate(${tooltip.x + 15}, ${tooltip.y - 45})`, children: [(0, jsx_runtime_1.jsx)("rect", { width: "165", height: "40", fill: "rgba(0,0,0,0.75)", rx: "4" }), (0, jsx_runtime_1.jsx)("text", { x: "8", y: "16", fill: "white", fontSize: "12", children: new Date(tooltip.timestamp).toLocaleString('ko-KR') }), (0, jsx_runtime_1.jsxs)("text", { x: "8", y: "31", fill: "#3498db", fontSize: "12", fontWeight: "bold", children: ["\uC7A5\uB825: ", tooltip.tension.toFixed(2), "t"] })] })] }))] })] }));
};
// --- 모달 상세 정보 스타일 ---
// 이 부분은 그대로 유지됩니다.
const modalStyles = {
    backdrop: {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#1f2937',
        width: '85%',
        maxWidth: '900px',
        padding: '30px',
        borderRadius: '12px',
        color: 'white',
        border: '1px solid #374151',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
    },
    closeButton: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: '#ccc',
        border: 'none',
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'color 0.2s',
    }
};
const detailStyles = {
    header: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #374151',
        paddingBottom: '15px',
        marginBottom: '20px',
    },
    headerDetail: {
        fontSize: '1.1em',
        color: '#ccc',
        marginRight: '80px',
    },
    graphSection: {
        flexGrow: 1,
        marginBottom: '30px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTop: '1px solid #374151',
        paddingTop: '20px',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 30px',
        fontSize: '1em',
    },
    statItem: {
        color: '#ccc',
    },
    dataButton: {
        padding: '12px 25px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    }
};
const LineInfoModal = ({ line, onClose }) => {
    const { id, manufacturer, model, lastInspected, usageHours, cautionCount, warningCount } = line;
    return ((0, jsx_runtime_1.jsx)("div", { style: modalStyles.backdrop, onClick: onClose, children: (0, jsx_runtime_1.jsxs)("div", { style: modalStyles.content, onClick: (e) => e.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("div", { style: detailStyles.header, children: [(0, jsx_runtime_1.jsx)("h1", { style: { margin: 0, fontSize: '2.5em' }, children: id }), (0, jsx_runtime_1.jsxs)("p", { style: detailStyles.headerDetail, children: ["\uC81C\uC870\uC0AC: ", (0, jsx_runtime_1.jsx)("strong", { children: manufacturer }), " | \uBAA8\uB378\uBA85: ", (0, jsx_runtime_1.jsx)("strong", { children: model })] }), (0, jsx_runtime_1.jsx)("button", { style: modalStyles.closeButton, onClick: onClose, onMouseEnter: (e) => e.currentTarget.style.color = '#fff', onMouseLeave: (e) => e.currentTarget.style.color = '#ccc', children: "X" })] }), (0, jsx_runtime_1.jsx)("div", { style: detailStyles.graphSection, children: (0, jsx_runtime_1.jsx)(TensionGraphPlaceholder, { lineId: id }) }), (0, jsx_runtime_1.jsxs)("div", { style: detailStyles.footer, children: [(0, jsx_runtime_1.jsxs)("div", { style: detailStyles.statsContainer, children: [(0, jsx_runtime_1.jsxs)("div", { style: detailStyles.statItem, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uACBD\uACE0 \uD69F\uC218:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#ffc107', fontWeight: 'bold', marginLeft: '5px' }, children: [cautionCount, "\uD68C"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: detailStyles.statItem, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uC704\uD5D8 \uD69F\uC218:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: '#ff4d4d', fontWeight: 'bold', marginLeft: '5px' }, children: [warningCount, "\uD68C"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: detailStyles.statItem, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uCD5C\uC885 \uC815\uBE44:" }), (0, jsx_runtime_1.jsx)("span", { style: { marginLeft: '5px' }, children: lastInspected || '미확인' })] }), (0, jsx_runtime_1.jsxs)("div", { style: detailStyles.statItem, children: [(0, jsx_runtime_1.jsx)("strong", { children: "\uCD1D \uC0AC\uC6A9 \uC2DC\uAC04:" }), (0, jsx_runtime_1.jsxs)("span", { style: { marginLeft: '5px' }, children: [usageHours.toLocaleString(), "\uBD84"] })] })] }), (0, jsx_runtime_1.jsx)("button", { style: detailStyles.dataButton, onClick: () => console.log(`${id} 데이터 가져오기 요청`), onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#2980b9', onMouseLeave: (e) => e.currentTarget.style.backgroundColor = '#3498db', children: "\uB370\uC774\uD130 \uAC00\uC838\uC624\uAE30" })] })] }) }));
};
exports.LineInfoModal = LineInfoModal;
