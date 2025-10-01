import React, { useState, useEffect } from 'react';
// --- Image Imports (기존 구조 유지) ---
import ship from '../assets/ship.png';
import graph_icon from '../assets/icon_graph.png';
import setting_icon from '../assets/icon_setting.png';
import dock from '../assets/dock_good_nu5.png';
// --- Component Imports (기존 구조 유지) ---
import { WeatherDisplay } from './WeatherDisplay'; // 경로 오류 해결을 위해 아래 인라인 정의 사용
// --- ✨ Import ViewMode type from App.tsx (기존 구조 유지) ---
// import { ViewMode } from './types'; // 경로 오류 해결을 위해 아래 인라인 정의 사용
// --- ✨ MooringLineInfo.tsx로부터 필요한 LineInfoModal과 MooringLineData를 임포트합니다 ---
import { LineInfoModal, MooringLineData } from './MooringLineInfo'; 


// --- WeatherDisplay 컴포넌트 인라인 정의 (경로 오류 해결) ---

// --- ViewMode 타입 인라인 정의 (경로 오류 해결) ---
type ViewMode = 'main' | 'allTension' | 'settings';


// --- 자식 컴포넌트: 계류줄 ---
interface MooringLineProps {
  line: MooringLineData; // MooringLineInfo.tsx에서 임포트한 확장된 MooringLineData 사용
  onClick: () => void;
}

const getLineColorByTension = (tension: number): string => {
  if (tension >= 12.0) return '#ff4d4d';
  if (tension >= 10.0) return '#ffc107';
  if(tension === 0.0) return '#a6aaad'; // '#a6aaadff'에서 ff 제거
  return '#4caf50';
};

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

// --- 자식 컴포넌트: IconWithLabel ---
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

// --- Define Props Type ---
interface MainScreenRightProps {
  onNavigate: (view: ViewMode) => void;
}

