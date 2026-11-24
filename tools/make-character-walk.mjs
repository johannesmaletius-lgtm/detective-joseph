// Werkzeug: erzeugt Laufbilder für die anderen Figuren (Mira, Herr Tick, Herr K. …) aus ihren Standbildern.
//
// Aufruf (im Projektordner):  node tools/make-character-walk.mjs            alle Figuren
//                             node tools/make-character-walk.mjs mira tick  nur diese
// Liest:     assets/characters/<figur>/left.webp, right.webp (und front.webp, wenn ein Vorne-Gerüst da ist)
// Schreibt:  assets/characters/<figur>/walk-left/frame_001.webp … frame_008.webp (ebenso walk-right, walk-front)
//            assets/characters/walk.json  (welche Figur welche Laufbilder hat, mit Schrittlänge – damit die
//            Füße im Spiel nicht über den Boden rutschen)
//
// Wie bei Josephs Laufanimation (tools/make-joseph-walk.mjs): Ein Gitter liegt über dem Bild, die Beine
// hängen an Knochen (Becken, Oberschenkel, Unterschenkel, Fuß) und werden wie bei einem Schritt gedreht.
// Seitenansicht: Unterhalb von "cut" liegen die Beine (vorderes Bein = Bild, hinteres Bein = dunklere Kopie),
// darüber der Körper. Was in "keep" liegt (Hände, Spazierstock, Schürze, Frackschoß), bleibt am Körper.
// Röcke und Mäntel schwingen leicht mit ("sway").
// Vorderansicht: die Beine heben sich abwechselnd, der Körper wippt und schwankt (wie bei Joseph).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Picture, fillPolygon, warpTriangle } from './lib/raster.mjs';
import { prepareArm, armSwing, deformArm } from './lib/arm.mjs';

const FRAMES = 8;
const FAR_TINT = [0.66, 0.64, 0.7];
const PAD = 70; // so viel Platz kommt links und rechts dazu (die Beine schwingen über das Standbild hinaus)

