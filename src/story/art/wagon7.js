import { drawSymbol } from '../../ui/symbols.js';
import { HAND, INK, PRINT, SERIF, drawPicture, glow, line, sheet, text, wood } from './common.js';

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
  // Rückwand der Bar: der Barwagen unscharf dahinter, darüber warmes Licht
  ctx.save();
  ctx.beginPath();
  ctx.rect(110, 90, 1060, 580);
  ctx.clip();
  ctx.filter = 'blur(4px) brightness(0.4)';
  drawPicture(ctx, 'assets/scenes/wagon-07/background.webp', -120, -80, 1520, 860);
  ctx.filter = 'none';
  // Spiegel hinter den Flaschen
  const mirror = ctx.createLinearGradient(0, 120, 0, 480);
  mirror.addColorStop(0, 'rgba(120, 140, 150, 0.22)');
  mirror.addColorStop(1, 'rgba(40, 50, 55, 0.35)');
  ctx.fillStyle = mirror;
  ctx.fillRect(150, 120, 980, 360);
  ctx.strokeStyle = '#8a6a2a';
  ctx.lineWidth = 6;
  ctx.strokeRect(150, 120, 980, 360);
  glow(ctx, 640, 100, 560, '255, 200, 120', 0.25);
  ctx.restore();
  // Regalbretter
  shelf(ctx, 480);
  shelf(ctx, 640);
  BOTTLES.forEach((bottle, i) => drawBottle(ctx, BOTTLE_X(i), 480, bottle));
  // drei leere Gläser (Tumbler) mit bernsteinfarbenem Rest
  for (let i = 0; i < 3; i++) tumbler(ctx, 480 + i * 160, 640);
  ctx.strokeStyle = '#2a160a';
  ctx.lineWidth = 6;
  ctx.strokeRect(110, 90, 1060, 580);
}

function shelf(ctx, y) {
  const g = ctx.createLinearGradient(0, y, 0, y + 26);
  g.addColorStop(0, '#7a4a24');
  g.addColorStop(1, '#3a1e0c');
  ctx.fillStyle = g;
  ctx.fillRect(110, y, 1060, 26);
  ctx.fillStyle = 'rgba(255, 220, 160, 0.35)';
  ctx.fillRect(110, y, 1060, 2);
  ctx.fillStyle = '#c9a24c';
  ctx.fillRect(110, y + 22, 1060, 3);
}

