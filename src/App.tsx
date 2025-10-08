import React, { useState, useEffect } from 'react';
import './App.css';

// --- 컴포넌트 임포트 ---
import LoadingScreen from './components/LoadingScreen';
import MainScreenRight from './components/MainScreenRight';
import MainScreenLeft from './components/MainScreenLeft';
import MainScreenSetting from './components/SettingScreen';
//import MooringLineInfo from './components/MooringLineInfo';
import TensionGraphScreen from './components/TensionGraph';
import NotificationSystem from './components/NotificationSystem';

// --- 타입 정의 임포트 ---
import { ViewMode, LineData } from './components/types';

interface HistoryData {
  timestamp: string;
  [key: string]: number | string;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [statusText] = useState('connecting with system...');
  const [currentView, setCurrentView] = useState<ViewMode>('right');
  
  // ✨ 1. 이전 뷰를 저장하기 위한 별도의 state를 추가합니다.
  const [previousView, setPreviousView] = useState<ViewMode>('right');
  
  const [selectedLine, setSelectedLine] = useState<LineData | null>(null);
  const [tensionHistory, setTensionHistory] = useState<HistoryData[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  const handleUpdateHistory = (latestTensions: { [key: string]: number }) => {
    const now = new Date();
    const newHistoryEntry: HistoryData = {
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
  const handleNavigate = (newView: ViewMode) => {
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
        return (
          <MainScreenRight 
            onNavigate={handleNavigate} 
          />
        ); 
      case 'left':
        return (
          <MainScreenLeft 
            onNavigate={handleNavigate}
          />
        );
      case 'allTension':
        return <TensionGraphScreen onGoBack={handleGoBack} />;
      case 'settings':
        return <MainScreenSetting onNavigate={setCurrentView} currentMode={currentView} />;
      default:
        // default는 그대로 유지하여 예외 상황에 대비합니다.
        return <MainScreenLeft onNavigate={handleNavigate}/>;
    }
  };

  const containerClass = `App-container ${isLoading ? 'loading-background' : 'main-background'}`;

  return (
    <div className={containerClass}>
      {!isLoading && <NotificationSystem />}
      {isLoading ? <LoadingScreen statusText={statusText} /> : renderContent()}
    </div>
  );

}
export default App;