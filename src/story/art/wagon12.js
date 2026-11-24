import { HAND, INK, PRINT, SERIF, cached, contactShadow, fineGrain, glow, line, plank, roundedRect, seeded, sheet, smudge, text, vignette, wood } from './common.js';

// Gezeichnetes für Wagen 12 (Musiksalon): das Notenblatt (mit Bleistiftkreuzen), die Schallplatten,
// das Klopfen im Takt und die Klaviertasten.

// Tonhöhe als Stufe ab dem e' (unterste Linie): 0 = e', 1 = f', 2 = g', 3 = a', 4 = h', 5 = c'', 6 = d'', 7 = e'', 8 = f''
export const NOTES = {
  G: { step: 2, freq: 392.0 },
  A: { step: 3, freq: 440.0 },
  H: { step: 4, freq: 493.9 },
  C: { step: 5, freq: 523.3 },
  D: { step: 6, freq: 587.3 },
  Es: { step: 7, freq: 622.3, flat: true },
  E: { step: 7, freq: 659.3 },
  F: { step: 8, freq: 698.5 },
};

// Das Lied: vier Takte. mark = Bleistiftkreuz darüber. Takt 4 ist verwischt.
export const SONG = [
  [{ n: 'G' }, { n: 'A' }, { n: 'H' }, { n: 'D' }],
  [{ n: 'H', mark: true }, { n: 'C' }, { n: 'A', mark: true }, { n: 'G' }],
  [{ n: 'Es', mark: true }, { n: 'F' }, { n: 'E', mark: true }, { n: 'D' }],
  [{ n: 'D' }, { n: 'H' }, { n: 'A' }, { n: 'G' }],
];
export const ENDING = SONG[3].map((note) => note.n); // D H A G – der Anfang rückwärts
export const MESSAGE = 'HASE';                       // die Kreuze: H, A, Es (= S), E

// ---------------------------------------------------------------- Notenblatt
export function drawScore(ctx, { pieces = 3, solvedEnding = false } = {}) {
  sheet(ctx, 150, 80, 980, 560, {
    angle: -0.01,
    color: '#f3ead2',
    shade: '#ddcfa8',
    inner: (c) => {
      text(c, 'Für die Weihnachtsfeier – Zug 24', 490, 56, { font: `italic 28px ${SERIF}`, align: 'center' });
      text(c, 'H. Moll', 900, 92, { font: `18px ${HAND}`, align: 'right' });
      drawStaff(c, 60, 170, 860, { solvedEnding });
      // Risse zwischen den drei Stücken
      c.strokeStyle = 'rgba(120, 90, 50, 0.55)';
      c.lineWidth = 2;
      for (const x of [330, 640]) {
        c.beginPath();
        for (let y = 0; y <= 560; y += 12) c.lineTo(x + ((y / 12) % 2 ? 6 : -6), y);
        c.stroke();
      }
      text(c, 'H statt B!', 120, 420, { font: `22px ${HAND}`, color: '#555' });
      text(c, 'Es = S', 120, 452, { font: `22px ${HAND}`, color: '#555' });
      text(c, 'Im Takt der Räder spielen.', 560, 460, { font: `22px ${HAND}`, color: '#555' });
    },
  });
  if (pieces < 3) return;
}

function drawStaff(ctx, x, y, width, { solvedEnding }) {
  const gap = 22; // Abstand der Notenlinien
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) line(ctx, x, y + i * gap, x + width, y + i * gap);
  // Violinschlüssel (vereinfacht)
  trebleClef(ctx, x + 34, y, gap);
  const barWidth = (width - 90) / 4;
  for (let b = 0; b <= 4; b++) {
    ctx.lineWidth = b === 4 ? 4 : 1.6;
    line(ctx, x + 90 + b * barWidth, y, x + 90 + b * barWidth, y + gap * 4);
  }
  SONG.forEach((bar, b) => {
    bar.forEach((note, i) => {
      const info = NOTES[note.n];
      const nx = x + 90 + b * barWidth + (i + 0.6) * (barWidth / 4.3);
      const ny = y + gap * 4 - info.step * (gap / 2);
      if (info.flat) text(ctx, '♭', nx - 22, ny + 8, { font: `26px ${SERIF}` });
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(nx, ny, 9, 6.5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      if (info.step >= 4) line(ctx, nx - 8, ny + 2, nx - 8, ny + 46);
      else line(ctx, nx + 8, ny - 2, nx + 8, ny - 46);
      if (note.mark) {
        ctx.strokeStyle = '#6b6b6b';
        ctx.lineWidth = 2;
        const my = y - 30;
        line(ctx, nx - 7, my - 7, nx + 7, my + 7);
        line(ctx, nx + 7, my - 7, nx - 7, my + 7);
        ctx.strokeStyle = INK;
      }
    });
  });
  if (!solvedEnding) {
    // der letzte Takt ist verwischt
    const bx = x + 90 + 3 * barWidth;
    smudge(ctx, bx - 10, y - 50, barWidth + 30, gap * 4 + 110, 'rgba(110, 95, 70, 0.9)');
    smudge(ctx, bx + 10, y - 30, barWidth - 10, gap * 4 + 60, 'rgba(130, 112, 84, 0.95)');
    text(ctx, '?', bx + barWidth / 2, y + gap * 2 + 12, { font: `bold 40px ${HAND}`, color: 'rgba(60, 40, 20, 0.6)', align: 'center' });
  }
}

