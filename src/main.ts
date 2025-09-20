import './style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MainPage } from './components/MainPage'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="main-container"></div>
`

// React 컴포넌트 렌더링
const mainContainer = document.getElementById('main-container')
if (mainContainer) {
  const root = createRoot(mainContainer)
  root.render(React.createElement(MainPage))
}

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
