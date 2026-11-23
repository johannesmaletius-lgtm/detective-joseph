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
  // Rahmen des Puppenhauses mit Dach
  wood(ctx, 240, 70, 800, 590, [120, 70, 36]);
  ctx.fillStyle = '#6a3a1a';
  ctx.beginPath();
  ctx.moveTo(220, 92);
  ctx.lineTo(640, 30);
  ctx.lineTo(1060, 92);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(560, 54, 160, 26);
  text(ctx, 'RINGBAHNHOF', 640, 74, { font: `bold 18px ${SERIF}`, color: '#3a2412', align: 'center' });

  // Rückwand: Tapete mit kleinen Rauten
  ctx.save();
  ctx.beginPath();
  ctx.rect(270, 100, 740, 360);
  ctx.clip();
  const wall = ctx.createLinearGradient(0, 100, 0, 460);
  wall.addColorStop(0, '#e6d6ae');
  wall.addColorStop(1, '#c9b386');
  ctx.fillStyle = wall;
  ctx.fillRect(270, 100, 740, 360);
  ctx.fillStyle = 'rgba(150, 90, 50, 0.18)';
  for (let y = 112; y < 460; y += 28) for (let x = 282 + ((y / 28) % 2) * 14; x < 1010; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x + 5, y);
    ctx.lineTo(x, y + 5);
    ctx.lineTo(x - 5, y);
    ctx.fill();
  }
  // Rundbogenfenster mit Schneenacht
  for (const wx of [330, 560]) {
    ctx.fillStyle = '#5a3a1c';
    archPath(ctx, wx - 6, 136, 102, 150);
    ctx.fill();
    const night = ctx.createLinearGradient(0, 140, 0, 290);
    night.addColorStop(0, '#16223e');
    night.addColorStop(1, '#2c3c5e');
    ctx.fillStyle = night;
    archPath(ctx, wx, 142, 90, 140);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let k = 0; k < 14; k++) {
      ctx.beginPath();
      ctx.arc(wx + 8 + ((k * 37) % 76), 160 + ((k * 53) % 110), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#eef2f8';
    ctx.fillRect(wx, 262, 90, 20);
    ctx.strokeStyle = '#5a3a1c';
    ctx.lineWidth = 4;
    line(ctx, wx + 45, 142, wx + 45, 282);
    line(ctx, wx, 220, wx + 90, 220);
  }
  // Hängelampen
  for (const lx of [455, 845]) {
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    line(ctx, lx, 100, lx, 140);
    glow(ctx, lx, 150, 120, '255, 210, 130', 0.35);
    ctx.fillStyle = '#2f4a3a';
    ctx.beginPath();
    ctx.moveTo(lx - 18, 152);
    ctx.lineTo(lx + 18, 152);
    ctx.lineTo(lx + 8, 138);
    ctx.lineTo(lx - 8, 138);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe6a0';
    ctx.beginPath();
    ctx.arc(lx, 154, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bahnhofsuhr am Ausleger – sie zeigt 23:47
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 5;
  line(ctx, 500, 100, 500, 128);
  ctx.fillStyle = '#2a1a0e';
  ctx.beginPath();
  ctx.arc(500, 170, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6efdc';
  ctx.beginPath();
  ctx.arc(500, 170, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ctx.lineWidth = k % 3 ? 1.5 : 3;
    line(ctx, 500 + Math.cos(a) * 30, 170 + Math.sin(a) * 30, 500 + Math.cos(a) * 36, 170 + Math.sin(a) * 36);
  }
  const ha = ((11 + 47 / 60) / 12) * Math.PI * 2 - Math.PI / 2, ma = (47 / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  line(ctx, 500, 170, 500 + Math.cos(ha) * 18, 170 + Math.sin(ha) * 18);
  ctx.lineWidth = 2.5;
  line(ctx, 500, 170, 500 + Math.cos(ma) * 28, 170 + Math.sin(ma) * 28);
  ctx.lineCap = 'butt';
  ctx.restore();

  // Bahnsteig: Fliesen, gelbe Kante
  const plat = ctx.createLinearGradient(0, 460, 0, 630);
  plat.addColorStop(0, '#b9bfc8');
  plat.addColorStop(1, '#8a929e');
  ctx.fillStyle = plat;
  ctx.fillRect(270, 460, 740, 170);
  ctx.strokeStyle = 'rgba(60, 60, 70, 0.25)';
  ctx.lineWidth = 1;
  for (let y = 490; y < 630; y += 30) line(ctx, 270, y, 1010, y);
  for (let x = 270; x < 1010; x += 40) line(ctx, x, 460, x - 30, 630);
  ctx.fillStyle = '#e0b84a';
  ctx.fillRect(270, 452, 740, 8);
  // Bank am Bahnsteig
  ctx.fillStyle = '#7a4a24';
  ctx.fillRect(490, 520, 120, 10);
  ctx.fillRect(490, 498, 120, 8);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(496, 530, 6, 26);
  ctx.fillRect(598, 530, 6, 26);

  // Der Spielzeugwagen von Zug 24 mit zwei Fenstern (dort sitzen die Figuren)
  const car = ctx.createLinearGradient(0, 230, 0, 432);
  car.addColorStop(0, '#3f6fa2');
  car.addColorStop(1, '#1f3a5e');
  ctx.fillStyle = car;
  ctx.beginPath();
  ctx.moveTo(660, 244);
  ctx.quadraticCurveTo(825, 214, 990, 244);
  ctx.lineTo(990, 432);
  ctx.lineTo(660, 432);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d9b25a';
  ctx.fillRect(660, 404, 330, 6);
  for (const slot of FIGURE_SLOTS.slice(1)) {
    ctx.fillStyle = '#ffe2a0';
    ctx.fillRect(slot.x - 4, slot.y - 4, slot.w + 8, slot.h + 8);
    const inside = ctx.createLinearGradient(0, slot.y, 0, slot.y + slot.h);
    inside.addColorStop(0, '#7a4a2a');
    inside.addColorStop(1, '#3a2010');
    ctx.fillStyle = inside;
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
    glow(ctx, slot.x + slot.w / 2, slot.y + 20, 70, '255, 220, 150', 0.35);
  }
  ctx.fillStyle = '#121a26';
  for (const wx of [690, 950]) {
    ctx.beginPath();
    ctx.arc(wx, 436, 14, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'ZUG 24', 825, 236, { font: `bold 18px ${PRINT}`, color: '#f6e7c0', align: 'center' });

  text(ctx, 'Wo stand wer in jener Nacht?', 640, 650, { font: `italic 18px ${SERIF}`, color: '#f1e0b8', align: 'center' });
}

function archPath(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + w / 2);
  ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
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
