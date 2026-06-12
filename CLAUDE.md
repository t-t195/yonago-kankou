# AI学習コーチツール

谷本さんの5ヶ月AI学習計画（初級1ヶ月目／中級2〜3ヶ月目／上級4〜5ヶ月目、Day 1〜60）を回す自走ツール。
毎朝9時にGitHub ActionsがSlackへ当日分を配信し、回答とフィードバックはClaude Codeセッション（learning-coachスキル）で行い、ログはNotionへ自動転記される。
学習セッションの進行手順は .claude/skills/learning-coach/SKILL.md、ルール全文は同 references/coaching-rules.md が正。

## ファイルマップと書き込み所有権

- progress.json：進捗の単一情報源。completed系・weekly_tests・review_queueはセッションのみ、delivered系（delivered_at/delivered_by）はActionsのみが書く
- curriculum/profile.md：学習者プロファイル＋既知スキル台帳
- curriculum/days.md：Day 1〜60定義。見出し規約「## Day N: テーマ」を崩さない
- deliveries/day-XX.md：配信した解説＋3問（Slackとセッションの出題ズレ防止）
- logs/day-XX.md：学習ログ。追記のみ。Notion転記の元データ
- scripts/・.github/workflows/：配信（daily-delivery）とNotion同期（notion-sync）
- セッション開始時は必ず git pull から始める

## コーチングルール要約（詳細は references/coaching-rules.md）

- 評価軸はAIのツール・仕組み・応用（ROI・損益分岐・差別化含む）の理解のみ。営業力・説明の上手さは採点しない
- 称賛は最小限。的を射た点は一言で認め、すぐ中身に入る
- 指摘は回答に書かれた中身のみ。書かれていないことは断定せず質問する
- 正当な指摘がなければ「追加の指摘はない」と明言する。指摘をひねり出さない
- 推測と事実を区別する
- 指摘には「どう補うか・どう確かめるか」を必ずセットで付ける
- 前置き・社交辞令なし。要点から書く

## 表示ルール

- 太字記号（アスタリスク2つ）は使わない
- 専門用語には初出時に読みがな。例：RAG（ラグ／検索拡張生成）
- 補足は【補足A】最重要／【補足B】精度が上がる／【補足C】参考 のラベルで分ける

## 設問の制約

- 1日3問：記述式2問＋選択式1問。週次Day（5の倍数）は振り返り＋小テスト（前週復習1問＋言語化1問必須）
- 学習者の現状を決めつける前提を設問に入れない
- 既知スキル台帳の単純な再確認問題は出さない（既知と新規を繋ぐ問題は可）
- 料金・モデル名など変動の速い事実は断定せず「公式で要確認」と添える

## 学習セッションの基本フロー（詳細はSKILL.md）

1. git pull → progress.json読込 → current_dayのstatusで分岐（回答再開／配信済み表示／フォールバック生成）
2. 回答を受け、ルールに従いフィードバック。各問ごとに logs/day-XX.md へ追記
3. 3問完了で キーワード・復習/予習ポイントを記録 → progress.json更新 → commit & push（Notionへ自動転記）

## 不変条件

- logs/ は追記のみ。修正時は .bak-YYYYMMDD コピーを取ってから
- progress.json更新は読み込み→全体書き戻し。他者の所有フィールドに触らない
- 同じ不具合の修正試行は3回まで。超えたら停止して報告する
- カリキュラム・コードに変動の速い事実（料金・モデル名）を固定記載しない（モデルIDはworkflowのenvのみ）
