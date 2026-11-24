import {
  BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, contactShadow, drawPicture, fineGrain, glow, line, picture, plank, rivet,
  roundedRect, screw, seeded, sheet, text, vignette, wood,
} from './common.js';

// Gezeichnetes für Wagen 17 (Gewächshaus): Nachthimmel hinter dem Glas, Heizungsplan, Gießkannen,
// beschlagene Scheibe, das Notizbuch des anderen Joseph.

// ---------------------------------------------------------------- Himmel hinter dem Glas

// Der andere Joseph rennt draußen vorbei (Laufbilder schon jetzt laden, damit nichts flackert)
const GHOST_FRAMES = Array.from({ length: 8 }, (_, i) => `assets/characters/anderer-joseph/walk-left/frame_00${i + 1}.webp`);
GHOST_FRAMES.forEach((src) => picture(src));
const FLAKES = Array.from({ length: 140 }, (_, i) => ({ x: (i * 977) % 1280, y: (i * 421) % 720, s: 1 + (i % 3), v: 20 + (i % 5) * 9 }));

// Dieselbe gemalte Landschaft wie hinter den Zugfenstern der anderen Wagen (outside/*.png), nur flach
// und größer, weil das Gewächshaus fast ganz aus Glas ist. Die Fenster reichen bis etwa y = 460.
const OUT = 'assets/scenes/train-compartment/outside/';
const SCALE = 1.4;
const LAYERS = [
  { src: `${OUT}sky.png`, y: 85, speed: 0.5 },
  { src: `${OUT}clouds.png`, y: 88, speed: 6 },
  { src: `${OUT}hills.png`, y: 150, speed: 14 },
  { src: `${OUT}treeline.png`, y: 150, speed: 45 },
  { src: `${OUT}forest.png`, y: 60, speed: 160 },
];
const NEAR = { src: `${OUT}near.png`, y: 85, speed: 1100 };
[...LAYERS, NEAR].forEach((layer) => picture(layer.src));
picture(`${OUT}moon.png`);
const toY = (y) => (y - 85) * SCALE + 141; // Horizont auf etwa y = 320, Waldboden an der Fensterkante
const STARS = Array.from({ length: 90 }, (_, i) => [(i * 619) % 1280, (i * 233) % 150, 0.35 + (i % 4) * 0.15]);

function band(ctx, { src, y, speed }, distance) {
  const image = picture(src);
  if (!image.complete || !image.naturalWidth) return;
  const w = image.naturalWidth * SCALE, h = image.naturalHeight * SCALE;
  let x = -((distance * speed * SCALE) % w);
  if (x > 0) x -= w;
  for (; x < 1280; x += w) ctx.drawImage(image, x, toY(y), w, h);
}

