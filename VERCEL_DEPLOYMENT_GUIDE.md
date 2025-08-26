# Vercel自動デプロイ修正ガイド

Vercelの自動デプロイが機能しない問題の解決手順です。

## 方法1: 新しいプロジェクトとして再作成（推奨）

1. **既存プロジェクトを削除**
   - https://vercel.com/dashboard にアクセス
   - `labor-progress-management` プロジェクトを選択
   - Settings → Advanced → Delete Project

2. **新しいプロジェクトを作成**
   - Dashboard → "Add New..." → "Project"
   - "Import Git Repository" → `KouA16/labor-progress-management` を選択
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` （自動設定）
   - **Install Command**: `npm install`

3. **環境変数を設定**
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAq-N9zXGekpsfcSiJDCaNzakDv0C7DUSo
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=labor-progress-management.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=labor-progress-management
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=labor-progress-management.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=786259646367
   NEXT_PUBLIC_FIREBASE_APP_ID=1:786259646367:web:0dc8b27c7edc21fb508faa
   ```

4. **Deploy** ボタンをクリック

## 方法2: GitHub連携の再設定

1. **GitHub Integration確認**
   - https://github.com/settings/installations
   - Vercel for GitHub を選択
   - Repository access で `KouA16/labor-progress-management` が含まれているか確認

2. **Vercelプロジェクト設定**
   - Project Settings → Git
   - Production Branch が `main` になっているか確認
   - 必要に応じて Disconnect → Connect で再接続

## 方法3: Deploy Hook（手動）

1. **Deploy Hook作成**
   - Project Settings → Git
   - Deploy Hooks → Create Hook
   - Name: "Manual Deploy"
   - Branch: `main`
   - URLをコピー

2. **GitHub Webhook設定**
   - https://github.com/KouA16/labor-progress-management/settings/hooks
   - Add webhook → Payload URL に Deploy Hook URLを入力
   - Content type: `application/json`
   - Events: "Just the push event"

## 現在の状況

- コミット `4f048d2` が最新
- UI/UX改善とFirebaseデータ投入完了
- 本番環境でのテスト待ち

## トラブルシューティング

### よくある原因
- GitHub権限不足
- Production Branchの設定間違い
- Environment Variables未設定
- Build設定の問題

### 確認ポイント
- Build Logsでエラー確認
- Environment Variables正しく設定されているか
- GitHub repository権限があるか
- main branchにプッシュされているか