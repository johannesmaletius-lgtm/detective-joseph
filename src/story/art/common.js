// Zeichenhilfen für die gezeichneten Blätter und Nahansichten ab Wagen 4.

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
