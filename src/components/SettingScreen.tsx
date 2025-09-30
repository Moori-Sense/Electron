import React from 'react';
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

  // 현재 선택된 모드에 따라 버튼 스타일을 다르게 적용하기 위한 함수
  const getButtonStyle = (mode: ViewMode) => {
    return currentMode === mode ? activeButtonStyle : inactiveButtonStyle;
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headerStyle}>설정</h1>
        
        <p style={labelStyle}>표시 모드 선택</p>
        <div style={buttonGroupStyle}>
          {/* 왼쪽 모드 선택 버튼 */}
          <button 
            style={getButtonStyle('left')}
            onClick={() => onNavigate('left')}
          >
            왼쪽 모드
          </button>

          {/* 왼쪽 모드 선택 버튼 */}
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
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  marginBottom: '30px',
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
};


export default MainScreenSetting;