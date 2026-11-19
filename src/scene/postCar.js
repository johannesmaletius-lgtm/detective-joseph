import { OUTLINE, glow, grime, line, poly, seeded, vertical } from '../core/paint.js';
import {
  P, PERSPECTIVE, WINDOWS, box, boxArea, floor, onBackWall, onSideWall, outsideFor, paintCeilingLamp, paintShell,
  paintWindows, rect, rivets, roundRect, shade, sign, trainFor,
} from './wagonPainter.js';
import { paintOtherJoseph } from './figures.js';

// Szene 5: der Postwagen.
//
// Links die Fächerwand: zwölf Fächer, beschriftet mit Rundennummern. Davor der Sortiertisch mit einem Berg
// Briefe. Hinten in der Mitte die Tür zum Schaffnerabteil (ohne Griff), rechts daneben der Fahrkartenschalter,
// darüber der Rundenzähler. Rechts hinten die Stempelmaschine, rechts vorne Postsäcke.
// Im Tunnel sitzt der andere Joseph bei Kerzenlicht am Sortiertisch und schreibt.
// Reaktionen: src/story/wagon5.js

const DOOR = { x: [-80, 80], y: [0, 280] };
const HATCH = { x: [108, 224], y: [112, 212] };
const COUNTER = { x: [-62, 62], y: [294, 342] };
const SPEAKER = { x: [-205, -145], y: [255, 315] };
const POSTER = { x: [-205, -120], y: [130, 222] };
const SHELF = { x: [-257, -217], y: [90, 306], z: [0.6, 0.97] };
const TABLE = { x: [-250, -140], y: [0, 88], z: [0.47, 0.58] };
const DESK = { x: [150, 250], y: [0, 86], z: [0.72, 0.84] };
const PAD = { x: [156, 182], y: [86, 92], z: [0.725, 0.75] };
const SACKS = { x: [160, 250], y: [0, 70], z: [0.5, 0.62] };

// Die Fächer: drei Reihen zu je vier – so, wie man sie im Bild von links nach rechts liest
export const FACH_LABELS = [
  [1, 7, 13, 27],
  [40, 41, 42, 43],
  [44, 45, 46, 47],
];
const ROWS = [[232, 300], [164, 232], [96, 164]];
const COLUMNS = [[0.6, 0.69], [0.69, 0.78], [0.78, 0.875], [0.875, 0.97]]; // von vorne (links im Bild) nach hinten

// Der andere Joseph am Sortiertisch (nur im Tunnel)
export const WRITER = { x: P(-105, 0, 0.64)[0], y: P(-105, 0, 0.64)[1] };
const CANDLE = (() => {
  const [x, y] = P(-160, TABLE.y[1], 0.5);
  return { x, y };
})();

// Stimme aus dem Lautsprecher
export const SPEAKER_VOICE = (() => {
  const [x, y, w] = onBackWall(SPEAKER.x, SPEAKER.y);
  return { x: x + w / 2 + 80, y: y - 30 };
})();

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  paintShell(ctx, {
    seed: 51,
    wall: ['#34463c', '#43594b', '#2f4036'],
    panel: '#263329',
    panelHeight: 80,
    rail: '#c9a24a',
    back: ['#2f4036', '#3e5446'],
    ceiling: '#1b241e',
    floor: ['#2b2a24', '#48443a'],
    planks: 52,
    rack: false,
  });
  paintWindows(ctx, [WINDOWS[4], WINDOWS[5]], { frame: '#26342b' });
  for (const w of [WINDOWS[4], WINDOWS[5]]) {
    line(ctx, [[w.from, (w.top + w.bottom) / 2], [w.to, (w.top + w.bottom) / 2]], '#1d2620', 5);
  }
  paintCeilingLamp(ctx, 0.82, { color: '#fff1c4' });
  paintCeilingLamp(ctx, 0.5, { color: '#fff1c4' });
  paintShelf(ctx);
  paintBackWall(ctx);
  paintDesk(ctx);
  paintTable(ctx);
  paintSacks(ctx);
}

