// Werkzeug: erzeugt die Gegenstände fürs Inventar und kleine Requisiten im ersten Abteil
// (Platzhalter-Grafik im Comic-Stil, ersetzbar).
//
// Aufruf (im Projektordner):  node tools/make-items.mjs
// Schreibt:
//   assets/items/letter.png, key.png, knife.png, pieces.png, sheet.png, binoculars.png,
//                flashlight-empty.png, flashlight-half.png, flashlight.png, battery.png
//                                         Inventar-Bilder, je 128 × 128, mit dunklem Umriss
//   assets/ui/notebook.png               Knopf für das Notizbuch (oben rechts im Bild)
//   assets/scenes/train-compartment/letter-in-slot.png   Brief, der aus dem Schlitz am Schaltpult ragt
//   assets/scenes/train-compartment/scratches.png        eingeritzte Striche in der Tür (nur im Dunkeln sichtbar)
//
// Die Striche zeigen, wie viele Laternen pro Runde links und rechts vorbeifahren – das sind zwei der
// vier Ziffern für die Tür. Gezählt wird mit denselben Einstellungen wie im Spiel (src/scene/trainCompartment.js).
// Wer dort lap, tunnel oder lanternEvery ändert, muss dieses Werkzeug neu laufen lassen.

import fs from 'node:fs';
import { Picture, blur, drawPicture, fillCircle, fillPolygon, hex, stroke } from './lib/raster.mjs';
import { TrainMotion } from '../src/effects/trainMotion.js';
import { trainCompartment } from '../src/scene/trainCompartment.js';

const OUTLINE = hex('#1a0f08');

fs.mkdirSync('assets/items', { recursive: true });
fs.mkdirSync('assets/ui', { recursive: true });

icon('assets/items/letter.png', drawLetter);
icon('assets/items/key.png', drawKey);
icon('assets/items/knife.png', drawKnife);
icon('assets/items/pieces.png', drawPieces);
icon('assets/items/sheet.png', drawSheet);
icon('assets/items/binoculars.png', drawBinoculars);
icon('assets/items/flashlight-empty.png', (p) => drawFlashlight(p, 0));
icon('assets/items/flashlight-half.png', (p) => drawFlashlight(p, 1));
icon('assets/items/flashlight.png', (p) => drawFlashlight(p, 2));
icon('assets/items/battery.png', drawBattery);
icon('assets/ui/notebook.png', drawNotebook);
makeLetterInSlot();
makeScratches();

// ---------------------------------------------------------------- Rahmen für jedes Bild
// Zeichnet die Form auf eine eigene Ebene, legt einen gleichmäßigen dunklen Umriss und einen
// weichen Schatten darunter und speichert das Ergebnis.
function icon(file, draw, size = 128) {
  const layer = new Picture(size, size);
  draw(layer);
  const result = new Picture(size, size);
  const shadow = outlineOf(layer, 4, hex('#000000', 0.45));
  blur(shadow, 3, 3);
  drawPicture(result, shadow, 2, 4);
  drawPicture(result, outlineOf(layer, 4, OUTLINE));
  drawPicture(result, layer);
  result.save(file);
}

// Umriss = alle Pixel, die höchstens "radius" von der Form entfernt sind
function outlineOf(layer, radius, color) {
  const out = new Picture(layer.width, layer.height);
  for (let y = 0; y < layer.height; y++) {
    for (let x = 0; x < layer.width; x++) {
      let alpha = 0;
      for (let dy = -radius; dy <= radius && alpha < 1; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= layer.width || yy >= layer.height) continue;
          alpha = Math.max(alpha, layer.data[(yy * layer.width + xx) * 4 + 3]);
        }
      }
      if (alpha > 0) out.blend(x, y, color, alpha);
    }
  }
  return out;
}

// ---------------------------------------------------------------- Gegenstände
function drawLetter(p) {
  const at = turn(64, 64, -0.14);
  fillPolygon(p, at([[18, 36], [110, 36], [110, 94], [18, 94]]), hex('#efe2c0'));
  fillPolygon(p, at([[18, 94], [64, 62], [110, 94]]), hex('#e2d1a6'));              // untere Lasche
  fillPolygon(p, at([[18, 36], [64, 70], [110, 36]]), hex('#f7edd2'));              // obere Lasche
  line(p, at([[18, 36], [64, 70], [110, 36]]), 2, hex('#8a7552'));
  line(p, at([[18, 94], [56, 67]]), 2, hex('#a8936a'));
  line(p, at([[110, 94], [72, 67]]), 2, hex('#a8936a'));
  const [sx, sy] = at([[64, 70]])[0];
  fillCircle(p, sx, sy, 11, hex('#a8322a'));                                        // Siegel
  fillCircle(p, sx - 3, sy - 3, 4, hex('#d0574a'));
  line(p, at([[26, 84], [32, 80], [36, 85], [42, 80]]), 2, hex('#4a3a2a'));         // "an J."
}

