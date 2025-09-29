import React, { useState, useEffect } from 'react';
// --- 이미지 파일 임포트 ---
import ship from '../assets/ship.png';
import graph_icon from '../assets/icon_graph.png';
import setting_icon from '../assets/icon_setting.png';
import dock from '../assets/dock_good_nu5.png';
// --- 날씨 컴포넌트 임포트 ---
import { WeatherDisplay } from './WeatherDisplay';
// --- ✨ App.tsx로부터 ViewMode 타입을 가져옵니다 ---
import { ViewMode } from '../App';

// --- 데이터 타입 정의 ---
interface MooringLineData {
  id: string;
  tension: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  material?: string;
  lastInspected?: string;
  diameter?: number;
}

// --- 자식 컴포넌트: 계류줄 정보 모달 ---
interface LineInfoModalProps {
  line: MooringLineData;
  onClose: () => void;
}

const LineInfoModal = ({ line, onClose }: LineInfoModalProps): JSX.Element => {
  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <h2>{line.id} 상세 정보</h2>
        <p><strong>현재 장력:</strong> {line.tension.toFixed(1)}t</p>
        <p><strong>재질:</strong> {line.material || '정보 없음'}</p>
        <p><strong>직경:</strong> {line.diameter ? `${line.diameter}mm` : '정보 없음'}</p>
        <p><strong>최종 검사일:</strong> {line.lastInspected || '정보 없음'}</p>
        <button style={modalStyles.closeButton} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

// 모달 스타일 (기존 코드와 동일)
const modalStyles: { [key: string]: React.CSSProperties } = {
    backdrop: {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#2c3e50',
        padding: '20px 40px',
        borderRadius: '8px',
        color: 'white',
        border: '1px solid #7f8c8d',
    },
    closeButton: {
        marginTop: '20px',
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
    }
};

// --- 자식 컴포넌트: 계류줄 ---
interface MooringLineProps {
  line: MooringLineData;
  onClick: () => void;
}

const MooringLine = ({ line, onClick }: MooringLineProps): JSX.Element => {
  const LINE_THICKNESS = 4;
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <line
        x1={line.startX} y1={line.startY}
        x2={line.endX} y2={line.endY}
        stroke={getLineColorByTension(line.tension)}
        strokeWidth={LINE_THICKNESS}
      />
      <text
        x={(line.startX + line.endX) / 2} y={(line.startY + line.endY) / 2 - 15}
        fill="white" fontSize="16" textAnchor="middle"
      >
        {`${line.id}: ${line.tension.toFixed(1)}t`}
      </text>
    </g>
  );
};

// --- 자식 컴포넌트: 아이콘과 레이블 ---
interface IconWithLabelProps {
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  onClick: () => void;
}

const IconWithLabel = ({ href, x, y, width, height, label, onClick }: IconWithLabelProps): JSX.Element => {
    const yAlignmentCorrection = 2;
    return (
      <g style={{ cursor: 'pointer' }} onClick={onClick}>
        <image href={href} x={x} y={y} width={width} height={height} />
        <text
          x={x + width + 15}
          y={y + height / 2 + yAlignmentCorrection}
          fill="white"
          fontSize="18"
          dominantBaseline="middle"
        >
          {label}
        </text>
      </g>
    );
};

const getLineColorByTension = (tension: number): string => {
  if (tension >= 12.0) return '#ff4d4d';
  if (tension >= 10.0) return '#ffc107';
  if(tension === 0.0) return '#a6aaadff';
  return '#4caf50';
};

// --- ✨ 1. Props 타입 정의: onNavigate 함수를 받도록 설정 ---
interface MainScreenRightProps {
  onNavigate: (view: ViewMode) => void;
}

