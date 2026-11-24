// Zeichenhilfen für die gezeichneten Blätter und Nahansichten ab Wagen 4.

import { paintCanvas } from '../../core/paint.js';

export const PRINT = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
export const SERIF = 'Georgia, "Times New Roman", serif';
export const TYPEWRITER = '"Courier New", "Courier", monospace';
export const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
export const INK = '#2b2118';
export const BLUE_INK = '#27408f';
export const RED = '#b3261e';

export function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

// Ein Blatt Papier mit Schatten, leicht gedreht. inner(ctx) zeichnet mit (0, 0) = linke obere Ecke.
export function sheet(ctx, x, y, w, h, { angle = 0, color = '#f1e5c6', shade = '#ddc999', inner } = {}) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  ctx.translate(-w / 2, -h / 2);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, shade);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.shadowColor = 'transparent';
  inner?.(ctx);
  ctx.restore();
}

// Text-Helfer: setzt Schrift, Farbe und Ausrichtung in einem
export function text(ctx, value, x, y, { font = `20px ${HAND}`, color = INK, align = 'left', baseline = 'alphabetic' } = {}) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(value, x, y);
}

// Verwischte Stelle (Kaffeefleck, Wasser, Fett)
export function smudge(ctx, x, y, w, h, color = 'rgba(120, 80, 40, 0.55)') {
  ctx.save();
  const gradient = ctx.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, Math.max(w, h) / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(120, 80, 40, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
  ctx.restore();
}

// Holzfläche als Hintergrund einer Nahansicht
export function wood(ctx, x, y, w, h, tone = [96, 56, 28]) {
  const [r, g, b] = tone;
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, `rgb(${r + 20}, ${g + 14}, ${b + 8})`);
  gradient.addColorStop(1, `rgb(${r - 20}, ${g - 14}, ${b - 8})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = `rgba(${r - 50}, ${g - 34}, ${b - 20}, 0.35)`;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < h; i += 13) {
    ctx.beginPath();
    ctx.moveTo(x, y + i);
    for (let j = 0; j <= w; j += 40) ctx.lineTo(x + j, y + i + Math.sin((j + i * 7) * 0.02) * 3);
    ctx.stroke();
  }
}

// Kleine Lampe/Glanz: weicher Lichtfleck
export function glow(ctx, x, y, r, color = '255, 220, 150', strength = 0.4) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
  gradient.addColorStop(0, `rgba(${color}, ${strength})`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// Ein Bild (z. B. ein Foto von ChatGPT) für Karten und Nahansichten. Wird beim ersten Aufruf geladen;
// bis es da ist, zeichnet drawPicture einfach nichts.
const PICTURES = {};
export function picture(src) {
  if (!PICTURES[src]) {
    const image = new Image();
    image.src = src;
    PICTURES[src] = image;
  }
  return PICTURES[src];
}

export function drawPicture(ctx, src, x, y, w, h) {
  const image = picture(src);
  if (image.complete && image.naturalWidth) ctx.drawImage(image, x, y, w, h);
}

// Ein Foto mit weißem Rand und Schatten (leicht gedreht)
export function photoCard(ctx, src, cx, cy, w, h, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#efe6d2';
  ctx.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28);
  ctx.shadowColor = 'transparent';
  drawPicture(ctx, src, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Mehrzeiliger Text mit Zeilenumbruch. Ergebnis: y unter der letzten Zeile
export function paragraph(ctx, value, x, y, width, { font = `20px ${HAND}`, color = INK, lineHeight = 26, align = 'left' } = {}) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  for (const block of String(value).split('\n')) {
    let row = '';
    for (const word of block.split(' ')) {
      const test = row ? `${row} ${word}` : word;
      if (ctx.measureText(test).width > width && row) {
        ctx.fillText(row, x, y);
        y += lineHeight;
        row = word;
      } else row = test;
    }
    ctx.fillText(row, x, y);
    y += lineHeight;
  }
  return y;
}

// Ein Blatt aus Josephs Akte (Seite n), Text in seiner Handschrift
export function drawFilePage(ctx, { x = 330, y = 40, w = 620, h = 640, angle = 0, page, title = 'AKTE J. – DIE RINGBAHN', lines = [] }) {
  sheet(ctx, x, y, w, h, {
    angle,
    color: '#efe4c4',
    shade: '#d9c79a',
    inner: (c) => {
      c.strokeStyle = 'rgba(39, 64, 143, 0.25)';
      c.lineWidth = 1;
      for (let ly = 120; ly < h - 20; ly += 30) line(c, 30, ly, w - 30, ly);
      c.strokeStyle = 'rgba(179, 38, 30, 0.45)';
      line(c, 70, 0, 70, h);
      text(c, title, w / 2, 52, { font: `bold 26px ${TYPEWRITER}`, align: 'center' });
      if (page) text(c, `Seite ${page}`, w - 40, 86, { font: `18px ${TYPEWRITER}`, align: 'right' });
      let ly = 140;
      for (const value of lines) ly = paragraph(c, value, 84, ly, w - 120, { font: `21px ${HAND}`, color: BLUE_INK, lineHeight: 30 });
    },
  });
}

// ---------------------------------------------------------------- Hilfen für aufwendigere Nahansichten

// Ein gemaltes Bild nur einmal zeichnen und danach wiederverwenden (spart Arbeit in jedem Bild).
const LAYERS = new Map();
export function cachedLayer(key, draw, w = 1280, h = 720) {
  if (!LAYERS.has(key)) LAYERS.set(key, paintCanvas(w, h, draw));
  return LAYERS.get(key);
}

// Zufallszahlen, die bei jedem Aufruf gleich ausfallen (für Maserung, Körnung, Kratzer)
export function seeded(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Rechteck mit runden Ecken als Pfad
export function rrect(ctx, x, y, w, h, r = 6) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// Feine Körnung (Staub, Papierfasern, Filmkorn)
export function grain(ctx, x, y, w, h, { seed = 7, count = 400, alpha = 0.08, light = false, size = 1.4 } = {}) {
  const random = seeded(seed);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const a = alpha * (0.4 + random() * 0.6);
    ctx.fillStyle = light ? `rgba(255, 250, 235, ${a})` : `rgba(20, 12, 6, ${a})`;
    const s = size * (0.5 + random());
    ctx.fillRect(x + random() * w, y + random() * h, s, s);
  }
  ctx.restore();
}

// Schraube mit Schlitz
export function screw(ctx, x, y, r = 5, angle = 0.6) {
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.5, x, y, r);
  g.addColorStop(0, '#f4ead0');
  g.addColorStop(0.5, '#a89a7a');
  g.addColorStop(1, '#4a4232');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30, 24, 16, 0.85)';
  ctx.lineWidth = Math.max(1, r * 0.28);
  line(ctx, x - Math.cos(angle) * r * 0.8, y - Math.sin(angle) * r * 0.8, x + Math.cos(angle) * r * 0.8, y + Math.sin(angle) * r * 0.8);
}

// Weicher Schatten unter einem Gegenstand
export function contactShadow(ctx, cx, cy, rx, ry, alpha = 0.45) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

// Aufwendige, unveränderliche Flächen nur einmal zeichnen und danach als Bild wiederverwenden.
// draw(c) zeichnet mit (0, 0) = linke obere Ecke der Fläche.
const CACHE = {};
export function cached(key, w, h, draw) {
  let entry = CACHE[key];
  if (!entry) {
    entry = document.createElement('canvas');
    entry.width = Math.ceil(w);
    entry.height = Math.ceil(h);
    draw(entry.getContext('2d'));
    CACHE[key] = entry;
  }
  return entry;
}

// Rechteck mit runden Ecken als Pfad
export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Feines Rauschen (Anteil der Fläche) über einer Fläche (Papier, Kork, Holz): viele winzige helle und dunkle Punkte
export function fineGrain(ctx, x, y, w, h, { seed = 3, count = 0.004, dark = 0.12, light = 0.08, size = 1.6 } = {}) {
  const r = seeded(seed);
  const n = Math.round(w * h * count);
  for (let i = 0; i < n; i++) {
    const on = r() < 0.5;
    ctx.fillStyle = on ? `rgba(0, 0, 0, ${dark * r()})` : `rgba(255, 255, 255, ${light * r()})`;
    const s = size * (0.5 + r());
    ctx.fillRect(x + r() * w, y + r() * h, s, s);
  }
}

// Vignette: Ränder einer Fläche abdunkeln
export function vignette(ctx, x, y, w, h, strength = 0.55) {
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, x + w / 2, y + h / 2, Math.hypot(w, h) * 0.6);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

// Holzbrett mit Maserung, Astlöchern und Lichtkante (aufwendiger als wood(), am besten mit cached())
export function plank(ctx, x, y, w, h, { tone = [120, 74, 38], seed = 5, vertical = false, knots = 1 } = {}) {
  const [r0, g0, b0] = tone;
  const r = seeded(seed);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const shift = (r() - 0.5) * 24;
  const base = vertical ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
  base.addColorStop(0, `rgb(${r0 + 18 + shift}, ${g0 + 12 + shift * 0.7}, ${b0 + 6 + shift * 0.4})`);
  base.addColorStop(0.5, `rgb(${r0 + shift}, ${g0 + shift * 0.7}, ${b0 + shift * 0.4})`);
  base.addColorStop(1, `rgb(${r0 - 16 + shift}, ${g0 - 12 + shift * 0.7}, ${b0 - 8 + shift * 0.4})`);
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  // Maserung: lange, leicht wellige Linien
  const along = vertical ? h : w, across = vertical ? w : h;
  const lines = Math.max(4, Math.round(across / 4));
  for (let i = 0; i < lines; i++) {
    const offset = (i + r() * 0.8) * (across / lines);
    const amp = 1 + r() * 3, freq = 0.004 + r() * 0.01, phase = r() * 6;
    ctx.strokeStyle = r() < 0.5 ? `rgba(40, 20, 6, ${0.08 + r() * 0.16})` : `rgba(255, 220, 170, ${0.03 + r() * 0.06})`;
    ctx.lineWidth = 0.6 + r() * 1.4;
    ctx.beginPath();
    for (let t = -10; t <= along + 10; t += 12) {
      const o = offset + Math.sin(t * freq + phase) * amp;
      if (vertical) ctx.lineTo(x + o, y + t); else ctx.lineTo(x + t, y + o);
    }
    ctx.stroke();
  }
  // Astlöcher mit Ringen
  for (let k = 0; k < knots; k++) {
    if (r() < 0.35) continue;
    const kx = vertical ? x + across * (0.3 + r() * 0.4) : x + along * (0.15 + r() * 0.7);
    const ky = vertical ? y + along * (0.15 + r() * 0.7) : y + across * (0.3 + r() * 0.4);
    const kr = 3 + r() * Math.min(7, across * 0.12);
    for (let ring = 3; ring >= 0; ring--) {
      ctx.strokeStyle = `rgba(50, 24, 8, ${0.12 + (3 - ring) * 0.08})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (vertical) ctx.ellipse(kx, ky, kr + ring * 2.2, (kr + ring * 2.2) * 2.4, 0, 0, Math.PI * 2);
      else ctx.ellipse(kx, ky, (kr + ring * 2.2) * 2.4, kr + ring * 2.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(45, 22, 8, 0.55)';
    ctx.beginPath();
    ctx.ellipse(kx, ky, vertical ? kr * 0.6 : kr * 1.3, vertical ? kr * 1.3 : kr * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Ein Nagel- oder Nietkopf
export function rivet(ctx, x, y, r = 4, metal = [150, 140, 120]) {
  const [mr, mg, mb] = metal;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, `rgb(${Math.min(255, mr + 80)}, ${Math.min(255, mg + 80)}, ${Math.min(255, mb + 80)})`);
  g.addColorStop(0.6, `rgb(${mr}, ${mg}, ${mb})`);
  g.addColorStop(1, `rgb(${mr - 70}, ${mg - 70}, ${mb - 70})`);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y + r * 0.4, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
