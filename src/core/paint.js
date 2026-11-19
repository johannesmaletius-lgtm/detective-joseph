// Bilder, die das Spiel selbst malt – statt sie aus einer Datei zu laden.
//
// Die Wagen 2 bis 4 und ihre Gegenstände sind (noch) nicht gezeichnet, sondern werden beim Laden mit
// Code gemalt: Hintergründe, Möbel, Inventar-Bilder. Jedes Bild entsteht nur einmal und wird danach
// wie ein geladenes Bild benutzt (ctx.drawImage funktioniert mit einer Zeichenfläche genauso).
//
// Eigene Bilder einbauen: In der Szenen-Datei statt `paint` einfach `src: 'assets/…/bild.png'` angeben
// (bzw. bei Gegenständen `image` statt `paint`, siehe src/story/items.js).
//
//   const picture = paintCanvas(1280, 720, (ctx) => { … });   // doppelte Auflösung für scharfe Bildschirme
//   const icon = paintIcon((ctx) => { … });                    // 128 × 128 mit dunklem Umriss und Schatten

export const OUTLINE = '#1a0f08';

export function paintCanvas(width, height, draw, { scale = 2 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  draw(ctx, width, height);
  return canvas;
}

// Inventar-Bild im Stil der übrigen Gegenstände: Form, gleichmäßiger dunkler Umriss, weicher Schatten
export function paintIcon(draw, size = 128) {
  const scale = 2;
  const layer = paintCanvas(size, size, draw, { scale });
  const silhouette = (color) => {
    const canvas = document.createElement('canvas');
    canvas.width = layer.width;
    canvas.height = layer.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(layer, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  };
  const dark = silhouette(OUTLINE);
  const result = document.createElement('canvas');
  result.width = layer.width;
  result.height = layer.height;
  const ctx = result.getContext('2d');
  const radius = 4 * scale;
  // Schatten
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.shadowColor = 'rgba(0, 0, 0, 1)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetX = 2 * scale;
  ctx.shadowOffsetY = 4 * scale;
  ctx.drawImage(silhouette('#000'), 0, 0);
  ctx.restore();
  // Umriss: die dunkle Form ringsum leicht versetzt
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    ctx.drawImage(dark, Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.drawImage(dark, 0, 0);
  ctx.drawImage(layer, 0, 0);
  return result;
}

// ---------------------------------------------------------------- kleine Malhelfer

// Vieleck füllen (und optional mit dunklem Strich umranden)
export function poly(ctx, points, fill, { stroke = OUTLINE, width = 3 } = {}) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && width > 0) {
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function line(ctx, points, color = OUTLINE, width = 3) {
  ctx.beginPath();
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function circle(ctx, x, y, radius, fill, { stroke = OUTLINE, width = 3 } = {}) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && width > 0) {
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

export function ellipse(ctx, x, y, rx, ry, fill, { stroke = OUTLINE, width = 3, rotation = 0 } = {}) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rotation, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && width > 0) {
    ctx.lineWidth = width;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

// Senkrechter Farbverlauf
export function vertical(ctx, top, bottom, stops) {
  const gradient = ctx.createLinearGradient(0, top, 0, bottom);
  stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
  return gradient;
}

export function horizontal(ctx, left, right, stops) {
  const gradient = ctx.createLinearGradient(left, 0, right, 0);
  stops.forEach((color, i) => gradient.addColorStop(i / (stops.length - 1), color));
  return gradient;
}

// Weicher runder Schein (z. B. Lampenlicht), additiv
export function glow(ctx, x, y, radius, color, alpha, blend = 'screen') {
  if (alpha <= 0 || radius <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${color}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

// Schmutz, Flecken, Abnutzung: viele kleine halbdurchsichtige Tupfer in einem Bereich (mit festem Zufall)
export function grime(ctx, clip, { count = 60, color = '40, 20, 8', alpha = 0.12, size = [3, 18], seed = 1 } = {}) {
  const rand = seeded(seed);
  ctx.save();
  if (clip) {
    ctx.beginPath();
    clip.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.clip();
  }
  const xs = clip ? clip.map((p) => p[0]) : [0, 1280];
  const ys = clip ? clip.map((p) => p[1]) : [0, 720];
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0);
    const r = size[0] + rand() * (size[1] - size[0]);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(${color}, ${alpha * (0.4 + rand() * 0.6)})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

// Pseudo-Zufall mit Startwert: gleiche Zahl → jedes Mal dasselbe Bild
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
