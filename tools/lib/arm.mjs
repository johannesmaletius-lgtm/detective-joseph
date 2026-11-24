// Armschwung für die Laufbilder (tools/make-joseph-walk.mjs, tools/make-character-walk.mjs).
//
// In der Seitenansicht hängt der vordere Arm vor dem Körper. Er wird ausgeschnitten (shape) und beim Laufen
// um die Schulter gegen das vordere Bein geschwungen; der Ellbogen knickt beim Vorschwingen etwas ein.
// Die Stelle, die der Arm am Körper verdeckt hat, wird mit den Farben ringsum gefüllt – aber nur innerhalb
// von "behind" (Umriss des Rumpfs hinter dem Arm), mit dunkler Kante am Rücken wie im Zeichenstil.
// Der hintere Arm bleibt hinter dem Rumpf verborgen.
//
// Maße (Pixel im Standbild):
//   shoulder, elbow  Drehpunkte
//   amp              größter Schwungwinkel in Grad
//   forward          1 = Blick nach rechts, -1 = nach links
//   shape            Umriss von Ärmel und Hand
//   behind           Umriss des Rumpfs, der hinter dem Arm liegt
// Für die Ansicht nach links werden die Maße gespiegelt und an das linke Bild angelegt (mirrorArm).

import { Picture, fillPolygon } from './raster.mjs';

const OUTLINE = [0.11, 0.07, 0.05];

// Bild ohne Arm (Lücke gefüllt) und der Arm allein
export function prepareArm(source, arm) {
  const { width, height } = source;
  const armMask = polygonMask(width, height, [arm.shape]);
  const behindMask = polygonMask(width, height, [arm.behind]);
  const armImage = source.clone();
  for (let i = 0; i < width * height; i++) for (let c = 0; c < 4; c++) armImage.data[i * 4 + c] *= armMask[i];

  // Füllen: Schale um Schale von außen nach innen, jeweils Mittel der schon bekannten Nachbarn
  const hole = new Uint8Array(width * height);
  const known = new Uint8Array(width * height);
  const fill = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    if (armMask[i] > 0.02 && behindMask[i] > 0.5) hole[i] = 1;
    else if (armMask[i] <= 0.02 && source.data[i * 4 + 3] > 0.95) {
      const lum = (source.data[i * 4] + source.data[i * 4 + 1] + source.data[i * 4 + 2]) / 3;
      if (lum < 0.16) continue; // Umrisslinien nicht in die Fläche ziehen
      known[i] = 1;
      for (let c = 0; c < 3; c++) fill[i * 3 + c] = source.data[i * 4 + c] / source.data[i * 4 + 3];
    }
  }
  let open = [...hole.keys()].filter((i) => hole[i]);
  while (open.length) {
    const next = [];
    const done = [];
    for (const i of open) {
      const x = i % width, y = (i - x) / width;
      let n = 0;
      const sum = [0, 0, 0];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
        const j = yy * width + xx;
        if (!known[j]) continue;
        n++;
        for (let c = 0; c < 3; c++) sum[c] += fill[j * 3 + c];
      }
      if (n) {
        for (let c = 0; c < 3; c++) fill[i * 3 + c] = sum[c] / n;
        done.push(i);
      } else next.push(i);
    }
    if (!done.length) break;
    for (const i of done) known[i] = 1;
    open = next;
  }
  // Zeilenweise vom Körper (vorne) her fortsetzen, gespiegelt an der Kante der Lücke: so laufen Gürtel,
  // Saum und Falten ohne Naht weiter. Gibt es vorne nichts, bleibt die Füllung von oben stehen.
  const forward = arm.forward ?? 1;
  const isSource = (x, y) => x >= 0 && x < width && known[y * width + x] && !hole[y * width + x];
  for (let y = 0; y < height; y++) {
    let x = forward > 0 ? width - 1 : 0;
    let front = null; // x der Kante vorne
    for (let k = 0; k < width; k++, x -= forward) {
      const i = y * width + x;
      if (!hole[i]) {
        front = isSource(x, y) ? x : source.data[i * 4 + 3] < 0.5 ? null : front;
        continue;
      }
      if (front === null) continue;
      let from = front + (front - x);
      while (!isSource(from, y) && from !== front) from -= forward; // nicht über den Körper hinaus
      for (let q = 0; q < 3; q++) fill[i * 3 + q] = fill[(y * width + from) * 3 + q];
    }
  }
  // weichzeichnen (innerhalb der Lücke), damit gespiegelte Kleinteile nicht als Streifen auffallen
  for (let pass = 0; pass < 3; pass++) {
    const copy = fill.slice();
    for (let i = width; i < width * (height - 1); i++) {
      if (!hole[i]) continue;
      for (let q = 0; q < 3; q++) {
        let sum = copy[i * 3 + q] * 2, n = 2;
        for (const j of [i - width, i + width, i - 1, i + 1]) {
          if (!hole[j]) continue;
          sum += copy[j * 3 + q];
          n++;
        }
        fill[i * 3 + q] = sum / n;
      }
    }
  }

  const body = source.clone();
  for (let i = 0; i < width * height; i++) {
    const m = armMask[i];
    // an der Schulter bleiben Randpixel stehen (sonst entsteht dort eine helle Naht); weiter unten bewegt
    // sich der Arm, dort wird auch der Rand ersetzt, sonst bliebe sein Umriss als Linie zurück
    if (m <= 0 || (m < 0.999 && Math.floor(i / width) < arm.shoulder[1] + 20)) continue;
    const keep = 1 - m;
    const cover = hole[i] ? m * behindMask[i] : 0;
    const shade = 0.82; // hinter dem Arm liegt der Rumpf im Schatten
    for (let c = 0; c < 3; c++) body.data[i * 4 + c] = source.data[i * 4 + c] * keep + fill[i * 3 + c] * shade * cover;
    body.data[i * 4 + 3] = source.data[i * 4 + 3] * keep + cover;
  }
  // dunkle Kante, wo der gefüllte Rumpf an Leere grenzt
  const edge = [];
  for (let i = 0; i < width * height; i++) {
    if (!hole[i]) continue;
    const x = i % width, y = (i - x) / width;
    let near = 99;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy;
      const empty = xx < 0 || yy < 0 || xx >= width || yy >= height || body.data[(yy * width + xx) * 4 + 3] < 0.3;
      if (empty) near = Math.min(near, Math.hypot(dx, dy));
    }
    if (near < 3.2) edge.push([i, 1 - Math.max(0, near - 1.6) / 1.6]);
  }
  for (const [i, k] of edge) {
    const a = body.data[i * 4 + 3];
    for (let c = 0; c < 3; c++) body.data[i * 4 + c] = body.data[i * 4 + c] * (1 - k) + OUTLINE[c] * a * k;
  }
  return { body, arm: armImage, bounds: bounds(arm.shape, 4) };
}

