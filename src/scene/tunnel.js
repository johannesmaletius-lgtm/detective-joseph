import { OUTLINE, circle, glow, grime, line, poly, seeded, vertical } from '../core/paint.js';
import { P, PERSPECTIVE, box, boxArea, floor, rect, roundRect, sign, trainFor } from './wagonPainter.js';
import { paintOtherJoseph } from './figures.js';

// Szene 7: der Tunnel – draußen, vor der Lok.
//
// Der Zug steht. Hinter Joseph (unten links im Bild) die Lok mit brennendem Scheinwerfer. Vor ihm laufen
// die Gleise in die Dunkelheit – im Kreis weiter. An Weiche 7 zweigt eine Strecke nach rechts ab, zu einem
// Durchbruch in der Tunnelwand, durch den schwaches Morgenlicht fällt. Links an der Wand: die Kamera und
// die große „5“ (beides kennt Joseph aus dem ersten Abteil), eine Strichliste und das Lager des anderen Joseph.
// Gezeichnet wird mit derselben Perspektive wie die Wagen (P aus wagonPainter.js), nur breiter und tiefer.
// Reaktionen: src/story/wagon7.js

const TW = 300;        // halbe Breite des Tunnels
const WALL_H = 150;    // bis hier sind die Wände senkrecht
const ARCH = 220;      // so hoch wölbt sich das Gewölbe darüber
const FAR = 6;         // so tief reicht das Bild
const RAIL = 72;       // Abstand der Schienen von der Gleismitte
const SWITCH_Z = 0.75; // hier beginnt die Weiche
const EXIT = { z: [1.38, 1.9], top: 190, apex: 240 };
const STAND = { x: [-178, -128], y: [0, 34], z: [0.7, 0.745] };
const PIVOT = { X: -153, Y: 34, Z: 0.722 };
const SIGNAL = { X: 118, Z: 1.0, Y: 190 };
const NICHE = { y: [0, 150], z: [0.86, 1.0] };
const LOCO = { x: [-300, -118], y: [0, 128], z: 0.34 };
export const OTHER = { x: P(40, 0, 0.86)[0], y: P(40, 0, 0.86)[1] };
const CANDLE = (() => {
  const [x, y] = P(-270, 0, 0.93);
  return { x, y };
})();

// Mittellinie der abzweigenden Strecke (Raum-X bei Tiefe Z)
function branchX(Z) {
  const t = Math.max(0, (Z - SWITCH_Z) / (1.64 - SWITCH_Z));
  return TW * Math.pow(t, 1.7);
}

// Querschnitt des Tunnels in Tiefe Z (von links unten über das Gewölbe nach rechts unten)
function section(Z) {
  const points = [P(-TW, 0, Z), P(-TW, WALL_H, Z)];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI - (i / 16) * Math.PI;
    points.push(P(TW * Math.cos(a), WALL_H + ARCH * Math.sin(a), Z));
  }
  points.push(P(TW, WALL_H, Z), P(TW, 0, Z));
  return points;
}

// Zeichnet auf eine Seitenwand (X = ±TW): u läuft in die Tiefe (z0 → z1), v nach unten (y0 → y1)
function onWall(ctx, X, [z0, z1], [y0, y1], draw) {
  const o = P(X, y0, z0), u = P(X, y0, z1), v = P(X, y1, z0);
  ctx.save();
  ctx.transform(u[0] - o[0], u[1] - o[1], v[0] - o[0], v[1] - o[1], o[0], o[1]);
  draw(ctx);
  ctx.restore();
}

// ============================================================================================
//  Hintergrund
// ============================================================================================
function paintBackground(ctx) {
  // Wände und Gewölbe: weiter hinten immer dunkler
  const wall = ctx.createRadialGradient(640, 206, 0, 640, 206, 900);
  wall.addColorStop(0, '#000000');
  wall.addColorStop(0.08, '#0e0a0a');
  wall.addColorStop(0.35, '#2a1e1a');
  wall.addColorStop(1, '#4a362c');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 720);
  paintBricks(ctx);
  paintExit(ctx);
  paintFloor(ctx);
  paintTracks(ctx);
  paintLeftWall(ctx);
  paintLamps(ctx);
  box(ctx, STAND, { front: '#2e3a34', top: '#3e4a44', side: '#24302a' });
  line(ctx, [P(-128, 10, 0.722), P(-RAIL, 4, 0.73)], '#1a1a1a', 4);
  sign(ctx, 'W7', ...P(-153, 17, STAND.z[0]), { font: 'bold 13px "Courier New", monospace', color: '#e8d6a0' });
  paintSignalPost(ctx);
  paintHeadlight(ctx);
  paintLoco(ctx);
}

