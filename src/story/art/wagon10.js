import { PRINT, RED, SERIF, TYPEWRITER, glow, line, sheet, text } from './common.js';

// Gezeichnetes für Wagen 10 (Lautsprecherwagen): Sicherungskasten, Tonbänder, Tonbandgerät.

// ---------------------------------------------------------------- Sicherungen
// Fünf Fassungen, an jeder ein Kabel. Dicker Draht → stärkere Sicherung.
export const CABLES = [10, 4, 16, 2, 7]; // Dicke in Pixeln (von oben nach unten)
export const FUSES = [
  { id: 'f2', amp: 2, thick: 2 },
  { id: 'f6', amp: 6, thick: 4 },
  { id: 'f10', amp: 10, thick: 7 },
  { id: 'f16', amp: 16, thick: 10 },
  { id: 'f25', amp: 25, thick: 16 },
];
export const FUSE_SLOTS = CABLES.map((thick, i) => ({ x: 520, y: 110 + i * 96, w: 200, h: 70, thick }));

export function fuseTokens() {
  const order = ['f16', 'f2', 'f25', 'f6', 'f10'];
  return order.map((id, i) => {
    const fuse = FUSES.find((f) => f.id === id);
    return { id, w: 180, h: 60, label: `Sicherung ${fuse.amp} A`, fuse, home: { x: 980, y: 150 + i * 96 } };
  });
}

export function checkFuses(placement) {
  return placement.every((id, i) => FUSES.find((f) => f.id === id).thick === CABLES[i]);
}

export function drawFuseBox(ctx) {
  ctx.fillStyle = '#3d3a33';
  ctx.fillRect(330, 70, 520, 540);
  ctx.strokeStyle = '#1c1a16';
  ctx.lineWidth = 6;
  ctx.strokeRect(330, 70, 520, 540);
  FUSE_SLOTS.forEach((slot) => {
    // Kabel von links
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = slot.thick + 4;
    line(ctx, 330, slot.y + slot.h / 2, slot.x, slot.y + slot.h / 2);
    ctx.strokeStyle = '#b5652b';
    ctx.lineWidth = slot.thick;
    line(ctx, 330, slot.y + slot.h / 2, slot.x, slot.y + slot.h / 2);
    ctx.fillStyle = '#d8d0bc';
    ctx.fillRect(slot.x - 10, slot.y + 10, 20, slot.h - 20);
    ctx.fillRect(slot.x + slot.w - 10, slot.y + 10, 20, slot.h - 20);
  });
  // Deckel innen
  sheet(ctx, 70, 120, 230, 300, {
    color: '#d8cfb8',
    inner: (c) => {
      text(c, 'ACHTUNG', 115, 40, { font: `bold 24px ${PRINT}`, color: RED, align: 'center' });
      ['Dünner Draht –', 'schwache Sicherung.', '', 'Dicker Draht –', 'starke Sicherung.', '', 'Falsch eingesetzt:', 'Kurzschluss!'].forEach((value, i) => text(c, value, 115, 84 + i * 26, { font: `18px ${PRINT}`, align: 'center' }));
    },
  });
  text(ctx, 'Ersatzsicherungen', 980, 100, { font: `bold 18px ${PRINT}`, color: '#e8d8b0', align: 'center' });
}

export function drawFuse(ctx, token, x, y) {
  const { fuse } = token;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#efe9da';
  ctx.fillRect(-70, -24, 140, 48);
  ctx.fillStyle = '#b8b2a2';
  ctx.fillRect(-90, -18, 22, 36);
  ctx.fillRect(68, -18, 22, 36);
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(-70, -24, 140, 48);
  text(ctx, `${fuse.amp} A`, 0, 10, { font: `bold 26px ${PRINT}`, align: 'center' });
  ctx.restore();
}

// ---------------------------------------------------------------- Tonbänder im Regal
export const REELS = [104, 105, 106, 107, 108, 109, 110, 111, 112];
export function reelSpots() {
  return REELS.map((round, i) => ({ id: `reel${round}`, round, x: 200 + (i % 5) * 180, y: i < 5 ? 150 : 380, w: 150, h: 180, label: `Tonband „Runde ${round}“` }));
}

export function drawReelShelf(ctx) {
  ctx.fillStyle = '#4a3a26';
  ctx.fillRect(170, 110, 940, 500);
  ctx.fillStyle = '#2e2216';
  ctx.fillRect(170, 334, 940, 16);
  ctx.fillRect(170, 566, 940, 16);
  for (const spot of reelSpots()) {
    drawReel(ctx, spot.x + 75, spot.y + 80, 60);
    ctx.fillStyle = '#efe3c2';
    ctx.fillRect(spot.x + 25, spot.y + 150, 100, 26);
    text(ctx, `Runde ${spot.round}`, spot.x + 75, spot.y + 169, { font: `bold 15px ${TYPEWRITER}`, align: 'center' });
  }
  text(ctx, 'Alle Durchsagen · ein Band pro Runde · Bandgeschwindigkeit 9,5 cm/s', 640, 140, { font: `italic 16px ${SERIF}`, color: '#e8d8b0', align: 'center' });
}

