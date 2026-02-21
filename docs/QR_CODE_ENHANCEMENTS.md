# Woww-Factor QR Code Enhancements for Fwshk

A practical guide to adding unique, never-before-seen features to the Fwshk QR code generator. Every section includes a description of the effect, why it stands out, and ready-to-implement code that plugs into the existing `NeoQRCode` component and `qr-code-styling` setup.

> **Codebase context** – The current QR pipeline lives in `frontend/src/Main.js`:
>
> | Piece | Role |
> |---|---|
> | `QR_THEME` | Dot / corner / background styling passed to `qr-code-styling` |
> | `NeoQRCode` | React component that renders and post-processes the QR canvas |
> | `drawGlitchMask` | Canvas post-effect that applies brand-colored glitch bars |
> | `createBrandedQRCanvas` | Builds the downloadable PNG with a branded frame and corner labels |

---

## Table of Contents

1. [Animated Scan-Line Reveal](#1-animated-scan-line-reveal)
2. [Embedded Center Logo](#2-embedded-center-logo)
3. [Gradient-Filled QR Dots](#3-gradient-filled-qr-dots)
4. [Interactive Mouse-Tilt (3-D Parallax)](#4-interactive-mouse-tilt-3-d-parallax)
5. [Holographic / Iridescent Shimmer](#5-holographic--iridescent-shimmer)
6. [Shape-Masked QR Codes (Circle, Hexagon, Heart)](#6-shape-masked-qr-codes-circle-hexagon-heart)
7. [Particle Disintegration on Hover](#7-particle-disintegration-on-hover)
8. [Adaptive Light / Dark Mode QR](#8-adaptive-light--dark-mode-qr)
9. [Micro-Animation Dot Entrance](#9-micro-animation-dot-entrance)
10. [Audio-Reactive QR Code](#10-audio-reactive-qr-code)

---

## 1. Animated Scan-Line Reveal

### What It Does

When the QR code first appears, a glowing scan-line sweeps top-to-bottom revealing the code row by row — like a barcode scanner brought the image to life.

### Why It's Unique

Most QR generators pop the code in statically. A cinematic reveal gives the impression the code is being *assembled on screen* in real time.

### Implementation

Add a CSS animation to the `.qr-code-frame` container and a pseudo-element scan-line.

**CSS (`App.css`)**

```css
/* Scan-line reveal ------------------------------------------------ */
.qr-code-frame {
  position: relative;
  overflow: hidden;
}

.qr-code-frame::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent var(--reveal, 0%),
    #1a1a1a var(--reveal, 0%),
    #1a1a1a 100%
  );
  animation: qr-reveal 1.2s ease-out forwards;
  pointer-events: none;
  z-index: 2;
}

/* Glowing scan-line at the reveal edge */
.qr-code-frame::before {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: #ff6600;
  box-shadow: 0 0 12px 4px rgba(255, 102, 0, 0.7);
  z-index: 3;
  animation: qr-scanline 1.2s ease-out forwards;
  pointer-events: none;
}

@keyframes qr-reveal {
  from { --reveal: 0%; }
  to   { --reveal: 100%; }
}

@keyframes qr-scanline {
  from { top: 0; opacity: 1; }
  to   { top: 100%; opacity: 0; }
}
```

> **Tip:** Register `--reveal` as a custom property with `@property` for smooth interpolation in browsers that support it:
>
> ```css
> @property --reveal {
>   syntax: '<percentage>';
>   inherits: false;
>   initial-value: 0%;
> }
> ```

---

## 2. Embedded Center Logo

### What It Does

Places the Fwshk logo (or any SVG/image) right in the center of the QR code. Because `qr-code-styling` is configured with error correction level **H** (30 % redundancy), up to ~30 % of the QR area can be obscured and the code still scans perfectly.

### Why It's Unique

Branded QR codes are rare in URL-shortener tools. A centered logo makes every generated code feel premium and on-brand.

### Implementation

Pass the `image` option to `qr-code-styling` inside `NeoQRCode`:

```jsx
// In NeoQRCode useEffect, add to the config object:
const config = {
  // ...existing options
  image: '/logo192.png',          // any public asset or imported image
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,                    // px gap between logo and dots
    imageSize: 0.35,              // logo covers 35% of the QR
    hideBackgroundDots: true,     // clear dots behind the logo
  },
};
```

That's it — `qr-code-styling` handles compositing automatically.

### Fine-Tuning

| Parameter | Effect |
|---|---|
| `imageSize` | `0.2` – `0.4` is the safe range at error correction **H** |
| `hideBackgroundDots` | Set `false` for a see-through watermark look |
| `margin` | Increase for a cleaner border around the logo |

---

## 3. Gradient-Filled QR Dots

### What It Does

Replaces the flat `#1a1a1a` dot color with a diagonal gradient that transitions through the Fwshk brand palette (orange → dark → yellow).

### Why It's Unique

Gradient QR codes are almost never seen because the naive approach (CSS gradient on a wrapper) doesn't work — it colors the *container*, not the dots. This technique paints the gradient *into* the dot pixels via canvas compositing.

### Implementation

Add a post-processing step in `NeoQRCode`, right after `drawGlitchMask`:

```js
// After the existing patternCtx compositing block, add:

function applyDotGradient(ctx, w, h) {
  // Create a gradient canvas the same size as the QR
  const gradCanvas = document.createElement('canvas');
  gradCanvas.width = w;
  gradCanvas.height = h;
  const gCtx = gradCanvas.getContext('2d');

  const grad = gCtx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#ff6600');   // Fwshk orange
  grad.addColorStop(0.5, '#1a1a1a'); // dark core
  grad.addColorStop(1, '#ffe500');   // accent yellow
  gCtx.fillStyle = grad;
  gCtx.fillRect(0, 0, w, h);

  // Use 'source-in' so the gradient only shows where QR dots exist
  gCtx.globalCompositeOperation = 'destination-in';
  gCtx.drawImage(ctx.canvas, 0, 0);

  // Paint gradient-filled dots back onto the QR canvas
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(gradCanvas, 0, 0);
}
```

Call `applyDotGradient(qrCtx, w, h)` after the existing glitch-mask compositing inside the `setTimeout` callback.

---

## 4. Interactive Mouse-Tilt (3-D Parallax)

### What It Does

The QR card subtly rotates in 3-D space as the user moves their mouse over it, creating a tactile "floating card" feel.

### Why It's Unique

Most QR codes are static images. Adding a CSS perspective transform makes the code feel like a physical object the user can inspect, setting Fwshk apart from every other URL shortener.

### Implementation

**React wrapper (add around the `<NeoQRCode>` call in `Main.js`)**

```jsx
function TiltCard({ children }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 … +0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform =
      `perspective(600px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(600px) rotateY(0deg) rotateX(0deg)';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.15s ease-out', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
```

Then wrap the QR display:

```jsx
<TiltCard>
  <div className="qr-code-frame" ref={qrRef}>
    {/* ...corner labels and NeoQRCode... */}
  </div>
</TiltCard>
```

---

## 5. Holographic / Iridescent Shimmer

### What It Does

A rainbow shimmer continuously sweeps across the QR code surface, simulating a holographic foil sticker.

### Why It's Unique

Holographic effects are typically found on physical products (credit cards, security stickers). Translating this into a digital QR code is eye-catching and virtually unseen in any URL shortener.

### Implementation

**CSS (`App.css`)**

```css
.qr-code-frame {
  position: relative;
}

.qr-code-frame .holo-shimmer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 0, 0, 0.08)   0%,
    rgba(255, 154, 0, 0.08)  14%,
    rgba(208, 222, 33, 0.08) 28%,
    rgba(79, 220, 74, 0.08)  42%,
    rgba(63, 218, 216, 0.08) 57%,
    rgba(47, 107, 236, 0.08) 71%,
    rgba(139, 78, 232, 0.08) 85%,
    rgba(255, 0, 0, 0.08)    100%
  );
  background-size: 200% 200%;
  mix-blend-mode: color-dodge;
  animation: holo-sweep 3s linear infinite;
  border-radius: inherit;
}

@keyframes holo-sweep {
  0%   { background-position: 0% 0%; }
  100% { background-position: 200% 200%; }
}
```

**JSX** – add a `<div>` inside `.qr-code-frame`:

```jsx
<div className="qr-code-frame" ref={qrRef}>
  <div className="holo-shimmer" aria-hidden="true" />
  {/* ...existing corner labels and NeoQRCode... */}
</div>
```

---

## 6. Shape-Masked QR Codes (Circle, Hexagon, Heart)

### What It Does

Clips the QR code canvas into a non-rectangular shape — circle, hexagon, or heart — while keeping the finder patterns intact so the code still scans.

### Why It's Unique

QR codes are universally square. Breaking that expectation is a genuine "Woww" moment. The trick is preserving the three finder corners; everything else can be creatively masked.

### Implementation

Apply a CSS `clip-path` on the `.neo-qr-canvas` element:

```css
/* Circle */
.neo-qr-canvas.shape-circle {
  clip-path: circle(50% at 50% 50%);
}

/* Hexagon */
.neo-qr-canvas.shape-hexagon {
  clip-path: polygon(
    50% 0%, 100% 25%, 100% 75%,
    50% 100%, 0% 75%, 0% 25%
  );
}

/* Heart — uses an SVG path via url() or inline polygon approximation */
.neo-qr-canvas.shape-heart {
  clip-path: path(
    'M 110 30 C 80 -10, 0 0, 0 60 C 0 110, 50 140, 110 180 C 170 140, 220 110, 220 60 C 220 0, 140 -10, 110 30 Z'
  );
}
```

**Important:** At error correction **H**, the QR code tolerates up to 30 % data loss, so moderate clipping won't break scanning. Always test with a phone camera after clipping.

### Making It User-Selectable

Add a shape selector dropdown next to the existing QR mode toggle:

```jsx
const [qrShape, setQrShape] = useState('default');

{/* In the form */}
<select value={qrShape} onChange={(e) => setQrShape(e.target.value)}>
  <option value="default">Square</option>
  <option value="shape-circle">Circle</option>
  <option value="shape-hexagon">Hexagon</option>
  <option value="shape-heart">Heart</option>
</select>

{/* On the NeoQRCode wrapper */}
<NeoQRCode value={shortenedUrl} size={220} className={qrShape} />
```

---

## 7. Particle Disintegration on Hover

### What It Does

When the user hovers over the QR code, the dots break apart into floating particles that drift away, then reassemble when the mouse leaves.

### Why It's Unique

This is the kind of effect you'd see on an award-winning portfolio site, not on a URL shortener. It turns a utilitarian QR code into an interactive art piece.

### Implementation

This approach reads each dot pixel from the QR canvas and converts it into an individually animated `<span>`.

```jsx
function DisintegratingQR({ canvasRef }) {
  const [particles, setParticles] = useState([]);
  const [active, setActive] = useState(false);

  const buildParticles = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const imageData = ctx.getImageData(0, 0, w, h);
    const step = 4; // sample every 4px
    const dots = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        if (a > 128 && (r + g + b) < 600) { // non-white, non-transparent
          dots.push({ x, y, color: `rgb(${r},${g},${b})` });
        }
      }
    }
    setParticles(dots);
  };

  useEffect(() => { buildParticles(); }, [canvasRef]);

  return (
    <div
      className={`qr-particles ${active ? 'disintegrate' : ''}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="qr-particle"
          style={{
            '--px': `${p.x}px`,
            '--py': `${p.y}px`,
            '--dx': `${(Math.random() - 0.5) * 120}px`,
            '--dy': `${(Math.random() - 0.5) * 120}px`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
```

**CSS**

```css
.qr-particles {
  position: relative;
  width: 220px;
  height: 220px;
}

.qr-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  left: var(--px);
  top: var(--py);
  transition: transform 0.8s ease-out, opacity 0.8s ease-out;
}

.qr-particles.disintegrate .qr-particle {
  transform: translate(var(--dx), var(--dy));
  opacity: 0;
}
```

---

## 8. Adaptive Light / Dark Mode QR

### What It Does

The QR code automatically switches its color scheme based on the user's system preference (`prefers-color-scheme`), or a manual toggle. In dark mode the dots turn cream on a dark background; in light mode they invert.

### Why It's Unique

QR codes are almost always black-on-white. An adaptive QR that matches the user's device theme shows attention to detail and feels native.

### Implementation

```jsx
function useColorScheme() {
  const [scheme, setScheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return scheme;
}
```

Then conditionally pick themes:

```js
const QR_THEMES = {
  dark: {
    dotsOptions:           { type: 'classy-rounded', color: '#FFFDF7' },
    cornersSquareOptions:  { color: '#ff6600', type: 'extra-rounded' },
    cornersDotOptions:     { color: '#FFFDF7', type: 'dot' },
    backgroundOptions:     { color: '#1a1a1a' },
  },
  light: {
    dotsOptions:           { type: 'classy-rounded', color: '#1a1a1a' },
    cornersSquareOptions:  { color: '#ff6600', type: 'extra-rounded' },
    cornersDotOptions:     { color: '#1a1a1a', type: 'dot' },
    backgroundOptions:     { color: '#FFFDF7' },
  },
};
```

Use `scheme` in `NeoQRCode` to select the right theme:

```jsx
const scheme = useColorScheme();
const theme = QR_THEMES[scheme];
// ...pass theme values into config
```

---

## 9. Micro-Animation Dot Entrance

### What It Does

Each QR dot fades and scales in with a staggered delay, creating a wave that builds the code from the center outward (or any chosen origin).

### Why It's Unique

This gives the impression that the QR code is being *assembled dot by dot* in front of the user. It's mesmerizing and feels futuristic.

### Implementation

This technique renders dots to individual elements so each can be animated.

```jsx
function AnimatedDotsQR({ value, size = 220 }) {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Render QR to an off-screen canvas
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      type: 'canvas',
      qrOptions: { errorCorrectionLevel: 'H' },
      dotsOptions: { type: 'rounded', color: '#1a1a1a' },
      backgroundOptions: { color: '#00000000' },
    });

    const container = document.createElement('div');
    qr.append(container);

    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { width: w, height: h } = canvas;
      const imgData = ctx.getImageData(0, 0, w, h);
      const step = 4;
      const centerX = w / 2;
      const centerY = h / 2;
      const extracted = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          if (imgData.data[i + 3] > 128 && imgData.data[i] < 200) {
            const dist = Math.hypot(x - centerX, y - centerY);
            extracted.push({ x, y, dist, color: `rgb(${imgData.data[i]},${imgData.data[i+1]},${imgData.data[i+2]})` });
          }
        }
      }
      // Sort by distance so center dots appear first
      extracted.sort((a, b) => a.dist - b.dist);
      setDots(extracted);
    }, 200);
  }, [value, size]);

  return (
    <div className="animated-dots-qr" style={{ width: size, height: size, position: 'relative' }}>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: d.x,
            top: d.y,
            width: 4,
            height: 4,
            backgroundColor: d.color,
            borderRadius: '50%',
            animation: `dot-pop 0.4s ease-out ${i * 0.3}ms both`,
          }}
        />
      ))}
    </div>
  );
}
```

**CSS**

```css
@keyframes dot-pop {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 10. Audio-Reactive QR Code

### What It Does

The QR code pulses and shifts colors in response to microphone input or a playing audio track — turning the QR code into a live music visualizer.

### Why It's Unique

This is genuinely something that has never been done before in a URL shortener. The combination of QR code + audio visualization is an absolute show-stopper.

### Implementation

Use the Web Audio API to capture audio data and drive a CSS filter on the QR canvas.

```jsx
function AudioReactiveQR({ children }) {
  const wrapperRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let audioCtx, analyser, source;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyserRef.current = analyser;
        tick();
      } catch {
        // Microphone not available — degrade gracefully
      }
    }

    function tick() {
      const analyser = analyserRef.current;
      if (!analyser || !wrapperRef.current) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      // Average amplitude (0-255)
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      const norm = avg / 255; // 0 … 1

      const el = wrapperRef.current;
      el.style.filter = `hue-rotate(${norm * 60}deg) brightness(${1 + norm * 0.3})`;
      el.style.transform = `scale(${1 + norm * 0.05})`;

      rafRef.current = requestAnimationFrame(tick);
    }

    init();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ transition: 'filter 0.05s, transform 0.05s' }}>
      {children}
    </div>
  );
}
```

Wrap the QR output:

```jsx
<AudioReactiveQR>
  <div className="qr-code-frame" ref={qrRef}>
    {/* ...corner labels and NeoQRCode... */}
  </div>
</AudioReactiveQR>
```

> **Privacy note:** Always guard behind a user-initiated button (`"Enable audio mode"`) and handle the permission denial gracefully.

---

## Combining Multiple Effects

These enhancements are designed to be composable. For maximum impact, layer several together:

```
TiltCard  →  Holographic Shimmer  →  Scan-Line Reveal  →  Gradient Dots  →  Center Logo
```

Example JSX:

```jsx
<TiltCard>
  <div className="qr-code-frame" ref={qrRef}>
    <div className="holo-shimmer" aria-hidden="true" />
    <span className="qr-corner-label qr-corner-tl">FWSHK</span>
    <span className="qr-corner-label qr-corner-tr">SCAN</span>
    <NeoQRCode value={shortenedUrl} size={220} />
    <span className="qr-corner-label qr-corner-bl">&#9632;&#9632;&#9632;</span>
    <span className="qr-corner-label qr-corner-br">QR</span>
  </div>
</TiltCard>
```

---

## Quick-Reference: Integration Points

| Enhancement | Touches `Main.js` | Touches `App.css` | New Component | `qr-code-styling` Config Change |
|---|---|---|---|---|
| Scan-Line Reveal | — | ✅ | — | — |
| Center Logo | ✅ (config) | — | — | ✅ `image`, `imageOptions` |
| Gradient Dots | ✅ (post-process) | — | — | — |
| 3-D Tilt | ✅ (wrapper) | — | `TiltCard` | — |
| Holographic Shimmer | ✅ (JSX) | ✅ | — | — |
| Shape Mask | ✅ (class) | ✅ | — | — |
| Particle Disintegration | ✅ (JSX) | ✅ | `DisintegratingQR` | — |
| Adaptive Light/Dark | ✅ (theme switch) | — | — | ✅ theme colors |
| Dot Entrance Animation | ✅ (replacement) | ✅ | `AnimatedDotsQR` | — |
| Audio-Reactive | ✅ (wrapper) | — | `AudioReactiveQR` | — |

---

## Scanability Checklist

Before shipping any visual modification, always verify:

- [ ] The three finder patterns (large squares in corners) are unobstructed
- [ ] Error correction is set to **H** (`qrOptions.errorCorrectionLevel: 'H'`)
- [ ] Test scanning on iOS (Camera app), Android (Google Lens), and at least one dedicated QR reader
- [ ] If using shape masking, ensure no more than ~25 % of data modules are clipped
- [ ] The quiet zone (white border) around the QR code is at least 4 modules wide
- [ ] Contrast ratio between dots and background is at least 3:1

---

## Performance Tips

1. **Avoid re-rendering on every frame** — cache the QR canvas and only overlay effects via CSS where possible.
2. **Use `will-change`** sparingly — only on elements that are actively animating.
3. **Throttle mouse-move handlers** — `requestAnimationFrame` is sufficient for tilt effects.
4. **Lazy-load heavy effects** — wrap `DisintegratingQR` and `AudioReactiveQR` in `React.lazy()` so they only load when the user picks QR mode.
5. **Test on mobile** — some CSS effects like `backdrop-filter` and `clip-path: path()` have limited mobile support. Always provide a clean fallback.
