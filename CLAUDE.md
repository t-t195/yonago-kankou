# サイト/LP制作ベースキット — Claude向けガイド

企業・事業用サイト/LPを再現性高く作るための「型 + skills + 品質ゲート」のリポジトリ。

## まず読む順番
1. [WORKFLOW.md](WORKFLOW.md) — 全体フローと運用ルール
2. [MCP-INTEGRATION.md](MCP-INTEGRATION.md) — MCP接続時の役割分担（Drive=素材 / Figma=カンプ / Canva=画像 / Vercel=プレビュー）
3. 案件のタイプに応じて `library/presets/`（recruit=採用 / service=商材 / product=商品）

## 絶対ルール
- **型（templates/）は直接編集しない**。案件ごとに `projects/<案件名>/` へコピーして埋める
- **LPの完成条件は品質ゲート合格**: `node tools/lp-quality-check.mjs projects/<案件名>/site/index.html` で FAIL 0件。手作業grep検証はしない
- **費用が発生する選定**（有料API・有料素材・サーバー）は採用前に必ずユーザーへ確認
- 未確定箇所は `【要編集】` / `<!-- TODO: -->` で機械検索可能にして先へ進む（素材待ちで止まらない）

## よく使うコマンド
- 単一LPの一気通貫制作: `/lp <案件名> <recruit|service|product>`
- フル工程: `/hearing <案件名>` から順に（WORKFLOW.md の表を参照）

## 実装の参考
実装済みの実例: `projects/number-second/site/`（hero / trust-bar / card-grid / flow / faq / contact-form のCSSパターン）。技術規約は `templates/07_build-spec.md`。
