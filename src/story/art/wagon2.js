import {
  HAND, INK, PRINT, RED, TYPEWRITER, brassPlate, cachedLayer, drawFilePage, drawPicture, fineGrain, glow, grain, line, plank, rivet, roundedRect,
  screw, text, vignette, woodFrame,
} from './common.js';

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

// Brett im Gepäckwagen: oben hängen die Anhänger durcheinander, unten die Hakenleiste mit 1–12
function paintTagBoard(c) {
  plank(c, 0, 0, 1280, 720, { tone: [60, 38, 22], seed: 21, vertical: true, knots: 0 });
  vignette(c, 0, 0, 1280, 720, 0.6);
  woodFrame(c, 80, 60, 1120, 600, { border: 28, tone: [120, 76, 40], seed: 22 });
  // Bretter der Rückwand (waagerecht, mit Fugen)
  for (let k = 0; k < 6; k++) plank(c, 108, 88 + k * 91, 1064, 91, { tone: [150, 104, 60], seed: 30 + k, knots: 1 });
  for (let k = 1; k < 6; k++) {
    c.fillStyle = 'rgba(30, 14, 4, 0.55)';
    c.fillRect(108, 88 + k * 91, 1064, 2);
    c.fillStyle = 'rgba(255, 226, 170, 0.18)';
    c.fillRect(108, 90 + k * 91, 1064, 1);
  }
  fineGrain(c, 108, 88, 1064, 544, { seed: 23, count: 0.003 });
  glow(c, 420, 160, 560, '255, 220, 160', 0.14);
  // Haken für die losen Anhänger (zwei Reihen à sechs)
  for (let i = 0; i < 12; i++) hook(c, 250 + (i % 6) * 156, 170 + Math.floor(i / 6) * 150 - 66);
  // Kreidestrich und Hakenleiste unten
  c.fillStyle = 'rgba(30, 18, 8, 0.5)';
  c.fillRect(108, 440, 1064, 2);
  const rail = c.createLinearGradient(0, 466, 0, 482);
  rail.addColorStop(0, '#f2d98c');
  rail.addColorStop(0.5, '#b08a3a');
  rail.addColorStop(1, '#5a3e12');
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.5)';
  c.shadowBlur = 8;
  c.shadowOffsetY = 4;
  c.fillStyle = rail;
  roundedRect(c, 112, 466, 1056, 14, 5);
  c.fill();
  c.restore();
  for (const x of [130, 640, 1150]) screw(c, x, 473, 5, x * 0.02);
  for (const slot of TAG_SLOTS) hook(c, slot.x + slot.w / 2, slot.y + 2);
  brassPlate(c, 360, 422, 560, 30);
  text(c, 'Kofferanhänger – in der Reihenfolge der Abfahrt aufhängen', 640, 443, { font: `bold 15px ${PRINT}`, color: '#3a2a10', align: 'center' });
}

// Messinghaken (Öse für den Anhänger bei y + 12)
function hook(c, x, y) {
  rivet(c, x, y, 5.5, [176, 140, 64]);
  c.strokeStyle = '#7a5a20';
  c.lineWidth = 3.5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x, y + 10);
  c.arc(x + 5, y + 10, 5, Math.PI, 0, true);
  c.stroke();
  c.strokeStyle = 'rgba(255, 236, 170, 0.6)';
  c.lineWidth = 1;
  line(c, x - 1, y + 1, x - 1, y + 9);
}

export function drawTagBoard(ctx) {
  ctx.drawImage(cachedLayer('w2-tagboard', paintTagBoard), 0, 0, 1280, 720);
}