function drawKnife(p) {
  // Klinge
  fillPolygon(p, [[66, 62], [104, 20], [112, 16], [108, 26], [76, 70]], hex('#cfd6dc'));
  fillPolygon(p, [[66, 62], [104, 20], [108, 21], [72, 64]], hex('#f4f7f9'));       // Schneide glänzt
  line(p, [[76, 70], [108, 26]], 2, hex('#8d979f'));
  // Griff
  fillPolygon(p, [[18, 98], [30, 110], [80, 70], [68, 58]], hex('#8a5a2b'));
  fillPolygon(p, [[18, 98], [24, 104], [74, 64], [68, 58]], hex('#a8743c'));
  fillPolygon(p, [[62, 64], [74, 76], [82, 70], [70, 58]], hex('#9aa3ab'));          // Metallkappe
  fillCircle(p, 34, 92, 3.5, hex('#d9c08a'));
  fillCircle(p, 54, 76, 3.5, hex('#d9c08a'));
}

// Kleiner Schlüssel mit Papieranhänger ("Werkzeug")
function drawKey(p) {
  const brass = hex('#d9a441'), dark = hex('#9a6f22');
  ring(p, 40, 44, 17, 9, brass);                                                    // Griff
  ring(p, 40, 44, 21, 2, dark);
  fillPolygon(p, [[52, 53], [58, 47], [104, 93], [98, 99]], brass);                 // Schaft
  fillPolygon(p, [[52, 53], [55, 50], [101, 96], [98, 99]], dark);
  fillPolygon(p, [[86, 87], [98, 75], [103, 80], [91, 92]], brass);                 // Bart
  fillPolygon(p, [[96, 97], [108, 85], [113, 90], [101, 102]], brass);
  // Anhänger an einer Schnur
  line(p, [[30, 58], [26, 76], [34, 88]], 2, hex('#6b4a2a'));
  const at = turn(40, 100, -0.3);
  fillPolygon(p, at([[18, 88], [60, 88], [66, 100], [60, 112], [18, 112]]), hex('#efe2c0'));
  line(p, at([[24, 96], [50, 96]]), 2, hex('#4a3a2a'));
  line(p, at([[24, 104], [44, 104]]), 2, hex('#4a3a2a'));
}

// Drei Papierfetzen, übereinandergelegt
function drawPieces(p) {
  const paper = hex('#e6d5a9'), light = hex('#f3e9cc'), ink = hex('#4a3a2a');
  fillPolygon(p, [[14, 44], [58, 30], [66, 48], [72, 78], [44, 92], [22, 80]], paper);
  line(p, [[26, 54], [52, 46]], 2, ink);
  line(p, [[30, 66], [58, 58]], 2, ink);
  fillPolygon(p, [[60, 22], [108, 30], [112, 62], [96, 70], [78, 60], [64, 64]], light);
  ring(p, 88, 44, 11, 2, ink);                                                      // ein Stück vom Gleiskreis
  fillPolygon(p, [[48, 70], [84, 64], [112, 76], [108, 108], [70, 112], [44, 100]], paper);
  for (let i = 0; i < 3; i++) {
    fillCircle(p, 60, 80 + i * 10, 3, ink);                                         // Punkte und Striche der Signaltabelle
    fillPolygon(p, [[70, 78 + i * 10], [88 - i * 6, 78 + i * 10], [88 - i * 6, 83 + i * 10], [70, 83 + i * 10]], ink);
  }
  line(p, [[14, 44], [58, 30], [66, 48]], 1.5, hex('#fff8e4'));
}

// Das zusammengesetzte Blatt: links der Gleiskreis mit dem Turm, rechts die Signaltabelle
function drawSheet(p) {
  const at = turn(64, 64, -0.07);
  const ink = hex('#33261a');
  fillPolygon(p, at([[12, 28], [116, 28], [116, 100], [12, 100]]), hex('#ead9ae'));
  fillPolygon(p, at([[12, 28], [116, 28], [116, 38], [12, 38]]), hex('#33261a'));   // Kopfzeile
  const [cx, cy] = at([[40, 70]])[0];
  ring(p, cx, cy, 19, 3, ink);                                                      // Gleiskreis
  fillCircle(p, cx, cy, 4, hex('#b3261e'));                                         // Turmlicht
  for (let i = 0; i < 4; i++) {
    const [[x0, y0], [x1, y1], [x2, y2]] = at([[72, 50 + i * 12], [80, 50 + i * 12], [80 + 8 + i * 5, 50 + i * 12]]);
    fillCircle(p, x0, y0, 3, ink);
    stroke(p, x1, y1, x2 + 8, y2, 5, 5, ink);
  }
  line(p, at([[47, 28], [45, 100]]), 1.5, hex('#8a7552'));                          // Risse
  line(p, at([[82, 28], [84, 100]]), 1.5, hex('#8a7552'));
  line(p, at([[12, 62], [116, 66]]), 1.5, hex('#8a7552'));
}

