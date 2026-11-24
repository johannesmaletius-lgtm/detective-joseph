// Werkzeug: erzeugt Josephs Laufanimation aus seinen vier Standbildern (Platzhalter, ersetzbar).
//
// Aufruf (im Projektordner):  node tools/make-joseph-walk.mjs
// Liest:     assets/characters/joseph/front.png, back.png, left.png, right.png
// Schreibt:  assets/characters/joseph/walk-front/frame_001.png … frame_008.png  (ebenso back, left, right)
//
// So funktioniert es: Über jedes Bild wird ein feines Gitter gelegt. Jeder Gitterpunkt hängt an
// einem "Knochen" (Becken, Oberschenkel, Unterschenkel, Fuß). Für jeden Frame werden die Knochen
// wie bei einem Schritt gedreht und das Bild entsprechend verformt.
// - Seitenansicht: das vordere Bein wird ausgeschnitten und bewegt; eine dunklere Kopie davon
//   wird das hintere Bein. Die Füße werden so geführt, dass der Standfuß am Boden bleibt.
// - Vorder-/Rückansicht: die Beine heben sich abwechselnd, der Körper wippt und schwankt leicht.
//
// 8 Frames = zwei Schritte. Alle Frames haben denselben Maßstab wie die Standbilder, die Füße
// stehen am unteren Bildrand und die Figur ist waagerecht mittig – genau wie bei den Standbildern.

import fs from 'node:fs';
import { Picture, fillPolygon, warpTriangle } from './lib/raster.mjs';
import { prepareArm, armSwing, deformArm } from './lib/arm.mjs';

const DIR = 'assets/characters/joseph';
const FRAMES = 8;
const STRIDE = 200;          // Schrittlänge (Bildpixel, Seitenansicht)
const LIFT = 34;             // so hoch schwingt der Fuß in der Seitenansicht
const TOE_LENGTH = 90;       // Abstand Knöchel → Fußballen (für das Abrollen)
const WALK_SPEED = 0.7;      // muss zu src/player/playerMovement.js passen (Körpergrößen pro Sekunde)
const FIGURE_HEIGHT = 720;   // muss zu SPRITE_HEIGHT in src/player/player.js passen

const deg = (d) => (d * Math.PI) / 180;