function paintShelf(ctx) {
  box(ctx, SHELF, { front: '#5a3a1e', side: '#6b4626' });
  ROWS.forEach(([y0, y1], r) => COLUMNS.forEach(([zn, zf], c) => {
    const cell = onSideWall(SHELF.x[1], [y0 + 5, y1 - 5], [zn + 0.006, zf - 0.006]);
    poly(ctx, cell, '#1a100a', { width: 2 });
    // Fachboden etwas heller
    line(ctx, [P(SHELF.x[1], y0 + 6, zn + 0.006), P(SHELF.x[1], y0 + 6, zf - 0.006)], 'rgba(160, 110, 60, 0.6)', 2);
    const zMid = (zn + zf) / 2;
    const [lx, ly] = P(SHELF.x[1], y0 + 2, zMid);
    const size = 0.9 / zMid;
    poly(ctx, [[lx - 13 * size, ly - 7 * size], [lx + 13 * size, ly - 7 * size], [lx + 13 * size, ly + 5 * size], [lx - 13 * size, ly + 5 * size]], '#efe2c0', { width: 1.5 });
    sign(ctx, String(FACH_LABELS[r][c]), lx, ly - 1 * size, { font: `bold ${Math.round(10 * size)}px "Courier New", monospace`, color: '#3a1e10' });
  }));
  // Schild über der Wand
  const [sx, sy] = P(SHELF.x[1], 322, 0.78);
  sign(ctx, 'POST NACH RUNDEN', sx + 6, sy, { font: 'bold 15px "Trebuchet MS", sans-serif', color: '#e8d6a0', angle: -0.55 });
}

function paintBackWall(ctx) {
  // Tür zum Schaffnerabteil: Holz, kein Griff, kleines dunkles Fenster
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  poly(ctx, [[x - 8, y - 8], [x + w + 8, y - 8], [x + w + 8, y + h], [x - 8, y + h]], '#2a1a0e', { width: 4 });
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#7a4e2a', '#5a3820']), { width: 3 });
  roundRect(ctx, x + w * 0.25, y + 26, w * 0.5, 64, 8);
  ctx.fillStyle = '#0c0c14';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  for (const [a, b] of [[0.1, 0.45], [0.55, 0.9]]) poly(ctx, [[x + w * 0.1, y + h * a + 50], [x + w * 0.9, y + h * a + 50], [x + w * 0.9, y + h * b + 30], [x + w * 0.1, y + h * b + 30]], null, { stroke: 'rgba(30, 16, 6, 0.6)', width: 2 });
  roundRect(ctx, x + w / 2 - 62, y + 104, 124, 26, 4);
  ctx.fillStyle = '#e8c74a';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'SCHAFFNER', x + w / 2, y + 118, { font: 'bold 14px "Trebuchet MS", sans-serif', color: '#2b2118' });
  sign(ctx, 'Zutritt nur mit', x + w / 2, y + 146, { font: '11px "Trebuchet MS", sans-serif', color: '#f3e2bf' });
  sign(ctx, 'gültiger Fahrkarte', x + w / 2, y + 160, { font: '11px "Trebuchet MS", sans-serif', color: '#f3e2bf' });

  // Fahrkartenschalter
  const [hx, hy, hw, hh] = onBackWall(HATCH.x, HATCH.y);
  poly(ctx, [[hx - 10, hy - 30], [hx + hw + 10, hy - 30], [hx + hw + 10, hy + hh + 10], [hx - 10, hy + hh + 10]], '#4a3220', { width: 3 });
  sign(ctx, 'FAHRKARTEN', hx + hw / 2, hy - 15, { font: 'bold 13px "Trebuchet MS", sans-serif', color: '#e8d6a0' });
  poly(ctx, [[hx - 14, hy + hh + 4], [hx + hw + 14, hy + hh + 4], [hx + hw + 20, hy + hh + 16], [hx - 20, hy + hh + 16]], '#6b4a2a', { width: 3 });

  // Rundenzähler: Gehäuse (die Ziffern malt die bewegliche Ebene)
  const [cx, cy, cw, ch] = onBackWall(COUNTER.x, COUNTER.y);
  roundRect(ctx, cx, cy, cw, ch, 6);
  ctx.fillStyle = '#20262a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  rivets(ctx, [[cx + 7, cy + 7], [cx + cw - 7, cy + 7], [cx + 7, cy + ch - 7], [cx + cw - 7, cy + ch - 7]], 2.5);

  // Lautsprecher
  const [sx, sy, sw, sh] = onBackWall(SPEAKER.x, SPEAKER.y);
  ctx.beginPath();
  ctx.arc(sx + sw / 2, sy + sh / 2, sw / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3a34';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  for (let i = -3; i <= 3; i++) line(ctx, [[sx + sw / 2 - 20, sy + sh / 2 + i * 6], [sx + sw / 2 + 20, sy + sh / 2 + i * 6]], 'rgba(10, 10, 8, 0.7)', 2);
  line(ctx, [[sx + sw / 2, sy + sh], [sx + sw / 2 + 40, sy + sh + 60]], '#1a1a16', 2);

  // Ein Plakat
  const [px, py, pw, ph] = onBackWall(POSTER.x, POSTER.y);
  poly(ctx, [[px, py], [px + pw, py], [px + pw, py + ph], [px, py + ph]], '#d8c9a0', { width: 2 });
  sign(ctx, 'BAHNPOST', px + pw / 2, py + 18, { font: 'bold 12px "Trebuchet MS", sans-serif', color: '#8a1e14' });
  sign(ctx, 'Jede Runde', px + pw / 2, py + 40, { font: '10px "Trebuchet MS", sans-serif', color: '#2b2118' });
  sign(ctx, 'pünktlich', px + pw / 2, py + 54, { font: '10px "Trebuchet MS", sans-serif', color: '#2b2118' });
  sign(ctx, 'im Tunnel', px + pw / 2, py + 68, { font: '10px "Trebuchet MS", sans-serif', color: '#2b2118' });
}

