import { loadImage } from '../../core/assets.js';
import { STAINED } from '../../scene/chapelCar.js';
import {
  HAND, INK, PRINT, SERIF, cachedLayer, drawPicture, fineGrain, glow, grain, line, plank, rivet, roundedRect, screw, sheet, smudge, text, vignette,
} from './common.js';

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

// Docht und Kärtchen jeder Kerze im Bild kranz.webp (Bildpunkte 1672 × 941), im Uhrzeigersinn ab oben
const S = 1280 / 1672;
const CANDLES = [
  [840, 25, 840, 195], [1100, 50, 1065, 225], [1330, 135, 1290, 320], [1435, 282, 1425, 490],
  [1310, 425, 1310, 645], [1100, 525, 1095, 735], [840, 565, 835, 790], [565, 520, 575, 740],
  [360, 430, 365, 645], [240, 275, 245, 490], [360, 115, 390, 315], [575, 45, 595, 230],
].map(([wx, wy, cx, cy]) => ({ wx: wx * S, wy: wy * S, cx: cx * S, cy: cy * S }));

export function candleSpots() {
  return SHUFFLED.map((wagon, i) => {
    const c = CANDLES[i];
    return { id: `candle${i}`, wagon, slot: i, x: c.wx - 30, y: c.wy - 8, w: 60, h: c.cy + 24 - (c.wy - 8), label: 'Kerze' };
  });
}

