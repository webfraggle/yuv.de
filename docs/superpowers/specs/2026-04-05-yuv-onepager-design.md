# yuv.de — Interactive YUV Color Space OnePager

## Overview

A single-page, client-side-only website for yuv.de that interactively explains the YUV color space. Users can explore colors via a UV plane and Y slider, and decompose uploaded images into their Y, U, and V channels.

**Language:** English  
**Style:** Minimal text, interaction-first  
**Technology:** Vanilla HTML + CSS + JavaScript with Canvas API  
**Hosting:** Static files on a simple web server, no build step

---

## Architecture

### File Structure

```
yuv.de/
├── index.html          # Single entry point, all markup
├── style.css           # All styles
├── app.js              # Application logic, Canvas rendering, YUV math
└── favicon.ico         # Optional
```

Three files, no dependencies, no build tools. The browser loads `index.html` which references `style.css` and `app.js`.

### YUV ↔ RGB Conversion

Uses the BT.601 standard (the most common YUV definition):

```
RGB → YUV:
  Y =  0.299 * R + 0.587 * G + 0.114 * B
  U = -0.169 * R - 0.331 * G + 0.500 * B + 128
  V =  0.500 * R - 0.419 * G - 0.081 * B + 128

YUV → RGB:
  R = Y + 1.402 * (V - 128)
  G = Y - 0.344 * (U - 128) - 0.714 * (V - 128)
  B = Y + 1.772 * (U - 128)
```

Y, U, V values are in the 0–255 range (8-bit). Results are clamped to 0–255.

---

## Page Sections

### 1. Hero

- Large "YUV" heading with wide letter-spacing, modern sans-serif font (system font stack or Inter via Google Fonts)
- One-line subtitle: "Explore the YUV Color Space"
- Minimal, no paragraph text

### 2. Interactive Color Picker

Layout (left to right):

1. **Y Slider** (left) — Vertical slider, 48px wide, height matches the UV square. Gradient from white (top, Y=255) to black (bottom, Y=0). A horizontal handle indicates the current Y value. Draggable.

2. **UV Square** (center) — A square Canvas element with `aspect-ratio: 1` enforced via CSS. Takes available horizontal space, max ~500px on desktop. Renders all possible UV combinations at the current Y value. A circular crosshair cursor shows the current selection. Draggable. The UV plane re-renders when Y changes.

3. **Info Panel** (right) — ~160px wide. Displays:
   - A color swatch (filled rectangle) of the selected color
   - YUV values (Y, U, V as 0–255 integers)
   - RGB values (R, G, B as 0–255 integers)
   - Hex code (#RRGGBB)

**Interaction:** Clicking or dragging on the UV square or Y slider updates all three (UV square re-renders for new Y, info panel updates, page background transitions).

### 3. Image Decomposition

- **Upload zone:** A dashed-border drop zone with text "Drop an image here or click to upload". Supports drag & drop and click-to-browse (hidden `<input type="file">`).
- **Channel display:** Three Canvas elements side by side, each showing one channel:
  - **Y (Luma):** Grayscale image of the brightness channel
  - **U (Cb):** False-color visualization of the blue-difference channel (blue↔yellow gradient mapped to 0–255)
  - **V (Cr):** False-color visualization of the red-difference channel (cyan↔red gradient mapped to 0–255)
- Each canvas is labeled below with the channel name
- All three maintain the original image's aspect ratio
- On mobile, the three canvases stack vertically

### 4. Footer

- Minimal: just "yuv.de" and optionally a link to the BT.601 spec or Wikipedia

---

## Visual Design

### Starting State
- Light mode: white background (#ffffff), dark text
- Clean, modern aesthetic with generous whitespace
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif`

### Dynamic Background
- The entire page `<body>` background color transitions to the currently selected YUV color
- CSS `transition: background-color 0.3s ease` for smooth changes
- Text color automatically switches between white and black based on the Y value:
  - Y > 128 → dark text (#111)
  - Y ≤ 128 → light text (#f0f0f0)
- Borders, input outlines, and other UI elements also adapt their contrast

### Responsive Behavior
- **Desktop (>768px):** Y slider + UV square + info panel in a row. Three image channels in a row.
- **Mobile (≤768px):** Y slider above UV square (horizontal slider). Info panel below. Image channels stack vertically.

---

## Canvas Rendering Details

### UV Plane Rendering
- For each pixel (x, y) in the canvas:
  - Map x → U (0–255), y → V (0–255)
  - Use current Y value from slider
  - Convert (Y, U, V) → (R, G, B)
  - If RGB values are out of gamut (any channel <0 or >255 after clamping), render as a slightly darker/desaturated version to indicate invalid colors
- Use `ImageData` and `putImageData()` for efficient pixel-level rendering
- Re-render when Y changes (debounced to ~30fps during drag)

### Y Slider Rendering
- Simple linear gradient from white to black — can be a CSS gradient on a `<div>`, no canvas needed
- The handle is an absolutely positioned element, draggable

### Image Decomposition Rendering
- Read uploaded image via `FileReader` → `Image` → draw to offscreen canvas → `getImageData()`
- For each pixel, compute Y, U, V from the RGB values
- Render three separate canvases:
  - **Y canvas:** Each pixel gets (Y, Y, Y) — pure grayscale
  - **U canvas:** False-color mapping — U=0 maps to one color, U=255 to another, creating a visually meaningful representation rather than plain grayscale
  - **V canvas:** Same false-color approach for the V channel
- Max image dimension capped at 1200px (downscaled if larger) to prevent performance issues

---

## Performance Considerations

- UV plane is 256×256 logical pixels (65K pixel calculations per render) — fast enough for real-time
- Canvas is CSS-scaled up to display size from 256×256 internal resolution for crisp rendering with `image-rendering: pixelated`
- Image decomposition runs once on upload, not continuously — no performance concern
- No Web Workers needed at this scale

---

## Accessibility

- Keyboard support: Arrow keys to move the crosshair on UV plane and Y slider
- ARIA labels on interactive elements
- High contrast text ensured by the dynamic Y-based text color switching
- Upload zone is keyboard-accessible (Enter/Space to trigger file dialog)
