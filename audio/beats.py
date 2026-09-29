"""Measure a music track into a beat grid the film can read.

    .venv/Scripts/python audio/beats.py track.wav > films/<name>/beats.json

Output keys: bpm, beats (state changes), downbeats (big moments, every 4th beat),
hits (onset peaks: put SFX here), duration.
"""
import json
import sys

import librosa
import numpy as np


def main(path: str) -> None:
    y, sr = librosa.load(path, sr=None, mono=True)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beats = librosa.frames_to_time(beat_frames, sr=sr)

    env = librosa.onset.onset_strength(y=y, sr=sr)
    peaks = librosa.util.peak_pick(env, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
    hits = librosa.frames_to_time(peaks, sr=sr)

    json.dump(
        {
            "bpm": round(float(np.atleast_1d(tempo)[0]), 2),
            "duration": round(len(y) / sr, 3),
            "beats": [round(float(b), 3) for b in beats],
            "downbeats": [round(float(b), 3) for b in beats[::4]],
            "hits": [round(float(h), 3) for h in hits],
        },
        sys.stdout,
        indent=1,
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: beats.py <audio file>")
    main(sys.argv[1])
