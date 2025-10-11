/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
}

interface Window {
  electronAPI: {
    getMooringLineData: (lineId: number) => Promise<{ details: any; history: any; }>;
  };
}

interface Window {
  api: {
    getTensionHistory: () => Promise<any>;
    getAllMooringLines: () => Promise<any[]>;
    getLatestTensions: () => Promise<Array<{ lineId: number; time: string; tension: number }>>;
    getTensionHistoryById: (lineId: string) => Promise<any[]>;
    getDashBoardData: () => Promise<any[]>;

    getLineInfo: (lineId: string) => Promise<{ lastInspected: string; usageHours: number; }>;
    //getAlertCount: (lineId: string) => Promise<{ cautionCount: number; warningCount: number; }>;
    getAlertCount: () => Promise<Array<{ lineId: number; cautionCount: number; warningCount: number; }>>;
    getAlerts: (lineId: string) => Promise<any[]>;
    getAllAlerts: () => Promise<any[]>;
    acknowledgeAlert: (alertId: number) => Promise<void>;
    getMooringLineData: (lineId: number) => Promise<{ details: any; history: any; }>;
    
  };
}