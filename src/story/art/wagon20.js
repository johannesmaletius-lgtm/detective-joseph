import {
  BLUE_INK, HAND, INK, PRINT, RED, SERIF, TYPEWRITER, cached, cachedLayer, contactShadow, drawPicture, glow, grain, line, plank, rivet, seeded,
  roundedRect, sheet, text, wood,
} from './common.js';

// Gezeichnetes für Wagen 20 (Packwagen): Pakete und Anhänger, Frachtliste mit Sternen-Schablone,
// Kisten über der Bodenluke (Schiebepuzzle), Miras Paket mit fünf Bändern, Kelle und Karte.

// ---------------------------------------------------------------- Pakete und Anhänger
export const PARCELS = [
  { id: 'tick', name: 'Herr Tick', clue: 'tickt leise', color: '#2f6a3a', shape: 'box' },
  { id: 'bruno', name: 'Koch Bruno', clue: 'klappert wie Löffel', color: '#a8322a', shape: 'long' },
  { id: 'ilse', name: 'Oma Ilse', clue: 'weich, Wolle', color: '#c9a24a', shape: 'soft' },
  { id: 'moll', name: 'Herr Moll', clue: 'flach, raschelt wie Papier', color: '#3a4a8a', shape: 'flat' },
  { id: 'k', name: 'Herr K.', clue: 'rund, eine Hutschachtel', color: '#6a3a6a', shape: 'round' },
  { id: 'barkeeper', name: 'Barkeeper', clue: 'gluckert', color: '#8a5a2a', shape: 'bottle' },
];
const ORDER = ['moll', 'k', 'tick', 'barkeeper', 'ilse', 'bruno'];
const PARCEL_X = (i) => 230 + i * 164;
const TABLE_TOP = 300, TABLE_FRONT = 360, BASE = 336;
export const PARCEL_SLOTS = ORDER.map((id, i) => ({ id, x: PARCEL_X(i) - 70, y: 400, w: 140, h: 60 }));
export function nameTokens() {
  // Ein Anhänger zu viel: Für den Heizer liegt hier kein Paket
  const names = ['ilse', 'tick', 'heizer', 'k', 'bruno', 'barkeeper', 'moll'];
  const label = (id) => PARCELS.find((p) => p.id === id)?.name ?? 'Der Heizer';
  return names.map((id, i) => ({ id, w: 130, h: 50, label: label(id), home: { x: 205 + i * 145, y: 600 + (i % 2 ? 6 : -6) } }));
}
export function checkNames(placement) {
  return placement.every((id, i) => id === PARCEL_SLOTS[i].id);
}

// Die Pakete: keine Aufschrift – nur Form und Kleinigkeiten verraten, was drin ist.
export function drawParcels(ctx) {
  ctx.drawImage(cachedLayer('w20-parcels', paintParcelTable), 0, 0, 1280, 720);
}

