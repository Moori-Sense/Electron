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
  getTensionHistory: () => electron.ipcRenderer.invoke("get-tension-history")
});
