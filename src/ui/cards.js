import { MORSE } from '../effects/morse.js';
import { drawSymbol } from './symbols.js';
import { roundedRect, wrapText } from './text.js';

// Gezeichnete Blätter, die Joseph in die Hand nimmt: die Signaltafel der Ringbahn (auch das Bild
// für das Papierpuzzle) und seine Detektivakte. (Das Rätselheft ist eine eigene Nahansicht: src/puzzles/sudoku.js)
//
// Anzeigen als Karte (siehe overlay.js):
//   await story.card({ draw: (ctx) => drawSignalCard(ctx) });

const PRINT = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const TYPEWRITER = '"Courier New", "Courier", monospace';
const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
const INK = '#2b2118';
const BLUE_INK = '#27408f';
const RED_PENCIL = '#b3261e';

// ============================================================================================
//  Signaltafel der Ringbahn (600 × 420) – das Blatt, das zerrissen im Abteil herumliegt
// ============================================================================================
export const SHEET = { width: 600, height: 420 };

// Zeichnet das ganze Blatt mit der linken oberen Ecke bei (0, 0).
export function drawSignalSheet(ctx) {
  const { width, height } = SHEET;
  // Papier: vergilbt, fleckig, mit Knicken
  const paper = ctx.createLinearGradient(0, 0, width, height);
  paper.addColorStop(0, '#efe3c2');
  paper.addColorStop(0.55, '#e6d5a9');
  paper.addColorStop(1, '#d8c391');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);
  for (const [x, y, r, a] of [[90, 330, 70, 0.1], [470, 80, 90, 0.07], [330, 250, 50, 0.06], [560, 390, 60, 0.12]]) {
    const stain = ctx.createRadialGradient(x, y, 0, x, y, r);
    stain.addColorStop(0, `rgba(120, 80, 30, ${a})`);
    stain.addColorStop(1, 'rgba(120, 80, 30, 0)');
    ctx.fillStyle = stain;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.strokeStyle = 'rgba(90, 60, 25, 0.16)';
  ctx.lineWidth = 1.5;
  line(ctx, 300, 0, 304, height);
  line(ctx, 0, 212, width, 208);

  // Kopf
  ctx.fillStyle = INK;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  ctx.font = `bold 34px ${PRINT}`;
  ctx.fillText('RINGBAHN', 26, 50);
  ctx.font = `15px ${PRINT}`;
  ctx.fillText('Streckenplan  ·  Fahrplan  ·  Lichtsignale', 214, 48);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  line(ctx, 26, 62, width - 26, 62);
  ctx.lineWidth = 1;
  line(ctx, 26, 67, width - 26, 67);

  drawRouteMap(ctx, 148, 196, 86);
  drawTimetable(ctx, 16, 354);
  drawSignalTable(ctx, 300, 88, 280, 250);

  // Handschrift (blaue Tinte)
  ctx.fillStyle = BLUE_INK;
  ctx.strokeStyle = BLUE_INK;
  ctx.font = `21px ${HAND}`;
  ctx.save();
  ctx.translate(318, 388);
  ctx.rotate(-0.04);
  ctx.fillText('Er buchstabiert eine Zahl!', 0, 0);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(236, -8);
  ctx.quadraticCurveTo(258, -18, 250, -34);
  ctx.moveTo(243, -27);
  ctx.lineTo(250, -34);
  ctx.lineTo(258, -28);
  ctx.stroke();
  ctx.restore();
}

