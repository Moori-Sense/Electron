import axios from "axios";
import { WeatherData } from "../types/weather";

const LAT = 34.919;
const LON = 129.121;
const OBS_CODE = "KG_0024";

// OpenWeather API 호출
async function getWeatherData(apiKey: string): Promise<any> {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat: LAT, lon: LON, appid: apiKey, units: 'metric', lang: 'kr' }
  });
  return response.data;
}

// 파고 API 호출
async function getWaveData(apiKey: string): Promise<any> {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const response = await axios.get('http://www.khoa.go.kr/api/oceangrid/obsWaveHight/search.do', {
    params: { ServiceKey: apiKey, ObsCode: OBS_CODE, Date: today, ResultType: 'json' }
  });
  return response.data;
}

// 날씨 데이터 가져오기
export async function fetchWeatherDataMain(): Promise<WeatherData> {
  try {
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;
    const khoaKey = process.env.KHOA_API_KEY;
    
    if (!openWeatherKey || !khoaKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }
    
    const [weatherData, waveData] = await Promise.all([
      getWeatherData(openWeatherKey),
      getWaveData(khoaKey)
    ]);

    const weather = weatherData.weather?.[0];
    if (!weather) {
      throw new Error('날씨 데이터를 가져올 수 없습니다.');
    }
    
    // 파고 데이터에서 가장 최근 데이터 찾기
    let waveInfo = { wave_height: '0', record_time: '' };
    if (waveData?.result?.data?.length > 0) {
      // 시간순으로 정렬하여 가장 최근 데이터 선택
      const sortedData = waveData.result.data.sort((a: any, b: any) => 
        new Date(b.record_time).getTime() - new Date(a.record_time).getTime()
      );
      waveInfo = sortedData[0];
    }

    const weatherMap: { [key: string]: string } = {
      'Clear': '맑음', 'Clouds': '구름', 'Rain': '비', 'Drizzle': '이슬비',
      'Thunderstorm': '뇌우', 'Snow': '눈', 'Mist': '안개', 'Fog': '안개'
    };

    return {
      temperature: Math.round(weatherData.main?.temp || 0),
      windSpeed: Math.round((weatherData.wind?.speed || 0) * 10) / 10,
      windDirection: weatherData.wind?.deg || 0,
      weatherCondition: weatherMap[weather.main] || weather.main,
      weatherDescription: weather.description || '',
      weatherIcon: weather.icon || '',
      waveHeight: Math.round(parseFloat(waveInfo.wave_height || '0') * 10) / 10,
      waveHeightTime: waveInfo.record_time || '',
      timestamp: new Date().toISOString(),
      location: '대한해협'
    };

  } catch (error) {
    console.error('날씨 데이터 로드 실패:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
