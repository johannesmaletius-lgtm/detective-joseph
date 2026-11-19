import { loadImage } from '../../core/assets.js';
import { STAND_MIRRORS, WALL_MIRRORS } from '../../scene/mirrorCar.js';
import { HAND, PRINT, glow, line, text, wood } from './common.js';

// Gezeichnetes für Wagen 9 (Spiegelwagen): was in den Spiegeln zu sehen ist, die Hebel,
// die Kratzer (Spiegelschrift) und der Lichtplan mit den vier Standspiegeln.

let joseph = null;
loadImage('assets/characters/joseph/front.png').then((image) => { joseph = image; });

export const SCRATCH_TEXT = ['ER IST', 'EINE RUNDE', 'ZU SPÄT'];

// ---------------------------------------------------------------- Spiegel
// figures: [{ mirror: 'wall0' | 'standA' …, alpha, dark, offset }] – Spiegelbilder von Joseph
export function drawMirrors(ctx, { figures = [], time = 0 } = {}) {
  const all = [
    ...WALL_MIRRORS.map((m, i) => ({ ...m, key: `wall${i}`, oval: true })),
    ...STAND_MIRRORS.map((m) => ({ ...m, key: `stand${m.id}`, round: true })),
  ];
  for (const m of all) {
    const w = m.to - m.from, h = m.bottom - m.top;
    ctx.save();
    ctx.beginPath();
    ctx.rect(m.from - 2, m.top - 2, w + 4, h + 4);
    ctx.clip();
    // dunkles, warmes Glas mit dem Widerschein der Kerzen
    const glass = ctx.createLinearGradient(m.from, m.top, m.to, m.bottom);
    glass.addColorStop(0, '#3a2a1e');
    glass.addColorStop(0.5, '#5b4330');
    glass.addColorStop(1, '#231811');
    ctx.fillStyle = glass;
    ctx.fillRect(m.from - 2, m.top - 2, w + 4, h + 4);
    // Spiegelung des Gangs: Teppich und Fluchtpunkt
    ctx.fillStyle = 'rgba(120, 30, 24, 0.45)';
    ctx.beginPath();
    ctx.moveTo(m.from + w * 0.42, m.top + h * 0.55);
    ctx.lineTo(m.from + w * 0.58, m.top + h * 0.55);
    ctx.lineTo(m.from + w * 0.85, m.bottom + 2);
    ctx.lineTo(m.from + w * 0.15, m.bottom + 2);
    ctx.fill();
    glow(ctx, m.from + w * 0.25, m.top + h * 0.3, Math.max(w, h) * 0.35, '255, 190, 110', 0.22 + 0.04 * Math.sin(time * 3 + m.from));
    for (const figure of figures.filter((f) => f.mirror === m.key)) drawReflection(ctx, m, figure);
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
export function drawScratches(ctx, mirrored) {
  ctx.save();
  const panel = ctx.createLinearGradient(330, 150, 950, 570);
  panel.addColorStop(0, '#7a4a22');
  panel.addColorStop(1, '#4c2c12');
  ctx.fillStyle = panel;
  ctx.fillRect(330, 150, 620, 420);
  wood(ctx, 340, 160, 600, 400, [110, 64, 30]);
  if (!mirrored) {
    // Rahmen eines Spiegels
    ctx.strokeStyle = '#c9a24c';
    ctx.lineWidth = 16;
    ctx.strokeRect(338, 158, 604, 404);
  }
  ctx.translate(640, 0);
  if (mirrored) ctx.scale(-1, 1);
  ctx.strokeStyle = 'rgba(245, 220, 170, 0.85)';
  ctx.lineWidth = 3;
  ctx.font = `bold 62px ${HAND}`;
  ctx.textAlign = 'center';
  SCRATCH_TEXT.forEach((row, i) => {
    ctx.save();
    ctx.translate(0, 270 + i * 92);
    ctx.rotate(-0.04 + i * 0.03);
    ctx.strokeText(row, 0, 0);
    ctx.restore();
  });
  // ein paar wilde Striche dazwischen
  ctx.strokeStyle = 'rgba(245, 220, 170, 0.4)';
  for (let i = 0; i < 9; i++) line(ctx, -260 + i * 60, 190 + (i % 3) * 120, -210 + i * 58, 230 + (i % 3) * 120);
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

export function drawPlan(ctx, turns, { lit = true, time = 0 } = {}) {
  const { x, y, cell, cols, rows } = GRID;
  const W = cols * cell, H = rows * cell;
  wood(ctx, x - 90, y - 110, W + 180, H + 190, [70, 40, 22]);
  // Boden des Wagens
  ctx.fillStyle = '#2b1d14';
  ctx.fillRect(x, y, W, H);
  ctx.fillStyle = 'rgba(140, 32, 26, 0.55)';
  ctx.fillRect(x + cell * 1.6, y, cell * 1.8, H);
  ctx.strokeStyle = 'rgba(255, 230, 170, 0.12)';
  ctx.lineWidth = 1;
  for (let i = 1; i < cols; i++) line(ctx, x + i * cell, y, x + i * cell, y + H);
  for (let i = 1; i < rows; i++) line(ctx, x, y + i * cell, x + W, y + i * cell);
  ctx.strokeStyle = '#c9a24c';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, W, H);
  // Tür mit Glasauge
  const eye = cellCenter(PLAN_EYE.col, 0);
  ctx.fillStyle = '#5d5a44';
  ctx.fillRect(eye.x - 60, y - 40, 120, 36);
  ctx.fillStyle = '#e9f2f0';
  ctx.beginPath();
  ctx.arc(eye.x, y - 22, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a7a6a';
  ctx.beginPath();
  ctx.arc(eye.x, y - 22, 6, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'Tür · Glasauge', eye.x, y - 52, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  // Lampe
  const start = cellCenter(PLAN_START.col, PLAN_START.row);
  text(ctx, 'Lichtstrahl der Deckenlampe', start.x, y + H + 50, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });

  // Strahl
  const beam = traceBeam(turns);
  if (lit) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [width, color] of [[16, 'rgba(255, 230, 160, 0.18)'], [6, 'rgba(255, 240, 200, 0.75)'], [2, '#fffbe8']]) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      beam.points.forEach((p, i) => {
        const c = cellCenter(p.col, p.row);
        if (i === 0) ctx.moveTo(c.x, y + H + 24);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();
    }
    ctx.restore();
    if (beam.hit) glow(ctx, eye.x, y - 22, 60, '255, 245, 200', 0.6 + 0.2 * Math.sin(time * 6));
  }

  // Spiegel
  for (const m of PLAN_MIRRORS) {
    const c = cellCenter(m.col, m.row);
    ctx.fillStyle = '#3c2a18';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a24c';
    ctx.lineWidth = 4;
    ctx.stroke();
    const slash = turns[m.id] === '/';
    ctx.strokeStyle = '#dff3f6';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    if (slash) line(ctx, c.x - 24, c.y + 24, c.x + 24, c.y - 24);
    else line(ctx, c.x - 24, c.y - 24, c.x + 24, c.y + 24);
    text(ctx, m.id, c.x + 30, c.y - 26, { font: `bold 18px ${PRINT}`, color: '#f3e2b4' });
  }
  return beam;
}