// Alle Maße in Pixeln des jeweiligen Standbilds. hip/knee/ankle = Gelenke des Beins (auch wenn sie unter
// Rock oder Mantel verborgen sind), stride = Schrittlänge, lift = so hoch hebt sich der Fuß, toe = Knöchel → Ballen.
const FIGURES = {
  mira: {
    right: { hip: [124, 470], knee: [120, 630], ankle: [118, 805], cut: 662, legX: [78, 162], stride: 165, lift: 30, toe: 62, sway: 7, skirtTop: 470 },
    left: { hip: [138, 470], knee: [140, 630], ankle: [142, 805], cut: 664, legX: [92, 178], stride: 165, lift: 30, toe: 62, sway: 7, skirtTop: 470 },
    front: { crotchX: 157, hipY: 662, ankleY: 792, bob: 7, sway: 4, lift: 24, skirt: 0.5 },
  },
  tick: {
    right: { hip: [70, 420], knee: [72, 548], ankle: [72, 628], cut: 532, legX: [24, 122], stride: 120, lift: 18, toe: 55, sway: 4, skirtTop: 420 },
    left: { hip: [150, 420], knee: [148, 548], ankle: [150, 628], cut: 540, legX: [98, 200], stride: 120, lift: 18, toe: 55, sway: 4, skirtTop: 420 },
    front: { crotchX: 118, hipY: 534, ankleY: 626, bob: 5, sway: 3, lift: 18, skirt: 0.4 },
  },
  'herr-k': {
    // Spazierstock: bleibt am Körper; was er vom Schuh verdeckt, wird im Bein ergänzt (cane)
    right: { hip: [95, 520], knee: [96, 680], ankle: [92, 790], cut: 684, legX: [30, 156], stride: 140, lift: 20, toe: 70, sway: 5, skirtTop: 520,
      cane: { x: [163, 183], top: 560 } },
    left: { hip: [138, 520], knee: [138, 690], ankle: [140, 790], cut: 696, legX: [64, 200], stride: 140, lift: 20, toe: 70, sway: 5, skirtTop: 520,
      cane: { x: [41, 59], top: 560 } },
  },
  // arm: Armschwung (tools/lib/arm.mjs) – Schulter, Ellbogen, Schwungwinkel, Umriss des Arms, Rumpf dahinter.
  // Mira (Teddy), Herr Tick (Taschenuhr) und Herr K. (Stock) haben die Hände voll und schwingen nicht.
  moll: {
    right: { hip: [64, 480], knee: [62, 620], ankle: [64, 745], cut: 500, stride: 190, lift: 30, toe: 70, sway: 5, skirtTop: 480,
      keep: [[[0, 470], [34, 470], [34, 590], [0, 590]], [[44, 380], [104, 380], [104, 478], [44, 478]]],
      arm: { shoulder: [55, 190], elbow: [62, 300], amp: 8,
        shape: [[26, 175], [80, 175], [84, 240], [90, 300], [94, 360], [98, 395], [104, 430], [102, 468], [90, 481], [68, 481], [60, 455], [54, 415], [46, 398], [39, 360], [33, 300], [27, 250]],
        behind: [[30, 170], [130, 170], [130, 486], [50, 486], [44, 400], [36, 300], [30, 240]] } },
    left: { hip: [96, 480], knee: [98, 620], ankle: [96, 745], cut: 500, stride: 190, lift: 30, toe: 70, sway: 5, skirtTop: 480,
      keep: [[[126, 470], [159, 470], [159, 590], [126, 590]], [[56, 380], [116, 380], [116, 478], [56, 478]]],
      arm: { shoulder: [105, 190], elbow: [98, 300], amp: 8,
        shape: [[80, 175], [134, 175], [131, 250], [125, 300], [119, 360], [113, 398], [105, 415], [101, 470], [91, 481], [65, 481], [55, 468], [55, 430], [63, 398], [67, 360], [71, 300], [75, 240]],
        behind: [[30, 170], [128, 170], [124, 300], [114, 400], [108, 486], [30, 486]] } },
  },
  schaffner: {
    right: { hip: [75, 440], knee: [80, 610], ankle: [70, 800], cut: 445, stride: 200, lift: 32, toe: 80,
      keep: [[[40, 405], [118, 405], [118, 508], [40, 508]]],
      arm: { shoulder: [45, 205], elbow: [45, 305], amp: 10,
        shape: [[6, 192], [86, 192], [88, 335], [86, 375], [78, 398], [96, 410], [104, 425], [104, 480], [100, 506], [88, 519], [52, 519], [44, 495], [36, 445], [30, 412], [24, 388], [8, 378], [4, 330], [4, 250]],
        behind: [[18, 190], [170, 190], [170, 525], [46, 525], [38, 450], [30, 420], [20, 380], [16, 300]] } },
    left: { hip: [105, 440], knee: [100, 610], ankle: [110, 800], cut: 445, stride: 200, lift: 32, toe: 80,
      keep: [[[62, 405], [140, 405], [140, 508], [62, 508]]],
      arm: { shoulder: [135, 205], elbow: [135, 305], amp: 10,
        shape: [[98, 192], [176, 192], [176, 250], [173, 335], [173, 380], [151, 390], [147, 410], [142, 425], [142, 480], [137, 506], [125, 519], [86, 519], [75, 500], [73, 440], [77, 415], [97, 405], [91, 380], [89, 335], [95, 250]],
        behind: [[20, 190], [165, 190], [167, 300], [166, 380], [160, 420], [146, 445], [140, 525], [20, 525]] } },
  },



};
FIGURES['anderer-joseph'] = FIGURES.schaffner; // dieselbe Gestalt, fast dieselben Bilder

const wanted = process.argv.slice(2);
// Übersicht für das Spiel (src/scene/character.js): welche Figur welche Laufbilder hat
const INDEX = 'assets/characters/walk.json';
const index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, 'utf8')) : {};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'walk-'));

for (const [name, views] of Object.entries(FIGURES)) {
  if (wanted.length && !wanted.includes(name)) continue;
  const dir = `assets/characters/${name}`;
  const meta = { frames: FRAMES };
  for (const [view, rig] of Object.entries(views)) {
    const source = loadWebp(`${dir}/${view}.webp`);
    const prepared = rig.arm && prepareArm(source, { ...rig.arm, forward: view === 'left' ? -1 : 1 });
    const out = `${dir}/walk-${view}`;
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    const pngs = [];
    for (let f = 0; f < FRAMES; f++) {
      const phase = f / FRAMES;
      const frame = view === 'front' ? frontalFrame(source, rig, phase) : sideFrame(source, rig, view === 'right' ? 1 : -1, phase, prepared);
      const png = path.join(tmp, `${name}-${view}-${f}.png`);
      frame.save(png);
      pngs.push([png, `${out}/frame_${String(f + 1).padStart(3, '0')}.webp`]);
    }
    saveWebp(pngs);
    // Schrittlänge im Verhältnis zur Bildhöhe: Ein Durchlauf (8 Bilder) = zwei Schritte
    meta[view] = { stride: +((rig.stride ?? 120) / source.height).toFixed(4), pad: rig.pad ?? PAD };
    console.log(`${name.padEnd(15)} ${view.padEnd(5)} → ${out}/`);
  }
  index[name] = meta;
}
fs.writeFileSync(INDEX, `${JSON.stringify(index, null, 1)}\n`);
fs.rmSync(tmp, { recursive: true, force: true });

