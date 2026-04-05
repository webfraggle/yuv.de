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

// --- Initial render ---

updateAll();