function paintBricks(ctx) {
  // Fugen längs des Tunnels
  ctx.lineCap = 'butt';
  for (let i = 1; i < 16; i++) {
    const a = Math.PI - (i / 16) * Math.PI;
    const X = TW * Math.cos(a), Y = WALL_H + ARCH * Math.sin(a);
    line(ctx, [P(X, Y, 0.3), P(X, Y, FAR)], 'rgba(0, 0, 0, 0.32)', 1.5);
  }
  for (const side of [-1, 1]) {
    for (let Y = 25; Y < WALL_H; Y += 25) line(ctx, [P(side * TW, Y, 0.3), P(side * TW, Y, FAR)], 'rgba(0, 0, 0, 0.32)', 1.5);
  }
  // Ringe quer zum Tunnel
  for (const Z of [0.4, 0.48, 0.58, 0.7, 0.85, 1.05, 1.3, 1.65, 2.1, 2.8, 3.8]) {
    const points = section(Z);
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = Math.max(1, 2.2 / Z);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.stroke();
  }
  // Feuchte Flecken, Ruß
  grime(ctx, [[0, 0], [1280, 0], [1280, 400], [0, 400]], { count: 90, seed: 71, alpha: 0.16, size: [10, 60] });
}

// Der Durchbruch in der rechten Wand: dahinter wird es hell
function paintExit(ctx) {
  const [z0, z1] = EXIT.z;
  const opening = [P(TW, 0, z0), P(TW, EXIT.top, z0), P(TW, EXIT.apex, (z0 + z1) / 2), P(TW, EXIT.top, z1), P(TW, 0, z1)];
  const top = Math.min(...opening.map(([, y]) => y)), bottom = Math.max(...opening.map(([, y]) => y));
  poly(ctx, opening, vertical(ctx, top, bottom, ['#6a6a9a', '#c99aa0', '#e8c49a']), { width: 3 });
  const [cx, cy] = P(TW, 110, (z0 + z1) / 2);
  glow(ctx, cx, cy, 200, '255, 210, 190', 0.35);
  glow(ctx, cx, cy, 70, '255, 240, 220', 0.4);
}

function paintFloor(ctx) {
  const floorPoly = [P(-TW, 0, 0.3), P(TW, 0, 0.3), P(TW, 0, FAR), P(-TW, 0, FAR)];
  poly(ctx, floorPoly, vertical(ctx, 206, 720, ['#0a0808', '#2a2420', '#4a4038']), { width: 0 });
  const rand = seeded(23);
  for (let i = 0; i < 700; i++) {
    const Z = 0.33 + Math.pow(rand(), 2) * 2.5;
    const X = (rand() * 2 - 1) * TW;
    const [x, y] = P(X, 0, Z);
    ctx.fillStyle = rand() < 0.5 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(160, 140, 120, 0.18)';
    ctx.fillRect(x, y, 3 / Z * 0.5, 2 / Z * 0.4);
  }
}

function paintTracks(ctx) {
  // Schwellen: Hauptgleis
  for (let Z = 0.33; Z < FAR; Z *= 1.075) {
    const dz = 0.028 * Z;
    poly(ctx, [P(-110, 0, Z), P(110, 0, Z), P(110, 0, Z + dz), P(-110, 0, Z + dz)], '#2a1e16', { width: Z < 1 ? 1.5 : 0 });
  }
  // Schwellen: Abzweig
  for (let Z = SWITCH_Z + 0.04; Z < 1.62; Z *= 1.06) {
    const X = branchX(Z), dz = 0.026 * Z;
    poly(ctx, [P(X - 110, 0, Z), P(X + 110, 0, Z), P(X + 110, 0, Z + dz), P(X - 110, 0, Z + dz)], '#2a1e16', { width: 1.2 });
  }
  // Schienen
  const rail = (points) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#141414';
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#8a8f94';
    ctx.stroke();
  };
  for (const side of [-1, 1]) rail([P(side * RAIL, 4, 0.3), P(side * RAIL, 4, FAR)]);
  for (const side of [-1, 1]) {
    const points = [];
    for (let Z = SWITCH_Z; Z <= 1.64; Z += 0.02) points.push(P(branchX(Z) + side * RAIL, 4, Z));
    rail(points);
  }
  // Glanz des Scheinwerfers auf den Schienen
  for (const side of [-1, 1]) line(ctx, [P(side * RAIL, 5, 0.36), P(side * RAIL, 5, 1.2)], 'rgba(255, 240, 200, 0.35)', 1.5);
}

