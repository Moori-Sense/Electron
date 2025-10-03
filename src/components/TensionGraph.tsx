import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// DB에서 받을 데이터의 타입
interface HistoryData {
  timestamp: string;
  [key: string]: number | string;
}

// TypeScript가 window.api 객체를 인식하도록 타입을 선언합니다.
/*declare global {
  interface Window {
    api: {
      getTensionHistory: () => Promise<HistoryData[]>;
    }
  }
}*/

interface TensionGraphScreenProps {
  onGoBack: () => void;
}

const lineColors = [
  '#ffffffff', '#ffffffff', '#ffffffff', '#ffffffff',
  '#ffffffff', '#ffffffff', '#ffffffff', '#ffffffff',
];

export const TensionGraphScreen = ({ onGoBack }: TensionGraphScreenProps) => {
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataFromDB = await window.api.getTensionHistory();
        // DB에서 받은 데이터 배열의 순서를 뒤집어 시간순(과거 -> 최신)으로 만듭니다.
        const sortedData = dataFromDB.reverse();
        setHistory(sortedData); // 정렬된 데이터로 state 업데이트
      } catch (error) {
        console.error("데이터베이스 조회에 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const lineKeys = history.length > 0 ? Object.keys(history[0]).filter(key => key !== 'timestamp') : [];

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <h1>데이터베이스에서 정보를 불러오는 중입니다...</h1>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', padding: '20px', boxSizing: 'border-box', color: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: 0 }}>계류줄 장력 이력</h1>
        <button 
          onClick={onGoBack}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px' }}
        >
          돌아가기
        </button>
      </div>
      
      <div style={{ 
        flexGrow: 1, 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '15px'
      }}>
        {lineKeys.length === 0 && !isLoading ? (
          <h2 style={{gridColumn: '1 / -1', textAlign: 'center'}}>표시할 데이터가 없습니다.</h2>
        ) : (
          lineKeys.map((key, index) => (
            <div key={key} style={{ backgroundColor: 'rgba(44, 62, 80, 0.5)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 5px 0', textAlign: 'center', color: lineColors[index % lineColors.length] }}>{key.replace('_', ' ')}</h4>
              <div style={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{ top: 5, right: 15, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                    <XAxis dataKey="timestamp" stroke="#ccc" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#ccc" tick={{ fontSize: 9 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(44, 62, 80, 0.9)', border: '1px solid #7f8c8d' }} 
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={key}
                      stroke={lineColors[index % lineColors.length]} 
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TensionGraphScreen;