// Ein einfacher Violinschlüssel aus Bögen
function trebleClef(ctx, x, y, gap) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + gap * 6);
  ctx.bezierCurveTo(x + 16, y + gap * 5, x + 6, y - gap * 1.5, x + 2, y - gap * 1.2);
  ctx.bezierCurveTo(x - 10, y - gap * 0.4, x + 18, y + gap * 1.2, x + 16, y + gap * 2.6);
  ctx.bezierCurveTo(x + 14, y + gap * 4.2, x - 14, y + gap * 4, x - 12, y + gap * 2.8);
  ctx.bezierCurveTo(x - 10, y + gap * 1.6, x + 10, y + gap * 1.8, x + 8, y + gap * 3);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x - 2, y + gap * 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- Schallplatten
export const SLEEVES = [
  { id: 'dance', title: 'Tanzabend im Speisewagen', color: '#8a2f2a' },
  { id: 'xmas', title: 'Weihnachtsfeier · Zug 24', color: '#2f5a3a' },
  { id: 'signal', title: 'Das Lied vom Bahnwärter', color: '#2c4a7a' },
  { id: 'waltz', title: 'Ringbahn-Walzer', color: '#7a5a2a' },
  { id: 'night', title: 'Nachtzug-Serenade', color: '#4a2f6a' },
];

export function sleeveSpots() {
  return SLEEVES.map((sleeve, i) => ({ ...sleeve, x: 190 + i * 186, y: 210, w: 170, h: 250, label: `„${sleeve.title}“` }));
}

export function drawRecords(ctx, taken) {
  ctx.drawImage(cached(`w12-records-${taken ? 1 : 0}`, 1280, 720, (c) => paintRecords(c, taken)), 0, 0);
}

