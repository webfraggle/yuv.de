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

// --- Initial render ---

updateAll();
