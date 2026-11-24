import { HAND, INK, PRINT, SERIF, drawPicture, glow, line, sheet, text } from './common.js';

// Gezeichnetes für Wagen 15 (Spielzimmer): die vierzehn Modellbahn-Wagen, das Innere des
// Puppenhaus-Bahnhofs mit den Figuren und Miras Zeichnung.

// ---------------------------------------------------------------- Modellbahn
// Jeder Mini-Wagen hat ein winziges Zeichen für einen der Wagen 1–14 (gezeichnet in railway.js)
export const MINI = ['bench', 'suitcase', 'letter', 'glass', 'bed', 'umbrella', 'whisky', 'film', 'mirror', 'horn', 'clock', 'note', 'chapel', 'newspaper'];
export const MINI_START = [9, 3, 12, 0, 6, 13, 2, 10, 5, 8, 1, 11, 4, 7]; // Mini-Wagen auf Platz 0, 1, …

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
  const cx = 352, cy = 287, r = 40;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = 2;
    line(ctx, cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95);
  }
  const minute = ((47 / 60) * Math.PI * 2) - Math.PI / 2;
  const hour = (((11 + 47 / 60) / 12) * Math.PI * 2) - Math.PI / 2;
  ctx.lineWidth = 4;
  line(ctx, cx, cy, cx + Math.cos(hour) * r * 0.5, cy + Math.sin(hour) * r * 0.5);
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(minute) * r * 0.78, cy + Math.sin(minute) * r * 0.78);
  ctx.lineCap = 'butt';
  text(ctx, 'ZUG 24', 865, 332, { font: `bold 15px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  text(ctx, 'Wo stand wer in jener Nacht?', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

export function drawFigure(ctx, token, x, y) {
  const figure = FIGURES.find((f) => f.id === token.id);
  ctx.save();
  ctx.translate(x, y);
  const body = { conductor: '#1f2a44', woman: '#7a3a3a', girl: '#3f5f34', cook: '#e8e2d2', dog: '#8a5a2a' }[figure.id];
  // Sockel
  ctx.fillStyle = '#5a3a1c';
  ctx.beginPath();
  ctx.ellipse(0, 62, 34, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  if (figure.id === 'dog') {
    ctx.fillStyle = body;
    ctx.fillRect(-26, 20, 52, 26);
    ctx.beginPath();
    ctx.arc(30, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-24, 44, 8, 16);
    ctx.fillRect(16, 44, 8, 16);
  } else {
    const small = figure.id === 'girl';
    const s = small ? 0.72 : 1;
    ctx.scale(s, s);
    ctx.translate(0, small ? 30 : 0);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-20, -20);
    ctx.lineTo(20, -20);
    ctx.lineTo(figure.id === 'woman' || small ? 30 : 22, 60);
    ctx.lineTo(figure.id === 'woman' || small ? -30 : -22, 60);
    ctx.fill();
    // Glanz auf dem lackierten Holz
    const shine = ctx.createLinearGradient(-20, 0, 20, 0);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shine.addColorStop(0.35, 'rgba(255, 255, 255, 0.28)');
    shine.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fillRect(-22, -20, 44, 80);
    ctx.fillStyle = '#f1cfae';
    ctx.beginPath();
    ctx.arc(0, -36, 16, 0, Math.PI * 2);
    ctx.fill();
    // gemaltes Gesicht
    ctx.fillStyle = '#2a1a10';
    ctx.beginPath();
    ctx.arc(-5, -38, 1.8, 0, Math.PI * 2);
    ctx.arc(5, -38, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 90, 80, 0.45)';
    ctx.beginPath();
    ctx.arc(-9, -32, 3, 0, Math.PI * 2);
    ctx.arc(9, -32, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a2a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -32, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (figure.id === 'conductor') {
      ctx.fillStyle = '#121a2c';
      ctx.fillRect(-18, -58, 36, 12);
      ctx.fillRect(-22, -48, 44, 5);
      ctx.fillStyle = '#d9b25a';
      ctx.fillRect(-4, -56, 8, 6);
    }
    if (figure.id === 'cook') {
      ctx.fillStyle = '#fbf8ef';
      ctx.fillRect(-14, -72, 28, 22);
    }
    if (figure.id === 'woman') {
      ctx.fillStyle = '#4a2a1a';
      ctx.beginPath();
      ctx.arc(0, -44, 17, Math.PI, 0);
      ctx.fill();
    }
    if (small) {
      ctx.fillStyle = '#d8c3a0';
      ctx.beginPath();
      ctx.ellipse(16, 10, 9, 14, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(12, -10, 4, 10);
      ctx.fillRect(18, -10, 4, 10);
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
