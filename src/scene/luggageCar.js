import { OUTLINE, circle, ellipse, glow, grime, line, poly, seeded, vertical } from '../core/paint.js';
import {
  CEILING, NEAR, P, PERSPECTIVE, WALL, WINDOWS, box, boxArea, floor, onBackWall, outsideFor, paintShell, paintWindows,
  rect, rivets, roundRect, shade, sign, trainFor,
} from './wagonPainter.js';

// Szene 4: der Gepäckwagen.
//
// Links: ein Stapel Koffer (darunter Koffer Nr. 7 – „Detektei J.“) und vier nummerierte Kisten.
// Hinten links der Dienstschrank (Vierkantschloss), in der Mitte die Schiebetür zum Postwagen
// (Vorhängeschloss), rechts Postsäcke. Rechts: ein großer Schrankkoffer und der Käfig von Kasimir,
// dem Papagei – unter einem Tuch. Von der Decke hängt eine schwingende Lampe.
// Reaktionen: src/story/wagon4.js

const DOOR = { x: [-96, 96], y: [0, 290] };
const LOCKER = { x: [-238, -124], y: [0, 252], z: [0.935, 1] };
const SACKS = { x: [112, 246], y: [0, 96], z: [0.9, 1] };
export const TRUNK = { x: [164, 250], y: [0, 236], z: [0.76, 0.86] };
const STAND = { x: [186, 250], y: [0, 72], z: [0.575, 0.645] };
export const CAGE = { X: 218, Y: 72, Z: 0.61, radius: 30, height: 104 };
export const SUITCASE7 = { x: [-246, -146], y: [116, 160], z: [0.468, 0.51] }; // liegt oben auf den Kisten
export const CRATES = {
  1: { x: [-255, -196], y: [0, 58], z: [0.455, 0.515] },
  2: { x: [-255, -196], y: [58, 116], z: [0.455, 0.515] },
  3: { x: [-191, -132], y: [0, 58], z: [0.455, 0.515] },
  4: { x: [-191, -132], y: [58, 116], z: [0.455, 0.515] },
};
const LAMP = { X: 0, Z: 0.74, top: CEILING, length: 70 };

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  paintShell(ctx, {
    seed: 47,
    wall: ['#4a3826', '#5e4630', '#463422'],
    panel: '#3a2a1a',
    panelHeight: 60,
    rail: '#2a1e12',
    back: ['#3e2e1e', '#544030'],
    ceiling: '#241a10',
    floor: ['#2e2216', '#4e3a26'],
    planks: 46,
    rack: false,
  });
  paintPlankWalls(ctx);
  paintWindows(ctx, [WINDOWS[1], WINDOWS[4]], { frame: '#2e2216' });
  for (const w of [WINDOWS[1], WINDOWS[4]]) {
    for (let x = w.from + 14; x < w.to; x += 18) line(ctx, [[x, w.top - 4], [x, w.bottom + 4]], '#26292c', 5);
  }
  // Haken und Netze an der Decke
  paintLockerAndDoor(ctx);
  paintSacks(ctx);
  paintSuitcaseStack(ctx);
  paintCratesBase(ctx);
  paintTrunk(ctx);
  box(ctx, STAND, { front: '#6b4a2a', top: '#86603a' });
  stencil(ctx, STAND, 'LEBENDE TIERE', 9);
}

// Bretterwände: waagerechte Fugen an den Seitenwänden und der Rückwand
function paintPlankWalls(ctx) {
  for (const side of [-1, 1]) {
    const X = side * WALL;
    for (let Y = 70; Y < CEILING; Y += 26) line(ctx, [P(X, Y, 1), P(X, Y, NEAR)], 'rgba(20, 12, 4, 0.45)', 2);
    for (let z = 0.96; z > NEAR; z -= 0.09) line(ctx, [P(X, 60, z), P(X, CEILING, z)], 'rgba(20, 12, 4, 0.3)', 3);
    // Querstreben
    for (const z of [0.9, 0.62, 0.42]) {
      poly(ctx, [P(X, 60, z), P(X, CEILING, z), P(X, CEILING, z - 0.03), P(X, 60, z - 0.03)], '#3a2a1a', { width: 2 });
    }
  }
  const [x0, y0] = P(-WALL, CEILING, 1);
  const [x1, y1] = P(WALL, 0, 1);
  for (let y = y0 + 22; y < y1; y += 24) line(ctx, [[x0, y], [x1, y]], 'rgba(20, 12, 4, 0.4)', 2);
  grime(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { count: 60, seed: 9, alpha: 0.12, size: [6, 30] });
}