// --- ✨ 2. 컴포넌트 이름 변경 및 Props 적용 ---
export const MainScreenRight = ({ onNavigate }: MainScreenRightProps): JSX.Element => {
  // --- 기존 MooringDiagram의 모든 로직은 그대로 유지 ---
  const SHIP_WIDTH = 650;
  const SHIP_HEIGHT = 1300;
  const SHIP_CENTER_X = 500;
  const SHIP_CENTER_Y = 400;

  const shipX = SHIP_CENTER_X - SHIP_WIDTH / 2;
  const shipY = SHIP_CENTER_Y - SHIP_HEIGHT / 2;

  const DOCK_WIDTH = 700;
  const DOCK_HEIGHT = 1600;
  const DOCK_CENTER_Y = SHIP_CENTER_Y;
  const dockX = -200;
  const dockY = DOCK_CENTER_Y - DOCK_HEIGHT / 2;

  const bollardPositions = {
    line_1: { x: 286, y: 390 }, line_2: { x: 273, y: 440 },
    line_3: { x: 268, y: 850 }, line_4: { x: 272, y: 900 },
    line_5: { x: 365, y: 900 }, line_6: { x: 374, y: 850 },
    line_7: { x: 370, y: 440 }, line_8: { x: 351, y: 390 },
  };

  const pierCleatPositions = {
    cleat1: { x: 250, y: 130 }, cleat2: { x: 250, y: 220},
    cleat3: { x: 250, y: 590 }, cleat4: { x: 250, y: 660 },
    cleat5: { x: 580, y: 700 }, cleat6: { x: 580, y: 570 },
    cleat7: { x: 580, y: 230 }, cleat8: { x: 580, y: 100 },
  };

  const iconPositions = {
    graph:   { x: 760, y: 700, width: 20, height: 20 , label : '계류줄 장력 그래프'},
    setting: { x: 1000, y: 700, width: 20, height: 20 ,label : '설정'},
  };

  const [lines, setLines] = useState<MooringLineData[]>([
    { id: 'Line 8', tension: 8.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-01', startX: shipX + bollardPositions.line_1.x, startY: shipY + bollardPositions.line_1.y, endX: pierCleatPositions.cleat1.x, endY: pierCleatPositions.cleat1.y },
    { id: 'Line 7', tension: 9.2,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-02', startX: shipX + bollardPositions.line_2.x, startY: shipY + bollardPositions.line_2.y, endX: pierCleatPositions.cleat2.x, endY: pierCleatPositions.cleat2.y },
    { id: 'Line 6', tension: 8.8,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-03', startX: shipX + bollardPositions.line_3.x, startY: shipY + bollardPositions.line_3.y, endX: pierCleatPositions.cleat3.x, endY: pierCleatPositions.cleat3.y },
    { id: 'Line 5', tension: 9.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-04', startX: shipX + bollardPositions.line_4.x, startY: shipY + bollardPositions.line_4.y, endX: pierCleatPositions.cleat4.x, endY: pierCleatPositions.cleat4.y },
    { id: 'Line 4', tension: 12.1, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-11', startX: shipX + bollardPositions.line_5.x, startY: shipY + bollardPositions.line_5.y, endX: pierCleatPositions.cleat5.x, endY: pierCleatPositions.cleat5.y },
    { id: 'Line 3', tension: 11.5, material: 'Polyester', diameter: 85, lastInspected: '2025-09-12', startX: shipX + bollardPositions.line_6.x, startY: shipY + bollardPositions.line_6.y, endX: pierCleatPositions.cleat6.x, endY: pierCleatPositions.cleat6.y },
    { id: 'Line 2', tension: 11.8, material: 'Polyester', diameter: 85, lastInspected: '2025-09-13', startX: shipX + bollardPositions.line_7.x, startY: shipY + bollardPositions.line_7.y, endX: pierCleatPositions.cleat7.x, endY: pierCleatPositions.cleat7.y },
    { id: 'Line 1', tension: 12.5, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-14', startX: shipX + bollardPositions.line_8.x, startY: shipY + bollardPositions.line_8.y, endX: pierCleatPositions.cleat8.x, endY: pierCleatPositions.cleat8.y },
  ]);

  const [selectedLine, setSelectedLine] = useState<MooringLineData | null>(null);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setLines(currentLines =>
        currentLines.map(line => {
          const lineNumber = parseInt(line.id.split(' ')[1]);
          if (lineNumber<= 4) {
            return { ...line, tension: 0 };
          }
          return { ...line, tension: Math.random() * 6 + 7 };
        })
      );
    }, 2000);
    return () => clearInterval(simulationInterval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      
      <div style={{
        position: 'absolute',
        top: '50px',
        right: '175px',
        zIndex: 10,
        color: 'white',
        backgroundColor: 'rgba(44, 62, 80, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #7f8c8d'
      }}>
        <WeatherDisplay />
      </div>

      <svg
        viewBox="0 0 1200 800"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <image href={dock} x={dockX} y={dockY} width={DOCK_WIDTH} height={DOCK_HEIGHT} />
        <image href={ship} x={shipX} y={shipY} width={SHIP_WIDTH} height={SHIP_HEIGHT} />
        
        {lines.map((line) => (
          <MooringLine
            key={line.id}
            line={line}
            onClick={() => setSelectedLine(line)}
          />
        ))}

        <IconWithLabel
          href={graph_icon}
          {...iconPositions.graph}
          onClick={() => alert('계류줄 그래프 보기')}
        />
        {/* --- ✨ 3. onClick 이벤트 수정 --- */}
        <IconWithLabel
          href={setting_icon}
          {...iconPositions.setting}
          onClick={() => onNavigate('settings')}
        />
      </svg>
      
      {selectedLine && (
        <LineInfoModal line={selectedLine} onClose={() => setSelectedLine(null)} />
      )}
    </div>
  );
};

export default MainScreenRight;