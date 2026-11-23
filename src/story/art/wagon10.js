import { HAND, INK, PRINT, TYPEWRITER, glow, line, sheet, text, wood } from './common.js';

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
    text(ctx, `${String(size).replace('.', ',')} mm²`, 300, cy - 14 - size * 1.6, { font: `15px ${TYPEWRITER}`, color: '#e9e1c8' });
  });
  // Zettel am Deckel
  sheet(ctx, 950, 566, 150, 104, {
    angle: 0.05,
    inner: (c) => {
      text(c, 'Dünner Draht –', 75, 30, { font: `16px ${HAND}`, align: 'center' });
      text(c, 'kleine Sicherung.', 75, 54, { font: `16px ${HAND}`, align: 'center' });
      text(c, 'Sonst brennt’s!', 75, 86, { font: `bold 16px ${HAND}`, color: '#a12218', align: 'center' });
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
export const RECORDER_SPOTS = [
  { id: 'speed', cx: 430, cy: 520, r: 56, label: 'Geschwindigkeit' },
  { id: 'direction', cx: 640, cy: 520, r: 56, label: 'Richtung' },
  { id: 'play', x: 790, y: 480, w: 120, h: 80, label: 'Abspielen' },
];

export function drawRecorder(ctx, state, time) {
  ctx.save();
  // Gehäuse
  ctx.fillStyle = '#5b3a20';
  ctx.fillRect(250, 110, 780, 520);
  ctx.fillStyle = '#7d5530';
  ctx.fillRect(266, 126, 748, 488);
  // Spulen
  for (const cx of [460, 820]) {
    ctx.save();
    ctx.translate(cx, 270);
    ctx.rotate(state.playing ? time * (state.direction === 'back' ? -4 : 4) * (1 + state.speed) : 0);
    ctx.fillStyle = '#c8bfa8';
    ctx.beginPath();
    ctx.arc(0, 0, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e2c1a';
    for (let i = 0; i < 3; i++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.arc(0, -58, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5b5345';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.strokeStyle = '#2c1d10';
  ctx.lineWidth = 3;
  line(ctx, 460, 382, 820, 382);
  // Geschwindigkeit
  dial(ctx, 430, 520, SPEEDS, state.speed, 'cm/s');
  dial(ctx, 640, 520, ['vor', 'zurück'], state.direction === 'back' ? 1 : 0, 'Richtung');
  // Abspielen
  ctx.fillStyle = state.playing ? '#3d8f4a' : '#2f3a2c';
  ctx.fillRect(790, 480, 120, 80);
  ctx.fillStyle = '#e8f0d8';
  ctx.beginPath();
  ctx.moveTo(835, 498);
  ctx.lineTo(870, 520);
  ctx.lineTo(835, 542);
  ctx.fill();
  if (state.loaded) {
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(590, 150, 100, 40);
    text(ctx, 'Band 108', 640, 177, { font: `bold 18px ${TYPEWRITER}`, align: 'center' });
  }
  if (state.power) glow(ctx, 980, 150, 40, '120, 255, 140', 0.6);
  ctx.restore();
}

function dial(ctx, cx, cy, labels, index, title) {
  ctx.fillStyle = '#2a2018';
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a24c';
  ctx.lineWidth = 4;
  ctx.stroke();
  const n = labels.length;
  labels.forEach((label, i) => {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.9;
    text(ctx, label, cx + Math.cos(a) * 74, cy + Math.sin(a) * 74 + 6, { font: `bold 17px ${PRINT}`, color: i === index ? '#ffe9a6' : '#cdbb94', align: 'center' });
  });
  const a = -Math.PI / 2 + (index - (n - 1) / 2) * 0.9;
  ctx.strokeStyle = '#f4e3b8';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  line(ctx, cx, cy, cx + Math.cos(a) * 36, cy + Math.sin(a) * 36);
  text(ctx, title, cx, cy + 74, { font: `15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Lämpchen im Wagen, sobald Strom da ist
export function drawPower(ctx, on, time) {
  if (!on) return;
  glow(ctx, 846, 204, 60, '120, 255, 150', 0.25 + 0.05 * Math.sin(time * 5));
  glow(ctx, 1000, 300, 30, '255, 200, 90', 0.4);
}
