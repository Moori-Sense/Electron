import React, { useState, useEffect } from 'react';
// --- 이미지 파일 임포트 (기존 구조 유지) ---
import ship from '../assets/ship.png';
import graph_icon from '../assets/icon_graph.png';
import setting_icon from '../assets/icon_setting.png';
import dock from '../assets/dock_good_nu5.png';
// --- 날씨 컴포넌트 임포트 (기존 구조 유지) ---
import { WeatherDisplay } from './WeatherDisplay';
// --- ✨ App.tsx로부터 ViewMode 타입을 가져옵니다 (기존 구조 유지) ---
import { ViewMode } from './types';
// --- ✨ MooringLineInfo.tsx로부터 필요한 LineInfoModal과 MooringLineData를 임포트합니다 ---
import { LineInfoModal, MooringLineData } from './MooringLineInfo'; 

import TensionGaugeLeft from './TensionGaugeLeft';


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
  // --- ✨ 버튼 크기 및 스타일 설정 ✨ ---
  const LINE_THICKNESS = 4;
  const FONT_SIZE = 16;
  const RECT_WIDTH = 120;
  const RECT_HEIGHT = 28;
  const DEFAULT_Y_OFFSET = -15; // 텍스트만 있을 때의 기본 오프셋 (기존 값 유지)
  
  const TEXT_CONTENT = `${line.id}: ${line.tension.toFixed(1)}t`;
  const tensionColor = getLineColorByTension(line.tension);

  // --- ✨ 호버 상태 관리 추가 ✨ ---
  const [isHovered, setIsHovered] = useState(false);

  // 라인 중앙 좌표 계산
  const midX = (line.startX + line.endX) / 2;
  const midY = (line.startY + line.endY) / 2;
  
  // 최종 라벨 Y 위치 계산 (호버 상태와 무관하게 동일 위치 유지)
  // 버튼이 나타나도 텍스트가 제자리에 고정되도록 합니다.
  const finalLabelY = midY + DEFAULT_Y_OFFSET;

  // 라벨 배경 사각형 위치 (텍스트 중앙에 오도록)
  const rectX = midX - RECT_WIDTH / 2;
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
              // 호버 시에만 그림자 적용 (시인성 향상)
              filter: isHovered ? 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' : 'none',
          }}
      >
        {/* 배경 사각형 (버튼 형태) - 호버 상태일 때만 렌더링 */}
        {isHovered && (
          <rect
            x={rectX} y={rectY}
            width={RECT_WIDTH} height={RECT_HEIGHT}
            rx="5" ry="5"
            fill={tensionColor} // 라인 색상과 동일한 배경색
            stroke="#fff"
            strokeWidth="1"
          />
        )}
        
        {/* 텍스트 */}
        <text
          x={midX} 
          y={finalLabelY} 
          // 👇 호버 시: 검은색, 평소: 흰색
          fill={isHovered ? "black" : "white"} 
          fontSize={FONT_SIZE} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          // 👇 호버 시: 두껍게, 평소: 보통 두께
          fontWeight={isHovered ? "bold" : "normal"}
        >
          {TEXT_CONTENT}
        </text>
      </g>
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

// --- Props 타입 정의: onNavigate 함수를 받도록 설정 ---
interface MainScreenLeftProps {
  onNavigate: (view: ViewMode) => void;
}

// --- 메인 컴포넌트: MainScreenLeft ---
export const MainScreenLeft = ({ onNavigate }: MainScreenLeftProps): JSX.Element => {
  
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
    graph:   { x: 760, y: 700, width: 20, height: 20 , label : '계류줄 장력 그래프'},
    setting: { x: 1000, y: 700, width: 20, height: 20 ,label : '설정'},
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
                window.api.getAlertCount(), 
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
        top: '90px',
        right: '50px',
        zIndex: 10,
        color: 'white',
        backgroundColor: 'rgba(44, 62, 80, 0.8)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #7f8c8d'
      }}>
        <WeatherDisplay />
      </div>
      <div style={{
        position: 'absolute',
        top: '400px', // 수정: 라인 계기판을 더 아래로 이동
        right: '500px'}}>
        <TensionGaugeLeft />
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
        {/* --- onClick 이벤트 수정 --- */}
        <IconWithLabel
          href={setting_icon}
          {...iconPositions.setting}
          onClick={() => onNavigate('settings')}
        />
      </svg>
      
      {/* ✨ MooringLineInfo.tsx에서 임포트한 모달 컴포넌트 사용 */}
      {selectedLine && (
        <LineInfoModal line={selectedLine} onClose={() => setSelectedLine(null)} />
      )}
    </div>
  );
};

export default MainScreenLeft;