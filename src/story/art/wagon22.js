import {
  INK, PRINT, RED, SERIF, TYPEWRITER, cached, drawPicture, fineGrain, glow, line, photoCard, rivet, roundedRect, screw, seeded, text, vignette,
} from './common.js';

// Gezeichnetes für Wagen 22 (Lok): Fahrtenschreiber-Streifen der Unglücksnacht, der Blick aus dem
// Kohlentender, die Beweise (Familienfoto, Pressefoto, Miras Karte).

// ---------------------------------------------------------------- Fahrtenschreiber
// Der Streifen lässt sich abrollen (offset). Kilometer mit Uhrzeit darunter.
export const MARKS = [
  { km: '23,9', time: '23:39' }, { km: '24,1', time: '23:40' }, { km: '24,3', time: '23:41' },
  { km: '24,5', time: '23:42' }, { km: '24,7', time: '23:43' }, { km: '24,9', time: '23:44' },
  { km: '25,1', time: '23:45' }, { km: '25,3', time: '23:46' },
];
export const STRIP_SPOTS = [
  { id: 'back', x: 160, y: 560, w: 120, h: 60, label: 'Streifen zurückrollen' },
  { id: 'forward', x: 1000, y: 560, w: 120, h: 60, label: 'Streifen weiterrollen' },
];

export function drawStrip(ctx, { offset }) {
  ctx.drawImage(cached('w22-recorder', 1280, 720, paintRecorder), 0, 0);
  const step = 240;
  const shift = offset * step;
  ctx.save();
  ctx.beginPath();
  ctx.rect(200, 180, 880, 320);
  ctx.clip();
  // Papier mit Raster, das beim Rollen mitwandert
  const paper = ctx.createLinearGradient(0, 180, 0, 500);
  paper.addColorStop(0, '#f4eedc');
  paper.addColorStop(1, '#e8dfc4');
  ctx.fillStyle = paper;
  ctx.fillRect(200, 180, 880, 320);
  for (let gx = 200 - (shift % 24); gx < 1080; gx += 24) {
    const major = Math.round((gx + shift - 200) / 24) % 5 === 0;
    ctx.strokeStyle = major ? 'rgba(200, 90, 80, 0.32)' : 'rgba(200, 90, 80, 0.14)';
    ctx.lineWidth = major ? 1.4 : 1;
    line(ctx, gx, 196, gx, 486);
  }
  for (let gy = 204; gy < 490; gy += 24) {
    ctx.strokeStyle = (gy - 204) % 120 === 0 ? 'rgba(200, 90, 80, 0.32)' : 'rgba(200, 90, 80, 0.14)';
    ctx.lineWidth = 1;
    line(ctx, 200, gy, 1080, gy);
  }
  // Lochrand oben und unten
  ctx.fillStyle = '#2a2620';
  for (let hx = 200 - (shift % 30) + 8; hx < 1080; hx += 30) {
    ctx.fillRect(hx, 184, 10, 6);
    ctx.fillRect(hx, 490, 10, 6);
  }
  // Skala links: Geschwindigkeit
  for (const [v, y] of [[100, 228], [80, 252], [60, 300], [40, 348], [20, 396], [0, 444]]) {
    text(ctx, String(v), 206, y + 4, { font: `11px ${PRINT}`, color: 'rgba(150, 60, 50, 0.8)' });
  }
  // Geschwindigkeit (konstant hoch – niemand bremst)
  ctx.strokeStyle = '#a8201a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 230; x <= 1080; x += 6) {
    const y = 252 + Math.sin((x + shift) * 0.05) * 3 + Math.sin((x + shift) * 0.21) * 1.2;
    if (x === 230) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  text(ctx, '80 km/h', 236, 240, { font: `bold 13px ${PRINT}`, color: '#a8201a' });
  MARKS.forEach((mark, i) => {
    const x = 260 + i * step - shift;
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.7)';
    ctx.lineWidth = 2;
    line(ctx, x, 270, x, 486);
    ctx.fillStyle = 'rgba(43, 33, 24, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x - 6, 270);
    ctx.lineTo(x + 6, 270);
    ctx.lineTo(x, 280);
    ctx.fill();
    text(ctx, `km ${mark.km}`, x + 8, 378, { font: `bold 20px ${TYPEWRITER}`, color: '#2b2118' });
    text(ctx, mark.time, x + 8, 466, { font: `bold 22px ${TYPEWRITER}`, color: '#2b2118' });
  });
  ctx.restore();
  // Schatten der Rollen über dem Papier
  for (const [x0, dir] of [[200, 1], [1080, -1]]) {
    const g = ctx.createLinearGradient(x0, 0, x0 + dir * 50, 0);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x0 + dir * 50), 180, 50, 320);
  }
  // Schreibstift oben rechts
  ctx.strokeStyle = '#8a6a2a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  line(ctx, 1110, 150, 1040, 248);
  ctx.fillStyle = '#a8201a';
  ctx.beginPath();
  ctx.arc(1040, 250, 5, 0, Math.PI * 2);
  ctx.fill();
  for (const spot of STRIP_SPOTS) rollerButton(ctx, spot, spot.id === 'back' ? '◀◀' : '▶▶');
}

