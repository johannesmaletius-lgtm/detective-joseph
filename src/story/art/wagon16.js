import { MORSE_DIGITS } from '../../effects/morse.js';
import { HAND, INK, PRINT, SERIF, TYPEWRITER, drawPicture, glow, line, sheet, smudge, text, wood } from './common.js';

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
  wood(ctx, 160, 70, 960, 590, [70, 44, 24]);
  sheet(ctx, 220, 100, 420, 520, {
    color: '#f0e6cc',
    inner: (c) => {
      text(c, 'Funklogbuch Zug 24', 210, 46, { font: `bold 24px ${SERIF}`, align: 'center' });
      text(c, '24. Dezember', 210, 76, { font: `italic 18px ${SERIF}`, align: 'center' });
      text(c, 'Uhrzeit', 60, 120, { font: `bold 18px ${PRINT}` });
      text(c, 'Frequenz', 250, 120, { font: `bold 18px ${PRINT}` });
      LOG_ENTRIES.forEach(([time, freq], i) => {
        const y = 164 + i * 50;
        text(c, time, 60, y, { font: `24px ${HAND}` });
        if (freq) text(c, `${freq} kHz`, 250, y, { font: `24px ${HAND}` });
        else {
          text(c, '3?? kHz', 250, y, { font: `24px ${HAND}` });
          smudge(c, 236, y - 30, 130, 44, 'rgba(70, 50, 30, 0.85)');
        }
      });
      text(c, 'Frequenz jede Stunde wechseln!', 210, 480, { font: `18px ${HAND}`, color: '#a12218', align: 'center' });
    },
  });
  sheet(ctx, 650, 100, 420, 520, {
    color: '#f0e6cc',
    inner: (c) => {
      const rows = [
        '22:50  Weihnachtsfeier im',
        '       Speisewagen. Alle hin!',
        '       Funk bleibt kurz unbesetzt.',
        '',
        '23:4',
      ];
      rows.forEach((row, i) => text(c, row, 30, 70 + i * 40, { font: `21px ${HAND}` }));
      smudge(c, 66, 210, 300, 56, 'rgba(70, 50, 30, 0.85)');
      text(c, 'Funkspruch vom Bahnhof?', 210, 300, { font: `18px ${HAND}`, color: '#8a7a60', align: 'center' });
      text(c, '(leer)', 210, 400, { font: `italic 18px ${SERIF}`, color: '#8a7a60', align: 'center' });
    },
  });
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
      text(c, '· kurz     — lang', 340, 490, { font: `18px ${PRINT}`, align: 'center' });
      text(c, '9 9 9 9 = Notruf – sofort antworten!', 340, 522, { font: `bold 18px ${PRINT}`, color: '#a12218', align: 'center' });
    },
  });
}

export function morseText(digits) {
  return [...digits].map((d) => MORSE_DIGITS[d].replace(/\./g, '·').replace(/-/g, '—')).join('   ');
}
