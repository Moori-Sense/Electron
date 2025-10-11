import React, { useEffect, useState } from "react";
import { AlertThresholds, Notification } from "../types/notification";
import { playCautionSound, playDangerSound } from "../utils/soundUtils";
import "./NotificationSystem.css";


const NotificationSystem: React.FC = () => {

    const [currentAlert, setCurrentAlert] = useState<Notification | null>(null);
    const [topNotifications, setTopNotifications] = useState<Notification[]>([]);
    const [lastAlertTime, setLastAlertTime] = useState<{[key: string]: number}>({});

    const [thresholds] = useState<AlertThresholds>({
        caution: 100,
        danger: 110
    });
    
    // 실시간 알림 감지 및 생성
    useEffect(() => {
        const checkTensionAlerts = async () => {
            // 최신 장력 데이터 가져오기
            const latestTensions = await window.api.getLatestTensions();

            // 모든 라인을 확인하여 임계값 초과하는 첫 번째 라인 찾기
            let alertLine = null;
            let alertType: 'caution' | 'danger' | null = null;
            let title = '';
            let message = '';

            for (const tensionData of latestTensions) {
                const {lineId, tension} = tensionData;

                if(tension >= thresholds.danger){
                    alertLine = tensionData;
                    alertType = 'danger';
                    title = `🚨 위험 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(1)}kN으로 위험 수준에 도달했습니다!`;
                    break; // 위험 수준이 가장 우선순위
                }else if(tension >= thresholds.caution){
                    alertLine = tensionData;
                    alertType = 'caution';
                    title = `⚠️ 주의 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(1)}kN으로 주의 수준에 도달했습니다.`;
                    // caution은 계속 확인하여 danger가 있는지 체크
                }
            }

            // 임계값을 초과한 라인이 있을 때 알림 생성
            if(alertLine && alertType){
                const alertKey = `${alertLine.lineId}-${alertType}`;
                const now = Date.now();
                const lastAlert = lastAlertTime[alertKey] || 0;
                
                // 같은 라인의 같은 타입 알림이 10초 이내에 발생했으면 소리만 재생하지 않음
                const shouldPlaySound = (now - lastAlert) > 10000;
                
                const newNotification: Notification = {
                    id: `${alertLine.lineId}-${Date.now()}`,
                    lineId: alertLine.lineId,
                    type: alertType,
                    title,
                    message,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    isActive: true,
                };

                // 알림 타입에 따른 소리 재생 (중복 방지)
                if (shouldPlaySound) {
                    if (alertType === 'danger') {
                        playDangerSound(); // 위험 알림: 연속 비프음
                    } else if (alertType === 'caution') {
                        playCautionSound(); // 주의 알림: 단일 비프음
                    }
                    setLastAlertTime(prev => ({ ...prev, [alertKey]: now }));
                }

                // 중앙 팝업이 없을 때만 중앙 팝업 표시
                if(!currentAlert){
                    setCurrentAlert(newNotification);
                    
                    // 5초 후 중앙 팝업 제거하고 상단 알림으로 이동
                    setTimeout(() => {
                        setCurrentAlert(null);
                        setTopNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // 최대 5개 유지
                    }, 5000);
                } else {
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
    }, [thresholds, lastAlertTime]);

    // 상단 알림 제거 함수
    const removeTopNotification = (notificationId: string) => {
        setTopNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    };


    return (
        <>
            {/* 상단 알림들 */}
            {topNotifications.length > 0 && (
                <div className="top-notifications">
                    {topNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`top-notification ${notification.type}`}
                        >
                            <div className="notification-icon">
                                {notification.type === 'danger' ? '🚨' : '⚠️'}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">{notification.title}</div>
                                <div className="notification-message">{notification.message}</div>
                            </div>
                            <button 
                                className="close-button"
                                onClick={() => removeTopNotification(notification.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 중앙 알림 팝업 */}
            {currentAlert && (
                <div className="alert-popup">
                    <div className={`alert-content ${currentAlert.type}`}>
                        <div className="alert-header">
                            <h3>{currentAlert.title}</h3>
                            <button 
                                className="close-button"
                                onClick={() => setCurrentAlert(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="alert-message">
                            {currentAlert.message}
                        </div>
                        <div className="alert-time">
                            {new Date(currentAlert.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
export default NotificationSystem;

