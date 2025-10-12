"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherDisplay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
require("./WeatherDisplay.css");
const WeatherDisplay = () => {
    const [weather, setWeather] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const loadWeather = async () => {
        try {
            setLoading(true);
            const data = await window.ipcRenderer.invoke('get-weather-data');
            setWeather(data);
            setError(null);
        }
        catch (err) {
            setError('날씨 정보를 불러올 수 없습니다.');
            console.error('날씨 로드 오류:', err);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadWeather();
        const interval = setInterval(loadWeather, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);
    const getWindDirection = (degrees) => {
        const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동',
            '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
        return directions[Math.round(degrees / 22.5) % 16] || '북';
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "\uB0A0\uC528 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." });
    if (error)
        return (0, jsx_runtime_1.jsxs)("div", { className: "error", children: ["\uC624\uB958: ", error] });
    if (!weather)
        return (0, jsx_runtime_1.jsx)("div", { className: "no-data", children: "\uB0A0\uC528 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "weather-display", children: [(0, jsx_runtime_1.jsxs)("div", { className: "weather-header", children: [(0, jsx_runtime_1.jsx)("h2", { children: "\uB300\uD55C\uD574\uD611 \uD574\uC591 \uB0A0\uC528 \uC815\uBCF4" }), (0, jsx_runtime_1.jsx)("div", { className: "location", children: weather.location })] }), (0, jsx_runtime_1.jsxs)("div", { className: "weather-main", children: [(0, jsx_runtime_1.jsxs)("div", { className: "weather-icon-section", children: [(0, jsx_runtime_1.jsx)("img", { src: `https://openweathermap.org/img/wn/${weather.weatherIcon}@2x.png`, alt: weather.weatherDescription, className: "weather-icon" }), (0, jsx_runtime_1.jsxs)("div", { className: "weather-condition", children: [(0, jsx_runtime_1.jsx)("div", { className: "main-condition", children: weather.weatherCondition }), (0, jsx_runtime_1.jsx)("div", { className: "description", children: weather.weatherDescription })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "temperature-section", children: (0, jsx_runtime_1.jsxs)("div", { className: "main-temp", children: [weather.temperature, "\u00B0C"] }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "weather-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "weather-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "\uD48D\uC18D" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [weather.windSpeed, " m/s"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "weather-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "\uD48D\uD5A5" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [getWindDirection(weather.windDirection), " (", weather.windDirection, "\u00B0)"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "weather-item wave-height", children: [(0, jsx_runtime_1.jsx)("span", { className: "label", children: "\uD30C\uACE0" }), (0, jsx_runtime_1.jsxs)("span", { className: "value", children: [weather.waveHeight, " m"] }), weather.waveHeightTime && ((0, jsx_runtime_1.jsxs)("div", { className: "wave-time", children: ["\uCE21\uC815\uC2DC\uAC04: ", new Date(weather.waveHeightTime).toLocaleString()] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "timestamp", children: ["\uB9C8\uC9C0\uB9C9 \uC5C5\uB370\uC774\uD2B8: ", new Date(weather.timestamp).toLocaleString()] })] }));
};
exports.WeatherDisplay = WeatherDisplay;
