import { HAND, PRINT, SERIF, drawPicture, glow, line, sheet, text } from './common.js';

// Gezeichnetes für Wagen 9 (Spiegelwagen): die Spiegelbilder, die Spiegelschrift, der Lichtstrahl.

// ---------------------------------------------------------------- Spiegel
// Die Spiegel im Hintergrundbild sind durchsichtig. Dahinter zeichnen wir den Wagen gespiegelt,
// leicht silbrig – und Joseph als Spiegelbild. ghost = 0 … 1: eine zweite Gestalt hinter ihm.
export function paintMirrors(ctx, { scene, player, ghost = 0 }) {
  ctx.save();
  const base = ctx.createLinearGradient(0, 0, 0, 720);
  base.addColorStop(0, '#7d8a99');
  base.addColorStop(1, '#3a424d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.translate(1280, 0);
  ctx.scale(-1, 1);
  const { x, y, width, height } = scene.data.background;
  if (scene.background) {
    ctx.globalAlpha = 0.8;
    ctx.drawImage(scene.background, x, y, width, height);
    ctx.globalAlpha = 1;
  }
  player.draw(ctx, scene);
  ctx.restore();
  // Die zweite Gestalt: im großen Spiegel rechts, als stünde sie hinter Joseph
  if (ghost > 0) {
    ctx.save();
    ctx.globalAlpha = ghost * 0.9;
    drawPicture(ctx, 'assets/characters/anderer-joseph/front.webp', 1112, 150, 86, 232);
    ctx.restore();
  }
  // silbriger Schimmer
  const sheen = ctx.createLinearGradient(0, 0, 1280, 720);
  sheen.addColorStop(0, 'rgba(200, 220, 240, 0.25)');
  sheen.addColorStop(0.5, 'rgba(120, 140, 170, 0.08)');
  sheen.addColorStop(1, 'rgba(200, 220, 240, 0.22)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 1280, 720);
}

// ---------------------------------------------------------------- Kratzer in Spiegelschrift
export const SCRATCH_LINES = ['WAS DU TUST,', 'TUT ER IN DER', 'NÄCHSTEN RUNDE –', 'VERKEHRT HERUM.'];

export function drawScratches(ctx, mirrored) {
  ctx.fillStyle = mirrored ? '#2a3038' : '#5a3418';
  ctx.fillRect(300, 110, 680, 480);
  if (mirrored) {
    const sheen = ctx.createLinearGradient(300, 110, 980, 590);
    sheen.addColorStop(0, 'rgba(200, 220, 240, 0.25)');
    sheen.addColorStop(1, 'rgba(120, 140, 170, 0.1)');
    ctx.fillStyle = sheen;
    ctx.fillRect(300, 110, 680, 480);
  } else {
    ctx.strokeStyle = 'rgba(30, 14, 4, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 480; i += 16) line(ctx, 300, 110 + i, 980, 110 + i + 6);
  }
  ctx.save();
  if (!mirrored) {
    ctx.translate(1280, 0);
    ctx.scale(-1, 1);
  }
  SCRATCH_LINES.forEach((value, i) => text(ctx, value, 640, 220 + i * 92, {
    font: `bold 56px ${HAND}`, color: mirrored ? '#e8dcc0' : '#f0c98a', align: 'center',
  }));
  ctx.restore();
  ctx.strokeStyle = '#b8924a';
  ctx.lineWidth = 10;
  ctx.strokeRect(300, 110, 680, 480);
}

export function drawPlaque(ctx) {
  sheet(ctx, 420, 220, 440, 260, {
    color: '#c9a24a',
    shade: '#8c6a2a',
    inner: (c) => {
      text(c, 'SPIEGELWAGEN', 220, 60, { font: `bold 30px ${SERIF}`, align: 'center' });
      text(c, 'Durchgang nur mit Licht im Auge.', 220, 120, { font: `20px ${SERIF}`, align: 'center' });
      text(c, 'Die Blende der Lampe öffnet sich,', 220, 165, { font: `18px ${SERIF}`, align: 'center' });
      text(c, 'wenn beide Hebel zugleich unten sind.', 220, 192, { font: `18px ${SERIF}`, align: 'center' });
    },
  });
}

// ---------------------------------------------------------------- Lichtstrahl (Plan von oben)
// Raster 7 × 5. Die Lampe leuchtet von oben in Spalte 3 hinein. Vier Standspiegel, jeder steht
// entweder „/“ oder „\“. Das Glasauge sitzt oben in Spalte 6.
export const GRID = { x: 340, y: 110, cell: 86, cols: 7, rows: 5 };
export const STAND_MIRRORS = [
  { id: 'm1', col: 3, row: 1 },
  { id: 'm2', col: 0, row: 1 },
  { id: 'm3', col: 0, row: 4 },
  { id: 'm4', col: 6, row: 4 },
];
export const EYE = { col: 6, row: 0 };
const LAMP = { col: 3 };

export function mirrorSpots() {
  return STAND_MIRRORS.map((m, i) => ({ id: m.id, cx: GRID.x + (m.col + 0.5) * GRID.cell, cy: GRID.y + (m.row + 0.5) * GRID.cell, r: 40, label: `Standspiegel ${i + 1} drehen` }));
}

// Weg des Strahls: Liste von Punkten (Zellmitten). hit = true, wenn er das Auge trifft.
export function tracePath(tilt) {
  let col = LAMP.col, row = -1, dx = 0, dy = 1;
  const points = [{ col, row: -0.5 }];
  for (let steps = 0; steps < 40; steps++) {
    col += dx;
    row += dy;
    if (col < 0 || col >= GRID.cols || row >= GRID.rows) {
      points.push({ col: col - dx / 2, row: row - dy / 2 });
      return { points, hit: false };
    }
    if (row < 0) {
      points.push({ col, row: -0.5 });
      return { points, hit: false };
    }
    if (col === EYE.col && row === EYE.row) {
      points.push({ col, row });
      return { points, hit: true };
    }
    const mirror = STAND_MIRRORS.findIndex((m) => m.col === col && m.row === row);
    if (mirror >= 0) {
      points.push({ col, row });
      if (tilt[mirror] === '/') [dx, dy] = [-dy, -dx];
      else [dx, dy] = [dy, dx];
    }
  }
  return { points, hit: false };
}

export function drawBeamPlan(ctx, { tilt, time = 0, dark = false }) {
  const { x, y, cell, cols, rows } = GRID;
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(x - 60, y - 70, cols * cell + 120, rows * cell + 140);
  // Teppich in der Mitte
  ctx.fillStyle = '#6e1a16';
  ctx.fillRect(x + 2 * cell + 10, y, 3 * cell - 20, rows * cell);
  ctx.strokeStyle = 'rgba(255, 230, 170, 0.12)';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) line(ctx, x + c * cell, y, x + c * cell, y + rows * cell);
  for (let r = 0; r <= rows; r++) line(ctx, x, y + r * cell, x + cols * cell, y + r * cell);
  text(ctx, 'Tür', x + cols * cell / 2, y - 40, { font: `bold 18px ${PRINT}`, color: '#e8d8b0', align: 'center' });
  // Lampe
  glow(ctx, x + (LAMP.col + 0.5) * cell, y - 20, 60, '255, 230, 150', 0.6);
  text(ctx, 'Lampe', x + (LAMP.col + 0.5) * cell - 60, y - 14, { font: `14px ${PRINT}`, color: '#ffe7a0', align: 'right' });
  // Auge
  const ex = x + (EYE.col + 0.5) * cell, ey = y + (EYE.row + 0.5) * cell;
  ctx.fillStyle = '#e9e4d6';
  ctx.beginPath();
  ctx.ellipse(ex, ey, 30, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f7a6a';
  ctx.beginPath();
  ctx.arc(ex, ey, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(ex, ey, 5, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'Glasauge', ex, ey + 40, { font: `14px ${PRINT}`, color: '#e8d8b0', align: 'center' });
  // Strahl (nur, wenn die Blende der Lampe offen ist)
  const { points, hit } = dark ? { points: [], hit: false } : tracePath(tilt);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 236, 160, 0.9)';
  ctx.shadowColor = 'rgba(255, 220, 120, 0.9)';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 6;
  ctx.beginPath();
  points.forEach((p, i) => {
    const px = x + (p.col + 0.5) * cell, py = y + (p.row + 0.5) * cell;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();
  if (hit) glow(ctx, ex, ey, 90, '255, 240, 180', 0.6 + 0.2 * Math.sin(time * 6));
  // Standspiegel
  STAND_MIRRORS.forEach((m, i) => {
    const cx = x + (m.col + 0.5) * cell, cy = y + (m.row + 0.5) * cell;
    ctx.fillStyle = '#7a5a20';
    ctx.beginPath();
    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c8dbe8';
    ctx.lineWidth = 8;
    const d = 26;
    if (tilt[i] === '/') line(ctx, cx - d, cy + d, cx + d, cy - d);
    else line(ctx, cx - d, cy - d, cx + d, cy + d);
    text(ctx, String(i + 1), cx + 30, cy - 26, { font: `bold 16px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  });
  return hit;
}
