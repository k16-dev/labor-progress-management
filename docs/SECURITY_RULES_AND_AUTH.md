# Firestore ルール適用ガイド（内部利用モード/認証なし）

このドキュメントは、中央（全読取＋共通タスク管理）と各組織（自組織の進捗・メモ書込、ローカルタスク管理）の要件を満たすための、Firestore ルールと Firebase 認証の導入手順です。

## 1. ルールの内容（本番用）

`firestore.rules` に定義済みです（認証なし運用の妥協案）。要点:

- organizations: 読取り専用（Admin SDKで管理）
- tasks: 読取り専用（クライアントから編集禁止）
- progress: 読取り可、作成/更新は整合性チェック（既存タスク/組織の存在、ローカルは作成組織のみ）

注意: 認証が無いため「誰がどの組織か」はルール側で判別できません。App Check 等の併用で外部乱用を抑制してください。

## 2. 前提準備

1. Firebase CLI のインストール

```bash
npm i -g firebase-tools
firebase login
```

2. プロジェクト初期化（未設定の場合）

```bash
firebase init firestore
# 既存の firebase.json/firestore.rules を選択
```

## 3. ルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

## 4. 認証なし運用の注意点（必読）

- 外部からの乱用を抑止するため、Firebase App Check（Web用 reCAPTCHA v3 等）の導入を推奨します（ルール外で強制）。
- 共通/ローカルタスクの編集は Admin SDK からのみ可能（本ルールではクライアント禁止）。
- progress はクライアントから書込み可能ですが、所属の真正性は保証されません（内部ネットワーク/配布統制前提）。

## 5. クライアント側の注意点

- 本アプリは Firebase が未設定の環境ではモックにフォールバックします。
- Firebase を設定してルールを適用した環境では、未認証・クレーム未設定の状態だと書込みが Permission denied になります。
  - 現状の UI は独自パスワード方式のままです。Firebase Auth でサインインを行う導線の追加が必要です（段階導入を推奨）。

## 6. 暫定措置（緊急ロックダウン）

当面のデータ保護を優先して書込み禁止にする場合は、以下の簡易ルールに一時切替可能です（推奨は本番用ルール）。

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

この状態では UI からの更新は全て失敗します。通知やボタン無効化でUXを保護してください。

## 7. 参考

- 監査強化が必要なら、Cloud Functions で `updatedBy/updatedByOrg` を自動付与し、監査コレクションに記録してください（Admin SDK）。
