import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase設定が有効かチェック
const isValidConfig = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
         process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key' &&
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'your-project-id';
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isValidConfig()) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // 既に初期化されていない場合のみ初期化
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  db = getFirestore(app);
} else {
  console.warn('Firebase configuration not found or invalid. Using mock data for development.');
}

export { db, app };
export default app;