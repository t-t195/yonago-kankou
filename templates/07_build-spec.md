# 07. 構築仕様書

| 案件名 | 　 | 作成日 | 　 |
|---|---|---|---|
| ステータス | 下書き / レビュー中 / **承認済み** | 実装者 | 　 |

## 1. 技術選定

| 項目 | 選定 | 理由（更新者のスキルと運用コストで決める） |
|---|---|---|
| 実装方式 | 静的HTML / Astro等SSG / WordPress / ノーコード | 　 |
| CSS | 自前CSS / Tailwind(ビルド版) ※CDN版は本番禁止 | 　 |
| JS方針 | 原則最小。`<details>`等HTML標準を優先 | 　 |
| フォーム | mailto / Googleフォーム / Formspree / サーバー側 | 　 |
| ホスティング | GitHub Pages / Cloudflare Pages / レンタルサーバー | 　 |

**費用が発生する選定（要事前確認）**: 有料API（Google Maps JS API等）/ 有料プラグイン / サーバー代 → 採用前に発注者へ確認した日付: 

## 2. ディレクトリ構成

```
site/
├── index.html
├── privacy.html
├── css/style.css
├── js/main.js
├── images/   （WebP推奨・命名: セクション-連番）
├── robots.txt
└── sitemap.xml
```

## 3. コーディング規約

- セマンティックHTML（`header/main/section/article/footer`、h1は1ページ1つ、見出し階層を飛ばさない）
- 画像: `width/height`属性必須（CLS対策）、`loading="lazy"`（ファーストビュー以外）、alt必須
- アクセシビリティ: フォーカス可視 / `aria-expanded`等の状態属性 / コントラストAA
- 外部リソースは Google Fonts のみ（追加時は理由を本書に追記）
- 仮URL・要編集箇所は `<!-- TODO: -->` `【要編集】` で機械的に検索可能にする

## 4. パフォーマンス予算

| 指標 | 予算 |
|---|---|
| Lighthouse Performance | 90+ |
| LCP | 2.5s以内 |
| 画像1枚 | 200KB以下（ヒーローのみ400KB） |
| JS合計 | 50KB以下（フレームワーク不使用時） |

## 5. 計測実装

- GA4: 導入位置（全ページ`</head>`直前）/ CVイベント名: 
- Search Console: 所有権確認方式: 
- 電話タップ・フォーム送信・外部リンクのイベント設計: 

## 6. 完了の定義

- [ ] 06の原稿と実装テキストの差分ゼロ（コピペ改変禁止）
- [ ] 04のWFと構造一致（差異がある場合はWF側を更新して承認を取る）
- [ ] 08のSEO/AIOチェックリスト全項目
- [ ] 09のQAチェックリスト全項目
