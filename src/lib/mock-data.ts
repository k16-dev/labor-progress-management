import { Organization, Task, Progress, TaskCategory, TaskStatus, Role } from '@/types';

// モック組織データ
export const mockOrganizations: Organization[] = [
  // 中央
  { id: 'org_000', name: '中央', role: 'central', active: true, displayOrder: 0 },
  
  // ブロック (9組織)
  { id: 'org_001', name: '北海道ブロック', role: 'block', active: true, displayOrder: 1 },
  { id: 'org_002', name: '東北ブロック', role: 'block', active: true, displayOrder: 2 },
  { id: 'org_003', name: '関東ブロック', role: 'block', active: true, displayOrder: 3 },
  { id: 'org_004', name: '北陸ブロック', role: 'block', active: true, displayOrder: 4 },
  { id: 'org_005', name: '東海ブロック', role: 'block', active: true, displayOrder: 5 },
  { id: 'org_006', name: '近畿ブロック', role: 'block', active: true, displayOrder: 6 },
  { id: 'org_007', name: '中国ブロック', role: 'block', active: true, displayOrder: 7 },
  { id: 'org_008', name: '四国ブロック', role: 'block', active: true, displayOrder: 8 },
  { id: 'org_009', name: '九州ブロック', role: 'block', active: true, displayOrder: 9 },
  
  // 分会 (52組織) - displayOrder: 10-61
  { id: 'org_010', name: '北海道', role: 'sub', active: true, displayOrder: 10 },
  { id: 'org_011', name: '青森', role: 'sub', active: true, displayOrder: 11 },
  { id: 'org_012', name: '岩手', role: 'sub', active: true, displayOrder: 12 },
  { id: 'org_013', name: '宮城', role: 'sub', active: true, displayOrder: 13 },
  { id: 'org_014', name: '秋田', role: 'sub', active: true, displayOrder: 14 },
  { id: 'org_015', name: '山形', role: 'sub', active: true, displayOrder: 15 },
  { id: 'org_016', name: '福島', role: 'sub', active: true, displayOrder: 16 },
  { id: 'org_017', name: '茨城', role: 'sub', active: true, displayOrder: 17 },
  { id: 'org_018', name: '栃木', role: 'sub', active: true, displayOrder: 18 },
  { id: 'org_019', name: '群馬', role: 'sub', active: true, displayOrder: 19 },
  { id: 'org_020', name: '埼玉', role: 'sub', active: true, displayOrder: 20 },
  { id: 'org_021', name: '千葉', role: 'sub', active: true, displayOrder: 21 },
  { id: 'org_022', name: '東京', role: 'sub', active: true, displayOrder: 22 },
  { id: 'org_023', name: '神奈川', role: 'sub', active: true, displayOrder: 23 },
  { id: 'org_024', name: '新潟', role: 'sub', active: true, displayOrder: 24 },
  { id: 'org_025', name: '富山', role: 'sub', active: true, displayOrder: 25 },
  { id: 'org_026', name: '石川', role: 'sub', active: true, displayOrder: 26 },
  { id: 'org_027', name: '福井', role: 'sub', active: true, displayOrder: 27 },
  { id: 'org_028', name: '山梨', role: 'sub', active: true, displayOrder: 28 },
  { id: 'org_029', name: '長野', role: 'sub', active: true, displayOrder: 29 },
  { id: 'org_030', name: '岐阜', role: 'sub', active: true, displayOrder: 30 },
  { id: 'org_031', name: '静岡', role: 'sub', active: true, displayOrder: 31 },
  { id: 'org_032', name: '愛知', role: 'sub', active: true, displayOrder: 32 },
  { id: 'org_033', name: '三重', role: 'sub', active: true, displayOrder: 33 },
  { id: 'org_034', name: '滋賀', role: 'sub', active: true, displayOrder: 34 },
  { id: 'org_035', name: '京都', role: 'sub', active: true, displayOrder: 35 },
  { id: 'org_036', name: '大阪', role: 'sub', active: true, displayOrder: 36 },
  { id: 'org_037', name: '兵庫', role: 'sub', active: true, displayOrder: 37 },
  { id: 'org_038', name: '奈良', role: 'sub', active: true, displayOrder: 38 },
  { id: 'org_039', name: '和歌山', role: 'sub', active: true, displayOrder: 39 },
  { id: 'org_040', name: '鳥取', role: 'sub', active: true, displayOrder: 40 },
  { id: 'org_041', name: '島根', role: 'sub', active: true, displayOrder: 41 },
  { id: 'org_042', name: '岡山', role: 'sub', active: true, displayOrder: 42 },
  { id: 'org_043', name: '広島', role: 'sub', active: true, displayOrder: 43 },
  { id: 'org_044', name: '山口', role: 'sub', active: true, displayOrder: 44 },
  { id: 'org_045', name: '徳島', role: 'sub', active: true, displayOrder: 45 },
  { id: 'org_046', name: '香川', role: 'sub', active: true, displayOrder: 46 },
  { id: 'org_047', name: '愛媛', role: 'sub', active: true, displayOrder: 47 },
  { id: 'org_048', name: '高知', role: 'sub', active: true, displayOrder: 48 },
  { id: 'org_049', name: '福岡', role: 'sub', active: true, displayOrder: 49 },
  { id: 'org_050', name: '佐賀', role: 'sub', active: true, displayOrder: 50 },
  { id: 'org_051', name: '長崎', role: 'sub', active: true, displayOrder: 51 },
  { id: 'org_052', name: '熊本', role: 'sub', active: true, displayOrder: 52 },
  { id: 'org_053', name: '大分', role: 'sub', active: true, displayOrder: 53 },
  { id: 'org_054', name: '宮崎', role: 'sub', active: true, displayOrder: 54 },
  { id: 'org_055', name: '鹿児島', role: 'sub', active: true, displayOrder: 55 },
  { id: 'org_056', name: '沖縄', role: 'sub', active: true, displayOrder: 56 },
  { id: 'org_057', name: '旭川', role: 'sub', active: true, displayOrder: 57 },
  { id: 'org_058', name: '多摩', role: 'sub', active: true, displayOrder: 58 },
  { id: 'org_059', name: '豊橋', role: 'sub', active: true, displayOrder: 59 },
  { id: 'org_060', name: '南大阪', role: 'sub', active: true, displayOrder: 60 },
  { id: 'org_061', name: '北九州', role: 'sub', active: true, displayOrder: 61 },
  
  // 支部 (3組織)
  { id: 'org_062', name: '幕張', role: 'branch', active: true, displayOrder: 62 },
  { id: 'org_063', name: '所沢', role: 'branch', active: true, displayOrder: 63 },
  { id: 'org_064', name: '吉備', role: 'branch', active: true, displayOrder: 64 }
];

