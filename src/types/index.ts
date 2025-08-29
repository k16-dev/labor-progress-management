export type Role = 'central' | 'block' | 'branch' | 'sub';

export type TaskCategory = 'block' | 'branch' | 'sub';

export type TaskKind = 'common' | 'local';

export type TaskStatus = '未着手' | '進行中' | '完了';

export interface Organization {
  id: string;
  name: string;
  role: Role;
  parentId?: string;
  active: boolean;
  displayOrder: number;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  kind: TaskKind;
  createdByOrgId: string;
  active: boolean;
  memo?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Progress {
  id: string;
  taskId: string;
  orgId: string;
  status: TaskStatus;
  memo?: string;
  memoHistory: MemoHistory[];
  completedAt?: string;
  updatedAt: string;
}

export interface MemoHistory {
  memo: string;
  orgId: string;
  timestamp: string;
}

export interface ProgressSummary {
  orgId: string;
  orgName: string;
  totalTasks: number;
  completedTasks: number;
  progressRate: number;
}

export interface LoginData {
  role: Role;
  orgId?: string;
  password: string;
}