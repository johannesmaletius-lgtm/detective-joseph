import { roundedRect, wrapText } from './text.js';

// Gezeichnete Blätter und Ansichten für die Wagen 2 bis 4 (als Karte anzeigen, siehe overlay.js):
//   await story.card({ draw: drawBon });

const PRINT = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const TYPEWRITER = '"Courier New", "Courier", monospace';
const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
const CHALK = '"Chalkboard SE", "Chalkboard", "Noteworthy", "Comic Sans MS", cursive';
const INK = '#2b2118';
const BLUE_INK = '#27408f';
const RED = '#b3261e';

function shadowed(ctx, draw) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  draw();
  ctx.restore();
}

function paper(ctx, x, y, width, height, colors = ['#f5efe0', '#e6dcc4']) {
  shadowed(ctx, () => {
    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
  });
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

// ============================================================================================
//  Speisewagen
// ============================================================================================

export function drawMenuBoard(ctx) {
  const width = 620, height = 500, x = 640 - width / 2, y = 340 - height / 2;
  shadowed(ctx, () => {
    ctx.fillStyle = '#6b4221';
    roundedRect(ctx, x - 18, y - 18, width + 36, height + 36, 12);
    ctx.fill();
  });
  ctx.fillStyle = '#1f2a24';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 8; i++) ctx.fillRect(x + 20 + i * 70, y + 30 + (i % 3) * 120, 90, 50);
  ctx.fillStyle = 'rgba(245, 245, 235, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 40px ${CHALK}`;
  ctx.fillText('Menü der Runde', 640, y + 66);
  ctx.font = `24px ${CHALK}`;
  ctx.fillText('~ für Tisch 4 ~', 640, y + 100);
  ctx.font = `28px ${CHALK}`;
  ['Tomatensuppe', 'Kalbsbraten mit Klößen', 'Ringbahn-Pudding'].forEach((dish, i) => ctx.fillText(dish, 640, y + 160 + i * 44));
  ctx.strokeStyle = 'rgba(245, 245, 235, 0.6)';
  ctx.lineWidth = 2;
  line(ctx, x + 120, y + 288, x + width - 120, y + 288);
  ctx.font = `bold 26px ${CHALK}`;
  ctx.fillText('Getränke', 640, y + 326);
  ctx.font = `24px ${CHALK}`;
  ctx.textAlign = 'left';
  [['Platz 1', 'Weißwein'], ['Platz 2', 'Rotwein'], ['Platz 3', 'Wasser'], ['Platz 4', 'Orangensaft']].forEach(([seat, drink], i) => {
    const cx = x + 90 + (i % 2) * 250, cy = y + 370 + Math.floor(i / 2) * 40;
    ctx.fillText(`${seat}: ${drink}`, cx, cy);
  });
  ctx.textAlign = 'center';
  ctx.font = `19px ${CHALK}`;
  ctx.fillStyle = 'rgba(245, 245, 235, 0.55)';
  ctx.fillText('Serviert wird nach jedem Tunnel. Angestoßen im Dunkeln.', 640, y + height - 24);
}

