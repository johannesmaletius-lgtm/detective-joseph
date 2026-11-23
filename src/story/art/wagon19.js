import { BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, drawPicture, glow, line, sheet, text, wood } from './common.js';

// Gezeichnetes für Wagen 19 (Fotolabor): Belichtungstabelle, Flaschen und Schalen, Kontaktbogen,
// das vergrößerte Tunnelfoto (ChatGPT-Bild) mit dem Kilometerstein.

// ---------------------------------------------------------------- Raum: Licht aus / Rotlicht
export function paintTint(ctx, { roomLight, redLight }) {
  if (roomLight) return;
  ctx.fillStyle = redLight ? 'rgba(40, 0, 0, 0.72)' : 'rgba(0, 0, 0, 0.86)';
  ctx.fillRect(0, 0, 1280, 720);
  if (redLight) glow(ctx, 1055, 200, 380, '255, 40, 30', 0.35);
}

// ---------------------------------------------------------------- Kameratasche
export function drawExposureTable(ctx) {
  sheet(ctx, 300, 90, 680, 520, {
    color: '#e9e2cc',
    inner: (c) => {
      text(c, 'Belichtungstabelle', 340, 52, { font: `bold 28px ${SERIF}`, align: 'center' });
      text(c, '(Film 100 ASA)', 340, 82, { font: `italic 18px ${SERIF}`, align: 'center' });
      const rows = [
        ['Licht', 'Blende', 'Zeit'],
        ['pralle Sonne', '16', '1/250 s'],
        ['bewölkt', '8', '1/125 s'],
        ['Abend, Laterne', '4', '1/30 s'],
        ['fast kein Licht', '2', '1/15 s'],
      ];
      rows.forEach((row, i) => {
        const y = 140 + i * 56;
        row.forEach((cell, j) => text(c, cell, [60, 330, 490][j], y, { font: `${i ? '' : 'bold '}24px ${TYPEWRITER}` }));
        c.strokeStyle = 'rgba(43, 33, 24, 0.3)';
        c.lineWidth = 1;
        line(c, 40, y + 18, 640, y + 18);
      });
      text(c, 'Schloss: Blende, dann Zeit (ohne „1/“)', 60, 440, { font: `italic 18px ${SERIF}`, color: RED });
      text(c, 'Letzte Aufnahme: Tunnel, fast kein Licht.  – der Bordfotograf', 60, 480, { font: `20px ${HAND}`, color: BLUE_INK });
    },
  });
}

// ---------------------------------------------------------------- Chemie
export const BOTTLES = [
  { id: 'b1', name: 'Braune Flasche', color: '#5a3010', smell: 'Riecht seifig, ein bisschen wie Waschmittel.', chem: 'dev' },
  { id: 'b2', name: 'Klare Flasche', color: '#c8d8e0', smell: 'Puh – Schwefel. Wie faule Eier.', chem: 'fix' },
  { id: 'b3', name: 'Gelbliche Flasche', color: '#c9a24a', smell: 'Scharf und sauer. Essig!', chem: 'stop' },
];
export const TRAY_SPOTS = [0, 1, 2].map((i) => ({ id: `t${i}`, x: 300 + i * 240, y: 450, w: 200, h: 120, label: `Schale ${i + 1}` }));
export const BOTTLE_SPOTS = BOTTLES.map((b, i) => ({ id: b.id, x: 330 + i * 240, y: 150, w: 140, h: 240, label: b.name }));
export const DEVELOP_SPOT = { id: 'develop', x: 1060, y: 450, w: 160, h: 120, label: 'Film entwickeln' };