// Die Strecke von oben: ein Kreis. In der Mitte der Turm, unten der Tunnel, ringsum Laternen.
function drawRouteMap(ctx, cx, cy, radius) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (const r of [radius - 4, radius + 4]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 56; i++) { // Schwellen
    const a = (i / 56) * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * (radius - 8), cy + Math.sin(a) * (radius - 8), cx + Math.cos(a) * (radius + 8), cy + Math.sin(a) * (radius + 8));
  }
  // Tunnel unten: ein Stück der Strecke ist überdacht
  ctx.fillStyle = '#e6d5a9';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, Math.PI * 0.39, Math.PI * 0.61);
  ctx.lineWidth = 22;
  ctx.strokeStyle = INK;
  ctx.stroke();
  drawSymbol(ctx, 'tunnel', cx - 22, cy + radius + 34, 24, INK);
  ctx.fillStyle = INK;
  ctx.font = `bold 11px ${PRINT}`;
  ctx.textAlign = 'left';
  ctx.fillText('TUNNEL', cx - 4, cy + radius + 39);

  // Turm in der Mitte
  drawSymbol(ctx, 'tower', cx, cy - 4, 46, INK);
  ctx.beginPath();
  ctx.arc(cx, cy - 19, 4, 0, Math.PI * 2);
  ctx.fillStyle = RED_PENCIL;
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = `bold 11px ${PRINT}`;
  ctx.fillText('SIGNALTURM', cx, cy + 36);
  // Fahrtrichtung
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 24, -2.2, -1.5);
  ctx.stroke();
  const ax = cx + Math.cos(-1.5) * (radius + 24), ay = cy + Math.sin(-1.5) * (radius + 24);
  ctx.beginPath();
  ctx.moveTo(ax - 9, ay - 7);
  ctx.lineTo(ax + 2, ay);
  ctx.lineTo(ax - 8, ay + 8);
  ctx.stroke();

  // Jemand hat mit blauer Tinte Kreise um Kreise gemalt
  ctx.strokeStyle = 'rgba(39, 64, 143, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 150; i++) {
    const a = (i / 50) * Math.PI * 2 + 0.6;
    const r = radius + 36 + Math.sin(i * 0.9) * 3 + i * 0.04;
    const x = cx + Math.cos(a) * r * 1.04, y = cy + Math.sin(a) * r * 0.98;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

// Der Fahrplan: Abfahrt und Ankunft sind derselbe Bahnhof, alle Zeiten gleich
function drawTimetable(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = `bold 12px ${PRINT}`;
  ctx.fillText('ab', x + 6, y + 15);
  ctx.fillText('an', x + 6, y + 37);
  ctx.font = `13px ${PRINT}`;
  ['Ringbahnhof', 'Ringbahnhof'].forEach((station, i) => ctx.fillText(station, x + 34, y + 15 + i * 22));
  ctx.font = `bold 13px ${TYPEWRITER}`;
  ['00:00', '00:00'].forEach((time, i) => ctx.fillText(time, x + 138, y + 15 + i * 22));
  ctx.font = `11px ${PRINT}`;
  ctx.fillText('Gilt 1 Runde.', x + 197, y + 15);
  ctx.fillText('Kein Halt.', x + 197, y + 37);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y, 276, 46);
  line(ctx, x, y + 23, x + 276, y + 23);
  line(ctx, x + 28, y, x + 28, y + 46);
  line(ctx, x + 130, y, x + 130, y + 46);
  line(ctx, x + 190, y, x + 190, y + 46);
  ctx.restore();
}

