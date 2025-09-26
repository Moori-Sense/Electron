import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types/weather';

export const WeatherDisplay: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await window.ipcRenderer.invoke('get-weather-data') as WeatherData;
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('날씨 정보를 불러올 수 없습니다.');
      console.error('날씨 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
    const interval = setInterval(loadWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWindDirection = (degrees: number): string => {
    const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', 
                       '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
    return directions[Math.round(degrees / 22.5) % 16] || '북';
  };

  if (loading) return <div className="loading">날씨 정보를 불러오는 중...</div>;
  if (error) return <div className="error">오류: {error}</div>;
  if (!weather) return <div className="no-data">날씨 정보가 없습니다.</div>;

  return (
    <div className="weather-display">
      <div className="weather-header">
        <h2>대한해협 해양 날씨 정보</h2>
        <div className="location">{weather.location}</div>
      </div>
      
      <div className="weather-main">
        <div className="weather-icon-section">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weatherIcon}@2x.png`} 
            alt={weather.weatherDescription}
            className="weather-icon"
          />
          <div className="weather-condition">
            <div className="main-condition">{weather.weatherCondition}</div>
            <div className="description">{weather.weatherDescription}</div>
          </div>
        </div>
        
        <div className="temperature-section">
          <div className="main-temp">{weather.temperature}°C</div>
        </div>
      </div>

      <div className="weather-grid">
        <div className="weather-item">
          <span className="label">풍속</span>
          <span className="value">{weather.windSpeed} m/s</span>
        </div>
        <div className="weather-item">
          <span className="label">풍향</span>
          <span className="value">{getWindDirection(weather.windDirection)} ({weather.windDirection}°)</span>
        </div>
        <div className="weather-item wave-height">
          <span className="label">파고</span>
          <span className="value">{weather.waveHeight} m</span>
          {weather.waveHeightTime && (
            <div className="wave-time">
              측정시간: {new Date(weather.waveHeightTime).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="timestamp">
        마지막 업데이트: {new Date(weather.timestamp).toLocaleString()}
      </div>
    </div>
  );
};
