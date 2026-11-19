import { OUTLINE, circle, glow, line, poly, vertical } from '../core/paint.js';
import {
  P, PERSPECTIVE, WINDOWS, box, boxArea, floor, onBackWall, onSideWall, outsideFor, paintCeilingLamp, paintShell,
  paintWindows, rect, rivets, roundRect, sign, trainFor,
} from './wagonPainter.js';

// Szene 6: das Schaffnerabteil – das letzte Abteil des Zuges.
//
// Hinten die Tür „Ende des Zuges“ (Ausstieg nur bei Halt), links daneben die Notbremse und die Dienstuhr,
// rechts die Garderobe mit Brandts Mantel. Links an der Wand: der runde Fahrplan und der Schlüsselkasten,
// vorne links das Schaffnerpult mit der Sprechanlage. Rechts hinten: das Stellpult mit dem Gleisbild.
// Reaktionen: src/story/wagon6.js

const DOOR = { x: [-80, 80], y: [0, 280] };
const BRAKE = { x: [-196, -118], y: [150, 250] };
const CLOCK = { x: [-196, -122], y: [266, 340] };
const COAT = { x: [104, 226], y: [110, 286] };
const TIMETABLE = { y: [148, 296], z: [0.64, 0.8] };
const KEYBOX = { x: [-257, -226], y: [146, 252], z: [0.86, 0.95] };
const DESK = { x: [-250, -135], y: [0, 92], z: [0.5, 0.64] };
const CHAIR = { x: [-170, -128], y: [0, 50], z: [0.47, 0.52] };
const PANEL = { x: [140, 250], y: [0, 112], z: [0.78, 0.95] };
const SPEAKER = { y: [196, 252], z: [0.52, 0.6] };

export const SPEAKER_VOICE = (() => {
  const [x, y] = P(-257, 260, 0.56);
  return { x: x + 150, y: y - 10 };
})();

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  paintShell(ctx, {
    seed: 61,
    wall: ['#5a3a22', '#6e4a2c', '#4e321e'],
    panel: '#3a2414',
    panelHeight: 100,
    rail: '#d9a441',
    back: ['#4a2e1c', '#5e3e26'],
    ceiling: '#24160c',
    floor: ['#4a1414', '#6e2420'],
    planks: 120,
  });
  paintWindows(ctx, [WINDOWS[4], WINDOWS[5]], { frame: '#5b3a1e', curtains: '#7a2a24' });
  paintCeilingLamp(ctx, 0.8, { color: '#ffe0a0' });
  paintCeilingLamp(ctx, 0.5, { color: '#ffe0a0' });
  paintBackWall(ctx);
  paintLeftWall(ctx);
  paintDesk(ctx);
  paintPanel(ctx);
}

