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
  y: 180,
  u: 84,
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

// Digital (0-255) to analog YUV ranges
// Y: 0-1, U: -0.436 to +0.436, V: -0.615 to +0.615
function toAnalogY(y) {
  return y / 255;
}

function toAnalogU(u) {
  return ((u / 255) - 0.5) * 0.872; // maps 0-255 to -0.436..+0.436
}

function toAnalogV(v) {
  return ((v / 255) - 0.5) * 1.230; // maps 0-255 to -0.615..+0.615
}

function updateInfoPanel() {
  const [r, g, b] = yuvToRgb(state.y, state.u, state.v);

  // Analog YUV values
  document.getElementById('val-y-analog').textContent = toAnalogY(state.y).toFixed(3);
  document.getElementById('val-u-analog').textContent = toAnalogU(state.u).toFixed(3);
  document.getElementById('val-v-analog').textContent = toAnalogV(state.v).toFixed(3);

  document.getElementById('val-r').textContent = r;
  document.getElementById('val-g').textContent = g;
  document.getElementById('val-b').textContent = b;
  document.getElementById('val-hex').textContent = rgbToHex(r, g, b).toUpperCase();

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
  const hex = rgbToHex(r, g, b);
  document.body.style.backgroundColor = hex;

  // Colored glow on UV plane
  const uvContainer = document.querySelector('.uv-container');
  uvContainer.style.boxShadow = `0 8px 40px ${hex}40, 0 2px 12px ${hex}20`;

  // Colored glow on swatch
  document.querySelector('.info-swatch').style.boxShadow =
    `0 4px 20px ${hex}50, 0 2px 8px ${hex}30`;

  // Switch text color based on perceived brightness
  const isDark = state.y <= 128;
  document.documentElement.style.setProperty('--text-color', isDark ? '#f0f0f0' : '#1a1a1a');
  document.documentElement.style.setProperty('--text-secondary', isDark ? 'rgba(255,255,255,0.65)' : '#6b6b6b');
  document.documentElement.style.setProperty('--text-tertiary', isDark ? 'rgba(255,255,255,0.4)' : '#999');
  document.documentElement.style.setProperty('--border-color', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)');
  document.documentElement.style.setProperty('--surface', isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)');
  document.documentElement.style.setProperty('--surface-border', isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)');
}

// --- Y Slider ---

const ySlider = document.querySelector('.y-slider');
const ySliderTrack = document.querySelector('.y-slider-track');
const ySliderHandle = document.querySelector('.y-slider-handle');

function setYFromPointer(clientY) {
  const rect = ySliderTrack.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
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
  const maxDim = 1200;
  let w = img.width;
  let h = img.height;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(img, 0, 0, w, h);
  const srcData = offCtx.getImageData(0, 0, w, h).data;

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

    // Y: grayscale
    yImg.data[i] = yVal;
    yImg.data[i + 1] = yVal;
    yImg.data[i + 2] = yVal;
    yImg.data[i + 3] = 255;

    // U: blue↔yellow false color
    uImg.data[i] = Math.round((uVal / 255) * 255);
    uImg.data[i + 1] = Math.round((uVal / 255) * 255);
    uImg.data[i + 2] = Math.round(((255 - uVal) / 255) * 255);
    uImg.data[i + 3] = 255;

    // V: cyan↔red false color
    vImg.data[i] = Math.round((vVal / 255) * 255);
    vImg.data[i + 1] = Math.round(((255 - vVal) / 255) * 255);
    vImg.data[i + 2] = Math.round(((255 - vVal) / 255) * 255);
    vImg.data[i + 3] = 255;
  }

  yCtx.putImageData(yImg, 0, 0);
  uCtx.putImageData(uImg, 0, 0);
  vCtx.putImageData(vImg, 0, 0);

  channelsContainer.hidden = false;

  // Animate channels in
  channelsContainer.style.opacity = '0';
  channelsContainer.style.transform = 'translateY(16px)';
  requestAnimationFrame(() => {
    channelsContainer.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    channelsContainer.style.opacity = '1';
    channelsContainer.style.transform = 'translateY(0)';
  });
}

// --- Initial render ---

updateAll();
