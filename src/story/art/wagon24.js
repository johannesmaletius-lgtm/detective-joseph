import { INK, PRINT, SERIF, drawPicture, glow, line, picture, text } from './common.js';

// Gezeichnetes für Tür 24 (Heiligabend): Lautsprecheranlage mit 24 Wagen, der Blick aus dem Fenster
// auf die Kilometersteine, das Entgleisen und das Schlussbild (ChatGPT-Bild) mit Wanduhr und Kerze.

// ---------------------------------------------------------------- Lautsprecheranlage
// In diesen Wagen sitzt noch jemand: Bruno (4), Ilse (5), Barkeeper (7), Moll (12), Mira (15), Heizer (21).
export const OCCUPIED = [4, 5, 7, 12, 15, 21];
const NAMES = ['Abteil', 'Gepäck', 'Post', 'Speise', 'Schlaf', 'Fundbüro', 'Bar', 'Kino', 'Spiegel', 'Lautspr.', 'Uhren', 'Musik',
  'Kapelle', 'Zeitung', 'Spielzi.', 'Funk', 'Gewächsh.', 'Schaffner', 'Foto', 'Pack', 'Kessel', 'Lok', 'Gang', '—'];

// Drehpunkt jedes Kippschalters und Mitte seines Schildchens im Bild lautsprecher.webp (1672 × 941)
const S = 1280 / 1672;
const PANEL = 'assets/closeups/lautsprecher.webp';
function switchAt(n) {
  const i = n - 1;
  const row = Math.floor(i / 8), col = i % 8;
  const x = row < 2 ? 372 + col * 134.7 : 397 + col * 147.7;
  const y = [135, 320, 500][row];
  const plate = [211, 398, 580][row];
  return { x: x * S, y: y * S, plate: plate * S };
}

function switchRect(n) {
  const s = switchAt(n);
  return { x: s.x - 42, y: s.y - 44, w: 84, h: s.plate + 16 - (s.y - 44) };
}

export function panelSpots() {
  return [
    ...Array.from({ length: 23 }, (_, i) => ({ id: `w${i + 1}`, ...switchRect(i + 1), label: `Wagen ${i + 1}` })),
    { id: 'speak', cx: 705 * S, cy: 740 * S, r: 72, label: 'Durchsage sprechen' },
  ];
}

