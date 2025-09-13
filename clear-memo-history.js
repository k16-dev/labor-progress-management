// Clear all memo history for production release
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, deleteField } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function clearMemoHistory() {
  try {
    console.log('🗑️  連絡事項履歴の削除を開始...');
    
    // Firebase初期化
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase初期化成功');
    
    // 進捗データを取得
    console.log('📊 進捗データを取得中...');
    const progressSnapshot = await getDocs(collection(db, 'progress'));
    const progressDocs = progressSnapshot.docs;
    console.log(`✅ 進捗データ取得: ${progressDocs.length}件`);
    
    // メモと履歴を削除
    let updatedCount = 0;
    let memoHistoryCleared = 0;
    
    for (const progressDoc of progressDocs) {
      const progressData = progressDoc.data();
      let needsUpdate = false;
      const updates = {};
      
      // メモをクリア
      if (progressData.memo && progressData.memo.trim().length > 0) {
        updates.memo = '';
        needsUpdate = true;
      }
      
      // メモ履歴をクリア
      if (progressData.memoHistory && progressData.memoHistory.length > 0) {
        memoHistoryCleared += progressData.memoHistory.length;
        updates.memoHistory = [];
        needsUpdate = true;
      }
      
      // 更新が必要な場合のみ実行
      if (needsUpdate) {
        await updateDoc(doc(db, 'progress', progressDoc.id), updates);
        updatedCount++;
        console.log(`🔄 更新: ${progressDoc.id}`);
      }
    }
    
    console.log(`\n📋 削除完了サマリー:`);
    console.log(`   - 更新された進捗レコード: ${updatedCount}件`);
    console.log(`   - 削除されたメモ履歴: ${memoHistoryCleared}件`);
    console.log(`\n🎉 連絡事項履歴の削除完了`);
    
    return true;
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    return false;
  }
}

clearMemoHistory().then(success => {
  process.exit(success ? 0 : 1);
});
