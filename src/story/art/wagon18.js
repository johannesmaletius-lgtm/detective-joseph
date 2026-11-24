import {
  BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, brassPlate, cachedLayer, contactShadow, fineGrain, glow, grain, line, plank, rivet, roundedRect,
  screw, sheet, text, vignette,
} from './common.js';

// Gezeichnetes für Wagen 18 (Schaffnerabteil): Dienstbuch mit Schichtplan, Telegramm, Schlüsselbrett,
// Stellwerk mit Gleisplan.

// ---------------------------------------------------------------- Dienstbuch
// Ursprünglicher Plan der Weihnachtswoche, dazu Tauschvermerke in der Reihenfolge, in der sie
// eingetragen wurden. Wer fuhr am 24.? J. tauscht den 24. mit Moser (gegen den 27.),
// danach tauscht Moser den 24. mit Kern (gegen den 20.) → KERN.
const DAYS = ['20.', '21.', '22.', '23.', '24.', '25.', '26.', '27.'];
const PLAN = ['Moser', 'J.', 'Kern', 'Moser', 'J.', 'Kern', 'Moser', 'J.'];

export function drawDutyBook(ctx) {
  sheet(ctx, 110, 50, 1060, 620, {
    color: '#ece2c4',
    inner: (c) => {
      text(c, 'DIENSTBUCH · Zugbegleitung Ringbahn · Weihnachtswoche', 530, 48, { font: `bold 24px ${SERIF}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 2;
      DAYS.forEach((day, i) => {
        const x = 60 + i * 118;
        c.strokeRect(x, 80, 118, 110);
        text(c, `${day} Dez.`, x + 59, 110, { font: `bold 18px ${TYPEWRITER}`, align: 'center' });
        text(c, PLAN[i], x + 59, 160, { font: `bold 24px ${TYPEWRITER}`, align: 'center' });
      });
      text(c, 'Tauschvermerke (in dieser Reihenfolge eingetragen):', 60, 250, { font: `bold 20px ${SERIF}` });
      const notes = [
        '1) 18.12. – J. gibt seinen Dienst am 24. an Moser ab und übernimmt dafür Mosers 26.',
        '    „Will zu Hause alles vorbereiten. Frau und Kind kommen mit dem Zug nach.“  – J.',
        '2) 19.12. – Moser gibt den 24. weiter an Kern und übernimmt dafür Kerns 22.',
        '    „Meine Mutter feiert Geburtstag.“  – Moser',
        '    „Gern. Meine letzte Weihnachtsfahrt vor der Rente.“  – Kern',
        '3) 21.12. – Kern tauscht den 25. mit J. gegen J.s 27.',
      ];
      notes.forEach((value, i) => text(c, value, 60, 296 + i * 38, { font: `20px ${HAND}`, color: BLUE_INK }));
      text(c, 'Am 24. Dezember fuhr: ________', 60, 548, { font: `bold 22px ${TYPEWRITER}` });
      text(c, 'Wer fuhr, hat den Schlüssel zur Schublade: Sein Name ist das Wort.', 60, 584, { font: `italic 18px ${SERIF}`, color: RED });
    },
  });
}

// ---------------------------------------------------------------- Telegramm aus der Schublade
export function drawTelegram(ctx) {
  sheet(ctx, 330, 130, 620, 420, {
    color: '#f2ead2',
    angle: -0.02,
    inner: (c) => {
      c.fillStyle = '#c9a24a';
      c.fillRect(0, 0, 620, 60);
      text(c, 'TELEGRAMM', 310, 42, { font: `bold 30px ${PRINT}`, color: '#2b2118', align: 'center' });
      const rows = [
        'AN SCHAFFNER J. +++ BAHNHOF RINGSTADT',
        '',
        'NEHMEN DEN WEIHNACHTSZUG 24.12.',
        'ANKUNFT 23.47 UHR +++',
        'MIRA BASTELT DIR EIN GESCHENK +++',
        'WARTE AM BAHNSTEIG AUF UNS +++',
        '',
        'DEINE MARTHA UND MIRA',
      ];
      rows.forEach((value, i) => text(c, value, 40, 120 + i * 36, { font: `bold 22px ${TYPEWRITER}` }));
    },
  });
}

// ---------------------------------------------------------------- Schlüsselbrett
// Acht Umrisse, sieben Schlüssel. Ein Umriss bleibt frei: „Lok“.
export const KEY_SHAPES = ['ring', 'clover', 'square', 'diamond', 'heart', 'triangle', 'star', 'loco'];
const KEY_LABELS = { ring: 'Packwagen', clover: 'Speisewagen', square: 'Fundbüro', diamond: 'Gepäck', heart: 'Kapelle', triangle: 'Postwagen', star: 'Stellwerk', loco: 'Lok' };
export const KEY_SLOTS = KEY_SHAPES.map((shape, i) => ({ x: 250 + (i % 4) * 200, y: 110 + Math.floor(i / 4) * 230, w: 120, h: 190, shape }));
const ORDER = ['star', 'ring', 'heart', 'triangle', 'clover', 'diamond', 'square'];
export function keyTokens() {
  return ORDER.map((shape, i) => ({ id: shape, shape, w: 90, h: 150, label: 'Schlüssel', home: { x: 190 + i * 150, y: 610 } }));
}
export function checkKeys(placement) {
  return placement.filter(Boolean).length === 7 && placement.every((id, i) => !id || id === KEY_SLOTS[i].shape);
}

// Schlüssel hängen an der Öse oben am Griff; der Griff sitzt so, wie das Kärtchen im Platz liegt
const keyTop = (slot) => slot.y + slot.h / 2 - 60;

function paintKeyBoard(c) {
  // Wand des Abteils (dunkle Vertäfelung)
  plank(c, 0, 0, 1280, 720, { tone: [58, 34, 20], seed: 181, vertical: true, knots: 0 });
  for (let x = 0; x < 1280; x += 128) {
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fillRect(x, 0, 3, 720);
  }
  vignette(c, 0, 0, 1280, 720, 0.6);
  // Brett: Eichenrahmen mit Profil, innen grün gestrichene Tafel
  contactShadow(c, 640, 548, 520, 30, 0.6);
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 12;
  c.fillStyle = '#3a2412';
  c.fillRect(150, 58, 980, 500);
  c.restore();
  plank(c, 150, 58, 980, 30, { tone: [132, 84, 44], seed: 11 });
  plank(c, 150, 528, 980, 30, { tone: [120, 76, 40], seed: 12 });
  plank(c, 150, 58, 30, 500, { tone: [126, 80, 42], seed: 13, vertical: true });
  plank(c, 1100, 58, 30, 500, { tone: [126, 80, 42], seed: 14, vertical: true });
  // Gehrungsfugen und Lichtkante
  c.strokeStyle = 'rgba(20, 10, 4, 0.6)';
  c.lineWidth = 1.5;
  for (const [x0, y0, x1, y1] of [[150, 58, 180, 88], [1130, 58, 1100, 88], [150, 558, 180, 528], [1130, 558, 1100, 528]]) line(c, x0, y0, x1, y1);
  c.strokeStyle = 'rgba(255, 220, 160, 0.3)';
  line(c, 151, 59, 1129, 59);
  line(c, 151, 59, 151, 557);
  // Tafel
  const board = c.createLinearGradient(0, 88, 0, 528);
  board.addColorStop(0, '#3c4a36');
  board.addColorStop(1, '#27321f');
  c.fillStyle = board;
  c.fillRect(180, 88, 920, 440);
  plank(c, 180, 88, 920, 440, { tone: [52, 64, 44], seed: 77, knots: 0 });
  c.fillStyle = 'rgba(40, 54, 34, 0.55)';
  c.fillRect(180, 88, 920, 440);
  fineGrain(c, 180, 88, 920, 440, { seed: 18, count: 0.006, dark: 0.18, light: 0.06 });
  // Innenschatten unter dem Rahmen
  const top = c.createLinearGradient(0, 88, 0, 112);
  top.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  top.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = top;
  c.fillRect(180, 88, 920, 24);
  const left = c.createLinearGradient(180, 0, 200, 0);
  left.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  left.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = left;
  c.fillRect(180, 88, 20, 440);
  // Lichtschein von der Abteillampe oben links
  glow(c, 420, 140, 520, '255, 214, 150', 0.12);
  // Messingschild
  brassPlate(c, 470, 64, 340, 22);
  text(c, 'SCHLÜSSELBRETT · ZUG 24', 640, 80, { font: `bold 13px ${PRINT}`, color: '#3a2a10', align: 'center' });
  // Umrisse: aufgemalte Schattenbilder der Schlüssel, Farbe etwas abgegriffen
  for (const slot of KEY_SLOTS) {
    const x = slot.x + slot.w / 2, t = keyTop(slot);
    c.save();
    c.fillStyle = 'rgba(232, 222, 190, 0.2)';
    c.strokeStyle = 'rgba(240, 230, 196, 0.75)';
    c.lineWidth = 2.5;
    keyShape(c, x, t, slot.shape, true);
    c.restore();
    grain(c, slot.x, t, slot.w, 160, { seed: slot.x + slot.y, count: 90, alpha: 0.35, size: 2.2 });
    // Haken: Messingrosette und gebogener Haken
    rivet(c, x, t - 10, 6, [176, 140, 64]);
    c.strokeStyle = '#8a6a2a';
    c.lineWidth = 4;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, t - 10);
    c.lineTo(x, t + 2);
    c.arc(x + 5, t + 2, 5, Math.PI, 0, true);
    c.stroke();
    c.strokeStyle = 'rgba(255, 236, 170, 0.7)';
    c.lineWidth = 1.2;
    line(c, x - 1, t - 8, x - 1, t + 1);
  }
  // Schrauben im Rahmen
  for (const [sx, sy] of [[165, 73], [1115, 73], [165, 543], [1115, 543]]) screw(c, sx, sy, 6, sx * 0.01);
  // Ablage darunter: Brett mit Kante, auf dem die losen Schlüssel liegen
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 24;
  c.shadowOffsetY = 10;
  c.fillStyle = '#4a2c16';
  c.fillRect(110, 572, 1060, 128);
  c.restore();
  plank(c, 110, 572, 1060, 120, { tone: [112, 70, 36], seed: 5, knots: 2 });
  fineGrain(c, 110, 572, 1060, 120, { seed: 9, count: 0.003 });
  plank(c, 110, 692, 1060, 14, { tone: [80, 48, 24], seed: 6 });
  c.fillStyle = 'rgba(255, 226, 170, 0.28)';
  c.fillRect(110, 572, 1060, 2);
  const lip = c.createLinearGradient(0, 572, 0, 600);
  lip.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  lip.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = lip;
  c.fillRect(110, 572, 1060, 28);
}

export function drawKeyBoard(ctx, view) {
  ctx.drawImage(cachedLayer('w18-keyboard', paintKeyBoard), 0, 0, 1280, 720);
  const loco = KEY_SLOTS.find((slot) => slot.shape === 'loco');
  if (view?.solved) {
    // unter dem leeren Haken: ein kleines Emailschild „LOK“
    const x = loco.x + loco.w / 2, y = loco.y + loco.h - 6;
    glow(ctx, x, y + 12, 70, '255, 210, 120', 0.3);
    ctx.fillStyle = '#efe6cf';
    roundedRect(ctx, x - 34, y, 68, 26, 5);
    ctx.fill();
    ctx.strokeStyle = '#1c2a52';
    ctx.lineWidth = 2;
    roundedRect(ctx, x - 31, y + 3, 62, 20, 4);
    ctx.stroke();
    text(ctx, 'LOK', x, y + 20, { font: `bold 17px ${PRINT}`, color: '#1c2a52', align: 'center' });
  }
  text(ctx, 'Alle Schlüssel an ihren Haken – sonst bleibt das Stellwerk gesperrt.', 640, 112, { font: `italic 15px ${SERIF}`, color: 'rgba(240, 230, 196, 0.8)', align: 'center' });
}

export function drawKeyToken(ctx, token, x, y) {
  const top = y - 60;
  ctx.save();
  // Schatten auf Brett oder Ablage
  ctx.save();
  ctx.translate(4, 6);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 3;
  keyShape(ctx, x, top, token.shape, true);
  ctx.restore();
  // Messingkörper
  const g = ctx.createLinearGradient(x - 30, top, x + 30, top + 130);
  g.addColorStop(0, '#f6de94');
  g.addColorStop(0.45, '#d2a446');
  g.addColorStop(1, '#8c6420');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#5a3c10';
  ctx.lineWidth = 2.5;
  keyShape(ctx, x, top, token.shape, true);
  // Glanzlinie am Schaft und Bohrung im Griff
  ctx.strokeStyle = 'rgba(255, 246, 210, 0.75)';
  ctx.lineWidth = 2;
  line(ctx, x - 2, top + 54, x - 2, top + 112);
  ctx.fillStyle = '#3a2410';
  ctx.beginPath();
  ctx.arc(x, top + 10, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Pappanhänger an einer Schnur, links neben dem Schaft
  ctx.strokeStyle = '#a8987a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, top + 10);
  ctx.quadraticCurveTo(x - 22, top + 30, x - 12, y + 6);
  ctx.stroke();
  ctx.save();
  ctx.translate(x - 50, y + 12);
  ctx.rotate(-0.1);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#efe3c2';
  ctx.beginPath();
  ctx.moveTo(-44, -10);
  ctx.lineTo(30, -10);
  ctx.lineTo(40, 0);
  ctx.lineTo(30, 10);
  ctx.lineTo(-44, 10);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#7a6a4a';
  ctx.beginPath();
  ctx.arc(31, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, KEY_LABELS[token.shape], -9, 5, { font: `bold 12px ${PRINT}`, color: INK, align: 'center' });
  ctx.restore();
}

// Schlüssel: Griff (Form), Schaft nach unten, Bart
function keyShape(ctx, x, top, shape, filled) {
  const rule = shape === 'ring' ? 'evenodd' : 'nonzero';
  const draw = () => (filled ? (ctx.fill(rule), ctx.stroke()) : ctx.stroke());
  ctx.beginPath();
  const cy = top + 26;
  if (shape === 'ring') { ctx.arc(x, cy, 22, 0, Math.PI * 2); ctx.moveTo(x + 11, cy); ctx.arc(x, cy, 11, 0, Math.PI * 2); }
  if (shape === 'square') ctx.rect(x - 22, cy - 22, 44, 44);
  if (shape === 'diamond') { ctx.moveTo(x, cy - 26); ctx.lineTo(x + 24, cy); ctx.lineTo(x, cy + 26); ctx.lineTo(x - 24, cy); ctx.closePath(); }
  if (shape === 'triangle') { ctx.moveTo(x, cy - 26); ctx.lineTo(x + 26, cy + 20); ctx.lineTo(x - 26, cy + 20); ctx.closePath(); }
  if (shape === 'clover') { for (const [dx, dy] of [[0, -12], [-12, 6], [12, 6]]) { ctx.moveTo(x + dx + 13, cy + dy); ctx.arc(x + dx, cy + dy, 13, 0, Math.PI * 2); } }
  if (shape === 'heart') { ctx.moveTo(x, cy + 24); ctx.bezierCurveTo(x - 40, cy - 4, x - 18, cy - 34, x, cy - 12); ctx.bezierCurveTo(x + 18, cy - 34, x + 40, cy - 4, x, cy + 24); }
  if (shape === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 26; ctx.lineTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); }
  if (shape === 'loco') { ctx.rect(x - 26, cy - 10, 52, 30); ctx.rect(x + 6, cy - 28, 16, 18); }
  draw();
  // Schaft mit Kragen, Bart mit Einschnitten
  ctx.beginPath();
  ctx.rect(x - 5, cy + 22, 10, 94);
  ctx.rect(x - 8, cy + 24, 16, 6);
  draw();
  ctx.beginPath();
  ctx.moveTo(x + 5, cy + 90);
  ctx.lineTo(x + 23, cy + 90);
  ctx.lineTo(x + 23, cy + 97);
  ctx.lineTo(x + 17, cy + 97);
  ctx.lineTo(x + 17, cy + 104);
  ctx.lineTo(x + 21, cy + 104);
  ctx.lineTo(x + 21, cy + 116);
  ctx.lineTo(x + 5, cy + 116);
  ctx.closePath();
  draw();
}

// ---------------------------------------------------------------- Stellwerk
// Weichen 1–6, jede führt nach a oder b. Ziel: Weiche 7 (der Weg aus dem Ring hinaus).
export const NODES = {
  S: { x: 200, y: 360, label: 'Ring' },
  W1: { x: 330, y: 360 },
  W2: { x: 480, y: 230 },
  W3: { x: 480, y: 490 },
  W4: { x: 660, y: 230 },
  W5: { x: 660, y: 490 },
  W6: { x: 840, y: 360 },
  W7: { x: 1010, y: 360, label: 'Weiche 7' },
  P1: { x: 640, y: 120, label: 'Prellbock' },
  P2: { x: 820, y: 590, label: 'Prellbock' },
  R1: { x: 300, y: 600, label: 'zurück in den Ring' },
  R2: { x: 980, y: 560, label: 'zurück in den Ring' },
};
export const SWITCHES = {
  W1: ['W2', 'W3'],
  W2: ['P1', 'W4'],
  W3: ['W5', 'R1'],
  W4: ['W6', 'W3'],
  W5: ['P2', 'W6'],
  W6: ['W7', 'R2'],
};
export const SWITCH_NAMES = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];

export function routeFrom(settings) {
  const path = ['S', 'W1'];
  let node = 'W1';
  for (let i = 0; i < 10; i++) {
    const next = SWITCHES[node][settings[node]];
    path.push(next);
    if (!SWITCHES[next]) return { path, end: next };
    if (path.indexOf(next) !== path.length - 1) return { path, end: 'loop' };
    node = next;
  }
  return { path, end: 'loop' };
}

export function switchSpots() {
  return SWITCH_NAMES.map((id, i) => ({ id, cx: NODES[id].x, cy: NODES[id].y, r: 34, label: `Weiche ${i + 1} umstellen` }));
}

function paintInterlocking(c) {
  // Wand hinter dem Pult
  plank(c, 0, 0, 1280, 720, { tone: [52, 32, 20], seed: 182, vertical: true, knots: 0 });
  vignette(c, 0, 0, 1280, 720, 0.6);
  // Gehäuse: lackiertes Blech mit Messingrahmen
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.75)';
  c.shadowBlur = 34;
  c.shadowOffsetY = 14;
  c.fillStyle = '#2a2f2a';
  roundedRect(c, 124, 56, 1032, 608, 14);
  c.fill();
  c.restore();
  const frame = c.createLinearGradient(0, 56, 0, 664);
  frame.addColorStop(0, '#e8cc7c');
  frame.addColorStop(0.5, '#a8822e');
  frame.addColorStop(1, '#6a4c16');
  c.fillStyle = frame;
  roundedRect(c, 124, 56, 1032, 608, 14);
  c.fill();
  const panel = c.createLinearGradient(0, 74, 0, 646);
  panel.addColorStop(0, '#36423a');
  panel.addColorStop(1, '#222a24');
  c.fillStyle = panel;
  roundedRect(c, 140, 70, 1000, 580, 8);
  c.fill();
  fineGrain(c, 140, 70, 1000, 580, { seed: 21, count: 0.004, dark: 0.16, light: 0.05 });
  glow(c, 400, 160, 520, '255, 236, 200', 0.06);
  // Innenschatten
  c.save();
  roundedRect(c, 140, 70, 1000, 580, 8);
  c.clip();
  c.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  c.lineWidth = 14;
  c.shadowColor = 'rgba(0, 0, 0, 0.8)';
  c.shadowBlur = 16;
  roundedRect(c, 133, 63, 1014, 594, 12);
  c.stroke();
  c.restore();
  for (let i = 0; i <= 12; i++) for (const y of [63, 657]) rivet(c, 140 + i * 83.3, y, 3.5, [176, 140, 64]);
  for (let i = 1; i < 7; i++) for (const x of [132, 1148]) rivet(c, x, 63 + i * 84.9, 3.5, [176, 140, 64]);
  // Schild oben links
  const pg = c.createLinearGradient(0, 86, 0, 124);
  pg.addColorStop(0, '#efe6cf');
  pg.addColorStop(1, '#cfc2a0');
  c.fillStyle = pg;
  roundedRect(c, 170, 88, 420, 36, 5);
  c.fill();
  c.strokeStyle = '#1c2a52';
  c.lineWidth = 2;
  roundedRect(c, 174, 92, 412, 28, 4);
  c.stroke();
  text(c, 'STELLWERK · Fahrstraße aus dem Ring', 380, 113, { font: `bold 18px ${SERIF}`, color: '#1c2a52', align: 'center' });
  // Gleise: helle Emaillestreifen mit dunkler Fuge
  const track = (x0, y0, x1, y1) => {
    c.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    c.lineWidth = 14;
    line(c, x0, y0 + 2, x1, y1 + 2);
    c.strokeStyle = '#b9b29c';
    c.lineWidth = 10;
    line(c, x0, y0, x1, y1);
    c.strokeStyle = 'rgba(255, 255, 240, 0.35)';
    c.lineWidth = 2;
    line(c, x0, y0 - 3, x1, y1 - 3);
  };
  c.lineCap = 'round';
  track(NODES.S.x, NODES.S.y, NODES.W1.x, NODES.W1.y);
  for (const [from, outs] of Object.entries(SWITCHES)) for (const to of outs) track(NODES[from].x, NODES[from].y, NODES[to].x, NODES[to].y);
  track(NODES.W7.x, NODES.W7.y, 1110, 300);
  // Endpunkte: Prellböcke, Ring, Bahnhof
  for (const [id, node] of Object.entries(NODES)) {
    if (SWITCHES[id] || !node.label) continue;
    const big = id === 'W7';
    c.fillStyle = '#1a1e1a';
    c.beginPath();
    c.arc(node.x, node.y, big ? 25 : 14, 0, Math.PI * 2);
    c.fill();
    const lamp = c.createRadialGradient(node.x - 3, node.y - 3, 1, node.x, node.y, big ? 20 : 10);
    lamp.addColorStop(0, big ? '#ff9a8a' : '#e8dcc0');
    lamp.addColorStop(1, big ? '#8a1a12' : '#6a6050');
    c.fillStyle = lamp;
    c.beginPath();
    c.arc(node.x, node.y, big ? 20 : 10, 0, Math.PI * 2);
    c.fill();
    const below = node.y > 400;
    const ly = node.y + (below ? 32 : -22);
    c.font = `bold 13px ${PRINT}`;
    const w = c.measureText(node.label).width + 16;
    c.fillStyle = 'rgba(230, 222, 200, 0.92)';
    roundedRect(c, node.x - w / 2, ly - 14, w, 20, 3);
    c.fill();
    text(c, node.label, node.x, ly + 1, { font: `bold 13px ${PRINT}`, color: '#1c2a52', align: 'center' });
  }
  c.fillStyle = 'rgba(230, 222, 200, 0.92)';
  roundedRect(c, 1076, 268, 68, 20, 3);
  c.fill();
  text(c, 'Bahnhof', 1110, 283, { font: `bold 13px ${PRINT}`, color: '#1c2a52', align: 'center' });
}

export function drawInterlocking(ctx, { settings }) {
  ctx.drawImage(cachedLayer('w18-interlocking', paintInterlocking), 0, 0, 1280, 720);
  // gestellter Weg: leuchtende Lämpchenreihe
  const { path, end } = routeFrom(settings);
  const ok = end === 'W7';
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = ok ? 'rgba(90, 255, 120, 0.9)' : 'rgba(255, 90, 70, 0.9)';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = ok ? '#62e07a' : '#ff6a50';
  ctx.lineWidth = 7;
  ctx.beginPath();
  path.forEach((id, i) => (i ? ctx.lineTo(NODES[id].x, NODES[id].y) : ctx.moveTo(NODES[id].x, NODES[id].y)));
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = ok ? 'rgba(230, 255, 230, 0.8)' : 'rgba(255, 230, 220, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  // Weichen: Messing-Drehknöpfe mit Nummer, die Nase zeigt zum gestellten Ausgang
  for (const [id, node] of Object.entries(NODES)) {
    if (!SWITCHES[id]) continue;
    const to = NODES[SWITCHES[id][settings[id]]];
    const a = Math.atan2(to.y - node.y, to.x - node.x);
    ctx.save();
    ctx.translate(node.x, node.y);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#1a1e1a';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // Nase
    ctx.rotate(a);
    const ng = ctx.createLinearGradient(0, -8, 0, 8);
    ng.addColorStop(0, '#f6de94');
    ng.addColorStop(1, '#7a5a1a');
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.moveTo(16, -9);
    ctx.lineTo(48, -3);
    ctx.lineTo(50, 0);
    ctx.lineTo(48, 3);
    ctx.lineTo(16, 9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a3008';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.rotate(-a);
    const kg = ctx.createRadialGradient(-8, -8, 2, 0, 0, 26);
    kg.addColorStop(0, '#fbe6a4');
    kg.addColorStop(0.6, '#c49a40');
    kg.addColorStop(1, '#5a3e10');
    ctx.fillStyle = kg;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#efe6cf';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c2a52';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, String(SWITCH_NAMES.indexOf(id) + 1), 0, 7, { font: `bold 19px ${PRINT}`, color: '#1c2a52', align: 'center' });
    ctx.restore();
  }
  // Weiche 7 leuchtet (grün, sobald die Fahrstraße frei ist)
  if (ok) {
    const lamp = ctx.createRadialGradient(NODES.W7.x - 3, NODES.W7.y - 3, 1, NODES.W7.x, NODES.W7.y, 20);
    lamp.addColorStop(0, '#d8ffd8');
    lamp.addColorStop(1, '#1a8a3a');
    ctx.fillStyle = lamp;
    ctx.beginPath();
    ctx.arc(NODES.W7.x, NODES.W7.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  glow(ctx, NODES.W7.x, NODES.W7.y, 56, ok ? '120, 255, 140' : '255, 120, 100', ok ? 0.45 : 0.25);
  // Meldefeld oben
  const msg = ok ? 'Fahrstraße bis Weiche 7 frei.' : end === 'loop' || end.startsWith('R') ? 'Die Fahrstraße führt zurück in den Ring.' : 'Die Fahrstraße endet am Prellbock.';
  ctx.fillStyle = '#121612';
  roundedRect(ctx, 712, 86, 410, 40, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200, 170, 90, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.shadowColor = ok ? 'rgba(120, 255, 140, 0.9)' : 'rgba(255, 120, 90, 0.9)';
  ctx.shadowBlur = 10;
  text(ctx, msg, 917, 112, { font: `bold 16px ${PRINT}`, color: ok ? '#9cf5a8' : '#ff9a80', align: 'center' });
  ctx.restore();
  return INK;
}
