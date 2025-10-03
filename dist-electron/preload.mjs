"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getMooringLineData: (lineId) => electron.ipcRenderer.invoke("getMooringLineData", lineId)
});
electron.contextBridge.exposeInMainWorld("api", {
  // 이 함수를 호출하면 'get-tension-history' 채널로 Main 프로세스에 요청을 보냅니다.
  // getTensionHistory 함수는 TensionGraph 컴포넌트에서 사용됩니다.
  getTensionHistory: () => electron.ipcRenderer.invoke("get-tension-history"),
  // 
  getAllMooringLines: () => electron.ipcRenderer.invoke("get-all-mooring-lines"),
  getLatestTensions: () => electron.ipcRenderer.invoke("get-latest-tensions"),
  // getTensionHistoryById 는 MooringLineInfo.tsx에서 사용됩니다.
  getTensionHistoryById: (lineId) => electron.ipcRenderer.invoke("get-tension-history-by-id", lineId),
  getDashBoardData: () => electron.ipcRenderer.invoke("get-dashboard-data"),
  // 최종 정비, 총 사용시간을 가져옴
  getLineInfo: (lineId) => electron.ipcRenderer.invoke("get-line-info", lineId),
  // 경고/위험 알림 개수 가져옴
  getAlertCount: () => electron.ipcRenderer.invoke("get-alert-count")
});
