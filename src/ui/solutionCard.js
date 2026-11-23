import { roundedRect, wrapText } from './text.js';

// Karte „Lösungsweg“ (Taste H): nummerierte Schritte auf einem Blatt, bei Bedarf auf mehrere Seiten verteilt.
//   for (const page of solutionPages(steps)) await overlay.showCard({ draw: (ctx) => drawSolutionPage(ctx, …) });

const SANS = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const FONT = `19px ${SANS}`;
const SHEET = { x: 150, y: 50, w: 980, h: 620 };
const TEXT_X = SHEET.x + 92, TEXT_W = SHEET.w - 92 - 60;
const TOP = SHEET.y + 118, BOTTOM = SHEET.y + SHEET.h - 60;
const LINE = 27, GAP = 12;

// Verteilt die Schritte auf Seiten: [[{ n, lines }], …]
export function solutionPages(steps) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = FONT;
  const pages = [[]];
  let y = TOP;
  steps.forEach((step, i) => {
    const lines = wrapText(ctx, step, TEXT_W);
    const height = lines.length * LINE + GAP;
    if (y + height > BOTTOM && pages.at(-1).length) {
      pages.push([]);
      y = TOP;
    }
    pages.at(-1).push({ n: i + 1, lines });
    y += height;
  });
  return pages;
}

export function drawSolutionPage(ctx, { door, page, index, count }) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  const paper = ctx.createLinearGradient(0, SHEET.y, 0, SHEET.y + SHEET.h);
  paper.addColorStop(0, '#f3ead2');
  paper.addColorStop(1, '#e3d4ad');
  ctx.fillStyle = paper;
  roundedRect(ctx, SHEET.x, SHEET.y, SHEET.w, SHEET.h, 14);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#7a2a18';
  ctx.font = `bold 15px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('LÖSUNGSWEG', SHEET.x + 60, SHEET.y + 52);
  ctx.fillStyle = '#2b2118';
  ctx.font = `bold 32px ${SANS}`;
  ctx.fillText(`Wagen ${door}`, SHEET.x + 60, SHEET.y + 90);
  ctx.strokeStyle = 'rgba(122, 42, 24, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(SHEET.x + 60, SHEET.y + 104);
  ctx.lineTo(SHEET.x + SHEET.w - 60, SHEET.y + 104);
  ctx.stroke();

  let y = TOP + 20;
  for (const { n, lines } of page) {
    ctx.fillStyle = '#7a2a18';
    ctx.font = `bold 19px ${SANS}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${n}.`, TEXT_X - 14, y);
    ctx.fillStyle = '#2b2118';
    ctx.font = FONT;
    ctx.textAlign = 'left';
    for (const line of lines) {
      ctx.fillText(line, TEXT_X, y);
      y += LINE;
    }
    y += GAP;
  }

  ctx.fillStyle = 'rgba(43, 33, 24, 0.6)';
  ctx.font = `15px ${SANS}`;
  ctx.textAlign = 'center';
  const more = index < count - 1;
  const footer = (count > 1 ? `Seite ${index + 1} von ${count} · ` : '') + (more ? 'Klicken: weiter' : 'Klicken: zurück ins Spiel');
  ctx.fillText(footer, SHEET.x + SHEET.w / 2, SHEET.y + SHEET.h - 26);
  ctx.restore();
}