function paintRecorder(ctx) {
  const x = 120, y = 90, w = 1040, h = 560;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundedRect(ctx, x, y, w, h, 20);
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, '#34382e');
  g.addColorStop(1, '#1c1e18');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  fineGrain(ctx, x, y, w, h, { seed: 22, count: 0.01, dark: 0.2, light: 0.05 });
  ctx.strokeStyle = '#b08a40';
  ctx.lineWidth = 3;
  roundedRect(ctx, x + 10, y + 10, w - 20, h - 20, 14);
  ctx.stroke();
  for (let i = 0; i <= 12; i++) for (const ry of [y + 24, y + h - 24]) rivet(ctx, x + 30 + (i * (w - 60)) / 12, ry, 4, [150, 130, 90]);
  // Messingschild
  roundedRect(ctx, 400, 112, 480, 40, 6);
  const brass = ctx.createLinearGradient(0, 112, 0, 152);
  brass.addColorStop(0, '#f0d488');
  brass.addColorStop(1, '#8a6424');
  ctx.fillStyle = brass;
  ctx.fill();
  screw(ctx, 414, 132, 4);
  screw(ctx, 866, 132, 4);
  text(ctx, 'FAHRTENSCHREIBER · 24. Dezember · Zug 24', 640, 139, { font: `bold 18px ${PRINT}`, color: '#3a2a10', align: 'center' });
  // Fenster für den Streifen
  ctx.fillStyle = '#0e0e0c';
  roundedRect(ctx, 186, 170, 908, 340, 10);
  ctx.fill();
  // Rollen links und rechts
  for (const cx of [170, 1110]) {
    const roll = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0);
    roll.addColorStop(0, '#9a8a6a');
    roll.addColorStop(0.5, '#efe6cc');
    roll.addColorStop(1, '#8a7a5a');
    ctx.fillStyle = roll;
    roundedRect(ctx, cx - 28, 176, 56, 328, 26);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    for (let k = -20; k <= 20; k += 5) line(ctx, cx + k, 186, cx + k, 494);
    ctx.fillStyle = '#5a4a2a';
    roundedRect(ctx, cx - 12, 164, 24, 16, 4);
    ctx.fill();
    roundedRect(ctx, cx - 12, 500, 24, 16, 4);
    ctx.fill();
  }
  text(ctx, 'Lok 24 · Geschwindigkeit und Zeit', 640, 540, { font: `italic 16px ${SERIF}`, color: '#b8b0a0', align: 'center' });
  vignette(ctx, x, y, w, h, 0.35);
}

function rollerButton(ctx, spot, label) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundedRect(ctx, spot.x, spot.y, spot.w, spot.h, 12);
  const g = ctx.createLinearGradient(0, spot.y, 0, spot.y + spot.h);
  g.addColorStop(0, '#e8c878');
  g.addColorStop(1, '#8a6424');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#5a3e14';
  ctx.lineWidth = 2;
  roundedRect(ctx, spot.x + 2, spot.y + 2, spot.w - 4, spot.h - 4, 10);
  ctx.stroke();
  text(ctx, label, spot.x + spot.w / 2, spot.y + 40, { font: `bold 24px ${PRINT}`, color: '#3a2a10', align: 'center' });
}

