import { INK, PRINT, RED, SERIF, TYPEWRITER, drawPicture, glow, line, photoCard, text } from './common.js';

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
  ctx.fillStyle = '#2a2a24';
  ctx.fillRect(120, 90, 1040, 560);
  text(ctx, 'FAHRTENSCHREIBER · 24. Dezember · Zug 24', 640, 130, { font: `bold 20px ${PRINT}`, color: '#e8e0c8', align: 'center' });
  ctx.fillStyle = '#f2ecdc';
  ctx.fillRect(160, 170, 960, 340);
  ctx.save();
  ctx.beginPath();
  ctx.rect(160, 170, 960, 340);
  ctx.clip();
  const step = 240;
  // Geschwindigkeit (konstant hoch – niemand bremst)
  ctx.strokeStyle = RED;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 160; x <= 1120; x += 10) {
    const y = 250 + Math.sin((x + offset * step) * 0.05) * 3;
    if (x === 160) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  text(ctx, '80 km/h', 170, 236, { font: `14px ${PRINT}`, color: RED });
  MARKS.forEach((mark, i) => {
    const x = 220 + i * step - offset * step;
    ctx.strokeStyle = 'rgba(43, 33, 24, 0.6)';
    ctx.lineWidth = 2;
    line(ctx, x, 180, x, 500);
    text(ctx, `km ${mark.km}`, x + 6, 380, { font: `bold 20px ${TYPEWRITER}` });
    text(ctx, mark.time, x + 6, 470, { font: `bold 22px ${TYPEWRITER}` });
  });
  ctx.restore();
  text(ctx, 'Ausweichgleis', 160, 540, { font: `italic 16px ${SERIF}`, color: '#b8b0a0' });
  for (const spot of STRIP_SPOTS) {
    ctx.fillStyle = '#4a4a3e';
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    text(ctx, spot.id === 'back' ? '◀◀' : '▶▶', spot.x + spot.w / 2, spot.y + 40, { font: `bold 24px ${PRINT}`, color: '#efe3c2', align: 'center' });
  }
}

// ---------------------------------------------------------------- Im Kohlentender
// minute = Minuten nach 23 Uhr (z. B. 26 = 23:26). other = 0 (nicht da), 1 (kommt herein), 2 (am Pult)
export const OUT_SPOT = { id: 'out', x: 520, y: 590, w: 240, h: 60, label: 'Jetzt herauskommen!' };

export function drawTender(ctx, { minute, seconds, background }) {
  ctx.fillStyle = '#060504';
  ctx.fillRect(0, 0, 1280, 720);
  // Kohlen
  ctx.fillStyle = '#16120e';
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc((i * 211) % 1280, 560 + ((i * 97) % 160), 30 + (i % 4) * 10, 0, Math.PI * 2);
    ctx.fill();
  }
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
  ctx.restore();
  ctx.strokeStyle = '#2a2018';
  ctx.lineWidth = 10;
  ctx.strokeRect(slit.x, slit.y, slit.w, slit.h);
  // Taschenuhr
  const cx = 1120, cy = 140;
  glow(ctx, cx, cy, 90, '255, 220, 150', 0.12);
  ctx.fillStyle = '#d8c89a';
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.fill();
  const total = minute + seconds / 60;
  const ma = -Math.PI / 2 + total / 60 * Math.PI * 2;
  const ha = -Math.PI / 2 + (11 + total / 60) / 12 * Math.PI * 2;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  line(ctx, cx, cy, cx + Math.cos(ha) * 32, cy + Math.sin(ha) * 32);
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(ma) * 52, cy + Math.sin(ma) * 52);
  text(ctx, `23:${String(minute).padStart(2, '0')}`, cx, cy + 96, { font: `bold 22px ${PRINT}`, color: '#efe3c2', align: 'center' });
  ctx.fillStyle = '#5a2a1a';
  ctx.fillRect(OUT_SPOT.x, OUT_SPOT.y, OUT_SPOT.w, OUT_SPOT.h);
  text(ctx, 'Jetzt raus!', OUT_SPOT.x + OUT_SPOT.w / 2, OUT_SPOT.y + 40, { font: `bold 24px ${PRINT}`, color: '#ffe7a0', align: 'center' });
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