function paintDesk(ctx) {
  box(ctx, DESK, { front: '#4a3220', top: '#6b4a2e', side: '#3a2616' });
  // Stempelmaschine
  box(ctx, { x: [168, 232], y: [86, 100], z: [0.74, 0.82] }, { front: '#2a2e32', top: '#3a4046' });
  box(ctx, { x: [214, 228], y: [100, 170], z: [0.77, 0.79] }, { front: '#3a4046' });
  box(ctx, { x: [176, 226], y: [146, 172], z: [0.765, 0.795] }, { front: '#5a3a1e', top: '#6b4a2a' });
  const [rx, ry] = P(201, 159, 0.765);
  roundRect(ctx, rx - 24, ry - 9, 48, 18, 3);
  ctx.fillStyle = '#efe2c0';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'RUNDE', rx, ry + 1, { font: 'bold 10px "Courier New", monospace', color: '#2b2118' });
  // Hebel
  const [lx0, ly0] = P(228, 162, 0.78);
  const [lx1, ly1] = P(262, 214, 0.78);
  line(ctx, [[lx0, ly0], [lx1, ly1]], OUTLINE, 9);
  line(ctx, [[lx0, ly0], [lx1, ly1]], '#9aa3ab', 5);
  ctx.beginPath();
  ctx.arc(lx1, ly1, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#b3261e';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Schild am Tisch
  const [tx, ty] = P(200, 52, DESK.z[0]);
  sign(ctx, 'STEMPEL', tx, ty, { font: 'bold 15px "Courier New", monospace', color: 'rgba(240, 220, 170, 0.75)' });
}

function paintTable(ctx) {
  box(ctx, TABLE, { front: '#5a3a1e', top: '#7a5430', side: '#4a2e16' });
  // Ein Berg Briefe
  const rand = seeded(19);
  for (let i = 0; i < 26; i++) {
    const X = -240 + rand() * 90, Z = 0.48 + rand() * 0.09;
    const [x, y] = P(X, TABLE.y[1] + i * 0.6, Z);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * 1.2 - 0.6);
    ctx.scale(1, 0.5);
    const s = 1 / Z;
    poly(ctx, [[-14 * s, -9 * s], [14 * s, -9 * s], [14 * s, 9 * s], [-14 * s, 9 * s]], shade('#efe2c0', rand() * 0.15 - 0.1), { width: 1.5 });
    line(ctx, [[-14 * s, -9 * s], [0, 2 * s], [14 * s, -9 * s]], 'rgba(60, 40, 20, 0.5)', 1.2);
    ctx.restore();
  }
  // Tintenfass (leer)
  const [ix, iy] = P(-152, TABLE.y[1], 0.555);
  poly(ctx, [[ix - 8, iy], [ix + 8, iy], [ix + 6, iy - 14], [ix - 6, iy - 14]], '#1d2a3a', { width: 2 });
}

