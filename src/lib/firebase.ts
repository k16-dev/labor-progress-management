import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase設定（GitHub Pages用に直接設定）
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAq-N9zXGekpsfcSiJDCaNzakDv0C7DUSo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "labor-progress-management.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "labor-progress-management",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "labor-progress-management.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "786259646367",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:786259646367:web:0dc8b27c7edc21fb508faa"
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

// クライアントサイドでのみFirebaseを初期化
if (typeof window !== 'undefined') {
  try {
    // 詳細な環境情報をログ出力
    console.log('🔥 Firebase initialization attempt:', {
      environment: 'browser',
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    // 既に初期化されていない場合のみ初期化
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized successfully on client');
    } else {
      app = getApps()[0];
      console.log('♻️ Using existing Firebase app on client');
    }
    
    db = getFirestore(app);
    
    // Firestoreの接続テスト
    console.log('🔗 Testing Firestore connection...');
    
    // Firestoreの初期化完了をログ出力
    console.log('✅ Firestore database initialized successfully on client');
    
  } catch (error) {
    console.error('❌ Firebase initialization failed on client:', {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      config: firebaseConfig
    });
    
    // Firebase初期化失敗をグローバルに記録
    (window as unknown as Record<string, unknown>).__firebaseInitError = error;
  }
}

export { db, app };
export default app;