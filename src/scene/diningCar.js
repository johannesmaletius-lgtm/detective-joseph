import { OUTLINE, circle, ellipse, glow, line, poly, vertical } from '../core/paint.js';
import {
  P, PERSPECTIVE, WINDOWS, box, boxArea, floor, onBackWall, outsideFor, paintCeilingLamp, paintShell, paintWindows,
  rect, rivets, roundRect, shade, sign, trainFor,
} from './wagonPainter.js';

// Szene 2: der Speisewagen.
//
// Wie trainCompartment.js enthält diese Datei nur DATEN (und das Malen der Bilder). Was beim Klicken
// passiert, steht in src/story/wagon2.js. Raumkoordinaten (X, Y, Z) und P(…) erklärt wagonPainter.js.
//
// Rechts steht „Tisch 4“: vier Gedecke, vier Gläser, vier Tischkarten. Links das Grammophon,
// hinten die Durchreiche zur Küche (mit Glocke), die Tafel mit dem Menü und die Tür zum Schlafwagen.

// ---------------------------------------------------------------- Maße im Raum
const TABLE = { x: [122, 257], y: [66, 74], z: [0.52, 0.66] };          // Tisch 4 (rechts)
const BENCH = { x: [118, 257], y: [0, 50], z: [0.68, 0.74] };           // Bank hinter Tisch 4
const BENCH_BACK = { x: [118, 257], y: [50, 132], z: [0.72, 0.75] };
const LEFT_TABLE = { x: [-257, -128], y: [66, 74], z: [0.64, 0.8] };
const CABINET = { x: [-257, -176], y: [0, 92], z: [0.44, 0.52] };      // Schränkchen mit Grammophon
const HATCH = { x: [-236, -114], y: [122, 214] };                       // Durchreiche zur Küche (Rückwand)
const DOOR = { x: [-90, 90], y: [0, 292] };

// Die vier Plätze an Tisch 4 – jeweils Glas (X, Z) und Tischkarte
export const SEATS = {
  1: { name: 'Frau Adler', X: 150, Z: 0.632, wine: 'rgba(232, 214, 120, 0.85)' },   // Weißwein
  2: { name: 'Herr Brandt', X: 216, Z: 0.632, wine: 'rgba(122, 16, 34, 0.92)' },    // Rotwein
  3: { name: 'Dr. Corvin', X: 150, Z: 0.556, wine: 'rgba(190, 220, 235, 0.55)' },   // Wasser
  4: { name: 'J.', X: 216, Z: 0.556, wine: 'rgba(238, 150, 40, 0.85)' },            // Orangensaft
};

export function glassBase(seat) {
  const { X, Z } = SEATS[seat];
  return P(X, TABLE.y[1], Z);
}

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  paintShell(ctx, {
    seed: 21,
    wall: ['#6e2a22', '#8c3b2a', '#6a2c1f'],
    panel: '#4a2414',
    panelHeight: 104,
    rail: '#d9a441',
    back: ['#5b261e', '#7a3424'],
    ceiling: '#3a1f14',
    floor: ['#4b2716', '#6e3c20'],
    planks: 36,
  });
  // Teppich im Gang
  poly(ctx, [P(-70, 0, 1), P(70, 0, 1), P(70, 0, 0.3), P(-70, 0, 0.3)], '#5c1620', { width: 0 });
  for (const X of [-62, 62]) line(ctx, [P(X, 0, 1), P(X, 0, 0.3)], '#d9a441', 3);
  for (let z = 0.95; z > 0.32; z -= 0.08) {
    const [x, y] = P(0, 0, z);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 / z, 0.35 / z);
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(22, 0); ctx.lineTo(0, 18); ctx.lineTo(-22, 0); ctx.closePath();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
  paintWindows(ctx, WINDOWS, { frame: '#4a2a14', curtains: '#9b1d2c' });
  paintCeilingLamp(ctx, 0.95, { width: 90 });
  paintCeilingLamp(ctx, 0.76, { width: 90 });

  paintDoor(ctx);
  paintHatch(ctx);
  paintMenuBoard(ctx);
  paintCoatRack(ctx);
  paintPlant(ctx);
  paintLeftTable(ctx);
  paintTable4(ctx);
  paintGramophoneCabinet(ctx);
}