export function drawBon(ctx) {
  const width = 360, height = 520, x = 640 - width / 2, y = 345 - height / 2;
  ctx.save();
  ctx.translate(640, 345);
  ctx.rotate(0.02);
  ctx.translate(-640, -345);
  shadowed(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    for (let i = 0; i <= 12; i++) ctx.lineTo(x + width - (i * width) / 12, y + height - (i % 2 ? 12 : 0));
    ctx.closePath();
    ctx.fillStyle = '#fbf7ee';
    ctx.fill();
  });
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 24px ${TYPEWRITER}`;
  ctx.fillText('SPEISEWAGEN', 640, y + 50);
  ctx.font = `16px ${TYPEWRITER}`;
  ctx.fillText('Bestellung · Tisch 4', 640, y + 78);
  ctx.fillText('Runde: jede', 640, y + 100);
  ctx.strokeStyle = INK;
  ctx.setLineDash([6, 5]);
  ctx.lineWidth = 1.5;
  line(ctx, x + 24, y + 116, x + width - 24, y + 116);
  ctx.setLineDash([]);
  ctx.textAlign = 'left';
  const rows = [
    ['Platz 1', 'Weißwein'],
    ['Platz 2', 'Rotwein'],
    ['', '+ 1 Schuss'],
    ['', '  Probe 41'],
    ['Platz 3', 'Wasser'],
    ['Platz 4', 'Orangensaft'],
  ];
  rows.forEach(([seat, drink], i) => {
    ctx.font = `bold 18px ${TYPEWRITER}`;
    ctx.fillText(seat, x + 30, y + 152 + i * 34);
    ctx.font = `18px ${TYPEWRITER}`;
    ctx.fillText(drink, x + 140, y + 152 + i * 34);
  });
  // „Probe 41“ von Hand eingekreist
  ctx.strokeStyle = RED;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(x + 220, y + 245, 110, 38, -0.04, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  line(ctx, x + 24, y + 362, x + width - 24, y + 362);
  ctx.setLineDash([]);
  ctx.font = `16px ${TYPEWRITER}`;
  ctx.fillText('Bestellt von:', x + 30, y + 398);
  ctx.fillStyle = BLUE_INK;
  ctx.font = `46px ${HAND}`;
  ctx.fillText('J.', x + 190, y + 420);
  ctx.restore();
}

// ============================================================================================
//  Gepäckwagen
// ============================================================================================

export function drawManifest(ctx) {
  const width = 560, height = 600, x = 640 - width / 2, y = 345 - height / 2;
  paper(ctx, x, y, width, height, ['#f3ecd8', '#e2d6b6']);
  // Klemmbrett-Klammer
  ctx.fillStyle = '#8a8a8a';
  roundedRect(ctx, 640 - 70, y - 22, 140, 40, 8);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 26px ${TYPEWRITER}`;
  ctx.fillText('FRACHTLISTE', x + 34, y + 60);
  ctx.font = `15px ${TYPEWRITER}`;
  ctx.fillText('Gepäckwagen · Ringbahn · Ziel: Ringbahnhof', x + 34, y + 86);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  line(ctx, x + 30, y + 100, x + width - 30, y + 100);
  const rows = [
    ['Kiste 1', 'Fahrkarten („gültig für 1 Runde“)'],
    ['Kiste 2', 'Stroh, Holzwolle'],
    ['Kiste 3', 'Futter für Kasimir'],
    ['Kiste 4', 'Ersatz-Glühbirnen'],
    ['1 Papagei', '„Kasimir“ – gehört Frau Adler'],
    ['1 Schrankkoffer', 'NICHT ÖFFNEN'],
    ['Postsäcke', 'Briefe aus späteren Runden'],
    ['Koffer Nr. 7', 'Detektei J. – Zahlenschloss'],
  ];
  rows.forEach(([what, note], i) => {
    ctx.font = `bold 16px ${TYPEWRITER}`;
    ctx.fillText(what, x + 34, y + 140 + i * 40);
    ctx.font = `16px ${TYPEWRITER}`;
    ctx.fillText(note, x + 210, y + 140 + i * 40);
  });
  ctx.fillStyle = BLUE_INK;
  ctx.font = `22px ${HAND}`;
  ctx.save();
  ctx.translate(x + 60, y + height - 64);
  ctx.rotate(-0.03);
  ctx.fillText('Kasimir merkt sich alles. Füttern hilft.', 0, 0);
  ctx.restore();
  ctx.fillStyle = RED;
  ctx.font = `bold 15px ${PRINT}`;
  ctx.fillText('Der Schaffner: Brandt', x + width - 200, y + height - 24);
}

