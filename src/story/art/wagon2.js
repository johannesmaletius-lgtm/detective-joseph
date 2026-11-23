import { HAND, INK, PRINT, RED, TYPEWRITER, drawFilePage, drawPicture, glow, line, text, wood } from './common.js';

// Gezeichnetes für Wagen 2 (Gepäckwagen): Kofferanhänger, Kofferstapel mit Kreidefeldern, Gepäckwaage, Aktenseiten.

// ---------------------------------------------------------------- Kofferanhänger
// In zeitlicher Reihenfolge ergeben die Anfangsbuchstaben: W E I C H E S I E B E N
export const TAGS = [
  { id: 't1', city: 'Wien', time: '18:05' },
  { id: 't2', city: 'Essen', time: '18:40' },
  { id: 't3', city: 'Innsbruck', time: '19:15' },
  { id: 't4', city: 'Chur', time: '19:50' },
  { id: 't5', city: 'Hamburg', time: '20:20' },
  { id: 't6', city: 'Erfurt', time: '20:55' },
  { id: 't7', city: 'Stuttgart', time: '21:30' },
  { id: 't8', city: 'Ingolstadt', time: '22:05' },
  { id: 't9', city: 'Emden', time: '22:40' },
  { id: 't10', city: 'Bremen', time: '23:10' },
  { id: 't11', city: 'Eisenach', time: '23:35' },
  { id: 't12', city: 'Nürnberg', time: '23:58' },
];
export const TAG_ORDER = TAGS.map((tag) => tag.id);

// Die Anhänger hängen anfangs durcheinander am Brett (drei Reihen à vier Haken)
const SHUFFLED = ['t7', 't2', 't11', 't5', 't9', 't1', 't12', 't4', 't3', 't10', 't6', 't8'];
export function tagTokens() {
  return SHUFFLED.map((id, i) => {
    const tag = TAGS.find((t) => t.id === id);
    return { id, w: 96, h: 120, label: `${tag.city}, ${tag.time} Uhr`, home: { x: 250 + (i % 6) * 156, y: 170 + Math.floor(i / 6) * 150 }, tag };
  });
}
export const TAG_SLOTS = Array.from({ length: 12 }, (_, i) => ({ x: 120 + i * 88, y: 474, w: 82, h: 120, label: String(i + 1) }));

