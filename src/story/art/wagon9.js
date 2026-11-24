import { loadImage } from '../../core/assets.js';
import { STAND_MIRRORS, WALL_MIRRORS } from '../../scene/mirrorCar.js';
import { HAND, PRINT, SERIF, cachedLayer, fineGrain, glow, grain, line, plank, rivet, rrect, seeded, smudge, text, vignette } from './common.js';

// Gezeichnetes für Wagen 9 (Spiegelwagen): was in den Spiegeln zu sehen ist, die Hebel,
// die Kratzer (Spiegelschrift) und der Lichtplan mit den vier Standspiegeln.

let joseph = null;
loadImage('assets/characters/joseph/front.png').then((image) => { joseph = image; });

export const SCRATCH_TEXT = ['ER IST', 'EINE RUNDE', 'ZU SPÄT'];

// ---------------------------------------------------------------- Spiegel
// Echte Spiegel: Jeder Spiegel zeigt den Raum seitenverkehrt (das Hintergrundbild, gespiegelt und
// kleiner, weil weiter weg). In den Wandspiegeln läuft Joseph live mit – sein aktuelles Bild,
// gespiegelt und an der Stelle, an die der gespiegelte Raum ihn setzt. Die Standspiegel zeigen nur
// den Raum (sie gehören dem Lichtstrahl).
// figures: [{ mirror: 'wall0' | 'standA' …, alpha, dark, offset }] – erzählte Spiegelbilder (Rätsel);
//   wo eins steht, ersetzt es das Live-Bild.
// room: das Hintergrundbild; live: { image, x, y, height } – Joseph, wie er gerade gezeichnet wird.
const ROOM_SCALE = 0.62;   // so viel kleiner erscheint der gespiegelte Raum
const STAND_SCALE = 0.5;

export function drawMirrors(ctx, { figures = [], time = 0, room = null, live = null } = {}) {
  const all = [
    ...WALL_MIRRORS.map((m, i) => ({ ...m, key: `wall${i}`, wall: true })),
    ...STAND_MIRRORS.map((m) => ({ ...m, key: `stand${m.id}` })),
  ];
  const mirrored = room ? roomLayer(room) : null;
  for (const m of all) {
    const w = m.to - m.from, h = m.bottom - m.top;
    ctx.save();
    ctx.beginPath();
    ctx.rect(m.from - 2, m.top - 2, w + 4, h + 4);
    ctx.clip();
    // dunkles, warmes Glas als Grund
    const glass = ctx.createLinearGradient(m.from, m.top, m.to, m.bottom);
    glass.addColorStop(0, '#3a2a1e');
    glass.addColorStop(0.5, '#5b4330');
    glass.addColorStop(1, '#231811');
    ctx.fillStyle = glass;
    ctx.fillRect(m.from - 2, m.top - 2, w + 4, h + 4);

    const view = mirrorView(m);
    if (mirrored) {
      ctx.save();
      ctx.translate(view.x, view.y);
      ctx.scale(view.s, view.s);
      ctx.drawImage(mirrored, -view.ax, -view.ay, 1280, 720);
      ctx.restore();
    }
    const told = figures.filter((f) => f.mirror === m.key);
    if (m.wall && live?.image && !told.length) drawLive(ctx, view, live);
    // Spiegelglas schluckt etwas Licht und färbt warm
    ctx.fillStyle = 'rgba(28, 16, 8, 0.32)';
    ctx.fillRect(m.from - 2, m.top - 2, w + 4, h + 4);
    glow(ctx, m.from + w * 0.25, m.top + h * 0.3, Math.max(w, h) * 0.35, '255, 190, 110', 0.16 + 0.04 * Math.sin(time * 3 + m.from));
    for (const figure of told) drawReflection(ctx, m, figure);
    // Glanzstreifen
    ctx.fillStyle = 'rgba(255, 245, 230, 0.10)';
    ctx.beginPath();
    ctx.moveTo(m.from + w * 0.15, m.top);
    ctx.lineTo(m.from + w * 0.35, m.top);
    ctx.lineTo(m.from + w * 0.05, m.bottom);
    ctx.lineTo(m.from - w * 0.15, m.bottom);
    ctx.fill();
    ctx.restore();
  }
}

