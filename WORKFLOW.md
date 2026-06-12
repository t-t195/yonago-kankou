# サイト/LP制作 ワークフローガイド

このリポジトリは、企業・事業用ホームページ/LP制作を**再現性高く**進めるための「設計書テンプレート(型)」と「Claude Code skills」のベースキットです。

## 全体構成

```
templates/            … 設計書・仕様書の型（案件ごとにコピーして埋める）
.claude/skills/       … Claude Codeのskills（/hearing 等で呼び出し、型を埋める作業を自動化）
projects/             … 案件ごとの成果物置き場（推奨運用）
  └── <案件名>/
        ├── 00_hearing.md      ← templatesからコピーして埋めたもの
        ├── 01_brief.md
        ├── ...
        └── site/              ← 実装ファイル
```

※ リポジトリ直下の `index.html` / `docs/` は「型を一通り埋めて作った実例(米子観光ガイド)」です。型の使い方の参考にしてください。

## 制作フローと型・skillsの対応

| # | フェーズ | 使う型 (templates/) | 使うskill | 完了の定義 |
|---|---|---|---|---|
| 0 | ヒアリング | `00_hearing-sheet.md` | `/hearing` | 発注者の回答が全項目埋まる |
| 1 | 要件定義 | `01_project-brief.md` | `/hearing` | 目的・KGI/KPI・スコープ承認 |
| 2 | リサーチ | `02_research.md` | `/research` | 競合比較表・ペルソナ・ポジショニング確定 |
| 3 | サイト構成 | `03_site-structure.md` | `/structure` | サイトマップ・LP構成承認 |
| 4 | ワイヤーフレーム | `04_wireframe.md` | `/structure` | 全セクションのWF承認 |
| 5 | デザイン | `05_design-system.md` | `/design` | デザインシステム承認 |
| 6 | コンテンツ/コピー | `06_content-copy.md` | `/copy` | 全原稿FIX（E-E-A-T情報含む） |
| 7 | 構築 | `07_build-spec.md` | `/build` | 仕様どおり実装・型との差分ゼロ |
| 8 | SEO/AIO | `08_seo-aio-checklist.md` | `/seo-aio` | チェックリスト全項目クリア |
| 9 | 検証 | `09_qa-checklist.md` | `/qa-launch` | 全チェック合格 |
| 10 | 公開・運用 | `10_launch-operation.md` | `/qa-launch` | 公開 + 計測開始 + 改善計画 |

## 運用ルール

1. **型は直接編集しない**。案件ごとに `projects/<案件名>/` へコピーして埋める
2. **前のフェーズの承認なしに次へ進まない**（手戻りが最大のコスト）
3. 型に合わない案件で項目を増減したら、**汎用性があるものは型本体へ還元**する（型を育てる）
4. 各ドキュメント冒頭の「ステータス: 下書き/レビュー中/承認済み」を必ず更新する

## skillsの使い方

Claude Code でこのリポジトリを開き、`/hearing 案件名` のように呼び出すと、対応する型を `projects/<案件名>/` にコピーし、対話・リサーチで埋めていきます。各skillの定義は `.claude/skills/<name>/SKILL.md`。
