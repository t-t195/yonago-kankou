#!/usr/bin/env python3
"""スライド+ナレーションをffmpegで結合し、BGM付きの解説動画を出力する。"""
import os
import subprocess
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
SEG = os.path.join(HERE, "seg")
FPS = 30


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True, text=True)


durs = []
for i in range(1, 9):
    awav = f"{HERE}/audio/sec{i}.wav"
    with wave.open(awav) as w:
        dur = w.getnframes() / w.getframerate() + 0.4  # 末尾に少し余白
    durs.append(dur)
    run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-loop", "1", "-framerate", str(FPS), "-i", f"{HERE}/slides/slide{i}.png",
        "-i", awav,
        "-t", f"{dur:.3f}",
        "-vf", f"fade=t=in:st=0:d=0.5,fade=t=out:st={dur - 0.5:.3f}:d=0.5,format=yuv420p",
        "-af", "apad",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        "-shortest",
        f"{SEG}/seg{i}.mp4",
    ])
    print(f"seg{i}: {dur:.1f}s")

total = sum(durs)
print(f"video total: {total:.1f}s = {total/60:.2f}min")

with open(f"{SEG}/list.txt", "w") as f:
    for i in range(1, 9):
        f.write(f"file 'seg{i}.mp4'\n")
run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
     "-i", f"{SEG}/list.txt", "-c", "copy", f"{SEG}/concat.mp4"])

# BGM: 柔らかいコードパッド (C3+G3+E4+C5 を弱くデチューン) を低音量で敷く
bgm = (
    f"sine=frequency=130.81:duration={total:.1f}[s1];"
    f"sine=frequency=196.00:duration={total:.1f}[s2];"
    f"sine=frequency=329.63:duration={total:.1f}[s3];"
    f"sine=frequency=523.25:duration={total:.1f}[s4];"
    "[s1][s2][s3][s4]amix=inputs=4:normalize=1,"
    "lowpass=f=700,tremolo=f=0.1:d=0.3,"
    f"afade=t=in:st=0:d=4,afade=t=out:st={total - 6:.1f}:d=6,volume=0.09[bgm]"
)
run([
    "ffmpeg", "-y", "-loglevel", "error",
    "-i", f"{SEG}/concat.mp4",
    "-filter_complex", bgm + ";[0:a][bgm]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,aformat=channel_layouts=stereo[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    f"{HERE}/claude-fable5-kaisetsu.mp4",
])
print("done:", f"{HERE}/claude-fable5-kaisetsu.mp4")
