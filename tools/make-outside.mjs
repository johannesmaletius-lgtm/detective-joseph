// Werkzeug: erzeugt die Außenwelt hinter den Zugfenstern (Platzhalter-Grafik, ersetzbar).
//
// Aufruf (im Projektordner):  node tools/make-outside.mjs
// Schreibt nach assets/scenes/train-compartment/outside/:
//   sky.png                Himmel mit Mond und Sternen – steht still (sehr weit weg)
//   clouds.png             Wolkenschleier – zieht ganz langsam vorbei
//   hills.png              ferne Hügel mit Nebel – langsam
//   treeline.png           dichte Baumreihe am Horizont – etwas schneller
//   forest.png             Wald und verschneiter Boden – mittelschnell
//   near/frame_001…020.png vorbeirauschende Stämme und ein Mast – schnell, als 20-Frame-Schleife
//
// Alle Streifen (clouds, hills, forest) sind links und rechts nahtlos, damit sie sich endlos
// wiederholen können. Größen und Positionen sind Spielkoordinaten (1280 × 720).

import fs from 'node:fs';
import { Picture, blur, drawPicture, fillCircle, fillPolygon, hex, random, stroke } from './lib/raster.mjs';

const OUT = 'assets/scenes/train-compartment/outside';
fs.mkdirSync(`${OUT}/near`, { recursive: true });

const HORIZON = 206; // Augenhöhe im Bild (Spielkoordinate y)

makeSky();
makeClouds();
makeHills();
makeTreeline();
makeForest();
makeNearFrames();

// ---------------------------------------------------------------- Himmel (1280 × 230, liegt bei y = 85)
function makeSky() {
  const top = 85;
  const sky = new Picture(1280, 230);
  const high = hex('#150f3d'), low = hex('#4d3e97'), belowHorizon = hex('#3a2f7a');
  for (let y = 0; y < sky.height; y++) {
    const gameY = top + y;
    const t = Math.min(1, Math.max(0, (gameY - top) / (HORIZON - top)));
    const color = gameY <= HORIZON ? mixColor(high, low, t ** 1.6) : belowHorizon;
    for (let x = 0; x < sky.width; x++) sky.blend(x, y, color);
  }
  // Sterne
  const rand = random(7);
  for (let i = 0; i < 160; i++) {
    const x = rand() * 1280, y = rand() * 95;
    fillCircle(sky, x, y, 0.45 + rand() * 0.6, [0.85, 0.85, 1, 1], 0.35 + rand() * 0.6);
  }
  // Mondsichel mit Schein (sichtbar im großen rechten Fenster)
  const moon = { x: 1204, y: 142 - top, r: 11 };
  for (let y = 0; y < sky.height; y++) {
    for (let x = 1100; x < 1280; x++) {
      const d = Math.hypot(x + 0.5 - moon.x, y + 0.5 - moon.y);
      sky.blend(x, y, [0.62, 0.58, 0.95, 1], 0.33 * Math.exp(-(d * d) / (2 * 26 * 26)));
      const inMoon = clamp01(moon.r - d + 0.5);
      const inShadow = clamp01(moon.r * 0.9 - Math.hypot(x + 0.5 - (moon.x + 5), y + 0.5 - (moon.y - 3)) + 0.5);
      sky.blend(x, y, [0.97, 0.94, 0.84, 1], inMoon * (1 - inShadow));
    }
  }
  sky.save(`${OUT}/sky.png`);
}

// ---------------------------------------------------------------- Wolken (1024 × 110, bei y = 88)
function makeClouds() {
  const clouds = new Picture(1024, 110);
  const rand = random(11);
  for (let i = 0; i < 70; i++) {
    const x = rand() * 1024, y = 15 + rand() * 70, w = 30 + rand() * 90, h = 5 + rand() * 9;
    for (const shift of [-1024, 0, 1024]) ellipse(clouds, x + shift, y, w, h, [0.42, 0.36, 0.78, 1], 0.12 + rand() * 0.12);
  }
  blur(clouds, 6, 3, { wrap: true });
  clouds.save(`${OUT}/clouds.png`);
}

// ---------------------------------------------------------------- Hügel (1024 × 90, bei y = 150)
function makeHills() {
  const hills = new Picture(1024, 90);
  const ridge = (x) => 32 + 11 * Math.sin((2 * Math.PI * 2 * x) / 1024 + 1) + 6 * Math.sin((2 * Math.PI * 5 * x) / 1024 + 2) + 3 * Math.sin((2 * Math.PI * 13 * x) / 1024);
  const points = [];
  for (let x = 0; x <= 1024; x += 4) points.push([x, ridge(x)]);
  fillPolygon(hills, [...points, [1024, 90], [0, 90]], hex('#2e2468'));
  // Nebel über dem Horizont: nach unten heller
  for (let y = 0; y < hills.height; y++) {
    const mist = clamp01((y - 38) / 40) * 0.55;
    for (let x = 0; x < hills.width; x++) if (mist > 0) hills.blend(x, y, hex('#6a5bb8'), mist * (y > ridge(x) ? 1 : 0.5));
  }
  blur(hills, 1, 1, { wrap: true });
  hills.save(`${OUT}/hills.png`);
}

