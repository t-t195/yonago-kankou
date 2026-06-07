/**
 * Gemini for Google Sheets（無料APIキー版）
 * ==========================================
 * Google Workspace 内蔵の =AI() 関数が使えない場合の代替です。
 * Google AI Studio で取得できる「無料の」Gemini APIキーで動きます。
 *
 * 【できること】
 *   =GEMINI("要約して: " & A1)              … 汎用（質問・指示なんでも）
 *   =GEMINI_SUMMARIZE(A1)                    … 要約
 *   =GEMINI_SUMMARIZE(A1, "英語")            … 英語で要約
 *   =GEMINI_TRANSLATE(A1, "英語")            … 翻訳
 *   =GEMINI_CLASSIFY(A1, "肯定,否定,中立")   … 分類
 *   =GEMINI_WRITE("お礼メールを書いて", A1)  … 文章生成
 *
 * 【最初に1度だけやること】
 *   1. aistudio.google.com で「Get API key」から無料キーを取得
 *   2. スプレッドシートを開き直すと上部に「Gemini」メニューが出ます
 *   3. 「Gemini」→「APIキーを設定」からキーを貼り付けて保存
 *
 * ※ 無料枠（1日あたりのリクエスト数など）には上限があります。
 *    大量に使う場合は時間を分けるか、有料枠の検討を。
 */

// ===== 設定 =====================================================

// 使用するモデル。無料枠で使える軽量・高速モデル。
//   gemini-2.5-flash       … 速くて無料枠が大きい（おすすめ）
//   gemini-2.5-flash-lite  … さらに軽量
//   gemini-2.5-pro         … 高性能（無料枠は小さめ）
const GEMINI_MODEL = 'gemini-2.5-flash';

// 1回の返答の最大トークン数（長文を返したいときは増やす）
const GEMINI_MAX_TOKENS = 1024;

// ===============================================================

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/**
 * 汎用関数。指示文を渡すと Gemini の返答をそのまま返します。
 * @param {string} prompt 指示・質問。例: "次の文を3行で要約: " & A1
 * @param {string} [input] （任意）対象テキスト。
 * @param {number} [maxTokens] （任意）最大トークン数。
 * @return Geminiの返答テキスト
 * @customfunction
 */
function GEMINI(prompt, input, maxTokens) {
  if (isBlankG_(prompt)) return '';
  var fullPrompt = String(prompt);
  if (!isBlankG_(input)) {
    fullPrompt += '\n\n' + String(input);
  }
  return callGemini_(fullPrompt, maxTokens);
}

/**
 * テキストを要約します。
 * @param {string} text 要約したい文章
 * @param {string} [language] （任意）出力言語。省略時は日本語。
 * @return 要約
 * @customfunction
 */
function GEMINI_SUMMARIZE(text, language) {
  if (isBlankG_(text)) return '';
  var lang = isBlankG_(language) ? '日本語' : String(language);
  var prompt =
    '次の文章を' + lang + 'で簡潔に要約してください。' +
    '前置きや説明は不要で、要約だけを返してください。\n\n' + String(text);
  return callGemini_(prompt);
}

/**
 * テキストを翻訳します。
 * @param {string} text 翻訳したい文章
 * @param {string} targetLanguage 翻訳先の言語。例: "英語"
 * @return 翻訳結果
 * @customfunction
 */
function GEMINI_TRANSLATE(text, targetLanguage) {
  if (isBlankG_(text)) return '';
  if (isBlankG_(targetLanguage)) return 'エラー: 翻訳先の言語を指定してください';
  var prompt =
    '次の文章を' + String(targetLanguage) + 'に翻訳してください。' +
    '訳文だけを返し、前置きや注釈は付けないでください。\n\n' + String(text);
  return callGemini_(prompt);
}

/**
 * テキストを、指定したラベルのいずれか1つに分類します。
 * @param {string} text 分類したい文章
 * @param {string} categories カンマ区切りのラベル。例: "肯定,否定,中立"
 * @return 一致したラベル1つ
 * @customfunction
 */
function GEMINI_CLASSIFY(text, categories) {
  if (isBlankG_(text)) return '';
  if (isBlankG_(categories)) return 'エラー: 分類ラベルを指定してください';
  var prompt =
    '次の文章を、以下のラベルのいずれか1つだけに分類してください。\n' +
    'ラベル: ' + String(categories) + '\n' +
    '回答はラベルの単語のみとし、説明や記号は付けないでください。\n\n' +
    '文章: ' + String(text);
  return callGemini_(prompt, 64);
}

/**
 * 指示に従って文章を生成します。
 * @param {string} instruction 生成の指示。例: "丁寧なお礼メールを書いて"
 * @param {string} [context] （任意）参考情報。
 * @return 生成された文章
 * @customfunction
 */
function GEMINI_WRITE(instruction, context) {
  if (isBlankG_(instruction)) return '';
  var prompt = String(instruction);
  if (!isBlankG_(context)) {
    prompt += '\n\n参考情報:\n' + String(context);
  }
  return callGemini_(prompt, 2048);
}

// ===== 内部処理 =================================================

/**
 * Gemini API を呼び出して返答テキストを取得します。
 * @private
 */
function callGemini_(prompt, maxTokens) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    return 'エラー: APIキー未設定。メニュー「Gemini」→「APIキーを設定」から登録してください';
  }

  var url = GEMINI_API_BASE + GEMINI_MODEL + ':generateContent';
  var payload = {
    contents: [
      { parts: [{ text: String(prompt) }] }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens || GEMINI_MAX_TOKENS
    }
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-goog-api-key': apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code !== 200) {
      var msg = (body && body.error && body.error.message) ? body.error.message : ('HTTP ' + code);
      return 'エラー: ' + msg;
    }

    // candidates[0].content.parts[*].text を連結して返す
    if (body.candidates && body.candidates.length) {
      var parts = body.candidates[0].content && body.candidates[0].content.parts;
      if (parts && parts.length) {
        var out = '';
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].text) out += parts[i].text;
        }
        return out.trim();
      }
      // 安全フィルタ等で本文が無い場合
      var reason = body.candidates[0].finishReason || '不明';
      return 'エラー: 返答が空でした（理由: ' + reason + '）';
    }
    return 'エラー: 返答が得られませんでした';
  } catch (e) {
    return 'エラー: ' + e.message;
  }
}

/** 空判定 @private */
function isBlankG_(v) {
  return v === '' || v === null || v === undefined;
}

// ===== メニュー（APIキー設定用）=================================

/** スプレッドシートを開いたときにメニューを追加 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Gemini')
    .addItem('APIキーを設定', 'setGeminiApiKey_')
    .addItem('APIキーを削除', 'clearGeminiApiKey_')
    .addItem('接続テスト', 'testGeminiConnection_')
    .addToUI();
}

/** APIキーをダイアログで入力して保存 */
function setGeminiApiKey_() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Gemini APIキーの設定',
    'aistudio.google.com で取得した無料APIキーを貼り付けてください:',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  var key = result.getResponseText().trim();
  if (!key) {
    ui.alert('キーが空です。設定を中止しました。');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
  ui.alert('APIキーを保存しました。=GEMINI("こんにちは") などで試せます。');
}

/** APIキーを削除 */
function clearGeminiApiKey_() {
  PropertiesService.getScriptProperties().deleteProperty('GEMINI_API_KEY');
  SpreadsheetApp.getUi().alert('APIキーを削除しました。');
}

/** 接続テスト */
function testGeminiConnection_() {
  var result = callGemini_('「接続成功」とだけ返してください。', 32);
  SpreadsheetApp.getUi().alert('テスト結果:\n\n' + result);
}
