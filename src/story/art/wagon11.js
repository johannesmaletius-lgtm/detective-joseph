import { HAND, INK, PRINT, SERIF, clockHand, drawPicture, glow, handCap, line, rivet, sheet, text, wood } from './common.js';

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
  ctx.fillStyle = 'rgba(20, 10, 4, 0.7)';
  ctx.fillRect(420, 690, 440, 26);
  text(ctx, 'Herrn Ticks Uhren. Welche geht mit dem Mond?', 640, 709, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
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
  ctx.save();
  // Messingring
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  const bezel = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  bezel.addColorStop(0, '#f6dc8e');
  bezel.addColorStop(0.5, '#a9782a');
  bezel.addColorStop(1, '#5e3d10');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(60, 36, 6, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  // vergilbtes Zifferblatt
  const dial = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  dial.addColorStop(0, '#fbf3dc');
  dial.addColorStop(0.75, color);
  dial.addColorStop(1, '#c9b386');
  ctx.fillStyle = dial;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Minutenring
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.94, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const inner = i % 5 === 0 ? 0.8 : 0.86;
    ctx.lineWidth = i % 5 === 0 ? 3 : 1.2;
    line(ctx, cx + Math.cos(a) * r * inner, cy + Math.sin(a) * r * inner, cx + Math.cos(a) * r * 0.94, cy + Math.sin(a) * r * 0.94);
  }
  ctx.restore();
}

// Glas über dem Zifferblatt: ein schräger Lichtschein
function glass(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const shine = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.2, cy + r * 0.2);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  shine.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
  shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

