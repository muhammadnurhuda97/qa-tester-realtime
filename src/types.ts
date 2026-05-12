export enum TestStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NOT_TESTED = 'NOT_TESTED',
}

export interface ChecklistItem {
  id: string;
  text: string;
  status: TestStatus;
  notes?: string;
  testedBy?: string;
}

export interface ChecklistGroup {
  id: string;
  module: string;
  items: ChecklistItem[];
}

export interface AppState {
  groups: ChecklistGroup[];
  lastUpdated: string | null;
  testerName: string | null;
}
