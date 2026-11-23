import { loadImage } from '../../core/assets.js';
import { PRINT, SERIF, TYPEWRITER, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 8 (Bordkino): Kinokarte, acht Filmbilder, Projektor-Schärfe, Standbild.

let still = null;
loadImage('assets/scenes/wagon-08/standbild.webp').then((image) => { still = image; });
export const stillImage = () => still;

export const FILM_ROUND = '0108'; // steht am Filmrand des letzten Bildes – der Türcode

// ---------------------------------------------------------------- Kinokarte
export function drawTicket(ctx) {
  sheet(ctx, 340, 230, 600, 260, {
    angle: -0.03,
    color: '#f0e3bd',
    shade: '#dcc795',
    inner: (c) => {
      c.fillStyle = '#9b2b1e';
      c.fillRect(0, 0, 600, 56);
      text(c, 'BORDKINO RINGBAHN', 300, 38, { font: `bold 30px ${SERIF}`, color: '#f0e3bd', align: 'center' });
      text(c, '„Die letzte Runde“', 300, 110, { font: `italic 30px ${SERIF}`, align: 'center' });
      text(c, 'Reihe 3', 150, 180, { font: `bold 38px ${PRINT}`, align: 'center' });
      text(c, 'Platz 12', 450, 180, { font: `bold 38px ${PRINT}`, align: 'center' });
      text(c, 'Vorstellung jede Runde · Einlass bis zum Tunnel', 300, 232, { font: `16px ${SERIF}`, align: 'center' });
      // Riss in der Mitte
      c.strokeStyle = 'rgba(120, 90, 50, 0.7)';
      c.lineWidth = 2;
      c.beginPath();
      for (let y = 0; y <= 260; y += 10) c.lineTo(300 + ((y / 10) % 2 ? 5 : -5), y);
      c.stroke();
    },
  });
}

// ---------------------------------------------------------------- Die acht Filmbilder
// Der Zug von außen, eine Runde lang: Der Mond wandert von links nach rechts über den Himmel,
// im letzten Bild verschwindet der Zug im Tunnel. Reihenfolge der Bilder = Wert von "step".
export const FRAMES = [5, 2, 7, 0, 4, 6, 1, 3].map((step, i) => ({ id: `frame${i}`, step }));
export const FRAME_SLOTS = Array.from({ length: 8 }, (_, i) => ({
  x: 132 + (i % 4) * 258,
  y: 130 + Math.floor(i / 4) * 230,
  w: 240,
  h: 150,
  label: `${i + 1}`,
}));

export function drawFilmTable(ctx) {
  wood(ctx, 80, 70, 1120, 620, [60, 44, 34]);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(110, 100, 1060, 540);
  text(ctx, 'Die Filmbilder liegen durcheinander. Eine Runde, Bild für Bild – dann ankleben.', 640, 670, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

export function drawFrame(ctx, token, x, y) {
  const frame = FRAMES.find((f) => f.id === token.id);
  ctx.save();
  ctx.translate(x - 120, y - 75);
  // Filmrand
  ctx.fillStyle = '#1b1814';
  ctx.fillRect(0, 0, 240, 150);
  ctx.fillStyle = '#cfc6b0';
  for (let k = 6; k < 240; k += 18) {
    ctx.fillRect(k, 4, 9, 7);
    ctx.fillRect(k, 139, 9, 7);
  }
  // Bild: Nacht, Schnee, der Zug
  ctx.save();
  ctx.beginPath();
  ctx.rect(8, 16, 224, 118);
  ctx.clip();
  drawFrameScene(ctx, 8, 16, 224, 118, frame.step);
  ctx.restore();
  ctx.restore();
}

// Ein Filmbild: step 0 … 7 (Mond von links nach rechts, step 7: Tunnel)
export function drawFrameScene(ctx, x, y, w, h, step) {
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#1d1f24');
  sky.addColorStop(1, '#4a4d52');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  // Mond
  const moonX = x + 18 + (step / 7) * (w - 36);
  const moonY = y + 30 - Math.sin((step / 7) * Math.PI) * 14;
  ctx.fillStyle = '#e9e6dc';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 9, 0, Math.PI * 2);
  ctx.fill();
  // Schnee und Hügel
  ctx.fillStyle = '#b9bcc0';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.72);
  ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.6, x + w * 0.55, y + h * 0.72);
  ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.8, x + w, y + h * 0.7);
  ctx.lineTo(x + w, y + h);
  ctx.fill();
  // Laternen in festen Abständen
  ctx.fillStyle = '#f2e4b0';
  for (let k = 0; k < 4; k++) {
    const lx = x + 20 + k * 60 - ((step * 23) % 60);
    if (lx < x || lx > x + w) continue;
    ctx.fillRect(lx, y + h * 0.48, 2, h * 0.3);
    ctx.beginPath();
    ctx.arc(lx + 1, y + h * 0.48, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Gleis
  ctx.strokeStyle = '#26272a';
  ctx.lineWidth = 2;
  line(ctx, x, y + h * 0.86, x + w, y + h * 0.86);
  // Tunnelportal (nur im letzten Bild, rechts)
  if (step === 7) {
    ctx.fillStyle = '#3a3b3e';
    ctx.fillRect(x + w * 0.62, y + h * 0.3, w * 0.38, h * 0.62);
    ctx.fillStyle = '#050506';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.68, y + h * 0.92);
    ctx.lineTo(x + w * 0.68, y + h * 0.55);
    ctx.quadraticCurveTo(x + w * 0.81, y + h * 0.32, x + w * 0.94, y + h * 0.55);
    ctx.lineTo(x + w * 0.94, y + h * 0.92);
    ctx.fill();
  }
  // Der Zug
  const trainX = step === 7 ? x + w * 0.42 : x + w * 0.18;
  ctx.fillStyle = '#121214';
  for (let k = 0; k < 4; k++) {
    const cx = trainX + k * 32;
    if (step === 7 && cx > x + w * 0.7) continue;
    ctx.fillRect(cx, y + h * 0.66, 28, 18);
    ctx.fillStyle = 'rgba(255, 215, 130, 0.85)';
    ctx.fillRect(cx + 4, y + h * 0.69, 6, 5);
    ctx.fillRect(cx + 15, y + h * 0.69, 6, 5);
    ctx.fillStyle = '#121214';
  }
}

