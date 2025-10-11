"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./App.css");
// --- 컴포넌트 임포트 ---
const LoadingScreen_1 = require("./components/LoadingScreen");
const MainScreenRight_1 = require("./components/MainScreenRight");
const MainScreenLeft_1 = require("./components/MainScreenLeft");
const SettingScreen_1 = require("./components/SettingScreen");
//import MooringLineInfo from './components/MooringLineInfo';
const TensionGraph_1 = require("./components/TensionGraph");
const NotificationSystem_1 = require("./components/NotificationSystem");
function App() {
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [statusText] = (0, react_1.useState)('connecting with system...');
    const [currentView, setCurrentView] = (0, react_1.useState)('right');
    // ✨ 1. 이전 뷰를 저장하기 위한 별도의 state를 추가합니다.
    const [previousView, setPreviousView] = (0, react_1.useState)('right');
    const [selectedLine, setSelectedLine] = (0, react_1.useState)(null);
    const [tensionHistory, setTensionHistory] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => setIsLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);
    const handleUpdateHistory = (latestTensions) => {
        const now = new Date();
        const newHistoryEntry = {
            timestamp: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
            ...latestTensions
        };
        setTensionHistory(prevHistory => {
            const updatedHistory = [...prevHistory, newHistoryEntry];
            if (updatedHistory.length > 100) {
                return updatedHistory.slice(updatedHistory.length - 100);
            }
            return updatedHistory;
        });
    };
    // ✨ 2. 화면 전환 시 이전 상태를 저장하는 새로운 핸들러 함수
    const handleNavigate = (newView) => {
        // 현재 뷰('right' 또는 'left')를 previousView state에 저장합니다.
        setPreviousView(currentView);
        // 새로운 뷰로 화면을 전환합니다.
        setCurrentView(newView);
    };
    // ✨ 3. "뒤로 가기"를 위한 핸들러 함수
    const handleGoBack = () => {
        // 저장해뒀던 previousView 값으로 현재 뷰를 되돌립니다.
        setCurrentView(previousView);
    };
    const renderContent = () => {
        // 상세 정보 화면을 먼저 처리
        // ✨ 4. 자식 컴포넌트에 새로운 핸들러 함수들을 props로 전달
        switch (currentView) {
            case 'right':
                return ((0, jsx_runtime_1.jsx)(MainScreenRight_1.default, { onNavigate: handleNavigate }));
            case 'left':
                return ((0, jsx_runtime_1.jsx)(MainScreenLeft_1.default, { onNavigate: handleNavigate }));
            case 'allTension':
                return (0, jsx_runtime_1.jsx)(TensionGraph_1.default, { onGoBack: handleGoBack });
            case 'settings':
                return (0, jsx_runtime_1.jsx)(SettingScreen_1.default, { onNavigate: setCurrentView, currentMode: currentView });
            default:
                // default는 그대로 유지하여 예외 상황에 대비합니다.
                return (0, jsx_runtime_1.jsx)(MainScreenLeft_1.default, { onNavigate: handleNavigate });
        }
    };
    const containerClass = `App-container ${isLoading ? 'loading-background' : 'main-background'}`;
    return ((0, jsx_runtime_1.jsxs)("div", { className: containerClass, children: [!isLoading && (0, jsx_runtime_1.jsx)(NotificationSystem_1.default, {}), isLoading ? (0, jsx_runtime_1.jsx)(LoadingScreen_1.default, { statusText: statusText }) : renderContent()] }));
}
exports.default = App;
