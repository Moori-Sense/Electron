import React, { useState, useEffect } from 'react';

// --- 데이터 타입 정의 (MooringLineData) ---
// 이 부분은 그대로 유지됩니다.
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
    manufacturer: string;
    model: string;
    cautionCount: number;
    warningCount: number;
    usageHours: number;
}

// DB에서 받아올 장력 이력 데이터의 타입을 정의합니다.
interface TensionHistory {
 tension: number;
 timestamp: string;
}


// --- 장력 그래프 컴포넌트 (✨ 최종 수정본) ---
const TensionGraphPlaceholder = ({ lineId }: { lineId: string }) => {
    // 1. 데이터 및 UI 상태 관리
    const [historyData, setHistoryData] = useState<TensionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        timestamp: string;
        tension: number;
    } | null>(null);

    // 2. 데이터 가져오기
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setTooltip(null);
            try {
                const data = await window.api.getTensionHistoryById(lineId);
                setHistoryData(data);
            } catch (err: any) {
                console.error(`'${lineId}'의 장력 이력 조회에 실패했습니다:`, err);
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lineId]);

    // 3. 로딩, 에러, 데이터 없음 UI 처리
    if (isLoading) {
        return <div style={{ color: '#ccc', textAlign: 'center', padding: '80px 0' }}>데이터를 불러오는 중입니다...</div>;
    }
    if (error) {
        return <div style={{ color: '#ff4d4d', textAlign: 'center', padding: '80px 0' }}>오류: {error}</div>;
    }
    if (historyData.length === 0) {
        return <div style={{ color: '#ccc', textAlign: 'center', padding: '80px 0' }}>표시할 데이터가 없습니다.</div>;
    }

    // 4. 그래프 계산 로직
    const tensionValues = historyData.map(item => item.tension);
    const maxVal = Math.ceil(Math.max(...tensionValues, 12)) + 1;
    const minVal = Math.floor(Math.min(...tensionValues, 7)) - 1;

    const width = 600;
    const height = 200;
    const padding = 40; // 💡 축 눈금 텍스트를 위한 패딩 증가

    const scaleX = (i: number): number => {
        if (tensionValues.length <= 1) return width / 2;
        return padding + i * ((width - 2 * padding) / (tensionValues.length - 1));
    };
    const scaleY = (val: number): number => {
        if (maxVal === minVal) return height / 2;
        return height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    };
    const points = tensionValues.map((val, i) => `${scaleX(i)},${scaleY(val)}`).join(' ');
    
    // 💡 5. 축 눈금(Ticks) 데이터 생성
    // Y축(장력) 눈금 생성
    const yAxisTicks = [];
    const tickCount = 5; // 5개의 눈금을 생성
    const tickIncrement = (maxVal - minVal) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
        yAxisTicks.push(minVal + (i * tickIncrement));
    }

    // X축(시간) 눈금 생성 (데이터의 시작, 중간, 끝 지점 등)
    const xAxisTicks = [];
    const numDataPoints = historyData.length;
    if (numDataPoints > 1) {
        const numTicksToShow = Math.min(numDataPoints, 5); // 최대 5개의 시간 눈금
        for (let i = 0; i < numTicksToShow; i++) {
            const index = Math.floor(i * (numDataPoints - 1) / (numTicksToShow - 1));
            xAxisTicks.push({ index, timestamp: historyData[index].timestamp });
        }
    } else if (numDataPoints === 1) {
        xAxisTicks.push({ index: 0, timestamp: historyData[0].timestamp });
    }

    // 6. 마우스 이벤트 핸들러
    const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
        const svgRect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - svgRect.left;
        const index = Math.round(((mouseX - padding) / (width - 2 * padding)) * (historyData.length - 1));

        if (index >= 0 && index < historyData.length) {
            const dataPoint = historyData[index];
            setTooltip({
                x: scaleX(index),
                y: scaleY(dataPoint.tension),
                timestamp: dataPoint.timestamp,
                tension: dataPoint.tension,
            });
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };
    
    // 7. SVG 그래프 렌더링
    return (
        <div style={{ padding: '20px', backgroundColor: '#2c3e50', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
            <h3 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
                최근 장력 그래프
            </h3>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="250px" style={{ border: '1px solid #34495e', borderRadius: '4px', overflow: 'visible' }}>
                {/* 💡 Y축 눈금 및 그리드 라인 */}
                {yAxisTicks.map((tick, i) => (
                    <g key={`y-tick-${i}`} className="y-tick">
                        <line 
                            x1={padding} y1={scaleY(tick)} 
                            x2={width - padding} y2={scaleY(tick)} 
                            stroke="#34495e" strokeWidth="1" 
                        />
                        <text 
                            x={padding - 8} y={scaleY(tick)} 
                            fill="#7f8c8d" fontSize="10" 
                            textAnchor="end" alignmentBaseline="middle"
                        >
                            {tick.toFixed(1)}
                        </text>
                    </g>
                ))}
                
                {/* 💡 X축 눈금 및 그리드 라인 */}
                {xAxisTicks.map((tick, i) => (
                    <g key={`x-tick-${i}`} className="x-tick">
                         <line 
                            x1={scaleX(tick.index)} y1={padding} 
                            x2={scaleX(tick.index)} y2={height - padding}
                            stroke="#34495e" strokeWidth="1" 
                        />
                        <text 
                            x={scaleX(tick.index)} y={height - padding + 15} 
                            fill="#7f8c8d" fontSize="10" 
                            textAnchor="middle"
                        >
                            {new Date(tick.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </text>
                    </g>
                ))}

                {/* 축 라벨 (시간, 장력) */}
                <text x={width / 2} y={height - 5} fill="#7f8c8d" fontSize="12" textAnchor="middle">시간 →</text>
                <text transform={`rotate(-90, 15, ${height / 2})`} x="15" y={height / 2} fill="#7f8c8d" fontSize="12" textAnchor="middle">장력 (t)</text>
                
                {/* 기준선 (주의: 10t, 위험: 12t) */}
                <line x1={padding} y1={scaleY(100)} x2={width - padding} y2={scaleY(100)} stroke="#ffc107" strokeDasharray="4 4" strokeOpacity="0.7" />
                <line x1={padding} y1={scaleY(120)} x2={width - padding} y2={scaleY(120)} stroke="#ff4d4d" strokeDasharray="4 4" strokeOpacity="0.7" />

                {/* 메인 그래프 라인 */}
                <polyline fill="none" stroke="#3498db" strokeWidth="2" points={points} />

                {/* 마우스 이벤트를 감지할 투명한 사각형 */}
                <rect
                    x={padding} y={padding}
                    width={width - 2 * padding} height={height - 2 * padding}
                    fill="transparent"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {/* 툴팁 렌더링 */}
                {tooltip && (
                    <g style={{ pointerEvents: 'none' }}>
                        <line x1={tooltip.x} y1={padding} x2={tooltip.x} y2={height - padding} stroke="#7f8c8d" strokeDasharray="3 3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r="5" fill="#3498db" stroke="white" strokeWidth="2" />
                        <g transform={`translate(${tooltip.x + 15}, ${tooltip.y - 45})`}>
                            <rect width="165" height="40" fill="rgba(0,0,0,0.75)" rx="4" />
                            <text x="8" y="16" fill="white" fontSize="12">
                                {new Date(tooltip.timestamp).toLocaleString('ko-KR')}
                            </text>
                            <text x="8" y="31" fill="#3498db" fontSize="12" fontWeight="bold">
                                장력: {tooltip.tension.toFixed(2)}t
                            </text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
    );
};


// --- 모달 상세 정보 스타일 ---
// 이 부분은 그대로 유지됩니다.
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
// 이 부분은 그대로 유지됩니다.
interface LineInfoModalProps {
    line: MooringLineData;
    onClose: () => void;
}

export const LineInfoModal = ({ line, onClose }: LineInfoModalProps): JSX.Element => {
    const { id, manufacturer, model, lastInspected, usageHours, cautionCount, warningCount } = line;

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
                            <span style={{color: '#ffc107', fontWeight: 'bold', marginLeft: '5px'}}>{cautionCount}회</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>위험 횟수:</strong> 
                            <span style={{color: '#ff4d4d', fontWeight: 'bold', marginLeft: '5px'}}>{warningCount}회</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>최종 정비:</strong> 
                            <span style={{marginLeft: '5px'}}>{lastInspected || '미확인'}</span>
                        </div>
                        <div style={detailStyles.statItem}>
                            <strong>총 사용 시간:</strong> 
                            <span style={{marginLeft: '5px'}}>{usageHours.toLocaleString()}분</span>
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