export function drawWreathCard(ctx, litOrder, time) {
  drawPicture(ctx, 'assets/closeups/kranz.webp', 0, 0, 1280, 720);
  for (const spot of candleSpots()) {
    const c = CANDLES[spot.slot];
    ctx.save();
    ctx.translate(c.cx, c.cy);
    ctx.scale(1.4, 1.4);
    drawSymbol(ctx, CANDLE_SYMBOLS[spot.wagon], 0, 0);
    ctx.restore();
    if (litOrder.includes(spot.wagon)) {
      const flicker = 0.85 + 0.15 * Math.sin(time * 10 + spot.wagon);
      const fx = c.wx, fy = c.wy - 6;
      glow(ctx, fx, fy, 46, '255, 200, 110', 0.6);
      ctx.fillStyle = '#ffd36b';
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6, 13 * flicker, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff6d0';
      ctx.beginPath();
      ctx.ellipse(fx, fy + 3, 3, 6 * flicker, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  text(ctx, '„Zünde sie an in der Reihenfolge deines Weges.“', 640, 380, { font: `italic 22px ${SERIF}`, color: '#f3e2b4', align: 'center' });
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

// Die Bronzetafel an der Wand, darüber das Papier
function paintPlaqueBoard(c) {
  plank(c, 0, 0, 1280, 720, { tone: [56, 34, 22], seed: 133, vertical: true, knots: 0 });
  vignette(c, 0, 0, 1280, 720, 0.7);
  glow(c, 640, 360, 560, '255, 200, 120', 0.12);
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.75)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 12;
  const frame = c.createLinearGradient(200, 110, 1080, 610);
  frame.addColorStop(0, '#d8b46a');
  frame.addColorStop(0.5, '#8a6428');
  frame.addColorStop(1, '#4a3010');
  c.fillStyle = frame;
  roundedRect(c, 200, 110, 880, 500, 10);
  c.fill();
  c.restore();
  const plate = c.createLinearGradient(0, 128, 0, 592);
  plate.addColorStop(0, '#4a3a26');
  plate.addColorStop(1, '#2a2016');
  c.fillStyle = plate;
  c.fillRect(218, 128, 844, 464);
  grain(c, 218, 128, 844, 464, { seed: 134, count: 900, alpha: 0.3, size: 2.5 });
  c.strokeStyle = 'rgba(255, 220, 150, 0.25)';
  c.lineWidth = 2;
  roundedRect(c, 203, 113, 874, 494, 9);
  c.stroke();
  for (const [x, y] of [[214, 124], [1066, 124], [214, 596], [1066, 596]]) screw(c, x, y, 8, x * 0.01);
}

export function drawRubbing(ctx, revealed, { dots = false, time = 0 } = {}) {
  ctx.drawImage(cachedLayer('w13-plaque', paintPlaqueBoard), 0, 0, 1280, 720);
  sheet(ctx, 240, 140, 800, 440, {
    color: '#efe7d2',
    shade: '#ddd2b6',
    inner: (c) => {
      fineGrain(c, 0, 0, 800, 440, { seed: 135, count: 0.003, dark: 0.08, light: 0.05 });
      PLAQUE_LINES.forEach((row, i) => {
        const shown = revealed[i];
        const y = 30 + i * 66;
        if (shown) {
          // Graphit, mit schrägen Bleistiftstrichen gerieben
          const g = c.createLinearGradient(16, 0, 784, 0);
          g.addColorStop(0, 'rgba(48, 46, 52, 0.35)');
          g.addColorStop(0.1, 'rgba(48, 46, 52, 0.6)');
          g.addColorStop(0.9, 'rgba(48, 46, 52, 0.6)');
          g.addColorStop(1, 'rgba(48, 46, 52, 0.3)');
          c.fillStyle = g;
          c.fillRect(16, y + 4, 768, 58);
          c.save();
          c.beginPath();
          c.rect(16, y + 4, 768, 58);
          c.clip();
          c.strokeStyle = 'rgba(30, 28, 34, 0.25)';
          c.lineWidth = 2;
          for (let x = 0; x < 800; x += 7) line(c, x, y + 66, x + 30, y);
          grain(c, 16, y + 4, 768, 58, { seed: 136 + i, count: 260, alpha: 0.25, light: true });
          c.restore();
          // ausgesparte Buchstaben: hell auf dunkel gerieben
          text(c, row, 400, y + 46, { font: `bold 30px ${SERIF}`, color: '#efe7d2', align: 'center' });
        } else {
          text(c, '· · ·', 400, y + 44, { font: `20px ${SERIF}`, color: 'rgba(60, 50, 40, 0.25)', align: 'center' });
        }
      });
    },
  });
  // Klebestreifen an den Ecken
  for (const [x, y, a] of [[250, 146, -0.6], [1030, 146, 0.6], [250, 574, 0.6], [1030, 574, -0.6]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = 'rgba(236, 226, 190, 0.7)';
    ctx.fillRect(-28, -9, 56, 18);
    ctx.restore();
  }
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
  drawPicture(ctx, 'assets/closeups/gedenktafel.webp', 0, 0, 1280, 720);
  ctx.fillStyle = 'rgba(20, 10, 4, 0.7)';
  ctx.fillRect(420, 690, 440, 26);
  text(ctx, 'Unter dem Ruß ahnt man eingravierte Zeilen.', 640, 709, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
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

// Zettel am Glockenbalken: Balken mit drei Bronzeglocken, der Zettel ist ans Seil der großen gebunden
function paintBellBeam(c) {
  // Wand der Kapelle, oben dunkel, buntes Licht von den Fenstern
  plank(c, 0, 0, 1280, 720, { tone: [56, 34, 22], seed: 131, vertical: true, knots: 0 });
  for (let x = 64; x < 1280; x += 160) {
    c.fillStyle = 'rgba(0, 0, 0, 0.32)';
    c.fillRect(x, 0, 3, 720);
  }
  glow(c, 150, 420, 300, '120, 150, 255', 0.1);
  glow(c, 1140, 380, 320, '255, 90, 70', 0.1);
  glow(c, 640, 260, 520, '255, 206, 130', 0.14);
  vignette(c, 0, 0, 1280, 720, 0.7);
  // Der Balken
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.75)';
  c.shadowBlur = 30;
  c.shadowOffsetY = 16;
  c.fillStyle = '#3a2210';
  c.fillRect(-10, 40, 1300, 86);
  c.restore();
  plank(c, -10, 40, 1300, 86, { tone: [96, 58, 30], seed: 132, knots: 3 });
  c.fillStyle = 'rgba(255, 220, 160, 0.22)';
  c.fillRect(0, 40, 1280, 2);
  const under = c.createLinearGradient(0, 100, 0, 126);
  under.addColorStop(0, 'rgba(0, 0, 0, 0)');
  under.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  c.fillStyle = under;
  c.fillRect(0, 100, 1280, 26);
  // Eisenbänder um den Balken
  for (const x of [80, 450, 830, 1200]) {
    c.fillStyle = '#2a2622';
    c.fillRect(x - 14, 38, 28, 90);
    c.fillStyle = 'rgba(200, 190, 170, 0.18)';
    c.fillRect(x - 14, 38, 3, 90);
    rivet(c, x, 56, 4, [110, 104, 96]);
    rivet(c, x, 110, 4, [110, 104, 96]);
  }
  // Geschnitzte Inschrift
  text(c, 'GLORIA · IN · EXCELSIS', 640, 92, { font: `bold 22px ${SERIF}`, color: 'rgba(30, 14, 4, 0.55)', align: 'center' });
  text(c, 'GLORIA · IN · EXCELSIS', 639, 91, { font: `bold 22px ${SERIF}`, color: 'rgba(255, 220, 160, 0.16)', align: 'center' });
  // Glocken: links klein, Mitte groß, rechts klein
  for (const [x, size] of [[250, 110], [640, 190], [1030, 110]]) {
    const lip = drawBell(c, x, 126, size);
    // Glockenseil vom Klöppel bis nach unten
    c.strokeStyle = '#8a6a3a';
    c.lineWidth = size > 150 ? 8 : 6;
    line(c, x + 2, lip, x + 6, 720);
    c.strokeStyle = 'rgba(40, 24, 8, 0.6)';
    c.lineWidth = 1.5;
    for (let y = lip + 6; y < 720; y += 10) line(c, x - 1, y, x + 7, y + 6);
  }
}

// Eine Bronzeglocke, Krone oben an (x, top). Gibt die Höhe des Glockenrands zurück.
function drawBell(c, x, top, size) {
  const h = size * 1.05, w = size;
  // Joch aus Eisen
  c.fillStyle = '#2a2622';
  c.fillRect(x - w * 0.32, top - 4, w * 0.64, 16);
  rivet(c, x - w * 0.26, top + 4, 3.5, [110, 104, 96]);
  rivet(c, x + w * 0.26, top + 4, 3.5, [110, 104, 96]);
  // Krone
  c.strokeStyle = '#6a4a1e';
  c.lineWidth = size * 0.06;
  c.beginPath();
  c.arc(x, top + 22, size * 0.1, Math.PI, 0);
  c.stroke();
  const y0 = top + 18;
  const lipY = y0 + h;
  // Körper
  const body = () => {
    c.beginPath();
    c.moveTo(x - w * 0.24, y0);
    c.bezierCurveTo(x - w * 0.34, y0 - 6, x - w * 0.34, y0 + h * 0.5, x - w * 0.36, y0 + h * 0.7);
    c.bezierCurveTo(x - w * 0.38, y0 + h * 0.86, x - w * 0.5, y0 + h * 0.9, x - w * 0.54, lipY);
    c.lineTo(x + w * 0.54, lipY);
    c.bezierCurveTo(x + w * 0.5, y0 + h * 0.9, x + w * 0.38, y0 + h * 0.86, x + w * 0.36, y0 + h * 0.7);
    c.bezierCurveTo(x + w * 0.34, y0 + h * 0.5, x + w * 0.34, y0 - 6, x + w * 0.24, y0);
    c.closePath();
  };
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.6)';
  c.shadowBlur = 24;
  c.shadowOffsetY = 10;
  const g = c.createLinearGradient(x - w * 0.55, 0, x + w * 0.55, 0);
  g.addColorStop(0, '#3a2410');
  g.addColorStop(0.22, '#b07a32');
  g.addColorStop(0.36, '#f0cc80');
  g.addColorStop(0.5, '#a8722c');
  g.addColorStop(0.8, '#6a4418');
  g.addColorStop(1, '#2a1a0a');
  c.fillStyle = g;
  body();
  c.fill();
  c.restore();
  // Patina und Zierbänder
  c.save();
  body();
  c.clip();
  grain(c, x - w * 0.6, y0, w * 1.2, h, { seed: size, count: 260, alpha: 0.2, size: 2.4 });
  c.fillStyle = 'rgba(70, 140, 110, 0.12)';
  c.fillRect(x - w * 0.6, y0, w * 0.25, h);
  for (const f of [0.22, 0.28, 0.82, 0.88]) {
    c.strokeStyle = 'rgba(40, 22, 6, 0.55)';
    c.lineWidth = 2;
    line(c, x - w, y0 + h * f, x + w, y0 + h * f);
    c.strokeStyle = 'rgba(255, 226, 160, 0.3)';
    c.lineWidth = 1;
    line(c, x - w, y0 + h * f + 2, x + w, y0 + h * f + 2);
  }
  c.restore();
  // Mündung mit Klöppel
  c.fillStyle = '#140a04';
  c.beginPath();
  c.ellipse(x, lipY, w * 0.54, w * 0.08, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#d8aa58';
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(x, lipY, w * 0.54, w * 0.08, 0, 0, Math.PI);
  c.stroke();
  c.fillStyle = '#3a2a1a';
  c.beginPath();
  c.arc(x + 2, lipY + w * 0.05, w * 0.07, 0, Math.PI * 2);
  c.fill();
  return lipY + w * 0.1;
}

export function drawBellNote(ctx) {
  ctx.drawImage(cachedLayer('w13-bellbeam', paintBellBeam), 0, 0, 1280, 720);
  // Der Zettel, mit Bindfaden ans Seil der großen Glocke geknotet
  ctx.strokeStyle = '#c8b890';
  ctx.lineWidth = 2;
  line(ctx, 644, 392, 600, 414);
  line(ctx, 644, 392, 690, 414);
  ctx.fillStyle = '#c8b890';
  ctx.beginPath();
  ctx.arc(644, 392, 5, 0, Math.PI * 2);
  ctx.fill();
  sheet(ctx, 420, 400, 440, 250, {
    angle: 0.02,
    color: '#efe3c0',
    shade: '#d6c494',
    inner: (c) => {
      fineGrain(c, 0, 0, 440, 250, { seed: 13, count: 0.004, dark: 0.1, light: 0.05 });
      // Lochung oben, ein wenig eingerissen
      for (const hx of [180, 270]) {
        c.fillStyle = '#4a3a24';
        c.beginPath();
        c.arc(hx, 14, 4, 0, Math.PI * 2);
        c.fill();
      }
      smudge(c, 330, 170, 70, 50, 'rgba(140, 100, 50, 0.25)');
      text(c, 'Lasst sie klingen', 220, 86, { font: `30px ${HAND}`, align: 'center' });
      text(c, 'wie das Lied der Feier.', 220, 136, { font: `30px ${HAND}`, align: 'center' });
      text(c, '(groß · klein · klein)', 220, 200, { font: `18px ${HAND}`, color: '#7a6a50', align: 'center' });
    },
  });
}
