import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// App.tsx로부터 받을 데이터 타입 정의
interface HistoryData {
  timestamp: string;
  [key: string]: number | string; // 'Line 1': 12.5, 'Line 2': 11.8 등
}

// ✨ 1. Props 타입을 onGoBack을 받도록 수정합니다.
interface TensionGraphScreenProps {
  history: HistoryData[];
  onGoBack: () => void;
}

const lineColors = [
  '#ff6347', '#4682b4', '#3cb371', '#ffd700',
  '#6a5acd', '#ff7f50', '#ba55d3', '#00ced1',
];

// ✨ 2. props에서 onNavigate 대신 onGoBack을 받습니다.
export const TensionGraphScreen = ({ history, onGoBack }: TensionGraphScreenProps) => {
  // 데이터가 없을 경우를 대비
  const lineKeys = history.length > 0 ? Object.keys(history[0]).filter(key => key !== 'timestamp') : [];

  return (
    <div style={{ width: '100%', height: '100%', padding: '40px', boxSizing: 'border-box', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>계류줄 장력 이력 그래프</h1>
        <button 
          // ✨ 3. 버튼 클릭 시 onGoBack 함수를 직접 호출합니다.
          onClick={onGoBack}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          돌아가기
        </button>
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey="timestamp" stroke="#ccc" />
            <YAxis label={{ value: 'Tension (t)', angle: -90, position: 'insideLeft', fill: '#ccc' }} stroke="#ccc" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(44, 62, 80, 0.9)', border: '1px solid #7f8c8d' }} 
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {lineKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={lineColors[index % lineColors.length]} 
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TensionGraphScreen;