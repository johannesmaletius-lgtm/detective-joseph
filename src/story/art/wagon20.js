import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, drawPicture, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 20 (Packwagen): Pakete und Anhänger, Frachtliste mit Sternen-Schablone,
// Kisten über der Bodenluke (Schiebepuzzle), Miras Paket mit fünf Bändern, Kelle und Karte.

// ---------------------------------------------------------------- Pakete und Anhänger
export const PARCELS = [
  { id: 'tick', name: 'Herr Tick', clue: 'tickt leise', color: '#2f6a3a', shape: 'box' },
  { id: 'bruno', name: 'Koch Bruno', clue: 'klappert wie Löffel', color: '#a8322a', shape: 'long' },
  { id: 'ilse', name: 'Oma Ilse', clue: 'weich, Wolle', color: '#c9a24a', shape: 'soft' },
  { id: 'moll', name: 'Herr Moll', clue: 'flach, raschelt wie Papier', color: '#3a4a8a', shape: 'flat' },
  { id: 'k', name: 'Herr K.', clue: 'rund, eine Hutschachtel', color: '#6a3a6a', shape: 'round' },
  { id: 'barkeeper', name: 'Barkeeper', clue: 'gluckert', color: '#8a5a2a', shape: 'bottle' },
];
const ORDER = ['moll', 'k', 'tick', 'barkeeper', 'ilse', 'bruno'];
export const PARCEL_SLOTS = ORDER.map((id, i) => ({ id, x: 170 + i * 160, y: 360, w: 120, h: 70 }));
export function nameTokens() {
  // Ein Anhänger zu viel: Für den Heizer liegt hier kein Paket
  const names = ['ilse', 'tick', 'heizer', 'k', 'bruno', 'barkeeper', 'moll'];
  const label = (id) => PARCELS.find((p) => p.id === id)?.name ?? 'Der Heizer';
  return names.map((id, i) => ({ id, w: 130, h: 50, label: label(id), home: { x: 205 + i * 145, y: 590 } }));
}
export function checkNames(placement) {
  return placement.every((id, i) => id === PARCEL_SLOTS[i].id);
}

