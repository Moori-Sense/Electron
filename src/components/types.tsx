// --- 보여줄 화면 타입 정의 ---
// 'MooringLineInfo'를 'lineInfo'로 변경하여 다른 모드들과 일관성을 맞춥니다.
// 이것이 첫 번째 TypeScript 오류를 해결합니다.
export type ViewMode = 'right' | 'left' | 'settings' | 'lineInfo' | 'allTension'; // 'graph' 추가


// --- DB에서 가져올 데이터 타입 정의 ---
// 이 부분은 MooringLineInfo 컴포넌트가 필요로 하는 데이터의 "설계도" 역할을 합니다.
// 이 정의는 이미 올바르므로 수정할 필요가 없습니다.
export interface MooringLineDetails {
  id: number;
  length: number;
  usageTime: number;
  manufacturer: string;
  model: string;
  maintenanceDate: string;
}

export interface TensionLog {
  time: string;
  tension: number;
}

export interface LineData {
  details: MooringLineDetails;
  history: TensionLog[];
}