export function drawTag(ctx, token, x, y) {
  const { w, h, tag } = token;
  ctx.save();
  ctx.translate(x, y);
  // Schnur zur Öse
  ctx.strokeStyle = '#d8cfb4';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-4, -h / 2 + 14);
  ctx.lineTo(0, -h / 2 - 6);
  ctx.lineTo(4, -h / 2 + 14);
  ctx.stroke();
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 16, -h / 2);
    ctx.lineTo(w / 2 - 16, -h / 2);
    ctx.lineTo(w / 2, -h / 2 + 16);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.lineTo(-w / 2, -h / 2 + 16);
    ctx.closePath();
  };
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;
  const card = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  card.addColorStop(0, '#f2dfaa');
  card.addColorStop(1, '#d4b878');
  ctx.fillStyle = card;
  shape();
  ctx.fill();
  ctx.restore();
  ctx.save();
  shape();
  ctx.clip();
  grain(ctx, -w / 2, -h / 2, w, h, { seed: tag.time.charCodeAt(1) * 7 + tag.city.length, count: 70, alpha: 0.12 });
  ctx.restore();
  ctx.strokeStyle = 'rgba(120, 88, 34, 0.8)';
  ctx.lineWidth = 1.5;
  shape();
  ctx.stroke();
  // Messingöse
  ctx.strokeStyle = '#a8822e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -h / 2 + 14, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2810';
  ctx.beginPath();
  ctx.arc(0, -h / 2 + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = RED;
  ctx.fillRect(-w / 2, -h / 2 + 28, w, 16);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(-w / 2, -h / 2 + 28, w, 2);
  text(ctx, 'RINGBAHN', 0, -h / 2 + 41, { font: `bold 12px ${PRINT}`, color: '#fff3d6', align: 'center' });
  text(ctx, tag.city, 0, 4, { font: `bold ${tag.city.length > 8 ? 15 : 18}px ${TYPEWRITER}`, align: 'center' });
  ctx.strokeStyle = 'rgba(80, 60, 30, 0.35)';
  ctx.lineWidth = 1;
  line(ctx, -w / 2 + 10, 12, w / 2 - 10, 12);
  text(ctx, 'Abfahrt', 0, 28, { font: `12px ${PRINT}`, align: 'center' });
  text(ctx, tag.time, 0, 50, { font: `bold 20px ${HAND}`, color: '#27408f', align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Kofferstapel (Türme von Hanoi)
// piles = [[5, 4, 3, 2, 1], [], []] – Koffergröße 1 (klein) … 5 (groß), letzter Eintrag liegt oben
export const PILE_X = [330, 640, 950];
const PILE_Y = 600;
const CASE_COLORS = ['#a8432a', '#4f6b86', '#c9a24a', '#7b2f22', '#5a2e1c'];

// Über welchem der drei Plätze steht die Maus (oder -1)?
export function pileAt(x) {
  const i = PILE_X.findIndex((px) => Math.abs(x - px) <= 150);
  return i;
}

export function pileSpots() {
  return PILE_X.map((x, i) => ({ id: `pile${i}`, x: x - 150, y: 150, w: 300, h: 480, label: ['Stapel', 'Kreidefeld links', 'Kreidefeld rechts'][i] }));
}

export function drawStack(ctx, { piles, held, moves, mouse }) {
  // Hintergrund: der Gepäckwagen selbst, abgedunkelt – davor die Dielen mit den Kreidefeldern
  ctx.save();
  ctx.beginPath();
  ctx.rect(80, 80, 1120, 580);
  ctx.clip();
  ctx.filter = 'blur(3px) brightness(0.45)';
  drawPicture(ctx, 'assets/scenes/wagon-02/background.webp', 0, -60, 1280, 720);
  ctx.filter = 'none';
  // Dielenboden in Perspektive
  const floorTop = 470;
  const floor = ctx.createLinearGradient(0, floorTop, 0, 660);
  floor.addColorStop(0, '#5a3418');
  floor.addColorStop(1, '#2a160a');
  ctx.fillStyle = floor;
  ctx.fillRect(80, floorTop, 1120, 190);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  for (let k = -8; k <= 8; k++) line(ctx, 640 + k * 60, floorTop, 640 + k * 150, 660);
  for (const y of [500, 540, 590, 650]) line(ctx, 80, y, 1200, y);
  glow(ctx, 640, 140, 620, '255, 200, 120', 0.18);
  ctx.restore();
  ctx.strokeStyle = '#2a160a';
  ctx.lineWidth = 6;
  ctx.strokeRect(80, 80, 1120, 580);

  // Koffer in der Hand: über welchem Platz schwebt er, passt er dort hin?
  const over = held && mouse ? pileAt(mouse.x) : -1;
  const fits = over >= 0 && (!piles[over].length || piles[over].at(-1) > held.size);
  PILE_X.forEach((x, i) => {
    if (held && i === over && over !== held.from) {
      ctx.save();
      ctx.fillStyle = fits ? 'rgba(120, 230, 130, 0.16)' : 'rgba(240, 90, 70, 0.18)';
      ctx.fillRect(x - 150, 150, 300, PILE_Y + 40 - 150);
      ctx.strokeStyle = fits ? 'rgba(150, 240, 150, 0.8)' : 'rgba(255, 120, 100, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(x - 150, 150, 300, PILE_Y + 40 - 150);
      ctx.restore();
    }
    if (i > 0) chalkRect(ctx, x - 140, PILE_Y - 8, 280, 38, i);
    else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x, PILE_Y + 10, 150, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, ['Stapel', 'Kreidefeld', 'Kreidefeld'][i], x, PILE_Y + 64, { font: `bold 20px ${HAND}`, color: '#f1e8d0', align: 'center' });
    let y = PILE_Y;
    for (const size of piles[i]) y -= drawCase(ctx, x, y, size);
  });
  if (held) {
    // folgt der Maus (zwischen den Plätzen frei, über einem Platz mittig darüber)
    const x = over >= 0 ? PILE_X[over] : Math.max(200, Math.min(1080, mouse?.x ?? PILE_X[held.from]));
    drawCase(ctx, x, 230, held.size, true);
    if (over >= 0 && over !== held.from && !fits) text(ctx, 'zu groß für den kleinen Koffer darunter', PILE_X[over], 140, { font: `bold 17px ${HAND}`, color: '#ffb0a0', align: 'center' });
  }
  text(ctx, `Züge: ${moves}`, 1170, 120, { font: `bold 20px ${HAND}`, color: '#f1e0b8', align: 'right' });
}

// Ein Rechteck aus Kreide: leicht schief, mit rauer Linie
function chalkRect(ctx, x, y, w, h, seed) {
  ctx.save();
  ctx.strokeStyle = 'rgba(240, 236, 225, 0.8)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const jitter = (k) => Math.sin(seed * 12.9 + k * 7.3) * 3;
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.moveTo(x + jitter(1 + pass), y + jitter(2));
    ctx.lineTo(x + w + jitter(3), y + jitter(4 + pass));
    ctx.lineTo(x + w + jitter(5 + pass), y + h + jitter(6));
    ctx.lineTo(x + jitter(7), y + h + jitter(8 + pass));
    ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.45;
  }
  ctx.restore();
}

function roundedBox(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Zeichnet einen Lederkoffer, Unterkante bei y. Ergebnis: Höhe (inklusive Griff)
function drawCase(ctx, x, y, size, lifted = false) {
  const w = 80 + size * 36, h = 40 + size * 6;
  const left = x - w / 2, top = y - h;
  const color = CASE_COLORS[size - 1];
  ctx.save();
  if (lifted) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 16;
  }
  // Griff oben
  ctx.strokeStyle = '#2a170b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 16, top + 2);
  ctx.quadraticCurveTo(x, top - 16, x + 16, top + 2);
  ctx.stroke();
  // Korpus mit Ledergradient
  const leather = ctx.createLinearGradient(0, top, 0, y);
  leather.addColorStop(0, lighten(color, 40));
  leather.addColorStop(0.45, color);
  leather.addColorStop(1, lighten(color, -45));
  ctx.fillStyle = leather;
  roundedBox(ctx, left, top, w, h, 8);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(25, 12, 5, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Naht und Deckelkante
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(255, 230, 190, 0.35)';
  ctx.lineWidth = 1.2;
  roundedBox(ctx, left + 5, top + 5, w - 10, h - 10, 5);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(20, 10, 4, 0.55)';
  ctx.lineWidth = 2;
  line(ctx, left + 4, top + h * 0.32, left + w - 4, top + h * 0.32);
  // Lederriemen
  for (const sx of [left + w * 0.22, left + w * 0.78]) {
    ctx.fillStyle = lighten(color, -60);
    ctx.fillRect(sx - 6, top, 12, h);
    ctx.fillStyle = '#d9b25a';
    ctx.fillRect(sx - 8, top + h * 0.32 - 5, 16, 10);
    ctx.fillStyle = 'rgba(40, 25, 5, 0.7)';
    ctx.fillRect(sx - 4, top + h * 0.32 - 2, 8, 4);
  }
  // Messingecken
  ctx.fillStyle = '#c9a24c';
  for (const [cx, cy, sx, sy] of [[left, top, 1, 1], [left + w, top, -1, 1], [left, y, 1, -1], [left + w, y, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + sx * 12, cy);
    ctx.lineTo(cx, cy + sy * 12);
    ctx.closePath();
    ctx.fill();
  }
  // Schloss
  ctx.fillStyle = '#e0bc62';
  ctx.fillRect(x - 9, top + h * 0.32 - 6, 18, 12);
  // Aufkleber: kleine Koffer „GLAS!“, große alte Reiseetiketten
  if (size <= 2) {
    ctx.save();
    ctx.translate(x + w * 0.05, top + h * 0.62);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#f2e6c8';
    ctx.fillRect(-4, -9, 44, 18);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-4, -9, 44, 18);
    text(ctx, 'GLAS!', 18, 5, { font: `bold 11px ${PRINT}`, color: RED, align: 'center' });
    ctx.restore();
  } else {
    const labels = [['#e6c76a', 'WIEN'], ['#9fc0d8', 'CHUR'], ['#e09a7a', 'ESSEN']];
    const [bg, city] = labels[size - 3];
    ctx.save();
    ctx.translate(left + w * 0.5, top + h * 0.66);
    ctx.rotate(0.06 * (size % 2 ? 1 : -1));
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, city, 0, 4, { font: `bold 10px ${PRINT}`, color: '#3a2412', align: 'center' });
    ctx.restore();
  }
  ctx.restore();
  return h + 2;
}

function lighten(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amount));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
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
      'Vorsicht: Die kleinen Koffer sind zerbrechlich (Glas!). NIE einen größeren auf einen kleineren stellen. Platz ist nur auf den zwei Kreidefeldern. Und lass die vier anderen ordentlich auf EINEM Feld stehen – der Schaffner zählt jede Runde nach.',
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

