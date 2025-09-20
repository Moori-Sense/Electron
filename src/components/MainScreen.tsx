import React, { useState, useEffect } from 'react';
import ship from '../assets/ship.png';
import graph_icon from '../assets/icon_graph.png';
import setting_icon from '../assets/icon_setting.png';

// ... (Interface, Config, Helper Function, MooringLine Component는 이전과 동일) ...

interface MooringLineData {
  id: string;
  tension: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const SHIP_WIDTH = 650;
const SHIP_HEIGHT = 1300;
const SHIP_CENTER_X = 350;
const SHIP_CENTER_Y = 400;

const getLineColorByTension = (tension: number): string => {
  if (tension >= 12.0) return '#ff4d4d';
  if (tension >= 10.0) return '#ffc107';
  return '#4caf50';
};

interface MooringLineProps {
  line: MooringLineData;
}

const MooringLine = ({ line }: MooringLineProps): JSX.Element => {
  const LINE_THICKNESS = 4;
  return (
    <g style={{ cursor: 'pointer' }}>
      <line
        x1={line.startX} y1={line.startY}
        x2={line.endX} y2={line.endY}
        stroke={getLineColorByTension(line.tension)}
        strokeWidth={LINE_THICKNESS}
      />
      <text
        x={(line.startX + line.endX) / 2} y={(line.startY + line.endY) / 2 - 15}
        fill="white" fontSize="16" textAnchor="middle" style={{ pointerEvents: 'none' }}
      >
        {`${line.id}: ${line.tension.toFixed(1)}t`}
      </text>
    </g>
  );
};

// 💡 1. 아이콘과 레이블을 묶는 재사용 가능한 컴포넌트 생성
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
  // 👇 y좌표를 미세 조정하여 아이콘과 텍스트의 수직 정렬을 맞춥니다.
  // 이 값을 조절하여 완벽한 위치를 찾으세요. (양수: 아래로, 음수: 위로)
  const yAlignmentCorrection = 2; 

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <image
        href={href}
        x={x}
        y={y}
        width={width}
        height={height}
      />
      <text
        x={x + width + 15} // 아이콘 오른쪽으로 15px 여백
        y={y + height / 2 + yAlignmentCorrection} // 아이콘의 세로 중앙 + 미세 조정값
        fill="white"
        fontSize="18"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  );
};


export const MooringDiagram = (): JSX.Element => {
  const shipX = SHIP_CENTER_X - SHIP_WIDTH / 2;
  const shipY = SHIP_CENTER_Y - SHIP_HEIGHT / 2;

  const bollardPositions = {
    line_1:   { x: 286,  y: 390 },
    line_2:   { x: 273,  y: 440   },
    line_3:  { x: 268, y: 850 },
    line_4:  { x: 272, y: 900   },
    line_5: { x: 365,  y: 900 },
    line_6: { x: 374,  y: 850 },
    line_7:{ x: 370, y: 440 },
    line_8:{ x: 351, y: 390 },
  };

  const pierCleatPositions = {
    cleat1: { x: 100, y: 100 },
    cleat2: { x: 100, y: 230},
    cleat3: { x: 100, y: 570 },
    cleat4: { x: 100, y: 700 },
    cleat5: { x: 580, y: 700 },
    cleat6: { x: 580, y: 570 },
    cleat7: { x: 580, y: 230 },
    cleat8: { x: 580, y: 100 },
  };

  const iconPositions = {
    graph:   { x: 900, y: 630, width: 30, height: 30 , label : '계류줄 장력 그래프'},
    setting: { x: 900, y: 690, width: 30, height: 30 ,label : '설정'},
  };

  const [lines, setLines] = useState<MooringLineData[]>([
    { id: 'Line 1', tension: 8.5,  startX: shipX + bollardPositions.line_1.x,   startY: shipY + bollardPositions.line_1.y,   endX: pierCleatPositions.cleat1.x, endY: pierCleatPositions.cleat1.y },
    { id: 'Line 2', tension: 9.2,  startX: shipX + bollardPositions.line_2.x,   startY: shipY + bollardPositions.line_2.y,   endX: pierCleatPositions.cleat2.x, endY: pierCleatPositions.cleat2.y },
    { id: 'Line 3', tension: 8.8,  startX: shipX + bollardPositions.line_3.x,  startY: shipY + bollardPositions.line_3.y,  endX: pierCleatPositions.cleat3.x, endY: pierCleatPositions.cleat3.y },
    { id: 'Line 4', tension: 9.5,  startX: shipX + bollardPositions.line_4.x,  startY: shipY + bollardPositions.line_4.y,  endX: pierCleatPositions.cleat4.x, endY: pierCleatPositions.cleat4.y },
    { id: 'Line 5', tension: 12.1, startX: shipX + bollardPositions.line_5.x, startY: shipY + bollardPositions.line_5.y, endX: pierCleatPositions.cleat5.x, endY: pierCleatPositions.cleat5.y },
    { id: 'Line 6', tension: 11.5, startX: shipX + bollardPositions.line_6.x, startY: shipY + bollardPositions.line_6.y, endX: pierCleatPositions.cleat6.x, endY: pierCleatPositions.cleat6.y },
    { id: 'Line 7', tension: 11.8, startX: shipX + bollardPositions.line_7.x,startY: shipY + bollardPositions.line_7.y,endX: pierCleatPositions.cleat7.x, endY: pierCleatPositions.cleat7.y },
    { id: 'Line 8', tension: 12.5, startX: shipX + bollardPositions.line_8.x,startY: shipY + bollardPositions.line_8.y,endX: pierCleatPositions.cleat8.x, endY: pierCleatPositions.cleat8.y },
  ]);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setLines(currentLines =>
        currentLines.map(line => ({ ...line, tension: Math.random() * 6 + 7 }))
      );
    }, 2000);
    return () => clearInterval(simulationInterval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        viewBox="0 0 1200 800"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* 선박과 계류줄 렌더링 */}
        <image href={ship} x={shipX} y={shipY} width={SHIP_WIDTH} height={SHIP_HEIGHT} />
        {lines.map((line) => (
          <MooringLine key={line.id} line={line} />
        ))}

        {/* 💡 2. IconWithLabel 컴포넌트를 사용하여 아이콘 렌더링 */}
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
    </div>
  );
};

export default MooringDiagram;