function paintDoor(ctx) {
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  // Rahmen
  roundRect(ctx, x - 12, y - 12, w + 24, h + 12, 14);
  ctx.fillStyle = '#2e1a0c';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Türblatt
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#7b4a26', '#5e351a']), { width: 4 });
  // Kassetten
  for (const [py, ph] of [[y + 120, 70], [y + 204, 70]]) {
    roundRect(ctx, x + 18, py, w - 36, ph, 6);
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    roundRect(ctx, x + 22, py + 4, w - 44, ph - 8, 4);
    ctx.strokeStyle = 'rgba(255, 210, 150, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // ovales Fenster: dahinter ist es dunkel
  ellipse(ctx, x + w / 2, y + 62, 46, 40, '#0c0a16', { width: 5 });
  ellipse(ctx, x + w / 2, y + 62, 46, 40, null, { stroke: '#d9a441', width: 3 });
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + 62, 44, 38, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(120, 140, 220, 0.18)';
  ctx.fillRect(x + w / 2 - 30, y + 30, 14, 60);
  ctx.restore();
  // Messinggriff und Vierkant-Schloss
  line(ctx, [[x + w - 26, y + 168], [x + w - 26, y + 200]], '#d9a441', 7);
  circle(ctx, x + w - 26, y + 168, 6, '#d9a441', { width: 2 });
  poly(ctx, [[x + w - 34, y + 214], [x + w - 18, y + 214], [x + w - 18, y + 230], [x + w - 34, y + 230]], '#d9a441', { width: 2 });
  poly(ctx, [[x + w - 29, y + 219], [x + w - 23, y + 219], [x + w - 23, y + 225], [x + w - 29, y + 225]], '#1a0f08', { width: 0 });
  // Schild über der Tür
  roundRect(ctx, x + w / 2 - 70, y - 44, 140, 26, 6);
  ctx.fillStyle = '#1d3a2c';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d9a441';
  ctx.stroke();
  sign(ctx, 'SCHLAFWAGEN', x + w / 2, y - 31, { font: 'bold 14px "Trebuchet MS", sans-serif', color: '#e8d6a0' });
  rivets(ctx, [[x - 4, y + 4], [x + w + 4, y + 4]]);
}

function paintHatch(ctx) {
  const [x, y, w, h] = onBackWall(HATCH.x, HATCH.y);
  roundRect(ctx, x - 10, y - 14, w + 20, h + 14, 8);
  ctx.fillStyle = '#3b2412';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // dahinter: die dunkle Küche (Herdglühen)
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#1b0f09', '#2d140b']), { width: 3 });
  glow(ctx, x + w * 0.7, y + h, 50, '255, 120, 40', 0.35);
  // Töpfe an der Wand dahinter
  for (const [px, r] of [[x + 22, 10], [x + 48, 13], [x + 82, 9]]) {
    circle(ctx, px, y + 26, r, '#4a3a30', { stroke: '#120804', width: 2 });
  }
  // Schild
  roundRect(ctx, x + w / 2 - 44, y - 34, 88, 20, 5);
  ctx.fillStyle = '#e8d6a0';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'KÜCHE', x + w / 2, y - 24, { font: 'bold 12px "Trebuchet MS", sans-serif', color: '#3b2412' });
  // Ablage (Tresen) vor der Durchreiche, mit Glocke
  box(ctx, { x: [HATCH.x[0] - 8, HATCH.x[1] + 8], y: [112, 122], z: [0.93, 1] }, { front: '#6b4221', top: '#8a5a30' });
  paintBell(ctx);
}

export const BELL = P(-140, 122, 0.965);

function paintBell(ctx) {
  const [x, y] = BELL;
  ellipse(ctx, x, y, 14, 4, '#3b2412', { width: 2 });
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 1);
  ctx.quadraticCurveTo(x - 12, y - 18, x, y - 18);
  ctx.quadraticCurveTo(x + 12, y - 18, x + 12, y - 1);
  ctx.closePath();
  ctx.fillStyle = vertical(ctx, y - 18, y, ['#fff0b0', '#d9a441', '#8a5a1a']);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  circle(ctx, x, y - 20, 3, '#d9a441', { width: 2 });
}

function paintMenuBoard(ctx) {
  const [x, y, w, h] = onBackWall([110, 240], [118, 262]);
  roundRect(ctx, x - 8, y - 8, w + 16, h + 16, 6);
  ctx.fillStyle = '#6b4221';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#1f2a24', { width: 2 });
  ctx.save();
  ctx.fillStyle = 'rgba(240, 240, 230, 0.85)';
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillText('MENÜ DER RUNDE', x + w / 2, y + 18);
  ctx.font = '11px "Trebuchet MS", sans-serif';
  ['Tomatensuppe', 'Kalbsbraten', 'Ringbahn-Pudding'].forEach((dish, i) => ctx.fillText(dish, x + w / 2, y + 40 + i * 16));
  ctx.fillText('~ Getränke ~', x + w / 2, y + 96);
  ctx.font = '10px "Trebuchet MS", sans-serif';
  ['Weißwein · Rotwein', 'Wasser · Saft'].forEach((row, i) => ctx.fillText(row, x + w / 2, y + 112 + i * 14));
  ctx.restore();
  // Kreidereste
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(x + 6, y + h - 22, w - 30, 10);
}

