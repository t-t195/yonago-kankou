# 米子観光ガイド（DISCOVER YONAGO）

鳥取県米子エリアの観光情報を地元目線で発信する事業用ウェブサイト。

## 制作進行フロー（状況）

| フェーズ | 状態 | 成果物 |
|---|---|---|
| 1. リサーチ・戦略 | ✅ 完了 | [docs/01_research-strategy.md](docs/01_research-strategy.md) |
| 2. ワイヤーフレーム | ✅ 完了 | [docs/02_wireframe.md](docs/02_wireframe.md) |
| 3. デザイン | ✅ 完了 | [docs/03_design-guide.md](docs/03_design-guide.md) |
| 4. 構築 | ✅ 完了 | `index.html` / `css/` / `js/` |
| 5. コンテンツ反映 | ✅ 完了（運営者情報のみ【要編集】） | 本文・構造化データ・FAQ |
| 6. 最終動作確認 | ✅ 自動チェック完了 / 実機確認は公開前に | [docs/04_launch-checklist.md](docs/04_launch-checklist.md) |
| 7. サイト公開 | ⏳ サーバー未定（GitHub Pages推奨） | 手順は docs/04 参照 |

追加・削除した項目と費用の確認事項は [docs/05_additions-deletions.md](docs/05_additions-deletions.md) にまとめています。

## ローカルでの確認方法

```bash
python3 -m http.server 8000
# → http://localhost:8000 を開く
```

ビルド不要の静的サイトです（HTML/CSS/JSのみ・外部依存はGoogle Fontsのみ）。

## 公開前にやること

1. `【要編集】` 箇所（運営者名・代表メッセージ・連絡先）を記入
2. `<!-- PHOTO: -->` 箇所に実写真を配置
3. 公開URL確定後、`index.html` / `robots.txt` / `sitemap.xml` / `llms.txt` の仮URL（t-t195.github.io）を一括置換
