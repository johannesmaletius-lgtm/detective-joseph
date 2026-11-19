import { OUTLINE, circle, ellipse, glow, line, poly, vertical } from '../core/paint.js';
import {
  P, PERSPECTIVE, WINDOWS, box, boxArea, floor, onBackWall, onSideWall, outsideFor, paintCeilingLamp, paintShell,
  paintWindows, rect, rivets, roundRect, sign, trainFor,
} from './wagonPainter.js';

// Szene 3: der Schlafwagen.
//
// Links ein Etagenbett – unten schläft Frau Adler. Ganz oben auf der Gepäckablage steht ihre Hutschachtel.
// Rechts: Nachttisch mit Stuhl, die Notbremse zwischen den Fenstern, hinten rechts Waschbecken und Spiegel.
// Hinten in der Mitte: das Gitter zum Gepäckwagen mit einem Buchstabenschloss.
// Alle Rollos sind unten (Nachtruhe). Nur das mittlere rechts lässt sich hochziehen – wenn man an die
// abgerissene Schlaufe herankommt. Reaktionen: src/story/wagon3.js

export const MOON_WINDOW = WINDOWS[4]; // das mittlere Fenster rechts – nur hier ist ein Rollo beweglich

const BUNK = { x: [-257, -132], z: [0.52, 1] };
const DOOR = { x: [-90, 90], y: [0, 292] };
const MIRROR = { x: [112, 232], y: [148, 262] };
const BRAKE = { y: [150, 232], z: [0.528, 0.566] };
const HATBOX_UP = { x: [-250, -204], y: [282, 322], z: [0.58, 0.64] };
const HATBOX_DOWN = { x: [-56, -10], y: [0, 40], z: [0.56, 0.61] };
const NIGHT_TABLE = { x: [196, 257], y: [0, 78], z: [0.74, 0.82] };
const CHAIR = { x: [140, 194], y: [0, 44], z: [0.66, 0.72] };
const SUITCASE = { x: [182, 252], y: [0, 44], z: [0.445, 0.49] };

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  paintShell(ctx, {
    seed: 33,
    wall: ['#1f3346', '#28465a', '#1d3142'],
    panel: '#3a2616',
    panelHeight: 100,
    rail: '#b98d4a',
    back: ['#1b2e40', '#24405a'],
    ceiling: '#141f2b',
    floor: ['#2a1a10', '#4a2e1a'],
    planks: 40,
  });
  // Teppich: dunkelblau mit Sternen
  poly(ctx, [P(-80, 0, 1), P(80, 0, 1), P(80, 0, 0.3), P(-80, 0, 0.3)], '#1c2a5a', { width: 0 });
  for (const X of [-72, 72]) line(ctx, [P(X, 0, 1), P(X, 0, 0.3)], '#c9a24a', 2.5);
  for (let z = 0.94; z > 0.33; z -= 0.09) {
    const [x, y] = P(((z * 100) % 2) > 1 ? -30 : 30, 0, z);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1 / z, 0.35 / z);
    ctx.fillStyle = 'rgba(230, 210, 140, 0.55)';
    star(ctx, 0, 0, 7, 3);
    ctx.restore();
  }
  // Fenster: nur das mittlere rechts ist durchsichtig, alle anderen haben fest verschraubte Rollos
  paintWindows(ctx, [MOON_WINDOW], { frame: '#3a2616' });
  for (const [i, w] of WINDOWS.entries()) {
    if (i === 4) continue;
    paintFixedBlind(ctx, w);
  }
  paintCeilingLamp(ctx, 0.95, { width: 70, color: '#9fc4ff' });
  paintCeilingLamp(ctx, 0.76, { width: 70, color: '#9fc4ff' });
  paintGrate(ctx);
  paintWashbasin(ctx);
  paintBrake(ctx);
  paintNightTable(ctx);
  paintSuitcase(ctx);
  paintBunk(ctx);
}