// Garderobe an der linken Wand: Haken, daran hängt der Schaffnermantel (von vorn zu sehen) und die Mütze
export const COAT = { x: [-250, -196], y: [104, 250], z: 0.88 };

function paintCoatRack(ctx) {
  const X = -255;
  poly(ctx, [P(X, 250, 0.93), P(X, 264, 0.93), P(X, 264, 0.83), P(X, 250, 0.83)], '#6b4221', { width: 3 });
  for (const z of [0.915, 0.845]) line(ctx, [P(X, 256, z), P(X + 16, 252, z), P(X + 18, 244, z)], '#d9a441', 3);
  const { x: [x0, x1], y: [y0, y1], z } = COAT;
  const [l, top] = P(x0, y1, z);
  const [r, bottom] = P(x1, y0, z);
  const mid = (l + r) / 2;
  // Mantel: Schultern, nach unten etwas weiter, Saum
  ctx.beginPath();
  ctx.moveTo(mid - 8, top - 6);
  ctx.quadraticCurveTo(l + 4, top, l, top + 22);
  ctx.lineTo(l - 6, bottom);
  ctx.quadraticCurveTo(mid, bottom + 6, r + 6, bottom);
  ctx.lineTo(r, top + 22);
  ctx.quadraticCurveTo(r - 4, top, mid + 8, top - 6);
  ctx.closePath();
  ctx.fillStyle = vertical(ctx, top, bottom, ['#2c3c63', '#1d2742']);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Revers und Knopfleiste
  poly(ctx, [[mid - 8, top - 4], [mid - 18, top + 30], [mid - 2, top + 48], [mid, top + 8]], '#34477a', { width: 2 });
  poly(ctx, [[mid + 8, top - 4], [mid + 18, top + 30], [mid + 2, top + 48], [mid, top + 8]], '#34477a', { width: 2 });
  line(ctx, [[mid, top + 48], [mid, bottom - 4]], 'rgba(8, 12, 26, 0.8)', 2);
  for (let i = 0; i < 4; i++) circle(ctx, mid - 7, top + 62 + i * 24, 3, '#e0b04a', { width: 1.2 });
  // Tasche
  poly(ctx, [[mid + 6, top + 92], [r - 2, top + 92], [r - 2, top + 98], [mid + 6, top + 98]], '#141b30', { width: 1.5 });
  // Namensschild
  poly(ctx, [[mid + 6, top + 26], [mid + 22, top + 26], [mid + 22, top + 32], [mid + 6, top + 32]], '#e0b04a', { width: 1 });
  // Mütze auf dem Haken darüber
  const [cx, cy] = P(-222, 268, z);
  ellipse(ctx, cx, cy + 6, 26, 6, '#111', { width: 2 });
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy + 4);
  ctx.quadraticCurveTo(cx - 24, cy - 18, cx, cy - 18);
  ctx.quadraticCurveTo(cx + 26, cy - 18, cx + 22, cy + 4);
  ctx.closePath();
  ctx.fillStyle = '#23304f';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  circle(ctx, cx, cy - 6, 4, '#e0b04a', { width: 1.2 });
}

function paintPlant(ctx) {
  box(ctx, { x: [203, 249], y: [0, 52], z: [0.84, 0.88] }, { front: '#a4502c', top: '#5a2c14' });
  const [cx, cy] = P(226, 52, 0.86);
  const leaves = [[-1.1, 90], [-0.7, 110], [-0.25, 120], [0.2, 115], [0.6, 105], [1.05, 85], [-1.4, 70], [1.4, 70]];
  for (const [angle, length] of leaves) {
    const tipX = cx + Math.sin(angle) * length, tipY = cy - Math.cos(angle) * length * 0.95;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + Math.sin(angle) * length * 0.4, cy - length * 0.9, tipX, tipY);
    ctx.quadraticCurveTo(cx + Math.sin(angle) * length * 0.7, cy - length * 0.55, cx, cy);
    ctx.fillStyle = angle > 0 ? '#2f6b2a' : '#3b7f30';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }
}

function tablecloth(ctx, table, color = '#efe6d2') {
  const { x: [x0, x1], y: [, y1], z: [zn, zf] } = table;
  // Tischbein
  box(ctx, { x: [(x0 + x1) / 2 - 6, (x0 + x1) / 2 + 6], y: [0, y1], z: [(zn + zf) / 2 - 0.01, (zn + zf) / 2 + 0.01] }, '#3b2412');
  // Platte mit Tischdecke, die vorne und zur Mitte herunterhängt
  const drop = 26;
  const side = x0 > 0 ? x0 : x1;
  poly(ctx, [P(side, y1, zn), P(side, y1 - drop, zn), P(side, y1 - drop, zf), P(side, y1, zf)], shade(color, -0.2), { width: 3 });
  poly(ctx, [P(x0, y1, zn), P(x1, y1, zn), P(x1, y1, zf), P(x0, y1, zf)], color, { width: 3 });
  poly(ctx, [P(x0, y1, zn), P(x1, y1, zn), P(x1, y1 - drop, zn), P(x0, y1 - drop, zn)], shade(color, -0.08), { width: 3 });
  line(ctx, [P(x0, y1 - drop + 5, zn), P(x1, y1 - drop + 5, zn)], '#9b1d2c', 3);
  line(ctx, [P(side, y1 - drop + 5, zn), P(side, y1 - drop + 5, zf)], '#9b1d2c', 3);
}

