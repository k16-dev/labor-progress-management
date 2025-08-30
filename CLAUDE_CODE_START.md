# 🚀 Claude Code 開発再開 - ワンクリックスタート

## ⚡ 最速復帰（2分）

### 📁 **まずこの4ファイルをVS Codeで開いてください**

```
1. 📄 CLAUDE_CODE_START.md          ← このファイル（開いてます！）
2. 📄 DEVELOPMENT_HISTORY.md        ← 完全な開発履歴
3. 📄 src/types/index.ts           ← システム全体の型定義
4. 📄 src/lib/firestore.ts         ← データベース操作
```

### ⌨️ **VS Code ショートカット**
```bash
# VS Code でこれらのファイルを一気に開く
Ctrl+P (Windows) / Cmd+P (Mac) で以下を順番入力:
1. "DEVELOPMENT_HISTORY.md"
2. "src/types/index.ts" 
3. "src/lib/firestore.ts"
```

---

## 🎯 今すぐ理解すべき3つのポイント

### 1️⃣ **このシステムは何？**
労働組合の**中央本部**と**ブロック・支部・分会**間のタスク管理・進捗報告システム

### 2️⃣ **技術構成**
- **フロント**: Next.js 15 + React + TypeScript + Tailwind
- **データ**: Firebase Firestore + フォールバック
- **認証**: パスワード（中央:1050 / 組織:1234）
- **デプロイ**: GitHub Pages 自動デプロイ

### 3️⃣ **現在の状態（2025-08-30）**
- ✅ 全機能実装完了
- ✅ UI/UX改善完了（連絡機能のボタン名称変更）
- ✅ 本番稼働中: https://k16-dev.github.io/labor-progress-management/
- ✅ データクリーン（メモ履歴削除済み）

---

## 🔧 開発環境クイックスタート

```bash
# ターミナルで実行（3分）
cd "/Users/KOU/VS Code/進捗管理/新タスク管理/labor-progress-management"
npm install
npm run dev
```

---

## 📚 詳細情報（必要に応じて参照）

| 📖 ファイル | 🎯 用途 | ⏱️ 読む時間 |
|------------|---------|-------------|
| **DEVELOPMENT_HISTORY.md** | 完全な開発経緯・実装詳細 | 15-20分 |
| **docs/USER_GUIDE.md** | 利用者向け使い方 | 10分 |
| **docs/ADMINISTRATOR_GUIDE.md** | 管理者向け使い方 | 10分 |
| **src/components/Dashboard.tsx** | メインページ | 5分 |

---

## 🚨 よくある最初の疑問

### Q: どの機能から理解すれば？
**A:** メインは**連絡・報告機能**。ブロック・支部・分会→中央への重要なコミュニケーション

### Q: データはどこにある？
**A:** Firebase Firestore（`src/lib/firestore.ts`参照）+ モックデータフォールバック

### Q: 認証は？
**A:** 超シンプル。パスワード入力のみ（中央:1050、組織:1234+組織選択）

### Q: 最近の大きな変更は？
**A:** 連絡機能のUI改善（「編集」→「中央に連絡・報告する」ボタン変更）

---

## 🎯 **次にやるべきこと**

開発タスクが決まったら：

1. **DEVELOPMENT_HISTORY.md** の該当箇所を確認
2. **関連コンポーネント**を特定
3. **型定義**（src/types/index.ts）を確認
4. **実装開始**

---

## 💡 **このファイルの使い方**

このファイル（`CLAUDE_CODE_START.md`）は：
- 📌 **VS Code の最初のタブ**で常に開いておく
- 🔄 **開発中の参照用**として活用  
- ⚡ **迷った時のナビゲーション**として使用

**🌟 これで煩雑な順番を覚える必要なし！このファイル1つで全て解決します！**