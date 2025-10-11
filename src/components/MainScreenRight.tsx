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
import {ViewMode} from './types.tsx';
// 계기판 라이브러리 임포트
//import GaugeChart from 'react-gauge-chart'; // 설치한 라이브러리 임포트
import TensionGauge from './TensionGauge.tsx'


// --- 자식 컴포넌트: 계류줄 ---
interface MooringLineProps {
  line: MooringLineData; // MooringLineInfo.tsx에서 임포트한 확장된 MooringLineData 사용
  onClick: () => void;
}

const getLineColorByTension = (tension: number): string => {
  if (tension >= 120) return '#ff4d4d';
  if (tension >= 100) return '#ffc107';
  if(tension === 0.0) return '#a6aaad'; // '#a6aaadff'에서 ff 제거
  return '#4caf50';
};


const MooringLine = ({ line, onClick }: MooringLineProps): JSX.Element => {
  const LINE_THICKNESS = 4;
  
  // 버튼 크기 및 폰트 설정 (호버 시 적용)
  const FONT_SIZE = 18;
  const RECT_WIDTH = 150;
  const RECT_HEIGHT = 30;
  
  const TEXT_CONTENT = `${line.id.replace('Line ', 'Line ')}: ${line.tension.toFixed(1)}N`; 
  const tensionColor = getLineColorByTension(line.tension);

  // --- ✨ 라벨 위치를 개별적으로 절대 좌표 지정 (픽셀) ✨ ---
  // key: line.id (예: 'Line 1'), value: { x: 수평 오프셋, y: 수직 오프셋 }
  // 이 오프셋은 '라인 중앙'이 아닌, SVG의 (0,0)을 기준으로 라벨이 위치할 최종 좌표를 지정하는
  // 방식으로 해석됩니다. (단, 여기서는 라인 중앙 좌표에서 '추가적인 오프셋'으로 사용하겠습니다.)
  
  // 라인 중앙 좌표 계산
  const midX = (line.startX + line.endX) / 2;
  const midY = (line.startY + line.endY) / 2;

  // 기본 오프셋 (모든 라인에 공통으로 적용되는 기준 위치)
  const DEFAULT_X_OFFSET = 0; 
  const DEFAULT_Y_OFFSET = -0; // 라인 중앙보다 30px 위 (텍스트가 라인에 겹치지 않도록)

  // Line ID별 개별 조정 오프셋 (기본 오프셋에 더해지는 값)
  const CUSTOM_OFFSET_MAP = {
      // Line 1은 기본 위치를 유지하려면 { x: 0, y: 0 }
      'Line 1': { x: 0, y: -20 }, 
      
      // Line 2는 아래로 25px 이동하고 싶다면 (Y 오프셋에 25px 추가)
      'Line 2': { x: 0, y: 55 }, 
      
      // Line 3은 위로 25px 이동하고 싶다면 (Y 오프셋에 -25px 추가)
      'Line 3': { x: 0, y: -50 }, 
      
      // Line 4는 오른쪽으로 50px, 위로 10px 이동하고 싶다면
      'Line 4': { x: 0, y: 20 },
      
      // 나머지 라인도 필요하다면 여기에 추가 (예: 'Line 8': { x: -40, y: 15 })
  };

  // 해당 라인의 커스텀 오프셋을 가져오고, 없으면 { x: 0, y: 0 }을 사용
  const custom = CUSTOM_OFFSET_MAP[line.id as keyof typeof CUSTOM_OFFSET_MAP] || { x: 0, y: 0 };
  
  // 최종 라벨 위치 (라인 중앙 + 기본 오프셋 + 커스텀 오프셋)
  const finalLabelX = midX + DEFAULT_X_OFFSET + custom.x;
  const finalLabelY = midY + DEFAULT_Y_OFFSET + custom.y;
  
  // --- ✨ 위치 조정 로직 끝 ✨ ---
  
  // --- ✨ 호버 상태 관리 추가 ✨ ---
  const [isHovered, setIsHovered] = useState(false);
  // --- ✨ ✨ ---

  // 라벨 배경 사각형 위치 (호버 시 텍스트 중앙에 오도록)
  const rectX = finalLabelX - RECT_WIDTH / 2;
  const rectY = finalLabelY - RECT_HEIGHT / 2;

  return (
    <g 
      style={{ cursor: 'pointer' }} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)} // 마우스 진입 시 호버 상태 true
      onMouseLeave={() => setIsHovered(false)} // 마우스 이탈 시 호버 상태 false
    >
      {/* 1. 계류줄 (Line) */}
      <line
        x1={line.startX} y1={line.startY}
        x2={line.endX} y2={line.endY}
        stroke={tensionColor}
        strokeWidth={LINE_THICKNESS}
      />

      {/* 2. 장력 라벨 (호버 시 버튼처럼 보이게) */}
      <g 
          style={{ 
              filter: isHovered ? 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' : 'none', // 호버 시에만 그림자 적용
          }}
      >
        {/* 배경 사각형 (버튼 형태) - 호버 상태일 때만 렌더링 */}
        {isHovered && (
          <rect
            x={rectX} y={rectY}
            width={RECT_WIDTH} height={RECT_HEIGHT}
            rx="5" ry="5"
            fill={tensionColor}
            stroke="#fff"
            strokeWidth="1"
          />
        )}
        
        {/* 텍스트 */}
        <text
          x={finalLabelX} 
          y={finalLabelY} 
          fill={isHovered ? "black" : "white"} 
          fontSize={FONT_SIZE} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontWeight={isHovered ? "bold" : "normal"}
        >
          {TEXT_CONTENT}
        </text>
      </g>
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
  const dockX = 700;
  const dockY = DOCK_CENTER_Y - DOCK_HEIGHT / 2;

