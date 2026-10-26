// Eine kleine Zeichen-Bibliothek für die Werkzeuge in tools/ (nicht Teil des Spiels).
//
// Ein Picture speichert Farben als Kommazahlen 0…1 mit "vormultiplizierter" Transparenz
// (Rot, Grün, Blau sind schon mit Alpha multipliziert). Das macht Überblenden und
// Weichzeichnen einfach und sauber.

import { readPNG, writePNG } from './png.mjs';

export class Picture {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height * 4);
  }

  static load(file) {
    const png = readPNG(file);
    const picture = new Picture(png.width, png.height);
    for (let i = 0; i < png.width * png.height; i++) {
      const a = png.data[i * 4 + 3] / 255;
      picture.data[i * 4] = (png.data[i * 4] / 255) * a;
      picture.data[i * 4 + 1] = (png.data[i * 4 + 1] / 255) * a;
      picture.data[i * 4 + 2] = (png.data[i * 4 + 2] / 255) * a;
      picture.data[i * 4 + 3] = a;
    }
    return picture;
  }

  save(file) {
    const bytes = Buffer.alloc(this.width * this.height * 4);
    for (let i = 0; i < this.width * this.height; i++) {
      const a = this.data[i * 4 + 3];
      const unpremultiply = a > 0 ? 1 / a : 0;
      for (let c = 0; c < 3; c++) bytes[i * 4 + c] = toByte(this.data[i * 4 + c] * unpremultiply);
      bytes[i * 4 + 3] = toByte(a);
    }
    writePNG(file, { width: this.width, height: this.height, data: bytes });
  }

  clone() {
    const copy = new Picture(this.width, this.height);
    copy.data.set(this.data);
    return copy;
  }

  // Farbe (nicht vormultipliziert) als [r, g, b, a] an einer ganzzahligen Stelle
  colorAt(x, y) {
    const o = (y * this.width + x) * 4;
    const a = this.data[o + 3];
    return a > 0 ? [this.data[o] / a, this.data[o + 1] / a, this.data[o + 2] / a, a] : [0, 0, 0, 0];
  }

  // Legt eine Farbe [r, g, b, a] mit Deckkraft "coverage" über ein Pixel.
  blend(x, y, color, coverage = 1) {
    const alpha = color[3] * coverage;
    if (alpha <= 0) return;
    const o = (y * this.width + x) * 4;
    const keep = 1 - alpha;
    this.data[o] = color[0] * alpha + this.data[o] * keep;
    this.data[o + 1] = color[1] * alpha + this.data[o + 1] * keep;
    this.data[o + 2] = color[2] * alpha + this.data[o + 2] * keep;
    this.data[o + 3] = alpha + this.data[o + 3] * keep;
  }

  // Bilineare Abtastung an einer Kommastelle (vormultipliziert, außerhalb = transparent)
  sample(x, y, out) {
    x -= 0.5;
    y -= 0.5;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    out[0] = out[1] = out[2] = out[3] = 0;
    for (let j = 0; j < 2; j++) {
      const yy = y0 + j;
      if (yy < 0 || yy >= this.height) continue;
      const wy = j ? fy : 1 - fy;
      for (let i = 0; i < 2; i++) {
        const xx = x0 + i;
        if (xx < 0 || xx >= this.width) continue;
        const w = wy * (i ? fx : 1 - fx);
        const o = (yy * this.width + xx) * 4;
        out[0] += this.data[o] * w;
        out[1] += this.data[o + 1] * w;
        out[2] += this.data[o + 2] * w;
        out[3] += this.data[o + 3] * w;
      }
    }
    return out;
  }
}

const toByte = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));

// Farbe aus Hex-Text: '#1b1245' oder mit Deckkraft hex('#1b1245', 0.5)
export function hex(text, alpha = 1) {
  const n = parseInt(text.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, alpha];
}

export function mix(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

// Gefülltes Vieleck mit weichen (geglätteten) Kanten. points = [[x, y], …]
export function fillPolygon(picture, points, color, opacity = 1) {
  const SUB = 5; // Unterzeilen pro Pixelzeile für glatte Kanten
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of points) {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const top = Math.max(0, Math.floor(minY));
  const bottom = Math.min(picture.height - 1, Math.ceil(maxY));
  const coverage = new Float32Array(picture.width + 1);

  for (let y = top; y <= bottom; y++) {
    coverage.fill(0);
    let from = Infinity, to = -Infinity;
    for (let s = 0; s < SUB; s++) {
      const sy = y + (s + 0.5) / SUB;
      const crossings = [];
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [ax, ay] = points[i];
        const [bx, by] = points[j];
        if (ay > sy !== by > sy) crossings.push(ax + ((sy - ay) / (by - ay)) * (bx - ax));
      }
      crossings.sort((a, b) => a - b);
      for (let k = 0; k + 1 < crossings.length; k += 2) {
        const xa = Math.max(0, crossings[k]);
        const xb = Math.min(picture.width, crossings[k + 1]);
        if (xb <= xa) continue;
        const ia = Math.floor(xa), ib = Math.floor(xb);
        if (ia === ib) coverage[ia] += (xb - xa) / SUB;
        else {
          coverage[ia] += (ia + 1 - xa) / SUB;
          for (let x = ia + 1; x < ib; x++) coverage[x] += 1 / SUB;
          coverage[ib] += (xb - ib) / SUB;
        }
        from = Math.min(from, ia);
        to = Math.max(to, ib);
      }
    }
    for (let x = Math.max(0, from); x <= Math.min(to, picture.width - 1); x++) {
      if (coverage[x] > 0) picture.blend(x, y, color, Math.min(1, coverage[x]) * opacity);
    }
  }
}

