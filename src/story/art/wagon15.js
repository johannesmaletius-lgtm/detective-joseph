import { drawSymbol } from './wagon13.js';
import { HAND, INK, PRINT, SERIF, clockHand, drawPicture, glow, handCap, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 15 (Spielzimmer): die vierzehn Modellbahn-Wagen, das Innere des
// Puppenhaus-Bahnhofs mit den Figuren und Miras Zeichnung.

// ---------------------------------------------------------------- Modellbahn
// Jeder Mini-Wagen hat ein winziges Zeichen für einen der Wagen 1–14
export const MINI = ['bench', 'suitcase', 'letter', 'glass', 'bed', 'umbrella', 'whisky', 'film', 'mirror', 'horn', 'clock', 'note', 'chapel', 'newspaper'];
const COLORS = ['#3a6ea5', '#a5463a', '#3a8a5a', '#8a3a7a', '#b07a2a', '#4a4a8a', '#7a5a3a', '#2a2a2a', '#9aa0a8', '#6a7a3a', '#a0703a', '#5a2a4a', '#8a6a4a', '#606060'];
const START = [9, 3, 12, 0, 6, 13, 2, 10, 5, 8, 1, 11, 4, 7]; // Mini-Wagen auf Platz 0, 1, …

// Plätze auf den beiden Gleisen des Bilds (oben hinter der Lok, unten bis zum Tunnel)
export const MINI_SLOTS = Array.from({ length: 14 }, (_, i) => ({
  x: (i < 7 ? 232 : 80) + (i % 7) * 140,
  y: i < 7 ? 148 : 424,
  w: 124,
  h: 86,
  label: `${i + 1}`,
}));

export const MINI_TOKENS = START.map((wagon, slot) => ({ id: `mini${wagon}`, wagon, slot }));

export function drawRailwayTable(ctx) {
  drawPicture(ctx, 'assets/closeups/modellbahn.webp', 0, 0, 1280, 720);
  ctx.fillStyle = 'rgba(20, 12, 6, 0.7)';
  ctx.fillRect(300, 692, 680, 26);
  text(ctx, 'Hinter der Lok der erste Wagen. „Papa hat sie immer richtig hingestellt.“', 640, 711, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

export function drawMini(ctx, token, x, y) {
  const wagon = Number(token.id.slice(4));
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COLORS[wagon];
  ctx.fillRect(-56, -34, 112, 58);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(-56, -34, 112, 8);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-60, -40, 120, 8);
  for (const wx of [-36, 36]) {
    ctx.beginPath();
    ctx.arc(wx, 30, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  // Fensterchen mit dem Zeichen
  ctx.fillStyle = '#f3ead2';
  ctx.fillRect(-20, -24, 40, 36);
  drawSymbol(ctx, MINI[wagon], 0, -6);
  ctx.restore();
}

// ---------------------------------------------------------------- Puppenhaus-Bahnhof
export const FIGURE_SLOTS = [
  { id: 'platform', x: 463, y: 320, w: 100, h: 165, label: 'Bahnsteig' },
  { id: 'train1', x: 748, y: 320, w: 100, h: 165, label: 'Zug, Tür' },
  { id: 'train2', x: 880, y: 320, w: 100, h: 165, label: 'Zug, Fenster' },
];
export const FIGURES = [
  { id: 'conductor', name: 'Schaffner', home: { x: 1130, y: 200 } },
  { id: 'woman', name: 'Frau', home: { x: 1130, y: 380 } },
  { id: 'girl', name: 'Mädchen mit Hase', home: { x: 1130, y: 560 } },
  { id: 'cook', name: 'Koch', home: { x: 160, y: 250 } },
  { id: 'dog', name: 'Hund', home: { x: 160, y: 480 } },
];

export function figuresCorrect(placement) {
  const [platform, a, b] = placement;
  return platform === 'conductor' && [a, b].includes('woman') && [a, b].includes('girl');
}

// Bild 1672 × 941, verkleinert auf 900 × 506 in die Mitte (links und rechts warten die Figuren)
const HOUSE = { x: 190, y: 107, w: 900, h: 506 };
export function drawDollhouseInside(ctx) {
  drawPicture(ctx, 'assets/closeups/puppenhaus.webp', HOUSE.x, HOUSE.y, HOUSE.w, HOUSE.h);
  // Bahnhofsuhr: 23:47
  const cx = 370, cy = 323, r = 44;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = 2;
    line(ctx, cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95);
  }
  const minute = ((47 / 60) * Math.PI * 2) - Math.PI / 2;
  const hour = (((11 + 47 / 60) / 12) * Math.PI * 2) - Math.PI / 2;
  ctx.lineCap = 'butt';
  clockHand(ctx, cx, cy, hour + Math.PI / 2, r * 0.52, 6);
  clockHand(ctx, cx, cy, minute + Math.PI / 2, r * 0.8, 4);
  handCap(ctx, cx, cy, 3.5);
  text(ctx, 'ZUG 24', 865, 332, { font: `bold 15px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  text(ctx, 'Wo stand wer in jener Nacht?', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Lackierte Holzfigur: gerundeter Körper mit Glanz
function pegBody(ctx, color, bottom, flare) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-17, -22);
  ctx.quadraticCurveTo(-22, -16, -21, -6);
  ctx.quadraticCurveTo(-flare + 4, 30, -flare, bottom);
  ctx.quadraticCurveTo(0, bottom + 6, flare, bottom);
  ctx.quadraticCurveTo(flare - 4, 30, 21, -6);
  ctx.quadraticCurveTo(22, -16, 17, -22);
  ctx.closePath();
  ctx.fill();
  const shine = ctx.createLinearGradient(-flare, 0, flare, 0);
  shine.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  shine.addColorStop(0.32, 'rgba(255, 255, 255, 0.3)');
  shine.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
  shine.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = shine;
  ctx.fill();
}

function pegHead(ctx, y = -36, r = 16) {
  const skin = ctx.createRadialGradient(-5, y - 6, 2, 0, y, r);
  skin.addColorStop(0, '#fbe0c4');
  skin.addColorStop(1, '#d9a888');
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.arc(-5, y - 2, 1.8, 0, Math.PI * 2);
  ctx.arc(5, y - 2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(220, 90, 80, 0.45)';
  ctx.beginPath();
  ctx.arc(-9, y + 4, 3, 0, Math.PI * 2);
  ctx.arc(9, y + 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, y + 4, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

export function drawFigure(ctx, token, x, y) {
  const figure = FIGURES.find((f) => f.id === token.id);
  ctx.save();
  ctx.translate(x, y);
  // Sockel aus Holz
  const base = ctx.createLinearGradient(-34, 0, 34, 0);
  base.addColorStop(0, '#3e260f');
  base.addColorStop(0.4, '#7a5028');
  base.addColorStop(1, '#3a220c');
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.ellipse(0, 64, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-34, 58, 68, 6);
  ctx.fillStyle = '#8a6034';
  ctx.beginPath();
  ctx.ellipse(0, 58, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (figure.id === 'dog') {
    ctx.fillStyle = '#8a5a2a';
    ctx.beginPath();
    ctx.ellipse(-2, 30, 30, 15, 0, 0, Math.PI * 2); // Rumpf
    ctx.fill();
    for (const lx of [-22, -10, 10, 20]) ctx.fillRect(lx, 36, 7, 22);
    ctx.beginPath();
    ctx.ellipse(30, 14, 14, 12, 0, 0, Math.PI * 2); // Kopf
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(40, 18, 8, 6, 0, 0, Math.PI * 2); // Schnauze
    ctx.fill();
    ctx.fillStyle = '#5a3414';
    ctx.beginPath();
    ctx.ellipse(24, 14, 6, 11, 0.3, 0, Math.PI * 2); // Ohr
    ctx.fill();
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-30, 24);
    ctx.quadraticCurveTo(-42, 12, -38, 2); // Schwanz
    ctx.stroke();
    ctx.fillStyle = '#1a1008';
    ctx.beginPath();
    ctx.arc(46, 16, 2.5, 0, Math.PI * 2);
    ctx.arc(32, 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b3261e';
    ctx.fillRect(16, 20, 18, 4); // Halsband
    const shine = ctx.createLinearGradient(0, 14, 0, 46);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.beginPath();
    ctx.ellipse(-2, 26, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const small = figure.id === 'girl';
    const s = small ? 0.72 : 1;
    ctx.scale(s, s);
    ctx.translate(0, small ? 30 : 0);
    const wide = figure.id === 'woman' || small;
    const color = { conductor: '#1f2a44', woman: '#7a3a3a', girl: '#3f5f34', cook: '#ece6d6' }[figure.id];
    pegBody(ctx, color, 60, wide ? 30 : 23);
    if (figure.id === 'conductor') {
      ctx.fillStyle = '#d9b25a';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.arc(0, -8 + k * 16, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#121a2c';
      ctx.fillRect(-21, 18, 42, 5); // Gürtel
    }
    if (figure.id === 'cook') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-14, -4, 28, 58, 4); // Schürze
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (figure.id === 'woman') {
      ctx.fillStyle = '#c9a26a';
      ctx.beginPath();
      ctx.moveTo(-22, -16); ctx.quadraticCurveTo(0, 6, 22, -16); ctx.lineTo(18, -22); ctx.lineTo(-18, -22);
      ctx.fill(); // Schultertuch
    }
    if (small) {
      ctx.fillStyle = '#efe6d2';
      ctx.fillRect(-28, 46, 56, 6); // Rocksaum
    }
    pegHead(ctx);
    if (figure.id === 'conductor') {
      ctx.fillStyle = '#121a2c';
      ctx.beginPath();
      ctx.roundRect(-17, -60, 34, 14, [4, 4, 0, 0]);
      ctx.fill();
      ctx.fillRect(-22, -48, 44, 5);
      ctx.fillStyle = '#d9b25a';
      ctx.fillRect(-4, -57, 8, 6);
      // Schnurrbart
      ctx.fillStyle = '#4a2a14';
      ctx.beginPath();
      ctx.ellipse(-4, -30, 5, 2, 0.2, 0, Math.PI * 2);
      ctx.ellipse(4, -30, 5, 2, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (figure.id === 'cook') {
      ctx.fillStyle = '#fbf8ef';
      ctx.fillRect(-12, -62, 24, 12);
      for (const [hx, hy, hr] of [[-9, -66, 9], [0, -72, 11], [9, -66, 9]]) {
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (figure.id === 'woman') {
      ctx.fillStyle = '#4a2a1a';
      ctx.beginPath();
      ctx.arc(0, -44, 17, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -58, 7, 0, Math.PI * 2); // Dutt
      ctx.fill();
    }
    if (small) {
      ctx.fillStyle = '#5a3018';
      ctx.beginPath();
      ctx.arc(0, -44, 17, Math.PI, 0);
      ctx.fill();
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 18, -30, 5, 11, side * 0.3, 0, Math.PI * 2); // Zöpfe
        ctx.fill();
      }
      // Hase im Arm
      ctx.fillStyle = '#d8c3a0';
      ctx.beginPath();
      ctx.ellipse(16, 10, 9, 14, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(13, -8, 3, 9, -0.1, 0, Math.PI * 2);
      ctx.ellipse(20, -7, 3, 9, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Miras Zeichnung
export function drawMiraDrawing(ctx, { back = false } = {}) {
  if (back) sheet(ctx, 290, 110, 700, 500, {
    angle: 0.02,
    color: '#fbf6e6',
    shade: '#efe6cc',
    inner: (c) => {
      if (back) {
        text(c, 'Für Papa', 350, 120, { font: `bold 42px ${HAND}`, color: '#c0392b', align: 'center' });
        text(c, 'Die Tür-Geheimzahl', 350, 220, { font: `32px ${HAND}`, color: '#2a63c9', align: 'center' });
        text(c, 'ist mein Geburtstag!', 350, 270, { font: `32px ${HAND}`, color: '#2a63c9', align: 'center' });
        text(c, '(der 7. 11. – nicht vergessen!!)', 350, 318, { font: `26px ${HAND}`, color: '#2a63c9', align: 'center' });
        text(c, '♥  Deine Mira  ♥', 350, 380, { font: `30px ${HAND}`, color: '#c0392b', align: 'center' });
      }
    },
  });
  if (!back) {
    const x = 300, y = 102, w = 680, h = 510; // Bild 4:3
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(0.02);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    drawPicture(ctx, 'assets/closeups/mira-zeichnung.webp', -w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent';
    text(ctx, 'Er bringt alle nach Hause', 0, -h / 2 + 62, { font: `bold 34px ${HAND}`, color: '#c0392b', align: 'center' });
    text(ctx, 'PAPA', w * 0.0, -h / 2 + h * 0.3, { font: `bold 28px ${HAND}`, color: '#fff3c4', align: 'center' });
    ctx.restore();
  }
  text(ctx, back ? 'Die Rückseite' : 'Rechtsklick: zurück  ·  Klicken: umdrehen', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// kleiner Lichtschein, wenn die Modellbahn fährt
export function drawToyGlow(ctx, on, time) {
  if (!on) return;
  glow(ctx, 180, 390, 60, '255, 230, 150', 0.2 + 0.05 * Math.sin(time * 6));
}

export { SERIF };
