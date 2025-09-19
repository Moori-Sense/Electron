export interface WeatherData{
    temperature: number; // 온도
    windspeed: number; // 풍속
    windDirection: number; // 풍향
    timestamp: string; // 데이터 수집 시간
    weatherCondition: string; // 날씨 상태
}

export interface WeatherAPIResponse{
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            items: {
                item: Array<{
                    baseDate: string;
                    baseTime: string;
                    category: string;
                    nx: number;
                    ny: number;
                    obsrValue: string;
                }>;
            }
        }
    }
}
