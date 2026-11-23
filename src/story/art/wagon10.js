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
export const RECORDER_SPOTS = [
  { id: 'speed', cx: 430, cy: 520, r: 56, label: 'Geschwindigkeit' },
  { id: 'direction', cx: 640, cy: 520, r: 56, label: 'Richtung' },
  { id: 'play', x: 790, y: 480, w: 120, h: 80, label: 'Abspielen' },
];

export function drawRecorder(ctx, state, time) {
  ctx.save();
  // Holzgehäuse mit runden Ecken
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  const wood = ctx.createLinearGradient(0, 110, 0, 630);
  wood.addColorStop(0, '#7a4a26');
  wood.addColorStop(1, '#3e2210');
  ctx.fillStyle = wood;
  rounded(ctx, 250, 110, 780, 520, 26);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  // gebürstete Metallplatte
  const plate = ctx.createLinearGradient(0, 130, 0, 610);
  plate.addColorStop(0, '#c9c4b6');
  plate.addColorStop(0.5, '#a9a497');
  plate.addColorStop(1, '#8a8578');
  ctx.fillStyle = plate;
  rounded(ctx, 272, 130, 736, 480, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 134; y < 608; y += 3) line(ctx, 276, y, 1004, y);
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.5)';
  ctx.lineWidth = 2;
  rounded(ctx, 272, 130, 736, 480, 16);
  ctx.stroke();

  // Spulen: links fast voll, rechts fast leer (das Band läuft von links nach rechts)
  const spin = state.playing ? time * (state.direction === 'back' ? -4 : 4) * (1 + state.speed) : 0;
  reel(ctx, 460, 270, spin, state.loaded ? 96 : 0);
  reel(ctx, 820, 270, spin, state.loaded ? 54 : 0);
  // Bandweg über Rollen und Tonkopf
  if (state.loaded) {
    ctx.strokeStyle = '#4a2a16';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(460 - 96, 270);
    ctx.lineTo(420, 400);
    ctx.lineTo(860, 400);
    ctx.lineTo(820 + 54, 270);
    ctx.stroke();
  }
  for (const rx of [420, 860]) {
    ctx.fillStyle = '#e8e4d8';
    ctx.beginPath();
    ctx.arc(rx, 400, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a564c';
    ctx.stroke();
  }
  // Tonkopf mit Abdeckung
  ctx.fillStyle = '#3a3630';
  rounded(ctx, 590, 384, 100, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#c9a24c';
  ctx.fillRect(630, 388, 20, 10);

  // Aussteuerungsanzeige (VU-Meter)
  const vu = { x: 640, y: 262 };
  ctx.fillStyle = '#1e1a14';
  rounded(ctx, vu.x - 62, vu.y - 46, 124, 82, 8);
  ctx.fill();
  const glowOn = state.power;
  ctx.fillStyle = glowOn ? '#f4e2a8' : '#8a826a';
  rounded(ctx, vu.x - 54, vu.y - 38, 108, 66, 6);
  ctx.fill();
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(vu.x, vu.y + 26, 46, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();
  ctx.strokeStyle = '#b02a20';
  ctx.beginPath();
  ctx.arc(vu.x, vu.y + 26, 46, Math.PI * 1.65, Math.PI * 1.8);
  ctx.stroke();
  const level = state.playing ? 0.45 + Math.abs(Math.sin(time * 7.3) * Math.sin(time * 3.1)) * 0.5 : 0.02;
  const a = Math.PI * (1.2 + level * 0.6);
  ctx.strokeStyle = '#1a1410';
  ctx.lineWidth = 2;
  line(ctx, vu.x, vu.y + 26, vu.x + Math.cos(a) * 50, vu.y + 26 + Math.sin(a) * 50);
  text(ctx, 'VU', vu.x, vu.y + 22, { font: `bold 11px ${PRINT}`, color: '#3a2a1a', align: 'center' });
  if (glowOn) glow(ctx, vu.x, vu.y, 70, '255, 220, 140', 0.25);

  // Typenschild
  ctx.fillStyle = '#2a2018';
  rounded(ctx, 760, 578, 200, 24, 4);
  ctx.fill();
  text(ctx, 'RINGBAHN · TONBAND', 860, 595, { font: `bold 13px ${PRINT}`, color: '#d9b25a', align: 'center' });

  // Regler
  dial(ctx, 430, 520, SPEEDS, state.speed, 'cm/s');
  dial(ctx, 640, 520, ['vor', 'zurück'], state.direction === 'back' ? 1 : 0, 'Richtung');
  // Abspieltaste
  const key = ctx.createLinearGradient(0, 480, 0, 560);
  key.addColorStop(0, state.playing ? '#5fbf6a' : '#4a5a46');
  key.addColorStop(1, state.playing ? '#2f7a3a' : '#232c22');
  ctx.fillStyle = key;
  rounded(ctx, 790, 480, 120, 80, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e8f0d8';
  ctx.beginPath();
  ctx.moveTo(835, 498);
  ctx.lineTo(870, 520);
  ctx.lineTo(835, 542);
  ctx.fill();
  if (state.loaded) {
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(590, 150, 100, 40);
    ctx.strokeStyle = '#8a6a2a';
    ctx.strokeRect(593, 153, 94, 34);
    text(ctx, 'Band 108', 640, 177, { font: `bold 18px ${TYPEWRITER}`, align: 'center' });
  }
  // Betriebslampe
  ctx.fillStyle = state.power ? '#6aff7a' : '#2a3a2a';
  ctx.beginPath();
  ctx.arc(960, 520, 9, 0, Math.PI * 2);
  ctx.fill();
  if (state.power) glow(ctx, 960, 520, 40, '120, 255, 140', 0.6);
  ctx.restore();
}

function rounded(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Eine Aluminiumspule; tape = Radius des aufgewickelten Bandes
function reel(ctx, cx, cy, spin, tape) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(5, 7, 114, 0, Math.PI * 2);
  ctx.fill();
  if (tape > 0) {
    const t = ctx.createRadialGradient(0, 0, 20, 0, 0, tape);
    t.addColorStop(0, '#3a2010');
    t.addColorStop(1, '#6a3c1c');
    ctx.fillStyle = t;
    ctx.beginPath();
    ctx.arc(0, 0, tape, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.rotate(spin);
  const metal = ctx.createLinearGradient(-112, -112, 112, 112);
  metal.addColorStop(0, 'rgba(235, 235, 230, 0.75)');
  metal.addColorStop(0.5, 'rgba(160, 160, 155, 0.6)');
  metal.addColorStop(1, 'rgba(230, 230, 225, 0.75)');
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.arc(0, 0, 112, 0, Math.PI * 2);
  // drei Fenster in der Spule
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    ctx.moveTo(Math.cos(a) * 88 + 0, Math.sin(a) * 88);
    ctx.arc(Math.cos(a) * 62, Math.sin(a) * 62, 26, 0, Math.PI * 2, true);
  }
  ctx.fill('evenodd');
  ctx.strokeStyle = 'rgba(60, 60, 55, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#5b5345';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8d2c0';
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 3;
    ctx.fillRect(Math.cos(a) * 10 - 3, Math.sin(a) * 10 - 3, 6, 6);
  }
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
    text(ctx, label, cx + Math.cos(a) * 74, cy + Math.sin(a) * 74 + 6, { font: `bold 17px ${PRINT}`, color: i === index ? '#8a1a10' : '#4a3a2a', align: 'center' });
  });
  const a = -Math.PI / 2 + (index - (n - 1) / 2) * 0.9;
  ctx.strokeStyle = '#f4e3b8';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  line(ctx, cx, cy, cx + Math.cos(a) * 36, cy + Math.sin(a) * 36);
  text(ctx, title, cx, cy + 74, { font: `15px ${PRINT}`, color: '#3a2a1a', align: 'center' });
}

// Lämpchen im Wagen, sobald Strom da ist
export function drawPower(ctx, on, time) {
  if (!on) return;
  glow(ctx, 846, 204, 60, '120, 255, 150', 0.25 + 0.05 * Math.sin(time * 5));
  glow(ctx, 1000, 300, 30, '255, 200, 90', 0.4);
}
