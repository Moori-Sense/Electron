import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
  

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('electronAPI', {
  getMooringLineData: (lineId: number) => ipcRenderer.invoke('getMooringLineData', lineId)
});

contextBridge.exposeInMainWorld('api', {
  // 이 함수를 호출하면 'get-tension-history' 채널로 Main 프로세스에 요청을 보냅니다.
  // getTensionHistory 함수는 TensionGraph 컴포넌트에서 사용됩니다.
  getTensionHistory: () => ipcRenderer.invoke('get-tension-history'),
  // 
  getAllMooringLines: () => ipcRenderer.invoke('get-all-mooring-lines'),
  getLatestTensions: () => ipcRenderer.invoke('get-latest-tensions'),
  // getTensionHistoryById 는 MooringLineInfo.tsx에서 사용됩니다.
  getTensionHistoryById: (lineId: string) => ipcRenderer.invoke('get-tension-history-by-id', lineId),
  getDashBoardData: () => ipcRenderer.invoke('get-dashboard-data'),
  // 최종 정비, 총 사용시간을 가져옴
  getLineInfo: (lineId: string) => ipcRenderer.invoke('get-line-info', lineId),
  // 경고/위험 알림 개수 가져옴
  getAlertCount: () => ipcRenderer.invoke('get-alert-count'),


});


