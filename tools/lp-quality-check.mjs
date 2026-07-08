#!/usr/bin/env node
/**
 * lp-quality-check.mjs — LP品質ゲート（依存ゼロ・Node単体）
 *
 * 使い方:  node tools/lp-quality-check.mjs <path/to/index.html>
 * 終了코드: FAILが1件でもあれば 1（CI・hook・skillの品質ゲートに使う）
 *
 * 検査内容: 構造 / メタ / リンク / 画像 / a11y / 構造化データ / 完成度
 * （templates/07 コーディング規約・08 SEO/AIOチェックリストの機械検査可能な部分を自動化）
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const file = process.argv[2];
if (!file) { console.error("使い方: node tools/lp-quality-check.mjs <index.html>"); process.exit(2); }
if (!existsSync(file)) { console.error(`ファイルが見つかりません: ${file}`); process.exit(2); }

const html = readFileSync(file, "utf8");
const baseDir = dirname(resolve(file));
const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0];

const results = [];
const add = (level, category, message) => results.push({ level, category, message });
const pass = (c, m) => add("PASS", c, m);
const fail = (c, m) => add("FAIL", c, m);
const warn = (c, m) => add("WARN", c, m);

/* ---------- 1. 構造 ---------- */
const h1s = body.match(/<h1[\s>]/gi) || [];
h1s.length === 1 ? pass("構造", "h1が1つ") : fail("構造", `h1が${h1s.length}個（1つであるべき）`);

/<main[\s>]/i.test(body) ? pass("構造", "<main>あり") : fail("構造", "<main>がない");

/<html[^>]*\blang="ja"/i.test(html) ? pass("構造", 'lang="ja"') : fail("構造", 'html要素に lang="ja" がない');

for (const tag of ["section", "div", "main", "header", "footer", "form", "ul", "ol", "table"]) {
  const open = (body.match(new RegExp(`<${tag}[\\s>]`, "gi")) || []).length;
  const close = (body.match(new RegExp(`</${tag}>`, "gi")) || []).length;
  open === close
    ? pass("構造", `<${tag}> 開閉一致 (${open})`)
    : fail("構造", `<${tag}> 開${open}/閉${close} 不一致`);
}

// 見出し階層の飛び（h2の次にh4等）
const headingSeq = [...body.matchAll(/<h([1-6])[\s>]/gi)].map(m => Number(m[1]));
let skip = false;
for (let i = 1; i < headingSeq.length; i++) {
  if (headingSeq[i] > headingSeq[i - 1] + 1) { skip = true; break; }
}
skip ? warn("構造", "見出し階層に飛びがある（h2→h4等）") : pass("構造", "見出し階層に飛びなし");

/* ---------- 2. メタ ---------- */
const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
if (!title) fail("メタ", "<title>がない");
else if (title.length > 40) warn("メタ", `title ${title.length}字（32字前後推奨）`);
else pass("メタ", `title あり (${title.length}字)`);

const desc = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [])[1];
if (!desc) fail("メタ", "meta description がない");
else if (desc.length < 60 || desc.length > 140) warn("メタ", `description ${desc.length}字（80〜120字推奨）`);
else pass("メタ", `description あり (${desc.length}字)`);

/<link\s+rel="canonical"/i.test(html) ? pass("メタ", "canonical あり") : fail("メタ", "canonical がない");
/<link\s+rel="icon"/i.test(html) ? pass("メタ", "favicon あり") : warn("メタ", "favicon がない");

for (const p of ["og:title", "og:description", "og:type", "og:image"]) {
  new RegExp(`property="${p}"`, "i").test(html) ? pass("メタ", `${p} あり`) : fail("メタ", `${p} がない`);
}