export function fillCircle(picture, cx, cy, radius, color, opacity = 1) {
  const steps = Math.max(12, Math.ceil(radius * 3));
  const points = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
  }
  fillPolygon(picture, points, color, opacity);
}

// Dicke Linie, die sich von Breite w0 auf w1 verjüngt (z. B. Äste), mit runden Enden
export function stroke(picture, x0, y0, x1, y1, w0, w1, color) {
  const length = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / length, ny = (x1 - x0) / length;
  fillPolygon(picture, [
    [x0 + nx * w0 / 2, y0 + ny * w0 / 2],
    [x1 + nx * w1 / 2, y1 + ny * w1 / 2],
    [x1 - nx * w1 / 2, y1 - ny * w1 / 2],
    [x0 - nx * w0 / 2, y0 - ny * w0 / 2],
  ], color);
  fillCircle(picture, x0, y0, w0 / 2, color);
  fillCircle(picture, x1, y1, w1 / 2, color);
}

// Weichzeichnen: Kastenfilter, dreimal hintereinander ≈ Gauß. wrap = links/rechts nahtlos
export function blur(picture, radiusX, radiusY = radiusX, { wrap = false, passes = 3 } = {}) {
  for (let p = 0; p < passes; p++) {
    if (radiusX > 0) boxBlur(picture, radiusX, true, wrap);
    if (radiusY > 0) boxBlur(picture, radiusY, false, false);
  }
}

function boxBlur(picture, radius, horizontal, wrap) {
  const { width, height, data } = picture;
  const length = horizontal ? width : height;
  const lines = horizontal ? height : width;
  const r = Math.round(radius);
  const buffer = new Float32Array(length * 4);
  const size = 2 * r + 1;
  for (let line = 0; line < lines; line++) {
    const index = (i) => (horizontal ? line * width + i : i * width + line) * 4;
    const read = (i) => {
      if (wrap) i = ((i % length) + length) % length;
      else i = Math.max(0, Math.min(length - 1, i));
      return index(i);
    };
    const sum = [0, 0, 0, 0];
    for (let i = -r; i <= r; i++) {
      const o = read(i);
      for (let c = 0; c < 4; c++) sum[c] += data[o + c];
    }
    for (let i = 0; i < length; i++) {
      for (let c = 0; c < 4; c++) buffer[i * 4 + c] = sum[c] / size;
      const add = read(i + r + 1), remove = read(i - r);
      for (let c = 0; c < 4; c++) sum[c] += data[add + c] - data[remove + c];
    }
    for (let i = 0; i < length; i++) {
      const o = index(i);
      for (let c = 0; c < 4; c++) data[o + c] = buffer[i * 4 + c];
    }
  }
}

// Legt ein Bild über ein anderes (ganzzahlige Position, optional mit Deckkraft)
export function drawPicture(target, source, dx = 0, dy = 0, opacity = 1) {
  for (let y = 0; y < source.height; y++) {
    const ty = y + dy;
    if (ty < 0 || ty >= target.height) continue;
    for (let x = 0; x < source.width; x++) {
      const tx = x + dx;
      if (tx < 0 || tx >= target.width) continue;
      const s = (y * source.width + x) * 4;
      const a = source.data[s + 3] * opacity;
      if (a <= 0) continue;
      const t = (ty * target.width + tx) * 4;
      const keep = 1 - a;
      for (let c = 0; c < 3; c++) target.data[t + c] = source.data[s + c] * opacity + target.data[t + c] * keep;
      target.data[t + 3] = a + target.data[t + 3] * keep;
    }
  }
}

// Verzerrt ein Dreieck aus "source" (Ecken s0, s1, s2) auf ein Dreieck im Ziel (d0, d1, d2).
// Viele solcher Dreiecke ergeben ein verformbares Gitter – so bewegen wir z. B. Josephs Beine.
// tint = Farbfaktoren [r, g, b], z. B. zum Abdunkeln des hinteren Beins.
export function warpTriangle(target, source, s0, s1, s2, d0, d1, d2, tint = null) {
  let [a, b, c] = [d0, d1, d2];
  let [sa, sb, sc] = [s0, s1, s2];
  let area = edge(a, b, c);
  if (Math.abs(area) < 1e-9) return;
  if (area < 0) {
    [b, c] = [c, b];
    [sb, sc] = [sc, sb];
    area = -area;
  }
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(target.width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(target.height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  const color = [0, 0, 0, 0];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const p = [x + 0.5, y + 0.5];
      const w0 = edge(b, c, p), w1 = edge(c, a, p), w2 = edge(a, b, p);
      if (!inside(w0, b, c) || !inside(w1, c, a) || !inside(w2, a, b)) continue;
      const l0 = w0 / area, l1 = w1 / area, l2 = w2 / area;
      source.sample(sa[0] * l0 + sb[0] * l1 + sc[0] * l2, sa[1] * l0 + sb[1] * l1 + sc[1] * l2, color);
      if (color[3] <= 0) continue;
      const o = (y * target.width + x) * 4;
      const keep = 1 - color[3];
      for (let k = 0; k < 3; k++) target.data[o + k] = color[k] * (tint ? tint[k] : 1) + target.data[o + k] * keep;
      target.data[o + 3] = color[3] + target.data[o + 3] * keep;
    }
  }
}

function edge(a, b, p) {
  return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
}

// "Oben-links-Regel": Pixel genau auf einer gemeinsamen Kante gehören nur zu EINEM Dreieck.
function inside(w, from, to) {
  if (w > 0) return true;
  if (w < 0) return false;
  const dy = to[1] - from[1], dx = to[0] - from[0];
  return dy > 0 || (dy === 0 && dx > 0);
}

// Pseudo-Zufallszahlen mit Startwert: gleiche Zahl → jedes Mal dasselbe Ergebnis.
export function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