function plate(ctx, X, Y, Z, r = 16) {
  const [x, y] = P(X, Y, Z);
  ellipse(ctx, x, y, r / Z * 0.9, r / Z * 0.32, '#fbf7ee', { width: 2 });
  ellipse(ctx, x, y, r / Z * 0.55, r / Z * 0.19, null, { stroke: 'rgba(80, 60, 40, 0.35)', width: 1.5 });
}

function tableLamp(ctx, X, Y, Z) {
  const [x, y] = P(X, Y, Z);
  const s = 1 / Z;
  line(ctx, [[x, y], [x, y - 22 * s]], '#d9a441', 3);
  ellipse(ctx, x, y, 7 * s, 2.4 * s, '#d9a441', { width: 2 });
  poly(ctx, [[x - 6 * s, y - 20 * s], [x + 6 * s, y - 20 * s], [x + 11 * s, y - 32 * s * 0.0 - 8 * s], [x - 11 * s, y - 8 * s]], '#c0392b', { width: 0 });
  poly(ctx, [[x - 6 * s, y - 34 * s], [x + 6 * s, y - 34 * s], [x + 12 * s, y - 20 * s], [x - 12 * s, y - 20 * s]], '#d2463a', { width: 2.5 });
  glow(ctx, x, y - 20 * s, 60 * s, '255, 170, 110', 0.35);
}

function paintLeftTable(ctx) {
  tablecloth(ctx, LEFT_TABLE);
  plate(ctx, -200, 74, 0.75);
  plate(ctx, -170, 74, 0.68);
  tableLamp(ctx, -236, 74, 0.73);
  // eine Flasche
  const [x, y] = P(-150, 74, 0.72);
  poly(ctx, [[x - 5, y], [x + 5, y], [x + 5, y - 26], [x + 2, y - 32], [x + 2, y - 42], [x - 2, y - 42], [x - 2, y - 32], [x - 5, y - 26]], '#2c4a2a', { width: 2 });
}

function paintTable4(ctx) {
  box(ctx, BENCH, { front: '#7a1f29', top: '#a32b37' });
  box(ctx, BENCH_BACK, { front: '#8c2531', top: '#5e1820' });
  for (let i = 1; i < 3; i++) {
    const X = BENCH_BACK.x[0] + ((BENCH_BACK.x[1] - BENCH_BACK.x[0]) * i) / 3;
    line(ctx, [P(X, 56, 0.72), P(X, 128, 0.72)], 'rgba(30, 5, 8, 0.45)', 2);
  }
  tablecloth(ctx, TABLE);
  for (const seat of Object.values(SEATS)) plate(ctx, seat.X - 14, TABLE.y[1], seat.Z + (seat.Z > 0.6 ? 0.012 : -0.008), 15);
  tableLamp(ctx, 248, 74, 0.6);
  // Hocker vorne
  for (const [x0, x1] of [[136, 172], [196, 232]]) {
    box(ctx, { x: [x0 + 10, x1 - 10], y: [0, 40], z: [0.46, 0.49] }, '#3b2412');
    box(ctx, { x: [x0, x1], y: [40, 50], z: [0.455, 0.495] }, { front: '#7a1f29', top: '#a32b37' });
  }
  // Schild „Tisch 4“
  const [x, y] = P(122, 74, 0.52);
  roundRect(ctx, x - 4, y - 2, 46, 20, 4);
  ctx.fillStyle = '#e8d6a0';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'Tisch 4', x + 19, y + 8, { font: 'bold 11px "Trebuchet MS", sans-serif', color: '#3b2412' });
}

export const GRAMOPHONE = { turntable: P(-217, 122, 0.48), horn: P(-178, 212, 0.475) };

