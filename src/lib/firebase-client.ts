import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAq-N9zXGekpsfcSiJDCaNzakDv0C7DUSo",
  authDomain: "labor-progress-management.firebaseapp.com",
  projectId: "labor-progress-management",
  storageBucket: "labor-progress-management.firebasestorage.app",
  messagingSenderId: "786259646367",
  appId: "1:786259646367:web:0dc8b27c7edc21fb508faa"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// Firebase初期化を遅延実行
export const initializeFirebase = (): { app: FirebaseApp | null; db: Firestore | null } => {
  // ブラウザ環境でのみ実行
  if (typeof window === 'undefined') {
    return { app: null, db: null };
  }

  // 既に初期化済みの場合は返す
  if (app && db) {
    return { app, db };
  }

  try {
    // Firebase App初期化
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Firestore初期化
    db = getFirestore(app);

    return { app, db };

  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return { app: null, db: null };
  }
};

// Firebase初期化状態をチェック
export const getFirebaseStatus = () => {
  if (typeof window === 'undefined') {
    return { initialized: false, error: null, environment: 'server' };
  }

  const w = window as unknown as Record<string, unknown>;
  return {
    initialized: !!w.__firebaseInitialized,
    error: w.__firebaseInitError || null,
    initTime: w.__firebaseInitTime || null,
    environment: 'client'
  };
};

// 初期化を試行（ブラウザ環境でのみ）
if (typeof window !== 'undefined') {
  const { app: initializedApp, db: initializedDb } = initializeFirebase();
  app = initializedApp;
  db = initializedDb;
}

export { app, db };