# 08. SEO / AIO 要件チェックリスト

| 案件名 | 　 | 実施日 | 　 |
|---|---|---|---|
| ステータス | 未着手 / 実施中 / **全項目クリア** | 実施者 | 　 |

> 方針: AI検索(AI Overviews/ChatGPT等)対策の本筋は通常のSEO＝**良質なコンテンツ + 構造化データ + E-E-A-T**（Google 2026年5月見解）。小手先の単独施策に時間を使わない。

## 1. 基本メタ（全ページ）

- [ ] `title`: ページ固有・主要KW前方・32字目安
- [ ] `meta description`: 80〜120字・CVにつながる約束
- [ ] `canonical` 設定（仮URLのまま公開しない）
- [ ] OGP（og:title/description/url/image 1200×630）+ twitter:card
- [ ] `lang="ja"` / 文字コード / viewport

## 2. 構造化データ（JSON-LD）

| スキーマ | 対象 | 実装 | 検証 |
|---|---|---|---|
| `Organization` or `LocalBusiness` | 運営者 | [ ] | [ ] |
| `WebSite` | サイト | [ ] | [ ] |
| `FAQPage` | FAQ | [ ] | [ ] |
| `BreadcrumbList` | 下層ページ | [ ] | [ ] |
| 業種固有（`Product`/`Service`/`TouristAttraction`等） | 　 | [ ] | [ ] |

- [ ] [リッチリザルトテスト](https://search.google.com/test/rich-results)で全ブロックエラーなし

## 3. コンテンツ品質（AIに引用される条件）

- [ ] 結論ファーストの一問一答（FAQ）がある
- [ ] 比較・料金が**表**で書かれている（グラフ・画像内テキストはAIに読めない）
- [ ] 一次情報（自社実績・独自データ・体験）が含まれる
- [ ] 運営者・著者情報が実名で確認できる（E-E-A-T）
- [ ] 更新日が明記されている

## 4. テクニカル

- [ ] `sitemap.xml` / `robots.txt` 設置・記述確認
- [ ] モバイルフレンドリー / Core Web Vitals（LCP 2.5s・CLS 0.1以下）
- [ ] 見出し階層が論理的（h1→h2→h3）
- [ ] 画像alt / 内部リンクのアンカーテキストが具体的
- [ ] `llms.txt`: 任意（Googleは不使用を表明。コストゼロなら設置可、優先度低）

## 5. 公開後（無料）

- [ ] Search Console 登録 + sitemap送信 + インデックスリクエスト
- [ ] GA4 でCVイベント計測確認
- [ ] Googleビジネスプロフィール（実店舗・地域事業者なら**最優先**）
- [ ] 主要KWの順位とAI Overviewsでの引用有無を月次記録（10_運用へ）
