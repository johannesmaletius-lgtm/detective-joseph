import {
  BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, cachedLayer, contactShadow, drawPicture, fineGrain, glow, grain, line, plank, roundedRect,
  rrect, screw, seeded, sheet, text, vignette, wood,
} from './common.js';

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
  ctx.drawImage(cached('w19-bench', 1280, 720, paintLabBench), 0, 0);
  // Rotlicht färbt alles, sonst nur eine schwache Glühbirne
  if (redLight) {
    ctx.fillStyle = 'rgba(120, 0, 0, 0.32)';
    ctx.fillRect(220, 60, 1020, 600);
    glow(ctx, 730, 40, 640, '255, 40, 30', 0.3);
  } else glow(ctx, 730, 40, 560, '255, 220, 150', 0.12);
  TRAY_SPOTS.forEach((s, i) => drawTray(ctx, s, i, BOTTLES.find((b) => b.id === trays[i])));
  BOTTLES.forEach((b, i) => {
    if (held === b.id || trays.includes(b.id)) return;
    const s = BOTTLE_SPOTS[i];
    drawBottle(ctx, s.x + 70, s.y + 232, b, 0);
  });
  if (held) {
    // die Flasche in der Hand schwebt leicht schräg über den Schalen
    const b = BOTTLES.find((x) => x.id === held);
    const i = BOTTLES.indexOf(b);
    drawBottle(ctx, BOTTLE_SPOTS[i].x + 70, BOTTLE_SPOTS[i].y + 200, b, -0.35);
  }
  developButton(ctx, DEVELOP_SPOT);
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