export function drawChemistry(ctx, { trays, held, redLight }) {
  ctx.fillStyle = redLight ? '#2a0606' : '#1a1410';
  ctx.fillRect(220, 60, 1020, 600);
  if (redLight) glow(ctx, 730, 60, 600, '255, 40, 30', 0.25);
  BOTTLES.forEach((b, i) => {
    if (held === b.id || trays.includes(b.id)) return;
    const s = BOTTLE_SPOTS[i];
    ctx.fillStyle = b.color;
    ctx.fillRect(s.x + 30, s.y + 60, 80, 170);
    ctx.fillRect(s.x + 55, s.y + 10, 30, 55);
    ctx.fillStyle = '#eee4c8';
    ctx.fillRect(s.x + 38, s.y + 120, 64, 40);
    text(ctx, '?', s.x + 70, s.y + 150, { font: `bold 26px ${PRINT}`, align: 'center' });
  });
  TRAY_SPOTS.forEach((s, i) => {
    ctx.fillStyle = ['#d8d0c0', '#a8a8a8', '#c0392b'][i];
    ctx.fillRect(s.x, s.y + 40, s.w, 60);
    const inside = BOTTLES.find((b) => b.id === trays[i]);
    if (inside) {
      ctx.fillStyle = inside.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(s.x + 10, s.y + 50, s.w - 20, 40);
      ctx.globalAlpha = 1;
    }
    text(ctx, `Schale ${i + 1}`, s.x + s.w / 2, s.y + 130, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  });
  ctx.fillStyle = '#3d2a16';
  ctx.fillRect(DEVELOP_SPOT.x, DEVELOP_SPOT.y, DEVELOP_SPOT.w, DEVELOP_SPOT.h);
  text(ctx, 'Film', DEVELOP_SPOT.x + 80, DEVELOP_SPOT.y + 52, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'entwickeln', DEVELOP_SPOT.x + 80, DEVELOP_SPOT.y + 80, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  // halb zerrissene Anleitung
  sheet(ctx, 1010, 110, 220, 300, {
    angle: 0.04,
    inner: (c) => {
      text(c, 'Anleitung', 110, 32, { font: `bold 18px ${SERIF}`, align: 'center' });
      ['Schale 1: Entwickler', '(eine Lauge) 3 Min.', '', 'Schale 2: Stoppbad', '(eine Säure) 1 Min.', '', 'Schale 3: Fixie…'].forEach((value, i) => text(c, value, 14, 66 + i * 26, { font: `15px ${HAND}`, color: INK }));
      c.fillStyle = '#1a1410';
      c.beginPath();
      c.moveTo(0, 250);
      for (let x = 0; x <= 220; x += 20) c.lineTo(x, 236 + (x / 20 % 2) * 14);
      c.lineTo(220, 300);
      c.lineTo(0, 300);
      c.fill();
    },
  });
  if (held) text(ctx, `${BOTTLES.find((b) => b.id === held).name} in der Hand – auf eine Schale klicken`, 730, 100, { font: `bold 18px ${PRINT}`, color: '#ffe7a0', align: 'center' });
}

// ---------------------------------------------------------------- Kontaktbogen
// Sechs Negative. Je weiter der Zug im Tunnel ist, desto mehr Lampen sind schon vorbeigezogen.
export const NEGATIVES = [3, 0, 5, 1, 4, 2]; // Anzahl der Lampen (so liegen sie anfangs)
export const NEG_SLOTS = Array.from({ length: 6 }, (_, i) => ({ x: 170 + i * 160, y: 140, w: 140, h: 110, label: String(i + 1) }));
export function negativeTokens() {
  return NEGATIVES.map((lamps, i) => ({ id: `n${lamps}`, lamps, w: 130, h: 100, label: 'Negativ', home: { x: 240 + i * 160, y: 470 } }));
}
export function checkNegatives(placement) {
  return placement.every((id, i) => id === `n${i}`);
}
export function drawContactSheet(ctx) {
  ctx.fillStyle = '#1b1b1b';
  ctx.fillRect(140, 90, 1000, 520);
  text(ctx, 'Kontaktbogen – nach dem Weg durch den Tunnel ordnen', 640, 124, { font: `bold 20px ${PRINT}`, color: '#e0e0e0', align: 'center' });
  text(ctx, 'Die Tunnellampen hängen in festen Abständen – wie auf den Filmbildern im Kino.', 640, 600, { font: `italic 16px ${SERIF}`, color: '#c8c8c8', align: 'center' });
}
// Ein Negativ: Blick nach vorn in den Tunnel, hell und dunkel vertauscht. Die Lampen (in Wirklichkeit hell)
// sind dunkle Punkte. Je tiefer der Zug im Tunnel ist, desto weniger Lampen liegen noch vor ihm.
// Auf dem letzten Bild (keine Lampe mehr) teilt sich das Gleis: Weiche 7.
export function drawNegative(ctx, token, x, y) {
  const w = 120, h = 90;
  const ahead = 5 - token.lamps;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.clip();
  ctx.fillStyle = '#d6d4cf';
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  // Tunnelröhre in Perspektive (im Negativ: dunkle Wände werden hell, das ferne Loch dunkel-grau)
  const vx = x + 6, vy = y - 6;
  ctx.fillStyle = '#9d9b96';
  ctx.beginPath();
  ctx.ellipse(vx, vy, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70, 70, 70, 0.55)';
  ctx.lineWidth = 1.5;
  for (const [ex, ey] of [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x - w / 2, y + h / 2], [x + w / 2, y + h / 2]]) line(ctx, ex, ey, vx + (ex - vx) * 0.12, vy + (ey - vy) * 0.12);
  // Lampen an der linken Wand, immer kleiner zur Tiefe hin
  for (let k = 0; k < ahead; k++) {
    const depth = Math.pow(0.62, k);
    const lx = vx + (x - w / 2 + 10 - vx) * depth;
    const ly = vy + (y - h / 2 + 14 - vy) * depth;
    ctx.fillStyle = 'rgba(30, 30, 30, 0.25)';
    ctx.beginPath();
    ctx.arc(lx, ly, 9 * depth + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#151515';
    ctx.beginPath();
    ctx.arc(lx, ly, 4 * depth + 1, 0, Math.PI * 2);
    ctx.fill();
  }
  // Gleis
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  line(ctx, x - 22, y + h / 2, vx - 2, vy + 8);
  line(ctx, x + 22, y + h / 2, vx + 2, vy + 8);
  if (ahead === 0) {
    // die Weiche: ein zweites Gleis biegt nach rechts ab
    line(ctx, x + 4, y + 26, x + 46, y + 4);
    line(ctx, x + 18, y + 34, x + 58, y + 12);
  }
  ctx.restore();
  // Filmrand mit Perforation
  ctx.fillStyle = '#222';
  ctx.fillRect(x - w / 2, y - h / 2 - 12, w, 10);
  ctx.fillRect(x - w / 2, y + h / 2 + 2, w, 10);
  ctx.fillStyle = '#d6d4cf';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x - w / 2 + 5 + i * 15, y - h / 2 - 9, 7, 4);
    ctx.fillRect(x - w / 2 + 5 + i * 15, y + h / 2 + 5, 7, 4);
  }
}

// ---------------------------------------------------------------- Vergrößerung
export function drawEnlargement(ctx) {
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, 1280, 720);
  const x = 190, y = 60, w = 900, h = 600;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#eee';
  ctx.fillRect(x - 12, y - 12, w + 24, h + 24);
  ctx.restore();
  drawPicture(ctx, 'assets/photos/tunnelfoto.webp', x, y, w, h);
  // Kilometerstein beschriften (Stein unten links im Bild)
  ctx.save();
  ctx.translate(x + w * 0.148, y + h * 0.83);
  ctx.rotate(-0.04);
  text(ctx, '24,7', 0, 0, { font: `bold 22px ${SERIF}`, color: '#1a1a1a', align: 'center' });
  ctx.restore();
  text(ctx, 'Letztes Bild des Films · Weiche 7', 640, 700, { font: `italic 16px ${SERIF}`, color: '#bbb', align: 'center' });
}
