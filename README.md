# サイト/LP制作 テンプレート & skills ベースキット

企業・事業用ホームページ/LP制作を再現性高く進めるための「設計書・仕様書の型」と「Claude Code skills」のベースリポジトリ。

## 構成

```
WORKFLOW.md            … 全体フロー・運用ルール（まずこれを読む）
QUALITY-ROADMAP.md     … 精度を上げるために次に足すものの優先順位
templates/             … 設計書・仕様書の型 11種（案件ごとにコピーして使う）
.claude/skills/        … Claude Code skills 8種（/hearing 〜 /qa-launch）
projects/              … 案件ごとの成果物置き場
docs/ index.html ほか  … 型を一通り使って作った実例（米子観光ガイド）
```

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