// Maße je Ansicht (Bildpixel in den Standbildern)
const RIGS = {
  right: {
    type: 'side',
    forward: 1,
    pad: 110,
    hip: [82, 415], knee: [76, 520], ankle: [54, 668],
    farOffset: [12, -17],
    waistY: 392,
    // Umriss des vorderen (vollständig sichtbaren) Beins. Oben ist er zum Becken verbreitert,
    // damit an der Hüfte keine Lücke entsteht.
    nearLeg: [[44, 392], [152, 392], [150, 420], [141, 446], [127, 468], [118, 490], [116, 520], [115, 545], [111, 558], [104, 572], [101, 580], [101, 615], [90, 617], [89, 650], [100, 672], [118, 680], [138, 684], [147, 690], [151, 697], [148, 709], [100, 718], [30, 717], [16, 709], [14, 690], [20, 662], [20, 620], [12, 612], [11, 580], [15, 558], [22, 542], [30, 522], [37, 500], [41, 470], [44, 440]],
    // Hand, die vor dem Oberschenkel hängt (gehört zum Oberkörper)
    hands: [[[16, 360], [124, 360], [124, 406], [114, 418], [100, 428], [82, 434], [64, 432], [50, 424], [38, 412], [18, 404]]],
    // Armschwung (tools/lib/arm.mjs)
    arm: {
      shoulder: [45, 192], elbow: [44, 288], amp: 10,
      shape: [[8, 182], [84, 182], [85, 292], [77, 314], [77, 341], [100, 347], [103, 400], [97, 420], [87, 433], [60, 435], [42, 425], [22, 411], [10, 381], [9, 340], [5, 300], [5, 250]],
      behind: [[24, 178], [150, 178], [150, 445], [48, 445], [38, 400], [32, 340], [27, 280], [23, 220]],
    },
  },
  left: {
    type: 'side',
    forward: -1,
    pad: 110,
    hip: [122, 415], knee: [138, 525], ankle: [169, 670],
    farOffset: [-12, -17],
    waistY: 392,
    nearLeg: [[50, 392], [170, 392], [171, 440], [175, 470], [179, 490], [186, 520], [195, 548], [201, 568], [206, 580], [206, 612], [203, 616], [204, 660], [206, 690], [206, 706], [200, 717], [120, 718], [82, 713], [77, 700], [80, 688], [90, 681], [105, 671], [122, 659], [133, 648], [133, 620], [120, 618], [120, 584], [114, 576], [104, 560], [99, 545], [100, 500], [97, 484], [80, 468], [62, 447], [53, 420]],
    hands: [[[94, 360], [152, 360], [153, 408], [146, 424], [132, 434], [112, 433], [101, 422], [96, 405]]],
    arm: {
      shoulder: [150, 190], elbow: [152, 286], amp: 10, forward: -1,
      shape: [[110, 180], [196, 180], [198, 250], [197, 292], [193, 312], [180, 320], [178, 345], [180, 380], [174, 420], [161, 436], [124, 437], [99, 426], [95, 400], [99, 370], [109, 345], [124, 338], [127, 315], [117, 292], [111, 250]],
      behind: [[60, 178], [181, 178], [183, 290], [179, 340], [173, 380], [171, 446], [60, 446]],
    },
  },
  front: {
    type: 'frontal',
    toward: 1, // läuft auf die Kamera zu
    pad: 14,
    crotchX: 147, hipY: 402, ankleY: 660,
    hands: [[[2, 330], [74, 330], [78, 400], [70, 438], [24, 440], [4, 400]], [[226, 350], [280, 350], [282, 432], [240, 440], [226, 400]], [[52, 335], [120, 335], [120, 414], [52, 414]]],
  },
  back: {
    type: 'frontal',
    toward: -1, // läuft von der Kamera weg
    pad: 14,
    crotchX: 146, hipY: 425, ankleY: 655,
    hands: [[[4, 345], [60, 345], [62, 440], [8, 440]], [[234, 345], [292, 345], [292, 442], [234, 442]]],
  },
};

for (const [name, rig] of Object.entries(RIGS)) {
  const source = Picture.load(`${DIR}/${name}.png`);
  if (rig.arm) rig.prepared = prepareArm(source, rig.arm);
  const out = `${DIR}/walk-${name}`;
  fs.mkdirSync(out, { recursive: true });
  for (let f = 0; f < FRAMES; f++) {
    const phase = f / FRAMES;
    const frame = rig.type === 'side' ? sideFrame(source, rig, phase) : frontalFrame(source, rig, phase);
    frame.save(`${out}/frame_${String(f + 1).padStart(3, '0')}.png`);
  }
  console.log(`${name.padEnd(5)} → ${out}/ (${FRAMES} Frames)`);
}
const fps = (WALK_SPEED * FIGURE_HEIGHT * FRAMES) / (2 * STRIDE);
console.log(`Passende Geschwindigkeit in src/animation/animations.js: fps ≈ ${fps.toFixed(1)}`);

// ------------------------------------------------------------------ Seitenansicht
function sideFrame(source, rig, phase) {
  const frame = new Picture(source.width + 2 * rig.pad, source.height);
  const shift = [rig.pad, 0];

  const base = rig.prepared?.body ?? source; // ohne den vorderen Arm (der kommt einzeln obendrauf)
  const legImage = masked(base, [rig.nearLeg], true);
  const bodyImage = masked(base, [[[0, 0], [source.width, 0], [source.width, rig.waistY], [0, rig.waistY]], ...rig.hands], true);

  // Fußziele beider Beine (hinteres Bein eine halbe Periode versetzt), dann Beckenhöhe so wählen,
  // dass kein Bein überstreckt wird: tiefster Punkt beim Aufsetzen, höchster in der Mitte.
  const near = footTarget(rig, phase);
  const far = footTarget(rig, (phase + 0.5) % 1);
  const reach = 0.985 * (dist(rig.hip, rig.knee) + dist(rig.knee, rig.ankle));
  let hipDrop = 6;
  for (const target of [near, far]) {
    const dx = target.x - rig.hip[0];
    const needed = target.y - Math.sqrt(Math.max(0, reach * reach - dx * dx));
    hipDrop = Math.max(hipDrop, needed - rig.hip[1]);
  }

  // hinteres Bein: dunklere Kopie, leicht nach vorne und oben versetzt (weiter weg)
  warp(frame, legImage, bounds(rig.nearLeg, 6), (x, y) => skinLeg(x, y, rig, legPose(rig, far, hipDrop), rig.farOffset), shift, [0.7, 0.68, 0.74]);
  const swing = armSwing(phase);
  const armAt = (s) => (x, y) => {
    const [ax, ay] = deformArm(x, y, rig.arm, rig.forward, s);
    return [ax, ay + hipDrop];
  };
  warp(frame, legImage, bounds(rig.nearLeg, 6), (x, y) => skinLeg(x, y, rig, legPose(rig, near, hipDrop), [0, 0]), shift);
  // Oberkörper wippt mit dem Becken
  warp(frame, bodyImage, [0, 0, source.width, rig.waistY + 60], (x, y) => [x, y + hipDrop], shift);
  // vorderer Arm schwingt gegen das vordere Bein
  if (rig.arm) warp(frame, rig.prepared.arm, rig.prepared.bounds, armAt(swing), shift);
  return frame;
}

