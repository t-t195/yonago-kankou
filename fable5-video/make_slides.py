#!/usr/bin/env python3
"""解説動画用スライド(1920x1080 PNG x8)を生成する。"""
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "slides")
W, H = 1920, 1080

TTC = "/usr/share/fonts/opentype/noto/NotoSansCJK-{w}.ttc"


def jp_font(weight, size):
    # ttc 内から日本語フェイス (Noto Sans CJK JP) を探す
    for idx in range(10):
        try:
            f = ImageFont.truetype(TTC.format(w=weight), size, index=idx)
        except OSError:
            break
        if "JP" in f.getname()[0] and "Mono" not in f.getname()[0]:
            return f
    raise RuntimeError("JP font not found")


F_H1 = jp_font("Bold", 96)
F_H1S = jp_font("Bold", 72)
F_H2 = jp_font("Bold", 58)
F_H3 = jp_font("Bold", 44)
F_BODY = jp_font("Regular", 38)
F_BODY_B = jp_font("Bold", 38)
F_SMALL = jp_font("Regular", 30)
F_TINY = jp_font("Regular", 24)
F_NUM = jp_font("Bold", 34)
F_BIG = jp_font("Bold", 64)

BG_TOP = (12, 19, 34)
BG_BTM = (22, 36, 60)
ACCENT = (235, 130, 90)       # コーラル
ACCENT2 = (110, 180, 255)     # ブルー
WHITE = (245, 248, 252)
GREY = (165, 180, 200)
CARD = (28, 44, 72)
CARD_LINE = (60, 84, 122)
GOOD = (120, 210, 160)
WARN = (250, 200, 110)


def base(num, label):
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(BG_TOP, BG_BTM)))
    # 上部アクセントライン
    d.rectangle([0, 0, W, 8], fill=ACCENT)
    if num:
        d.text((80, 48), f"{num:02d}", font=F_NUM, fill=ACCENT)
        d.text((150, 52), label, font=F_SMALL, fill=GREY)
    # フッター
    d.text((80, H - 52), "出典: ChatGPT研究所の解説記事をもとに作成 ／ 音声: VOICEVOX 四国めたん", font=F_TINY, fill=(110, 125, 148))
    if num:
        d.text((W - 120, H - 52), f"{num}/8", font=F_TINY, fill=(110, 125, 148))
    return img, d


def card(d, x0, y0, x1, y1, fill=CARD, line=CARD_LINE):
    d.rounded_rectangle([x0, y0, x1, y1], radius=22, fill=fill, outline=line, width=2)


def bullets(d, x, y, items, gap=66, font=F_BODY, color=WHITE, dot=ACCENT):
    for it in items:
        d.ellipse([x, y + 22, x + 14, y + 36], fill=dot)
        d.text((x + 36, y), it, font=font, fill=color)
        y += gap
    return y


# ---------- 1. タイトル ----------
img, d = base(0, "")
d.text((W / 2, 250), "2026.06.10  Anthropic 発表", font=F_H3, fill=ACCENT2, anchor="mm")
d.text((W / 2, 400), "Claude Fable 5", font=jp_font("Bold", 150), fill=WHITE, anchor="mm")
d.text((W / 2, 560), "“Mythosクラス” 初の一般開放", font=F_H1S, fill=ACCENT, anchor="mm")
d.text((W / 2, 670), "― 5分でわかる実力と注意点 ―", font=F_H3, fill=GREY, anchor="mm")
chips = ["SWE-Bench Pro 80.3%", "価格は Opus 4.8 の2倍", "セーフガード付き"]
cw = 460
x = (W - (cw * 3 + 60 * 2)) / 2
for c in chips:
    card(d, x, 790, x + cw, 880)
    d.text((x + cw / 2, 835), c, font=F_BODY_B, fill=WHITE, anchor="mm")
    x += cw + 60
img.save(f"{OUT}/slide1.png")

