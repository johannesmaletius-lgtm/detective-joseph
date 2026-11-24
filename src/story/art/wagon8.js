import { loadImage } from '../../core/assets.js';
import { PRINT, SERIF, TYPEWRITER, cached, grain, line, plank, rivet, roundedRect, seeded, sheet, text, vignette, wood } from './common.js';

// Gezeichnetes für Wagen 8 (Bordkino): Kinokarte, acht Filmbilder, Projektor-Schärfe, Standbild.

let still = null;
loadImage('assets/scenes/wagon-08/standbild.webp').then((image) => { still = image; });
export const stillImage = () => still;

export const FILM_ROUND = '0108'; // steht am Filmrand des letzten Bildes – der Türcode

// ---------------------------------------------------------------- Kinokarte
export function drawTicket(ctx) {
  sheet(ctx, 340, 230, 600, 260, {
    angle: -0.03,
    color: '#f0e3bd',
    shade: '#dcc795',
    inner: (c) => {
      c.fillStyle = '#9b2b1e';
      c.fillRect(0, 0, 600, 56);
      text(c, 'BORDKINO RINGBAHN', 300, 38, { font: `bold 30px ${SERIF}`, color: '#f0e3bd', align: 'center' });
      text(c, '„Die letzte Runde“', 300, 110, { font: `italic 30px ${SERIF}`, align: 'center' });
      text(c, 'Reihe 3', 150, 180, { font: `bold 38px ${PRINT}`, align: 'center' });
      text(c, 'Platz 12', 450, 180, { font: `bold 38px ${PRINT}`, align: 'center' });
      text(c, 'Vorstellung jede Runde · Einlass bis zum Tunnel', 300, 232, { font: `16px ${SERIF}`, align: 'center' });
      // Riss in der Mitte
      c.strokeStyle = 'rgba(120, 90, 50, 0.7)';
      c.lineWidth = 2;
      c.beginPath();
      for (let y = 0; y <= 260; y += 10) c.lineTo(300 + ((y / 10) % 2 ? 5 : -5), y);
      c.stroke();
    },
  });
}

// ---------------------------------------------------------------- Die acht Filmbilder
// Der Zug von außen, eine Runde lang: Der Mond wandert von links nach rechts über den Himmel,
// im letzten Bild verschwindet der Zug im Tunnel. Reihenfolge der Bilder = Wert von "step".
export const FRAMES = [5, 2, 7, 0, 4, 6, 1, 3].map((step, i) => ({ id: `frame${i}`, step }));
export const FRAME_SLOTS = Array.from({ length: 8 }, (_, i) => ({
  x: 132 + (i % 4) * 258,
  y: 130 + Math.floor(i / 4) * 230,
  w: 240,
  h: 150,
  label: `${i + 1}`,
}));

