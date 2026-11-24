import {
  HAND, INK, PRINT, SERIF, cachedLayer, contactShadow, drawPicture, fineGrain, glow, line, plank, rivet, roundedRect, sheet, text, vignette,
} from './common.js';

// Gezeichnetes für Wagen 11 (Uhrenwagen): die Wand voller Uhren (eine geht mit dem Mond),
// die Rundenuhr, Standuhr und Kuckucksuhr zum Stellen.

export const CALL_MINUTE = 50;  // so weit ist die Rundenuhr, wenn der Ruf kommt (von 60)
export const RATES = { grandfather: 1.5, cuckoo: 0.5 }; // Minuten je Rundenminute
export const TARGET = { grandfather: 45, cuckoo: 35 };  // so müssen sie beim Verlassen des Tunnels stehen

// ---------------------------------------------------------------- Wand voller Uhren
const KINDS = ['stopped', 'ticking', 'moon', 'backward', 'stopped', 'fast', 'ticking', 'stopped', 'backward'];
const STOPPED = [[10, 10], [3, 40], [7, 25]];

export function clockSpots() {
  return KINDS.map((kind, i) => ({
    id: `c${i}`, kind,
    cx: [381, 639, 896][i % 3], cy: [153, 364, 578][Math.floor(i / 3)], r: 74, // Zifferblätter im Bild uhrenwand.webp
    label: 'Uhr',
  }));
}

export function drawClockWall(ctx, { progress, age }) {
  drawPicture(ctx, 'assets/closeups/uhrenwand.webp', 0, 0, 1280, 720);
  let stoppedIndex = 0;
  for (const spot of clockSpots()) {
    const { cx, cy, r, kind } = spot;
    // Von außen sieht die Rundenuhr aus wie die anderen: nur ein einzelner Zeiger, der ganz langsam wandert
    // (einmal herum pro Runde). Eine stehen gebliebene Uhr hat auch nur noch einen Zeiger – genau hinsehen!
    if (kind === 'moon' || (kind === 'stopped' && stoppedIndex === 0)) {
      if (kind === 'stopped') stoppedIndex++;
      ticks(ctx, cx, cy, r);
      const angle = kind === 'moon' ? progress * Math.PI * 2 - Math.PI / 2 : 0.35 * Math.PI * 2 - Math.PI / 2;
      ctx.strokeStyle = INK;
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      line(ctx, cx, cy, cx + Math.cos(angle) * r * 0.8, cy + Math.sin(angle) * r * 0.8);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ticks(ctx, cx, cy, r);
    let hour, minute, second = null;
    if (kind === 'stopped') {
      [hour, minute] = STOPPED[stoppedIndex++ % STOPPED.length];
    } else if (kind === 'ticking') {
      hour = 11; minute = 40 + age / 60; second = Math.floor(age) % 60;
    } else if (kind === 'backward') {
      hour = 4; minute = 30 - age * 2; second = (60 - (Math.floor(age * 2) % 60)) % 60;
    } else {
      hour = (age * 0.5) % 12; minute = (age * 6) % 60;
    }
    hands(ctx, cx, cy, r, hour, minute, second);
  }
  // Die Frage („Welche geht mit dem Mond?“) steht in der Hilfezeile ganz unten – sonst lägen zwei Zeilen übereinander.
}

function ticks(ctx, cx, cy, r, color = INK) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82, cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94);
  }
}

function face(ctx, cx, cy, r, color = '#efe3c2') {
  ctx.fillStyle = '#5a3416';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82, cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94);
  }
}