function paintSign(c) {
  plank(c, 0, 0, 1280, 720, { tone: [70, 46, 28], seed: 24, vertical: true, knots: 1 });
  for (let x = 50; x < 1280; x += 120) {
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillRect(x, 0, 3, 720);
  }
  glow(c, 640, 240, 500, '255, 214, 150', 0.16);
  vignette(c, 0, 0, 1280, 720, 0.65);
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.75)';
  c.shadowBlur = 28;
  c.shadowOffsetY = 12;
  c.fillStyle = '#2b2118';
  roundedRect(c, 432, 152, 416, 416, 16);
  c.fill();
  c.restore();
  const enamel = c.createLinearGradient(0, 160, 0, 560);
  enamel.addColorStop(0, '#ece4cc');
  enamel.addColorStop(1, '#cfc4a6');
  c.fillStyle = enamel;
  roundedRect(c, 440, 160, 400, 400, 12);
  c.fill();
  fineGrain(c, 440, 160, 400, 400, { seed: 25, count: 0.003, dark: 0.1, light: 0.08 });
  c.strokeStyle = INK;
  c.lineWidth = 4;
  roundedRect(c, 456, 176, 368, 368, 6);
  c.stroke();
  // Rost an den Schraubenlöchern, Glanz oben links
  for (const [x, y] of [[462, 182], [818, 182], [462, 538], [818, 538]]) {
    smudgeRust(c, x, y);
    screw(c, x, y, 7, x * 0.02);
  }
  const sheen = c.createLinearGradient(440, 160, 700, 420);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  c.fillStyle = sheen;
  roundedRect(c, 440, 160, 400, 400, 12);
  c.fill();
}