// モックタスクデータ
export const mockTasks: Task[] = [
  {
    id: 'task_001',
    title: '全ブロック共通タスク',
    category: 'block',
    kind: 'common',
    createdByOrgId: 'org_000',
    active: true,
    memo: '',
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  },
  {
    id: 'task_002',
    title: '全支部共通タスク',
    category: 'branch',
    kind: 'common',
    createdByOrgId: 'org_000',
    active: true,
    memo: '',
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  },
  {
    id: 'task_003',
    title: '全分会共通タスク',
    category: 'sub',
    kind: 'common',
    createdByOrgId: 'org_000',
    active: true,
    memo: '',
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  },
  {
    id: 'task_004',
    title: '幕張支部ローカルタスク',
    category: 'branch',
    kind: 'local',
    createdByOrgId: 'org_062',
    active: true,
    memo: '幕張支部独自のタスクです',
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  },
  {
    id: 'task_005',
    title: '北海道分会ローカルタスク',
    category: 'sub',
    kind: 'local',
    createdByOrgId: 'org_010',
    active: true,
    memo: '北海道分会独自のタスクです',
    createdAt: '2025-08-24',
    updatedAt: '2025-08-24'
  }
];

// モック進捗データ
export const mockProgress: Progress[] = [
  {
    id: 'progress_001',
    taskId: 'task_001',
    orgId: 'org_001',
    status: '進行中',
    memo: '作業を開始しました',
    memoHistory: [
      {
        memo: '作業を開始しました',
        orgId: 'org_001',
        timestamp: '2025-08-24T10:00:00.000Z'
      }
    ],
    updatedAt: '2025-08-24'
  },
  {
    id: 'progress_002',
    taskId: 'task_003',
    orgId: 'org_010',
    status: '完了',
    memo: 'タスクが完了しました',
    memoHistory: [
      {
        memo: 'タスクが完了しました',
        orgId: 'org_010',
        timestamp: '2025-08-24T14:00:00.000Z'
      }
    ],
    completedAt: '2025-08-24',
    updatedAt: '2025-08-24'
  }
];