export function drawTagBoard(ctx) {
  wood(ctx, 90, 70, 1100, 580, [104, 64, 30]);
  text(ctx, 'Kofferanhänger – in der Reihenfolge der Abfahrt aufhängen', 640, 456, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  for (const slot of TAG_SLOTS) {
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.arc(slot.x + slot.w / 2, slot.y + 6, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTag(ctx, token, x, y) {
  const { w, h, tag } = token;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#e9d39b';
  ctx.strokeStyle = '#8c6a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 16, -h / 2);
  ctx.lineTo(w / 2 - 16, -h / 2);
  ctx.lineTo(w / 2, -h / 2 + 16);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.lineTo(-w / 2, -h / 2 + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5c4320';
  ctx.beginPath();
  ctx.arc(0, -h / 2 + 14, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = RED;
  ctx.fillRect(-w / 2, -h / 2 + 28, w, 16);
  text(ctx, 'RINGBAHN', 0, -h / 2 + 41, { font: `bold 12px ${PRINT}`, color: '#fff3d6', align: 'center' });
  text(ctx, tag.city, 0, 4, { font: `bold ${tag.city.length > 8 ? 15 : 18}px ${TYPEWRITER}`, align: 'center' });
  text(ctx, 'Abfahrt', 0, 28, { font: `12px ${PRINT}`, align: 'center' });
  text(ctx, tag.time, 0, 50, { font: `bold 20px ${HAND}`, color: '#27408f', align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Kofferstapel (Türme von Hanoi)
// piles = [[5, 4, 3, 2, 1], [], []] – Koffergröße 1 (klein) … 5 (groß), letzter Eintrag liegt oben
export const PILE_X = [330, 640, 950];
const PILE_Y = 600;
const CASE_COLORS = ['#a8432a', '#4f6b86', '#c9a24a', '#7b2f22', '#5a2e1c'];

export function pileSpots() {
  return PILE_X.map((x, i) => ({ id: `pile${i}`, x: x - 150, y: 150, w: 300, h: 480, label: ['Stapel', 'Kreidefeld links', 'Kreidefeld rechts'][i] }));
}

export function drawStack(ctx, { piles, held, moves }) {
  wood(ctx, 80, 80, 1120, 580, [92, 52, 24]);
  glow(ctx, 640, 120, 600, '255, 210, 140', 0.12);
  PILE_X.forEach((x, i) => {
    if (i > 0) {
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.75)';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 8]);
      ctx.strokeRect(x - 140, PILE_Y - 6, 280, 34);
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x - 140, PILE_Y - 6, 280, 34);
    }
    text(ctx, ['Stapel', 'Kreidefeld', 'Kreidefeld'][i], x, PILE_Y + 58, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
    let y = PILE_Y;
    for (const size of piles[i]) {
      y -= drawCase(ctx, x, y, size);
    }
  });
  if (held) drawCase(ctx, PILE_X[held.from], 230, held.size, true);
  text(ctx, `Züge: ${moves}`, 1170, 120, { font: `18px ${PRINT}`, color: '#f1e0b8', align: 'right' });
}

// Zeichnet einen Koffer, Unterkante bei y. Ergebnis: Höhe
function drawCase(ctx, x, y, size, lifted = false) {
  const w = 80 + size * 36, h = 40 + size * 6;
  ctx.save();
  if (lifted) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 14;
  }
  ctx.fillStyle = CASE_COLORS[size - 1];
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(30, 16, 8, 0.9)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = 'rgba(30, 16, 8, 0.55)';
  ctx.fillRect(x - w / 2 + 18, y - h, 8, h);
  ctx.fillRect(x + w / 2 - 26, y - h, 8, h);
  ctx.fillStyle = '#d6a645';
  ctx.fillRect(x - 8, y - h + 8, 16, 10);
  if (size <= 2) {
    // „Vorsicht Glas“-Aufkleber
    ctx.fillStyle = '#f2e6c8';
    ctx.fillRect(x + 6, y - h + 10, 44, 18);
    text(ctx, 'GLAS!', x + 28, y - h + 24, { font: `bold 11px ${PRINT}`, color: RED, align: 'center' });
  }
  ctx.restore();
  return h + 2;
}

// ---------------------------------------------------------------- Gepäckwaage
// kg = was auf der Waage liegt (0 = leer). Die Nadel dreht sich langsam dorthin (shown).
export function drawScale(ctx, { shown, loaded }) {
  drawPicture(ctx, 'assets/closeups/waage.webp', 0, 0, 1280, 720);
  const cx = 635, cy = 213, r = 128;
  // Skala 0 … 50 kg auf 300°
  const angle = (kg) => (-240 + (kg / 50) * 300) * Math.PI / 180;
  ctx.strokeStyle = INK;
  for (let kg = 0; kg <= 50; kg += 1) {
    const a = angle(kg), long = kg % 5 === 0;
    ctx.lineWidth = long ? 3 : 1.5;
    line(ctx, cx + Math.cos(a) * (r - (long ? 20 : 11)), cy + Math.sin(a) * (r - (long ? 20 : 11)), cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
    if (kg % 10 === 0) text(ctx, String(kg), cx + Math.cos(a) * (r - 38), cy + Math.sin(a) * (r - 38) + 7, { font: `bold 18px ${PRINT}`, align: 'center' });
  }
  text(ctx, 'kg', cx, cy + 58, { font: `bold 20px ${PRINT}`, align: 'center' });
  text(ctx, 'RINGBAHN · GEPÄCKWAAGE', cx, cy - 44, { font: `11px ${PRINT}`, align: 'center' });
  const a = angle(shown);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 5;
  line(ctx, cx, cy, cx + Math.cos(a) * (r - 16), cy + Math.sin(a) * (r - 16));
  ctx.fillStyle = '#3a2c1c';
  ctx.beginPath();
  ctx.arc(cx, cy, 11, 0, Math.PI * 2);
  ctx.fill();
  if (loaded) {
    ctx.fillStyle = CASE_COLORS[4];
    ctx.fillRect(500, 478, 280, 84);
    ctx.strokeStyle = 'rgba(30, 16, 8, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeRect(500, 478, 280, 84);
    ctx.fillStyle = '#c9a24c';
    ctx.fillRect(610, 468, 60, 12);
  }
  // Ablesehilfe: feine Lupe auf die Nadelspitze
  if (shown > 0) {
    const tip = { x: cx + Math.cos(a) * (r - 16), y: cy + Math.sin(a) * (r - 16) };
    ctx.strokeStyle = '#d6a645';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- Aktenseiten
export function drawPage1(ctx) {
  drawFilePage(ctx, {
    page: '1 von 3',
    angle: -0.015,
    lines: [
      'Wenn du das liest, bist du wieder eingeschlafen. Ich bin du – nur ein paar Runden früher.',
      'Seite 2 und 3 habe ich im untersten Koffer des Stapels versteckt. Da sucht keiner.',
      'Vorsicht: Die kleinen Koffer sind zerbrechlich (Glas!). NIE einen größeren auf einen kleineren stellen. Platz ist nur auf den zwei Kreidefeldern.',
      'Die Tür nach vorne will Zahlen: Wieg den untersten Koffer. Sein Gewicht ist der Code – ohne Komma.',
    ],
  });
}

export function drawPages23(ctx) {
  drawFilePage(ctx, {
    x: 90, y: 50, w: 540, h: 620, angle: -0.03, page: 2,
    lines: [
      'Ich habe gezählt, solange ich konnte. Jede Runde fehlt danach jemand:',
      'Runde 1 – eine Dame mit Hut.',
      'Runde 2 – ein Herr mit Pfeife.',
      'Runde 3 – ein Mann im Wintermantel.',
      '… dann habe ich aufgehört. Ich vergesse es jede Runde wieder.',
    ],
  });
  drawFilePage(ctx, {
    x: 660, y: 60, w: 540, h: 620, angle: 0.025, page: 3,
    lines: [
      'Immer im Tunnel. Immer, wenn das Licht ausgeht.',
      'Niemand schreit. Niemand sucht sie. Am Morgen fährt der Zug weiter, als wäre nichts.',
      'IN JEDER RUNDE VERSCHWINDET IM TUNNEL EIN FAHRGAST.',
      'Im Postwagen liegt ein Brief für dich. Lies ihn.',
    ],
  });
}

export function drawSign(ctx) {
  ctx.fillStyle = '#d8cfb8';
  ctx.fillRect(440, 160, 400, 400);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(456, 176, 368, 368);
  text(ctx, 'GEPÄCKWAGEN', 640, 240, { font: `bold 34px ${PRINT}`, align: 'center' });
  text(ctx, 'Abfertigung', 640, 280, { font: `22px ${PRINT}`, align: 'center' });
  text(ctx, 'Anhänger nach Abfahrt', 640, 360, { font: `20px ${PRINT}`, align: 'center' });
  text(ctx, 'aufhängen – frühe zuerst.', 640, 390, { font: `20px ${PRINT}`, align: 'center' });
  text(ctx, 'Zerbrechliches nach oben!', 640, 460, { font: `bold 20px ${PRINT}`, color: RED, align: 'center' });
}