// ---------------------------------------------------------------- Im Kohlentender
// minute = Minuten nach 23 Uhr (z. B. 26 = 23:26). other = 0 (nicht da), 1 (kommt herein), 2 (am Pult)
export const OUT_SPOT = { id: 'out', x: 520, y: 590, w: 240, h: 60, label: 'Jetzt herauskommen!' };

export function drawTender(ctx, { minute, seconds, background }) {
  ctx.drawImage(cached('w22-tender', 1280, 720, paintTender), 0, 0);
  // Spalt in der Luke: dahinter der Führerstand
  const slit = { x: 260, y: 220, w: 760, h: 120 };
  ctx.save();
  ctx.beginPath();
  ctx.rect(slit.x, slit.y, slit.w, slit.h);
  ctx.clip();
  if (background) ctx.drawImage(background, 0, -150, 1280, 853);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(slit.x, slit.y, slit.w, slit.h);
  if (minute >= 30 && minute < 32) {
    const x = minute === 30 ? 560 : 820;
    drawPicture(ctx, 'assets/characters/anderer-joseph/right.webp', x, 230, 80, 380);
  }
  // Innenschatten am Spaltrand
  const shade = ctx.createLinearGradient(0, slit.y, 0, slit.y + slit.h);
  shade.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
  shade.addColorStop(0.25, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(0.75, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = shade;
  ctx.fillRect(slit.x, slit.y, slit.w, slit.h);
  ctx.restore();
  // Rahmen des Spalts (Eisen mit Nieten)
  ctx.strokeStyle = '#2c241c';
  ctx.lineWidth = 16;
  ctx.strokeRect(slit.x - 4, slit.y - 4, slit.w + 8, slit.h + 8);
  ctx.strokeStyle = 'rgba(160, 140, 110, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(slit.x - 12, slit.y - 12, slit.w + 24, slit.h + 24);
  for (let i = 0; i <= 10; i++) for (const ry of [slit.y - 4, slit.y + slit.h + 4]) rivet(ctx, slit.x + (i * slit.w) / 10, ry, 4, [110, 100, 86]);
  // Taschenuhr mit Messinggehäuse und Kette
  const cx = 1110, cy = 190;
  glow(ctx, cx, cy, 110, '255, 220, 150', 0.14);
  ctx.strokeStyle = '#a8883a';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, cy - 78);
  ctx.quadraticCurveTo(cx - 80, cy - 140, cx - 160, cy - 120);
  ctx.stroke();
  ctx.setLineDash([]);
  const caseG = ctx.createRadialGradient(cx - 20, cy - 24, 10, cx, cy, 76);
  caseG.addColorStop(0, '#f6dc92');
  caseG.addColorStop(0.7, '#b08a3a');
  caseG.addColorStop(1, '#5a3e12');
  ctx.fillStyle = caseG;
  ctx.beginPath();
  ctx.arc(cx, cy, 74, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 8, cy - 92, 16, 18);
  ctx.beginPath();
  ctx.arc(cx, cy - 96, 10, 0, Math.PI * 2);
  ctx.strokeStyle = '#c8a040';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#f1e8d0';
  ctx.beginPath();
  ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.fill();
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2;
    ctx.strokeStyle = INK;
    ctx.lineWidth = k % 5 ? 1 : 2.5;
    const r0 = k % 5 ? 56 : 50;
    line(ctx, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * 60, cy + Math.sin(a) * 60);
  }
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * Math.PI * 2 - Math.PI / 2;
    text(ctx, String(h), cx + Math.cos(a) * 40, cy + Math.sin(a) * 40 + 5, { font: `bold 13px ${SERIF}`, color: INK, align: 'center' });
  }
  const total = minute + seconds / 60;
  const ma = -Math.PI / 2 + total / 60 * Math.PI * 2;
  const ha = -Math.PI / 2 + (11 + total / 60) / 12 * Math.PI * 2;
  const sa = -Math.PI / 2 + (seconds / 60) * Math.PI * 2;
  ctx.strokeStyle = INK;
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  line(ctx, cx, cy, cx + Math.cos(ha) * 30, cy + Math.sin(ha) * 30);
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(ma) * 50, cy + Math.sin(ma) * 50);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 1.5;
  line(ctx, cx, cy, cx + Math.cos(sa) * 54, cy + Math.sin(sa) * 54);
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, `23:${String(minute).padStart(2, '0')}`, cx, cy + 106, { font: `bold 22px ${PRINT}`, color: '#efe3c2', align: 'center' });
  // Knopf: aus dem Tender klettern
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundedRect(ctx, OUT_SPOT.x, OUT_SPOT.y, OUT_SPOT.w, OUT_SPOT.h, 12);
  const bg = ctx.createLinearGradient(0, OUT_SPOT.y, 0, OUT_SPOT.y + OUT_SPOT.h);
  bg.addColorStop(0, '#8a3a22');
  bg.addColorStop(1, '#4a1a0c');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#e0a070';
  ctx.lineWidth = 2;
  roundedRect(ctx, OUT_SPOT.x + 2, OUT_SPOT.y + 2, OUT_SPOT.w - 4, OUT_SPOT.h - 4, 10);
  ctx.stroke();
  text(ctx, 'Jetzt raus!', OUT_SPOT.x + OUT_SPOT.w / 2, OUT_SPOT.y + 40, { font: `bold 24px ${PRINT}`, color: '#ffe7a0', align: 'center' });
}

