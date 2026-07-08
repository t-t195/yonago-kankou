# MCP連携によるLP制作体制 — 現状分析と再構成方針

作成: 2026-07-08 ／ 分析対象: 本キット全体＋実案件（ナンバーセカンドLP）の制作過程

## 1. 現状の徹底分析

### 1-1. キットの現状構成

| 資産 | 内容 | 状態 |
|---|---|---|
| `.claude/skills/` 8種 | /hearing /research /structure /design /copy /build /seo-aio /qa-launch | 稼働。ただしMCP前提の分岐なし |
| `templates/` 11種 | 00ヒアリング〜10公開運用の設計書の型 | 稼働 |
| `WORKFLOW.md` | 全体フロー・承認ゲート | 稼働 |
| `QUALITY-ROADMAP.md` | 優先度A「業種別プリセット」「コピー実例」等が未着手だった | 本更新でA-1着手 |
| `projects/number-second/` | 実案件LP（B2B修繕サービス） | 実装済み・検証済み |

### 1-2. 実案件（ナンバーセカンド）で発生した摩擦の実録

| # | 摩擦 | 実際に起きたこと | 根本原因 | MCPでの恒久解 |
|---|---|---|---|---|
| 1 | **素材受け渡しが不確実** | 参考URLが403で閲覧不可→スクショ依頼→結局チャットにHTML貼り付け。ロゴ・写真は未受領のまま仮置き | 受け渡し経路が「チャット貼り付け」しかない | **Google Drive MCP**: 案件フォルダから `search_files`/`download_file_content` で直接取得 |
| 2 | **QAが手作業** | タグバランス・アンカー整合・TODO残数を毎回シェルでgrepして確認 | 検査が型化・自動化されていない | **tools/lp-quality-check.mjs**（本更新で開発）を品質ゲート化 |
| 3 | **プレビューが見づらい** | 「ブラウザで見ても出ない」→ZIP版・1ファイル版を都度手作りして送付 | 閲覧手段が git pull / ファイル送付しかない | **Vercel MCP**: `deploy_to_vercel` で即URL共有（スマホでも見られる） |
| 4 | **タイプ別知見が毎回ゼロから** | B2B修繕の「説明しやすさ・証拠・FAQ」構成をその場で設計 | 採用/商材/商品ごとの必須要素・法務が未型化 | **library/presets/**（本更新で開発）＋ /lp skill |
| 5 | デザイン合意の遠回り | カンプ共有がスクショ/ソース貼り付け頼み | デザインツールと未接続 | **Figma MCP**: `get_design_context`/`get_screenshot` でカンプ→コード、`generate_figma_design` でコード→カンプ |

### 1-3. 結論

キットは「設計の型」としては完成度が高い（戦略層◎）が、**入出力がすべてチャット経由**である点がボトルネック。MCPを「素材の入口（Drive/Figma）」「成果物の出口（Vercel/Canva）」「品質の門番（ローカルツール）」として配置すれば、摩擦1〜5は構造的に解消する。

## 2. 再構成方針 — フェーズ×MCP接続マップ

```
[ヒアリング]──Notion/Gmail/Slack──▶ 00_hearing.md
     │
[素材受領]───Google Drive─────────▶ assets/（ロゴ・写真・カンプ）
     │
[デザイン]───Figma────────────────▶ トークン抽出 or カンプ生成で合意
     │                               （画像素材が無ければ Canva で生成）
[実装]───────（ローカル）──────────▶ site/ 一式
     │
[品質ゲート]─tools/lp-quality-check.mjs ──▶ 合格までループ ★必須
     │
[プレビュー]─Vercel───────────────▶ 確認URLを共有（push不要）
     │
[資産管理]───GitHub───────────────▶ ブランチ運用（現行どおり）
```

| フェーズ | MCP | 主なツール | 未接続時のフォールバック |
|---|---|---|---|
| ヒアリング・仕様共有 | Notion / Gmail / Slack | notion-create-pages, create_draft, slack_send_message | チャットで質問リスト |
| 素材受領 | **Google Drive** | search_files, download_file_content | チャット添付＋`【要編集】`仮置き |
| カンプ→コード | **Figma** | get_design_context, get_screenshot, get_variable_defs | ソース/スクショ貼り付け |
| コード→カンプ（合意形成） | **Figma** | generate_figma_design（要 /figma-generate-design skill） | 1ファイル版HTMLを送付 |
| 画像生成（ヒーロー/OGP） | **Canva** | generate-design, export-design | グラデーション仮置き＋TODO |
| プレビュー配布 | **Vercel** | deploy_to_vercel | ZIP＋1ファイル版を生成し送付 |
| 品質ゲート | （MCP不要・ローカル） | `node tools/lp-quality-check.mjs` | — |

**原則**: MCPは「あれば使う、なければ劣化せず従来手順」。skills本体は書き換えず、分岐は `/lp` skill（新設）に集約する。

## 3. 接続手順

### claude.ai / Claude Code Web（本セッションの形態）
設定 → コネクタ から各サービス（Google Drive, Figma, Canva, Vercel, Notion, Slack, Gmail）を接続。接続済みならセッション内で自動的にツールが利用可能になる。

### ローカルのClaude Code CLI
```bash
# 例: Figma（公式リモートMCP）
claude mcp add --transport http figma https://mcp.figma.com/mcp
# 例: Vercel
claude mcp add --transport http vercel https://mcp.vercel.com
# 確認
claude mcp list
```
プロジェクト共有したい場合はリポジトリ直下 `.mcp.json` に定義する（認証トークンは書かない。初回接続時にOAuthで認可）。

```json
{
  "mcpServers": {
    "figma":  { "type": "http", "url": "https://mcp.figma.com/mcp" },
    "vercel": { "type": "http", "url": "https://mcp.vercel.com" }
  }
}
```

## 4. 品質担保の仕組み（本更新で追加したツール群）

| 追加物 | 役割 |
|---|---|
| `library/presets/recruit-lp.md` | **採用LP**の型: 必須セクション・職安法(労働条件明示)・JobPosting構造化データ・応募KPI |
| `library/presets/service-lp.md` | **商材(B2Bサービス)LP**の型: 課題→価値→証拠→FAQ→CV（ナンバーセカンドで実証済みパターン） |
| `library/presets/product-lp.md` | **商品(EC/B2C)LP**の型: ベネフィット→比較→レビュー→価格→購入。特商法・薬機法チェック |
| `tools/lp-quality-check.mjs` | 自動品質ゲート。構造/メタ/リンク/画像/a11y/構造化データ/完成度を静的検査し合否とスコアを出す |
| `.claude/skills/lp/SKILL.md` | `/lp <案件名> <recruit\|service\|product>` 一気通貫フロー。MCP分岐と品質ゲートループを内蔵 |

**品質ゲートの運用ルール**: `/lp`・`/build`・`/qa-launch` の完了条件に「lp-quality-check が FAIL 0 件」を追加する。手作業のgrep検証は廃止。

## 5. 今後の拡張（優先順）

1. **コピー実例集** `library/copy-examples.md`（QUALITY-ROADMAP A-2）— /copy の出力品質を底上げ
2. **コンポーネント部品集** `library/components/` — number-second の実装（hero/trust-bar/card-grid/faq/contact-form）を切り出して再利用
3. Figma `generate_figma_design` によるカンプ先行フロー（発注者合意を実装前に取る）
4. Lighthouse実測の自動化（Chrome導入可能な環境でのみ。現環境はブラウザDL制限あり）
