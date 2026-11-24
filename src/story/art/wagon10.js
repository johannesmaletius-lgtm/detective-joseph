import {
  HAND, INK, PRINT, TYPEWRITER, cachedLayer, drawPicture, glow, grain, line, picture, rrect, screw, seeded, sheet, text, wood,
} from './common.js';

// Gezeichnetes für Wagen 10 (Lautsprecherwagen): Sicherungskasten, Tonbandregal, Tonbandgerät.

// ---------------------------------------------------------------- Sicherungskasten
// Fünf Fassungen, jede an einem Kabel anderer Dicke. Dickes Kabel = große Sicherung.
export const CABLES = [4, 1, 6, 1.5, 2.5];          // Querschnitt in mm² je Fassung (von oben)
export const FUSES = [
  { id: 'f6', amp: 6 }, { id: 'f10', amp: 10 }, { id: 'f16', amp: 16 }, { id: 'f20', amp: 20 }, { id: 'f25', amp: 25 },
];
export const FUSE_ORDER = (() => {
  const sorted = [...CABLES].sort((a, b) => a - b);
  return CABLES.map((c) => FUSES[sorted.indexOf(c)].id); // richtige Sicherung je Fassung
})();

export const FUSE_SLOTS = CABLES.map((_, i) => ({ x: 560, y: 128 + i * 104, w: 180, h: 64 }));
export const FUSE_HOMES = [
  { x: 1010, y: 190 }, { x: 980, y: 272 }, { x: 1030, y: 354 }, { x: 990, y: 436 }, { x: 1020, y: 518 },
];

export function drawFuseBox(ctx) {
  ctx.drawImage(cachedLayer('w10-fusebox', paintFuseBox), 0, 0, 1280, 720);
}

// Kennmelder-Farben wie bei echten Schmelzsicherungen
const FUSE_COLORS = { 6: '#3f9a4a', 10: '#c8312a', 16: '#8d8f93', 20: '#2f5fb0', 25: '#e3c12f' };
const CABLE_COLORS = ['#2a2420', '#6a2418', '#3a3a3a', '#5a3a18', '#2a2a40'];

