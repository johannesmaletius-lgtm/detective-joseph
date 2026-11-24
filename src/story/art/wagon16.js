import { MORSE_DIGITS } from '../../effects/morse.js';
import { HAND, INK, PRINT, SERIF, TYPEWRITER, drawPicture, glow, handCap, line, metalPanel, rivet, sheet, smudge, text, wood } from './common.js';

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
  // Gerätefront aus grün lackiertem Blech, wie das Funkgerät
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  metalPanel(ctx, 240, 80, 800, 580, { top: '#3f5a43', bottom: '#1f2e22', radius: 14, bevel: 4 });
  ctx.restore();
  for (const [x, y] of [[262, 102], [1018, 102], [262, 638], [1018, 638]]) rivet(ctx, x, y, 7, { slot: true, tone: '#9a8a5a' });
  text(ctx, 'ANTENNE · RICHTUNG', 520, 140, { font: `bold 16px ${PRINT}`, color: '#d9c88a', align: 'center' });
  // Messingring mit Rändel
  const cx = 520, cy = 380;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  const ringGrad = ctx.createLinearGradient(cx - 200, cy - 200, cx + 200, cy + 200);
  ringGrad.addColorStop(0, '#f4d68a');
  ringGrad.addColorStop(0.5, '#a5772c');
  ringGrad.addColorStop(1, '#5a3a10');
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 198, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(60, 36, 6, 0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * 188, cy + Math.sin(a) * 188, cx + Math.cos(a) * 197, cy + Math.sin(a) * 197);
  }
  // Skala
  const dial = ctx.createRadialGradient(cx - 50, cy - 60, 20, cx, cy, 182);
  dial.addColorStop(0, '#faf3dc');
  dial.addColorStop(1, '#d7c79c');
  ctx.fillStyle = dial;
  ctx.beginPath();
  ctx.arc(cx, cy, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 172, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    ctx.lineWidth = i % 8 === 0 ? 3 : 1;
    const inner = i % 8 === 0 ? 148 : 162;
    line(ctx, cx + Math.cos(a) * inner, cy + Math.sin(a) * inner, cx + Math.cos(a) * 172, cy + Math.sin(a) * 172);
  }
  DIRECTIONS.forEach((name, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    text(ctx, name, cx + Math.cos(a) * 118, cy + Math.sin(a) * 118 + 6, { font: `bold 15px ${PRINT}`, color: INK, align: 'center' });
  });
  // kleiner Zug in der Mitte, von oben (Fahrtrichtung nach oben)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(-12, -36, 28, 96);
  for (let k = 0; k < 3; k++) {
    ctx.fillStyle = k === 0 ? '#3a3430' : '#6b4a2a';
    ctx.beginPath();
    ctx.roundRect(-13, -38 + k * 32, 26, 28, k === 0 ? [12, 12, 3, 3] : 3);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 220, 140, 0.55)';
    if (k > 0) for (let w = 0; w < 3; w++) ctx.fillRect(-11, -32 + k * 32 + w * 8, 3, 4);
  }
  ctx.fillStyle = '#f3d27a';
  ctx.beginPath();
  ctx.arc(0, -34, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Zeiger = Antenne (Messingnadel mit Dipol an der Spitze)
  const a = (direction / 8) * Math.PI * 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(a);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#b3261e';
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(-3, -88);
  ctx.lineTo(0, -98);
  ctx.lineTo(3, -88);
  ctx.lineTo(6, 20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b3261e';
  ctx.lineWidth = 4;
  line(ctx, -14, -86, 14, -86);
  ctx.restore();
  // Kurbel auf der Achse
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(a + 0.8);
  const arm = ctx.createLinearGradient(0, -10, 0, 10);
  arm.addColorStop(0, '#e8c46a');
  arm.addColorStop(1, '#7a5418');
  ctx.fillStyle = arm;
  ctx.beginPath();
  ctx.roundRect(-8, -9, 78, 18, 9);
  ctx.fill();
  ctx.fillStyle = '#2a1a0c';
  ctx.beginPath();
  ctx.arc(66, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.arc(62, -4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  handCap(ctx, cx, cy, 16, '#8a6020');
  // Empfangsanzeige
  drawMeter(ctx, 850, 330, signalStrength(direction), time);
  text(ctx, 'Antenne: wohin zeigt sie, vom Zug aus?', 640, 628, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

function drawMeter(ctx, cx, cy, value, time) {
  // Kasten mit Glas
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#1a1712';
  ctx.beginPath();
  ctx.roundRect(cx - 120, cy - 120, 240, 170, 12);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#a5772c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cx - 120, cy - 120, 240, 170, 12);
  ctx.stroke();
  const face = ctx.createLinearGradient(0, cy - 110, 0, cy + 40);
  face.addColorStop(0, '#f6ecd0');
  face.addColorStop(1, '#d9c99c');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.roundRect(cx - 108, cy - 108, 216, 146, 8);
  ctx.fill();
  const pivot = cy + 26;
  // Skala mit grünem Bereich
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(60, 150, 70, 0.75)';
  ctx.beginPath();
  ctx.arc(cx, pivot, 104, Math.PI * 1.78, Math.PI * 1.95);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(179, 38, 30, 0.6)';
  ctx.beginPath();
  ctx.arc(cx, pivot, 104, Math.PI * 1.05, Math.PI * 1.25);
  ctx.stroke();
  ctx.strokeStyle = INK;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * 1.05 + (i / 10) * Math.PI * 0.9;
    ctx.lineWidth = i % 5 === 0 ? 2.5 : 1.2;
    line(ctx, cx + Math.cos(a) * 92, pivot + Math.sin(a) * 92, cx + Math.cos(a) * 110, pivot + Math.sin(a) * 110);
  }
  text(ctx, 'EMPFANG', cx, pivot - 30, { font: `bold 13px ${PRINT}`, color: INK, align: 'center' });
  const wobble = Math.sin(time * 13) * 0.04 * (1 - value);
  const a = Math.PI * 1.05 + Math.min(1, Math.max(0, value * 0.95 + wobble)) * Math.PI * 0.9;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - 108, cy - 108, 216, 146, 8);
  ctx.clip();
  ctx.strokeStyle = '#1c140c';
  ctx.lineWidth = 2.5;
  line(ctx, cx, pivot, cx + Math.cos(a) * 112, pivot + Math.sin(a) * 112);
  handCap(ctx, cx, pivot, 7, '#1c140c');
  // Glasglanz
  const shine = ctx.createLinearGradient(cx - 108, cy - 108, cx, cy);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shine;
  ctx.fillRect(cx - 108, cy - 108, 216, 80);
  ctx.restore();
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
      text(c, '· kurz     — lang', 340, 510, { font: `18px ${PRINT}`, align: 'center' });
    },
  });
}

export function morseText(digits) {
  return [...digits].map((d) => MORSE_DIGITS[d].replace(/\./g, '·').replace(/-/g, '—')).join('   ');
}
