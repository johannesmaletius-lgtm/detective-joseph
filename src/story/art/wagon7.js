import { drawSymbol } from '../../ui/symbols.js';
import { HAND, INK, PRINT, SERIF, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 7 (Barwagen): Flaschenregal mit Gläsern, Bierdeckel, Zeitung.

// ---------------------------------------------------------------- Flaschen
// level = Füllstand in Strichen (voll = 10), color = Inhalt
export const BOTTLES = [
  { id: 'redwine', name: 'Rotwein', label: 'ROTWEIN', color: 'rgba(110, 14, 34, 0.95)', level: 7, glass: '#26331f' },
  { id: 'herbal', name: 'Kräuterlikör', label: 'KRÄUTER', color: 'rgba(40, 70, 30, 0.95)', level: 9, glass: '#1d2a18' },
  { id: 'kirsch', name: 'Kirschwasser', label: 'KIRSCH', color: 'rgba(230, 240, 245, 0.35)', level: 6, glass: '#8aa0a8' },
  { id: 'whisky', name: 'Whisky', label: 'WHISKY', sub: 'torfig · rauchig', color: 'rgba(196, 118, 32, 0.92)', level: 7, glass: '#6e5a3a' },
  { id: 'rum', name: 'Rum', label: 'RUM', sub: 'süß · Vanille', color: 'rgba(150, 70, 20, 0.92)', level: 9, glass: '#5a3a24' },
  { id: 'eggnog', name: 'Eierlikör', label: 'EIERLIKÖR', color: 'rgba(240, 210, 90, 0.97)', level: 4, glass: '#c9b98a' },
];
const BOTTLE_X = (i) => 230 + i * 150;
export const BOTTLE_SPOTS = [
  ...BOTTLES.map((bottle, i) => ({ id: bottle.id, x: BOTTLE_X(i) - 48, y: 150, w: 96, h: 330, label: bottle.name })),
  { id: 'emptyGlasses', x: 380, y: 520, w: 520, h: 120, label: 'Drei leere Gläser' },
];

export function drawBottles(ctx) {
  wood(ctx, 110, 90, 1060, 580, [70, 40, 22]);
  // Regalbrett
  ctx.fillStyle = '#4a2a14';
  ctx.fillRect(110, 480, 1060, 24);
  ctx.fillStyle = '#5c3820';
  ctx.fillRect(110, 640, 1060, 30);
  glow(ctx, 640, 120, 500, '255, 210, 140', 0.18);
  BOTTLES.forEach((bottle, i) => drawBottle(ctx, BOTTLE_X(i), 480, bottle));
  // drei leere Gläser (Tumbler) mit bernsteinfarbenem Rest
  for (let i = 0; i < 3; i++) {
    const x = 480 + i * 160, y = 640;
    ctx.fillStyle = 'rgba(196, 118, 32, 0.6)';
    ctx.fillRect(x - 38, y - 18, 76, 12);
    ctx.strokeStyle = 'rgba(230, 240, 245, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 44, y - 100);
    ctx.lineTo(x - 40, y - 4);
    ctx.lineTo(x + 40, y - 4);
    ctx.lineTo(x + 44, y - 100);
    ctx.stroke();
    ctx.lineWidth = 6;
    line(ctx, x - 40, y - 4, x + 40, y - 4);
  }
}

function drawBottle(ctx, x, base, bottle) {
  const height = 300, width = 84;
  const top = base - height;
  ctx.save();
  // Flaschenkörper
  ctx.fillStyle = bottle.glass;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(x - 14, top);
  ctx.lineTo(x + 14, top);
  ctx.lineTo(x + 14, top + 70);
  ctx.quadraticCurveTo(x + width / 2, top + 90, x + width / 2, top + 120);
  ctx.lineTo(x + width / 2, base - 6);
  ctx.lineTo(x - width / 2, base - 6);
  ctx.lineTo(x - width / 2, top + 120);
  ctx.quadraticCurveTo(x - width / 2, top + 90, x - 14, top + 70);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // Inhalt: Füllstand in Strichen (10 = bis zur Schulter)
  const bodyTop = top + 124, bodyBottom = base - 8;
  const step = (bodyBottom - bodyTop) / 10;
  const liquidTop = bodyBottom - bottle.level * step;
  ctx.fillStyle = bottle.color;
  ctx.fillRect(x - width / 2 + 3, liquidTop, width - 6, bodyBottom - liquidTop);
  // Messstriche am Glas
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 10; i++) line(ctx, x + width / 2 - 12, bodyBottom - i * step, x + width / 2 - 2, bodyBottom - i * step);
  // Etikett
  ctx.fillStyle = '#efe3c0';
  ctx.fillRect(x - 36, top + 170, 72, bottle.sub ? 56 : 40);
  text(ctx, bottle.label, x, top + 194, { font: `bold ${bottle.label.length > 7 ? 11 : 14}px ${PRINT}`, align: 'center' });
  if (bottle.sub) text(ctx, bottle.sub, x, top + 214, { font: `9px ${PRINT}`, align: 'center' });
  // Glanz und Korken
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 4;
  line(ctx, x - width / 2 + 10, top + 130, x - width / 2 + 10, base - 30);
  ctx.fillStyle = '#9a6b3c';
  ctx.fillRect(x - 12, top - 22, 24, 26);
  ctx.restore();
}

