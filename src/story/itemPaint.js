import { OUTLINE, circle, ellipse, line, poly, vertical } from '../core/paint.js';

// Inventar-Bilder der Gegenstände aus den Wagen 2 bis 4 – mit Code gemalt (128 × 128).
// Den dunklen Umriss und den Schatten legt paintIcon (core/paint.js) automatisch darum.
// Eigene Bilder: in items.js `image: 'assets/items/….png'` statt `paint` eintragen.

const NO = { width: 0 };

export function paintCrank(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.5);
  line(ctx, [[-44, 10], [10, 10], [10, -30]], '#4a4a4a', 12);
  line(ctx, [[-44, 10], [10, 10], [10, -30]], '#8d8d8d', 6);
  poly(ctx, [[-54, 4], [-40, 4], [-40, 16], [-54, 16]], '#6b6b6b', NO);
  poly(ctx, [[2, -54], [18, -54], [18, -28], [2, -28]], '#7b4a26', NO);
  line(ctx, [[6, -50], [6, -32]], 'rgba(255, 220, 170, 0.5)', 2);
}

export function paintRecord(ctx) {
  circle(ctx, 64, 64, 50, '#141414', NO);
  for (const r of [44, 38, 32, 26]) circle(ctx, 64, 64, r, null, { stroke: 'rgba(255, 255, 255, 0.13)', width: 1.5 });
  circle(ctx, 64, 64, 18, '#d2463a', NO);
  circle(ctx, 64, 64, 3, '#141414', NO);
  ctx.beginPath();
  ctx.arc(64, 64, 46, -2.4, -1.6);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();
  ctx.fillStyle = '#fbe9b0';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WALZER', 64, 60);
}

export function paintGlass(ctx, { glowing = false, wine = '#7a1022' } = {}) {
  if (glowing) {
    const g = ctx.createRadialGradient(64, 50, 0, 64, 50, 56);
    g.addColorStop(0, 'rgba(120, 255, 140, 0.55)');
    g.addColorStop(1, 'rgba(120, 255, 140, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  ellipse(ctx, 64, 112, 26, 7, 'rgba(225, 238, 245, 0.95)', NO);
  poly(ctx, [[60, 110], [68, 110], [68, 74], [60, 74]], 'rgba(225, 238, 245, 0.95)', NO);
  ctx.beginPath();
  ctx.moveTo(34, 14);
  ctx.quadraticCurveTo(34, 76, 64, 76);
  ctx.quadraticCurveTo(94, 76, 94, 14);
  ctx.closePath();
  ctx.fillStyle = 'rgba(225, 238, 245, 0.6)';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = wine;
  ctx.fillRect(30, 36, 70, 50);
  if (glowing) {
    ctx.fillStyle = 'rgba(110, 255, 130, 0.35)';
    ctx.fillRect(30, 36, 70, 50);
  }
  ctx.restore();
  line(ctx, [[42, 20], [44, 44]], 'rgba(255, 255, 255, 0.8)', 4);
}

export function paintVierkant(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.7);
  // Griff (T-Form) und Schaft mit Vierkant-Hülse
  poly(ctx, [[-46, -10], [-8, -10], [-8, 10], [-46, 10]], '#9aa3ab', NO);
  poly(ctx, [[-14, -6], [36, -6], [36, 6], [-14, 6]], '#b9c2c9', NO);
  poly(ctx, [[30, -12], [52, -12], [52, 12], [30, 12]], '#80888f', NO);
  poly(ctx, [[37, -5], [45, -5], [45, 5], [37, 5]], '#2c333a', NO);
  line(ctx, [[-42, -5], [-12, -5]], 'rgba(255, 255, 255, 0.6)', 3);
  circle(ctx, -38, 0, 4, '#2c333a', NO);
}

export function paintHatpin(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.8);
  line(ctx, [[-50, 0], [40, 0]], '#c9cfd4', 5);
  line(ctx, [[-50, 0], [40, 0]], '#f4f7f9', 2);
  circle(ctx, 44, 0, 13, '#8e2a6b', NO);
  circle(ctx, 40, -4, 4, 'rgba(255, 255, 255, 0.7)', NO);
  // kleiner Haken am Ende (umgebogen)
  line(ctx, [[-50, 0], [-56, -6], [-52, -12]], '#c9cfd4', 4);
}

