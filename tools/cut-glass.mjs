// Werkzeug: macht die Fensterscheiben und den kleinen Bildschirm im Hintergrundbild durchsichtig.
// Hinter diese Löcher zeichnet das Spiel die fahrende Außenwelt bzw. das TV-Rauschen.
//
// Aufruf (im Projektordner):  node tools/cut-glass.mjs
// Liest:     assets/reference/train-compartment-original.png   (das unveränderte Bild)
// Schreibt:  assets/scenes/train-compartment/background.png    (mit durchsichtigen Flächen)
//
// Nur nötig, wenn sich das Hintergrundbild ändert. Zeichnest du selbst einen Hintergrund,
// kannst du die Fensterflächen auch direkt im Malprogramm transparent lassen.

import { readPNG, writePNG } from './lib/png.mjs';

const SOURCE = 'assets/reference/train-compartment-original.png';
const TARGET = 'assets/scenes/train-compartment/background.png';

// Scheiben sind deutlich blau-violett, der Bildschirm grün.
const isGlass = (r, g, b) => b >= r + 22 && b >= g + 22 && b >= 45;
const isScreen = (r, g, b) => g >= r + 25 && g >= b + 15;

// Ein Startpunkt je Fläche (Pixel im Originalbild 1536 × 1024)
const AREAS = [
  { name: 'Fenster links außen', seed: [114, 288], test: isGlass },
  { name: 'Fenster links Mitte', seed: [294, 288], test: isGlass },
  { name: 'Fenster links innen', seed: [415, 300], test: isGlass },
  { name: 'Fenster rechts innen', seed: [1146, 298], test: isGlass },
  { name: 'Fenster rechts Mitte', seed: [1260, 288], test: isGlass },
  { name: 'Fenster rechts außen', seed: [1428, 288], test: isGlass },
  { name: 'Bildschirm', seed: [1016, 294], test: isScreen },
];

// Umrechnung Originalbild → Spielkoordinaten (so wie in trainCompartment.js: Breite 1280, y −40)
const SCALE = 1280 / 1536;
const toGame = (x, y) => [Math.round(x * SCALE), Math.round(y * SCALE - 40)];

const image = readPNG(SOURCE);
const { width, height, data } = image;
const mask = new Uint8Array(width * height);

for (const area of AREAS) {
  const region = floodFill(area.seed, (i) => area.test(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]));
  fillHoles(region);
  for (const i of region.pixels) mask[i] = 1;
  const [x0, y0] = toGame(region.minX, region.minY);
  const [x1, y1] = toGame(region.maxX + 1, region.maxY + 1);
  console.log(`${area.name.padEnd(22)} ${String(region.pixels.size).padStart(6)} Pixel   Spielkoordinaten x ${x0}–${x1}, y ${y0}–${y1}`);
}

// Weiche Kante: Durchsichtigkeit über 3 × 3 Pixel mitteln
const alpha = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const xx = Math.min(width - 1, Math.max(0, x + dx)), yy = Math.min(height - 1, Math.max(0, y + dy));
        sum += mask[yy * width + xx];
      }
    }
    alpha[y * width + x] = Math.round(255 * (1 - sum / 9));
  }
}
for (let i = 0; i < width * height; i++) data[i * 4 + 3] = Math.min(data[i * 4 + 3], alpha[i]);

writePNG(TARGET, image);
console.log(`Gespeichert: ${TARGET}`);

// Alle zusammenhängenden Pixel ab "seed", für die test(index) stimmt
function floodFill([sx, sy], test) {
  const start = sy * width + sx;
  if (!test(start)) throw new Error(`Startpunkt ${sx},${sy} passt nicht zur gesuchten Farbe`);
  const pixels = new Set([start]);
  const queue = [start];
  let minX = sx, maxX = sx, minY = sy, maxY = sy;
  while (queue.length > 0) {
    const i = queue.pop();
    const x = i % width, y = (i - x) / width;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const n = ny * width + nx;
      if (!pixels.has(n) && test(n)) {
        pixels.add(n);
        queue.push(n);
      }
    }
  }
  return { pixels, minX, maxX, minY, maxY };
}

// Kleine "Inseln" innerhalb einer Fläche (z. B. gemalte Details) mit dazunehmen
function fillHoles(region) {
  const { minX, maxX, minY, maxY } = region;
  const w = maxX - minX + 3, h = maxY - minY + 3; // 1 Pixel Rand rundherum
  const outside = new Uint8Array(w * h);
  const local = (x, y) => (y - minY + 1) * w + (x - minX + 1);
  const isRegion = (x, y) => x >= minX && x <= maxX && y >= minY && y <= maxY && region.pixels.has(y * width + x);
  const queue = [0];
  outside[0] = 1;
  while (queue.length > 0) {
    const j = queue.pop();
    const lx = j % w, ly = (j - lx) / w;
    for (const [nx, ny] of [[lx + 1, ly], [lx - 1, ly], [lx, ly + 1], [lx, ly - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (outside[n]) continue;
      if (isRegion(nx + minX - 1, ny + minY - 1)) continue;
      outside[n] = 1;
      queue.push(n);
    }
  }
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!outside[local(x, y)]) region.pixels.add(y * width + x);
    }
  }
}
