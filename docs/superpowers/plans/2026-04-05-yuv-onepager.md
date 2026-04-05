# yuv.de OnePager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive, client-side-only OnePager at yuv.de that lets users explore the YUV color space via a UV plane + Y slider, and decompose uploaded images into Y/U/V channels.

**Architecture:** Three static files (index.html, style.css, app.js), no dependencies, no build step. Canvas API for all color rendering. BT.601 standard for YUV↔RGB conversion.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES modules), Canvas API

---

### Task 1: HTML Structure + Base CSS

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: Create index.html with full markup**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YUV — Explore the YUV Color Space</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <!-- Hero -->
    <header class="hero">
      <h1>YUV</h1>
      <p class="subtitle">Explore the YUV Color Space</p>
    </header>

    <!-- Interactive Color Picker -->
    <section class="picker">
      <div class="picker-row">
        <!-- Y Slider -->
        <div class="y-slider" role="slider" aria-label="Y (Luma) value" aria-valuemin="0" aria-valuemax="255" aria-valuenow="128" tabindex="0">
          <div class="y-slider-label">Y</div>
          <div class="y-slider-track">
            <div class="y-slider-handle"></div>
          </div>
        </div>

        <!-- UV Square -->
        <div class="uv-container">
          <canvas id="uv-canvas" width="256" height="256" role="img" aria-label="UV color plane" tabindex="0"></canvas>
          <div class="uv-cursor"></div>
        </div>

        <!-- Info Panel -->
        <div class="info-panel">
          <div class="info-swatch"></div>
          <dl class="info-values">
            <dt>Y</dt><dd id="val-y">128</dd>
            <dt>U</dt><dd id="val-u">128</dd>
            <dt>V</dt><dd id="val-v">128</dd>
          </dl>
          <hr class="info-divider">
          <dl class="info-values">
            <dt>R</dt><dd id="val-r">128</dd>
            <dt>G</dt><dd id="val-g">128</dd>
            <dt>B</dt><dd id="val-b">128</dd>
          </dl>
          <div class="info-hex" id="val-hex">#808080</div>
        </div>
      </div>
    </section>

    <!-- Image Decomposition -->
    <section class="decompose">
      <div class="upload-zone" role="button" aria-label="Upload an image" tabindex="0">
        <p>Drop an image here or click to upload</p>
        <input type="file" accept="image/*" hidden>
      </div>
      <div class="channels" hidden>
        <div class="channel">
          <canvas id="channel-y"></canvas>
          <span class="channel-label">Y (Luma)</span>
        </div>
        <div class="channel">
          <canvas id="channel-u"></canvas>
          <span class="channel-label">U (Cb)</span>
        </div>
        <div class="channel">
          <canvas id="channel-v"></canvas>
          <span class="channel-label">V (Cr)</span>
        </div>
      </div>
    </section>

    <footer>
      <a href="https://en.wikipedia.org/wiki/YUV" target="_blank" rel="noopener">yuv.de</a>
    </footer>
  </main>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create style.css with base layout and typography**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --text-color: #111;
  --text-secondary: #555;
  --border-color: #ddd;
  --bg-color: #ffffff;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
}

main {
  max-width: 820px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  gap: 64px;
}

/* Hero */
.hero {
  text-align: center;
}

.hero h1 {
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 400;
}

/* Picker layout */
.picker-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

/* Y Slider */
.y-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48px;
  flex-shrink: 0;
  gap: 8px;
  cursor: pointer;
}