export function paintCrowbar(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.75);
  line(ctx, [[-50, 0], [40, 0]], '#7b1f1f', 12);
  line(ctx, [[-50, -3], [40, -3]], 'rgba(255, 180, 170, 0.4)', 3);
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.quadraticCurveTo(60, 0, 58, -20);
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#7b1f1f';
  ctx.stroke();
  poly(ctx, [[-50, -6], [-62, -2], [-62, 2], [-50, 6]], '#5a5a5a', NO);
}

export function paintSeeds(ctx) {
  ctx.beginPath();
  ctx.moveTo(30, 34);
  ctx.quadraticCurveTo(26, 90, 34, 112);
  ctx.lineTo(96, 112);
  ctx.quadraticCurveTo(104, 90, 98, 34);
  ctx.closePath();
  ctx.fillStyle = '#c9a56a';
  ctx.fill();
  poly(ctx, [[28, 26], [100, 26], [98, 40], [30, 40]], '#a8844a', NO);
  ctx.fillStyle = '#5a3b16';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VOGEL-', 64, 66);
  ctx.fillText('FUTTER', 64, 82);
  // ein paar Körner
  for (const [x, y] of [[50, 22], [62, 18], [74, 22], [68, 14]]) ellipse(ctx, x, y, 4, 2.5, '#e8c46a', NO);
  // kleiner Vogel als Zeichen
  ellipse(ctx, 64, 98, 9, 6, '#3a8a3a', NO);
}

export function paintPadlockKey(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.6);
  circle(ctx, -32, 0, 22, '#c99a4a', NO);
  circle(ctx, -32, 0, 9, '#00000000', NO);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  circle(ctx, -32, 0, 9, '#000', NO);
  ctx.restore();
  poly(ctx, [[-12, -5], [48, -5], [48, 5], [-12, 5]], '#c99a4a', NO);
  poly(ctx, [[32, 5], [40, 5], [40, 18], [32, 18]], '#c99a4a', NO);
  poly(ctx, [[42, 5], [48, 5], [48, 14], [42, 14]], '#c99a4a', NO);
  line(ctx, [[-48, -10], [-24, -18]], 'rgba(255, 255, 255, 0.5)', 3);
  // Anhänger
  poly(ctx, [[-60, 16], [-36, 26], [-44, 46], [-68, 36]], '#efe2c0', NO);
}

export function paintManifest(ctx) {
  poly(ctx, [[26, 14], [98, 14], [104, 116], [22, 116]], '#efe6d2', NO);
  poly(ctx, [[46, 8], [80, 8], [80, 20], [46, 20]], '#8a8a8a', NO);
  for (let y = 34; y < 106; y += 10) line(ctx, [[34, y], [94, y]], 'rgba(60, 45, 30, 0.6)', 2);
  ctx.fillStyle = '#b3261e';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('FRACHT', 40, 31);
}

export function paintPhoto(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(0.12);
  poly(ctx, [[-44, -52], [44, -52], [44, 52], [-44, 52]], '#f4efe2', NO);
  poly(ctx, [[-36, -44], [36, -44], [36, 30], [-36, 30]], vertical(ctx, -44, 30, ['#5b5148', '#2e2924']), NO);
  // zwei gleiche Gestalten mit Schal
  for (const dx of [-14, 14]) {
    circle(ctx, dx, -16, 8, '#d9c6a6', NO);
    poly(ctx, [[dx - 11, -6], [dx + 11, -6], [dx + 12, 28], [dx - 12, 28]], '#6b4a30', NO);
    poly(ctx, [[dx - 9, -8], [dx + 9, -8], [dx + 4, 4], [dx - 4, 4]], '#ece2c4', NO);
  }
  ctx.fillStyle = '#33261a';
  ctx.font = '10px cursive';
  ctx.textAlign = 'center';
  ctx.fillText('Runde 1', 0, 44);
}

