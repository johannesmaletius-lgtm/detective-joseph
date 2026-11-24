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

// Kleines Motiv auf jeder Plattenhülle
function sleeveArt(ctx, id, x, y, w, color) {
  ctx.save();
  ctx.translate(x + w / 2, y + 96);
  ctx.strokeStyle = 'rgba(243, 232, 204, 0.85)';
  ctx.fillStyle = 'rgba(243, 232, 204, 0.85)';
  ctx.lineWidth = 2.5;
  if (id === 'dance') {
    // Sektglas und Notenpaar
    ctx.beginPath();
    ctx.moveTo(-20, -40); ctx.lineTo(-4, -4); ctx.lineTo(12, -40); ctx.stroke();
    line(ctx, -4, -4, -4, 26); line(ctx, -16, 26, 8, 26);
    ctx.beginPath(); ctx.arc(28, 18, 7, 0, Math.PI * 2); ctx.fill();
    line(ctx, 35, 18, 35, -20);
  } else if (id === 'xmas') {
    // Tannenbaum mit Stern
    ctx.fillStyle = 'rgba(243, 232, 204, 0.9)';
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(-30, 0); ctx.lineTo(-14, 0); ctx.lineTo(-36, 30); ctx.lineTo(36, 30); ctx.lineTo(14, 0); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f3c95a';
    ctx.beginPath(); ctx.arc(0, -50, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(243, 232, 204, 0.9)'; ctx.fillRect(-5, 30, 10, 12);
  } else if (id === 'signal') {
    // Signalmast mit Laterne
    line(ctx, 0, -46, 0, 40); line(ctx, -16, 40, 16, 40);
    ctx.beginPath(); ctx.arc(0, -30, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#f3c95a'; ctx.beginPath(); ctx.arc(0, -30, 5, 0, Math.PI * 2); ctx.fill();
    for (const a of [-0.6, 0, 0.6]) line(ctx, Math.cos(a) * 16, -30 + Math.sin(a) * 16, Math.cos(a) * 28, -30 + Math.sin(a) * 28);
  } else if (id === 'waltz') {
    // Ring mit Waggons (Ringbahn)
    ctx.beginPath(); ctx.arc(0, -4, 36, 0, Math.PI * 2); ctx.stroke();
    for (let k = 0; k < 6; k++) { const a = k * 1.047; ctx.fillRect(Math.cos(a) * 36 - 6, -4 + Math.sin(a) * 36 - 4, 12, 8); }
  } else {
    // Mondsichel und Sterne
    ctx.beginPath(); ctx.arc(0, -6, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(12, -14, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(243, 232, 204, 0.85)';
    for (const [sx, sy] of [[30, 20], [-36, -36], [38, -34]]) ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.restore();
}

export function drawRecords(ctx, taken) {
  wood(ctx, 160, 140, 960, 420, [92, 34, 28]);
  // Regalbrett
  ctx.fillStyle = '#3a140e';
  ctx.fillRect(160, 470, 960, 22);
  ctx.fillStyle = 'rgba(255, 220, 180, 0.12)';
  ctx.fillRect(160, 470, 960, 3);
  sleeveSpots().forEach((spot, i) => {
    const tilt = [-0.02, 0.015, -0.01, 0.02, -0.015][i];
    const empty = spot.id === 'xmas' && taken;
    ctx.save();
    ctx.translate(spot.x + spot.w / 2, spot.y + spot.h);
    ctx.rotate(tilt);
    ctx.translate(-spot.w / 2, -spot.h);
    // Platte schaut oben heraus (nicht bei der leeren Hülle)
    if (!empty) {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(spot.w / 2, 10, 70, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let g = 20; g < 70; g += 6) { ctx.beginPath(); ctx.arc(spot.w / 2, 10, g, Math.PI, 0); ctx.stroke(); }
    }
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 4;
    const paper = ctx.createLinearGradient(0, 0, spot.w, spot.h);
    paper.addColorStop(0, spot.color);
    paper.addColorStop(1, 'rgba(20, 10, 10, 1)');
    ctx.fillStyle = spot.color;
    ctx.fillRect(0, 0, spot.w, spot.h);
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, spot.w, spot.h);
    ctx.globalAlpha = 1;
    // abgestoßene Kanten und Rahmenlinie
    ctx.strokeStyle = 'rgba(243, 232, 204, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(8, 8, spot.w - 16, spot.h - 16);
    ctx.fillStyle = 'rgba(243, 232, 204, 0.12)';
    ctx.fillRect(0, 0, spot.w, 3);
    sleeveArt(ctx, spot.id, 0, 0, spot.w, spot.color);
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
    lines.forEach((row, k) => text(ctx, row, spot.w / 2, 186 + k * 22, { font: `bold 16px ${SERIF}`, color: '#f3e8cc', align: 'center' }));
    text(ctx, 'H. MOLL · KLAVIER', spot.w / 2, spot.h - 16, { font: `9px ${PRINT}`, color: 'rgba(243, 232, 204, 0.7)', align: 'center' });
    if (empty) text(ctx, '(leer)', spot.w / 2, 236, { font: `14px ${PRINT}`, color: '#f3e8cc', align: 'center' });
    ctx.restore();
  });
  // Messingschild an der Regalkante
  const plate = ctx.createLinearGradient(0, 474, 0, 490);
  plate.addColorStop(0, '#f0d27e');
  plate.addColorStop(1, '#9a6e24');
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.roundRect(530, 473, 220, 17, 3);
  ctx.fill();
  text(ctx, 'Herrn Molls Schallplatten', 640, 486, { font: `bold 12px ${SERIF}`, color: '#3b2608', align: 'center' });
}

// ---------------------------------------------------------------- Im Takt klopfen
export const KNOCK_SPOT = [{ id: 'knock', x: 380, y: 300, w: 520, h: 240, label: 'Klopfen' }];

export function drawKnocking(ctx, { sinceJoint, hits, needed }) {
  const ring = Math.max(0, 1 - sinceJoint * 3);
  // Wand dahinter
  wood(ctx, 300, 120, 680, 500, [46, 28, 20]);
  // Klavierdeckel in Perspektive: schwarzer Lack mit Spiegelung
  ctx.save();
  ctx.translate(0, ring * 1.5); // zittert beim Schienenstoß mit
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  const lid = new Path2D();
  lid.moveTo(400, 300);
  lid.lineTo(880, 300);
  lid.lineTo(950, 540);
  lid.lineTo(330, 540);
  lid.closePath();
  const lacquer = ctx.createLinearGradient(0, 300, 0, 540);
  lacquer.addColorStop(0, '#2a2420');
  lacquer.addColorStop(0.5, '#0c0a09');
  lacquer.addColorStop(1, '#1a1512');
  ctx.fillStyle = lacquer;
  ctx.fill(lid);
  ctx.shadowColor = 'transparent';
  // Vorderkante
  ctx.fillStyle = '#050403';
  ctx.beginPath();
  ctx.moveTo(330, 540); ctx.lineTo(950, 540); ctx.lineTo(950, 560); ctx.lineTo(330, 560);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 240, 220, 0.18)';
  ctx.fillRect(330, 540, 620, 2);
  // Spiegelung der Lampe auf dem Lack
  ctx.save();
  ctx.clip(lid);
  const shine = ctx.createLinearGradient(420, 300, 700, 540);
  shine.addColorStop(0, 'rgba(255, 230, 190, 0)');
  shine.addColorStop(0.45, 'rgba(255, 230, 190, 0.14)');
  shine.addColorStop(0.55, 'rgba(255, 230, 190, 0.02)');
  shine.addColorStop(1, 'rgba(255, 230, 190, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(330, 300, 620, 240);
  // Klopf-Wellen, wenn der Takt kommt
  if (ring > 0) {
    ctx.strokeStyle = `rgba(243, 201, 90, ${ring * 0.5})`;
    ctx.lineWidth = 2;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(640, 452, 60 + k * 50 + (1 - ring) * 60, 10 + k * 12 + (1 - ring) * 14, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  // Messing-Schriftzug
  text(ctx, 'MOLL & SÖHNE', 640, 330, { font: `bold 14px ${SERIF}`, color: '#c9a24c', align: 'center' });
  ctx.restore();
  // Wasserglas auf dem Deckel, zittert bei jedem Schienenstoß
  ctx.save();
  ctx.translate(640 + Math.sin(sinceJoint * 80) * ring * 3, 450);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(6, 4, 38, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const glassBody = new Path2D();
  glassBody.moveTo(-36, -96); glassBody.lineTo(-30, 0);
  glassBody.quadraticCurveTo(0, 8, 30, 0); glassBody.lineTo(36, -96); glassBody.closePath();
  ctx.fillStyle = 'rgba(200, 225, 235, 0.16)';
  ctx.fill(glassBody);
  ctx.save();
  ctx.clip(glassBody);
  ctx.fillStyle = 'rgba(150, 190, 210, 0.28)';
  ctx.fillRect(-40, -52, 80, 60);
  ctx.restore();
  ctx.strokeStyle = 'rgba(230, 245, 250, 0.75)';
  ctx.lineWidth = 2.5;
  ctx.stroke(glassBody);
  ctx.beginPath();
  ctx.ellipse(0, -96, 36, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + ring * 0.65})`;
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, -52, 6 + i * 9 + ring * 6, 2 + i * 1.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  line(ctx, -26, -86, -22, -12);
  ctx.restore();
  // Fortschritt als kleine Messingpunkte
  for (let i = 0; i < needed; i++) {
    const x = 640 - (needed - 1) * 22 + i * 44;
    ctx.fillStyle = i < hits ? '#f3c95a' : 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(x, 590, 12, 0, Math.PI * 2);
    ctx.fill();
    if (i < hits) glow(ctx, x, 590, 26, '243, 201, 90', 0.35);
  }
  text(ctx, 'Im Takt der Schienenstöße auf den Deckel klopfen', 640, 160, { font: `20px ${HAND}`, color: '#e9d8b0', align: 'center' });
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