function paintSacks(ctx) {
  const rand = seeded(8);
  const sacks = [[180, 0.6, 62], [228, 0.61, 70], [200, 0.55, 58], [236, 0.53, 50], [176, 0.51, 46]];
  for (const [X, Z, H] of sacks) {
    const [x, y] = P(X, 0, Z);
    const [, top] = P(X, H, Z);
    const r = 32 / Z;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.quadraticCurveTo(x - r * 1.2, top + 10, x - r * 0.3, top);
    ctx.lineTo(x + r * 0.3, top);
    ctx.quadraticCurveTo(x + r * 1.2, top + 10, x + r, y);
    ctx.closePath();
    ctx.fillStyle = shade('#8a8270', rand() * 0.2 - 0.1);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    line(ctx, [[x - r * 0.3, top + 6], [x + r * 0.3, top + 6]], '#5a3a1a', 4);
    sign(ctx, 'POST', x, (y + top) / 2 + 6, { font: `bold ${Math.round(10 / Z)}px "Courier New", monospace`, color: 'rgba(120, 30, 20, 0.7)' });
  }
  grime(ctx, [P(150, 0, 0.62), P(257, 0, 0.62), P(257, 0, 0.48), P(150, 0, 0.48)], { count: 20, seed: 4, alpha: 0.15 });
}

// ============================================================================================
//  Bewegliche Teile
// ============================================================================================

// Ziffern des Rundenzählers
export function paintCounter(ctx, number) {
  const [x, y, w, h] = onBackWall(COUNTER.x, COUNTER.y);
  const digits = String(number).padStart(2, '0').split('');
  const cell = 26;
  const left = x + w / 2 - (digits.length * (cell + 4)) / 2 + 2;
  sign(ctx, 'RUNDE', x + 28, y + h / 2, { font: 'bold 10px "Trebuchet MS", sans-serif', color: '#c9cfd4' });
  digits.forEach((digit, i) => {
    const cx = left + 16 + i * (cell + 4);
    roundRect(ctx, cx, y + 8, cell, h - 16, 3);
    ctx.fillStyle = vertical(ctx, y + 8, y + h - 8, ['#cfcfcf', '#ffffff', '#bdbdbd']);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    sign(ctx, digit, cx + cell / 2, y + h / 2 + 1, { font: 'bold 24px "Courier New", monospace', color: '#141414' });
  });
}