// 배와 줄을 연결하는 점
  const bollardPositions = {
    line_1: { x: 286, y: 390 }, line_2: { x: 273, y: 440 },
    line_3: { x: 268, y: 850 }, line_4: { x: 272, y: 900 },
    line_5: { x: 365, y: 900 }, line_6: { x: 374, y: 850 },
    line_7: { x: 370, y: 440 }, line_8: { x: 351, y: 390 },
  };

// 부두와 줄을 연결하는 점
  const pierCleatPositions = {
    cleat1: { x: 650, y: 130 }, cleat2: { x: 650, y: 230 },
    cleat3: { x: 650, y: 590 }, cleat4: { x: 650, y: 660 },
    cleat5: { x: 950, y: 655 }, cleat6: { x: 950, y: 530 },
    cleat7: { x: 950, y: 283 }, cleat8: { x: 950, y: 130 },
  };

  const iconPositions = {
    graph:   { x: 120, y: 700, width: 20, height: 20 , label : '계류줄 장력 그래프'},
    setting: { x: 350, y: 700, width: 20, height: 20 ,label : '설정'},
  };

  const [lines, setLines] = useState<MooringLineData[]>([]);

  const [selectedLine, setSelectedLine] = useState<MooringLineData | null>(null);

  useEffect(() => {
    const fetchLines = async () => {
        try {
            // 1. 세 종류의 데이터를 모두 한 번에 가져옵니다.
            const [details, latest, alerts] = await Promise.all([
                window.api.getAllMooringLines(),
                window.api.getLatestTensions(),
                window.api.getAlertCount(), // API 이름이 다를 경우 여기에 맞게 수정해주세요.
            ]);

            // 2. 'latest'와 'alerts' 데이터를 Map으로 변환하여 준비합니다.
            const latestMap = new Map<number, { time: string; tension: number }>();
            if (latest) {
                for (const row of latest) latestMap.set(row.lineId, row);
            }
            const alertMap = new Map<number, { cautionCount: number; warningCount: number }>();
            if (alerts) {
                for (const row of alerts) alertMap.set(row.lineId, row);
            }
            
            // 3. 화면에 표시할 순서대로 lineId 배열을 순회하며 객체를 조립합니다.
            const displayOrder = [8, 7, 6, 5, 4, 3, 2, 1];
            const mapped: MooringLineData[] = displayOrder.map((lineId, i) => {
                const posIndex = i + 1;
                const key = `line_${posIndex}` as keyof typeof bollardPositions;
                const cleatKey = `cleat${posIndex}` as keyof typeof pierCleatPositions;
                
                const d = (details || []).find((x: any) => x.id === lineId) || {};
                const lt = latestMap.get(lineId);
                const ac = alertMap.get(lineId);

                // 4. 모든 데이터를 조합하여 하나의 MooringLineData 객체를 생성합니다.
                const assembledLine = {
                    id: `Line ${lineId}`, 
                    tension: lt ? Number(lt.tension) || 0 : 0,
                    startX: shipX + (bollardPositions as any)[key].x,
                    startY: shipY + (bollardPositions as any)[key].y,
                    endX: (pierCleatPositions as any)[cleatKey].x,
                    endY: (pierCleatPositions as any)[cleatKey].y,
                    manufacturer: d.manufacturer ?? 'N/A',
                    model: d.model ?? 'N/A',
                    usageHours: d.usageTime ?? 0,
                    lastInspected: d.maintenanceDate,
                    cautionCount: ac?.cautionCount ?? 0,
                    warningCount: ac?.warningCount ?? 0,
                };

                // ✅ [로그 1] 조립된 객체 하나하나를 콘솔에 출력하여 확인합니다.
                console.log(`[map] lineId: ${lineId} 조립 완료`, assembledLine);

                return assembledLine;
            });

            // ✅ [로그 2] 최종적으로 완성된 8개 객체의 전체 배열을 콘솔에 출력합니다.
            console.log("--- 최종 조립된 전체 데이터 (mapped) ---", mapped);

            // 5. 완성된 객체 배열을 state에 저장하여 화면을 업데이트합니다.
            setLines(mapped);

        } catch (e) {
            console.error('계류줄 데이터 로드 실패:', e);
        }
    };

    // 💡 1. 컴포넌트가 마운트되면 즉시 한 번 호출 (첫 로딩을 위해)
    fetchLines(); 

    // 💡 2. 5초(5000ms)마다 fetchLines 함수를 반복 호출하는 인터벌 설정
    const intervalId = setInterval(fetchLines, 5000);

    // 💡 3. 컴포넌트가 언마운트될 때 인터벌을 정리(clean-up)
    return () => {
        clearInterval(intervalId);
    };
}, []); // 의존성 배열은 비워두어 이 로직이 마운트 시 한 번만 실행되도록 합니다.
  


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '90px', // 수정: 날씨 정보를 더 아래로 이동
        left: '50px', // 수정: 날씨 정보를 오른쪽으로 이동
        zIndex: 10,
        color: 'white',
        backgroundColor: 'rgba(44, 62, 80, 0.85)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid #7f8c8d',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <WeatherDisplay />
      </div>

     <div style={{
        position: 'absolute',
        top: '400px', // 수정: 라인 계기판을 아래로 이동
        left: '0px',
      }}>
        <TensionGauge />
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