function paintParcelTable(ctx) {
  const X = 104, Y = 62, W = 1072, H = 598;
  ctx.save();
  ctx.beginPath();
  ctx.rect(X, Y, W, H);
  ctx.clip();
  // Rückwand des Packwagens: senkrechte Bretter
  const wallGrad = ctx.createLinearGradient(0, Y, 0, TABLE_TOP);
  wallGrad.addColorStop(0, '#3a2414');
  wallGrad.addColorStop(1, '#5a3a20');
  ctx.fillStyle = wallGrad;
  ctx.fillRect(X, Y, W, TABLE_TOP - Y);
  const random = seeded(20);
  for (let bx = X; bx < X + W; bx += 58) {
    ctx.fillStyle = `rgba(${random() < 0.5 ? '255, 220, 170' : '0, 0, 0'}, ${0.03 + random() * 0.05})`;
    ctx.fillRect(bx, Y, 58, TABLE_TOP - Y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(bx, Y, 2, TABLE_TOP - Y);
    for (const ny of [Y + 30, TABLE_TOP - 40]) {
      ctx.fillStyle = 'rgba(20, 12, 6, 0.7)';
      ctx.beginPath();
      ctx.arc(bx + 29, ny, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  grain(ctx, X, Y, W, TABLE_TOP - Y, { seed: 21, count: 1500, alpha: 0.12 });
  // Lampe von oben
  glow(ctx, 640, Y - 20, 620, '255, 205, 130', 0.3);
  // Zettel an der Wand
  ctx.save();
  ctx.translate(372, 102);
  ctx.rotate(-0.02);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#f1e5c6';
  ctx.fillRect(-200, -26, 400, 54);
  ctx.shadowColor = 'transparent';
  text(ctx, 'Schütteln verboten! – Mira', 0, -4, { font: `bold 18px ${HAND}`, color: RED, align: 'center' });
  text(ctx, 'Man muss es an der Form erkennen.', 0, 18, { font: `italic 15px ${SERIF}`, color: INK, align: 'center' });
  ctx.fillStyle = '#9a2a20';
  ctx.beginPath();
  ctx.arc(0, -22, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Tisch: Platte von schräg oben, Vorderkante, Beine
  const top = ctx.createLinearGradient(0, TABLE_TOP, 0, TABLE_FRONT);
  top.addColorStop(0, '#7a4c26');
  top.addColorStop(1, '#a8703c');
  ctx.fillStyle = top;
  ctx.fillRect(X, TABLE_TOP, W, TABLE_FRONT - TABLE_TOP);
  ctx.strokeStyle = 'rgba(60, 30, 10, 0.3)';
  ctx.lineWidth = 1;
  for (let k = 0; k < 6; k++) {
    const ly = TABLE_TOP + 6 + k * 10;
    ctx.beginPath();
    ctx.moveTo(X, ly);
    for (let lx = X; lx <= X + W; lx += 40) ctx.lineTo(lx, ly + Math.sin(lx * 0.013 + k) * 1.5);
    ctx.stroke();
  }
  const front = ctx.createLinearGradient(0, TABLE_FRONT, 0, TABLE_FRONT + 30);
  front.addColorStop(0, '#c48a50');
  front.addColorStop(0.15, '#7a4822');
  front.addColorStop(1, '#4a2a12');
  ctx.fillStyle = front;
  ctx.fillRect(X, TABLE_FRONT, W, 30);
  // unter dem Tisch: dunkel
  const under = ctx.createLinearGradient(0, TABLE_FRONT + 30, 0, 560);
  under.addColorStop(0, '#120a05');
  under.addColorStop(1, '#2a1a0e');
  ctx.fillStyle = under;
  ctx.fillRect(X, TABLE_FRONT + 30, W, 560 - TABLE_FRONT - 30);
  for (const lx of [X + 20, X + W - 56]) {
    const leg = ctx.createLinearGradient(lx, 0, lx + 36, 0);
    leg.addColorStop(0, '#6a3e1c');
    leg.addColorStop(1, '#3a200c');
    ctx.fillStyle = leg;
    ctx.fillRect(lx, TABLE_FRONT + 30, 36, 560 - TABLE_FRONT - 30);
  }
  // Bodendielen
  wood(ctx, X, 560, W, Y + H - 560, [70, 44, 24]);

  // Die Pakete auf dem Tisch, jedes mit einer Schnur, an die der Anhänger gehört
  ORDER.forEach((id, i) => {
    const p = PARCELS.find((q) => q.id === id);
    const cx = PARCEL_X(i);
    paintParcel(ctx, p, cx, BASE);
    // Schnur über die Tischkante bis zur Öse
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 18, BASE - 6);
    ctx.quadraticCurveTo(cx + 26, TABLE_FRONT + 4, cx + 6, TABLE_FRONT + 12);
    ctx.quadraticCurveTo(cx - 4, PARCEL_SLOTS[i].y - 6, cx, PARCEL_SLOTS[i].y + 4);
    ctx.stroke();
    ctx.strokeStyle = '#b8a47a';
    ctx.beginPath();
    ctx.ellipse(cx, PARCEL_SLOTS[i].y + 10, 5, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Ablage für die losen Anhänger
  const TY = 560;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#6a4222';
  ctx.fillRect(118, TY, 1044, 84);
  ctx.restore();
  wood(ctx, 130, TY + 10, 1020, 66, [120, 80, 44]);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(130, TY + 10, 1020, 8);
  ctx.strokeStyle = '#3a200c';
  ctx.lineWidth = 3;
  ctx.strokeRect(124, TY + 4, 1032, 76);
  ctx.restore();
}

// Farbe heller (+) oder dunkler (−) machen
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amount));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

// Fläche füllen, mit Muster und Licht von links oben
function wrapped(ctx, path, color, pattern) {
  ctx.save();
  path();
  const g = ctx.createLinearGradient(-80, -200, 80, 0);
  g.addColorStop(0, shade(color, 34));
  g.addColorStop(1, shade(color, -30));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  pattern?.();
  ctx.restore();
  ctx.save();
  path();
  ctx.strokeStyle = 'rgba(25, 12, 4, 0.75)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

function stars(ctx, x0, y0, x1, y1, color) {
  ctx.fillStyle = color;
  for (let y = y0; y < y1; y += 18) {
    for (let x = x0 + ((y / 18) % 2) * 9; x < x1; x += 18) {
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const a = -Math.PI / 2 + (k * Math.PI) / 5;
        const r = k % 2 ? 1.6 : 4;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      ctx.fill();
    }
  }
}

// Geschenkband mit Schleife
function bow(ctx, x, y, color = '#f2d06b', size = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size, size);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(80, 50, 0, 0.6)';
  ctx.lineWidth = 1;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(side * 10, -22, side * 30, -16, side * 24, -2);
    ctx.bezierCurveTo(side * 20, 6, side * 8, 4, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * 8, 12, side * 14, 22);
    ctx.lineTo(side * 8, 22);
    ctx.quadraticCurveTo(side * 4, 12, 0, 2);
    ctx.fill();
  }
  ctx.fillStyle = shade('#c9a24a', -20);
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintParcel(ctx, p, cx, by) {
  ctx.save();
  ctx.translate(cx, by);
  contactShadow(ctx, 8, 0, 84, 14, 0.55);
  const ribbon = '#f2d06b';
  if (p.shape === 'flat') {
    // flach, an die Hutschachtel gelehnt – ein Notenheft; an der Ecke lugt ein Blatt hervor
    ctx.rotate(0.16);
    ctx.fillStyle = shade(p.color, -50);
    ctx.fillRect(56, -112, 10, 112);
    wrapped(ctx, () => { ctx.beginPath(); ctx.rect(-56, -112, 112, 112); }, p.color, () => {
      ctx.fillStyle = 'rgba(220, 230, 255, 0.35)';
      for (let y = -108; y < 0; y += 12) for (let x = -52 + ((y / 12) % 2) * 6; x < 56; x += 12) ctx.fillRect(x, y, 2.5, 2.5);
    });
    ctx.fillStyle = '#f2ead6';
    ctx.beginPath();
    ctx.moveTo(26, -112);
    ctx.lineTo(54, -126);
    ctx.lineTo(62, -108);
    ctx.lineTo(42, -100);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40, 30, 20, 0.7)';
    ctx.lineWidth = 0.8;
    for (let k = 0; k < 5; k++) line(ctx, 32 + k * 1.5, -113 - k * 2.5, 56 + k * 1.2, -121 + k * 3.2);
    // Paketschnur über Kreuz
    ctx.strokeStyle = '#e2cf9a';
    ctx.lineWidth = 2.4;
    line(ctx, -56, -56, 56, -56);
    line(ctx, 0, -112, 0, 0);
    ctx.fillStyle = '#b3261e';
    ctx.beginPath();
    ctx.arc(0, -56, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 200, 180, 0.5)';
    ctx.beginPath();
    ctx.arc(-2, -58, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === 'round') {
    // Hutschachtel: gestreifter Zylinder mit Deckel
    const r = 66, h = 104, ry = 20;
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(-r, -h);
      ctx.lineTo(-r, -ry * 0.2);
      ctx.ellipse(0, -ry * 0.2, r, ry, 0, Math.PI, 0, true);
      ctx.lineTo(r, -h);
      ctx.closePath();
    };
    wrapped(ctx, body, p.color, () => {
      ctx.fillStyle = 'rgba(245, 230, 240, 0.35)';
      for (let x = -r; x < r; x += 22) ctx.fillRect(x, -h - 30, 10, h + 60);
      const round = ctx.createLinearGradient(-r, 0, r, 0);
      round.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      round.addColorStop(0.35, 'rgba(255, 255, 255, 0)');
      round.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = round;
      ctx.fillRect(-r, -h - 30, r * 2, h + 60);
    });
    // Deckel mit Rand
    ctx.fillStyle = shade(p.color, -35);
    ctx.beginPath();
    ctx.ellipse(0, -h + 14, r + 5, ry + 2, 0, 0, Math.PI);
    ctx.lineTo(-r - 5, -h);
    ctx.ellipse(0, -h, r + 5, ry + 2, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = shade(p.color, 40);
    ctx.beginPath();
    ctx.ellipse(0, -h, r + 5, ry + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.6)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Band über den Deckel
    ctx.strokeStyle = ribbon;
    ctx.lineWidth = 7;
    line(ctx, 0, -h - ry, 0, -h + ry + 14);
    line(ctx, 0, -h + 14, 0, -2);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, -h, r + 4, ry + 1, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 0;
    ctx.stroke();
    ctx.globalAlpha = 1;
    bow(ctx, 0, -h - 2, ribbon, 1.2);
  } else if (p.shape === 'box') {
    // kleiner Kasten (von schräg oben): grün mit goldenen Sternen, seitlich ein Aufziehschlüssel
    const s = 96, d = 22;
    ctx.fillStyle = shade(p.color, -45);
    ctx.beginPath();
    ctx.moveTo(s / 2, -s);
    ctx.lineTo(s / 2 + d, -s - d * 0.6);
    ctx.lineTo(s / 2 + d, -d * 0.6);
    ctx.lineTo(s / 2, 0);
    ctx.fill();
    wrapped(ctx, () => { ctx.beginPath(); ctx.rect(-s / 2, -s, s, s); }, p.color, () => stars(ctx, -s / 2, -s, s / 2, 0, 'rgba(242, 208, 107, 0.75)'));
    ctx.fillStyle = shade(p.color, 30);
    ctx.beginPath();
    ctx.moveTo(-s / 2, -s);
    ctx.lineTo(-s / 2 + d, -s - d * 0.6);
    ctx.lineTo(s / 2 + d, -s - d * 0.6);
    ctx.lineTo(s / 2, -s);
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.6)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Band
    ctx.fillStyle = ribbon;
    ctx.fillRect(-5, -s, 10, s);
    ctx.beginPath();
    ctx.moveTo(-5 + 0, -s);
    ctx.lineTo(-5 + d, -s - d * 0.6);
    ctx.lineTo(5 + d, -s - d * 0.6);
    ctx.lineTo(5, -s);
    ctx.fill();
    bow(ctx, d / 2, -s - d * 0.3, ribbon, 1.1);
    // Aufziehschlüssel an der Seite
    const kx = s / 2 + d - 2, ky = -s * 0.45;
    ctx.strokeStyle = '#8a6420';
    ctx.lineWidth = 4;
    line(ctx, kx - 4, ky, kx + 12, ky);
    const brass = ctx.createLinearGradient(kx + 10, ky - 14, kx + 26, ky + 14);
    brass.addColorStop(0, '#fbe6a6');
    brass.addColorStop(1, '#8a6420');
    ctx.fillStyle = brass;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(kx + 18, ky + side * 9, 7, 9, side * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2a1a0e';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(kx + 18, ky + side * 9, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (p.shape === 'bottle') {
    // eine Flasche, in Packpapier gewickelt, oben zusammengedreht und verschnürt
    const bottle = () => {
      ctx.beginPath();
      ctx.moveTo(-30, -6);
      ctx.quadraticCurveTo(-34, -60, -30, -112);
      ctx.quadraticCurveTo(-28, -140, -11, -152);
      ctx.lineTo(-12, -184);
      ctx.lineTo(12, -184);
      ctx.lineTo(11, -152);
      ctx.quadraticCurveTo(28, -140, 30, -112);
      ctx.quadraticCurveTo(34, -60, 30, -6);
      ctx.quadraticCurveTo(0, 2, -30, -6);
      ctx.closePath();
    };
    wrapped(ctx, bottle, '#b88a55', () => {
      ctx.strokeStyle = 'rgba(80, 50, 20, 0.35)';
      ctx.lineWidth = 1.2;
      for (const [x0, y0, x1, y1] of [[-30, -40, 20, -70], [-28, -90, 30, -60], [-20, -130, 26, -100], [-26, -20, 30, -36], [-10, -150, 14, -120]]) line(ctx, x0, y0, x1, y1);
      const round = ctx.createLinearGradient(-34, 0, 34, 0);
      round.addColorStop(0, 'rgba(255, 240, 210, 0.25)');
      round.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
      round.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = round;
      ctx.fillRect(-36, -200, 72, 210);
    });
    // zusammengedrehtes Papier oben
    ctx.fillStyle = '#c99a62';
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-12, -184);
    ctx.lineTo(-24, -206);
    ctx.lineTo(-10, -198);
    ctx.lineTo(-4, -212);
    ctx.lineTo(4, -198);
    ctx.lineTo(16, -208);
    ctx.lineTo(12, -184);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#b3261e';
    ctx.lineWidth = 3;
    line(ctx, -13, -182, 13, -182);
    line(ctx, -12, -177, 12, -177);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, -180);
    ctx.quadraticCurveTo(26, -170, 20, -156);
    ctx.stroke();
    // Aufkleber „Vorsicht Glas“
    ctx.save();
    ctx.translate(0, -70);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#e8402e';
    ctx.fillRect(-24, -14, 48, 28);
    text(ctx, 'VORSICHT', 0, -2, { font: `bold 8px ${PRINT}`, color: '#fff3e0', align: 'center' });
    text(ctx, 'GLAS', 0, 9, { font: `bold 10px ${PRINT}`, color: '#fff3e0', align: 'center' });
    ctx.restore();
  } else if (p.shape === 'soft') {
    // weich und bauchig, in Seidenpapier; mit grünem Wollfaden zugebunden, ein Faden hängt heraus
    const blob = () => {
      ctx.beginPath();
      ctx.moveTo(-66, -8);
      ctx.bezierCurveTo(-78, -52, -50, -96, -6, -92);
      ctx.bezierCurveTo(20, -104, 66, -86, 70, -46);
      ctx.bezierCurveTo(76, -16, 60, -2, 30, -2);
      ctx.bezierCurveTo(4, 4, -40, 4, -66, -8);
      ctx.closePath();
    };
    wrapped(ctx, blob, p.color, () => {
      ctx.strokeStyle = 'rgba(120, 80, 20, 0.35)';
      ctx.lineWidth = 1.4;
      for (const [x0, y0, cx1, cy1, x1, y1] of [[-50, -60, -30, -40, -40, -14], [-20, -84, -6, -60, -18, -30], [30, -84, 20, -60, 36, -36], [50, -60, 40, -40, 52, -14], [-60, -30, -20, -26, 0, -10]]) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(cx1, cy1, x1, y1);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 250, 220, 0.3)';
      ctx.beginPath();
      ctx.ellipse(-24, -70, 26, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = '#3f8a3a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-70, -44);
    ctx.quadraticCurveTo(0, -36, 72, -48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -94);
    ctx.quadraticCurveTo(-6, -50, 4, -2);
    ctx.stroke();
    // loser Wollfaden mit kleinem Knäuel
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(4, -42);
    ctx.bezierCurveTo(40, -30, 30, -10, 66, -6);
    ctx.stroke();
    ctx.fillStyle = '#3f8a3a';
    ctx.beginPath();
    ctx.arc(74, -10, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a6a28';
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(74, -10, 10, 4 + k, k * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // lang und schmal – ein Besteckkasten, rot-weiß gestreift; eine Löffelspitze schaut heraus
    const w = 52, h = 164, d = 16;
    // Löffel zuerst (steckt im Deckel)
    const spoon = ctx.createLinearGradient(-10, -h - 40, 12, -h);
    spoon.addColorStop(0, '#f4f6f8');
    spoon.addColorStop(1, '#8a9098');
    ctx.fillStyle = spoon;
    ctx.beginPath();
    ctx.ellipse(10, -h - 22, 9, 13, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(6, -h - 12, 6, 14);
    ctx.fillStyle = shade(p.color, -45);
    ctx.beginPath();
    ctx.moveTo(w / 2, -h);
    ctx.lineTo(w / 2 + d, -h - d * 0.6);
    ctx.lineTo(w / 2 + d, -d * 0.6);
    ctx.lineTo(w / 2, 0);
    ctx.fill();
    wrapped(ctx, () => { ctx.beginPath(); ctx.rect(-w / 2, -h, w, h); }, p.color, () => {
      ctx.fillStyle = 'rgba(255, 245, 235, 0.75)';
      for (let k = -h - 60; k < 60; k += 22) {
        ctx.beginPath();
        ctx.moveTo(-w / 2, k);
        ctx.lineTo(w / 2, k - 30);
        ctx.lineTo(w / 2, k - 22);
        ctx.lineTo(-w / 2, k + 8);
        ctx.fill();
      }
    });
    ctx.fillStyle = shade(p.color, 30);
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h);
    ctx.lineTo(-w / 2 + d, -h - d * 0.6);
    ctx.lineTo(w / 2 + d, -h - d * 0.6);
    ctx.lineTo(w / 2, -h);
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 12, 4, 0.6)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#2f6a3a';
    ctx.fillRect(-w / 2, -h * 0.55, w, 9);
    bow(ctx, -6, -h * 0.55 + 4, '#3f8a4a', 0.9);
  }
  ctx.restore();
}

// Ein Paketanhänger aus Karton: Öse mit Verstärkungsring, Schnur, Name in Tinte
export function drawNameTag(ctx, token, x, y, view) {
  const image = cachedLayer(`w20-tag-${token.id}`, (c) => paintNameTag(c, token), 170, 70);
  const loose = token.place?.slot === null && view?.drag?.token !== token;
  ctx.save();
  ctx.translate(x, y);
  if (loose) ctx.rotate(((token.label.length * 17) % 9 - 4) * 0.012);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.drawImage(image, -80, -35, 170, 70);
  ctx.restore();
}

function paintNameTag(ctx, token) {
  const w = token.w, h = token.h;
  ctx.translate(80, 35);
  const x0 = -w / 2, y0 = -h / 2;
  const tag = () => {
    ctx.beginPath();
    ctx.moveTo(x0 + 16, y0);
    ctx.lineTo(x0 + w, y0);
    ctx.lineTo(x0 + w, y0 + h);
    ctx.lineTo(x0 + 16, y0 + h);
    ctx.lineTo(x0, y0 + h - 14);
    ctx.lineTo(x0, y0 + 14);
    ctx.closePath();
  };
  const card = ctx.createLinearGradient(0, y0, 0, y0 + h);
  card.addColorStop(0, '#f0dca4');
  card.addColorStop(1, '#d8bf80');
  ctx.fillStyle = card;
  tag();
  ctx.fill();
  ctx.save();
  tag();
  ctx.clip();
  grain(ctx, x0, y0, w, h, { seed: token.label.length * 7, count: 160, alpha: 0.12 });
  ctx.strokeStyle = 'rgba(39, 64, 143, 0.18)';
  ctx.lineWidth = 1;
  line(ctx, x0 + 30, y0 + h - 12, x0 + w - 8, y0 + h - 12);
  ctx.restore();
  ctx.strokeStyle = '#8c6a2a';
  ctx.lineWidth = 1.5;
  tag();
  ctx.stroke();
  // Öse mit Verstärkungsring
  const ex = x0 + 14, ey = 0;
  ctx.fillStyle = '#c8b07a';
  ctx.beginPath();
  ctx.arc(ex, ey, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8c6a2a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#2a1a0e';
  ctx.beginPath();
  ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
  ctx.fill();
  // Schnurschlaufe
  ctx.strokeStyle = '#e2cf9a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ex - 1, ey - 3);
  ctx.quadraticCurveTo(ex - 14, ey - 18, ex - 28, ey - 30);
  ctx.moveTo(ex + 1, ey - 3);
  ctx.quadraticCurveTo(ex - 8, ey - 22, ex - 20, ey - 33);
  ctx.stroke();
  text(ctx, token.label, 10, 7, { font: `bold 18px ${HAND}`, color: BLUE_INK, align: 'center' });
}

// ---------------------------------------------------------------- Frachtliste mit Schablone
// Ein Buchstabengitter 14 × 8. Durch die Sterne der Schablone (bei richtiger Lage) liest man:
// PAKET FÜR PAPA – UNTER DEM BODEN
const MESSAGE = 'PAKETFURPAPAUNTERDEMBODEN';
const COLS = 14, ROWS = 8;
// Sternlöcher in der Schablone (Spalte, Zeile) – 25 Stück, zeilenweise von links nach rechts gelesen
const HOLES = [
  [1, 0], [4, 0], [6, 0], [9, 0], [12, 0],
  [0, 1], [3, 1], [8, 1],
  [2, 2], [5, 2], [7, 2], [10, 2],
  [1, 3], [6, 3], [11, 3],
  [0, 4], [4, 4], [9, 4],
  [2, 5], [7, 5], [12, 5],
  [3, 6], [8, 6], [10, 6],
  [5, 7],
];
export const STENCIL_GOAL = { dx: 1, dy: 0 }; // so liegt die Schablone richtig (um 1 Spalte nach rechts)
const FILLER = 'WEIHNACHTSGESCHENKEFRACHTLISTEPOSTRINGBAHNSTERNMIRAMOLLTICKKERZENSCHNEEGLOCKEN';

export const GRID_LETTERS = (() => {
  const grid = [];
  let k = 0;
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(FILLER[(r * 17 + c * 5 + k++) % FILLER.length]);
    grid.push(row);
  }
  HOLES.forEach(([c, r], i) => {
    grid[r][c + STENCIL_GOAL.dx] = MESSAGE[i];
  });
  return grid;
})();

const G = { x: 300, y: 150, cell: 48 };
export const STENCIL_SPOTS = [
  { id: 'left', x: 180, y: 300, w: 70, h: 80, label: 'Schablone nach links' },
  { id: 'right', x: 1030, y: 300, w: 70, h: 80, label: 'Schablone nach rechts' },
  { id: 'up', x: 600, y: 50, w: 80, h: 48, label: 'Schablone nach oben' },
  { id: 'down', x: 600, y: 584, w: 80, h: 48, label: 'Schablone nach unten' },
];

export function stencilAligned({ dx, dy }) {
  return dx === STENCIL_GOAL.dx && dy === STENCIL_GOAL.dy;
}

export function drawStencil(ctx, { dx, dy, laid }) {
  sheet(ctx, 260, 110, 760, 460, {
    color: '#ece4cc',
    inner: () => {},
  });
  text(ctx, 'FRACHTLISTE · Packwagen · 24. Dezember', 640, 140, { font: `bold 18px ${SERIF}`, align: 'center' });
  GRID_LETTERS.forEach((row, r) => row.forEach((ch, c) => text(ctx, ch, G.x + c * G.cell + G.cell / 2, G.y + 30 + r * G.cell + 24, { font: `bold 22px ${TYPEWRITER}`, align: 'center' })));
  if (laid) {
    // Geschenkpapier mit ausgestanzten Sternen: alles rot, nur die Sterne sind Löcher
    ctx.save();
    ctx.beginPath();
    ctx.rect(G.x - 20 + dx * G.cell, G.y + 10 + dy * G.cell, COLS * G.cell + 40, ROWS * G.cell + 40);
    for (const [c, r] of HOLES) {
      const cx = G.x + (c + dx) * G.cell + G.cell / 2, cy = G.y + 30 + (r + dy) * G.cell + 16;
      star(ctx, cx, cy, 20);
    }
    ctx.fillStyle = 'rgba(160, 30, 30, 0.93)';
    ctx.fill('evenodd');
    ctx.restore();
  }
  // Pfeile nur, wenn die Schablone liegt (vorher lässt sich nichts verschieben); außerhalb des Blatts
  if (!laid) return;
  for (const spot of STENCIL_SPOTS) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    roundedRect(ctx, spot.x, spot.y, spot.w, spot.h, 10);
    const g = ctx.createLinearGradient(0, spot.y, 0, spot.y + spot.h);
    g.addColorStop(0, '#5a3d20');
    g.addColorStop(1, '#2e1e0e');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#c49a46';
    ctx.lineWidth = 2;
    roundedRect(ctx, spot.x + 1, spot.y + 1, spot.w - 2, spot.h - 2, 9);
    ctx.stroke();
    text(ctx, { left: '◀', right: '▶', up: '▲', down: '▼' }[spot.id], spot.x + spot.w / 2, spot.y + spot.h / 2 + 9, { font: `bold 24px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  }
}

function star(ctx, x, y, r) {
  ctx.moveTo(x, y - r);
  for (let i = 1; i <= 10; i++) {
    const a = -Math.PI / 2 - i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------- Kisten über der Bodenluke (Schiebepuzzle)
// 5 × 5 Felder. Jede Kiste rutscht nur entlang ihrer Länge. Die Luke liegt unter Zeile 4, Spalten 1–2.
export const BOARD = { x: 390, y: 110, cell: 100, size: 5 };
export const HATCH = [[1, 4], [2, 4]];
export function startCrates() {
  return [
    { id: 'A', col: 1, row: 4, len: 2, dir: 'h', color: '#b07a3a' },
    { id: 'B', col: 3, row: 3, len: 2, dir: 'v', color: '#8a5a2a' },
    { id: 'C', col: 0, row: 3, len: 2, dir: 'v', color: '#8a5a2a' },
    { id: 'D', col: 2, row: 2, len: 2, dir: 'h', color: '#a06a32' },
    { id: 'E', col: 4, row: 1, len: 2, dir: 'v', color: '#7a4a22' },
    { id: 'F', col: 1, row: 1, len: 2, dir: 'v', color: '#7a4a22' },
    { id: 'G', col: 3, row: 0, len: 2, dir: 'h', color: '#a06a32' },
  ];
}

export function cells(crate) {
  return Array.from({ length: crate.len }, (_, i) => (crate.dir === 'h' ? [crate.col + i, crate.row] : [crate.col, crate.row + i]));
}

export function crateSpots(crates) {
  return crates.map((c) => ({
    id: c.id,
    x: BOARD.x + c.col * BOARD.cell + 4, y: BOARD.y + c.row * BOARD.cell + 4,
    w: (c.dir === 'h' ? c.len : 1) * BOARD.cell - 8, h: (c.dir === 'v' ? c.len : 1) * BOARD.cell - 8,
    label: 'Kiste schieben',
  }));
}

export function hatchFree(crates) {
  return !crates.some((c) => cells(c).some(([x, y]) => HATCH.some(([hx, hy]) => hx === x && hy === y)));
}

export function drawCrates(ctx, { crates }) {
  const { x, y, cell, size } = BOARD;
  ctx.drawImage(cached('w20-floor', cell * size + 120, cell * size + 100, paintCrateFloor), x - 60, y - 50);
  for (const c of crates) {
    const long = c.len * cell - 8, short = cell - 8;
    const cx = x + c.col * cell + 4, cy = y + c.row * cell + 4;
    const image = cached(`w20-crate-${c.id}`, long + 12, short + 12, (g) => paintCrate(g, c, long, short));
    const w = c.dir === 'h' ? long : short, h = c.dir === 'v' ? long : short;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(cx + 6, cy + 8, w, h);
    if (c.dir === 'h') ctx.drawImage(image, cx - 6, cy - 6);
    else {
      ctx.translate(cx + w, cy);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(image, -6, -6);
    }
    ctx.restore();
    // Schieberichtung als aufgemalte Pfeile
    ctx.save();
    ctx.translate(cx + w / 2, cy + h / 2);
    if (c.dir === 'v') ctx.rotate(Math.PI / 2);
    ctx.fillStyle = 'rgba(250, 236, 200, 0.85)';
    for (const sx of [-1, 1]) {
      const ax = sx * (c.len * cell / 2 - 26);
      ctx.beginPath();
      ctx.moveTo(ax + sx * 12, 0);
      ctx.lineTo(ax - sx * 4, -11);
      ctx.lineTo(ax - sx * 4, 11);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  text(ctx, 'Klicken: Kiste in diese Richtung schieben (linke/rechte bzw. obere/untere Hälfte)', 640, y + size * cell + 60, { font: `16px ${PRINT}`, color: '#f1e0b8', align: 'center' });
}

// Boden des Packwagens mit Bodenluke (einmal gezeichnet). (0, 0) = 60 px links und 50 px über dem Brett.
function paintCrateFloor(c) {
  const { cell, size } = BOARD;
  const W = cell * size + 120, H = cell * size + 100, ox = 60, oy = 50;
  for (let i = 0; i * 50 < W; i++) plank(c, i * 50, 0, 50, H, { tone: [104, 70, 40], seed: 500 + i, vertical: true, knots: 2 });
  c.fillStyle = 'rgba(15, 8, 3, 0.65)';
  for (let i = 1; i * 50 < W; i++) c.fillRect(i * 50 - 1, 0, 2, H);
  // Nagelreihen über den Querbalken
  for (let yy = 30; yy < H; yy += 150) for (let i = 0; i * 50 < W; i++) {
    rivet(c, i * 50 + 12, yy, 2.4, [90, 85, 80]);
    rivet(c, i * 50 + 38, yy, 2.4, [90, 85, 80]);
  }
  // Kreidelinien: das 5 × 5-Feld
  c.strokeStyle = 'rgba(240, 230, 210, 0.18)';
  c.lineWidth = 2;
  c.setLineDash([10, 7]);
  for (let i = 0; i <= size; i++) {
    line(c, ox + i * cell, oy, ox + i * cell, oy + size * cell);
    line(c, ox, oy + i * cell, ox + size * cell, oy + i * cell);
  }
  c.setLineDash([]);
  // Bodenluke: Riffelblech mit Nieten, Scharnieren und Ring
  const hx = ox + HATCH[0][0] * cell + 6, hy = oy + HATCH[0][1] * cell + 6, hw = 2 * cell - 12, hh = cell - 12;
  c.fillStyle = 'rgba(0, 0, 0, 0.6)';
  c.fillRect(hx - 5, hy - 5, hw + 10, hh + 10);
  const steel = c.createLinearGradient(hx, hy, hx + hw, hy + hh);
  steel.addColorStop(0, '#7b7f82');
  steel.addColorStop(1, '#45494c');
  c.fillStyle = steel;
  c.fillRect(hx, hy, hw, hh);
  c.save();
  c.beginPath();
  c.rect(hx, hy, hw, hh);
  c.clip();
  c.strokeStyle = 'rgba(200, 205, 210, 0.35)';
  c.lineWidth = 2;
  for (let ty = hy + 6; ty < hy + hh; ty += 12) {
    for (let tx = hx + ((ty - hy) % 24 ? 6 : 14); tx < hx + hw; tx += 16) line(c, tx, ty, tx + 6, ty - 5);
  }
  c.restore();
  c.strokeStyle = 'rgba(20, 20, 20, 0.8)';
  c.lineWidth = 2;
  c.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1);
  for (const [rx, ry] of [[hx + 8, hy + 8], [hx + hw - 8, hy + 8], [hx + 8, hy + hh - 8], [hx + hw - 8, hy + hh - 8]]) rivet(c, rx, ry, 3.5, [150, 150, 150]);
  for (const sx of [hx + 30, hx + hw - 60]) {
    c.fillStyle = '#2c2f31';
    c.fillRect(sx, hy - 4, 30, 12);
    rivet(c, sx + 7, hy + 2, 2.5, [130, 130, 130]);
    rivet(c, sx + 23, hy + 2, 2.5, [130, 130, 130]);
  }
  c.strokeStyle = '#a7a9aa';
  c.lineWidth = 4;
  c.beginPath();
  c.ellipse(hx + hw / 2, hy + hh - 22, 14, 9, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = 'rgba(0, 0, 0, 0.5)';
  c.fillRect(hx + hw / 2 - 18, hy + hh - 14, 36, 4);
  text(c, 'LUKE', hx + hw / 2, hy + 38, { font: `bold 24px ${TYPEWRITER}`, color: 'rgba(245, 220, 120, 0.85)', align: 'center' });
  // Lampenlicht von oben, Ränder dunkel
  const light = c.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H / 2, W * 0.75);
  light.addColorStop(0, 'rgba(255, 220, 150, 0.12)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  c.fillStyle = light;
  c.fillRect(0, 0, W, H);
}

const CRATE_LABELS = {
  A: ['ZERBRECHLICH', '#a12a1e'], B: ['RINGBAHN', '#2a2018'], C: ['POST', '#2a3a6a'], D: ['VORSICHT GLAS', '#a12a1e'],
  E: ['OBEN', '#2a2018'], F: ['ZUG 24', '#2a2018'], G: ['WEIHNACHTEN', '#2f5a3a'],
};

// Eine Holzkiste, liegend gezeichnet (long × short); stehende Kisten werden gedreht
function paintCrate(c, crate, long, short) {
  c.translate(6, 6);
  const tone = crate.color.match(/\w\w/g).map((h) => parseInt(h, 16));
  const seed = crate.id.charCodeAt(0) * 7;
  // Bretter quer
  const boards = Math.max(2, Math.round(long / 48));
  for (let i = 0; i < boards; i++) plank(c, (i * long) / boards, 0, long / boards, short, { tone, seed: seed + i, vertical: true, knots: 1 });
  c.fillStyle = 'rgba(20, 10, 3, 0.55)';
  for (let i = 1; i < boards; i++) c.fillRect((i * long) / boards - 1, 0, 2, short);
  // Rahmen
  const dark = tone.map((v) => Math.max(0, v - 34));
  for (const [fx, fy, fw, fh] of [[0, 0, long, 12], [0, short - 12, long, 12], [0, 0, 12, short], [long - 12, 0, 12, short]]) {
    plank(c, fx, fy, fw, fh, { tone: dark, seed: seed + fx + fy, vertical: fh > fw, knots: 0 });
  }
  c.strokeStyle = 'rgba(15, 8, 2, 0.8)';
  c.lineWidth = 2;
  c.strokeRect(1, 1, long - 2, short - 2);
  c.strokeRect(12, 12, long - 24, short - 24);
  // Diagonalstrebe
  c.save();
  c.beginPath();
  c.rect(12, 12, long - 24, short - 24);
  c.clip();
  c.translate(long / 2, short / 2);
  c.rotate(Math.atan2(short - 24, long - 24));
  plank(c, -long, -6, long * 2, 12, { tone: dark, seed: seed + 99, knots: 0 });
  c.strokeStyle = 'rgba(15, 8, 2, 0.7)';
  c.lineWidth = 1.5;
  c.strokeRect(-long, -6, long * 2, 12);
  c.restore();
  // Nägel und Eckbeschläge
  for (const [nx, ny] of [[6, 6], [long - 6, 6], [6, short - 6], [long - 6, short - 6]]) {
    c.fillStyle = '#3a3a38';
    c.fillRect(nx - 6, ny - 6, 12, 12);
    rivet(c, nx, ny, 2.6, [160, 155, 145]);
  }
  // Stempelaufdruck
  const [label, ink] = CRATE_LABELS[crate.id] ?? ['', INK];
  c.save();
  c.translate(long / 2, short / 2);
  c.rotate(-0.04);
  const size = long > 150 ? 15 : 12;
  c.font = `bold ${size}px ${TYPEWRITER}`;
  const tw = c.measureText(label).width + 16;
  c.fillStyle = 'rgba(0, 0, 0, 0.3)';
  c.fillRect(-tw / 2 + 2, -13, tw, 24);
  c.fillStyle = '#efe3c4';
  c.fillRect(-tw / 2, -15, tw, 24);
  c.strokeStyle = 'rgba(120, 90, 50, 0.6)';
  c.lineWidth = 1;
  c.strokeRect(-tw / 2 + 2.5, -12.5, tw - 5, 19);
  text(c, label, 0, 2, { font: `bold ${size}px ${TYPEWRITER}`, color: ink, align: 'center' });
  c.restore();
  // Lichtkante oben, Schatten unten
  const shade = c.createLinearGradient(0, 0, 0, short);
  shade.addColorStop(0, 'rgba(255, 230, 190, 0.18)');
  shade.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  shade.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  c.fillStyle = shade;
  c.fillRect(0, 0, long, short);
}

// ---------------------------------------------------------------- Miras Paket: fünf Bänder
// Bänder von oben nach unten (das erste liegt ganz oben). Nur das oberste lässt sich lösen.
export const RIBBONS = [
  { id: 'gold', name: 'goldene Band', color: '#e0b030', from: [380, 150], to: [900, 580] },
  { id: 'red', name: 'rote Band', color: '#c0302a', from: [640, 120], to: [640, 610] },
  { id: 'green', name: 'grüne Band', color: '#2f8a4a', from: [330, 370], to: [950, 370] },
  { id: 'blue', name: 'blaue Band', color: '#3a5ab0', from: [900, 150], to: [380, 580] },
  { id: 'white', name: 'weiße Band', color: '#efe8dc', from: [470, 130], to: [810, 600] },
];
export const LAYER = ['red', 'gold', 'blue', 'white', 'green']; // oberstes zuerst

export function ribbonSpots(left) {
  return RIBBONS.filter((r) => left.includes(r.id)).map((r) => {
    // Klickfläche: ein Stück am äußeren Ende des Bandes (wo es nicht von anderen verdeckt wird)
    const t = 0.12;
    const x = r.from[0] + (r.to[0] - r.from[0]) * t, y = r.from[1] + (r.to[1] - r.from[1]) * t;
    return { id: r.id, cx: x, cy: y, r: 30, label: `Das ${r.name}` };
  });
}

export function drawGiftBox(ctx, { left }) {
  ctx.fillStyle = '#1a120c';
  ctx.fillRect(280, 90, 720, 560);
  ctx.fillStyle = '#7a2a3a';
  ctx.fillRect(340, 150, 600, 450);
  text(ctx, 'Für Papa', 400, 128, { font: `bold 26px ${HAND}`, color: '#ffe7a0', align: 'center' });
  // von unten nach oben zeichnen
  for (const id of [...LAYER].reverse()) {
    if (!left.includes(id)) continue;
    const r = RIBBONS.find((q) => q.id === id);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 34;
    line(ctx, r.from[0] + 3, r.from[1] + 4, r.to[0] + 3, r.to[1] + 4);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 28;
    line(ctx, r.from[0], r.from[1], r.to[0], r.to[1]);
  }
}

// ---------------------------------------------------------------- Kelle und Karte
export function drawPaddleAndCard(ctx) {
  drawPicture(ctx, 'assets/closeups/kelle-karte.webp', 0, 0, 1280, 720);
  // Kelle: Türcode in Kinderschrift auf dem weißen Kreis
  ctx.save();
  ctx.translate(276, 222);
  ctx.rotate(-0.08);
  text(ctx, '2512', 0, 18, { font: `bold 54px ${HAND}`, color: '#c0302a', align: 'center' });
  ctx.restore();
  // Karte
  text(ctx, 'Für Papa.', 648, 300, { font: `bold 40px ${HAND}`, color: RED, align: 'center' });
  ['Damit du uns', 'nach Hause', 'bringst.', '', 'Deine Mira'].forEach((value, i) => text(ctx, value, 985, 220 + i * 52, { font: `bold 32px ${HAND}`, color: RED, align: 'center' }));
  return INK;
}