function star(ctx, x, y, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function windowPad(w) {
  return Math.max(8, (w.bottom - w.top) * 0.07);
}

// Ein heruntergelassenes Rollo vor einem Fenster (fest im Bild)
function paintFixedBlind(ctx, w, { closed = 1 } = {}) {
  const pad = windowPad(w);
  roundRect(ctx, w.from - pad, w.top - pad, w.to - w.from + 2 * pad, w.bottom - w.top + 2 * pad, pad * 1.6);
  ctx.fillStyle = '#3a2616';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  paintBlind(ctx, w, closed, { strap: true });
}

// Rollo-Stoff: closed = 1 ganz unten … 0 ganz oben (aufgerollt)
export function paintBlind(ctx, w, closed, { strap = true, torn = false } = {}) {
  const bottom = w.top + (w.bottom - w.top) * closed;
  if (closed > 0.02) {
    poly(ctx, [[w.from, w.top], [w.to, w.top], [w.to, bottom], [w.from, bottom]], vertical(ctx, w.top, bottom, ['#4c6b86', '#3b5670']), { width: 2.5 });
    for (let y = w.top + 12; y < bottom - 4; y += 14) line(ctx, [[w.from + 3, y], [w.to - 3, y]], 'rgba(10, 20, 35, 0.35)', 1.5);
    line(ctx, [[w.from, bottom], [w.to, bottom]], '#c9a24a', 4);
    const mid = (w.from + w.to) / 2;
    if (strap && !torn) {
      line(ctx, [[mid, bottom], [mid, bottom + 16]], '#c9a24a', 2.5);
      circle(ctx, mid, bottom + 20, 4, null, { stroke: '#c9a24a', width: 2.5 });
    }
    if (torn) {
      line(ctx, [[mid - 1, bottom], [mid + 2, bottom + 5]], '#c9a24a', 2);
      // winziger Ring oben in der Leiste
      circle(ctx, mid + 18, w.top + 6, 2.6, null, { stroke: '#e8c46a', width: 1.8 });
    }
  }
  // Rolle oben
  poly(ctx, [[w.from - 6, w.top - 10], [w.to + 6, w.top - 10], [w.to + 6, w.top + 2], [w.from - 6, w.top + 2]], '#2b3f52', { width: 2.5 });
}

function paintGrate(ctx) {
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  // dahinter: dunkler Gepäckwagen mit Kistenumrissen
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#07070d', '#120d0a']), { width: 4 });
  for (const [bx, by, bw, bh] of [[x + 10, y + h - 70, 70, 70], [x + 60, y + h - 120, 60, 50], [x + 118, y + h - 90, 54, 90]]) {
    poly(ctx, [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], '#1e1610', { stroke: '#2e2218', width: 2 });
  }
  glow(ctx, x + w * 0.7, y + 60, 50, '255, 180, 90', 0.18);
  // Rahmen
  roundRect(ctx, x - 12, y - 12, w + 24, h + 12, 10);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#4a4f55';
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Gitterstäbe
  for (let bx = x + 12; bx < x + w; bx += 22) {
    line(ctx, [[bx, y], [bx, y + h]], OUTLINE, 9);
    line(ctx, [[bx, y], [bx, y + h]], '#7d858d', 5);
    line(ctx, [[bx - 1, y], [bx - 1, y + h]], 'rgba(255, 255, 255, 0.25)', 1.5);
  }
  for (const by of [y + 30, y + h / 2, y + h - 30]) {
    line(ctx, [[x, by], [x + w, by]], OUTLINE, 11);
    line(ctx, [[x, by], [x + w, by]], '#8d959d', 7);
  }
  rivets(ctx, [[x + 4, y + 30], [x + w - 4, y + 30], [x + 4, y + h - 30], [x + w - 4, y + h - 30]], 3.5);
  // Schild
  roundRect(ctx, x + w / 2 - 82, y - 46, 164, 28, 6);
  ctx.fillStyle = '#e8d6a0';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'GEPÄCKWAGEN', x + w / 2, y - 32, { font: 'bold 15px "Trebuchet MS", sans-serif', color: '#3b2412' });
  // Buchstabenschloss in der Mitte
  const lx = x + w / 2, ly = y + h / 2 + 4;
  ctx.beginPath();
  ctx.arc(lx, ly - 16, 14, Math.PI, 0);
  ctx.lineWidth = 7;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c0c6cc';
  ctx.stroke();
  roundRect(ctx, lx - 30, ly - 16, 60, 40, 7);
  ctx.fillStyle = vertical(ctx, ly - 16, ly + 24, ['#e9bd62', '#8f5f22']);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    poly(ctx, [[lx - 25 + i * 10.4, ly - 4], [lx - 17 + i * 10.4, ly - 4], [lx - 17 + i * 10.4, ly + 12], [lx - 25 + i * 10.4, ly + 12]], '#d8c8a8', { width: 1.2 });
  }
}

