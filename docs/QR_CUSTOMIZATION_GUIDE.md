# QR Code Customization Guide — Adding the "Woww" Factor

Fwshk already ships a branded, glitch-styled QR code that stands out from the crowd. This guide walks you through every layer of the system so you can push it further — add your own logo, swap colour palettes, create gradient fills, reshape the dots, tweak the retro glitch overlay, redesign the branded download frame, and more.

> **File map** — all QR-related code lives in two files:
>
> | File | What it controls |
> |---|---|
> | `frontend/src/Main.js` | `QR_THEME` config, `drawGlitchMask()`, `NeoQRCode` component, `createBrandedQRCanvas()` |
> | `frontend/src/App.css` | `.qr-code-frame`, `.qr-corner-label`, `.neo-qr-canvas`, and related styles |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Change the Dot & Corner Style](#2-change-the-dot--corner-style)
3. [Apply Gradient Fills to Dots](#3-apply-gradient-fills-to-dots)
4. [Embed a Centre Logo / Image](#4-embed-a-centre-logo--image)
5. [Customise the Glitch Mask Overlay](#5-customise-the-glitch-mask-overlay)
6. [Create an Entirely New Visual Mask](#6-create-an-entirely-new-visual-mask)
7. [Modify the Branded Download Frame](#7-modify-the-branded-download-frame)
8. [Add Colour Theme Presets](#8-add-colour-theme-presets)
9. [Animate the QR Code on Screen](#9-animate-the-qr-code-on-screen)
10. [Tips for Keeping QR Codes Scannable](#10-tips-for-keeping-qr-codes-scannable)

---

## 1. Architecture Overview

The QR image goes through three stages:

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────────────┐
│  qr-code-    │      │  drawGlitchMask  │      │  createBrandedQR     │
│  styling     │─────▶│  (canvas post-   │─────▶│  Canvas (download/   │
│  (raw QR)    │      │   processing)    │      │   copy frame)        │
└──────────────┘      └─────────────────┘      └──────────────────────┘
```

1. **`qr-code-styling`** renders the raw QR canvas using `QR_THEME` options (dot shape, corner shape, colours, error correction).
2. **`drawGlitchMask()`** paints a glitch pattern on a temporary canvas, then composites it *through* the QR dot shapes — giving each dot the glitch texture instead of a flat colour.
3. **`createBrandedQRCanvas()`** wraps the final QR in a branded frame with corner labels (FWSHK, SCAN, QR, ■■■) for the downloaded/copied PNG.

Every technique below targets one (or more) of these stages.

---

## 2. Change the Dot & Corner Style

The `QR_THEME` object at the top of `Main.js` controls the `qr-code-styling` library options:

```js
// frontend/src/Main.js
const QR_THEME = {
  dotsOptions: {
    type: 'classy-rounded',   // ← dot shape
    color: '#1a1a1a',
  },
  cornersSquareOptions: { color: '#ff6600', type: 'extra-rounded' },
  cornersDotOptions:    { color: '#1a1a1a', type: 'dot' },
  backgroundOptions:    { color: '#00000000' },  // transparent
};
```

### Available dot types

| `dotsOptions.type` | Look |
|---|---|
| `'square'` | Sharp pixel grid |
| `'dots'` | Perfect circles |
| `'rounded'` | Rounded squares |
| `'classy'` | Elegant connected pattern |
| `'classy-rounded'` | Classy with rounded ends *(current)* |
| `'extra-rounded'` | Very round squares |

### Available corner-square types

`'square'` · `'dot'` · `'extra-rounded'`

### Available corner-dot types

`'square'` · `'dot'`

### Example — Circular dots with square corners

```js
const QR_THEME = {
  dotsOptions:          { type: 'dots',    color: '#1a1a1a' },
  cornersSquareOptions: { type: 'square',  color: '#ff6600' },
  cornersDotOptions:    { type: 'square',  color: '#1a1a1a' },
  backgroundOptions:    { color: '#00000000' },
};
```

---

## 3. Apply Gradient Fills to Dots

`qr-code-styling` supports linear and radial gradients on every element. Replace a flat `color` with a `gradient` object:

```js
const QR_THEME = {
  dotsOptions: {
    type: 'classy-rounded',
    gradient: {
      type: 'linear',           // 'linear' or 'radial'
      rotation: Math.PI / 4,    // 45° diagonal
      colorStops: [
        { offset: 0, color: '#ff6600' },
        { offset: 1, color: '#ffe500' },
      ],
    },
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
    gradient: {
      type: 'radial',
      colorStops: [
        { offset: 0, color: '#ff6600' },
        { offset: 1, color: '#cc5200' },
      ],
    },
  },
  cornersDotOptions: { color: '#1a1a1a', type: 'dot' },
  backgroundOptions: { color: '#00000000' },
};
```

> **Tip:** Gradients survive the glitch-mask stage because the mask uses `destination-in` compositing — it only affects shape, not fill.

---

## 4. Embed a Centre Logo / Image

`qr-code-styling` natively supports a centre image. Add an `image` and `imageOptions` field to the config inside `NeoQRCode`:

```js
// frontend/src/Main.js  —  inside the NeoQRCode useEffect
const config = {
  width: size,
  height: size,
  type: 'canvas',
  data: value,
  image: '/logo192.png',              // ← path to your logo (public folder)
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,                         // quiet zone around logo
    imageSize: 0.35,                   // logo takes up 35% of QR area
    hideBackgroundDots: true,          // remove dots behind the logo
  },
  qrOptions: { errorCorrectionLevel: 'H' },  // 'H' is essential for logos
  dotsOptions:          QR_THEME.dotsOptions,
  cornersSquareOptions: QR_THEME.cornersSquareOptions,
  cornersDotOptions:    QR_THEME.cornersDotOptions,
  backgroundOptions:    QR_THEME.backgroundOptions,
};
```

### Key points

- **Error correction level `'H'`** (already set) allows up to ~30 % of modules to be obscured. Keep `imageSize` at or below `0.4` to stay scannable.
- Place logo files in `frontend/public/` so they are served at the root path.
- Use a transparent-background PNG for best results.

---

## 5. Customise the Glitch Mask Overlay

The `drawGlitchMask(ctx, w, h)` function in `Main.js` builds a retro-glitch texture that gets composited *into* the QR dot shapes. Here is how each layer works and how to tweak it:

### Layer breakdown

| Layer | Lines | What it does | How to tweak |
|---|---|---|---|
| **Base fill** | `ctx.fillStyle = '#1a1a1a'` | Dark background | Change colour for a different base tone |
| **Glitch bars** | `barCount = 14` loop | Horizontal displaced colour stripes | Adjust `barCount`, `barH` multiplier, or `glitchColors` array |
| **Channel-split blocks** | `splits` array | Chromatic-aberration rectangles | Edit the fractional `[x, y, w, h]` positions or change RGBA colours |
| **Static noise** | LCG loop (`step = 4`) | Pixel noise scatter | Change `step` (larger = coarser), threshold `82` (lower = more noise) |
| **Scanlines** | `y += 4` loop | CRT scanline overlay | Change gap (`4`) or opacity (`0.18`) |
| **Displaced blocks** | `blocks` array | Large colour patches | Add/remove entries or change colours |
| **Finder-pattern cutouts** | `fp = w * 0.28` | Keeps the three QR corners solid for scanning | Always keep this — it ensures scannability |

### Example — Softer, pastel glitch

```js
function drawGlitchMask(ctx, w, h) {
  ctx.fillStyle = '#faf3e8';  // warm cream base

  const glitchColors = ['#f4a261', '#e76f51', '#2a9d8f', '#264653', '#e9c46a'];
  const barCount = 10;
  for (let i = 0; i < barCount; i++) {
    const y = (((i * 7 + 3) * 2654435761) >>> 0) % h;
    const barH = 2 + ((i * 13 + 5) % 5) * (h * 0.008);
    ctx.fillStyle = glitchColors[i % glitchColors.length];
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, y, w, barH);
  }
  ctx.globalAlpha = 1;

  // Keep the rest (noise, scanlines, finder-pattern cutouts) as-is …
  // …
  const fp = w * 0.28;
  ctx.fillStyle = '#faf3e8';
  ctx.fillRect(0, 0, fp, fp);
  ctx.fillRect(w - fp, 0, fp, fp);
  ctx.fillRect(0, h - fp, fp, fp);
}
```

---

## 6. Create an Entirely New Visual Mask

You are not limited to glitch effects. Replace `drawGlitchMask` with any canvas painting to give dots a totally new texture:

### Example A — Geometric pattern fill

```js
function drawGeometricMask(ctx, w, h) {
  // Dark base
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  // Diagonal stripes
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 3;
  for (let i = -h; i < w + h; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + h, h);
    ctx.stroke();
  }

  // Preserve QR finder-pattern corners
  const fp = w * 0.28;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, fp, fp);
  ctx.fillRect(w - fp, 0, fp, fp);
  ctx.fillRect(0, h - fp, fp, fp);
}
```

Then swap the call in `NeoQRCode`:

```js
// Change this line in the NeoQRCode useEffect:
drawGlitchMask(patternCtx, w, h);
// To:
drawGeometricMask(patternCtx, w, h);
```

### Example B — Radial gradient fill

```js
function drawRadialMask(ctx, w, h) {
  const cx = w / 2, cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.7);
  grad.addColorStop(0, '#ff6600');
  grad.addColorStop(0.5, '#cc5200');
  grad.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const fp = w * 0.28;
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, fp, fp);
  ctx.fillRect(w - fp, 0, fp, fp);
  ctx.fillRect(0, h - fp, fp, fp);
}
```

### How it works (compositing)

The key line in `NeoQRCode` is:

```js
patternCtx.globalCompositeOperation = 'destination-in';
patternCtx.drawImage(qrCanvas, 0, 0);
```

This uses the QR dot shapes as a *stencil* — only the pixels that overlap a QR dot survive. So whatever you paint on `patternCanvas` becomes the *fill texture* of every dot. This is how you can make the dots look like anything: wood grain, marble, neon stripes, or your brand pattern.

---

## 7. Modify the Branded Download Frame

`createBrandedQRCanvas()` builds the PNG that users download or copy. It wraps the QR in a bordered frame with corner labels:

```
  FWSHK ──────────────── SCAN
  ┌─────────────────────────┐
  │                         │
  │       (QR Code)         │
  │                         │
  └─────────────────────────┘
  ■■■ ────────────────────── QR
```

### Add a footer banner

After the existing label code in `createBrandedQRCanvas`, you can draw a text banner below the frame:

```js
// Inside createBrandedQRCanvas, after the corner-label section:
const bannerY = fy + frameH + 20;
const bannerH = 28;
ctx.fillStyle = '#ff6600';
ctx.fillRect(fx, bannerY, frameW, bannerH);
ctx.fillStyle = '#1a1a1a';
ctx.font = '800 11px "Syne", sans-serif';
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';
ctx.fillText('SCAN ME — FWSHK.VERCEL.APP', fx + frameW / 2, bannerY + bannerH / 2);
```

### Change the background colour

Replace `ctx.fillStyle = '#ffffff'` at the top of the function:

```js
ctx.fillStyle = '#1a1a1a';   // dark background
ctx.fillRect(0, 0, canvasW, canvasH);
```

And update the frame fill to match:

```js
ctx.fillStyle = '#FFFDF7';   // keep the inner frame light for contrast
```

### Add a border pattern

```js
// Draw a dashed border around the outer edge
ctx.setLineDash([8, 4]);
ctx.strokeStyle = '#ff6600';
ctx.lineWidth = 2;
ctx.strokeRect(4, 4, canvasW - 8, canvasH - 8);
ctx.setLineDash([]);
```

---

## 8. Add Colour Theme Presets

Let users pick a QR theme. Define multiple presets and wire them to a selector:

```js
const QR_THEMES = {
  default: {
    dotsOptions:          { type: 'classy-rounded', color: '#1a1a1a' },
    cornersSquareOptions: { color: '#ff6600', type: 'extra-rounded' },
    cornersDotOptions:    { color: '#1a1a1a', type: 'dot' },
    backgroundOptions:    { color: '#00000000' },
    glitchColors:         ['#ff6600', '#ffe500', '#cc5200', '#ffb347'],
  },
  midnight: {
    dotsOptions:          { type: 'dots', color: '#e0e0ff' },
    cornersSquareOptions: { color: '#7c4dff', type: 'extra-rounded' },
    cornersDotOptions:    { color: '#e0e0ff', type: 'dot' },
    backgroundOptions:    { color: '#00000000' },
    glitchColors:         ['#7c4dff', '#536dfe', '#448aff', '#40c4ff'],
  },
  forest: {
    dotsOptions:          { type: 'rounded', color: '#1b4332' },
    cornersSquareOptions: { color: '#2d6a4f', type: 'square' },
    cornersDotOptions:    { color: '#1b4332', type: 'square' },
    backgroundOptions:    { color: '#00000000' },
    glitchColors:         ['#40916c', '#52b788', '#74c69d', '#95d5b2'],
  },
};
```

Then add a state variable and pass the selected theme to `NeoQRCode` and `drawGlitchMask`:

```jsx
const [qrTheme, setQrTheme] = useState('default');

// In the form:
<select value={qrTheme} onChange={e => setQrTheme(e.target.value)}>
  <option value="default">Default (Orange)</option>
  <option value="midnight">Midnight (Purple)</option>
  <option value="forest">Forest (Green)</option>
</select>
```

---

## 9. Animate the QR Code on Screen

For an eye-catching on-screen effect, you can animate the glitch mask by re-rendering it on every frame. This does **not** affect the downloaded PNG — it only adds motion on screen.

Add the following inside `NeoQRCode` after the initial render:

```js
useEffect(() => {
  if (!containerRef.current) return;
  const canvas = containerRef.current.querySelector('canvas');
  if (!canvas) return;

  let frame;
  const animate = () => {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Re-draw the mask with time-based variation
    const temp = document.createElement('canvas');
    temp.width = w; temp.height = h;
    const tCtx = temp.getContext('2d');
    drawGlitchMask(tCtx, w, h, Date.now());  // pass timestamp for variation
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(temp, 0, 0);

    frame = requestAnimationFrame(animate);
  };

  const delay = setTimeout(() => { frame = requestAnimationFrame(animate); }, 400);
  return () => { clearTimeout(delay); cancelAnimationFrame(frame); };
}, [value]);
```

To make the mask time-aware, add a `seed` parameter to `drawGlitchMask`:

```js
function drawGlitchMask(ctx, w, h, seed = 0) {
  // Use (seed / 200) to shift the glitch bar positions over time
  // …
}
```

> **Performance note:** `requestAnimationFrame` is efficient, but if you see frame drops on mobile, throttle to every 3rd or 4th frame.

---

## 10. Tips for Keeping QR Codes Scannable

No matter how creative you get, the QR code must still scan. Follow these rules:

| Rule | Why |
|---|---|
| **Keep error correction at `'H'`** | Allows ~30 % of modules to be obscured — essential when adding logos or heavy styling |
| **Never paint over finder patterns** | The three large squares in the corners are how scanners orient the code. The `fp = w * 0.28` cutout in every mask preserves them |
| **Maintain contrast ratio ≥ 3:1** | Dots must be clearly distinguishable from the background. Test with a phone camera after every change |
| **Centre logos ≤ 40 % of QR area** | `imageSize: 0.35` is safe; going above 0.4 risks scan failures |
| **Test on multiple scanners** | iOS Camera, Google Lens, and dedicated QR apps all use different algorithms. Test on at least two |
| **Avoid inverting colours** | Dark-on-light is the universal standard. Light-on-dark works on some scanners but not all |

### Quick scan test

After any change, open the app locally (`npm start`), generate a QR code, and immediately scan it with your phone. If it fails:

1. Check that finder-pattern corners are clear (adjust `fp` fraction).
2. Reduce overlay opacity or logo size.
3. Increase the QR `size` (e.g. from `220` to `300`).

---

## Quick-Start Checklist

- [ ] Pick a dot shape from Section 2
- [ ] Try a gradient fill from Section 3
- [ ] Drop your brand logo in `public/` and enable it per Section 4
- [ ] Tweak `glitchColors` in `drawGlitchMask` (Section 5) or build a new mask (Section 6)
- [ ] Customise the download frame (Section 7)
- [ ] Scan-test on your phone
- [ ] Ship it 🚀
