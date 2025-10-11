"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScreenSetting = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// --- 메인 설정 화면 컴포넌트 ---
const MainScreenSetting = ({ onNavigate, currentMode }) => {
    // 현재 선택된 모드에 따라 버튼 스타일을 다르게 적용하기 위한 함수
    const getButtonStyle = (mode) => {
        return currentMode === mode ? activeButtonStyle : inactiveButtonStyle;
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: containerStyle, children: (0, jsx_runtime_1.jsxs)("div", { style: contentStyle, children: [(0, jsx_runtime_1.jsx)("h1", { style: headerStyle, children: "\uC124\uC815" }), (0, jsx_runtime_1.jsx)("p", { style: labelStyle, children: "\uD45C\uC2DC \uBAA8\uB4DC \uC120\uD0DD" }), (0, jsx_runtime_1.jsxs)("div", { style: buttonGroupStyle, children: [(0, jsx_runtime_1.jsx)("button", { style: getButtonStyle('left'), onClick: () => onNavigate('left'), children: "\uC67C\uCABD \uBAA8\uB4DC" }), (0, jsx_runtime_1.jsx)("button", { style: getButtonStyle('right'), onClick: () => onNavigate('right'), children: "\uC624\uB978\uCABD \uBAA8\uB4DC" })] }), (0, jsx_runtime_1.jsx)("p", { style: descriptionStyle, children: "\uC120\uD0DD\uD55C \uBAA8\uB4DC\uC758 \uC120\uBC15 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4." })] }) }));
};
exports.MainScreenSetting = MainScreenSetting;
// --- 스타일 객체 ---
const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#c9d7e4',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
};
const contentStyle = {
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    padding: '40px 60px',
    borderRadius: '12px',
    border: '1px solid #7f8c8d',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
};
const headerStyle = {
    margin: '0 0 30px 0',
    fontSize: '2rem',
    fontWeight: 600,
    borderBottom: '1px solid rgba(127, 140, 141, 0.3)',
    paddingBottom: '20px',
};
const labelStyle = {
    fontSize: '1rem',
    opacity: 0.8,
    marginBottom: '15px',
};
const buttonGroupStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
};
const baseButtonStyle = {
    padding: '12px 24px',
    fontSize: '1rem',
    border: '1px solid #7f8c8d',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    minWidth: '150px',
};
// 비활성화 상태 버튼 스타일
const inactiveButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: 'transparent',
    color: '#c9d7e4',
};
// 활성화(선택된) 상태 버튼 스타일
const activeButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#3498db',
    color: 'white',
    borderColor: '#3498db',
};
const descriptionStyle = {
    fontSize: '0.85rem',
    opacity: 0.7,
};
exports.default = exports.MainScreenSetting;
