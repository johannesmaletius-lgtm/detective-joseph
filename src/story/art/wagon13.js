import { loadImage } from '../../core/assets.js';
import { STAINED } from '../../scene/chapelCar.js';
import { HAND, INK, PRINT, SERIF, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 13 (Kapelle): Buntglas, Kerzenschein, der Adventskranz mit zwölf
// Kerzen (je ein Zeichen für die Wagen 1–12), der Abrieb der Gedenktafel, die roten Lichtpunkte
// der Laterne und das Familienfoto.

let photo = null;
loadImage('assets/scenes/wagon-13/familienfoto.webp').then((image) => { photo = image; });

// ---------------------------------------------------------------- Buntglas und Licht
const GLASS = ['#9c2a22', '#d9a425', '#2a5fa8', '#3f7a3a', '#7a3a8a'];

export function drawStainedGlass(ctx) {
  STAINED.forEach((w, i) => {
    const width = w.to - w.from, height = w.bottom - w.top;
    ctx.save();
    ctx.beginPath();
    ctx.rect(w.from - 2, w.top - 2, width + 4, height + 4);
    ctx.clip();
    const rows = 6, cols = 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = GLASS[(r * 2 + c + i) % GLASS.length];
        ctx.fillRect(w.from + (c * width) / cols, w.top + (r * height) / rows, width / cols + 1, height / rows + 1);
      }
    }
    // Nachtlicht von draußen, oben heller
    const night = ctx.createLinearGradient(0, w.top, 0, w.bottom);
    night.addColorStop(0, 'rgba(20, 20, 40, 0.2)');
    night.addColorStop(1, 'rgba(10, 8, 20, 0.6)');
    ctx.fillStyle = night;
    ctx.fillRect(w.from - 2, w.top - 2, width + 4, height + 4);
    ctx.strokeStyle = '#1b130c';
    ctx.lineWidth = 3;
    for (let r = 1; r < rows; r++) line(ctx, w.from, w.top + (r * height) / rows, w.to, w.top + (r * height) / rows);
    line(ctx, w.from + width / 2, w.top, w.from + width / 2, w.bottom);
    ctx.restore();
  });
}

// Kerzen auf dem Kranz im Wagen (ungefähre Stellen im Hintergrundbild)
const WREATH_CANDLES = [[455, 42], [484, 24], [526, 12], [590, 8], [692, 8], [760, 12], [803, 24], [835, 42], [575, 98], [715, 98], [640, 96], [520, 70]];