// Fernglas, leicht schräg von oben
function drawBinoculars(p) {
  const body = hex('#3a3f46'), edge = hex('#6c757f'), glass = hex('#7fb6d6');
  for (const dx of [0, 40]) {
    fillPolygon(p, [[22 + dx, 52], [50 + dx, 52], [54 + dx, 104], [18 + dx, 104]], body);   // Rohr
    fillPolygon(p, [[22 + dx, 52], [29 + dx, 52], [26 + dx, 104], [18 + dx, 104]], edge);   // Glanzkante
    fillPolygon(p, [[20 + dx, 96], [52 + dx, 96], [54 + dx, 110], [18 + dx, 110]], hex('#23272c')); // großes Ende
    ellipse(p, 36 + dx, 110, 18, 6, 0, glass);                                              // Linse
    ellipse(p, 31 + dx, 109, 6, 2.5, 0, hex('#d8f0ff'));
    fillPolygon(p, [[26 + dx, 30], [46 + dx, 30], [50 + dx, 54], [22 + dx, 54]], hex('#23272c')); // Okular
    fillPolygon(p, [[28 + dx, 22], [44 + dx, 22], [46 + dx, 32], [26 + dx, 32]], edge);
  }
  fillPolygon(p, [[48, 58], [64, 58], [64, 80], [48, 80]], hex('#59606a'));                  // Mittelsteg
  fillCircle(p, 56, 66, 8, hex('#b8352c'));                                                  // Stellrad
  fillCircle(p, 54, 64, 3, hex('#e2685c'));
}

// batteries: 0 = leer, 1 = eine Batterie drin (noch dunkel), 2 = leuchtet
function drawFlashlight(p, batteries) {
  const on = batteries >= 2;
  if (on) {
    for (let r = 24; r > 0; r -= 2) fillCircle(p, 98, 30, r, hex('#ffe9a0'), 0.07); // Lichtschein
  }
  // Körper (schräg von unten links nach oben rechts)
  fillPolygon(p, [[18, 98], [30, 110], [82, 58], [70, 46]], hex('#59606a'));
  fillPolygon(p, [[18, 98], [23, 103], [75, 51], [70, 46]], hex('#a9b2bb'));
  fillPolygon(p, [[14, 102], [26, 114], [32, 108], [20, 96]], hex('#3a3f46'));     // Endkappe
  fillPolygon(p, [[44, 80], [52, 88], [58, 82], [50, 74]], hex('#b8352c'));        // Schalter
  // Kopf
  fillPolygon(p, [[66, 50], [78, 62], [104, 44], [84, 24]], hex('#b7c0c8'));
  fillPolygon(p, [[66, 50], [70, 54], [90, 30], [84, 24]], hex('#e3e8ec'));
  ellipse(p, 95, 34, 15, 8, -0.78, on ? hex('#fff3b0') : hex('#2b3540'));
  if (!on) fillCircle(p, 91, 31, 2.5, hex('#9fb3c4'));                              // Glanz auf dem Glas
  if (batteries === 1) {
    // eine Batterie schaut hinten aus dem offenen Griff, daneben ein leeres Fach
    fillPolygon(p, [[6, 106], [14, 114], [22, 106], [14, 98]], hex('#c9822f'));
    fillPolygon(p, [[22, 92], [30, 100], [36, 94], [28, 86]], hex('#14171a'));
  }
}

function drawBattery(p) {
  const at = turn(64, 64, 0.35);
  fillPolygon(p, at([[44, 30], [84, 30], [84, 106], [44, 106]]), hex('#2a2a2e'));
  fillPolygon(p, at([[44, 30], [84, 30], [84, 58], [44, 58]]), hex('#c9822f'));    // Kupferkappe
  fillPolygon(p, at([[54, 20], [74, 20], [74, 30], [54, 30]]), hex('#9aa3ab'));    // Pluspol
  fillPolygon(p, at([[50, 32], [56, 32], [56, 104], [50, 104]]), hex('#ffffff', 0.25)); // Glanz
  line(p, at([[64, 38], [64, 50]]), 3, hex('#fff4dc'));                             // "+"
  line(p, at([[58, 44], [70, 44]]), 3, hex('#fff4dc'));
}