export function drawFilmTable(ctx) {
  ctx.drawImage(cached('w8-table', 1120, 620, paintFilmTable), 80, 70);
  text(ctx, 'Die Filmbilder liegen durcheinander. Eine Runde, Bild für Bild – dann ankleben.', 640, 670, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Schneidetisch mit Leuchtplatte, Filmspule, Klebepresse und Schere (einmal gezeichnet)
function paintFilmTable(c) {
  for (let i = 0; i < 8; i++) plank(c, 0, i * 78, 1120, 78, { tone: [74, 50, 34], seed: 300 + i, knots: 1 });
  c.fillStyle = 'rgba(15, 8, 3, 0.6)';
  for (let i = 1; i < 8; i++) c.fillRect(0, i * 78 - 1, 1120, 2);
  // Leuchtplatte: Metallrahmen, Milchglas, das von unten leuchtet
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.7)';
  c.shadowBlur = 24;
  c.shadowOffsetY = 10;
  const frame = c.createLinearGradient(0, 30, 0, 470);
  frame.addColorStop(0, '#5d6166');
  frame.addColorStop(1, '#2e3135');
  c.fillStyle = frame;
  roundedRect(c, 30, 30, 1060, 470, 14);
  c.fill();
  c.restore();
  c.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  c.lineWidth = 2;
  roundedRect(c, 31, 31, 1058, 468, 14);
  c.stroke();
  const glass = c.createRadialGradient(560, 240, 60, 560, 260, 620);
  glass.addColorStop(0, '#f4efe2');
  glass.addColorStop(0.6, '#d9d2c0');
  glass.addColorStop(1, '#a8a190');
  c.fillStyle = glass;
  c.fillRect(46, 46, 1028, 438);
  grain(c, 46, 46, 1028, 438, { seed: 8, count: 0.01, dark: 0.05, light: 0.2, size: 1.2 });
  c.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  c.lineWidth = 3;
  c.strokeRect(46, 46, 1028, 438);
  for (const [x, y] of [[38, 38], [1082, 38], [38, 492], [1082, 492]]) rivet(c, x, y, 4, [150, 150, 150]);
  // Filmspule links unten
  const reelX = 110, reelY = 548;
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  c.beginPath();
  c.arc(reelX + 6, reelY + 8, 42, 0, Math.PI * 2);
  c.fill();
  const metal = c.createRadialGradient(reelX - 20, reelY - 20, 5, reelX, reelY, 42);
  metal.addColorStop(0, '#c8ccd0');
  metal.addColorStop(1, '#5b6066');
  c.fillStyle = metal;
  c.beginPath();
  c.arc(reelX, reelY, 40, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#1a1714';
  c.beginPath();
  c.arc(reelX, reelY, 29, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = 'rgba(90, 80, 60, 0.6)';
  c.lineWidth = 1;
  for (let r = 14; r < 29; r += 3) {
    c.beginPath();
    c.arc(reelX, reelY, r, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = metal;
  for (let k = 0; k < 3; k++) {
    const a = k * (Math.PI * 2 / 3);
    c.beginPath();
    c.ellipse(reelX + Math.cos(a) * 21, reelY + Math.sin(a) * 21, 7, 5, a, 0, Math.PI * 2);
    c.fillStyle = '#7d8288';
    c.fill();
  }
  c.fillStyle = '#c8ccd0';
  c.beginPath();
  c.arc(reelX, reelY, 8, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#2a2a2a';
  c.fillRect(reelX - 2, reelY - 5, 4, 10);
  // Filmstreifen-Reste
  c.save();
  c.translate(300, 532);
  c.rotate(-0.12);
  filmScrap(c, 0, 0, 160);
  c.restore();
  c.save();
  c.translate(800, 528);
  c.rotate(0.08);
  filmScrap(c, 0, 0, 120);
  c.restore();
  // Klebeband-Rolle
  c.fillStyle = 'rgba(0, 0, 0, 0.4)';
  c.beginPath();
  c.arc(604, 552, 22, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(230, 220, 190, 0.85)';
  c.beginPath();
  c.arc(600, 548, 22, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#4a3220';
  c.beginPath();
  c.arc(600, 548, 12, 0, Math.PI * 2);
  c.fill();
  // Schere rechts unten
  c.save();
  c.translate(1010, 548);
  c.rotate(-0.25);
  c.scale(0.75, 0.75);
  c.strokeStyle = '#1b1b1b';
  c.lineWidth = 6;
  for (const sy of [-1, 1]) {
    c.beginPath();
    c.ellipse(-48, sy * 12, 14, 9, 0, 0, Math.PI * 2);
    c.stroke();
  }
  const blade = c.createLinearGradient(0, -8, 0, 8);
  blade.addColorStop(0, '#e6e9ec');
  blade.addColorStop(1, '#7d8288');
  c.fillStyle = blade;
  c.beginPath();
  c.moveTo(-34, -8);
  c.lineTo(60, -2);
  c.lineTo(-30, 2);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(-34, 8);
  c.lineTo(60, 2);
  c.lineTo(-30, -2);
  c.closePath();
  c.fill();
  rivet(c, -28, 0, 4, [120, 120, 120]);
  c.restore();
  vignette(c, 0, 0, 1120, 620, 0.5);
}

function filmScrap(c, x, y, length) {
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  c.fillRect(x + 3, y + 4, length, 34);
  c.fillStyle = 'rgba(30, 26, 20, 0.92)';
  c.fillRect(x, y, length, 34);
  c.fillStyle = 'rgba(210, 200, 175, 0.85)';
  for (let k = 5; k < length - 6; k += 14) {
    c.fillRect(x + k, y + 3, 7, 5);
    c.fillRect(x + k, y + 26, 7, 5);
  }
  c.fillStyle = 'rgba(120, 130, 150, 0.35)';
  for (let k = 8; k < length - 30; k += 46) c.fillRect(x + k, y + 10, 38, 14);
}

// Ein Filmbild-Schnipsel: Filmstreifen mit Perforation, darin das Bild
export function drawFrame(ctx, token, x, y) {
  const frame = FRAMES.find((f) => f.id === token.id);
  const index = FRAMES.indexOf(frame);
  ctx.save();
  ctx.translate(x - 120, y - 75);
  ctx.drawImage(cached(`w8-strip-${index % 4}`, 264, 174, (c) => paintStrip(c, index % 4)), -12, -10);
  drawFrameScene(ctx, IMAGE.x, IMAGE.y, IMAGE.w, IMAGE.h, frame.step);
  ctx.drawImage(cached('w8-strip-gloss', 240, 150, paintStripGloss), 0, 0);
  ctx.restore();
}

const IMAGE = { x: 14, y: 22, w: 212, h: 106 }; // Bildfeld im Filmstreifen (240 × 150)

// Ein Stück 35-mm-Film auf dem Leuchttisch: bernsteinfarbene Unterlage, durchleuchtete Perforation,
// Randaufdruck, an den Enden mit der Schere abgeschnitten. Mit weichem Schatten (Rand 12/10 px).
function paintStrip(c, variant) {
  const r = seeded(40 + variant);
  c.translate(12, 10);
  // Schnittkanten links und rechts leicht schief
  const cutL = [r() * 3, r() * 3], cutR = [240 - r() * 3, 240 - r() * 3];
  const outline = () => {
    c.beginPath();
    c.moveTo(cutL[0], 0);
    c.lineTo(cutR[0], 0);
    c.lineTo(cutR[1], 150);
    c.lineTo(cutL[1], 150);
    c.closePath();
  };
  c.save();
  c.shadowColor = 'rgba(0, 0, 0, 0.55)';
  c.shadowBlur = 10;
  c.shadowOffsetX = 3;
  c.shadowOffsetY = 5;
  outline();
  c.fillStyle = '#2b1c10';
  c.fill();
  c.restore();
  c.save();
  outline();
  c.clip();
  // Unterlage: dunkles Bernstein, zur Mitte etwas heller (Licht von unten)
  const base = c.createLinearGradient(0, 0, 0, 150);
  base.addColorStop(0, '#3a2512');
  base.addColorStop(0.5, '#24170c');
  base.addColorStop(1, '#3a2512');
  c.fillStyle = base;
  c.fillRect(0, 0, 240, 150);
  grain(c, 0, 0, 240, 150, { seed: 70 + variant, count: 0.03, dark: 0.15, light: 0.05, size: 1 });
  // Perforation: Licht vom Leuchttisch scheint durch
  for (let k = 4; k < 240; k += 16) {
    for (const py of [4, 136]) {
      const hole = c.createLinearGradient(0, py, 0, py + 10);
      hole.addColorStop(0, '#d8cfb8');
      hole.addColorStop(0.3, '#f7f1e2');
      hole.addColorStop(1, '#e8dfc8');
      c.fillStyle = hole;
      roundedRect(c, k, py, 9, 10, 2.2);
      c.fill();
      c.strokeStyle = 'rgba(10, 5, 0, 0.6)';
      c.lineWidth = 1;
      c.stroke();
    }
  }
  // Randaufdruck in Orange zwischen Perforation und Bild (verrät nichts über die Reihenfolge)
  c.font = `bold 5.5px ${PRINT}`;
  c.fillStyle = 'rgba(240, 150, 60, 0.8)';
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.fillText('RINGBAHN  SICHERHEITSFILM', 16, 20);
  c.fillText('▸ 24', 200, 20);
  c.fillText('◂', 18, 135);
  c.fillText('ZUG 24  ·  KAMERA AUSSEN', 120, 135);
  // Bildfenster: dunkler Rahmen mit runden Ecken
  c.fillStyle = '#0d0804';
  roundedRect(c, IMAGE.x - 2, IMAGE.y - 2, IMAGE.w + 4, IMAGE.h + 4, 4);
  c.fill();
  // Kratzer auf der Unterlage
  c.strokeStyle = 'rgba(255, 230, 190, 0.08)';
  c.lineWidth = 0.7;
  for (let i = 0; i < 3; i++) {
    const sx = r() * 240;
    line(c, sx, 0, sx + (r() - 0.5) * 10, 150);
  }
  c.restore();
  // Schnittkanten etwas heller
  c.strokeStyle = 'rgba(255, 210, 150, 0.25)';
  c.lineWidth = 1;
  line(c, cutL[0], 0, cutL[1], 150);
  line(c, cutR[0], 0, cutR[1], 150);
}

// Glanz und Bildrand über dem Bild (der Film liegt glänzend auf dem Glas)
function paintStripGloss(c) {
  c.save();
  roundedRect(c, IMAGE.x, IMAGE.y, IMAGE.w, IMAGE.h, 3);
  c.clip();
  c.strokeStyle = 'rgba(0, 0, 0, 0.75)';
  c.lineWidth = 3;
  roundedRect(c, IMAGE.x, IMAGE.y, IMAGE.w, IMAGE.h, 3);
  c.stroke();
  c.restore();
  const shine = c.createLinearGradient(0, 0, 240, 150);
  shine.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
  shine.addColorStop(0.35, 'rgba(255, 255, 255, 0.0)');
  shine.addColorStop(0.42, 'rgba(255, 255, 255, 0.10)');
  shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
  c.fillStyle = shine;
  c.fillRect(2, 0, 236, 150);
}

// Ein Filmbild: step 0 … 7 (Mond von links nach rechts, step 7: Tunnel). Wird je Größe und Bild
// einmal gezeichnet und dann wiederverwendet.
export function drawFrameScene(ctx, x, y, w, h, step) {
  const W = Math.max(8, Math.round(w)), H = Math.max(8, Math.round(h));
  const image = cached(`w8-frame-${step}-${W}x${H}`, W, H, (c) => {
    c.scale(W / 224, H / 118);
    paintFrameScene(c, step);
  });
  ctx.drawImage(image, x, y, w, h);
}

// Gezeichnet in 224 × 118: Nacht, Schnee, Laternen, eine Dampflok mit drei Wagen
function paintFrameScene(c, step) {
  const W = 224, H = 118;
  const r = seeded(17); // Sterne, Wald und Berge sind in jedem Bild gleich
  // Himmel
  const sky = c.createLinearGradient(0, 0, 0, H * 0.75);
  sky.addColorStop(0, '#0a1124');
  sky.addColorStop(0.7, '#1f2c4a');
  sky.addColorStop(1, '#3a4766');
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const sx = r() * W, sy = r() * H * 0.6, b = r();
    c.fillStyle = `rgba(230, 235, 255, ${0.25 + b * 0.6})`;
    c.fillRect(sx, sy, b > 0.85 ? 1.4 : 0.8, b > 0.85 ? 1.4 : 0.8);
  }
  // Mond mit Hof und Kratern
  const moonX = 18 + (step / 7) * (W - 36);
  const moonY = 28 - Math.sin((step / 7) * Math.PI) * 14;
  const halo = c.createRadialGradient(moonX, moonY, 4, moonX, moonY, 40);
  halo.addColorStop(0, 'rgba(220, 230, 255, 0.45)');
  halo.addColorStop(1, 'rgba(220, 230, 255, 0)');
  c.fillStyle = halo;
  c.fillRect(moonX - 40, moonY - 40, 80, 80);
  const moon = c.createRadialGradient(moonX - 3, moonY - 3, 1, moonX, moonY, 9);
  moon.addColorStop(0, '#fffdf2');
  moon.addColorStop(1, '#d9d6c6');
  c.fillStyle = moon;
  c.beginPath();
  c.arc(moonX, moonY, 8.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(150, 150, 140, 0.35)';
  for (const [dx, dy, cr] of [[-3, -2, 2], [2, 3, 1.6], [3, -3, 1.1]]) {
    c.beginPath();
    c.arc(moonX + dx, moonY + dy, cr, 0, Math.PI * 2);
    c.fill();
  }
  // Ferne Berge
  c.fillStyle = '#26304a';
  c.beginPath();
  c.moveTo(0, H * 0.62);
  for (let px = 0; px <= W; px += 8) c.lineTo(px, H * 0.5 + Math.sin(px * 0.045) * 7 + Math.sin(px * 0.13 + 1) * 3);
  c.lineTo(W, H);
  c.lineTo(0, H);
  c.fill();
  c.fillStyle = 'rgba(210, 220, 240, 0.25)'; // Schnee auf den Gipfeln
  for (let px = 0; px <= W; px += 8) {
    const py = H * 0.5 + Math.sin(px * 0.045) * 7 + Math.sin(px * 0.13 + 1) * 3;
    if (py < H * 0.47) c.fillRect(px - 3, py, 6, 2);
  }
  // Tannenwald
  c.fillStyle = '#121a2c';
  for (let i = 0; i < 46; i++) {
    const tx = i * 5 + r() * 4, th = 8 + r() * 10, ty = H * 0.68;
    c.beginPath();
    c.moveTo(tx, ty - th);
    c.lineTo(tx + 3.5, ty);
    c.lineTo(tx - 3.5, ty);
    c.fill();
  }
  // Schneefeld, vom Mond beschienen
  const snow = c.createLinearGradient(0, H * 0.66, 0, H);
  snow.addColorStop(0, '#9aa6bd');
  snow.addColorStop(1, '#5d6880');
  c.fillStyle = snow;
  c.beginPath();
  c.moveTo(0, H);
  c.lineTo(0, H * 0.7);
  c.quadraticCurveTo(W * 0.3, H * 0.64, W * 0.55, H * 0.7);
  c.quadraticCurveTo(W * 0.8, H * 0.75, W, H * 0.68);
  c.lineTo(W, H);
  c.fill();
  // Tunnelberg (nur im letzten Bild) – hinter dem Zug
  const portal = { x: W * 0.72, w: W * 0.19, top: H * 0.6, base: H * 0.89 };
  if (step === 7) {
    const rock = c.createLinearGradient(W * 0.6, 0, W, 0);
    rock.addColorStop(0, '#2a3044');
    rock.addColorStop(1, '#1c2132');
    c.fillStyle = rock;
    c.beginPath();
    c.moveTo(W * 0.56, H * 0.9);
    c.quadraticCurveTo(W * 0.64, H * 0.42, W * 0.78, H * 0.38);
    c.quadraticCurveTo(W * 0.9, H * 0.35, W + 4, H * 0.44);
    c.lineTo(W + 4, H * 0.9);
    c.fill();
    c.fillStyle = 'rgba(200, 210, 230, 0.4)'; // Schnee auf dem Hang
    for (const [px, py, pw] of [[0.66, 0.5, 10], [0.78, 0.4, 14], [0.9, 0.41, 12], [0.62, 0.66, 6]]) {
      c.beginPath();
      c.ellipse(W * px, H * py, pw, 1.8, -0.15, 0, Math.PI * 2);
      c.fill();
    }
  }
  // Laternen in festen Abständen, mit Lichtkegel auf dem Schnee
  for (let k = 0; k < 5; k++) {
    const lx = 20 + k * 60 - ((step * 23) % 60);
    if (lx < -10 || lx > W + 10) continue;
    const top = H * 0.5;
    const pool = c.createRadialGradient(lx, H * 0.82, 1, lx, H * 0.82, 22);
    pool.addColorStop(0, 'rgba(255, 220, 140, 0.45)');
    pool.addColorStop(1, 'rgba(255, 220, 140, 0)');
    c.fillStyle = pool;
    c.fillRect(lx - 22, H * 0.7, 44, 28);
    c.strokeStyle = '#0f1420';
    c.lineWidth = 1.4;
    line(c, lx, top, lx, H * 0.83);
    line(c, lx, top, lx + 4, top);
    const glow2 = c.createRadialGradient(lx + 4, top + 2, 0.5, lx + 4, top + 2, 10);
    glow2.addColorStop(0, 'rgba(255, 240, 190, 1)');
    glow2.addColorStop(0.3, 'rgba(255, 215, 130, 0.6)');
    glow2.addColorStop(1, 'rgba(255, 215, 130, 0)');
    c.fillStyle = glow2;
    c.fillRect(lx - 6, top - 8, 20, 20);
  }
  // Damm und Gleis mit Schwellen
  c.fillStyle = '#4a5368';
  c.fillRect(0, H * 0.86, W, H * 0.06);
  c.fillStyle = '#1d212c';
  for (let sx = 0; sx < W; sx += 5) c.fillRect(sx, H * 0.875, 2.5, 3);
  c.strokeStyle = '#8e97aa';
  c.lineWidth = 0.9;
  line(c, 0, H * 0.87, W, H * 0.87);
  // Der Zug: Lok vorn rechts, drei Wagen, Rauchfahne nach hinten
  const trainX = step === 7 ? W * 0.42 : W * 0.14;
  c.save();
  if (step === 7) {
    c.beginPath();
    c.rect(0, 0, portal.x + 4, H);
    c.clip();
  }
  drawTrain(c, trainX, H * 0.86, step);
  c.restore();
  // Tunnelportal (Steinbogen) – vor dem Zug, das Dunkel verschluckt die Lok
  if (step === 7) {
    c.fillStyle = '#5a5f6c';
    c.beginPath();
    c.moveTo(portal.x - 6, portal.base);
    c.lineTo(portal.x - 6, portal.top + 4);
    c.quadraticCurveTo(portal.x + portal.w / 2, portal.top - 18, portal.x + portal.w + 6, portal.top + 4);
    c.lineTo(portal.x + portal.w + 6, portal.base);
    c.fill();
    c.fillStyle = '#030305';
    c.beginPath();
    c.moveTo(portal.x, portal.base);
    c.lineTo(portal.x, portal.top + 12);
    c.quadraticCurveTo(portal.x + portal.w / 2, portal.top - 6, portal.x + portal.w, portal.top + 12);
    c.lineTo(portal.x + portal.w, portal.base);
    c.fill();
    c.strokeStyle = 'rgba(20, 20, 26, 0.7)';
    c.lineWidth = 0.7;
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (k / 6) * Math.PI;
      const cx = portal.x + portal.w / 2, cy = portal.top + 14;
      line(c, cx + Math.cos(a) * portal.w * 0.5, cy + Math.sin(a) * 18, cx + Math.cos(a) * (portal.w * 0.5 + 6), cy + Math.sin(a) * 24);
    }
  }
  // Filmlook: Körnung, Kratzer, Vignette, leicht warm
  const g = seeded(100 + step);
  for (let i = 0; i < 260; i++) {
    c.fillStyle = g() < 0.5 ? `rgba(255, 255, 255, ${g() * 0.08})` : `rgba(0, 0, 0, ${g() * 0.14})`;
    c.fillRect(g() * W, g() * H, 1, 1);
  }
  c.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  c.lineWidth = 0.6;
  const sx = 20 + g() * 180;
  line(c, sx, 0, sx + g() * 4, H);
  c.fillStyle = 'rgba(255, 220, 160, 0.06)';
  c.fillRect(0, 0, W, H);
  vignette(c, 0, 0, W, H, 0.65);
}

function drawTrain(c, x, rail, step) {
  const dark = '#0c0d12';
  // Rauchfahne: weiche Wolken aus dem Schornstein, nach hinten verweht
  const chimney = { x: x + 126, y: rail - 24 };
  for (let i = 11; i >= 0; i--) {
    const t = i / 11;
    const px = chimney.x - t * 120 - Math.sin(i * 1.7 + step) * 2;
    const py = chimney.y - 4 - Math.sqrt(t) * 16 - Math.sin(i * 2.3 + step * 0.7) * 2;
    const pr = 3 + t * 13;
    const puff = c.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0.5, px, py, pr);
    puff.addColorStop(0, `rgba(215, 220, 232, ${0.5 - t * 0.38})`);
    puff.addColorStop(0.6, `rgba(170, 178, 196, ${0.32 - t * 0.24})`);
    puff.addColorStop(1, 'rgba(150, 160, 180, 0)');
    c.fillStyle = puff;
    c.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  }
  // drei Wagen
  for (let k = 0; k < 3; k++) {
    const cx = x + k * 32;
    c.fillStyle = dark;
    roundedRect(c, cx, rail - 18, 29, 14, 2);
    c.fill();
    c.fillStyle = '#1a1c24';
    c.fillRect(cx - 0.5, rail - 20, 30, 2.5);
    for (let wdx = 3; wdx < 27; wdx += 6) {
      c.fillStyle = 'rgba(255, 205, 120, 0.95)';
      c.fillRect(cx + wdx, rail - 15, 3.6, 4);
    }
    // Lichtschein der Fenster auf dem Schnee
    c.fillStyle = 'rgba(255, 200, 120, 0.12)';
    c.fillRect(cx, rail + 1, 29, 4);
    c.fillStyle = '#2a2c34';
    for (const wx of [cx + 6, cx + 23]) {
      c.beginPath();
      c.arc(wx, rail - 2.5, 2.4, 0, Math.PI * 2);
      c.fill();
    }
  }
  // Lok
  const lx = x + 96;
  c.fillStyle = dark;
  c.fillRect(lx, rail - 22, 11, 18);            // Führerhaus
  c.fillRect(lx - 1, rail - 24, 13, 2.5);
  c.fillStyle = 'rgba(255, 170, 80, 0.9)';
  c.fillRect(lx + 3, rail - 19, 5, 5);           // Feuerschein
  c.fillStyle = dark;
  roundedRect(c, lx + 11, rail - 15, 26, 11, 4);  // Kessel
  c.fill();
  c.fillRect(lx + 28, rail - 22, 4, 8);           // Schornstein
  c.fillRect(lx + 27, rail - 23, 6, 2);
  c.fillRect(lx + 19, rail - 18, 4, 4);           // Dom
  c.beginPath();                                  // Schienenräumer
  c.moveTo(lx + 37, rail - 5);
  c.lineTo(lx + 41, rail - 1);
  c.lineTo(lx + 33, rail - 1);
  c.fill();
  c.fillStyle = '#2a2c34';
  for (const wx of [lx + 6, lx + 16, lx + 25, lx + 33]) {
    c.beginPath();
    c.arc(wx, rail - 3, wx < lx + 10 ? 2.6 : 3.2, 0, Math.PI * 2);
    c.fill();
  }
  // Scheinwerfer mit Kegel
  const beam = c.createLinearGradient(lx + 37, 0, lx + 80, 0);
  beam.addColorStop(0, 'rgba(255, 235, 170, 0.5)');
  beam.addColorStop(1, 'rgba(255, 235, 170, 0)');
  c.fillStyle = beam;
  c.beginPath();
  c.moveTo(lx + 37, rail - 11);
  c.lineTo(lx + 82, rail - 18);
  c.lineTo(lx + 82, rail + 2);
  c.closePath();
  c.fill();
  c.fillStyle = '#fff4c8';
  c.beginPath();
  c.arc(lx + 37, rail - 11, 1.8, 0, Math.PI * 2);
  c.fill();
}

// ---------------------------------------------------------------- Projektor: scharf stellen
export const FOCUS_TARGET = { a: 3, b: 7 };
export const FOCUS_SPOTS = [
  { id: 'a', cx: 420, cy: 560, r: 64, label: 'Großes Rad (Objektiv)' },
  { id: 'b', cx: 860, cy: 560, r: 64, label: 'Kleines Rad (Bildfenster)' },
];

export function blurAmount({ a, b }) {
  const da = Math.min(Math.abs(a - FOCUS_TARGET.a), 8 - Math.abs(a - FOCUS_TARGET.a));
  const db = Math.min(Math.abs(b - FOCUS_TARGET.b), 8 - Math.abs(b - FOCUS_TARGET.b));
  return da + db;
}

let blurCanvas = null;
// Zeichnet ein Bild unscharf: klein rechnen und wieder groß ziehen (geht in jedem Browser)
export function drawBlurred(ctx, image, x, y, w, h, amount) {
  if (!image) return;
  if (amount <= 0) {
    ctx.drawImage(image, x, y, w, h);
    return;
  }
  blurCanvas ??= document.createElement('canvas');
  const factor = 1 + amount * 2.2;
  blurCanvas.width = Math.max(4, Math.round(w / factor));
  blurCanvas.height = Math.max(3, Math.round(h / factor));
  const small = blurCanvas.getContext('2d');
  small.imageSmoothingEnabled = true;
  small.drawImage(image, 0, 0, blurCanvas.width, blurCanvas.height);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(blurCanvas, x, y, w, h);
  ctx.restore();
}

export function drawFocus(ctx, state, picture) {
  ctx.fillStyle = '#16120f';
  ctx.fillRect(160, 50, 960, 640);
  // Vorschau auf der Mattscheibe
  ctx.fillStyle = '#000';
  ctx.fillRect(330, 80, 620, 350);
  drawBlurred(ctx, picture, 340, 90, 600, 330, blurAmount(state));
  ctx.strokeStyle = '#4b4f55';
  ctx.lineWidth = 6;
  ctx.strokeRect(330, 80, 620, 350);
  text(ctx, 'Mattscheibe', 640, 456, { font: `15px ${PRINT}`, color: '#bdb5a4', align: 'center' });
  // Zahnräder: das große Rad dreht das kleine mit
  for (const spot of FOCUS_SPOTS) {
    const value = state[spot.id];
    drawGear(ctx, spot.cx, spot.cy, spot.r, value);
    text(ctx, spot.id === 'a' ? 'Objektiv' : 'Bildfenster', spot.cx, spot.cy + spot.r + 30, { font: `bold 17px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  }
  // Verbindung zwischen den Rädern
  ctx.strokeStyle = '#7a6a4a';
  ctx.lineWidth = 8;
  line(ctx, 490, 560, 790, 560);
  text(ctx, 'Achtung: Das Objektiv dreht das Bildfenster mit.', 640, 530, { font: `italic 15px ${SERIF}`, color: '#bdb5a4', align: 'center' });
}

function drawGear(ctx, cx, cy, r, value) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((value / 8) * Math.PI * 2);
  ctx.fillStyle = '#9a8a62';
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 0.5) / 16) * Math.PI * 2;
    ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r);
    ctx.lineTo(Math.cos(a1) * (r - 10), Math.sin(a1) * (r - 10));
  }
  ctx.fill();
  ctx.fillStyle = '#5d533b';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  // Markierung
  ctx.fillStyle = '#e9d8b0';
  ctx.beginPath();
  ctx.arc(0, -r + 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Skala 0–7 außen
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    text(ctx, String(i), cx + Math.cos(a) * (r + 18), cy + Math.sin(a) * (r + 18) + 6, { font: `14px ${PRINT}`, color: i === value ? '#ffd36b' : '#8f8672', align: 'center' });
  }
}

// ---------------------------------------------------------------- Das Standbild mit Filmrand
export function drawStill(ctx) {
  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(90, 40, 1100, 640);
  ctx.fillStyle = '#cfc6b0';
  for (let y = 56; y < 670; y += 30) {
    ctx.fillRect(110, y, 16, 12);
    ctx.fillRect(1154, y, 16, 12);
  }
  if (still) ctx.drawImage(still, 150, 70, 980, 551);
  // Filmrand-Beschriftung
  text(ctx, `RINGBAHN · KAMERA TUNNEL · RUNDE ${FILM_ROUND}`, 640, 654, { font: `bold 18px ${TYPEWRITER}`, color: '#e8dcc0', align: 'center' });
  ctx.save();
  ctx.translate(140, 360);
  ctx.rotate(-Math.PI / 2);
  text(ctx, `${FILM_ROUND} ▸`, 0, 0, { font: `bold 16px ${TYPEWRITER}`, color: '#e8dcc0', align: 'center' });
  ctx.restore();
}

