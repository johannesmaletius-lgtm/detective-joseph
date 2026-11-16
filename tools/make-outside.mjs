// Werkzeug: erzeugt die Außenwelt hinter den Zugfenstern (Platzhalter-Grafik, ersetzbar).
//
// Aufruf (im Projektordner):  node tools/make-outside.mjs
// Schreibt nach assets/scenes/train-compartment/outside/:
//   sky.png        Himmel mit Sternen – dreht sich einmal pro Runde (der Zug fährt im Kreis)
//   moon.png       Mondsichel mit Schein – wandert langsam von Fenster zu Fenster
//   clouds.png     Wolkenschleier – zieht ganz langsam vorbei
//   hills.png      ferne Hügel mit Nebel – langsam
//   tower.png      ferner Turm in der Mitte des Kreises – steht immer still im selben Fenster
//   treeline.png   dichte Baumreihe am Horizont – etwas schneller
//   forest.png     Wald und verschneiter Boden – mittelschnell
//   near.png       vorbeirauschende Stämme und Strommasten direkt neben den Gleisen – sehr schnell
//
// Alle Streifen (sky, clouds, hills, treeline, forest, near) sind links und rechts nahtlos, damit sie
// sich endlos wiederholen können. Größen und Positionen sind Spielkoordinaten (1280 × 720).

import fs from 'node:fs';
import { Picture, blur, drawPicture, fillCircle, fillPolygon, hex, random, stroke } from './lib/raster.mjs';

const OUT = 'assets/scenes/train-compartment/outside';
fs.mkdirSync(OUT, { recursive: true });

const HORIZON = 206; // Augenhöhe im Bild (Spielkoordinate y)

makeSky();
makeMoon();
makeClouds();
makeHills();
makeTower();
makeTreeline();
makeForest();
makeNear();

// ---------------------------------------------------------------- Himmel (1024 × 230, liegt bei y = 85)
// Die Breite steht für einmal rundherum (360°): Pro Runde zieht der ganze Streifen einmal vorbei.
function makeSky() {
  const top = 85;
  const sky = new Picture(1024, 230);
  const high = hex('#150f3d'), low = hex('#4d3e97'), belowHorizon = hex('#3a2f7a');
  for (let y = 0; y < sky.height; y++) {
    const gameY = top + y;
    const t = Math.min(1, Math.max(0, (gameY - top) / (HORIZON - top)));
    const color = gameY <= HORIZON ? mixColor(high, low, t ** 1.6) : belowHorizon;
    for (let x = 0; x < sky.width; x++) sky.blend(x, y, color);
  }
  // Sterne (am Rand doppelt gezeichnet, damit der Streifen nahtlos bleibt)
  const rand = random(7);
  for (let i = 0; i < 130; i++) {
    const x = rand() * sky.width, y = rand() * 95, r = 0.45 + rand() * 0.6, opacity = 0.35 + rand() * 0.6;
    for (const shift of [-sky.width, 0, sky.width]) fillCircle(sky, x + shift, y, r, [0.85, 0.85, 1, 1], opacity);
  }
  sky.save(`${OUT}/sky.png`);
}

