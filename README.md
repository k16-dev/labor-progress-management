# 🏢 統合進捗管理システム

労働組合の階層的な組織構造に対応した、包括的なタスク管理・進捗追跡システムです。

## 🌟 主な機能

### 📊 階層組織対応
- **中央本部**: 全体の進捗監視とタスク配信
- **ブロック**: 地域ブロックでの進捗管理
- **分会**: 都道府県レベルでの詳細管理  
- **支部**: 地域支部での個別対応

### 📋 タスク管理
- **共通タスク**: 中央から各組織レベルへの配信
- **ローカルタスク**: 各組織独自のタスク作成
- **ステータス管理**: 未着手 → 進行中 → 完了
- **進捗追跡**: リアルタイムでの完了状況把握

### 💬 コミュニケーション
- **連絡事項**: タスクごとの中央への報告機能
- **履歴管理**: 過去の連絡内容の記録・追跡
- **メモ機能**: 詳細な進捗情報の共有

### 📱 レスポンシブUI
- **カンバンビュー**: PC・タブレット向けの視覚的管理
- **テーブルビュー**: モバイル対応の詳細表示
- **リアルタイム更新**: 即座の進捗反映

## 🚀 本番システム

### 🌐 https://k16-dev.github.io/labor-progress-management/

**📦 本番環境リリース完了！**

**バージョン:** v1.0.0  
**リリース日:** 2025年8月27日  
**状態:** ✅ 本番運用可能

## 📚 利用ガイド

### 👥 ユーザー向けドキュメント
- **[🏢 管理者ガイド（中央本部向け）](docs/ADMINISTRATOR_GUIDE.md)**
  - 共通タスクの管理方法
  - 進捗監視ダッシュボードの使い方
  - 組織からの連絡事項確認方法

- **[👥 利用者ガイド（ブロック・支部・分会向け）](docs/USER_GUIDE.md)**
  - タスクの進捗更新方法
  - 中央への連絡・報告機能
  - ローカルタスクの作成方法

- **[⚡ クイックリファレンス](docs/QUICK_REFERENCE.md)**
  - 役割別機能一覧
  - 基本操作チートシート
  - トラブルシューティング

## 🔧 技術仕様

### フロントエンド
- **Next.js 15.5.0** (App Router)
- **React 19.1.0** 
- **TypeScript 5**
- **Tailwind CSS 4**
- **Chart.js** (進捗可視化)

### バックエンド・データベース
- **Firebase Firestore** (NoSQLデータベース)
- **静的サイト生成** (GitHub Pages対応)
- **モックデータ対応** (開発・フォールバック用)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. Firebase Console で新しいプロジェクトを作成
2. Firestore Database を有効化
3. プロジェクトの設定 > 全般 > Firebase SDK snippet から設定情報を取得
4. `.env.local` ファイルを編集して Firebase 設定を追加:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Firestore セキュリティルール

Firebase Console > Firestore Database > ルール で以下を設定:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 全ユーザーが読み取り可能（認証は簡易実装のため）
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. データ初期化

Firebase Admin SDK をセットアップして初期データを投入:

```bash
# Firebase CLI インストール
npm install -g firebase-tools

# Firebase ログイン
firebase login

# プロジェクト初期化
firebase init

# シードデータ投入
npm run seed
```

## 開発・実行

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### ビルド

```bash
npm run build
npm run start
```

### デプロイ（GitHub Pages）

**🌐 本番環境**: https://k16-dev.github.io/labor-progress-management/

**自動デプロイの流れ:**
1. `git push origin main` でコードをプッシュ
2. GitHub Actions が自動実行
3. Next.js ビルド処理
4. GitHub Pages に自動デプロイ完了

**環境変数**: GitHub Secrets で設定済み（Firebase設定）

## 使用方法

### ログイン認証

- **中央**: パスワード `1050`
- **ブロック/支部/分会**: パスワード `1234` + 組織選択

### 中央ユーザー

1. **進捗一覧**: 全組織の進捗状況を一覧表示
2. **棒グラフ**: ブロック/支部/分会別の進捗率をグラフ表示
3. **管理**: 共通タスク（全ブロック、全支部、全分会向け）の作成・削除

### ブロック/支部/分会ユーザー

1. **タスク管理**: 
   - 共通タスク（閲覧のみ） + 自組織のローカルタスク
   - ステータス更新（未着手/進行中/完了）
   - メモ追加（履歴保持）
2. **ローカルタスク作成**: 自組織専用のタスクを作成
3. **表示モード**: 
   - PC/タブレット: カンバン方式/テーブル方式 切替可能
   - スマホ: テーブル方式（レスポンシブ対応）

## データ構造

### Organizations（組織）
- 中央（1組織）+ ブロック（9組織）+ 分会（52組織）+ 支部（3組織）

### Tasks（タスク）
- **共通タスク**: 中央が作成、カテゴリ別に該当組織に適用
- **ローカルタスク**: 各組織が自分用に作成

### Progress（進捗）
- タスクごと・組織ごとの進捗状況
- ステータス + メモ + 履歴

## 主な組織一覧

### ブロック（9組織）
北海道ブロック、東北ブロック、関東ブロック、北陸ブロック、東海ブロック、近畿ブロック、中国ブロック、四国ブロック、九州ブロック

### 支部（3組織）
幕張、所沢、吉備

### 分会（52組織）
47都道府県 + 旭川、多摩、豊橋、南大阪、北九州

## アクセシビリティ対応

- WCAG 2.1 AA 準拠
- キーボード操作対応
- スクリーンリーダー対応
- 色彩コントラスト確保

## 追加開発要件

将来拡張として以下の機能が検討されています:

- 個別ユーザーアカウント + MFA
- メール/Slack 通知
- 監査ログ機能
- 権限の細分化
- メモのスレッド化

## ライセンス

このプロジェクトは要件定義書に基づいて実装されています。
# Force deploy trigger 2025年 8月26日 火曜日 21時53分24秒 JST