function paintBackWall(ctx) {
  // Tür am Ende des Zuges: Stahl, mit Fenster
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  poly(ctx, [[x - 8, y - 8], [x + w + 8, y - 8], [x + w + 8, y + h], [x - 8, y + h]], '#2a1a0e', { width: 4 });
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], vertical(ctx, y, y + h, ['#6d5a48', '#4b3e32']), { width: 3 });
  roundRect(ctx, x + 22, y + 22, w - 44, 92, 10);
  ctx.fillStyle = '#05050a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  // rotes Schlusslicht spiegelt sich im Glas
  glow(ctx, x + w - 40, y + 90, 26, '255, 60, 40', 0.5);
  roundRect(ctx, x + w / 2 - 66, y + 132, 132, 44, 4);
  ctx.fillStyle = '#e8c74a';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'ENDE DES ZUGES', x + w / 2, y + 146, { font: 'bold 12px "Trebuchet MS", sans-serif', color: '#2b2118' });
  sign(ctx, 'Ausstieg nur bei Halt', x + w / 2, y + 164, { font: '11px "Trebuchet MS", sans-serif', color: '#2b2118' });
  // Griff
  line(ctx, [[x + w - 22, y + 190], [x + w - 22, y + 240]], OUTLINE, 9);
  line(ctx, [[x + w - 22, y + 190], [x + w - 22, y + 240]], '#c0c6cc', 5);

  // Notbremse: Kasten (der Griff ist eine bewegliche Ebene)
  const [bx, by, bw, bh] = onBackWall(BRAKE.x, BRAKE.y);
  roundRect(ctx, bx, by, bw, bh, 6);
  ctx.fillStyle = '#c0392b';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  roundRect(ctx, bx + 6, by + 6, bw - 12, 18, 3);
  ctx.fillStyle = '#f4ead2';
  ctx.fill();
  sign(ctx, 'NOTBREMSE', bx + bw / 2, by + 15, { font: 'bold 10px "Trebuchet MS", sans-serif', color: '#8a1e14' });
  rivets(ctx, [[bx + 6, by + bh - 6], [bx + bw - 6, by + bh - 6]], 2.5);

  // Garderobe: Brett mit Haken
  const [gx, gy, gw] = onBackWall(COAT.x, COAT.y);
  poly(ctx, [[gx, gy], [gx + gw, gy], [gx + gw, gy + 16], [gx, gy + 16]], '#3a2414', { width: 3 });
  for (const t of [0.2, 0.5, 0.8]) {
    const hx = gx + gw * t;
    line(ctx, [[hx, gy + 16], [hx, gy + 30], [hx + 8, gy + 34]], '#c9a24a', 4);
  }
  // Mantel
  const mx = gx + gw * 0.5;
  ctx.beginPath();
  ctx.moveTo(mx - 20, gy + 30);
  ctx.lineTo(mx + 20, gy + 30);
  ctx.lineTo(mx + 46, gy + 168);
  ctx.lineTo(mx - 46, gy + 168);
  ctx.closePath();
  ctx.fillStyle = vertical(ctx, gy + 30, gy + 168, ['#26324a', '#1a2234']);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  line(ctx, [[mx, gy + 40], [mx, gy + 166]], 'rgba(0, 0, 0, 0.5)', 2);
  for (const dy of [60, 90, 120]) circle(ctx, mx + 6, gy + dy, 3, '#d9a441', { width: 1 });
  // Mütze
  const cx = gx + gw * 0.2;
  poly(ctx, [[cx - 22, gy + 44], [cx + 26, gy + 44], [cx + 22, gy + 30], [cx - 18, gy + 30]], '#26324a', { width: 3 });
  poly(ctx, [[cx - 26, gy + 44], [cx + 30, gy + 44], [cx + 30, gy + 50], [cx - 26, gy + 50]], '#111', { width: 2 });
  circle(ctx, cx + 2, gy + 37, 4, '#d9a441', { width: 1 });
  // Handlaterne am dritten Haken
  const lx = gx + gw * 0.8;
  poly(ctx, [[lx - 10, gy + 38], [lx + 10, gy + 38], [lx + 12, gy + 70], [lx - 12, gy + 70]], '#3a3a3a', { width: 2.5 });
  poly(ctx, [[lx - 7, gy + 44], [lx + 7, gy + 44], [lx + 8, gy + 64], [lx - 8, gy + 64]], '#b3261e', { width: 0 });

  // Dienstuhr (Zeiger: bewegliche Ebene)
  const [ux, uy, uw, uh] = onBackWall(CLOCK.x, CLOCK.y);
  circle(ctx, ux + uw / 2, uy + uh / 2, uw / 2, '#f4ead2', { width: 4 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = uw / 2;
    line(ctx, [[ux + uw / 2 + Math.cos(a) * r * 0.78, uy + uh / 2 + Math.sin(a) * r * 0.78], [ux + uw / 2 + Math.cos(a) * r * 0.9, uy + uh / 2 + Math.sin(a) * r * 0.9]], '#2b2118', 2);
  }
  // Schild über allem
  const [tx, ty, tw] = onBackWall([-257, 257], [312, 350]);
  sign(ctx, 'SCHAFFNER · RINGBAHN', tx + tw * 0.72, ty + 22, { font: 'bold 15px "Trebuchet MS", sans-serif', color: '#e8d6a0' });
}

