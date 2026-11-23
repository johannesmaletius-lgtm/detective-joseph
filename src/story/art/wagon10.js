import { HAND, INK, PRINT, TYPEWRITER, drawPicture, glow, line, picture, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 10 (Lautsprecherwagen): Sicherungskasten, Tonbandregal, Tonbandgerät.

// ---------------------------------------------------------------- Sicherungskasten
// Fünf Fassungen, jede an einem Kabel anderer Dicke. Dickes Kabel = große Sicherung.
export const CABLES = [4, 1, 6, 1.5, 2.5];          // Querschnitt in mm² je Fassung (von oben)
export const FUSES = [
  { id: 'f6', amp: 6 }, { id: 'f10', amp: 10 }, { id: 'f16', amp: 16 }, { id: 'f20', amp: 20 }, { id: 'f25', amp: 25 },
];
export const FUSE_ORDER = (() => {
  const sorted = [...CABLES].sort((a, b) => a - b);
  return CABLES.map((c) => FUSES[sorted.indexOf(c)].id); // richtige Sicherung je Fassung
})();

export const FUSE_SLOTS = CABLES.map((_, i) => ({ x: 560, y: 128 + i * 104, w: 180, h: 64 }));
export const FUSE_HOMES = [
  { x: 1010, y: 190 }, { x: 980, y: 272 }, { x: 1030, y: 354 }, { x: 990, y: 436 }, { x: 1020, y: 518 },
];

export function drawFuseBox(ctx) {
  wood(ctx, 120, 60, 1040, 620, [58, 48, 40]);
  // Kasten
  ctx.fillStyle = '#4b4d44';
  ctx.fillRect(220, 90, 600, 580);
  ctx.strokeStyle = '#25261f';
  ctx.lineWidth = 6;
  ctx.strokeRect(220, 90, 600, 580);
  CABLES.forEach((size, i) => {
    const s = FUSE_SLOTS[i];
    const cy = s.y + s.h / 2;
    // Kabel von links
    ctx.strokeStyle = '#7a2a1a';
    ctx.lineWidth = 2 + size * 3.2;
    ctx.lineCap = 'round';
    line(ctx, 236, cy, s.x - 6, cy);
    ctx.strokeStyle = 'rgba(255, 200, 160, 0.35)';
    ctx.lineWidth = Math.max(1, size * 0.8);
    line(ctx, 240, cy - size * 0.9, s.x - 10, cy - size * 0.9);
    // Fassung
    ctx.fillStyle = '#d8d2bf';
    ctx.fillRect(s.x - 8, s.y + 6, s.w + 16, s.h - 12);
    ctx.fillStyle = '#9a927c';
    ctx.fillRect(s.x - 8, s.y + 6, 10, s.h - 12);
    ctx.fillRect(s.x + s.w - 2, s.y + 6, 10, s.h - 12);
    // Zwei Schildchen sind abgegriffen – dort hilft nur der Blick auf die Kabeldicke
    const worn = size === 2.5 || size === 4;
    text(ctx, worn ? '?? mm²' : `${String(size).replace('.', ',')} mm²`, 300, cy - 14 - size * 1.6, { font: `15px ${TYPEWRITER}`, color: worn ? 'rgba(233, 225, 200, 0.45)' : '#e9e1c8' });
  });
  // Zettel am Deckel
  sheet(ctx, 950, 566, 150, 104, {
    angle: 0.05,
    inner: (c) => {
      text(c, '1 mm² → 6 A', 75, 30, { font: `16px ${HAND}`, align: 'center' });
      text(c, '1,5 mm² → 10 A', 75, 54, { font: `16px ${HAND}`, align: 'center' });
      text(c, '(Rest abgerissen)', 75, 86, { font: `italic 14px ${HAND}`, color: '#7a5a3a', align: 'center' });
    },
  });
  text(ctx, 'Lose Sicherungen', 1005, 140, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

export function drawFuse(ctx, token, x, y) {
  const fuse = FUSES.find((f) => f.id === token.id);
  ctx.save();
  ctx.translate(x, y);
  const glass = ctx.createLinearGradient(0, -26, 0, 26);
  glass.addColorStop(0, '#f6f1e2');
  glass.addColorStop(0.5, '#c9c2ab');
  glass.addColorStop(1, '#f2ead6');
  ctx.fillStyle = '#a8a08c';
  ctx.fillRect(-84, -22, 22, 44);
  ctx.fillRect(62, -22, 22, 44);
  ctx.fillStyle = glass;
  ctx.fillRect(-62, -24, 124, 48);
  ctx.strokeStyle = '#6a6250';
  ctx.lineWidth = 2;
  ctx.strokeRect(-62, -24, 124, 48);
  text(ctx, `${fuse.amp} A`, 0, 9, { font: `bold 24px ${PRINT}`, color: INK, align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Tonbandregal
export const TAPES = [1, 12, 27, 50, 64, 81, 99, 104, 105, 106, 107, 108, 110, 103];
export function tapeSpots() {
  return TAPES.map((round, i) => ({
    id: `tape${round}`, round,
    x: 210 + (i % 7) * 124, y: 170 + Math.floor(i / 7) * 230, w: 108, h: 150,
    label: `Tonband „${round}“`,
  }));
}

export function drawTapeShelf(ctx, taken) {
  wood(ctx, 170, 110, 940, 520, [120, 76, 36]);
  for (let r = 0; r < 2; r++) {
    ctx.fillStyle = '#5a3a1c';
    ctx.fillRect(180, 330 + r * 230, 920, 18);
  }
  for (const spot of tapeSpots()) {
    if (taken && spot.round === 108) continue;
    ctx.save();
    ctx.translate(spot.x, spot.y);
    ctx.fillStyle = spot.round === 110 ? '#6d7a86' : '#c9a86a';
    ctx.fillRect(0, 0, spot.w, spot.h);
    ctx.strokeStyle = 'rgba(50, 30, 10, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, spot.w, spot.h);
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(12, 18, spot.w - 24, 52);
    text(ctx, 'Runde', spot.w / 2, 38, { font: `13px ${TYPEWRITER}`, align: 'center' });
    text(ctx, String(spot.round), spot.w / 2, 64, { font: `bold 24px ${TYPEWRITER}`, align: 'center' });
    // Spule
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.arc(spot.w / 2, 108, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9c8a66';
    ctx.beginPath();
    ctx.arc(spot.w / 2, 108, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  text(ctx, 'Für jede Runde ein Band. Manche Nummern fehlen.', 640, 660, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Tonbandgerät
export const SPEEDS = ['4¾', '9½', '19'];
// Knöpfe und Spulen im Bild tonband.webp
const RECORDER = 'assets/closeups/tonband.webp';
const REELS = [[406, 207], [869, 207]];
export const RECORDER_SPOTS = [
  { id: 'speed', cx: 448, cy: 574, r: 66, label: 'Geschwindigkeit' },
  { id: 'direction', cx: 643, cy: 574, r: 66, label: 'Richtung' },
  { id: 'play', cx: 834, cy: 570, r: 62, label: 'Abspielen' },
];

export function drawRecorder(ctx, state, time) {
  drawPicture(ctx, RECORDER, 0, 0, 1280, 720);
  const image = picture(RECORDER);
  // Spulen drehen sich beim Abspielen
  if (state.playing && image.complete && image.naturalWidth) {
    const k = image.naturalWidth / 1280, rr = 176;
    const turn = time * (state.direction === 'back' ? -4 : 4) * (1 + state.speed);
    for (const [cx, cy] of REELS) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(cx, cy);
      ctx.rotate(turn);
      ctx.drawImage(image, (cx - rr) * k, (cy - rr) * k, rr * 2 * k, rr * 2 * k, -rr, -rr, rr * 2, rr * 2);
      ctx.restore();
    }
  }
  dial(ctx, 448, 574, SPEEDS, state.speed, 'cm/s');
  dial(ctx, 643, 574, ['vor', 'zurück'], state.direction === 'back' ? 1 : 0, 'Richtung');
  if (state.playing) glow(ctx, 834, 570, 90, '255, 120, 90', 0.45);
  text(ctx, state.playing ? 'läuft' : 'Start', 834, 669, { font: `bold 15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  if (state.loaded) {
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(585, 400, 100, 34);
    text(ctx, 'Band 108', 635, 424, { font: `bold 17px ${TYPEWRITER}`, align: 'center' });
  }
  if (state.power) glow(ctx, 1020, 80, 30, '120, 255, 140', 0.7);
}

// Zeiger auf einem Knopf des Bilds, Beschriftung im Bogen darüber
function dial(ctx, cx, cy, labels, index, title) {
  const n = labels.length;
  labels.forEach((label, i) => {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.7;
    const lx = cx + Math.cos(a) * 92, ly = cy + Math.sin(a) * 92 + 6;
    ctx.fillStyle = 'rgba(30, 18, 8, 0.7)';
    ctx.fillRect(lx - 26, ly - 17, 52, 22);
    text(ctx, label, lx, ly, { font: `bold 16px ${PRINT}`, color: i === index ? '#ffe9a6' : '#a8987a', align: 'center' });
  });
  const a = -Math.PI / 2 + (index - (n - 1) / 2) * 0.7;
  ctx.strokeStyle = '#f4e3b8';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  line(ctx, cx, cy, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46);
  ctx.lineCap = 'butt';
  text(ctx, title, cx, cy + 95, { font: `bold 15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Lämpchen im Wagen, sobald Strom da ist
export function drawPower(ctx, on, time) {
  if (!on) return;
  glow(ctx, 846, 204, 60, '120, 255, 150', 0.25 + 0.05 * Math.sin(time * 5));
  glow(ctx, 1000, 300, 30, '255, 200, 90', 0.4);
}