/* ---------- 3. リンク ---------- */
const hrefs = [...body.matchAll(/href="([^"]*)"/gi)].map(m => m[1]);
const ids = new Set([...body.matchAll(/id="([^"]+)"/gi)].map(m => m[1]));
let anchorNg = 0;
for (const h of hrefs.filter(h => /^#.+/.test(h))) {
  if (!ids.has(h.slice(1))) { anchorNg++; fail("リンク", `アンカー ${h} の飛び先idが無い`); }
}
if (!anchorNg) pass("リンク", `ページ内アンカー整合 (${hrefs.filter(h => /^#.+/.test(h)).length}件)`);

let deadNg = 0;
for (const h of hrefs) {
  if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(h) || h === "") continue;
  const target = resolve(baseDir, h.split("#")[0].split("?")[0]);
  if (!existsSync(target)) { deadNg++; fail("リンク", `リンク切れ: ${h}（ファイルが存在しない）`); }
}
if (!deadNg) pass("リンク", "相対リンク切れなし");

const emptyHref = hrefs.filter(h => h === "" || h === "#").length;
emptyHref ? warn("リンク", `href="#" / 空href が ${emptyHref}件（仮リンク）`) : pass("リンク", "空リンクなし");

/* ---------- 4. 画像 ---------- */
const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
let imgNg = 0;
for (const img of imgs) {
  const src = (img.match(/src="([^"]*)"/) || [])[1] || "(src不明)";
  if (!/\balt="/.test(img)) { imgNg++; fail("画像", `alt欠落: ${src.slice(0, 60)}`); }
  if (!/\bwidth="/.test(img) || !/\bheight="/.test(img)) { imgNg++; fail("画像", `width/height欠落(CLS): ${src.slice(0, 60)}`); }
}
if (!imgNg) pass("画像", `img ${imgs.length}件 すべて alt・width/height あり`);
const lazyMissing = imgs.filter(i => !/loading="lazy"/.test(i)).length;
imgs.length > 1 && lazyMissing > 1
  ? warn("画像", `loading="lazy" なしが${lazyMissing}件（FV以外は付与推奨）`)
  : pass("画像", "lazy設定妥当");

/* ---------- 5. a11y ---------- */
const inputs = [...body.matchAll(/<(input|textarea|select)\b[^>]*>/gi)].map(m => m[0])
  .filter(t => !/type="(hidden|submit|button)"/.test(t));
const labelFor = new Set([...body.matchAll(/<label[^>]*\bfor="([^"]+)"/gi)].map(m => m[1]));
let labelNg = 0;
for (const inp of inputs) {
  const id = (inp.match(/\bid="([^"]+)"/) || [])[1];
  if (!id || !labelFor.has(id)) { labelNg++; fail("a11y", `label未対応の入力: ${(inp.match(/name="([^"]+)"/) || [])[1] || inp.slice(0, 40)}`); }
}
if (inputs.length && !labelNg) pass("a11y", `フォーム入力 ${inputs.length}件 すべてlabel対応`);
if (/nav-toggle|hamburger|menu-toggle/i.test(body)) {
  /aria-expanded/.test(body) ? pass("a11y", "ナビtoggleに aria-expanded") : fail("a11y", "ナビtoggleに aria-expanded がない");
}

/* ---------- 6. 構造化データ ---------- */
const ldBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(m => m[1]);
if (!ldBlocks.length) fail("SEO/AIO", "JSON-LDがない");
else {
  const types = [];
  let parseNg = 0;
  for (const b of ldBlocks) {
    try {
      const j = JSON.parse(b);
      types.push(...[].concat(j["@type"] || (j["@graph"] || []).map(g => g["@type"])).filter(Boolean));
    } catch { parseNg++; }
  }
  parseNg ? fail("SEO/AIO", `JSON-LDのJSON構文エラー ${parseNg}件`) : pass("SEO/AIO", `JSON-LD ${ldBlocks.length}件: ${types.join(", ")}`);
  types.includes("FAQPage") ? pass("SEO/AIO", "FAQPage あり（AI検索対応）") : warn("SEO/AIO", "FAQPage がない（FAQがあるなら追加推奨）");
}

/* ---------- 7. 完成度・CV ---------- */
const todos = [...body.matchAll(/(【要編集】|TODO)/g)].length;
todos ? warn("完成度", `未確定マーク（TODO/要編集）が ${todos}件 — 公開前に0にする`) : pass("完成度", "未確定マークなし");

/href="tel:/.test(body) ? pass("CV", "電話リンクあり") : warn("CV", "tel:リンクがない");
(/<form\b/i.test(body) || /href="#contact"/.test(body))
  ? pass("CV", "CV導線（フォーム/#contact）あり")
  : fail("CV", "CV導線が見つからない（form も #contact も無い）");

/* ---------- レポート ---------- */
const icon = { PASS: "✅", FAIL: "❌", WARN: "⚠️ " };
const counts = { PASS: 0, FAIL: 0, WARN: 0 };
console.log(`\nLP品質チェック: ${file}\n${"─".repeat(64)}`);
for (const r of results) {
  counts[r.level]++;
  if (r.level !== "PASS") console.log(`${icon[r.level]} [${r.category}] ${r.message}`);
}
console.log(`${"─".repeat(64)}`);
console.log(`PASS ${counts.PASS} ／ WARN ${counts.WARN} ／ FAIL ${counts.FAIL}`);
const score = Math.round((counts.PASS / (counts.PASS + counts.FAIL + counts.WARN * 0.5)) * 100);
console.log(`スコア: ${score}/100 → ${counts.FAIL ? "不合格（FAILを解消してください）" : "合格 🎉"}\n`);
process.exit(counts.FAIL ? 1 : 0);