// ---------------------------------------------------------------- Baumreihe am Horizont (1024 × 70, bei y = 150)
function makeTreeline() {
  const W = 1024, top = 150;
  const treeline = new Picture(W, 70);
  const rand = random(5);
  const base = HORIZON - top + 4; // Fuß der Baumreihe knapp unter dem Horizont
  // dichter, gezackter Saum aus kleinen Baumspitzen
  const points = [[0, base]];
  for (let x = 0; x <= W; x += 3) {
    const wave = 6 * Math.sin((2 * Math.PI * 4 * x) / W) + 4 * Math.sin((2 * Math.PI * 9 * x) / W + 2);
    points.push([x, base - 10 - wave - rand() * 9]);
  }
  points.push([W, base], [W, 70], [0, 70]);
  fillPolygon(treeline, points, hex('#241b5c'));
  for (let i = 0; i < 45; i++) {
    const x = rand() * W;
    for (const shift of [-W, 0, W]) tree(treeline, x + shift, base, 16 + rand() * 16, 1.6, random(Math.floor(rand() * 1e6)), hex('#211857'), 3);
  }
  blur(treeline, 1, 1, { wrap: true, passes: 1 });
  treeline.save(`${OUT}/treeline.png`);
}

// ---------------------------------------------------------------- Wald (2048 × 250, bei y = 60)
function makeForest() {
  const W = 2048, top = 60;
  const forest = new Picture(W, 250);
  const rand = random(23);
  const ground = (x) => HORIZON - top + 5 + 4 * Math.sin((2 * Math.PI * 3 * x) / W) + 3 * Math.sin((2 * Math.PI * 8 * x) / W + 1);

  // Boden mit Schneeflecken
  const points = [];
  for (let x = 0; x <= W; x += 8) points.push([x, ground(x)]);
  fillPolygon(forest, [...points, [W, 250], [0, 250]], hex('#2b2470'));
  for (let i = 0; i < 110; i++) {
    const x = rand() * W, y = ground(x) + 5 + rand() * 85;
    for (const shift of [-W, 0, W]) ellipse(forest, x + shift, y, 20 + rand() * 70, 2 + rand() * 4, hex('#7b82d0'), 0.22 + rand() * 0.3);
  }

  // weiter hinten: kleinere, etwas hellere (dunstige) Bäume
  for (let i = 0; i < 22; i++) {
    const x = rand() * W, y = ground(x) + 1;
    const seed = Math.floor(rand() * 1e6), height = 45 + rand() * 30;
    for (const shift of [-W, 0, W]) tree(forest, x + shift, y, height, 3 + rand() * 2, random(seed), hex('#1f1750'), 4);
  }
  // vorne: große, knorrige, kahle Bäume
  for (let i = 0; i < 12; i++) {
    const x = (i / 12) * W + rand() * 90;
    const y = ground(x) + 4 + rand() * 12;
    const seed = Math.floor(rand() * 1e6), height = 95 + rand() * 55;
    for (const shift of [-W, 0, W]) tree(forest, x + shift, y, height, 7 + rand() * 5, random(seed), hex('#140e31'), 5);
  }
  // flache Büsche und Wurzeln am Boden
  for (let i = 0; i < 36; i++) {
    const x = rand() * W, y = ground(x) + 6 + rand() * 6;
    for (const shift of [-W, 0, W]) {
      for (let k = 0; k < 4; k++) ellipse(forest, x + shift + (k - 1.5) * 7 + rand() * 4, y - rand() * 3, 7 + rand() * 7, 3 + rand() * 3, hex('#18123d'), 0.95);
    }
  }
  blur(forest, 2, 0, { wrap: true, passes: 2 }); // leichte Bewegungsunschärfe
  forest.save(`${OUT}/forest.png`);
}