function drawNotebook(p) {
  const at = turn(64, 64, -0.08);
  fillPolygon(p, at([[30, 22], [104, 22], [104, 108], [30, 108]]), hex('#f1e4c3'));  // Seiten
  fillPolygon(p, at([[24, 18], [98, 18], [98, 104], [24, 104]]), hex('#6b3f22'));    // Einband
  fillPolygon(p, at([[24, 18], [36, 18], [36, 104], [24, 104]]), hex('#55311a'));    // Rücken
  fillPolygon(p, at([[46, 34], [86, 34], [86, 54], [46, 54]]), hex('#e8d8b0'));     // Schild
  line(p, at([[52, 44], [58, 40], [64, 46], [72, 40], [80, 44]]), 2, hex('#4a3a2a'));
  fillPolygon(p, at([[78, 18], [86, 18], [86, 104], [78, 104]]), hex('#2a1a10'));    // Gummiband
}

// ---------------------------------------------------------------- Requisiten im Abteil
// Brief, der aus dem Schlitz unter dem Briefsymbol am Schaltpult ragt (2-fache Auflösung: 56 × 36)
function makeLetterInSlot() {
  const p = new Picture(56, 36);
  fillPolygon(p, [[8, 34], [10, 6], [44, 2], [48, 30]], hex('#f3e9cc'));
  fillPolygon(p, [[10, 6], [44, 2], [45, 9], [10, 13]], hex('#dccaa0'));
  line(p, [[8, 34], [10, 6], [44, 2], [48, 30]], 2, hex('#5a4630'));
  line(p, [[16, 22], [22, 19], [27, 23], [34, 19]], 2, hex('#6b5636'));
  p.save('assets/scenes/train-compartment/letter-in-slot.png');
}

// Strichlisten, mit einem Messer in die Tür geritzt: Laternen links, Laternen rechts (2-fache Auflösung: 140 × 64)
function makeScratches() {
  const train = new TrainMotion(trainCompartment.train);
  const left = train.lanternCount('left'), right = train.lanternCount('right');
  console.log(`Laternen pro Runde: links ${left}, rechts ${right} (die beiden mittleren Ziffern des Türschlosses)`);
  const p = new Picture(140, 64);
  const scratch = (x0, y0, x1, y1) => {
    stroke(p, x0 + 1, y0 + 1, x1 + 1, y1 + 1, 2.6, 2, hex('#1c120a', 0.8)); // Schattenkante
    stroke(p, x0, y0, x1, y1, 2.2, 1.6, hex('#f1e6c8'));
  };
  const tally = (left, count) => {
    for (let i = 0; i < count; i++) {
      const bundle = Math.floor(i / 5), inBundle = i % 5;
      const x = left + bundle * 30 + inBundle * 6;
      if (inBundle < 4) scratch(x, 6 + (i % 2), x + 1, 38);
      else scratch(x - 26, 30, x - 1, 10); // jeder fünfte Strich quer
    }
  };
  tally(6, left);
  tally(74, right);
  // Pfeile darunter: ← und →
  scratch(10, 52, 40, 52); scratch(10, 52, 18, 46); scratch(10, 52, 18, 58);
  scratch(80, 52, 110, 52); scratch(110, 52, 102, 46); scratch(110, 52, 102, 58);
  p.save('assets/scenes/train-compartment/scratches.png');
}

// ---------------------------------------------------------------- Hilfsfunktionen
// Dreht Punkte um (cx, cy) – für leicht schräg liegende Gegenstände
function turn(cx, cy, angle) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return (points) => points.map(([x, y]) => [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos]);
}

function line(p, points, width, color) {
  for (let i = 1; i < points.length; i++) stroke(p, ...points[i - 1], ...points[i], width, width, color);
}

function ring(p, cx, cy, radius, width, color) {
  const points = [];
  for (let i = 0; i <= 32; i++) points.push([cx + Math.cos((i / 32) * Math.PI * 2) * radius, cy + Math.sin((i / 32) * Math.PI * 2) * radius]);
  line(p, points, width, color);
}

function ellipse(p, cx, cy, rx, ry, angle, color) {
  const points = [];
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    points.push([cx + x * Math.cos(angle) - y * Math.sin(angle), cy + x * Math.sin(angle) + y * Math.cos(angle)]);
  }
  fillPolygon(p, points, color);
}

console.log('Gegenstände und Requisiten gespeichert.');
