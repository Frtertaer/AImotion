# c002 — motion overlay on a stream clip

Source: `D:\video\_autoclip_out\...\clips\stream-bratishkinoff-v2869620472-c002.mp4`
(1080x1920, 30 fps, 28.867 s, split facecam, burned-in subtitles, chat on the right).
Approach (Jev pick, p=0.74): own seek(t) engine renders a transparent layer (`render.mjs --alpha`,
PNG-in-MOV), ffmpeg overlays it, SFX from `timeline.js` mixed ~10 dB under the untouched voice.
Every animation key is pinned to a word from `words.json` (faster-whisper large-v3 word timings).
All illustrations (buds, ear, ear tips) are original generic drawings, no brand marks.

## Pipeline
```
node tools/check-seek.mjs films/stream-c002
node render.mjs films/stream-c002 --alpha --fps 30 --sub 2 --out films/stream-c002/out/overlay.mov
ffmpeg -i <src> -i out/overlay.mov -filter_complex "[0:v][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]" -map "[v]" -an ... out/comp_video.mp4
node audio/sfx.mjs films/stream-c002/cues.json out/sfx.wav --dur 28.867
node audio/mix.mjs out/comp_video.mp4 out/final.mp4 <src> out/sfx.wav --gains 1,0.45 --limit none
```

## Round 1 (own full-res check)
- Ear-card labels ran past the card into the chat. Browser measureText found 4 labels over the edge
  (not 1). Fix: smaller font + maxW guard; re-measure 12/12 inside.

## Round 1 (critic subagent) — Hook 6 · Phone 6 · Story 6 · Sync 7 · Placement 8 · Motion 5 · Style 7 · Watch 6
Verified in code before fixing:
- "РАКОВИНА ДЕРЖИТ" on screen 0.45 s (dHold 26.34 → dOut 26.8) — confirmed; concha disc sat on the canal.
- Bud "falls" 150 px and stays inside the ear outline (lobe at y 286) — confirmed.
- Label past the card at 18.4 s — confirmed; my static measure missed slide+pulse. Added clip to card shape.
- Card A contradicts speech — confirmed against words.json ("хорошие" = the headphones, sound = "нормальный").
- "5 hours" behind subtitles — source footage, not our layer; left as is.

## Round 2 (critic) — Hook 7 · Phone 7 · Story 7 · Sync 8 · Placement 7 · Motion 6 · Style 7 · Watch 7
R1 problems: payoff row fixed, card A fixed, bud fall "partly" (0.4 s flicker).
Verified and fixed:
- Docked chip at y 38-103 = TikTok/Shorts top menu zone (numbers confirmed) → docked at y ~133-187.
- Concha bowl 36 px from the canal, arrow + ring still on → arrow/ring yield on "раковина", bowl larger, up and back.
- Ear tips r 34-58 px → 58-94 px, larger bore.
- Fall g 3200 → 1400: ~0.6 s from canal to out of the card.
No third critic round: these fixes were checked by numbers and a full-res frame check only.

## Final
866 frames, 28.867 s, −14.0 LUFS, peak −1.4 dBFS, seek 16/16.