function paintLabBench(ctx) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(220, 60, 1020, 600);
  ctx.restore();
  // Wand: dunkle Kacheln
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 17; col++) {
      const x = 220 + col * 60, y = 60 + row * 52;
      const shade = 34 + ((row * 7 + col * 3) % 5) * 3;
      ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 6})`;
      ctx.fillRect(x + 2, y + 2, 56, 48);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(x + 4, y + 4, 52, 6);
    }
  }
  // Regalbrett für die Flaschen
  plank(ctx, 230, 388, 760, 22, { tone: [96, 62, 34], seed: 191 });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(230, 410, 760, 6);
  for (const bx of [270, 940]) {
    ctx.fillStyle = '#3a3026';
    ctx.beginPath();
    ctx.moveTo(bx, 410);
    ctx.lineTo(bx + 20, 410);
    ctx.lineTo(bx, 440);
    ctx.fill();
  }
  // Arbeitsplatte aus Holz
  plank(ctx, 220, 440, 1020, 220, { tone: [70, 46, 26], seed: 192, knots: 2 });
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(220, 440, 1020, 8);
  // Flecken von Chemikalien
  const r = seeded(193);
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `rgba(${r() < 0.5 ? '30, 20, 10' : '120, 110, 60'}, 0.18)`;
    ctx.beginPath();
    ctx.ellipse(260 + r() * 960, 590 + r() * 60, 10 + r() * 20, 4 + r() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Laborzeituhr in der Ecke
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.arc(1196, 618, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e0c8';
  ctx.beginPath();
  ctx.arc(1196, 618, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    line(ctx, 1196 + Math.cos(a) * 16, 618 + Math.sin(a) * 16, 1196 + Math.cos(a) * 20, 618 + Math.sin(a) * 20);
  }
  line(ctx, 1196, 618, 1196, 602);
  line(ctx, 1196, 618, 1208, 623);
  vignette(ctx, 220, 60, 1020, 600, 0.5);
}

// Apothekerflasche aus Glas: Flüssigkeit sichtbar, Korken, Papieretikett mit „?“
function drawBottle(ctx, cx, base, bottle, tilt) {
  ctx.save();
  ctx.translate(cx, base);
  ctx.rotate(tilt);
  if (!tilt) contactShadow(ctx, 8, 2, 62, 8, 0.6);
  const w = 92, h = 168;
  const glass = bottle.id === 'b2' ? [200, 220, 228] : bottle.id === 'b1' ? [90, 46, 14] : [190, 150, 70];
  const liquid = bottle.id === 'b2' ? 'rgba(215, 232, 238, 0.55)' : bottle.id === 'b1' ? 'rgba(70, 30, 8, 0.85)' : 'rgba(210, 170, 60, 0.75)';
  // Hals und Schulter
  ctx.beginPath();
  ctx.moveTo(-16, -h - 46);
  ctx.lineTo(16, -h - 46);
  ctx.lineTo(16, -h - 6);
  ctx.quadraticCurveTo(w / 2, -h + 4, w / 2, -h + 34);
  ctx.lineTo(w / 2, -10);
  ctx.quadraticCurveTo(w / 2, 0, w / 2 - 10, 0);
  ctx.lineTo(-w / 2 + 10, 0);
  ctx.quadraticCurveTo(-w / 2, 0, -w / 2, -10);
  ctx.lineTo(-w / 2, -h + 34);
  ctx.quadraticCurveTo(-w / 2, -h + 4, -16, -h - 6);
  ctx.closePath();
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, `rgba(${glass.map((c) => c * 0.55).join(',')}, 0.92)`);
  g.addColorStop(0.3, `rgba(${glass.join(',')}, 0.75)`);
  g.addColorStop(1, `rgba(${glass.map((c) => c * 0.45).join(',')}, 0.92)`);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = liquid;
  ctx.fillRect(-w / 2, -h * 0.72, w, h * 0.72);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(-w / 2, -h * 0.72, w, 3);
  ctx.restore();
  ctx.strokeStyle = 'rgba(20, 12, 6, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Glanzlichter
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  roundedRect(ctx, -w / 2 + 10, -h + 34, 8, h - 54, 4);
  ctx.fill();
  ctx.fillRect(-10, -h - 40, 4, 30);
  // Korken
  const cork = ctx.createLinearGradient(-14, 0, 14, 0);
  cork.addColorStop(0, '#8a6038');
  cork.addColorStop(0.5, '#c89a62');
  cork.addColorStop(1, '#7a5030');
  ctx.fillStyle = cork;
  roundedRect(ctx, -14, -h - 66, 28, 24, 4);
  ctx.fill();
  // Etikett, alt und fleckig
  ctx.fillStyle = '#ece2c4';
  ctx.fillRect(-32, -h * 0.55, 64, 50);
  ctx.strokeStyle = 'rgba(80, 60, 30, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-29, -h * 0.55 + 3, 58, 44);
  ctx.fillStyle = 'rgba(120, 90, 40, 0.25)';
  ctx.beginPath();
  ctx.arc(14, -h * 0.55 + 38, 9, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '?', 0, -h * 0.55 + 36, { font: `bold 28px ${SERIF}`, color: INK, align: 'center' });
  ctx.restore();
}

// Entwicklerschale in leichter Draufsicht; gefüllt mit der Flüssigkeit der Flasche
function drawTray(ctx, s, i, inside) {
  const x = s.x, y = s.y + 30, w = s.w, h = 74;
  const rim = ['#e8e2d4', '#9a9a9a', '#c0392b'][i];
  const deep = ['#b8b0a0', '#6a6a6a', '#8a2018'][i];
  contactShadow(ctx, x + w / 2 + 6, y + h + 4, w * 0.6, 12, 0.6);
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + w - 10, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = rim;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 10);
  ctx.lineTo(x + w - 22, y + 10);
  ctx.lineTo(x + w - 14, y + h - 12);
  ctx.lineTo(x + 14, y + h - 12);
  ctx.closePath();
  ctx.fillStyle = deep;
  ctx.fill();
  // Rillen am Boden
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 2;
  for (let k = 1; k < 4; k++) line(ctx, x + 24 + k * (w - 48) / 4, y + 14, x + 18 + k * (w - 36) / 4, y + h - 16);
  if (inside) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + 22, y + 10);
    ctx.lineTo(x + w - 22, y + 10);
    ctx.lineTo(x + w - 14, y + h - 12);
    ctx.lineTo(x + 14, y + h - 12);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = inside.id === 'b2' ? 'rgba(220, 236, 242, 0.55)' : inside.id === 'b1' ? 'rgba(80, 36, 10, 0.75)' : 'rgba(214, 176, 70, 0.7)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2 + (k - 1) * 30, y + h / 2, 22 + k * 6, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 10, y);
  ctx.lineTo(x + w - 10, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.stroke();
  // Nummer auf einem Klebestreifen
  ctx.fillStyle = '#e8dcb8';
  ctx.fillRect(x + w / 2 - 50, y + h + 14, 100, 26);
  text(ctx, `Schale ${i + 1}`, x + w / 2, y + h + 33, { font: `bold 17px ${HAND}`, color: INK, align: 'center' });
}

function developButton(ctx, spot) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  roundedRect(ctx, spot.x, spot.y, spot.w, spot.h, 12);
  const g = ctx.createLinearGradient(0, spot.y, 0, spot.y + spot.h);
  g.addColorStop(0, '#4a3420');
  g.addColorStop(1, '#22160a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#c49a46';
  ctx.lineWidth = 2;
  roundedRect(ctx, spot.x + 3, spot.y + 3, spot.w - 6, spot.h - 6, 10);
  ctx.stroke();
  // kleine Filmdose als Symbol
  const cx = spot.x + 34, cy = spot.y + 60;
  ctx.fillStyle = '#2a2a2a';
  roundedRect(ctx, cx - 16, cy - 22, 32, 44, 5);
  ctx.fill();
  ctx.fillStyle = '#c8a040';
  ctx.fillRect(cx - 16, cy - 8, 32, 16);
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(cx - 6, cy - 30, 12, 8);
  text(ctx, 'Film', spot.x + 100, spot.y + 54, { font: `bold 20px ${PRINT}`, color: '#f1e0b8', align: 'center' });
  text(ctx, 'entwickeln', spot.x + 100, spot.y + 80, { font: `bold 17px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