# ---------- 2. 系譜 ----------
img, d = base(2, "CLAUDE FABLE 5 の概要")
d.text((80, 130), "Opus の後継ではない ― 系譜が変わった", font=F_H2, fill=WHITE)
# 左: 汎用ライン
card(d, 110, 300, 690, 560)
d.text((400, 360), "汎用ライン", font=F_H3, fill=GREY, anchor="mm")
d.text((400, 440), "Claude Opus 4.8", font=F_BIG, fill=WHITE, anchor="mm")
d.text((400, 515), "→ 引き続き提供・半額で高速", font=F_SMALL, fill=GREY, anchor="mm")
# 右: Mythos クラス
card(d, 820, 240, 1810, 420, fill=(40, 34, 50), line=ACCENT)
d.text((1315, 300), "Mythos クラス(別系統の最上位)", font=F_H3, fill=ACCENT, anchor="mm")
d.text((1315, 370), "これまで政府・重要インフラ向け限定(Project Glasswing 等)", font=F_SMALL, fill=GREY, anchor="mm")
# 子ボックス2つ
d.line([1100, 420, 1100, 500], fill=CARD_LINE, width=4)
d.line([1530, 420, 1530, 500], fill=CARD_LINE, width=4)
card(d, 850, 500, 1330, 800)
d.text((1090, 560), "Claude Fable 5", font=F_H3, fill=WHITE, anchor="mm")
d.text((1090, 640), "一般提供版", font=F_BODY_B, fill=GOOD, anchor="mm")
d.text((1090, 710), "セーフガード付き\n本日から API で利用可", font=F_SMALL, fill=GREY, anchor="mm", align="center")
card(d, 1370, 500, 1810, 800)
d.text((1590, 560), "Claude Mythos 5", font=F_H3, fill=WHITE, anchor="mm")
d.text((1590, 640), "認可組織限定", font=F_BODY_B, fill=WARN, anchor="mm")
d.text((1590, 710), "一部セーフガード解除\nサイバー防御・生命科学研究", font=F_SMALL, fill=GREY, anchor="mm", align="center")
d.text((80, 880), "※ 報じられている一部の高スコアは、一般には買えない「解除版(Mythos 5)」の数字", font=F_SMALL, fill=WARN)
img.save(f"{OUT}/slide2.png")

# ---------- 3. セーフガード ----------
img, d = base(3, "セーフガードの仕組み")
d.text((80, 130), "「断る」のではなく「Opus 4.8 が代わりに答える」", font=F_H2, fill=WHITE)
cats = [("①", "サイバー攻撃への悪用"), ("②", "生物・化学の危険領域"), ("③", "能力抽出(蒸留)")]
cw = 540
x = 110
for mark, t in cats:
    card(d, x, 270, x + cw, 430)
    d.text((x + cw / 2, 320), mark, font=F_H3, fill=ACCENT, anchor="mm")
    d.text((x + cw / 2, 385), t, font=F_BODY_B, fill=WHITE, anchor="mm")
    x += cw + 40
# 矢印
d.polygon([(W / 2 - 30, 460), (W / 2 + 30, 460), (W / 2, 520)], fill=ACCENT)
card(d, 360, 540, 1560, 660, fill=(40, 34, 50), line=ACCENT)
d.text((W / 2, 600), "該当時は Opus 4.8 が代理応答(課金も Opus 料金)", font=F_H3, fill=WHITE, anchor="mm")
y = 730
y = bullets(d, 140, y, [
    "発動率はセッションの5%未満(初日は95%が Fable 5 のみで完結)",
    "公式も「現状のフィルタはアグレッシブすぎる」と認める",
], gap=72)
d.ellipse([140, y + 22, 154, y + 36], fill=WARN)
d.text((176, y), "利用には30日間のデータ保持が必須(ゼロ保持契約でも例外なし)", font=F_BODY_B, fill=WARN)
img.save(f"{OUT}/slide3.png")