function paintTender(ctx) {
  ctx.fillStyle = '#060504';
  ctx.fillRect(0, 0, 1280, 720);
  // Bretterwand des Tenders, ganz dunkel
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 ? '#0d0a08' : '#100c09';
    ctx.fillRect(i * 110, 0, 108, 560);
  }
  // Kohlenhaufen: kantige Brocken mit Glanzkanten
  const r = seeded(220);
  for (let i = 0; i < 220; i++) {
    const kx = r() * 1280, ky = 470 + r() * 260, size = 14 + r() * 34;
    const sides = 5 + Math.floor(r() * 3);
    ctx.beginPath();
    for (let k = 0; k < sides; k++) {
      const a = (k / sides) * Math.PI * 2 + r() * 0.4;
      const rr = size * (0.7 + r() * 0.4);
      const px = kx + Math.cos(a) * rr, py = ky + Math.sin(a) * rr * 0.7;
      if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath();
    const shade = 14 + Math.floor(r() * 16);
    ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 3})`;
    ctx.fill();
    // nur die obere Kante glänzt ein wenig
    ctx.save();
    ctx.clip();
    ctx.fillStyle = `rgba(170, 170, 190, ${0.04 + r() * 0.06})`;
    ctx.fillRect(kx - size, ky - size * 0.7, size * 2, size * 0.35);
    ctx.restore();
  }
  // etwas Licht fällt durch den Spalt auf die Kohlen
  ctx.save();
  ctx.translate(640, 520);
  ctx.scale(1, 0.32);
  const pool = ctx.createRadialGradient(0, 0, 20, 0, 0, 520);
  pool.addColorStop(0, 'rgba(255, 200, 130, 0.16)');
  pool.addColorStop(1, 'rgba(255, 200, 130, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(-520, -520, 1040, 1040);
  ctx.restore();
  vignette(ctx, 0, 0, 1280, 720, 0.6);
}

// ---------------------------------------------------------------- Beweise
export function drawEvidence(ctx, which) {
  if (which === 'family') photoCard(ctx, 'assets/photos/familienfoto.webp', 640, 360, 420, 560, -0.03);
  if (which === 'press') photoCard(ctx, 'assets/photos/pressefoto.webp', 640, 360, 840, 560, 0.02);
  if (which === 'card') {
    ctx.save();
    ctx.translate(640, 360);
    ctx.rotate(0.04);
    ctx.fillStyle = '#f6edd8';
    ctx.fillRect(-260, -170, 520, 340);
    ['Für Papa.', 'Damit du uns', 'nach Hause bringst.', '', 'Deine Mira'].forEach((value, i) => text(ctx, value, -210, -90 + i * 50, { font: `bold 34px "Noteworthy", "Comic Sans MS", cursive`, color: RED }));
    ctx.restore();
  }
}
