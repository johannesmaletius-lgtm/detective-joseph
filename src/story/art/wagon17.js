import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, drawPicture, glow, line, picture, seeded, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 17 (Gewächshaus): Nachthimmel hinter dem Glas, Heizungsplan, Gießkannen,
// beschlagene Scheibe, das Notizbuch des anderen Joseph.

// ---------------------------------------------------------------- Himmel hinter dem Glas

// Der andere Joseph rennt draußen vorbei (Laufbilder schon jetzt laden, damit nichts flackert)
const GHOST_FRAMES = Array.from({ length: 8 }, (_, i) => `assets/characters/anderer-joseph/walk-left/frame_00${i + 1}.webp`);
GHOST_FRAMES.forEach((src) => picture(src));
const FLAKES = Array.from({ length: 140 }, (_, i) => ({ x: (i * 977) % 1280, y: (i * 421) % 720, s: 1 + (i % 3), v: 20 + (i % 5) * 9 }));

// Die Fenster reichen nur bis etwa y = 420 – der Horizont muss also hoch liegen.
function fir(ctx, x, base, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  const w = h * 0.42;
  for (let i = 0; i < 4; i++) {
    const top = base - h + i * h * 0.22, bot = base - h + (i + 1) * h * 0.26, ww = w * (0.45 + i * 0.2);
    ctx.moveTo(x, top);
    ctx.lineTo(x + ww, bot);
    ctx.lineTo(x - ww, bot);
  }
  ctx.fill();
  ctx.fillRect(x - h * 0.03, base - h * 0.08, h * 0.06, h * 0.1);
}