function hands(ctx, cx, cy, r, hour, minute, second) {
  const ha = ((hour % 12) + minute / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  const ma = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  line(ctx, cx, cy, cx + Math.cos(ha) * r * 0.5, cy + Math.sin(ha) * r * 0.5);
  ctx.lineWidth = 4;
  line(ctx, cx, cy, cx + Math.cos(ma) * r * 0.78, cy + Math.sin(ma) * r * 0.78);
  if (second !== null) {
    const sa = (second / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = '#a12218';
    ctx.lineWidth = 2;
    line(ctx, cx, cy, cx + Math.cos(sa) * r * 0.86, cy + Math.sin(sa) * r * 0.86);
  }
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
}

// Die Rundenuhr: ein Zeiger, einmal herum pro Runde. Oben „Tunnel“, roter Strich beim Ruf.
export function drawRoundClock(ctx, cx, cy, r, progress, { big = false, bare = false, labelGap = 18 } = {}) {
  if (bare) ticks(ctx, cx, cy, r, '#d9c88a');
  else face(ctx, cx, cy, r, '#d9d2c0');
  if (!bare) {
  ctx.save();
  // Nachthimmel im Zifferblatt
  ctx.fillStyle = '#1c2340';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4ecc8';
  for (let i = 0; i < 14; i++) ctx.fillRect(cx + Math.cos(i * 2.3) * r * 0.55, cy + Math.sin(i * 1.7) * r * 0.5, 2, 2);
  ctx.restore();
  }
  // Tunnel oben
  ctx.fillStyle = '#20160e';
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.84, r * 0.13, Math.PI, 0);
  ctx.fill();
  // Ruf-Strich
  const ca = (CALL_MINUTE / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#c0281e';
  ctx.lineWidth = big ? 8 : 5;
  line(ctx, cx + Math.cos(ca) * r * 0.74, cy + Math.sin(ca) * r * 0.74, cx + Math.cos(ca) * r * 0.98, cy + Math.sin(ca) * r * 0.98);
  if (big) {
    text(ctx, 'Tunnel', cx, cy - r - labelGap, { font: `bold 20px ${PRINT}`, color: '#f3e2b4', align: 'center' });
    text(ctx, 'Ruf', cx + Math.cos(ca) * (r + labelGap + 16), cy + Math.sin(ca) * (r + labelGap + 16) + 6, { font: `bold 20px ${HAND}`, color: '#ff8a70', align: 'center' });
    for (let m = 10; m < 60; m += 10) {
      const a = (m / 60) * Math.PI * 2 - Math.PI / 2;
      text(ctx, String(m), cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62 + 6, { font: `16px ${SERIF}`, color: '#e9dfc0', align: 'center' });
    }
  }
  // der Zeiger mit dem Mond
  const a = progress * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#e8d9a8';
  ctx.lineWidth = 4;
  line(ctx, cx, cy, cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7);
  ctx.fillStyle = '#f7f0cf';
  ctx.beginPath();
  ctx.arc(cx + Math.cos(a) * r * 0.7, cy + Math.sin(a) * r * 0.7, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c2340';
  ctx.beginPath();
  ctx.arc(cx + Math.cos(a) * r * 0.7 + r * 0.04, cy + Math.sin(a) * r * 0.7 - r * 0.02, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

// Wand mit Holzvertäfelung für die Nahansichten der Uhren
function wall(c, seed) {
  plank(c, 0, 0, 1280, 720, { tone: [74, 42, 22], seed, vertical: true, knots: 0 });
  for (let x = 30; x < 1280; x += 140) {
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillRect(x, 0, 3, 720);
  }
  glow(c, 640, 120, 600, '255, 210, 140', 0.12);
  vignette(c, 0, 0, 1280, 720, 0.7);
}

// Messinglünette mit Glasscheibe (Glanz) um ein Zifferblatt
function bezel(c, cx, cy, r, width = 20) {
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 12;
  const g = c.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#fbe6a4');
  g.addColorStop(0.4, '#c49a40');
  g.addColorStop(0.7, '#8a6420');
  g.addColorStop(1, '#4a3008');
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, r + width, 0, Math.PI * 2);
  c.fill();
  c.restore();
  c.strokeStyle = 'rgba(255, 240, 190, 0.6)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, cy, r + width - 3, Math.PI * 0.9, Math.PI * 1.6);
  c.stroke();
  c.strokeStyle = 'rgba(40, 24, 4, 0.7)';
  c.beginPath();
  c.arc(cx, cy, r + 4, 0, Math.PI * 2);
  c.stroke();
}

function glassGlare(c, cx, cy, r) {
  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.clip();
  const g = c.createLinearGradient(cx - r, cy - r, cx + r * 0.2, cy + r * 0.2);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
  g.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
  g.addColorStop(0.51, 'rgba(255, 255, 255, 0)');
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.restore();
}

function paintRoundClockCard(c) {
  wall(c, 111);
  bezel(c, 640, 350, 218, 24);
  for (let i = 0; i < 4; i++) rivet(c, 640 + Math.cos(i * Math.PI / 2 + Math.PI / 4) * 230, 350 + Math.sin(i * Math.PI / 2 + Math.PI / 4) * 230, 4, [150, 120, 50]);
}

export function drawRoundClockCard(ctx, progress) {
  ctx.drawImage(cachedLayer('w11-roundcard', paintRoundClockCard), 0, 0, 1280, 720);
  drawRoundClock(ctx, 640, 350, 210, progress, { big: true, labelGap: 50 });
  glassGlare(ctx, 640, 350, 218);
  text(ctx, 'Ein Zeiger, einmal herum pro Runde. Oben der Tunnel.', 640, 630, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Standuhr / Kuckucksuhr stellen
export const SET_SPOTS = [
  { id: 'plus', x: 760, y: 560, w: 120, h: 70, label: 'Minutenzeiger vor (5 Minuten)' },
  { id: 'minus', x: 400, y: 560, w: 120, h: 70, label: 'Minutenzeiger zurück (5 Minuten)' },
];

function paintSetClock(c, cuckoo) {
  wall(c, cuckoo ? 112 : 113);
  contactShadow(c, 640, 676, 300, 22, 0.6);
  if (cuckoo) {
    // Kuckucksuhr: geschnitztes Häuschen mit Dach, Laub und Vogeltürchen
    c.save();
    c.shadowColor = 'rgba(0, 0, 0, 0.7)';
    c.shadowBlur = 30;
    c.shadowOffsetY = 12;
    c.fillStyle = '#4a2810';
    c.fillRect(420, 150, 440, 520);
    c.restore();
    plank(c, 420, 150, 440, 520, { tone: [128, 76, 36], seed: 114, vertical: true, knots: 2 });
    // Dach mit Schindeln
    c.save();
    c.beginPath();
    c.moveTo(370, 226); c.lineTo(640, 46); c.lineTo(910, 226); c.lineTo(880, 240); c.lineTo(640, 80); c.lineTo(400, 240); c.closePath();
    c.shadowColor = 'rgba(0, 0, 0, 0.6)';
    c.shadowBlur = 14;
    c.shadowOffsetY = 6;
    c.fillStyle = '#5c2e12';
    c.fill();
    c.restore();
    c.save();
    c.beginPath();
    c.moveTo(370, 226); c.lineTo(640, 46); c.lineTo(910, 226); c.lineTo(880, 240); c.lineTo(640, 80); c.lineTo(400, 240); c.closePath();
    c.clip();
    for (let k = 0; k < 40; k++) {
      c.strokeStyle = 'rgba(30, 12, 2, 0.5)';
      c.lineWidth = 1.5;
      line(c, 360 + k * 14, 60, 360 + k * 14 - 30, 260);
    }
    c.restore();
    c.fillStyle = 'rgba(255, 210, 150, 0.25)';
    c.beginPath();
    c.moveTo(370, 226); c.lineTo(640, 46); c.lineTo(644, 52); c.lineTo(376, 230); c.closePath();
    c.fill();
    // Giebelfeld mit Türchen und Kuckuck
    c.fillStyle = '#6a3a18';
    c.beginPath();
    c.moveTo(420, 230); c.lineTo(640, 82); c.lineTo(860, 230); c.closePath();
    c.fill();
    c.fillStyle = '#1e1008';
    roundedRect(c, 614, 98, 52, 50, 6);
    c.fill();
    c.fillStyle = '#7a4a1e';
    c.fillRect(590, 100, 22, 46);
    c.fillStyle = '#e7c23a';
    c.beginPath();
    c.ellipse(640, 124, 15, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#b8842a';
    c.beginPath();
    c.moveTo(653, 120); c.lineTo(668, 125); c.lineTo(653, 130); c.closePath();
    c.fill();
    c.fillStyle = '#1e1008';
    c.beginPath();
    c.arc(645, 120, 2.5, 0, Math.PI * 2);
    c.fill();
    // Geschnitztes Laub links und rechts
    for (const side of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const lx = 640 + side * (240 + (k % 2) * 16), ly = 270 + k * 62;
        c.save();
        c.translate(lx, ly);
        c.rotate(side * (0.5 + (k % 3) * 0.3));
        c.fillStyle = k % 2 ? '#6a3c16' : '#7e4a1c';
        c.beginPath();
        c.ellipse(0, 0, 30, 14, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = 'rgba(30, 12, 2, 0.6)';
        c.lineWidth = 1.5;
        line(c, -26, 0, 26, 0);
        c.restore();
      }
    }
  } else {
    // Standuhr: Haube mit Säulen, Mahagoni
    c.save();
    c.shadowColor = 'rgba(0, 0, 0, 0.7)';
    c.shadowBlur = 30;
    c.shadowOffsetY = 12;
    c.fillStyle = '#2a1408';
    c.fillRect(400, 60, 480, 620);
    c.restore();
    plank(c, 400, 60, 480, 620, { tone: [96, 40, 22], seed: 115, vertical: true, knots: 1 });
    // Bogen oben
    c.fillStyle = '#5a2410';
    c.beginPath();
    c.moveTo(380, 120); c.quadraticCurveTo(640, 10, 900, 120); c.lineTo(900, 136); c.lineTo(380, 136); c.closePath();
    c.fill();
    c.fillStyle = 'rgba(255, 210, 160, 0.25)';
    c.fillRect(380, 134, 520, 2);
    // Säulen mit Messingkapitellen
    for (const x of [420, 860]) {
      const col = c.createLinearGradient(x - 14, 0, x + 14, 0);
      col.addColorStop(0, '#3a160a');
      col.addColorStop(0.4, '#8a3a1c');
      col.addColorStop(1, '#2a0e06');
      c.fillStyle = col;
      c.fillRect(x - 14, 150, 28, 400);
      for (const y of [140, 550]) {
        const cap = c.createLinearGradient(0, y, 0, y + 14);
        cap.addColorStop(0, '#f2d98c');
        cap.addColorStop(1, '#7a5a1a');
        c.fillStyle = cap;
        c.fillRect(x - 20, y, 40, 14);
      }
    }
  }
}

// Zifferblatt: Emaille mit Minutenkranz und Messingrand
function fancyFace(ctx, cx, cy, r) {
  bezel(ctx, cx, cy, r, 18);
  const dial = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
  dial.addColorStop(0, '#fbf4de');
  dial.addColorStop(1, '#dccfa8');
  ctx.fillStyle = dial;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  fineGrain(ctx, cx - r, cy - r, r * 2, r * 2, { seed: 11, count: 0.002, dark: 0.08, light: 0.04 });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.94, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    ctx.lineWidth = i % 5 ? 1.2 : 3.5;
    const inner = i % 5 ? 0.88 : 0.84;
    line(ctx, cx + Math.cos(a) * r * inner, cy + Math.sin(a) * r * inner, cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94);
  }
}

// Zeiger aus gebläutem Stahl
function fancyHands(ctx, cx, cy, r, hour, minute) {
  const ha = ((hour % 12) + minute / 60) / 12 * Math.PI * 2;
  const ma = (minute / 60) * Math.PI * 2;
  const hand = (angle, length, width) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#1c2236';
    ctx.beginPath();
    ctx.moveTo(-width * 0.4, r * 0.12);
    ctx.lineTo(-width * 0.4, -length * 0.62);
    ctx.quadraticCurveTo(-width * 1.6, -length * 0.74, 0, -length);
    ctx.quadraticCurveTo(width * 1.6, -length * 0.74, width * 0.4, -length * 0.62);
    ctx.lineTo(width * 0.4, r * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  hand(ha, r * 0.52, 8);
  hand(ma, r * 0.8, 6);
  const g = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 9);
  g.addColorStop(0, '#fbe6a4');
  g.addColorStop(1, '#7a5a1a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fill();
}

// Messing-Druckknopf mit Gravur
function brassButton(ctx, spot, label) {
  const { x, y, w, h } = spot;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#f6de94');
  g.addColorStop(0.5, '#c49a40');
  g.addColorStop(1, '#6a4a14');
  ctx.fillStyle = g;
  roundedRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(60, 40, 8, 0.7)';
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 5, y + 5, w - 10, h - 10, 9);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 248, 220, 0.35)';
  ctx.fillRect(x + 12, y + 4, w - 24, 2);
  text(ctx, label, x + w / 2, y + 44, { font: `bold 22px ${PRINT}`, color: 'rgba(255, 240, 200, 0.6)', align: 'center' });
  text(ctx, label, x + w / 2 - 1, y + 43, { font: `bold 22px ${PRINT}`, color: '#3a2608', align: 'center' });
}

export function drawSetClock(ctx, which, minute, running) {
  const cuckoo = which === 'cuckoo';
  ctx.drawImage(cachedLayer(`w11-set-${which}`, (c) => paintSetClock(c, cuckoo)), 0, 0, 1280, 720);
  fancyFace(ctx, 640, 340, 170);
  // Minutenzahlen
  for (let m = 0; m < 60; m += 15) {
    const a = (m / 60) * Math.PI * 2 - Math.PI / 2;
    text(ctx, m === 0 ? '12' : String(m / 5), 640 + Math.cos(a) * 118, 340 + Math.sin(a) * 118 + 10, { font: `bold 30px ${SERIF}`, color: INK, align: 'center' });
  }
  fancyHands(ctx, 640, 340, 170, cuckoo ? 11 : 2, minute);
  glassGlare(ctx, 640, 340, 170);
  for (const spot of SET_SPOTS) brassButton(ctx, spot, spot.id === 'plus' ? '⟳ vor' : '⟲ zurück');
  // Anzeige der Minuten in einem kleinen Emailleschild
  ctx.fillStyle = '#efe6cf';
  roundedRect(ctx, 584, 568, 112, 50, 8);
  ctx.fill();
  ctx.strokeStyle = '#1c2a52';
  ctx.lineWidth = 2;
  roundedRect(ctx, 588, 572, 104, 42, 6);
  ctx.stroke();
  text(ctx, `:${String(minute).padStart(2, '0')}`, 640, 604, { font: `bold 30px ${PRINT}`, color: '#1c2a52', align: 'center' });
  text(ctx, cuckoo ? 'Kuckucksuhr – geht nur halb so schnell' : 'Standuhr – geht anderthalbmal so schnell', 640, 656, { font: `16px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  if (running) text(ctx, 'läuft erst nach dem nächsten Tunnel von hier los', 640, 30, { font: `italic 16px ${SERIF}`, color: '#f3e2b4', align: 'center' });
}

export function drawTickNote(ctx) {
  sheet(ctx, 380, 150, 520, 400, {
    angle: 0.02,
    inner: (c) => {
      text(c, 'Meine Uhren – nicht vergessen!', 260, 54, { font: `bold 24px ${HAND}`, align: 'center' });
      const rows = [
        'Standuhr: 1½-mal so schnell.',
        'Kuckucksuhr: halb so schnell.',
        'Beide schlagen zur vollen Stunde.',
        'Sie laufen los, wenn wir aus',
        'dem Tunnel kommen. Vorher stehen sie.',
        'Der Ruf: Rundenuhr auf dem roten Strich.',
      ];
      rows.forEach((row, i) => text(c, row, 36, 112 + i * 44, { font: `21px ${HAND}` }));
    },
  });
}

// Pendel der Standuhr – schwingt, wenn sie läuft
export function drawPendulum(ctx, running, time) {
  if (!running) return;
  glow(ctx, 276, 300, 30, '255, 220, 140', 0.25 + 0.15 * Math.abs(Math.sin(time * 3)));
}