// Wie ein Spiegel den gespiegelten Raum zeigt: Der Punkt (ax, ay) des gespiegelten Raums liegt in
// der Mitte des Spiegels (x, y), verkleinert um s. Ein Wandspiegel blickt schräg auf die
// gegenüberliegende Wand, weiter hinten Richtung Tür – steht Joseph rechts, sieht man ihn links.
// Standspiegel blicken schräg auf den Boden davor.
function mirrorView(m) {
  const cx = (m.from + m.to) / 2, cy = (m.top + m.bottom) / 2;
  if (m.id) return { x: cx, y: cy, s: STAND_SCALE, ax: cx, ay: cy + 150 };
  return { x: cx, y: cy, s: ROOM_SCALE, ax: cx + (640 - cx) * 0.4, ay: cy + 40 };
}

// Hintergrund seitenverkehrt, die durchsichtigen Spiegelflächen darin mit dunklem Glas gefüllt
let roomCache = null;
function roomLayer(room) {
  if (roomCache?.room === room) return roomCache.canvas;
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const c = canvas.getContext('2d');
  c.fillStyle = '#2a1d14';
  c.fillRect(0, 0, 1280, 720);
  c.translate(1280, 0);
  c.scale(-1, 1);
  c.drawImage(room, 0, 0, 1280, 720);
  roomCache = { room, canvas };
  return canvas;
}

// Joseph live im Spiegel: dieselbe Abbildung wie der Raum, also gespiegelt und verkleinert
function drawLive(ctx, view, { image, x, y, height }) {
  const fx = 1280 - x;
  const px = view.x + (fx - view.ax) * view.s;
  const py = view.y + (y - view.ay) * view.s;
  const dh = height * view.s;
  const dw = (image.width / image.height) * dh;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.translate(px, py);
  ctx.scale(-1, 1);
  ctx.drawImage(image, -dw / 2, -dh, dw, dh);
  ctx.restore();
}

function drawReflection(ctx, m, { alpha = 0.8, dark = 0.45, offset = 0, scale = 1 }) {
  if (!joseph) return;
  const w = m.to - m.from, h = m.bottom - m.top;
  const height = h * 0.78 * scale;
  const width = (joseph.width / joseph.height) * height;
  const x = m.from + w / 2 - width / 2 + offset * w;
  const y = m.bottom - height + h * 0.04;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + width, y);
  ctx.scale(-1, 1); // spiegelverkehrt
  ctx.drawImage(joseph, 0, 0, width, height);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = `rgba(10, 6, 4, ${dark})`;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

// ---------------------------------------------------------------- Hebel
// Die Hebel sind im Hintergrundbild oben. Ist einer unten, wird der obere Griff übermalt
// und der Griff nach unten gezeichnet.
const LEVERS = {
  left: { pivot: [412, 230], knob: [446, 174], plateTop: 199, wall: '#55503a', plate: '#a8732c' },
  right: { pivot: [874, 230], knob: [842, 171], plateTop: 199, wall: '#4e4630', plate: '#a8732c' },
};

export function drawLevers(ctx, { left = 0, right = 0 } = {}) {
  drawLever(ctx, LEVERS.left, left);
  drawLever(ctx, LEVERS.right, right);
}

