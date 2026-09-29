# SEEK — director's brief

## Film in one line
Фильм о том, как сам этот фильм рендерится: по нижней линейке-таймлайну идёт playhead,
и каждый эпизод — то, что движок делает с кадром в этот момент: звонок `seek(t)`,
сэмплирование кадров, пружины, пайп в ffmpeg, один таймлайн на все форматы, сборка
вордмарка и перемотка в кадр 0. Дизайн = смысл видео в чистом виде.

## Reference
Статья Movez "motion design studio" (12-шаговый курс): движок seek(t), закрытые пружины,
бит-грид, синтез звука, критик-луп. Грамматика — dark technical / phosphor terminal
+ precision engineering (TEILE/Telemetry-энергетика), НЕ пиксель-арт bit и не слайды.

## Tools
Маршрут A: `render.mjs` + `lib/motion.js`. Музыка — bespoke `audio/score.mjs` (128 BPM
minimal-techno, секции по таймлинии), SFX — `audio/sfx.mjs` из `timeline.js`,
сведение — `audio/mix.mjs` −14 LUFS. Критик — просмотр contact/strip/phone листов.

## Deliverables
out/final_16x9.mp4 (основной), out/final_9x16.mp4, out/final_1x1.mp4,
версии 60/90/180 fps, contact.png, poster.png, review_log.md.

## Character bible
Герой — playhead: кислотно-зелёная вертикальная линия + треугольник. Живёт весь фильм,
всегда виден (или его след). Мир — почти чёрная сцена + линейка внизу: 64 бита / 16 тактов.

## Beat sheet
128 BPM, beat = 0.46875 s, 16 тактов = 30.0 s. Новое событие каждые 2–4 с.
См. shotlist.md.