// ---------------------------------------------------------------- Nahe Stämme (20 Frames à 640 × 230, bei y = 85)
function makeNearFrames() {
  const PERIOD = 1100, FRAMES = 20, STEP = PERIOD / FRAMES; // 55 Pixel pro Frame
  const strip = new Picture(PERIOD, 230);
  const dark = hex('#0c0822');
  const shapes = (dx) => {
    // zwei Baumstämme direkt neben den Gleisen
    fillPolygon(strip, [[120 + dx, -5], [168 + dx, -5], [182 + dx, 235], [110 + dx, 235]], dark, 0.95);
    fillPolygon(strip, [[610 + dx, -5], [690 + dx, -5], [705 + dx, 235], [598 + dx, 235]], dark, 0.95);
    // Strommast
    fillPolygon(strip, [[905 + dx, -5], [921 + dx, -5], [923 + dx, 235], [903 + dx, 235]], dark, 0.95);
    fillPolygon(strip, [[875 + dx, 20], [951 + dx, 20], [951 + dx, 27], [875 + dx, 27]], dark, 0.95);
    // Büsche und Schneewehen am Boden
    for (const [x, r] of [[40, 26], [260, 34], [330, 22], [470, 30], [800, 38], [1010, 28]]) {
      fillCircle(strip, x + dx, 222, r, hex('#120c2c'), 0.9);
    }
    for (const [x, w] of [[200, 90], [520, 120], [760, 70], [980, 110]]) ellipse(strip, x + dx, 190, w, 5, hex('#8d95e0'), 0.35);
  };
  for (const dx of [-PERIOD, 0, PERIOD]) shapes(dx);
  blur(strip, 16, 0, { wrap: true }); // starke Bewegungsunschärfe

  // Leitungen: hängen zwischen den Masten durch und bleiben scharf (sie laufen parallel zum Zug)
  for (let x = 0; x < PERIOD; x++) {
    const t = ((x - 913 + PERIOD) % PERIOD) / PERIOD; // 0 am Mast
    for (const base of [22, 30]) {
      const y = base + 16 * Math.sin(Math.PI * t);
      for (let dy = -1; dy <= 1; dy++) strip.blend(x, Math.round(y) + dy, dark, dy === 0 ? 0.85 : 0.35);
    }
  }

  for (let i = 0; i < FRAMES; i++) {
    const frame = new Picture(640, 230);
    const offset = Math.round(i * STEP);
    drawPicture(frame, strip, -offset, 0);
    drawPicture(frame, strip, -offset + PERIOD, 0);
    frame.save(`${OUT}/near/frame_${String(i + 1).padStart(3, '0')}.png`);
  }
}

// ---------------------------------------------------------------- Hilfsfunktionen
// Kahler, knorriger Baum: leicht krummer Stamm, weit ausladende Äste, feine Zweige
function tree(picture, x, y, height, width, rand, color, depth) {
  const branch = (x0, y0, angle, length, w, level) => {
    // jeder Ast hat einen kleinen Knick in der Mitte
    const kink = (rand() - 0.5) * 0.6;
    const xm = x0 + Math.cos(angle) * length * 0.5, ym = y0 + Math.sin(angle) * length * 0.5;
    const x1 = xm + Math.cos(angle + kink) * length * 0.5, y1 = ym + Math.sin(angle + kink) * length * 0.5;
    stroke(picture, x0, y0, xm, ym, w, w * 0.82, color);
    stroke(picture, xm, ym, x1, y1, w * 0.82, w * 0.62, color);
    if (level === 0) return;
    const count = level > 2 && rand() < 0.4 ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const spread = (i / (count - 1) - 0.5) * (0.7 + rand() * 0.7);
      // Äste streben leicht nach oben
      const upward = (-Math.PI / 2 - (angle + kink)) * 0.12;
      branch(x1, y1, angle + kink + spread + upward, length * (0.62 + rand() * 0.16), w * 0.64, level - 1);
    }
  };
  // Stamm aus drei leicht gebogenen Stücken
  let px = x, py = y, angle = -Math.PI / 2 + (rand() - 0.5) * 0.15, w = width;
  for (let i = 0; i < 3; i++) {
    const length = height * 0.13;
    const nx = px + Math.cos(angle) * length, ny = py + Math.sin(angle) * length;
    stroke(picture, px, py, nx, ny, w, w * 0.88, color);
    px = nx; py = ny; w *= 0.88;
    angle += (rand() - 0.5) * 0.3;
  }
  // Krone: 3 bis 4 Hauptäste, weit gespreizt
  const limbs = 3 + Math.round(rand());
  for (let i = 0; i < limbs; i++) {
    const spread = (i / (limbs - 1) - 0.5) * (1.5 + rand() * 0.5);
    branch(px, py, angle + spread + (rand() - 0.5) * 0.25, height * (0.24 + rand() * 0.1), w * 0.72, depth);
  }
}

function ellipse(picture, cx, cy, rx, ry, color, opacity) {
  const points = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    points.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  fillPolygon(picture, points, color, opacity);
}

function mixColor(a, b, t) {
  return a.map((v, i) => v + (b[i] - v) * t);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

console.log(`Außenwelt gespeichert in ${OUT}/`);
