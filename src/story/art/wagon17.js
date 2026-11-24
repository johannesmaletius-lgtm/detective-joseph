import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, drawPicture, glow, handCap, line, metalPanel, picture, rivet, sheet, text, vignette, wood } from './common.js';

// Gezeichnetes für Wagen 17 (Gewächshaus): Nachthimmel hinter dem Glas, Heizungsplan, Gießkannen,
// beschlagene Scheibe, das Notizbuch des anderen Joseph.

// ---------------------------------------------------------------- Himmel hinter dem Glas

// Der andere Joseph rennt draußen vorbei (Laufbilder schon jetzt laden, damit nichts flackert)
const GHOST_FRAMES = Array.from({ length: 8 }, (_, i) => `assets/characters/anderer-joseph/walk-left/frame_00${i + 1}.webp`);
GHOST_FRAMES.forEach((src) => picture(src));
const FLAKES = Array.from({ length: 140 }, (_, i) => ({ x: (i * 977) % 1280, y: (i * 421) % 720, s: 1 + (i % 3), v: 20 + (i % 5) * 9 }));

// fog = 0 … 1 (beschlagene Scheiben), ghost = x-Position der Gestalt draußen (oder null)
export function paintSky(ctx, { time, dark, fog = 0, ghost = null }) {
  if (dark) {
    ctx.fillStyle = '#020203';
    ctx.fillRect(0, 0, 1280, 720);
    return;
  }
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, '#070b1f');
  sky.addColorStop(1, '#1d2b4d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);
  glow(ctx, 1040, 90, 120, '230, 230, 255', 0.35);
  ctx.fillStyle = '#eceef8';
  ctx.beginPath();
  ctx.arc(1040, 90, 26, 0, Math.PI * 2);
  ctx.fill();
  // verschneite Hügel
  ctx.fillStyle = '#c6d2ea';
  ctx.beginPath();
  ctx.moveTo(0, 520);
  for (let x = 0; x <= 1280; x += 80) ctx.lineTo(x, 480 + Math.sin((x + time * 30) * 0.006) * 30);
  ctx.lineTo(1280, 720);
  ctx.lineTo(0, 720);
  ctx.fill();
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

// Rohr mit runder Schattierung (heiß: Kupfer und Glühen, kalt: Stahlblau)
function pipe(ctx, x0, y0, x1, y1, hot) {
  ctx.save();
  ctx.lineCap = 'round';
  if (hot) {
    ctx.shadowColor = 'rgba(255, 110, 40, 0.55)';
    ctx.shadowBlur = 14;
  }
  ctx.strokeStyle = hot ? '#a8461f' : '#33475c';
  ctx.lineWidth = 16;
  line(ctx, x0, y0, x1, y1);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = hot ? '#e0743a' : '#5b7894';
  ctx.lineWidth = 9;
  line(ctx, x0, y0, x1, y1);
  // Glanzlinie leicht nach oben/links versetzt
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / len * 3, ny = (x1 - x0) / len * 3;
  ctx.strokeStyle = hot ? 'rgba(255, 210, 160, 0.7)' : 'rgba(200, 220, 240, 0.45)';
  ctx.lineWidth = 2.5;
  line(ctx, x0 - Math.abs(nx), y0 - Math.abs(ny), x1 - Math.abs(nx), y1 - Math.abs(ny));
  ctx.restore();
}

function joint(ctx, x, y, hot) {
  ctx.fillStyle = hot ? '#7a3214' : '#25344a';
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  rivet(ctx, x, y, 4, { tone: hot ? '#d08050' : '#7a90a8' });
}

// Kleines Beet mit Pflanzen der jeweiligen Sorte
function bed(ctx, name, x, warm) {
  const y = 400;
  // Holzkasten
  const box = ctx.createLinearGradient(0, y, 0, y + 60);
  box.addColorStop(0, '#6a4424');
  box.addColorStop(1, '#3a2412');
  ctx.fillStyle = box;
  ctx.fillRect(x - 70, y + 14, 140, 46);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1.5;
  line(ctx, x - 70, y + 37, x + 70, y + 37);
  ctx.fillStyle = '#2a1a0e';
  ctx.fillRect(x - 66, y + 10, 132, 8);
  // Pflanzen (kalt: grau und welk)
  const leafColor = warm ? '#4f8a3a' : '#5a6650';
  ctx.save();
  ctx.translate(x, y + 12);
  ctx.strokeStyle = leafColor;
  ctx.fillStyle = leafColor;
  ctx.lineWidth = 3;
  if (name === 'Farne') {
    for (const dx of [-40, -10, 22, 48]) {
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(dx, 0);
        ctx.quadraticCurveTo(dx + side * 18, -26, dx + side * 30, warm ? -38 : -18);
        ctx.stroke();
      }
    }
  } else if (name === 'Tomaten') {
    for (const dx of [-36, 0, 36]) {
      line(ctx, dx, 0, dx, -50);
      ctx.beginPath(); ctx.ellipse(dx - 10, -30, 10, 5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(dx + 10, -40, 10, 5, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = warm ? '#d0402a' : '#7a5a4a';
      ctx.beginPath(); ctx.arc(dx + 6, -22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = leafColor;
    }
  } else if (name === 'Kakteen') {
    for (const [dx, hgt] of [[-34, 44], [4, 58], [40, 34]]) {
      ctx.beginPath(); ctx.roundRect(dx - 8, -hgt, 16, hgt, 8); ctx.fill();
      ctx.beginPath(); ctx.roundRect(dx + 6, -hgt * 0.7, 14, 8, 4); ctx.fill();
      ctx.beginPath(); ctx.roundRect(dx + 12, -hgt * 0.7 - 14, 8, 20, 4); ctx.fill();
    }
  } else {
    line(ctx, 0, 0, 0, -56);
    ctx.beginPath(); ctx.ellipse(-12, -28, 11, 5, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -38, 11, 5, 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = warm ? '#b3261e' : '#6a4a4a';
    ctx.beginPath(); ctx.ellipse(0, -62, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Wärme steigt auf
  if (warm) {
    ctx.strokeStyle = 'rgba(255, 190, 120, 0.25)';
    ctx.lineWidth = 2;
    for (const dx of [-30, 0, 30]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y - 50);
      ctx.bezierCurveTo(x + dx - 8, y - 62, x + dx + 8, y - 74, x + dx, y - 88);
      ctx.stroke();
    }
  }
  text(ctx, name, x, y + 52, { font: `bold 16px ${PRINT}`, color: warm ? '#ffd8a0' : '#b8b8a0', align: 'center' });
}

// Handrad eines Ventils (offen: um 45° gedreht)
function handwheel(ctx, cx, cy, open) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.strokeStyle = '#8a2218';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#d0453a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 37, Math.PI * 1.05, Math.PI * 1.6);
  ctx.stroke();
  ctx.strokeStyle = '#a32a1e';
  ctx.lineWidth = 7;
  for (let k = 0; k < 3; k++) {
    const a = k * Math.PI / 3 + (open ? Math.PI / 4 : 0);
    line(ctx, cx + Math.cos(a) * 34, cy + Math.sin(a) * 34, cx - Math.cos(a) * 34, cy - Math.sin(a) * 34);
  }
  handCap(ctx, cx, cy, 10, '#5a1810');
}

export function drawHeating(ctx, { open }) {
  // Kachelwand im Heizungsschacht
  ctx.fillStyle = '#1b2219';
  ctx.fillRect(160, 80, 960, 560);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 2;
  for (let y = 80; y < 640; y += 40) line(ctx, 160, y, 1120, y);
  for (let y = 80; y < 640; y += 40) for (let x = 160 + ((y / 40) % 2) * 30; x < 1120; x += 60) line(ctx, x, y, x, y + 40);
  ctx.strokeStyle = '#3a4a30';
  ctx.lineWidth = 6;
  ctx.strokeRect(160, 80, 960, 560);
  text(ctx, 'HEIZUNG · GEWÄCHSHAUS', 640, 116, { font: `bold 22px ${PRINT}`, color: '#d8e8b0', align: 'center' });
  const warm = bedsWarm(open);
  const flowing = !open[2];
  pipe(ctx, 590, 210, 420, 210, flowing);
  pipe(ctx, 420, 210, 420, 254, flowing);
  pipe(ctx, 690, 210, 860, 210, flowing);
  pipe(ctx, 860, 210, 860, 254, flowing);
  pipe(ctx, 640, 250, 640, 424, true);
  pipe(ctx, 640, 516, 640, 600, open[2]);
  joint(ctx, 420, 210, flowing);
  joint(ctx, 860, 210, flowing);
  text(ctx, 'Abfluss nach draußen', 640, 626, { font: `14px ${PRINT}`, color: '#a8b8c8', align: 'center' });
  const beds = [['Farne', 260], ['Tomaten', 420], ['Kakteen', 860], ['Rose', 1020]];
  beds.forEach(([name, x], i) => {
    const from = i < 2 ? 420 : 860;
    pipe(ctx, from, 346, x, 404, warm[i]);
  });
  beds.forEach(([name, x], i) => bed(ctx, name, x, warm[i]));
  // Kessel: kleiner Ofen mit Feuerfenster und Druckanzeige
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 14;
  metalPanel(ctx, 584, 150, 112, 108, { top: '#4a4a46', bottom: '#22221f', radius: 12 });
  ctx.restore();
  const fire = ctx.createRadialGradient(640, 226, 2, 640, 226, 26);
  fire.addColorStop(0, '#fff2a0');
  fire.addColorStop(0.5, '#f07a20');
  fire.addColorStop(1, '#5a1a08');
  ctx.fillStyle = fire;
  ctx.beginPath();
  ctx.roundRect(616, 210, 48, 32, [16, 16, 4, 4]);
  ctx.fill();
  ctx.strokeStyle = '#1a1a18';
  ctx.lineWidth = 2;
  for (let k = 0; k < 4; k++) line(ctx, 624 + k * 11, 212, 624 + k * 11, 242);
  glow(ctx, 640, 226, 60, '255, 140, 50', 0.25);
  text(ctx, 'Kessel', 640, 178, { font: `bold 14px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  for (const [i, spot] of VALVE_SPOTS.entries()) {
    handwheel(ctx, spot.cx, spot.cy, open[i]);
    ctx.fillStyle = 'rgba(10, 14, 8, 0.7)';
    ctx.beginPath();
    ctx.roundRect(spot.cx + 50, spot.cy - 12, 44, 24, 4);
    ctx.fill();
    text(ctx, open[i] ? 'AUF' : 'ZU', spot.cx + 72, spot.cy + 6, { font: `bold 15px ${PRINT}`, color: open[i] ? '#ffd8a0' : '#a8b8c8', align: 'center' });
  }
}

// ---------------------------------------------------------------- Beschlagene Scheibe
// Der Beschlag wird einmal erzeugt; die Fingerschrift ist herausgewischt, darunter laufen Tropfen.
let fogSheet = null;
const FINGER_ROWS = ['GIESSPLAN', 'Farn: 1 L', 'Tomate: 2 L', 'Rose: GENAU 4 L', '(nur die zwei', ' Kannen nehmen)'];
function fogged() {
  if (fogSheet) return fogSheet;
  fogSheet = document.createElement('canvas');
  fogSheet.width = 700;
  fogSheet.height = 500;
  const g = fogSheet.getContext('2d');
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const fog = g.createLinearGradient(0, 0, 0, 500);
  fog.addColorStop(0, 'rgba(206, 216, 222, 0.92)');
  fog.addColorStop(1, 'rgba(188, 200, 208, 0.96)');
  g.fillStyle = fog;
  g.fillRect(0, 0, 700, 500);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(255, 255, 255, ${0.1 + rnd() * 0.25})`;
    const r = 0.6 + rnd() * 1.8;
    g.beginPath();
    g.arc(rnd() * 700, rnd() * 500, r, 0, Math.PI * 2);
    g.fill();
  }
  // Fingerschrift herauswischen
  g.globalCompositeOperation = 'destination-out';
  g.font = `bold 44px ${HAND}`;
  g.lineJoin = 'round';
  g.lineCap = 'round';
  g.lineWidth = 5;
  g.fillStyle = 'rgba(0, 0, 0, 0.92)';
  g.strokeStyle = 'rgba(0, 0, 0, 0.92)';
  FINGER_ROWS.forEach((value, i) => {
    const y = 70 + i * 74;
    let size = 44;
    g.font = `bold ${size}px ${HAND}`;
    while (g.measureText(value).width > 620 && size > 24) g.font = `bold ${--size}px ${HAND}`;
    g.fillText(value, 40, y);
    g.strokeText(value, 40, y);
    // Tropfen laufen von einigen Buchstaben herunter
    const width = g.measureText(value).width;
    for (let k = 0; k < 2; k++) {
      const x = 50 + rnd() * (width - 20);
      const len = 10 + rnd() * 26;
      g.lineWidth = 2;
      line(g, x, y + 4, x + rnd() * 2 - 1, y + 4 + len);
      g.beginPath();
      g.arc(x, y + 6 + len, 3, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 5;
    }
  });
  return fogSheet;
}

export function drawFingerWriting(ctx) {
  const x = 290, y = 90, w = 700, h = 500;
  // dahinter: Nacht, Schnee und Pflanzenschatten
  const night = ctx.createLinearGradient(0, y, 0, y + h);
  night.addColorStop(0, '#0a1024');
  night.addColorStop(1, '#22304e');
  ctx.fillStyle = night;
  ctx.fillRect(x, y, w, h);
  glow(ctx, x + 560, y + 80, 140, '220, 225, 255', 0.3);
  ctx.fillStyle = 'rgba(8, 14, 10, 0.9)';
  for (const [px, ph] of [[60, 70], [200, 50], [520, 80], [650, 60]]) {
    ctx.beginPath();
    ctx.ellipse(x + px, y + h - ph / 2 + 10, 60, ph / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.drawImage(fogged(), x, y);
  // Rahmen mit Sprossen in den Ecken
  ctx.strokeStyle = '#3d4d30';
  ctx.lineWidth = 18;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 9, y + 9, w - 18, h - 18);
  for (const [rx, ry] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) rivet(ctx, rx, ry, 6, { tone: '#8a9a7a' });
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
  glow(ctx, 640, 200, 480, '255, 220, 160', 0.12);
  // Pflanztisch-Kante
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(200, 470, 880, 10);
  drawCan(ctx, 330, 440, 3, a, 0.8);
  drawCan(ctx, 700, 440, 5, b, 1);
  const labels = { fill3: 'füllen', empty3: 'ausleeren', pour35: '3 → 5 gießen', pour53: '5 → 3 gießen', fill5: 'füllen', empty5: 'ausleeren', rose: 'Rose gießen' };
  for (const spot of CAN_SPOTS) {
    const rose = spot.id === 'rose';
    const plate = ctx.createLinearGradient(0, spot.y, 0, spot.y + spot.h);
    plate.addColorStop(0, rose ? '#7a3030' : '#4a3420');
    plate.addColorStop(1, rose ? '#4a1a1a' : '#2a1c10');
    ctx.fillStyle = plate;
    ctx.beginPath();
    ctx.roundRect(spot.x, spot.y, spot.w, spot.h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 200, 140, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, labels[spot.id], spot.x + spot.w / 2, spot.y + spot.h / 2 + 7, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  }
  drawRosePot(ctx, 930, 440);
  text(ctx, 'Rose', 930, 470 - 0, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'braucht genau 4 Liter', 930, 494, { font: `15px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

function drawRosePot(ctx, x, base) {
  // Terrakotta-Topf
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 6, base - 2, 52, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const pot = ctx.createLinearGradient(x - 46, 0, x + 46, 0);
  pot.addColorStop(0, '#8a3e1e');
  pot.addColorStop(0.4, '#c8653a');
  pot.addColorStop(1, '#7a3216');
  ctx.fillStyle = pot;
  ctx.beginPath();
  ctx.moveTo(x - 46, base - 70);
  ctx.lineTo(x + 46, base - 70);
  ctx.lineTo(x + 34, base);
  ctx.lineTo(x - 34, base);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b0552e';
  ctx.fillRect(x - 52, base - 84, 104, 18);
  ctx.fillStyle = '#2a1a0e';
  ctx.beginPath();
  ctx.ellipse(x, base - 84, 50, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stiel, Blätter, geschlossene Knospe
  ctx.strokeStyle = '#3e6a2c';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, base - 86);
  ctx.quadraticCurveTo(x - 10, base - 160, x + 4, base - 230);
  ctx.stroke();
  ctx.fillStyle = '#4f8a3a';
  for (const [lx, ly, a] of [[-18, -130, -0.6], [16, -160, 0.5], [-14, -190, -0.4], [14, -110, 0.7]]) {
    ctx.beginPath();
    ctx.ellipse(x + lx, base + ly, 16, 7, a, 0, Math.PI * 2);
    ctx.fill();
  }
  const bud = ctx.createRadialGradient(x, base - 250, 2, x + 4, base - 244, 24);
  bud.addColorStop(0, '#e0503e');
  bud.addColorStop(1, '#7a1410');
  ctx.fillStyle = bud;
  ctx.beginPath();
  ctx.moveTo(x + 4, base - 280);
  ctx.bezierCurveTo(x + 26, base - 262, x + 22, base - 232, x + 4, base - 228);
  ctx.bezierCurveTo(x - 16, base - 232, x - 20, base - 262, x + 4, base - 280);
  ctx.fill();
  ctx.fillStyle = '#3e6a2c';
  ctx.beginPath();
  ctx.moveTo(x - 12, base - 236);
  ctx.lineTo(x + 4, base - 226);
  ctx.lineTo(x + 20, base - 236);
  ctx.lineTo(x + 4, base - 244);
  ctx.fill();
}

// Verzinkte Gießkanne von der Seite; vorne ein Schauglas mit Literstrichen
function drawCan(ctx, x, base, size, liters, scale) {
  const w = 150 * scale, h = 200 * scale;
  const left = x - w / 2, top = base - h;
  ctx.save();
  // Schatten
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 8, base, w * 0.62, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tülle (nach rechts oben) mit Brause
  ctx.strokeStyle = '#6d757c';
  ctx.lineWidth = 16 * scale;
  ctx.lineCap = 'round';
  line(ctx, left + w - 6, base - h * 0.25, left + w + 70 * scale, top + 10 * scale);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 4 * scale;
  line(ctx, left + w - 4, base - h * 0.3, left + w + 66 * scale, top + 4 * scale);
  ctx.fillStyle = '#8b939a';
  ctx.beginPath();
  ctx.ellipse(left + w + 76 * scale, top + 4 * scale, 12 * scale, 20 * scale, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
  for (let k = 0; k < 5; k++) ctx.fillRect(left + w + 72 * scale + (k % 2) * 6, top - 6 * scale + k * 5 * scale, 2, 2);
  // Bügelgriff oben
  ctx.strokeStyle = '#5d656c';
  ctx.lineWidth = 10 * scale;
  ctx.beginPath();
  ctx.moveTo(left + w * 0.15, top + 6);
  ctx.quadraticCurveTo(x, top - 70 * scale, left + w * 0.85, top + 6);
  ctx.stroke();
  // Körper: Zylinder mit Glanz
  const body = ctx.createLinearGradient(left, 0, left + w, 0);
  body.addColorStop(0, '#5c646a');
  body.addColorStop(0.3, '#c9d0d4');
  body.addColorStop(0.55, '#8d959b');
  body.addColorStop(1, '#4e555a');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(left, top, w, h, [10, 10, 6, 6]);
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  for (const ry of [top + 14, base - 16]) ctx.fillRect(left, ry, w, 5);
  ctx.fillStyle = '#a4acb2';
  ctx.beginPath();
  ctx.ellipse(x, top, w / 2, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2e32';
  ctx.beginPath();
  ctx.ellipse(x, top, w / 2 - 8, 5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  // Schauglas
  const gx = x - 22 * scale, gw = 44 * scale, gTop = top + 26, gBottom = base - 24;
  ctx.fillStyle = '#1c2a36';
  ctx.beginPath();
  ctx.roundRect(gx, gTop, gw, gBottom - gTop, 6);
  ctx.fill();
  const fillH = (liters / size) * (gBottom - gTop - 6);
  const water = ctx.createLinearGradient(gx, 0, gx + gw, 0);
  water.addColorStop(0, '#2c6aa8');
  water.addColorStop(0.5, '#6aaee0');
  water.addColorStop(1, '#2c6aa8');
  ctx.fillStyle = water;
  ctx.fillRect(gx + 3, gBottom - 3 - fillH, gw - 6, fillH);
  if (liters > 0) {
    ctx.fillStyle = 'rgba(220, 240, 255, 0.8)';
    ctx.fillRect(gx + 3, gBottom - 3 - fillH, gw - 6, 2);
  }
  ctx.strokeStyle = '#c9a24c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(gx, gTop, gw, gBottom - gTop, 6);
  ctx.stroke();
  for (let l = 1; l < size; l++) {
    const ly = gBottom - 3 - (l / size) * (gBottom - gTop - 6);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1.5;
    line(ctx, gx + 3, ly, gx + 12, ly);
    text(ctx, String(l), gx + gw + 10, ly + 5, { font: `bold 13px ${PRINT}`, color: '#2a2e32', align: 'center' });
  }
  rivet(ctx, left + 10, top + 30, 3);
  rivet(ctx, left + 10, base - 30, 3);
  ctx.restore();
  text(ctx, `${size}-Liter-Kanne`, x, base + 28, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  ctx.fillStyle = 'rgba(20, 12, 6, 0.65)';
  ctx.beginPath();
  ctx.roundRect(x - 34, top - 104 * scale, 68, 32, 8);
  ctx.fill();
  text(ctx, `${liters} L`, x, top - 104 * scale + 24, { font: `bold 22px ${PRINT}`, color: '#ffe7a0', align: 'center' });
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
