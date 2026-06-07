# スプレッドシートでAIを関数として使う

エクセルの関数のように、Googleスプレッドシートのセルに `=CLAUDE("...")` や
`=GEMINI("...")` と入力して AI を呼び出せるようにする Google Apps Script です。

## どの方法を選ぶ？（料金の比較）

| 方法 | 別料金 | 設定 | 中身 |
|---|---|---|---|
| **A. 内蔵 `=AI()` 関数** | **なし**（Workspace料金に込み） | 不要 | Google Gemini |
| **B. `Gemini.gs`（無料キー）** | **なし**（無料枠内） | 無料キー登録 | Google Gemini |
| **C. `Code.gs`（Claude）** | **あり**（API従量課金） | 有料キー登録 | Anthropic Claude |

- **追加料金を払いたくないなら A → B の順**で試すのがおすすめです。
- **A**：セルに `=AI("要約して", A1)` と直接書くだけ。コードもキーも不要。
  プランによっては未対応のことがあるので、まずこれを試す。
- **B**：A が使えないとき。`aistudio.google.com` で無料キーを取得して `Gemini.gs` を使う。
- **C**：どうしても Claude を使いたいとき（別途 Anthropic の API 課金が発生）。

> ⚠️ **`Code.gs` と `Gemini.gs` は両方同時に入れないでください。**
> どちらも `onOpen()` を持つため競合します。使う方の1ファイルだけを貼り付けてください。

## 仕組み（エクセルとの違い）

| | エクセル | Googleスプレッドシート |
|---|---|---|
| 組み込み方 | **アドイン** をインストール | **Google Apps Script**（標準搭載）を使う |
| 追加インストール | 必要 | 不要（スプレッドシートに最初から付いている） |
| AIの呼び出し先 | Claude API | Claude API（同じ） |

ポイント: **Google Cloud は不要**です。Apps Script から Anthropic（Claude）の API を
直接呼び出すので、Google Cloud のプロジェクト作成や課金設定はいりません。
必要なのは **Anthropic の API キー** だけです。

## 使える関数

| 関数 | 用途 | 例 |
|---|---|---|
| `=CLAUDE(指示)` | 汎用（なんでも） | `=CLAUDE("3行で要約: " & A1)` |
| `=CLAUDE_SUMMARIZE(text, [言語])` | 要約 | `=CLAUDE_SUMMARIZE(A1)` |
| `=CLAUDE_TRANSLATE(text, 言語)` | 翻訳 | `=CLAUDE_TRANSLATE(A1, "英語")` |
| `=CLAUDE_CLASSIFY(text, ラベル)` | 分類 | `=CLAUDE_CLASSIFY(A1, "肯定,否定,中立")` |
| `=CLAUDE_WRITE(指示, [参考])` | 文章生成 | `=CLAUDE_WRITE("お礼メールを書いて", A1)` |

## 導入手順

1. **Anthropic APIキーを取得**
   [console.anthropic.com](https://console.anthropic.com) でキー（`sk-ant-...`）を発行（有料）。

2. **Apps Script にコードを貼り付け**
   - スプレッドシートを開く → メニュー「拡張機能」→「Apps Script」
   - `Code.gs` の中身をコピーして貼り付け、保存。

3. **スプレッドシートを開き直す**
   上部に「**Claude**」メニューが追加されます。

4. **APIキーを登録**
   「Claude」→「APIキーを設定」からキーを貼り付けて保存。
   （初回はGoogleの承認画面が出ます。自分のアカウントなので許可してOK）

5. **使ってみる**
   セルに `=CLAUDE("こんにちは")` と入力。

## 設定の変更

`Code.gs` 上部の定数で変えられます。

```js
const CLAUDE_MODEL = 'claude-haiku-4-5';  // 速くて安い（大量処理向け・おすすめ）
                                          // 'claude-sonnet-4-6' … バランス
                                          // 'claude-opus-4-8'   … 最も賢い・高価
const CLAUDE_MAX_TOKENS = 1024;           // 返答の最大の長さ
```

## 注意点

- **コスト**: 1セル = 1回のAPI呼び出しです。数百セルに一気に貼ると料金がかかります。
  まず数セルで試してから広げてください。大量処理なら `claude-haiku-4-5` が安価で高速です。
- **速度**: カスタム関数は最大30秒の制限があります。長文や難しい生成は時間がかかることがあります。
- **再計算**: スプレッドシートを開くたびに再計算されることがあります。結果を固定したい場合は
  セルをコピー → 「値のみ貼り付け」で文字に変換してください。
