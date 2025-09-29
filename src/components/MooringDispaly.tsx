// src/components/MooringDisplay.tsx

import React, { useState, useEffect, useCallback } from 'react';
// Recharts에서 필요한 컴포넌트들을 임포트합니다.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MooringDisplay.css'; // 새로운 레이아웃을 위한 CSS

// --- 타입 정의 ---
interface MooringDetails {
  id: number;
  manufacturer: string;
  model: string;
  usageTime: number;
  maintenanceDate: string;
}
interface TensionLog {
  time: string;
  tension: number;
}
interface FullLineData {
  details: MooringDetails;
  history: TensionLog[];
  warningCount: number;
  dangerCount: number;
}
interface MooringDisplayProps {
  lineId: number;
  onClose: () => void;
}

// --- 컴포넌트 ---
const MooringDisplay: React.FC<MooringDisplayProps> = ({ lineId, onClose }) => {
  const [data, setData] = useState<FullLineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터를 불러오는 함수 (재사용을 위해 useCallback 사용)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 1단계에서 만든 새로운 IPC 핸들러를 호출합니다.
      const result = await window.ipcRenderer.invoke('get-line-full-details', lineId);
      if (result) {
        setData(result);
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [lineId]);

  // 컴포넌트가 처음 나타날 때 데이터를 불러옵니다.
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // 차트 데이터 가공 (시간 포맷팅)
  const formattedHistory = data?.history.map(log => ({
    ...log,
    // 시간만 간단히 표시 (예: "14:30")
    time: new Date(log.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
  })).reverse(); // 시간 순서대로 보이도록 배열을 뒤집습니다.

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="display-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {isLoading && <p>데이터를 불러오는 중...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {data && (
          <>
            {/* 1. 맨 윗단: 계류줄 정보 */}
            <header className="display-header">
              <h1>Line #{data.details.id}</h1>
              <span>{data.details.manufacturer} | {data.details.model}</span>
            </header>

            {/* 2. 중간: 장력 그래프 */}
            <div className="display-chart">
              <h3>최근 12시간 장력 그래프</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={formattedHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis label={{ value: 'Tension (kN)', angle: -90, position: 'insideLeft' }} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tension" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 3. 하단: 상세 정보 */}
            <div className="display-info">
              <div><strong>경고 횟수:</strong><span>{data.warningCount} 회</span></div>
              <div><strong>위험 횟수:</strong><span>{data.dangerCount} 회</span></div>
              <div><strong>마지막 정비:</strong><span>{new Date(data.details.maintenanceDate).toLocaleDateString()}</span></div>
              <div><strong>총 사용 시간:</strong><span>{data.details.usageTime} 시간</span></div>
            </div>

            {/* 4. 맨 오른쪽 하단: 버튼 */}
            <div className="display-actions">
              <button onClick={fetchData}>데이터 가져오기</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MooringDisplay;