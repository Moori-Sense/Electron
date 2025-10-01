import React from 'react';

// --- 데이터 타입 정의 (MooringLineData) ---
// MainScreenLeft.tsx에서 사용될 수 있도록 export 합니다.
export interface MooringLineData {
    id: string;
    tension: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    material?: string;
    lastInspected?: string;
    diameter?: number;
    // 상세 정보 필드
    manufacturer: string;
    model: string;
    warningCount: number;
    dangerCount: number;
    usageHours: number;
}

// --- 장력 그래프 Placeholder 컴포넌트 ---
const TensionGraphPlaceholder = ({ lineId }: { lineId: string }) => {
    // 임시 그래프 데이터 (랜덤)를 생성합니다. (타입 오류 해결을 위해 명시적으로 number 타입을 지정)
    const data = Array.from({ length: 20 }, (_, i: number): number => Math.random() * 6 + 7); 
    const maxVal = 13;
    const minVal = 7;
    const width = 600;
    const height = 200;
    const padding = 20;

    // x축과 y축 스케일링 함수
    const scaleX = (i: number): number => padding + i * ((width - 2 * padding) / (data.length - 1));
    const scaleY = (val: number): number => height - padding - (val - minVal) / (maxVal - minVal) * (height - 2 * padding);

    const points = data.map((val: number, i: number) => `${scaleX(i)},${scaleY(val)}`).join(' ');
    
    return (
        <div style={{ padding: '20px', backgroundColor: '#2c3e50', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
                최근 24시간 장력 그래프
            </h3>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="250px" style={{ border: '1px solid #34495e', borderRadius: '4px' }}>
                {/* Y-축 라벨 (최대) */}
                <text x={padding / 2} y={scaleY(maxVal)} fill="#7f8c8d" fontSize="12" textAnchor="middle">{maxVal.toFixed(0)}t</text>
                {/* Y-축 라벨 (최소) */}
                <text x={padding / 2} y={scaleY(minVal)} fill="#7f8c8d" fontSize="12" textAnchor="middle">{minVal.toFixed(0)}t</text>
                
                {/* 경고선 (10t) */}
                <line x1={padding} y1={scaleY(10)} x2={width - padding} y2={scaleY(10)} stroke="#ffc107" strokeDasharray="4 4" strokeOpacity="0.5" />
                {/* 위험선 (12t) */}
                <line x1={padding} y1={scaleY(12)} x2={width - padding} y2={scaleY(12)} stroke="#ff4d4d" strokeDasharray="4 4" strokeOpacity="0.5" />

                {/* 그래프 선 */}
                <polyline
                    fill="none"
                    stroke="#3498db"
                    strokeWidth="2"
                    points={points}
                />
            </svg>
            <p style={{ color: '#7f8c8d', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                (데이터는 현재 시뮬레이션 기반의 임시값입니다.)
            </p>
        </div>
    );
};

// --- 모달 상세 정보 스타일 ---
const modalStyles: { [key: string]: React.CSSProperties } = {
    backdrop: {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
    },
    content: {
        backgroundColor: '#1f2937', 
        width: '85%', 
        maxWidth: '900px',
        padding: '30px',
        borderRadius: '12px',
        color: 'white',
        border: '1px solid #374151',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
    },
    closeButton: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: 'transparent',
        color: '#ccc',
        border: 'none',
        fontSize: '18px',
        fontWeight: 'bold',
        transition: 'color 0.2s',
    }
};

const detailStyles: { [key: string]: React.CSSProperties } = {
    header: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #374151',
        paddingBottom: '15px',
        marginBottom: '20px',
    },
    headerDetail: {
        fontSize: '1.1em',
        color: '#ccc',
        marginRight: '80px', 
    },
    graphSection: {
        flexGrow: 1,
        marginBottom: '30px',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTop: '1px solid #374151',
        paddingTop: '20px',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 30px',
        fontSize: '1em',
    },
    statItem: {
        color: '#ccc',
    },
    dataButton: {
        padding: '12px 25px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    }
};

// --- Mooring Line Info Modal 컴포넌트 ---
interface LineInfoModalProps {
    line: MooringLineData;
    onClose: () => void;
}

export const LineInfoModal = ({ line, onClose }: LineInfoModalProps): JSX.Element => {
    const { id, manufacturer, model, lastInspected, usageHours, warningCount, dangerCount } = line;

    return (
        <div style={modalStyles.backdrop} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                
                {/* 1. 맨 윗단: 계류줄 번호, 제조사, 모델명 */}
                <div style={detailStyles.header}>
                    <h1 style={{ margin: 0, fontSize: '2.5em' }}>{id}</h1>
                    <p style={detailStyles.headerDetail}>
                        제조사: <strong>{manufacturer}</strong> | 모델명: <strong>{model}</strong>
                    </p>
                    <button 
                        style={modalStyles.closeButton} 
                        onClick={onClose}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
                    >
                        X
                    </button>
                </div>

                {/* 2. 중간: 최근 n시간 장력 그래프 */}
                <div style={detailStyles.graphSection}>
                    <TensionGraphPlaceholder lineId={id} />
                </div>

                {/* 3. 하단: 통계 정보 및 버튼 */}
                <div style={detailStyles.footer}>
                    {/* 통계 정보 */}
                    <div style={detailStyles.statsContainer}>
                        <div style={detailStyles.statItem}>
                            <strong>경고 횟수:</strong> 
                            <span style={{color: '#ffc107', fontWeight: 'bold', marginLeft: '5px'}}>{warningCount}회</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>위험 횟수:</strong> 
                            <span style={{color: '#ff4d4d', fontWeight: 'bold', marginLeft: '5px'}}>{dangerCount}회</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>최종 정비:</strong> 
                            <span style={{marginLeft: '5px'}}>{lastInspected || '미확인'}</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>총 사용 시간:</strong> 
                            <span style={{marginLeft: '5px'}}>{usageHours.toLocaleString()}시간</span>
                        </div>
                    </div>
                    
                    {/* 데이터 가져오기 버튼 */}
                    <button 
                        style={detailStyles.dataButton}
                        onClick={() => console.log(`${id} 데이터 가져오기 요청`)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
                    >
                        데이터 가져오기
                    </button>
                </div>
            </div>
        </div>
    );
};