function drawReel(ctx, cx, cy, r, angle = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#5a4630';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c8c4bc';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.fillStyle = '#5a4630';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.cos(i * 2.094) * r * 0.52, Math.sin(i * 2.094) * r * 0.52, r * 0.24, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Tonbandgerät
export const SPEEDS = ['4,75', '9,5', '19', '38'];
export const TAPE_SPOTS = [
  { id: 'speed', cx: 470, cy: 520, r: 56, label: 'Geschwindigkeit (cm/s)' },
  { id: 'direction', x: 610, y: 480, w: 120, h: 90, label: 'Laufrichtung' },
  { id: 'play', x: 790, y: 480, w: 130, h: 90, label: 'Abspielen' },
];

export function drawTapeDeck(ctx, { speed, reverse, loaded, playing, time, caption }) {
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(300, 120, 680, 500);
  ctx.fillStyle = '#2a2420';
  ctx.fillRect(320, 140, 640, 290);
  const spin = playing ? time * (reverse ? -4 : 4) * (speed + 1) : 0;
  if (loaded) {
    drawReel(ctx, 470, 280, 110, spin);
    drawReel(ctx, 810, 280, 110, spin);
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 3;
    line(ctx, 470, 390, 810, 390);
  } else {
    text(ctx, '– kein Band eingelegt –', 640, 290, { font: `italic 22px ${SERIF}`, color: '#a89878', align: 'center' });
  }
  // Drehknopf Geschwindigkeit
  ctx.fillStyle = '#1e1a16';
  ctx.beginPath();
  ctx.arc(470, 520, 48, 0, Math.PI * 2);
  ctx.fill();
  SPEEDS.forEach((value, i) => {
    const a = -Math.PI * 0.8 + i * (Math.PI * 1.6 / 3);
    text(ctx, value, 470 + Math.cos(a - Math.PI / 2) * 76, 528 + Math.sin(a - Math.PI / 2) * 76, { font: `bold 15px ${PRINT}`, color: '#efe3c2', align: 'center' });
    if (i === speed) {
      ctx.strokeStyle = '#ffd36b';
      ctx.lineWidth = 6;
      line(ctx, 470, 520, 470 + Math.cos(a - Math.PI / 2) * 40, 520 + Math.sin(a - Math.PI / 2) * 40);
    }
  });
  // Schalter Laufrichtung
  ctx.fillStyle = '#2a2420';
  ctx.fillRect(610, 480, 120, 90);
  text(ctx, reverse ? '◀◀ RÜCK' : 'VOR ▶▶', 670, 532, { font: `bold 20px ${PRINT}`, color: reverse ? '#ff9b7a' : '#a6f0b6', align: 'center' });
  // Abspielen
  ctx.fillStyle = playing ? '#3d7a3a' : '#2a2420';
  ctx.fillRect(790, 480, 130, 90);
  text(ctx, playing ? 'läuft …' : '▶ SPIELEN', 855, 532, { font: `bold 20px ${PRINT}`, color: '#efe3c2', align: 'center' });
  text(ctx, 'cm/s', 470, 610, { font: `14px ${PRINT}`, color: '#efe3c2', align: 'center' });
  if (caption) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(160, 640, 960, 44);
    text(ctx, caption, 640, 670, { font: `bold 22px ${TYPEWRITER}`, color: '#a6f0b6', align: 'center' });
  }
  if (playing) glow(ctx, 640, 280, 300, '255, 220, 150', 0.08);
}

// Was aus dem Lautsprecher kommt – je nach Geschwindigkeit und Richtung
export const CALL = 'Fahrgast K., bitte zum Tunnel …';
export const SECRET = '… wie die anderen. Elf ist der Nächste.';

export function tapeCaption(speed, reverse) {
  const forward = `${CALL}  ${[...SECRET].reverse().join('')}`;
  if (reverse) {
    const back = `${[...CALL].reverse().join('')}  ${SECRET}`;
    if (speed === 1) return back;
    return speed === 0 ? stretch(back) : squeeze(back);
  }
  if (speed === 1) return forward;
  return speed === 0 ? stretch(forward) : squeeze(forward);
}

function stretch(value) {
  return value.slice(0, 22).replace(/([aeiouäöü])/gi, '$1$1$1').toLowerCase() + ' …';
}

function squeeze(value) {
  return value.replace(/[aeiouäöü ,.…]/gi, '').slice(0, 30).toLowerCase() + '!';
}