function paintGramophoneCabinet(ctx) {
  box(ctx, CABINET, { front: '#6b3f20', top: '#8a5a30', side: '#4e2c14' });
  // Schublade
  const [dx0, dy0] = P(-250, 80, 0.44);
  const [dx1, dy1] = P(-184, 56, 0.44);
  roundRect(ctx, dx0, dy0, dx1 - dx0, dy1 - dy0, 4);
  ctx.fillStyle = '#5a3418';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  circle(ctx, (dx0 + dx1) / 2, (dy0 + dy1) / 2, 4, '#d9a441', { width: 1.5 });
  // Grammophon-Kasten
  box(ctx, { x: [-246, -188], y: [92, 120], z: [0.455, 0.505] }, { front: '#7b4a26', top: '#9b6236' });
  rivets(ctx, [P(-242, 116, 0.455), P(-192, 116, 0.455), P(-242, 96, 0.455), P(-192, 96, 0.455)], 2.5);
  // Plattenteller
  const [tx, ty] = GRAMOPHONE.turntable;
  ellipse(ctx, tx, ty, 50, 15, '#2a2a2a', { width: 2.5 });
  // Horn: Rohr vom Kasten nach oben, dann der große Trichter
  const [rx, ry] = P(-236, 124, 0.49);
  const [hx, hy] = GRAMOPHONE.horn;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.quadraticCurveTo(rx - 10, ry - 60, hx - 24, hy + 18);
  ctx.lineWidth = 12;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#c99a4a';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx - 30, hy + 20);
  ctx.quadraticCurveTo(hx - 20, hy - 10, hx + 10, hy - 62);
  ctx.quadraticCurveTo(hx + 70, hy - 40, hx + 62, hy + 24);
  ctx.quadraticCurveTo(hx + 20, hy + 6, hx - 30, hy + 20);
  ctx.closePath();
  ctx.fillStyle = vertical(ctx, hy - 60, hy + 30, ['#ffe7a0', '#d9a441', '#8a5a1a']);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ellipse(ctx, hx + 36, hy - 18, 24, 40, '#3b2412', { width: 3, rotation: -0.5 });
  ellipse(ctx, hx + 36, hy - 18, 15, 28, '#140a04', { width: 0, rotation: -0.5 });
}

// ============================================================================================
//  Bewegliche Teile (werden in jedem Bild neu gemalt)
// ============================================================================================

// Ein Glas auf dem Tisch. tipped = umgekippt und leer
export function paintGlass(ctx, seat, { tipped = false, poisonGlow = 0 } = {}) {
  const [x, y] = glassBase(seat);
  const s = 1 / SEATS[seat].Z;
  ctx.save();
  if (tipped) {
    ctx.translate(x + 4 * s, y - 3 * s);
    ctx.rotate(Math.PI / 2 - 0.15);
    ctx.translate(-x, -y);
  }
  // Stiel und Fuß
  ellipse(ctx, x, y, 6 * s, 2 * s, 'rgba(220, 235, 245, 0.6)', { width: 1.5 });
  line(ctx, [[x, y], [x, y - 10 * s]], 'rgba(220, 235, 245, 0.9)', 2);
  // Kelch
  const top = y - 26 * s, mid = y - 10 * s;
  ctx.beginPath();
  ctx.moveTo(x - 7 * s, top);
  ctx.quadraticCurveTo(x - 7 * s, mid, x, mid);
  ctx.quadraticCurveTo(x + 7 * s, mid, x + 7 * s, top);
  ctx.closePath();
  ctx.fillStyle = 'rgba(220, 235, 245, 0.25)';
  ctx.fill();
  if (!tipped) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = SEATS[seat].wine;
    ctx.fillRect(x - 8 * s, top + 9 * s, 16 * s, 20 * s);
    ctx.restore();
  }
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = 'rgba(20, 12, 6, 0.9)';
  ctx.stroke();
  line(ctx, [[x - 4 * s, top + 3 * s], [x - 5 * s, top + 9 * s]], 'rgba(255, 255, 255, 0.7)', 1.5);
  ctx.restore();
  if (poisonGlow > 0) {
    glow(ctx, x, y - 16 * s, 34 * s, '110, 255, 130', 0.55 * poisonGlow, 'lighter');
    glow(ctx, x, y - 16 * s, 9 * s, '200, 255, 200', 0.8 * poisonGlow, 'lighter');
  }
}

