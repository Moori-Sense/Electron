import React from 'react';
import { WeatherDisplay } from './WeatherDisplay';

export const MainPage: React.FC = () => {
  return (
    <div className="main-page">
      {/* 날씨 정보 - 왼쪽 상단 고정 */}
      <div className="weather-sidebar">
        <WeatherDisplay />
      </div>
    </div>
  );
};