// Die Tabelle: welche Ziffer wie blinkt
function drawSignalTable(ctx, x, y, width, height) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 250, 230, 0.35)';
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, width, 30);
  ctx.fillStyle = '#efe3c2';
  ctx.font = `bold 14px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LICHTSIGNALE DES TURMS', x + width / 2, y + 16);

  // Das Morsealphabet in drei Spalten
  const rowHeight = 20;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const columnWidth = width / 3;
  letters.forEach((letter, i) => {
    const column = Math.floor(i / 9), row = i % 9;
    const left = x + 10 + column * columnWidth;
    const cy = y + 48 + row * rowHeight;
    ctx.fillStyle = INK;
    ctx.font = `bold 15px ${PRINT}`;
    ctx.textAlign = 'left';
    ctx.fillText(letter, left, cy + 1);
    drawMarks(ctx, MORSE[letter], left + 20, cy, INK, 0.62);
  });
  ctx.lineWidth = 1;
  line(ctx, x + columnWidth, y + 36, x + columnWidth, y + 214);
  line(ctx, x + 2 * columnWidth, y + 36, x + 2 * columnWidth, y + 214);
  line(ctx, x + 8, y + 220, x + width - 8, y + 220);
  // Legende
  ctx.fillStyle = INK;
  ctx.font = `12px ${PRINT}`;
  ctx.textAlign = 'left';
  ctx.beginPath();
  ctx.arc(x + 24, y + 235, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('kurzes Licht', x + 36, y + 236);
  ctx.fillRect(x + 142, y + 231, 14, 8);
  ctx.fillText('langes Licht', x + 164, y + 236);
  ctx.restore();
}

// Punkte und Striche: '.' = kurz (Punkt), '-' = lang (Balken)
export function drawMarks(ctx, marks, x, y, color, scale = 1) {
  ctx.save();
  ctx.fillStyle = color;
  let cursor = x;
  for (const mark of marks) {
    if (mark === '-') {
      ctx.fillRect(cursor, y - 3.5 * scale, 13 * scale, 7 * scale);
      cursor += 19 * scale;
    } else {
      ctx.beginPath();
      ctx.arc(cursor + 4 * scale, y, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      cursor += 14 * scale;
    }
  }
  ctx.restore();
}

// Die fertige Signaltafel als Karte, groß in der Bildmitte
export function drawSignalCard(ctx) {
  const scale = 1.45;
  ctx.save();
  ctx.translate(640, 338);
  ctx.rotate(-0.012);
  ctx.scale(scale, scale);
  ctx.translate(-SHEET.width / 2, -SHEET.height / 2);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#e6d5a9';
  ctx.fillRect(0, 0, SHEET.width, SHEET.height);
  ctx.shadowColor = 'transparent';
  drawSignalSheet(ctx);
  // Risse: Das Blatt ist aus Fetzen zusammengesetzt
  ctx.strokeStyle = 'rgba(70, 45, 20, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([7, 4]);
  line(ctx, 146, 0, 156, SHEET.height);
  line(ctx, 304, 0, 296, SHEET.height);
  line(ctx, 452, 0, 446, SHEET.height);
  line(ctx, 0, 136, SHEET.width, 144);
  line(ctx, 0, 284, SHEET.width, 278);
  ctx.restore();
}

// ============================================================================================
//  Josephs Detektivakte aus dem Koffer
// ============================================================================================
export function drawCaseFile(ctx) {
  const width = 540, height = 580;
  ctx.save();
  ctx.translate(640, 356);
  ctx.rotate(-0.02);
  ctx.translate(-width / 2, -height / 2);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  // Aktendeckel mit Reiter
  ctx.fillStyle = '#c9a56a';
  roundedRect(ctx, -14, -12, width + 28, height + 24, 10);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#c9a56a';
  roundedRect(ctx, width - 170, -40, 150, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#5a3b16';
  ctx.font = `bold 15px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NACHTZUG', width - 95, -20);
  // Blatt
  const paper = ctx.createLinearGradient(0, 0, 0, height);
  paper.addColorStop(0, '#f5efe0');
  paper.addColorStop(1, '#e6dcc4');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold 22px ${TYPEWRITER}`;
  ctx.fillText('DETEKTEI  J.', 40, 58);
  ctx.font = `bold 16px ${TYPEWRITER}`;
  ctx.fillText('AKTE Nr. 41', 40, 84);
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  line(ctx, 40, 98, width - 40, 98);

  ctx.font = `16px ${TYPEWRITER}`;
  const typed = [
    ['Fall:', 'Der verschwundene Nachtzug'],
    ['Auftrag:', 'Zug finden. Fahrgäste finden.'],
    ['Stand:', 'Zug gefunden.'],
    ['', 'Ich sitze drin.'],
    ['Fahrgäste:', 'keine. Nur Schritte.'],
    ['Ziel:', 'Ringbahnhof (gibt es nicht)'],
  ];
  typed.forEach(([label, value], i) => {
    ctx.font = `bold 16px ${TYPEWRITER}`;
    ctx.fillText(label, 40, 136 + i * 30);
    ctx.font = `16px ${TYPEWRITER}`;
    ctx.fillText(value, 170, 136 + i * 30);
  });
  line(ctx, 40, 322, width - 40, 322);

  // Stempel
  ctx.save();
  ctx.translate(424, 62);
  ctx.rotate(-0.16);
  ctx.strokeStyle = 'rgba(179, 38, 30, 0.75)';
  ctx.fillStyle = 'rgba(179, 38, 30, 0.75)';
  ctx.lineWidth = 3;
  ctx.strokeRect(-76, -24, 152, 48);
  ctx.font = `bold 24px ${PRINT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNGELÖST', 0, 2);
  ctx.restore();

  // Handschrift
  ctx.fillStyle = BLUE_INK;
  ctx.font = `23px ${HAND}`;
  const notes = [
    'Er kommt im Tunnel. Jede Runde.',
    'Ich sehe ihn nie. Ich höre nur seine Schritte.',
    'Im Tunnel hängt eine Kamera – der Verteilerkasten!',
    'Das Fernglas ist für den Turm.',
  ];
  let y = 364;
  for (const note of notes) {
    for (const row of wrapText(ctx, note, width - 90)) {
      ctx.fillText(row, 46, y);
      y += 32;
    }
    y += 10;
  }
  ctx.font = `20px ${HAND}`;
  ctx.textAlign = 'right';
  ctx.fillText('Runde 41?  42?  Ich zähle nicht mehr.', width - 40, height - 30);
  ctx.restore();
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}
