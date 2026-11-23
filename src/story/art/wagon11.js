import { HAND, INK, PRINT, RED, SERIF, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 11 (Uhrenwagen): die Wand voller Uhren, Standuhr und Kuckucksuhr zum Stellen.

// ---------------------------------------------------------------- Uhrenwand
// Acht Uhren. Eine davon geht „mit dem Mond“: Ihr Zeiger dreht sich einmal pro Runde.
// kind: 'moon' = einmal pro Runde, 'run' = normaler Sekundenzeiger, 'stop' = steht
export const WALL = [
  { id: 'c1', kind: 'stop', h: 3, m: 40 },
  { id: 'c2', kind: 'run', h: 10, m: 10 },
  { id: 'c3', kind: 'stop', h: 7, m: 25 },
  { id: 'c4', kind: 'stop', h: 12, m: 0 },
  { id: 'c5', kind: 'run', h: 1, m: 55 },
  { id: 'c6', kind: 'moon' },
  { id: 'c7', kind: 'stop', h: 5, m: 5 },
  { id: 'c8', kind: 'stop', h: 9, m: 45 },
];
function wallPos(i) {
  return { x: 260 + (i % 4) * 250, y: 200 + Math.floor(i / 4) * 250 };
}
export function wallSpots() {
  return WALL.map((clock, i) => ({ id: clock.id, cx: wallPos(i).x, cy: wallPos(i).y, r: 92, label: 'Uhr' }));
}

// lapShare = 0 … 1 (wie weit die Runde ist), time = Sekunden
export function drawClockWall(ctx, { lapShare, time }) {
  wood(ctx, 120, 70, 1040, 560, [86, 50, 26]);
  WALL.forEach((clock, i) => {
    const { x, y } = wallPos(i);
    let hour, minute, second = null;
    if (clock.kind === 'moon') {
      // ein Umlauf pro Runde – nur ein Zeiger, mit einem kleinen Mond an der Spitze
      dial(ctx, x, y, 86, '#e8e0f0');
      const a = -Math.PI / 2 + lapShare * Math.PI * 2;
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 5;
      line(ctx, x, y, x + Math.cos(a) * 64, y + Math.sin(a) * 64);
      ctx.fillStyle = '#f4ecc0';
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 64, y + Math.sin(a) * 64, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8e0f0';
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 64 + 5, y + Math.sin(a) * 64 - 3, 8, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    hour = clock.h;
    minute = clock.m;
    if (clock.kind === 'run') second = time % 60;
    dial(ctx, x, y, 86, '#f1e6c8');
    hands(ctx, x, y, 86, hour, minute, second);
  });
}

function dial(ctx, x, y, r, face) {
  ctx.fillStyle = '#8a6a2a';
  ctx.beginPath();
  ctx.arc(x, y, r + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = i % 3 === 0 ? 4 : 2;
    line(ctx, x + Math.cos(a) * (r - 14), y + Math.sin(a) * (r - 14), x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4));
  }
}

function hands(ctx, x, y, r, hour, minute, second = null) {
  const ha = -Math.PI / 2 + ((hour % 12) + minute / 60) / 12 * Math.PI * 2;
  const ma = -Math.PI / 2 + minute / 60 * Math.PI * 2;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  line(ctx, x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5);
  ctx.lineWidth = 4;
  line(ctx, x, y, x + Math.cos(ma) * r * 0.78, y + Math.sin(ma) * r * 0.78);
  if (second !== null) {
    const sa = -Math.PI / 2 + second / 60 * Math.PI * 2;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    line(ctx, x, y, x + Math.cos(sa) * r * 0.85, y + Math.sin(sa) * r * 0.85);
  }
  ctx.lineCap = 'butt';
}

// ---------------------------------------------------------------- Standuhr und Kuckucksuhr stellen
export const SET_SPOTS = [
  { id: 'gMinus', x: 250, y: 520, w: 80, h: 60, label: 'Standuhr: 5 Minuten zurück' },
  { id: 'gPlus', x: 350, y: 520, w: 80, h: 60, label: 'Standuhr: 5 Minuten vor' },
  { id: 'cMinus', x: 850, y: 520, w: 80, h: 60, label: 'Kuckucksuhr: 5 Minuten zurück' },
  { id: 'cPlus', x: 950, y: 520, w: 80, h: 60, label: 'Kuckucksuhr: 5 Minuten vor' },
];

// grand, cuckoo = Minuten (0 … 55), auf welche die Uhren gestellt sind (die Stunde ist egal)
export function drawSetting(ctx, { grand, cuckoo }) {
  wood(ctx, 120, 60, 1040, 600, [70, 40, 22]);
  glow(ctx, 640, 120, 500, '255, 210, 140', 0.12);
  // Standuhr
  dial(ctx, 340, 300, 150, '#f1e6c8');
  hands(ctx, 340, 300, 150, 11, grand);
  text(ctx, 'STANDUHR', 340, 110, { font: `bold 24px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'Gong zur vollen Stunde', 340, 488, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  // Kuckucksuhr
  dial(ctx, 940, 300, 150, '#f1e6c8');
  hands(ctx, 940, 300, 150, 11, cuckoo);
  text(ctx, 'KUCKUCKSUHR', 940, 110, { font: `bold 24px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'Kuckuck zur vollen Stunde', 940, 488, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  for (const spot of SET_SPOTS) {
    ctx.fillStyle = '#3d2a16';
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    text(ctx, spot.id.endsWith('Plus') ? '+5' : '−5', spot.x + spot.w / 2, spot.y + 40, { font: `bold 24px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  }
  text(ctx, `:${String(grand).padStart(2, '0')}`, 340, 620, { font: `bold 26px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  text(ctx, `:${String(cuckoo).padStart(2, '0')}`, 940, 620, { font: `bold 26px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  // Herrn Ticks Zettel
  sheet(ctx, 520, 170, 240, 300, {
    angle: 0.02,
    inner: (c) => {
      text(c, 'Notizen – Tick', 120, 34, { font: `bold 18px ${SERIF}`, align: 'center' });
      ['Runde = 2 Mondstunden', '(0:00 nach dem Tunnel,', ' 2:00 beim nächsten)', '', 'Ruf: immer 1:50 Mondzeit', '', 'Standuhr: geht doppelt', '  so schnell', 'Kuckucksuhr: geht halb', '  so schnell', '', 'Im Tunnel stehen alle Uhren', 'still. Danach laufen sie los.'].forEach((value, i) => text(c, value, 16, 64 + i * 18, { font: `15px ${HAND}`, color: INK }));
    },
  });
}

// Schlägt die Uhr genau beim Ruf? Sie läuft nach dem Tunnel 110 Mondminuten lang los.
export function strikesAtCall(start, speed) {
  return (start + 110 * speed) % 60 === 0;
}
