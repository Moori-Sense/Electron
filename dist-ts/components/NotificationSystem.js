"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./NotificationSystem.css");
const NotificationSystem = () => {
    const [currentAlert, setCurrentAlert] = (0, react_1.useState)(null);
    const [topNotifications, setTopNotifications] = (0, react_1.useState)([]);
    const [thresholds] = (0, react_1.useState)({
        caution: 100,
        danger: 110
    });
    // 실시간 알림 감지 및 생성
    (0, react_1.useEffect)(() => {
        const checkTensionAlerts = async () => {
            // 최신 장력 데이터 가져오기
            const latestTensions = await window.api.getLatestTensions();
            // 모든 라인을 확인하여 임계값 초과하는 첫 번째 라인 찾기
            let alertLine = null;
            let alertType = null;
            let title = '';
            let message = '';
            for (const tensionData of latestTensions) {
                const { lineId, tension } = tensionData;
                if (tension >= thresholds.danger) {
                    alertLine = tensionData;
                    alertType = 'danger';
                    title = `🚨 위험 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(1)}kN으로 위험 수준에 도달했습니다!`;
                    break; // 위험 수준이 가장 우선순위
                }
                else if (tension >= thresholds.caution) {
                    alertLine = tensionData;
                    alertType = 'caution';
                    title = `⚠️ 주의 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(1)}kN으로 주의 수준에 도달했습니다.`;
                    // caution은 계속 확인하여 danger가 있는지 체크
                }
            }
            // 임계값을 초과한 라인이 있을 때 알림 생성
            if (alertLine && alertType) {
                const newNotification = {
                    id: `${alertLine.lineId}-${Date.now()}`,
                    lineId: alertLine.lineId,
                    type: alertType,
                    title,
                    message,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isActive: true,
                };
                // 중앙 팝업이 없을 때만 중앙 팝업 표시
                if (!currentAlert) {
                    setCurrentAlert(newNotification);
                    // 5초 후 중앙 팝업 제거하고 상단 알림으로 이동
                    setTimeout(() => {
                        setCurrentAlert(null);
                        setTopNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // 최대 5개 유지
                    }, 5000);
                }
                else {
                    // 이미 중앙 팝업이 있으면 바로 상단 알림으로 추가
                    setTopNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
                }
            }
        };
        // 5초마다 장력 데이터 확인
        const interval = setInterval(checkTensionAlerts, 5000);
        // 초기 실행
        checkTensionAlerts();
        return () => clearInterval(interval);
    }, [thresholds]);
    // 상단 알림 제거 함수
    const removeTopNotification = (notificationId) => {
        setTopNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [topNotifications.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "top-notifications", children: topNotifications.map(notification => ((0, jsx_runtime_1.jsxs)("div", { className: `top-notification ${notification.type}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "notification-icon", children: notification.type === 'danger' ? '🚨' : '⚠️' }), (0, jsx_runtime_1.jsxs)("div", { className: "notification-content", children: [(0, jsx_runtime_1.jsx)("div", { className: "notification-title", children: notification.title }), (0, jsx_runtime_1.jsx)("div", { className: "notification-message", children: notification.message })] }), (0, jsx_runtime_1.jsx)("button", { className: "close-button", onClick: () => removeTopNotification(notification.id), children: "\u2715" })] }, notification.id))) })), currentAlert && ((0, jsx_runtime_1.jsx)("div", { className: "alert-popup", children: (0, jsx_runtime_1.jsxs)("div", { className: `alert-content ${currentAlert.type}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "alert-header", children: [(0, jsx_runtime_1.jsx)("h3", { children: currentAlert.title }), (0, jsx_runtime_1.jsx)("button", { className: "close-button", onClick: () => setCurrentAlert(null), children: "\u2715" })] }), (0, jsx_runtime_1.jsx)("div", { className: "alert-message", children: currentAlert.message }), (0, jsx_runtime_1.jsx)("div", { className: "alert-time", children: new Date(currentAlert.timestamp).toLocaleString() })] }) }))] }));
};
exports.default = NotificationSystem;