function paintLandscape(ctx) {
  const rnd = seeded(17);
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#060a1c');
  sky.addColorStop(0.7, '#17254a');
  sky.addColorStop(1, '#2d3f68');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  // Sterne
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(235, 240, 255, ${0.3 + rnd() * 0.6})`;
    const s = rnd() < 0.1 ? 2 : 1;
    ctx.fillRect(rnd() * 1280, rnd() * 230, s, s);
  }
  // Mond
  glow(ctx, 1040, 90, 140, '230, 230, 255', 0.35);
  ctx.fillStyle = '#eceef8';
  ctx.beginPath();
  ctx.arc(1040, 90, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(180, 185, 210, 0.5)';
  ctx.beginPath(); ctx.arc(1032, 84, 6, 0, Math.PI * 2); ctx.arc(1050, 100, 4, 0, Math.PI * 2); ctx.fill();
  // ferne Berge mit Schneekappen
  const ridge = (base, amp, seed, fill) => {
    const r = seeded(seed);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, 720);
    for (let x = 0; x <= 1280; x += 40) ctx.lineTo(x, base - Math.abs(Math.sin(x * 0.004 + seed)) * amp - r() * 18);
    ctx.lineTo(1280, 720);
    ctx.fill();
  };
  ridge(250, 90, 3, '#3a4a72');
  ridge(285, 60, 8, '#55658e');
  // verschneite Ebene
  const snow = ctx.createLinearGradient(0, 290, 0, 720);
  snow.addColorStop(0, '#9fb0d2');
  snow.addColorStop(0.3, '#c6d2ea');
  snow.addColorStop(1, '#dfe6f4');
  ctx.fillStyle = snow;
  ctx.beginPath();
  ctx.moveTo(0, 720);
  for (let x = 0; x <= 1280; x += 40) ctx.lineTo(x, 305 + Math.sin(x * 0.007) * 10);
  ctx.lineTo(1280, 720);
  ctx.fill();
  // Waldstreifen am Horizont
  for (let x = -10; x < 1290; x += 9 + rnd() * 10) fir(ctx, x, 312 + Math.sin(x * 0.007) * 10, 26 + rnd() * 22, '#1c2842');
  // ein Dorf mit warmen Fenstern
  for (const [hx, hy] of [[250, 318], [292, 322], [330, 316], [760, 320], [806, 324]]) {
    ctx.fillStyle = '#2a2f45';
    ctx.fillRect(hx, hy - 16, 30, 18);
    ctx.fillStyle = '#e7ecf7';
    ctx.beginPath(); ctx.moveTo(hx - 4, hy - 15); ctx.lineTo(hx + 15, hy - 30); ctx.lineTo(hx + 34, hy - 15); ctx.fill();
    glow(ctx, hx + 15, hy - 8, 22, '255, 200, 120', 0.35);
    ctx.fillStyle = '#ffd38a';
    ctx.fillRect(hx + 6, hy - 11, 5, 5);
    ctx.fillRect(hx + 19, hy - 11, 5, 5);
  }
  // einzelne Tannen näher dran
  for (const [tx, ty, th] of [[40, 400, 120], [130, 380, 80], [1180, 395, 110], [1250, 410, 140], [930, 370, 70], [470, 365, 60]]) {
    fir(ctx, tx, ty, th, '#141d33');
    ctx.fillStyle = 'rgba(230, 236, 248, 0.8)';
    for (let i = 0; i < 4; i++) ctx.fillRect(tx - th * (0.1 + i * 0.07), ty - th + (i + 1) * th * 0.24, th * (0.2 + i * 0.14), 2);
  }
  // Schneewehen-Schatten
  ctx.fillStyle = 'rgba(120, 140, 185, 0.25)';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.ellipse(rnd() * 1280, 340 + rnd() * 120, 60 + rnd() * 80, 4 + rnd() * 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// fog = 0 … 1 (beschlagene Scheiben), ghost = x-Position der Gestalt draußen (oder null)
export function paintSky(ctx, { time, dark, fog = 0, ghost = null }) {
  if (dark) {
    ctx.fillStyle = '#020203';
    ctx.fillRect(0, 0, 1280, 720);
    return;
  }
  ctx.drawImage(cached('w17-land', 1280, 720, paintLandscape), 0, 0);
  if (ghost !== null) {
    // er rennt nach links davon: Laufbilder, ein Durchlauf (zwei Schritte) alle 150 Pixel
    const frame = Math.floor(((1300 - ghost) / 150) * GHOST_FRAMES.length) % GHOST_FRAMES.length;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.filter = 'brightness(0.25)';
    drawPicture(ctx, GHOST_FRAMES[frame], ghost - 34, 150, 159, 300);
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const f of FLAKES) {
    const y = (f.y + time * f.v) % 720, x = (f.x + Math.sin(time + f.y) * 10) % 1280;
    ctx.fillRect(x, y, f.s, f.s);
  }
  if (fog > 0) {
    ctx.fillStyle = `rgba(210, 220, 225, ${0.75 * fog})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
}

// ---------------------------------------------------------------- Heizung
// Kessel → Ventil 1 (Farne, Tomaten), Ventil 2 (Kakteen, Rose), Ventil 3 = Abfluss nach draußen.
export const VALVE_SPOTS = [
  { id: 'v1', cx: 420, cy: 300, r: 46, label: 'Ventil 1' },
  { id: 'v2', cx: 860, cy: 300, r: 46, label: 'Ventil 2' },
  { id: 'v3', cx: 640, cy: 470, r: 46, label: 'Ventil 3' },
];

export function bedsWarm(open) {
  if (open[2]) return [false, false, false, false];
  return [open[0], open[0], open[1], open[1]];
}