// ---------------------------------------------------------------- Projektor: scharf stellen
export const FOCUS_TARGET = { a: 3, b: 7 };
export const FOCUS_SPOTS = [
  { id: 'a', cx: 420, cy: 560, r: 64, label: 'Großes Rad (Objektiv)' },
  { id: 'b', cx: 860, cy: 560, r: 64, label: 'Kleines Rad (Bildfenster)' },
];

export function blurAmount({ a, b }) {
  const da = Math.min(Math.abs(a - FOCUS_TARGET.a), 8 - Math.abs(a - FOCUS_TARGET.a));
  const db = Math.min(Math.abs(b - FOCUS_TARGET.b), 8 - Math.abs(b - FOCUS_TARGET.b));
  return da + db;
}

let blurCanvas = null;
// Zeichnet ein Bild unscharf: klein rechnen und wieder groß ziehen (geht in jedem Browser)
export function drawBlurred(ctx, image, x, y, w, h, amount) {
  if (!image) return;
  if (amount <= 0) {
    ctx.drawImage(image, x, y, w, h);
    return;
  }
  blurCanvas ??= document.createElement('canvas');
  const factor = 1 + amount * 2.2;
  blurCanvas.width = Math.max(4, Math.round(w / factor));
  blurCanvas.height = Math.max(3, Math.round(h / factor));
  const small = blurCanvas.getContext('2d');
  small.imageSmoothingEnabled = true;
  small.drawImage(image, 0, 0, blurCanvas.width, blurCanvas.height);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(blurCanvas, x, y, w, h);
  ctx.restore();
}

export function drawFocus(ctx, state, picture) {
  ctx.fillStyle = '#16120f';
  ctx.fillRect(160, 50, 960, 640);
  // Vorschau auf der Mattscheibe
  ctx.fillStyle = '#000';
  ctx.fillRect(330, 80, 620, 350);
  drawBlurred(ctx, picture, 340, 90, 600, 330, blurAmount(state));
  ctx.strokeStyle = '#4b4f55';
  ctx.lineWidth = 6;
  ctx.strokeRect(330, 80, 620, 350);
  text(ctx, 'Mattscheibe', 640, 456, { font: `15px ${PRINT}`, color: '#bdb5a4', align: 'center' });
  // Zahnräder: das große Rad dreht das kleine mit
  for (const spot of FOCUS_SPOTS) {
    const value = state[spot.id];
    drawGear(ctx, spot.cx, spot.cy, spot.r, value);
    text(ctx, spot.id === 'a' ? 'Objektiv' : 'Bildfenster', spot.cx, spot.cy + spot.r + 30, { font: `bold 17px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  }
  // Verbindung zwischen den Rädern
  ctx.strokeStyle = '#7a6a4a';
  ctx.lineWidth = 8;
  line(ctx, 490, 560, 790, 560);
  text(ctx, 'Achtung: Das Objektiv dreht das Bildfenster mit.', 640, 530, { font: `italic 15px ${SERIF}`, color: '#bdb5a4', align: 'center' });
}

function drawGear(ctx, cx, cy, r, value) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((value / 8) * Math.PI * 2);
  ctx.fillStyle = '#9a8a62';
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 0.5) / 16) * Math.PI * 2;
    ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
    ctx.lineTo(Math.cos(a1) * (r - 10), Math.sin(a1) * (r - 10));
  }
  ctx.fill();
  ctx.fillStyle = '#5d533b';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  // Markierung
  ctx.fillStyle = '#e9d8b0';
  ctx.beginPath();
  ctx.arc(0, -r + 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Skala 0–7 außen
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    text(ctx, String(i), cx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18) + 6, { font: `14px ${PRINT}`, color: i === value ? '#ffd36b' : '#8f8672', align: 'center' });
  }
}

// ---------------------------------------------------------------- Das Standbild mit Filmrand
export function drawStill(ctx) {
  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(90, 40, 1100, 640);
  ctx.fillStyle = '#cfc6b0';
  for (let y = 56; y < 670; y += 30) {
    ctx.fillRect(110, y, 16, 12);
    ctx.fillRect(1154, y, 16, 12);
  }
  if (still) ctx.drawImage(still, 150, 70, 980, 551);
  // Filmrand-Beschriftung
  text(ctx, `RINGBAHN · KAMERA TUNNEL · RUNDE ${FILM_ROUND}`, 640, 654, { font: `bold 18px ${TYPEWRITER}`, color: '#e8dcc0', align: 'center' });
  ctx.save();
  ctx.translate(140, 360);
  ctx.rotate(-Math.PI / 2);
  text(ctx, `${FILM_ROUND} ▸`, 0, 0, { font: `bold 16px ${TYPEWRITER}`, color: '#e8dcc0', align: 'center' });
  ctx.restore();
}