function paintLeftWall(ctx) {
  // Fahrplan: rundes Schild an der Wand
  const corners = onSideWall(-257, TIMETABLE.y, TIMETABLE.z);
  poly(ctx, corners, '#3a2414', { width: 3 });
  const inner = onSideWall(-256, [TIMETABLE.y[0] + 8, TIMETABLE.y[1] - 8], [TIMETABLE.z[0] + 0.01, TIMETABLE.z[1] - 0.012]);
  poly(ctx, inner, '#f1e8d0', { width: 2 });
  // Kreis darauf (verzerrt, weil die Wand schräg steht)
  const zMid = (TIMETABLE.z[0] + TIMETABLE.z[1]) / 2;
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const Y = 222 + Math.sin(a) * 50;
    const Z = zMid + Math.cos(a) * 0.05;
    const [px, py] = P(-256, Y, Z);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2b2118';
  ctx.stroke();
  const [dx, dy] = P(-256, 272, zMid);
  circle(ctx, dx, dy, 4, '#1a1a1a', { width: 0 });
  const [hx, hy] = P(-256, 284, zMid);
  sign(ctx, 'FAHRPLAN', hx, hy - 4, { font: 'bold 11px "Trebuchet MS", sans-serif', color: '#2b2118', angle: -0.5 });

  // Schlüsselkasten
  box(ctx, KEYBOX, { front: '#5a3a1e', side: '#6b4626' });
  // Lautsprecher über dem Pult
  const grille = onSideWall(-257, SPEAKER.y, SPEAKER.z);
  poly(ctx, grille, '#3a3a34', { width: 3 });
  for (let i = 1; i < 6; i++) {
    const Y = SPEAKER.y[0] + ((SPEAKER.y[1] - SPEAKER.y[0]) * i) / 6;
    line(ctx, [P(-257, Y, SPEAKER.z[0] + 0.006), P(-257, Y, SPEAKER.z[1] - 0.006)], 'rgba(10, 10, 8, 0.7)', 2);
  }
}

function paintDesk(ctx) {
  // Stuhl: Sitzpolster auf vier Beinen
  for (const X of [CHAIR.x[0] + 4, CHAIR.x[1] - 4]) {
    for (const Z of [CHAIR.z[0] + 0.004, CHAIR.z[1] - 0.004]) line(ctx, [P(X, 0, Z), P(X, 40, Z)], '#2a1a0e', 4);
  }
  box(ctx, { x: CHAIR.x, y: [40, 50], z: CHAIR.z }, { front: '#4a2e16', top: '#7a2a24' });
  box(ctx, DESK, { front: '#5a3a1e', top: '#7a5430', side: '#4a2e16' });
  // Schublade
  const [x0, y0] = P(DESK.x[0] + 20, 76, DESK.z[0]);
  const [x1, y1] = P(DESK.x[1] - 14, 46, DESK.z[0]);
  poly(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], '#4a2e16', { width: 2 });
  // Sprechanlage: Kasten mit Knöpfen und ein Mikrofon am Schwanenhals
  box(ctx, { x: [-238, -190], y: [92, 118], z: [0.56, 0.6] }, { front: '#2e3a34', top: '#3e4a44' });
  for (let i = 0; i < 3; i++) {
    const [kx, ky] = P(-232 + i * 14, 104, 0.56);
    circle(ctx, kx, ky, 4, ['#c0392b', '#e8c74a', '#3fa04a'][i], { width: 1.5 });
  }
  const [mx, my] = P(-168, 92, 0.56);
  ctx.beginPath();
  ctx.moveTo(mx, my);
  ctx.bezierCurveTo(mx - 6, my - 60, mx + 30, my - 80, mx + 34, my - 96);
  ctx.lineWidth = 6;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#9aa3ab';
  ctx.stroke();
  poly(ctx, [[mx + 24, my - 104], [mx + 46, my - 98], [mx + 42, my - 84], [mx + 22, my - 90]], '#2a2a2a', { width: 2.5 });
  circle(ctx, mx, my, 9, '#2a2a2a', { width: 2 });
  // Papiere
  const [px, py] = P(-150, 92, 0.6);
  poly(ctx, [[px - 30, py], [px + 4, py - 4], [px + 10, py + 12], [px - 24, py + 16]], '#efe6d2', { width: 1.5 });
}

