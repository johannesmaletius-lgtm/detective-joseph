import { PRINT, RED, SERIF, glow, line, photoCard, text } from './common.js';

// Gezeichnetes für Wagen 21 (Kesselwagen): Manometer mit drei Ventilen, Wasserstand und Pumpe,
// das Spind-Foto (ChatGPT-Bild) mit der Dienstnummer am Ärmel.

// ---------------------------------------------------------------- Kesseldruck
// Jede Drehung: rot −7, gelb −3, blau +2 (bar). Ziel: genau 25 (grüner Strich).
export const VALVES = [
  { id: 'red', name: 'rotes Ventil', delta: -7, color: '#c0302a', cx: 420, cy: 540 },
  { id: 'yellow', name: 'gelbes Ventil', delta: -3, color: '#d6a020', cx: 640, cy: 540 },
  { id: 'blue', name: 'blaues Ventil', delta: 2, color: '#3a6ab0', cx: 860, cy: 540 },
];
export const START_PRESSURE = 41;
export const TARGET = 25;

export function valveSpots() {
  return [
    ...VALVES.map((v) => ({ id: v.id, cx: v.cx, cy: v.cy, r: 62, label: `${v.name[0].toUpperCase()}${v.name.slice(1)} drehen` })),
    { id: 'reset', x: 1010, y: 600, w: 150, h: 46, label: 'Alle Ventile zurück' },
  ];
}

export function drawBoiler(ctx, { pressure, turns }) {
  ctx.fillStyle = '#2a1a10';
  ctx.fillRect(220, 50, 960, 620);
  glow(ctx, 640, 260, 400, '255, 120, 60', 0.15);
  // Manometer 0 … 50
  const cx = 640, cy = 250, r = 170;
  ctx.fillStyle = '#efe4c8';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  const angle = (bar) => (-225 + (bar / 50) * 270) * Math.PI / 180;
  // Zonen
  const zone = (from, to, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 20, angle(from), angle(to));
    ctx.stroke();
  };
  zone(0, 24.5, '#d8c890');
  zone(24.5, 25.5, '#2a9a3a');
  zone(25.5, 35, '#d8c890');
  zone(35, 50, '#c0392b');
  ctx.strokeStyle = '#2b2118';
  for (let bar = 0; bar <= 50; bar += 5) {
    const a = angle(bar);
    ctx.lineWidth = 3;
    line(ctx, cx + Math.cos(a) * (r - 36), cy + Math.sin(a) * (r - 36), cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6));
    text(ctx, String(bar), cx + Math.cos(a) * (r - 60), cy + Math.sin(a) * (r - 60) + 7, { font: `bold 18px ${PRINT}`, align: 'center' });
  }
  const a = angle(Math.max(0, Math.min(50, pressure)));
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 7;
  line(ctx, cx, cy, cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30));
  text(ctx, `${pressure} bar`, cx, cy + 80, { font: `bold 30px ${PRINT}`, align: 'center' });
  text(ctx, 'Grün: genau 25', cx, cy + 112, { font: `16px ${PRINT}`, color: '#2a6a2a', align: 'center' });
  VALVES.forEach((v) => {
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.arc(v.cx, v.cy, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 8;
    for (let k = 0; k < 3; k++) {
      const b = k * Math.PI / 3 + (turns[v.id] ?? 0) * 0.5;
      line(ctx, v.cx + Math.cos(b) * 50, v.cy + Math.sin(b) * 50, v.cx - Math.cos(b) * 50, v.cy - Math.sin(b) * 50);
    }
    text(ctx, `${turns[v.id] ?? 0}×`, v.cx, v.cy + 84, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  });
  text(ctx, 'Rot: −7 · Gelb: −3 · Blau: +2 (je Drehung)', 640, 470, { font: `italic 18px ${SERIF}`, color: '#f1e0b8', align: 'center' });
  ctx.fillStyle = '#4a3420';
  ctx.fillRect(1010, 600, 150, 46);
  text(ctx, 'zurückdrehen', 1085, 630, { font: `bold 16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

// ---------------------------------------------------------------- Spind-Foto
// Dienstnummer am Ärmelabzeichen des jungen Schaffners: 317
export function drawLockerPhoto(ctx) {
  const w = 860, h = 645, cx = 640, cy = 360;
  photoCard(ctx, 'assets/photos/spindfoto.webp', cx, cy, w * 0.92, h * 0.92, -0.015);
  ctx.save();
  ctx.translate(cx + (0.684 - 0.5) * w * 0.92, cy + (0.318 - 0.5) * h * 0.92);
  ctx.rotate(-0.25);
  text(ctx, '317', 0, 5, { font: `bold 14px ${SERIF}`, color: '#3a2412', align: 'center' });
  ctx.restore();
  return RED;
}
