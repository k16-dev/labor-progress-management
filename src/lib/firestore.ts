import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import { MockFirestoreService } from './mock-data';
import { Organization, Task, Progress, TaskCategory, TaskStatus, Role } from '@/types';

// Firebase接続チェック
const isFirebaseConfigured = () => {
  console.log('Firebase configuration check:', {
    dbExists: db !== null,
    environment: typeof window !== 'undefined' ? 'browser' : 'server'
  });
  return db !== null;
};

export class FirestoreService {
  static async getOrganizations(): Promise<Organization[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getOrganizations();
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'organizations'), orderBy('displayOrder', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Organization[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
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
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getOrganizationById(id);
    }
  }

  static async getOrganizationsByRole(role: Role): Promise<Organization[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getOrganizationsByRole(role);
    }
    
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'organizations'), 
          where('role', '==', role),
          orderBy('displayOrder', 'asc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Organization[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getOrganizationsByRole(role);
    }
  }

  static async getTasks(): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasks();
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'tasks'), orderBy('createdAt', 'asc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getTasks();
    }
  }

  static async getTasksByCategory(category: TaskCategory): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasksByCategory(category);
    }
    
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'tasks'), 
          where('category', '==', category),
          where('active', '==', true),
          where('kind', '==', 'common'),
          orderBy('createdAt', 'asc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getTasksByCategory(category);
    }
  }

  static async getTasksByOrganization(orgId: string): Promise<Task[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getTasksByOrganization(orgId);
    }
    
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'tasks'), 
          where('createdByOrgId', '==', orgId),
          where('active', '==', true),
          where('kind', '==', 'local'),
          orderBy('createdAt', 'asc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getTasksByOrganization(orgId);
    }
  }

  static async createTask(task: Omit<Task, 'id'>): Promise<string> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.createTask(task);
    }
    
    try {
      const docRef = await addDoc(collection(db, 'tasks'), task);
      return docRef.id;
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.createTask(task);
    }
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, { 
      ...updates, 
      updatedAt: new Date().toISOString().split('T')[0] 
    });
  }

  static async deleteTask(id: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    const batch = writeBatch(db);
    
    // Delete task
    const taskRef = doc(db, 'tasks', id);
    batch.delete(taskRef);
    
    // Delete related progress records
    const progressQuery = query(collection(db, 'progress'), where('taskId', '==', id));
    const progressSnapshot = await getDocs(progressQuery);
    
    progressSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  static async getProgress(): Promise<Progress[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgress();
    }
    
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'progress'), orderBy('updatedAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Progress[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getProgress();
    }
  }

  static async getProgressByOrganization(orgId: string): Promise<Progress[]> {
    if (!isFirebaseConfigured() || !db) {
      return MockFirestoreService.getProgressByOrganization(orgId);
    }
    
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, 'progress'), 
          where('orgId', '==', orgId),
          orderBy('updatedAt', 'desc')
        )
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Progress[];
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.getProgressByOrganization(orgId);
    }
  }

  static async getProgressByTask(taskId: string): Promise<Progress[]> {
    if (!db) return [];
    const querySnapshot = await getDocs(
      query(
        collection(db, 'progress'), 
        where('taskId', '==', taskId),
        orderBy('updatedAt', 'desc')
      )
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Progress[];
  }

  static async getProgressByTaskAndOrg(taskId: string, orgId: string): Promise<Progress | null> {
    if (!db) return null;
    const querySnapshot = await getDocs(
      query(
        collection(db, 'progress'), 
        where('taskId', '==', taskId),
        where('orgId', '==', orgId)
      )
    );
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Progress;
    }
    return null;
  }

  static async createOrUpdateProgress(
    taskId: string, 
    orgId: string, 
    status: TaskStatus, 
    memo?: string
  ): Promise<void> {
    console.log('createOrUpdateProgress called:', { taskId, orgId, status, memo });
    
    if (!isFirebaseConfigured() || !db) {
      console.log('Using MockFirestoreService for progress update');
      return MockFirestoreService.createOrUpdateProgress(taskId, orgId, status, memo);
    }
    
    console.log('Using Firebase for progress update');
    try {
      const existing = await this.getProgressByTaskAndOrg(taskId, orgId);
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      
      console.log('Firestore - existing progress:', existing);
      
      if (existing) {
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
          // Firestoreでフィールドを削除するための特別処理
          const updateData = { ...updates };
          Object.assign(updateData, { completedAt: deleteField() });
          console.log('Firestore - updating existing progress with:', updateData);
          const docRef = doc(db, 'progress', existing.id);
          await updateDoc(docRef, updateData);
          console.log('Firestore - progress update completed successfully');
          return;
        }
        
        console.log('Firestore - updating existing progress with:', updates);
        const docRef = doc(db, 'progress', existing.id);
        await updateDoc(docRef, updates);
        console.log('Firestore - progress update completed successfully');
      } else {
        const newProgress: Omit<Progress, 'id'> = {
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
        
        console.log('Firestore - creating new progress:', newProgress);
        await addDoc(collection(db, 'progress'), newProgress);
        console.log('Firestore - new progress created successfully');
      }
    } catch (error) {
      console.warn('Firebase error, using mock data:', error);
      return MockFirestoreService.createOrUpdateProgress(taskId, orgId, status, memo);
    }
  }
}