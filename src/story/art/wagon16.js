import { MORSE_DIGITS } from '../../effects/morse.js';
import {
  BLUE_INK, HAND, INK, PRINT, SERIF, TYPEWRITER, cached, cachedLayer, drawPicture, glow, fineGrain, line, plank, rivet, roundedRect, screw, seeded, sheet, smudge, text, vignette, wood,
} from './common.js';

// Gezeichnetes für Wagen 16 (Funkraum): Antennenkurbel mit Empfangsanzeige, Logbuch,
// Funkgerät mit Frequenzanzeige und die Morsetafel an der Wand.

// ---------------------------------------------------------------- Antenne
export const DIRECTIONS = ['vorn', 'vorn rechts', 'rechts', 'hinten rechts', 'hinten', 'hinten links', 'links', 'vorn links'];
export const TOWER_DIRECTION = 6; // links – zur Mitte des Kreises, wo der Turm steht

export function signalStrength(direction) {
  const d = Math.min(Math.abs(direction - TOWER_DIRECTION), 8 - Math.abs(direction - TOWER_DIRECTION));
  return [1, 0.55, 0.25, 0.1, 0.05][d];
}

export const CRANK_SPOTS = [{ id: 'crank', cx: 520, cy: 380, r: 190, label: 'Kurbel drehen' }];

