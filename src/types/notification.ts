

export interface Notification{
    id: string;
    lineId: number;
    type: 'caution' | 'danger';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    isActive: boolean;
}

export interface AlertThresholds{
    caution: number;
    danger: number;
}

export interface NotificationState{
    notifications: Notification[];
    unreadCount: number;
    isVisible: boolean;
}