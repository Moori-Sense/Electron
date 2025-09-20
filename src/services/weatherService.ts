import axios from "axios";
import { WeatherData } from "../types/weather";


const API_KEY = import.meta.env.OPENWEATHER_API_KEY;
const ULSAN_LAT = import.meta.env.ULSAN_LAT;
const ULSAN_LON = import.meta.env.ULSAN_LNG;


export async function fetchWeatherData(): Promise<WeatherData>{
    try{
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat: ULSAN_LAT,
                lng: ULSAN_LON,
                appid: API_KEY,
                units: 'metric',
                lang: 'kr'
            }
        });

        const data = response.data;

        return{
            temperature: Math.round(data.main.temp),
            windspeed: data.wind.speed,
            windDirection: data.wind.deg,
            weatherCondition: data.weather[0].description,
            timestamp: new Date().toISOString()
        };
    }catch(error){
        console.error('실제 데이터를 가져오는데 실패했습니다: ', error);
        throw error;
    }
}