// ---------------------------------------------------------------- Kontaktbogen
// Sechs Negative auf dem Leuchttisch. Je weiter der Zug im Tunnel ist, desto mehr Lampen sind schon
// vorbeigezogen. Oben liegt ein leerer Filmstreifen-Halter mit sechs Bildfenstern.
export const NEGATIVES = [3, 0, 5, 1, 4, 2]; // Anzahl der Lampen (so liegen sie anfangs)
const NEG_W = 150, NEG_H = 112;
export const NEG_SLOTS = Array.from({ length: 6 }, (_, i) => ({ x: 137 + i * 170, y: 152, w: 156, h: 116, label: '' }));
export function negativeTokens() {
  return NEGATIVES.map((lamps, i) => ({
    id: `n${lamps}`, lamps, w: NEG_W, h: NEG_H, label: 'Negativ',
    home: { x: 222 + i * 167, y: 462 + (i % 2 ? 26 : -10) },
  }));
}
export function checkNegatives(placement) {
  return placement.every((id, i) => id === `n${i}`);
}

const TABLE = { x: 108, y: 72, w: 1064, h: 590 };
const GLASS = { x: 136, y: 98, w: 1008, h: 538 };
const STRIP = { x: 120, y: 122, w: 1040, h: 186 };

export function drawContactSheet(ctx) {
  ctx.drawImage(cachedLayer('w19-lighttable', paintLightTable), 0, 0, 1280, 720);
}

