import React, { useEffect, useState } from "react";
import { AlertThresholds, Notification } from "../types/notification";
import "./NotificationSystem.css";


const NotificationSystem: React.FC = () => {

    const [currentAlert, setCurrentAlert] = useState<Notification | null>(null);

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

            // 임계값을 초과한 라인이 있고, 현재 알림이 없을 때만 알림 생성
            if(alertLine && alertType && !currentAlert){
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

                // 현재 알림으로 설정하고 5초 후 자동 제거
                setCurrentAlert(newNotification);
                
                // 5초 후 알림 제거
                setTimeout(() => {
                    setCurrentAlert(null);
                }, 5000);
            }
        };

        // 5초마다 장력 데이터 확인
        const interval = setInterval(checkTensionAlerts, 5000);

        // 초기 실행
        checkTensionAlerts();

        return () => clearInterval(interval);
    }, [thresholds]);


    return (
        <>
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

