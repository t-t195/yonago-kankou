---
name: lp
description: タイプ別プリセット（採用/商材/商品）でLPを一気通貫制作する。MCP（Drive/Figma/Canva/Vercel）接続時は自動活用し、品質ゲート合格まで検証を回す。使い方 /lp <案件名> <recruit|service|product>
---

# LP一気通貫制作 skill

## 目的
`library/presets/` のタイプ別プリセットを型に、素材受領→実装→自動品質ゲート→プレビュー配布までを1フローで完了させる。フル工程（/hearing〜/qa-launch）の**LP特化ショートカット**。大規模案件・多ページ案件はWORKFLOW.mdの標準フローを使う。

## 引数
`/lp <案件名> <タイプ>` — タイプ: `recruit`（採用）/ `service`（商材・サービス）/ `product`（商品・EC）。タイプ不明なら商材の性質を1問して判定する。

## 手順

### 1. プリセット読込
`library/presets/<タイプ>-lp.md` を読み、必須セクション・法務チェック・構造化データ型・品質ゲート基準を確定。`projects/<案件名>/site/` を作成し `templates/07_build-spec.md` をコピーして技術選定を記録。

### 2. 素材・情報の収集（MCP分岐）
接続状況を確認し、**あるものは使い、ないものはチャット受領＋`【要編集】`仮置き**で先に進む（素材待ちで止まらない）:
- **Google Drive 接続時**: 案件フォルダを `search_files` で探し、ロゴ・写真・原稿・カンプを `download_file_content` で取得
- **Figma 接続時**: カンプURLがあれば `get_design_context` / `get_screenshot` で構造・トークン（色/タイポ/余白）を抽出。カンプが無く合意形成が必要なら `/figma-generate-design` でコードからカンプ生成も可
- **Canva 接続時**: ヒーロー画像・OGP画像(1200×630)が無ければ `generate-design` → `export-design` で生成（ブランドカラー指定）
- **未接続時**: 必要素材リストを提示してチャットで受領

情報の不足分はプリセットの必須セクションを埋める最小限だけ質問する（一度に全部聞かない。重要度順に3問以内ずつ）。

### 3. 実装
`templates/07` のコーディング規約に準拠（セマンティックHTML / CSS変数トークン / 最小vanilla JS / 画像width・height・alt / コントラストAA）。プリセットの必須セクションを**順序どおり**実装し、法務チェック項目を織り込む。構造化データはプリセット指定の@typeで`<head>`にJSON-LD。再利用可能な実装例: `projects/number-second/site/`（hero/trust-bar/card-grid/flow/faq/contact-formのCSSパターン）。

### 4. 品質ゲート（必須・スキップ禁止）
```bash
node tools/lp-quality-check.mjs projects/<案件名>/site/index.html
```
**FAIL 0件になるまで修正→再実行をループ**。WARNは内容を確認し、意図的なもの（差し替え待ちTODO等）のみ残してよい。加えてプリセットの法務チェックを目視で全項目確認し、結果を`07_build-spec.md`に記録。

### 5. プレビュー配布（MCP分岐）
- **Vercel 接続時**: `deploy_to_vercel` でデプロイし、確認URLを共有（スマホ確認可・push不要）
- **未接続時**: ①フォルダ構成ZIP（`site/`ごと圧縮）と②CSS/JS/ロゴ内蔵の1ファイル版HTMLを生成し `SendUserFile` で送付
- いずれも試作段階では `<meta name="robots" content="noindex">` を付け、公開判断後に外す

### 6. 完了報告
残TODO一覧（差し替え待ち素材・送信先等）／品質ゲート結果（スコア）／次アクション（公開 or 修正往復）を報告。フィードバックの往復後、公開時は `/seo-aio` → `/qa-launch` に接続する。

## 品質基準
- lp-quality-check FAIL 0件（唯一の合格条件。手作業grep検証は廃止）
- プリセットの法務チェック全項目に判定がついている
- CV導線が2系統以上（フォーム＋電話 or LINE）
- 未確定箇所はすべて `【要編集】`/`<!-- TODO -->` で機械検索可能

## アンチパターン
- 素材が揃うまで実装を止める（→仮置きで先に進み、差し替えループで仕上げる）
- 品質ゲートを飛ばして納品する／FAILを「あとで直す」で放置する
- タイプ不一致のプリセット流用（採用LPに商品の型など）
- MCP未接続を理由に品質を落とす（フォールバック手順で同品質を維持する）