function paintLightTable(ctx) {
  // Gehäuse: grau-grün lackiertes Blech
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  const body = ctx.createLinearGradient(0, TABLE.y, 0, TABLE.y + TABLE.h);
  body.addColorStop(0, '#5d6358');
  body.addColorStop(1, '#2f332c');
  ctx.fillStyle = body;
  rrect(ctx, TABLE.x, TABLE.y, TABLE.w, TABLE.h, 18);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 240, 0.18)';
  ctx.lineWidth = 2;
  rrect(ctx, TABLE.x + 3, TABLE.y + 3, TABLE.w - 6, TABLE.h - 6, 16);
  ctx.stroke();
  grain(ctx, TABLE.x, TABLE.y, TABLE.w, TABLE.h, { seed: 19, count: 1600, alpha: 0.12 });
  for (const [sx, sy] of [[TABLE.x + 14, TABLE.y + 14], [TABLE.x + TABLE.w - 14, TABLE.y + 14], [TABLE.x + 14, TABLE.y + TABLE.h - 14], [TABLE.x + TABLE.w - 14, TABLE.y + TABLE.h - 14]]) screw(ctx, sx, sy, 6, sx * 0.01);
  // Typenschild
  ctx.fillStyle = '#b9b09a';
  rrect(ctx, 588, TABLE.y + TABLE.h - 22, 104, 16, 3);
  ctx.fill();
  text(ctx, 'LEUCHTPULT', 640, TABLE.y + TABLE.h - 10, { font: `bold 10px ${PRINT}`, color: '#3a3428', align: 'center' });

  // Opalglas: leuchtet kühl, in der Mitte am hellsten, darunter schimmern die Leuchtröhren
  ctx.save();
  rrect(ctx, GLASS.x, GLASS.y, GLASS.w, GLASS.h, 8);
  ctx.clip();
  const light = ctx.createRadialGradient(640, 370, 60, 640, 370, 640);
  light.addColorStop(0, '#fbfcf6');
  light.addColorStop(0.6, '#eef0e8');
  light.addColorStop(1, '#c9ccc2');
  ctx.fillStyle = light;
  ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
  for (let i = 0; i < 4; i++) {
    const ty = GLASS.y + 70 + i * 134;
    const tube = ctx.createLinearGradient(0, ty - 34, 0, ty + 34);
    tube.addColorStop(0, 'rgba(255, 255, 255, 0)');
    tube.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
    tube.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = tube;
    ctx.fillRect(GLASS.x, ty - 34, GLASS.w, 68);
  }
  // Rand dunkler, Staubkörner, ein paar Fingerabdrücke
  const edge = ctx.createLinearGradient(GLASS.x, 0, GLASS.x + GLASS.w, 0);
  edge.addColorStop(0, 'rgba(60, 70, 60, 0.18)');
  edge.addColorStop(0.08, 'rgba(60, 70, 60, 0)');
  edge.addColorStop(0.92, 'rgba(60, 70, 60, 0)');
  edge.addColorStop(1, 'rgba(60, 70, 60, 0.18)');
  ctx.fillStyle = edge;
  ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
  grain(ctx, GLASS.x, GLASS.y, GLASS.w, GLASS.h, { seed: 3, count: 500, alpha: 0.22, size: 1.2 });
  for (const [fx, fy] of [[318, 560], [960, 330], [700, 600]]) {
    ctx.strokeStyle = 'rgba(120, 125, 115, 0.06)';
    ctx.lineWidth = 1;
    for (let r = 4; r < 22; r += 3) {
      ctx.beginPath();
      ctx.ellipse(fx, fy, r, r * 1.3, 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
  // Glas-Kante
  ctx.strokeStyle = '#1f221d';
  ctx.lineWidth = 4;
  rrect(ctx, GLASS.x, GLASS.y, GLASS.w, GLASS.h, 8);
  ctx.stroke();

  paintStripHolder(ctx);
  paintLooseFilmAndLoupe(ctx);
  paintPencil(ctx, 992, 612, -0.1);
  // Zettel mit dem Hinweis, mit Klebeband
  ctx.save();
  ctx.translate(640, 612);
  ctx.rotate(-0.012);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#f3ead0';
  ctx.fillRect(-330, -20, 660, 40);
  ctx.shadowColor = 'transparent';
  text(ctx, 'Die Tunnellampen hängen in festen Abständen – wie auf den Filmbildern im Kino.', 0, 6, { font: `17px ${HAND}`, color: BLUE_INK, align: 'center' });
  tape(ctx, -334, -6, 40, 22, -0.3);
  tape(ctx, 334, -6, 40, 22, 0.25);
  ctx.restore();
}

// Ein Stück Kreppband
function tape(ctx, x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(226, 212, 170, 0.82)';
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  for (let k = 0; k <= 4; k++) ctx.lineTo(-w / 2 + (w * k) / 4, -h / 2 + (k % 2 ? 2 : 0));
  for (let k = 4; k >= 0; k--) ctx.lineTo(-w / 2 + (w * k) / 4, h / 2 - (k % 2 ? 2 : 0));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Der leere Filmstreifen-Halter: schwarzer Vorspann mit Perforation und sechs Bildfenstern
function paintStripHolder(ctx) {
  const { x, y, w, h } = STRIP;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  const film = ctx.createLinearGradient(0, y, 0, y + h);
  film.addColorStop(0, '#2a2622');
  film.addColorStop(0.5, '#1c1917');
  film.addColorStop(1, '#2a2622');
  ctx.fillStyle = film;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  // Perforation oben und unten: das Licht scheint durch
  ctx.fillStyle = '#f2f3ec';
  for (let px = x + 10; px < x + w - 14; px += 22) {
    rrect(ctx, px, y + 8, 12, 9, 2.5);
    ctx.fill();
    rrect(ctx, px, y + h - 17, 12, 9, 2.5);
    ctx.fill();
  }
  // Bildfenster: leicht graues, klares Filmmaterial
  NEG_SLOTS.forEach((slot, i) => {
    const g = ctx.createLinearGradient(slot.x, slot.y, slot.x + slot.w, slot.y + slot.h);
    g.addColorStop(0, '#e4e5dd');
    g.addColorStop(1, '#cfd1c8');
    ctx.fillStyle = g;
    rrect(ctx, slot.x, slot.y, slot.w, slot.h, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Randbeschriftung wie auf echtem Film: Bildnummer und Pfeil
    text(ctx, String(i + 1), slot.x + slot.w / 2, y + h - 21, { font: `bold 16px ${PRINT}`, color: '#e8c27a', align: 'center' });
    text(ctx, `▸ ${i + 1}A`, slot.x + slot.w - 8, y + h - 23, { font: `10px ${PRINT}`, color: 'rgba(232, 194, 122, 0.7)', align: 'right' });
    if (i % 2 === 0) text(ctx, 'PAN 100', slot.x + 10, y + 27, { font: `bold 9px ${PRINT}`, color: 'rgba(232, 194, 122, 0.55)' });
  });
  // Kreppband an den Enden, mit Beschriftung
  tape(ctx, x + 14, y + h / 2, 64, 30, -1.45);
  tape(ctx, x + w - 14, y + h / 2, 64, 30, 1.5);
  ctx.save();
  ctx.translate(250, y - 6);
  ctx.rotate(-0.03);
  ctx.fillStyle = 'rgba(232, 220, 180, 0.95)';
  ctx.fillRect(-90, -13, 180, 26);
  text(ctx, 'Rolle 19 – Tunnel', 0, 6, { font: `16px ${HAND}`, color: INK, align: 'center' });
  ctx.restore();
  ctx.save();
  ctx.translate(1010, y - 6);
  ctx.rotate(0.02);
  ctx.fillStyle = 'rgba(232, 220, 180, 0.95)';
  ctx.fillRect(-100, -13, 200, 26);
  text(ctx, 'Reihenfolge?', 0, 6, { font: `16px ${HAND}`, color: RED, align: 'center' });
  ctx.restore();
}

// Ein abgeschnittenes Endstück Film, darauf eine Standlupe
function paintLooseFilmAndLoupe(ctx) {
  const cx = 236, cy = 566;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.3);
  ctx.fillStyle = '#25211d';
  ctx.fillRect(-80, -26, 150, 52);
  ctx.fillStyle = '#eef0e8';
  for (let px = -74; px < 66; px += 16) {
    rrect(ctx, px, -22, 8, 6, 1.5);
    ctx.fill();
    rrect(ctx, px, 16, 8, 6, 1.5);
    ctx.fill();
  }
  ctx.restore();
  // Lupe: Acrylkegel von oben, Inneres vergrößert
  const r = 50;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(210, 225, 230, 0.35)';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#f6f7f1';
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.translate(cx, cy);
  ctx.rotate(0.3);
  ctx.scale(2.2, 2.2);
  ctx.translate(30, -24);
  ctx.fillStyle = '#25211d';
  ctx.fillRect(-80, -26, 150, 52);
  ctx.fillStyle = '#f6f7f1';
  for (let px = -74; px < 66; px += 16) {
    rrect(ctx, px, -22, 8, 6, 1.5);
    ctx.fill();
    rrect(ctx, px, 16, 8, 6, 1.5);
    ctx.fill();
  }
  text(ctx, '◂ 0', -38, 10, { font: `bold 7px ${PRINT}`, color: 'rgba(232, 194, 122, 0.8)', align: 'center' });
  ctx.restore();
  grain(ctx, cx - r, cy - r, r * 2, r * 2, { seed: 44, count: 120, alpha: 0.2 });
  // Fassung und Glanz
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  ring.addColorStop(0.5, 'rgba(150, 170, 175, 0.7)');
  ring.addColorStop(1, 'rgba(60, 80, 85, 0.8)');
  ctx.strokeStyle = ring;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40, 50, 55, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(cx - 18, cy - 22, 18, 7, -0.7, 0, Math.PI * 2);
  ctx.fill();
}

// Roter Fettstift
function paintPencil(ctx, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;
  const body = ctx.createLinearGradient(0, -7, 0, 7);
  body.addColorStop(0, '#e05a4a');
  body.addColorStop(0.5, '#b3261e');
  body.addColorStop(1, '#6e130e');
  ctx.fillStyle = body;
  ctx.fillRect(0, -7, 130, 14);
  ctx.shadowColor = 'transparent';
  // Papierwicklung zum Abziehen
  ctx.strokeStyle = 'rgba(255, 230, 220, 0.55)';
  ctx.lineWidth = 1;
  for (let k = 14; k < 120; k += 9) line(ctx, k, -7, k + 6, 7);
  ctx.fillStyle = '#7a1a12';
  ctx.beginPath();
  ctx.moveTo(130, -7);
  ctx.lineTo(150, 0);
  ctx.lineTo(130, 7);
  ctx.fill();
  ctx.restore();
}

// Ein Negativ: Blick nach vorn in den Tunnel, hell und dunkel vertauscht. Die Lampen (in Wirklichkeit hell)
// sind dunkle Punkte. Je tiefer der Zug im Tunnel ist, desto weniger Lampen liegen noch vor ihm.
// Auf dem letzten Bild (keine Lampe mehr) teilt sich das Gleis: Weiche 7.
export function drawNegative(ctx, token, x, y, view) {
  const image = cachedLayer(`w19-neg-${token.lamps}`, (c) => paintNegative(c, token.lamps), NEG_W + 12, NEG_H + 12);
  const loose = token.place?.slot === null && view?.drag?.token !== token;
  ctx.save();
  ctx.translate(x, y);
  if (loose) ctx.rotate((((token.lamps * 37) % 7) - 3) * 0.025);
  ctx.shadowColor = 'rgba(30, 40, 30, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.drawImage(image, -NEG_W / 2 - 6, -NEG_H / 2 - 6, NEG_W + 12, NEG_H + 12);
  ctx.restore();
}

function paintNegative(ctx, lamps) {
  const w = NEG_W, h = NEG_H, ox = 6, oy = 6;
  const ahead = 5 - lamps;
  const random = seeded(100 + lamps);
  // Filmstück: dunkler Rand mit Perforation
  ctx.fillStyle = 'rgba(38, 34, 30, 0.94)';
  rrect(ctx, ox, oy, w, h, 3);
  ctx.fill();
  ctx.fillStyle = 'rgba(240, 242, 235, 0.95)';
  for (let px = ox + 6; px < ox + w - 10; px += 18) {
    rrect(ctx, px, oy + 4, 10, 7, 2);
    ctx.fill();
    rrect(ctx, px, oy + h - 11, 10, 7, 2);
    ctx.fill();
  }
  // Bild
  const ix = ox + 7, iy = oy + 15, iw = w - 14, ih = h - 30;
  ctx.save();
  rrect(ctx, ix, iy, iw, ih, 2);
  ctx.clip();
  const vx = ix + iw * 0.54, vy = iy + ih * 0.44;
  // in Wirklichkeit dunkle Röhre → im Negativ hell; das ferne Ende ganz hell
  const base = ctx.createRadialGradient(vx, vy, 2, vx, vy, iw * 0.8);
  base.addColorStop(0, '#f4f3ee');
  base.addColorStop(0.25, '#dcdad3');
  base.addColorStop(1, '#a9a69e');
  ctx.fillStyle = base;
  ctx.fillRect(ix, iy, iw, ih);
  // Tunnelrippen in Perspektive
  for (let k = 0; k < 7; k++) {
    const d = Math.pow(0.66, k);
    ctx.strokeStyle = `rgba(80, 78, 72, ${0.18 + 0.25 * d})`;
    ctx.lineWidth = 0.8 + 2.4 * d;
    ctx.beginPath();
    ctx.ellipse(vx, vy + ih * 0.42 * d * 0.4, iw * 0.62 * d, ih * 0.78 * d, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  // Schotterbett und Gleis
  ctx.fillStyle = 'rgba(150, 146, 138, 0.6)';
  ctx.beginPath();
  ctx.moveTo(ix, iy + ih);
  ctx.lineTo(vx - 4, vy + 4);
  ctx.lineTo(vx + 4, vy + 4);
  ctx.lineTo(ix + iw, iy + ih);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 116, 108, 0.75)';
  for (let k = 0; k < 9; k++) {
    const d = Math.pow(0.72, k);
    const sy = vy + 4 + (iy + ih - vy - 4) * d;
    ctx.lineWidth = 0.6 + 2.2 * d;
    line(ctx, vx - 40 * d, sy, vx + 40 * d, sy);
  }
  ctx.strokeStyle = '#4b4842';
  ctx.lineWidth = 2;
  line(ctx, vx - 36, iy + ih, vx - 2, vy + 4);
  line(ctx, vx + 36, iy + ih, vx + 2, vy + 4);
  if (ahead === 0) {
    // die Weiche: ein zweites Gleis biegt nach rechts ab
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(vx + 8, iy + ih * 0.78);
    ctx.quadraticCurveTo(vx + 24, iy + ih * 0.66, ix + iw, iy + ih * 0.52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vx + 26, iy + ih);
    ctx.quadraticCurveTo(vx + 40, iy + ih * 0.78, ix + iw, iy + ih * 0.66);
    ctx.stroke();
    // Weichensignal (helle Laterne → dunkler Fleck)
    ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
    ctx.fillRect(vx + 34, vy - 6, 3, 18);
    ctx.beginPath();
    ctx.arc(vx + 35.5, vy - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lampen an der linken Wand – im Negativ dunkle Punkte mit dunklem Hof
  for (let k = 0; k < ahead; k++) {
    const depth = Math.pow(0.62, k);
    const lx = vx + (ix + 12 - vx) * depth;
    const ly = vy + (iy + 16 - vy) * depth;
    const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, 16 * depth + 4);
    halo.addColorStop(0, 'rgba(25, 25, 25, 0.55)');
    halo.addColorStop(1, 'rgba(25, 25, 25, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(lx - 22, ly - 22, 44, 44);
    ctx.fillStyle = '#121212';
    ctx.beginPath();
    ctx.arc(lx, ly, 4.2 * depth + 1.2, 0, Math.PI * 2);
    ctx.fill();
    // Widerschein auf der Schiene
    ctx.fillStyle = 'rgba(30, 30, 30, 0.35)';
    ctx.beginPath();
    ctx.ellipse(lx + (vx - lx) * 0.55, vy + 4 + (iy + ih - vy) * depth * 0.85, 5 * depth + 1, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Filmkorn
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = random() < 0.5 ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(ix + random() * iw, iy + random() * ih, 1, 1);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(ix, iy, iw, ih);
  // Glanz auf dem Film
  const sheen = ctx.createLinearGradient(ox, oy, ox + w, oy + h);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.45, 'rgba(255, 255, 255, 0.16)');
  sheen.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(ox, oy, w, h);
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