function paintLeftWall(ctx) {
  // Die große 5 an der Wand – die Ziffer aus dem Kamerabild im ersten Abteil
  onWall(ctx, -TW, [1.18, 1.5], [200, 30], (c) => {
    c.fillStyle = 'rgba(235, 230, 215, 0.75)';
    c.font = 'bold 100px "Trebuchet MS", sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.translate(0.5, 0.55);
    c.scale(0.0095, 0.0125);
    c.fillText('5', 0, 0);
  });
  // Die Tunnelkamera
  const [kx, ky] = P(-TW + 8, 262, 1.05);
  poly(ctx, [[kx - 4, ky - 12], [kx + 26, ky - 4], [kx + 26, ky + 12], [kx - 4, ky + 6]], '#2a2a2a', { width: 2.5 });
  circle(ctx, kx + 28, ky + 4, 6, '#0a0a0a', { width: 2 });
  line(ctx, [[kx - 4, ky - 4], [kx - 18, ky - 16]], '#1a1a1a', 3);
  // Strichliste: hundert Runden
  onWall(ctx, -TW, [0.66, 0.8], [172, 96], (c) => {
    c.strokeStyle = 'rgba(235, 225, 200, 0.7)';
    c.lineWidth = 0.012;
    for (let row = 0; row < 4; row++) {
      for (let group = 0; group < 5; group++) {
        const gx = 0.04 + group * 0.19, gy = 0.06 + row * 0.24;
        for (let i = 0; i < 4; i++) {
          c.beginPath();
          c.moveTo(gx + i * 0.035, gy);
          c.lineTo(gx + i * 0.035, gy + 0.16);
          c.stroke();
        }
        c.beginPath();
        c.moveTo(gx - 0.01, gy + 0.13);
        c.lineTo(gx + 0.13, gy + 0.03);
        c.stroke();
      }
    }
  });
  // Nische: das Lager des anderen Joseph
  const niche = [P(-TW, NICHE.y[0], NICHE.z[0]), P(-TW, NICHE.y[1], NICHE.z[0]), P(-TW, NICHE.y[1] + 30, (NICHE.z[0] + NICHE.z[1]) / 2), P(-TW, NICHE.y[1], NICHE.z[1]), P(-TW, NICHE.y[0], NICHE.z[1])];
  poly(ctx, niche, '#0a0706', { width: 3 });
  // Decke auf dem Boden
  poly(ctx, [P(-TW + 4, 2, 0.88), P(-TW + 4, 2, 0.99), P(-226, 2, 0.98), P(-232, 2, 0.89)], '#5a2a3a', { width: 2 });
  // Briefe
  const rand = seeded(31);
  for (let i = 0; i < 8; i++) {
    const [x, y] = P(-286 + rand() * 30, 4, 0.89 + rand() * 0.08);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() - 0.5);
    poly(ctx, [[-8, -4], [8, -4], [8, 4], [-8, 4]], '#efe2c0', { width: 1 });
    ctx.restore();
  }
}

function paintLamps(ctx) {
  for (const [side, Z] of [[1, 0.62], [1, 1.15], [-1, 2.2], [1, 2.6]]) {
    const [x, y] = P(side * (TW - 6), 210, Z);
    const s = 1 / Z;
    roundRect(ctx, x - 6 * s, y - 8 * s, 12 * s, 16 * s, 3 * s);
    ctx.fillStyle = '#ffb04a';
    ctx.fill();
    ctx.lineWidth = Math.max(1, 2 * s);
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    for (let i = -1; i <= 1; i++) line(ctx, [[x + i * 4 * s, y - 8 * s], [x + i * 4 * s, y + 8 * s]], 'rgba(30, 16, 6, 0.7)', Math.max(1, s));
    glow(ctx, x, y, 150 * s, '255, 170, 80', 0.32);
  }
}

