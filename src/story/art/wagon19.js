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
  // Wand mit Kacheln, davor der Labortisch
  ctx.fillStyle = redLight ? '#2a0808' : '#1c1814';
  ctx.fillRect(220, 60, 1020, 600);
  ctx.strokeStyle = redLight ? 'rgba(255, 120, 100, 0.06)' : 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  for (let y = 60; y < 420; y += 36) line(ctx, 220, y, 1240, y);
  for (let x = 220; x < 1240; x += 36) line(ctx, x, 60, x, 420);
  const bench = ctx.createLinearGradient(0, 400, 0, 660);
  bench.addColorStop(0, redLight ? '#3a1410' : '#3a3530');
  bench.addColorStop(1, redLight ? '#1a0606' : '#191613');
  ctx.fillStyle = bench;
  ctx.fillRect(220, 400, 1020, 260);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(220, 400, 1020, 3);
  if (redLight) glow(ctx, 730, 60, 600, '255, 40, 30', 0.25);
  BOTTLES.forEach((b, i) => {
    if (held === b.id || trays.includes(b.id)) return;
    drawBottle(ctx, BOTTLE_SPOTS[i], b);
  });
  TRAY_SPOTS.forEach((s, i) => {
    drawTrayDish(ctx, s, ['#e2dccd', '#9a9a9a', '#b8352a'][i], BOTTLES.find((b) => b.id === trays[i]));
    text(ctx, `Schale ${i + 1}`, s.x + s.w / 2, s.y + 130, { font: `bold 18px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  });
  // Laborzeituhr auf dem Knopf „Film entwickeln“
  const plate = ctx.createLinearGradient(0, DEVELOP_SPOT.y, 0, DEVELOP_SPOT.y + DEVELOP_SPOT.h);
  plate.addColorStop(0, '#4e3820');
  plate.addColorStop(1, '#271a0c');
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.roundRect(DEVELOP_SPOT.x, DEVELOP_SPOT.y, DEVELOP_SPOT.w, DEVELOP_SPOT.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#c9a24c';
  ctx.lineWidth = 2;
  ctx.stroke();
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

// Glasflasche mit Schulter, Korken, Flüssigkeit, Etikett „?“
function drawBottle(ctx, s, b) {
  const cx = s.x + 70, base = s.y + 230;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx + 8, base, 50, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  const body = new Path2D();
  body.moveTo(cx - 14, s.y + 20);
  body.lineTo(cx - 14, s.y + 62);
  body.bezierCurveTo(cx - 14, s.y + 80, cx - 44, s.y + 84, cx - 44, s.y + 110);
  body.lineTo(cx - 44, base - 8);
  body.quadraticCurveTo(cx - 44, base, cx - 36, base);
  body.lineTo(cx + 36, base);
  body.quadraticCurveTo(cx + 44, base, cx + 44, base - 8);
  body.lineTo(cx + 44, s.y + 110);
  body.bezierCurveTo(cx + 44, s.y + 84, cx + 14, s.y + 80, cx + 14, s.y + 62);
  body.lineTo(cx + 14, s.y + 20);
  body.closePath();
  // Glas
  const glass = ctx.createLinearGradient(cx - 44, 0, cx + 44, 0);
  glass.addColorStop(0, b.color);
  glass.addColorStop(0.35, 'rgba(255, 255, 255, 0.55)');
  glass.addColorStop(0.5, b.color);
  glass.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = glass;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  // Flüssigkeit bis knapp unter die Schulter
  ctx.save();
  ctx.clip(body);
  const liquid = ctx.createLinearGradient(cx - 44, 0, cx + 44, 0);
  liquid.addColorStop(0, b.color);
  liquid.addColorStop(0.4, b.color);
  liquid.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
  ctx.fillStyle = liquid;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(cx - 50, s.y + 120, 100, 120);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(cx - 44, s.y + 120, 88, 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke(body);
  // Glanzstreifen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.roundRect(cx - 34, s.y + 112, 6, 100, 3);
  ctx.fill();
  // Korken
  ctx.fillStyle = '#a9804a';
  ctx.beginPath();
  ctx.roundRect(cx - 12, s.y + 4, 24, 22, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.6)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 3; k++) line(ctx, cx - 10, s.y + 9 + k * 6, cx + 10, s.y + 9 + k * 6);
  // Etikett, leicht schief, abgegriffen
  ctx.save();
  ctx.translate(cx, s.y + 160);
  ctx.rotate(-0.04);
  ctx.fillStyle = '#ece2c4';
  ctx.fillRect(-34, -22, 68, 44);
  ctx.strokeStyle = 'rgba(80, 60, 30, 0.5)';
  ctx.strokeRect(-30, -18, 60, 36);
  ctx.fillStyle = 'rgba(120, 90, 50, 0.25)';
  ctx.fillRect(-34, 10, 30, 12);
  text(ctx, '?', 0, 10, { font: `bold 26px ${PRINT}`, align: 'center' });
  ctx.restore();
  ctx.restore();
}

// Entwicklerschale in leichter Aufsicht, mit Flüssigkeit
function drawTrayDish(ctx, s, color, inside) {
  const x = s.x, y = s.y + 30, w = s.w, h = 72;
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 10, w, h, 10);
  ctx.fill();
  // Außenwand
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  // Boden innen (etwas dunkler) mit Rippen
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.beginPath();
  ctx.roundRect(x + 10, y + 8, w - 20, h - 16, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  for (let k = 1; k < 5; k++) line(ctx, x + 14 + k * (w - 28) / 5, y + 12, x + 14 + k * (w - 28) / 5, y + h - 12);
  if (inside) {
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = inside.color;
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 10, w - 24, h - 20, 5);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.35, y + 20, w * 0.22, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rand und Ausgießnase
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 10);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + w - 2, y + 4);
  ctx.lineTo(x + w + 10, y - 4);
  ctx.lineTo(x + w - 2, y + 18);
  ctx.fill();
  ctx.restore();
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
