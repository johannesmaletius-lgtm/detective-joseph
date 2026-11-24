import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, glow, line, rivet, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 3 (Postwagen): die 24 Fächer, die Rohrpost-Weichen, der verschlüsselte Brief.

// ---------------------------------------------------------------- Die 24 Fächer
// Fach n gehört zu Runde n (beschriftet mit römischen Zahlen). In 12 Fächern liegt schon Post,
// 8 Briefe liegen lose im Korb. Richtig einsortiert bleiben die Fächer I, IV, VI und IX leer → 1469.
export const FILLED = [2, 5, 10, 11, 13, 15, 17, 18, 20, 22, 23, 24];
export const LOOSE = [14, 3, 21, 8, 16, 12, 7, 19];
export const EMPTY_AT_END = [1, 4, 6, 9];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV'];

const HOLE = { x0: 250, y0: 80, w: 130, h: 92, gap: 8 };
function holeRect(round) {
  const i = round - 1, col = i % 6, row = Math.floor(i / 6);
  return { x: HOLE.x0 + col * (HOLE.w + HOLE.gap), y: HOLE.y0 + row * (HOLE.h + HOLE.gap + 14), w: HOLE.w, h: HOLE.h };
}

// Plätze zum Einsortieren: alle Fächer, die anfangs leer sind
export const HOLE_ROUNDS = Array.from({ length: 24 }, (_, i) => i + 1).filter((round) => !FILLED.includes(round));
export const HOLE_SLOTS = HOLE_ROUNDS.map((round) => ({ ...holeRect(round), round }));

export function letterTokens() {
  return LOOSE.map((round, i) => ({ id: `r${round}`, round, w: 104, h: 64, label: `Brief, Stempel „Runde ${round}“`, home: { x: 250 + i * 112, y: 600 } }));
}

export function checkHoles(placement) {
  return placement.filter(Boolean).length === LOOSE.length
    && placement.every((id, i) => !id || id === `r${HOLE_ROUNDS[i]}`);
}