export const MIRROR_CENTER = (() => {
  const [x, y, w, h] = onBackWall(MIRROR.x, MIRROR.y);
  return { x: x + w / 2, y: y + h / 2, width: w, height: h };
})();

function paintWashbasin(ctx) {
  const { x, y, width, height } = MIRROR_CENTER;
  // Spiegel (oval, mit Messingrahmen)
  ellipse(ctx, x, y, width / 2 + 9, height / 2 + 9, '#b98d4a', { width: 3 });
  ellipse(ctx, x, y, width / 2, height / 2, vertical(ctx, y - height / 2, y + height / 2, ['#5d7487', '#2f4152', '#22303d']), { width: 3 });
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  // Beschlag
  ctx.fillStyle = 'rgba(220, 230, 240, 0.18)';
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  line(ctx, [[x - 30, y - 40], [x - 10, y - 50]], 'rgba(255, 255, 255, 0.35)', 4);
  line(ctx, [[x - 34, y - 26], [x - 22, y - 32]], 'rgba(255, 255, 255, 0.25)', 3);
  ctx.restore();
  // Waschbecken
  box(ctx, { x: [MIRROR.x[0] + 4, MIRROR.x[1] - 4], y: [96, 112], z: [0.9, 1] }, { front: '#e8eef2', top: '#f6f9fb', side: '#c9d2d8' });
  const [bx, by] = P((MIRROR.x[0] + MIRROR.x[1]) / 2, 112, 0.95);
  ellipse(ctx, bx, by, 34, 7, '#9fb1bd', { width: 2 });
  // Wasserhahn
  const [tx, ty] = P((MIRROR.x[0] + MIRROR.x[1]) / 2, 112, 0.99);
  line(ctx, [[tx, ty], [tx, ty - 18], [tx + 10, ty - 18], [tx + 10, ty - 10]], '#c0c6cc', 4);
  // Schränkchen darunter
  box(ctx, { x: [MIRROR.x[0] + 10, MIRROR.x[1] - 10], y: [0, 96], z: [0.92, 0.99] }, { front: '#3a2616', top: '#4e341e' });
  // Handtuch
  const [hx, hy] = P(MIRROR.x[1] + 8, 160, 1);
  poly(ctx, [[hx, hy], [hx + 18, hy], [hx + 20, hy + 60], [hx + 2, hy + 62]], '#d9e4ea', { width: 2.5 });
  line(ctx, [[hx + 2, hy + 48], [hx + 19, hy + 47]], '#8a3a3a', 3);
}

export const BRAKE_AREA = onSideWall(257, BRAKE.y, BRAKE.z);

function paintBrake(ctx) {
  const area = BRAKE_AREA;
  poly(ctx, area, '#7a1f1f', { width: 3 });
  const [[x0, y0], , , [x1]] = area;
  const cx = (x0 + x1) / 2;
  // roter Griff mit Plombe
  const top = Math.min(...area.map((p) => p[1])) + 18;
  line(ctx, [[cx, top], [cx, top + 50]], OUTLINE, 9);
  line(ctx, [[cx, top], [cx, top + 50]], '#d63a2a', 5);
  ellipse(ctx, cx, top + 56, 14, 6, '#d63a2a', { width: 2.5 });
  sign(ctx, 'NOT-', cx, top + 84, { font: 'bold 11px "Trebuchet MS", sans-serif', color: '#fbe9c0' });
  sign(ctx, 'BREMSE', cx, top + 97, { font: 'bold 11px "Trebuchet MS", sans-serif', color: '#fbe9c0' });
}