function paintPanel(ctx) {
  box(ctx, PANEL, { front: '#2e3a34', top: '#3a4a40', side: '#24302a' });
  // schräges Pult mit Gleisbild
  const a = P(PANEL.x[0], PANEL.y[1], PANEL.z[0]);
  const b = P(PANEL.x[1], PANEL.y[1], PANEL.z[0]);
  const c = P(PANEL.x[1], PANEL.y[1] + 40, PANEL.z[1]);
  const d = P(PANEL.x[0], PANEL.y[1] + 40, PANEL.z[1]);
  poly(ctx, [a, b, c, d], '#1a2420', { width: 3 });
  // kleine Hebel vorne
  for (let i = 0; i < 4; i++) {
    const [hx, hy] = P(PANEL.x[0] + 16 + i * 26, PANEL.y[1] - 14, PANEL.z[0]);
    line(ctx, [[hx, hy], [hx, hy - 24]], OUTLINE, 6);
    line(ctx, [[hx, hy], [hx, hy - 24]], i === 2 ? '#c0392b' : '#c9cfd4', 3);
    circle(ctx, hx, hy - 26, 4, i === 2 ? '#c0392b' : '#e8e8e8', { width: 1.5 });
  }
  // Schlüsselschalter
  const [kx, ky] = P(PANEL.x[1] - 16, PANEL.y[1] - 40, PANEL.z[0]);
  circle(ctx, kx, ky, 8, '#c9a24a', { width: 2 });
  line(ctx, [[kx - 4, ky], [kx + 4, ky]], OUTLINE, 2);
  const [sx, sy] = P((PANEL.x[0] + PANEL.x[1]) / 2, 40, PANEL.z[0]);
  sign(ctx, 'STELLPULT', sx, sy, { font: 'bold 14px "Courier New", monospace', color: 'rgba(240, 220, 170, 0.7)' });
}

// ============================================================================================
//  Bewegliche Teile
// ============================================================================================

// Gleisbild auf dem Stellpult: dunkel, oder mit grün leuchtender Strecke
export function paintPanelLights(ctx, { solved, time }) {
  const pt = (u, v) => {
    const X = PANEL.x[0] + 10 + u * (PANEL.x[1] - PANEL.x[0] - 20);
    const Z = PANEL.z[0] + 0.02 + v * (PANEL.z[1] - PANEL.z[0] - 0.04);
    const Y = PANEL.y[1] + 40 * ((Z - PANEL.z[0]) / (PANEL.z[1] - PANEL.z[0]));
    return P(X, Y, Z);
  };
  // der Kreis
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const [x, y] = pt(0.35 + Math.cos(a) * 0.28, 0.5 + Math.sin(a) * 0.38);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(230, 230, 210, 0.7)';
  ctx.stroke();
  // der Abzweig
  ctx.beginPath();
  const [ax, ay] = pt(0.35, 0.88);
  const [bx, by] = pt(0.95, 0.95);
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = solved ? '#7dff8a' : 'rgba(230, 230, 210, 0.35)';
  ctx.stroke();
  const blink = Math.sin(time * 6) > 0;
  circle(ctx, ax, ay, 3, solved && blink ? '#ff5a3a' : '#5a1a14', { width: 0 });
  if (solved) glow(ctx, (ax + bx) / 2, (ay + by) / 2, 40, '120, 255, 140', 0.25);
}