// fog = 0 … 1 (beschlagene Scheiben), ghost = x-Position der Gestalt draußen (oder null),
// distance = gefahrene Strecke des Zuges, tunnel = 0 … 1 (im Tunnel)
export function paintSky(ctx, { time, dark, fog = 0, ghost = null, distance = time, tunnel = 0 }) {
  if (dark) {
    ctx.fillStyle = '#020203';
    ctx.fillRect(0, 0, 1280, 720);
    return;
  }
  ctx.fillStyle = '#150f3d';
  ctx.fillRect(0, 0, 1280, 720);
  for (const [x, y, a] of STARS) {
    ctx.fillStyle = `rgba(235, 235, 255, ${a})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  band(ctx, LAYERS[0], distance);
  drawPicture(ctx, `${OUT}moon.png`, 960, 40, 110, 110);
  for (const layer of LAYERS.slice(1)) band(ctx, layer, distance);
  ctx.fillStyle = '#2b2470';
  ctx.fillRect(0, toY(60 + 250) - 2, 1280, 720);
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
  band(ctx, NEAR, distance);
  if (tunnel > 0) {
    ctx.fillStyle = `rgba(4, 3, 8, ${tunnel})`;
    ctx.fillRect(0, 0, 1280, 720);
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
  ctx.drawImage(cached('w17-heating', 1280, 720, paintHeatingBoard), 0, 0);
  const warm = bedsWarm(open);
  const flowing = !open[2];
  const t = performance.now() / 1000;
  // Rohre: dunkler Mantel, farbiger Kern, Glanzlicht; warmes Wasser glüht leicht
  const pipe = (points, on) => {
    const draw = (width, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    };
    if (on) {
      ctx.save();
      ctx.shadowColor = 'rgba(255, 120, 50, 0.55)';
      ctx.shadowBlur = 16;
      draw(20, '#4a1c0c');
      ctx.restore();
    } else draw(20, '#1a242c');
    draw(13, on ? '#d9542b' : '#4b6a8a');
    draw(4, on ? 'rgba(255, 210, 150, 0.6)' : 'rgba(200, 225, 245, 0.35)');
    if (on) {
      // kleine helle Punkte fließen durchs Rohr
      ctx.save();
      ctx.setLineDash([3, 26]);
      ctx.lineDashOffset = -t * 40;
      draw(5, 'rgba(255, 236, 190, 0.8)');
      ctx.restore();
    }
  };
  pipe([[590, 210], [420, 210], [420, 254]], flowing);
  pipe([[690, 210], [860, 210], [860, 254]], flowing);
  pipe([[640, 250], [640, 424]], true);
  pipe([[640, 516], [640, 600]], open[2]);
  const beds = [['Farne', 260], ['Tomaten', 420], ['Kakteen', 860], ['Rose', 1020]];
  beds.forEach(([, x], i) => pipe([[i < 2 ? 420 : 860, 346], [x, 372], [x, 398]], warm[i]));
  beds.forEach(([name, x], i) => drawBed(ctx, name, x, warm[i], t));
  drawBoiler(ctx, t);
  for (const [i, spot] of VALVE_SPOTS.entries()) drawHandwheel(ctx, spot.cx, spot.cy, open[i]);
}

function paintHeatingBoard(ctx) {
  const x = 160, y = 80, w = 960, h = 560;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, x, y, w, h, 16);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#2c3a2a');
  g.addColorStop(1, '#1a2318');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  fineGrain(ctx, x, y, w, h, { seed: 17, count: 0.008, dark: 0.16, light: 0.05 });
  // feines Raster wie auf einem Plan
  ctx.strokeStyle = 'rgba(200, 230, 180, 0.05)';
  ctx.lineWidth = 1;
  for (let gx = x + 20; gx < x + w; gx += 24) line(ctx, gx, y + 10, gx, y + h - 10);
  for (let gy = y + 20; gy < y + h; gy += 24) line(ctx, x + 10, gy, x + w - 10, gy);
  ctx.strokeStyle = 'rgba(216, 232, 176, 0.25)';
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 12, y + 12, w - 24, h - 24, 10);
  ctx.stroke();
  for (const [rx, ry] of [[x + 26, y + 26], [x + w - 26, y + 26], [x + 26, y + h - 26], [x + w - 26, y + h - 26]]) rivet(ctx, rx, ry, 6, [150, 140, 110]);
  // Messingschild
  roundedRect(ctx, 470, 100, 340, 40, 6);
  const brass = ctx.createLinearGradient(0, 100, 0, 140);
  brass.addColorStop(0, '#f0d488');
  brass.addColorStop(1, '#8a6424');
  ctx.fillStyle = brass;
  ctx.fill();
  screw(ctx, 484, 120, 4);
  screw(ctx, 796, 120, 4);
  text(ctx, 'HEIZUNG · GEWÄCHSHAUS', 640, 127, { font: `bold 19px ${PRINT}`, color: '#3a2a10', align: 'center' });
  text(ctx, 'Abfluss nach draußen ↓', 640, 624, { font: `italic 15px ${SERIF}`, color: '#a8b8c8', align: 'center' });
  vignette(ctx, x, y, w, h, 0.4);
}

function drawBoiler(ctx, t) {
  // kleiner Kessel mit Manometer und Flamme
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundedRect(ctx, 588, 160, 104, 96, 22);
  const body = ctx.createLinearGradient(588, 0, 692, 0);
  body.addColorStop(0, '#4a3a22');
  body.addColorStop(0.4, '#9a7a48');
  body.addColorStop(1, '#3a2c18');
  ctx.fillStyle = body;
  ctx.fill();
  ctx.restore();
  for (const ry of [172, 244]) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(592, ry, 96, 4);
  }
  ctx.fillStyle = '#efe3c0';
  ctx.beginPath();
  ctx.arc(640, 198, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2;
  ctx.stroke();
  line(ctx, 640, 198, 640 + Math.cos(-0.6 + Math.sin(t * 2) * 0.05) * 12, 198 + Math.sin(-0.6) * 12);
  const flick = 0.8 + Math.sin(t * 9) * 0.15;
  glow(ctx, 640, 236, 30, '255, 150, 60', 0.5 * flick);
  ctx.fillStyle = `rgba(255, ${170 + Math.round(Math.sin(t * 7) * 30)}, 70, 0.9)`;
  ctx.beginPath();
  ctx.moveTo(628, 244);
  ctx.quadraticCurveTo(640, 214 - flick * 8, 652, 244);
  ctx.fill();
  text(ctx, 'Kessel', 706, 214, { font: `bold 15px ${PRINT}`, color: '#e8d6a8' });
}

function drawHandwheel(ctx, cx, cy, isOpen) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.strokeStyle = '#a82a20';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.arc(cx, cy, 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#e05a48';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, Math.PI * 1.05, Math.PI * 1.6);
  ctx.stroke();
  const turn = isOpen ? Math.PI / 6 : 0;
  ctx.strokeStyle = '#8a2018';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const a = k * Math.PI / 3 + turn;
    line(ctx, cx + Math.cos(a) * 33, cy + Math.sin(a) * 33, cx - Math.cos(a) * 33, cy - Math.sin(a) * 33);
  }
  const hub = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 11);
  hub.addColorStop(0, '#fff0c0');
  hub.addColorStop(1, '#7a5a20');
  ctx.fillStyle = hub;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  // Schild AUF / ZU
  roundedRect(ctx, cx + 46, cy - 14, 52, 28, 6);
  ctx.fillStyle = isOpen ? '#3a5a2a' : '#3a3a3a';
  ctx.fill();
  ctx.strokeStyle = isOpen ? '#9ad070' : '#888';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, isOpen ? 'AUF' : 'ZU', cx + 72, cy + 6, { font: `bold 15px ${PRINT}`, color: isOpen ? '#d8f8b0' : '#c8c8c8', align: 'center' });
}

function drawBed(ctx, name, x, warm, t) {
  const top = 398, w = 140, h = 62;
  // Pflanzkasten aus Holz
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = warm ? '#7a4a26' : '#4a3a2c';
  ctx.fillRect(x - w / 2, top + 14, w, h - 14);
  ctx.restore();
  ctx.fillStyle = warm ? '#3a2614' : '#2a2620';
  ctx.fillRect(x - w / 2 + 6, top + 8, w - 12, 12);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 1;
  for (const ly of [top + 30, top + 46]) line(ctx, x - w / 2, ly, x + w / 2, ly);
  // Pflanzen (kalt: blass, mit Reif)
  const leaf = warm ? '#5aa040' : '#6a7a6a';
  const sway = Math.sin(t * 1.5 + x) * (warm ? 2 : 0.5);
  ctx.fillStyle = leaf;
  ctx.strokeStyle = leaf;
  if (name === 'Farne') {
    for (let k = -2; k <= 2; k++) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + k * 10, top + 12);
      ctx.quadraticCurveTo(x + k * 22 + sway, top - 14, x + k * 30 + sway, top - 22);
      ctx.stroke();
    }
  } else if (name === 'Tomaten') {
    ctx.lineWidth = 3;
    line(ctx, x - 20, top + 12, x - 20 + sway, top - 30);
    line(ctx, x + 22, top + 12, x + 22 + sway, top - 26);
    ctx.fillStyle = warm ? '#d8352a' : '#7a5a52';
    for (const [dx, dy] of [[-28, -14], [-12, -24], [16, -10], [30, -20]]) {
      ctx.beginPath();
      ctx.arc(x + dx + sway, top + dy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === 'Kakteen') {
    for (const [dx, hh] of [[-26, 34], [6, 46], [34, 26]]) {
      roundedRect(ctx, x + dx - 8, top + 12 - hh, 16, hh, 8);
      ctx.fillStyle = warm ? '#4a9a4a' : '#5a6a5a';
      ctx.fill();
    }
  } else {
    ctx.lineWidth = 3;
    line(ctx, x, top + 12, x + sway, top - 30);
    ctx.fillStyle = leaf;
    ctx.beginPath();
    ctx.ellipse(x - 10, top - 4, 9, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = warm ? '#c8202a' : '#7a4a52';
    ctx.beginPath();
    ctx.ellipse(x + sway, top - 38, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!warm) {
    // Reif
    ctx.fillStyle = 'rgba(220, 235, 255, 0.35)';
    ctx.fillRect(x - w / 2 + 6, top + 8, w - 12, 4);
    text(ctx, '❄', x + w / 2 - 16, top + 36, { font: `16px ${PRINT}`, color: 'rgba(200, 225, 255, 0.8)', align: 'center' });
  } else glow(ctx, x, top + 20, 70, '255, 170, 90', 0.12);
  text(ctx, name, x, top + 52, { font: `bold 17px ${PRINT}`, color: warm ? '#ffd8a0' : '#a8a890', align: 'center' });
}

// ---------------------------------------------------------------- Beschlagene Scheibe
export function drawFingerWriting(ctx) {
  ctx.drawImage(cached('w17-fog', 1280, 720, paintFoggedGlass), 0, 0);
}

function paintFoggedGlass(ctx) {
  const x = 280, y = 70, w = 720, h = 540;
  // Nacht hinter dem Glas: Himmel, Schnee, Tannen
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#0e1430');
  sky.addColorStop(0.85, '#26305a');
  sky.addColorStop(1, '#8a9ab8');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const r = seeded(170);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + r() * 0.6})`;
    ctx.fillRect(x + r() * w, y + r() * h * 0.5, 1.6, 1.6);
  }
  ctx.fillStyle = '#0c1220';
  for (let i = 0; i < 9; i++) {
    const tx = x + 30 + i * 85 + r() * 30, th = 40 + r() * 34, base = y + h - 8;
    ctx.beginPath();
    ctx.moveTo(tx, base - th);
    ctx.lineTo(tx - th * 0.3, base);
    ctx.lineTo(tx + th * 0.3, base);
    ctx.fill();
  }
  // Beschlag: milchige Schicht, die Schrift wischt sie weg
  const fog = document.createElement('canvas');
  fog.width = 1280;
  fog.height = 720;
  const f = fog.getContext('2d');
  const fg = f.createRadialGradient(640, 340, 60, 640, 340, 520);
  fg.addColorStop(0, 'rgba(214, 224, 230, 0.93)');
  fg.addColorStop(1, 'rgba(180, 196, 206, 0.86)');
  f.fillStyle = fg;
  f.fillRect(x, y, w, h);
  fineGrain(f, x, y, w, h, { seed: 171, count: 0.03, dark: 0.08, light: 0.25, size: 2.2 });
  f.globalCompositeOperation = 'destination-out';
  const rows = ['GIESSPLAN', 'Farn: 1 L', 'Tomate: 2 L', 'Rose: GENAU 4 L', '(nur die zwei', ' Kannen nehmen)'];
  rows.forEach((value, i) => text(f, value, 340 + (i % 2) * 6, 150 + i * 72, { font: `bold 42px ${HAND}`, color: 'rgba(0, 0, 0, 0.9)' }));
  f.globalCompositeOperation = 'source-over';
  // Kondenströpfchen auf dem Glas
  for (let i = 0; i < 260; i++) {
    const dx = x + r() * w, dy = y + r() * h, dr = 0.8 + r() * 2.2;
    f.fillStyle = `rgba(240, 248, 255, ${0.25 + r() * 0.4})`;
    f.beginPath();
    f.arc(dx, dy, dr, 0, Math.PI * 2);
    f.fill();
    f.fillStyle = 'rgba(90, 110, 130, 0.25)';
    f.beginPath();
    f.arc(dx + dr * 0.3, dy + dr * 0.4, dr * 0.6, 0, Math.PI * 2);
    f.fill();
  }
  ctx.drawImage(fog, 0, 0);
  // Fensterrahmen mit Sprosse
  ctx.strokeStyle = '#3c5a34';
  ctx.lineWidth = 18;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(160, 200, 140, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 7, y - 7, w + 14, h + 14);
  for (const [rx, ry] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) rivet(ctx, rx, ry, 5, [110, 130, 100]);
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
  ctx.drawImage(cached('w17-cans', 1280, 720, paintPottingBench), 0, 0);
  drawCan(ctx, 330, 440, 3, a, 0.8);
  drawCan(ctx, 700, 440, 5, b, 1);
  const labels = { fill3: 'füllen', empty3: 'ausleeren', pour35: '3 → 5 gießen', pour53: '5 → 3 gießen', fill5: 'füllen', empty5: 'ausleeren', rose: 'Rose gießen' };
  for (const spot of CAN_SPOTS) woodenButton(ctx, spot, labels[spot.id], spot.id === 'rose');
}