// Schablonenschrift auf der Vorderseite einer Kiste
function stencil(ctx, crate, text, size = 14) {
  const cx = (crate.x[0] + crate.x[1]) / 2, cy = (crate.y[0] + crate.y[1]) / 2;
  const [x, y] = P(cx, cy, crate.z[0]);
  sign(ctx, text, x, y, { font: `bold ${Math.round(size / crate.z[0])}px "Courier New", monospace`, color: 'rgba(30, 18, 8, 0.75)' });
}

function paintLockerAndDoor(ctx) {
  // Schiebetür
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  line(ctx, [[x - 30, y - 16], [x + w + 60, y - 16]], '#2b2b2b', 8);
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#6d7480', '#4b515a']), { width: 4 });
  for (let i = 1; i < 4; i++) line(ctx, [[x + 6, y + (h * i) / 4], [x + w - 6, y + (h * i) / 4]], 'rgba(20, 22, 28, 0.6)', 3);
  line(ctx, [[x + 6, y + 6], [x + w - 6, y + h - 6]], 'rgba(20, 22, 28, 0.35)', 6);
  line(ctx, [[x + w - 6, y + 6], [x + 6, y + h - 6]], 'rgba(20, 22, 28, 0.35)', 6);
  rivets(ctx, [[x + 8, y + 8], [x + w - 8, y + 8], [x + 8, y + h - 8], [x + w - 8, y + h - 8], [x + w / 2, y + 8], [x + w / 2, y + h - 8]], 3.5);
  // Griffbügel rechts
  roundRect(ctx, x + w - 34, y + 120, 18, 70, 6);
  ctx.lineWidth = 6;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#a8adb4';
  ctx.stroke();
  // Schild
  roundRect(ctx, x + w / 2 - 70, y + 24, 140, 30, 4);
  ctx.fillStyle = '#e8c74a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'POSTWAGEN', x + w / 2, y + 40, { font: 'bold 16px "Trebuchet MS", sans-serif', color: '#2b2118' });
  // Ein Posthorn
  const px = x + w / 2, py = y + 82;
  ctx.beginPath();
  ctx.arc(px, py, 12, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#e8c74a';
  ctx.stroke();
  line(ctx, [[px + 12, py], [px + 30, py - 6]], '#e8c74a', 4);

  // Dienstschrank (Rahmen und Korpus; die Türen malt die bewegliche Ebene)
  box(ctx, LOCKER, { front: '#2e4a3a', top: '#3a5a48', side: '#22382c' });
  const [lx0, ly0] = P(LOCKER.x[0], LOCKER.y[1], LOCKER.z[0]);
  const [lx1, ly1] = P(LOCKER.x[1], LOCKER.y[0], LOCKER.z[0]);
  poly(ctx, [[lx0 + 8, ly0 + 8], [lx1 - 8, ly0 + 8], [lx1 - 8, ly1 - 8], [lx0 + 8, ly1 - 8]], '#141c18', { width: 2 });
  // Innenleben: Haken für das Brecheisen, ein Fach
  line(ctx, [[lx0 + 14, ly0 + 110], [lx1 - 14, ly0 + 110]], '#3a3a3a', 4);
}

export const LOCKER_FRONT = (() => {
  const [x0, y0] = P(LOCKER.x[0], LOCKER.y[1], LOCKER.z[0]);
  const [x1, y1] = P(LOCKER.x[1], LOCKER.y[0], LOCKER.z[0]);
  return { x0, y0, x1, y1 };
})();

function paintSacks(ctx) {
  const rand = seeded(5);
  const sacks = [[130, 0.97, 60], [196, 0.98, 70], [160, 0.93, 54], [222, 0.92, 48]];
  for (const [X, Z, H] of sacks) {
    const [x, y] = P(X, 0, Z);
    const [, top] = P(X, H, Z);
    const r = 34 / Z;
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
    sign(ctx, 'POST', x, (y + top) / 2 + 6, { font: `bold ${Math.round(11 / Z)}px "Courier New", monospace`, color: 'rgba(120, 30, 20, 0.7)' });
  }
  // Briefe, die herausgefallen sind
  for (const [X, Z, a] of [[150, 0.88, 0.3], [184, 0.875, -0.4], [120, 0.86, 0.1]]) {
    const [x, y] = P(X, 0, Z);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.scale(1, 0.45);
    poly(ctx, [[-14, -9], [14, -9], [14, 9], [-14, 9]], '#efe2c0', { width: 2 });
    line(ctx, [[-14, -9], [0, 2], [14, -9]], 'rgba(60, 40, 20, 0.6)', 1.5);
    ctx.restore();
  }
}

function suitcase(ctx, s, color, { tag = null, straps = true } = {}) {
  box(ctx, s, { front: color, top: shade(color, 0.12), side: shade(color, -0.2) });
  const midX = (s.x[0] + s.x[1]) / 2;
  const [hx, hy] = P(midX, s.y[1], s.z[0] + 0.005);
  ctx.beginPath();
  ctx.arc(hx, hy, 9 / s.z[0] * 0.6, Math.PI, 0);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#1e140c';
  ctx.stroke();
  if (straps) {
    for (const X of [s.x[0] + (s.x[1] - s.x[0]) * 0.25, s.x[0] + (s.x[1] - s.x[0]) * 0.75]) {
      line(ctx, [P(X, s.y[0], s.z[0]), P(X, s.y[1], s.z[0])], 'rgba(30, 18, 8, 0.6)', 4);
    }
  }
  if (tag) {
    const [tx, ty] = P(s.x[1] - 6, s.y[1] - 4, s.z[0]);
    line(ctx, [[tx, ty], [tx + 6, ty + 10]], '#8a6a3a', 1.5);
    poly(ctx, [[tx - 2, ty + 10], [tx + 22, ty + 10], [tx + 22, ty + 26], [tx - 2, ty + 26]], '#efe2c0', { width: 1.5 });
    sign(ctx, tag, tx + 10, ty + 18, { font: 'bold 10px "Trebuchet MS", sans-serif', color: '#5a1018' });
  }
}

function paintSuitcaseStack(ctx) {
  const colors = ['#7b3a22', '#3b5a6b', '#6b6b3a', '#5a3a6b', '#8a5a2a', '#2e5a3a', '#7a2a3a', '#4a4a5a'];
  const rand = seeded(12);
  // von hinten nach vorne, von unten nach oben
  for (let z = 0.88; z > 0.68; z -= 0.07) {
    let Y = 0;
    for (let level = 0; level < 4; level++) {
      const h = 34 + rand() * 26;
      const inset = rand() * 20;
      suitcase(ctx, { x: [-255 + inset * 0.3, -150 - inset], y: [Y, Y + h], z: [z - 0.06, z] }, colors[Math.floor(rand() * colors.length)], { tag: rand() < 0.4 ? String(Math.floor(rand() * 40) + 10) : null });
      Y += h;
      if (Y > 210) break;
    }
  }
}

function paintCratesBase(ctx) {
  for (const [number, crate] of Object.entries(CRATES)) {
    box(ctx, crate, { front: '#8a6a3a', top: '#a07a44', side: '#6b5230' });
    // Bretter und Querlatte
    const [x0, y0] = P(crate.x[0], crate.y[1], crate.z[0]);
    const [x1, y1] = P(crate.x[1], crate.y[0], crate.z[0]);
    for (let i = 1; i < 3; i++) line(ctx, [[x0, y0 + ((y1 - y0) * i) / 3], [x1, y0 + ((y1 - y0) * i) / 3]], 'rgba(40, 25, 10, 0.5)', 2);
    line(ctx, [[x0 + 4, y1 - 4], [x1 - 4, y0 + 4]], '#6b4a24', 6);
    sign(ctx, number, (x0 + x1) / 2, (y0 + y1) / 2 + 2, { font: 'bold 34px "Courier New", monospace', color: 'rgba(25, 14, 6, 0.8)' });
    rivets(ctx, [[x0 + 6, y0 + 6], [x1 - 6, y0 + 6], [x0 + 6, y1 - 6], [x1 - 6, y1 - 6]], 2.5);
  }
}

function paintTrunk(ctx) {
  box(ctx, TRUNK, { front: '#5a2a1e', top: '#6e3626', side: '#4a2218' });
  // Beschläge und Kanten
  const corners = [];
  for (const Y of [TRUNK.y[0] + 10, TRUNK.y[1] - 10]) for (const Z of [TRUNK.z[0] + 0.006, TRUNK.z[1] - 0.006]) corners.push(P(TRUNK.x[0], Y, Z));
  rivets(ctx, corners, 4);
  for (const Y of [60, 120, 180]) line(ctx, [P(TRUNK.x[0], Y, TRUNK.z[0]), P(TRUNK.x[0], Y, TRUNK.z[1])], '#c99a4a', 3);
  // Türfuge auf der Gangseite
  line(ctx, [P(TRUNK.x[0], 4, (TRUNK.z[0] + TRUNK.z[1]) / 2), P(TRUNK.x[0], 232, (TRUNK.z[0] + TRUNK.z[1]) / 2)], OUTLINE, 3);
  // Etikett auf der Vorderseite
  const [lx0, ly0] = P(TRUNK.x[0] + 14, 176, TRUNK.z[0]);
  const [lx1, ly1] = P(TRUNK.x[1] - 14, 140, TRUNK.z[0]);
  poly(ctx, [[lx0, ly0], [lx1, ly0], [lx1, ly1], [lx0, ly1]], '#efe2c0', { width: 2 });
  sign(ctx, 'NICHT', (lx0 + lx1) / 2, ly0 + (ly1 - ly0) * 0.32, { font: 'bold 15px "Trebuchet MS", sans-serif', color: '#b3261e' });
  sign(ctx, 'ÖFFNEN', (lx0 + lx1) / 2, ly0 + (ly1 - ly0) * 0.72, { font: 'bold 15px "Trebuchet MS", sans-serif', color: '#b3261e' });
}

// ============================================================================================
//  Bewegliche Teile
// ============================================================================================

// Die Türen des Dienstschranks (zu oder offen) – und was drin liegt
export function paintLocker(ctx, { open, crowbar, manifest }) {
  const { x0, y0, x1, y1 } = LOCKER_FRONT;
  const mid = (x0 + x1) / 2;
  if (!open) {
    for (const [a, b] of [[x0, mid], [mid, x1]]) {
      poly(ctx, [[a, y0], [b, y0], [b, y1], [a, y1]], vertical(ctx, y0, y1, ['#3a5e4a', '#2e4a3a']), { width: 3 });
      for (let y = y0 + 16; y < y0 + 56; y += 8) line(ctx, [[a + 10, y], [b - 10, y]], 'rgba(10, 20, 14, 0.6)', 2);
    }
    // Vierkantschloss
    poly(ctx, [[mid - 9, y0 + 120], [mid + 9, y0 + 120], [mid + 9, y0 + 138], [mid - 9, y0 + 138]], '#c9a24a', { width: 2 });
    poly(ctx, [[mid - 3, y0 + 126], [mid + 3, y0 + 126], [mid + 3, y0 + 132], [mid - 3, y0 + 132]], OUTLINE, { width: 0 });
    sign(ctx, 'DIENST', mid, y0 + 30, { font: 'bold 12px "Trebuchet MS", sans-serif', color: '#e8d6a0' });
    return;
  }
  // offene Türen, nach außen geklappt
  const w = (x1 - x0) / 2;
  poly(ctx, [[x0, y0], [x0 - w * 0.55, y0 - 10], [x0 - w * 0.55, y1 + 10], [x0, y1]], '#2e4a3a', { width: 3 });
  poly(ctx, [[x1, y0], [x1 + w * 0.55, y0 - 10], [x1 + w * 0.55, y1 + 10], [x1, y1]], '#2e4a3a', { width: 3 });
  if (crowbar) {
    line(ctx, [[x0 + 30, y0 + 40], [x0 + 40, y1 - 30]], OUTLINE, 9);
    line(ctx, [[x0 + 30, y0 + 40], [x0 + 40, y1 - 30]], '#b3261e', 5);
  }
  if (manifest) {
    poly(ctx, [[mid + 6, y0 + 70], [x1 - 14, y0 + 66], [x1 - 12, y0 + 104], [mid + 8, y0 + 106]], '#efe6d2', { width: 2 });
  }
}

// Kiste mit aufgehebeltem Brett
export function paintCrateOpen(ctx, number) {
  const crate = CRATES[number];
  const [x0, y0] = P(crate.x[0], crate.y[1], crate.z[0]);
  const [x1, y1] = P(crate.x[1], crate.y[0], crate.z[0]);
  poly(ctx, [[x0 + 6, y0 + 6], [x1 - 6, y0 + 6], [x1 - 6, y1 - 6], [x0 + 6, y1 - 6]], '#1e140a', { width: 2 });
  // Stroh
  for (let i = 0; i < 9; i++) line(ctx, [[x0 + 10 + i * 9, y1 - 8], [x0 + 18 + i * 8, y1 - 26 - (i % 3) * 6]], '#d9b862', 2);
  // abgerissenes Brett schräg davor
  ctx.save();
  ctx.translate(x1 - 6, y1 + 4);
  ctx.rotate(-0.5);
  poly(ctx, [[-10, -8], [x1 - x0 - 6, -8], [x1 - x0 - 6, 8], [-10, 8]], '#8a6a3a', { width: 2 });
  ctx.restore();
}

// Kasimir im Käfig (mit oder ohne Tuch)
export function paintCage(ctx, { covered, time, talking, eating }) {
  const { X, Y, Z, radius, height } = CAGE;
  const [cx, base] = P(X, Y, Z);
  const [, top] = P(X, Y + height, Z);
  const r = radius / Z;
  if (covered) {
    // Tuch über dem Käfig, bewegt sich ganz leicht
    const flutter = Math.sin(time * 2) * 2;
    ctx.beginPath();
    ctx.moveTo(cx - r - 10, base + 10);
    ctx.quadraticCurveTo(cx - r - 6, top + 20, cx - r * 0.4, top - 4 + flutter);
    ctx.quadraticCurveTo(cx, top - 18, cx + r * 0.4, top - 4 - flutter);
    ctx.quadraticCurveTo(cx + r + 6, top + 20, cx + r + 10, base + 10);
    for (let i = 0; i <= 8; i++) ctx.lineTo(cx + r + 10 - (i * (2 * r + 20)) / 8, base + 10 + (i % 2 ? 8 : 0));
    ctx.closePath();
    ctx.fillStyle = vertical(ctx, top, base, ['#8a2a3a', '#6a1e2c']);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    for (const dx of [-0.5, 0, 0.5]) line(ctx, [[cx + dx * r, top + 6], [cx + dx * r * 1.3, base]], 'rgba(30, 5, 10, 0.35)', 2);
    ctx.beginPath();
    ctx.arc(cx, top - 16, 8, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c9a24a';
    ctx.stroke();
    line(ctx, [[cx - r - 8, base + 4], [cx + r + 8, base + 4]], '#e8c46a', 3);
    return;
  }
  // Boden
  ellipse(ctx, cx, base, r, r * 0.3, '#c9a24a', { width: 3 });
  // Kasimir: grüner Papagei auf der Stange
  const bob = Math.sin(time * (eating ? 12 : 3)) * (eating ? 3 : 1.5);
  const tilt = Math.sin(time * 0.7) * 0.25 + (talking ? Math.sin(time * 14) * 0.08 : 0);
  const px = cx, py = base - (height * 0.42) / Z;
  line(ctx, [[cx - r * 0.8, py + 22], [cx + r * 0.8, py + 22]], '#6b4a2a', 4);
  ctx.save();
  ctx.translate(px, py + bob);
  ctx.rotate(tilt * 0.4);
  // Schwanz
  poly(ctx, [[-4, 14], [4, 14], [10, 58], [-2, 60]], '#2e7aa8', { width: 2.5 });
  // Körper
  ellipse(ctx, 0, 6, 16, 22, '#3fa04a', { width: 3 });
  ellipse(ctx, 6, 8, 8, 14, '#2e7a38', { width: 0 });
  // Flügel
  ellipse(ctx, -9, 10, 8, 16, '#2e8a3a', { width: 2.5, rotation: 0.2 });
  ctx.rotate(tilt);
  // Kopf
  circle(ctx, 2, -20, 13, '#4ab856', { width: 3 });
  ellipse(ctx, 8, -18, 6, 5, '#f4f0e0', { width: 0 });
  circle(ctx, 8, -21, 2.6, OUTLINE, { width: 0 });
  // Schnabel (öffnet sich beim Reden)
  const open = talking ? Math.abs(Math.sin(time * 14)) * 5 : eating ? Math.abs(Math.sin(time * 12)) * 3 : 0;
  poly(ctx, [[12, -22], [24, -16 - open * 0.3], [14, -12]], '#e8c46a', { width: 2 });
  poly(ctx, [[13, -12 + open * 0.2], [21, -10 + open], [13, -8 + open]], '#c9a24a', { width: 2 });
  // Federschopf
  for (const a of [-0.6, -0.3, 0]) line(ctx, [[0, -32], [Math.sin(a) * 12, -42 - Math.cos(a) * 4]], '#f05a3a', 3);
  ctx.restore();
  // Gitterstäbe vor dem Vogel
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#c9a24a';
  for (let i = -5; i <= 5; i++) {
    const t = i / 5;
    const x = cx + t * r;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x, top + r * 0.6 * (1 - Math.sqrt(1 - t * t)) + 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(cx, top + r * 0.6, r, r * 0.6, 0, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, top - 6, 7, 0, Math.PI * 2);
  ctx.stroke();
  ellipse(ctx, cx, base, r, r * 0.3, null, { stroke: OUTLINE, width: 2 });
  if (eating) {
    for (let i = 0; i < 6; i++) circle(ctx, cx - 12 + i * 5, base - 3, 2, '#e8c46a', { width: 0 });
  }
}

// Koffer Nr. 7: zu oder offen (Deckel hochgeklappt)
export function paintSuitcase7(ctx, { open }) {
  const s = SUITCASE7;
  if (!open) {
    suitcase(ctx, s, '#8a5a2a', { tag: '7' });
    const [x, y] = P(s.x[0] + 30, s.y[1] - 18, s.z[0]);
    // Zahlenschloss
    poly(ctx, [[x - 14, y - 7], [x + 14, y - 7], [x + 14, y + 7], [x - 14, y + 7]], '#c0c6cc', { width: 2 });
    for (let i = 0; i < 3; i++) poly(ctx, [[x - 11 + i * 8, y - 4], [x - 5 + i * 8, y - 4], [x - 5 + i * 8, y + 4], [x - 11 + i * 8, y + 4]], '#f4f4f4', { width: 1 });
    // „J.“ auf dem Deckel
    const [jx, jy] = P(s.x[1] - 30, s.y[1] - 22, s.z[0]);
    sign(ctx, 'J.', jx, jy, { font: 'bold 22px "Noteworthy", "Comic Sans MS", cursive', color: '#f4e2b8' });
    return;
  }
  box(ctx, { x: s.x, y: [s.y[0], s.y[1] - 18], z: s.z }, { front: '#8a5a2a', top: '#2a1a0e', side: '#6b4422' });
  // Deckel steht hoch
  poly(ctx, [P(s.x[0], s.y[1] - 18, s.z[1]), P(s.x[1], s.y[1] - 18, s.z[1]), P(s.x[1], s.y[1] + 56, s.z[1] + 0.01), P(s.x[0], s.y[1] + 56, s.z[1] + 0.01)], '#7b4f24', { width: 3 });
  const [x, y] = P((s.x[0] + s.x[1]) / 2, s.y[1] - 18, (s.z[0] + s.z[1]) / 2);
  ellipse(ctx, x, y, 34, 6, '#efe2c0', { width: 1.5 });
}

// Die schwingende Lampe an der Decke
export function lampPosition(time) {
  const swing = Math.sin(time * 1.4) * 0.22;
  const [topX, topY] = P(LAMP.X, LAMP.top, LAMP.Z);
  const length = LAMP.length / LAMP.Z;
  return { topX, topY, x: topX + Math.sin(swing) * length, y: topY + Math.cos(swing) * length, swing };
}

export function paintLamp(ctx, time, on) {
  const { topX, topY, x, y, swing } = lampPosition(time);
  line(ctx, [[topX, topY], [x, y]], '#111', 3);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-swing);
  poly(ctx, [[-10, 0], [10, 0], [26, 22], [-26, 22]], '#3a4a3a', { width: 3 });
  ellipse(ctx, 0, 24, 10, 6, on ? '#fff2c0' : '#4a4030', { width: 2 });
  ctx.restore();
  if (on) {
    glow(ctx, x, y + 26, 260, '255, 200, 120', 0.32);
    glow(ctx, x, y + 26, 40, '255, 240, 200', 0.6);
  }
}

// Der andere Joseph – müder, dunkler. Er steht vor dem Schrankkoffer (Bild: Josephs eigenes Standbild)
export const STRANGER = { image: null, x: P(150, 0, 0.75)[0], y: P(150, 0, 0.75)[1] };
let strangerCache = null;

export function paintStranger(ctx, scene, height) {
  if (!STRANGER.image) return;
  if (!strangerCache) {
    const image = STRANGER.image;
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const c = canvas.getContext('2d');
    c.drawImage(image, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(20, 16, 40, 0.42)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    strangerCache = canvas;
  }
  const scale = (height ?? scene.characterHeightAt(STRANGER.y)) / 720; // wie bei Joseph (player.js)
  const w = strangerCache.width * scale, h = strangerCache.height * scale;
  ctx.drawImage(strangerCache, STRANGER.x - w / 2, STRANGER.y - h, w, h);
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

export const luggageCar = {
  id: 'luggageCar',
  name: 'Gepäckwagen',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },
  outside: outsideFor([1, 4], { windowLight: { color: [140, 160, 255], strength: 0.12 } }),

  props: [
    { id: 'locker', paint: (ctx, scene) => paintLocker(ctx, { open: scene.flags.lockerOpen, crowbar: scene.flags.lockerOpen && !scene.flags.crowbarTaken, manifest: scene.flags.lockerOpen && !scene.flags.manifestTaken }) },
    ...[1, 2, 3, 4].map((number) => ({ id: `crate${number}`, when: `crateOpen${number}`, paint: (ctx) => paintCrateOpen(ctx, number) })),
    { id: 'suitcase7', paint: (ctx, scene) => paintSuitcase7(ctx, { open: scene.flags.suitcaseOpen }) },
    { id: 'cage', paint: (ctx, scene) => paintCage(ctx, { covered: !scene.flags.uncovered, time: scene.time, talking: scene.flags.parrotTalking, eating: scene.flags.parrotEating }) },
    { id: 'trunkOpen', when: 'trunkOpen', paint: (ctx) => paintTrunkOpen(ctx) },
    { id: 'stranger', when: 'strangerVisible', paint: (ctx, scene) => paintStranger(ctx, scene), depth: STRANGER.y },
    { id: 'lamp', paint: (ctx, scene) => paintLamp(ctx, scene.time, !scene.isDark) },
    { id: 'doorGap', when: 'doorOpen', paint: (ctx) => paintDoorGap(ctx) },
  ],

  hotspots: [
    { id: 'suitcase7', name: 'Koffer Nr. 7', area: boxArea({ x: SUITCASE7.x, y: [SUITCASE7.y[0], SUITCASE7.y[1] + 30], z: SUITCASE7.z }), walkTo: floor(-108, 0.5), facing: 'left' },
    ...[2, 4, 1, 3].map((number) => ({ id: `crate${number}`, name: `Kiste ${number}`, area: boxArea(CRATES[number]), walkTo: floor(-105, 0.5), facing: 'left' })),
    { id: 'stack', name: 'Kofferstapel', area: boxArea({ x: [-257, -150], y: [0, 230], z: [0.6, 0.9] }), walkTo: floor(-120, 0.74), facing: 'left' },
    { id: 'cage', name: 'Käfig', cursor: 'talk', area: boxArea({ x: [CAGE.X - CAGE.radius - 8, CAGE.X + CAGE.radius + 8], y: [CAGE.Y, CAGE.Y + CAGE.height + 12], z: [CAGE.Z - 0.01, CAGE.Z + 0.01] }), walkTo: floor(140, 0.62), facing: 'right' },
    { id: 'trunk', name: 'Schrankkoffer', area: boxArea(TRUNK), walkTo: floor(140, 0.8), facing: 'right' },
    { id: 'locker', name: 'Dienstschrank', area: rect(LOCKER_FRONT.x0, LOCKER_FRONT.y0, LOCKER_FRONT.x1 - LOCKER_FRONT.x0, LOCKER_FRONT.y1 - LOCKER_FRONT.y0), walkTo: floor(-90, 0.94), facing: 'back' },
    { id: 'door', name: 'Tür zum Postwagen', area: rect(...onBackWall(DOOR.x, DOOR.y)), walkTo: floor(20, 0.97), facing: 'back' },
    { id: 'sacks', name: 'Postsäcke', area: boxArea({ x: [100, 250], y: [0, 80], z: [0.86, 1] }), walkTo: floor(96, 0.88), facing: 'back' },
    { id: 'stand', name: 'Kiste „Lebende Tiere“', cursor: 'look', area: boxArea(STAND) },
    { id: 'lamp', name: 'Lampe', cursor: 'look', area: rect(lampPosition(0).topX - 50, lampPosition(0).topY, 100, 110) },
    ...[WINDOWS[1], WINDOWS[4]].map((w) => ({ id: 'window', name: 'Fenster', cursor: 'look', area: rect(w.from, w.top, w.to - w.from, w.bottom - w.top) })),
  ],

  train: trainFor([
    { x: 640, y: 120, radius: 260, strength: 0.2 },
  ]),

  playerStart: { x: 640, y: 690, facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-108, 0.985),
      floor(100, 0.985),
      floor(100, 0.9),
      floor(150, 0.88),
      floor(152, 0.445),
      floor(225, 0.435),
      floor(225, 0.42),
      floor(-225, 0.42),
      floor(-225, 0.44),
      floor(-120, 0.45),
      floor(-120, 0.53),
      floor(-140, 0.59),
      floor(-140, 0.9),
      floor(-112, 0.93),
    ],
    holes: [],
  },
};

function paintTrunkOpen(ctx) {
  // Die Tür des Schrankkoffers steht offen: dunkles Inneres auf der Gangseite
  const zMid = (TRUNK.z[0] + TRUNK.z[1]) / 2;
  poly(ctx, [P(TRUNK.x[0], 6, TRUNK.z[0] + 0.006), P(TRUNK.x[0], 230, TRUNK.z[0] + 0.006), P(TRUNK.x[0], 230, TRUNK.z[1] - 0.006), P(TRUNK.x[0], 6, TRUNK.z[1] - 0.006)], '#0e0806', { width: 3 });
  poly(ctx, [P(TRUNK.x[0], 6, TRUNK.z[0]), P(TRUNK.x[0], 230, TRUNK.z[0]), P(TRUNK.x[0] - 60, 228, TRUNK.z[0] - 0.02), P(TRUNK.x[0] - 60, 8, TRUNK.z[0] - 0.02)], '#5a2a1e', { width: 3 });
  line(ctx, [P(TRUNK.x[0] - 2, 40, zMid), P(TRUNK.x[0] - 2, 200, zMid)], 'rgba(0, 0, 0, 0)', 1);
}

function paintDoorGap(ctx) {
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  poly(ctx, [[x, y], [x + 46, y], [x + 46, y + h], [x, y + h]], '#06060c', { width: 3 });
  glow(ctx, x + 23, y + h * 0.4, 70, '180, 200, 255', 0.25);
}