function paintSignalPost(ctx) {
  line(ctx, [P(SIGNAL.X, 0, SIGNAL.Z), P(SIGNAL.X, SIGNAL.Y, SIGNAL.Z)], '#1a1a1a', 6);
  line(ctx, [P(SIGNAL.X, 0, SIGNAL.Z), P(SIGNAL.X, SIGNAL.Y, SIGNAL.Z)], '#5a5a5a', 2.5);
  const [x, y] = P(SIGNAL.X, SIGNAL.Y + 20, SIGNAL.Z);
  roundRect(ctx, x - 14, y - 30, 28, 52, 8);
  ctx.fillStyle = '#141414';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

// Lichtkegel des Scheinwerfers: von unten links in den Tunnel hinein
function paintHeadlight(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const [hx, hy] = P(-210, 95, LOCO.z);
  const cone = ctx.createLinearGradient(hx, hy, 640, 300);
  cone.addColorStop(0, 'rgba(255, 236, 190, 0.32)');
  cone.addColorStop(1, 'rgba(255, 236, 190, 0)');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(hx, hy - 30);
  ctx.lineTo(760, 250);
  ctx.lineTo(820, 420);
  ctx.lineTo(hx + 40, hy + 60);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  glow(ctx, 600, 430, 360, '255, 230, 170', 0.12);
}

function paintLoco(ctx) {
  const [x0, y0] = P(LOCO.x[0], LOCO.y[1], LOCO.z);
  const [x1, y1] = P(LOCO.x[1], LOCO.y[0], LOCO.z);
  // Stirnseite der Lok
  poly(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], vertical(ctx, y0, 720, ['#5a1e1a', '#3a1210']), { width: 4 });
  // Pufferbohle mit Warnstreifen
  const [, by0] = P(0, 34, LOCO.z);
  const [, by1] = P(0, 12, LOCO.z);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, by0, x1 - x0, by1 - by0);
  ctx.clip();
  ctx.fillStyle = '#e8c74a';
  ctx.fillRect(x0, by0, x1 - x0, by1 - by0);
  ctx.fillStyle = '#141414';
  for (let x = x0 - 200; x < x1; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, by1);
    ctx.lineTo(x + 23, by1);
    ctx.lineTo(x + 23 + (by1 - by0), by0);
    ctx.lineTo(x + (by1 - by0), by0);
    ctx.fill();
  }
  ctx.restore();
  poly(ctx, [[x0, by0], [x1, by0], [x1, by1], [x0, by1]], null, { width: 3 });
  // Puffer
  const [px, py] = P(-140, 24, LOCO.z - 0.02);
  circle(ctx, px, py, 34, '#2a2a2a', { width: 3 });
  circle(ctx, px, py, 22, '#4a4a4a', { width: 2 });
  // Scheinwerfer
  const [hx, hy] = P(-210, 95, LOCO.z);
  circle(ctx, hx, hy, 30, '#1a1a1a', { width: 3 });
  circle(ctx, hx, hy, 22, '#fff6d8', { width: 0 });
  glow(ctx, hx, hy, 120, '255, 236, 190', 0.6);
  // Nummernschild
  roundRect(ctx, x1 - 110, y0 + 24, 90, 30, 4);
  ctx.fillStyle = '#e8c74a';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  sign(ctx, 'RB 1', x1 - 65, y0 + 39, { font: 'bold 16px "Courier New", monospace', color: '#2b2118' });
  // Bremsventil: Gehäuse mit Vierkant
  const [vx, vy] = P(-150, 68, LOCO.z);
  roundRect(ctx, vx - 22, vy - 18, 44, 36, 6);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  poly(ctx, [[vx - 5, vy - 5], [vx + 5, vy - 5], [vx + 5, vy + 5], [vx - 5, vy + 5]], '#c9a24a', { width: 1.5 });
  sign(ctx, 'BREMSE', vx, vy - 28, { font: 'bold 11px "Trebuchet MS", sans-serif', color: '#f3e2bf' });
}

// ============================================================================================
//  Bewegliche Teile
// ============================================================================================

