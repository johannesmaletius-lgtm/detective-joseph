import { PRINT, RED, SERIF, drawPicture, glow, line, photoCard, picture, text } from './common.js';

// Gezeichnetes für Wagen 21 (Kesselwagen): Manometer mit drei Ventilen, Wasserstand und Pumpe,
// das Spind-Foto (ChatGPT-Bild) mit der Dienstnummer am Ärmel.

// ---------------------------------------------------------------- Kesseldruck
// Jede Drehung: rot −7, gelb −3, blau +2 (bar). Ziel: genau 25 (grüner Strich).
export const VALVES = [
  { id: 'red', name: 'rotes Ventil', delta: -8, color: '#c0302a', cx: 337, cy: 565 },
  { id: 'yellow', name: 'gelbes Ventil', delta: -5, color: '#d6a020', cx: 635, cy: 565 },
  { id: 'blue', name: 'blaues Ventil', delta: 3, color: '#3a6ab0', cx: 938, cy: 565 },
];
export const START_PRESSURE = 42;
export const TARGET = 25;

export function valveSpots() {
  return [
    ...VALVES.map((v) => ({ id: v.id, cx: v.cx, cy: v.cy, r: 112, label: `${v.name[0].toUpperCase()}${v.name.slice(1)} drehen` })),
    { id: 'reset', x: 1100, y: 640, w: 150, h: 46, label: 'Alle Ventile zurück' },
  ];
}

const BOILER = 'assets/closeups/kessel.webp';
export function drawBoiler(ctx, { pressure, turns }) {
  drawPicture(ctx, BOILER, 0, 0, 1280, 720);
  const image = picture(BOILER);
  // Manometer 0 … 50 im leeren Zifferblatt des Bilds
  const cx = 635, cy = 184, r = 130;
  const angle = (bar) => (-225 + (bar / 50) * 270) * Math.PI / 180;
  const zone = (from, to, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 16, angle(from), angle(to));
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
    line(ctx, cx + Math.cos(a) * (r - 28), cy + Math.sin(a) * (r - 28), cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    text(ctx, String(bar), cx + Math.cos(a) * (r - 46), cy + Math.sin(a) * (r - 46) + 6, { font: `bold 15px ${PRINT}`, align: 'center' });
  }
  const a = angle(Math.max(0, Math.min(50, pressure)));
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 6;
  line(ctx, cx, cy, cx + Math.cos(a) * (r - 24), cy + Math.sin(a) * (r - 24));
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, `${pressure} bar`, cx, cy + 62, { font: `bold 24px ${PRINT}`, align: 'center' });
  text(ctx, 'Grün: genau 25', cx, cy + 86, { font: `14px ${PRINT}`, color: '#2a6a2a', align: 'center' });
  // Ventilräder drehen sich mit jeder Drehung ein Stück weiter
  VALVES.forEach((v) => {
    const t = turns[v.id] ?? 0;
    if (t && image.complete && image.naturalWidth) {
      const k = image.naturalWidth / 1280, rr = 118;
      ctx.save();
      ctx.beginPath();
      ctx.arc(v.cx, v.cy, rr, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(v.cx, v.cy);
      ctx.rotate(t * 0.5);
      ctx.drawImage(image, (v.cx - rr) * k, (v.cy - rr) * k, rr * 2 * k, rr * 2 * k, -rr, -rr, rr * 2, rr * 2);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(20, 10, 4, 0.75)';
    ctx.fillRect(v.cx - 26, v.cy + 124, 52, 26);
    text(ctx, `${t}×`, v.cx, v.cy + 143, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  });
  ctx.fillStyle = 'rgba(20, 10, 4, 0.75)';
  ctx.fillRect(20, 20, 400, 34);
  text(ctx, 'Rot: −7 · Gelb: −3 · Blau: +2 (je Drehung)', 220, 44, { font: `italic 18px ${SERIF}`, color: '#f1e0b8', align: 'center' });
  ctx.fillStyle = '#4a3420';
  ctx.fillRect(1100, 640, 150, 46);
  text(ctx, 'zurückdrehen', 1175, 670, { font: `bold 16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
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
