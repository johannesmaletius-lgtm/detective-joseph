// Die Schaffnermütze (Wagen 24): wird über Josephs Fliegermütze gelegt, sobald er sie aufgesetzt hat
// (Merker capOn). Bilder von ChatGPT: assets/characters/joseph/cap-front|side|back.webp. Für jedes Bild (Stehen, Posen, Laufbilder) wird einmal aus den durchsichtigen
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

// Je Ansicht: Breite des Mützenkörpers im Bild (ohne Schirm), seine Mitte (x) und die Unterkante (y).
// width = Mützenbreite im Verhältnis zur Kopfbreite, bottom = Unterkante unter der Kopfoberkante (Bildpixel).
// squash = Höhe gestaucht (die Mütze sitzt tief auf dem Kopf statt hoch obenauf).
export const CAPS = {
  front: { src: 'assets/characters/joseph/cap-front.webp', body: 233, center: 142, width: 1.08, bottom: 73, squash: 0.74 },
  side: { src: 'assets/characters/joseph/cap-side.webp', body: 250, center: 140, width: 1.04, bottom: 74, squash: 0.74 },
  back: { src: 'assets/characters/joseph/cap-back.webp', body: 245, center: 146, width: 1.08, bottom: 73, squash: 0.74 },
};
const IMAGES = {};
function capImage(kind) {
  if (!IMAGES[kind]) {
    IMAGES[kind] = new Image();
    IMAGES[kind].src = CAPS[kind].src;
  }
  const image = IMAGES[kind];
  return image.complete && image.naturalWidth ? image : null;
}

// Bilder schon vorher laden (Wagen 24), damit die Mütze beim Aufsetzen sofort da ist
export function preloadConductorCap() {
  for (const kind of Object.keys(CAPS)) capImage(kind);
}

// ctx steht so, dass (0, 0) die linke obere Ecke des Joseph-Bildes ist und 1 Einheit = 1 Bildpixel.
// facing: 'front' | 'back' | 'left' | 'right'
export function drawConductorCap(ctx, image, facing) {
  const head = headOf(image);
  const kind = facing === 'left' || facing === 'right' ? 'side' : facing;
  const cap = capImage(kind);
  if (!head || !cap) return;
  const c = CAPS[kind];
  const scale = (head.w * c.width) / c.body;
  const w = cap.naturalWidth * scale;
  const h = cap.naturalHeight * scale * c.squash;
  const y = head.top + c.bottom - h;
  ctx.save();
  ctx.translate(head.cx, y);
  if (facing === 'left') ctx.scale(-1, 1); // das Bild schaut nach rechts
  ctx.drawImage(cap, -c.center * scale, 0, w, h);
  ctx.restore();
}
