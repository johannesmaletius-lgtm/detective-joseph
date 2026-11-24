// Die Schaffnermütze (Wagen 24): wird über Josephs Fliegermütze gemalt, sobald er sie aufgesetzt hat
// (Merker capOn). Für jedes Bild (Stehen, Posen, Laufbilder) wird einmal aus den durchsichtigen
// Pixeln ermittelt, wo der Kopf sitzt – so wippt die Mütze beim Laufen mit.

const HEADS = new WeakMap();

// Oberkante und Breite der Fliegermütze im Bild (in Bildpixeln)
function headOf(image) {
  let head = HEADS.get(image);
  if (head) return head;
  const w = image.width, h = Math.min(image.height, 160);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext('2d', { willReadFrequently: true });
  c.drawImage(image, 0, 0);
  let data;
  try {
    data = c.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
  const solid = (x, y) => data[(y * w + x) * 4 + 3] > 60;
  let top = 0;
  while (top < h && !Array.from({ length: w }, (_, x) => solid(x, top)).some(Boolean)) top++;
  let left = w, right = 0;
  for (let y = top + 10; y <= Math.min(h - 1, top + 34); y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y)) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }
  head = { top, cx: (left + right) / 2, w: Math.max(1, right - left) };
  HEADS.set(image, head);
  return head;
}

const NAVY = '#1f2a3d';
const NAVY_DARK = '#121a28';
const NAVY_LIGHT = '#34455f';
const GOLD = '#d2a84c';
const GOLD_DARK = '#8a6a26';
const OUTLINE = '#0a0d14';

// ctx steht so, dass (0, 0) die linke obere Ecke des Bildes ist und 1 Einheit = 1 Bildpixel.
// facing: 'front' | 'back' | 'left' | 'right'
export function drawConductorCap(ctx, image, facing) {
  const head = headOf(image);
  if (!head) return;
  const { top, cx, w } = head;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  if (facing === 'left' || facing === 'right') side(ctx, top, cx, w, facing === 'right' ? 1 : -1);
  else frontOrBack(ctx, top, cx, w, facing === 'front');
  ctx.restore();
}

function frontOrBack(ctx, top, cx, w, front) {
  const half = w * 0.56;
  const crownTop = top - 3;
  const bandY = top + (front ? 33 : 43);
  const bandH = 12;
  const bottom = bandY + bandH;
  const lower = w * 0.5;

  // Krone: oben breiter, flacher Deckel
  const crown = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
  crown.addColorStop(0, NAVY_DARK);
  crown.addColorStop(0.4, NAVY_LIGHT);
  crown.addColorStop(1, NAVY_DARK);
  ctx.fillStyle = crown;
  ctx.beginPath();
  ctx.moveTo(cx - lower, bottom);
  ctx.lineTo(cx - half - 4, crownTop + 10);
  ctx.quadraticCurveTo(cx, crownTop - 9, cx + half + 4, crownTop + 10);
  ctx.lineTo(cx + lower, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Deckelkante
  ctx.strokeStyle = 'rgba(120, 150, 190, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - half + 2, crownTop + 11);
  ctx.quadraticCurveTo(cx, crownTop - 4, cx + half - 2, crownTop + 11);
  ctx.stroke();

  // Goldenes Band mit Kordel
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  ctx.fillStyle = NAVY_DARK;
  ctx.fillRect(cx - lower, bandY, lower * 2, bandH);
  ctx.strokeRect(cx - lower, bandY, lower * 2, bandH);
  ctx.fillStyle = GOLD;
  ctx.fillRect(cx - lower + 1, bandY + 2, lower * 2 - 2, 3);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(cx - lower + 1, bandY + 7, lower * 2 - 2, 2);

  if (!front) return;
  // Abzeichen
  ctx.fillStyle = GOLD;
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, bandY - 10, 7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff1c2';
  ctx.beginPath();
  ctx.ellipse(cx - 2, bandY - 13, 2, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Schirm: schwarz glänzend
  const visor = ctx.createLinearGradient(0, bottom, 0, bottom + 11);
  visor.addColorStop(0, '#2b2f36');
  visor.addColorStop(1, '#07080b');
  ctx.fillStyle = visor;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - lower - 2, bottom - 1);
  ctx.quadraticCurveTo(cx, bottom + 18, cx + lower + 2, bottom - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - lower * 0.6, bottom + 3);
  ctx.quadraticCurveTo(cx - lower * 0.2, bottom + 8, cx + lower * 0.1, bottom + 7);
  ctx.stroke();
}

// Von der Seite: dir = 1 schaut nach rechts, -1 nach links
function side(ctx, top, cx, w, dir) {
  const ccx = cx + dir * w * 0.02;
  const half = w * 0.5;
  const crownTop = top - 3;
  const bandY = top + 41;
  const bandH = 12;
  const bottom = bandY + bandH;

  ctx.save();
  if (dir < 0) {
    ctx.translate(ccx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-ccx, 0);
  }
  // ab hier immer nach rechts gezeichnet
  const b = ccx - half, f = ccx + half;
  const crown = ctx.createLinearGradient(b, 0, f, 0);
  crown.addColorStop(0, NAVY_DARK);
  crown.addColorStop(0.55, NAVY_LIGHT);
  crown.addColorStop(1, NAVY);
  ctx.fillStyle = crown;
  ctx.beginPath();
  ctx.moveTo(b + 4, bottom);
  ctx.lineTo(b - 4, crownTop + 9);
  ctx.quadraticCurveTo(ccx, crownTop - 5, f + 8, crownTop + 7);
  ctx.lineTo(f, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Band
  ctx.lineWidth = 2.5;
  ctx.fillStyle = NAVY_DARK;
  ctx.fillRect(b + 4, bandY, f - b - 4, bandH);
  ctx.strokeRect(b + 4, bandY, f - b - 4, bandH);
  ctx.fillStyle = GOLD;
  ctx.fillRect(b + 5, bandY + 2, f - b - 6, 3);
  ctx.fillStyle = GOLD_DARK;
  ctx.fillRect(b + 5, bandY + 7, f - b - 6, 2);

  // Schirm nach vorn
  const visor = ctx.createLinearGradient(f, bottom - 4, f, bottom + 8);
  visor.addColorStop(0, '#2b2f36');
  visor.addColorStop(1, '#07080b');
  ctx.fillStyle = visor;
  ctx.beginPath();
  ctx.moveTo(f - 14, bottom - 2);
  ctx.lineTo(f + w * 0.24, bottom + 4);
  ctx.quadraticCurveTo(f + w * 0.26, bottom + 9, f + w * 0.18, bottom + 9);
  ctx.lineTo(f - 16, bottom + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Abzeichen vorn an der Krone
  ctx.fillStyle = GOLD;
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(f - 7, bandY - 10, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
