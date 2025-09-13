import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  Firestore,
} from 'firebase/firestore';

// 環境変数からFirebase設定を読み込み
const loadFirebaseConfig = () => {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  } as const;

  // いずれかが未設定なら無効とみなす
  const allPresent = Object.values(cfg).every((v) => typeof v === 'string' && v.length > 0);
  return allPresent ? (cfg as unknown as Record<string, string>) : null;
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
    const firebaseConfig = loadFirebaseConfig();
    if (!firebaseConfig) {
      // 設定が無い場合は初期化しない（モックにフォールバック）
      return { app: null, db: null };
    }
    // Firebase App初期化
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Firestore初期化（長期ポーリングを強制し、プロキシ/ネットワーク環境での切断に強くする）
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
      } as any);
    } catch {
      // フォールバック（万一initializeFirestoreが失敗した場合）
      db = (await import('firebase/firestore')).getFirestore(app);
    }

    // オフライン永続化（可能な環境で有効化）
    if (db) {
      try {
        await enableIndexedDbPersistence(db);
      } catch (err: unknown) {
        // 既に別タブで有効、または環境非対応の場合はマルチタブ永続化を試行
        try {
          await enableMultiTabIndexedDbPersistence(db);
        } catch {
          // どちらも不可の場合はスキップ（機能限定で継続）
        }
      }
    }

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