export function drawCrank(ctx, direction, time) {
  // Ruhende Teile (Blechtafel, Zifferblatt, Gehäuse der Anzeige) nur einmal malen
  ctx.drawImage(cached('w16-crank', 1280, 720, paintCrankPanel), 0, 0);

  // Zeiger = Antenne: rote Marke außen am Ring und ein kurzer Strich innen – Schrift und Zug bleiben frei
  const a = (direction / 8) * Math.PI * 2 - Math.PI / 2;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.moveTo(520 + cos * 176, 380 + sin * 176);
  ctx.lineTo(520 + cos * 150 - sin * 13, 380 + sin * 150 + cos * 13);
  ctx.lineTo(520 + cos * 150 + sin * 13, 380 + sin * 150 - cos * 13);
  ctx.closePath();
  ctx.fill();
  // dünner Zeiger vom Rand des Zuges bis zur Schrift – der Zug in der Mitte bleibt sichtbar
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  line(ctx, 520 + cos * 46, 380 + sin * 46, 520 + cos * 92, 380 + sin * 92);
  ctx.restore();

  // Empfangsanzeige
  const value = signalStrength(direction);
  drawMeter(ctx, 850, 330, value, time);
  // Lämpchen: leuchtet grün, wenn die Antenne genau richtig steht
  const on = value >= 1;
  ctx.fillStyle = on ? '#7dff8a' : '#24361f';
  ctx.beginPath();
  ctx.arc(850, 440, 11, 0, Math.PI * 2);
  ctx.fill();
  if (on) glow(ctx, 850, 440, 50, '120, 255, 140', 0.35 + Math.sin(time * 4) * 0.08);
  ctx.strokeStyle = '#2a2016';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function paintCrankPanel(ctx) {
  // Blechtafel mit Nieten
  const x = 240, y = 70, w = 800, h = 600;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, x, y, w, h, 18);
  const plate = ctx.createLinearGradient(x, y, x + w, y + h);
  plate.addColorStop(0, '#4c5547');
  plate.addColorStop(0.5, '#3c443a');
  plate.addColorStop(1, '#2b3129');
  ctx.fillStyle = plate;
  ctx.fill();
  ctx.restore();
  fineGrain(ctx, x, y, w, h, { seed: 16, count: 0.01, dark: 0.18, light: 0.05 });
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 14, y + 14, w - 28, h - 28, 10);
  ctx.stroke();
  for (let i = 0; i <= 10; i++) {
    for (const ry of [y + 26, y + h - 26]) rivet(ctx, x + 30 + (i * (w - 60)) / 10, ry, 5, [120, 128, 112]);
  }
  for (let i = 1; i < 7; i++) {
    for (const rx of [x + 26, x + w - 26]) rivet(ctx, rx, y + 26 + (i * (h - 52)) / 7, 5, [120, 128, 112]);
  }
  // Rostflecken
  const r = seeded(61);
  for (let i = 0; i < 14; i++) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(120, 66, 30, 0.35)');
    g.addColorStop(1, 'rgba(120, 66, 30, 0)');
    ctx.save();
    ctx.translate(x + 40 + r() * (w - 80), y + 40 + r() * (h - 80));
    ctx.scale(10 + r() * 30, 6 + r() * 18);
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  // Messingschild oben
  brassPlate(ctx, 640, 112, 360, 40);
  text(ctx, 'ANTENNE  ·  RICHTUNG', 640, 120, { font: `bold 18px ${PRINT}`, color: '#3a2a10', align: 'center' });

  // Zifferblatt: Messingring, cremefarbene Scheibe, Windrose
  const cx = 520, cy = 380;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  const ring = ctx.createLinearGradient(cx - 200, cy - 200, cx + 200, cy + 200);
  ring.addColorStop(0, '#f2d68c');
  ring.addColorStop(0.45, '#a67c2e');
  ring.addColorStop(1, '#5c3e12');
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#2a2116';
  ctx.beginPath();
  ctx.arc(cx, cy, 184, 0, Math.PI * 2);
  ctx.fill();
  const face = ctx.createRadialGradient(cx - 40, cy - 50, 20, cx, cy, 182);
  face.addColorStop(0, '#f6ecd0');
  face.addColorStop(1, '#d9c69a');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.clip();
  fineGrain(ctx, cx - 180, cy - 180, 360, 360, { seed: 9, count: 0.012, dark: 0.08, light: 0.12 });
  ctx.restore();
  // feine Windrose
  ctx.fillStyle = 'rgba(120, 90, 40, 0.16)';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const long = i % 2 === 0 ? 150 : 95;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * long, cy + Math.sin(a) * long);
    ctx.lineTo(cx + Math.cos(a + 0.4) * 30, cy + Math.sin(a + 0.4) * 30);
    ctx.lineTo(cx + Math.cos(a - 0.4) * 30, cy + Math.sin(a - 0.4) * 30);
    ctx.closePath();
    ctx.fill();
  }
  // Teilstriche
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2 - Math.PI / 2;
    const major = i % 4 === 0;
    ctx.strokeStyle = INK;
    ctx.lineWidth = major ? 3 : 1.5;
    const r0 = major ? 156 : 166;
    line(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * 176, cy + Math.sin(a) * 176);
  }
  // Richtungen (der Zeiger ist kurz, die Marke sitzt außen – die Schrift bleibt immer lesbar)
  DIRECTIONS.forEach((name, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const r1 = i % 2 === 0 ? 126 : 118;
    const words = name.split(' ');
    const x = cx + Math.cos(a) * r1;
    const y = cy + Math.sin(a) * r1;
    if (words.length === 1) text(ctx, name, x, y + 6, { font: `bold 17px ${PRINT}`, color: INK, align: 'center' });
    else {
      text(ctx, words[0], x, y - 3, { font: `bold 14px ${PRINT}`, color: INK, align: 'center' });
      text(ctx, words[1], x, y + 13, { font: `bold 14px ${PRINT}`, color: INK, align: 'center' });
    }
  });
  // kleiner Zug von oben in der Mitte (fährt nach „vorn“)
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  for (const [ty, th] of [[332, 22], [358, 22], [384, 22]]) {
    roundedRect(ctx, 507, ty, 26, th, 4);
    ctx.fillStyle = '#6a4a2a';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(507, 330);
  ctx.lineTo(520, 304);
  ctx.lineTo(533, 330);
  ctx.closePath();
  ctx.fillStyle = '#3e2c1a';
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 230, 170, 0.6)';
  for (const ty of [338, 364, 390]) ctx.fillRect(512, ty, 16, 4);
  // Kurbelgriff unten rechts am Ring
  ctx.strokeStyle = '#5a4018';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  line(ctx, cx + 140, cy + 140, cx + 186, cy + 186);
  const knob = ctx.createRadialGradient(cx + 188, cy + 184, 3, cx + 192, cy + 190, 22);
  knob.addColorStop(0, '#d65a40');
  knob.addColorStop(1, '#5a160c');
  ctx.fillStyle = knob;
  ctx.beginPath();
  ctx.arc(cx + 192, cy + 190, 20, 0, Math.PI * 2);
  ctx.fill();

  // Gehäuse der Empfangsanzeige
  const mx = 850, my = 330;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  roundedRect(ctx, mx - 125, my - 125, 250, 165, 16);
  const box = ctx.createLinearGradient(mx, my - 125, mx, my + 40);
  box.addColorStop(0, '#5a3a1e');
  box.addColorStop(1, '#2e1c0e');
  ctx.fillStyle = box;
  ctx.fill();
  ctx.restore();
  for (const [sx, sy] of [[-108, -108], [108, -108], [-108, 24], [108, 24]]) screw(ctx, mx + sx, my + sy, 5);
  ctx.fillStyle = '#f3e8c8';
  ctx.beginPath();
  ctx.arc(mx, my, 98, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(60, 160, 70, 0.55)';
  ctx.beginPath();
  ctx.arc(mx, my, 92, Math.PI * 1.8, Math.PI * 2);
  ctx.arc(mx, my, 70, Math.PI * 2, Math.PI * 1.8, true);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    ctx.strokeStyle = INK;
    ctx.lineWidth = i % 5 === 0 ? 2.5 : 1.2;
    const r0 = i % 5 === 0 ? 74 : 82;
    line(ctx, mx + Math.cos(a) * r0, my + Math.sin(a) * r0, mx + Math.cos(a) * 92, my + Math.sin(a) * 92);
  }
  text(ctx, 'EMPFANG', mx, my + 28, { font: `bold 15px ${PRINT}`, color: '#e8d6a8', align: 'center' });
  brassPlate(ctx, mx, 482, 190, 34);
  text(ctx, 'Signal', mx, 489, { font: `bold 16px ${PRINT}`, color: '#3a2a10', align: 'center' });

  // Frage unten auf einem Zettel
  ctx.save();
  ctx.translate(640, 628);
  ctx.rotate(-0.012);
  ctx.fillStyle = '#efe2bf';
  ctx.fillRect(-230, -20, 460, 38);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillRect(-230, 16, 460, 3);
  text(ctx, 'Antenne: wohin zeigt sie, vom Zug aus?', 0, 6, { font: `20px ${HAND}`, color: INK, align: 'center' });
  ctx.restore();
  vignette(ctx, x, y, w, h, 0.35);
}