export class MockFirestoreService {
  private static organizations = [...mockOrganizations];
  private static tasks = [...mockTasks];
  private static progress = [...mockProgress];

  static async getOrganizations(): Promise<Organization[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.organizations]), 100);
    });
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const org = this.organizations.find(o => o.id === id);
        resolve(org || null);
      }, 100);
    });
  }

  static async getOrganizationsByRole(role: Role): Promise<Organization[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orgs = this.organizations.filter(o => o.role === role);
        resolve(orgs);
      }, 100);
    });
  }

  static async getTasks(): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.tasks]), 100);
    });
  }

  static async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = this.tasks.filter(t => 
          t.category === category && t.active && t.kind === 'common'
        );
        resolve(filteredTasks);
      }, 100);
    });
  }

  static async getTasksByOrganization(orgId: string): Promise<Task[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = this.tasks.filter(t => 
          t.createdByOrgId === orgId && t.active && t.kind === 'local'
        );
        resolve(filteredTasks);
      }, 100);
    });
  }

  static async createTask(task: Omit<Task, 'id'>): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = `task_${Date.now()}`;
        const newTask: Task = { ...task, id: newId };
        this.tasks.push(newTask);
        resolve(newId);
      }, 100);
    });
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index >= 0) {
          this.tasks[index] = { ...this.tasks[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
        }
        resolve();
      }, 100);
    });
  }

  static async deleteTask(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.progress = this.progress.filter(p => p.taskId !== id);
        resolve();
      }, 100);
    });
  }

  static async getProgress(): Promise<Progress[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.progress]), 100);
    });
  }

  static async getProgressByOrganization(orgId: string): Promise<Progress[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProgress = this.progress.filter(p => p.orgId === orgId);
        resolve(filteredProgress);
      }, 100);
    });
  }

  static async getProgressByTask(taskId: string): Promise<Progress[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredProgress = this.progress.filter(p => p.taskId === taskId);
        resolve(filteredProgress);
      }, 100);
    });
  }

  static async getProgressByTaskAndOrg(taskId: string, orgId: string): Promise<Progress | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const prog = this.progress.find(p => p.taskId === taskId && p.orgId === orgId);
        resolve(prog || null);
      }, 100);
    });
  }

  static async createOrUpdateProgress(
    taskId: string, 
    orgId: string, 
    status: TaskStatus, 
    memo?: string
  ): Promise<void> {
    console.log('🧪 MockFirestoreService.createOrUpdateProgress called:', {
      taskId,
      orgId,
      status,
      memo,
      timestamp: new Date().toISOString()
    });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const existingIndex = this.progress.findIndex(p => p.taskId === taskId && p.orgId === orgId);
        const now = new Date().toISOString();
        const today = now.split('T')[0];
        
        console.log('🧪 MockFirestoreService - Progress search result:', {
          existingIndex,
          existingProgress: existingIndex >= 0 ? this.progress[existingIndex] : null,
          allProgress: this.progress.length
        });
        
        if (existingIndex >= 0) {
          const existing = this.progress[existingIndex];
          const updates: Partial<Progress> = {
            status,
            updatedAt: today
          };
          
          if (memo !== undefined) {
            updates.memo = memo;
            updates.memoHistory = [
              ...(existing.memoHistory || []),
              {
                memo,
                orgId,
                timestamp: now
              }
            ];
          }
          
          if (status === '完了' && !existing.completedAt) {
            updates.completedAt = today;
          } else if (status !== '完了' && existing.completedAt) {
            // MockDataでは単純にundefinedにする
            updates.completedAt = undefined;
          }
          
          this.progress[existingIndex] = { ...existing, ...updates };
          console.log('🧪 MockFirestoreService - Updated existing progress:', this.progress[existingIndex]);
        } else {
          const newProgress: Progress = {
            id: `progress_${Date.now()}`,
            taskId,
            orgId,
            status,
            memo: memo || '',
            memoHistory: memo ? [{
              memo,
              orgId,
              timestamp: now
            }] : [],
            completedAt: status === '完了' ? today : undefined,
            updatedAt: today
          };
          
          this.progress.push(newProgress);
          console.log('🧪 MockFirestoreService - Created new progress:', newProgress);
        }
        
        console.log('🧪 MockFirestoreService - Final progress state:', this.progress.filter(p => p.taskId === taskId && p.orgId === orgId));
        resolve();
      }, 100);
    });
  }
}