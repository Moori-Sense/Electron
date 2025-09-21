import React, { useState, useEffect } from 'react';
// --- 이미지 파일 임포트 ---
import ship from '../assets/ship.png';
import graph_icon from '../assets/icon_graph.png';
import setting_icon from '../assets/icon_setting.png';

// --- 데이터 타입 정의 (TypeScript) ---
interface MooringLineData {
  id: string;
  tension: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  // 💡 1. 데이터베이스에서 가져왔다고 가정한 상세 정보를 추가합니다.
  material?: string;       // 계류줄의 재질
  lastInspected?: string;  // 마지막 검사일
  diameter?: number;       // 직경 (mm)
}

// --- 전역 설정값 ---
const SHIP_WIDTH = 650;
const SHIP_HEIGHT = 1300;
const SHIP_CENTER_X = 350;
const SHIP_CENTER_Y = 400;

const getLineColorByTension = (tension: number): string => {
  if (tension >= 12.0) return '#ff4d4d';
  if (tension >= 10.0) return '#ffc107';
  return '#4caf50';
};

// --- 자식 컴포넌트: 계류줄 정보 모달 ---
// 💡 2. 클릭된 계류줄의 상세 정보를 보여주기 위한 모달 컴포넌트를 새로 만듭니다.
interface LineInfoModalProps {
  line: MooringLineData; // 표시할 계류줄의 데이터
  onClose: () => void;   // 모달을 닫는 함수
}