export function drawPanel(ctx, { on }) {
  drawPicture(ctx, PANEL, 0, 0, 1280, 720);
  const image = picture(PANEL);
  const ready = image.complete && image.naturalWidth;
  for (let n = 1; n <= 23; n++) {
    const s = switchAt(n);
    // Schildchen: Nummer und Wagen
    text(ctx, `${n} ${NAMES[n - 1]}`, s.x, s.plate + 4, { font: `bold 11px ${PRINT}`, color: '#3a2410', align: 'center' });
    if (!on.includes(n)) continue;
    // eingeschaltet: Schalter senkrecht gespiegelt, der Hebel zeigt nach oben
    if (ready) {
      const hw = 38, hh = 43;
      const sx = image.naturalWidth / 1280;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1, -1);
      ctx.drawImage(image, (s.x - hw) * sx, (s.y - hh) * sx, hw * 2 * sx, hh * 2 * sx, -hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    }
    glow(ctx, s.x + 30, s.y - 30, 18, '120, 255, 140', 0.8);
    ctx.fillStyle = '#7dff8a';
    ctx.beginPath();
    ctx.arc(s.x + 30, s.y - 30, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- Kilometersteine am Fenster
// t = Sekunden seit Beginn. Alle 1,6 s zieht ein Stein vorbei: 23,9 · 24,1 · … · 24,7 …
export const STONE_EVERY = 1.6;
export function stoneAt(t) {
  const index = Math.floor(t / STONE_EVERY);
  const phase = (t % STONE_EVERY) / STONE_EVERY;
  return { km: (23.9 + index * 0.2).toFixed(1).replace('.', ','), phase };
}

export const PADDLE_SPOT = { id: 'paddle', x: 980, y: 560, w: 220, h: 80, label: 'Kelle heben!' };

export function drawWindowRun(ctx, { t, raised }) {
  ctx.fillStyle = '#4a2a18';
  ctx.fillRect(0, 0, 1280, 720);
  // Fensterausschnitt: Tunnel mit Lampen, die vorbeiziehen
  const win = { x: 180, y: 80, w: 920, h: 460 };
  ctx.save();
  ctx.beginPath();
  ctx.rect(win.x, win.y, win.w, win.h);
  ctx.clip();
  ctx.fillStyle = '#0c0a08';
  ctx.fillRect(win.x, win.y, win.w, win.h);
  for (let i = 0; i < 6; i++) {
    const x = win.x + win.w - (((t * 600) + i * 200) % (win.w + 200));
    glow(ctx, x, win.y + 60, 60, '255, 200, 120', 0.5);
  }
  const { km, phase } = stoneAt(t);
  const sx = win.x + win.w + 80 - phase * (win.w + 240);
  ctx.fillStyle = '#d8d4c8';
  ctx.fillRect(sx - 40, win.y + 260, 80, 140);
  ctx.beginPath();
  ctx.arc(sx, win.y + 260, 40, Math.PI, 0);
  ctx.fill();
  text(ctx, km, sx, win.y + 320, { font: `bold 30px ${SERIF}`, color: INK, align: 'center' });
  ctx.fillStyle = '#2a2420';
  ctx.fillRect(win.x, win.y + 400, win.w, 60);
  ctx.restore();
  ctx.strokeStyle = '#2a1a0e';
  ctx.lineWidth = 20;
  ctx.strokeRect(win.x, win.y, win.w, win.h);
  ctx.fillStyle = raised ? '#2a6a2a' : '#6a2a1a';
  ctx.fillRect(PADDLE_SPOT.x, PADDLE_SPOT.y, PADDLE_SPOT.w, PADDLE_SPOT.h);
  text(ctx, raised ? 'Kelle oben!' : 'Kelle heben!', PADDLE_SPOT.x + PADDLE_SPOT.w / 2, PADDLE_SPOT.y + 50, { font: `bold 26px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  text(ctx, 'Bei Kilometer 24,7 – und keinen Stein früher oder später.', 560, 610, { font: `italic 20px ${SERIF}`, color: '#f1e0b8', align: 'center' });
}

// ---------------------------------------------------------------- Schlussbild
// Wanduhr (der ovale Rahmen) zeigt 23:47; oben auf dem Baum die letzte, noch nicht brennende Kerze.
export const FINAL_Y = -10;
export const CANDLE_SPOT = { id: 'candle', x: 528, y: 10, w: 46, h: 80, label: 'Die letzte Kerze anzünden' };

export function drawFinal(ctx, { lit, time }) {
  drawPicture(ctx, 'assets/photos/schluss.webp', 0, FINAL_Y, 1280, 853);
  // Zifferblatt in den ovalen Rahmen
  const cx = 708, cy = 125 + FINAL_Y;
  ctx.fillStyle = '#f2e6c8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 52, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
    line(ctx, cx + Math.cos(a) * 40, cy + Math.sin(a) * 48, cx + Math.cos(a) * 48, cy + Math.sin(a) * 57);
  }
  const ma = -Math.PI / 2 + 47 / 60 * Math.PI * 2;
  const ha = -Math.PI / 2 + (11 + 47 / 60) / 12 * Math.PI * 2;
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  line(ctx, cx, cy, cx + Math.cos(ha) * 26, cy + Math.sin(ha) * 30);
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(ma) * 40, cy + Math.sin(ma) * 48);
  ctx.lineCap = 'butt';
  // Kerze
  if (lit) {
    const flicker = 1 + Math.sin(time * 18) * 0.12;
    glow(ctx, 551, 40 + FINAL_Y, 60 * flicker, '255, 210, 120', 0.7);
    ctx.fillStyle = '#ffd36b';
    ctx.beginPath();
    ctx.ellipse(551, 38 + FINAL_Y, 6, 14 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