// Schlüsselkasten: zu, oder offen (mit oder ohne den Weichenschlüssel)
export function paintKeybox(ctx, { open, keyInside }) {
  const front = onSideWall(KEYBOX.x[1], KEYBOX.y, KEYBOX.z);
  if (!open) {
    poly(ctx, front, vertical(ctx, front[1][1], front[0][1], ['#6b4626', '#5a3a1e']), { width: 3 });
    const [lx, ly] = P(KEYBOX.x[1], 200, KEYBOX.z[0] + 0.012);
    poly(ctx, [[lx - 6, ly - 12], [lx + 6, ly - 12], [lx + 6, ly + 12], [lx - 6, ly + 12]], '#c9a24a', { width: 2 });
    const [sx, sy] = P(KEYBOX.x[1], 236, (KEYBOX.z[0] + KEYBOX.z[1]) / 2);
    sign(ctx, 'SCHLÜSSEL', sx, sy, { font: 'bold 9px "Trebuchet MS", sans-serif', color: '#e8d6a0', angle: -0.6 });
    return;
  }
  poly(ctx, front, '#1a100a', { width: 3 });
  // Tür klappt nach vorne auf
  poly(ctx, [front[0], front[1], P(KEYBOX.x[1] + 60, KEYBOX.y[1], KEYBOX.z[0] - 0.03), P(KEYBOX.x[1] + 60, KEYBOX.y[0], KEYBOX.z[0] - 0.03)], '#6b4626', { width: 3 });
  // Haken mit Schlüsseln
  for (let i = 0; i < 4; i++) {
    const Z = KEYBOX.z[0] + 0.012 + i * 0.018;
    const [hx, hy] = P(KEYBOX.x[1] - 2, 226, Z);
    line(ctx, [[hx, hy], [hx, hy + 6]], '#c9a24a', 2);
    if (i === 3 && !keyInside) continue;
    const big = i === 3;
    line(ctx, [[hx, hy + 6], [hx, hy + (big ? 40 : 26)]], big ? '#9aa3ab' : '#c9a24a', big ? 4 : 2.5);
    if (big) poly(ctx, [[hx - 6, hy + 40], [hx + 6, hy + 40], [hx + 6, hy + 54], [hx - 6, hy + 54]], '#c0392b', { width: 1.5 });
  }
}

// Notbremse: Griff oben – oder gezogen (unten)
export function paintBrakeHandle(ctx, pulled, lit) {
  const [x, y, w, h] = onBackWall(BRAKE.x, BRAKE.y);
  const hy = pulled ? y + h - 16 : y + 44;
  line(ctx, [[x + w / 2, y + 30], [x + w / 2, hy]], OUTLINE, 5);
  line(ctx, [[x + w / 2, y + 30], [x + w / 2, hy]], '#e0e0e0', 2.5);
  roundRect(ctx, x + w / 2 - 22, hy - 6, 44, 14, 6);
  ctx.fillStyle = '#e8c74a';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  if (lit) glow(ctx, x + w / 2, y + 15, 34, '255, 90, 60', 0.4);
}

export function paintClockHands(ctx) {
  const [x, y, w, h] = onBackWall(CLOCK.x, CLOCK.y);
  const cx = x + w / 2, cy = y + h / 2, r = w / 2;
  // 23:59 – der Minutenzeiger zittert, kommt aber nie auf zwölf
  const minute = -Math.PI / 2 - 0.105;
  const hour = -Math.PI / 2 - 0.01;
  line(ctx, [[cx, cy], [cx + Math.cos(hour) * r * 0.5, cy + Math.sin(hour) * r * 0.5]], '#1a1a1a', 4);
  line(ctx, [[cx, cy], [cx + Math.cos(minute) * r * 0.78, cy + Math.sin(minute) * r * 0.78]], '#1a1a1a', 2.5);
  circle(ctx, cx, cy, 3, '#b3261e', { width: 0 });
}