// down: 0 = oben (nichts zeichnen), 1 = ganz unten
function drawLever(ctx, lever, down) {
  if (down <= 0.02) return;
  const [px, py] = lever.pivot;
  const [kx, ky] = lever.knob;
  ctx.save();
  // alten Griff übermalen: Kugel und Stange über der Platte …
  ctx.fillStyle = lever.wall;
  ctx.beginPath();
  ctx.arc(kx, ky, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = 'round';
  ctx.strokeStyle = lever.wall;
  ctx.lineWidth = 16;
  const t = (lever.plateTop + 1 - py) / (ky - py);
  line(ctx, kx, ky, px + (kx - px) * t, lever.plateTop + 1);
  // … und auf der Platte
  ctx.strokeStyle = lever.plate;
  ctx.lineWidth = 14;
  line(ctx, px + (kx - px) * t, lever.plateTop + 4, px, py);
  // neuer Griff: um die Achse nach unten gedreht
  const angle = Math.atan2(ky - py, kx - px);
  const target = -angle; // an der Waagrechten gespiegelt
  const a = angle + (target - angle) * down;
  const length = Math.hypot(kx - px, ky - py);
  const nx = px + Math.cos(a) * length, ny = py + Math.sin(a) * length;
  ctx.strokeStyle = '#4a2c0c';
  ctx.lineWidth = 12;
  line(ctx, px, py, nx, ny);
  ctx.strokeStyle = '#e0a83c';
  ctx.lineWidth = 8;
  line(ctx, px, py, nx, ny);
  const knob = ctx.createRadialGradient(nx - 4, ny - 4, 2, nx, ny, 13);
  knob.addColorStop(0, '#ffe7a0');
  knob.addColorStop(1, '#a8701e');
  ctx.fillStyle = knob;
  ctx.beginPath();
  ctx.arc(nx, ny, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c48a2e';
  ctx.beginPath();
  ctx.arc(px, py, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4c14';
  ctx.beginPath();
  ctx.arc(px, py, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Lichtschein am Glasauge der Tür
export function drawEyeGlow(ctx, strength, time) {
  if (strength <= 0) return;
  glow(ctx, 680, 266, 70, '255, 240, 190', strength * (0.6 + 0.1 * Math.sin(time * 8)));
}

// ---------------------------------------------------------------- Kratzer
// mirrored = true: so wie sie in der Wand stehen (Spiegelschrift); false: im Spiegel gelesen
function paintScratchWall(c, mirrored) {
  plank(c, 0, 0, 1280, 720, { tone: [46, 28, 18], seed: 91, vertical: true, knots: 0 });
  vignette(c, 0, 0, 1280, 720, 0.7);
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 12;
  c.fillStyle = '#3a2410';
  c.fillRect(330, 150, 620, 420);
  c.restore();
  // Wandbretter (senkrecht), im Spiegel etwas kühler und dunkler
  for (let k = 0; k < 5; k++) plank(c, 340 + k * 120, 160, 120, 400, { tone: [118, 70, 34], seed: 92 + k, vertical: true, knots: 1 });
  for (let k = 1; k < 5; k++) {
    c.fillStyle = 'rgba(30, 14, 4, 0.6)';
    c.fillRect(340 + k * 120, 160, 2, 400);
  }
  fineGrain(c, 340, 160, 600, 400, { seed: 97, count: 0.003 });
  if (!mirrored) {
    // Spiegelglas: leicht bläulich, mit Glanzstreifen und blinden Stellen
    c.fillStyle = 'rgba(160, 190, 210, 0.12)';
    c.fillRect(340, 160, 600, 400);
    const sheen = c.createLinearGradient(340, 160, 700, 560);
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
    sheen.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
    sheen.addColorStop(0.6, 'rgba(255, 255, 255, 0.06)');
    sheen.addColorStop(0.7, 'rgba(255, 255, 255, 0)');
    c.fillStyle = sheen;
    c.fillRect(340, 160, 600, 400);
    for (const [x, y] of [[360, 540], [920, 180], [900, 540]]) glow(c, x, y, 50, '200, 200, 190', 0.25);
    // Goldrahmen mit Profil
    const fg = c.createLinearGradient(330, 150, 950, 570);
    fg.addColorStop(0, '#f2d98c');
    fg.addColorStop(0.5, '#a8822e');
    fg.addColorStop(1, '#5a3e12');
    c.strokeStyle = fg;
    c.lineWidth = 18;
    c.strokeRect(337, 157, 606, 406);
    c.strokeStyle = 'rgba(60, 40, 8, 0.7)';
    c.lineWidth = 2;
    c.strokeRect(346, 166, 588, 388);
    c.strokeStyle = 'rgba(255, 240, 190, 0.5)';
    c.strokeRect(329, 149, 622, 422);
    for (const [x, y] of [[337, 157], [943, 157], [337, 563], [943, 563]]) rivet(c, x, y, 6, [190, 150, 70]);
  } else {
    vignette(c, 340, 160, 600, 400, 0.35);
  }
}

export function drawScratches(ctx, mirrored) {
  ctx.drawImage(cachedLayer(`w9-scratch-${mirrored ? 'wall' : 'mirror'}`, (c) => paintScratchWall(c, mirrored)), 0, 0, 1280, 720);
  ctx.save();
  ctx.beginPath();
  ctx.rect(340, 160, 600, 400);
  ctx.clip();
  ctx.translate(640, 0);
  if (mirrored) ctx.scale(-1, 1);
  ctx.font = `bold 62px ${HAND}`;
  ctx.textAlign = 'center';
  const carve = (dx, dy, color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    SCRATCH_TEXT.forEach((row, i) => {
      ctx.save();
      ctx.translate(dx, 270 + i * 92 + dy);
      ctx.rotate(-0.04 + i * 0.03);
      ctx.strokeText(row, 0, 0);
      ctx.restore();
    });
    for (let i = 0; i < 9; i++) line(ctx, -260 + i * 60 + dx, 190 + (i % 3) * 120 + dy, -210 + i * 58 + dx, 230 + (i % 3) * 120 + dy);
  };
  // Kerbe: dunkle Tiefe, helles frisches Holz an der Kante
  carve(1.5, 2, 'rgba(20, 8, 2, 0.75)', 5);
  carve(0, 0, 'rgba(245, 220, 170, 0.85)', 2.5);
  ctx.restore();
  text(ctx, mirrored ? 'Tief in die Holzwand geritzt.' : 'Im Spiegel gegenüber: die Kratzer, richtig herum.', 640, 610, { font: `18px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Lichtplan
// Der Wagen von oben: Lichtstrahl von der Deckenlampe über die vier Standspiegel ins Glasauge.
// Gitter 5 × 5, Zeile 0 = an der Tür. '/' und '\' = Stellung des Spiegels.
export const GRID = { x: 390, y: 112, cell: 100, cols: 5, rows: 5 };
export const PLAN_MIRRORS = [
  { id: 'A', col: 2, row: 3 },
  { id: 'B', col: 0, row: 3 },
  { id: 'C', col: 0, row: 1 },
  { id: 'D', col: 2, row: 1 },
];
export const PLAN_START = { col: 2, row: 4, dx: 0, dy: -1 }; // der Strahl kommt von unten
export const PLAN_EYE = { col: 2, row: -1 };

// Verfolgt den Strahl. Ergebnis: Punkte (Mitten der Zellen) und ob er das Auge trifft.
export function traceBeam(turns) {
  const points = [{ col: PLAN_START.col, row: PLAN_START.row + 0.6 }];
  let { col, row, dx, dy } = PLAN_START;
  for (let steps = 0; steps < 40; steps++) {
    if (row < 0) {
      points.push({ col, row: -0.4 });
      return { points, hit: col === PLAN_EYE.col };
    }
    if (col < 0 || col >= GRID.cols || row >= GRID.rows) {
      points.push({ col: col - dx * 0.4, row: row - dy * 0.4 });
      return { points, hit: false };
    }
    const mirror = PLAN_MIRRORS.find((m) => m.col === col && m.row === row);
    if (mirror) {
      points.push({ col, row });
      const slash = turns[mirror.id] === '/';
      [dx, dy] = slash ? [-dy, -dx] : [dy, dx];
    }
    col += dx;
    row += dy;
  }
  return { points, hit: false };
}

const cellCenter = (col, row) => ({ x: GRID.x + (col + 0.5) * GRID.cell, y: GRID.y + (row + 0.5) * GRID.cell });

export function planSpots() {
  return PLAN_MIRRORS.map((m) => {
    const c = cellCenter(m.col, m.row);
    return { id: m.id, cx: c.x, cy: c.y, r: 40, label: `Standspiegel ${m.id} drehen` };
  });
}

// Der Plan hängt gerahmt im Wagen: vergilbtes Papier, Tusche und Wasserfarbe, Grundriss von oben.
const SEPIA = '#4a2e18';

export function drawPlan(ctx, turns, { lit = true, time = 0 } = {}) {
  const { x, y, cell, cols, rows } = GRID;
  const W = cols * cell, H = rows * cell;
  ctx.drawImage(cachedLayer('w9-plan', paintPlanPaper), 0, 0, 1280, 720);
  const eye = cellCenter(PLAN_EYE.col, 0);

  // Strahl
  const beam = traceBeam(turns);
  if (lit) {
    const pts = beam.points.map((p, i) => (i === 0 ? { x: cellCenter(p.col, p.row).x, y: y + H + 22 } : cellCenter(p.col, p.row)));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [width, color] of [[26, 'rgba(255, 200, 90, 0.16)'], [12, 'rgba(255, 214, 120, 0.35)'], [5, 'rgba(255, 236, 180, 0.9)'], [2, '#fffbea']]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
    // Staub, der im Licht tanzt
    let total = 0;
    const lengths = pts.slice(1).map((p, i) => {
      const d = Math.hypot(p.x - pts[i].x, p.y - pts[i].y);
      total += d;
      return d;
    });
    for (let k = 0; k < 26; k++) {
      let along = ((k / 26) * total + time * 40) % total;
      let seg = 0;
      while (seg < lengths.length - 1 && along > lengths[seg]) along -= lengths[seg++];
      const a = pts[seg], b = pts[seg + 1];
      const t = along / (lengths[seg] || 1);
      const wobble = Math.sin(time * 2 + k * 1.7) * 4;
      ctx.fillStyle = `rgba(255, 250, 225, ${0.5 + 0.4 * Math.sin(time * 3 + k)})`;
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * t + wobble, a.y + (b.y - a.y) * t - wobble, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (beam.hit) glow(ctx, eye.x, y - 22, 70, '255, 245, 200', 0.6 + 0.2 * Math.sin(time * 6));
  }

  // Standspiegel von oben: Messingfuß mit drei Beinen, darauf der drehbare Spiegel
  for (const m of PLAN_MIRRORS) drawStandMirror(ctx, m, turns[m.id] === '/');
  return beam;
}

function drawStandMirror(ctx, m, slash) {
  const c = cellCenter(m.col, m.row);
  ctx.save();
  ctx.translate(c.x, c.y);
  // Schatten
  ctx.fillStyle = 'rgba(60, 36, 16, 0.22)';
  ctx.beginPath();
  ctx.ellipse(5, 6, 38, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  // drei Beine mit Kugelfüßen
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 3 + 0.3;
    line(ctx, Math.cos(a) * 14, Math.sin(a) * 14, Math.cos(a) * 36, Math.sin(a) * 36);
    ctx.fillStyle = '#c99a3c';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 37, Math.sin(a) * 37, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Drehteller mit Gradteilung
  const plate = ctx.createRadialGradient(-6, -6, 2, 0, 0, 24);
  plate.addColorStop(0, '#f5dc96');
  plate.addColorStop(0.7, '#c08a30');
  plate.addColorStop(1, '#7a5218');
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (let k = 0; k < 24; k++) {
    const a = (k * Math.PI * 2) / 24;
    const r0 = k % 6 ? 20 : 16;
    line(ctx, Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * 23, Math.sin(a) * 23);
  }
  // Drehpfeil
  ctx.strokeStyle = 'rgba(74, 46, 24, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 44, -2.6, -1.4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(74, 46, 24, 0.55)';
  ctx.beginPath();
  const ax = Math.cos(-1.4) * 44, ay = Math.sin(-1.4) * 44;
  ctx.moveTo(ax + 6, ay - 1);
  ctx.lineTo(ax - 3, ay - 5);
  ctx.lineTo(ax - 2, ay + 4);
  ctx.fill();
  // Spiegel: Glas mit Goldrahmen, beidseitig verspiegelt
  ctx.rotate(slash ? -Math.PI / 4 : Math.PI / 4);
  ctx.shadowColor = 'rgba(40, 20, 6, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#a8762a';
  rrect(ctx, -38, -7, 76, 14, 5);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  const glass = ctx.createLinearGradient(-34, -4, 34, 4);
  glass.addColorStop(0, '#cfe4ea');
  glass.addColorStop(0.45, '#ffffff');
  glass.addColorStop(0.55, '#b5d2da');
  glass.addColorStop(1, '#e6f2f4');
  ctx.fillStyle = glass;
  ctx.fillRect(-33, -3.5, 66, 7);
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.2;
  rrect(ctx, -38, -7, 76, 14, 5);
  ctx.stroke();
  for (const ex of [-38, 38]) {
    ctx.fillStyle = '#e8c467';
    ctx.beginPath();
    ctx.arc(ex, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  // Buchstabe im kleinen Schild
  const lx = c.x + 34, ly = c.y - 32;
  ctx.fillStyle = '#f3e6c4';
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(lx, ly, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  text(ctx, m.id, lx, ly + 6, { font: `bold 16px ${SERIF}`, color: SEPIA, align: 'center' });
}

function paintPlanPaper(ctx) {
  const { x, y, cell, cols, rows } = GRID;
  const W = cols * cell, H = rows * cell;
  const PX = 322, PY = 48, PW = 636, PH = 636;
  // Goldrahmen
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  const frame = ctx.createLinearGradient(PX - 24, PY - 24, PX + PW + 24, PY + PH + 24);
  frame.addColorStop(0, '#f2d27a');
  frame.addColorStop(0.3, '#9a6a1e');
  frame.addColorStop(0.55, '#e8c060');
  frame.addColorStop(1, '#6a4410');
  ctx.fillStyle = frame;
  ctx.fillRect(PX - 24, PY - 24, PW + 48, PH + 48);
  ctx.restore();
  ctx.strokeStyle = 'rgba(60, 36, 8, 0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(PX - 16, PY - 16, PW + 32, PH + 32);
  ctx.strokeStyle = 'rgba(255, 240, 190, 0.6)';
  ctx.setLineDash([2, 4]);
  ctx.strokeRect(PX - 10, PY - 10, PW + 20, PH + 20);
  ctx.setLineDash([]);
  for (const [cx, cy] of [[PX - 12, PY - 12], [PX + PW + 12, PY - 12], [PX - 12, PY + PH + 12], [PX + PW + 12, PY + PH + 12]]) {
    const rosette = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 14);
    rosette.addColorStop(0, '#fff0b8');
    rosette.addColorStop(1, '#8a5a14');
    ctx.fillStyle = rosette;
    ctx.beginPath();
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI) / 8;
      const r = k % 2 ? 8 : 15;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.fill();
  }
  // Papier: vergilbt, Ränder dunkler, Stockflecken, Faltlinien
  const paper = ctx.createRadialGradient(640, 360, 120, 640, 360, 480);
  paper.addColorStop(0, '#f1e4c2');
  paper.addColorStop(0.75, '#e2cf9e');
  paper.addColorStop(1, '#c4a46a');
  ctx.fillStyle = paper;
  ctx.fillRect(PX, PY, PW, PH);
  grain(ctx, PX, PY, PW, PH, { seed: 9, count: 2600, alpha: 0.12 });
  const random = seeded(99);
  for (let i = 0; i < 18; i++) smudge(ctx, PX + random() * PW, PY + random() * PH, 6 + random() * 18, 6 + random() * 18, 'rgba(150, 100, 40, 0.22)');
  ctx.strokeStyle = 'rgba(120, 90, 50, 0.18)';
  ctx.lineWidth = 2;
  line(ctx, PX, PY + PH / 2, PX + PW, PY + PH / 2);
  line(ctx, PX + PW / 2, PY, PX + PW / 2, PY + PH);
  ctx.strokeStyle = 'rgba(255, 250, 230, 0.25)';
  ctx.lineWidth = 1;
  line(ctx, PX, PY + PH / 2 + 2, PX + PW, PY + PH / 2 + 2);
  // Zeichenrand
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PX + 12, PY + 12, PW - 24, PH - 24);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(PX + 16, PY + 16, PW - 32, PH - 32);

  // Boden: Dielen längs, mit Tusche schraffiert und braun laviert
  ctx.fillStyle = 'rgba(150, 96, 50, 0.32)';
  ctx.fillRect(x, y, W, H);
  ctx.strokeStyle = 'rgba(74, 46, 24, 0.28)';
  ctx.lineWidth = 1;
  for (let px = x + 25; px < x + W; px += 25) line(ctx, px, y, px, y + H);
  const r2 = seeded(5);
  for (let px = x; px < x + W; px += 25) {
    for (let py = y + r2() * 80; py < y + H; py += 70 + r2() * 90) line(ctx, px, py, px + 25, py);
  }
  // Läufer: rote Lasur, Bordüre mit Rauten
  const rx = x + cell * 1.6, rw = cell * 1.8;
  ctx.fillStyle = 'rgba(168, 40, 30, 0.42)';
  ctx.fillRect(rx, y, rw, H);
  ctx.strokeStyle = 'rgba(200, 150, 50, 0.85)';
  ctx.lineWidth = 2;
  line(ctx, rx + 8, y, rx + 8, y + H);
  line(ctx, rx + rw - 8, y, rx + rw - 8, y + H);
  ctx.fillStyle = 'rgba(210, 160, 60, 0.7)';
  for (let py = y + 14; py < y + H; py += 22) {
    for (const bx of [rx + 8, rx + rw - 8]) {
      ctx.beginPath();
      ctx.moveTo(bx, py - 5);
      ctx.lineTo(bx + 4, py);
      ctx.lineTo(bx, py + 5);
      ctx.lineTo(bx - 4, py);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(120, 30, 20, 0.35)';
  ctx.lineWidth = 1;
  for (let py = y + 40; py < y + H; py += 80) {
    ctx.beginPath();
    ctx.ellipse(rx + rw / 2, py, 20, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Rasterlinien in Bleistift, Koordinaten am Rand
  ctx.strokeStyle = 'rgba(80, 70, 60, 0.22)';
  ctx.setLineDash([3, 5]);
  for (let i = 1; i < cols; i++) line(ctx, x + i * cell, y, x + i * cell, y + H);
  for (let i = 1; i < rows; i++) line(ctx, x, y + i * cell, x + W, y + i * cell);
  ctx.setLineDash([]);
  // Wände: doppelt gezogen und schraffiert
  const wall = (wx, wy, ww, wh) => {
    ctx.fillStyle = 'rgba(74, 46, 24, 0.18)';
    ctx.fillRect(wx, wy, ww, wh);
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    ctx.strokeStyle = 'rgba(74, 46, 24, 0.55)';
    ctx.lineWidth = 1;
    for (let k = -wh; k < ww + wh; k += 6) line(ctx, wx + k, wy, wx + k + wh, wy + wh);
    ctx.restore();
    ctx.strokeStyle = SEPIA;
    ctx.lineWidth = 2;
    ctx.strokeRect(wx, wy, ww, wh);
  };
  wall(x - 16, y - 16, 16, H + 32);
  wall(x + W, y - 16, 16, H + 32);
  wall(x, y + H, W, 16);
  wall(x, y - 16, cell * 1.9, 16);
  wall(x + cell * 3.1, y - 16, cell * 1.9, 16);
  // Wandspiegel: ovale Rahmen an beiden Längswänden, dazwischen Kerzenleuchter
  for (const side of [0, 1]) {
    const wx = side ? x + W : x;
    for (const row of [0.9, 2.5, 4.1]) {
      const wy = y + row * cell;
      ctx.fillStyle = '#d8b25a';
      ctx.strokeStyle = SEPIA;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(wx + (side ? -3 : 3), wy, 5, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e3f0f2';
      ctx.beginPath();
      ctx.ellipse(wx + (side ? -3 : 3), wy, 2, 28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const row of [1.7, 3.3]) {
      const wy = y + row * cell;
      const sx = wx + (side ? -10 : 10);
      ctx.strokeStyle = SEPIA;
      ctx.lineWidth = 1.2;
      line(ctx, wx, wy, sx, wy);
      ctx.fillStyle = 'rgba(255, 190, 80, 0.45)';
      ctx.beginPath();
      ctx.arc(sx, wy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.arc(sx, wy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Tür mit Glasauge
  const eye = cellCenter(PLAN_EYE.col, 0);
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(110, 74, 40, 0.55)';
  ctx.fillRect(eye.x - 60, y - 40, 120, 30);
  ctx.strokeRect(eye.x - 60, y - 40, 120, 30);
  ctx.lineWidth = 1;
  line(ctx, eye.x, y - 40, eye.x, y - 10);
  const lens = ctx.createRadialGradient(eye.x - 3, y - 25, 1, eye.x, y - 22, 13);
  lens.addColorStop(0, '#ffffff');
  lens.addColorStop(0.5, '#9fd6c8');
  lens.addColorStop(1, '#1f6a5a');
  ctx.fillStyle = '#c99a3c';
  ctx.beginPath();
  ctx.arc(eye.x, y - 22, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = lens;
  ctx.beginPath();
  ctx.arc(eye.x, y - 22, 11, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '← Tür mit Glasauge', eye.x + 72, y - 22, { font: `italic 15px ${SERIF}`, color: SEPIA });
  // Deckenlampe (unten) – von dort kommt der Strahl
  const lampX = cellCenter(PLAN_START.col, PLAN_START.row).x, lampY = y + H + 22;
  ctx.fillStyle = '#c99a3c';
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    ctx.lineTo(lampX + Math.cos(a) * 13, lampY + Math.sin(a) * 13);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff3c8';
  ctx.beginPath();
  ctx.arc(lampX, lampY, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'Lichtstrahl der Deckenlampe', lampX, y + H + 56, { font: `italic 15px ${SERIF}`, color: SEPIA, align: 'center' });
  // Titelschild
  ctx.save();
  ctx.translate(PX + 104, PY + 44);
  ctx.fillStyle = 'rgba(245, 232, 200, 0.9)';
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1.2;
  rrect(ctx, -80, -24, 160, 46, 6);
  ctx.fill();
  ctx.stroke();
  text(ctx, 'SPIEGELWAGEN', 0, -3, { font: `bold 15px ${SERIF}`, color: SEPIA, align: 'center' });
  text(ctx, 'Grundriss · Lichtführung', 0, 14, { font: `italic 11px ${SERIF}`, color: SEPIA, align: 'center' });
  ctx.restore();
  // Maßstab
  const sx = PX + 40, sy = PY + PH - 34;
  ctx.strokeStyle = SEPIA;
  ctx.lineWidth = 1;
  for (let k = 0; k < 4; k++) {
    ctx.fillStyle = k % 2 ? 'rgba(245, 232, 200, 0.9)' : SEPIA;
    ctx.fillRect(sx + k * 22, sy, 22, 5);
    ctx.strokeRect(sx + k * 22, sy, 22, 5);
  }
  text(ctx, '0', sx, sy - 4, { font: `10px ${SERIF}`, color: SEPIA, align: 'center' });
  text(ctx, '2 m', sx + 88, sy - 4, { font: `10px ${SERIF}`, color: SEPIA, align: 'center' });
  // Stempel der Werkstatt
  ctx.save();
  ctx.translate(PX + PW - 74, PY + PH - 44);
  ctx.rotate(-0.2);
  ctx.scale(0.8, 0.8);
  ctx.strokeStyle = 'rgba(170, 40, 30, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'RINGBAHN', 0, -4, { font: `bold 9px ${SERIF}`, color: 'rgba(170, 40, 30, 0.7)', align: 'center' });
  text(ctx, 'Werkstatt', 0, 9, { font: `italic 9px ${SERIF}`, color: 'rgba(170, 40, 30, 0.7)', align: 'center' });
  ctx.restore();
}
