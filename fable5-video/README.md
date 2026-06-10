# Claude Fable 5 解説動画

ChatGPT研究所の記事「Claude Fable 5」をもとに制作した約5分の解説動画です。

- 成果物: `claude-fable5-kaisetsu.mp4`(5分02秒 / 1920x1080 / H.264 + AAC)
- ナレーション: VOICEVOX 四国めたん(ノーマル)、話速1.13倍
- 構成: 全8セクション(タイトル → 概要 → セーフガード → 公式ベンチ → 外部評価 → 価格 → 実機検証 → まとめ)

## 再生成の手順

```bash
# 前提: VOICEVOX core 0.14.6 (Python) + open_jtalk辞書 + ffmpeg + Pillow
python3 make_slides.py                                      # slides/*.png を生成
LD_LIBRARY_PATH=<voicevox_coreのlibの場所> python3 make_audio.py  # audio/*.wav を生成
python3 build_video.py                                      # mp4 を組み立て
```

- `narration.json` … ナレーション原稿(セクション別)
- `make_slides.py` … スライド画像生成(Pillow + Noto Sans CJK JP)
- `make_audio.py` … ナレーション音声合成(VOICEVOX)
- `build_video.py` … ffmpegでスライド+音声+BGM(ソフトなコードパッド)を結合

クレジット: 音声 VOICEVOX:四国めたん ／ 出典 ChatGPT研究所(chatgpt-lab.com)の記事
