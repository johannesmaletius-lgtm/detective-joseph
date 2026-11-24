import { HAND, INK, PRINT, RED, SERIF, cached, glow, fineGrain, line, roundedRect, sheet, smudge, text, wood } from './common.js';

// Gezeichnetes für Wagen 4 (Speisewagen): Tischplan, Namenskärtchen, Tablett mit Gläsern,
// Speisekarte und Rechnung.

// ---------------------------------------------------------------- Tischplan (für die Ordnen-Ansicht)
const COLUMNS = [470, 810];
const ROWS = [236, 386, 536];
export const TABLE_IDS = ['LH', 'LM', 'LV', 'RH', 'RM', 'RV'];
export const SEAT_SLOTS = TABLE_IDS.map((id, i) => {
  const x = COLUMNS[i < 3 ? 0 : 1], y = ROWS[i % 3];
  return { x: x - 64, y: y - 26, w: 128, h: 52, label: `Tisch ${i + 1}` };
});

export function drawSeatingPlan(ctx) {
  ctx.drawImage(cached('w4-plan', 840, 670, paintSeatingPlan), 220, 40);
}

const BRUNO = '#3b2a1a';           // Brunos Bleistift/Tinte
const BRUNO_FONT = (size) => `${size}px ${HAND}`;

// Brunos Tischplan: der Speisewagen von oben, gedeckt für Heiligabend (einmal gezeichnet)
function paintSeatingPlan(c) {
  c.translate(30, 30);
  // Blatt
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 24;
  c.shadowOffsetY = 8;
  const paper = c.createLinearGradient(0, 0, 780, 610);
  paper.addColorStop(0, '#f6ecd2');
  paper.addColorStop(1, '#e2cfa2');
  c.fillStyle = paper;
  c.fillRect(0, 0, 780, 610);
  c.restore();
  fineGrain(c, 0, 0, 780, 610, { seed: 4, count: 0.03, dark: 0.06, light: 0.12, size: 1.2 });
  // Flecken aus der Küche
  smudge(c, 640, 8, 110, 90, 'rgba(150, 100, 50, 0.22)');
  smudge(c, 20, 540, 80, 60, 'rgba(150, 100, 50, 0.18)');
  c.strokeStyle = 'rgba(120, 70, 30, 0.35)';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(712, 52, 34, 0.3, Math.PI * 1.85);
  c.stroke();
  c.lineWidth = 1;
  c.beginPath();
  c.arc(712, 52, 29, 0.6, Math.PI * 1.6);
  c.stroke();
  // Überschrift in Brunos Schrift
  text(c, 'Heiligabend – Tischplan', 390, 40, { font: `bold ${BRUNO_FONT(28)}`, color: BRUNO, align: 'center' });
  c.strokeStyle = BRUNO;
  c.lineWidth = 2;
  c.beginPath();
  for (let x = 240; x <= 540; x += 10) c.lineTo(x, 50 + Math.sin(x * 0.15) * 1.5);
  c.stroke();

  // Wagen: Wände, Fenster, Tür
  const wall = (x, y, w, h) => {
    c.fillStyle = '#8f7c62';
    c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(43, 33, 24, 0.85)';
    c.lineWidth = 1.5;
    c.strokeRect(x, y, w, h);
  };
  // Boden mit Dielen
  c.fillStyle = 'rgba(140, 100, 60, 0.12)';
  c.fillRect(110, 70, 560, 510);
  c.strokeStyle = 'rgba(110, 80, 50, 0.16)';
  c.lineWidth = 1;
  for (let y = 86; y < 580; y += 16) line(c, 112, y, 668, y);
  // Teppich im Gang
  c.fillStyle = 'rgba(150, 40, 35, 0.32)';
  c.fillRect(352, 70, 76, 510);
  c.strokeStyle = 'rgba(200, 150, 70, 0.5)';
  c.lineWidth = 2;
  c.strokeRect(358, 70, 64, 510);
  for (let y = 100; y < 580; y += 36) {
    c.fillStyle = 'rgba(200, 150, 70, 0.4)';
    c.beginPath();
    c.moveTo(390, y - 8);
    c.lineTo(398, y);
    c.lineTo(390, y + 8);
    c.lineTo(382, y);
    c.fill();
  }
  wall(102, 62, 228, 10);
  wall(450, 62, 228, 10);
  wall(102, 578, 576, 10);
  wall(102, 62, 10, 526);
  wall(668, 62, 10, 526);
  // Fenster in den Seitenwänden
  for (const y of [138, 288, 438]) {
    for (const x of [102, 668]) {
      const glass = c.createLinearGradient(x, y, x + 10, y + 84);
      glass.addColorStop(0, '#b9d3e8');
      glass.addColorStop(1, '#7fa3c4');
      c.fillStyle = glass;
      c.fillRect(x + 1, y, 8, 84);
      c.strokeStyle = 'rgba(43, 33, 24, 0.8)';
      c.lineWidth = 1.2;
      c.strokeRect(x + 1, y, 8, 84);
      line(c, x + 1, y + 42, x + 9, y + 42);
    }
  }
  text(c, 'Fenster', 94, 334, { font: BRUNO_FONT(16), color: BRUNO, align: 'right' });
  text(c, 'Fenster', 686, 334, { font: BRUNO_FONT(16), color: BRUNO });
  // Tür oben mit Schwenkbogen
  c.strokeStyle = 'rgba(43, 33, 24, 0.7)';
  c.lineWidth = 1.5;
  c.setLineDash([4, 4]);
  c.beginPath();
  c.arc(330, 72, 120, 0, Math.PI / 2);
  c.stroke();
  c.setLineDash([]);
  c.lineWidth = 3;
  line(c, 330, 72, 330, 192);
  text(c, 'Tür', 390, 92, { font: `bold 15px ${PRINT}`, color: 'rgba(43, 33, 24, 0.75)', align: 'center' });
  text(c, '↑ nach vorn', 390, 112, { font: BRUNO_FONT(15), color: BRUNO, align: 'center' });
  // Küche mit Herd, Kasse mit Registrierkasse
  c.fillStyle = 'rgba(120, 100, 80, 0.22)';
  c.fillRect(112, 72, 92, 34);
  c.fillRect(576, 72, 92, 34);
  c.strokeStyle = 'rgba(43, 33, 24, 0.7)';
  c.lineWidth = 1.2;
  c.strokeRect(112, 72, 92, 34);
  c.strokeRect(576, 72, 92, 34);
  for (const x of [126, 148]) {
    c.beginPath();
    c.arc(x, 89, 8, 0, Math.PI * 2);
    c.stroke();
  }
  text(c, 'Küche', 182, 94, { font: `bold 12px ${PRINT}`, color: INK, align: 'center' });
  c.strokeRect(588, 80, 26, 18);
  c.strokeRect(592, 76, 18, 6);
  text(c, 'Kasse', 642, 94, { font: `bold 12px ${PRINT}`, color: INK, align: 'center' });
  // Seiten-Hinweise in Brunos Schrift
  text(c, 'hinten', 94, 172, { font: BRUNO_FONT(16), color: BRUNO, align: 'right' });
  text(c, 'vorne', 94, 482, { font: BRUNO_FONT(16), color: BRUNO, align: 'right' });
  c.save();
  c.translate(390, 336);
  c.rotate(-Math.PI / 2);
  text(c, 'Gang', 0, 6, { font: `bold 15px ${PRINT}`, color: 'rgba(250, 235, 200, 0.75)', align: 'center' });
  c.restore();

  // Die sechs Tische
  for (let i = 0; i < 6; i++) {
    const cx = COLUMNS[i < 3 ? 0 : 1] - 250, cy = ROWS[i % 3] - 70;
    drawTable(c, cx, cy, i);
  }

  // Brunos Randnotizen
  c.save();
  c.translate(724, 210);
  c.rotate(0.06);
  text(c, 'Tisch 6:', 0, 0, { font: BRUNO_FONT(17), color: BRUNO, align: 'center' });
  text(c, 'zwei', 0, 22, { font: BRUNO_FONT(17), color: BRUNO, align: 'center' });
  text(c, 'Gedecke!', 0, 44, { font: BRUNO_FONT(17), color: BRUNO, align: 'center' });
  c.restore();
  c.strokeStyle = BRUNO;
  c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(724, 266);
  c.quadraticCurveTo(735, 380, 700, 448);
  c.stroke();
  c.beginPath();
  c.moveTo(700, 448);
  c.lineTo(698, 434);
  c.moveTo(700, 448);
  c.lineTo(712, 440);
  c.stroke();
  text(c, 'Kerzen', 724, 530, { font: BRUNO_FONT(16), color: BRUNO, align: 'center' });
  text(c, 'um 22 Uhr', 724, 550, { font: BRUNO_FONT(16), color: BRUNO, align: 'center' });
  text(c, 'Wer hat die Kärtchen vertauscht?!', 390, 604, { font: BRUNO_FONT(21), color: BRUNO, align: 'center' });
  text(c, '– B.', 668, 604, { font: BRUNO_FONT(19), color: BRUNO, align: 'right' });
}