function paintRecords(ctx, taken) {
  // Plattenkiste aus Mahagoni
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#2a0e0a';
  ctx.fillRect(160, 120, 960, 460);
  ctx.restore();
  for (let i = 0; i < 6; i++) plank(ctx, 160, 120 + i * 77, 960, 77, { tone: [96, 38, 28], seed: 120 + i, knots: 1 });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(160, 120, 960, 460);
  for (const spot of sleeveSpots()) drawSleeve(ctx, spot, taken && spot.id === 'xmas');
  // vordere Kante der Kiste
  plank(ctx, 160, 470, 960, 110, { tone: [110, 44, 30], seed: 131, knots: 2 });
  ctx.fillStyle = 'rgba(255, 220, 170, 0.12)';
  ctx.fillRect(160, 470, 960, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(160, 474, 960, 10);
  // Messingschildchen
  roundedRect(ctx, 480, 506, 320, 38, 5);
  const brass = ctx.createLinearGradient(0, 506, 0, 544);
  brass.addColorStop(0, '#f0d488');
  brass.addColorStop(1, '#8a6424');
  ctx.fillStyle = brass;
  ctx.fill();
  text(ctx, 'Herrn Molls Schallplatten', 640, 531, { font: `bold italic 18px ${SERIF}`, color: '#3a2a10', align: 'center' });
  vignette(ctx, 160, 120, 960, 460, 0.4);
}

// Eine Plattenhülle mit kleinem Bild, oben schaut die Platte heraus
function drawSleeve(ctx, spot, empty) {
  const { x, y, w } = spot;
  const h = 262;
  const cx = x + w / 2;
  if (!empty) {
    // Schallplatte
    const disc = ctx.createRadialGradient(cx, y + 24, 8, cx, y + 24, 76);
    disc.addColorStop(0, '#2a2a2a');
    disc.addColorStop(1, '#0c0c0c');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, y + 24, 76, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 1;
    for (let r = 34; r < 76; r += 4) {
      ctx.beginPath();
      ctx.arc(cx, y + 24, r, Math.PI, 0);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, y + 24, 60, Math.PI * 1.15, Math.PI * 1.35);
    ctx.stroke();
    ctx.fillStyle = spot.color;
    ctx.beginPath();
    ctx.arc(cx, y + 24, 26, Math.PI, 0);
    ctx.fill();
  }
  // Hülle aus Karton
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = spot.color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  const shade = ctx.createLinearGradient(x, y, x + w, y + h);
  shade.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = shade;
  ctx.fillRect(x, y, w, h);
  fineGrain(ctx, x, y, w, h, { seed: x, count: 0.02, dark: 0.15, light: 0.1 });
  // Ringabrieb der Platte auf dem Karton
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, y + 104, 64, 0, Math.PI * 2);
  ctx.stroke();
  // Bildchen
  ctx.save();
  roundedRect(ctx, x + 18, y + 22, w - 36, 132, 6);
  ctx.clip();
  ctx.fillStyle = 'rgba(245, 232, 200, 0.92)';
  ctx.fillRect(x + 18, y + 22, w - 36, 132);
  drawSleeveArt(ctx, spot.id, x + 18, y + 22, w - 36, 132, spot.color);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40, 20, 10, 0.5)';
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 18, y + 22, w - 36, 132, 6);
  ctx.stroke();
  // Titel
  const words = spot.title.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > 15) {
      lines.push(current);
      current = word;
    } else current = `${current} ${word}`.trim();
  }
  lines.push(current);
  lines.forEach((row, i) => text(ctx, row, cx, y + 186 + i * 22, { font: `bold 16px ${SERIF}`, color: '#f6ecd2', align: 'center' }));
  // abgestoßene Ecken
  ctx.fillStyle = 'rgba(240, 225, 190, 0.35)';
  ctx.beginPath();
  ctx.moveTo(x + w, y + h);
  ctx.lineTo(x + w - 14, y + h);
  ctx.lineTo(x + w, y + h - 14);
  ctx.fill();
  if (empty) text(ctx, '(leer)', cx, y + 244, { font: `italic 15px ${SERIF}`, color: '#f3e8cc', align: 'center' });
}