// Tischkarte mit Namen
export function paintNameCard(ctx, seat, { fallen = false } = {}) {
  const { X, Z, name } = SEATS[seat];
  const [x, y] = P(X + 22, 74, Z);
  const s = 1 / Z;
  ctx.save();
  ctx.translate(x, y);
  if (fallen) ctx.scale(1, 0.4);
  poly(ctx, [[-11 * s, 0], [11 * s, 0], [9 * s, -10 * s], [-9 * s, -10 * s]], '#fbf3dc', { width: 1.5 });
  ctx.font = `bold ${Math.round(4.2 * s)}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#5a1018';
  ctx.fillText(name, 0, -5 * s);
  ctx.restore();
}

// Rollladen der Durchreiche (0 = offen, 1 = ganz zu) und der Koch dahinter
export function paintHatchShutter(ctx, closed, time, { cookVisible = true, dancing = false } = {}) {
  const [x, y, w, h] = onBackWall(HATCH.x, HATCH.y);
  if (closed < 1 && cookVisible) {
    // zwei Augen im Dunkeln und eine weiße Kochmütze – der Koch schaut heraus
    const bob = dancing ? Math.sin(time * 6) * 6 : Math.sin(time * 1.3) * 1.5;
    const cx = x + w * 0.52 + (dancing ? Math.sin(time * 3) * 18 : 0);
    const cy = y + h * 0.55 + bob;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h * (1 - closed));
    ctx.clip();
    ellipse(ctx, cx, cy - 34, 22, 14, '#f4f1e8', { width: 2.5 });
    circle(ctx, cx - 14, cy - 44, 10, '#f4f1e8', { width: 2.5 });
    circle(ctx, cx + 2, cy - 48, 11, '#f4f1e8', { width: 2.5 });
    circle(ctx, cx + 16, cy - 42, 9, '#f4f1e8', { width: 2.5 });
    poly(ctx, [[cx - 18, cy - 24], [cx + 18, cy - 24], [cx + 18, cy - 32], [cx - 18, cy - 32]], '#f4f1e8', { width: 2 });
    // Gesicht: rund, rote Backen, Knollennase, dicker Schnurrbart
    ellipse(ctx, cx, cy, 25, 24, '#e2a47a', { width: 2.5 });
    ellipse(ctx, cx - 14, cy + 6, 6, 4, 'rgba(220, 90, 80, 0.45)', { width: 0 });
    ellipse(ctx, cx + 14, cy + 6, 6, 4, 'rgba(220, 90, 80, 0.45)', { width: 0 });
    const blink = (time % 4.2) < 0.12 ? 0.15 : 1;
    for (const dx of [-9, 9]) {
      ellipse(ctx, cx + dx, cy - 6, 4.5, 4 * blink, '#fff7d8', { width: 1.5 });
      circle(ctx, cx + dx + 1, cy - 6, 2 * blink, '#1a0f08', { width: 0 });
    }
    line(ctx, [[cx - 14, cy - 13], [cx - 4, cy - 12]], '#3a2010', 2.5);
    line(ctx, [[cx + 4, cy - 12], [cx + 14, cy - 13]], '#3a2010', 2.5);
    ellipse(ctx, cx, cy + 1, 5, 5, '#d48a62', { width: 2 });
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy + 12);
    ctx.quadraticCurveTo(cx - 8, cy + 3, cx, cy + 8);
    ctx.quadraticCurveTo(cx + 8, cy + 3, cx + 17, cy + 12);
    ctx.quadraticCurveTo(cx + 8, cy + 9, cx, cy + 12);
    ctx.quadraticCurveTo(cx - 8, cy + 9, cx - 17, cy + 12);
    ctx.fillStyle = '#3a2010';
    ctx.fill();
    if (dancing) ellipse(ctx, cx, cy + 17, 5, 3, '#8a3a3a', { width: 1.5 });
    ctx.restore();
  }
  if (closed <= 0) return;
  const bottom = y + h * closed;
  poly(ctx, [[x, y], [x + w, y], [x + w, bottom], [x, bottom]], vertical(ctx, y, bottom, ['#b9a27a', '#8d7652']), { width: 3 });
  for (let ly = y + 9; ly < bottom - 2; ly += 9) line(ctx, [[x + 2, ly], [x + w - 2, ly]], 'rgba(40, 25, 10, 0.5)', 1.5);
  line(ctx, [[x + w / 2 - 10, bottom - 4], [x + w / 2 + 10, bottom - 4]], '#3b2412', 4);
}

// Plattenteller: Schallplatte (dreht sich, wenn Musik läuft) und Tonarm; Kurbel an der Seite
export function paintGramophone(ctx, { hasCrank, record, playing, time }) {
  const [tx, ty] = GRAMOPHONE.turntable;
  if (record) {
    ellipse(ctx, tx, ty - 2, 44, 13, '#111', { width: 2 });
    for (const r of [36, 28, 20]) ellipse(ctx, tx, ty - 2, r, r * 0.29, null, { stroke: 'rgba(255, 255, 255, 0.12)', width: 1 });
    ellipse(ctx, tx, ty - 2, 12, 3.6, record === 'waltz' ? '#d2463a' : '#3d6fb6', { width: 1 });
    const angle = playing ? time * 5 : 0.4;
    line(ctx, [[tx + Math.cos(angle) * 30, ty - 2 + Math.sin(angle) * 9], [tx + Math.cos(angle) * 40, ty - 2 + Math.sin(angle) * 12]], 'rgba(255, 255, 255, 0.4)', 2);
  }
  // Tonarm
  line(ctx, [[tx + 50, ty - 18], [tx + 40, ty - 14], [tx + (playing ? 14 : 30), ty - (playing ? 4 : 20)]], '#c9c9c9', 4);
  circle(ctx, tx + 50, ty - 18, 4, '#888', { width: 2 });
  if (hasCrank) {
    const [cx, cy] = P(-246, 106, 0.48);
    const turn = playing ? time * 2 : 0;
    const ex = cx - 18 + Math.cos(turn) * 4, ey = cy + Math.sin(turn) * 10;
    line(ctx, [[cx, cy], [cx - 18, cy], [ex, ey + 12]], '#3b3b3b', 5);
    circle(ctx, ex, ey + 14, 4, '#7b4a26', { width: 2 });
  }
  if (playing) {
    const [hx, hy] = GRAMOPHONE.horn;
    for (let i = 0; i < 3; i++) {
      const t = (time * 0.6 + i / 3) % 1;
      ctx.save();
      ctx.globalAlpha = Math.sin(Math.PI * t);
      ctx.font = 'bold 26px serif';
      ctx.fillStyle = '#ffe2a0';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 4;
      const nx = hx + 60 + t * 90 + Math.sin(t * 9 + i) * 10, ny = hy - 30 - t * 110;
      ctx.strokeText(i % 2 ? '♪' : '♫', nx, ny);
      ctx.fillText(i % 2 ? '♪' : '♫', nx, ny);
      ctx.restore();
    }
  }
}

// Im Dunkeln sitzen die Gäste an Tisch 4 – nur als schwache, bläuliche Schemen zu sehen
export function paintGhosts(ctx, scene) {
  const level = scene.darkLevel * (scene.flags.ghosts ?? 0);
  if (level <= 0.05) return;
  const seats = [1, 3];
  if (!scene.flags.brandtGone) seats.push(2);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const seat of seats) {
    const { X, Z } = SEATS[seat];
    const far = Z > 0.6;
    const [x, y] = P(X - 4, far ? 74 : 50, far ? Z + 0.07 : Z - 0.07);
    const s = 1 / Z;
    const flicker = 0.75 + 0.25 * Math.sin(scene.time * 7 + seat * 2);
    const alpha = 0.32 * level * flicker;
    ctx.fillStyle = `rgba(150, 175, 255, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y - 30 * s, 13 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 62 * s, 8 * s, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, x, y - 40 * s, 40 * s, '150, 175, 255', alpha * 0.6, 'screen');
  }
  ctx.restore();
}