// Die Plombe am Griff (verschwindet, wenn die Notbremse gezogen wurde)
export function paintBrakeHandle(ctx, pulled) {
  const area = BRAKE_AREA;
  const [[x0], , , [x1]] = area;
  const cx = (x0 + x1) / 2;
  const top = Math.min(...area.map((p) => p[1])) + 18;
  if (pulled) {
    // Griff hängt unten, ohne Plombe
    poly(ctx, [[cx - 9, top - 4], [cx + 9, top - 4], [cx + 9, top + 60], [cx - 9, top + 60]], '#7a1f1f', { width: 0 });
    line(ctx, [[cx, top + 20], [cx, top + 70]], OUTLINE, 9);
    line(ctx, [[cx, top + 20], [cx, top + 70]], '#d63a2a', 5);
    ellipse(ctx, cx, top + 76, 14, 6, '#d63a2a', { width: 2.5 });
    return;
  }
  line(ctx, [[cx - 8, top + 30], [cx + 8, top + 40]], '#bbb', 1.5);
  circle(ctx, cx + 9, top + 41, 3.5, '#8a8a8a', { width: 1.2 });
}

function paintNightTable(ctx) {
  box(ctx, CHAIR, { front: '#4e341e', top: '#7a1f29' });
  box(ctx, { x: [CHAIR.x[0], CHAIR.x[1]], y: [44, 120], z: [0.715, 0.725] }, { front: '#5a3c22' });
  box(ctx, NIGHT_TABLE, { front: '#4e341e', top: '#6b4728' });
  // Nachtlicht (blau) und Karaffe
  const [lx, ly] = P(236, 78, 0.79);
  line(ctx, [[lx, ly], [lx, ly - 24]], '#c9a24a', 3);
  poly(ctx, [[lx - 10, ly - 22], [lx + 10, ly - 22], [lx + 15, ly - 4 - 18], [lx + 14, ly - 40], [lx - 14, ly - 40]], '#4a78c0', { width: 2.5 });
  glow(ctx, lx, ly - 30, 90, '120, 170, 255', 0.45);
  const [cx, cy] = P(212, 78, 0.77);
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy);
  ctx.quadraticCurveTo(cx - 12, cy - 16, cx - 4, cy - 22);
  ctx.lineTo(cx - 4, cy - 30);
  ctx.lineTo(cx + 4, cy - 30);
  ctx.lineTo(cx + 4, cy - 22);
  ctx.quadraticCurveTo(cx + 12, cy - 16, cx + 6, cy);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200, 225, 240, 0.5)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

function paintSuitcase(ctx) {
  box(ctx, SUITCASE, { front: '#6b2d4a', top: '#8a3e60', side: '#552238' });
  const [hx, hy] = P((SUITCASE.x[0] + SUITCASE.x[1]) / 2, 44, 0.467);
  ctx.beginPath();
  ctx.arc(hx, hy, 12, Math.PI, 0);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#2b1a10';
  ctx.stroke();
  for (const X of [SUITCASE.x[0] + 14, SUITCASE.x[1] - 14]) {
    const [bx, by] = P(X, 40, 0.44);
    poly(ctx, [[bx - 6, by - 6], [bx + 6, by - 6], [bx + 6, by + 6], [bx - 6, by + 6]], '#c9a24a', { width: 1.5 });
  }
  // Anhänger
  const [tx, ty] = P(SUITCASE.x[0] + 6, 46, 0.44);
  line(ctx, [[tx, ty], [tx - 10, ty + 14]], '#8a6a3a', 1.5);
  poly(ctx, [[tx - 20, ty + 12], [tx - 2, ty + 12], [tx - 2, ty + 30], [tx - 20, ty + 30]], '#efe2c0', { width: 1.5 });
}