// ---------------------------------------------------------------- Mond (128 × 128, Mitte = Mondmitte)
function makeMoon() {
  const moon = new Picture(128, 128);
  const c = 64, r = 11;
  for (let y = 0; y < moon.height; y++) {
    for (let x = 0; x < moon.width; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      moon.blend(x, y, [0.62, 0.58, 0.95, 1], 0.33 * Math.exp(-(d * d) / (2 * 22 * 22)));
      const inMoon = clamp01(r - d + 0.5);
      const inShadow = clamp01(r * 0.9 - Math.hypot(x + 0.5 - (c + 5), y + 0.5 - (c - 3)) + 0.5);
      moon.blend(x, y, [0.97, 0.94, 0.84, 1], inMoon * (1 - inShadow));
    }
  }
  moon.save(`${OUT}/moon.png`);
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

// ---------------------------------------------------------------- Turm (32 × 64, Fuß knapp unter dem Horizont)
// Steht in der Mitte des Kreises, den der Zug fährt – deshalb bewegt er sich nie.
// Das blinkende Licht auf der Spitze zeichnet das Spiel selbst (siehe trainCompartment.js).
function makeTower() {
  const tower = new Picture(32, 64);
  const color = hex('#1c1550');
  fillPolygon(tower, [[13, 14], [19, 14], [22, 64], [10, 64]], color);   // schlanker Schaft
  fillPolygon(tower, [[9, 13], [23, 13], [23, 15], [9, 15]], color);     // Galerie
  fillPolygon(tower, [[12, 8], [20, 8], [20, 13], [12, 13]], color, 0.9); // Laternenraum
  fillPolygon(tower, [[11, 8], [16, 3], [21, 8]], color);                 // spitzes Dach
  fillPolygon(tower, [[15.5, 0], [16.5, 0], [16.5, 4], [15.5, 4]], color); // Antenne
  blur(tower, 0.6, 0.6, { passes: 1 });
  tower.save(`${OUT}/tower.png`);
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

// ---------------------------------------------------------------- Nahe Stämme und Masten (4400 × 230, bei y = 85)
// Ein langer Streifen statt einzelner Frames: Das Spiel schiebt ihn stufenlos weiter, so ruckelt
// nichts. Masten und Stämme stehen unregelmäßig, damit man das Muster nicht wiedererkennt.
function makeNear() {
  const W = 4400;
  const strip = new Picture(W, 230);
  const dark = hex('#0c0822');
  const poles = [260, 1380, 2390, 3520]; // Strommasten
  const trunks = [ // [x, Breite] – einzelne Stämme und Gruppen, dazwischen freie Sicht
    [610, 46], [672, 28], [1690, 72], [1960, 36], [2018, 54], [2870, 64], [3150, 30],
    [3880, 58], [3964, 34], [4160, 44],
  ];
  const shapes = (dx) => {
    for (const [x, w] of trunks) {
      fillPolygon(strip, [[x + dx, -5], [x + w + dx, -5], [x + w * 1.25 + dx, 235], [x - w * 0.15 + dx, 235]], dark, 0.95);
    }
    for (const x of poles) {
      fillPolygon(strip, [[x - 8 + dx, -5], [x + 8 + dx, -5], [x + 10 + dx, 235], [x - 10 + dx, 235]], dark, 0.95);
      fillPolygon(strip, [[x - 38 + dx, 20], [x + 38 + dx, 20], [x + 38 + dx, 27], [x - 38 + dx, 27]], dark, 0.95);
    }
    // Büsche und Schneewehen am Boden
    for (const [x, r] of [[40, 26], [260, 34], [330, 22], [470, 30], [800, 38], [1010, 28], [1240, 30], [1530, 24],
      [1850, 36], [2230, 28], [2600, 34], [2760, 22], [3060, 30], [3330, 38], [3700, 26], [4040, 32], [4300, 24]]) {
      fillCircle(strip, x + dx, 222, r, hex('#120c2c'), 0.9);
    }
    for (const [x, w] of [[200, 90], [520, 120], [760, 70], [980, 110], [1450, 140], [2120, 90], [2480, 120],
      [3000, 80], [3420, 130], [3800, 70], [4250, 100]]) {
      ellipse(strip, x + dx, 190, w, 5, hex('#8d95e0'), 0.35);
    }
  };
  for (const dx of [-W, 0, W]) shapes(dx);
  blur(strip, 14, 0, { wrap: true }); // starke Bewegungsunschärfe

  // Leitungen: hängen zwischen den Masten durch und bleiben scharf (sie laufen parallel zum Zug)
  poles.forEach((from, i) => {
    const to = poles[(i + 1) % poles.length] + (i + 1 === poles.length ? W : 0);
    const sag = 16 * ((to - from) / 1100);
    for (let x = from; x < to; x++) {
      const t = (x - from) / (to - from);
      for (const base of [22, 30]) {
        const y = base + sag * Math.sin(Math.PI * t);
        for (let dy = -1; dy <= 1; dy++) strip.blend(x % W, Math.round(y) + dy, dark, dy === 0 ? 0.85 : 0.35);
      }
    }
  });
  strip.save(`${OUT}/near.png`);
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