// Ein gedeckter Tisch mit Tischtuch, Stuhl, Gedeck, Kerze und Tannenzweig. Platz in der Mitte bleibt frei
// für das Namenskärtchen, unten für die Beschriftung „Tisch N“.
function drawTable(c, cx, cy, index) {
  const guests = index === 5 ? [-46, 46] : [0];
  // Stühle (nur die Lehne schaut hervor)
  for (const gx of guests) {
    c.fillStyle = '#6b4424';
    roundedRect(c, cx + gx - 22, cy - 60, 44, 14, 5);
    c.fill();
    c.strokeStyle = 'rgba(30, 15, 5, 0.8)';
    c.lineWidth = 1.2;
    c.stroke();
    c.fillStyle = '#9c2f2a';
    roundedRect(c, cx + gx - 17, cy - 57, 34, 8, 3);
    c.fill();
  }
  // Tischtuch mit Schatten
  c.save();
  c.shadowColor = 'rgba(60, 40, 20, 0.35)';
  c.shadowBlur = 8;
  c.shadowOffsetY = 3;
  c.fillStyle = '#fbf8f0';
  roundedRect(c, cx - 92, cy - 50, 184, 102, 8);
  c.fill();
  c.restore();
  c.strokeStyle = 'rgba(160, 40, 35, 0.85)';
  c.lineWidth = 3;
  roundedRect(c, cx - 86, cy - 44, 172, 90, 5);
  c.stroke();
  c.strokeStyle = 'rgba(200, 160, 70, 0.7)';
  c.lineWidth = 1;
  roundedRect(c, cx - 82, cy - 40, 164, 82, 4);
  c.stroke();
  // Faltenwurf
  c.strokeStyle = 'rgba(180, 170, 150, 0.35)';
  line(c, cx - 30, cy - 50, cx - 30, cy + 52);
  line(c, cx + 30, cy - 50, cx + 30, cy + 52);
  // Gedeck(e) oben
  for (const gx of guests) {
    const px = cx + gx, py = cy - 30, small = index === 5 && gx > 0;
    const r = small ? 10 : 12;
    c.fillStyle = '#ffffff';
    c.strokeStyle = 'rgba(120, 110, 95, 0.9)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(px, py, r, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.strokeStyle = 'rgba(200, 160, 70, 0.9)';
    c.beginPath();
    c.arc(px, py, r - 3, 0, Math.PI * 2);
    c.stroke();
    // Gabel links, Messer rechts
    c.strokeStyle = '#8a8f94';
    c.lineWidth = 2;
    line(c, px - r - 6, py - 9, px - r - 6, py + 10);
    c.lineWidth = 1;
    for (const d of [-2, 0, 2]) line(c, px - r - 6 + d, py - 12, px - r - 6 + d, py - 7);
    c.lineWidth = 2.5;
    line(c, px + r + 6, py - 11, px + r + 6, py + 10);
    // Glas (Wein) bzw. Tasse (Kakao) – ohne zu verraten, wer was trinkt: nur ein Glas
    c.strokeStyle = 'rgba(110, 140, 170, 0.9)';
    c.lineWidth = 1.3;
    c.fillStyle = 'rgba(200, 225, 240, 0.6)';
    c.beginPath();
    c.arc(px + r + 16, py - 10, 5, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  // Kerze mit Schein (rechts unten) und Tannenzweig (links unten)
  const kx = cx + 70, ky = cy + 30;
  const flame = c.createRadialGradient(kx, ky, 0, kx, ky, 22);
  flame.addColorStop(0, 'rgba(255, 210, 120, 0.6)');
  flame.addColorStop(1, 'rgba(255, 210, 120, 0)');
  c.fillStyle = flame;
  c.fillRect(kx - 22, ky - 22, 44, 44);
  c.fillStyle = '#c83a30';
  c.beginPath();
  c.arc(kx, ky, 5.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#ffe9a0';
  c.beginPath();
  c.arc(kx, ky, 2.2, 0, Math.PI * 2);
  c.fill();
  const tx = cx - 70, ty = cy + 30;
  c.strokeStyle = '#3d6b3a';
  c.lineWidth = 1.6;
  line(c, tx - 12, ty + 6, tx + 12, ty - 6);
  for (let k = -10; k <= 10; k += 4) {
    const bx = tx + k, by = ty - k * 0.5;
    line(c, bx, by, bx - 3, by - 6);
    line(c, bx, by, bx + 3, by + 6);
  }
  c.fillStyle = '#c0302a';
  for (const [dx, dy] of [[2, 2], [5, 0], [3, -3]]) {
    c.beginPath();
    c.arc(tx + dx, ty + dy, 2, 0, Math.PI * 2);
    c.fill();
  }
  // Tischnummer in Brunos Schrift (in der Ecke)
  text(c, String(index + 1), cx - 78, cy - 30, { font: `bold ${BRUNO_FONT(18)}`, color: BRUNO, align: 'center' });
}

// Ein Namenskärtchen als kleiner Tischaufsteller (120 × 44): oben die geknickte Rückseite,
// vorn Goldrand mit Eckverzierung, Stechpalmenzweig und der Name in Schönschrift
export function drawNameCard(ctx, token, x, y) {
  const image = cached(`w4-name-${token.label}`, 150, 76, (c) => paintNameCard(c, token.label));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((token.label.length * 37) % 7 - 3) * 0.004);
  ctx.drawImage(image, -75, -36);
  ctx.restore();
}

function paintNameCard(c, label) {
  c.translate(75, 36); // Mitte des Kärtchens
  // weicher Schatten auf dem Tischtuch
  c.save();
  c.shadowColor = 'rgba(70, 45, 20, 0.45)';
  c.shadowBlur = 9;
  c.shadowOffsetX = 2;
  c.shadowOffsetY = 6;
  c.fillStyle = '#efe6d0';
  c.fillRect(-60, -22, 120, 44);
  c.restore();
  // Rückseite (oben, hinter dem Knick) – etwas dunkler, schmaler Streifen
  const back = c.createLinearGradient(0, -22, 0, -15);
  back.addColorStop(0, '#d9ccab');
  back.addColorStop(1, '#efe5cc');
  c.fillStyle = back;
  c.fillRect(-60, -22, 120, 7);
  // Knickkante mit Lichtkante
  c.fillStyle = 'rgba(255, 255, 255, 0.9)';
  c.fillRect(-60, -15, 120, 1.2);
  c.fillStyle = 'rgba(120, 95, 50, 0.35)';
  c.fillRect(-60, -13.8, 120, 0.8);
  // Vorderseite: Büttenpapier, unten leicht im Schatten
  const front = c.createLinearGradient(0, -14, 0, 22);
  front.addColorStop(0, '#fffcf3');
  front.addColorStop(0.75, '#f7f0de');
  front.addColorStop(1, '#e8dcbd');
  c.fillStyle = front;
  c.fillRect(-60, -13, 120, 35);
  fineGrain(c, -60, -13, 120, 35, { seed: label.length * 13, count: 0.08, dark: 0.05, light: 0.2, size: 0.9 });
  // Goldrand, doppelt, mit Eckpunkten
  const gold = c.createLinearGradient(-60, -13, 60, 22);
  gold.addColorStop(0, '#e9cf86');
  gold.addColorStop(0.5, '#b88d36');
  gold.addColorStop(1, '#e3c174');
  c.strokeStyle = gold;
  c.lineWidth = 1.6;
  c.strokeRect(-56, -10, 112, 28);
  c.lineWidth = 0.6;
  c.strokeRect(-53.5, -7.5, 107, 23);
  c.fillStyle = gold;
  for (const [cx, cy] of [[-56, -10], [56, -10], [-56, 18], [56, 18]]) {
    c.beginPath();
    c.moveTo(cx, cy - 3);
    c.lineTo(cx + 3, cy);
    c.lineTo(cx, cy + 3);
    c.lineTo(cx - 3, cy);
    c.closePath();
    c.fill();
  }
  // Stechpalme: zwei gezackte Blätter und drei Beeren, links oben über dem Rand
  const leaf = (lx, ly, angle) => {
    c.save();
    c.translate(lx, ly);
    c.rotate(angle);
    const g = c.createLinearGradient(0, -3, 0, 3);
    g.addColorStop(0, '#4f8a4a');
    g.addColorStop(1, '#24502a');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, 0);
    for (const [px, py] of [[2.5, -2.4], [4.5, -1.6], [6.5, -3], [8.5, -1.8], [10.5, -2.6], [12, 0], [10.5, 2.6], [8.5, 1.8], [6.5, 3], [4.5, 1.6], [2.5, 2.4]]) c.lineTo(px, py);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(200, 230, 180, 0.6)';
    c.lineWidth = 0.5;
    line(c, 1, 0, 11, 0);
    c.restore();
  };
  leaf(-50, -9, -2.6);
  leaf(-50, -9, 0.35);
  for (const [bx, by] of [[-50, -9], [-47, -11], [-47.5, -7]]) {
    const berry = c.createRadialGradient(bx - 0.6, by - 0.6, 0.2, bx, by, 2.2);
    berry.addColorStop(0, '#ff8a7a');
    berry.addColorStop(1, '#a3161a');
    c.fillStyle = berry;
    c.beginPath();
    c.arc(bx, by, 2.1, 0, Math.PI * 2);
    c.fill();
  }
  // Name, mit Tinte geschrieben (leicht gesetzt, damit er auf dem Papier „sitzt“)
  const size = label.length > 12 ? 15 : 20;
  c.font = `${size}px ${HAND}`;
  let fit = size;
  while (c.measureText(label).width > 92 && fit > 11) c.font = `${--fit}px ${HAND}`;
  text(c, label, 3, 10, { font: `${fit}px ${HAND}`, color: 'rgba(255, 255, 255, 0.6)', align: 'center' });
  text(c, label, 3, 9, { font: `${fit}px ${HAND}`, color: '#2a1a0c', align: 'center' });
}

// ---------------------------------------------------------------- Tablett mit Gläsern
export const GLASS_X = [400, 520, 640, 760, 880];
export const CUP_X = [1010, 1100];

export function drawTray(ctx, { taken = false, bill = false, poured = 0 } = {}) {
  wood(ctx, 120, 150, 1040, 470, [110, 64, 30]);
  ctx.strokeStyle = 'rgba(30, 15, 5, 0.7)';
  ctx.lineWidth = 6;
  ctx.strokeRect(120, 150, 1040, 470);
  // Tablett
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 360, 0, 520);
  gradient.addColorStop(0, '#d9dde0');
  gradient.addColorStop(1, '#8b9196');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(640, 470, 330, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6f757a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
  // Rechnung unter dem dritten Glas
  if (bill) {
    ctx.save();
    ctx.translate(660, 488);
    ctx.rotate(0.15);
    ctx.fillStyle = '#f3e8cc';
    ctx.fillRect(-20, -14, 92, 46);
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.5)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) line(ctx, -10, -2 + i * 10, 60, -2 + i * 10);
    ctx.restore();
  }
  GLASS_X.forEach((x, i) => {
    if (i === 2 && taken) return;
    drawWineGlass(ctx, x, 470, poured > i ? 0.9 : 0.9);
    text(ctx, String(i + 1), x, 560, { font: `bold 18px ${PRINT}`, align: 'center', color: 'rgba(255, 240, 210, 0.75)' });
  });
  CUP_X.forEach((x) => drawCocoa(ctx, x, 480));
  glow(ctx, 640, 200, 380, '255, 220, 150', 0.18);
}

