// 날씨 데이터 타입
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCondition: string;
  weatherDescription: string;
  weatherIcon: string;
  waveHeight: number;
  waveHeightTime: string;
  timestamp: string;
  location: string;
}

