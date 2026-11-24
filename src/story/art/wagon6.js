import { loadImage } from '../../core/assets.js';
import {
  HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, drawPicture, glow, grain, line, plank, rivet, roundedRect, seeded, sheet, text, vignette,
} from './common.js';

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
  { id: 'teddy', thing: 'Teddybär', owner: 'ein Kind?', round: 99, place: 'Spielzimmer', shelf: 6 },
];
export const K_ORDER = ['hat', 'scarf', 'glasses', 'cane'];
export const CARD_SLOTS = [0, 1, 2, 3].map((i) => ({ x: 160 + i * 250, y: 150, w: 210, h: 130, label: `${i + 1}.` }));
export const CARD_HOMES = [
  { x: 330, y: 470 }, { x: 640, y: 560 }, { x: 950, y: 470 }, { x: 330, y: 610 }, { x: 950, y: 610 }, { x: 640, y: 410 },
];

export function drawCardBoard(ctx) {
  ctx.drawImage(cached('w6-board', 1100, 600, paintCardBoard), 90, 70);
}

// Schreibtisch im Fundbüro mit Korkbrett, Karteikasten, Stempel und Stempelkissen (einmal gezeichnet)
function paintCardBoard(c) {
  // Tischplatte aus Brettern
  for (let i = 0; i < 6; i++) plank(c, 0, 250 + i * 60, 1100, 60, { tone: [104, 64, 32], seed: 40 + i, knots: 2 });
  c.fillStyle = 'rgba(20, 10, 4, 0.55)';
  for (let i = 1; i < 6; i++) c.fillRect(0, 250 + i * 60 - 1, 1100, 2);
  // Wand hinter dem Brett
  const wall = c.createLinearGradient(0, 0, 0, 260);
  wall.addColorStop(0, '#3a2c22');
  wall.addColorStop(1, '#2a1f17');
  c.fillStyle = wall;
  c.fillRect(0, 0, 1100, 260);
  // Korkbrett mit Holzrahmen
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 20;
  c.shadowOffsetY = 8;
  c.fillStyle = '#5a3a1e';
  c.fillRect(20, 12, 1060, 244);
  c.restore();
  plank(c, 20, 12, 1060, 16, { tone: [110, 70, 36], seed: 3, knots: 0 });
  plank(c, 20, 240, 1060, 16, { tone: [100, 62, 32], seed: 4, knots: 0 });
  plank(c, 20, 12, 16, 244, { tone: [104, 66, 34], seed: 5, vertical: true, knots: 0 });
  plank(c, 1064, 12, 16, 244, { tone: [104, 66, 34], seed: 6, vertical: true, knots: 0 });
  c.strokeStyle = 'rgba(255, 220, 170, 0.25)';
  c.lineWidth = 1;
  c.strokeRect(20.5, 12.5, 1059, 243);
  c.strokeStyle = 'rgba(20, 10, 4, 0.7)';
  c.strokeRect(35.5, 27.5, 1029, 213);
  // Kork
  c.fillStyle = '#b48552';
  c.fillRect(36, 28, 1028, 212);
  const rnd = seeded(11);
  for (let i = 0; i < 9000; i++) {
    const tone = rnd();
    c.fillStyle = tone < 0.45 ? `rgba(90, 52, 22, ${0.25 + rnd() * 0.35})` : tone < 0.8 ? `rgba(214, 170, 110, ${0.2 + rnd() * 0.3})` : `rgba(60, 34, 14, ${0.3 + rnd() * 0.3})`;
    const s = 1 + rnd() * 2.4;
    c.beginPath();
    c.ellipse(36 + rnd() * 1028, 28 + rnd() * 212, s, s * (0.5 + rnd() * 0.6), rnd() * 3, 0, Math.PI * 2);
    c.fill();
  }
  const light = c.createRadialGradient(550, 40, 40, 550, 120, 620);
  light.addColorStop(0, 'rgba(255, 220, 150, 0.18)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  c.fillStyle = light;
  c.fillRect(36, 28, 1028, 212);
  // Messingschild oben
  const plate = c.createLinearGradient(0, 30, 0, 70);
  plate.addColorStop(0, '#e9c977');
  plate.addColorStop(0.45, '#c79a43');
  plate.addColorStop(1, '#8e6522');
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.5)';
  c.shadowBlur = 6;
  c.shadowOffsetY = 3;
  roundedRect(c, 250, 31, 600, 42, 6);
  c.fillStyle = plate;
  c.fill();
  c.restore();
  c.strokeStyle = 'rgba(70, 45, 10, 0.8)';
  c.lineWidth = 1.5;
  roundedRect(c, 255, 35, 590, 34, 4);
  c.stroke();
  for (const x of [264, 836]) rivet(c, x, 52, 3.5, [170, 130, 60]);
  text(c, 'Fundsachen „Herr K.“ – der Reihe nach, wie sie gefunden werden', 550, 58, { font: `bold 17px ${PRINT}`, color: '#3d2708', align: 'center' });
  // Plätze für die Karten: hellere Abdrücke im Kork, Messingecken, Reißzwecke
  CARD_SLOTS.forEach((slot, i) => {
    const x = slot.x - 90, y = slot.y - 70;
    c.fillStyle = 'rgba(232, 200, 150, 0.22)';
    c.fillRect(x + 4, y + 4, slot.w - 8, slot.h - 8);
    c.strokeStyle = 'rgba(70, 40, 15, 0.35)';
    c.lineWidth = 1.5;
    c.setLineDash([3, 4]);
    c.strokeRect(x + 4.5, y + 4.5, slot.w - 9, slot.h - 9);
    c.setLineDash([]);
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + slot.w, y, -1, 1], [x, y + slot.h, 1, -1], [x + slot.w, y + slot.h, -1, -1]]) {
      const g = c.createLinearGradient(cx, cy, cx + sx * 22, cy + sy * 22);
      g.addColorStop(0, '#f0d488');
      g.addColorStop(1, '#a07a2c');
      c.fillStyle = 'rgba(0, 0, 0, 0.35)';
      c.beginPath();
      c.moveTo(cx + 2, cy + 3);
      c.lineTo(cx + sx * 24 + 2, cy + 3);
      c.lineTo(cx + 2, cy + sy * 24 + 3);
      c.fill();
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(cx, cy);
      c.lineTo(cx + sx * 24, cy);
      c.lineTo(cx, cy + sy * 24);
      c.closePath();
      c.fill();
    }
    // große Nummer im Kork, mit Kreide
    text(c, String(i + 1), x + slot.w / 2, y + slot.h / 2 + 26, { font: `bold 72px ${SERIF}`, color: 'rgba(255, 245, 225, 0.16)', align: 'center' });
  });
  // ein paar lose Reißzwecken
  const pins = seeded(21);
  for (const [px, py] of [[52, 46], [1046, 220], [1040, 48], [56, 214], [302, 226], [810, 230]]) {
    const hue = ['#b3261e', '#2f5a9a', '#d6a640', '#2f7a44'][Math.floor(pins() * 4)];
    pushPin(c, px, py, hue);
  }
  // Karteikasten links (von vorn, Karten schauen oben heraus)
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 16;
  c.shadowOffsetY = 8;
  c.fillStyle = '#3a2210';
  c.fillRect(12, 478, 118, 108);
  c.restore();
  for (let i = 0; i < 8; i++) {
    const cy = 462 + i * 3;
    c.fillStyle = i % 2 ? '#efe5cb' : '#f7f0dc';
    c.fillRect(22, cy, 98, 30);
    c.strokeStyle = 'rgba(90, 70, 40, 0.45)';
    c.lineWidth = 1;
    c.strokeRect(22.5, cy + 0.5, 97, 29);
    if (i === 1 || i === 4 || i === 6) {
      c.fillStyle = { 1: '#c0392b', 4: '#2f6aa0', 6: '#d6a640' }[i];
      c.fillRect(28 + i * 11, cy - 6, 20, 7);
    }
  }
  plank(c, 12, 490, 118, 96, { tone: [112, 68, 32], seed: 77, knots: 1 });
  c.strokeStyle = 'rgba(25, 12, 4, 0.7)';
  c.lineWidth = 2;
  c.strokeRect(13, 491, 116, 94);
  const handle = c.createLinearGradient(0, 524, 0, 540);
  handle.addColorStop(0, '#e9c977');
  handle.addColorStop(1, '#7a5418');
  c.fillStyle = handle;
  roundedRect(c, 48, 524, 46, 14, 4);
  c.fill();
  c.fillStyle = '#f3ead4';
  c.fillRect(51, 548, 40, 20);
  c.strokeStyle = '#a07a2c';
  c.strokeRect(50.5, 547.5, 41, 21);
  text(c, 'A – K', 71, 563, { font: `bold 12px ${TYPEWRITER}`, color: INK, align: 'center' });
  // Stempelkissen und Stempel rechts
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.55)';
  c.shadowBlur = 12;
  c.shadowOffsetY = 6;
  const tin = c.createLinearGradient(0, 510, 0, 580);
  tin.addColorStop(0, '#5a6066');
  tin.addColorStop(1, '#2c3034');
  c.fillStyle = tin;
  roundedRect(c, 975, 520, 110, 64, 8);
  c.fill();
  c.restore();
  c.fillStyle = '#3b2a5c';
  roundedRect(c, 984, 528, 92, 48, 5);
  c.fill();
  c.fillStyle = 'rgba(140, 110, 200, 0.25)';
  c.fillRect(990, 532, 60, 10);
  text(c, 'STEMPEL', 1030, 596, { font: `bold 10px ${PRINT}`, color: 'rgba(240, 225, 190, 0.5)', align: 'center' });
  // Stempel (von oben): Gummiplatte und runder Holzgriff
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.beginPath();
  c.ellipse(1040, 478, 34, 24, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#2a2a2a';
  roundedRect(c, 1004, 452, 64, 36, 4);
  c.fill();
  c.fillStyle = '#6f757a';
  c.fillRect(1004, 452, 64, 6);
  const knob = c.createRadialGradient(1028, 462, 2, 1034, 468, 22);
  knob.addColorStop(0, '#c98a4c');
  knob.addColorStop(0.6, '#7a4418');
  knob.addColorStop(1, '#3a1d08');
  c.fillStyle = knob;
  c.beginPath();
  c.arc(1036, 468, 20, 0, Math.PI * 2);
  c.fill();
  // Lampenschein von oben links, Rand abdunkeln
  const lamp = c.createRadialGradient(560, 300, 60, 560, 380, 700);
  lamp.addColorStop(0, 'rgba(255, 215, 150, 0.12)');
  lamp.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  c.fillStyle = lamp;
  c.fillRect(0, 256, 1100, 344);
  vignette(c, 0, 0, 1100, 600, 0.35);
}