function paintFuseBox(ctx) {
  // Wand: grob verputzt, dahinter der Wagen
  const wall = ctx.createLinearGradient(0, 60, 0, 680);
  wall.addColorStop(0, '#4a4036');
  wall.addColorStop(1, '#2a241e');
  ctx.fillStyle = wall;
  ctx.fillRect(120, 60, 1040, 620);
  grain(ctx, 120, 60, 1040, 620, { seed: 31, count: 3000, alpha: 0.18, size: 1.6 });
  grain(ctx, 120, 60, 1040, 620, { seed: 32, count: 1200, alpha: 0.08, light: true, size: 1.6 });
  glow(ctx, 520, 120, 560, '255, 214, 150', 0.16);

  // Blechgehäuse: Rahmen mit Falz, Hammerschlaglack
  const BX = 206, BY = 92, BW = 628, BH = 588;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 12;
  const shell = ctx.createLinearGradient(BX, BY, BX + BW, BY + BH);
  shell.addColorStop(0, '#6f7a6a');
  shell.addColorStop(1, '#3e463b');
  ctx.fillStyle = shell;
  rrect(ctx, BX, BY, BW, BH, 14);
  ctx.fill();
  ctx.restore();
  grain(ctx, BX, BY, BW, BH, { seed: 33, count: 2200, alpha: 0.16, size: 2 });
  grain(ctx, BX, BY, BW, BH, { seed: 34, count: 900, alpha: 0.12, light: true, size: 2 });
  ctx.strokeStyle = 'rgba(255, 255, 240, 0.25)';
  ctx.lineWidth = 2;
  rrect(ctx, BX + 2, BY + 2, BW - 4, BH - 4, 12);
  ctx.stroke();
  // Innenraum: tief, mit Schatten am oberen und linken Rand
  const IX = BX + 26, IY = BY + 26, IW = BW - 52, IH = BH - 52;
  ctx.fillStyle = '#1d1f1a';
  rrect(ctx, IX - 4, IY - 4, IW + 8, IH + 8, 6);
  ctx.fill();
  // Pertinax-Montageplatte
  const plate = ctx.createLinearGradient(IX, IY, IX + IW, IY + IH);
  plate.addColorStop(0, '#5a3a24');
  plate.addColorStop(1, '#341f12');
  ctx.fillStyle = plate;
  ctx.fillRect(IX, IY, IW, IH);
  grain(ctx, IX, IY, IW, IH, { seed: 35, count: 900, alpha: 0.12, light: true });
  for (const [gx, gy, rx, ry, rw, rh] of [[0, 40, IX, IY, IW, 40], [40, 0, IX, IY, 40, IH]]) {
    const inner = ctx.createLinearGradient(IX, IY, IX + gx, IY + gy);
    inner.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    inner.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = inner;
    ctx.fillRect(rx, ry, rw, rh);
  }
  for (const [sx, sy] of [[IX + 14, IY + 14], [IX + IW - 14, IY + 14], [IX + 14, IY + IH - 14], [IX + IW - 14, IY + IH - 14]]) screw(ctx, sx, sy, 6, sx);
  // Sammelschiene rechts (Kupfer)
  const busX = 790;
  const bus = ctx.createLinearGradient(busX - 8, 0, busX + 8, 0);
  bus.addColorStop(0, '#7a3e1a');
  bus.addColorStop(0.45, '#f0a060');
  bus.addColorStop(1, '#8a4a20');
  ctx.fillStyle = bus;
  ctx.fillRect(busX - 8, FUSE_SLOTS[0].y + 10, 16, FUSE_SLOTS[4].y + FUSE_SLOTS[4].h - FUSE_SLOTS[0].y - 20);
  // Hauptleitung von der Schiene nach unten
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  line(ctx, busX, FUSE_SLOTS[4].y + FUSE_SLOTS[4].h - 10, busX, BY + BH - 30);

  // Kabel: von oben links aus dem Rohr, durch eine Gummitülle, dann zur Fassung
  CABLES.forEach((size, i) => {
    const s = FUSE_SLOTS[i];
    const cy = s.y + s.h / 2;
    const width = 4 + size * 3.6;
    const path = (c) => {
      c.beginPath();
      c.moveTo(112, cy - 16 + i * 3);
      c.bezierCurveTo(150, cy + 18, BX - 30, cy + 4, BX + 10, cy);
      c.bezierCurveTo(BX + 120, cy - 4, s.x - 140, cy + 10 + size, s.x - 40, cy);
      c.lineTo(s.x - 12, cy);
    };
    // Textilummantelung: dunkler Grund, helle Flechtmuster-Striche
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = width + 4;
    ctx.save();
    ctx.translate(3, 4);
    path(ctx);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = CABLE_COLORS[i];
    ctx.lineWidth = width;
    path(ctx);
    ctx.stroke();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(255, 235, 200, 0.22)';
    ctx.lineWidth = width * 0.7;
    path(ctx);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 240, 220, 0.25)';
    ctx.lineWidth = Math.max(1, width * 0.18);
    ctx.save();
    ctx.translate(0, -width * 0.25);
    path(ctx);
    ctx.stroke();
    ctx.restore();
    // abisoliertes Ende: Kupferdraht in die Klemme
    ctx.strokeStyle = '#d8884a';
    ctx.lineWidth = Math.max(2, width * 0.45);
    line(ctx, s.x - 14, cy, s.x - 2, cy);
    // Kabelschild (Messing) mit Querschnitt – zwei sind abgegriffen
    const worn = size === 2.5 || size === 4;
    const tx = s.x - 128, ty = cy + width / 2 + 4;
    ctx.strokeStyle = '#9a8a6a';
    ctx.lineWidth = 1;
    line(ctx, tx + 34, cy, tx + 34, ty);
    const tag = ctx.createLinearGradient(tx, ty, tx, ty + 20);
    tag.addColorStop(0, worn ? '#9a8e72' : '#e8cf8a');
    tag.addColorStop(1, worn ? '#6e644e' : '#a07a30');
    ctx.fillStyle = tag;
    rrect(ctx, tx, ty, 70, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#2a1a0a';
    ctx.beginPath();
    ctx.arc(tx + 34, ty + 3.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, worn ? '?? mm²' : `${String(size).replace('.', ',')} mm²`, tx + 35, ty + 16, { font: `bold 12px ${TYPEWRITER}`, color: worn ? 'rgba(40, 30, 20, 0.35)' : '#2a1a0a', align: 'center' });
    if (worn) {
      ctx.strokeStyle = 'rgba(230, 220, 190, 0.35)';
      for (let k = 0; k < 6; k++) line(ctx, tx + 6 + k * 10, ty + 4 + (k % 3) * 4, tx + 14 + k * 10, ty + 8 + (k % 2) * 6);
    }

    // Porzellan-Fassung: weißer Sockel mit zwei Messing-Federklemmen
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    const porcelain = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
    porcelain.addColorStop(0, '#fbf8ee');
    porcelain.addColorStop(0.55, '#e4dfcf');
    porcelain.addColorStop(1, '#b9b3a0');
    ctx.fillStyle = porcelain;
    rrect(ctx, s.x - 14, s.y - 2, s.w + 28, s.h + 4, 12);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    rrect(ctx, s.x - 8, s.y + 1, s.w + 16, 5, 3);
    ctx.fill();
    // Mulde für die Sicherung
    ctx.fillStyle = 'rgba(120, 110, 90, 0.35)';
    rrect(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 20, 8);
    ctx.fill();
    for (const side of [-1, 1]) {
      const kx = side < 0 ? s.x + 4 : s.x + s.w - 4;
      const clip = ctx.createLinearGradient(kx - 10, 0, kx + 10, 0);
      clip.addColorStop(0, '#8a6420');
      clip.addColorStop(0.5, '#f4d68a');
      clip.addColorStop(1, '#8a6420');
      ctx.fillStyle = clip;
      rrect(ctx, kx - 9, s.y + 8, 18, s.h - 16, 4);
      ctx.fill();
      screw(ctx, kx, s.y + 14, 4.5, 0.4 + i);
      screw(ctx, kx, s.y + s.h - 14, 4.5, 1.2 + i);
    }
    // Brücke zur Sammelschiene
    ctx.strokeStyle = '#c87a40';
    ctx.lineWidth = 4;
    line(ctx, s.x + s.w + 8, cy, busX - 8, cy);
    screw(ctx, busX, cy, 5, i);
    // Gravierte Nummer im Porzellan
    text(ctx, `${i + 1}`, s.x - 6, s.y + s.h - 4, { font: `bold 11px ${PRINT}`, color: 'rgba(60, 50, 40, 0.6)' });
  });
  // Gummitüllen, durch die die Kabel ins Gehäuse kommen
  CABLES.forEach((size, i) => {
    const cy = FUSE_SLOTS[i].y + FUSE_SLOTS[i].h / 2;
    const r = (4 + size * 3.6) / 2 + 6;
    ctx.fillStyle = '#141414';
    ctx.beginPath();
    ctx.ellipse(BX + 13, cy, 9, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(BX + 13, cy, 9, r, 0, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();
  });

  // Warnschild auf dem Rahmen
  const sx = 520, sy = BY + 4;
  ctx.fillStyle = '#e6c23a';
  ctx.beginPath();
  ctx.moveTo(sx, sy - 2);
  ctx.lineTo(sx + 18, sy + 20);
  ctx.lineTo(sx - 18, sy + 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(sx + 2, sy + 4);
  ctx.lineTo(sx - 5, sy + 12);
  ctx.lineTo(sx, sy + 12);
  ctx.lineTo(sx - 3, sy + 19);
  ctx.lineTo(sx + 5, sy + 10);
  ctx.lineTo(sx, sy + 10);
  ctx.closePath();
  ctx.fill();
  const plateX = 560;
  ctx.fillStyle = '#d9d2bc';
  rrect(ctx, plateX, BY + 5, 200, 18, 3);
  ctx.fill();
  text(ctx, 'VORSICHT – 220 V', plateX + 100, BY + 18, { font: `bold 12px ${PRINT}`, color: '#b3261e', align: 'center' });
  screw(ctx, plateX + 7, BY + 14, 2.5);
  screw(ctx, plateX + 193, BY + 14, 2.5);
  // Scharniere links
  for (const hy of [BY + 120, BY + BH - 140]) {
    const hinge = ctx.createLinearGradient(BX + BW - 4, 0, BX + BW + 12, 0);
    hinge.addColorStop(0, '#2a2e28');
    hinge.addColorStop(0.5, '#9aa094');
    hinge.addColorStop(1, '#3a4036');
    ctx.fillStyle = hinge;
    rrect(ctx, BX + BW - 4, hy, 16, 60, 5);
    ctx.fill();
  }

  // Werkbank rechts mit einer Blechschale für die losen Sicherungen
  wood(ctx, 868, 140, 288, 520, [86, 54, 28]);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(868, 140, 6, 520);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;
  const tray = ctx.createLinearGradient(886, 150, 1140, 560);
  tray.addColorStop(0, '#a8aca2');
  tray.addColorStop(1, '#5c6058');
  ctx.fillStyle = tray;
  rrect(ctx, 886, 150, 254, 410, 16);
  ctx.fill();
  ctx.restore();
  const trayIn = ctx.createLinearGradient(0, 166, 0, 546);
  trayIn.addColorStop(0, '#4a4e46');
  trayIn.addColorStop(1, '#6e7268');
  ctx.fillStyle = trayIn;
  rrect(ctx, 900, 164, 226, 382, 10);
  ctx.fill();
  grain(ctx, 900, 164, 226, 382, { seed: 36, count: 500, alpha: 0.2 });
  text(ctx, 'Lose Sicherungen', 1013, 184, { font: `15px ${HAND}`, color: '#efe2c0', align: 'center' });
  // Zettel am Gehäuse
  sheet(ctx, 952, 566, 158, 104, {
    angle: 0.05,
    inner: (c) => {
      text(c, '1 mm² → 6 A', 79, 30, { font: `16px ${HAND}`, align: 'center' });
      text(c, '1,5 mm² → 10 A', 79, 54, { font: `16px ${HAND}`, align: 'center' });
      text(c, '(Rest abgerissen)', 79, 86, { font: `italic 14px ${HAND}`, color: '#7a5a3a', align: 'center' });
      c.fillStyle = 'rgba(20, 12, 6, 0.9)';
      c.beginPath();
      c.moveTo(0, 104);
      for (let x = 0; x <= 158; x += 14) c.lineTo(x, 98 + (x / 14 % 2) * 6);
      c.lineTo(158, 110);
      c.lineTo(0, 110);
      c.fill();
    },
  });
}

// Eine Schmelzsicherung: Porzellankörper, Messingkappen, farbiger Kennmelder
export function drawFuse(ctx, token, x, y) {
  const fuse = FUSES.find((f) => f.id === token.id);
  const image = cachedLayer(`w10-fuse-${fuse.amp}`, (c) => paintFuse(c, fuse), 180, 64);
  ctx.drawImage(image, x - 90, y - 32, 180, 64);
}

function paintFuse(ctx, fuse) {
  ctx.translate(90, 30);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 5;
  // Messingkappen
  for (const side of [-1, 1]) {
    const cx = side * 70;
    const cap = ctx.createLinearGradient(0, -20, 0, 20);
    cap.addColorStop(0, '#fbe6a6');
    cap.addColorStop(0.45, '#c89a3c');
    cap.addColorStop(1, '#6e4e14');
    ctx.fillStyle = cap;
    rrect(ctx, cx - 14, -20, 28, 40, 6);
    ctx.fill();
  }
  // Porzellan
  const body = ctx.createLinearGradient(0, -22, 0, 22);
  body.addColorStop(0, '#fffdf6');
  body.addColorStop(0.4, '#ece6d4');
  body.addColorStop(1, '#a9a28e');
  ctx.fillStyle = body;
  rrect(ctx, -58, -22, 116, 44, 10);
  ctx.fill();
  ctx.restore();
  // Rillen der Kappen
  ctx.strokeStyle = 'rgba(80, 56, 16, 0.6)';
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) for (let k = -8; k <= 8; k += 4) line(ctx, side * 70 + k, -18, side * 70 + k, 18);
  // Kennmelder: farbiges Plättchen an der rechten Seite
  const color = FUSE_COLORS[fuse.amp];
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(42, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(42, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(40, -2.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  // Aufdruck
  text(ctx, `${fuse.amp} A`, -12, 7, { font: `bold 21px ${PRINT}`, color: INK, align: 'center' });
  text(ctx, '500 V ~', -12, 18, { font: `8px ${PRINT}`, color: 'rgba(43, 33, 24, 0.7)', align: 'center' });
  // Glanz
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  rrect(ctx, -50, -18, 100, 5, 3);
  ctx.fill();
}

// ---------------------------------------------------------------- Tonbandregal
// Ein Schrank mit zwei Böden. In jeder Schachtel liegt eine Tonbandspule, bei vielen schaut sie oben
// heraus. „110“ ist eine leere Spule ohne Schachtel.
export const TAPES = [1, 12, 27, 50, 64, 81, 99, 104, 105, 106, 107, 108, 110, 103];
const BOX_W = 112, BOX_H = 136, SHELF_TOP = [304, 546];
export function tapeSpots() {
  return TAPES.map((round, i) => ({
    id: `tape${round}`, round,
    x: 212 + (i % 7) * 124, y: SHELF_TOP[Math.floor(i / 7)] - BOX_H - 26, w: BOX_W, h: BOX_H + 26,
    label: `Tonband „${round}“`,
  }));
}

export function drawTapeShelf(ctx, taken) {
  ctx.drawImage(cachedLayer(`w10-shelf-${taken ? 1 : 0}`, (c) => paintTapeShelf(c, taken)), 0, 0, 1280, 720);
}

const BOX_STYLES = [
  { body: '#e8dcc0', band: '#b3261e', print: '#2b2118' },
  { body: '#2f4a6a', band: '#e6c25a', print: '#f1e5c6' },
  { body: '#c27a2c', band: '#3a2410', print: '#fbeed0' },
  { body: '#5e6e4a', band: '#e8dcc0', print: '#f4ecd4' },
  { body: '#8a2a22', band: '#f1e5c6', print: '#f6ead2' },
];

function paintTapeShelf(ctx, taken) {
  const X = 176, Y = 116, W = 928, H = 530;
  // Schrank: Korpus mit Kranz und Sockel
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#5a3418';
  ctx.fillRect(X, Y, W, H);
  ctx.restore();
  wood(ctx, X, Y, W, H, [112, 68, 32]);
  // Rückwand, dunkel und im Schatten
  const back = ctx.createLinearGradient(0, Y + 30, 0, Y + H - 60);
  back.addColorStop(0, '#2a170a');
  back.addColorStop(1, '#3a2210');
  ctx.fillStyle = back;
  ctx.fillRect(X + 22, Y + 34, W - 44, H - 100);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  for (let bx = X + 22 + 74; bx < X + W - 22; bx += 74) line(ctx, bx, Y + 34, bx, Y + H - 66);
  // Kranz oben
  const crown = ctx.createLinearGradient(0, Y - 14, 0, Y + 34);
  crown.addColorStop(0, '#9a6232');
  crown.addColorStop(0.4, '#6e4220');
  crown.addColorStop(1, '#3e220e');
  ctx.fillStyle = crown;
  ctx.fillRect(X - 14, Y - 14, W + 28, 48);
  ctx.fillStyle = 'rgba(255, 220, 170, 0.25)';
  ctx.fillRect(X - 14, Y - 14, W + 28, 3);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(X - 14, Y + 26, W + 28, 8);
  // Seitenwangen
  for (const sx of [X, X + W - 22]) {
    const side = ctx.createLinearGradient(sx, 0, sx + 22, 0);
    side.addColorStop(0, '#7a4a22');
    side.addColorStop(1, '#4c2c12');
    ctx.fillStyle = side;
    ctx.fillRect(sx, Y + 34, 22, H - 34);
  }
  // Licht von oben links
  glow(ctx, 420, 160, 520, '255, 205, 140', 0.16);

  const spots = tapeSpots();
  SHELF_TOP.forEach((top, row) => {
    // Schatten der Schachteln auf der Rückwand
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(X + 22, top - 8, W - 44, 8);
    spots.filter((_, i) => Math.floor(i / 7) === row).forEach((spot) => {
      if (taken && spot.round === 108) return paintDustGap(ctx, spot);
      if (spot.round === 110) return paintEmptyReel(ctx, spot);
      paintTapeBox(ctx, spot);
    });
    // Regalboden mit Vorderkante und Messing-Schildhalter
    const board = ctx.createLinearGradient(0, top, 0, top + 26);
    board.addColorStop(0, '#a2683a');
    board.addColorStop(0.3, '#7a4822');
    board.addColorStop(1, '#4a2a10');
    ctx.fillStyle = board;
    ctx.fillRect(X + 10, top, W - 20, 26);
    ctx.fillStyle = 'rgba(255, 225, 180, 0.35)';
    ctx.fillRect(X + 10, top, W - 20, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(X + 10, top + 26, W - 20, 6);
    const lx = 640 - 70, ly = top + 4;
    const brass = ctx.createLinearGradient(0, ly, 0, ly + 18);
    brass.addColorStop(0, '#f0d58a');
    brass.addColorStop(1, '#8a6420');
    ctx.fillStyle = brass;
    rrect(ctx, lx, ly, 140, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(lx + 6, ly + 3, 128, 12);
    text(ctx, row ? 'Runden 100 –' : 'Runden 1 – 99', 640, ly + 13, { font: `bold 10px ${TYPEWRITER}`, align: 'center' });
    screw(ctx, lx + 3, ly + 9, 2.2);
    screw(ctx, lx + 137, ly + 9, 2.2);
  });
  // Sockel
  const plinth = ctx.createLinearGradient(0, Y + H - 58, 0, Y + H);
  plinth.addColorStop(0, '#6a3e1c');
  plinth.addColorStop(1, '#2e1808');
  ctx.fillStyle = plinth;
  ctx.fillRect(X - 6, SHELF_TOP[1] + 32, W + 12, Y + H - SHELF_TOP[1] - 32);
  // Zettel am Sockel
  sheet(ctx, 520, SHELF_TOP[1] + 44, 240, 38, {
    angle: -0.01,
    inner: (c) => text(c, 'Archiv – Bänder nicht vertauschen!', 120, 25, { font: `15px ${HAND}`, color: INK, align: 'center' }),
  });
  grain(ctx, X - 14, Y - 14, W + 28, H + 14, { seed: 10, count: 1800, alpha: 0.1 });
  text(ctx, 'Für jede Runde ein Band. Manche Nummern fehlen.', 640, 676, { font: `16px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Spule von vorn: Flansch mit drei Fenstern, dahinter das braune Band
function paintReel(ctx, cx, cy, r, { tape = 0.78, flange = 'rgba(70, 80, 90, 0.9)', spin = 0 } = {}) {
  // Band
  if (tape > 0) {
    const t = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r * tape);
    t.addColorStop(0, '#2a1608');
    t.addColorStop(0.7, '#5a3418');
    t.addColorStop(1, '#3a200c');
    ctx.fillStyle = t;
    ctx.beginPath();
    ctx.arc(cx, cy, r * tape, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 200, 140, 0.12)';
    ctx.lineWidth = 1;
    for (let k = 0.32; k < tape; k += 0.07) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * k, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Flansch mit drei Fenstern
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  for (let k = 0; k < 3; k++) {
    const a = spin + (k * Math.PI * 2) / 3;
    ctx.moveTo(cx + Math.cos(a - 0.5) * r * 0.36, cy + Math.sin(a - 0.5) * r * 0.36);
    ctx.arc(cx, cy, r * 0.84, a - 0.55, a + 0.55);
    ctx.arc(cx, cy, r * 0.36, a + 0.5, a - 0.5, true);
    ctx.closePath();
  }
  ctx.fillStyle = flange;
  ctx.fill('evenodd');
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, Math.PI * 1.1, Math.PI * 1.7);
  ctx.stroke();
  // Nabe
  ctx.fillStyle = '#d8d4c8';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function paintTapeBox(ctx, spot) {
  const random = seeded(spot.round * 13 + 5);
  const style = BOX_STYLES[(spot.round * 7) % BOX_STYLES.length];
  const x = spot.x, bottom = spot.y + spot.h, top = bottom - BOX_H;
  const tilt = (random() - 0.5) * 0.05;
  const open = random() < 0.6;
  ctx.save();
  ctx.translate(x + BOX_W / 2, bottom);
  ctx.rotate(tilt);
  ctx.translate(-BOX_W / 2, -BOX_H);
  // Schatten auf der Rückwand
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(6, -6, BOX_W, BOX_H + 6);
  // Spule, die oben aus der Schachtel schaut
  if (open) paintReel(ctx, BOX_W / 2, 12, 46, { spin: random() * 2, flange: random() < 0.5 ? 'rgba(60, 64, 70, 0.95)' : 'rgba(170, 60, 40, 0.92)' });
  // Oberkante der Schachtel (Tiefe)
  ctx.fillStyle = shadeHex(style.body, -40);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(8, -8);
  ctx.lineTo(BOX_W + 8, -8);
  ctx.lineTo(BOX_W, 0);
  ctx.closePath();
  if (!open) ctx.fill();
  // Seitenfläche rechts
  ctx.fillStyle = shadeHex(style.body, -60);
  ctx.beginPath();
  ctx.moveTo(BOX_W, 0);
  ctx.lineTo(BOX_W + 8, -8);
  ctx.lineTo(BOX_W + 8, BOX_H - 8);
  ctx.lineTo(BOX_W, BOX_H);
  ctx.closePath();
  ctx.fill();
  // Vorderseite
  const front = ctx.createLinearGradient(0, 0, BOX_W, BOX_H);
  front.addColorStop(0, shadeHex(style.body, 22));
  front.addColorStop(1, shadeHex(style.body, -22));
  ctx.fillStyle = front;
  ctx.fillRect(0, 0, BOX_W, BOX_H);
  // aufgedruckt: schräges Band, Spulen-Zeichen, Schrift
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, BOX_W, BOX_H);
  ctx.clip();
  ctx.fillStyle = style.band;
  ctx.beginPath();
  ctx.moveTo(0, BOX_H - 34);
  ctx.lineTo(BOX_W, BOX_H - 62);
  ctx.lineTo(BOX_W, BOX_H - 44);
  ctx.lineTo(0, BOX_H - 16);
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = style.print;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(BOX_W - 22, BOX_H - 22, 13, 0, Math.PI * 2);
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3 + 0.3;
    ctx.beginPath();
    ctx.arc(BOX_W - 22 + Math.cos(a) * 7, BOX_H - 22 + Math.sin(a) * 7, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  text(ctx, 'TONBAND', 10, BOX_H - 8, { font: `bold 11px ${PRINT}`, color: style.print });
  text(ctx, '18 cm · 360 m', 10, 16, { font: `9px ${PRINT}`, color: style.print });
  // Abgestoßene Ecken
  ctx.fillStyle = 'rgba(240, 225, 190, 0.35)';
  ctx.fillRect(0, 0, 3, 3 + random() * 8);
  ctx.fillRect(BOX_W - 3 - random() * 6, BOX_H - 3, 9, 3);
  grain(ctx, 0, 0, BOX_W, BOX_H, { seed: spot.round, count: 90, alpha: 0.14 });
  ctx.restore();
  ctx.strokeStyle = 'rgba(30, 18, 8, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, BOX_W, BOX_H);
  // Papieretikett mit der Rundennummer
  ctx.save();
  ctx.translate(BOX_W / 2, 58);
  ctx.rotate((random() - 0.5) * 0.08);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = '#f6eed8';
  ctx.fillRect(-42, -26, 84, 50);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(179, 38, 30, 0.5)';
  ctx.lineWidth = 1;
  line(ctx, -42, -12, 42, -12);
  text(ctx, 'Runde', 0, -15, { font: `10px ${TYPEWRITER}`, color: '#5a4a38', align: 'center' });
  text(ctx, String(spot.round), 0, 16, { font: `bold 26px ${TYPEWRITER}`, color: INK, align: 'center' });
  ctx.restore();
  ctx.restore();
}

// Leere Spule ohne Schachtel, an die Wand gelehnt
function paintEmptyReel(ctx, spot) {
  const cx = spot.x + BOX_W / 2, r = 54, cy = spot.y + spot.h - r;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + 4, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
  paintReel(ctx, cx, cy, r, { tape: 0.24, flange: 'rgba(150, 175, 190, 0.78)', spin: 0.4 });
  ctx.save();
  ctx.translate(cx, cy + 30);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#e8dcb4';
  ctx.fillRect(-26, -10, 52, 20);
  text(ctx, '110', 0, 6, { font: `bold 15px ${TYPEWRITER}`, color: INK, align: 'center' });
  ctx.restore();
}

// Wo das Band 108 stand: ein sauberer Fleck im Staub
function paintDustGap(ctx, spot) {
  const bottom = spot.y + spot.h;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(spot.x, bottom - BOX_H, BOX_W, BOX_H);
  ctx.fillStyle = 'rgba(200, 180, 150, 0.18)';
  ctx.fillRect(spot.x - 6, bottom - 3, BOX_W + 12, 3);
  ctx.fillStyle = 'rgba(160, 100, 50, 0.35)';
  ctx.fillRect(spot.x, bottom - 3, BOX_W, 3);
}

function shadeHex(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amount));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

// ---------------------------------------------------------------- Tonbandgerät
export const SPEEDS = ['4¾', '9½', '19'];
// Knöpfe und Spulen im Bild tonband.webp
const RECORDER = 'assets/closeups/tonband.webp';
const REELS = [[406, 207], [869, 207]];
export const RECORDER_SPOTS = [
  { id: 'speed', cx: 448, cy: 574, r: 66, label: 'Geschwindigkeit' },
  { id: 'direction', cx: 643, cy: 574, r: 66, label: 'Richtung' },
  { id: 'play', cx: 834, cy: 570, r: 62, label: 'Abspielen' },
];

export function drawRecorder(ctx, state, time) {
  drawPicture(ctx, RECORDER, 0, 0, 1280, 720);
  const image = picture(RECORDER);
  // Spulen drehen sich beim Abspielen
  if (state.playing && image.complete && image.naturalWidth) {
    const k = image.naturalWidth / 1280, rr = 176;
    const turn = time * (state.direction === 'back' ? -4 : 4) * (1 + state.speed);
    for (const [cx, cy] of REELS) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(cx, cy);
      ctx.rotate(turn);
      ctx.drawImage(image, (cx - rr) * k, (cy - rr) * k, rr * 2 * k, rr * 2 * k, -rr, -rr, rr * 2, rr * 2);
      ctx.restore();
    }
  }
  dial(ctx, 448, 574, SPEEDS, state.speed, 'cm/s');
  dial(ctx, 643, 574, ['vor', 'zurück'], state.direction === 'back' ? 1 : 0, 'Richtung');
  if (state.playing) glow(ctx, 834, 570, 90, '255, 120, 90', 0.45);
  text(ctx, state.playing ? 'läuft' : 'Start', 834, 669, { font: `bold 15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
  if (state.loaded) {
    ctx.fillStyle = '#f1e5c6';
    ctx.fillRect(585, 400, 100, 34);
    text(ctx, 'Band 108', 635, 424, { font: `bold 17px ${TYPEWRITER}`, align: 'center' });
  }
  if (state.power) glow(ctx, 1020, 80, 30, '120, 255, 140', 0.7);
}

// Zeiger auf einem Knopf des Bilds, Beschriftung im Bogen darüber
function dial(ctx, cx, cy, labels, index, title) {
  const n = labels.length;
  labels.forEach((label, i) => {
    const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.7;
    const lx = cx + Math.cos(a) * 92, ly = cy + Math.sin(a) * 92 + 6;
    ctx.fillStyle = 'rgba(30, 18, 8, 0.7)';
    ctx.fillRect(lx - 26, ly - 17, 52, 22);
    text(ctx, label, lx, ly, { font: `bold 16px ${PRINT}`, color: i === index ? '#ffe9a6' : '#a8987a', align: 'center' });
  });
  const a = -Math.PI / 2 + (index - (n - 1) / 2) * 0.7;
  ctx.strokeStyle = '#f4e3b8';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  line(ctx, cx, cy, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46);
  ctx.lineCap = 'butt';
  text(ctx, title, cx, cy + 95, { font: `bold 15px ${PRINT}`, color: '#e9d8b0', align: 'center' });
}

// Lämpchen im Wagen, sobald Strom da ist
export function drawPower(ctx, on, time) {
  if (!on) return;
  glow(ctx, 846, 204, 60, '120, 255, 150', 0.25 + 0.05 * Math.sin(time * 5));
  glow(ctx, 1000, 300, 30, '255, 200, 90', 0.4);
}