// Klappe des Schalters: zu (Holz) oder offen (dunkel, mit Sprechgitter)
export function paintHatch(ctx, open) {
  const [x, y, w, h] = onBackWall(HATCH.x, HATCH.y);
  if (open) {
    poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#0a0a10', { width: 3 });
    glow(ctx, x + w / 2, y + h / 2, 60, '255, 210, 140', 0.2);
    for (let i = 1; i < 6; i++) line(ctx, [[x + (w * i) / 6, y + 6], [x + (w * i) / 6, y + h - 6]], '#c9a24a', 2);
    poly(ctx, [[x, y - 2], [x + w, y - 2], [x + w, y + 10], [x, y + 10]], '#7a5430', { width: 2 });
    return;
  }
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#8a5e34', '#6b4626']), { width: 3 });
  for (let i = 1; i < 5; i++) line(ctx, [[x + 4, y + (h * i) / 5], [x + w - 4, y + (h * i) / 5]], 'rgba(30, 16, 6, 0.45)', 2);
  // Schlitz für die Fahrkarte
  poly(ctx, [[x + w / 2 - 26, y + h - 14], [x + w / 2 + 26, y + h - 14], [x + w / 2 + 26, y + h - 8], [x + w / 2 - 26, y + h - 8]], '#0a0a0a', { width: 1.5 });
  ctx.beginPath();
  ctx.arc(x + w / 2, y + 20, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#c9a24a';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

// Tür zum Schaffnerabteil: einen Spalt offen
export function paintDoorOpen(ctx) {
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#140c08', { width: 3 });
  glow(ctx, x + w / 2, y + h * 0.5, 120, '255, 200, 120', 0.35);
  poly(ctx, [[x + w, y], [x + w + 46, y - 18], [x + w + 46, y + h + 18], [x + w, y + h]], '#6b4626', { width: 3 });
}

// Stempelkissen: trocken oder frisch mit Tinte
export function paintPad(ctx, inked) {
  box(ctx, PAD, { front: '#2a2a2a', top: inked ? '#2c3f9a' : '#5a5246' });
}

// Fächer mit Briefen darin (labels = welche Fächer Post haben)
export function paintLetters(ctx, labels) {
  ROWS.forEach(([y0], r) => COLUMNS.forEach(([zn, zf], c) => {
    if (!labels.includes(FACH_LABELS[r][c])) return;
    const zMid = (zn + zf) / 2;
    const corners = onSideWall(SHELF.x[1] + 4, [y0 + 10, y0 + 40], [zMid - 0.025, zMid + 0.02]);
    poly(ctx, corners, '#f4ead2', { width: 1.5 });
    line(ctx, [corners[0], corners[3]], 'rgba(120, 30, 20, 0.5)', 2);
  }));
}

// Die Kerze auf dem Sortiertisch
export function paintCandle(ctx, time) {
  const { x, y } = CANDLE;
  poly(ctx, [[x - 5, y], [x + 5, y], [x + 5, y - 26], [x - 5, y - 26]], '#efe6d2', { width: 2 });
  const flicker = Math.sin(time * 17) * 1.5 + Math.sin(time * 7.3) * 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 46 - flicker);
  ctx.quadraticCurveTo(x + 7, y - 32, x, y - 26);
  ctx.quadraticCurveTo(x - 7, y - 32, x, y - 46 - flicker);
  ctx.fillStyle = '#ffd36b';
  ctx.fill();
  glow(ctx, x, y - 34, 90, '255, 190, 100', 0.45);
}

export function candleLight() {
  return [{ x: CANDLE.x, y: CANDLE.y - 30, radius: 150 }, { x: WRITER.x, y: WRITER.y - 190, radius: 140 }];
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

export const postCar = {
  id: 'postCar',
  name: 'Postwagen',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },
  outside: outsideFor([4, 5], { windowLight: { color: [140, 160, 255], strength: 0.12 } }),

  props: [
    { id: 'counter', paint: (ctx, scene) => paintCounter(ctx, scene.flags.counter ?? 41) },
    { id: 'hatch', paint: (ctx, scene) => paintHatch(ctx, scene.flags.hatchOpen) },
    { id: 'door', when: 'doorOpen', paint: (ctx) => paintDoorOpen(ctx) },
    { id: 'pad', paint: (ctx, scene) => paintPad(ctx, scene.flags.inked) },
    { id: 'letters', paint: (ctx, scene) => paintLetters(ctx, scene.flags.filled ?? []) },
    { id: 'candle', when: 'writerHere', paint: (ctx, scene) => paintCandle(ctx, scene.time), light: () => candleLight() },
    { id: 'writer', when: 'writerHere', paint: (ctx, scene) => paintOtherJoseph(ctx, scene, { x: WRITER.x, y: WRITER.y, facing: 'left' }), depth: WRITER.y },
  ],

  hotspots: [
    { id: 'writer', name: 'Der andere Joseph', cursor: 'talk', when: 'writerHere', glows: 'writerHere', area: rect(WRITER.x - 60, WRITER.y - 330, 120, 330), walkTo: floor(-55, 0.62), facing: 'left' },
    { id: 'stamp', name: 'Stempelmaschine', area: boxArea({ x: [150, 262], y: [0, 214], z: [0.72, 0.84] }), walkTo: floor(118, 0.78), facing: 'right' },
    { id: 'hatch', name: 'Fahrkartenschalter', cursor: 'talk', area: rect(...onBackWall([100, 232], [100, 240])), walkTo: floor(130, 0.95), facing: 'back' },
    { id: 'counter', name: 'Rundenzähler', cursor: 'look', area: rect(...onBackWall(COUNTER.x, COUNTER.y)) },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: rect(...onBackWall(SPEAKER.x, SPEAKER.y)) },
    { id: 'door', name: 'Tür zum Schaffnerabteil', area: rect(...onBackWall(DOOR.x, DOOR.y)), walkTo: floor(0, 0.95), facing: 'back' },
    { id: 'shelf', name: 'Fächerwand', area: boxArea(SHELF), walkTo: floor(-190, 0.8), facing: 'left' },
    { id: 'table', name: 'Sortiertisch', area: boxArea({ x: TABLE.x, y: [0, 110], z: TABLE.z }), walkTo: floor(-120, 0.53), facing: 'left' },
    { id: 'sacks', name: 'Postsäcke', area: boxArea(SACKS), walkTo: floor(132, 0.56), facing: 'right' },
    { id: 'poster', name: 'Plakat', cursor: 'look', area: rect(...onBackWall(POSTER.x, POSTER.y)) },
    ...[WINDOWS[4], WINDOWS[5]].map((w) => ({ id: 'window', name: 'Fenster', cursor: 'look', area: rect(w.from, w.top, w.to - w.from, w.bottom - w.top) })),
  ],

  train: trainFor([
    { x: 640, y: 40, radius: 220, strength: 0.24 },
    { x: 640, y: 150, radius: 200, strength: 0.18 },
  ]),

  playerStart: { x: 640, y: 690, facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-205, 0.965),
      floor(140, 0.965),
      floor(140, 0.42),
      floor(-130, 0.42),
      floor(-130, 0.6),
      floor(-205, 0.62),
    ],
    holes: [],
  },
};