// ------------------------------------------------------------------ Laden und Speichern (WebP über Python/Pillow)
function loadWebp(file) {
  const png = path.join(tmp, `${path.basename(path.dirname(file))}-${path.basename(file, '.webp')}.png`);
  python(`from PIL import Image; Image.open(${JSON.stringify(file)}).convert('RGBA').save(${JSON.stringify(png)})`);
  return Picture.load(png);
}

function saveWebp(pairs) {
  const list = JSON.stringify(pairs);
  python(`import json\nfrom PIL import Image\nfor a, b in json.loads(${JSON.stringify(list)}): Image.open(a).save(b, 'WEBP', quality=88, method=6)`);
}

function python(code) {
  const result = spawnSync('python3', ['-I', '-c', code], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}

// ------------------------------------------------------------------ Seitenansicht

function sideFrame(original, rig, forward, phase, prepared) {
  const source = prepared?.body ?? original; // ohne den vorderen Arm (der kommt einzeln obendrauf)
  const pad = rig.pad ?? PAD;
  const frame = new Picture(source.width + 2 * pad, source.height);
  const shift = [pad, 0];
  const keep = rig.keep ?? [];
  const legX = rig.legX ?? [0, source.width];
  let legSource = source;
  let bodyKeep = keep;
  if (rig.cane) {
    // Der Stock gehört zum Körper; im Bein wird er (etwas breiter, samt Umriss) durch Schuh/Hose ersetzt
    const [x0, x1] = rig.cane.x;
    bodyKeep = [...keep, rect(x0, rig.cane.top, x1, source.height)];
    legSource = fillColumns(source, x0 - 3, x1 + 3, rig.cane.top);
  }

  // Beine: alles unter "cut"; knapp darüber nur die Beinspalte (verschwindet unter Rock/Mantel)
  const legMask = new Picture(source.width, source.height);
  fillPolygon(legMask, rect(0, rig.cut + 6, source.width, source.height), [1, 1, 1, 1]);
  fillPolygon(legMask, rect(legX[0], rig.cut - 30, legX[1], rig.cut + 8), [1, 1, 1, 1]);
  const keepMask = new Picture(source.width, source.height);
  for (const polygon of keep) fillPolygon(keepMask, polygon, [1, 1, 1, 1]);
  const bodyMask = new Picture(source.width, source.height);
  for (const polygon of bodyKeep) fillPolygon(bodyMask, polygon, [1, 1, 1, 1]);
  const legImage = legSource.clone();
  const bodyImage = source.clone();
  for (let y = 0; y < source.height; y++) {
    const bodyPart = 1 - smoothstep(rig.cut - 1, rig.cut + 6, y);
    for (let x = 0; x < source.width; x++) {
      const i = y * source.width + x;
      const k = keepMask.data[i * 4 + 3];
      const leg = legMask.data[i * 4 + 3] * (1 - k);
      const body = Math.max(bodyPart, bodyMask.data[i * 4 + 3]);
      for (let c = 0; c < 4; c++) {
        legImage.data[i * 4 + c] *= leg;
        bodyImage.data[i * 4 + c] *= body;
      }
    }
  }

  const near = footTarget(rig, forward, phase);
  const far = footTarget(rig, forward, (phase + 0.5) % 1);
  const reach = 0.985 * (dist(rig.hip, rig.knee) + dist(rig.knee, rig.ankle));
  let hipDrop = 3;
  for (const target of [near, far]) {
    const dx = target.x - rig.hip[0];
    const needed = target.y - Math.sqrt(Math.max(0, reach * reach - dx * dx));
    hipDrop = Math.max(hipDrop, needed - rig.hip[1]);
  }
  const legBounds = [0, rig.cut - 34, source.width, source.height];
  const farOffset = [forward * 8, -10];
  warp(frame, legImage, legBounds, (x, y) => skinLeg(x, y, rig, forward, legPose(rig, forward, far, hipDrop), farOffset), shift, FAR_TINT);
  warp(frame, legImage, legBounds, (x, y) => skinLeg(x, y, rig, forward, legPose(rig, forward, near, hipDrop), [0, 0]), shift);

  // Körper wippt mit dem Becken; Rock/Mantel schwingt unten leicht mit dem vorderen Bein
  const swing = (rig.sway ?? 0) * Math.sin(2 * Math.PI * phase) * forward;
  const skirtTop = rig.skirtTop ?? rig.cut;
  warp(frame, bodyImage, [0, 0, source.width, source.height], (x, y) => {
    const k = inside(bodyKeep, x, y) ? 0 : 1;
    return [x + swing * smoothstep(skirtTop, rig.cut, y) * k, y + hipDrop];
  }, shift);
  // vorderer Arm schwingt gegen das vordere Bein
  if (prepared) {
    const s = armSwing(phase);
    warp(frame, prepared.arm, prepared.bounds, (x, y) => {
      const [ax, ay] = deformArm(x, y, rig.arm, forward, s);
      return [ax, ay + hipDrop];
    }, shift);
  }
  return frame;
}

function footTarget(rig, f, p) {
  const groundY = rig.ankle[1];
  const centerX = rig.hip[0];
  const { stride, lift, toe } = rig;
  if (p < 0.5) {
    const u = p / 0.5;
    const roll = u > 0.6 ? deg(18) * ((u - 0.6) / 0.4) : 0;
    const heel = u < 0.15 ? deg(-6) * (1 - u / 0.15) : 0;
    return {
      x: centerX + f * (stride * (0.5 - u) + toe * (1 - Math.cos(roll))),
      y: groundY - toe * Math.sin(roll),
      angle: f * (roll + heel),
    };
  }
  const u = (p - 0.5) / 0.5;
  const ease = u * u * (3 - 2 * u);
  const angle = interpolate([[0, 18], [0.35, 8], [0.7, -4], [1, -6]], u);
  const pushOff = u < 0.35 ? toe * Math.sin(deg(18)) * (1 - u / 0.35) : 0;
  return {
    x: centerX + f * stride * (ease - 0.5),
    y: groundY - lift * Math.sin(Math.PI * u) - pushOff,
    angle: f * deg(angle),
  };
}

function legPose(rig, forward, target, hipDrop) {
  const H0 = rig.hip, K0 = rig.knee, A0 = rig.ankle;
  const L1 = dist(H0, K0), L2 = dist(K0, A0);
  const H = [H0[0], H0[1] + hipDrop];
  const T = [target.x, target.y];
  const d = Math.min(Math.max(dist(H, T), Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
  const base = Math.atan2(T[1] - H[1], T[0] - H[0]);
  const bend = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const thighAngle = base - forward * bend;
  const K = [H[0] + Math.cos(thighAngle) * L1, H[1] + Math.sin(thighAngle) * L1];
  const ankleDirection = Math.atan2(T[1] - K[1], T[0] - K[0]);
  const A = [K[0] + Math.cos(ankleDirection) * L2, K[1] + Math.sin(ankleDirection) * L2];
  return {
    H, K, A,
    thigh: thighAngle - Math.atan2(K0[1] - H0[1], K0[0] - H0[0]),
    shin: ankleDirection - Math.atan2(A0[1] - K0[1], A0[0] - K0[0]),
    foot: target.angle,
    hipDrop,
  };
}

function skinLeg(x, y, rig, f, pose, offset) {
  const v = [x, y];
  const root = [x, y + pose.hipDrop];
  const thigh = rotateAround(v, rig.hip, pose.thigh, pose.H);
  const shin = rotateAround(v, rig.knee, pose.shin, pose.K);
  const foot = rotateAround(v, rig.ankle, pose.foot, pose.A);
  const toThigh = smoothstep(rig.hip[1] - 22, rig.hip[1] + 18, y);
  const toShin = smoothstep(rig.knee[1] - 18, rig.knee[1] + 18, y);
  const aheadOfAnkle = f * (x - rig.ankle[0]);
  const footTop = aheadOfAnkle > 20 ? rig.ankle[1] - 24 : rig.ankle[1] - 8;
  const toFoot = smoothstep(footTop - 8, footTop + 12, y);
  let p = mix(thigh, shin, toShin);
  p = mix(p, foot, toFoot);
  p = mix(root, p, toThigh);
  return [p[0] + offset[0], p[1] + offset[1]];
}

// ------------------------------------------------------------------ Vorderansicht (läuft auf die Kamera zu)
function frontalFrame(source, rig, phase) {
  const pad = rig.pad ?? 14;
  const frame = new Picture(source.width + 2 * pad, source.height);
  const bob = rig.bob * (1 + Math.cos(4 * Math.PI * phase)) / 2;
  const sway = -rig.sway * Math.sin(2 * Math.PI * phase);
  const root = [sway, bob];
  const footA = frontalFoot(rig, phase);
  const footB = frontalFoot(rig, (phase + 0.5) % 1);
  const skirt = rig.skirt ?? 0;
  warp(frame, source, [0, 0, source.width, source.height], (x, y) => {
    const s = Math.min(1, Math.max(0, (y - rig.hipY - 10) / (rig.ankleY - rig.hipY - 10))) ** 1.2;
    const legA = mix(root, footA, s);
    const legB = mix(root, footB, s);
    const sideA = 1 - smoothstep(rig.crotchX - 10, rig.crotchX + 10, x);
    const leg = mix(legB, legA, sideA);
    const weight = smoothstep(rig.hipY - 6, rig.hipY + 30, y);
    const d = mix(root, leg, weight);
    // Rocksaum schwingt leicht zur Seite des Standbeins
    const hem = skirt * smoothstep(rig.hipY - 160, rig.hipY, y) * (1 - weight) * sway;
    return [x + d[0] + hem, y + d[1]];
  }, [pad, 0]);
  return frame;
}

function frontalFoot(rig, p) {
  if (p < 0.5) return [0, -10 * (p / 0.5)];
  const u = (p - 0.5) / 0.5;
  const ease = u * u * (3 - 2 * u);
  return [0, -10 * (1 - ease) - rig.lift * Math.sin(Math.PI * u)];
}

// ------------------------------------------------------------------ Hilfsfunktionen

// Kopie, in der die Spalten x0…x1 (ab Höhe top) aus den Pixeln links und rechts daneben ergänzt sind –
// so ist der Schuh hinter dem Spazierstock wieder ganz.
function fillColumns(source, x0, x1, top) {
  const result = source.clone();
  const left = x0 - 2, right = x1 + 2;
  for (let y = top; y < source.height; y++) {
    const a = (y * source.width + Math.max(0, left)) * 4;
    const b = (y * source.width + Math.min(source.width - 1, right)) * 4;
    for (let x = x0; x <= x1; x++) {
      const t = (x - left) / (right - left);
      const o = (y * source.width + x) * 4;
      for (let c = 0; c < 4; c++) result.data[o + c] = source.data[a + c] * (1 - t) + source.data[b + c] * t;
    }
  }
  return result;
}
function warp(target, source, [x0, y0, x1, y1], deform, [dx, dy], tint = null, cell = 6) {
  const cols = Math.ceil((x1 - x0) / cell), rows = Math.ceil((y1 - y0) / cell);
  const points = [];
  for (let j = 0; j <= rows; j++) {
    for (let i = 0; i <= cols; i++) {
      const s = [x0 + i * cell, y0 + j * cell];
      const [px, py] = deform(s[0], s[1]);
      points.push({ s, d: [px + dx, py + dy] });
    }
  }
  const at = (i, j) => points[j * (cols + 1) + i];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
      warpTriangle(target, source, a.s, b.s, d.s, a.d, b.d, d.d, tint);
      warpTriangle(target, source, a.s, d.s, c.s, a.d, d.d, c.d, tint);
    }
  }
}

function rect(x0, y0, x1, y1) {
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
}

// Liegt (x, y) in einem der Vielecke?
function inside(polygons, x, y) {
  return polygons.some((polygon) => {
    let hit = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  });
}

function deg(d) {
  return (d * Math.PI) / 180;
}

function rotateAround([x, y], [px, py], angle, [tx, ty]) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = x - px, dy = y - py;
  return [tx + dx * c - dy * s, ty + dx * s + dy * c];
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function interpolate(points, t) {
  for (let i = 1; i < points.length; i++) {
    if (t <= points[i][0]) {
      const [t0, v0] = points[i - 1], [t1, v1] = points[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return points[points.length - 1][1];
}