// ---------------------------------------------------------------- Bierdeckel mit Strichliste
// Herr K. hat mit den Zeichen vom Türschloss aus Wagen 1 gezählt.
export const COASTER_TALLY = [
  { symbol: 'tunnel', count: 2 },
  { symbol: 'lanternLeft', count: 6 },
  { symbol: 'lanternRight', count: 9 },
  { symbol: 'tower', count: 1 },
];
export const DOOR_SYMBOLS = ['tower', 'lanternRight', 'tunnel', 'lanternLeft'];

export function drawCoaster(ctx) {
  const cx = 640, cy = 360, r = 270;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#eadbb0';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#8f2b1d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 18, 0, Math.PI * 2);
  ctx.stroke();
  // Glasränder
  ctx.strokeStyle = 'rgba(140, 90, 40, 0.3)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx + 70, cy - 60, 90, 0, Math.PI * 2);
  ctx.stroke();
  text(ctx, 'BARWAGEN · RINGBAHN', cx, cy - 190, { font: `bold 22px ${SERIF}`, color: '#8f2b1d', align: 'center' });
  COASTER_TALLY.forEach(({ symbol, count }, i) => {
    const y = cy - 110 + i * 78;
    drawSymbol(ctx, symbol, cx - 150, y, 52, INK);
    drawTally(ctx, cx - 100, y, count);
  });
  text(ctx, 'K.', cx + 170, cy + 200, { font: `32px ${HAND}`, color: INK, align: 'center' });
}

function drawTally(ctx, x, y, count) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  let px = x;
  for (let group = 0; group < Math.ceil(count / 5); group++) {
    const n = Math.min(5, count - group * 5);
    const start = px;
    for (let i = 0; i < Math.min(n, 4); i++) {
      line(ctx, px, y - 22, px + 2, y + 22);
      px += 16;
    }
    if (n === 5) line(ctx, start - 8, y + 16, px - 4, y - 16); // der fünfte Strich quer durch
    px += 26;
  }
}

// ---------------------------------------------------------------- Zeitung
export function drawPaper(ctx) {
  sheet(ctx, 300, 50, 680, 620, {
    color: '#ece6d6',
    shade: '#d6ccb3',
    inner: (c) => {
      text(c, 'RINGBAHN-KURIER', 340, 64, { font: `bold 46px ${SERIF}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 3;
      line(c, 30, 84, 650, 84);
      text(c, 'Ausgabe Runde 108', 340, 110, { font: `italic 18px ${SERIF}`, align: 'center' });
      text(c, 'Wieder ein Fahrgast fort', 340, 168, { font: `bold 34px ${SERIF}`, align: 'center' });
      const lines = [
        'Auch in dieser Runde wird ein Fahrgast den Tunnel',
        'nicht verlassen. Der Schaffner bittet um Ruhe:',
        '„Wer gerufen wird, möge ohne Gepäck kommen.“',
        '',
        'Barwagen: Musikbox defekt – nimmt nur noch Münzen.',
        'Speisewagen: Weihnachtsmenü wie jede Runde.',
      ];
      lines.forEach((value, i) => text(c, value, 40, 230 + i * 34, { font: `20px ${SERIF}` }));
      c.fillStyle = '#9c9890';
      c.fillRect(40, 450, 270, 140);
      text(c, '(groß genug, um sich dahinter zu verstecken)', 470, 520, { font: `italic 16px ${SERIF}`, align: 'center', color: 'rgba(43,33,24,0.7)' });
    },
  });
}
