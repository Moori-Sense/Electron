import React, { useEffect, useState } from "react";
import { AlertThresholds, NotificationState, Notification } from "../types/notification";


interface NotificationSystemProps{
    onNotificationClick?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({onNotificationClick}) => {
    const [notificationState, setNotificationState] = useState<NotificationState>({
        notifications: [],
        unreadCount: 0,
        isVisible: false
    });

    const [thresholds] = useState<AlertThresholds>({
        caution: 50,
        danger: 80
    });
    
    // 실시간 알림 감지 및 생성
    useEffect(() => {
        const checkTensionAlerts = async () => {
            // 최신 장력 데이터 가져오기
            const latestTensions = await window.api.getLatestTensions();

            latestTensions.forEach((tensionData: any) => {
                const {lineId, tension} = tensionData;

                // 임계값 확인 및 알림 생성
                let alertType: 'caution' | 'danger' | null = null;
                let title = '';
                let message = '';

                if(tension >= thresholds.danger){
                    alertType = 'danger';
                    title = `위험 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(1)}KN으로 위험 수준에 도달했습니다!`;
                }else if(tension >= thresholds.caution){
                    alertType = 'caution';
                    title = `주의 알림 - Line ${lineId}`;
                    message = `장력이 ${tension.toFixed(2)}kN으로 주의 수준에 도달했습니다.`;
                }

                if(alertType){
                    const newNotification: Notification = {
                        id: `${lineId}-${Date.now()}`,
                        lineId,
                        type: alertType,
                        title,
                        message,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        isActive: true,
                    };

                    setNotificationState(prev => ({
                        ...prev, 
                        notifications: [newNotification, ...prev.notifications.slice(0, 49)], // 최대 50개 유지
                        unreadCount: prev.unreadCount + 1,
                    }));
                }
            });
        };

        // 5초마다 장력 데이터 확인
        const interval = setInterval(checkTensionAlerts, 5000);

        // 초기 실행
        checkTensionAlerts();

        return () => clearInterval(interval);
    }, [thresholds]);

    // 알림 읽음 처리
    const markAsRead = (notificationId: string) => {
        setNotificationState(prev => ({
            ...prev,
            notifications: prev.notifications.map(notif =>
                notif.id === notificationId ? {...notif, isRead: true}: notif
            ),
            unreadCount: Math.max(0, prev.unreadCount -1)
        }));
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotificationState(prev => ({
            ...prev,
            notifications: prev.notifications.map(notif => ({...notif, isRead: true})),
            unreadCount: 0,
        }));
    };

    // 알림 삭제
    const removeNotification = (notificationId: string) => {
        setNotificationState(prev => ({
            ...prev,
            notifications: prev.notifications.filter(notif => notif.id !== notificationId),
            unreadCount: prev.notifications.find(notif => notif.id === notificationId)?.isRead ? prev.unreadCount : Math.max(0, prev.unreadCount -1)
        }));
    };

    // 알림 클릭 처리
    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        onNotificationClick?.(notification);
    };

    return (
    <div className="notification-system">
      {/* 알림 버튼 */}
      <button 
        className="notification-button"
        onClick={() => setNotificationState(prev => ({ ...prev, isVisible: !prev.isVisible }))}
      >
        🔔 알림
        {notificationState.unreadCount > 0 && (
          <span className="notification-badge">{notificationState.unreadCount}</span>
        )}
      </button>

      {/* 알림 패널 */}
      {notificationState.isVisible && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>알림</h3>
            <div className="notification-actions">
              <button onClick={markAllAsRead}>모두 읽음</button>
              <button onClick={() => setNotificationState(prev => ({ ...prev, isVisible: false }))}>
                ✕
              </button>
            </div>
          </div>
          
          <div className="notification-list">
            {notificationState.notifications.length === 0 ? (
              <div className="no-notifications">새로운 알림이 없습니다.</div>
            ) : (
              notificationState.notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <button 
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationSystem;

