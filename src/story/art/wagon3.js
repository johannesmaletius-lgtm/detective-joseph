import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, fineGrain, glow, line, rivet, roundedRect, screw, sheet, text, vignette, wood } from './common.js';

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
  ctx.drawImage(cached('w3-tubes', 1280, 720, paintTubeWall), 0, 0);
  SWITCH_X.forEach((x, i) => drawSwitch(ctx, x, i, open[i]));
  if (capsule !== null && capsule !== undefined) {
    // Rohrpostbüchse aus Messing mit Lederband
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 6;
    const g = ctx.createLinearGradient(0, PIPE_Y - 14, 0, PIPE_Y + 14);
    g.addColorStop(0, '#f6dc92');
    g.addColorStop(0.5, '#c49a46');
    g.addColorStop(1, '#6a4a18');
    ctx.fillStyle = g;
    roundedRect(ctx, capsule - 30, PIPE_Y - 13, 60, 26, 12);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#5a2e14';
    ctx.fillRect(capsule - 6, PIPE_Y - 13, 12, 26);
  }
}

function paintTubeWall(ctx) {
  const x = 150, y = 110, w = 980, h = 500;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, x, y, w, h, 16);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#3a4234');
  g.addColorStop(1, '#22281e');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  fineGrain(ctx, x, y, w, h, { seed: 33, count: 0.01, dark: 0.18, light: 0.05 });
  // Blechstöße mit Nieten
  for (const bx of [x + 245, x + 490, x + 735]) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(bx - 1, y + 10, 3, h - 20);
    for (let k = 0; k < 8; k++) rivet(ctx, bx + 8, y + 30 + k * 55, 3.5, [120, 126, 108]);
  }
  for (let k = 0; k < 16; k++) for (const ry of [y + 18, y + h - 18]) rivet(ctx, x + 30 + k * 61, ry, 4, [120, 126, 108]);
  // Emailleschild
  roundedRect(ctx, 470, 136, 340, 42, 8);
  ctx.fillStyle = '#1c3a6a';
  ctx.fill();
  ctx.strokeStyle = '#e8e0c8';
  ctx.lineWidth = 3;
  roundedRect(ctx, 476, 142, 328, 30, 5);
  ctx.stroke();
  text(ctx, 'ROHRPOST · LEITUNG 3', 640, 164, { font: `bold 19px ${PRINT}`, color: '#f2ead2', align: 'center' });
  // Hauptrohr
  const segments = [[220, SWITCH_X[0]], ...SWITCH_X.slice(0, -1).map((sx, i) => [sx, SWITCH_X[i + 1]]), [SWITCH_X[3], 1060]];
  for (const [a, b] of segments) pipe(ctx, a, PIPE_Y, b, PIPE_Y);
  // Abzweige nach unten in die Fundsachen-Kästen
  SWITCH_X.forEach((sx) => {
    pipe(ctx, sx, PIPE_Y, sx, PIPE_Y + 140, 0.75);
    roundedRect(ctx, sx - 46, PIPE_Y + 140, 92, 46, 6);
    ctx.fillStyle = '#4a3a22';
    ctx.fill();
    ctx.strokeStyle = '#8a6a34';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'Fundsachen', sx, PIPE_Y + 169, { font: `12px ${PRINT}`, color: 'rgba(232, 216, 176, 0.75)', align: 'center' });
  });
  // Rohrschellen
  for (const cx of [300, 460, 620, 780, 960]) {
    ctx.fillStyle = '#2a2a24';
    ctx.fillRect(cx - 5, PIPE_Y - 22, 10, 44);
    screw(ctx, cx, PIPE_Y - 26, 3);
    screw(ctx, cx, PIPE_Y + 26, 3);
  }
  // Einwurf links: Trichter
  station(ctx, 214, 'Einwurf');
  // Station des Postmeisters rechts, mit Anforderungshebel
  station(ctx, 1070, 'Postmeister');
  ctx.fillStyle = '#2a1a0c';
  ctx.fillRect(1062, PIPE_Y + 44, 16, 60);
  const knob = ctx.createRadialGradient(1066, PIPE_Y + 110, 2, 1070, PIPE_Y + 114, 16);
  knob.addColorStop(0, '#e86a50');
  knob.addColorStop(1, '#6a1408');
  ctx.fillStyle = knob;
  ctx.beginPath();
  ctx.arc(1070, PIPE_Y + 114, 15, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'anfordern', 1070, PIPE_Y + 150, { font: `bold 13px ${PRINT}`, color: '#e8d8b0', align: 'center' });
  text(ctx, 'Achtung: Weichen 1–4 hängen aneinander. Wer eine dreht, dreht die Nachbarn mit.', 640, 584, { font: `italic 16px ${SERIF}`, color: '#d8c8a0', align: 'center' });
  vignette(ctx, x, y, w, h, 0.35);
}