function brassPlate(ctx, cx, cy, w, h) {
  roundedRect(ctx, cx - w / 2, cy - h / 2, w, h, 6);
  const g = ctx.createLinearGradient(cx, cy - h / 2, cx, cy + h / 2);
  g.addColorStop(0, '#f0d488');
  g.addColorStop(0.5, '#c49a46');
  g.addColorStop(1, '#8a6424');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#5a3e14';
  ctx.lineWidth = 2;
  ctx.stroke();
  screw(ctx, cx - w / 2 + 12, cy, 4);
  screw(ctx, cx + w / 2 - 12, cy, 4);
}

function drawMeter(ctx, cx, cy, value, time) {
  const wobble = Math.sin(time * 13) * 0.04 * (1 - value);
  const a = Math.PI + (value * 0.95 + wobble) * Math.PI;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 2;
  ctx.strokeStyle = '#1e1810';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  line(ctx, cx, cy, cx + Math.cos(a) * 88, cy + Math.sin(a) * 88);
  ctx.restore();
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------- Logbuch
export const LOG_ENTRIES = [
  ['18:00', '120'],
  ['19:00', '135'],
  ['20:00', '165'],
  ['21:00', '210'],
  ['22:00', '270'],
  ['23:00', null], // verwischt – die nächste Frequenz muss man ausrechnen
];
export const NEXT_FREQUENCY = '345';

export function drawLogbook(ctx) {
  ctx.drawImage(cached('w16-logbook', 960, 590, paintLogbook), 160, 70);
}

// Weicher, ovaler Wischfleck (Kaffee, Ruß)
function blot(c, x, y, rx, ry, rgb, alpha) {
  c.save();
  c.translate(x, y);
  c.scale(rx, ry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  g.addColorStop(0.55, `rgba(${rgb}, ${alpha * 0.85})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 1, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

const LOG_REMARKS = ['Bahnhof klar', 'Schneefall', 'keine Meldung', 'Kurve ruhig', 'alles klar', ''];

// Das aufgeschlagene Funklogbuch auf dem Tisch (einmal gezeichnet). (0, 0) = Tischecke links oben.
function paintLogbook(c) {
  // Tisch
  for (let i = 0; i < 5; i++) plank(c, 0, i * 118, 960, 118, { tone: [70, 44, 24], seed: 160 + i, knots: 2 });
  c.fillStyle = 'rgba(10, 5, 2, 0.6)';
  for (let i = 1; i < 5; i++) c.fillRect(0, i * 118 - 1, 960, 2);
  // Einband (grünes Leinen)
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 26;
  c.shadowOffsetY = 12;
  c.fillStyle = '#23382c';
  roundedRect(c, 52, 18, 856, 560, 10);
  c.fill();
  c.restore();
  fineGrain(c, 52, 18, 856, 560, { seed: 61, count: 0.02, dark: 0.2, light: 0.06, size: 1.2 });
  // Seitenstapel (unten und an den Seiten)
  for (let k = 5; k >= 1; k--) {
    c.fillStyle = k % 2 ? '#d9cca8' : '#cbbd96';
    c.fillRect(66 - k, 32 + k, 828 + k * 2, 530);
  }
  // zwei Seiten
  const page = (x, flip) => {
    const g = c.createLinearGradient(x, 0, x + 414, 0);
    const stops = flip ? [['#c9b98f', 0], ['#efe4c6', 0.12], ['#f4ead0', 0.6], ['#eadcb8', 1]] : [['#eadcb8', 0], ['#f4ead0', 0.4], ['#efe4c6', 0.88], ['#c9b98f', 1]];
    for (const [color, at] of stops) g.addColorStop(at, color);
    c.fillStyle = g;
    c.fillRect(x, 30, 414, 528);
    fineGrain(c, x, 30, 414, 528, { seed: x, count: 0.02, dark: 0.06, light: 0.12, size: 1 });
  };
  page(66, false);
  page(480, true);
  // Bund mit Fadenheftung
  const spine = c.createLinearGradient(462, 0, 498, 0);
  spine.addColorStop(0, 'rgba(0, 0, 0, 0)');
  spine.addColorStop(0.5, 'rgba(60, 40, 15, 0.45)');
  spine.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = spine;
  c.fillRect(456, 30, 48, 528);
  c.strokeStyle = 'rgba(150, 40, 30, 0.7)';
  c.lineWidth = 2;
  for (let y = 70; y < 540; y += 80) line(c, 480, y, 480, y + 26);

  // ---- linke Seite: Tabelle
  const L = 66;
  text(c, 'FUNK-LOGBUCH', L + 207, 74, { font: `bold 24px ${SERIF}`, color: INK, align: 'center' });
  text(c, 'Zug 24  ·  24. Dezember', L + 207, 102, { font: `italic 17px ${SERIF}`, color: INK, align: 'center' });
  const cols = [L + 24, L + 104, L + 216, L + 360, L + 396];
  c.fillStyle = 'rgba(39, 64, 143, 0.08)';
  c.fillRect(cols[0], 116, cols[4] - cols[0], 30);
  c.strokeStyle = 'rgba(39, 64, 143, 0.45)';
  c.lineWidth = 1;
  for (let k = 0; k <= 7; k++) line(c, cols[0], 116 + (k === 0 ? 0 : 30 + (k - 1) * 50), cols[4], 116 + (k === 0 ? 0 : 30 + (k - 1) * 50));
  c.strokeStyle = 'rgba(179, 38, 30, 0.5)';
  for (const x of cols) line(c, x, 116, x, 446);
  const head = (label, x0, x1) => text(c, label, (x0 + x1) / 2, 136, { font: `bold 12px ${PRINT}`, color: 'rgba(39, 50, 90, 0.85)', align: 'center' });
  head('ZEIT', cols[0], cols[1]);
  head('FREQUENZ', cols[1], cols[2]);
  head('BEMERKUNG', cols[2], cols[3]);
  head('ZCH.', cols[3], cols[4]);
  LOG_ENTRIES.forEach(([time, freq], i) => {
    const y = 180 + i * 50;
    text(c, time, (cols[0] + cols[1]) / 2, y, { font: `23px ${HAND}`, color: BLUE_INK, align: 'center' });
    if (freq) {
      text(c, `${freq} kHz`, (cols[1] + cols[2]) / 2, y, { font: `23px ${HAND}`, color: BLUE_INK, align: 'center' });
      text(c, 'K.', (cols[3] + cols[4]) / 2, y, { font: `19px ${HAND}`, color: BLUE_INK, align: 'center' });
    } else {
      text(c, '3?? kHz', (cols[1] + cols[2]) / 2, y, { font: `23px ${HAND}`, color: BLUE_INK, align: 'center' });
      blot(c, (cols[1] + cols[2]) / 2 + 4, y - 8, 62, 22, '64, 44, 24', 0.92);
      blot(c, (cols[1] + cols[2]) / 2 + 14, y - 4, 40, 14, '50, 34, 18', 0.6);
    }
    if (LOG_REMARKS[i]) text(c, LOG_REMARKS[i], cols[2] + 8, y - 2, { font: `16px ${HAND}`, color: BLUE_INK });
  });
  // Dienstvorschrift als roter Stempel
  c.save();
  c.translate(L + 207, 500);
  c.rotate(-0.04);
  c.strokeStyle = 'rgba(161, 34, 24, 0.85)';
  c.lineWidth = 2;
  roundedRect(c, -170, -24, 340, 40, 4);
  c.stroke();
  text(c, 'Frequenz jede Stunde wechseln!', 0, 4, { font: `bold 18px ${PRINT}`, color: 'rgba(161, 34, 24, 0.9)', align: 'center' });
  c.restore();

  // ---- rechte Seite: liniert, Notizen des Funkers
  const R = 480;
  c.strokeStyle = 'rgba(39, 64, 143, 0.22)';
  c.lineWidth = 1;
  for (let y = 100; y < 540; y += 40) line(c, R + 30, y, R + 394, y);
  c.strokeStyle = 'rgba(179, 38, 30, 0.4)';
  line(c, R + 90, 40, R + 90, 548);
  text(c, 'Notizen', R + 207, 74, { font: `italic 20px ${SERIF}`, color: INK, align: 'center' });
  const rows = [['22:50', 'Weihnachtsfeier im'], ['', 'Speisewagen. Alle hin!'], ['', 'Funk bleibt kurz unbesetzt.'], ['', ''], ['23:4', '']];
  rows.forEach(([time, note], i) => {
    const y = 136 + i * 40;
    if (time) text(c, time, R + 36, y, { font: `21px ${HAND}`, color: BLUE_INK });
    if (note) text(c, note, R + 100, y, { font: `21px ${HAND}`, color: BLUE_INK });
  });
  blot(c, R + 230, 296, 170, 30, '64, 44, 24', 0.92);
  blot(c, R + 200, 300, 110, 18, '50, 34, 18', 0.6);
  blot(c, R + 330, 288, 40, 14, '64, 44, 24', 0.5);
  text(c, 'Funkspruch vom Bahnhof?', R + 220, 376, { font: `19px ${HAND}`, color: '#8a7a60', align: 'center' });
  text(c, '(leer)', R + 220, 456, { font: `italic 18px ${SERIF}`, color: '#8a7a60', align: 'center' });
  // Kaffeering
  c.strokeStyle = 'rgba(120, 70, 30, 0.35)';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(R + 340, 500, 38, 0.4, Math.PI * 1.9);
  c.stroke();
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(R + 340, 500, 32, 0.9, Math.PI * 1.6);
  c.stroke();
  // Bleistift schräg über der rechten Ecke
  c.save();
  c.translate(860, 560);
  c.rotate(-0.5);
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.fillRect(-96, -2, 190, 14);
  const wood = c.createLinearGradient(0, -7, 0, 7);
  wood.addColorStop(0, '#f0c24a');
  wood.addColorStop(0.5, '#d9a52a');
  wood.addColorStop(1, '#a4781a');
  c.fillStyle = wood;
  c.fillRect(-90, -7, 160, 14);
  c.fillStyle = '#e0b98a';
  c.beginPath();
  c.moveTo(70, -7);
  c.lineTo(96, 0);
  c.lineTo(70, 7);
  c.fill();
  c.fillStyle = '#2a2a2a';
  c.beginPath();
  c.moveTo(88, -2);
  c.lineTo(96, 0);
  c.lineTo(88, 2);
  c.fill();
  c.fillStyle = '#9a9a9a';
  c.fillRect(-104, -7, 14, 14);
  c.fillStyle = '#d98a8a';
  roundedRect(c, -118, -7, 16, 14, 4);
  c.fill();
  c.restore();
  vignette(c, 0, 0, 960, 590, 0.45);
}

// ---------------------------------------------------------------- Funkgerät
export function drawRadioPanel(ctx, { frequency, antenna, listening, light, time }) {
  drawPicture(ctx, 'assets/closeups/funkgeraet.webp', 0, 0, 1280, 720);
  // Röhren flackern
  for (const x of [203, 299, 394]) glow(ctx, x, 191, 46, '255, 160, 80', 0.25 + 0.1 * Math.sin(time * 7 + x));
  // Frequenzanzeige im dunklen Fenster
  glow(ctx, 811, 176, 200, '90, 255, 130', 0.08);
  text(ctx, `${frequency ?? '---'} kHz`, 811, 192, { font: `bold 56px ${TYPEWRITER}`, color: '#7dff9a', align: 'center' });
  text(ctx, antenna ? 'Antenne: gut' : 'Antenne: schwach', 811, 238, { font: `18px ${PRINT}`, color: antenna ? '#9fe7a8' : '#e7a89f', align: 'center' });
  // Signallampe für das Morsesignal
  if (light) {
    ctx.fillStyle = 'rgba(255, 236, 138, 0.9)';
    ctx.beginPath();
    ctx.arc(233, 532, 46, 0, Math.PI * 2);
    ctx.fill();
    glow(ctx, 233, 532, 110, '255, 240, 160', 0.7);
  }
  ctx.fillStyle = 'rgba(20, 14, 8, 0.7)';
  ctx.fillRect(400, 690, 480, 26);
  text(ctx, listening ? 'Kopfhörer: auf' : 'Lautsprecher kaputt – nur Kopfhörer', 640, 709, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Lämpchen im Wagen
export function drawRadioLight(ctx, on, time) {
  if (!on) return;
  glow(ctx, 1070, 255, 60, '255, 170, 90', 0.35 + 0.05 * Math.sin(time * 6));
}

// ---------------------------------------------------------------- Morsetafel (Ziffern)
// Emailleschild an der Wand des Funkraums
function paintMorseBoard(c) {
  plank(c, 0, 0, 1280, 720, { tone: [62, 40, 24], seed: 161, vertical: true, knots: 0 });
  for (let x = 20; x < 1280; x += 130) {
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillRect(x, 0, 3, 720);
  }
  glow(c, 640, 200, 600, '255, 214, 150', 0.14);
  vignette(c, 0, 0, 1280, 720, 0.65);
  // Blechschild mit gebördeltem Rand und Emaille
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.75)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 14;
  c.fillStyle = '#1c2a52';
  roundedRect(c, 290, 80, 700, 560, 22);
  c.fill();
  c.restore();
  const enamel = c.createLinearGradient(0, 96, 0, 624);
  enamel.addColorStop(0, '#f6eed8');
  enamel.addColorStop(1, '#ddd0ae');
  c.fillStyle = enamel;
  roundedRect(c, 304, 94, 672, 532, 16);
  c.fill();
  c.strokeStyle = '#1c2a52';
  c.lineWidth = 3;
  roundedRect(c, 318, 108, 644, 504, 10);
  c.stroke();
  fineGrain(c, 304, 94, 672, 532, { seed: 162, count: 0.002, dark: 0.08, light: 0.08 });
  // Abgeplatzte Emaille an Rand und Löchern
  for (const [x, y, r] of [[310, 400, 9], [972, 180, 7], [700, 622, 8], [330, 104, 6]]) {
    c.fillStyle = '#2a2a2c';
    c.beginPath();
    c.ellipse(x, y, r, r * 0.7, 0.4, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(120, 60, 20, 0.5)';
    c.beginPath();
    c.ellipse(x + 1, y + 1, r * 0.6, r * 0.4, 0.4, 0, Math.PI * 2);
    c.fill();
  }
  // Glanz
  const sheen = c.createLinearGradient(304, 94, 700, 400);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  sheen.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
  c.fillStyle = sheen;
  roundedRect(c, 304, 94, 672, 532, 16);
  c.fill();
  for (const [x, y] of [[330, 124], [950, 124], [330, 596], [950, 596]]) screw(c, x, y, 7, x * 0.02);
}

export function drawMorseBoard(ctx) {
  ctx.drawImage(cachedLayer('w16-morse', paintMorseBoard), 0, 0, 1280, 720);
  const ox = 300, oy = 90;
  text(ctx, 'Morsezeichen – Ziffern', ox + 340, oy + 56, { font: `bold 28px ${SERIF}`, color: '#1c2a52', align: 'center' });
  ctx.strokeStyle = 'rgba(28, 42, 82, 0.5)';
  ctx.lineWidth = 1.5;
  line(ctx, ox + 120, oy + 72, ox + 560, oy + 72);
  Object.entries(MORSE_DIGITS).forEach(([digit, code], i) => {
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = ox + 70 + col * 320, y = oy + 120 + row * 76;
    text(ctx, digit, x, y + 18, { font: `bold 36px ${SERIF}`, color: '#1c2a52' });
    [...code].forEach((mark, k) => {
      ctx.fillStyle = '#1a1a1c';
      if (mark === '.') {
        ctx.beginPath();
        ctx.arc(x + 70 + k * 36, y + 6, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundedRect(ctx, x + 56 + k * 36, y + 1, 28, 10, 3);
        ctx.fill();
      }
    });
  });
  text(ctx, '· kurz     — lang', ox + 340, oy + 510, { font: `18px ${PRINT}`, color: '#1c2a52', align: 'center' });
}

export function morseText(digits) {
  return [...digits].map((d) => MORSE_DIGITS[d].replace(/\./g, '·').replace(/-/g, '—')).join('   ');
}