// Wohin soll der Knöchel eines Beins bei Phase p? (Standphase: Fuß am Boden, gleitet nach hinten;
// Schwungphase: Fuß hebt ab und schwingt nach vorne.)
function footTarget(rig, p) {
  const f = rig.forward;
  const groundY = rig.ankle[1];
  const centerX = rig.hip[0];
  if (p < 0.5) {
    const u = p / 0.5;
    // am Ende der Standphase rollt der Fuß über den Ballen ab (Ferse hebt sich)
    const roll = u > 0.6 ? deg(20) * ((u - 0.6) / 0.4) : 0;
    const heel = u < 0.15 ? deg(-6) * (1 - u / 0.15) : 0;
    return {
      x: centerX + f * (STRIDE * (0.5 - u) + TOE_LENGTH * (1 - Math.cos(roll))),
      y: groundY - TOE_LENGTH * Math.sin(roll),
      angle: f * (roll + heel),
    };
  }
  const u = (p - 0.5) / 0.5;
  const ease = u * u * (3 - 2 * u);
  const angle = interpolate([[0, 20], [0.35, 8], [0.7, -4], [1, -6]], u);
  const pushOff = u < 0.35 ? TOE_LENGTH * Math.sin(deg(20)) * (1 - u / 0.35) : 0;
  return {
    x: centerX + f * STRIDE * (ease - 0.5),
    y: groundY - LIFT * Math.sin(Math.PI * u) - pushOff,
    angle: f * deg(angle),
  };
}

