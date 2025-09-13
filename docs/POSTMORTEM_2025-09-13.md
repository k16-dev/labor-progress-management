# Codex セッション振り返り（2025-09-13）

本ドキュメントは、2025-09-13 のCodexセッション中に発生した問題の再現条件・原因推定・対策案を整理し、次回開発再開の指針とする目的で作成したものです。

## 発生事象（概要）
- 1) Firestore ルール更新後、進捗（status:『進行中』）が一部タスクで更新不可
- 2) 読み取り時に接続エラーで一覧が空表示になることがある
- 3) Firestore 書込み時の invalid data（Unsupported field value: undefined）
- 4) GitHub Pages ビルドが ESLint で失敗（no-explicit-any, prefer-const, 未使用importなど）
- 5) Vercel へ意図せずデプロイが走る

## 個別の原因・再発防止策

### 1) 『進行中』が設定できない（部分的に）
- 症状: 共通タスクの一部で status を『進行中』に更新できず、permission や precondition エラーが出る。
- 主な原因候補:
  - a) ルール側の更新検証が「ドキュメント全体のキーを厳格に固定」しており、既存progressに古いフィールドがあると更新拒否。
  - b) 既存progressを取得する際、複合インデックス前提のクエリ（taskId==, orgId==）で失敗（failed-precondition）。
  - c) 新規作成パスで completedAt に undefined を含めて送信し、invalid data で失敗。
- 再発防止:
  - ルール: progress 更新は「変更されたキーのみ」検証（changedKeys()）にする。レガシーな付加フィールドがあっても更新を許容。
  - 取得: 既存progressは単一条件（orgId==）→メモリで taskId に絞る。複合インデックスに依存しない。
  - 送信: Firestoreへは undefined を絶対に送らない（completedAt は完了時のみ追加、未完了ではフィールド未送信）。

### 2) 接続エラーで一覧が空になる
- 症状: 一時的な接続障害で読み取りに失敗すると、UIが空表示に。
- 主な原因候補:
  - a) 読取に失敗した際のフォールバック不足（モック表示への切替やキャッシュの欠如）。
  - b) ネットワーク制約（プロキシ/Firewall）で WebChannel/Fetch Streams が不安定。
- 再発防止:
  - フロント: 直近取得成功データを localStorage/IndexedDB にキャッシュし、読取失敗時はそれを表示。
  - Firestore初期化: long polling を強制（experimentalForceLongPolling: true）で互換性を上げる。
  - UI: オフライン/キャッシュ表示中のバナーを出すなど状態可視化。

### 3) invalid data（undefined）
- 症状: addDoc() で Unsupported field value: undefined（completedAt）。
- 主因: 新規作成時に completedAt: undefined を含んだまま送信。
- 再発防止: 値が未定義のフィールドはオブジェクトから除外する実装に統一。

### 4) ESLint によるビルド失敗
- 症状: no-explicit-any, prefer-const, 未使用import等でGitHub Pagesビルドが停止。
- 背景: Next.js のビルドで ESLint が Fail-fast に設定されているため、小さなlint違反でも失敗。
- 再発防止:
  - ルール順守：any禁止・未使用削除・const化を徹底。
  - CI前のローカルlint実行（`npm run lint`）を習慣化。

### 5) Vercel への意図しないデプロイ
- 症状: GitHub Pages運用に統一したいが、Vercel側のGit連携でPush時にデプロイが走る。
- 対策:
  - リポジトリに `vercel.json` で ignore（またはVercel側でGit連携解除）。

## 本番ルール運用の指針（今後）
- 認証無しの内部運用でも、ルールは「整合性チェック＋被害最小化」を基本方針とする。
  - tasks: 読取のみ（管理操作はAdmin SDKから）
  - progress: 読取可、作成/更新は整合性チェック（タスク存在、ローカルは作成組織一致）
- 認証導入可能になったら、クレーム（role/orgId）ベースに移行し、中央と各組織の権限制御をサーバ側で強制。

## 具体的な実装上の注意（再開時チェックリスト）
- [ ] undefinedをFirestoreに送らない（update/new両方）。
- [ ] 既存progressの取得は複合インデックス不要の方法に。
- [ ] ルールの更新検証は changedKeys() で許容。
- [ ] 読取失敗時のフォールバック（永続キャッシュ→モック）を用意。
- [ ] CI前に ESLint を通す（no-explicit-any 等）。
- [ ] デプロイ先はPages一本化（Vercel連携を無効化）。

## 最小再現ハンドブック
- 進行中へ変更→失敗（permission/invalid）: 
  - invalid: completedAtにundefinedが混入 → 作成パスのオブジェクト整形を確認。
  - permission/precondition: ルールの更新条件・複合インデックス依存を確認。
- 一覧が空: 読取失敗時のフォールバックとキャッシュ実装を確認。

---

本ドキュメントは「今日の作業を一旦ロールバックした上で、再開時に同様の落とし穴を避ける」ためのメモです。次回は、まずローカルでルール・更新コード・インデックス要件を小刻みに検証しながら取り込み、PagesのCIを確認してから本番に反映してください。
