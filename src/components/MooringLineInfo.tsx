import React from 'react';
import { ViewMode } from './types';

// --- 데이터 타입 정의 ---
interface MooringLineDetails {
  id: number;
  length: number;
  usageTime: number;
  manufacturer: string;
  model: string;
  maintenanceDate: string;
}
interface TensionLog {
  time: string;
  tension: number;
}

// --- Props 타입 정의 ---
interface MooringLineInfoProps {
  onNavigate: (view: ViewMode) => void;
  // ✨ 1. 어느 화면에서 왔는지 기억하기 위한 prop 추가
  previousViewMode: ViewMode; 
  lineDetails: MooringLineDetails;
  tensionHistory: TensionLog[];
}

// --- 계류줄 상세 정보 화면 컴포넌트 ---
export const MooringLineInfo = ({ onNavigate, previousViewMode, lineDetails, tensionHistory }: MooringLineInfoProps): JSX.Element => {
  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={headerStyle}>
          <h1>계류줄 #{lineDetails.id} 상세 정보</h1>
          {/* ✨ 2. 'main' 대신 prop으로 받은 previousViewMode로 돌아가도록 수정 */}
          <button style={backButtonStyle} onClick={() => onNavigate(previousViewMode)}>
            &larr; 이전 화면으로 돌아가기
          </button>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div style={mainContentStyle}>
          {/* ... (나머지 코드는 동일) ... */}
          <div style={infoPanelStyle}>
            <h2 style={sectionHeaderStyle}>기본 정보</h2>
            <InfoRow label="제조사" value={lineDetails.manufacturer} />
            <InfoRow label="모델" value={lineDetails.model} />
            <InfoRow label="길이" value={`${lineDetails.length}m`} />
            <InfoRow label="총 사용시간" value={`${lineDetails.usageTime} 시간`} />
            <InfoRow label="마지막 정비일" value={lineDetails.maintenanceDate} />
          </div>
          <div style={dataPanelStyle}>
            <div style={graphContainerStyle}>
              <h2 style={sectionHeaderStyle}>최근 12시간 장력 이력</h2>
              <div style={graphPlaceholderStyle}>
                <p>장력 그래프가 여기에 표시됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- (하위 컴포넌트 및 스타일은 동일하여 생략) ---

// --- 하위 컴포넌트: 정보 행 ---
const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div style={infoRowStyle}>
      <span style={infoLabelStyle}>{label}</span>
      <span style={infoValueStyle}>{value}</span>
    </div>
  );
  
  
  // --- 스타일 객체 ---
  
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#c9d7e4',
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    padding: '20px',
    boxSizing: 'border-box'
  };
  
  const contentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '1200px',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
    padding: '30px 40px',
    borderRadius: '12px',
    border: '1px solid #7f8c8d',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '0 0 30px 0',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(127, 140, 141, 0.3)',
  };
  
  const backButtonStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #7f8c8d',
    color: '#c9d7e4',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s, color 0.2s',
  };
  
  const mainContentStyle: React.CSSProperties = {
    display: 'flex',
    gap: '40px',
  };
  
  const infoPanelStyle: React.CSSProperties = {
    flex: 1,
  };
  
  const dataPanelStyle: React.CSSProperties = {
    flex: 2,
  };
  
  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: '0 0 20px 0',
    color: '#3498db'
  };
  
  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(127, 140, 141, 0.1)',
  };
  
  const infoLabelStyle: React.CSSProperties = {
    opacity: 0.8,
  };
  
  const infoValueStyle: React.CSSProperties = {
    fontWeight: 600,
  };
  
  const graphContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '300px', // 그래프 높이
  };
  
  const graphPlaceholderStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    border: '1px dashed #7f8c8d',
  };

export default MooringLineInfo;