// Der Vierkantschlüssel auf Herrn Brandts Teller
export function paintKeyOnPlate(ctx, time) {
  const [x, y] = P(SEATS[2].X - 14, 74, 0.645);
  const s = 1 / 0.645;
  line(ctx, [[x - 8 * s, y], [x + 6 * s, y - 1 * s]], '#c0c6cc', 4);
  poly(ctx, [[x + 5 * s, y - 4 * s], [x + 11 * s, y - 4 * s], [x + 11 * s, y + 2 * s], [x + 5 * s, y + 2 * s]], '#c0c6cc', { width: 2 });
  circle(ctx, x - 10 * s, y, 3.5 * s, null, { stroke: '#c0c6cc', width: 3 });
  glow(ctx, x, y, 22 * s, '255, 240, 200', 0.25 + 0.15 * Math.sin(time * 3), 'screen');
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

const glassArea = (seat) => {
  const [x, y] = glassBase(seat);
  return rect(x - 20, y - 52, 62, 58);
};

export const diningCar = {
  id: 'diningCar',
  name: 'Speisewagen',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },
  outside: outsideFor(),

  props: [
    { id: 'shutter', paint: (ctx, scene) => paintHatchShutter(ctx, scene.flags.shutter ?? 0, scene.time, { dancing: scene.flags.dancing }) },
    {
      id: 'gramophone',
      paint: (ctx, scene) => paintGramophone(ctx, {
        hasCrank: scene.flags.crankOn,
        record: scene.flags.record,
        playing: scene.flags.music,
        time: scene.time,
      }),
    },
    { id: 'keyOnPlate', when: 'keyOnPlate', paint: (ctx, scene) => paintKeyOnPlate(ctx, scene.time) },
    {
      id: 'ghosts',
      paint: (ctx, scene) => paintGhosts(ctx, scene),
      light: (scene) => ((scene.flags.ghosts ?? 0) > 0.3 && scene.isDark ? [1, 2, 3].map((seat) => {
        const { X, Z } = SEATS[seat];
        const far = Z > 0.6;
        const [x, y] = P(X - 4, far ? 74 : 50, far ? Z + 0.07 : Z - 0.07);
        return { x, y: y - 40 / Z, radius: 34 / Z };
      }) : null),
    },
    ...[1, 2, 3, 4].map((seat) => ({
      id: `glass${seat}`,
      paint: (ctx, scene) => {
        const f = scene.flags;
        paintNameCard(ctx, seat, { fallen: f.tipped === seat });
        if (f.takenSeat === seat || f.emptyTable) return;
        paintGlass(ctx, seat, { tipped: f.tipped === seat, poisonGlow: seat === f.poisonSeat && scene.isDark ? 1 : 0 });
      },
      light: (scene) => {
        const f = scene.flags;
        if (seat !== f.poisonSeat || f.takenSeat === seat || f.tipped || f.emptyTable) return null;
        const [x, y] = glassBase(seat);
        return { x, y: y - 26, radius: 70 };
      },
    })),
  ],

  // Anklickbare Stellen (Reihenfolge = Vorrang). Reaktionen: src/story/wagon2.js
  hotspots: [
    { id: 'keyOnPlate', name: 'Vierkantschlüssel', when: 'keyOnPlate', area: rect(...P(SEATS[2].X - 30, 90, 0.645), 50, 26), walkTo: floor(108, 0.62), facing: 'right' },
    ...[1, 2, 3, 4].map((seat) => ({
      id: `glass${seat}`, name: `Glas – Platz ${seat}`, glows: seat === 2 ? 'poisonVisible' : undefined,
      area: glassArea(seat), walkTo: floor(108, 0.6), facing: 'right',
    })),
    { id: 'bell', name: 'Glocke', area: rect(BELL[0] - 16, BELL[1] - 26, 32, 30), walkTo: floor(-60, 0.9), facing: 'back' },
    { id: 'hatch', name: 'Durchreiche zur Küche', cursor: 'talk', area: rect(...onBackWall(HATCH.x, HATCH.y)), walkTo: floor(-70, 0.92), facing: 'back' },
    { id: 'door', name: 'Tür zum Schlafwagen', area: rect(...onBackWall(DOOR.x, DOOR.y)), walkTo: floor(0, 0.97), facing: 'back' },
    { id: 'menu', name: 'Tafel', cursor: 'look', area: rect(...onBackWall([110, 240], [118, 262])), walkTo: floor(70, 0.93), facing: 'back' },
    { id: 'coat', name: 'Schaffnermantel', area: boxArea({ x: [COAT.x[0] - 6, COAT.x[1] + 6], y: [COAT.y[0], 290], z: [COAT.z, COAT.z + 0.001] }), walkTo: floor(-95, 0.86), facing: 'left' },
    { id: 'plant', name: 'Palme', cursor: 'look', area: boxArea({ x: [196, 256], y: [130, 230], z: [0.84, 0.88] }) },
    { id: 'gramophone', name: 'Grammophon', area: [[95, 455], [95, 375], [150, 350], [225, 215], [235, 120], [340, 120], [340, 225], [250, 360], [232, 455]], walkTo: floor(-108, 0.5), facing: 'left' },
    { id: 'drawer', name: 'Schublade', area: rect(...P(-252, 84, 0.44), (P(-182, 52, 0.44)[0] - P(-252, 84, 0.44)[0]), (P(-182, 52, 0.44)[1] - P(-252, 84, 0.44)[1])), walkTo: floor(-108, 0.48), facing: 'left' },
    { id: 'leftTable', name: 'Tisch', area: boxArea({ x: [-257, -128], y: [40, 110], z: [0.64, 0.8] }), walkTo: floor(-105, 0.7), facing: 'left' },
    { id: 'bench', name: 'Bank an Tisch 4', area: boxArea(BENCH_BACK), walkTo: floor(108, 0.66), facing: 'right' },
    { id: 'table', name: 'Tisch 4', area: boxArea({ x: [122, 257], y: [40, 74], z: [0.52, 0.66] }), walkTo: floor(108, 0.58), facing: 'right' },
    { id: 'stool', name: 'Hocker', cursor: 'look', area: boxArea({ x: [136, 232], y: [0, 50], z: [0.455, 0.495] }) },
    ...WINDOWS.map((w) => ({ id: 'window', name: 'Fenster', cursor: 'look', area: rect(w.from, w.top, w.to - w.from, w.bottom - w.top) })),
  ],

  train: trainFor([
    { x: 640, y: 56, radius: 190, strength: 0.24 },
    { x: 640, y: 14, radius: 230, strength: 0.24 },
    { x: P(-236, 100, 0.73)[0], y: P(-236, 100, 0.73)[1], radius: 120, strength: 0.22 },
    { x: P(248, 100, 0.6)[0], y: P(248, 100, 0.6)[1], radius: 130, strength: 0.22 },
  ]),

  playerStart: { x: 640, y: 690, facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-104, 0.985),
      floor(104, 0.985),
      floor(110, 0.5),
      floor(126, 0.452),
      floor(240, 0.44),
      floor(240, 0.42),
      floor(-240, 0.42),
      floor(-240, 0.432),
      floor(-168, 0.432),
      floor(-110, 0.5),
    ],
    holes: [],
  },
};