// --- 메인 컴포넌트: MainScreenRight ---
export const MainScreenRight = ({ onNavigate }: MainScreenRightProps): JSX.Element => {
  
  // All the existing logic from MooringDiagram remains the same
  const SHIP_WIDTH = 650;
  const SHIP_HEIGHT = 1300;
  const SHIP_CENTER_X = 760;
  const SHIP_CENTER_Y = 400;

  const shipX = SHIP_CENTER_X - SHIP_WIDTH / 2;
  const shipY = SHIP_CENTER_Y - SHIP_HEIGHT / 2;

  const DOCK_WIDTH = 700;
  const DOCK_HEIGHT = 1600;
  const DOCK_CENTER_Y = SHIP_CENTER_Y;
  const dockX = 670;
  const dockY = DOCK_CENTER_Y - DOCK_HEIGHT / 2;

  const bollardPositions = {
    line_1: { x: 286, y: 390 }, line_2: { x: 273, y: 440 },
    line_3: { x: 268, y: 850 }, line_4: { x: 272, y: 900 },
    line_5: { x: 365, y: 900 }, line_6: { x: 374, y: 850 },
    line_7: { x: 370, y: 440 }, line_8: { x: 351, y: 390 },
  };

  const pierCleatPositions = {
    cleat1: { x: 650, y: 130 }, cleat2: { x: 650, y: 230 },
    cleat3: { x: 650, y: 590 }, cleat4: { x: 650, y: 660 },
    cleat5: { x: 920, y: 655 }, cleat6: { x: 920, y: 530 },
    cleat7: { x: 920, y: 283 }, cleat8: { x: 920, y: 130 },
  };

  const iconPositions = {
    graph:   { x: 120, y: 700, width: 20, height: 20 , label : '계류줄 장력 그래프'},
    setting: { x: 350, y: 700, width: 20, height: 20 ,label : '설정'},
  };

  // ✨ 상세 정보를 포함하는 확장된 목업 데이터 추가 (오른쪽 뷰 전용 값)
  const initialLines: MooringLineData[] = [
    { id: 'Line 8', tension: 8.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-01', manufacturer: 'RopeTech', model: 'DynaMax-A', warningCount: 5, dangerCount: 1, usageHours: 1250, startX: shipX + bollardPositions.line_1.x, startY: shipY + bollardPositions.line_1.y, endX: pierCleatPositions.cleat1.x, endY: pierCleatPositions.cleat1.y },
    { id: 'Line 7', tension: 9.2,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-02', manufacturer: 'FiberPro', model: 'PolyStrong-B', warningCount: 8, dangerCount: 2, usageHours: 1500, startX: shipX + bollardPositions.line_2.x, startY: shipY + bollardPositions.line_2.y, endX: pierCleatPositions.cleat2.x, endY: pierCleatPositions.cleat2.y },
    { id: 'Line 6', tension: 8.8,  material: 'Polyester', diameter: 85, lastInspected: '2025-08-03', manufacturer: 'FiberPro', model: 'PolyStrong-B', warningCount: 3, dangerCount: 0, usageHours: 900, startX: shipX + bollardPositions.line_3.x, startY: shipY + bollardPositions.line_3.y, endX: pierCleatPositions.cleat3.x, endY: pierCleatPositions.cleat3.y },
    { id: 'Line 5', tension: 9.5,  material: 'Dyneema', diameter: 80, lastInspected: '2025-08-04', manufacturer: 'RopeTech', model: 'DynaMax-A', warningCount: 6, dangerCount: 1, usageHours: 1800, startX: shipX + bollardPositions.line_4.x, startY: shipY + bollardPositions.line_4.y, endX: pierCleatPositions.cleat4.x, endY: pierCleatPositions.cleat4.y },
    { id: 'Line 4', tension: 12.1, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-11', manufacturer: 'RopeTech', model: 'DynaMax-A', warningCount: 12, dangerCount: 4, usageHours: 2000, startX: shipX + bollardPositions.line_5.x, startY: shipY + bollardPositions.line_5.y, endX: pierCleatPositions.cleat5.x, endY: pierCleatPositions.cleat5.y },
    { id: 'Line 3', tension: 11.5, material: 'Polyester', diameter: 85, lastInspected: '2025-09-12', manufacturer: 'FiberPro', model: 'PolyStrong-B', warningCount: 9, dangerCount: 3, usageHours: 1700, startX: shipX + bollardPositions.line_6.x, startY: shipY + bollardPositions.line_6.y, endX: pierCleatPositions.cleat6.x, endY: pierCleatPositions.cleat6.y },
    { id: 'Line 2', tension: 11.8, material: 'Polyester', diameter: 85, lastInspected: '2025-09-13', manufacturer: 'FiberPro', model: 'PolyStrong-B', warningCount: 15, dangerCount: 5, usageHours: 2500, startX: shipX + bollardPositions.line_7.x, startY: shipY + bollardPositions.line_7.y, endX: pierCleatPositions.cleat7.x, endY: pierCleatPositions.cleat7.y },
    { id: 'Line 1', tension: 12.5, material: 'Dyneema', diameter: 80, lastInspected: '2025-09-14', manufacturer: 'RopeTech', model: 'DynaMax-A', warningCount: 10, dangerCount: 3, usageHours: 2200, startX: shipX + bollardPositions.line_8.x, startY: shipY + bollardPositions.line_8.y, endX: pierCleatPositions.cleat8.x, endY: pierCleatPositions.cleat8.y },
  ];
    
  const [lines, setLines] = useState<MooringLineData[]>(initialLines);

  const [selectedLine, setSelectedLine] = useState<MooringLineData | null>(null);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setLines(currentLines =>
        currentLines.map(line => {
          const lineNumber = parseInt(line.id.split(' ')[1]);
          if (lineNumber >= 5) {
            return { ...line, tension: 0 };
          }
          // 시뮬레이션 장력 값에 타입 명시 및 소수점 처리
          return { ...line, tension: parseFloat((Math.random() * 6 + 7).toFixed(1)) };
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
        left: '175px', // 위치를 왼쪽으로 변경
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
        onClick={() => onNavigate('allTension')} // 'allTension' 화면으로 이동
      />
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