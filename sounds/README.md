# sounds/

Place your audio files here. sound.js expects the following names,
trying WebM/Opus first and falling back to MP3 (Safari).

## Required files

| WebM (primary)        | MP3 (Safari fallback)  | Used for                         |
|-----------------------|------------------------|----------------------------------|
| rustle.webm           | rustle.mp3             | Picking up / moving a mail piece |
| drawer-open.webm      | drawer-open.mp3        | Pulling the drawer open          |
| drawer-close.webm     | drawer-close.mp3       | Pushing the drawer closed        |

Missing files are silently ignored — the app works without them.

## Converting your WAV files

ffmpeg must be installed (https://ffmpeg.org).

```bash
# Rustle
ffmpeg -i rustle.wav       -c:a libopus -b:a 48k  sounds/rustle.webm
ffmpeg -i rustle.wav       -c:a libmp3lame -q:a 4  sounds/rustle.mp3

# Drawer open
ffmpeg -i drawer-open.wav  -c:a libopus -b:a 48k  drawer-open.webm
ffmpeg -i drawer-open.wav  -c:a libmp3lame -q:a 4  drawer-open.mp3
ffmpeg -i drawer-close.wav -c:a libopus -b:a 48k  drawer-close.webm
ffmpeg -i drawer-close.wav -c:a libmp3lame -q:a 4  drawer-close.mp3
# Drawer close

```

## Tips

- 48 kbps Opus is transparent for short SFX; go up to 64 kbps if it sounds thin.
- Trim silence from the start of each WAV before converting — the rustle
  should feel instant on pointerdown.
- Keep files under ~100 KB each; they're preloaded on first user gesture.
