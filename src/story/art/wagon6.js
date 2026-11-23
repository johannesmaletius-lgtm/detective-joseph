import { loadImage } from '../../core/assets.js';
import { HAND, INK, PRINT, RED, SERIF, TYPEWRITER, drawPicture, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 6 (Fundbüro): Karteikarten, Regal-Suchbild, Schließfächer, Taschenuhr.

let shelfImage = null;
loadImage('assets/scenes/wagon-06/regal.webp').then((image) => { shelfImage = image; });

// ---------------------------------------------------------------- Karteikarten
export const INDEX_CARDS = [
  { id: 'hat', thing: 'Hut, grau', owner: 'Herr K.', round: 109, place: 'Barwagen', shelf: 7 },
  { id: 'scarf', thing: 'Schal, rot', owner: 'Herr K.', round: 110, place: 'Tunnel', shelf: 2 },
  { id: 'glasses', thing: 'Brille, rund', owner: 'Herr K.', round: 112, place: 'Schlafwagen', shelf: 4 },
  { id: 'cane', thing: 'Spazierstock', owner: 'Herr K.', round: 115, place: 'Bordkino', shelf: 9 },
  { id: 'needle', thing: 'Stricknadel', owner: 'Frau Ilse', round: 108, place: 'Schlafwagen', shelf: 1 },
  { id: 'teddy', thing: 'Teddybär', owner: 'unbekannt (ein Kind?)', round: 99, place: 'Spielzimmer', shelf: 6 },
];
export const K_ORDER = ['hat', 'scarf', 'glasses', 'cane'];
export const CARD_SLOTS = [0, 1, 2, 3].map((i) => ({ x: 160 + i * 250, y: 150, w: 210, h: 130, label: `${i + 1}.` }));
export const CARD_HOMES = [
  { x: 330, y: 470 }, { x: 640, y: 560 }, { x: 950, y: 470 }, { x: 330, y: 610 }, { x: 950, y: 610 }, { x: 640, y: 410 },
];

export function drawCardBoard(ctx) {
  wood(ctx, 90, 70, 1100, 600, [92, 58, 30]);
  ctx.fillStyle = 'rgba(240, 225, 190, 0.12)';
  ctx.fillRect(130, 100, 1020, 220);
  text(ctx, 'Fundsachen „Herr K.“ – der Reihe nach, wie sie gefunden werden', 640, 132, { font: `bold 20px ${PRINT}`, color: '#f1e3c0', align: 'center' });
}

export function drawIndexCard(ctx, token, x, y) {
  const card = INDEX_CARDS.find((c) => c.id === token.id);
  ctx.save();
  ctx.translate(x - 100, y - 62);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(4, 5, 200, 124);
  ctx.fillStyle = '#f6f0de';
  ctx.fillRect(0, 0, 200, 124);
  ctx.strokeStyle = 'rgba(179, 38, 30, 0.6)';
  ctx.lineWidth = 2;
  line(ctx, 0, 26, 200, 26);
  ctx.strokeStyle = 'rgba(60, 90, 160, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) line(ctx, 0, 26 + i * 22, 200, 26 + i * 22);
  text(ctx, 'FUNDBÜRO RINGBAHN', 8, 18, { font: `bold 12px ${PRINT}`, color: RED });
  text(ctx, `Lager ${card.shelf}`, 192, 18, { font: `bold 15px ${TYPEWRITER}`, color: INK, align: 'right' });
  text(ctx, card.thing, 10, 44, { font: `15px ${TYPEWRITER}` });
  text(ctx, `Besitzer: ${card.owner}`, 10, 66, { font: `13px ${TYPEWRITER}` });
  text(ctx, `Gefunden: Runde ${card.round}`, 10, 88, { font: `13px ${TYPEWRITER}` });
  text(ctx, `im ${card.place}`, 10, 110, { font: `13px ${TYPEWRITER}` });
  ctx.restore();
}

// ---------------------------------------------------------------- Regal als Suchbild
// Herr K.s acht Sachen – und Dinge, die nicht ihm gehören. Koordinaten im 1280 × 720-Bild.
export const SHELF_SPOTS = [
  { id: 'scarf', x: 570, y: 576, w: 232, h: 122, label: 'Roter Schal', mine: true },
  { id: 'hat', x: 640, y: 58, w: 210, h: 93, label: 'Hut', mine: true },
  { id: 'glasses', x: 433, y: 239, w: 155, h: 58, label: 'Brille', mine: true },
  { id: 'umbrella', x: 367, y: 337, w: 436, h: 70, label: 'Regenschirm', mine: true },
  { id: 'gloves', x: 209, y: 448, w: 175, h: 99, label: 'Handschuhe', mine: true },
  { id: 'parcel', x: 669, y: 454, w: 105, h: 87, label: 'Päckchen', mine: true },
  { id: 'pipe', x: 797, y: 471, w: 111, h: 70, label: 'Pfeife', mine: true },
  { id: 'cane', x: 221, y: 576, w: 348, h: 110, label: 'Spazierstock', mine: true },
  { id: 'clock', x: 855, y: 70, w: 82, h: 81, label: 'Wecker' },
  { id: 'teddy', x: 1088, y: 169, w: 140, h: 128, label: 'Teddybär' },
  { id: 'camera', x: 244, y: 337, w: 105, h: 70, label: 'Kamera' },
  { id: 'shoes', x: 960, y: 326, w: 186, h: 81, label: 'Schuhe' },
  { id: 'snowglobe', x: 1146, y: 436, w: 93, h: 111, label: 'Schneekugel' },
  { id: 'lantern', x: 76, y: 163, w: 99, h: 134, label: 'Laterne' },
  { id: 'teacup', x: 1047, y: 99, w: 99, h: 52, label: 'Teetasse' },
  { id: 'notebook', x: 832, y: 599, w: 116, h: 87, label: 'Notizbuch' },
];

export const FOUND_SLIP = [
  ['hat', 'Was er zum Gruß lüftete'],
  ['glasses', 'Womit er die Welt scharf sah'],
  ['umbrella', 'Was ihn bei Regen trocken hielt'],
  ['gloves', 'Was ihm im Winter die Finger wärmte'],
  ['pipe', 'Woraus nach dem Essen Rauch aufstieg'],
  ['cane', 'Worauf er sich stützte, wenn die Beine müde wurden'],
  ['scarf', 'Was rot um seinen Hals lag'],
  ['parcel', 'Sein Weihnachtsgeschenk für einen alten Freund – mit rotem Siegel'],
];

export function drawShelf(ctx, found) {
  if (shelfImage) ctx.drawImage(shelfImage, 0, 0, 1280, 720);
  for (const spot of SHELF_SPOTS) {
    if (!found.includes(spot.id)) continue;
    ctx.save();
    ctx.strokeStyle = 'rgba(140, 255, 160, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(spot.x + spot.w / 2, spot.y + spot.h / 2, spot.w / 2 + 4, spot.h / 2 + 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  const count = found.filter((id) => SHELF_SPOTS.find((s) => s.id === id)?.mine).length;
  ctx.fillStyle = 'rgba(12, 7, 4, 0.78)';
  ctx.fillRect(16, 14, 300, 40);
  text(ctx, `Fundschein: ${count} von 8 gefunden`, 166, 41, { font: `bold 19px ${PRINT}`, color: '#f6e7c1', align: 'center' });
}

// Der Fundschein als Blatt (zum Nachlesen)
export function drawFoundSlip(ctx, found = []) {
  sheet(ctx, 330, 60, 620, 600, {
    color: '#f5efe0',
    shade: '#e2d6b8',
    inner: (c) => {
      c.fillStyle = '#9b2b1e';
      c.fillRect(0, 0, 620, 50);
      text(c, 'FUNDSCHEIN', 310, 34, { font: `bold 26px ${PRINT}`, color: '#f5efe0', align: 'center' });
      text(c, 'Besitzer: Herr K., Schlafwagen Abteil 4', 30, 90, { font: `18px ${TYPEWRITER}` });
      text(c, 'Verlorene Gegenstände (vom Fahrgast beschrieben):', 30, 124, { font: `16px ${TYPEWRITER}` });
      FOUND_SLIP.forEach(([id, description], i) => {
        const y = 170 + i * 50;
        c.strokeStyle = INK;
        c.lineWidth = 1.5;
        c.strokeRect(30, y - 18, 20, 20);
        if (found.includes(id)) text(c, '✓', 33, y, { font: `bold 22px ${PRINT}`, color: '#1f6b34' });
        text(c, description, 64, y, { font: `21px ${HAND}`, color: '#27408f' });
      });
      text(c, 'Bitte am Regal ankreuzen und an der Glocke abgeben.', 310, 580, { font: `italic 15px ${SERIF}`, align: 'center' });
    },
  });
}

// ---------------------------------------------------------------- Schließfächer
export const LOCKER_SPOTS = Array.from({ length: 12 }, (_, i) => ({
  id: `locker${i + 1}`,
  x: 380 + (i % 3) * 180,
  y: 70 + Math.floor(i / 3) * 150,
  w: 160,
  h: 136,
  label: `Schließfach ${i + 1}`,
}));

export function drawLockers(ctx, open = []) {
  ctx.fillStyle = '#2b2a28';
  ctx.fillRect(360, 50, 560, 620);
  for (const spot of LOCKER_SPOTS) {
    const n = Number(spot.id.slice(6));
    const isOpen = open.includes(n);
    const gradient = ctx.createLinearGradient(spot.x, spot.y, spot.x + spot.w, spot.y + spot.h);
    gradient.addColorStop(0, isOpen ? '#1a1916' : '#8d9296');
    gradient.addColorStop(1, isOpen ? '#0d0c0b' : '#5e6367');
    ctx.fillStyle = gradient;
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    ctx.strokeStyle = '#3a3d40';
    ctx.lineWidth = 3;
    ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
    if (isOpen) continue;
    ctx.fillStyle = '#d6a645';
    ctx.fillRect(spot.x + 14, spot.y + 14, 36, 30);
    text(ctx, String(n), spot.x + 32, spot.y + 36, { font: `bold 20px ${PRINT}`, color: INK, align: 'center' });
    ctx.strokeStyle = 'rgba(30, 30, 30, 0.6)';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) line(ctx, spot.x + 60, spot.y + 70 + k * 12, spot.x + 130, spot.y + 70 + k * 12);
  }
}

// ---------------------------------------------------------------- Taschenuhr
export const WATCH = { x: 494, y: 393, r: 184 }; // Zifferblatt im Bild taschenuhr.webp
const LID = { x: 145, y: 390 };                   // Innenseite des Deckels
export const WATCH_SPOTS = [
  { id: 'hours', cx: 900, cy: 300, r: 56, label: 'Stundenrad' },
  { id: 'minutes', cx: 900, cy: 470, r: 56, label: 'Minutenrad' },
];

export function drawWatch(ctx, { hours, minutes, open, code }) {
  const { x, y, r } = WATCH;
  drawPicture(ctx, 'assets/closeups/taschenuhr.webp', 0, 0, 1280, 720);
  // Gravur im Deckel – und wenn das Fach aufspringt, der Türcode
  text(ctx, 'Für K.', LID.x, LID.y - 80, { font: `italic bold 30px ${SERIF}`, color: '#3e2606', align: 'center' });
  text(ctx, '– dein Schaffner', LID.x, LID.y - 46, { font: `italic bold 20px ${SERIF}`, color: '#3e2606', align: 'center' });
  if (open) {
    glow(ctx, LID.x, LID.y + 30, 120, '255, 230, 150', 0.35);
    text(ctx, 'Tür', LID.x, LID.y + 20, { font: `italic 22px ${SERIF}`, color: '#6b4a15', align: 'center' });
    text(ctx, code.split('').join(' '), LID.x, LID.y + 70, { font: `bold 34px ${SERIF}`, color: '#5a3a0d', align: 'center' });
  }
  // Zeiger
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const minuteAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 9;
  line(ctx, x, y, x + Math.cos(hourAngle) * r * 0.5, y + Math.sin(hourAngle) * r * 0.5);
  ctx.lineWidth = 5;
  line(ctx, x, y, x + Math.cos(minuteAngle) * r * 0.78, y + Math.sin(minuteAngle) * r * 0.78);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  // Stellräder
  for (const spot of WATCH_SPOTS) {
    ctx.fillStyle = '#b58a35';
    ctx.beginPath();
    ctx.arc(spot.cx, spot.cy, spot.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a5418';
    ctx.lineWidth = 4;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      line(ctx, spot.cx + Math.cos(a) * (spot.r - 10), spot.cy + Math.sin(a) * (spot.r - 10), spot.cx + Math.cos(a) * spot.r, spot.cy + Math.sin(a) * spot.r);
    }
    text(ctx, spot.id === 'hours' ? 'Stunde' : 'Minute', spot.cx, spot.cy + 8, { font: `bold 18px ${PRINT}`, color: '#3b2608', align: 'center' });
  }
  text(ctx, 'Klick: Rad weiterdrehen', 900, 560, { font: `15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}
