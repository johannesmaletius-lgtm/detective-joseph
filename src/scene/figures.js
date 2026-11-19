// Der andere Joseph – müder, dunkler. Gemalt wird er mit Josephs eigenen Standbildern, nur eingefärbt.
// Die Wagen 5 bis 7 benutzen dieses Bild (im Gepäckwagen gibt es eine eigene Fassung, siehe luggageCar.js).
//
//   OTHER_JOSEPH.images = { front: bild, left: bild, … }   (setzt das Drehbuch, sobald Joseph geladen ist)
//   paintOtherJoseph(ctx, scene, { x, y, facing })        Füße bei (x, y), Größe wie Joseph an dieser Stelle

export const OTHER_JOSEPH = { images: {} };
const cache = new Map();

// Bilder des anderen Joseph aus Josephs Animationen holen
export function prepareOtherJoseph(player) {
  for (const facing of ['front', 'back', 'left', 'right']) {
    OTHER_JOSEPH.images[facing] = player.animations[`joseph-idle-${facing}`]?.frames[0] ?? null;
  }
}

function tinted(image) {
  if (cache.has(image)) return cache.get(image);
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const c = canvas.getContext('2d');
  c.drawImage(image, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(20, 16, 40, 0.42)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  cache.set(image, canvas);
  return canvas;
}

export function paintOtherJoseph(ctx, scene, { x, y, facing = 'front', alpha = 1, height = null }) {
  const image = OTHER_JOSEPH.images[facing] ?? OTHER_JOSEPH.images.front;
  if (!image) return;
  const picture = tinted(image);
  const scale = (height ?? scene.characterHeightAt(y)) / 720; // wie bei Joseph (player.js)
  const w = picture.width * scale, h = picture.height * scale;
  ctx.save();
  ctx.globalAlpha *= alpha;
  // Schatten auf dem Boden
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.32, w * 0.08, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();
  ctx.drawImage(picture, x - w / 2, y - h, w, h);
  ctx.restore();
}
