#!/usr/bin/env node
// 毎朝の学習配信スクリプト（GitHub Actionsから実行）
// 役割: progress.jsonから対象Dayを決定 → Messages APIで解説＋3問を生成 →
//       Slackへ投稿 → deliveries/day-XX.md保存＋progress.jsonのdelivered系フィールド更新
// 使い方: node scripts/daily-delivery.mjs [--dry-run]
//   --dry-run: API/Slackを呼ばず、対象Day判定と生成プロンプトをstdoutに出して終了
// 必要な環境変数: ANTHROPIC_API_KEY, SLACK_WEBHOOK_URL, MODEL_ID

import { readFileSync, writeFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = new URL("..", import.meta.url).pathname;

const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
const progress = JSON.parse(readFileSync(`${ROOT}progress.json`, "utf8"));
const daysMd = readFileSync(`${ROOT}curriculum/days.md`, "utf8");
const profile = readFileSync(`${ROOT}curriculum/profile.md`, "utf8");

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function postToSlack(text) {
  if (DRY_RUN) {
    console.log("--- Slack payload (dry-run) ---\n" + text);
    return;
  }
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) fail("SLACK_WEBHOOK_URL が未設定");
  // Slackの1メッセージ表示限界対策: 段落境界で3,500字以下に分割して順次投稿
  const chunks = [];
  let buf = "";
  for (const para of text.split("\n\n")) {
    if (buf && buf.length + para.length + 2 > 3500) {
      chunks.push(buf);
      buf = para;
    } else {
      buf = buf ? buf + "\n\n" + para : para;
    }
  }
  if (buf) chunks.push(buf);
  for (const chunk of chunks) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk }),
    });
    if (!res.ok) fail(`Slack投稿に失敗: ${res.status} ${await res.text()}`);
  }
}

// --- 対象Dayの決定 ---------------------------------------------------------

const dayNo = progress.current_day;
const entry = progress.days?.[String(dayNo)];
const status = entry?.status;

if (entry?.delivered_at === today && status !== "pending") {
  console.log(`Day ${dayNo} は本日(${today})配信済み。スキップ。`);
  process.exit(0);
}

if (status === "awaiting_answers" || status === "delivered") {
  // 前日以前の分が未完了: 新規Dayを積み上げず、リマインドのみ
  const theme = entry.theme ?? "";
  const msg =
    `リマインド: Day ${dayNo}${theme ? `「${theme}」` : ""} が回答待ちです。\n` +
    `Claude Codeで /learn を実行すると続きから再開できます。完了するまで次のDayは配信されません。`;
  await postToSlack(msg);
  console.log(`Day ${dayNo} 未完了のためリマインドのみ送信。`);
  process.exit(0);
}

if (status === "completed" || status === "completed_externally") {
  fail(`progress.json不整合: current_day=${dayNo} が ${status}。セッション側でcurrent_dayを進めてください。`);
}

// --- カリキュラムからセクション抽出 -----------------------------------------

const sectionRe = new RegExp(`^## Day ${dayNo}: (.+)$`, "m");
const headMatch = daysMd.match(sectionRe);
if (!headMatch) fail(`curriculum/days.md に「## Day ${dayNo}:」が見つからない`);
const theme = headMatch[1].trim();
const start = headMatch.index;
const rest = daysMd.slice(start + headMatch[0].length);
const nextHead = rest.search(/^## /m);
const section = headMatch[0] + (nextHead === -1 ? rest : rest.slice(0, nextHead));

const isWeekly = dayNo % 5 === 0;
const reviewQueue = (progress.review_queue ?? []).slice(-5);

// --- プロンプト組み立て -----------------------------------------------------

const system = `あなたは谷本さんのAI学習コーチ。今日の学習配信（Slack向け）を作成する。
表示ルール:
- 太字記号（アスタリスク2つ）やMarkdown見出し記号は使わない。Slackのプレーンテキストとして読める形にする
- 専門用語には初出時に読みがなをつける。例: RAG（ラグ／検索拡張生成）
- 補足は【補足A】最重要／【補足B】精度が上がる／【補足C】参考 のラベルで分ける
設問の制約:
- 記述式2問＋選択式1問（3〜4択）。学習者の現状を決めつける前提を入れない
- 既知スキル台帳にある項目の単純な再確認問題は出さない。既知と新規を繋ぐ問題は良い
- 料金・モデル名など変動の速い事実は断定せず「公式で要確認」と添える。これらを正解とする問題を作らない
- 復習ポイントがあれば出題材料として優先的に使う
構成: 冒頭に今日のテーマの解説（400字程度・簡潔）、続けて設問。回答はClaude Codeセッションで受け付ける旨を最後に一言添える。`;

const weeklyNote = isWeekly
  ? `今日は週次振り返りの日。通常の3問は出さず、(1)今週の範囲の予告とキーワードの総ざらい (2)「小テスト本体はClaude Codeセッションで実施する」案内、の2点だけを簡潔に書く。`
  : `通常日。解説＋3問を作成する。`;

const user = `# 今日のカリキュラム定義
${section}

# 学習者プロファイル（既知スキル台帳を含む）
${profile}

# 直近の復習ポイント
${reviewQueue.length ? reviewQueue.map((r) => `- ${r}`).join("\n") : "（なし）"}

# 指示
${weeklyNote}`;

if (DRY_RUN) {
  console.log(`対象: Day ${dayNo}: ${theme}（週次=${isWeekly}）`);
  console.log("--- system ---\n" + system);
  console.log("--- user ---\n" + user);
  process.exit(0);
}

// --- 生成 -------------------------------------------------------------------

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.MODEL_ID;
if (!apiKey) fail("ANTHROPIC_API_KEY が未設定");
if (!model) fail("MODEL_ID が未設定");

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    max_tokens: 3000,
    system,
    messages: [{ role: "user", content: user }],
  }),
});
if (!res.ok) {
  const body = await res.text();
  await postToSlack(`本日の学習配信の生成に失敗（API ${res.status}）。Actionsのログを確認してください。`);
  fail(`Messages API失敗: ${res.status} ${body}`);
}
const data = await res.json();
const content = (data.content ?? [])
  .filter((b) => b.type === "text")
  .map((b) => b.text)
  .join("\n");
if (content.trim().length < 200) {
  await postToSlack(`本日の学習配信の生成結果が異常に短いため中止。Actionsのログを確認してください。`);
  fail(`生成結果が短すぎる: ${content.length}字`);
}

// --- 配信と記録 -------------------------------------------------------------

const header = `Day ${dayNo}: ${theme}（${today}）`;
await postToSlack(`${header}\n\n${content}`);

const dayFile = `deliveries/day-${String(dayNo).padStart(2, "0")}.md`;
writeFileSync(`${ROOT}${dayFile}`, `# Day ${dayNo}: ${theme}\n\n配信日: ${today}\n\n${content}\n`);

progress.days[String(dayNo)] = {
  ...(entry ?? {}),
  status: "delivered",
  theme,
  delivered_at: today,
  delivered_by: "actions",
};
writeFileSync(`${ROOT}progress.json`, JSON.stringify(progress, null, 2) + "\n");

console.log(`Day ${dayNo} を配信し、${dayFile} と progress.json を更新した。`);