// Die Pakete: keine Aufschrift – nur Form und Kleinigkeiten verraten, was drin ist.
export function drawParcels(ctx) {
  wood(ctx, 120, 70, 1040, 580, [100, 60, 30]);
  glow(ctx, 640, 160, 560, '255, 210, 140', 0.14);
  PARCEL_SLOTS.forEach((slot) => {
    const p = PARCELS.find((q) => q.id === slot.id);
    const cx = slot.x + slot.w / 2, by = 330;
    // Schatten
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx + 6, by - 4, 64, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    const paper = (x, y, w, h) => {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, shade(p.color, 30));
      g.addColorStop(1, shade(p.color, -25));
      ctx.fillStyle = g;
    };
    if (p.shape === 'round') {
      // Hutschachtel: Deckel mit Rand
      paper(cx - 56, by - 110, 112, 100);
      ctx.beginPath();
      ctx.ellipse(cx, by - 30, 56, 18, 0, 0, Math.PI);
      ctx.lineTo(cx - 56, by - 92);
      ctx.ellipse(cx, by - 92, 56, 18, 0, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(p.color, 45);
      ctx.beginPath();
      ctx.ellipse(cx, by - 94, 60, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'flat') {
      // flach und dünn – ein Notenheft; an der Ecke lugt ein Blatt mit Linien hervor
      paper(cx - 60, by - 34, 120, 26);
      ctx.fillRect(cx - 60, by - 34, 120, 26);
      ctx.fillStyle = '#f2ead6';
      ctx.fillRect(cx + 34, by - 44, 30, 14);
      ctx.strokeStyle = 'rgba(40, 30, 20, 0.6)';
      ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) line(ctx, cx + 36, by - 41 + k * 3, cx + 62, by - 41 + k * 3);
    } else if (p.shape === 'long') {
      // lang und schmal – ein Besteckkasten; eine Löffelspitze schaut heraus
      paper(cx - 24, by - 150, 48, 140);
      ctx.fillRect(cx - 24, by - 150, 48, 140);
      ctx.fillStyle = '#c9ccd2';
      ctx.beginPath();
      ctx.ellipse(cx + 8, by - 158, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'soft') {
      // weich und bauchig – ein grüner Wollfaden hängt heraus
      paper(cx - 60, by - 90, 120, 80);
      ctx.beginPath();
      ctx.ellipse(cx, by - 46, 60, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3f8a3a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 46, by - 30);
      ctx.bezierCurveTo(cx + 70, by - 10, cx + 50, by + 2, cx + 74, by + 6);
      ctx.stroke();
    } else if (p.shape === 'bottle') {
      // eine Flasche, eingewickelt: unten breit, oben ein Hals
      paper(cx - 26, by - 170, 52, 160);
      ctx.beginPath();
      ctx.moveTo(cx - 26, by - 10);
      ctx.lineTo(cx - 26, by - 100);
      ctx.quadraticCurveTo(cx - 26, by - 125, cx - 9, by - 135);
      ctx.lineTo(cx - 9, by - 172);
      ctx.lineTo(cx + 9, by - 172);
      ctx.lineTo(cx + 9, by - 135);
      ctx.quadraticCurveTo(cx + 26, by - 125, cx + 26, by - 100);
      ctx.lineTo(cx + 26, by - 10);
      ctx.closePath();
      ctx.fill();
    } else {
      // ein kleiner Kasten – an der Seite ein Schlüsselloch zum Aufziehen
      paper(cx - 46, by - 96, 92, 86);
      ctx.fillRect(cx - 46, by - 96, 92, 86);
      ctx.fillStyle = '#c9a24c';
      ctx.beginPath();
      ctx.arc(cx + 34, by - 54, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a1a0e';
      ctx.fillRect(cx + 33, by - 56, 2, 5);
    }
    // goldenes Band mit Schleife
    ctx.strokeStyle = '#f2d06b';
    ctx.lineWidth = 5;
    const top = { round: by - 112, flat: by - 34, long: by - 150, soft: by - 84, bottle: by - 100, box: by - 96 }[p.shape];
    line(ctx, cx, top, cx, by - 10);
    ctx.fillStyle = '#f2d06b';
    ctx.beginPath();
    ctx.ellipse(cx - 9, top - 4, 9, 5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, top - 4, 9, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
  text(ctx, 'Schütteln verboten – Mira passt auf. Man muss es an der Form erkennen.', 640, 112, { font: `italic 16px ${SERIF}`, color: '#e9d8b0', align: 'center' });
}

// Farbe heller (+) oder dunkler (−) machen
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amount));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

export function drawNameTag(ctx, token, x, y) {
  ctx.fillStyle = '#e9d39b';
  ctx.fillRect(x - token.w / 2, y - token.h / 2, token.w, token.h);
  ctx.strokeStyle = '#8c6a2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - token.w / 2, y - token.h / 2, token.w, token.h);
  text(ctx, token.label, x, y + 7, { font: `bold 18px ${HAND}`, color: BLUE_INK, align: 'center' });
}

// ---------------------------------------------------------------- Frachtliste mit Schablone
// Ein Buchstabengitter 14 × 8. Durch die Sterne der Schablone (bei richtiger Lage) liest man:
// PAKET FÜR PAPA – UNTER DEM BODEN
const MESSAGE = 'PAKETFURPAPAUNTERDEMBODEN';
const COLS = 14, ROWS = 8;
// Sternlöcher in der Schablone (Spalte, Zeile) – 25 Stück, zeilenweise von links nach rechts gelesen
const HOLES = [
  [1, 0], [4, 0], [6, 0], [9, 0], [12, 0],
  [0, 1], [3, 1], [8, 1],
  [2, 2], [5, 2], [7, 2], [10, 2],
  [1, 3], [6, 3], [11, 3],
  [0, 4], [4, 4], [9, 4],
  [2, 5], [7, 5], [12, 5],
  [3, 6], [8, 6], [10, 6],
  [5, 7],
];
export const STENCIL_GOAL = { dx: 1, dy: 0 }; // so liegt die Schablone richtig (um 1 Spalte nach rechts)
const FILLER = 'WEIHNACHTSGESCHENKEFRACHTLISTEPOSTRINGBAHNSTERNMIRAMOLLTICKKERZENSCHNEEGLOCKEN';

export const GRID_LETTERS = (() => {
  const grid = [];
  let k = 0;
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(FILLER[(r * 17 + c * 5 + k++) % FILLER.length]);
    grid.push(row);
  }
  HOLES.forEach(([c, r], i) => {
    grid[r][c + STENCIL_GOAL.dx] = MESSAGE[i];
  });
  return grid;
})();

const G = { x: 300, y: 150, cell: 48 };
export const STENCIL_SPOTS = [
  { id: 'left', x: 180, y: 300, w: 70, h: 80, label: 'Schablone nach links' },
  { id: 'right', x: 1030, y: 300, w: 70, h: 80, label: 'Schablone nach rechts' },
  { id: 'up', x: 600, y: 80, w: 80, h: 50, label: 'Schablone nach oben' },
  { id: 'down', x: 600, y: 560, w: 80, h: 50, label: 'Schablone nach unten' },
];

export function stencilAligned({ dx, dy }) {
  return dx === STENCIL_GOAL.dx && dy === STENCIL_GOAL.dy;
}

export function drawStencil(ctx, { dx, dy, laid }) {
  sheet(ctx, 260, 110, 760, 460, {
    color: '#ece4cc',
    inner: () => {},
  });
  text(ctx, 'FRACHTLISTE · Packwagen · 24. Dezember', 640, 140, { font: `bold 18px ${SERIF}`, align: 'center' });
  GRID_LETTERS.forEach((row, r) => row.forEach((ch, c) => text(ctx, ch, G.x + c * G.cell + G.cell / 2, G.y + 30 + r * G.cell + 24, { font: `bold 22px ${TYPEWRITER}`, align: 'center' })));
  if (laid) {
    // Geschenkpapier mit ausgestanzten Sternen: alles rot, nur die Sterne sind Löcher
    ctx.save();
    ctx.beginPath();
    ctx.rect(G.x - 20 + dx * G.cell, G.y + 10 + dy * G.cell, COLS * G.cell + 40, ROWS * G.cell + 40);
    for (const [c, r] of HOLES) {
      const cx = G.x + (c + dx) * G.cell + G.cell / 2, cy = G.y + 30 + (r + dy) * G.cell + 16;
      star(ctx, cx, cy, 20);
    }
    ctx.fillStyle = 'rgba(160, 30, 30, 0.93)';
    ctx.fill('evenodd');
    ctx.restore();
  }
  for (const spot of STENCIL_SPOTS) {
    ctx.fillStyle = '#3d2a16';
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    text(ctx, { left: '◀', right: '▶', up: '▲', down: '▼' }[spot.id], spot.x + spot.w / 2, spot.y + spot.h / 2 + 9, { font: `bold 24px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  }
}

function star(ctx, x, y, r) {
  ctx.moveTo(x, y - r);
  for (let i = 1; i <= 10; i++) {
    const a = -Math.PI / 2 - i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------- Kisten über der Bodenluke (Schiebepuzzle)
// 5 × 5 Felder. Jede Kiste rutscht nur entlang ihrer Länge. Die Luke liegt unter Zeile 4, Spalten 1–2.
export const BOARD = { x: 390, y: 110, cell: 100, size: 5 };
export const HATCH = [[1, 4], [2, 4]];
export function startCrates() {
  return [
    { id: 'A', col: 1, row: 4, len: 2, dir: 'h', color: '#b07a3a' },
    { id: 'B', col: 3, row: 3, len: 2, dir: 'v', color: '#8a5a2a' },
    { id: 'C', col: 0, row: 3, len: 2, dir: 'v', color: '#8a5a2a' },
    { id: 'D', col: 2, row: 2, len: 2, dir: 'h', color: '#a06a32' },
    { id: 'E', col: 4, row: 1, len: 2, dir: 'v', color: '#7a4a22' },
    { id: 'F', col: 1, row: 1, len: 2, dir: 'v', color: '#7a4a22' },
    { id: 'G', col: 3, row: 0, len: 2, dir: 'h', color: '#a06a32' },
  ];
}

export function cells(crate) {
  return Array.from({ length: crate.len }, (_, i) => (crate.dir === 'h' ? [crate.col + i, crate.row] : [crate.col, crate.row + i]));
}

export function crateSpots(crates) {
  return crates.map((c) => ({
    id: c.id,
    x: BOARD.x + c.col * BOARD.cell + 4, y: BOARD.y + c.row * BOARD.cell + 4,
    w: (c.dir === 'h' ? c.len : 1) * BOARD.cell - 8, h: (c.dir === 'v' ? c.len : 1) * BOARD.cell - 8,
    label: 'Kiste schieben',
  }));
}

export function hatchFree(crates) {
  return !crates.some((c) => cells(c).some(([x, y]) => HATCH.some(([hx, hy]) => hx === x && hy === y)));
}

export function drawCrates(ctx, { crates }) {
  const { x, y, cell, size } = BOARD;
  wood(ctx, x - 30, y - 30, cell * size + 60, cell * size + 60, [110, 70, 36]);
  ctx.strokeStyle = 'rgba(40, 20, 8, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= size; i++) {
    line(ctx, x + i * cell, y, x + i * cell, y + size * cell);
    line(ctx, x, y + i * cell, x + size * cell, y + i * cell);
  }
  // Luke
  ctx.fillStyle = '#4a4a46';
  ctx.fillRect(x + HATCH[0][0] * cell + 6, y + HATCH[0][1] * cell + 6, 2 * cell - 12, cell - 12);
  text(ctx, 'LUKE', x + 2 * cell, y + 4.6 * cell, { font: `bold 22px ${PRINT}`, color: '#ddd', align: 'center' });
  for (const c of crates) {
    const w = (c.dir === 'h' ? c.len : 1) * cell - 8, h = (c.dir === 'v' ? c.len : 1) * cell - 8;
    const cx = x + c.col * cell + 4, cy = y + c.row * cell + 4;
    ctx.fillStyle = c.color;
    ctx.fillRect(cx, cy, w, h);
    ctx.strokeStyle = '#3a2210';
    ctx.lineWidth = 4;
    ctx.strokeRect(cx, cy, w, h);
    line(ctx, cx, cy, cx + w, cy + h);
    line(ctx, cx + w, cy, cx, cy + h);
    text(ctx, c.dir === 'h' ? '◀ ▶' : '▲▼', cx + w / 2, cy + h / 2 + 8, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  }
  text(ctx, 'Klicken: Kiste in diese Richtung schieben (linke/rechte bzw. obere/untere Hälfte)', 640, y + size * cell + 60, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

// ---------------------------------------------------------------- Miras Paket: fünf Bänder
// Bänder von oben nach unten (das erste liegt ganz oben). Nur das oberste lässt sich lösen.
export const RIBBONS = [
  { id: 'gold', name: 'goldene Band', color: '#e0b030', from: [380, 150], to: [900, 580] },
  { id: 'red', name: 'rote Band', color: '#c0302a', from: [640, 120], to: [640, 610] },
  { id: 'green', name: 'grüne Band', color: '#2f8a4a', from: [330, 370], to: [950, 370] },
  { id: 'blue', name: 'blaue Band', color: '#3a5ab0', from: [900, 150], to: [380, 580] },
  { id: 'white', name: 'weiße Band', color: '#efe8dc', from: [470, 130], to: [810, 600] },
];
export const LAYER = ['red', 'gold', 'blue', 'white', 'green']; // oberstes zuerst

export function ribbonSpots(left) {
  return RIBBONS.filter((r) => left.includes(r.id)).map((r) => {
    // Klickfläche: ein Stück am äußeren Ende des Bandes (wo es nicht von anderen verdeckt wird)
    const t = 0.12;
    const x = r.from[0] + (r.to[0] - r.from[0]) * t, y = r.from[1] + (r.to[1] - r.from[1]) * t;
    return { id: r.id, cx: x, cy: y, r: 30, label: `Das ${r.name}` };
  });
}

export function drawGiftBox(ctx, { left }) {
  ctx.fillStyle = '#1a120c';
  ctx.fillRect(280, 90, 720, 560);
  glow(ctx, 640, 300, 420, '255, 210, 150', 0.12);
  // Paket in Geschenkpapier mit kleinen Sternen, Kanten leicht geknickt
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  const paper = ctx.createLinearGradient(340, 150, 940, 600);
  paper.addColorStop(0, '#8e3446');
  paper.addColorStop(1, '#5e1e2c');
  ctx.fillStyle = paper;
  ctx.fillRect(340, 150, 600, 450);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(340, 150, 600, 450);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 220, 140, 0.35)';
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 13; col++) {
      const sx = 352 + col * 48 + (row % 2) * 24, sy = 166 + row * 46;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 3 : 7;
        ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr);
      }
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 3;
  line(ctx, 340, 300, 940, 290);
  line(ctx, 520, 150, 540, 600);
  ctx.restore();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(340, 150, 600, 450);
  // Bänder: von unten nach oben zeichnen, als Satin mit Glanz
  for (const id of [...LAYER].reverse()) {
    if (!left.includes(id)) continue;
    satinRibbon(ctx, RIBBONS.find((q) => q.id === id));
  }
  // Kinder-Anhänger (steckt oben unter den Bändern)
  ctx.save();
  ctx.translate(410, 122);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#f3e8cc';
  ctx.beginPath();
  ctx.roundRect(-70, -22, 140, 40, 6);
  ctx.fill();
  text(ctx, 'Für Papa', 0, 8, { font: `bold 26px ${HAND}`, color: '#b3261e', align: 'center' });
  ctx.restore();
}

function satinRibbon(ctx, r) {
  const [x0, y0] = r.from, [x1, y1] = r.to;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const angle = Math.atan2(y1 - y0, x1 - x0);
  ctx.save();
  ctx.translate(x0, y0);
  ctx.rotate(angle);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = r.color;
  ctx.fillRect(-4, -14, len + 8, 28);
  ctx.shadowColor = 'transparent';
  const sheen = ctx.createLinearGradient(0, -14, 0, 14);
  sheen.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
  sheen.addColorStop(0.3, 'rgba(255, 255, 255, 0.35)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  sheen.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-4, -14, len + 8, 28);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1;
  line(ctx, -4, -11, len + 4, -11);
  line(ctx, -4, 11, len + 4, 11);
  // eingeschnittene Enden (Schwalbenschwanz)
  ctx.fillStyle = '#1a120c';
  for (const end of [-4, len + 4]) {
    const dir = end < 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(end, -15);
    ctx.lineTo(end + dir * 12, 0);
    ctx.lineTo(end, 15);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Kelle und Karte
export function drawPaddleAndCard(ctx) {
  drawPicture(ctx, 'assets/closeups/kelle-karte.webp', 0, 0, 1280, 720);
  // Kelle: Türcode in Kinderschrift auf dem weißen Kreis
  ctx.save();
  ctx.translate(276, 222);
  ctx.rotate(-0.08);
  text(ctx, '2512', 0, 18, { font: `bold 54px ${HAND}`, color: '#c0302a', align: 'center' });
  ctx.restore();
  // Karte
  text(ctx, 'Für Papa.', 648, 300, { font: `bold 40px ${HAND}`, color: RED, align: 'center' });
  ['Damit du uns', 'nach Hause', 'bringst.', '', 'Deine Mira'].forEach((value, i) => text(ctx, value, 985, 220 + i * 52, { font: `bold 32px ${HAND}`, color: RED, align: 'center' }));
  return INK;
}
