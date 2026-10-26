// Werkzeug: erzeugt das schwarz-weiße TV-Rauschen für den kleinen Bildschirm (Platzhalter, ersetzbar).
//
// Aufruf (im Projektordner):  node tools/make-tv-noise.mjs
// Schreibt:  assets/animations/tv-noise/frame_001.png … frame_020.png  (je 120 × 104 Pixel)
//
// Die Frames bilden eine Endlosschleife: Stärke des Rauschens wechselt, ein heller Balken
// rollt langsam nach unten, und ab und zu gibt es eine horizontale Störung.

import fs from 'node:fs';
import { Picture, blur, random } from './lib/raster.mjs';

const OUT = 'assets/animations/tv-noise';
const WIDTH = 120, HEIGHT = 104, FRAMES = 20;

// Stärke je Frame (0 = schwach, 1 = stark) und welche Frames eine Störung bekommen
const STRENGTH = [0.35, 0.4, 0.62, 0.5, 0.85, 0.55, 0.42, 0.5, 0.7, 0.8, 0.5, 0.38, 0.45, 0.66, 0.78, 0.95, 0.6, 0.48, 0.42, 0.38];
const TEAR = new Set([3, 8, 14, 15]);

fs.mkdirSync(OUT, { recursive: true });
const rand = random(42);

for (let f = 0; f < FRAMES; f++) {
  const strength = STRENGTH[f];
  const picture = new Picture(WIDTH, HEIGHT);

  // grobes und feines Korn mischen – wirkt wie das Rauschen alter Röhrenfernseher
  const coarse = new Float32Array((WIDTH / 2 + 1) * (HEIGHT / 2 + 1)).map(() => rand());
  const rollingBar = (f / FRAMES) * HEIGHT; // wandert pro Durchlauf einmal von oben nach unten
  const tearRow = TEAR.has(f) ? 20 + rand() * (HEIGHT - 40) : -1000;

  for (let y = 0; y < HEIGHT; y++) {
    const barDistance = Math.min(Math.abs(y - rollingBar), HEIGHT - Math.abs(y - rollingBar));
    const bar = 0.18 * Math.exp(-(barDistance * barDistance) / 60);
    const tear = Math.exp(-((y - tearRow) ** 2) / 6);
    const shift = Math.round(tear * 9); // Zeilen in der Störung verrutschen seitlich
    for (let x = 0; x < WIDTH; x++) {
      const sx = (x + shift) % WIDTH;
      const grain = coarse[Math.floor(y / 2) * (WIDTH / 2 + 1) + Math.floor(sx / 2)];
      let value = 0.55 * grain + 0.45 * rand();
      value = 0.5 + (value - 0.5) * (0.6 + strength * 0.9); // Kontrast je nach Stärke
      value = value * (0.55 + strength * 0.35) + bar + tear * 0.45;
      // Röhrenbild: Ecken dunkler
      const nx = x / WIDTH - 0.5, ny = y / HEIGHT - 0.5;
      value *= 1 - 1.1 * (nx * nx + ny * ny);
      const v = Math.max(0, Math.min(1, value));
      picture.blend(x, y, [v, v, v, 1]);
    }
  }
  blur(picture, 1, 1, { passes: 1 }); // leicht unscharf
  picture.save(`${OUT}/frame_${String(f + 1).padStart(3, '0')}.png`);
}
console.log(`TV-Rauschen gespeichert in ${OUT}/ (${FRAMES} Frames)`);
