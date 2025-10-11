// 소리 재생을 위한 유틸리티 함수들

export interface SoundConfig {
    frequency: number;
    duration: number;
    volume: number;
    type: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

// 기본 소리 설정
export const SOUND_CONFIGS = {
    caution: {
        frequency: 800,
        duration: 200,
        volume: 0.3,
        type: 'sine' as const
    },
    danger: {
        frequency: 1200,
        duration: 300,
        volume: 0.5,
        type: 'square' as const
    }
};

// Web Audio API를 사용한 소리 재생 함수
export const playSound = (config: SoundConfig): void => {
    try {
        // AudioContext 생성 (브라우저 호환성을 위해)
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        
        // 오실레이터 노드 생성
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 오실레이터 설정
        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
        
        // 볼륨 설정
        gainNode.gain.setValueAtTime(config.volume, audioContext.currentTime);
        
        // 노드 연결
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // 소리 재생
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + config.duration / 1000);
        
        // AudioContext 정리
        setTimeout(() => {
            audioContext.close();
        }, config.duration + 100);
        
    } catch (error) {
        console.warn('소리 재생 실패:', error);
    }
};

// 알림 타입에 따른 소리 재생
export const playNotificationSound = (type: 'caution' | 'danger'): void => {
    const config = SOUND_CONFIGS[type];
    playSound(config);
};

// 위험 알림용 연속 비프음 (3번 반복)
export const playDangerSound = (): void => {
    const config = SOUND_CONFIGS.danger;
    
    // 3번 반복하여 재생
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            playSound(config);
        }, i * 400); // 400ms 간격으로 반복
    }
};

// 주의 알림용 단일 비프음
export const playCautionSound = (): void => {
    playNotificationSound('caution');
};