export function drawHoles(ctx) {
  wood(ctx, 220, 50, 840, 470, [96, 54, 26]);
  for (let round = 1; round <= 24; round++) {
    const r = holeRect(round);
    ctx.fillStyle = '#2a170b';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#d8c18c';
    ctx.fillRect(r.x + r.w / 2 - 26, r.y + r.h + 1, 52, 13);
    text(ctx, ROMAN[round - 1], r.x + r.w / 2, r.y + r.h + 12, { font: `bold 12px ${SERIF}`, align: 'center' });
    if (FILLED.includes(round)) drawEnvelope(ctx, r.x + r.w / 2, r.y + r.h / 2 + 6, round, 0.92, true);
  }
  // Korb mit losen Briefen
  ctx.fillStyle = '#6b4a22';
  ctx.fillRect(200, 560, 880, 86);
  ctx.strokeStyle = '#3d2810';
  ctx.lineWidth = 3;
  for (let x = 210; x < 1080; x += 22) line(ctx, x, 560, x - 8, 646);
  text(ctx, 'Lose Post', 640, 668, { font: `bold 16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

export function drawLetterToken(ctx, token, x, y) {
  drawEnvelope(ctx, x, y, token.round, 1, false);
}

function drawEnvelope(ctx, x, y, round, scale = 1, inHole = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const w = 100, h = 60;
  ctx.fillStyle = inHole ? '#d9cba6' : '#efe3c2';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(80, 60, 30, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  line(ctx, -w / 2, -h / 2, 0, 4);
  line(ctx, w / 2, -h / 2, 0, 4);
  // Rundenstempel
  ctx.strokeStyle = 'rgba(140, 30, 30, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2 - 22, -h / 2 + 22, 17, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'RUNDE', w / 2 - 22, -h / 2 + 18, { font: `bold 7px ${PRINT}`, color: 'rgba(140,30,30,0.9)', align: 'center' });
  text(ctx, String(round), w / 2 - 22, -h / 2 + 31, { font: `bold 14px ${PRINT}`, color: 'rgba(140,30,30,0.95)', align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Rohrpost
// Vier Weichen in einer Leitung. Eine Weiche dreht ihre Nachbarn mit:
// 1 → 1, 2   ·   2 → 1, 2, 3   ·   3 → 2, 3, 4   ·   4 → 3, 4
export const COUPLED = [[0, 1], [0, 1, 2], [1, 2, 3], [2, 3]];
export const SWITCH_X = [380, 540, 700, 860];
const PIPE_Y = 360;

export function switchSpots() {
  return SWITCH_X.map((x, i) => ({ id: `s${i}`, cx: x, cy: PIPE_Y, r: 58, label: `Weiche ${i + 1}` }));
}

// open[i] = true: Weiche i lässt durch (gerades Rohr)
export function drawTubes(ctx, { open, capsule }) {
  wood(ctx, 150, 110, 980, 500, [58, 36, 20]);
  ctx.fillStyle = 'rgba(10, 6, 2, 0.45)';
  ctx.fillRect(150, 110, 980, 500);
  glow(ctx, 640, 200, 520, '255, 210, 140', 0.14);
  for (const [rx, ry] of [[166, 126], [1114, 126], [166, 594], [1114, 594]]) rivet(ctx, rx, ry, 5, { slot: true, tone: '#c9a24c' });
  text(ctx, 'ROHRPOST · LEITUNG 3', 640, 160, { font: `bold 22px ${PRINT}`, color: '#e8c87a', align: 'center' });
  // Rohr
  const segments = [[220, SWITCH_X[0]], ...SWITCH_X.slice(0, -1).map((x, i) => [x, SWITCH_X[i + 1]]), [SWITCH_X[3], 1060]];
  for (const [a, b] of segments) pipe(ctx, a, PIPE_Y, b, PIPE_Y);
  // Einwurf und Ziel
  text(ctx, 'Einwurf', 220, PIPE_Y - 60, { font: `16px ${PRINT}`, color: '#e8d8b0', align: 'center' });
  terminal(ctx, 210, PIPE_Y);
  text(ctx, 'Postmeister', 1060, PIPE_Y - 60, { font: `16px ${PRINT}`, color: '#e8d8b0', align: 'center' });
  terminal(ctx, 1070, PIPE_Y);
  SWITCH_X.forEach((x, i) => {
    // Sackgasse nach unten
    pipe(ctx, x, PIPE_Y, x, PIPE_Y + 150, 0.45);
    text(ctx, 'Fundsachen', x, PIPE_Y + 178, { font: `12px ${PRINT}`, color: 'rgba(232,216,176,0.6)', align: 'center' });
    // Drehscheibe aus Messing mit Rändel und Schrauben
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    const disc = ctx.createRadialGradient(x - 18, PIPE_Y - 20, 6, x, PIPE_Y, 54);
    disc.addColorStop(0, '#f4d68a');
    disc.addColorStop(0.6, '#a5772c');
    disc.addColorStop(1, '#5a3a10');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(x, PIPE_Y, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(60, 36, 6, 0.55)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2;
      line(ctx, x + Math.cos(a) * 46, PIPE_Y + Math.sin(a) * 46, x + Math.cos(a) * 52, PIPE_Y + Math.sin(a) * 52);
    }
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      rivet(ctx, x + Math.cos(a) * 38, PIPE_Y + Math.sin(a) * 38, 4, { slot: true, tone: '#c9a24c' });
    }
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath();
    ctx.arc(x, PIPE_Y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = open[i] ? '#d9d2c2' : '#c47a5a';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (open[i]) {
      ctx.moveTo(x - 40, PIPE_Y);
      ctx.lineTo(x + 40, PIPE_Y);
    } else {
      ctx.moveTo(x - 40, PIPE_Y);
      ctx.quadraticCurveTo(x, PIPE_Y, x, PIPE_Y + 40);
    }
    ctx.stroke();
    ctx.lineCap = 'butt';
    text(ctx, String(i + 1), x, PIPE_Y - 70, { font: `bold 20px ${PRINT}`, color: '#e8c87a', align: 'center' });
  });
  text(ctx, 'Achtung: Weichen 1–4 hängen aneinander. Wer eine dreht, dreht die Nachbarn mit.', 640, 580, { font: `italic 16px ${SERIF}`, color: '#d8c8a0', align: 'center' });
  if (capsule !== null && capsule !== undefined) {
    const body = ctx.createLinearGradient(0, PIPE_Y - 12, 0, PIPE_Y + 12);
    body.addColorStop(0, '#8a6020');
    body.addColorStop(0.35, '#f6dc90');
    body.addColorStop(1, '#6e4c16');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.roundRect(capsule - 26, PIPE_Y - 12, 52, 24, 10);
    ctx.fill();
    ctx.fillStyle = '#5a2e14';
    ctx.beginPath();
    ctx.roundRect(capsule - 32, PIPE_Y - 13, 10, 26, 4);
    ctx.roundRect(capsule + 22, PIPE_Y - 13, 10, 26, 4);
    ctx.fill();
  }
}

// Einwurf / Empfänger: Messingkasten mit Klappe
function terminal(ctx, x, y) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  const box = ctx.createLinearGradient(x - 26, 0, x + 26, 0);
  box.addColorStop(0, '#5e4416');
  box.addColorStop(0.4, '#e0bc6a');
  box.addColorStop(1, '#4a3410');
  ctx.fillStyle = box;
  ctx.beginPath();
  ctx.roundRect(x - 26, y - 44, 52, 88, 8);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1a1006';
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6020';
  ctx.lineWidth = 3;
  ctx.stroke();
  rivet(ctx, x, y - 34, 3.5, { tone: '#c9a24c' });
  rivet(ctx, x, y + 34, 3.5, { tone: '#c9a24c' });
}

// Messingrohr (waagrecht oder senkrecht) mit runder Schattierung und Flanschen an den Enden
function pipe(ctx, x0, y0, x1, y1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const vertical = x0 === x1;
  const r = 16;
  const shade = vertical ? ctx.createLinearGradient(x0 - r, 0, x0 + r, 0) : ctx.createLinearGradient(0, y0 - r, 0, y0 + r);
  shade.addColorStop(0, '#5e4416');
  shade.addColorStop(0.3, '#f0cf7e');
  shade.addColorStop(0.55, '#b8924a');
  shade.addColorStop(1, '#4a3410');
  ctx.fillStyle = shade;
  if (vertical) ctx.fillRect(x0 - r, Math.min(y0, y1), r * 2, Math.abs(y1 - y0));
  else ctx.fillRect(Math.min(x0, x1), y0 - r, Math.abs(x1 - x0), r * 2);
  // Flansch in der Mitte des Stücks
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  ctx.fillStyle = shade;
  if (vertical) ctx.fillRect(mx - r - 4, my - 5, r * 2 + 8, 10);
  else ctx.fillRect(mx - 5, my - r - 4, 10, r * 2 + 8);
  ctx.strokeStyle = 'rgba(40, 26, 6, 0.5)';
  ctx.lineWidth = 1;
  if (vertical) ctx.strokeRect(mx - r - 4, my - 5, r * 2 + 8, 10);
  else ctx.strokeRect(mx - 5, my - r - 4, 10, r * 2 + 8);
  ctx.restore();
}

// ---------------------------------------------------------------- Der verschlüsselte Brief
export const PLAIN = [
  'LIEBER J.,',
  'MORGEN VERSCHWINDET JEMAND.',
  'ACHTE AUF DIE GLAESER.',
  'DAS WORT FUER DIE TUER: STERN',
  'DEIN J.',
];
export const SHIFT = 108 % 26; // = 4

export function shiftText(value, by) {
  return value.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + by + 26 * 10) % 26) + 65));
}

export const CIPHER = PLAIN.map((row) => shiftText(row, SHIFT));

export const DISK_SPOTS = [
  { id: 'left', cx: 470, cy: 560, r: 40, label: 'Scheibe zurückdrehen' },
  { id: 'right', cx: 810, cy: 560, r: 40, label: 'Scheibe weiterdrehen' },
];

// turn = um wie viele Buchstaben Joseph die Scheibe zurückgedreht hat
export function drawCipherLetter(ctx, { turn }) {
  sheet(ctx, 250, 30, 780, 420, {
    color: '#ece2c8',
    shade: '#d5c49c',
    inner: (c) => {
      text(c, 'An J.  –  zuzustellen in Runde 108', 40, 48, { font: `bold 22px ${TYPEWRITER}` });
      text(c, '(Verschiebung: wie die Runde)', 740, 76, { font: `italic 16px ${HAND}`, color: BLUE_INK, align: 'right' });
      CIPHER.forEach((row, i) => text(c, row, 40, 110 + i * 40, { font: `bold 26px ${TYPEWRITER}` }));
      c.strokeStyle = 'rgba(39, 64, 143, 0.4)';
      c.lineWidth = 1;
      line(c, 30, 320, 750, 320);
      const decoded = CIPHER.map((row) => shiftText(row, -turn));
      text(c, 'Mit der Scheibe gelesen:', 40, 348, { font: `16px ${HAND}`, color: BLUE_INK });
      text(c, `${decoded[1]} ${decoded[2]}`, 40, 378, { font: `bold 18px ${TYPEWRITER}`, color: BLUE_INK });
      // Das Wort für die Tür liest die Scheibe nicht vor – das muss man selbst Buchstabe für Buchstabe entziffern
      text(c, decoded[3].replace(/:.*$/, ': _ _ _ _ _'), 40, 404, { font: `bold 18px ${TYPEWRITER}`, color: BLUE_INK });
    },
  });
  // Chiffrierscheibe
  const cx = 640, cy = 580;
  ctx.fillStyle = '#c9b48a';
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9dcbc';
  ctx.beginPath();
  ctx.arc(cx, cy, 86, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (i / 26) * Math.PI * 2;
    text(ctx, String.fromCharCode(65 + i), cx + Math.cos(a) * 104, cy + Math.sin(a) * 104 + 6, { font: `bold 15px ${PRINT}`, align: 'center' });
    const b = a - (turn / 26) * Math.PI * 2;
    text(ctx, String.fromCharCode(65 + i), cx + Math.cos(b) * 70, cy + Math.sin(b) * 70 + 5, { font: `bold 13px ${PRINT}`, color: RED, align: 'center' });
  }
  text(ctx, String(turn), cx, cy + 8, { font: `bold 22px ${PRINT}`, align: 'center' });
  text(ctx, 'innen (rot): Brief', 880, 556, { font: `italic 18px ${HAND}`, color: '#f6b8a8' });
  text(ctx, 'außen: Klartext', 880, 584, { font: `italic 18px ${HAND}`, color: '#f1e0b8' });
  for (const spot of DISK_SPOTS) {
    ctx.fillStyle = '#4a3a22';
    ctx.beginPath();
    ctx.arc(spot.cx, spot.cy, spot.r, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, spot.id === 'left' ? '◀' : '▶', spot.cx, spot.cy + 9, { font: `bold 26px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  }
}

export function drawPostmasterNote(ctx) {
  sheet(ctx, 380, 120, 520, 440, {
    angle: 0.02,
    inner: (c) => {
      text(c, 'Dienstanweisung', 260, 50, { font: `bold 28px ${SERIF}`, align: 'center' });
      text(c, 'Postwagen · Ringbahn', 260, 80, { font: `italic 18px ${SERIF}`, align: 'center' });
      const lines = [
        'Brief an J. – eingeworfen in Runde 107,',
        'zuzustellen in Runde 108 – steckt',
        'noch in Leitung 3.',
        '',
        'Die Weichen klemmen. Dreht man eine,',
        'drehen die Nachbarn mit.',
        'Alle vier müssen gerade stehen,',
        'sonst landet die Büchse bei den',
        'Fundsachen.',
        '',
        '                    – Der Postmeister',
      ];
      lines.forEach((value, i) => text(c, value, 40, 140 + i * 28, { font: `20px ${HAND}`, color: INK }));
    },
  });
}
