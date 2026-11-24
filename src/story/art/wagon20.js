import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, drawPicture, glow, line, plank, rivet, sheet, text, wood } from './common.js';

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
  ctx.drawImage(cached('w20-floor', cell * size + 120, cell * size + 100, paintCrateFloor), x - 60, y - 50);
  for (const c of crates) {
    const long = c.len * cell - 8, short = cell - 8;
    const cx = x + c.col * cell + 4, cy = y + c.row * cell + 4;
    const image = cached(`w20-crate-${c.id}`, long + 12, short + 12, (g) => paintCrate(g, c, long, short));
    const w = c.dir === 'h' ? long : short, h = c.dir === 'v' ? long : short;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(cx + 6, cy + 8, w, h);
    if (c.dir === 'h') ctx.drawImage(image, cx - 6, cy - 6);
    else {
      ctx.translate(cx + w, cy);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(image, -6, -6);
    }
    ctx.restore();
    // Schieberichtung als aufgemalte Pfeile
    ctx.save();
    ctx.translate(cx + w / 2, cy + h / 2);
    if (c.dir === 'v') ctx.rotate(Math.PI / 2);
    ctx.fillStyle = 'rgba(250, 236, 200, 0.85)';
    for (const sx of [-1, 1]) {
      const ax = sx * (c.len * cell / 2 - 26);
      ctx.beginPath();
      ctx.moveTo(ax + sx * 12, 0);
      ctx.lineTo(ax - sx * 4, -11);
      ctx.lineTo(ax - sx * 4, 11);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  text(ctx, 'Klicken: Kiste in diese Richtung schieben (linke/rechte bzw. obere/untere Hälfte)', 640, y + size * cell + 60, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

// Boden des Packwagens mit Bodenluke (einmal gezeichnet). (0, 0) = 60 px links und 50 px über dem Brett.
function paintCrateFloor(c) {
  const { cell, size } = BOARD;
  const W = cell * size + 120, H = cell * size + 100, ox = 60, oy = 50;
  for (let i = 0; i * 50 < W; i++) plank(c, i * 50, 0, 50, H, { tone: [104, 70, 40], seed: 500 + i, vertical: true, knots: 2 });
  c.fillStyle = 'rgba(15, 8, 3, 0.65)';
  for (let i = 1; i * 50 < W; i++) c.fillRect(i * 50 - 1, 0, 2, H);
  // Nagelreihen über den Querbalken
  for (let yy = 30; yy < H; yy += 150) for (let i = 0; i * 50 < W; i++) {
    rivet(c, i * 50 + 12, yy, 2.4, [90, 85, 80]);
    rivet(c, i * 50 + 38, yy, 2.4, [90, 85, 80]);
  }
  // Kreidelinien: das 5 × 5-Feld
  c.strokeStyle = 'rgba(240, 230, 210, 0.18)';
  c.lineWidth = 2;
  c.setLineDash([10, 7]);
  for (let i = 0; i <= size; i++) {
    line(c, ox + i * cell, oy, ox + i * cell, oy + size * cell);
    line(c, ox, oy + i * cell, ox + size * cell, oy + i * cell);
  }
  c.setLineDash([]);
  // Bodenluke: Riffelblech mit Nieten, Scharnieren und Ring
  const hx = ox + HATCH[0][0] * cell + 6, hy = oy + HATCH[0][1] * cell + 6, hw = 2 * cell - 12, hh = cell - 12;
  c.fillStyle = 'rgba(0, 0, 0, 0.6)';
  c.fillRect(hx - 5, hy - 5, hw + 10, hh + 10);
  const steel = c.createLinearGradient(hx, hy, hx + hw, hy + hh);
  steel.addColorStop(0, '#7b7f82');
  steel.addColorStop(1, '#45494c');
  c.fillStyle = steel;
  c.fillRect(hx, hy, hw, hh);
  c.save();
  c.beginPath();
  c.rect(hx, hy, hw, hh);
  c.clip();
  c.strokeStyle = 'rgba(200, 205, 210, 0.35)';
  c.lineWidth = 2;
  for (let ty = hy + 6; ty < hy + hh; ty += 12) {
    for (let tx = hx + ((ty - hy) % 24 ? 6 : 14); tx < hx + hw; tx += 16) line(c, tx, ty, tx + 6, ty - 5);
  }
  c.restore();
  c.strokeStyle = 'rgba(20, 20, 20, 0.8)';
  c.lineWidth = 2;
  c.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1);
  for (const [rx, ry] of [[hx + 8, hy + 8], [hx + hw - 8, hy + 8], [hx + 8, hy + hh - 8], [hx + hw - 8, hy + hh - 8]]) rivet(c, rx, ry, 3.5, [150, 150, 150]);
  for (const sx of [hx + 30, hx + hw - 60]) {
    c.fillStyle = '#2c2f31';
    c.fillRect(sx, hy - 4, 30, 12);
    rivet(c, sx + 7, hy + 2, 2.5, [130, 130, 130]);
    rivet(c, sx + 23, hy + 2, 2.5, [130, 130, 130]);
  }
  c.strokeStyle = '#a7a9aa';
  c.lineWidth = 4;
  c.beginPath();
  c.ellipse(hx + hw / 2, hy + hh - 22, 14, 9, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = 'rgba(0, 0, 0, 0.5)';
  c.fillRect(hx + hw / 2 - 18, hy + hh - 14, 36, 4);
  text(c, 'LUKE', hx + hw / 2, hy + 38, { font: `bold 24px ${TYPEWRITER}`, color: 'rgba(245, 220, 120, 0.85)', align: 'center' });
  // Lampenlicht von oben, Ränder dunkel
  const light = c.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H / 2, W * 0.75);
  light.addColorStop(0, 'rgba(255, 220, 150, 0.12)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  c.fillStyle = light;
  c.fillRect(0, 0, W, H);
}

const CRATE_LABELS = {
  A: ['ZERBRECHLICH', '#a12a1e'], B: ['RINGBAHN', '#2a2018'], C: ['POST', '#2a3a6a'], D: ['VORSICHT GLAS', '#a12a1e'],
  E: ['OBEN', '#2a2018'], F: ['ZUG 24', '#2a2018'], G: ['WEIHNACHTEN', '#2f5a3a'],
};

// Eine Holzkiste, liegend gezeichnet (long × short); stehende Kisten werden gedreht
function paintCrate(c, crate, long, short) {
  c.translate(6, 6);
  const tone = crate.color.match(/\w\w/g).map((h) => parseInt(h, 16));
  const seed = crate.id.charCodeAt(0) * 7;
  // Bretter quer
  const boards = Math.max(2, Math.round(long / 48));
  for (let i = 0; i < boards; i++) plank(c, (i * long) / boards, 0, long / boards, short, { tone, seed: seed + i, vertical: true, knots: 1 });
  c.fillStyle = 'rgba(20, 10, 3, 0.55)';
  for (let i = 1; i < boards; i++) c.fillRect((i * long) / boards - 1, 0, 2, short);
  // Rahmen
  const dark = tone.map((v) => Math.max(0, v - 34));
  for (const [fx, fy, fw, fh] of [[0, 0, long, 12], [0, short - 12, long, 12], [0, 0, 12, short], [long - 12, 0, 12, short]]) {
    plank(c, fx, fy, fw, fh, { tone: dark, seed: seed + fx + fy, vertical: fh > fw, knots: 0 });
  }
  c.strokeStyle = 'rgba(15, 8, 2, 0.8)';
  c.lineWidth = 2;
  c.strokeRect(1, 1, long - 2, short - 2);
  c.strokeRect(12, 12, long - 24, short - 24);
  // Diagonalstrebe
  c.save();
  c.beginPath();
  c.rect(12, 12, long - 24, short - 24);
  c.clip();
  c.translate(long / 2, short / 2);
  c.rotate(Math.atan2(short - 24, long - 24));
  plank(c, -long, -6, long * 2, 12, { tone: dark, seed: seed + 99, knots: 0 });
  c.strokeStyle = 'rgba(15, 8, 2, 0.7)';
  c.lineWidth = 1.5;
  c.strokeRect(-long, -6, long * 2, 12);
  c.restore();
  // Nägel und Eckbeschläge
  for (const [nx, ny] of [[6, 6], [long - 6, 6], [6, short - 6], [long - 6, short - 6]]) {
    c.fillStyle = '#3a3a38';
    c.fillRect(nx - 6, ny - 6, 12, 12);
    rivet(c, nx, ny, 2.6, [160, 155, 145]);
  }
  // Stempelaufdruck
  const [label, ink] = CRATE_LABELS[crate.id] ?? ['', INK];
  c.save();
  c.translate(long / 2, short / 2);
  c.rotate(-0.04);
  const size = long > 150 ? 15 : 12;
  c.font = `bold ${size}px ${TYPEWRITER}`;
  const tw = c.measureText(label).width + 16;
  c.fillStyle = 'rgba(0, 0, 0, 0.3)';
  c.fillRect(-tw / 2 + 2, -13, tw, 24);
  c.fillStyle = '#efe3c4';
  c.fillRect(-tw / 2, -15, tw, 24);
  c.strokeStyle = 'rgba(120, 90, 50, 0.6)';
  c.lineWidth = 1;
  c.strokeRect(-tw / 2 + 2.5, -12.5, tw - 5, 19);
  text(c, label, 0, 2, { font: `bold ${size}px ${TYPEWRITER}`, color: ink, align: 'center' });
  c.restore();
  // Lichtkante oben, Schatten unten
  const shade = c.createLinearGradient(0, 0, 0, short);
  shade.addColorStop(0, 'rgba(255, 230, 190, 0.18)');
  shade.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  c.fillStyle = shade;
  c.fillRect(0, 0, long, short);
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