# ---------- 4. 公式ベンチ ----------
img, d = base(4, "公式ベンチマーク")
d.text((80, 130), "コーディングの伸びが「漸進」ではなく「段差」", font=F_H2, fill=WHITE)


def vbar(d, cx, ybase, val, vmax, h, w, color, label, sub):
    bh = int(h * val / vmax)
    d.rounded_rectangle([cx - w / 2, ybase - bh, cx + w / 2, ybase], radius=10, fill=color)
    d.text((cx, ybase - bh - 40), f"{val}%", font=F_H3, fill=WHITE, anchor="mm")
    d.text((cx, ybase + 40), label, font=F_BODY_B, fill=WHITE, anchor="mm")
    d.text((cx, ybase + 88), sub, font=F_SMALL, fill=GREY, anchor="mm")


YB, BH = 760, 420
d.text((460, 270), "SWE-Bench Pro(実コード修正)", font=F_H3, fill=ACCENT2, anchor="mm")
vbar(d, 330, YB, 69.2, 100, BH, 180, (70, 100, 145), "Opus 4.8", "")
vbar(d, 620, YB, 80.3, 100, BH, 180, ACCENT, "Fable 5", "+11.1pt")
d.text((1380, 270), "FrontierCode Diamond(最難関)", font=F_H3, fill=ACCENT2, anchor="mm")
vbar(d, 1250, YB, 13.4, 100, BH, 180, (70, 100, 145), "Opus 4.8", "")
vbar(d, 1540, YB, 29.3, 100, BH, 180, ACCENT, "Fable 5", "2倍超")
d.line([960, 300, 960, 860], fill=CARD_LINE, width=2)
d.text((W / 2, 950), "前回(Opus 4.7→4.8)の SWE-Bench Pro は +5pt 程度 ― 今回は飛躍的な更新", font=F_BODY, fill=WARN, anchor="mm")
img.save(f"{OUT}/slide4.png")

# ---------- 5. 外部評価 ----------
img, d = base(5, "外部評価 6件")
d.text((80, 130), "先行利用 6社の評価 ― 方向が一致", font=F_H2, fill=WHITE)
rows = [
    ("Every.to", "Senior Engineer ベンチ 91/100(Opus 63・人間 96/89)"),
    ("Cursor", "CursorBench 72.9% ― 従来ベストを8pt更新の新SOTA"),
    ("Harvey(法務)", "BigLaw Bench 93.4% ― 同社測定の過去最高"),
    ("Hex(分析)", "長時間の複合分析ベンチで初の90%超(+10pt)"),
    ("Replit(開発)", "アプリ丸ごと制作 ViBench でテスト史上最高"),
    ("Hebbia(金融)", "Finance Benchmark で全モデル首位"),
]
y = 250
for name, desc in rows:
    card(d, 110, y, 1810, y + 88)
    d.text((150, y + 44), name, font=F_BODY_B, fill=ACCENT2, anchor="lm")
    d.text((560, y + 44), desc, font=F_BODY, fill=WHITE, anchor="lm")
    y += 104
card(d, 110, y + 18, 1810, y + 120, fill=(50, 42, 30), line=WARN)
d.text((W / 2, y + 69), "共通点: 伸びたのは長時間・複合タスクのみ。短いタスクでは差がほぼ見えない", font=F_BODY_B, fill=WARN, anchor="mm")
img.save(f"{OUT}/slide5.png")

# ---------- 6. 価格と提供 ----------
img, d = base(6, "価格と提供形態")
d.text((80, 130), "「性能向上・価格据え置き」から、明確な値上げへ", font=F_H2, fill=WHITE)
d.text((110, 250), "API価格($ / 100万トークン・出力)", font=F_H3, fill=ACCENT2)
prices = [("Fable 5", 10, 50, ACCENT), ("Opus 4.8", 5, 25, (70, 100, 145)), ("Sonnet 4.6", 3, 15, (60, 80, 110))]
y = 340
for name, pin, pout, color in prices:
    bw = int(900 * pout / 50)
    d.text((110, y + 27), name, font=F_BODY_B, fill=WHITE, anchor="lm")
    d.rounded_rectangle([360, y, 360 + bw, y + 54], radius=12, fill=color)
    d.text((380 + bw, y + 27), f"出力 ${pout} / 入力 ${pin}", font=F_BODY, fill=GREY, anchor="lm")
    y += 92