function pushPin(c, x, y, color) {
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  c.beginPath();
  c.ellipse(x + 4, y + 5, 7, 5, 0, 0, Math.PI * 2);
  c.fill();
  const g = c.createRadialGradient(x - 2, y - 3, 1, x, y, 8);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.25, color);
  g.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, 7, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = g;
  c.globalAlpha = 0.7;
  c.fill();
  c.globalAlpha = 1;
}

// Eine Karteikarte (200 × 124), einmal je Karte gezeichnet und leicht schräg hingelegt
export function drawIndexCard(ctx, token, x, y) {
  const card = INDEX_CARDS.find((c) => c.id === token.id);
  const index = INDEX_CARDS.indexOf(card);
  const image = cached(`w6-card-${card.id}`, 216, 140, (c) => paintIndexCard(c, card, index));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate([-0.018, 0.012, -0.008, 0.02, -0.014, 0.009][index] ?? 0);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.fillRect(-98, -58, 204, 128);
  ctx.drawImage(image, -108, -70);
  ctx.restore();
}

function paintIndexCard(c, card, index) {
  c.translate(8, 8);
  const paper = c.createLinearGradient(0, 0, 200, 124);
  paper.addColorStop(0, '#fbf5e4');
  paper.addColorStop(1, '#eadfc2');
  c.fillStyle = paper;
  // Eselsohr unten rechts
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(200, 0);
  c.lineTo(200, 110);
  c.lineTo(186, 124);
  c.lineTo(0, 124);
  c.closePath();
  c.fill();
  c.fillStyle = '#d8caa4';
  c.beginPath();
  c.moveTo(200, 110);
  c.lineTo(186, 110);
  c.lineTo(186, 124);
  c.closePath();
  c.fill();
  c.save();
  c.clip();
  grain(c, 0, 0, 200, 124, { seed: 90 + index, count: 0.05, dark: 0.08, light: 0.15, size: 1 });
  c.restore();
  // Linien
  c.strokeStyle = 'rgba(179, 38, 30, 0.65)';
  c.lineWidth = 1.6;
  line(c, 0, 27, 200, 27);
  c.strokeStyle = 'rgba(60, 90, 160, 0.28)';
  c.lineWidth = 1;
  for (let i = 1; i < 5; i++) line(c, 0, 27 + i * 22, 196, 27 + i * 22);
  // Kopf
  text(c, 'FUNDBÜRO', 8, 18, { font: `bold 10px ${PRINT}`, color: RED });
  // Lagerstempel (violett, schräg)
  c.save();
  c.translate(162, 14);
  c.rotate(-0.08);
  c.strokeStyle = 'rgba(88, 52, 140, 0.85)';
  c.lineWidth = 1.8;
  roundedRect(c, -34, -11, 68, 22, 3);
  c.stroke();
  text(c, `LAGER ${card.shelf}`, 0, 6, { font: `bold 14px ${TYPEWRITER}`, color: 'rgba(88, 52, 140, 0.92)', align: 'center' });
  c.restore();
  // Inhalt
  text(c, card.thing, 10, 45, { font: `bold 15px ${TYPEWRITER}`, color: INK });
  const field = (label, value, y) => {
    text(c, label, 10, y, { font: `9px ${PRINT}`, color: 'rgba(60, 50, 40, 0.7)' });
    text(c, value, 66, y, { font: `13px ${TYPEWRITER}`, color: INK });
  };
  field('BESITZER', card.owner, 67);
  field('GEFUNDEN', `Runde ${card.round}`, 89);
  field('ORT', card.place, 111);
  // Lochung unten
  c.fillStyle = 'rgba(40, 25, 12, 0.85)';
  c.beginPath();
  c.arc(100, 118, 4, 0, Math.PI * 2);
  c.fill();
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
