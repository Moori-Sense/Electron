// src/components/WeatherDisplay.tsx
import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types/weather';
import { fetchWeatherData } from '../services/weatherService';

export const WeatherDisplay: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        setLoading(true);
        const data = await window.ipcRenderer.invoke('get-weather-data');
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('날씨 정보를 불러올 수 없습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
    
    // 5분마다 업데이트
    const interval = setInterval(loadWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>날씨 정보를 불러오는 중...</div>;
  if (error) return <div>오류: {error}</div>;
  if (!weather) return <div>날씨 정보가 없습니다.</div>;

  return (
    <div className="weather-display">
      <h2>울산항 날씨 정보</h2>
      <div className="weather-grid">
        <div className="weather-item">
          <span className="label">온도</span>
          <span className="value">{weather.temperature}°C</span>
        </div>
        <div className="weather-item">
          <span className="label">풍속</span>
          <span className="value">{weather.windspeed} m/s</span>
        </div>
        <div className="weather-item">
          <span className="label">풍향</span>
          <span className="value">{weather.windDirection}°</span>
        </div>
        <div className="weather-item">
          <span className="label">날씨</span>
          <span className="value">{weather.weatherCondition}</span>
        </div>
      </div>
      <div className="timestamp">
        마지막 업데이트: {new Date(weather.timestamp).toLocaleString()}
      </div>
    </div>
  );
};