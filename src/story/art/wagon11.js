import { HAND, INK, PRINT, SERIF, drawPicture, glow, line, sheet, text, wood } from './common.js';

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

export function drawSetClock(ctx, which, minute, running) {
  const cuckoo = which === 'cuckoo';
  wood(ctx, 320, 40, 640, 620, cuckoo ? [120, 70, 30] : [84, 46, 22]);
  if (cuckoo) {
    ctx.fillStyle = '#5c2e12';
    ctx.beginPath();
    ctx.moveTo(400, 210);
    ctx.lineTo(640, 70);
    ctx.lineTo(880, 210);
    ctx.fill();
    ctx.fillStyle = '#e7c23a';
    ctx.beginPath();
    ctx.arc(640, 150, 18, 0, Math.PI * 2);
    ctx.fill();
  }
  face(ctx, 640, 340, 170);
  hands(ctx, 640, 340, 170, cuckoo ? 11 : 2, minute, null);
  // Minutenzahlen
  for (let m = 0; m < 60; m += 15) {
    const a = (m / 60) * Math.PI * 2 - Math.PI / 2;
    text(ctx, m === 0 ? '12' : String(m / 5), 640 + Math.cos(a) * 124, 340 + Math.sin(a) * 124 + 10, { font: `bold 28px ${SERIF}`, color: INK, align: 'center' });
  }
  for (const spot of SET_SPOTS) {
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    ctx.strokeStyle = '#c9a24c';
    ctx.lineWidth = 3;
    ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
    text(ctx, spot.id === 'plus' ? '⟳ vor' : '⟲ zurück', spot.x + spot.w / 2, spot.y + 44, { font: `bold 22px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  }
  text(ctx, `:${String(minute).padStart(2, '0')}`, 640, 600, { font: `bold 30px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  text(ctx, cuckoo ? 'Kuckucksuhr – geht nur halb so schnell' : 'Standuhr – geht anderthalbmal so schnell', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  if (running) text(ctx, 'läuft erst nach dem nächsten Tunnel von hier los', 640, 104, { font: `italic 16px ${SERIF}`, color: '#e9d8b0', align: 'center' });
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