function station(ctx, cx, label) {
  const g = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
  g.addColorStop(0, '#6a4a18');
  g.addColorStop(0.4, '#e8c878');
  g.addColorStop(1, '#5a3e12');
  ctx.fillStyle = g;
  roundedRect(ctx, cx - 30, PIPE_Y - 50, 60, 100, 10);
  ctx.fill();
  ctx.fillStyle = '#1a1208';
  ctx.beginPath();
  ctx.ellipse(cx, PIPE_Y, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2a10';
  ctx.lineWidth = 2;
  roundedRect(ctx, cx - 30, PIPE_Y - 50, 60, 100, 10);
  ctx.stroke();
  roundedRect(ctx, cx - 56, PIPE_Y - 84, 112, 26, 5);
  ctx.fillStyle = '#e8dcb8';
  ctx.fill();
  text(ctx, label, cx, PIPE_Y - 65, { font: `bold 15px ${SERIF}`, color: INK, align: 'center' });
}

function drawSwitch(ctx, x, i, isOpen) {
  // Drehscheibe aus Messing mit Rand und Schrauben
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  const g = ctx.createRadialGradient(x - 16, PIPE_Y - 18, 6, x, PIPE_Y, 56);
  g.addColorStop(0, '#f6dc92');
  g.addColorStop(0.6, '#b08a3a');
  g.addColorStop(1, '#5a3e12');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, PIPE_Y, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#3a2a10';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, PIPE_Y, 54, 0, Math.PI * 2);
  ctx.stroke();
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    screw(ctx, x + Math.cos(a) * 46, PIPE_Y + Math.sin(a) * 46, 3.2, a);
  }
  // Kanal in der Scheibe: gerade durch oder um die Ecke nach unten
  const draw = (width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isOpen) {
      ctx.moveTo(x - 38, PIPE_Y);
      ctx.lineTo(x + 38, PIPE_Y);
    } else {
      ctx.moveTo(x - 38, PIPE_Y);
      ctx.quadraticCurveTo(x, PIPE_Y, x, PIPE_Y + 38);
    }
    ctx.stroke();
  };
  draw(22, '#1e140a');
  draw(14, isOpen ? '#5a8a4a' : '#9a4a2a');
  draw(4, isOpen ? 'rgba(200, 255, 180, 0.5)' : 'rgba(255, 190, 150, 0.45)');
  ctx.lineCap = 'butt';
  // Nummernschild
  roundedRect(ctx, x - 16, PIPE_Y - 92, 32, 28, 5);
  ctx.fillStyle = '#e8dcb8';
  ctx.fill();
  ctx.strokeStyle = '#5a3e14';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, String(i + 1), x, PIPE_Y - 71, { font: `bold 19px ${SERIF}`, color: INK, align: 'center' });
}

function pipe(ctx, x0, y0, x1, y1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = '#4a3410';
  ctx.lineWidth = 36;
  line(ctx, x0, y0, x1, y1);
  ctx.strokeStyle = '#a07a34';
  ctx.lineWidth = 28;
  line(ctx, x0, y0, x1, y1);
  // Glanzlinie oben bzw. links
  const vertical = x0 === x1;
  ctx.strokeStyle = 'rgba(255, 236, 180, 0.55)';
  ctx.lineWidth = 5;
  if (vertical) line(ctx, x0 - 7, y0, x1 - 7, y1);
  else line(ctx, x0, y0 - 7, x1, y1 - 7);
  ctx.strokeStyle = 'rgba(40, 24, 6, 0.35)';
  ctx.lineWidth = 4;
  if (vertical) line(ctx, x0 + 9, y0, x1 + 9, y1);
  else line(ctx, x0, y0 + 9, x1, y1 + 9);
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
