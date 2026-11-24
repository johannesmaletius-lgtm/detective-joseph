import { MORSE_DIGITS } from '../../effects/morse.js';
import {
  BLUE_INK, HAND, INK, PRINT, SERIF, TYPEWRITER, cached, drawPicture, glow, grain, line, plank, roundedRect, sheet, smudge, text, vignette, wood,
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
  wood(ctx, 240, 80, 800, 580, [60, 52, 40]);
  // Zifferblatt mit Himmelsrichtungen des Zuges
  ctx.fillStyle = '#e9dfc2';
  ctx.beginPath();
  ctx.arc(520, 380, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 8;
  ctx.stroke();
  DIRECTIONS.forEach((name, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    line(ctx, 520 + Math.cos(a) * 150, 380 + Math.sin(a) * 150, 520 + Math.cos(a) * 172, 380 + Math.sin(a) * 172);
    text(ctx, name, 520 + Math.cos(a) * 116, 380 + Math.sin(a) * 116 + 6, { font: `bold 15px ${PRINT}`, color: INK, align: 'center' });
  });
  // kleiner Zug in der Mitte (Fahrtrichtung nach oben)
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(506, 340, 28, 80);
  ctx.beginPath();
  ctx.moveTo(506, 340);
  ctx.lineTo(520, 318);
  ctx.lineTo(534, 340);
  ctx.fill();
  // Zeiger = Antenne
  const a = (direction / 8) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  line(ctx, 520, 380, 520 + Math.cos(a) * 150, 380 + Math.sin(a) * 150);
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.arc(520, 380, 12, 0, Math.PI * 2);
  ctx.fill();
  // Empfangsanzeige
  drawMeter(ctx, 850, 300, signalStrength(direction), time);
  text(ctx, 'Empfang', 850, 420, { font: `bold 18px ${PRINT}`, color: '#f3e2b4', align: 'center' });
  text(ctx, 'Antenne: wohin zeigt sie, vom Zug aus?', 640, 630, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

function drawMeter(ctx, cx, cy, value, time) {
  ctx.fillStyle = '#efe3c0';
  ctx.beginPath();
  ctx.arc(cx, cy, 90, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(60, 160, 70, 0.6)';
  ctx.beginPath();
  ctx.arc(cx, cy, 84, Math.PI * 1.8, Math.PI * 2);
  ctx.lineTo(cx, cy);
  ctx.fill();
  const wobble = Math.sin(time * 13) * 0.04 * (1 - value);
  const a = Math.PI + (value * 0.95 + wobble) * Math.PI;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(a) * 80, cy + Math.sin(a) * 80);
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
  grain(c, 52, 18, 856, 560, { seed: 61, count: 0.02, dark: 0.2, light: 0.06, size: 1.2 });
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
    grain(c, x, 30, 414, 528, { seed: x, count: 0.02, dark: 0.06, light: 0.12, size: 1 });
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
export function drawMorseBoard(ctx) {
  sheet(ctx, 300, 90, 680, 540, {
    color: '#efe3c2',
    inner: (c) => {
      text(c, 'Morsezeichen – Ziffern', 340, 54, { font: `bold 28px ${SERIF}`, align: 'center' });
      Object.entries(MORSE_DIGITS).forEach(([digit, code], i) => {
        const col = i < 5 ? 0 : 1;
        const row = i % 5;
        const x = 70 + col * 320, y = 120 + row * 76;
        text(c, digit, x, y + 18, { font: `bold 36px ${SERIF}` });
        [...code].forEach((mark, k) => {
          c.fillStyle = INK;
          if (mark === '.') {
            c.beginPath();
            c.arc(x + 70 + k * 36, y + 6, 7, 0, Math.PI * 2);
            c.fill();
          } else c.fillRect(x + 56 + k * 36, y + 1, 28, 10);
        });
      });
      text(c, '· kurz     — lang', 340, 510, { font: `18px ${PRINT}`, align: 'center' });
    },
  });
}

export function morseText(digits) {
  return [...digits].map((d) => MORSE_DIGITS[d].replace(/\./g, '·').replace(/-/g, '—')).join('   ');
}
