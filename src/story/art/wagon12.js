import { HAND, INK, PRINT, SERIF, glow, line, sheet, smudge, text, wood } from './common.js';

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
  wood(ctx, 160, 140, 960, 420, [92, 34, 28]);
  for (const spot of sleeveSpots()) {
    ctx.fillStyle = spot.color;
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(spot.x + spot.w / 2, spot.y + 100, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e9d8b0';
    ctx.beginPath();
    ctx.arc(spot.x + spot.w / 2, spot.y + 100, 16, 0, Math.PI * 2);
    ctx.fill();
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
    lines.forEach((row, i) => text(ctx, row, spot.x + spot.w / 2, spot.y + 196 + i * 22, { font: `bold 16px ${SERIF}`, color: '#f3e8cc', align: 'center' }));
    if (spot.id === 'xmas' && taken) text(ctx, '(leer)', spot.x + spot.w / 2, spot.y + 240, { font: `14px ${PRINT}`, color: '#f3e8cc', align: 'center' });
  }
  text(ctx, 'Herrn Molls Schallplatten', 640, 186, { font: `20px ${PRINT}`, color: '#f3e2b4', align: 'center' });
}

// ---------------------------------------------------------------- Im Takt klopfen
export const KNOCK_SPOT = [{ id: 'knock', x: 380, y: 300, w: 520, h: 240, label: 'Klopfen' }];

export function drawKnocking(ctx, { sinceJoint, hits, needed }) {
  wood(ctx, 300, 140, 680, 470, [40, 26, 18]);
  ctx.fillStyle = '#1f140d';
  ctx.fillRect(380, 300, 520, 240);
  text(ctx, 'Klavierdeckel', 640, 330, { font: `16px ${PRINT}`, color: '#c8b48a', align: 'center' });
  // Wasserglas, das bei jedem Schienenstoß zittert
  const ring = Math.max(0, 1 - sinceJoint * 3);
  ctx.save();
  ctx.translate(640, 260);
  ctx.fillStyle = 'rgba(200, 225, 235, 0.35)';
  ctx.fillRect(-34, -70, 68, 90);
  ctx.strokeStyle = 'rgba(230, 245, 250, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-34, -70, 68, 90);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + ring * 0.7})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -38, 12 + i * 10 + ring * 8, 4 + i * 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < needed; i++) {
    ctx.fillStyle = i < hits ? '#f3c95a' : 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(640 - (needed - 1) * 22 + i * 44, 580, 12, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'Im Takt der Schienenstöße auf den Deckel klopfen', 640, 470, { font: `20px ${HAND}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Klaviertasten
const WHITE = ['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C', 'D', 'E', 'F', 'G'];
const WHITE_FREQ = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3, 587.3, 659.3, 698.5, 784.0];
const KEY = { x: 160, y: 250, w: 80, h: 320 };

export function keySpots() {
  return WHITE.map((name, i) => ({ id: `k${i}`, name, freq: WHITE_FREQ[i], x: KEY.x + i * KEY.w, y: KEY.y + 150, w: KEY.w, h: KEY.h - 150, label: name, quiet: true }));
}

export function drawKeyboard(ctx, { pressed = null, pressAge = 1, played = [] } = {}) {
  wood(ctx, 110, 120, 1060, 520, [30, 20, 14]);
  WHITE.forEach((name, i) => {
    const x = KEY.x + i * KEY.w;
    const down = pressed === i && pressAge < 0.25;
    ctx.fillStyle = down ? '#d8d0bc' : '#f6f1e4';
    ctx.fillRect(x + 2, KEY.y, KEY.w - 4, KEY.h + (down ? 4 : 0));
    ctx.strokeStyle = '#7d7564';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, KEY.y, KEY.w - 4, KEY.h);
    text(ctx, name, x + KEY.w / 2, KEY.y + KEY.h - 18, { font: `bold 20px ${PRINT}`, color: '#6a604e', align: 'center' });
  });
  // schwarze Tasten (nur zur Zierde)
  WHITE.forEach((name, i) => {
    if (i === WHITE.length - 1 || name === 'E' || name === 'H') return;
    ctx.fillStyle = '#16110c';
    ctx.fillRect(KEY.x + (i + 1) * KEY.w - 22, KEY.y, 44, 190);
  });
  text(ctx, played.length ? played.join(' – ') : 'Wie endet das Lied?', 640, 190, { font: `24px ${HAND}`, color: '#f3e2b4', align: 'center' });
  glow(ctx, 640, 200, 10, '255, 230, 160', 0);
}
