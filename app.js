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
