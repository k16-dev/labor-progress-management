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
    // 既に初期化されていない場合のみ初期化
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized on client');
    } else {
      app = getApps()[0];
      console.log('Using existing Firebase app on client');
    }
    
    db = getFirestore(app);
    console.log('Firestore database initialized successfully on client');
  } catch (error) {
    console.error('Firebase initialization failed on client:', error);
    console.error('Config used:', firebaseConfig);
  }
}

export { db, app };
export default app;