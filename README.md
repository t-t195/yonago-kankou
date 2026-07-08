# サイト/LP制作 テンプレート & skills ベースキット

企業・事業用ホームページ/LP制作を再現性高く進めるための「設計書・仕様書の型」と「Claude Code skills」のベースリポジトリ。

## 構成

```
WORKFLOW.md            … 全体フロー・運用ルール（まずこれを読む）
MCP-INTEGRATION.md     … MCP連携の現状分析・接続マップ・接続手順
QUALITY-ROADMAP.md     … 精度を上げるために次に足すものの優先順位
templates/             … 設計書・仕様書の型 11種（案件ごとにコピーして使う）
library/presets/       … LPタイプ別プリセット3種（採用/商材/商品）
tools/                 … lp-quality-check.mjs（自動品質ゲート）
.claude/skills/        … Claude Code skills 9種（/hearing 〜 /qa-launch, /lp）
projects/              … 案件ごとの成果物置き場
```

## LPを素早く作る（/lp 一気通貫フロー）

```
/lp <案件名> <recruit|service|product>
```
タイプ別プリセットで実装→ `node tools/lp-quality-check.mjs` 合格まで検証→プレビュー配布まで一括。MCP（Google Drive/Figma/Canva/Vercel）接続時は素材取得・カンプ変換・画像生成・URL共有を自動活用する（詳細: [MCP-INTEGRATION.md](MCP-INTEGRATION.md)）。

## 制作フロー（型とskillsの対応）

| フェーズ | 型 | skill |
|---|---|---|
| ヒアリング・要件定義 | templates/00, 01 | `/hearing` |
| リサーチ | templates/02 | `/research` |
| 構成・ワイヤーフレーム | templates/03, 04 | `/structure` |
| デザイン | templates/05 | `/design` |
| コピー・原稿 | templates/06 | `/copy` |
| 構築 | templates/07 | `/build` |
| SEO/AIO | templates/08 | `/seo-aio` |
| 検証・公開・運用 | templates/09, 10 | `/qa-launch` |

## 使い方

1. Claude Codeでこのリポジトリを開く
2. `/hearing <案件名>` から開始 → `projects/<案件名>/` に型がコピーされ、対話で埋まっていく
3. 各フェーズの承認を経て次へ（詳細は [WORKFLOW.md](WORKFLOW.md)）

## 原則

- 型は直接編集せず、案件フォルダへコピーして使う
- 前フェーズの承認なしに次へ進まない
- 費用が発生するもの（有料API・有料素材・サーバー）は採用前に必ず確認
- 案件で得た知見は型本体へ還元する（型を育てる）