const LineInfoModal = ({ line, onClose }: LineInfoModalProps): JSX.Element => {
  return (
    // 모달 배경 (어둡게 처리)
    <div style={modalStyles.backdrop} onClick={onClose}>
      {/* 모달 컨텐츠 (배경 클릭 시 이벤트 전파 방지) */}
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

// 모달에 적용될 스타일 객체
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
  // 💡 3. 부모 컴포넌트로부터 클릭 이벤트를 처리할 함수를 props로 받습니다.
  onClick: () => void;
}

// --- 자식 컴포넌트: 계류줄 ---
interface MooringLineProps {
  line: MooringLineData;
  onClick: () => void;
}

const MooringLine = ({ line, onClick }: MooringLineProps): JSX.Element => {
  const LINE_THICKNESS = 4;
  return (
    // 이 <g> 태그에 onClick이 적용되어 있어, 내부의 line과 text 모두에 클릭이 적용됩니다.
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
        // 👇 이 부분의 style={{ pointerEvents: 'none' }} 속성을 제거했습니다.
        // 이제 텍스트도 클릭 이벤트에 정상적으로 반응합니다.
      >
        {`${line.id}: ${line.tension.toFixed(1)}t`}
      </text>
    </g>
  );
};

// --- 자식 컴포넌트: 아이콘과 레이블 ---
// (이전 코드와 동일)
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

// --- 메인 다이어그램 컴포넌트 ---
export const MooringDiagram = (): JSX.Element => {
  const shipX = SHIP_CENTER_X - SHIP_WIDTH / 2;
  const shipY = SHIP_CENTER_Y - SHIP_HEIGHT / 2;

  const bollardPositions = {
    line_1: { x: 286, y: 390 }, line_2: { x: 273, y: 440 },
    line_3: { x: 268, y: 850 }, line_4: { x: 272, y: 900 },
    line_5: { x: 365, y: 900 }, line_6: { x: 374, y: 850 },
    line_7: { x: 370, y: 440 }, line_8: { x: 351, y: 390 },
  };

  const pierCleatPositions = {
    cleat1: { x: 100, y: 100 }, cleat2: { x: 100, y: 230},
    cleat3: { x: 100, y: 570 }, cleat4: { x: 100, y: 700 },
    cleat5: { x: 580, y: 700 }, cleat6: { x: 580, y: 570 },
    cleat7: { x: 580, y: 230 }, cleat8: { x: 580, y: 100 },
  };

  const iconPositions = {
    graph:   { x: 900, y: 630, width: 30, height: 30 , label : '계류줄 장력 그래프'},
    setting: { x: 900, y: 690, width: 30, height: 30 ,label : '설정'},
  };

  const [lines, setLines] = useState<MooringLineData[]>([
    // 💡 4. 초기 데이터에 DB에서 가져온 가상의 상세 정보를 추가합니다.
    { id: 'Line 1', tension: 8.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-01', startX: shipX + bollardPositions.line_1.x, startY: shipY + bollardPositions.line_1.y, endX: pierCleatPositions.cleat1.x, endY: pierCleatPositions.cleat1.y },
    { id: 'Line 2', tension: 9.2,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-02', startX: shipX + bollardPositions.line_2.x, startY: shipY + bollardPositions.line_2.y, endX: pierCleatPositions.cleat2.x, endY: pierCleatPositions.cleat2.y },
    { id: 'Line 3', tension: 8.8,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-03', startX: shipX + bollardPositions.line_3.x, startY: shipY + bollardPositions.line_3.y, endX: pierCleatPositions.cleat3.x, endY: pierCleatPositions.cleat3.y },
    { id: 'Line 4', tension: 9.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-04', startX: shipX + bollardPositions.line_4.x, startY: shipY + bollardPositions.line_4.y, endX: pierCleatPositions.cleat4.x, endY: pierCleatPositions.cleat4.y },
    { id: 'Line 5', tension: 12.1, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-11', startX: shipX + bollardPositions.line_5.x, startY: shipY + bollardPositions.line_5.y, endX: pierCleatPositions.cleat5.x, endY: pierCleatPositions.cleat5.y },
    { id: 'Line 6', tension: 11.5, material: 'Polyester', diameter: 85, lastInspected: '2025-09-12', startX: shipX + bollardPositions.line_6.x, startY: shipY + bollardPositions.line_6.y, endX: pierCleatPositions.cleat6.x, endY: pierCleatPositions.cleat6.y },
    { id: 'Line 7', tension: 11.8, material: 'Polyester', diameter: 85, lastInspected: '2025-09-13', startX: shipX + bollardPositions.line_7.x, startY: shipY + bollardPositions.line_7.y, endX: pierCleatPositions.cleat7.x, endY: pierCleatPositions.cleat7.y },
    { id: 'Line 8', tension: 12.5, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-14', startX: shipX + bollardPositions.line_8.x, startY: shipY + bollardPositions.line_8.y, endX: pierCleatPositions.cleat8.x, endY: pierCleatPositions.cleat8.y },
  ]);

  // 💡 5. 어떤 계류줄이 선택되었는지 상태로 관리합니다.
  // 초기값은 null로, 아무것도 선택되지 않았음을 의미합니다.
  const [selectedLine, setSelectedLine] = useState<MooringLineData | null>(null);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setLines(currentLines =>
        currentLines.map(line => ({ ...line, tension: Math.random() * 6 + 7 }))
      );
    }, 2000);
    return () => clearInterval(simulationInterval);
  }, []);

  return (
    // position: 'relative'은 모달의 위치 기준점이 되기 위해 필요합니다.
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox="0 0 1200 800"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <image href={ship} x={shipX} y={shipY} width={SHIP_WIDTH} height={SHIP_HEIGHT} />
        
        {lines.map((line) => (
          // 💡 6. 각 MooringLine 컴포넌트에 클릭 핸들러를 전달합니다.
          // 클릭 시 'selectedLine' state를 해당 라인의 데이터로 업데이트합니다.
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
        <IconWithLabel
          href={setting_icon}
          {...iconPositions.setting}
          onClick={() => alert('설정 열기')}
        />
      </svg>
      
      {/* 💡 7. 'selectedLine' state에 데이터가 있을 때만 LineInfoModal 컴포넌트를 렌더링합니다. (조건부 렌더링) */}
      {/* 모달의 'onClose' prop에는 'selectedLine' state를 다시 null로 만드는 함수를 전달합니다. */}
      {selectedLine && (
        <LineInfoModal line={selectedLine} onClose={() => setSelectedLine(null)} />
      )}
    </div>
  );
};

export default MooringDiagram;