y = bullets(d, 140, 660, [
    "Claude API・Bedrock・Vertex AI・Microsoft Foundry・GitHub Copilot で提供開始",
    "Claude.ai では 6/22 まで追加費用なし → 6/23 からクレジット制へ",
    "プロンプトキャッシュで入力90%割引 ／ Claude.ai の利用枠は2倍消費",
], gap=72)
card(d, 110, y + 20, 1810, y + 116, fill=(50, 42, 30), line=WARN)
d.text((W / 2, y + 68), "「$100のMaxプラン、5時間の利用枠を8分で使い切った」― Hacker News", font=F_BODY, fill=WARN, anchor="mm")
img.save(f"{OUT}/slide6.png")

# ---------- 7. 実機検証 ----------
img, d = base(7, "実機検証(AGIラボ)")
d.text((80, 130), "長時間・複合タスクを丸ごと任せてみた", font=F_H2, fill=WHITE)
cards7 = [
    ("検証A  ペリカンSVG", [
        "逆運動学でペダルを計算、",
        "車輪と地面スクロールを同期",
        "7層パララックス・約35アニメ",
        "",
        "ただし3回試行で",
        "「良・可・破綻」各1回",
    ]),
    ("検証B  レポート再現", [
        "McKinsey公式レポートを渡し",
        "「同レベルを作って」と指示",
        "",
        "A4縦11ページ・図表7点を",
        "約8分で完成",
        "架空数値なし・出典一覧つき",
    ]),
    ("検証C  コミュニティ", [
        "マリオ風ゲームが",
        "一発で遊べる形で生成",
        "",
        "一方で消費は激しく",
        "「あっという間に12%消費」",
        "Opus への自動切替も発生",
    ]),
]
cw = 545
x = 110
for title, lines in cards7:
    card(d, x, 260, x + cw, 880)
    d.text((x + cw / 2, 320), title, font=F_H3, fill=ACCENT, anchor="mm")
    yy = 400
    for ln in lines:
        d.text((x + cw / 2, yy), ln, font=F_SMALL, fill=WHITE if ln else GREY, anchor="mm")
        yy += 70
    x += cw + 35
img.save(f"{OUT}/slide7.png")

# ---------- 8. まとめ ----------
img, d = base(8, "まとめ")
d.text((80, 130), "「上位互換」ではなく、「新しい選択肢」", font=F_H2, fill=WHITE)
y = bullets(d, 140, 280, [
    "日常の大半のタスク → 速くて半額の Opus 4.8 が引き続き合理的",
    "変わったのは、数時間〜数日の仕事を途中確認なしで丸ごと任せられること",
    "外部評価6件の一致と「11ページのレポートが8分」がそれを裏づける",
], gap=90)
card(d, 110, 590, 1810, 760, fill=(30, 48, 42), line=GOOD)
d.text((W / 2, 645), "試すなら 6/22 までの無料期間に", font=F_H3, fill=GOOD, anchor="mm")
d.text((W / 2, 715), "いつもなら分割する大きめの仕事を、1件だけ丸投げしてみる(短い質問では差は分からない)", font=F_BODY, fill=WHITE, anchor="mm")
d.text((140, 820), "残る宿題: 利害から独立した長時間検証と、セーフガード誤発動の実際の頻度", font=F_SMALL, fill=GREY)
d.text((W / 2, 935), "ご視聴ありがとうございました", font=F_H3, fill=ACCENT, anchor="mm")
img.save(f"{OUT}/slide8.png")

print("8 slides saved to", OUT)
