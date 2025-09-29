import React, { useState, useEffect } from 'react';
import './App.css';

// --- 컴포넌트 임포트 ---
import LoadingScreen from './components/LoadingScreen';
import MainScreenRight from './components/MainScreenRight';
import MainScreenLeft from './components/MainScreenLeft';
import MainScreenSetting from './components/SettingScreen';

// --- 보여줄 화면 타입 정의 ---
export type ViewMode = 'right' | 'left' | 'settings';

function App() {
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true); 
  const [statusText] = useState('connecting with system...');
  
  // 현재 보여줄 화면 모드 관리. 기본값은 'right'(오른쪽 모드)
  const [currentView, setCurrentView] = useState<ViewMode>('right');

  useEffect(() => {
    // 3초 후 로딩 상태를 false로 변경
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, []);

  // currentView 상태에 따라 렌더링할 컴포넌트를 결정하는 함수
  const renderContent = () => {
    switch (currentView) {
      case 'left':
        return <MainScreenLeft onNavigate={setCurrentView} />;
      case 'settings':
        return <MainScreenSetting onNavigate={setCurrentView} currentMode={currentView} />;
      case 'right':
      default:
        return <MainScreenRight onNavigate={setCurrentView} />;
    }
  };

  const containerClass = `App-container ${isLoading ? 'loading-background' : 'main-background'}`;

  return (
    <div className={containerClass}>
      {/* isLoading이 true이면 LoadingScreen을, false이면 renderContent() 결과물을 보여줌 */}
      {isLoading ? <LoadingScreen statusText={statusText} /> : renderContent()}
    </div>
  );
}

export default App;