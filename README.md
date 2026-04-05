# yuv.de

Interactive YUV color space explorer. Pick colors on the UV chrominance plane, adjust luminance with the Y slider, and decompose uploaded images into their Y, U, and V channels — all in the browser.

**Live:** [yuv.de](https://yuv.de)

## Features

- **Color Picker** — UV chrominance plane (256x256 canvas) with vertical Y (luma) slider. Real-time YUV/RGB/Hex readout.
- **Dynamic Background** — Page background transitions to the selected color. Text contrast adapts automatically.
- **Image Decomposition** — Upload or drag & drop an image to split it into Y (grayscale luma), U (blue-difference), and V (red-difference) false-color channels.
- **Keyboard Accessible** — Arrow keys to navigate the UV plane and Y slider. Shift for 10x steps.
- **BT.601 Standard** — Uses the ITU-R BT.601 conversion matrix for YUV ↔ RGB.

## Tech

Three static files, zero dependencies, no build step.

```
index.html   — Markup
style.css    — Styles (Syne + Space Mono via Google Fonts)
app.js       — Canvas rendering, YUV math, interactions
```

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## License

MIT