function paintBunk(ctx) {
  const [x0, x1] = BUNK.x;
  const [zn, zf] = BUNK.z;
  // unteres Bett: Rahmen und Matratze, Bettzeug malt die schlafende Dame (beweglich)
  box(ctx, { x: [x0, x1], y: [0, 40], z: [zn, zf] }, { front: '#4e341e', top: '#5e3e22', side: '#3e2814' });
  box(ctx, { x: [x0, x1 - 4], y: [40, 60], z: [zn + 0.005, zf] }, { front: '#e6e0d2', top: '#f2eee4', side: '#d0c8b6' });
  // Wand hinter dem Bett: Holzverkleidung
  // oberes Bett
  box(ctx, { x: [x0, x1], y: [150, 176], z: [zn, zf] }, { front: '#4e341e', bottom: '#2e1d0e', side: '#3e2814' });
  box(ctx, { x: [x0, x1 - 4], y: [176, 190], z: [zn + 0.005, zf] }, { front: '#d8d2c4', side: '#c4bcaa' });
  // Pfosten an der Gangseite
  for (const z of [zn, 0.84]) {
    line(ctx, [P(x1, 0, z), P(x1, 214, z)], OUTLINE, 10 / z * 0.55);
    line(ctx, [P(x1, 0, z), P(x1, 214, z)], '#6b4728', 6 / z * 0.55);
  }
  // Absturzsicherung oben
  line(ctx, [P(x1, 200, zn), P(x1, 200, 0.84)], OUTLINE, 6);
  line(ctx, [P(x1, 200, zn), P(x1, 200, 0.84)], '#8a6038', 3);
  // Leiter
  for (const dz of [0, 0.045]) line(ctx, [P(x1 + 8, 0, 0.6 + dz), P(x1 + 2, 196, 0.6 + dz)], '#6b4728', 5);
  for (let Y = 30; Y < 190; Y += 36) line(ctx, [P(x1 + 8 - (Y / 196) * 6, Y, 0.6), P(x1 + 8 - (Y / 196) * 6, Y, 0.645)], '#8a6038', 4);
  // Vorhang am oberen Bett (zugezogen bis zur Hälfte)
  const curtain = [P(x1, 214, zn), P(x1, 214, 0.66), P(x1, 150, 0.66), P(x1, 130, 0.6), P(x1, 150, zn)];
  poly(ctx, curtain, '#5a2a4a', { width: 2.5 });
  for (let z = zn + 0.02; z < 0.66; z += 0.03) line(ctx, [P(x1, 212, z), P(x1, 150, z)], 'rgba(20, 5, 15, 0.4)', 1.5);
}

// ============================================================================================
//  Bewegliche Teile
// ============================================================================================

