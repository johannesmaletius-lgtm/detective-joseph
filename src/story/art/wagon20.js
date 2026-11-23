import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, line, sheet, text, wood } from './common.js';

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
  const names = ['ilse', 'tick', 'k', 'bruno', 'barkeeper', 'moll'];
  return names.map((id, i) => ({ id, w: 130, h: 50, label: PARCELS.find((p) => p.id === id).name, home: { x: 240 + i * 160, y: 590 } }));
}
export function checkNames(placement) {
  return placement.every((id, i) => id === PARCEL_SLOTS[i].id);
}

export function drawParcels(ctx) {
  wood(ctx, 120, 70, 1040, 580, [100, 60, 30]);
  PARCEL_SLOTS.forEach((slot) => {
    const p = PARCELS.find((q) => q.id === slot.id);
    const cx = slot.x + slot.w / 2, by = 330;
    ctx.fillStyle = p.color;
    if (p.shape === 'round') {
      ctx.beginPath();
      ctx.ellipse(cx, by - 60, 56, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'flat') ctx.fillRect(cx - 60, by - 40, 120, 30);
    else if (p.shape === 'long') ctx.fillRect(cx - 30, by - 150, 60, 140);
    else if (p.shape === 'soft') {
      ctx.beginPath();
      ctx.ellipse(cx, by - 50, 60, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'bottle') ctx.fillRect(cx - 26, by - 160, 52, 150);
    else ctx.fillRect(cx - 50, by - 100, 100, 90);
    ctx.strokeStyle = '#f2d06b';
    ctx.lineWidth = 5;
    line(ctx, cx, by - 160, cx, by - 10);
    p.clue.split(', ').forEach((part, i) => text(ctx, i ? part : `„${part}`, cx, 150 + i * 20, { font: `italic 15px ${SERIF}`, color: '#f1e0b8', align: 'center' }));
  });
  text(ctx, 'Geschüttelt und befühlt – wem gehört welches Paket?', 640, 110, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
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
  ctx.fillStyle = '#7a2a3a';
  ctx.fillRect(340, 150, 600, 450);
  text(ctx, 'Für Papa', 400, 128, { font: `bold 26px ${HAND}`, color: '#ffe7a0', align: 'center' });
  // von unten nach oben zeichnen
  for (const id of [...LAYER].reverse()) {
    if (!left.includes(id)) continue;
    const r = RIBBONS.find((q) => q.id === id);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 34;
    line(ctx, r.from[0] + 3, r.from[1] + 4, r.to[0] + 3, r.to[1] + 4);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 28;
    line(ctx, r.from[0], r.from[1], r.to[0], r.to[1]);
  }
}

// ---------------------------------------------------------------- Kelle und Karte
export function drawPaddleAndCard(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.0)';
  // Kelle
  ctx.save();
  ctx.translate(420, 380);
  ctx.rotate(-0.2);
  ctx.fillStyle = '#8a5a2a';
  ctx.fillRect(-14, 40, 28, 230);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, -40, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c0302a';
  ctx.beginPath();
  ctx.arc(0, -40, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, -40, 60, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '2412', 0, -28, { font: `bold 34px ${HAND}`, color: '#c0302a', align: 'center' });
  ctx.restore();
  // Karte
  sheet(ctx, 640, 170, 460, 330, {
    angle: 0.05,
    color: '#f6edd8',
    inner: (c) => {
      c.fillStyle = '#2f6a3a';
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.arc(40 + i * 76, 30, 10, 0, Math.PI * 2);
        c.fill();
      }
      ['Für Papa.', 'Damit du uns', 'nach Hause bringst.', '', 'Deine Mira'].forEach((value, i) => text(c, value, 40, 100 + i * 44, { font: `bold 30px ${HAND}`, color: RED }));
    },
  });
  return INK;
}