// Wie weit der vordere Arm gerade vorne ist (-1 hinten … 1 vorne). Phase 0 = vorderer Fuß setzt vorne auf,
// dann ist der Arm ganz hinten. Die Arme laufen den Beinen ein wenig hinterher.
export function armSwing(phase) {
  return -Math.cos(2 * Math.PI * (phase - 0.06));
}

// Neue Lage eines Gitterpunkts des Arms. swing = armSwing(…)
export function deformArm(x, y, arm, forward, swing) {
  const amp = (arm.amp * Math.PI) / 180;
  const angle = -forward * amp * swing;
  const bend = -forward * amp * 0.7 * Math.max(0, swing) - forward * amp * 0.12; // Ellbogen immer etwas gebeugt
  const toForearm = smoothstep(arm.elbow[1] - 14, arm.elbow[1] + 14, y);
  const toArm = smoothstep(arm.shoulder[1] - 4, arm.shoulder[1] + 40, y);
  let p = rotate([x, y], arm.elbow, bend * toForearm);
  p = rotate(p, arm.shoulder, angle * toArm);
  return p;
}

// Arm-Maße für die Ansicht nach links: gespiegelt und so verschoben, wie das linke Bild zum rechten liegt
export function mirrorArm(arm, right, left) {
  const [dx, dy] = alignMirror(right, left);
  const map = ([x, y]) => [right.width - 1 - x + dx, y + dy];
  return { ...arm, shoulder: map(arm.shoulder), elbow: map(arm.elbow), shape: arm.shape.map(map), behind: arm.behind.map(map) };
}

// Verschiebung, bei der das gespiegelte rechte Bild am besten auf dem linken liegt (Umriss und Helligkeit)
function alignMirror(right, left) {
  let best = [0, 0], bestCost = Infinity;
  for (let dy = -10; dy <= 10; dy++) {
    for (let dx = -16; dx <= 16; dx++) {
      let cost = 0;
      for (let y = 0; y < left.height; y += 3) {
        const ry = y - dy;
        for (let x = 0; x < left.width; x += 3) {
          const rx = right.width - 1 - (x - dx);
          const o = (y * left.width + x) * 4;
          let a = 0, l = 0;
          if (ry >= 0 && ry < right.height && rx >= 0 && rx < right.width) {
            const p = (ry * right.width + rx) * 4;
            a = right.data[p + 3];
            l = right.data[p] + right.data[p + 1] + right.data[p + 2];
          }
          cost += Math.abs(a - left.data[o + 3]) + 0.5 * Math.abs(l - (left.data[o] + left.data[o + 1] + left.data[o + 2]));
        }
      }
      if (cost < bestCost) {
        bestCost = cost;
        best = [dx, dy];
      }
    }
  }
  return best;
}

function polygonMask(width, height, polygons) {
  const picture = new Picture(width, height);
  for (const polygon of polygons) fillPolygon(picture, polygon, [1, 1, 1, 1]);
  const mask = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) mask[i] = picture.data[i * 4 + 3];
  return mask;
}

function bounds(polygon, margin) {
  const xs = polygon.map((p) => p[0]), ys = polygon.map((p) => p[1]);
  return [Math.min(...xs) - margin, Math.min(...ys) - margin, Math.max(...xs) + margin, Math.max(...ys) + margin];
}

function rotate([x, y], [px, py], angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = x - px, dy = y - py;
  return [px + dx * c - dy * s, py + dx * s + dy * c];
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
