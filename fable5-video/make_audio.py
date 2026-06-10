#!/usr/bin/env python3
"""VOICEVOX でナレーション音声を生成する。
要: LD_LIBRARY_PATH に libvoicevox_core.so / libonnxruntime.so のあるディレクトリ"""
import json
import os
import wave

from voicevox_core import VoicevoxCore

HERE = os.path.dirname(os.path.abspath(__file__))
DICT = "/tmp/open_jtalk_dic_utf_8-1.11"
SPEAKER = 30  # No.7 アナウンス(落ち着いた女性・アナウンサー風)

core = VoicevoxCore(open_jtalk_dict_dir=DICT)
core.load_model(SPEAKER)

# TTSに渡すときだけ適用する読み替え(スライド表記は英字のまま)
READINGS = {
    "Anthropic": "アンソロピック",
    "Opus": "オーパス",
    "Mythos": "ミュトス",
}

sections = json.load(open(os.path.join(HERE, "narration.json")))["sections"]
total = 0.0
for sec in sections:
    text = sec["text"]
    for word, reading in READINGS.items():
        text = text.replace(word, reading)
    query = core.audio_query(text, SPEAKER)
    query.speed_scale = 1.10
    query.pitch_scale = 0.04         # 少し高めで明るい印象に
    query.intonation_scale = 1.15    # 抑揚を付けて柔らかく
    query.pre_phoneme_length = 0.6   # 頭の余白
    query.post_phoneme_length = 0.9  # 末尾の余白
    wav = core.synthesis(query, SPEAKER)
    path = os.path.join(HERE, "audio", f"sec{sec['id']}.wav")
    open(path, "wb").write(wav)
    with wave.open(path) as w:
        dur = w.getnframes() / w.getframerate()
    total += dur
    print(f"sec{sec['id']}: {dur:.1f}s  ({len(sec['text'])}字)")
print(f"total: {total:.1f}s = {total/60:.2f}min")