function paintPottingBench(ctx) {
  // Rückwand aus senkrechten Brettern, davor die Arbeitsplatte
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#2a1a0c';
  ctx.fillRect(200, 70, 880, 580);
  ctx.restore();
  for (let i = 0; i < 8; i++) plank(ctx, 200 + i * 110, 70, 110, 400, { tone: [78, 54, 30], seed: 40 + i, vertical: true, knots: 1 });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  for (let i = 1; i < 8; i++) ctx.fillRect(200 + i * 110 - 1, 70, 3, 400);
  // Fenster mit Nacht und Schnee oben rechts
  roundedRect(ctx, 820, 100, 220, 130, 6);
  const sky = ctx.createLinearGradient(0, 100, 0, 230);
  sky.addColorStop(0, '#10183a');
  sky.addColorStop(1, '#3a4a78');
  ctx.fillStyle = sky;
  ctx.fill();
  const r = seeded(77);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + r() * 0.6})`;
    ctx.fillRect(824 + r() * 212, 104 + r() * 122, 1.8, 1.8);
  }
  ctx.strokeStyle = '#3c5a34';
  ctx.lineWidth = 8;
  roundedRect(ctx, 820, 100, 220, 130, 6);
  ctx.stroke();
  line(ctx, 930, 100, 930, 230);
  // Wasserhahn links an der Wand
  ctx.fillStyle = '#8a7a5a';
  ctx.fillRect(214, 150, 46, 16);
  ctx.fillRect(250, 150, 14, 46);
  const tap = ctx.createRadialGradient(236, 140, 2, 236, 144, 16);
  tap.addColorStop(0, '#f0d488');
  tap.addColorStop(1, '#6a4a18');
  ctx.fillStyle = tap;
  ctx.beginPath();
  ctx.arc(236, 144, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(120, 180, 230, 0.7)';
  ctx.beginPath();
  ctx.arc(257, 206, 4, 0, Math.PI * 2);
  ctx.fill();
  // Arbeitsplatte
  plank(ctx, 200, 440, 880, 30, { tone: [120, 80, 44], seed: 61 });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(200, 468, 880, 6);
  plank(ctx, 200, 474, 880, 176, { tone: [60, 40, 22], seed: 62, knots: 0 });
  // Erde, Tontöpfchen, Handschaufel
  ctx.fillStyle = 'rgba(40, 24, 12, 0.7)';
  for (let i = 0; i < 40; i++) ctx.fillRect(440 + r() * 160, 436 + r() * 8, 3, 2);
  drawPot(ctx, 540, 440, 28, 26);
  drawPot(ctx, 574, 440, 22, 20);
  // Rose im Topf
  contactShadow(ctx, 880, 442, 70, 10, 0.5);
  drawPot(ctx, 880, 440, 64, 62);
  ctx.fillStyle = '#3a2614';
  ctx.beginPath();
  ctx.ellipse(880, 380, 30, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3d6a2a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(880, 380);
  ctx.quadraticCurveTo(874, 320, 880, 262);
  ctx.stroke();
  for (const [lx, ly, ang] of [[862, 340, -0.7], [898, 318, 0.6], [866, 296, -0.5]]) {
    ctx.fillStyle = '#4a8a32';
    ctx.beginPath();
    ctx.ellipse(lx, ly, 16, 7, ang, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 50, 10, 0.6)';
    ctx.lineWidth = 1;
    line(ctx, lx - Math.cos(ang) * 14, ly - Math.sin(ang) * 14, lx + Math.cos(ang) * 14, ly + Math.sin(ang) * 14);
  }
  // geschlossene Knospe mit Kelchblättern
  const bud = ctx.createRadialGradient(875, 236, 2, 880, 244, 22);
  bud.addColorStop(0, '#ff6a6a');
  bud.addColorStop(1, '#8a1018');
  ctx.fillStyle = bud;
  ctx.beginPath();
  ctx.moveTo(880, 212);
  ctx.bezierCurveTo(900, 226, 898, 256, 880, 262);
  ctx.bezierCurveTo(862, 256, 860, 226, 880, 212);
  ctx.fill();
  ctx.fillStyle = '#3d7a2a';
  for (const k of [-1, 0, 1]) {
    ctx.beginPath();
    ctx.moveTo(880 + k * 10, 262);
    ctx.lineTo(880 + k * 18, 244);
    ctx.lineTo(880 + k * 4, 256);
    ctx.fill();
  }
  // Holzschild an der Rose
  ctx.save();
  ctx.translate(1000, 352);
  ctx.rotate(0.04);
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(-72, -6, 144, 50);
  ctx.strokeStyle = '#6a4a24';
  ctx.lineWidth = 2;
  ctx.strokeRect(-72, -6, 144, 50);
  ctx.fillStyle = '#5a4020';
  ctx.beginPath();
  ctx.arc(0, -14, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a4020';
  ctx.lineWidth = 1;
  line(ctx, 0, -14, -40, -6);
  line(ctx, 0, -14, 40, -6);
  text(ctx, 'Rose', 0, 14, { font: `bold 18px ${SERIF}`, color: INK, align: 'center' });
  text(ctx, 'genau 4 Liter!', 0, 36, { font: `17px ${HAND}`, color: RED, align: 'center' });
  ctx.restore();
  vignette(ctx, 200, 70, 880, 580, 0.45);
}

function drawPot(ctx, cx, base, top, h) {
  const g = ctx.createLinearGradient(cx - top / 2, 0, cx + top / 2, 0);
  g.addColorStop(0, '#8a3e1c');
  g.addColorStop(0.4, '#c8693a');
  g.addColorStop(1, '#6a2e12');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - top / 2, base - h);
  ctx.lineTo(cx + top / 2, base - h);
  ctx.lineTo(cx + top * 0.36, base);
  ctx.lineTo(cx - top * 0.36, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b05a30';
  ctx.fillRect(cx - top / 2 - 3, base - h - 2, top + 6, Math.max(6, h * 0.16));
}

function woodenButton(ctx, spot, label, accent) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundedRect(ctx, spot.x, spot.y, spot.w, spot.h, 8);
  const g = ctx.createLinearGradient(0, spot.y, 0, spot.y + spot.h);
  g.addColorStop(0, accent ? '#8a2a2a' : '#5a3d20');
  g.addColorStop(1, accent ? '#4a1414' : '#2e1e0e');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = accent ? '#e0a070' : '#c49a46';
  ctx.lineWidth = 1.5;
  roundedRect(ctx, spot.x + 2, spot.y + 2, spot.w - 4, spot.h - 4, 6);
  ctx.stroke();
  text(ctx, label, spot.x + spot.w / 2, spot.y + spot.h / 2 + 7, { font: `bold 18px ${PRINT}`, color: '#f6e6bc', align: 'center' });
}

// Zinkgießkanne mit Sichtfenster (Wasserstand) und Literstrichen
function drawCan(ctx, x, base, size, liters, scale) {
  const w = 150 * scale, h = 190 * scale;
  const left = x - w / 2, top = base - h;
  contactShadow(ctx, x + 10, base + 2, w * 0.7, 10, 0.55);
  // Ausguss nach rechts oben mit Brause
  ctx.strokeStyle = '#6a747a';
  ctx.lineWidth = 16 * scale;
  ctx.lineCap = 'round';
  line(ctx, left + w - 6, base - h * 0.25, left + w + 70 * scale, top - 10 * scale);
  ctx.strokeStyle = '#a8b2b8';
  ctx.lineWidth = 5 * scale;
  line(ctx, left + w - 6, base - h * 0.28, left + w + 66 * scale, top - 14 * scale);
  ctx.save();
  ctx.translate(left + w + 74 * scale, top - 14 * scale);
  ctx.rotate(-0.7);
  ctx.fillStyle = '#7a848a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(30, 30, 30, 0.6)';
  for (let k = -2; k <= 2; k++) for (let j = -1; j <= 1; j++) ctx.fillRect(j * 4 * scale - 1, k * 6 * scale - 1, 2, 2);
  ctx.restore();
  // Griff oben
  ctx.strokeStyle = '#5a646a';
  ctx.lineWidth = 12 * scale;
  ctx.beginPath();
  ctx.moveTo(left + 14 * scale, top + 4);
  ctx.bezierCurveTo(left + 10 * scale, top - 70 * scale, left + w - 30 * scale, top - 70 * scale, left + w - 34 * scale, top + 4);
  ctx.stroke();
  ctx.strokeStyle = '#b8c2c8';
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
  // Körper: Zink, gewölbt
  roundedRect(ctx, left, top, w, h, 14 * scale);
  const zinc = ctx.createLinearGradient(left, 0, left + w, 0);
  zinc.addColorStop(0, '#5a646a');
  zinc.addColorStop(0.25, '#c9d2d6');
  zinc.addColorStop(0.45, '#9aa5ab');
  zinc.addColorStop(1, '#4a5258');
  ctx.fillStyle = zinc;
  ctx.fill();
  fineGrain(ctx, left, top, w, h, { seed: size * 13, count: 0.02, dark: 0.12, light: 0.1 });
  // Ringe (Falze)
  for (const ry of [top + 10 * scale, base - 14 * scale]) {
    ctx.fillStyle = 'rgba(40, 46, 50, 0.55)';
    ctx.fillRect(left, ry, w, 5 * scale);
    ctx.fillStyle = 'rgba(230, 240, 245, 0.35)';
    ctx.fillRect(left, ry + 5 * scale, w, 2);
  }
  // Öffnung oben
  ctx.fillStyle = '#23292c';
  ctx.beginPath();
  ctx.ellipse(x - 8 * scale, top + 4, w * 0.32, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sichtfenster mit Wasser
  const gx = x - 18 * scale, gw = 36 * scale, gTop = top + 24 * scale, gBottom = base - 24 * scale, gh = gBottom - gTop;
  roundedRect(ctx, gx, gTop, gw, gh, 6 * scale);
  ctx.fillStyle = 'rgba(20, 30, 40, 0.75)';
  ctx.fill();
  if (liters > 0) {
    const level = (liters / size) * gh;
    ctx.save();
    roundedRect(ctx, gx, gTop, gw, gh, 6 * scale);
    ctx.clip();
    const water = ctx.createLinearGradient(gx, 0, gx + gw, 0);
    water.addColorStop(0, '#2a6aa8');
    water.addColorStop(0.5, '#6ab0e8');
    water.addColorStop(1, '#2a5a90');
    ctx.fillStyle = water;
    ctx.fillRect(gx, gBottom - level, gw, level);
    ctx.fillStyle = 'rgba(220, 240, 255, 0.8)';
    ctx.fillRect(gx, gBottom - level, gw, 2.5);
    ctx.restore();
  }
  ctx.strokeStyle = '#2a3034';
  ctx.lineWidth = 2;
  roundedRect(ctx, gx, gTop, gw, gh, 6 * scale);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(gx + 4, gTop + 4, 4, gh - 8);
  // Literstriche mit Zahlen
  for (let l = 1; l <= size; l++) {
    const ly = gBottom - (l / size) * gh;
    ctx.strokeStyle = '#1e2428';
    ctx.lineWidth = 2;
    line(ctx, gx + gw, ly, gx + gw + 10 * scale, ly);
    text(ctx, String(l), gx + gw + 14 * scale, ly + 5, { font: `bold ${Math.round(14 * scale + 2)}px ${PRINT}`, color: '#1e2428' });
  }
  // eingeprägte Größe
  text(ctx, `${size} L`, left + 26 * scale, base - 30 * scale, { font: `bold ${Math.round(20 * scale)}px ${SERIF}`, color: 'rgba(30, 36, 40, 0.75)', align: 'center' });
  // Beschriftung
  text(ctx, `${size}-Liter-Kanne`, x, base + 28, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  // Inhalt als Anhänger über der Kanne
  const tagY = top - 78 * scale;
  ctx.fillStyle = '#efe0b8';
  roundedRect(ctx, x - 36, tagY - 20, 72, 30, 6);
  ctx.fill();
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, `${liters} L`, x, tagY + 2, { font: `bold 20px ${PRINT}`, color: liters ? '#1d4a80' : '#6a5a48', align: 'center' });
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