export function drawMailLetter(ctx) {
  const width = 560, height = 470, x = 640 - width / 2, y = 345 - height / 2;
  paper(ctx, x, y, width, height);
  // Briefmarke und Stempel
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(x + width - 110, y + 26, 70, 84);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + width - 104, y + 32, 58, 72);
  ctx.save();
  ctx.translate(x + width - 140, y + 90);
  ctx.rotate(-0.25);
  ctx.strokeStyle = 'rgba(40, 40, 120, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(40, 40, 120, 0.8)';
  ctx.font = `bold 15px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.fillText('RUNDE 43', 0, -4);
  ctx.font = `12px ${PRINT}`;
  ctx.fillText('Ringbahnhof', 0, 14);
  ctx.restore();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = `20px ${TYPEWRITER}`;
  ctx.fillText('An: Joseph', x + 40, y + 60);
  ctx.fillText('Gepäckwagen', x + 40, y + 86);
  ctx.fillStyle = BLUE_INK;
  ctx.font = `25px ${HAND}`;
  const text = [
    'Wenn du das liest, bist du im Gepäckwagen. Gut.',
    'Er versteckt sich im Schrankkoffer. Er kommt erst raus, wenn die Tür zum Postwagen offen ist.',
    'Hab keine Angst vor ihm. Er ist nur müde.',
  ];
  let ty = y + 150;
  for (const paragraph of text) {
    for (const row of wrapText(ctx, paragraph, width - 80)) {
      ctx.fillText(row, x + 40, ty);
      ty += 34;
    }
    ty += 12;
  }
  ctx.textAlign = 'right';
  ctx.fillText('– J.', x + width - 40, y + height - 30);
}

export function drawPhoto(ctx) {
  const width = 420, height = 500;
  ctx.save();
  ctx.translate(640, 340);
  ctx.rotate(0.03);
  shadowed(ctx, () => {
    ctx.fillStyle = '#f4efe2';
    ctx.fillRect(-width / 2, -height / 2, width, height);
  });
  const pw = width - 50, ph = height - 120;
  const gradient = ctx.createLinearGradient(0, -height / 2 + 25, 0, -height / 2 + 25 + ph);
  gradient.addColorStop(0, '#6a5d50');
  gradient.addColorStop(1, '#2b2520');
  ctx.fillStyle = gradient;
  ctx.fillRect(-pw / 2, -height / 2 + 25, pw, ph);
  // Bahnsteig, Schild
  ctx.fillStyle = '#4a4038';
  ctx.fillRect(-pw / 2, 60, pw, 50);
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(-90, -height / 2 + 50, 180, 34);
  ctx.fillStyle = '#2b2520';
  ctx.font = `bold 18px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.fillText('RINGBAHNHOF', 0, -height / 2 + 74);
  // zwei gleiche Männer mit Schal
  for (const dx of [-70, 70]) {
    ctx.fillStyle = '#d8c4a2';
    ctx.beginPath();
    ctx.arc(dx, -40, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5a3a24';
    ctx.beginPath();
    ctx.arc(dx, -52, 26, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#6b4a30';
    ctx.fillRect(dx - 34, -12, 68, 110);
    ctx.fillStyle = '#ece2c4';
    ctx.beginPath();
    ctx.moveTo(dx - 28, -16);
    ctx.lineTo(dx + 28, -16);
    ctx.lineTo(dx + 10, 20);
    ctx.lineTo(dx - 10, 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(dx + 6, 0, 10, 50);
  }
  // die beiden geben sich die Hand
  ctx.strokeStyle = '#6b4a30';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-36, 30);
  ctx.lineTo(0, 46);
  ctx.lineTo(36, 30);
  ctx.stroke();
  ctx.fillStyle = BLUE_INK;
  ctx.font = `26px ${HAND}`;
  ctx.fillText('Runde 1. Wir zwei. Nie wieder getrennt.', 0, height / 2 - 40);
  ctx.restore();
}
