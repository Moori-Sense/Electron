import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/electron-vite.svg'
import { setupCounter } from './counter.ts'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { WeatherDisplay } from './components/WeatherDisplay'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://electron-vite.github.io" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Electron Mooring System</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <div id="weather-container"></div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

// React 컴포넌트 렌더링
const weatherContainer = document.getElementById('weather-container')
if (weatherContainer) {
  const root = createRoot(weatherContainer)
  root.render(React.createElement(WeatherDisplay))
}

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
