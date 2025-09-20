import { useState, useEffect } from 'react';
import './App.css';
import LoadingScreen from './components/LoadingScreen'; // LoadingScreen 임포트
import MainScreen from './components/MainScreen';     // MainScreen 임포트

// declare global 부분은 이제 실제 API를 호출하지 않으므로 주석 처리하거나 삭제해도 됩니다.
/*
declare global {
  interface Window {
    api: {
      connectToArduino: () => Promise<{ success: boolean; message: string }>;
    };
  }
}
*/

function App() {
  // '연결 완료' 상태를 기억하는 변수. 초기값은 false
  const [isConnected, setIsConnected] = useState(false); 
  // statusText는 LoadingScreen 컴포넌트가 props로 받고 있으므로 그대로 둡니다.
  const [statusText, setStatusText] = useState('connecting with system...');

  useEffect(() => {
    // 3초(3000ms) 후에 isConnected 상태를 true로 변경하는 타이머 설정
    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 3000); 

    // 컴포넌트가 언마운트될 때 타이머를 정리해주는 것이 좋습니다. (메모리 누수 방지)
    return () => clearTimeout(timer);
  }, []); // 빈 배열: 컴포넌트가 처음 렌더링될 때 한 번만 실행

  let containerClass = isConnected ? 'App-container main-background' : 'App-container loading-background';


  return (
    <div className={containerClass}>
      {/* isConnected가 true이면 MainScreen을, false이면 LoadingScreen을 보여줌 */}
      {isConnected ? <MainScreen /> : <LoadingScreen statusText={statusText} />}
    </div>
  );
}

export default App;