export function drawHeating(ctx, { open }) {
  ctx.fillStyle = '#1e2418';
  ctx.fillRect(160, 80, 960, 560);
  text(ctx, 'HEIZUNG · GEWÄCHSHAUS', 640, 124, { font: `bold 22px ${PRINT}`, color: '#d8e8b0', align: 'center' });
  const warm = bedsWarm(open);
  const hot = '#d9542b', cold = '#4b6a8a';
  // Kessel
  ctx.fillStyle = '#6a5a3a';
  ctx.fillRect(590, 170, 100, 80);
  text(ctx, 'Kessel', 640, 216, { font: `bold 16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  const pipe = (x0, y0, x1, y1, on) => {
    ctx.strokeStyle = on ? hot : cold;
    ctx.lineWidth = 14;
    line(ctx, x0, y0, x1, y1);
  };
  const flowing = !open[2];
  pipe(590, 210, 420, 210, flowing);
  pipe(420, 210, 420, 254, flowing);
  pipe(690, 210, 860, 210, flowing);
  pipe(860, 210, 860, 254, flowing);
  pipe(640, 250, 640, 424, true);
  pipe(640, 516, 640, 600, open[2]);
  text(ctx, 'Abfluss nach draußen', 640, 624, { font: `14px ${PRINT}`, color: '#a8b8c8', align: 'center' });
  const beds = [['Farne', 260], ['Tomaten', 420], ['Kakteen', 860], ['Rose', 1020]];
  beds.forEach(([name, x], i) => {
    const from = i < 2 ? 420 : 860;
    pipe(from, 346, x, 400, warm[i]);
    ctx.fillStyle = warm[i] ? '#7a4a2a' : '#3a3a30';
    ctx.fillRect(x - 70, 400, 140, 60);
    text(ctx, name, x, 438, { font: `bold 18px ${PRINT}`, color: warm[i] ? '#ffd8a0' : '#a8a890', align: 'center' });
  });
  for (const [i, spot] of VALVE_SPOTS.entries()) {
    ctx.fillStyle = '#b8352a';
    ctx.beginPath();
    ctx.arc(spot.cx, spot.cy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a1810';
    ctx.lineWidth = 6;
    for (let k = 0; k < 3; k++) {
      const a = k * Math.PI / 3 + (open[i] ? Math.PI / 6 : 0);
      line(ctx, spot.cx + Math.cos(a) * 36, spot.cy + Math.sin(a) * 36, spot.cx - Math.cos(a) * 36, spot.cy - Math.sin(a) * 36);
    }
    text(ctx, open[i] ? 'AUF' : 'ZU', spot.cx + 58, spot.cy + 6, { font: `bold 16px ${PRINT}`, color: open[i] ? '#ffd8a0' : '#a8b8c8' });
  }
}

// ---------------------------------------------------------------- Beschlagene Scheibe
export function drawFingerWriting(ctx) {
  ctx.fillStyle = '#b8c4cc';
  ctx.fillRect(280, 80, 720, 520);
  ctx.strokeStyle = '#4a5a3a';
  ctx.lineWidth = 14;
  ctx.strokeRect(280, 80, 720, 520);
  line(ctx, 640, 80, 640, 600);
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  const rows = ['GIESSPLAN', 'Farn: 1 L', 'Tomate: 2 L', 'Rose: GENAU 4 L', '(nur die zwei', ' Kannen nehmen)'];
  rows.forEach((value, i) => text(ctx, value, 330, 160 + i * 74, { font: `bold 40px ${HAND}`, color: 'rgba(40, 60, 80, 0.75)' }));
  ctx.restore();
}

// ---------------------------------------------------------------- Gießkannen
export const CAN_SPOTS = [
  { id: 'fill3', x: 250, y: 520, w: 150, h: 46, label: '3-Liter-Kanne füllen' },
  { id: 'empty3', x: 250, y: 576, w: 150, h: 46, label: '3-Liter-Kanne ausleeren' },
  { id: 'pour35', x: 430, y: 520, w: 180, h: 46, label: 'aus der 3-Liter in die 5-Liter-Kanne gießen' },
  { id: 'pour53', x: 430, y: 576, w: 180, h: 46, label: 'aus der 5-Liter in die 3-Liter-Kanne gießen' },
  { id: 'fill5', x: 640, y: 520, w: 150, h: 46, label: '5-Liter-Kanne füllen' },
  { id: 'empty5', x: 640, y: 576, w: 150, h: 46, label: '5-Liter-Kanne ausleeren' },
  { id: 'rose', x: 830, y: 520, w: 200, h: 102, label: 'Mit der 5-Liter-Kanne die Rose gießen' },
];

export function drawCans(ctx, { a, b }) {
  wood(ctx, 200, 70, 880, 580, [90, 60, 32]);
  drawCan(ctx, 330, 440, 3, a, 0.8);
  drawCan(ctx, 700, 440, 5, b, 1);
  const labels = { fill3: 'füllen', empty3: 'ausleeren', pour35: '3 → 5 gießen', pour53: '5 → 3 gießen', fill5: 'füllen', empty5: 'ausleeren', rose: 'Rose gießen' };
  for (const spot of CAN_SPOTS) {
    ctx.fillStyle = spot.id === 'rose' ? '#6a2a2a' : '#3a2a16';
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    text(ctx, labels[spot.id], spot.x + spot.w / 2, spot.y + spot.h / 2 + 7, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  }
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.arc(930, 300, 50, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'Rose', 930, 390, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'braucht genau 4 Liter', 930, 414, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

function drawCan(ctx, x, base, size, liters, scale) {
  const w = 150 * scale, h = 200 * scale;
  ctx.fillStyle = '#7d858c';
  ctx.fillRect(x - w / 2, base - h, w, h);
  ctx.fillStyle = '#3d7ab8';
  const fill = (liters / size) * (h - 10);
  ctx.fillRect(x - w / 2 + 6, base - 4 - fill, w - 12, fill);
  ctx.strokeStyle = '#3a4046';
  ctx.lineWidth = 4;
  ctx.strokeRect(x - w / 2, base - h, w, h);
  for (let l = 1; l < size; l++) {
    const y = base - 4 - (l / size) * (h - 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    line(ctx, x - w / 2, y, x - w / 2 + 16, y);
  }
  text(ctx, `${size}-Liter-Kanne`, x, base + 28, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, `${liters} L`, x, base - h - 14, { font: `bold 22px ${PRINT}`, color: '#ffe7a0', align: 'center' });
}

// ---------------------------------------------------------------- Notizbuch des anderen Joseph
export const LIST = [
  ['Frau des Schaffners', 'Runde 1', true],
  ['Herr mit Pfeife', 'Runde 2', true],
  ['Mann im Wintermantel', 'Runde 3', true],
  ['…', '', true],
  ['Herr K.', 'Runde 108', true],
  ['Ilse', 'Wagen 5', false],
  ['Tick', 'Wagen 11', false],
  ['Moll', 'Wagen 12', false],
  ['Mira', 'Wagen 15 – will nicht ohne Papa', false],
  ['J.', 'Wagen 1', false],
];

export function drawGuestList(ctx) {
  sheet(ctx, 330, 30, 620, 660, {
    color: '#e9dfc4',
    inner: (c) => {
      text(c, 'Fahrgäste – wer ist schon zu Hause', 310, 46, { font: `bold 22px ${SERIF}`, align: 'center' });
      text(c, 'Name', 70, 92, { font: `bold 16px ${TYPEWRITER}` });
      text(c, 'zu Hause seit / noch in', 330, 92, { font: `bold 16px ${TYPEWRITER}` });
      LIST.forEach(([name, car, done], i) => {
        const y = 130 + i * 40;
        text(c, done ? '☑' : '☐', 36, y, { font: `24px ${PRINT}`, color: done ? '#2a6a2a' : INK });
        text(c, name, 70, y, { font: `22px ${HAND}`, color: BLUE_INK });
        text(c, car, 330, y, { font: `20px ${HAND}`, color: BLUE_INK });
        if (done && car) {
          c.strokeStyle = 'rgba(39, 64, 143, 0.6)';
          c.lineWidth = 2;
          line(c, 66, y - 7, 300, y - 7);
        }
      });
      text(c, 'Personal (Bruno, Barkeeper, Heizer): ganz zum Schluss.', 310, 560, { font: `19px ${HAND}`, color: BLUE_INK, align: 'center' });
      text(c, 'Der Letzte ist J. Dann sind alle wieder zusammen.', 310, 630, { font: `bold 18px ${HAND}`, color: RED, align: 'center' });
    },
  });
}