export function drawChapelLight(ctx, { lit = 0, lanternLit = false, lanternTaken = false, time = 0 }) {
  for (let i = 0; i < lit && i < WREATH_CANDLES.length; i++) {
    const [x, y] = WREATH_CANDLES[i];
    const flicker = 0.85 + 0.15 * Math.sin(time * 9 + i * 1.7);
    glow(ctx, x, y - 8, 26, '255, 200, 110', 0.55 * flicker);
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(x, y - 10, 3, 6 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lit >= 12) glow(ctx, 640, 60, 300, '255, 190, 110', 0.12);
  if (lanternTaken) {
    // leerer Haken am Ständer: Laterne übermalen ist zu aufwendig – stattdessen dunkler Schatten
    ctx.fillStyle = 'rgba(20, 12, 6, 0.75)';
    ctx.beginPath();
    ctx.ellipse(1152, 440, 36, 62, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (lanternLit) {
    glow(ctx, 1152, 440, 90, '255, 160, 90', 0.4);
  }
}

// ---------------------------------------------------------------- Der Adventskranz
// Zwölf Kerzen, auf jeder ein kleines Zeichen für einen Wagen. Anzünden in der Reihenfolge der Reise.
export const CANDLE_SYMBOLS = ['bench', 'suitcase', 'letter', 'glass', 'bed', 'umbrella', 'whisky', 'film', 'mirror', 'horn', 'clock', 'note'];
const SHUFFLED = [6, 2, 10, 0, 8, 4, 11, 1, 7, 3, 9, 5]; // Platz auf dem Kranz → Wagen-Index

export function candleSpots() {
  return SHUFFLED.map((wagon, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { id: `candle${i}`, wagon, x: 640 + Math.cos(a) * 250 - 26, y: 350 + Math.sin(a) * 200 - 70, w: 52, h: 110, label: 'Kerze' };
  });
}

export function drawWreathCard(ctx, litOrder, time) {
  ctx.fillStyle = 'rgba(14, 8, 4, 0.6)';
  ctx.fillRect(160, 60, 960, 620);
  // Tannengrün
  ctx.save();
  ctx.strokeStyle = '#26452a';
  ctx.lineWidth = 70;
  ctx.beginPath();
  ctx.ellipse(640, 360, 250, 200, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#3c6b3c';
  ctx.lineWidth = 6;
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const x = 640 + Math.cos(a) * 250, y = 360 + Math.sin(a) * 200;
    line(ctx, x, y, x + Math.cos(a * 7) * 30, y + Math.sin(a * 5) * 24);
  }
  ctx.fillStyle = '#b3261e';
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(640 + Math.cos(a) * 262, 360 + Math.sin(a) * 212, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const spot of candleSpots()) {
    const lit = litOrder.includes(spot.wagon);
    const { x, y, w, h } = spot;
    const wax = ctx.createLinearGradient(x, 0, x + w, 0);
    wax.addColorStop(0, '#e9dfc6');
    wax.addColorStop(0.5, '#fbf5e6');
    wax.addColorStop(1, '#d6c9aa');
    ctx.fillStyle = wax;
    ctx.fillRect(x + 6, y + 20, w - 12, h - 20);
    drawSymbol(ctx, CANDLE_SYMBOLS[spot.wagon], x + w / 2, y + 66);
    ctx.strokeStyle = '#2a1f16';
    ctx.lineWidth = 2;
    line(ctx, x + w / 2, y + 20, x + w / 2, y + 10);
    if (lit) {
      const flicker = 0.85 + 0.15 * Math.sin(time * 10 + spot.wagon);
      glow(ctx, x + w / 2, y + 2, 40, '255, 200, 110', 0.6);
      ctx.fillStyle = '#ffd36b';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y, 6, 13 * flicker, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff6d0';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 3, 3, 6 * flicker, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  text(ctx, '„Zünde sie an in der Reihenfolge deines Weges.“', 640, 660, { font: `italic 20px ${SERIF}`, color: '#f3e2b4', align: 'center' });
}

// kleine Zeichen auf den Kerzen (24 × 24 um die Mitte) – auch auf den Modellbahn-Wagen in Wagen 15
export function drawSymbol(ctx, symbol, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#6b3a1a';
  ctx.fillStyle = '#6b3a1a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  const s = (fn) => { ctx.beginPath(); fn(); ctx.stroke(); };
  switch (symbol) {
    case 'bench': // Sitzbank im Abteil
      ctx.fillRect(-12, -2, 24, 6);
      ctx.fillRect(-12, -12, 5, 18);
      line(ctx, -9, 4, -9, 12); line(ctx, 9, 4, 9, 12);
      break;
    case 'suitcase':
      ctx.strokeRect(-11, -6, 22, 16);
      s(() => { ctx.moveTo(-4, -6); ctx.lineTo(-4, -11); ctx.lineTo(4, -11); ctx.lineTo(4, -6); });
      break;
    case 'letter':
      ctx.strokeRect(-12, -8, 24, 16);
      s(() => { ctx.moveTo(-12, -8); ctx.lineTo(0, 2); ctx.lineTo(12, -8); });
      break;
    case 'glass': // Weinglas
      s(() => { ctx.moveTo(-8, -12); ctx.quadraticCurveTo(-8, 2, 0, 2); ctx.quadraticCurveTo(8, 2, 8, -12); });
      line(ctx, 0, 2, 0, 11); line(ctx, -6, 11, 6, 11);
      break;
    case 'bed': // Mond über einem Bett
      ctx.fillRect(-12, 2, 24, 5);
      line(ctx, -12, -4, -12, 10);
      s(() => ctx.arc(4, -8, 5, 0.5, 4.5));
      break;
    case 'umbrella':
      s(() => { ctx.arc(0, -2, 11, Math.PI, 0); ctx.lineTo(-11, -2); });
      s(() => { ctx.moveTo(0, -2); ctx.lineTo(0, 10); ctx.arc(-3, 10, 3, 0, Math.PI); });
      break;
    case 'whisky': // Glas mit Eiswürfel
      ctx.strokeRect(-8, -8, 16, 18);
      ctx.fillRect(-5, -2, 7, 7);
      break;
    case 'film':
      s(() => ctx.arc(0, 0, 11, 0, Math.PI * 2));
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.57) * 6, Math.sin(i * 1.57) * 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'mirror':
      s(() => ctx.ellipse(0, -2, 8, 11, 0, 0, Math.PI * 2));
      line(ctx, 0, 9, 0, 13); line(ctx, -5, 13, 5, 13);
      line(ctx, -3, -7, 2, -10);
      break;
    case 'horn': // Lautsprechertrichter
      s(() => { ctx.moveTo(-12, -3); ctx.lineTo(4, -10); ctx.lineTo(4, 10); ctx.lineTo(-12, 3); ctx.closePath(); });
      line(ctx, 8, -6, 12, -9); line(ctx, 8, 6, 12, 9);
      break;
    case 'clock':
      s(() => ctx.arc(0, 0, 11, 0, Math.PI * 2));
      line(ctx, 0, 0, 0, -7); line(ctx, 0, 0, 5, 2);
      break;
    case 'note':
      ctx.beginPath();
      ctx.ellipse(-3, 7, 5, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
      line(ctx, 2, 6, 2, -11);
      s(() => { ctx.moveTo(2, -11); ctx.quadraticCurveTo(10, -7, 8, 0); });
      break;
    case 'chapel': // Kreuz und Kerze
      line(ctx, -4, -12, -4, 12); line(ctx, -11, -5, 3, -5);
      ctx.fillRect(6, -2, 6, 13);
      ctx.beginPath();
      ctx.ellipse(9, -6, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'newspaper':
      ctx.strokeRect(-12, -10, 24, 20);
      ctx.fillRect(-9, -7, 18, 4);
      line(ctx, -9, 1, 9, 1); line(ctx, -9, 6, 4, 6);
      break;
    default:
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Gedenktafel und Abrieb
export const PLAQUE_LINES = [
  'ZUM GEDENKEN AN DEN WEIHNACHTSZUG',
  'VOM 24. DEZEMBER,',
  'DER SEINEN BAHNHOF NIE ERREICHTE.',
  'BRUNO · ILSE · K. · TICK · MOLL',
  'DER LOKFÜHRER · DER FUNKER · MIRA',
  '… UND J.',
];
// Die roten Lichtpunkte der Laterne: [Zeile, Buchstabe] → H, E, I, M
export const LANTERN_DOTS = [[0, 23], [1, 9], [2, 20], [3, 27]];
export const LANTERN_WORD = 'HEIM';

export function rubSpots() {
  return PLAQUE_LINES.map((_, i) => ({ id: `band${i}`, band: i, x: 260, y: 170 + i * 66, w: 760, h: 66, label: 'Mit dem Bleistift reiben', quiet: true }));
}

export function drawRubbing(ctx, revealed, { dots = false, time = 0 } = {}) {
  // Die Tafel unter dem Papier
  ctx.fillStyle = '#3a2c1e';
  ctx.fillRect(200, 110, 880, 500);
  sheet(ctx, 240, 140, 800, 440, {
    color: '#efe7d2',
    shade: '#ddd2b6',
    inner: (c) => {
      PLAQUE_LINES.forEach((row, i) => {
        const shown = revealed[i];
        const y = 30 + i * 66;
        if (shown) {
          c.fillStyle = 'rgba(48, 46, 52, 0.55)';
          c.fillRect(16, y + 4, 768, 58);
          // ausgesparte Buchstaben: hell auf dunkel gerieben
          text(c, row, 400, y + 46, { font: `bold 30px ${SERIF}`, color: '#efe7d2', align: 'center' });
        } else {
          text(c, '· · ·', 400, y + 44, { font: `20px ${SERIF}`, color: 'rgba(60, 50, 40, 0.25)', align: 'center' });
        }
      });
    },
  });
  if (dots) drawLanternDots(ctx, time);
}

function drawLanternDots(ctx, time) {
  ctx.save();
  ctx.font = `bold 30px ${SERIF}`;
  for (const [row, index] of LANTERN_DOTS) {
    const value = PLAQUE_LINES[row];
    const full = ctx.measureText(value).width;
    const before = ctx.measureText(value.slice(0, index)).width;
    const letter = ctx.measureText(value[index]).width;
    const x = 240 + 400 - full / 2 + before + letter / 2;
    const y = 140 + 30 + row * 66 + 34;
    glow(ctx, x, y, 34, '255, 40, 30', 0.55 + 0.1 * Math.sin(time * 5 + row));
    ctx.fillStyle = 'rgba(255, 60, 40, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  text(ctx, 'Das Licht der Laterne fällt durch die winzigen Löcher im roten Glas.', 640, 640, { font: `18px ${PRINT}`, color: '#ffd0c0', align: 'center' });
}

// Die Tafel ohne Abrieb: Ruß
export function drawSootyPlaque(ctx) {
  ctx.fillStyle = '#2c2218';
  ctx.fillRect(300, 150, 680, 420);
  const soot = ctx.createRadialGradient(640, 360, 40, 640, 360, 400);
  soot.addColorStop(0, '#4a3a28');
  soot.addColorStop(1, '#1a130d');
  ctx.fillStyle = soot;
  ctx.fillRect(320, 170, 640, 380);
  ctx.fillStyle = 'rgba(120, 100, 70, 0.25)';
  for (let i = 0; i < 6; i++) ctx.fillRect(380, 210 + i * 56, 520 - (i % 3) * 60, 14);
  text(ctx, 'Unter dem Ruß ahnt man eingravierte Zeilen.', 640, 610, { font: `18px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// ---------------------------------------------------------------- Familienfoto
export function drawFamilyPhoto(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, 1280, 720);
  if (!photo) return;
  const h = 620, w = (photo.width / photo.height) * h;
  ctx.save();
  ctx.translate(640, 350);
  ctx.rotate(-0.025);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.drawImage(photo, -w / 2, -h / 2, w, h);
  ctx.restore();
}

// Zettel am Glockenbalken
export function drawBellNote(ctx) {
  sheet(ctx, 400, 220, 480, 260, {
    angle: 0.02,
    inner: (c) => {
      text(c, 'Lasst sie klingen', 240, 90, { font: `30px ${HAND}`, align: 'center' });
      text(c, 'wie das Lied der Feier.', 240, 140, { font: `30px ${HAND}`, align: 'center' });
      text(c, '(groß · klein · klein)', 240, 210, { font: `18px ${HAND}`, color: '#7a6a50', align: 'center' });
    },
  });
}

