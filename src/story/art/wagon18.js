import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, glow, line, sheet, text, wood } from './common.js';

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

export function drawKeyBoard(ctx, view) {
  wood(ctx, 160, 70, 960, 480, [60, 70, 50]);
  ctx.fillStyle = '#2f3a2a';
  ctx.fillRect(180, 90, 920, 440);
  const done = view?.solved;
  for (const slot of KEY_SLOTS) {
    ctx.save();
    ctx.strokeStyle = 'rgba(220, 200, 140, 0.8)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    keyShape(ctx, slot.x + slot.w / 2, slot.y + 20, slot.shape, false);
    ctx.restore();
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.arc(slot.x + slot.w / 2, slot.y + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    if (slot.shape === 'loco' && done) text(ctx, 'LOK', slot.x + slot.w / 2, slot.y + slot.h + 4, { font: `bold 22px ${PRINT}`, color: '#ffd36b', align: 'center' });
  }
  text(ctx, 'Alle Schlüssel an ihren Haken – sonst bleibt das Stellwerk gesperrt.', 640, 560, { font: `italic 16px ${SERIF}`, color: '#e8d8b0', align: 'center' });
}

export function drawKeyToken(ctx, token, x, y) {
  ctx.save();
  ctx.fillStyle = '#d6a645';
  ctx.strokeStyle = '#6e4e18';
  ctx.lineWidth = 3;
  keyShape(ctx, x, y - 60, token.shape, true);
  ctx.restore();
  ctx.fillStyle = '#efe3c2';
  ctx.fillRect(x - 40, y + 50, 80, 20);
  text(ctx, KEY_LABELS[token.shape], x, y + 65, { font: `bold 12px ${PRINT}`, align: 'center' });
}

// Schlüssel: Griff (Form), Schaft nach unten, Bart
function keyShape(ctx, x, top, shape, filled) {
  const draw = () => (filled ? (ctx.fill(), ctx.stroke()) : ctx.stroke());
  ctx.beginPath();
  const cy = top + 26;
  if (shape === 'ring') ctx.arc(x, cy, 22, 0, Math.PI * 2);
  if (shape === 'square') ctx.rect(x - 22, cy - 22, 44, 44);
  if (shape === 'diamond') { ctx.moveTo(x, cy - 26); ctx.lineTo(x + 24, cy); ctx.lineTo(x, cy + 26); ctx.lineTo(x - 24, cy); ctx.closePath(); }
  if (shape === 'triangle') { ctx.moveTo(x, cy - 26); ctx.lineTo(x + 26, cy + 20); ctx.lineTo(x - 26, cy + 20); ctx.closePath(); }
  if (shape === 'clover') { for (const [dx, dy] of [[0, -12], [-12, 6], [12, 6]]) { ctx.moveTo(x + dx + 13, cy + dy); ctx.arc(x + dx, cy + dy, 13, 0, Math.PI * 2); } }
  if (shape === 'heart') { ctx.moveTo(x, cy + 24); ctx.bezierCurveTo(x - 40, cy - 4, x - 18, cy - 34, x, cy - 12); ctx.bezierCurveTo(x + 18, cy - 34, x + 40, cy - 4, x, cy + 24); }
  if (shape === 'star') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 26; ctx.lineTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); }
  if (shape === 'loco') { ctx.rect(x - 26, cy - 10, 52, 30); ctx.rect(x + 6, cy - 28, 16, 18); }
  draw();
  ctx.beginPath();
  ctx.rect(x - 5, cy + 26, 10, 90);
  draw();
  ctx.beginPath();
  ctx.rect(x + 5, cy + 92, 18, 10);
  ctx.rect(x + 5, cy + 106, 12, 10);
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

export function drawInterlocking(ctx, { settings }) {
  ctx.fillStyle = '#e7dcc0';
  ctx.fillRect(140, 70, 1000, 580);
  ctx.strokeStyle = '#6a5a3a';
  ctx.lineWidth = 8;
  ctx.strokeRect(140, 70, 1000, 580);
  text(ctx, 'STELLWERK · Fahrstraße aus dem Ring', 380, 108, { font: `bold 22px ${SERIF}`, align: 'center' });
  // alle Gleise blass
  ctx.strokeStyle = 'rgba(60, 50, 40, 0.35)';
  ctx.lineWidth = 6;
  line(ctx, NODES.S.x, NODES.S.y, NODES.W1.x, NODES.W1.y);
  for (const [from, outs] of Object.entries(SWITCHES)) for (const to of outs) line(ctx, NODES[from].x, NODES[from].y, NODES[to].x, NODES[to].y);
  line(ctx, NODES.W7.x, NODES.W7.y, 1110, 300);
  text(ctx, 'Bahnhof', 1110, 286, { font: `bold 16px ${PRINT}`, align: 'center' });
  // gestellter Weg
  const { path, end } = routeFrom(settings);
  ctx.strokeStyle = end === 'W7' ? '#2a8a3a' : '#c0392b';
  ctx.lineWidth = 9;
  ctx.beginPath();
  path.forEach((id, i) => (i ? ctx.lineTo(NODES[id].x, NODES[id].y) : ctx.moveTo(NODES[id].x, NODES[id].y)));
  ctx.stroke();
  for (const [id, node] of Object.entries(NODES)) {
    if (SWITCHES[id]) {
      ctx.fillStyle = '#4a3a22';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 26, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, String(SWITCH_NAMES.indexOf(id) + 1), node.x, node.y + 8, { font: `bold 22px ${PRINT}`, color: '#ffe7a0', align: 'center' });
      // Zunge der Weiche zeigt zum gestellten Ausgang
      const to = NODES[SWITCHES[id][settings[id]]];
      const a = Math.atan2(to.y - node.y, to.x - node.x);
      ctx.strokeStyle = '#ffd36b';
      ctx.lineWidth = 5;
      line(ctx, node.x + Math.cos(a) * 26, node.y + Math.sin(a) * 26, node.x + Math.cos(a) * 46, node.y + Math.sin(a) * 46);
    } else if (node.label) {
      ctx.fillStyle = id === 'W7' ? RED : '#6a5a3a';
      ctx.beginPath();
      ctx.arc(node.x, node.y, id === 'W7' ? 22 : 12, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, node.label, node.x, node.y + (node.y > 400 ? 40 : -26), { font: `bold 15px ${PRINT}`, align: 'center' });
    }
  }
  text(ctx, end === 'W7' ? 'Fahrstraße bis Weiche 7 frei.' : end === 'loop' || end.startsWith('R') ? 'Die Fahrstraße führt zurück in den Ring.' : 'Die Fahrstraße endet am Prellbock.', 640, 150, {
    font: `bold 20px ${PRINT}`, color: end === 'W7' ? '#2a6a2a' : RED, align: 'center',
  });
  glow(ctx, NODES.W7.x, NODES.W7.y, 50, '255, 120, 100', 0.25);
  return INK;
}