function drawWineGlass(ctx, x, y, fill) {
  ctx.save();
  ctx.translate(x, y);
  // Wein
  ctx.fillStyle = 'rgba(120, 16, 40, 0.92)';
  ctx.beginPath();
  ctx.moveTo(-34, -112 + (1 - fill) * 40);
  ctx.quadraticCurveTo(0, -36, 34, -112 + (1 - fill) * 40);
  ctx.closePath();
  ctx.fill();
  // Glas
  ctx.strokeStyle = 'rgba(235, 245, 250, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-40, -170);
  ctx.quadraticCurveTo(-46, -64, 0, -58);
  ctx.quadraticCurveTo(46, -64, 40, -170);
  ctx.stroke();
  line(ctx, 0, -58, 0, -6);
  ctx.beginPath();
  ctx.ellipse(0, -4, 30, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  line(ctx, -28, -160, -30, -100);
  ctx.restore();
}

function drawCocoa(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#f2ece0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e9e2d2';
  ctx.fillRect(-28, -64, 56, 60);
  ctx.fillStyle = '#6b3d1f';
  ctx.beginPath();
  ctx.ellipse(0, -64, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e9e2d2';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(34, -36, 13, -1.2, 1.2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- Speisekarte
export function drawMenu(ctx) {
  sheet(ctx, 440, 60, 400, 590, {
    angle: 0.015,
    color: '#f6eedb',
    shade: '#e2d2ab',
    inner: (c) => {
      c.strokeStyle = '#7a1f14';
      c.lineWidth = 3;
      c.strokeRect(16, 16, 368, 558);
      c.lineWidth = 1;
      c.strokeRect(22, 22, 356, 546);
      text(c, 'Speisewagen der Ringbahn', 200, 70, { font: `italic 22px ${SERIF}`, color: '#7a1f14', align: 'center' });
      text(c, 'Weihnachtsmenü', 200, 112, { font: `bold 30px ${SERIF}`, color: INK, align: 'center' });
      const rows = [
        ['Kartoffelsuppe', '3'],
        ['Rinderbraten mit Klößen', '9'],
        ['Vanillepudding', '2'],
        null,
        ['Glas Rotwein', '4'],
        ['Tasse Kakao', '2'],
        ['Tasse Kaffee', '1'],
      ];
      let y = 172;
      for (const row of rows) {
        if (!row) {
          c.strokeStyle = 'rgba(122, 31, 20, 0.5)';
          line(c, 120, y - 12, 280, y - 12);
          y += 26;
          continue;
        }
        text(c, row[0], 46, y, { font: `21px ${SERIF}` });
        text(c, `${row[1]} Mark`, 354, y, { font: `21px ${SERIF}`, align: 'right' });
        c.strokeStyle = 'rgba(43, 33, 24, 0.25)';
        c.setLineDash([2, 5]);
        line(c, 46 + c.measureText(row[0]).width + 50, y - 6, 290, y - 6);
        c.setLineDash([]);
        y += 46;
      }
      text(c, 'Wein nur für Erwachsene.', 200, 506, { font: `italic 17px ${SERIF}`, align: 'center' });
      text(c, 'Wer nicht volljährig ist, bekommt Kakao.', 200, 530, { font: `italic 17px ${SERIF}`, align: 'center' });
    },
  });
}

// ---------------------------------------------------------------- Rechnung (Brunos Schrift)
export function drawBill(ctx) {
  sheet(ctx, 400, 50, 480, 610, {
    angle: -0.02,
    inner: (c) => {
      text(c, 'Rechnung – Weihnachtsmenü', 240, 52, { font: `bold 24px ${PRINT}`, align: 'center' });
      c.strokeStyle = INK;
      c.lineWidth = 2;
      line(c, 30, 66, 450, 66);
      const lines = [
        '6 Tische gedeckt.',
        'An jedem Tisch 1 Gast –',
        'nur an Tisch 6 die Dame mit Tochter.',
        '',
        'Für jeden: Suppe, Braten, Pudding.',
        'Für jeden ein Getränk:',
        'Wein – oder Kakao (siehe Karte!).',
        '',
        'Gläser: von hinten nach vorne,',
        'erst links, dann rechts.',
      ];
      lines.forEach((value, i) => text(c, value, 34, 108 + i * 34, { font: `22px ${HAND}` }));
      text(c, 'Summe:', 34, 492, { font: `bold 26px ${HAND}` });
      smudge(c, 150, 460, 150, 46, 'rgba(110, 30, 40, 0.75)');
      text(c, 'Mark', 330, 492, { font: `26px ${HAND}` });
      text(c, 'Die Kasse muss stimmen!', 240, 560, { font: `22px ${HAND}`, color: RED, align: 'center' });
      text(c, '– Bruno', 440, 596, { font: `20px ${HAND}`, align: 'right' });
    },
  });
}