export function paintBon(ctx) {
  poly(ctx, [[34, 10], [94, 10], [94, 116], [86, 110], [78, 116], [70, 110], [62, 116], [54, 110], [46, 116], [38, 110], [34, 116]], '#fbf7ee', NO);
  for (let y = 26; y < 96; y += 12) line(ctx, [[42, y], [86, y]], 'rgba(60, 45, 30, 0.6)', 2);
  ctx.fillStyle = '#27408f';
  ctx.font = 'bold 18px cursive';
  ctx.fillText('J.', 70, 104);
}

export function paintNoteSheet(ctx) {
  poly(ctx, [[24, 20], [104, 14], [108, 108], [28, 114]], '#efe2c0', NO);
  for (let y = 36; y < 100; y += 12) line(ctx, [[36, y], [96, y - 3]], 'rgba(39, 64, 143, 0.65)', 2);
}

export { OUTLINE };

// ---------------------------------------------------------------- Wagen 5 bis 7

export function paintTicket(ctx, { stamped = false } = {}) {
  ctx.translate(64, 64);
  ctx.rotate(-0.25);
  poly(ctx, [[-52, -28], [52, -28], [52, 28], [-52, 28]], '#e9d7a8', NO);
  line(ctx, [[22, -24], [22, 24]], 'rgba(107, 74, 42, 0.7)', 2);
  ctx.fillStyle = '#2b2118';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('RINGBAHN', -46, -8);
  for (const y of [4, 14]) line(ctx, [[-46, y], [10, y]], 'rgba(43, 33, 24, 0.5)', 2);
  if (stamped) {
    ctx.beginPath();
    ctx.ellipse(36, 0, 14, 11, 0, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2c3f9a';
    ctx.stroke();
    ctx.fillStyle = '#2c3f9a';
    ctx.fillRect(30, -3, 12, 6);
  }
}

export function paintPen(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.8);
  poly(ctx, [[-50, -8], [24, -8], [24, 8], [-50, 8]], '#1d2a3a', NO);
  poly(ctx, [[24, -7], [46, 0], [24, 7]], '#c9a24a', NO);
  line(ctx, [[30, 0], [44, 0]], '#5a3a12', 1.5);
  poly(ctx, [[-30, -10], [-26, -10], [-26, 12], [-30, 12]], '#c9a24a', NO);
  line(ctx, [[-46, -4], [18, -4]], 'rgba(255, 255, 255, 0.35)', 2.5);
}

export function paintSwitchKey(ctx) {
  ctx.translate(64, 64);
  ctx.rotate(-0.6);
  // großer Bartschlüssel mit Anhänger „W7“
  circle(ctx, -32, 0, 20, '#8d8d8d', NO);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  circle(ctx, -32, 0, 8, '#000', NO);
  ctx.restore();
  poly(ctx, [[-14, -5], [50, -5], [50, 5], [-14, 5]], '#8d8d8d', NO);
  poly(ctx, [[34, 5], [50, 5], [50, 22], [34, 22]], '#8d8d8d', NO);
  line(ctx, [[-46, -8], [-24, -16]], 'rgba(255, 255, 255, 0.5)', 3);
  poly(ctx, [[-62, 16], [-34, 22], [-38, 46], [-66, 40]], '#c0392b', NO);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('W7', -60, 37);
}

export function paintScarf(ctx, { color = '#ece2c4', stripe = '#b3261e', double = false } = {}) {
  const draw = (dx, dy, fill, band) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.beginPath();
    ctx.moveTo(20, 30);
    ctx.quadraticCurveTo(64, 10, 104, 34);
    ctx.lineTo(96, 52);
    ctx.quadraticCurveTo(64, 30, 28, 48);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    poly(ctx, [[60, 38], [78, 40], [72, 110], [54, 106]], fill, NO);
    for (const y of [70, 84]) line(ctx, [[57, y], [75, y + 2]], band, 4);
    for (let i = 0; i < 4; i++) line(ctx, [[56 + i * 5, 106], [55 + i * 5, 116]], fill, 2);
    ctx.restore();
  };
  if (double) {
    draw(-10, 0, color, stripe);
    draw(12, 6, '#d9cfb0', '#27408f');
    ellipse(ctx, 74, 46, 12, 9, '#c9bf9e', NO);
    return;
  }
  draw(0, 0, color, stripe);
}
