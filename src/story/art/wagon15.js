import { drawSymbol } from './wagon13.js';
import { HAND, INK, PRINT, SERIF, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 15 (Spielzimmer): die vierzehn Modellbahn-Wagen, das Innere des
// Puppenhaus-Bahnhofs mit den Figuren und Miras Zeichnung.

// ---------------------------------------------------------------- Modellbahn
// Jeder Mini-Wagen hat ein winziges Zeichen für einen der Wagen 1–14
export const MINI = ['bench', 'suitcase', 'letter', 'glass', 'bed', 'umbrella', 'whisky', 'film', 'mirror', 'horn', 'clock', 'note', 'chapel', 'newspaper'];
const COLORS = ['#3a6ea5', '#a5463a', '#3a8a5a', '#8a3a7a', '#b07a2a', '#4a4a8a', '#7a5a3a', '#2a2a2a', '#9aa0a8', '#6a7a3a', '#a0703a', '#5a2a4a', '#8a6a4a', '#606060'];
const START = [9, 3, 12, 0, 6, 13, 2, 10, 5, 8, 1, 11, 4, 7]; // Mini-Wagen auf Platz 0, 1, …

export const MINI_SLOTS = Array.from({ length: 14 }, (_, i) => ({
  x: 160 + (i % 7) * 140,
  y: 210 + Math.floor(i / 7) * 220,
  w: 124,
  h: 86,
  label: `${i + 1}`,
}));

export const MINI_TOKENS = START.map((wagon, slot) => ({ id: `mini${wagon}`, wagon, slot }));

export function drawRailwayTable(ctx) {
  wood(ctx, 100, 80, 1080, 580, [110, 70, 36]);
  ctx.fillStyle = '#4f7a3a';
  ctx.fillRect(130, 110, 1020, 520);
  // Gleise unter den Plätzen
  for (let r = 0; r < 2; r++) {
    const y = 210 + r * 220 + 70;
    ctx.strokeStyle = '#5a4630';
    ctx.lineWidth = 6;
    for (let x = 140; x < 1140; x += 22) line(ctx, x, y - 8, x, y + 18);
    ctx.strokeStyle = '#a9a9a9';
    ctx.lineWidth = 3;
    line(ctx, 130, y - 2, 1150, y - 2);
    line(ctx, 130, y + 12, 1150, y + 12);
  }
  // Spielzeugtunnel rechts, Lok links
  ctx.fillStyle = '#c96a4a';
  ctx.beginPath();
  ctx.arc(1150, 500, 80, Math.PI, Math.PI * 1.5);
  ctx.lineTo(1150, 500);
  ctx.fill();
  text(ctx, 'Lok →', 120, 300, { font: `bold 16px ${PRINT}`, color: '#f3e2b4' });
  text(ctx, '→ Tunnel', 1060, 610, { font: `bold 16px ${PRINT}`, color: '#f3e2b4' });
  text(ctx, 'Hinter der Lok der erste Wagen. „Papa hat sie immer richtig hingestellt.“', 640, 645, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
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
  { id: 'platform', x: 340, y: 430, w: 110, h: 170, label: 'Bahnsteig' },
  { id: 'train1', x: 700, y: 250, w: 110, h: 150, label: 'Zug, Fenster 1' },
  { id: 'train2', x: 840, y: 250, w: 110, h: 150, label: 'Zug, Fenster 2' },
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

export function drawDollhouseInside(ctx) {
  wood(ctx, 240, 70, 800, 590, [120, 70, 36]);
  // Bahnhofshalle
  ctx.fillStyle = '#d9c9a2';
  ctx.fillRect(270, 100, 740, 360);
  ctx.fillStyle = '#9aa7b8';
  ctx.fillRect(270, 460, 740, 170);
  // Bahnsteigkante und Gleis
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(270, 456, 740, 12);
  // Wagen des Spielzeugzugs
  ctx.fillStyle = '#2f5a8a';
  ctx.fillRect(660, 230, 330, 200);
  ctx.fillStyle = '#1b2b40';
  ctx.fillRect(660, 420, 330, 14);
  text(ctx, 'ZUG 24', 825, 222, { font: `bold 20px ${PRINT}`, color: '#2f2318', align: 'center' });
  // Bahnhofsuhr
  ctx.fillStyle = '#f3ead2';
  ctx.beginPath();
  ctx.arc(480, 170, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();
  line(ctx, 480, 170, 480, 138);
  line(ctx, 480, 170, 456, 182);
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
    ctx.fillStyle = '#f1cfae';
    ctx.beginPath();
    ctx.arc(0, -36, 16, 0, Math.PI * 2);
    ctx.fill();
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
  sheet(ctx, 290, 110, 700, 500, {
    angle: 0.02,
    color: '#fbf6e6',
    shade: '#efe6cc',
    inner: (c) => {
      if (back) {
        text(c, 'Für Papa', 350, 120, { font: `bold 42px ${HAND}`, color: '#c0392b', align: 'center' });
        text(c, 'Die Tür-Geheimzahl', 350, 220, { font: `32px ${HAND}`, color: '#2a63c9', align: 'center' });
        text(c, 'ist Heiligabend!', 350, 270, { font: `32px ${HAND}`, color: '#2a63c9', align: 'center' });
        text(c, '♥  Deine Mira  ♥', 350, 380, { font: `30px ${HAND}`, color: '#c0392b', align: 'center' });
        return;
      }
      // Wachsmalstift: ein großer schwarzer Tunnel, ein Mann mit Mütze und Schal, kleine Leute dahinter
      c.fillStyle = '#2a2a2a';
      c.beginPath();
      c.arc(520, 330, 130, Math.PI, 0);
      c.lineTo(650, 460);
      c.lineTo(390, 460);
      c.fill();
      c.strokeStyle = '#5a5a5a';
      c.lineWidth = 6;
      line(c, 40, 460, 660, 460);
      const people = [[110, '#c0392b'], [170, '#2a63c9'], [230, '#3f8f5a'], [290, '#a0703a']];
      for (const [px, color] of people) {
        c.strokeStyle = color;
        c.lineWidth = 5;
        c.beginPath();
        c.arc(px, 340, 16, 0, Math.PI * 2);
        c.stroke();
        line(c, px, 356, px, 410);
        line(c, px, 410, px - 14, 456);
        line(c, px, 410, px + 14, 456);
        line(c, px - 18, 376, px + 18, 376);
      }
      // der Mann vorne – mit Mütze und weißem Schal
      const mx = 370;
      c.strokeStyle = '#6b3a1a';
      c.lineWidth = 6;
      c.beginPath();
      c.arc(mx, 300, 22, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = '#6b3a1a';
      c.fillRect(mx - 26, 270, 52, 14);
      c.strokeStyle = '#d8d8d8';
      c.lineWidth = 8;
      line(c, mx - 18, 330, mx + 22, 330);
      line(c, mx + 18, 330, mx + 26, 360);
      c.strokeStyle = '#6b3a1a';
      c.lineWidth = 6;
      line(c, mx, 324, mx, 400);
      line(c, mx, 400, mx - 18, 456);
      line(c, mx, 400, mx + 18, 456);
      line(c, mx, 350, mx - 44, 372); // Hand zum Nächsten
      text(c, 'PAPA', mx, 240, { font: `bold 30px ${HAND}`, color: '#6b3a1a', align: 'center' });
      text(c, 'Er bringt alle nach Hause', 350, 60, { font: `30px ${HAND}`, color: '#c0392b', align: 'center' });
      c.fillStyle = '#f3c95a';
      c.beginPath();
      c.arc(620, 80, 34, 0, Math.PI * 2);
      c.fill();
    },
  });
  text(ctx, back ? 'Die Rückseite' : 'Rechtsklick: zurück  ·  Klicken: umdrehen', 640, 650, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// kleiner Lichtschein, wenn die Modellbahn fährt
export function drawToyGlow(ctx, on, time) {
  if (!on) return;
  glow(ctx, 180, 390, 60, '255, 230, 150', 0.2 + 0.05 * Math.sin(time * 6));
}

export { SERIF };