.y-slider-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.y-slider-track {
  flex: 1;
  width: 36px;
  background: linear-gradient(to bottom, #fff, #000);
  border-radius: 8px;
  position: relative;
  border: 1px solid var(--border-color);
}

.y-slider-handle {
  position: absolute;
  left: -4px;
  right: -4px;
  height: 6px;
  background: white;
  border: 2px solid #888;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* UV Square */
.uv-container {
  position: relative;
  aspect-ratio: 1;
  flex: 1;
  max-width: 500px;
  cursor: crosshair;
}

.uv-container canvas {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 8px;
  image-rendering: pixelated;
}

.uv-cursor {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Info Panel */
.info-panel {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-swatch {
  width: 100%;
  height: 64px;
  border-radius: 8px;
  background: #808080;
  border: 1px solid var(--border-color);
}

.info-values {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 0.85rem;
}

.info-values dt {
  font-weight: 600;
  color: var(--text-secondary);
}

.info-values dd {
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.info-divider {
  border: none;
  border-top: 1px solid var(--border-color);
}

.info-hex {
  font-size: 1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  text-align: center;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  color: var(--text-secondary);
}

.upload-zone:hover,
.upload-zone.dragover {
  border-color: var(--text-color);
}

/* Channels */
.channels {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.channel {
  flex: 1;
  text-align: center;
}

.channel canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.channel-label {
  display: block;
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Footer */
footer {
  text-align: center;
  font-size: 0.85rem;
}

footer a {
  color: var(--text-secondary);
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .picker-row {
    flex-direction: column;
    align-items: center;
  }

  .y-slider {
    flex-direction: row;
    width: 100%;
    height: 48px;
  }

  .y-slider-track {
    flex: 1;
    height: 36px;
    width: auto;
    background: linear-gradient(to right, #000, #fff);
  }

  .y-slider-handle {
    left: 50%;
    right: auto;
    top: -4px;
    bottom: -4px;
    width: 6px;
    height: auto;
    transform: translateX(-50%);
  }

  .uv-container {
    width: 100%;
    max-width: 100%;
  }

  .info-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .info-swatch {
    width: 64px;
    height: 64px;
  }

  .channels {
    flex-direction: column;
  }
}
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in a browser. You should see:
- "YUV" heading centered at top
- A row with: gray Y slider track (left), empty canvas area (center), info panel with placeholder values (right)
- A dashed upload zone below
- A footer link at the bottom
- On window resize below 768px, layout should stack vertically

- [ ] **Step 4: Commit**

```bash
git init
git add index.html style.css
git commit -m "feat: add HTML structure and base CSS layout"
```

---

### Task 2: YUV↔RGB Conversion + UV Plane Rendering

**Files:**
- Create: `app.js`

- [ ] **Step 1: Create app.js with YUV math and UV plane renderer**

```javascript
// --- YUV ↔ RGB Conversion (BT.601) ---

function yuvToRgb(y, u, v) {
  const r = y + 1.402 * (v - 128);
  const g = y - 0.344 * (u - 128) - 0.714 * (v - 128);
  const b = y + 1.772 * (u - 128);
  return [
    Math.max(0, Math.min(255, Math.round(r))),
    Math.max(0, Math.min(255, Math.round(g))),
    Math.max(0, Math.min(255, Math.round(b))),
  ];
}

function rgbToYuv(r, g, b) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const u = -0.169 * r - 0.331 * g + 0.500 * b + 128;
  const v = 0.500 * r - 0.419 * g - 0.081 * b + 128;
  return [Math.round(y), Math.round(u), Math.round(v)];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

// --- State ---

const state = {
  y: 128,
  u: 128,
  v: 128,
};

// --- UV Plane ---

const uvCanvas = document.getElementById('uv-canvas');
const uvCtx = uvCanvas.getContext('2d');
const uvImageData = uvCtx.createImageData(256, 256);

function renderUvPlane() {
  const data = uvImageData.data;
  const yVal = state.y;

  for (let row = 0; row < 256; row++) {
    for (let col = 0; col < 256; col++) {
      const idx = (row * 256 + col) * 4;
      const [r, g, b] = yuvToRgb(yVal, col, row);
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  uvCtx.putImageData(uvImageData, 0, 0);
}

// --- Initial render ---

renderUvPlane();
```

- [ ] **Step 2: Verify in browser**

Open `index.html`. The UV square canvas should now display a colorful 256×256 grid of UV colors at Y=128, scaled up to fill the container. The colors should look like a characteristic UV chrominance plane — greens/yellows at top-left, blues at bottom-left, reds at top-right, magentas at bottom-right.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add YUV↔RGB conversion and UV plane rendering"
```

---

### Task 3: Y Slider Interaction

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add Y slider drag logic to app.js**

Append to `app.js`:

```javascript
// --- Y Slider ---

const ySlider = document.querySelector('.y-slider');
const ySliderTrack = document.querySelector('.y-slider-track');
const ySliderHandle = document.querySelector('.y-slider-handle');

function setYFromPointer(clientY) {
  const rect = ySliderTrack.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
  // Top = 255 (white), Bottom = 0 (black)
  state.y = Math.round(255 * (1 - ratio));
  ySlider.setAttribute('aria-valuenow', state.y);
  updateAll();
}

function updateYSliderHandle() {
  const ratio = 1 - state.y / 255;
  ySliderHandle.style.top = (ratio * 100) + '%';
}

let yDragging = false;

ySliderTrack.addEventListener('pointerdown', (e) => {
  yDragging = true;
  ySliderTrack.setPointerCapture(e.pointerId);
  setYFromPointer(e.clientY);
});

ySliderTrack.addEventListener('pointermove', (e) => {
  if (!yDragging) return;
  setYFromPointer(e.clientY);
});

ySliderTrack.addEventListener('pointerup', () => {
  yDragging = false;
});

// Keyboard support for Y slider
ySlider.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
    state.y = Math.min(255, state.y + (e.shiftKey ? 10 : 1));
    updateAll();
    e.preventDefault();
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
    state.y = Math.max(0, state.y - (e.shiftKey ? 10 : 1));
    updateAll();
    e.preventDefault();
  }
});
```

- [ ] **Step 2: Add the updateAll function and info panel update**

Add before the Y Slider section in `app.js`:

```javascript
// --- Update all UI ---

function updateAll() {
  renderUvPlane();
  updateYSliderHandle();
  updateUvCursor();
  updateInfoPanel();
  updateBackground();
}

function updateInfoPanel() {
  const [r, g, b] = yuvToRgb(state.y, state.u, state.v);

  document.getElementById('val-y').textContent = state.y;
  document.getElementById('val-u').textContent = state.u;
  document.getElementById('val-v').textContent = state.v;
  document.getElementById('val-r').textContent = r;
  document.getElementById('val-g').textContent = g;
  document.getElementById('val-b').textContent = b;
  document.getElementById('val-hex').textContent = rgbToHex(r, g, b);

  document.querySelector('.info-swatch').style.backgroundColor = rgbToHex(r, g, b);
}

function updateUvCursor() {
  const cursor = document.querySelector('.uv-cursor');
  const uPercent = (state.u / 255) * 100;
  const vPercent = (state.v / 255) * 100;
  cursor.style.left = uPercent + '%';
  cursor.style.top = vPercent + '%';
}

function updateBackground() {
  const [r, g, b] = yuvToRgb(state.y, state.u, state.v);
  document.body.style.backgroundColor = rgbToHex(r, g, b);

  // Switch text color based on Y value
  const isDark = state.y <= 128;
  document.documentElement.style.setProperty('--text-color', isDark ? '#f0f0f0' : '#111');
  document.documentElement.style.setProperty('--text-secondary', isDark ? '#ccc' : '#555');
  document.documentElement.style.setProperty('--border-color', isDark ? 'rgba(255,255,255,0.25)' : '#ddd');
}
```

- [ ] **Step 3: Replace the initial render call**

Replace `renderUvPlane();` at the bottom of `app.js` with:

```javascript
// --- Initial render ---

updateAll();
```

- [ ] **Step 4: Verify in browser**

Drag the Y slider up and down. The UV plane should re-render — brighter at Y=255, darker at Y=0. The handle should follow the pointer. The info panel should update Y value. The page background should change color. Text should flip between light and dark.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add Y slider interaction with dynamic background"
```

---

### Task 4: UV Plane Interaction

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add UV plane pointer and keyboard interaction**

Append to `app.js`:

```javascript
// --- UV Plane Interaction ---

const uvContainer = document.querySelector('.uv-container');

function setUvFromPointer(clientX, clientY) {
  const rect = uvCanvas.getBoundingClientRect();
  const u = Math.max(0, Math.min(255, Math.round(((clientX - rect.left) / rect.width) * 255)));
  const v = Math.max(0, Math.min(255, Math.round(((clientY - rect.top) / rect.height) * 255)));
  state.u = u;
  state.v = v;
  updateAll();
}

let uvDragging = false;

uvContainer.addEventListener('pointerdown', (e) => {
  uvDragging = true;
  uvContainer.setPointerCapture(e.pointerId);
  setUvFromPointer(e.clientX, e.clientY);
});

uvContainer.addEventListener('pointermove', (e) => {
  if (!uvDragging) return;
  setUvFromPointer(e.clientX, e.clientY);
});

uvContainer.addEventListener('pointerup', () => {
  uvDragging = false;
});

// Keyboard support for UV plane
uvCanvas.addEventListener('keydown', (e) => {
  const step = e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowRight') {
    state.u = Math.min(255, state.u + step);
  } else if (e.key === 'ArrowLeft') {
    state.u = Math.max(0, state.u - step);
  } else if (e.key === 'ArrowDown') {
    state.v = Math.min(255, state.v + step);
  } else if (e.key === 'ArrowUp') {
    state.v = Math.max(0, state.v - step);
  } else {
    return;
  }
  e.preventDefault();
  updateAll();
});
```

- [ ] **Step 2: Verify in browser**

Click anywhere on the UV plane — the cursor circle should move to that position, the info panel should update U/V/R/G/B/hex values, the page background should change, and the swatch should update. Dragging across the plane should update continuously. Arrow keys on the focused canvas should move the cursor.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add UV plane click and drag interaction"
```

---

### Task 5: Image Upload + Decomposition

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Add image upload and channel decomposition logic**

Append to `app.js`:

```javascript
// --- Image Decomposition ---

const uploadZone = document.querySelector('.upload-zone');
const fileInput = uploadZone.querySelector('input[type="file"]');
const channelsContainer = document.querySelector('.channels');
const channelYCanvas = document.getElementById('channel-y');
const channelUCanvas = document.getElementById('channel-u');
const channelVCanvas = document.getElementById('channel-v');

uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    loadImage(e.target.files[0]);
  }
});

// Drag & drop
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    loadImage(e.dataTransfer.files[0]);
  }
});

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => decomposeImage(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function decomposeImage(img) {
  // Cap dimensions at 1200px
  const maxDim = 1200;
  let w = img.width;
  let h = img.height;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  // Draw to offscreen canvas to read pixels
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(img, 0, 0, w, h);
  const srcData = offCtx.getImageData(0, 0, w, h).data;

  // Prepare channel canvases
  [channelYCanvas, channelUCanvas, channelVCanvas].forEach(c => {
    c.width = w;
    c.height = h;
  });

  const yCtx = channelYCanvas.getContext('2d');
  const uCtx = channelUCanvas.getContext('2d');
  const vCtx = channelVCanvas.getContext('2d');

  const yImg = yCtx.createImageData(w, h);
  const uImg = uCtx.createImageData(w, h);
  const vImg = vCtx.createImageData(w, h);

  for (let i = 0; i < srcData.length; i += 4) {
    const r = srcData[i];
    const g = srcData[i + 1];
    const b = srcData[i + 2];
    const [yVal, uVal, vVal] = rgbToYuv(r, g, b);

    // Y channel: grayscale
    yImg.data[i] = yVal;
    yImg.data[i + 1] = yVal;
    yImg.data[i + 2] = yVal;
    yImg.data[i + 3] = 255;

    // U channel: false color (blue at 0, yellow at 255)
    uImg.data[i] = Math.round((uVal / 255) * 255);           // R: 0→255
    uImg.data[i + 1] = Math.round((uVal / 255) * 255);       // G: 0→255
    uImg.data[i + 2] = Math.round(((255 - uVal) / 255) * 255); // B: 255→0
    uImg.data[i + 3] = 255;

    // V channel: false color (cyan at 0, red at 255)
    vImg.data[i] = Math.round((vVal / 255) * 255);             // R: 0→255
    vImg.data[i + 1] = Math.round(((255 - vVal) / 255) * 255); // G: 255→0
    vImg.data[i + 2] = Math.round(((255 - vVal) / 255) * 255); // B: 255→0
    vImg.data[i + 3] = 255;
  }

  yCtx.putImageData(yImg, 0, 0);
  uCtx.putImageData(uImg, 0, 0);
  vCtx.putImageData(vImg, 0, 0);

  channelsContainer.hidden = false;
}
```

- [ ] **Step 2: Verify in browser**

1. Click the upload zone — file dialog should open
2. Select any image (photo works best)
3. Three canvases should appear below:
   - Y: grayscale brightness
   - U: blue↔yellow false color
   - V: cyan↔red false color
4. Drag & drop an image onto the zone — same result
5. Try a large image (>1200px) — should be downscaled without lag

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add image upload and YUV channel decomposition"
```

---

### Task 6: Visual Polish + Responsive Fixes

**Files:**
- Modify: `style.css`
- Modify: `index.html`

- [ ] **Step 1: Add smooth transitions and polish to style.css**

Add to the end of `style.css`:

```css
/* Smooth transitions for dynamic theming */
.info-swatch,
.info-values dt,
.info-values dd,
.info-hex,
.subtitle,
footer a,
.upload-zone,
.channel-label,
.y-slider-label {
  transition: color 0.3s ease, border-color 0.3s ease, background-color 0.3s ease;
}

.y-slider-track {
  transition: border-color 0.3s ease;
}

/* Subtle shadow on UV container */
.uv-container canvas {
  box-shadow: 0 2px 16px rgba(0,0,0,0.1);
}

/* Info swatch shadow */
.info-swatch {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: background-color 0.15s ease, box-shadow 0.3s ease;
}

/* Upload zone file name display */
.upload-zone p {
  transition: color 0.3s ease;
}

/* Channel canvas shadow */
.channel canvas {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* Focus styles */
.y-slider:focus-visible,
.uv-container canvas:focus-visible,
.upload-zone:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
  border-radius: 4px;
}
```

- [ ] **Step 2: Verify in browser**

- Transitions should be smooth when changing colors (no jarring flashes)
- Subtle shadows visible on UV plane, swatch, and channel canvases
- Focus outlines visible when tabbing through interactive elements
- Test on narrow viewport (≤768px) — all elements should stack, Y slider becomes horizontal

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add visual polish, transitions, and focus styles"
```

---

### Task 7: Final Integration Test

**Files:** None (verification only)

- [ ] **Step 1: Full feature walkthrough**

Open `index.html` in a browser and verify:

1. **Hero** displays "YUV" heading + subtitle
2. **Y slider:** drag up → UV plane brightens, drag down → darkens. Handle tracks pointer.
3. **UV plane:** click/drag moves cursor, background color follows, info panel updates all values
4. **Background:** smooth transition to selected color, text flips white/dark correctly
5. **Image upload:** click opens dialog, drop works, three channels display correctly
6. **Responsive:** resize to mobile width — layout stacks, Y slider goes horizontal
7. **Keyboard:** Tab to Y slider → arrows change Y. Tab to UV canvas → arrows move cursor. Tab to upload → Enter opens dialog.
8. **Edge cases:** Y=0 (all black plane), Y=255 (bright plane), corners of UV plane

- [ ] **Step 2: Commit final state**

```bash
git add -A
git commit -m "feat: complete yuv.de interactive onepager"
```