// Knie-Position per "inverser Kinematik": Hüfte und Knöchel sind bekannt, das Knie liegt dort,
// wo Ober- und Unterschenkel mit ihren festen Längen zusammenpassen (Knie zeigt nach vorne).
function legPose(rig, target, hipDrop) {
  const H0 = rig.hip, K0 = rig.knee, A0 = rig.ankle;
  const L1 = dist(H0, K0), L2 = dist(K0, A0);
  const H = [H0[0], H0[1] + hipDrop];
  const T = [target.x, target.y];
  const d = Math.min(Math.max(dist(H, T), Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
  const base = Math.atan2(T[1] - H[1], T[0] - H[0]);
  const bend = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const thighAngle = base - rig.forward * bend; // Knie nach vorne
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

// Neue Position eines Gitterpunkts (x, y) des Beins: Mischung aus Becken, Oberschenkel,
// Unterschenkel und Fuß – je nachdem, wo der Punkt am Bein liegt.
function skinLeg(x, y, rig, pose, offset) {
  const f = rig.forward;
  const v = [x, y];
  const root = [x, y + pose.hipDrop];
  const thigh = rotateAround(v, rig.hip, pose.thigh, pose.H);
  const shin = rotateAround(v, rig.knee, pose.shin, pose.K);
  const foot = rotateAround(v, rig.ankle, pose.foot, pose.A);

  const toThigh = smoothstep(rig.hip[1] - 22, rig.hip[1] + 18, y);
  const toShin = smoothstep(rig.knee[1] - 18, rig.knee[1] + 18, y);
  // Fuß: unterhalb des Knöchels – und der vordere Fußteil (Zehen) auch etwas höher
  const aheadOfAnkle = f * (x - rig.ankle[0]);
  const footTop = aheadOfAnkle > 20 ? rig.ankle[1] - 26 : rig.ankle[1] - 8;
  const toFoot = smoothstep(footTop - 8, footTop + 12, y);

  let p = mix(thigh, shin, toShin);
  p = mix(p, foot, toFoot);
  p = mix(root, p, toThigh);
  return [p[0] + offset[0], p[1] + offset[1]];
}

// ------------------------------------------------------------------ Vorder- und Rückansicht
function frontalFrame(source, rig, phase) {
  const frame = new Picture(source.width + 2 * rig.pad, source.height);
  const shift = [rig.pad, 0];
  const bob = 8 * (1 + Math.cos(4 * Math.PI * phase)) / 2;   // tief beim Aufsetzen
  const sway = -4 * Math.sin(2 * Math.PI * phase);           // Gewicht aufs Standbein
  const root = [sway, bob];
  const footA = frontalFoot(rig, phase);
  const footB = frontalFoot(rig, (phase + 0.5) % 1);
  const handMask = masked(new Picture(source.width, source.height), rig.hands, false, true);

  warp(frame, source, [0, 0, source.width, source.height], (x, y) => {
    const s = Math.min(1, Math.max(0, (y - rig.hipY - 20) / (rig.ankleY - rig.hipY - 20))) ** 1.3;
    const legA = mix(root, footA, s);
    const legB = mix(root, footB, s);
    const sideA = 1 - smoothstep(rig.crotchX - 10, rig.crotchX + 10, x);
    const leg = mix(legB, legA, sideA);
    const inHand = handMask.data[(Math.min(source.height - 1, Math.round(y)) * source.width + Math.min(source.width - 1, Math.round(x))) * 4 + 3] || 0;
    const weight = smoothstep(rig.hipY - 6, rig.hipY + 38, y) * (1 - inHand);
    const d = mix(root, leg, weight);
    return [x + d[0], y + d[1]];
  }, shift);
  return frame;
}

// Fuß in der Vorder-/Rückansicht: hebt sich in der Schwungphase; in der Standphase wandert er
// perspektivisch leicht nach oben (vorne) bzw. unten (hinten), weil der Körper sich weiterbewegt.
function frontalFoot(rig, p) {
  const drift = 16 * rig.toward;
  if (p < 0.5) {
    const u = p / 0.5;
    return [0, -drift * u];
  }
  const u = (p - 0.5) / 0.5;
  const ease = u * u * (3 - 2 * u);
  return [0, -drift * (1 - ease) - 26 * Math.sin(Math.PI * u)];
}

// ------------------------------------------------------------------ Hilfsfunktionen

// Verformt "source" mit einem Gitter. deform(x, y) liefert die neue Position jedes Gitterpunkts.
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

// Kopie von "source", in der nur die Flächen der Vielecke sichtbar sind.
// asMaskOnly = true: liefert nur die Maske (Alpha = Abdeckung), ohne Bildinhalt.
function masked(source, polygons, keepInside, asMaskOnly = false) {
  const mask = new Picture(source.width, source.height);
  for (const polygon of polygons) fillPolygon(mask, polygon, [1, 1, 1, 1]);
  if (asMaskOnly) return mask;
  const result = source.clone();
  for (let i = 0; i < source.width * source.height; i++) {
    const coverage = keepInside ? mask.data[i * 4 + 3] : 1 - mask.data[i * 4 + 3];
    for (let c = 0; c < 4; c++) result.data[i * 4 + c] *= coverage;
  }
  return result;
}

function bounds(polygon, margin) {
  const xs = polygon.map((p) => p[0]), ys = polygon.map((p) => p[1]);
  return [Math.min(...xs) - margin, Math.min(...ys) - margin, Math.max(...xs) + margin, Math.max(...ys) + margin];
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

// Lineare Interpolation zwischen Stützstellen [[t, Wert], …]
function interpolate(points, t) {
  for (let i = 1; i < points.length; i++) {
    if (t <= points[i][0]) {
      const [t0, v0] = points[i - 1], [t1, v1] = points[i];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return points[points.length - 1][1];
}
