import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  deleteField,
} from 'firebase/firestore';
import { db, initializeFirebase } from './firebase-client';
import { MockFirestoreService } from './mock-data';
import { Organization, Task, Progress, TaskCategory, TaskStatus, Role } from '@/types';

// Firebase接続チェック（動的初期化対応）
const isFirebaseConfigured = () => {
  // ブラウザ環境でFirebase初期化を確認
  if (typeof window !== 'undefined') {
    const { db: currentDb } = initializeFirebase();
    return currentDb !== null;
  }
  
  return false;
};

// シンプルなクライアントサイドキャッシュ（TTL）で読取回数を削減
const CACHE_TTL_MS = 60 * 1000; // 60秒
const cache = {
  orgs: { ts: 0, data: [] as Organization[] },
  tasks: { ts: 0, data: [] as Task[] },
  progress: { ts: 0, data: [] as Progress[] },
};

const nowTs = () => Date.now();
const fresh = (ts: number) => nowTs() - ts < CACHE_TTL_MS;
const invalidate = (keys: Array<keyof typeof cache>) => {
  for (const k of keys) cache[k].ts = 0;
};

export class FirestoreService {
  static async getOrganizations(): Promise<Organization[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getOrganizations();
    }
    // キャッシュ利用
    if (fresh(cache.orgs.ts) && cache.orgs.data.length > 0) {
      return [...cache.orgs.data].sort((a, b) => a.displayOrder - b.displayOrder);
    }

