# Brand videos

Drop the two HUB brand videos here with these exact filenames (lowercase,
hyphenated). They are served at the site root, e.g. `/videos/hub-login-loop.mp4`.

| File | Screen | Behavior |
| --- | --- | --- |
| `hub-login-loop.mp4` | Login background | Seamless 8s loop, `autoPlay muted loop playsInline` |
| `hub-register-intro.mp4` | Register onboarding | Plays once, then fades to the form |

Optional (recommended): add WebM twins for smaller size and they will be used
automatically as a preferred `<source>`:

- `hub-login-loop.webm`
- `hub-register-intro.webm`

Guidance:
- MP4 = H.264 video + AAC audio for universal support.
- Keep each file under ~2-3 MB so auth pages stay fast.
- Videos must be muted (browsers block autoplay with sound).
- The SVG brand mark (`/images/hub-mark.svg`) is used as the poster frame.
