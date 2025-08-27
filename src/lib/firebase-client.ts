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
    console.log('🚫 Firebase initialization skipped: Server-side environment');
    return { app: null, db: null };
  }

  // 既に初期化済みの場合は返す
  if (app && db) {
    console.log('♻️ Firebase already initialized, returning existing instance');
    return { app, db };
  }

  try {
    console.log('🔥 Starting Firebase initialization...', {
      timestamp: new Date().toISOString(),
      hostname: window.location.hostname,
      protocol: window.location.protocol
    });

    // Firebase App初期化
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase App initialized successfully');
    } else {
      app = getApps()[0];
      console.log('♻️ Using existing Firebase App');
    }

    // Firestore初期化
    db = getFirestore(app);
    console.log('✅ Firestore initialized successfully');

    // 初期化完了を記録
    (window as unknown as Record<string, unknown>).__firebaseInitialized = true;
    (window as unknown as Record<string, unknown>).__firebaseInitTime = Date.now();

    return { app, db };

  } catch (error) {
    console.error('❌ Firebase initialization failed:', {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      config: firebaseConfig
    });

    // エラーを記録
    (window as unknown as Record<string, unknown>).__firebaseInitError = error;
    (window as unknown as Record<string, unknown>).__firebaseInitialized = false;

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