    try {
      // シンプルなクエリに変更（インデックス不要）
      const querySnapshot = await getDocs(collection(db, 'organizations'));
      const allOrgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Organization[];
      cache.orgs = { ts: nowTs(), data: allOrgs };
      // JavaScript側でソート
      return allOrgs.sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.warn('Firebase error in getOrganizations, falling back to mock:', error);
      return MockFirestoreService.getOrganizations();
    }
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getOrganizationById(id);
    }
    
    try {
      const docRef = doc(db, 'organizations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Organization;
      }
      return null;
    } catch (error) {
      console.warn('Firebase error in getOrganizationById, falling back to mock:', error);
      return MockFirestoreService.getOrganizationById(id);
    }
  }

  static async getOrganizationsByRole(role: Role): Promise<Organization[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getOrganizationsByRole(role);
    }
    
    try {
      const allOrgs = await this.getOrganizations();
      return allOrgs.filter(o => o.role === role).sort((a, b) => a.displayOrder - b.displayOrder);
    } catch (error) {
      console.warn('Firebase error in getOrganizationsByRole, falling back to mock:', error);
      return MockFirestoreService.getOrganizationsByRole(role);
    }
  }

  static async getTasks(): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasks();
    }
    if (fresh(cache.tasks.ts) && cache.tasks.data.length > 0) {
      return [...cache.tasks.data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    try {
      // シンプルなクエリに変更（インデックス不要）
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const allTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      cache.tasks = { ts: nowTs(), data: allTasks };
      // JavaScript側でソート
      return allTasks.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (error) {
      console.warn('Firebase error in getTasks, falling back to mock:', error);
      return MockFirestoreService.getTasks();
    }
  }

  static async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasksByCategory(category);
    }
    
    try {
      const allTasks = await this.getTasks();
      return allTasks
        .filter(t => t.category === category && t.active && t.kind === 'common')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (error) {
      console.warn('Firebase error in getTasksByCategory, falling back to mock:', error);
      return MockFirestoreService.getTasksByCategory(category);
    }
  }

  static async getTasksByOrganization(orgId: string): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasksByOrganization(orgId);
    }
    
    try {
      const allTasks = await this.getTasks();
      return allTasks
        .filter(t => t.createdByOrgId === orgId && t.active && t.kind === 'local')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    } catch (error) {
      console.warn('Firebase error in getTasksByOrganization, falling back to mock:', error);
      return MockFirestoreService.getTasksByOrganization(orgId);
    }
  }

  static async createTask(task: Omit<Task, 'id'>): Promise<string> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.createTask(task);
    }
    
    try {
      const docRef = await addDoc(collection(db, 'tasks'), task);
      invalidate(['tasks']);
      return docRef.id;
    } catch (error) {
      console.warn('Firebase error in createTask:', error);
      throw error;
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.updateTask(id, updates);
    }
    
    try {
      const docRef = doc(db, 'tasks', id);
      await updateDoc(docRef, { 
        ...updates, 
        updatedAt: new Date().toISOString().split('T')[0] 
      });
      invalidate(['tasks']);
    } catch (error) {
      console.warn('Firebase error in updateTask:', error);
      throw error;
    }
  }

  static async deleteTask(id: string): Promise<void> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.deleteTask(id);
    }

    const batch = writeBatch(db);

    const taskRef = doc(db, 'tasks', id);
    batch.delete(taskRef);

    const progressQuery = query(collection(db, 'progress'), where('taskId', '==', id));
    const progressSnapshot = await getDocs(progressQuery);

    progressSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    invalidate(['tasks', 'progress']);
  }

  static async getProgress(): Promise<Progress[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgress();
    }
    if (fresh(cache.progress.ts) && cache.progress.data.length > 0) {
      return [...cache.progress.data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    try {
      // シンプルなクエリに変更（インデックス不要）
      const querySnapshot = await getDocs(collection(db, 'progress'));
      const allProgress = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Progress[];
      cache.progress = { ts: nowTs(), data: allProgress };
      // JavaScript側でソート
      return allProgress.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      console.warn('Firebase error in getProgress, falling back to mock:', error);
      return MockFirestoreService.getProgress();
    }
  }

  static async getProgressByOrganization(orgId: string): Promise<Progress[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgressByOrganization(orgId);
    }
    
    try {
      const allProgress = await this.getProgress();
      return allProgress.filter(p => p.orgId === orgId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      console.warn('Firebase error in getProgressByOrganization, falling back to mock:', error);
      return MockFirestoreService.getProgressByOrganization(orgId);
    }
  }

  static async getProgressByTask(taskId: string): Promise<Progress[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgressByTask(taskId);
    }
    try {
      const all = await this.getProgress();
      return all.filter(p => p.taskId === taskId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch (error) {
      console.warn('Firebase error in getProgressByTask, falling back to mock:', error);
      return MockFirestoreService.getProgressByTask(taskId);
    }
  }

  static async getProgressByTaskAndOrg(taskId: string, orgId: string): Promise<Progress | null> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgressByTaskAndOrg(taskId, orgId);
    }
    try {
      // まずは直接クエリで正確に取得（キャッシュ非依存）
      const q = query(
        collection(db, 'progress'),
        where('taskId', '==', taskId),
        where('orgId', '==', orgId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as Progress;
      }
      // フォールバックで全件から検索
      const all = await this.getProgress();
      const found = all.find(p => p.taskId === taskId && p.orgId === orgId);
      return found || null;
    } catch (error) {
      console.warn('Firebase error in getProgressByTaskAndOrg, falling back to mock:', error);
      return MockFirestoreService.getProgressByTaskAndOrg(taskId, orgId);
    }
  }

  static async createOrUpdateProgress(
    taskId: string, 
    orgId: string, 
    status: TaskStatus, 
    memo?: string
  ): Promise<void> {
    // 動的にFirebaseを取得
    const { db: currentDb } = initializeFirebase();

    if (!isFirebaseConfigured() || !currentDb) {
      return MockFirestoreService.createOrUpdateProgress(taskId, orgId, status, memo);
    }

    try {
      // 直近の状態をサーバから直接取得
      const existing = await this.getProgressByTaskAndOrg(taskId, orgId);
      const nowIso = new Date().toISOString();
      const today = nowIso.split('T')[0];

      const sanitizedMemo = typeof memo === 'string' ? memo.trim() : undefined;
      const memoChanged = !!existing
        ? sanitizedMemo !== undefined && sanitizedMemo !== (existing.memo || '').trim()
        : sanitizedMemo !== undefined && sanitizedMemo.length > 0;

      if (existing) {
        const updateData: Record<string, unknown> = {
          status,
          updatedAt: today,
        };

        if (memoChanged) {
          updateData.memo = sanitizedMemo;
          const lastMemo = (existing.memoHistory || []).at(-1)?.memo?.trim();
          const newHistory = [
            ...(existing.memoHistory || []),
          ];
          if (sanitizedMemo && sanitizedMemo !== lastMemo) {
            newHistory.push({ memo: sanitizedMemo, orgId, timestamp: nowIso });
          }
          updateData.memoHistory = newHistory;
        }

        if (status === '完了' && !existing.completedAt) {
          updateData.completedAt = today;
        } else if (status !== '完了' && existing.completedAt) {
          updateData.completedAt = deleteField();
        }

        const docRef = doc(currentDb, 'progress', existing.id);
        await updateDoc(docRef, updateData);
      } else {
        const newProgress: Omit<Progress, 'id'> = {
          taskId,
          orgId,
          status,
          memo: sanitizedMemo || '',
          memoHistory: sanitizedMemo && sanitizedMemo.length > 0 ? [{ memo: sanitizedMemo, orgId, timestamp: nowIso }] : [],
          completedAt: status === '完了' ? today : undefined,
          updatedAt: today,
        };

        await addDoc(collection(currentDb, 'progress'), newProgress);
      }

      // 進捗キャッシュを無効化（再取得で最新化）
      invalidate(['progress']);
    } catch (error) {
      console.error('Firebase error in createOrUpdateProgress:', error);
      // 書込みは安全のためフォールバックしない
      throw error;
    }
  }

  static async updateTaskOrder(taskOrderUpdates: { id: string; displayOrder: number }[]): Promise<void> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.updateTaskOrder(taskOrderUpdates);
    }
    
    try {
      const batch = writeBatch(db);
      
      // バッチ処理でタスクの表示順を更新
      taskOrderUpdates.forEach(({ id, displayOrder }) => {
        const taskRef = doc(db!, 'tasks', id);
        batch.update(taskRef, { 
          displayOrder,
          updatedAt: new Date().toISOString().split('T')[0]
        });
      });
      
      await batch.commit();
      invalidate(['tasks']);
    } catch (error) {
      console.warn('Firebase error in updateTaskOrder:', error);
      throw error;
    }
  }
}
