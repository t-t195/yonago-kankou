/**
 * Claude for Google Sheets
 * =========================
 * スプレッドシートのセルに =CLAUDE("...") と入力して、エクセル関数のように
 * Claude（AI）を呼び出せるようにするカスタム関数です。
 *
 * 【できること】
 *   =CLAUDE("要約して: " & A1)            … 汎用（質問・指示なんでも）
 *   =CLAUDE_SUMMARIZE(A1)                  … 要約
 *   =CLAUDE_SUMMARIZE(A1, "英語")          … 英語で要約
 *   =CLAUDE_TRANSLATE(A1, "英語")          … 翻訳
 *   =CLAUDE_CLASSIFY(A1, "肯定,否定,中立") … 分類（指定したラベルから1つ返す）
 *   =CLAUDE_WRITE("商品説明文を書いて", A1) … 文章生成
 *
 * 【最初に1度だけやること】
 *   1. console.anthropic.com で API キーを取得（sk-ant-... で始まる文字列）
 *   2. スプレッドシートを開き直すと上部に「Claude」メニューが出ます
 *   3. 「Claude」→「APIキーを設定」からキーを貼り付けて保存
 */

// ===== 設定 =====================================================

// 使用するモデル。用途に合わせて選んでください。
//   claude-haiku-4-5  … 速くて安い（要約・翻訳・分類など大量処理向け・おすすめ）
//   claude-sonnet-4-6 … バランス型
//   claude-opus-4-8   … 最も賢い（難しい生成タスク向け・高価）
// スプレッドシートは1セルごとにAPIを呼ぶため、コスト重視なら haiku を推奨します。
const CLAUDE_MODEL = 'claude-haiku-4-5';

// 1回の返答の最大トークン数（長文を返したいときは増やす）
const CLAUDE_MAX_TOKENS = 1024;

// ===============================================================

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * 汎用関数。指示文（プロンプト）を渡すと Claude の返答をそのまま返します。
 * エクセルのように文字列結合（&）でセルの値を混ぜられます。
 *
 * @param {string} prompt Claudeへの指示・質問。例: "次の文を3行で要約: " & A1
 * @param {string} [input] （任意）対象テキスト。指定すると prompt の後ろに付けます。
 * @param {number} [maxTokens] （任意）最大トークン数。長文生成時に指定。
 * @return Claudeの返答テキスト
 * @customfunction
 */
function CLAUDE(prompt, input, maxTokens) {
  if (prompt === '' || prompt === null || prompt === undefined) {
    return '';
  }
  var fullPrompt = String(prompt);
  if (input !== undefined && input !== null && input !== '') {
    fullPrompt += '\n\n' + String(input);
  }
  return callClaude_(fullPrompt, maxTokens);
}

/**
 * テキストを要約します。
 *
 * @param {string} text 要約したい文章
 * @param {string} [language] （任意）出力言語。例: "英語"。省略時は日本語。
 * @return 要約
 * @customfunction
 */
function CLAUDE_SUMMARIZE(text, language) {
  if (isBlank_(text)) return '';
  var lang = isBlank_(language) ? '日本語' : String(language);
  var prompt =
    '次の文章を' + lang + 'で簡潔に要約してください。' +
    '前置きや説明は不要で、要約だけを返してください。\n\n' + String(text);
  return callClaude_(prompt);
}

/**
 * テキストを翻訳します。
 *
 * @param {string} text 翻訳したい文章
 * @param {string} targetLanguage 翻訳先の言語。例: "英語" / "中国語"
 * @return 翻訳結果
 * @customfunction
 */
function CLAUDE_TRANSLATE(text, targetLanguage) {
  if (isBlank_(text)) return '';
  if (isBlank_(targetLanguage)) return 'エラー: 翻訳先の言語を指定してください';
  var prompt =
    '次の文章を' + String(targetLanguage) + 'に翻訳してください。' +
    '訳文だけを返し、前置きや注釈は付けないでください。\n\n' + String(text);
  return callClaude_(prompt);
}

/**
 * テキストを、指定したラベルのいずれか1つに分類します。
 *
 * @param {string} text 分類したい文章
 * @param {string} categories カンマ区切りのラベル。例: "肯定,否定,中立"
 * @return 一致したラベル1つ
 * @customfunction
 */
function CLAUDE_CLASSIFY(text, categories) {
  if (isBlank_(text)) return '';
  if (isBlank_(categories)) return 'エラー: 分類ラベルを指定してください';
  var prompt =
    '次の文章を、以下のラベルのいずれか1つだけに分類してください。\n' +
    'ラベル: ' + String(categories) + '\n' +
    '回答はラベルの単語のみとし、説明や記号は付けないでください。\n\n' +
    '文章: ' + String(text);
  return callClaude_(prompt, 64);
}

/**
 * 指示に従って文章を生成します。
 *
 * @param {string} instruction 生成の指示。例: "丁寧なお礼メールを書いて"
 * @param {string} [context] （任意）参考情報。例: 相手の名前や注文内容など
 * @return 生成された文章
 * @customfunction
 */
function CLAUDE_WRITE(instruction, context) {
  if (isBlank_(instruction)) return '';
  var prompt = String(instruction);
  if (!isBlank_(context)) {
    prompt += '\n\n参考情報:\n' + String(context);
  }
  return callClaude_(prompt, 2048);
}

// ===== 内部処理 =================================================

/**
 * Claude API を呼び出して返答テキストを取得します。
 * @private
 */
function callClaude_(prompt, maxTokens) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return 'エラー: APIキー未設定。メニュー「Claude」→「APIキーを設定」から登録してください';
  }

  var payload = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens || CLAUDE_MAX_TOKENS,
    messages: [
      { role: 'user', content: String(prompt) }
    ]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(ANTHROPIC_API_URL, options);
    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code !== 200) {
      var msg = (body && body.error && body.error.message) ? body.error.message : ('HTTP ' + code);
      return 'エラー: ' + msg;
    }

    // content は配列。type が "text" のブロックを連結して返す。
    var out = '';
    if (body.content && body.content.length) {
      for (var i = 0; i < body.content.length; i++) {
        if (body.content[i].type === 'text') {
          out += body.content[i].text;
        }
      }
    }
    return out.trim();
  } catch (e) {
    return 'エラー: ' + e.message;
  }
}

/** 空判定 @private */
function isBlank_(v) {
  return v === '' || v === null || v === undefined;
}

// ===== メニュー（APIキー設定用）=================================

/** スプレッドシートを開いたときにメニューを追加 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Claude')
    .addItem('APIキーを設定', 'setApiKey_')
    .addItem('APIキーを削除', 'clearApiKey_')
    .addItem('接続テスト', 'testConnection_')
    .addToUI();
}

/** APIキーをダイアログで入力して保存 */
function setApiKey_() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Claude APIキーの設定',
    'console.anthropic.com で取得したAPIキー（sk-ant-... ）を貼り付けてください:',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  var key = result.getResponseText().trim();
  if (!key) {
    ui.alert('キーが空です。設定を中止しました。');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('ANTHROPIC_API_KEY', key);
  ui.alert('APIキーを保存しました。=CLAUDE("こんにちは") などで試せます。');
}

/** APIキーを削除 */
function clearApiKey_() {
  PropertiesService.getScriptProperties().deleteProperty('ANTHROPIC_API_KEY');
  SpreadsheetApp.getUi().alert('APIキーを削除しました。');
}

/** 接続テスト */
function testConnection_() {
  var result = callClaude_('「接続成功」とだけ返してください。', 32);
  SpreadsheetApp.getUi().alert('テスト結果:\n\n' + result);
}