export function paintDoorOpen(ctx) {
  const [x, y, w, h] = onBackWall(DOOR.x, DOOR.y);
  poly(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#030305', { width: 3 });
  glow(ctx, x + w / 2, y + h * 0.7, 80, '255, 140, 60', 0.18);
  poly(ctx, [[x, y], [x - 50, y - 20], [x - 50, y + h + 20], [x, y + h]], '#5a4a3a', { width: 3 });
}

// Ein Lichtfleck an einem Raumpunkt (bleibt im Dunkeln sichtbar)
function lightAt(X, Y, Z, radius) {
  const [x, y] = P(X, Y, Z);
  return { x, y, radius };
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

export const conductorCar = {
  id: 'conductorCar',
  name: 'Schaffnerabteil',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },
  outside: outsideFor([4, 5]),

  props: [
    { id: 'panelLights', paint: (ctx, scene) => paintPanelLights(ctx, { solved: scene.flags.routeSolved, time: scene.time }), light: (scene) => (scene.flags.routeSolved ? lightAt(195, 140, 0.86, 70) : null) },
    { id: 'keybox', paint: (ctx, scene) => paintKeybox(ctx, { open: scene.flags.keyboxOpen, keyInside: !scene.flags.keyTaken }) },
    { id: 'brake', paint: (ctx, scene) => paintBrakeHandle(ctx, scene.flags.brakePulled, scene.isDark), light: () => lightAt(-157, 236, 1, 60) },
    { id: 'clock', paint: (ctx) => paintClockHands(ctx) },
    { id: 'door', when: 'doorOpen', paint: (ctx) => paintDoorOpen(ctx) },
  ],

  hotspots: [
    { id: 'brake', name: 'Notbremse', glows: 'brakeLit', area: rect(...onBackWall(BRAKE.x, BRAKE.y)), walkTo: floor(-110, 0.95), facing: 'back' },
    { id: 'clock', name: 'Dienstuhr', cursor: 'look', area: rect(...onBackWall(CLOCK.x, CLOCK.y)) },
    { id: 'door', name: 'Tür „Ende des Zuges“', area: rect(...onBackWall(DOOR.x, DOOR.y)), walkTo: floor(0, 0.95), facing: 'back' },
    { id: 'coat', name: 'Garderobe', area: rect(...onBackWall(COAT.x, COAT.y)), walkTo: floor(120, 0.95), facing: 'back' },
    { id: 'keybox', name: 'Schlüsselkasten', area: boxArea({ x: [-257, -200], y: KEYBOX.y, z: KEYBOX.z }), walkTo: floor(-200, 0.9), facing: 'left' },
    { id: 'timetable', name: 'Fahrplan', area: onSideWall(-257, TIMETABLE.y, TIMETABLE.z).map(([x, y]) => [Math.round(x), Math.round(y)]), walkTo: floor(-200, 0.74), facing: 'left' },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: onSideWall(-257, SPEAKER.y, SPEAKER.z).map(([x, y]) => [Math.round(x), Math.round(y)]) },
    { id: 'intercom', name: 'Sprechanlage', cursor: 'talk', area: boxArea({ x: [-240, -140], y: [92, 200], z: [0.55, 0.6] }), walkTo: floor(-108, 0.6), facing: 'left' },
    { id: 'chair', name: 'Stuhl', area: boxArea(CHAIR), walkTo: floor(-108, 0.5), facing: 'left' },
    { id: 'desk', name: 'Schaffnerpult', area: boxArea(DESK), walkTo: floor(-108, 0.6), facing: 'left' },
    { id: 'panel', name: 'Stellpult', area: boxArea({ x: PANEL.x, y: [0, 160], z: PANEL.z }), walkTo: floor(118, 0.86), facing: 'right' },
    ...[WINDOWS[4], WINDOWS[5]].map((w) => ({ id: 'window', name: 'Fenster', cursor: 'look', area: rect(w.from, w.top, w.to - w.from, w.bottom - w.top) })),
  ],

  train: trainFor([
    { x: 640, y: 40, radius: 220, strength: 0.26 },
    { x: 640, y: 150, radius: 200, strength: 0.2 },
  ]),

  playerStart: { x: 640, y: 690, facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-215, 0.965),
      floor(128, 0.965),
      floor(128, 0.76),
      floor(225, 0.74),
      floor(225, 0.42),
      floor(-115, 0.42),
      floor(-115, 0.66),
      floor(-215, 0.68),
    ],
    holes: [],
  },
};