function smudgeRust(c, x, y) {
  const g = c.createRadialGradient(x + 2, y + 6, 1, x + 2, y + 8, 20);
  g.addColorStop(0, 'rgba(120, 60, 20, 0.5)');
  g.addColorStop(1, 'rgba(120, 60, 20, 0)');
  c.fillStyle = g;
  c.fillRect(x - 20, y - 14, 44, 44);
}

export function drawSign(ctx) {
  ctx.drawImage(cachedLayer('w2-sign', paintSign), 0, 0, 1280, 720);
  text(ctx, 'GEPÄCKWAGEN', 640, 240, { font: `bold 34px ${PRINT}`, align: 'center' });
  text(ctx, 'Abfertigung', 640, 280, { font: `22px ${PRINT}`, align: 'center' });
  ctx.strokeStyle = 'rgba(43, 33, 24, 0.6)';
  ctx.lineWidth = 1.5;
  line(ctx, 520, 304, 760, 304);
  text(ctx, 'Anhänger nach Abfahrt', 640, 360, { font: `20px ${PRINT}`, align: 'center' });
  text(ctx, 'aufhängen – frühe zuerst.', 640, 390, { font: `20px ${PRINT}`, align: 'center' });
  text(ctx, 'Zerbrechliches nach oben!', 640, 460, { font: `bold 20px ${PRINT}`, color: RED, align: 'center' });
}