// Der Weichenhebel: 'locked' (Vorhängeschloss), 'normal', 'thrown' (umgelegt) oder 'tied' (festgebunden)
export function paintLever(ctx, state) {
  const thrown = state === 'thrown' || state === 'tied';
  const angle = thrown ? 0.55 : -0.55;
  const [ax, ay] = P(PIVOT.X, PIVOT.Y, PIVOT.Z);
  const [bx, by] = P(PIVOT.X + Math.sin(angle) * 86, PIVOT.Y + Math.cos(angle) * 86, PIVOT.Z);
  line(ctx, [[ax, ay], [bx, by]], OUTLINE, 11);
  line(ctx, [[ax, ay], [bx, by]], '#9aa3ab', 6);
  // Gegengewicht (rot-weiß)
  circle(ctx, bx, by, 13, '#e8e8e8', { width: 3 });
  ctx.beginPath();
  ctx.arc(bx, by, 13, Math.PI / 2, Math.PI * 1.5);
  ctx.fillStyle = '#c0392b';
  ctx.fill();
  circle(ctx, ax, ay, 7, '#3a3a3a', { width: 2.5 });
  if (state === 'locked') {
    // Vorhängeschloss am Hebel
    ctx.beginPath();
    ctx.arc(ax + 12, ay + 2, 7, Math.PI, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c0c6cc';
    ctx.stroke();
    roundRect(ctx, ax + 3, ay + 2, 18, 15, 3);
    ctx.fillStyle = '#c99a4a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }
  if (state === 'tied') {
    // zwei Schals: vom Hebel zum Ring an der Schwelle
    const [rx, ry] = P(-72, 6, 0.79);
    ctx.lineCap = 'round';
    for (const [color, offset] of [['#ece2c4', -3], ['#d9cfb0', 3]]) {
      ctx.beginPath();
      ctx.moveTo(bx + offset, by + 4);
      ctx.quadraticCurveTo((bx + rx) / 2 + offset, Math.max(by, ry) + 18, rx + offset, ry);
      ctx.lineWidth = 7;
      ctx.strokeStyle = OUTLINE;
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    circle(ctx, (bx + rx) / 2, Math.max(by, ry) + 12, 6, '#c9bf9e', { width: 2 });
  }
}

// Weichenzungen: liegen am Hauptgleis oder am Abzweig an
export function paintBlades(ctx, thrown) {
  for (const side of [-1, 1]) {
    const to = thrown ? branchX(SWITCH_Z + 0.12) + side * RAIL : side * RAIL;
    const from = side * RAIL - (thrown ? (side < 0 ? 0 : 10) : (side > 0 ? 0 : -10));
    line(ctx, [P(from, 5, SWITCH_Z - 0.03), P(to, 5, SWITCH_Z + 0.12)], '#d8dde2', 3);
  }
}

export function paintSignal(ctx, green, time) {
  const [x, y] = P(SIGNAL.X, SIGNAL.Y + 20, SIGNAL.Z);
  const pulse = 0.85 + 0.15 * Math.sin(time * 3);
  circle(ctx, x, y - 14, 8, green ? '#2a3a2a' : '#ff3a2a', { width: 2 });
  circle(ctx, x, y + 8, 8, green ? '#5aff7a' : '#1a2a1a', { width: 2 });
  if (green) glow(ctx, x, y + 8, 60, '90, 255, 120', 0.45 * pulse);
  else glow(ctx, x, y - 14, 60, '255, 60, 40', 0.45 * pulse);
}

export function paintCandle(ctx, time) {
  const { x, y } = CANDLE;
  poly(ctx, [[x - 4, y], [x + 4, y], [x + 4, y - 18], [x - 4, y - 18]], '#efe6d2', { width: 1.5 });
  const flicker = Math.sin(time * 15) * 1.2 + Math.sin(time * 6.1);
  ctx.beginPath();
  ctx.moveTo(x, y - 32 - flicker);
  ctx.quadraticCurveTo(x + 5, y - 22, x, y - 18);
  ctx.quadraticCurveTo(x - 5, y - 22, x, y - 32 - flicker);
  ctx.fillStyle = '#ffd36b';
  ctx.fill();
  glow(ctx, x, y - 24, 80, '255, 190, 100', 0.4);
}

export function paintCameraLed(ctx, time) {
  const [kx, ky] = P(-TW + 8, 262, 1.05);
  if (Math.sin(time * 2.4) > 0.2) {
    circle(ctx, kx + 18, ky - 2, 2.5, '#ff3a2a', { width: 0 });
    glow(ctx, kx + 18, ky - 2, 14, '255, 60, 40', 0.6);
  }
}

// ============================================================================================
//  Szenen-Daten
// ============================================================================================

const lever = (scene) => (scene.flags.leverLocked !== false ? 'locked' : scene.flags.leverTied ? 'tied' : scene.flags.leverHeld ? 'thrown' : 'normal');

export const tunnel = {
  id: 'tunnel',
  name: 'Tunnel',
  background: { paint: paintBackground, x: 0, y: 0, width: 1280, height: 720 },

  props: [
    { id: 'blades', paint: (ctx, scene) => paintBlades(ctx, scene.flags.leverTied || scene.flags.leverHeld) },
    { id: 'signal', paint: (ctx, scene) => paintSignal(ctx, scene.flags.leverTied || scene.flags.leverHeld, scene.time) },
    { id: 'candle', paint: (ctx, scene) => paintCandle(ctx, scene.time) },
    { id: 'cameraLed', paint: (ctx, scene) => paintCameraLed(ctx, scene.time) },
    { id: 'lever', paint: (ctx, scene) => paintLever(ctx, lever(scene)), depth: P(PIVOT.X, 0, PIVOT.Z)[1] },
    { id: 'other', when: 'otherHere', paint: (ctx, scene) => paintOtherJoseph(ctx, scene, { x: scene.flags.otherX ?? OTHER.x, y: scene.flags.otherY ?? OTHER.y, facing: scene.flags.otherFacing ?? 'left' }), depth: OTHER.y },
  ],

  hotspots: [
    { id: 'other', name: 'Der andere Joseph', cursor: 'talk', when: 'otherHere', area: rect(OTHER.x - 52, OTHER.y - 270, 104, 270), walkTo: floor(-30, 0.8), facing: 'right' },
    { id: 'lever', name: 'Weichenhebel', area: boxArea({ x: [-200, -100], y: [0, 130], z: [0.69, 0.75] }), walkTo: floor(-105, 0.66), facing: 'left' },
    { id: 'loco', name: 'Lok', area: rect(0, 438, 300, 282), walkTo: floor(-120, 0.45), facing: 'left' },
    { id: 'signal', name: 'Signal', cursor: 'look', area: rect(P(SIGNAL.X, SIGNAL.Y + 20, SIGNAL.Z)[0] - 22, P(SIGNAL.X, SIGNAL.Y + 20, SIGNAL.Z)[1] - 40, 44, 74) },
    { id: 'exit', name: 'Lichtschein', area: [P(TW, 0, EXIT.z[0]), P(TW, EXIT.apex, EXIT.z[0]), P(TW, EXIT.apex, EXIT.z[1]), P(TW, 0, EXIT.z[1])].map(([x, y]) => [Math.round(x - 20), Math.round(y)]), walkTo: floor(200, 1.05), facing: 'right' },
    { id: 'camp', name: 'Nische', area: [P(-TW, 0, NICHE.z[0]), P(-TW, NICHE.y[1] + 30, NICHE.z[0]), P(-TW, NICHE.y[1] + 30, NICHE.z[1]), P(-TW, 0, NICHE.z[1]), P(-230, 0, 0.95), P(-230, 0, 0.88)].map(([x, y]) => [Math.round(x), Math.round(y)]), walkTo: floor(-235, 0.93), facing: 'left' },
    { id: 'tally', name: 'Striche an der Wand', cursor: 'look', area: [P(-TW, 172, 0.66), P(-TW, 172, 0.8), P(-TW, 96, 0.8), P(-TW, 96, 0.66)].map(([x, y]) => [Math.round(x), Math.round(y)]) },
    { id: 'camera', name: 'Kamera', cursor: 'look', area: rect(P(-TW + 8, 262, 1.05)[0] - 22, P(-TW + 8, 262, 1.05)[1] - 22, 64, 44) },
    { id: 'five', name: 'Die 5 an der Wand', cursor: 'look', area: [P(-TW, 200, 1.18), P(-TW, 200, 1.5), P(-TW, 30, 1.5), P(-TW, 30, 1.18)].map(([x, y]) => [Math.round(x), Math.round(y)]) },
    { id: 'track', name: 'Gleis', cursor: 'look', area: rect(560, 210, 160, 120) },
  ],

  // Der Zug steht: kein Rumpeln, das Licht bleibt an (draußen gibt es keine Abteillampe, die ausgehen könnte)
  train: trainFor([], { speed: 0, shake: 0, lightsOutInTunnel: false }),

  playerStart: { x: P(-60, 0, 0.45)[0], y: P(-60, 0, 0.45)[1], facing: 'back' },
  perspective: PERSPECTIVE,

  walkArea: {
    outline: [
      floor(-250, 1.1),
      floor(250, 1.1),
      floor(250, 0.42),
      floor(-130, 0.42),
      floor(-185, 0.56),
      floor(-250, 0.76),
    ],
    holes: [],
  },
};