function drawSleeveArt(ctx, id, x, y, w, h, color) {
  const cx = x + w / 2;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  if (id === 'dance') {
    // Kerzen und ein tanzendes Paar als Schattenriss
    for (const kx of [x + 22, x + w - 22]) {
      ctx.fillRect(kx - 4, y + 60, 8, 50);
      glow(ctx, kx, y + 54, 22, '255, 200, 90', 0.6);
      ctx.fillStyle = '#e8a030';
      ctx.beginPath();
      ctx.ellipse(kx, y + 52, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    ctx.arc(cx - 10, y + 44, 9, 0, Math.PI * 2);
    ctx.arc(cx + 12, y + 40, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 22, y + 118);
    ctx.lineTo(cx - 10, y + 56);
    ctx.lineTo(cx + 2, y + 118);
    ctx.fill();
    ctx.fillRect(cx + 6, y + 52, 12, 66);
  } else if (id === 'xmas') {
    // Tannenbaum und eine kleine Lok
    ctx.beginPath();
    ctx.moveTo(cx, y + 12);
    ctx.lineTo(cx - 34, y + 76);
    ctx.lineTo(cx + 34, y + 76);
    ctx.fill();
    ctx.fillRect(cx - 5, y + 76, 10, 10);
    ctx.fillStyle = '#d8a020';
    ctx.beginPath();
    ctx.arc(cx, y + 12, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b8302a';
    for (const [bx, by] of [[-12, 46], [14, 58], [4, 32], [-20, 66]]) {
      ctx.beginPath();
      ctx.arc(cx + bx, y + by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x + 10, y + 100, w - 20, 3);
    ctx.fillRect(cx - 40, y + 84, 50, 16);
    ctx.fillRect(cx + 14, y + 78, 24, 22);
    ctx.fillRect(cx - 34, y + 74, 8, 10);
    text(ctx, '24', cx + 26, y + 95, { font: `bold 11px ${PRINT}`, color: '#f3e8cc', align: 'center' });
  } else if (id === 'signal') {
    // Signallaterne am Bahnübergang
    ctx.fillRect(cx - 3, y + 30, 6, 90);
    ctx.fillRect(cx - 22, y + 30, 44, 34);
    ctx.fillStyle = '#e8c040';
    ctx.beginPath();
    ctx.arc(cx - 9, y + 47, 7, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, cx - 9, y + 47, 26, '255, 210, 90', 0.6);
    ctx.fillStyle = '#c03028';
    ctx.beginPath();
    ctx.arc(cx + 9, y + 47, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    line(ctx, x + 8, y + 118, x + w - 8, y + 118);
  } else if (id === 'waltz') {
    // Kreisgleis mit Note in der Mitte
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, y + 66, 46, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      line(ctx, cx + Math.cos(a) * 40, y + 66 + Math.sin(a) * 34, cx + Math.cos(a) * 52, y + 66 + Math.sin(a) * 46);
    }
    text(ctx, '♫', cx, y + 80, { font: `bold 38px ${SERIF}`, color, align: 'center' });
  } else {
    // Mond über einem Nachtzug
    ctx.fillStyle = '#1e1a3a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#f0e4b0';
    ctx.beginPath();
    ctx.arc(cx + 24, y + 36, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1a3a';
    ctx.beginPath();
    ctx.arc(cx + 32, y + 30, 16, 0, Math.PI * 2);
    ctx.fill();
    const r = seeded(id.length * 7);
    ctx.fillStyle = '#f6efd0';
    for (let k = 0; k < 18; k++) ctx.fillRect(x + r() * w, y + r() * 70, 2, 2);
    ctx.fillStyle = '#0c0a1a';
    ctx.fillRect(x, y + 104, w, 28);
    for (let k = 0; k < 4; k++) {
      ctx.fillRect(x + 8 + k * 32, y + 86, 28, 18);
      ctx.fillStyle = '#f0c860';
      ctx.fillRect(x + 12 + k * 32, y + 90, 8, 6);
      ctx.fillRect(x + 24 + k * 32, y + 90, 8, 6);
      ctx.fillStyle = '#0c0a1a';
    }
  }
}

// ---------------------------------------------------------------- Im Takt klopfen
export const KNOCK_SPOT = [{ id: 'knock', x: 380, y: 300, w: 520, h: 240, label: 'Klopfen' }];

export function drawKnocking(ctx, { sinceJoint, hits, needed }) {
  ctx.drawImage(cached('w12-lid', 1280, 720, paintPianoLid), 0, 0);
  // Wasserglas, das bei jedem Schienenstoß zittert
  const ring = Math.max(0, 1 - sinceJoint * 3);
  const jiggle = Math.sin(sinceJoint * 60) * ring * 2;
  ctx.save();
  ctx.translate(640 + jiggle, 300);
  contactShadow(ctx, 6, 22, 52, 10, 0.5);
  // Glaskörper
  const glass = ctx.createLinearGradient(-38, 0, 38, 0);
  glass.addColorStop(0, 'rgba(220, 240, 250, 0.45)');
  glass.addColorStop(0.3, 'rgba(255, 255, 255, 0.15)');
  glass.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
  glass.addColorStop(1, 'rgba(200, 225, 235, 0.4)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(-38, -80);
  ctx.lineTo(38, -80);
  ctx.lineTo(32, 20);
  ctx.lineTo(-32, 20);
  ctx.closePath();
  ctx.fill();
  // Wasser
  ctx.fillStyle = 'rgba(170, 210, 230, 0.35)';
  ctx.beginPath();
  ctx.moveTo(-36, -40);
  ctx.lineTo(36, -40);
  ctx.lineTo(32, 18);
  ctx.lineTo(-32, 18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(235, 248, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -80, 38, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 20, 32, 6, 0, 0, Math.PI);
  ctx.stroke();
  line(ctx, -38, -80, -32, 20);
  line(ctx, 38, -80, 32, 20);
  // Ringe auf dem Wasser, wenn der Schienenstoß kommt
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + ring * 0.65})`;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -40, 8 + i * 9 + ring * 10, 2.5 + i * 2 + ring * 1.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(-28, -70, 5, 80);
  ctx.restore();
  // Fortschritt: kleine Messingknöpfe
  for (let i = 0; i < needed; i++) {
    const x = 640 - (needed - 1) * 26 + i * 52;
    const on = i < hits;
    if (on) glow(ctx, x, 580, 30, '255, 210, 110', 0.45);
    const g = ctx.createRadialGradient(x - 4, 576, 1, x, 580, 13);
    g.addColorStop(0, on ? '#fff2b0' : '#6a5a40');
    g.addColorStop(1, on ? '#b88a20' : '#2a2016');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, 580, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintPianoLid(ctx) {
  // Holzrahmen
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, 300, 140, 680, 470, 18);
  ctx.fillStyle = '#1a0e08';
  ctx.fill();
  ctx.restore();
  // schwarzer Klavierlack mit Spiegelungen
  roundedRect(ctx, 320, 160, 640, 430, 12);
  const lacquer = ctx.createLinearGradient(320, 160, 960, 590);
  lacquer.addColorStop(0, '#2a1c16');
  lacquer.addColorStop(0.5, '#0c0806');
  lacquer.addColorStop(1, '#1e1410');
  ctx.fillStyle = lacquer;
  ctx.fill();
  ctx.save();
  roundedRect(ctx, 320, 160, 640, 430, 12);
  ctx.clip();
  // breiter Lichtstreifen vom Kronleuchter
  ctx.fillStyle = 'rgba(255, 230, 190, 0.07)';
  ctx.beginPath();
  ctx.moveTo(470, 160);
  ctx.lineTo(560, 160);
  ctx.lineTo(380, 590);
  ctx.lineTo(320, 590);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 230, 190, 0.04)';
  ctx.beginPath();
  ctx.moveTo(600, 160);
  ctx.lineTo(630, 160);
  ctx.lineTo(450, 590);
  ctx.lineTo(430, 590);
  ctx.closePath();
  ctx.fill();
  // Kronleuchter-Lichter als Spiegelpunkte
  const r = seeded(12);
  for (let i = 0; i < 14; i++) glow(ctx, 760 + r() * 140, 190 + r() * 60, 6 + r() * 8, '255, 230, 170', 0.5);
  fineGrain(ctx, 320, 160, 640, 430, { seed: 121, count: 0.004, dark: 0.1, light: 0.05 });
  ctx.restore();
  // Goldfaden-Einlage am Rand
  ctx.strokeStyle = 'rgba(200, 160, 70, 0.7)';
  ctx.lineWidth = 2;
  roundedRect(ctx, 336, 176, 608, 398, 8);
  ctx.stroke();
  // Scharnier unten
  ctx.fillStyle = '#b8903a';
  for (const hx of [420, 860]) ctx.fillRect(hx - 30, 586, 60, 8);
  text(ctx, 'Im Takt der Schienenstöße auf den Deckel klopfen', 640, 470, { font: `22px ${HAND}`, color: '#e9d8b0', align: 'center' });
  text(ctx, '(das Wasser im Glas zittert bei jedem Stoß)', 640, 500, { font: `italic 15px ${SERIF}`, color: 'rgba(233, 216, 176, 0.6)', align: 'center' });
}

// ---------------------------------------------------------------- Klaviertasten
const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C', 'D', 'E', 'F', 'G'];
const WHITE_FREQ = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 698.5, 784.0];
const KEY = { x: 160, y: 250, w: 80, h: 320 };

export function keySpots() {
  return WHITE.map((name, i) => ({ id: `k${i}`, name, freq: WHITE_FREQ[i], x: KEY.x + i * KEY.w, y: KEY.y + 150, w: KEY.w, h: KEY.h - 150, label: name, quiet: true }));
}

export function drawKeyboard(ctx, { pressed = null, pressAge = 1, played = [] } = {}) {
  ctx.drawImage(cached('w12-piano', 1060, 520, paintPianoCase), 110, 120);
  // Notenzettel auf dem Pult: was schon gespielt ist
  text(ctx, played.length ? played.join(' – ') : 'Wie endet das Lied?', 640, 196, { font: `26px ${HAND}`, color: '#2b2118', align: 'center' });
  // weiße Tasten
  WHITE.forEach((name, i) => {
    const x = KEY.x + i * KEY.w;
    const down = pressed === i && pressAge < 0.25;
    ctx.drawImage(cached(`w12-white-${down ? 'down' : 'up'}`, KEY.w, KEY.h + 14, (c) => paintWhiteKey(c, down)), x, KEY.y);
    text(ctx, name, x + KEY.w / 2, KEY.y + KEY.h - 22 + (down ? 4 : 0), { font: `bold 19px ${SERIF}`, color: 'rgba(90, 78, 58, 0.85)', align: 'center' });
  });
  // schwarze Tasten (nur zur Zierde)
  const black = cached('w12-black', 50, 200, paintBlackKey);
  WHITE.forEach((name, i) => {
    if (i === WHITE.length - 1 || name === 'E' || name === 'H') return;
    ctx.drawImage(black, KEY.x + (i + 1) * KEY.w - 25, KEY.y - 2);
  });
  // Schatten der Tastenklappe auf den Tasten
  const shade = ctx.createLinearGradient(0, KEY.y, 0, KEY.y + 26);
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shade;
  ctx.fillRect(KEY.x, KEY.y, KEY.w * WHITE.length, 26);
}

// Gehäuse des Klaviers: poliertes Mahagoni, Notenpult mit Notenzettel, rote Filzleiste, Kerzenleuchter
function paintPianoCase(c) {
  // Korpus
  const body = c.createLinearGradient(0, 0, 0, 520);
  body.addColorStop(0, '#2a120a');
  body.addColorStop(0.5, '#3d1a0c');
  body.addColorStop(1, '#1c0b05');
  c.fillStyle = body;
  roundedRect(c, 0, 0, 1060, 520, 18);
  c.fill();
  plank(c, 14, 14, 1032, 96, { tone: [74, 30, 14], seed: 12, knots: 0 });
  // Lack-Glanz
  const gloss = c.createLinearGradient(0, 14, 0, 110);
  gloss.addColorStop(0, 'rgba(255, 220, 180, 0.22)');
  gloss.addColorStop(0.3, 'rgba(255, 220, 180, 0.04)');
  gloss.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  c.fillStyle = gloss;
  c.fillRect(14, 14, 1032, 96);
  // Intarsien-Linie
  c.strokeStyle = 'rgba(214, 170, 90, 0.55)';
  c.lineWidth = 1.5;
  roundedRect(c, 24, 22, 1012, 80, 8);
  c.stroke();
  // Notenzettel auf dem Pult
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 10;
  c.shadowOffsetY = 4;
  const paper = c.createLinearGradient(0, 30, 0, 98);
  paper.addColorStop(0, '#f6eed8');
  paper.addColorStop(1, '#e1d2ac');
  c.fillStyle = paper;
  c.translate(530, 64);
  c.rotate(-0.01);
  c.fillRect(-230, -38, 460, 74);
  c.restore();
  c.strokeStyle = 'rgba(43, 33, 24, 0.22)';
  c.lineWidth = 1;
  for (let k = 0; k < 5; k++) line(c, 316, 34 + k * 4, 744, 34 + k * 4);
  for (let k = 0; k < 5; k++) line(c, 316, 82 + k * 4, 744, 82 + k * 4);
  // Messing-Leuchter links und rechts mit Kerzenschein
  for (const x of [130, 930]) {
    const g = c.createRadialGradient(x, 40, 2, x, 50, 110);
    g.addColorStop(0, 'rgba(255, 210, 130, 0.5)');
    g.addColorStop(1, 'rgba(255, 210, 130, 0)');
    c.fillStyle = g;
    c.fillRect(x - 110, 0, 220, 130);
    const brass = c.createLinearGradient(x - 20, 0, x + 20, 0);
    brass.addColorStop(0, '#7a5418');
    brass.addColorStop(0.5, '#f0d488');
    brass.addColorStop(1, '#7a5418');
    c.fillStyle = brass;
    c.beginPath();
    c.ellipse(x, 92, 26, 7, 0, 0, Math.PI * 2);
    c.fill();
    c.fillRect(x - 4, 60, 8, 32);
    c.fillStyle = '#f3ead4';
    c.fillRect(x - 6, 28, 12, 34);
    c.fillStyle = '#ffd36b';
    c.beginPath();
    c.ellipse(x, 20, 4, 9, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff6d0';
    c.beginPath();
    c.ellipse(x, 22, 2, 4, 0, 0, Math.PI * 2);
    c.fill();
  }
  // Namensleiste (aufgeklappter Tastendeckel) und rote Filzleiste
  const board = c.createLinearGradient(0, 110, 0, 130);
  board.addColorStop(0, '#5a2410');
  board.addColorStop(1, '#1e0c05');
  c.fillStyle = board;
  c.fillRect(40, 110, 980, 20);
  text(c, 'Ringbahn  ·  Salonklavier', 530, 125, { font: `italic 13px ${SERIF}`, color: 'rgba(230, 190, 110, 0.85)', align: 'center' });
  c.fillStyle = '#7a1616';
  c.fillRect(48, 126, 964, 4);
  // Wangen links und rechts der Tasten
  for (const x of [8, 1012]) {
    const cheek = c.createLinearGradient(x, 0, x + 40, 0);
    cheek.addColorStop(0, '#1c0b05');
    cheek.addColorStop(0.5, '#4a1e0c');
    cheek.addColorStop(1, '#1c0b05');
    c.fillStyle = cheek;
    roundedRect(c, x, 110, 40, 360, 8);
    c.fill();
  }
  // Vorderleiste unter den Tasten mit Spiegelung
  const rail = c.createLinearGradient(0, 466, 0, 520);
  rail.addColorStop(0, '#4a1e0c');
  rail.addColorStop(0.2, '#2a1006');
  rail.addColorStop(1, '#120603');
  c.fillStyle = rail;
  c.fillRect(8, 466, 1044, 54);
  c.fillStyle = 'rgba(255, 220, 170, 0.12)';
  c.fillRect(8, 468, 1044, 3);
  // Schlüsselloch
  c.fillStyle = '#d6a640';
  c.beginPath();
  c.arc(530, 490, 6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#120603';
  c.beginPath();
  c.arc(530, 489, 2.2, 0, Math.PI * 2);
  c.fill();
  c.fillRect(529, 489, 2, 6);
}

// Eine weiße Taste (Elfenbein), gedrückt etwas dunkler und tiefer
function paintWhiteKey(c, down) {
  const w = KEY.w, h = KEY.h, top = down ? 4 : 0;
  c.fillStyle = '#0c0603';
  c.fillRect(0, 0, w, h + 14);
  const ivory = c.createLinearGradient(0, top, 0, top + h);
  ivory.addColorStop(0, down ? '#cfc6ae' : '#efe6cf');
  ivory.addColorStop(0.75, down ? '#e0d7c0' : '#fbf6e8');
  ivory.addColorStop(1, down ? '#d6ccb2' : '#f1e8d2');
  c.fillStyle = ivory;
  roundedRect(c, 2, top - 6, w - 4, h + 6, 5);
  c.fill();
  // feine Maserung im Elfenbein
  c.strokeStyle = 'rgba(160, 140, 100, 0.08)';
  c.lineWidth = 1;
  for (let k = 8; k < w - 6; k += 7) line(c, k, top + 4, k + 2, top + h - 6);
  // Seitenkanten und Lichtkante
  c.fillStyle = 'rgba(255, 255, 255, 0.6)';
  c.fillRect(3, top, 2, h - 8);
  c.fillStyle = 'rgba(80, 60, 30, 0.25)';
  c.fillRect(w - 5, top, 2, h - 8);
  // Stirnseite der Taste
  const front = c.createLinearGradient(0, top + h - 4, 0, top + h + 10);
  front.addColorStop(0, '#d8ceb4');
  front.addColorStop(1, '#a39878');
  c.fillStyle = front;
  roundedRect(c, 2, top + h - 4, w - 4, down ? 10 : 14, 3);
  c.fill();
}

// Eine schwarze Taste (Ebenholz) mit Glanz und Fase
function paintBlackKey(c) {
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundedRect(c, 4, 4, 46, 196, 5);
  c.fill();
  const ebony = c.createLinearGradient(0, 0, 50, 0);
  ebony.addColorStop(0, '#2a2420');
  ebony.addColorStop(0.5, '#141110');
  ebony.addColorStop(1, '#060505');
  c.fillStyle = ebony;
  roundedRect(c, 1, 0, 46, 194, 4);
  c.fill();
  const top = c.createLinearGradient(0, 0, 0, 190);
  top.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  top.addColorStop(0.85, 'rgba(255, 255, 255, 0.16)');
  top.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
  c.fillStyle = top;
  roundedRect(c, 7, 2, 34, 172, 3);
  c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.3)';
  c.fillRect(9, 8, 2, 156);
}
