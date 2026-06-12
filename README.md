# AI学習コーチツール

谷本さんの5ヶ月AI学習計画（Day 1〜60）を自走させるツール。

- 毎朝9時（JST）にGitHub ActionsがSlackへ「今日の解説＋3問」を配信
- 回答とフィードバックはClaude Codeセッション（learning-coachスキル）で実施
- 学習ログはローカルMarkdown（logs/）が正で、pushするとNotion「AI学習ログ（5ヶ月計画）」へ自動転記

## 日々の使い方

1. 朝9時すぎにSlackに当日分が届く（GitHubのcron仕様で最大15〜30分遅れることがある）
2. Claude Codeでこのリポジトリを開き「/learn」または「今日の学習」と入力
3. 3問に回答し、フィードバックを受ける（途中でやめても次回続きから再開できる）
4. 完了すると logs/ にログが保存され、pushでNotionに転記される
5. 前日分が未完了の朝は、新しい問題ではなくリマインドだけが届く（未消化が積み上がらない設計）

## 初回セットアップ

### 1. GitHub Actionsシークレットの登録

リポジトリの Settings → Secrets and variables → Actions → New repository secret で以下を登録する。

| シークレット名 | 内容 |
| --- | --- |
| ANTHROPIC_API_KEY | Anthropicコンソールで発行したAPIキー |
| SLACK_WEBHOOK_URL | SlackのIncoming Webhook URL（配信したいチャンネル向けに作成） |
| NOTION_API_KEY | Notionインテグレーションのシークレット（下記参照） |
| NOTION_PARENT_PAGE_ID | 転記先ページのID（下記参照） |

### 2. Notionインテグレーションの接続

1. https://www.notion.so/my-integrations で内部インテグレーションを作成し、シークレットを NOTION_API_KEY に登録
2. Notionの「AI学習ログ（5ヶ月計画）」ページを開き、右上「…」→「接続」から作成したインテグレーションを追加
3. ページURL末尾の32桁がページID（本ページは `36fc51748e09818188d2e6ad6aec5128`）。NOTION_PARENT_PAGE_ID に登録

### 3. 動作テスト

1. Actionsタブ → daily-delivery → Run workflow で手動実行し、Slackに当日分（初回はDay 8のリマインド）が届くことを確認
2. もう一度実行し、重複配信されないことを確認
3. 学習を1日分完了してpushした後、notion-sync が走りNotionに子ページができることを確認

注意: ワークフローのscheduleはデフォルトブランチでのみ動く。開発ブランチで確認後、mainへマージすること。

## ファイル構成と書き込み所有権

| パス | 役割 | 書くのは誰 |
| --- | --- | --- |
| progress.json | 進捗の単一情報源 | セッション（completed系）／Actions（delivered系のみ） |
| curriculum/profile.md | 学習者プロファイル＋既知スキル台帳 | セッション |
| curriculum/days.md | Day 1〜60カリキュラム定義 | セッション |
| deliveries/day-XX.md | 配信した解説＋3問 | Actions（フォールバック時はセッション） |
| logs/day-XX.md | 学習ログ（追記のみ。Notion転記元） | セッション |
| scripts/daily-delivery.mjs | 生成＋Slack投稿 | — |
| scripts/notion_sync.py | logs/→Notion転記 | — |
| .claude/skills/learning-coach/ | 学習セッションの進行手順とルール | — |

## 運用メモ

- 配信に使うモデルIDは .github/workflows/daily-delivery.yml の env（MODEL_ID）で一元管理。モデル改定時はここだけ変える
- Notionへ再転記したい場合は、Notion側の該当子ページを削除してから notion-sync を手動実行する（同タイトルが存在するとスキップされる）
- 配信文の生成をローカルで確かめたいときは `node scripts/daily-delivery.mjs --dry-run`
- カリキュラムのDay 9〜19はチャット運用時の計画からの再構成。学習の進みに応じて curriculum/days.md を直接編集してよい