function tumbler(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 2, 46, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Glas
  const glass = ctx.createLinearGradient(x - 44, 0, x + 44, 0);
  glass.addColorStop(0, 'rgba(220, 235, 240, 0.35)');
  glass.addColorStop(0.3, 'rgba(220, 235, 240, 0.08)');
  glass.addColorStop(0.7, 'rgba(220, 235, 240, 0.06)');
  glass.addColorStop(1, 'rgba(220, 235, 240, 0.3)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(x - 44, y - 100);
  ctx.lineTo(x - 40, y - 2);
  ctx.lineTo(x + 40, y - 2);
  ctx.lineTo(x + 44, y - 100);
  ctx.closePath();
  ctx.fill();
  // bernsteinfarbener Rest
  const rest = ctx.createLinearGradient(0, y - 24, 0, y - 8);
  rest.addColorStop(0, 'rgba(230, 150, 50, 0.8)');
  rest.addColorStop(1, 'rgba(150, 80, 20, 0.85)');
  ctx.fillStyle = rest;
  ctx.beginPath();
  ctx.ellipse(x, y - 22, 39, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 39, y - 22, 78, 12);
  // dicker Glasboden
  ctx.fillStyle = 'rgba(210, 225, 230, 0.45)';
  ctx.fillRect(x - 40, y - 10, 80, 8);
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 100, 44, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  line(ctx, x - 44, y - 100, x - 40, y - 2);
  line(ctx, x + 44, y - 100, x + 40, y - 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  line(ctx, x - 32, y - 90, x - 30, y - 30);
  ctx.restore();
}

function bottlePath(ctx, x, top, base, width) {
  ctx.beginPath();
  ctx.moveTo(x - 13, top);
  ctx.lineTo(x + 13, top);
  ctx.lineTo(x + 13, top + 70);
  ctx.quadraticCurveTo(x + width / 2, top + 88, x + width / 2, top + 122);
  ctx.lineTo(x + width / 2, base - 10);
  ctx.quadraticCurveTo(x + width / 2, base - 2, x + width / 2 - 8, base - 2);
  ctx.lineTo(x - width / 2 + 8, base - 2);
  ctx.quadraticCurveTo(x - width / 2, base - 2, x - width / 2, base - 10);
  ctx.lineTo(x - width / 2, top + 122);
  ctx.quadraticCurveTo(x - width / 2, top + 88, x - 13, top + 70);
  ctx.closePath();
}

function drawBottle(ctx, x, base, bottle) {
  const height = 300, width = 84;
  const top = base - height;
  ctx.save();
  // Schatten auf dem Brett
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 6, base + 2, 46, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Glas (dunkel am Rand, heller in der Mitte)
  bottlePath(ctx, x, top, base, width);
  const glass = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
  glass.addColorStop(0, bottle.glass);
  glass.addColorStop(0.45, 'rgba(255, 255, 255, 0.12)');
  glass.addColorStop(1, bottle.glass);
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = bottle.glass;
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.globalAlpha = 1;
  // Inhalt: Füllstand in Strichen (10 = bis zur Schulter)
  const bodyTop = top + 124, bodyBottom = base - 8;
  const step = (bodyBottom - bodyTop) / 10;
  const liquidTop = bodyBottom - bottle.level * step;
  ctx.save();
  bottlePath(ctx, x, top, base, width - 6);
  ctx.clip();
  ctx.fillStyle = bottle.color;
  ctx.fillRect(x - width / 2, liquidTop, width, bodyBottom - liquidTop + 6);
  const depth = ctx.createLinearGradient(x - width / 2, 0, x + width / 2, 0);
  depth.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
  depth.addColorStop(0.5, 'rgba(255, 230, 180, 0.12)');
  depth.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = depth;
  ctx.fillRect(x - width / 2, liquidTop, width, bodyBottom - liquidTop + 6);
  // Oberfläche
  ctx.fillStyle = 'rgba(255, 240, 210, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, liquidTop, width / 2 - 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Messstriche am Glas
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 10; i++) line(ctx, x + width / 2 - 12, bodyBottom - i * step, x + width / 2 - 2, bodyBottom - i * step);
  // Etikett mit Rahmen
  const lh = bottle.sub ? 58 : 42;
  const label = ctx.createLinearGradient(0, top + 168, 0, top + 168 + lh);
  label.addColorStop(0, '#f6ecd0');
  label.addColorStop(1, '#dccb9e');
  ctx.fillStyle = label;
  ctx.fillRect(x - 37, top + 168, 74, lh);
  ctx.strokeStyle = '#8a6a2a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - 34, top + 171, 68, lh - 6);
  text(ctx, bottle.label, x, top + 194, { font: `bold ${bottle.label.length > 7 ? 10 : bottle.label.length > 5 ? 12 : 14}px ${SERIF}`, align: 'center' });
  if (bottle.sub) text(ctx, bottle.sub, x, top + 214, { font: `italic 9px ${SERIF}`, align: 'center' });
  // Glanzlichter
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  line(ctx, x - width / 2 + 11, top + 132, x - width / 2 + 11, base - 34);
  ctx.lineWidth = 2;
  line(ctx, x - 7, top + 8, x - 7, top + 62);
  // Kapsel und Korken
  ctx.fillStyle = '#9a6b3c';
  ctx.fillRect(x - 11, top - 20, 22, 24);
  const foil = ctx.createLinearGradient(x - 14, 0, x + 14, 0);
  foil.addColorStop(0, '#6a1a14');
  foil.addColorStop(0.5, '#c9443a');
  foil.addColorStop(1, '#6a1a14');
  ctx.fillStyle = bottle.id === 'whisky' || bottle.id === 'rum' ? '#c9a24c' : foil;
  ctx.fillRect(x - 14, top - 4, 28, 26);
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
  // Pappe: feine Körnung und gewellter Prägerand
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = i % 3 ? 'rgba(120, 90, 50, 0.09)' : 'rgba(255, 255, 255, 0.16)';
    ctx.fillRect(cx - r + rnd() * r * 2, cy - r + rnd() * r * 2, 2, 2);
  }
  const edge = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r);
  edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
  edge.addColorStop(1, 'rgba(90, 60, 30, 0.28)');
  ctx.fillStyle = edge;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(120, 90, 50, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const rr = r - 7 + Math.sin(i * 1.0) * 2;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.stroke();
  ctx.strokeStyle = '#8f2b1d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 32, 0, Math.PI * 2);
  ctx.stroke();
  // Glasrand: nasser Ring, an einer Stelle dunkler
  ctx.save();
  ctx.strokeStyle = 'rgba(140, 90, 40, 0.22)';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(cx + 70, cy - 40, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120, 70, 30, 0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx + 70, cy - 40, 95, 2.2, 4.4);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'BARWAGEN · RINGBAHN', cx, cy - 190, { font: `bold 22px ${SERIF}`, color: '#8f2b1d', align: 'center' });
  COASTER_TALLY.forEach(({ symbol, count }, i) => {
    const y = cy - 110 + i * 78;
    drawSymbol(ctx, symbol, cx - 150, y, 52, INK);
    drawTally(ctx, cx - 100, y, count);
  });
  ctx.save();
  ctx.translate(cx + 140, cy + 168);
  ctx.rotate(-0.12);
  text(ctx, 'K.', 0, 0, { font: `34px ${HAND}`, color: INK, align: 'center' });
  ctx.restore();
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
