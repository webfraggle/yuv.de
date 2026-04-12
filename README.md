# yuv.de

Interactive YUV color space explorer. Pick colors on the UV chrominance plane, adjust luminance with the Y slider, and decompose uploaded images into their Y, U, and V channels — all in the browser.

**Live:** [yuv.de](https://yuv.de)

## Features

- **Color Picker** — UV chrominance plane (256x256 canvas) with vertical Y (luma) slider. Analog scale labels show the original YUV value ranges (Y: 0–1, U: ±0.436, V: ±0.615).
- **Analog YUV Readout** — Info panel displays YUV values as 3-decimal analog values alongside RGB and Hex.
- **Dynamic Background** — Page background transitions to the selected color. Text contrast adapts automatically based on luminance.
- **Image Decomposition** — Upload or drag & drop an image to split it into Y (grayscale luma), U (blue-difference), and V (red-difference) false-color channels displayed side by side.
- **Keyboard Accessible** — Arrow keys to navigate the UV plane and Y slider. Shift for 10x steps.
- **Mobile Support** — Responsive layout with horizontal Y slider and touch-optimized interactions.
- **SEO Content** — Explanation section covering YUV components, video compression, BT.601 vs BT.709, and YUV vs YCbCr.
- **BT.601 Standard** — Uses the ITU-R BT.601 conversion matrix for YUV ↔ RGB.

## Tech

Three static files, zero dependencies, no build step.

```
index.html   — Markup + SEO meta tags
style.css    — Styles (Syne + Space Mono via Google Fonts)
app.js       — Canvas rendering, YUV math, interactions
.htaccess    — Force HTTPS redirect
```

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## License

MIT