function hands(ctx, cx, cy, r, hour, minute, second) {
  const ha = ((hour % 12) + minute / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  const ma = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  clockHand(ctx, cx, cy, ha + Math.PI / 2, r * 0.52, Math.max(6, r * 0.09));
  clockHand(ctx, cx, cy, ma + Math.PI / 2, r * 0.8, Math.max(4, r * 0.06));
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
export function drawRoundClock(ctx, cx, cy, r, progress, { big = false, bare = false } = {}) {
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
    text(ctx, 'Tunnel', cx, cy - r - 18, { font: `bold 20px ${PRINT}`, color: '#f3e2b4', align: 'center' });
    text(ctx, 'Ruf', cx + Math.cos(ca) * (r + 34), cy + Math.sin(ca) * (r + 34) + 6, { font: `bold 20px ${HAND}`, color: '#ff8a70', align: 'center' });
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

export function drawRoundClockCard(ctx, progress) {
  wood(ctx, 340, 70, 600, 580, [104, 62, 30]);
  drawRoundClock(ctx, 640, 350, 210, progress, { big: true });
  text(ctx, 'Ein Zeiger, einmal herum pro Runde. Oben der Tunnel.', 640, 630, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Standuhr / Kuckucksuhr stellen
export const SET_SPOTS = [
  { id: 'plus', x: 760, y: 560, w: 120, h: 70, label: 'Minutenzeiger vor (5 Minuten)' },
  { id: 'minus', x: 400, y: 560, w: 120, h: 70, label: 'Minutenzeiger zurück (5 Minuten)' },
];

const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function leaf(ctx, x, y, size, angle, color = '#4a2610') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.5, -size * 0.35, size, 0);
  ctx.quadraticCurveTo(size * 0.5, size * 0.35, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.25)';
  ctx.lineWidth = 1;
  line(ctx, 2, 0, size - 4, 0);
  ctx.restore();
}

function drawCuckooHouse(ctx) {
  // Gehäuse
  const body = ctx.createLinearGradient(430, 0, 850, 0);
  body.addColorStop(0, '#4a2810');
  body.addColorStop(0.5, '#7a4820');
  body.addColorStop(1, '#3e200c');
  ctx.fillStyle = body;
  ctx.fillRect(440, 200, 400, 340);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  for (let x = 460; x < 840; x += 34) line(ctx, x, 210, x, 535);
  // Giebel mit Vogeltürchen
  ctx.fillStyle = '#6a3c18';
  ctx.beginPath();
  ctx.moveTo(440, 214);
  ctx.lineTo(640, 92);
  ctx.lineTo(840, 214);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a0d05';
  ctx.beginPath();
  ctx.roundRect(616, 120, 48, 56, [24, 24, 3, 3]);
  ctx.fill();
  // Kuckuck schaut halb heraus
  ctx.fillStyle = '#8a5a2a';
  ctx.beginPath();
  ctx.ellipse(640, 156, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e0a83a';
  ctx.beginPath();
  ctx.moveTo(652, 152);
  ctx.lineTo(664, 156);
  ctx.lineTo(652, 160);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(645, 151, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c99a4a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(616, 120, 48, 56, [24, 24, 3, 3]);
  ctx.stroke();
  // Dach aus Schindeln
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(640, 70);
    ctx.scale(side, 1);
    ctx.rotate(Math.atan2(150, 270));
    ctx.fillStyle = '#3a1d0a';
    ctx.fillRect(-6, -8, 312, 42);
    for (let row = 0; row < 2; row++) {
      for (let k = 0; k < 13; k++) {
        ctx.fillStyle = (k + row) % 2 ? '#5a3012' : '#4a260e';
        ctx.beginPath();
        ctx.roundRect(k * 24 + row * 12, row * 18 - 6, 24, 24, [0, 0, 10, 10]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  // geschnitzte Blätter an der Traufe und ein Hirschgeweih-Andeutung oben
  for (let i = 0; i < 6; i++) {
    leaf(ctx, 400 + i * 10, 240 + i * 10, 40, 0.9 + i * 0.2);
    leaf(ctx, 880 - i * 10, 240 + i * 10, 40, Math.PI - 0.9 - i * 0.2);
  }
  for (const a of [-2.2, -1.9, -1.2, -0.9]) leaf(ctx, 640, 74, 46, a, '#5a3012');
  // Pendel unten
  ctx.strokeStyle = '#c99a4a';
  ctx.lineWidth = 3;
  line(ctx, 640, 520, 640, 548);
  ctx.fillStyle = '#d9ae55';
  ctx.beginPath();
  ctx.ellipse(640, 552, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrandfatherHood(ctx) {
  // Haube der Standuhr: Bogen, Säulen, Krone
  const body = ctx.createLinearGradient(440, 0, 840, 0);
  body.addColorStop(0, '#2a1508');
  body.addColorStop(0.5, '#5a2e12');
  body.addColorStop(1, '#241206');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(440, 560);
  ctx.lineTo(440, 210);
  ctx.arc(640, 210, 200, Math.PI, 0);
  ctx.lineTo(840, 560);
  ctx.closePath();
  ctx.fill();
  // Krone
  ctx.fillStyle = '#3a1d0a';
  ctx.beginPath();
  ctx.moveTo(420, 120);
  ctx.quadraticCurveTo(540, 30, 610, 60);
  ctx.lineTo(670, 60);
  ctx.quadraticCurveTo(740, 30, 860, 120);
  ctx.lineTo(850, 140);
  ctx.lineTo(430, 140);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9ae55';
  for (const x of [430, 640, 850]) {
    ctx.beginPath();
    ctx.arc(x, x === 640 ? 46 : 112, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // Säulen
  for (const x of [452, 812]) {
    const col = ctx.createLinearGradient(x, 0, x + 18, 0);
    col.addColorStop(0, '#2a1508');
    col.addColorStop(0.5, '#8a5a2a');
    col.addColorStop(1, '#2a1508');
    ctx.fillStyle = col;
    ctx.fillRect(x, 180, 18, 370);
    ctx.fillStyle = '#d9ae55';
    ctx.fillRect(x - 3, 176, 24, 8);
    ctx.fillRect(x - 3, 540, 24, 8);
  }
  // Messingplatte hinter dem Zifferblatt mit Zwickel-Ornamenten
  const plate = ctx.createLinearGradient(480, 160, 800, 520);
  plate.addColorStop(0, '#e9c46a');
  plate.addColorStop(1, '#8a6020');
  ctx.fillStyle = plate;
  ctx.fillRect(482, 162, 316, 360);
  for (const [x, y] of [[500, 180], [780, 180], [500, 504], [780, 504]]) {
    ctx.fillStyle = 'rgba(80, 50, 10, 0.5)';
    for (let k = 0; k < 5; k++) leaf(ctx, x, y, 26, (k / 5) * Math.PI * 2, 'rgba(90, 56, 12, 0.55)');
    rivet(ctx, x, y, 4, { tone: '#d9ae55' });
  }
}

export function drawSetClock(ctx, which, minute, running) {
  const cuckoo = which === 'cuckoo';
  wood(ctx, 320, 40, 640, 620, cuckoo ? [92, 60, 34] : [70, 40, 22]);
  glow(ctx, 640, 260, 420, '255, 210, 140', 0.14);
  const cy = cuckoo ? 362 : 342;
  const r = cuckoo ? 148 : 150;
  if (cuckoo) drawCuckooHouse(ctx);
  else drawGrandfatherHood(ctx);
  face(ctx, 640, cy, r, cuckoo ? '#f1e6c8' : '#ece0bf');
  // alle zwölf Zahlen (Kuckucksuhr arabisch, Standuhr römisch)
  for (let h = 0; h < 12; h++) {
    const a = (h / 12) * Math.PI * 2 - Math.PI / 2;
    const label = cuckoo ? String(h || 12) : ROMAN[h];
    const size = cuckoo ? 26 : (label.length > 2 ? 17 : 21);
    text(ctx, label, 640 + Math.cos(a) * r * 0.66, cy + Math.sin(a) * r * 0.66 + size * 0.36, { font: `bold ${size}px ${SERIF}`, color: INK, align: 'center' });
  }
  if (!cuckoo) text(ctx, 'TICK · UHRMACHER', 640, cy + r * 0.38, { font: `9px ${PRINT}`, color: 'rgba(43, 33, 24, 0.7)', align: 'center' });
  hands(ctx, 640, cy, r, cuckoo ? 11 : 2, minute, null);
  handCap(ctx, 640, cy, 8);
  glass(ctx, 640, cy, r);
  for (const spot of SET_SPOTS) {
    const plate = ctx.createLinearGradient(spot.x, spot.y, spot.x, spot.y + spot.h);
    plate.addColorStop(0, '#4a2e16');
    plate.addColorStop(1, '#24150a');
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.roundRect(spot.x, spot.y, spot.w, spot.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#c9a24c';
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, spot.id === 'plus' ? '⟳ vor' : '⟲ zurück', spot.x + spot.w / 2, spot.y + 44, { font: `bold 22px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  }
  ctx.fillStyle = 'rgba(20, 10, 4, 0.75)';
  ctx.beginPath();
  ctx.roundRect(586, 570, 108, 44, 8);
  ctx.fill();
  text(ctx, `:${String(minute).padStart(2, '0')}`, 640, 602, { font: `bold 30px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  text(ctx, cuckoo ? 'Kuckucksuhr – geht nur halb so schnell' : 'Standuhr – geht anderthalbmal so schnell', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  if (running) {
    ctx.fillStyle = 'rgba(20, 10, 4, 0.65)';
    ctx.fillRect(420, 22, 440, 30);
    text(ctx, 'läuft erst nach dem nächsten Tunnel von hier los', 640, 43, { font: `italic 16px ${SERIF}`, color: '#e9d8b0', align: 'center' });
  }
}

// Herrn Ticks Zettel über seine Uhren
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
