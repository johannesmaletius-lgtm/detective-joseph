// Hilfsfunktionen für Text auf der Zeichenfläche: Schriften, Zeilenumbruch, Text mit Umriss.

import { forTouch } from '../core/touch.js';

// Schriften. Die erste Schrift in der Liste, die auf dem Rechner vorhanden ist, wird benutzt.
const SANS = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';

export const FONTS = {
  speech: `bold 22px ${SANS}`,   // Sprechtexte
  label: `bold 17px ${SANS}`,    // Name unter dem Mauszeiger
  hint: `17px ${SANS}`,          // Tutorial-Hinweise
  hintTitle: `bold 13px ${SANS}`,
  small: `15px ${SANS}`,
  title: `bold 64px ${SANS}`,
  subtitle: `26px ${SANS}`,
  hand: `26px ${HAND}`,          // Handschrift: Brief, Notizbuch
  handSmall: `20px ${HAND}`,
  handBig: `54px ${HAND}`,
};

export const COLORS = {
  joseph: '#f6e7c1',      // Josephs Sprechtext
  speaker: '#a6f0b6',     // Stimme aus dem Lautsprecher
  outline: 'rgba(16, 8, 3, 0.95)',
  paper: '#efe2c0',
  ink: '#33261a',
  brass: '#d9a441',
};

// Bricht Text so um, dass keine Zeile breiter als maxWidth ist. "\n" erzwingt eine neue Zeile.
export function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(forTouch(text)).split('\n')) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

// Text mit dunklem Umriss – gut lesbar auf jedem Hintergrund
export function outlinedText(ctx, text, x, y, color, outline = 5) {
  ctx.lineJoin = 'round';
  ctx.lineWidth = outline;
  ctx.strokeStyle = COLORS.outline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Ein Blatt Papier (für Brief, Notizbuch, Karten)
export function drawPaper(ctx, x, y, width, height, angle = 0) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  gradient.addColorStop(0, '#f4e9cc');
  gradient.addColorStop(1, '#e4d3a8');
  ctx.fillStyle = gradient;
  roundedRect(ctx, -width / 2, -height / 2, width, height, 6);
  ctx.fill();
  ctx.restore();
}
