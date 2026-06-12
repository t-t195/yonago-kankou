# 04. 最終動作確認 & 公開手順

## 最終動作確認チェックリスト

### 自動チェック（実施済み）
- [x] HTML構文（タグ閉じ・属性）
- [x] JSON-LD 3ブロックのJSONパース確認
- [x] 内部リンク（アンカー・privacy.html・CSS/JSパス）の存在確認
- [x] ローカルサーバーでの表示確認（全ページ200応答）

### 公開前に手動で確認すること
- [ ] 【要編集】箇所（運営者名・代表者名・所在地・連絡先メール×3カ所）の記入
  - index.html: 運営者セクション、お問い合わせの mailto、JSON-LD の publisher
  - privacy.html: 運営者名、連絡先
- [ ] 写真への差し替え（`<!-- PHOTO: -->` コメント9カ所。自前撮影 or 写真AC等の無料素材）
- [ ] 実機確認: iPhone Safari / Android Chrome / PC Chrome・Edge
- [ ] 料金・運行情報の最新性確認（各施設公式サイト照合）
- [ ] OGP画像（1200×630px）作成 → index.html のコメント解除

## 公開先の選択肢比較（サーバー未定のため）

| 選択肢 | 費用 | 独自ドメイン | 特徴 |
|---|---|---|---|
| **GitHub Pages（推奨・最短）** | 無料 | 可（ドメイン代のみ年1,500円前後） | このリポジトリの Settings → Pages → main ブランチを選ぶだけで即公開。静的サイトに最適 |
| Cloudflare Pages | 無料 | 可 | 高速CDN・フォーム等の拡張余地。GitHubと連携可 |
| Netlify | 無料枠あり | 可 | 無料フォーム（月100件）が使える |
| レンタルサーバー（さくら/Xserver等） | 月500〜1,000円程度 | 可 | 将来WordPress化・メールアドレス運用をするなら |

**推奨手順**: ①GitHub Pagesで無料公開 → ②独自ドメイン取得（お名前.com/Cloudflare Registrar等、年1,000〜2,000円） → ③canonical/sitemap/robotsのURL一括置換 → ④Google Search Console登録・sitemap送信。

## 公開後タスク（すべて無料）
1. Google Search Console にサイト登録、sitemap.xml 送信
2. GA4 プロパティ作成 → index.html 末尾コメント位置に計測タグ挿入
3. （事業者登録する場合）Googleビジネスプロフィール作成
4. 月1回の料金・営業情報の棚卸し（compare表 + FAQ）
