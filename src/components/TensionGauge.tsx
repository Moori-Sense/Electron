import React, { useState, useEffect } from 'react';
import GaugeChart from 'react-gauge-chart';

// --- 자식 컴포넌트: 계기판 ---
// 이 파일 안에서만 사용되므로 export 하지 않습니다.
interface TensionGaugeProps {
    name: string;
    tension: number;
    maxTension?: number;
}

const TensionGauge = ({ name, tension, maxTension = 200 }: TensionGaugeProps) => {
    const percent = tension / maxTension;
    return (
        <div style={{ width: '100%', textAlign: 'center' }}>
            <GaugeChart
                id={name}
                percent={percent}
                nrOfLevels={3}
                colors={['#4caf50', '#ffc107', '#ff4d4d']}
                arcWidth={0.1}
                needleColor="#e0e0e0"
                needleBaseColor="#e0e0e0"
                textColor="#ffffff"
                formatTextValue={(_value: string) => `${tension.toFixed(1)}t`}
                animate={false}
                style={{ fontSize: '8px' }}
            />
            <h3 style={{ marginTop: '-5px', color: 'white', fontWeight: 'normal' }}>{name}</h3>
        </div>
    );
};


// --- 메인 컴포넌트: 계기판 클러스터 ---
// 표시할 라인의 데이터 타입을 정의합니다.
interface LineState {
    id: number;
    name: string;
    tension: number;
}

export const GaugeCluster = () => {
    // 계기판 4개의 데이터를 관리할 state
    const [lines, setLines] = useState<LineState[]>([
        { id: 1, name: 'LINE 1', tension: 0 },
        { id: 2, name: 'LINE 2', tension: 0 },
        { id: 3, name: 'LINE 3', tension: 0 },
        { id: 4, name: 'LINE 4', tension: 0 },
    ]);

    // 5초마다 최신 장력 데이터를 가져와 state를 업데이트
    useEffect(() => {
        const fetchLatestTensions = async () => {
            try {
                const latest = await window.api.getLatestTensions() || [];
                const latestMap = new Map<number, number>();
                for (const row of latest) {
                    latestMap.set(row.lineId, Number(row.tension) || 0);
                }

                setLines(prevLines =>
                    prevLines.map(line => ({
                        ...line,
                        tension: latestMap.get(line.id) ?? line.tension,
                    }))
                );
            } catch (e) {
                console.error('최신 장력 데이터 로드 실패 (GaugeCluster):', e);
            }
        };

        const intervalId = setInterval(fetchLatestTensions, 5000);
        fetchLatestTensions(); // 초기 로드

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{
            display: 'grid',
            // 2x2 그리드 레이아웃
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '0px',
            padding: '0px',
            width: '100px',
            height: '80px',
            boxSizing: 'border-box',
        }}>
            {lines.map(line => (
                <TensionGauge
                    key={line.id}
                    name={line.name}
                    tension={line.tension}
                />
            ))}
        </div>
    );
};

// 이 파일의 '대표 상품'은 GaugeCluster 이므로 이것만 default로 export 합니다.
export default GaugeCluster;