// Frau Adler im unteren Bett: schläft (atmet, murmelt) oder sitzt wach auf der Bettkante
export function paintLady(ctx, { awake, time, talking }) {
  const breathe = Math.sin(time * 1.6) * 0.5 + 0.5;
  const [x1] = BUNK.x.slice(1);
  if (!awake) {
    // Bettdecke auf der Matratze, mit einem Buckel, der sich beim Atmen hebt
    const lift = 8 + breathe * 5;
    const x0 = BUNK.x[0] + 8, xa = x1 - 8;
    const hump = (z) => 64 + lift * Math.sin(Math.min(1, Math.max(0, (z - 0.6) / 0.33)) * Math.PI);
    const near = 0.6, far = 0.96;
    const top = [];
    for (let z = near; z <= far + 0.001; z += 0.03) top.push(P(xa, hump(z), z));
    const back = [];
    for (let z = far; z >= near - 0.001; z -= 0.03) back.push(P(x0, hump(z), z));
    poly(ctx, [...top, ...back], '#7a4a8a', { width: 3 });
    // Seite der Decke zum Gang hin (hängt herunter)
    poly(ctx, [...top, P(xa, 44, far), P(xa, 44, near)], '#5e3470', { width: 3 });
    for (let z = near + 0.06; z < far; z += 0.07) line(ctx, [P(x0 + 10, hump(z), z), P(xa, hump(z), z), P(xa, 46, z)], 'rgba(30, 10, 40, 0.35)', 2);
    // umgeschlagener Rand vorne
    poly(ctx, [P(x0, hump(near) + 2, near), P(xa, hump(near) + 2, near), P(xa, 50, near), P(x0, 50, near)], '#efe6f2', { width: 2.5 });
    // Kissen und Kopf (im Profil, Nachthaube)
    const [px, py] = P(-190, 66, 0.555);
    ellipse(ctx, px, py, 58, 20, '#f6f2ea', { width: 3 });
    const [hx, hy] = P(-170, 82, 0.55);
    circle(ctx, hx, hy, 24, '#f0c9a8', { width: 3 });
    // Haube
    ctx.beginPath();
    ctx.arc(hx - 4, hy - 4, 26, Math.PI * 0.85, Math.PI * 1.95);
    ctx.quadraticCurveTo(hx + 30, hy + 4, hx + 10, hy + 2);
    ctx.closePath();
    ctx.fillStyle = '#f3b8d6';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    for (let i = 0; i < 6; i++) circle(ctx, hx - 24 + i * 9, hy - 18 - Math.sin(i) * 6, 2, '#fff', { width: 0 });
    // geschlossenes Auge, Nase, Mund
    ctx.beginPath();
    ctx.arc(hx + 8, hy + 4, 5, 0.2, Math.PI - 0.2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    ellipse(ctx, hx + 22, hy + 8, 4, 3, '#e8b090', { width: 1.5 });
    ellipse(ctx, hx + 14, hy + 16, 3 + (talking ? Math.abs(Math.sin(time * 9)) * 2 : 0), 1.5 + (talking ? Math.abs(Math.sin(time * 9)) * 2 : 0), '#8a3a3a', { width: 1 });
    // Z z z
    for (let i = 0; i < 3; i++) {
      const t = (time * 0.35 + i / 3) % 1;
      ctx.save();
      ctx.globalAlpha = Math.sin(Math.PI * t) * 0.85;
      ctx.font = `bold ${14 + t * 12}px "Trebuchet MS", sans-serif`;
      ctx.fillStyle = '#cfe0ff';
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 3;
      const zx = hx + 30 + t * 40 + Math.sin(t * 8 + i) * 6, zy = hy - 30 - t * 70;
      ctx.strokeText('z', zx, zy);
      ctx.fillText('z', zx, zy);
      ctx.restore();
    }
    return;
  }
  // Wach: sitzt auf der Bettkante, Decke um die Schultern, große Augen
  const [sx, sy] = P(x1 + 6, 60, 0.58);
  const shiver = Math.sin(time * 30) * (talking ? 1.2 : 0.4);
  ctx.save();
  ctx.translate(sx + shiver, sy);
  // Beine und Pantoffeln
  poly(ctx, [[-18, 0], [12, 0], [16, 98], [-14, 98]], '#efe6f2', { width: 3 });
  ellipse(ctx, -6, 102, 16, 7, '#f3b8d6', { width: 2.5 });
  ellipse(ctx, 14, 102, 16, 7, '#f3b8d6', { width: 2.5 });
  // Nachthemd + Decke um die Schultern
  poly(ctx, [[-34, 4], [30, 4], [24, -78], [-28, -78]], '#efe6f2', { width: 3 });
  poly(ctx, [[-44, -2], [-30, -86], [26, -86], [40, -2], [20, 8], [0, -40], [-20, 8]], '#6a3a7a', { width: 3 });
  // Kopf
  circle(ctx, 0, -110, 26, '#f0c9a8', { width: 3 });
  ctx.beginPath();
  ctx.arc(0, -116, 29, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fillStyle = '#f3b8d6';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // graue Locken
  for (const dx of [-26, 26]) circle(ctx, dx, -104, 8, '#c8c8d0', { width: 2 });
  // Augen weit offen
  for (const dx of [-9, 9]) {
    circle(ctx, dx, -110, 6, '#fff', { width: 2 });
    circle(ctx, dx, -110, 2.5, '#1a0f08', { width: 0 });
  }
  ellipse(ctx, 0, -94, 5, talking ? 5 + Math.abs(Math.sin(time * 10)) * 3 : 3, '#8a3a3a', { width: 1.5 });
  ctx.restore();
}

// Hutschachtel: oben auf der Gepäckablage, im Fallen oder unten auf dem Boden (fall = 0 … 1)
export function paintHatbox(ctx, { fall, open }) {
  const lerp = (a, b) => a + (b - a) * fall * fall;
  const box3 = {
    x: [lerp(HATBOX_UP.x[0], HATBOX_DOWN.x[0]), lerp(HATBOX_UP.x[1], HATBOX_DOWN.x[1])],
    y: [lerp(HATBOX_UP.y[0], HATBOX_DOWN.y[0]), lerp(HATBOX_UP.y[1], HATBOX_DOWN.y[1])],
    z: [lerp(HATBOX_UP.z[0], HATBOX_DOWN.z[0]), lerp(HATBOX_UP.z[1], HATBOX_DOWN.z[1])],
  };
  const cx = (box3.x[0] + box3.x[1]) / 2, cz = (box3.z[0] + box3.z[1]) / 2;
  const r = (box3.x[1] - box3.x[0]) / 2;
  const [bx, by] = P(cx, box3.y[0], cz);
  const [, ty] = P(cx, box3.y[1], cz);
  const rx = r / cz, ry = Math.max(4, Math.abs(P(cx, box3.y[1], box3.z[0])[1] - P(cx, box3.y[1], box3.z[1])[1]) / 2 + 3);
  // Zylinder
  ctx.beginPath();
  ctx.moveTo(bx - rx, ty);
  ctx.lineTo(bx - rx, by);
  ctx.ellipse(bx, by, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(bx + rx, ty);
  ctx.closePath();
  ctx.fillStyle = '#d9a7c7';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // Streifen
  line(ctx, [[bx - rx, (by + ty) / 2], [bx + rx, (by + ty) / 2]], '#8e2a6b', 4);
  if (open) {
    ellipse(ctx, bx, ty, rx, ry, '#3a1a2a', { width: 3 });
    // Deckel daneben
    ellipse(ctx, bx + rx * 1.6, by - 2, rx, ry, '#d9a7c7', { width: 3 });
    // Federn ragen heraus
    for (const [dx, h, c] of [[-6, 30, '#2a6b5a'], [4, 38, '#e8c46a'], [12, 26, '#8e2a6b']]) {
      ctx.beginPath();
      ctx.moveTo(bx + dx, ty);
      ctx.quadraticCurveTo(bx + dx - 12, ty - h * 0.6, bx + dx + 6, ty - h);
      ctx.lineWidth = 5;
      ctx.strokeStyle = c;
      ctx.stroke();
    }
  } else {
    ellipse(ctx, bx, ty, rx + 3, ry + 1, '#e8bcd8', { width: 3 });
    ctx.beginPath();
    ctx.arc(bx, ty - 2, rx * 0.3, Math.PI, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8e2a6b';
    ctx.stroke();
  }
}

// Mondlicht: ein heller Streifen vom Fenster quer durch den Wagen auf den Spiegel
export function paintMoonbeam(ctx, strength) {
  if (strength <= 0) return;
  const w = MOON_WINDOW;
  const { x: mx, y: my, width, height } = MIRROR_CENTER;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const gradient = ctx.createLinearGradient(w.from, 0, mx, 0);
  gradient.addColorStop(0, `rgba(190, 210, 255, ${0.35 * strength})`);
  gradient.addColorStop(1, `rgba(190, 210, 255, ${0.12 * strength})`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(w.from + 6, w.top + 20);
  ctx.lineTo(w.from + 6, w.bottom - 30);
  ctx.lineTo(mx - width / 2 + 10, my + height / 2 - 6);
  ctx.lineTo(mx - width / 2 + 10, my - height / 2 + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  glow(ctx, mx, my, width * 0.9, '200, 220, 255', 0.45 * strength, 'screen');
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

export const sleepingCar = {
  id: 'sleepingCar',
  name: 'Schlafwagen',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },
  outside: outsideFor([4], { windowLight: { color: [150, 175, 255], strength: 0.22 } }),

  props: [
    { id: 'blind', paint: (ctx, scene) => paintBlind(ctx, MOON_WINDOW, scene.flags.blind ?? 1, { torn: true }) },
    { id: 'brake', paint: (ctx, scene) => paintBrakeHandle(ctx, scene.flags.brakePulled) },
    { id: 'moonbeam', paint: (ctx, scene) => paintMoonbeam(ctx, scene.flags.moonlight ?? 0), light: (scene) => ((scene.flags.moonlight ?? 0) > 0.5 ? { x: MIRROR_CENTER.x, y: MIRROR_CENTER.y, radius: 110 } : null) },
    { id: 'lady', paint: (ctx, scene) => paintLady(ctx, { awake: scene.flags.ladyAwake, time: scene.time, talking: scene.flags.ladyTalking }) },
    { id: 'hatbox', paint: (ctx, scene) => paintHatbox(ctx, { fall: scene.flags.hatboxFall ?? 0, open: scene.flags.hatboxOpen }), depth: floor(0, 0.585)[1] },
  ],

  hotspots: [
    { id: 'hatboxDown', name: 'Hutschachtel', when: 'hatboxDown', area: boxArea({ x: [-62, -4], y: [0, 50], z: [0.56, 0.61] }), walkTo: floor(-10, 0.66), facing: 'front' },
    { id: 'hatboxUp', name: 'Hutschachtel', when: '!hatboxDown', area: boxArea({ x: [-252, -200], y: [280, 324], z: [0.58, 0.64] }), walkTo: floor(-110, 0.62), facing: 'left' },
    { id: 'lady', name: 'Frau Adler', cursor: 'talk', area: boxArea({ x: [-250, -120], y: [50, 150], z: [0.53, 0.66] }), walkTo: floor(-105, 0.57), facing: 'left' },
    { id: 'ladder', name: 'Leiter', area: boxArea({ x: [-132, -118], y: [0, 196], z: [0.6, 0.645] }), walkTo: floor(-100, 0.64), facing: 'left' },
    { id: 'upperBunk', name: 'Oberes Bett', area: boxArea({ x: [-257, -132], y: [150, 214], z: [0.52, 0.84] }), walkTo: floor(-100, 0.64), facing: 'left' },
    { id: 'bunk', name: 'Unteres Bett', area: boxArea({ x: [-257, -132], y: [0, 60], z: [0.66, 0.98] }), walkTo: floor(-100, 0.75), facing: 'left' },
    { id: 'grate', name: 'Gitter zum Gepäckwagen', area: rect(...onBackWall(DOOR.x, DOOR.y)), walkTo: floor(0, 0.97), facing: 'back' },
    { id: 'mirror', name: 'Spiegel', area: rect(MIRROR_CENTER.x - MIRROR_CENTER.width / 2, MIRROR_CENTER.y - MIRROR_CENTER.height / 2, MIRROR_CENTER.width, MIRROR_CENTER.height), walkTo: floor(100, 0.94), facing: 'back' },
    { id: 'basin', name: 'Waschbecken', area: boxArea({ x: [112, 232], y: [0, 112], z: [0.9, 1] }), walkTo: floor(100, 0.9), facing: 'back' },
    { id: 'blind', name: 'Rollo', area: rect(MOON_WINDOW.from - 6, MOON_WINDOW.top - 10, MOON_WINDOW.to - MOON_WINDOW.from + 12, MOON_WINDOW.bottom - MOON_WINDOW.top + 30), walkTo: floor(130, 0.64), facing: 'right' },
    { id: 'brake', name: 'Notbremse', area: BRAKE_AREA.map(([x, y]) => [Math.round(x), Math.round(y)]), walkTo: floor(135, 0.56), facing: 'right' },
    { id: 'nightTable', name: 'Nachttisch', area: boxArea({ x: [196, 257], y: [0, 120], z: [0.74, 0.82] }), walkTo: floor(128, 0.76), facing: 'right' },
    { id: 'chair', name: 'Stuhl', area: boxArea({ x: [140, 194], y: [0, 120], z: [0.66, 0.725] }), walkTo: floor(128, 0.68), facing: 'right' },
    { id: 'suitcase', name: 'Koffer', area: boxArea(SUITCASE), walkTo: floor(150, 0.425), facing: 'right' },
    ...WINDOWS.filter((w, i) => i !== 4).map((w) => ({ id: 'window', name: 'Rollo', cursor: 'look', area: rect(w.from, w.top, w.to - w.from, w.bottom - w.top) })),
  ],

  train: trainFor([
    { x: 640, y: 56, radius: 170, strength: 0.14 },
    { x: 640, y: 14, radius: 200, strength: 0.14 },
    { x: P(236, 110, 0.79)[0], y: P(236, 110, 0.79)[1], radius: 140, strength: 0.18 },
  ]),

  playerStart: { x: 640, y: 690, facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-104, 0.985),
      floor(104, 0.985),
      floor(104, 0.9),
      floor(132, 0.86),
      floor(134, 0.52),
      floor(158, 0.505),
      floor(160, 0.42),
      floor(-240, 0.42),
      floor(-240, 0.47),
      floor(-122, 0.5),
    ],
    holes: [],
  },
};
