import React, { useState } from 'react'; // useState import 추가
import { ViewMode } from './types'; // App.tsx에서 ViewMode 타입을 가져옵니다.

// --- 1. Props 타입 정의 ---
// onNavigate: 화면 전환 함수
// currentMode: 현재 활성화된 모드 ('right' 또는 'left')
interface MainScreenSettingProps {
  onNavigate: (view: ViewMode) => void;
  currentMode: ViewMode;
}

// --- 메인 설정 화면 컴포넌트 ---
export const MainScreenSetting = ({ onNavigate, currentMode }: MainScreenSettingProps): JSX.Element => {

  // ✨ 1. 거리 설정 관련 상태 정의
  const [distanceInput, setDistanceInput] = useState<string>('150.7');
  const [sendFeedback, setSendFeedback] = useState<string>('');

  // ✨ 2. 거리 전송 핸들러
  const handleSendDistance = () => {
    const distance = parseFloat(distanceInput);
    
    if (isNaN(distance) || distance < 0) {
        setSendFeedback('❌ 오류: 0 이상의 유효한 숫자 거리를 입력해주세요.');
        return;
    }
    
    setSendFeedback('아두이노로 전송 중...');

    // 💡 Electron 메인 프로세스의 IPC 함수 호출 (이 함수는 메인 프로세스에서 시리얼 통신을 수행해야 합니다)
    if (window.api && window.api.sendDistanceToArduino) {
        window.api.sendDistanceToArduino(distance)
            .then(() => {
                setSendFeedback(`✅ 거리 ${distance.toFixed(1)}m 아두이노로 전송 완료.`);
            })
            .catch((error: Error) => {
                setSendFeedback(`❌ 전송 오류: 시리얼 포트 연결 확인 필요. (${error.message})`);
                console.error('Serial Send Error:', error);
            });
    } else {
        // IPC 브릿지가 정의되지 않은 환경 (디버깅 목적)
        setSendFeedback(`⚠️ 경고: IPC가 설정되지 않았습니다. (값: ${distance.toFixed(1)}m)`);
        console.warn('IPC function not found. Running mock send.');
    }
  };


  // 현재 선택된 모드에 따라 버튼 스타일을 다르게 적용하기 위한 함수
  const getButtonStyle = (mode: ViewMode) => {
    return currentMode === mode ? activeButtonStyle : inactiveButtonStyle;
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headerStyle}>설정</h1>
        
        {/* --- 💡 1. 표시 모드 선택 섹션 --- */}
        <p style={labelStyle}>표시 모드 선택</p>
        <div style={buttonGroupStyle}>
          {/* 왼쪽 모드 선택 버튼 */}
          <button 
            style={getButtonStyle('left')}
            onClick={() => onNavigate('left')}
          >
            왼쪽 모드
          </button>

          {/* 오른쪽 모드 선택 버튼 */}
          <button 
            style={getButtonStyle('right')}
            onClick={() => onNavigate('right')}
          >
            오른쪽 모드
          </button>
        </div>
        <p style={descriptionStyle}>
          선택한 모드의 선박 화면으로 돌아갑니다.
        </p>

        {/* --- --- --- --- --- --- --- --- --- --- */}

        <div style={dividerStyle}></div>

        {/* --- 💡 2. 선박-항만 거리 설정 섹션 --- */}
        <p style={labelStyle}>선박-항만 거리 설정 (아두이노 전송)</p>
        <div style={inputGroupStyle}>
            <input
                type="number"
                step="0.1"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
                style={inputStyle}
            />
            <span style={{ color: '#ecf0f1', paddingRight: '10px' }}>미터 (m)</span>
            <button
                onClick={handleSendDistance}
                style={sendButtonStyle}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
            >
                아두이노 전송
            </button>
        </div>
        {sendFeedback && (
            <p style={{ 
                marginTop: '15px', 
                fontSize: '0.9rem', 
                color: sendFeedback.startsWith('❌') ? '#e74c3c' : sendFeedback.startsWith('✅') ? '#4caf50' : '#bdc3c7' 
            }}>
                {sendFeedback}
            </p>
        )}
        <p style={descriptionStyle}>
          입력된 거리 값은 시리얼 통신을 통해 아두이노로 전달됩니다.
        </p>
      </div>
    </div>
  );
};

// --- 스타일 객체 ---

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#c9d7e4',
  fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
};

const contentStyle: React.CSSProperties = {
  backgroundColor: 'rgba(44, 62, 80, 0.9)',
  padding: '40px 60px',
  borderRadius: '12px',
  border: '1px solid #7f8c8d',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  maxWidth: '500px', // 내용이 늘어나도 보기 좋게 조정
};

const headerStyle: React.CSSProperties = {
  margin: '0 0 30px 0',
  fontSize: '2rem',
  fontWeight: 600,
  borderBottom: '1px solid rgba(127, 140, 141, 0.3)',
  paddingBottom: '20px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '1rem',
  opacity: 0.8,
  marginBottom: '15px',
  marginTop: '20px', // 위쪽 섹션과 분리
  fontWeight: 'bold',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '10px',
  justifyContent: 'center',
};

const baseButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '1rem',
  border: '1px solid #7f8c8d',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background-color 0.2s, color 0.2s',
  minWidth: '150px',
};

// 비활성화 상태 버튼 스타일
const inactiveButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: 'transparent',
  color: '#c9d7e4',
};

// 활성화(선택된) 상태 버튼 스타일
const activeButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#3498db',
  color: 'white',
  borderColor: '#3498db',
};

const descriptionStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    opacity: 0.7,
    marginTop: '10px',
};

const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgba(127, 140, 141, 0.3)',
    margin: '30px 0',
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
};

const inputStyle: React.CSSProperties = {
    padding: '10px', 
    borderRadius: '5px', 
    border: '1px solid #7f8c8d', 
    width: '100px', 
    backgroundColor: '#2c3e50', 
    color: 'white',
    textAlign: 'right',
};

const sendButtonStyle: React.CSSProperties = {
    padding: '10px 18px', 
    borderRadius: '5px', 
    backgroundColor: '#3498db', 
    color: 'white', 
    border: 'none', 
    cursor: 'pointer',
    transition: 'background-color 0.2s',
};


export default MainScreenSetting;
