// Firebase memo functionality test
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAq-N9zXGekpsfcSiJDCaNzakDv0C7DUSo",
  authDomain: "labor-progress-management.firebaseapp.com", 
  projectId: "labor-progress-management",
  storageBucket: "labor-progress-management.firebasestorage.app",
  messagingSenderId: "786259646367",
  appId: "1:786259646367:web:0dc8b27c7edc21fb508faa"
};

async function testMemoFunctionality() {
  try {
    console.log('🔍 連絡事項機能テスト開始...');
    
    // Firebase初期化
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase初期化成功');
    
    // タスクデータを取得
    console.log('📝 タスクデータを取得中...');
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ タスクデータ取得: ${tasks.length}件`);
    
    // 進捗データを取得
    console.log('📊 進捗データを取得中...');
    const progressSnapshot = await getDocs(collection(db, 'progress'));
    const progress = progressSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ 進捗データ取得: ${progress.length}件`);
    
    // メモ付き進捗の確認
    const progressWithMemo = progress.filter(p => p.memo && p.memo.trim().length > 0);
    console.log(`📝 メモ付き進捗: ${progressWithMemo.length}件`);
    
    if (progressWithMemo.length > 0) {
      console.log('\n📄 メモの例:');
      progressWithMemo.slice(0, 3).forEach((p, index) => {
        console.log(`  ${index + 1}. タスクID: ${p.taskId}`);
        console.log(`     組織ID: ${p.orgId}`);
        console.log(`     メモ: "${p.memo}"`);
        console.log(`     履歴: ${p.memoHistory ? p.memoHistory.length + '件' : '0件'}`);
      });
    }
    
    console.log('\n🎉 連絡事項機能テスト完了');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase接続エラー:', error.message);
    return false;
  }
}

testMemoFunctionality().then(success => {
  process.exit(success ? 0 : 1);
});