import { drawSymbol } from './wagon13.js';
import { SERIF, contactShadow, roundedRect, seeded } from './common.js';

// Miras Modellbahn (Wagen 15) – alles im Code gezeichnet.
//
// Ein Spieltisch mit grünem Filz in Schrägansicht: ein Ringgleis (vorne und hinten ein langes
// Gerade-Stück, links verschwindet es im Patchwork-Tunnel, rechts läuft es aus dem Bild).
// In der Mitte des Rings steht der Turm mit dem Licht – wie draußen beim echten Zug.
// Die vierzehn Blechwagen sind lithografiert wie altes Spielzeug; jeder trägt auf einem
// Emaille-Schild das Zeichen seines Wagens (Bank, Koffer, Brief … Kreuz, Zeitung).
//
// Die Bedienung (Ziehen, Tauschen, Abfahrt) steht in src/puzzles/modelRailway.js.

// ============================================================================================
//  Perspektive: Tischkoordinaten X (links/rechts), Z (hinten 0 … vorne 1000), H (Höhe)
// ============================================================================================

const Y0 = 118;          // Hinterkante des Tischs auf dem Bildschirm
const K = 0.57;          // so stark ist die Tiefe gestaucht
const CAMERA_Z = 2600;   // ungefähr dort sitzt das Auge (für die Frage: welche Seite sieht man?)

export function scaleAt(Z) {
  return 0.78 + 0.22 * (Z / 1000);
}

export function project(X, Z, H = 0) {
  const s = scaleAt(Z);
  return { x: 640 + X * s, y: Y0 + Z * K - H * s, s };
}

// Bildschirmpunkt → Punkt auf dem Tisch (Höhe 0)
export function unproject(x, y) {
  const Z = (y - Y0) / K;
  return { X: (x - 640) / scaleAt(Z), Z };
}

// ============================================================================================
//  Das Gleis: ein Ring. u = Weg in Fahrtrichtung.
//    vorne (Z = ZN) von rechts nach links → Bogen links (im Tunnel) → hinten von links nach rechts
//    → rechts außerhalb des Bilds zurück nach vorne
// ============================================================================================

const ZN = 790, ZF = 400;
const ZC = (ZN + ZF) / 2, R = (ZN - ZF) / 2;
const XA = -400;                 // hier beginnt der Bogen
const NEAR_START = 780, FAR_END = 840;
const LN = NEAR_START - XA, LC = Math.PI * R, LF = FAR_END - XA;
export const RING = LN + LC + LF;
const PORTAL = 0.62;             // Winkel im Bogen, an dem die Tunnelmündungen sitzen
export const PORTAL_NEAR = LN + R * PORTAL;
export const PORTAL_FAR = LN + R * (Math.PI - PORTAL);

export function pathAt(u) {
  u = ((u % RING) + RING) % RING;
  if (u < LN) return { X: NEAR_START - u, Z: ZN, dx: -1, dz: 0 };
  if (u < LN + LC) {
    const p = (u - LN) / R;
    return { X: XA - R * Math.sin(p), Z: ZC + R * Math.cos(p), dx: -Math.cos(p), dz: -Math.sin(p) };
  }
  return { X: XA + (u - LN - LC), Z: ZF, dx: 1, dz: 0 };
}

const farU = (X) => LN + LC + (X - XA);

// ---------------------------------------------------------------- Fahrzeuge
export const LOCO_LENGTH = 144;
export const WAGON_LENGTH = 116;
const WIDTH = 42;
const GAP = 8;

// Die Lok steht vorne links (Nase zum Tunnel), dahinter Platz 1–7 nach rechts,
// hinten Platz 8 (rechts) bis 14 (links) – einmal um den Ring herum.
export const LOCO_U = (NEAR_START + 395) - LOCO_LENGTH / 2;
export const SLOT_U = [
  ...Array.from({ length: 7 }, (_, i) => LOCO_U - LOCO_LENGTH / 2 - GAP - WAGON_LENGTH / 2 - i * (WAGON_LENGTH + GAP)),
  ...Array.from({ length: 7 }, (_, i) => farU(600 - i * (WAGON_LENGTH + GAP))),
];

// Die vierzehn Wagen (Reihenfolge = Wagen 1–14 des echten Zugs)
export const WAGONS = [
  { symbol: 'bench', style: 'coach', body: '#2f5a48', trim: '#e2c272', roof: '#6c7178', curtain: '#a8402e' },
  { symbol: 'suitcase', style: 'van', body: '#80502e', trim: '#e3bd70', roof: '#6e6157' },
  { symbol: 'letter', style: 'mail', body: '#d6a224', trim: '#221d16', roof: '#4c4a46' },
  { symbol: 'glass', style: 'dining', body: '#7d1f27', trim: '#e7c574', roof: '#5e4d48', curtain: '#f2e6c8' },
  { symbol: 'bed', style: 'sleeper', body: '#233263', trim: '#e3c46e', roof: '#4e5468', curtain: '#5c80c0' },
  { symbol: 'umbrella', style: 'lost', body: '#5b6d5c', trim: '#ead9a6', roof: '#666d70' },
  { symbol: 'whisky', style: 'bar', body: '#55301f', trim: '#dcae5c', roof: '#5a4a40' },
  { symbol: 'film', style: 'cinema', body: '#1f1d22', trim: '#e5c060', roof: '#3a3a40', curtain: '#962228' },
  { symbol: 'mirror', style: 'mirror', body: '#a9b2bc', trim: '#58606c', roof: '#8a929c' },
  { symbol: 'horn', style: 'speaker', body: '#6d6c30', trim: '#e9d890', roof: '#62644f' },
  { symbol: 'clock', style: 'clock', body: '#aa6a2a', trim: '#f2d99c', roof: '#6b5442' },
  { symbol: 'note', style: 'music', body: '#5d2d57', trim: '#e8c670', roof: '#5a4a5c', curtain: '#dcaacb' },
  { symbol: 'chapel', style: 'chapel', body: '#dcd2b9', trim: '#7d5a36', roof: '#8a7462' },
  { symbol: 'newspaper', style: 'news', body: '#74756f', trim: '#efeee4', roof: '#5e5e5e' },
];

// ============================================================================================
//  Farben
// ============================================================================================

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(hex, amount, alpha = 1) {
  const [r, g, b] = rgb(hex).map((v) => Math.max(0, Math.min(255, Math.round(v + amount))));
  return alpha === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function gold(c, x0, y0, x1, y1) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#fff0b8');
  g.addColorStop(0.35, '#e2b85a');
  g.addColorStop(0.7, '#a67a2a');
  g.addColorStop(1, '#6e4c16');
  return g;
}

function ellipse(c, x, y, rx, ry, rot = 0) {
  c.beginPath();
  c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, Math.PI * 2);
}

function poly(c, points) {
  c.beginPath();
  points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
  c.closePath();
}

// Ein Bild in doppelter Auflösung, einmal gemalt (für scharfe Kanten auf Retina-Bildschirmen)
const LAYERS = {};
function layer(key, x, y, w, h, draw, res = 2) {
  if (!LAYERS[key]) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(w * res);
    canvas.height = Math.ceil(h * res);
    const c = canvas.getContext('2d');
    c.scale(res, res);
    c.translate(-x, -y);
    draw(c);
    LAYERS[key] = { canvas, x, y, w, h };
  }
  return LAYERS[key];
}

function blit(ctx, entry) {
  ctx.drawImage(entry.canvas, entry.x, entry.y, entry.w, entry.h);
}

// ============================================================================================
//  Fahrzeuge in 3D: eine Kiste mit bemalter Seite, Dach und Stirnseiten
// ============================================================================================

// Lage eines Fahrzeugs: x = entlang (nach rechts auf dem Bildschirm), z = quer (zum Auge hin), h = Höhe
function frameFor(pose, L, cut = null) {
  let ex = { x: pose.dx, z: pose.dz };
  const a = project(pose.X - ex.x * 10, pose.Z - ex.z * 10);
  const b = project(pose.X + ex.x * 10, pose.Z + ex.z * 10);
  const flipped = b.x < a.x;
  if (flipped) ex = { x: -ex.x, z: -ex.z };
  let ez = { x: -ex.z, z: ex.x };
  if (ez.x * -pose.X + ez.z * (CAMERA_Z - pose.Z) < 0) ez = { x: -ez.x, z: -ez.z };
  const lift = pose.lift ?? 0;
  return {
    L, W: WIDTH, flipped, ex, ez, pose, lift, cut,
    // liegt x im sichtbaren Teil (vor der Tunnelmündung)?
    shows: (x) => !cut || (x >= cut[0] && x <= cut[1]),
    pt: (x, z, h) => project(pose.X + ex.x * x + ez.x * z, pose.Z + ex.z * x + ez.z * z, h + lift),
    // Sieht man die Stirnseite bei x = ±L/2?
    endVisible(sign) {
      const cx = pose.X + ex.x * sign * L / 2, cz = pose.Z + ex.z * sign * L / 2;
      return (ex.x * sign) * (0 - cx) + (ex.z * sign) * (CAMERA_Z - cz) > 0;
    },
  };
}

// Zeichnet in einer senkrechten Ebene längs des Fahrzeugs (Abstand z zur Mitte):
// x von −L/2 bis L/2, y = −Höhe
function inPlane(ctx, fr, z, draw) {
  const A = fr.pt(-fr.L / 2, z, 0), B = fr.pt(fr.L / 2, z, 0), C = fr.pt(0, z, 0);
  ctx.save();
  ctx.transform((B.x - A.x) / fr.L, (B.y - A.y) / fr.L, 0, C.s, C.x, C.y);
  if (fr.cut) {
    const lo = Math.max(fr.cut[0], -400), hi = Math.min(fr.cut[1], 400);
    ctx.beginPath();
    ctx.rect(lo, -400, Math.max(0, hi - lo), 800);
    ctx.clip();
  }
  draw(ctx);
  ctx.restore();
}

// Fläche in Höhe h (z. B. ein Dach); false, wenn sie ganz im Tunnel liegt
function quad(ctx, fr, x0, x1, z0, z1, h) {
  if (x0 > x1) [x0, x1] = [x1, x0];
  if (fr.cut) {
    x0 = Math.max(x0, fr.cut[0]);
    x1 = Math.min(x1, fr.cut[1]);
    if (x0 >= x1) return false;
  }
  poly(ctx, [fr.pt(x0, z1, h), fr.pt(x1, z1, h), fr.pt(x1, z0, h), fr.pt(x0, z0, h)]);
  return true;
}

function vehicleShadow(ctx, fr) {
  const c = fr.pt(0, 0, -fr.lift);
  const lift = Math.min(1, fr.lift / 40);
  const rx = (fr.L / 2 + 10 + lift * 16) * c.s;
  const ry = (fr.W / 2 + 6 + lift * 10) * K;
  contactShadow(ctx, c.x - 8 - lift * 10, c.y + 3 + lift * 6, rx, ry, 0.5 - lift * 0.25);
  if (lift < 0.2) contactShadow(ctx, c.x - 3, c.y + 1, rx * 0.85, ry * 0.55, 0.45);
}

// Rad in Seitenansicht (Mitte cx, cy), dreht sich mit angle
function wheel(c, cx, cy, r, angle, { spokes = 6, tone = '#2a2626', hub = '#c8a050', tire = '#0d0c0c' } = {}) {
  c.fillStyle = tire;
  ellipse(c, cx, cy, r, r);
  c.fill();
  const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r * 0.85);
  g.addColorStop(0, shade(tone, 70));
  g.addColorStop(1, tone);
  c.fillStyle = g;
  ellipse(c, cx, cy, r * 0.8, r * 0.8);
  c.fill();
  c.strokeStyle = shade(tone, -40);
  c.lineWidth = Math.max(0.6, r * 0.14);
  for (let i = 0; i < spokes; i++) {
    const a = angle + (i / spokes) * Math.PI * 2;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * r * 0.2, cy + Math.sin(a) * r * 0.2);
    c.lineTo(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72);
    c.stroke();
  }
  c.fillStyle = hub;
  ellipse(c, cx, cy, r * 0.22, r * 0.22);
  c.fill();
  // Glanz auf dem Laufkranz
  c.strokeStyle = 'rgba(255, 240, 210, 0.45)';
  c.lineWidth = Math.max(0.5, r * 0.1);
  c.beginPath();
  c.arc(cx, cy, r * 0.92, -2.6, -1.2);
  c.stroke();
}

// ---------------------------------------------------------------- Wagen: bemalte Seite (Textur)
const RES = 3;
const TEX_H = 92;           // Höhe der Seite: 0 = oben (Höhe 91) … 92 = Schiene
const ROOF_H = 81;          // Dachfläche
const TEXTURES = {};

function wagonTexture(index) {
  if (!TEXTURES[index]) {
    const canvas = document.createElement('canvas');
    canvas.width = WAGON_LENGTH * RES;
    canvas.height = TEX_H * RES;
    const c = canvas.getContext('2d');
    c.scale(RES, RES);
    paintWagonSide(c, WAGONS[index], index);
    TEXTURES[index] = canvas;
  }
  return TEXTURES[index];
}

// Fensterplätze (für das Licht beim Losfahren): [x, y, w, h] in Texturkoordinaten
const WINDOWS = {};

function paintWagonSide(c, w, index) {
  const L = WAGON_LENGTH;
  const random = seeded(31 + index * 7);
  WINDOWS[index] = [];

  // --- Puffer
  for (const right of [false, true]) {
    c.fillStyle = '#1b1917';
    c.fillRect(right ? L - 9 : 3, 73, 6, 4);
    c.fillStyle = gold(c, 0, 70, 0, 80);
    roundedRect(c, right ? L - 3.4 : 0.4, 70.5, 3, 9, 1.2);
    c.fill();
  }

  // --- Fahrgestell
  const frame = c.createLinearGradient(0, 70, 0, 80);
  frame.addColorStop(0, '#3a3734');
  frame.addColorStop(0.3, '#1d1b1a');
  frame.addColorStop(1, '#0e0d0c');
  c.fillStyle = frame;
  c.fillRect(7, 71, L - 14, 5.5);
  c.fillStyle = 'rgba(255, 235, 200, 0.18)';
  c.fillRect(7, 71, L - 14, 0.8);
  // Federn und Achslager (vor den Rädern)
  for (const x of [22, L - 22]) {
    c.strokeStyle = '#2b2826';
    c.lineWidth = 1.1;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(x - 10 + i, 76.5 + i * 0.9);
      c.quadraticCurveTo(x, 79 + i * 0.9, x + 10 - i, 76.5 + i * 0.9);
      c.stroke();
    }
    c.fillStyle = gold(c, x - 3, 79, x + 3, 86);
    roundedRect(c, x - 2.6, 80, 5.2, 4.6, 1);
    c.fill();
  }
  // Trittbretter
  c.fillStyle = '#26221f';
  c.fillRect(12, 80, 9, 1.6);
  c.fillRect(L - 21, 80, 9, 1.6);

  // --- Wagenkasten
  const top = 19, bottom = 72, left = 5, right = L - 5;
  c.save();
  roundedRect(c, left, top, right - left, bottom - top, 2.5);
  c.clip();
  const body = c.createLinearGradient(0, top, 0, bottom);
  body.addColorStop(0, shade(w.body, 34));
  body.addColorStop(0.18, shade(w.body, 14));
  body.addColorStop(0.55, w.body);
  body.addColorStop(1, shade(w.body, -38));
  c.fillStyle = body;
  c.fillRect(left, top, right - left, bottom - top);
  if (w.style === 'mirror') {
    // poliertes Blech: schräge Lichtstreifen
    for (let i = 0; i < 5; i++) {
      const x = 8 + i * 26 + random() * 8;
      const g = c.createLinearGradient(x, 0, x + 16, 0);
      g.addColorStop(0, 'rgba(255, 255, 255, 0)');
      g.addColorStop(0.5, `rgba(255, 255, 255, ${0.25 + random() * 0.25})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(x + 10, top);
      c.lineTo(x + 26, top);
      c.lineTo(x + 6, bottom);
      c.lineTo(x - 10, bottom);
      c.fill();
    }
  }
  // Lithografie: feines Druckraster
  for (let i = 0; i < 260; i++) {
    c.fillStyle = random() < 0.5 ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)';
    c.fillRect(left + random() * (right - left), top + random() * (bottom - top), 0.6, 0.6);
  }
  c.restore();

  // Zierlinien
  c.strokeStyle = w.trim;
  c.lineWidth = 0.8;
  roundedRect(c, left + 2.2, top + 2.2, right - left - 4.4, bottom - top - 4.4, 1.6);
  c.stroke();
  c.globalAlpha = 0.55;
  c.lineWidth = 0.4;
  roundedRect(c, left + 3.6, top + 3.6, right - left - 7.2, bottom - top - 7.2, 1.2);
  c.stroke();
  c.globalAlpha = 1;
  // Kante unten
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  c.fillRect(left, bottom - 1.2, right - left, 1.2);

  const window = (x, y, ww, hh, options = {}) => {
    litWindow(c, x, y, ww, hh, { curtain: w.curtain, ...options });
    if (options.lit !== false) WINDOWS[index].push([x, y, ww, hh]);
  };
  const panels = (inset = 0) => {
    c.strokeStyle = shade(w.trim, -20, 0.7);
    c.lineWidth = 0.6;
    roundedRect(c, 10 + inset, 52, 31 - inset, 14, 1.2);
    c.stroke();
    roundedRect(c, L - 41, 52, 31 - inset, 14, 1.2);
    c.stroke();
  };

  // --- je nach Wagen
  switch (w.style) {
    case 'coach':
      panels();
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 15);
      break;
    case 'van': {
      // senkrechte Bretter
      c.strokeStyle = 'rgba(30, 14, 6, 0.35)';
      c.lineWidth = 0.5;
      for (let x = left + 4; x < right - 2; x += 4.6) {
        c.beginPath();
        c.moveTo(x, top + 3);
        c.lineTo(x, bottom - 3);
        c.stroke();
      }
      // Schiebetür mit Streben
      c.fillStyle = shade(w.body, -18);
      c.fillRect(34, 22, L - 68, 48);
      c.strokeStyle = w.trim;
      c.lineWidth = 0.8;
      c.strokeRect(34, 22, L - 68, 48);
      c.strokeStyle = shade(w.body, -50);
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(36, 24); c.lineTo(L - 36, 68);
      c.moveTo(L - 36, 24); c.lineTo(36, 68);
      c.stroke();
      c.fillStyle = '#2a2420';
      c.fillRect(30, 20.5, L - 60, 1.6);
      for (const x of [12, L - 24]) window(x, 25, 12, 8, { lit: true });
      break;
    }
    case 'mail':
      c.fillStyle = '#b3261e';
      c.fillRect(left, 61, right - left, 4.5);
      c.fillStyle = 'rgba(255, 255, 255, 0.2)';
      c.fillRect(left, 61, right - left, 0.8);
      for (const x of [11, L - 23]) window(x, 25, 12, 14, { lit: false, tint: ['#f3f0e2', '#b8b2a0'] });
      // Briefschlitz
      c.fillStyle = '#141210';
      roundedRect(c, 12, 49, 10, 2.4, 1);
      c.fill();
      c.fillStyle = gold(c, 0, 47, 0, 53);
      c.fillRect(11, 47.6, 12, 0.9);
      break;
    case 'dining':
      panels();
      for (const x of [9, L - 29]) {
        window(x, 24, 20, 17, { r: 3 });
        // Tischlampe im Fenster
        c.fillStyle = '#ffe8a8';
        ellipse(c, x + 10, 36, 2.6, 2);
        c.fill();
      }
      break;
    case 'sleeper':
      panels(0);
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 12, { half: true });
      // kleine goldene Sterne
      c.fillStyle = w.trim;
      for (const [x, y] of [[16, 58], [28, 55], [36, 61], [L - 34, 57], [L - 22, 61], [L - 16, 55]]) star(c, x, y, 1.6);
      break;
    case 'lost':
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 14);
      // Schubladenfelder
      for (const x0 of [10, L - 40]) {
        for (let i = 0; i < 2; i++) {
          c.strokeStyle = shade(w.trim, -30, 0.8);
          c.lineWidth = 0.6;
          roundedRect(c, x0, 50 + i * 9, 30, 7, 1);
          c.stroke();
          c.fillStyle = gold(c, 0, 52 + i * 9, 0, 56 + i * 9);
          ellipse(c, x0 + 15, 53.5 + i * 9, 1.6, 1.2);
          c.fill();
        }
      }
      break;
    case 'bar':
      for (const y of [44, 47]) {
        c.fillStyle = gold(c, 0, y, 0, y + 1.4);
        c.fillRect(left + 1, y, right - left - 2, 1.4);
      }
      for (const x of [17, L - 17]) {
        // Bullauge
        c.fillStyle = gold(c, x - 8, 24, x + 8, 40);
        ellipse(c, x, 32, 8, 8);
        c.fill();
        porthole(c, x, 32, 6.4);
        WINDOWS[index].push([x - 6, 26, 12, 12]);
      }
      panels(0);
      break;
    case 'cinema':
      for (const x of [10, 24, L - 34, L - 20]) window(x, 27, 10, 13);
      // Lichterkette wie über einem Kinoeingang
      for (let x = left + 4; x <= right - 4; x += 5.2) {
        c.fillStyle = '#ffe9a0';
        ellipse(c, x, 22.5, 1.15, 1.15);
        c.fill();
        c.fillStyle = 'rgba(255, 210, 110, 0.35)';
        ellipse(c, x, 22.5, 2.4, 2.4);
        c.fill();
      }
      // Sterne auf den unteren Feldern
      c.fillStyle = w.trim;
      for (const [x, y] of [[18, 58], [30, 60], [L - 30, 60], [L - 18, 58]]) star(c, x, y, 2.2);
      break;
    case 'mirror':
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 15, { lit: false, tint: ['#e8f2fb', '#6d8097'] });
      panels();
      break;
    case 'speaker':
      // Lüftungsschlitze
      for (const x0 of [9, L - 39]) {
        for (let i = 0; i < 5; i++) {
          c.fillStyle = shade(w.body, -50);
          roundedRect(c, x0, 46 + i * 4, 30, 1.8, 0.9);
          c.fill();
          c.fillStyle = shade(w.body, 40, 0.6);
          c.fillRect(x0 + 0.5, 47.8 + i * 4, 29, 0.5);
        }
      }
      for (const x of [12, L - 24]) window(x, 25, 12, 14);
      break;
    case 'clock':
      panels();
      for (const x of [17, L - 17]) {
        c.fillStyle = gold(c, x - 8, 24, x + 8, 40);
        ellipse(c, x, 32, 8.2, 8.2);
        c.fill();
        // kleines Zifferblatt
        c.fillStyle = '#f7efd8';
        ellipse(c, x, 32, 6.4, 6.4);
        c.fill();
        c.strokeStyle = '#3a2a1a';
        c.lineWidth = 0.5;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          c.beginPath();
          c.moveTo(x + Math.cos(a) * 5.2, 32 + Math.sin(a) * 5.2);
          c.lineTo(x + Math.cos(a) * 6, 32 + Math.sin(a) * 6);
          c.stroke();
        }
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(x, 32); c.lineTo(x + 3.2 * Math.cos(-1.1 + x), 32 + 3.2 * Math.sin(-1.1 + x));
        c.moveTo(x, 32); c.lineTo(x, 27.6);
        c.stroke();
      }
      break;
    case 'music':
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 14);
      // Notenlinien mit kleinen Noten
      c.strokeStyle = shade(w.trim, 0, 0.75);
      c.lineWidth = 0.35;
      for (const x0 of [9, L - 40]) {
        for (let i = 0; i < 5; i++) {
          c.beginPath();
          c.moveTo(x0, 52 + i * 2.4);
          c.lineTo(x0 + 31, 52 + i * 2.4);
          c.stroke();
        }
        c.fillStyle = w.trim;
        for (let k = 0; k < 4; k++) {
          const nx = x0 + 4 + k * 7.5, ny = 53 + ((k * 3 + x0) % 4) * 2.2;
          ellipse(c, nx, ny + 1.6, 1.3, 1, -0.4);
          c.fill();
          c.fillRect(nx + 1, ny - 4, 0.45, 5.6);
        }
      }
      break;
    case 'chapel':
      for (const x of [10, 24, L - 34, L - 20]) stainedGlass(c, x, 24, 10, 19, index * 3 + x);
      for (const x of [10, 24, L - 34, L - 20]) WINDOWS[index].push([x, 24, 10, 19]);
      // Steinfugen
      c.strokeStyle = 'rgba(90, 70, 40, 0.25)';
      c.lineWidth = 0.4;
      for (let y = 47; y < 70; y += 5) {
        c.beginPath();
        c.moveTo(left + 3, y);
        c.lineTo(right - 3, y);
        c.stroke();
        for (let x = left + 3 + ((y / 5) % 2) * 5; x < right - 3; x += 10) {
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x, y + 5);
          c.stroke();
        }
      }
      break;
    case 'news':
      for (const x of [10, 24, L - 34, L - 20]) window(x, 25, 10, 14);
      // Zeitungsspalten
      for (const x0 of [9, L - 40]) {
        c.fillStyle = '#efeee6';
        c.fillRect(x0, 47, 31, 20);
        c.fillStyle = '#222';
        c.fillRect(x0 + 2, 48.6, 27, 2.4);
        c.fillStyle = 'rgba(40, 40, 40, 0.6)';
        for (let col = 0; col < 3; col++) {
          for (let row = 0; row < 6; row++) {
            c.fillRect(x0 + 2 + col * 9.4, 53 + row * 2.2, 7.6 - (row === 5 ? 3 : 0), 0.7);
          }
        }
      }
      break;
  }

  // Emaille-Schild mit dem Zeichen
  plaque(c, L / 2, 45, w.symbol);

  // --- Dach (von der Seite)
  const roof = c.createLinearGradient(0, 10, 0, 19);
  roof.addColorStop(0, shade(w.roof, 60));
  roof.addColorStop(0.3, shade(w.roof, 22));
  roof.addColorStop(1, shade(w.roof, -30));
  c.fillStyle = roof;
  c.beginPath();
  c.moveTo(2.5, 18.5);
  c.lineTo(2.5, 14);
  c.quadraticCurveTo(3, 10, 8, 10);
  c.lineTo(L - 8, 10);
  c.quadraticCurveTo(L - 3, 10, L - 2.5, 14);
  c.lineTo(L - 2.5, 18.5);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(255, 245, 220, 0.4)';
  c.fillRect(6, 10.6, L - 12, 0.7);
  // Traufe mit Schatten auf dem Kasten
  c.fillStyle = shade(w.roof, -30);
  c.fillRect(2, 17.4, L - 4, 2);
  const eave = c.createLinearGradient(0, 19, 0, 24);
  eave.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  eave.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = eave;
  c.fillRect(left, 19, right - left, 5);
  // Kanten der Stirnseiten
  c.fillStyle = 'rgba(0, 0, 0, 0.25)';
  c.fillRect(left, top, 1.2, bottom - top);
  c.fillRect(right - 1.2, top, 1.2, bottom - top);
}

function litWindow(c, x, y, w, h, { r = 2, curtain, lit = true, tint, half = false } = {}) {
  const radius = Math.min(r, w / 2, h / 2);
  roundedRect(c, x, y, w, h, radius);
  const g = c.createRadialGradient(x + w * 0.5, y + h * 0.4, 0.5, x + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.75);
  if (lit) {
    g.addColorStop(0, '#fff3c8');
    g.addColorStop(0.45, '#f5c36a');
    g.addColorStop(1, '#93521e');
  } else {
    g.addColorStop(0, tint[0]);
    g.addColorStop(1, tint[1]);
  }
  c.fillStyle = g;
  c.fill();
  c.save();
  roundedRect(c, x, y, w, h, radius);
  c.clip();
  if (curtain) {
    c.fillStyle = curtain;
    if (half) {
      c.fillRect(x, y, w, h * 0.42);
      c.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let i = 1; i < 4; i++) c.fillRect(x + (w / 4) * i, y, 0.4, h * 0.42);
    } else {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w * 0.32, y);
      c.quadraticCurveTo(x + w * 0.1, y + h * 0.5, x + w * 0.22, y + h);
      c.lineTo(x, y + h);
      c.closePath();
      c.moveTo(x + w, y);
      c.lineTo(x + w * 0.68, y);
      c.quadraticCurveTo(x + w * 0.9, y + h * 0.5, x + w * 0.78, y + h);
      c.lineTo(x + w, y + h);
      c.closePath();
      c.fill();
    }
  }
  // Spiegelung im Glas
  c.fillStyle = 'rgba(255, 255, 255, 0.22)';
  c.beginPath();
  c.moveTo(x + w * 0.15, y + h);
  c.lineTo(x + w * 0.55, y);
  c.lineTo(x + w * 0.75, y);
  c.lineTo(x + w * 0.35, y + h);
  c.fill();
  c.restore();
  c.strokeStyle = '#17110c';
  c.lineWidth = 0.9;
  roundedRect(c, x, y, w, h, radius);
  c.stroke();
  c.strokeStyle = 'rgba(255, 230, 170, 0.35)';
  c.lineWidth = 0.4;
  c.beginPath();
  c.moveTo(x + 0.6, y + h + 0.7);
  c.lineTo(x + w - 0.6, y + h + 0.7);
  c.stroke();
}

function porthole(c, x, y, r) {
  const g = c.createRadialGradient(x - r * 0.2, y - r * 0.2, 0.3, x, y, r);
  g.addColorStop(0, '#fff2c4');
  g.addColorStop(0.5, '#f0b45c');
  g.addColorStop(1, '#7c3f18');
  c.fillStyle = g;
  ellipse(c, x, y, r, r);
  c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ellipse(c, x - r * 0.35, y - r * 0.35, r * 0.3, r * 0.18, -0.7);
  c.fill();
}

function stainedGlass(c, x, y, w, h, seed) {
  const random = seeded(seed);
  c.save();
  c.beginPath();
  c.moveTo(x, y + h);
  c.lineTo(x, y + w * 0.6);
  c.quadraticCurveTo(x, y, x + w / 2, y);
  c.quadraticCurveTo(x + w, y, x + w, y + w * 0.6);
  c.lineTo(x + w, y + h);
  c.closePath();
  c.fillStyle = '#f2c66a';
  c.fill();
  c.clip();
  const colors = ['#c7362c', '#2f5fb0', '#e7b23c', '#3f8f5a', '#8a3fa0'];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      c.fillStyle = colors[Math.floor(random() * colors.length)];
      c.globalAlpha = 0.85;
      c.fillRect(x + col * (w / 2), y + row * (h / 5), w / 2, h / 5);
    }
  }
  c.globalAlpha = 1;
  const glow = c.createRadialGradient(x + w / 2, y + h * 0.4, 0, x + w / 2, y + h * 0.4, h * 0.7);
  glow.addColorStop(0, 'rgba(255, 240, 190, 0.6)');
  glow.addColorStop(1, 'rgba(255, 240, 190, 0)');
  c.fillStyle = glow;
  c.fillRect(x, y, w, h);
  c.strokeStyle = '#1a140e';
  c.lineWidth = 0.5;
  for (let row = 1; row < 5; row++) {
    c.beginPath();
    c.moveTo(x, y + row * (h / 5));
    c.lineTo(x + w, y + row * (h / 5));
    c.stroke();
  }
  c.beginPath();
  c.moveTo(x + w / 2, y);
  c.lineTo(x + w / 2, y + h);
  c.stroke();
  c.restore();
  c.strokeStyle = '#2a1e12';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(x, y + h);
  c.lineTo(x, y + w * 0.6);
  c.quadraticCurveTo(x, y, x + w / 2, y);
  c.quadraticCurveTo(x + w, y, x + w, y + w * 0.6);
  c.lineTo(x + w, y + h);
  c.stroke();
}

function star(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.38 : r;
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
}

// Emaille-Schild mit Goldrand und dem Zeichen des Wagens
function plaque(c, cx, cy, symbol) {
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ellipse(c, cx + 0.5, cy + 1.2, 18.6, 15.8);
  c.fill();
  c.fillStyle = gold(c, cx - 14, cy - 16, cx + 12, cy + 16);
  ellipse(c, cx, cy, 18, 15.4);
  c.fill();
  c.strokeStyle = 'rgba(60, 36, 8, 0.7)';
  c.lineWidth = 0.5;
  c.stroke();
  const enamel = c.createRadialGradient(cx - 4, cy - 5, 1, cx, cy, 16);
  enamel.addColorStop(0, '#fffaf0');
  enamel.addColorStop(0.7, '#f1e6cc');
  enamel.addColorStop(1, '#d9c8a2');
  c.fillStyle = enamel;
  ellipse(c, cx, cy, 15.4, 12.9);
  c.fill();
  c.strokeStyle = 'rgba(90, 60, 20, 0.6)';
  c.lineWidth = 0.4;
  ellipse(c, cx, cy, 14.2, 11.8);
  c.stroke();
  c.save();
  c.translate(cx, cy);
  c.scale(0.84, 0.84);
  drawSymbol(c, symbol, 0, 0);
  c.restore();
  // Glanz
  c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.ellipse(cx, cy, 13.4, 11, 0, 3.6, 4.5);
  c.stroke();
}

// ---------------------------------------------------------------- Wagen zeichnen
function drawWagon(ctx, index, pose, { roll = 0, glow = 0, hover = 0, cut = null, target = false }) {
  const fr = frameFor(pose, WAGON_LENGTH, cut);
  const L = WAGON_LENGTH, W = WIDTH;
  const body = WAGONS[index].body, roofColor = WAGONS[index].roof;
  vehicleShadow(ctx, fr);

  // Räder (etwas hinter der Seitenwand)
  inPlane(ctx, fr, W / 2 - 4, (c) => {
    for (const x of [-L / 2 + 22, L / 2 - 22]) wheel(c, x, -8.5, 8.5, roll / 8.5, { tone: '#5a524c', spokes: 8 });
  });

  // Stirnseiten
  for (const sign of [-1, 1]) {
    const x = (sign * L) / 2 - sign * 5;
    if (!fr.endVisible(sign) || !fr.shows(x)) continue;
    ctx.fillStyle = shade(body, -45);
    poly(ctx, [fr.pt(x, W / 2, 19), fr.pt(x, -W / 2, 19), fr.pt(x, -W / 2, 72), fr.pt(x, W / 2, 72)]);
    ctx.fill();
    ctx.fillStyle = shade(roofColor, -20);
    poly(ctx, [fr.pt(x, W / 2, 72), fr.pt(x, -W / 2, 72), fr.pt(x, -W / 2 + 2, ROOF_H), fr.pt(x, W / 2 - 2, ROOF_H)]);
    ctx.fill();
  }

  // Seite
  const texture = wagonTexture(index);
  inPlane(ctx, fr, W / 2, (c) => {
    c.drawImage(texture, -L / 2, -91, L, TEX_H);
    if (glow > 0) {
      c.globalCompositeOperation = 'lighter';
      for (const [x, y, w, h] of WINDOWS[index] ?? []) {
        const gx = -L / 2 + x + w / 2, gy = -91 + y + h / 2;
        const g = c.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.9);
        g.addColorStop(0, `rgba(255, 200, 120, ${0.3 * glow})`);
        g.addColorStop(1, 'rgba(255, 180, 90, 0)');
        c.fillStyle = g;
        c.fillRect(gx - w * 1.2, gy - h * 1.2, w * 2.4, h * 2.4);
      }
      c.globalCompositeOperation = 'source-over';
    }
  });

  // Dach von oben: gewölbtes Blech
  const near = fr.pt(0, W / 2 - 1, ROOF_H), far = fr.pt(0, -W / 2 + 1, ROOF_H);
  const g = ctx.createLinearGradient(near.x, near.y, far.x, far.y);
  g.addColorStop(0, shade(roofColor, 18));
  g.addColorStop(0.3, shade(roofColor, 62));
  g.addColorStop(0.42, shade(roofColor, 40));
  g.addColorStop(1, shade(roofColor, -34));
  ctx.fillStyle = g;
  if (quad(ctx, fr, -L / 2 + 2.6, L / 2 - 2.6, -W / 2 + 1, W / 2 - 1, ROOF_H)) {
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // Lüfter auf dem Dach
  for (const x of [-L / 3, L / 3]) {
    if (!fr.shows(x)) continue;
    const p = fr.pt(x, -3, ROOF_H + 1.6);
    ctx.fillStyle = shade(roofColor, -40, 0.8);
    ellipse(ctx, p.x, p.y + 1 * p.s, 4.2 * p.s, 2.1 * p.s);
    ctx.fill();
    ctx.fillStyle = shade(roofColor, 50);
    ellipse(ctx, p.x - 0.6 * p.s, p.y, 3.2 * p.s, 1.4 * p.s);
    ctx.fill();
  }

  if (hover > 0 && !cut) {
    // warmer Rand, wenn die Maus darüber ist
    ctx.save();
    ctx.globalAlpha = hover;
    ctx.strokeStyle = target ? 'rgba(150, 230, 255, 0.95)' : 'rgba(255, 224, 150, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = target ? 'rgba(120, 210, 255, 0.9)' : 'rgba(255, 200, 110, 0.9)';
    ctx.shadowBlur = 12;
    poly(ctx, [fr.pt(-L / 2, W / 2, 0), fr.pt(L / 2, W / 2, 0), fr.pt(L / 2, W / 2, 91), fr.pt(L / 2, -W / 2, ROOF_H), fr.pt(-L / 2, -W / 2, ROOF_H), fr.pt(-L / 2, W / 2, 91)]);
    ctx.stroke();
    ctx.restore();
  }
}

// Rechteck um ein Fahrzeug auf dem Bildschirm (zum Anklicken)
export function vehicleBounds(pose, length) {
  const fr = frameFor(pose, length);
  const points = [
    fr.pt(-length / 2, WIDTH / 2, 0), fr.pt(length / 2, WIDTH / 2, 0),
    fr.pt(-length / 2, -WIDTH / 2, 95), fr.pt(length / 2, -WIDTH / 2, 95),
  ];
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

// ---------------------------------------------------------------- Die Lok (Blech, mit Aufziehschlüssel)
function drawLoco(ctx, pose, { roll = 0, glow = 0, key = 0, cut = null }) {
  const fr = frameFor(pose, LOCO_LENGTH, cut);
  const L = LOCO_LENGTH, W = WIDTH;
  const f = fr.flipped ? -1 : 1; // +1: die Nase zeigt auf dem Bildschirm nach rechts
  const red = '#b3291e', black = '#1c1d22';
  vehicleShadow(ctx, fr);

  // Lichtkegel der Stirnlampe auf dem Gleis
  if (glow > 0 && !cut) {
    const a = fr.pt(f * 66, 0, 0), b = fr.pt(f * 230, 0, 0);
    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    g.addColorStop(0, `rgba(255, 226, 150, ${0.35 * glow})`);
    g.addColorStop(1, 'rgba(255, 226, 150, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    poly(ctx, [fr.pt(f * 66, -10, 0), fr.pt(f * 230, -44, 0), fr.pt(f * 230, 44, 0), fr.pt(f * 66, 10, 0)]);
    ctx.fill();
    ctx.restore();
  }

  // Umlauf (Trittblech) von oben
  ctx.fillStyle = '#5a1712';
  if (quad(ctx, fr, f * -70, f * 66, -W / 2, W / 2, 22)) ctx.fill();

  // Kessel, Dom und Schornstein (in der Mitte der Lok)
  inPlane(ctx, fr, 0, (c) => {
    c.scale(f, 1);
    // Kessel
    const boiler = c.createLinearGradient(0, -66, 0, -24);
    boiler.addColorStop(0, '#0c0d10');
    boiler.addColorStop(0.18, '#5d626c');
    boiler.addColorStop(0.32, '#2c2f36');
    boiler.addColorStop(0.75, black);
    boiler.addColorStop(1, '#0a0a0c');
    c.fillStyle = boiler;
    roundedRect(c, -26, -66, 86, 42, 6);
    c.fill();
    // Rauchkammer vorne
    c.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c.fillRect(44, -66, 16, 42);
    c.fillStyle = gold(c, 0, -66, 0, -24);
    c.fillRect(58, -64, 2.5, 38);
    // Messingbänder
    for (const x of [-6, 16, 38]) {
      c.fillStyle = gold(c, 0, -66, 0, -24);
      c.fillRect(x, -66, 3, 42);
    }
    // Schornstein
    const chimney = c.createLinearGradient(34, 0, 52, 0);
    chimney.addColorStop(0, '#0d0d10');
    chimney.addColorStop(0.35, '#4c5058');
    chimney.addColorStop(1, '#0d0d10');
    c.fillStyle = chimney;
    c.beginPath();
    c.moveTo(37, -62);
    c.lineTo(36, -84);
    c.lineTo(32, -92);
    c.lineTo(54, -92);
    c.lineTo(50, -84);
    c.lineTo(49, -62);
    c.closePath();
    c.fill();
    c.fillStyle = gold(c, 31, 0, 55, 0);
    c.fillRect(31.5, -94, 23, 3.4);
    // Dampfdom aus Messing
    c.fillStyle = gold(c, 4, -82, 22, -62);
    c.beginPath();
    c.moveTo(2, -63);
    c.quadraticCurveTo(3, -71, 8, -73);
    c.quadraticCurveTo(13, -80, 18, -73);
    c.quadraticCurveTo(23, -71, 24, -63);
    c.closePath();
    c.fill();
    // Sandkasten
    c.fillStyle = red;
    roundedRect(c, -18, -71, 12, 7, 2);
    c.fill();
    c.fillStyle = gold(c, 0, -73, 0, -69);
    c.fillRect(-19, -73, 14, 2);
    // Pfeife
    c.fillStyle = gold(c, -24, 0, -20, 0);
    c.fillRect(-23, -76, 3, 12);
    ellipse(c, -21.5, -77, 2.2, 1.6);
    c.fill();
  });
  // Öffnung des Schornsteins von oben
  if (fr.shows(f * 43)) {
    const top = fr.pt(f * 43, 0, 94);
    ctx.fillStyle = '#060506';
    ellipse(ctx, top.x, top.y, 9 * top.s, 4.6 * top.s);
    ctx.fill();
    ctx.strokeStyle = '#e8c46a';
    ctx.lineWidth = 1.4 * top.s;
    ctx.stroke();
  }

  // Führerhaus von oben (Dach)
  const roofNear = fr.pt(-f * 48, W / 2 + 2, 92), roofFar = fr.pt(-f * 48, -W / 2 - 2, 92);
  const roof = ctx.createLinearGradient(roofNear.x, roofNear.y, roofFar.x, roofFar.y);
  roof.addColorStop(0, '#3a1612');
  roof.addColorStop(0.3, '#c0574a');
  roof.addColorStop(0.45, '#8a2a20');
  roof.addColorStop(1, '#2a0e0a');

  // Seite: Rahmen, Räder, Führerhaus
  inPlane(ctx, fr, W / 2, (c) => {
    c.scale(f, 1);
    // Zylinderblock
    c.fillStyle = black;
    roundedRect(c, 28, -30, 22, 14, 3);
    c.fill();
    c.fillStyle = gold(c, 0, -30, 0, -16);
    c.fillRect(28, -30, 22, 1.6);
    c.fillRect(28, -17.6, 22, 1.6);
    // Räder
    const angle = roll / 12.5;
    for (const x of [-46, -18, 10]) wheel(c, x, -12.5, 12.5, angle, { spokes: 10, tone: '#b8291c', hub: '#e6c164', tire: '#141212' });
    wheel(c, 42, -7.5, 7.5, roll / 7.5, { spokes: 6, tone: '#b8291c', hub: '#e6c164', tire: '#141212' });
    // Rahmen
    const frame = c.createLinearGradient(0, -24, 0, -12);
    frame.addColorStop(0, '#d23a2b');
    frame.addColorStop(0.45, red);
    frame.addColorStop(1, '#5c140e');
    c.fillStyle = frame;
    c.fillRect(-74, -24, 138, 9);
    c.fillStyle = 'rgba(0, 0, 0, 0.55)';
    c.fillRect(-74, -16, 138, 1.2);
    for (let x = -70; x < 62; x += 8) {
      c.fillStyle = 'rgba(255, 220, 180, 0.55)';
      ellipse(c, x, -20, 0.7, 0.7);
      c.fill();
    }
    // Kuppelstange
    const pin = (x) => ({ x: x + Math.cos(angle) * 6.5, y: -12.5 + Math.sin(angle) * 6.5 });
    const p0 = pin(-46), p2 = pin(10);
    c.strokeStyle = '#d9dde3';
    c.lineWidth = 2.6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(p0.x, p0.y);
    c.lineTo(p2.x, p2.y);
    c.stroke();
    c.strokeStyle = '#7a808a';
    c.lineWidth = 0.8;
    c.stroke();
    // Treibstange zum Zylinder
    c.strokeStyle = '#c9ced6';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(pin(-18).x, pin(-18).y);
    c.lineTo(30, -23);
    c.stroke();
    for (const x of [-46, -18, 10]) {
      const p = pin(x);
      c.fillStyle = '#f0d27a';
      ellipse(c, p.x, p.y, 1.5, 1.5);
      c.fill();
    }
    c.lineCap = 'butt';
    // Schienenräumer vorne
    c.fillStyle = red;
    c.beginPath();
    c.moveTo(62, -24);
    c.lineTo(70, -24);
    c.lineTo(78, -3);
    c.lineTo(56, -3);
    c.closePath();
    c.fill();
    c.strokeStyle = '#4a0f0a';
    c.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(60 + i * 2.6, -22);
      c.lineTo(58 + i * 4.6, -4);
      c.stroke();
    }
    // Puffer
    c.fillStyle = gold(c, 0, -24, 0, -14);
    roundedRect(c, 68, -26, 4, 8, 1.2);
    c.fill();
    roundedRect(c, -80, -24, 4, 8, 1.2);
    c.fill();
    // Stirnlampe
    c.fillStyle = black;
    roundedRect(c, 52, -36, 8, 9, 1.5);
    c.fill();
    c.fillStyle = glow > 0 ? '#fff6d2' : '#d8c78e';
    ellipse(c, 60, -31.5, 2.2, 3);
    c.fill();
    // Führerhaus
    const cab = c.createLinearGradient(0, -90, 0, -22);
    cab.addColorStop(0, '#d9412f');
    cab.addColorStop(0.3, red);
    cab.addColorStop(1, '#6e170f');
    c.fillStyle = cab;
    roundedRect(c, -74, -88, 50, 66, 2);
    c.fill();
    c.strokeStyle = '#ecc86c';
    c.lineWidth = 0.9;
    roundedRect(c, -71, -84, 44, 60, 1.5);
    c.stroke();
    // Fenster mit Licht
    c.save();
    c.beginPath();
    c.moveTo(-66, -56);
    c.lineTo(-66, -72);
    c.quadraticCurveTo(-66, -80, -58, -80);
    c.lineTo(-40, -80);
    c.quadraticCurveTo(-34, -80, -34, -72);
    c.lineTo(-34, -56);
    c.closePath();
    const win = c.createRadialGradient(-50, -70, 1, -50, -66, 18);
    win.addColorStop(0, '#fff1c0');
    win.addColorStop(0.5, '#f0b860');
    win.addColorStop(1, '#7c3d16');
    c.fillStyle = win;
    c.fill();
    c.clip();
    c.fillStyle = 'rgba(255, 255, 255, 0.25)';
    c.beginPath();
    c.moveTo(-60, -56); c.lineTo(-48, -80); c.lineTo(-42, -80); c.lineTo(-54, -56);
    c.fill();
    c.restore();
    c.strokeStyle = '#1a0e08';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(-66, -56);
    c.lineTo(-66, -72);
    c.quadraticCurveTo(-66, -80, -58, -80);
    c.lineTo(-40, -80);
    c.quadraticCurveTo(-34, -80, -34, -72);
    c.lineTo(-34, -56);
    c.closePath();
    c.stroke();
    // Nummernschild „24“
    c.fillStyle = gold(c, -64, -50, -40, -40);
    roundedRect(c, -64, -50, 24, 11, 2);
    c.fill();
    c.fillStyle = '#2a1a0a';
    roundedRect(c, -62.4, -48.4, 20.8, 7.8, 1.4);
    c.fill();
    c.save();
    c.translate(-52, -44.3);
    c.scale(f, 1);
    c.fillStyle = '#f3d27a';
    c.font = `bold 7.6px ${SERIF}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('24', 0, 0.4);
    c.restore();
    // Dach von der Seite
    c.fillStyle = '#5a1a12';
    roundedRect(c, -77, -91, 56, 4.4, 1.6);
    c.fill();
    c.fillStyle = 'rgba(255, 210, 180, 0.35)';
    c.fillRect(-75, -90.6, 52, 0.7);
    // Handstange am Kessel
    c.strokeStyle = gold(c, 0, -50, 0, -46);
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(-22, -46);
    c.lineTo(54, -46);
    c.stroke();
    // Aufziehschlüssel (dreht sich, solange die Lok fährt)
    c.save();
    c.translate(-32, -36);
    c.fillStyle = gold(c, -3, -3, 3, 3);
    ellipse(c, 0, 0, 2.6, 2.6);
    c.fill();
    c.rotate(key);
    c.fillStyle = gold(c, -10, -4, 10, 4);
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(0, -1.4);
      c.bezierCurveTo(side * 5, -4.5, side * 10, -4.5, side * 10.5, 0);
      c.bezierCurveTo(side * 10, 4.5, side * 5, 4.5, 0, 1.4);
      c.closePath();
      c.fill();
    }
    c.fillStyle = 'rgba(80, 50, 10, 0.6)';
    ellipse(c, 6.8, 0, 1.6, 1.6);
    ellipse(c, -6.8, 0, 1.6, 1.6);
    c.fill();
    c.restore();
  });

  // Dach des Führerhauses von oben (über allem)
  ctx.fillStyle = roof;
  if (quad(ctx, fr, -f * 77, -f * 21, -W / 2, W / 2, 91)) {
    ctx.fill();
    ctx.strokeStyle = 'rgba(20, 6, 4, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Licht der Stirnlampe
  if (glow > 0 && fr.shows(f * 60)) {
    const lamp = fr.pt(f * 60, W / 2, 31.5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, 26);
    g.addColorStop(0, `rgba(255, 240, 190, ${0.8 * glow})`);
    g.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(lamp.x - 26, lamp.y - 26, 52, 52);
    ctx.restore();
  }
  return { chimney: fr.shows(f * 43) ? fr.pt(f * 43, 0, 96) : null, facing: f };
}

// ============================================================================================
//  Landschaft
// ============================================================================================

// Spielzeugtanne aus Holz auf runder Scheibe (wie im Spielzimmer)
function toyTree(c, X, Z, height, seed = 1, { snow = true } = {}) {
  const random = seeded(seed);
  const base = project(X, Z);
  const s = base.s;
  contactShadow(c, base.x - 6 * s, base.y + 2, 24 * s, 9 * s, 0.45);
  // Holzscheibe
  const disc = c.createLinearGradient(base.x - 16 * s, 0, base.x + 16 * s, 0);
  disc.addColorStop(0, '#6a3f1c');
  disc.addColorStop(0.5, '#b07a42');
  disc.addColorStop(1, '#6a3f1c');
  c.fillStyle = '#4e2d12';
  ellipse(c, base.x, base.y + 1.5 * s, 16 * s, 7 * s);
  c.fill();
  c.fillStyle = disc;
  ellipse(c, base.x, base.y - 1 * s, 15 * s, 6.4 * s);
  c.fill();
  // Stamm
  c.fillStyle = '#6b4320';
  c.fillRect(base.x - 2.4 * s, base.y - height * 0.3 * s, 4.8 * s, height * 0.3 * s);
  // drei Stufen
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const t0 = 0.22 + i * 0.22, t1 = t0 + 0.42 + (i === tiers - 1 ? 0.14 : 0);
    const yb = base.y - height * t0 * s, yt = base.y - Math.min(1, t1) * height * s;
    const half = (0.36 - i * 0.08) * height * s;
    const g = c.createLinearGradient(base.x - half, 0, base.x + half, 0);
    g.addColorStop(0, '#173a20');
    g.addColorStop(0.55, '#2f6a35');
    g.addColorStop(1, '#4f8f48');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(base.x - half, yb);
    c.quadraticCurveTo(base.x - half * 0.3, yb - (yb - yt) * 0.4, base.x, yt);
    c.quadraticCurveTo(base.x + half * 0.3, yb - (yb - yt) * 0.4, base.x + half, yb);
    c.quadraticCurveTo(base.x, yb + 3 * s, base.x - half, yb);
    c.fill();
    c.strokeStyle = 'rgba(10, 30, 14, 0.5)';
    c.lineWidth = 0.8;
    c.stroke();
    if (snow) {
      c.fillStyle = 'rgba(246, 248, 255, 0.92)';
      c.beginPath();
      c.moveTo(base.x - half * 0.55, yb - (yb - yt) * 0.38);
      c.quadraticCurveTo(base.x, yt - 1, base.x + half * 0.35, yb - (yb - yt) * 0.45);
      c.quadraticCurveTo(base.x, yb - (yb - yt) * 0.5 + random() * 2, base.x - half * 0.55, yb - (yb - yt) * 0.38);
      c.fill();
    }
  }
}

// Holzhäuschen mit Satteldach, Schnee und erleuchteten Fenstern
function toyHouse(c, X, Z, { w = 60, d = 44, h = 42, wall = '#c9a46a', roof = '#8c2f24', seed = 3, chimney = true } = {}) {
  const random = seeded(seed);
  const P = (x, z, y) => project(X + x, Z + z, y);
  const base = P(0, 0, 0);
  contactShadow(c, base.x - 10 * base.s, base.y + 3, (w * 0.75) * base.s, (d * 0.5) * K + 6, 0.5);
  const ridge = h + w * 0.38;
  // Vorderseite (zum Betrachter)
  const front = [P(-w / 2, d / 2, 0), P(w / 2, d / 2, 0), P(w / 2, d / 2, h), P(-w / 2, d / 2, h)];
  const wallGrad = c.createLinearGradient(front[0].x, 0, front[1].x, 0);
  wallGrad.addColorStop(0, shade(wall, -30));
  wallGrad.addColorStop(1, shade(wall, 14));
  c.fillStyle = wallGrad;
  poly(c, front);
  c.fill();
  // Giebelseite rechts (wenn rechts vom Auge: linke sichtbar)
  const side = X > 0 ? -1 : 1;
  const gable = [P(side * w / 2, d / 2, 0), P(side * w / 2, -d / 2, 0), P(side * w / 2, -d / 2, h), P(side * w / 2, 0, ridge), P(side * w / 2, d / 2, h)];
  c.fillStyle = shade(wall, -42);
  poly(c, gable);
  c.fill();
  // Fenster vorne
  const windows = Math.max(2, Math.round(w / 26));
  for (let i = 0; i < windows; i++) {
    const wx = -w / 2 + (w / (windows + 1)) * (i + 1);
    const a = P(wx - 5, d / 2, h * 0.38), b = P(wx + 5, d / 2, h * 0.38 + 12);
    const lit = random() < 0.8;
    const g = c.createRadialGradient((a.x + b.x) / 2, (a.y + b.y) / 2, 0, (a.x + b.x) / 2, (a.y + b.y) / 2, 10 * a.s);
    g.addColorStop(0, lit ? '#fff0b8' : '#4a5a70');
    g.addColorStop(1, lit ? '#e09a40' : '#232c3a');
    c.fillStyle = g;
    c.fillRect(a.x, b.y, b.x - a.x, a.y - b.y);
    c.strokeStyle = '#3a2412';
    c.lineWidth = 1.2 * a.s;
    c.strokeRect(a.x, b.y, b.x - a.x, a.y - b.y);
    c.beginPath();
    c.moveTo((a.x + b.x) / 2, b.y);
    c.lineTo((a.x + b.x) / 2, a.y);
    c.moveTo(a.x, (a.y + b.y) / 2);
    c.lineTo(b.x, (a.y + b.y) / 2);
    c.stroke();
    if (lit) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      const halo = c.createRadialGradient((a.x + b.x) / 2, (a.y + b.y) / 2, 0, (a.x + b.x) / 2, (a.y + b.y) / 2, 22 * a.s);
      halo.addColorStop(0, 'rgba(255, 200, 110, 0.3)');
      halo.addColorStop(1, 'rgba(255, 200, 110, 0)');
      c.fillStyle = halo;
      c.fillRect(a.x - 22, b.y - 22, 44 + (b.x - a.x), 44);
      c.restore();
    }
  }
  // Tür
  const door = [P(w / 2 - 16, d / 2, 0), P(w / 2 - 6, d / 2, 0), P(w / 2 - 6, d / 2, 18), P(w / 2 - 16, d / 2, 18)];
  c.fillStyle = shade(wall, -70);
  poly(c, door);
  c.fill();
  // Dach: vordere Fläche
  const over = 5;
  const roofFront = [P(-w / 2 - over, d / 2 + over, h - 2), P(w / 2 + over, d / 2 + over, h - 2), P(w / 2 + over, 0, ridge), P(-w / 2 - over, 0, ridge)];
  const rg = c.createLinearGradient(0, roofFront[2].y, 0, roofFront[0].y);
  rg.addColorStop(0, shade(roof, 30));
  rg.addColorStop(1, shade(roof, -20));
  c.fillStyle = rg;
  poly(c, roofFront);
  c.fill();
  // Ziegelreihen
  c.strokeStyle = shade(roof, -50, 0.6);
  c.lineWidth = 0.8 * base.s;
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    const l = P(-w / 2 - over, (d / 2 + over) * (1 - t), h - 2 + (ridge - h + 2) * t);
    const r = P(w / 2 + over, (d / 2 + over) * (1 - t), h - 2 + (ridge - h + 2) * t);
    c.beginPath();
    c.moveTo(l.x, l.y);
    c.lineTo(r.x, r.y);
    c.stroke();
  }
  // Schnee auf dem Dach
  c.fillStyle = 'rgba(245, 247, 255, 0.95)';
  const s0 = P(-w / 2 - over, 4, ridge - 3), s1 = P(w / 2 + over, 4, ridge - 3), s2 = P(w / 2 + over, 0, ridge + 1), s3 = P(-w / 2 - over, 0, ridge + 1);
  c.beginPath();
  c.moveTo(s3.x, s3.y);
  c.lineTo(s2.x, s2.y);
  c.lineTo(s1.x, s1.y);
  for (let i = 8; i >= 0; i--) {
    const t = i / 8;
    c.lineTo(s0.x + (s1.x - s0.x) * t, s0.y + (s1.y - s0.y) * t + (i % 2 ? 3 : 0) * base.s + random() * 3 * base.s);
  }
  c.closePath();
  c.fill();
  // Schornstein
  if (chimney) {
    const cx = w * 0.22;
    const a = P(cx - 4, -4, ridge - 8), b = P(cx + 4, -4, ridge + 10);
    c.fillStyle = '#7a3a26';
    c.fillRect(a.x, b.y, b.x - a.x, a.y - b.y);
    c.fillStyle = 'rgba(245, 247, 255, 0.95)';
    c.fillRect(a.x - 1, b.y - 2, b.x - a.x + 2, 3);
  }
}

// Ein Wattebausch Schnee auf dem Filz
function cottonSnow(c, X, Z, size, seed) {
  const random = seeded(seed);
  for (let i = 0; i < 9; i++) {
    const p = project(X + (random() - 0.5) * size * 1.6, Z + (random() - 0.5) * size * 0.9);
    const r = size * (0.25 + random() * 0.3) * p.s;
    const g = c.createRadialGradient(p.x - r * 0.3, p.y - r * 0.4, 0, p.x, p.y, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    g.addColorStop(0.7, 'rgba(225, 232, 245, 0.8)');
    g.addColorStop(1, 'rgba(200, 210, 230, 0)');
    c.fillStyle = g;
    ellipse(c, p.x, p.y, r, r * 0.6);
    c.fill();
  }
}

// Laterne mit Lichtschein
function lamp(c, X, Z) {
  const b = project(X, Z), t = project(X, Z, 44);
  contactShadow(c, b.x - 4, b.y + 1, 8 * b.s, 3 * b.s, 0.4);
  c.strokeStyle = '#1c1a18';
  c.lineWidth = 2 * b.s;
  c.beginPath();
  c.moveTo(b.x, b.y);
  c.lineTo(t.x, t.y);
  c.stroke();
  c.fillStyle = '#1c1a18';
  c.fillRect(t.x - 4 * b.s, t.y - 9 * b.s, 8 * b.s, 2 * b.s);
  c.fillStyle = '#ffe7a6';
  c.fillRect(t.x - 3 * b.s, t.y - 7 * b.s, 6 * b.s, 7 * b.s);
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(t.x, t.y - 3 * b.s, 0, t.x, t.y - 3 * b.s, 26 * b.s);
  g.addColorStop(0, 'rgba(255, 210, 120, 0.55)');
  g.addColorStop(1, 'rgba(255, 210, 120, 0)');
  c.fillStyle = g;
  c.fillRect(t.x - 30, t.y - 34, 60, 60);
  const pool = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, 30 * b.s);
  pool.addColorStop(0, 'rgba(255, 200, 110, 0.22)');
  pool.addColorStop(1, 'rgba(255, 200, 110, 0)');
  c.fillStyle = pool;
  c.save();
  c.translate(b.x, b.y);
  c.scale(1, 0.45);
  c.fillRect(-32, -32, 64, 64);
  c.restore();
  c.restore();
}

// Kleiner Wegweiser-Stein mit der Platznummer (wie ein Kilometerstein)
function numberPost(c, X, Z, label) {
  const b = project(X, Z);
  const s = b.s;
  const w = (label.length > 1 ? 17 : 13) * s, h = 21 * s;
  contactShadow(c, b.x - 4 * s, b.y + 1, w * 0.9, 4 * s, 0.5);
  // Seite
  c.fillStyle = '#a9a294';
  c.fillRect(b.x + w / 2, b.y - h + 2 * s, 3 * s, h - 2 * s);
  // Vorderseite mit runder Kappe
  const g = c.createLinearGradient(b.x - w / 2, 0, b.x + w / 2, 0);
  g.addColorStop(0, '#e9e3d4');
  g.addColorStop(1, '#fbf8ef');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(b.x - w / 2, b.y);
  c.lineTo(b.x - w / 2, b.y - h + w / 2);
  c.arc(b.x, b.y - h + w / 2, w / 2, Math.PI, 0);
  c.lineTo(b.x + w / 2, b.y);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(60, 50, 40, 0.6)';
  c.lineWidth = 0.8;
  c.stroke();
  c.fillStyle = '#c33a2c';
  c.fillRect(b.x - w / 2, b.y - 4 * s, w, 2.4 * s);
  c.fillStyle = '#1d1a16';
  c.font = `bold ${Math.round(11.5 * s)}px ${SERIF}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(label, b.x, b.y - h * 0.56);
}

// Signalturm in der Mitte des Rings (wie der Turm draußen)
const TOWER = { X: 60, Z: 655, H: 136 };
function tower(c) {
  const { X, Z, H } = TOWER;
  const b = project(X, Z), s = b.s;
  contactShadow(c, b.x - 18 * s, b.y + 3, 40 * s, 12 * s, 0.55);
  // Sockel
  c.fillStyle = '#6b6258';
  ellipse(c, b.x, b.y, 22 * s, 8 * s);
  c.fill();
  // Schaft: rot-weiß geringelt, nach oben schmaler
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const h0 = 4 + (i / bands) * (H - 30), h1 = 4 + ((i + 1) / bands) * (H - 30);
    const r0 = (16 - (i / bands) * 6) * s, r1 = (16 - ((i + 1) / bands) * 6) * s;
    const y0 = b.y - h0 * s, y1 = b.y - h1 * s;
    const g = c.createLinearGradient(b.x - r0, 0, b.x + r0, 0);
    const base = i % 2 ? '#e9e1cf' : '#b8382a';
    g.addColorStop(0, shade(base, -60));
    g.addColorStop(0.6, base);
    g.addColorStop(1, shade(base, 20));
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(b.x - r0, y0);
    c.lineTo(b.x - r1, y1);
    c.lineTo(b.x + r1, y1);
    c.lineTo(b.x + r0, y0);
    c.closePath();
    c.fill();
  }
  // Galerie und Laterne
  const yg = b.y - (H - 26) * s;
  c.fillStyle = '#2a2622';
  ellipse(c, b.x, yg, 15 * s, 5 * s);
  c.fill();
  c.strokeStyle = '#2a2622';
  c.lineWidth = 0.9;
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(b.x + i * 4 * s, yg);
    c.lineTo(b.x + i * 4 * s, yg - 6 * s);
    c.stroke();
  }
  c.beginPath();
  c.ellipse(b.x, yg - 6 * s, 15 * s, 5 * s, 0, 0, Math.PI);
  c.stroke();
  c.fillStyle = '#ffe8a8';
  c.fillRect(b.x - 7 * s, yg - 20 * s, 14 * s, 14 * s);
  c.strokeStyle = '#2a2622';
  c.lineWidth = 1.2;
  c.strokeRect(b.x - 7 * s, yg - 20 * s, 14 * s, 14 * s);
  c.beginPath();
  c.moveTo(b.x, yg - 20 * s);
  c.lineTo(b.x, yg - 6 * s);
  c.stroke();
  c.fillStyle = '#1f2a2a';
  c.beginPath();
  c.moveTo(b.x - 10 * s, yg - 20 * s);
  c.lineTo(b.x, yg - 30 * s);
  c.lineTo(b.x + 10 * s, yg - 20 * s);
  c.closePath();
  c.fill();
  c.fillStyle = '#e2b85a';
  ellipse(c, b.x, yg - 31 * s, 1.8 * s, 1.8 * s);
  c.fill();
}
export const TOWER_LIGHT = (() => {
  const b = project(TOWER.X, TOWER.Z);
  return { x: b.x, y: b.y - (TOWER.H - 26 + 13) * b.s };
})();

// Zugefrorener Teich mit zwei Schlittschuhläufern
function pond(c) {
  const p = project(-190, 575), s = p.s;
  const rx = 92 * s, ry = 46 * K;
  c.fillStyle = 'rgba(240, 244, 252, 0.95)';
  ellipse(c, p.x, p.y, rx + 7 * s, ry + 4);
  c.fill();
  const ice = c.createLinearGradient(0, p.y - ry, 0, p.y + ry);
  ice.addColorStop(0, '#9fb8d6');
  ice.addColorStop(0.5, '#cfe0f0');
  ice.addColorStop(1, '#7f9ec2');
  c.fillStyle = ice;
  ellipse(c, p.x, p.y, rx, ry);
  c.fill();
  c.save();
  ellipse(c, p.x, p.y, rx, ry);
  c.clip();
  c.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.ellipse(p.x - 20 + i * 12, p.y + 2, 30 + i * 6, 5 + i, -0.1, 3.4, 5.6);
    c.stroke();
  }
  c.fillStyle = 'rgba(255, 255, 255, 0.35)';
  c.beginPath();
  c.ellipse(p.x + rx * 0.2, p.y - ry * 0.3, rx * 0.45, ry * 0.25, -0.15, 0, Math.PI * 2);
  c.fill();
  c.restore();
  // zwei Figürchen auf Kufen
  for (const [dx, dz, color] of [[-28, 4, '#a8352a'], [18, -8, '#2f5c9a']]) {
    const f = project(-190 + dx, 575 + dz);
    c.fillStyle = 'rgba(40, 60, 90, 0.35)';
    ellipse(c, f.x + 2, f.y + 6, 6, 2);
    c.fill();
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(f.x - 4, f.y);
    c.lineTo(f.x + 4, f.y);
    c.lineTo(f.x + 2, f.y - 12);
    c.lineTo(f.x - 2, f.y - 12);
    c.fill();
    c.fillStyle = '#f1cfae';
    ellipse(c, f.x, f.y - 15, 3, 3);
    c.fill();
    c.fillStyle = shade(color, 30);
    ellipse(c, f.x, f.y - 17.5, 3.2, 1.8);
    c.fill();
    c.fillStyle = '#ffffff';
    c.fillRect(f.x - 1, f.y - 7, 6, 1.6);
  }
}

// ---------------------------------------------------------------- Gleis
function track(c) {
  const step = 4;
  const sample = (u0, u1) => {
    const points = [];
    for (let u = u0; u <= u1 + 0.01; u += step) points.push(pathAt(Math.min(u, u1)));
    return points;
  };
  const segments = [sample(0, LN + LC + LF)];
  // Schotterbett
  for (const points of segments) {
    for (const [width, color] of [[70, 'rgba(40, 32, 24, 0.55)'], [62, '#6d655a']]) {
      const left = points.map((p) => project(p.X - p.dz * width / 2, p.Z + p.dx * width / 2));
      const right = points.map((p) => project(p.X + p.dz * width / 2, p.Z - p.dx * width / 2));
      c.fillStyle = color;
      c.beginPath();
      left.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      for (let i = right.length - 1; i >= 0; i--) c.lineTo(right[i].x, right[i].y);
      c.closePath();
      c.fill();
    }
    // Körnung des Schotters
    const random = seeded(77);
    for (let i = 0; i < 9000; i++) {
      const p = points[Math.floor(random() * points.length)];
      const off = (random() - 0.5) * 60;
      const q = project(p.X - p.dz * off + p.dx * (random() - 0.5) * step, p.Z + p.dx * off + p.dz * (random() - 0.5) * step);
      const v = random();
      c.fillStyle = v < 0.4 ? 'rgba(30, 26, 22, 0.5)' : v < 0.8 ? 'rgba(160, 150, 136, 0.55)' : 'rgba(210, 202, 188, 0.6)';
      const size = (0.8 + random() * 1.4) * q.s;
      c.fillRect(q.x, q.y, size, size * 0.8);
    }
  }
  // Schwellen
  const random = seeded(5);
  for (let u = 6; u < LN + LC + LF; u += 19) {
    const p = pathAt(u);
    const nx = -p.dz, nz = p.dx;
    const corner = (a, b) => project(p.X + p.dx * a + nx * b, p.Z + p.dz * a + nz * b);
    const pts = [corner(-4.5, -27), corner(4.5, -27), corner(4.5, 27), corner(-4.5, 27)];
    const tone = 70 + random() * 30;
    c.fillStyle = `rgb(${tone + 20}, ${tone - 8}, ${tone - 36})`;
    poly(c, pts);
    c.fill();
    c.strokeStyle = 'rgba(20, 10, 4, 0.55)';
    c.lineWidth = 0.7;
    c.stroke();
    // Maserung
    c.strokeStyle = 'rgba(255, 220, 170, 0.12)';
    c.beginPath();
    const m0 = corner(0, -24), m1 = corner(0, 24);
    c.moveTo(m0.x, m0.y);
    c.lineTo(m1.x, m1.y);
    c.stroke();
  }
  // Schienen
  const all = sample(0, LN + LC + LF);
  for (const side of [-1, 1]) {
    const rail = all.map((p) => project(p.X - p.dz * side * 15, p.Z + p.dx * side * 15));
    const railTop = all.map((p) => project(p.X - p.dz * side * 15, p.Z + p.dx * side * 15, 3));
    const stroke = (pts, color, width) => {
      c.strokeStyle = color;
      c.lineWidth = width;
      c.beginPath();
      pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      c.stroke();
    };
    stroke(rail, 'rgba(0, 0, 0, 0.6)', 3.6);
    stroke(railTop, '#4a4a4e', 3);
    stroke(railTop, '#c9ccd2', 1.2);
    // kleine Schienenklemmen
    for (let i = 0; i < all.length; i += 5) {
      c.fillStyle = 'rgba(20, 20, 24, 0.7)';
      c.fillRect(rail[i].x - 1, rail[i].y - 1, 2.2, 2.2);
    }
  }
}

// ---------------------------------------------------------------- Hintergrund: gemalte Kulisse, Filz, Dorf
function drawBack(c) {
  // Gemalte Kulisse hinten: Nachthimmel mit Mond und verschneiten Bergen
  const sky = c.createLinearGradient(0, 0, 0, 160);
  sky.addColorStop(0, '#070b1e');
  sky.addColorStop(0.55, '#14204a');
  sky.addColorStop(1, '#2c3a68');
  c.fillStyle = sky;
  c.fillRect(0, 0, 1280, 170);
  const random = seeded(12);
  for (let i = 0; i < 140; i++) {
    const x = random() * 1280, y = random() * 110, r = random() < 0.1 ? 1.4 : 0.7;
    c.fillStyle = `rgba(255, 250, 230, ${0.3 + random() * 0.6})`;
    ellipse(c, x, y, r, r);
    c.fill();
  }
  // Mond
  const moon = { x: 960, y: 50 };
  const halo = c.createRadialGradient(moon.x, moon.y, 10, moon.x, moon.y, 90);
  halo.addColorStop(0, 'rgba(255, 244, 210, 0.35)');
  halo.addColorStop(1, 'rgba(255, 244, 210, 0)');
  c.fillStyle = halo;
  c.fillRect(moon.x - 90, moon.y - 90, 180, 180);
  c.fillStyle = '#fbf1cf';
  ellipse(c, moon.x, moon.y, 22, 22);
  c.fill();
  c.fillStyle = '#14204a';
  ellipse(c, moon.x + 10, moon.y - 5, 19, 19);
  c.fill();
  // Berge in zwei Reihen
  const ridge = (y0, amp, color, snow, seed) => {
    const r = seeded(seed);
    const points = [];
    for (let x = -20; x <= 1300; x += 40) points.push({ x, y: y0 - amp * (0.3 + r() * 0.7) * (0.6 + 0.4 * Math.sin(x * 0.006 + seed)) });
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-20, 200);
    points.forEach((p) => c.lineTo(p.x, p.y));
    c.lineTo(1300, 200);
    c.closePath();
    c.fill();
    c.fillStyle = snow;
    for (let i = 1; i < points.length - 1; i++) {
      const p = points[i];
      if (p.y > points[i - 1].y || p.y > points[i + 1].y) continue;
      c.beginPath();
      c.moveTo(p.x - 14, p.y + 12);
      c.lineTo(p.x, p.y);
      c.lineTo(p.x + 14, p.y + 12);
      c.lineTo(p.x + 6, p.y + 9);
      c.lineTo(p.x, p.y + 13);
      c.lineTo(p.x - 7, p.y + 9);
      c.closePath();
      c.fill();
    }
  };
  ridge(112, 46, '#25325c', 'rgba(200, 210, 235, 0.75)', 3);
  ridge(128, 30, '#1b2546', 'rgba(185, 196, 225, 0.6)', 8);
  // Pinselstruktur der Kulisse
  for (let i = 0; i < 2500; i++) {
    c.fillStyle = random() < 0.5 ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.05)';
    c.fillRect(random() * 1280, random() * 140, 2 + random() * 6, 1);
  }

  // Der Spieltisch mit grünem Filz
  const corners = [project(-900, 0), project(900, 0), project(900, 1000), project(-900, 1000)];
  const felt = c.createLinearGradient(0, Y0, 0, 690);
  felt.addColorStop(0, '#2c4423');
  felt.addColorStop(0.45, '#46682f');
  felt.addColorStop(1, '#35542a');
  c.fillStyle = felt;
  poly(c, corners);
  c.fill();
  c.save();
  poly(c, corners);
  c.clip();
  // Flecken im Filz
  for (let i = 0; i < 160; i++) {
    const p = project(-900 + random() * 1800, random() * 1000);
    const r = (30 + random() * 90) * p.s;
    const light = random() < 0.5;
    const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, light ? 'rgba(140, 170, 80, 0.12)' : 'rgba(10, 30, 8, 0.14)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = g;
    c.save();
    c.translate(p.x, p.y);
    c.scale(1, 0.55);
    c.fillRect(-r, -r, r * 2, r * 2);
    c.restore();
  }
  // Filzfasern
  for (let i = 0; i < 16000; i++) {
    const x = random() * 1280, y = Y0 + random() * (690 - Y0);
    const a = random() * Math.PI;
    c.strokeStyle = random() < 0.5 ? 'rgba(170, 200, 110, 0.14)' : 'rgba(10, 25, 6, 0.18)';
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * 2.4, y + Math.sin(a) * 1.4);
    c.stroke();
  }
  // Kante zur Kulisse
  const edge = c.createLinearGradient(0, Y0, 0, Y0 + 24);
  edge.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  edge.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = edge;
  c.fillRect(0, Y0, 1280, 24);
  c.restore();

  // Ein Weg aus Sand zum Dorf
  c.save();
  c.strokeStyle = 'rgba(196, 170, 120, 0.55)';
  c.lineWidth = 9;
  c.lineCap = 'round';
  c.beginPath();
  for (let X = -760; X <= 760; X += 20) {
    const p = project(X, 300 + Math.sin(X * 0.006) * 34);
    if (X === -760) c.moveTo(p.x, p.y); else c.lineTo(p.x, p.y);
  }
  c.stroke();
  c.restore();

  track(c);

  // Dorf und Wald hinter dem hinteren Gleis (von hinten nach vorne)
  const things = [
    { Z: 90, draw: () => toyTree(c, -720, 90, 70, 1) },
    { Z: 120, draw: () => toyHouse(c, -560, 120, { w: 64, h: 40, wall: '#c99c64', roof: '#7d2a22', seed: 4 }) },
    { Z: 70, draw: () => toyTree(c, -430, 70, 62, 2) },
    { Z: 150, draw: () => chapelBuilding(c, -250, 150) },
    { Z: 100, draw: () => toyTree(c, -110, 100, 76, 3) },
    { Z: 210, draw: () => toyHouse(c, 40, 210, { w: 58, h: 38, wall: '#9fb2c4', roof: '#3b4c6a', seed: 6 }) },
    { Z: 120, draw: () => toyTree(c, 190, 120, 66, 4) },
    { Z: 170, draw: () => toyHouse(c, 330, 170, { w: 70, h: 44, wall: '#d6b67a', roof: '#8c2f24', seed: 7 }) },
    { Z: 90, draw: () => toyTree(c, 470, 90, 74, 5) },
    { Z: 240, draw: () => toyTree(c, 560, 240, 58, 6) },
    { Z: 150, draw: () => toyHouse(c, 690, 150, { w: 60, h: 40, wall: '#b48a5a', roof: '#5a3a28', seed: 8 }) },
    { Z: 250, draw: () => toyTree(c, -620, 250, 60, 7) },
    { Z: 300, draw: () => lamp(c, -330, 300) },
    { Z: 290, draw: () => lamp(c, 120, 290) },
    { Z: 310, draw: () => lamp(c, 520, 318) },
    { Z: 270, draw: () => cottonSnow(c, -480, 270, 40, 3) },
    { Z: 230, draw: () => cottonSnow(c, 250, 236, 34, 4) },
    { Z: 330, draw: () => toyTree(c, -40, 330, 48, 8) },
    { Z: 320, draw: () => toyTree(c, 690, 320, 52, 9) },
  ];
  things.sort((a, b) => a.Z - b.Z).forEach((t) => t.draw());
}

// Kleine Kirche im Dorf (die Kapelle)
function chapelBuilding(c, X, Z) {
  toyHouse(c, X, Z, { w: 54, h: 46, wall: '#e1d6bd', roof: '#4f5a66', seed: 9, chimney: false });
  // Turm
  const b = project(X - 40, Z + 6), s = b.s;
  const w = 20 * s, h = 86 * s;
  const g = c.createLinearGradient(b.x - w / 2, 0, b.x + w / 2, 0);
  g.addColorStop(0, '#a79c86');
  g.addColorStop(1, '#ece3cd');
  c.fillStyle = g;
  c.fillRect(b.x - w / 2, b.y - h, w, h);
  c.fillStyle = '#ffd98a';
  c.beginPath();
  c.moveTo(b.x - 4 * s, b.y - h * 0.55);
  c.lineTo(b.x - 4 * s, b.y - h * 0.68);
  c.quadraticCurveTo(b.x, b.y - h * 0.76, b.x + 4 * s, b.y - h * 0.68);
  c.lineTo(b.x + 4 * s, b.y - h * 0.55);
  c.fill();
  c.fillStyle = '#3e4a58';
  c.beginPath();
  c.moveTo(b.x - w / 2 - 3 * s, b.y - h);
  c.lineTo(b.x, b.y - h - 34 * s);
  c.lineTo(b.x + w / 2 + 3 * s, b.y - h);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(245, 247, 255, 0.9)';
  c.beginPath();
  c.moveTo(b.x - w / 2 - 3 * s, b.y - h);
  c.lineTo(b.x - 4 * s, b.y - h - 20 * s);
  c.lineTo(b.x + 2 * s, b.y - h - 6 * s);
  c.closePath();
  c.fill();
  c.strokeStyle = '#d9b25a';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(b.x, b.y - h - 34 * s);
  c.lineTo(b.x, b.y - h - 44 * s);
  c.moveTo(b.x - 3.5, b.y - h - 40 * s);
  c.lineTo(b.x + 3.5, b.y - h - 40 * s);
  c.stroke();
}

// ---------------------------------------------------------------- Mitte des Rings
function drawInfield(c) {
  const things = [
    { Z: 470, draw: () => cottonSnow(c, 330, 470, 30, 11) },
    { Z: 575, draw: () => pond(c) },
    { Z: 640, draw: () => toyTree(c, -330, 650, 64, 21) },
    { Z: 560, draw: () => toyHouse(c, 330, 560, { w: 56, h: 36, wall: '#c45a3c', roof: '#3a3530', seed: 13 }) },
    { Z: 610, draw: () => toyTree(c, 470, 610, 70, 22) },
    { Z: 520, draw: () => toyTree(c, 560, 520, 52, 23) },
    { Z: 655, draw: () => tower(c) },
    { Z: 640, draw: () => toyTree(c, -40, 640, 62, 24) },
    { Z: 690, draw: () => toyTree(c, 210, 690, 76, 25) },
    { Z: 600, draw: () => lamp(c, -60, 560) },
    { Z: 525, draw: () => toyHouse(c, -290, 525, { w: 56, h: 36, wall: '#e2c48a', roof: '#2f4a3a', seed: 15 }) },
    { Z: 600, draw: () => cottonSnow(c, -40, 600, 28, 12) },
    { Z: 722, draw: () => semaphore(c, -345, 722) },
    ...SLOT_U.slice(7).map((u, i) => ({ Z: ZF + 52, draw: () => numberPost(c, pathAt(u).X, ZF + 52, `${i + 8}`) })),
  ];
  things.sort((a, b) => a.Z - b.Z).forEach((t) => t.draw());
}

// ---------------------------------------------------------------- Der Patchwork-Tunnel
const PATCH_COLORS = ['#b8402e', '#d9823a', '#d8b04a', '#4f6f9a', '#8fb3cf', '#5f8a4a', '#e8d9b5', '#9a5a8a', '#c9614a'];

function tunnelOutline(c) {
  c.beginPath();
  c.moveTo(-30, 646);
  c.bezierCurveTo(30, 650, 84, 640, 108, 616);
  c.bezierCurveTo(120, 604, 126, 588, 124, 572);
  c.lineTo(184, 528);
  c.bezierCurveTo(212, 506, 240, 470, 254, 426);
  c.bezierCurveTo(266, 384, 262, 342, 244, 306);
  c.bezierCurveTo(224, 266, 196, 246, 160, 236);
  c.bezierCurveTo(112, 222, 56, 228, 18, 246);
  c.bezierCurveTo(-6, 256, -24, 272, -30, 290);
  c.closePath();
}

// Die Mündung vorne: ein Bogen senkrecht zum Gleis
function portalShape(c, inset = 0) {
  const p = pathAt(PORTAL_NEAR);
  const nx = -p.dz, nz = p.dx;
  const pt = (across, h) => project(p.X + nx * across, p.Z + nz * across, h);
  const half = 40 - inset, rise = 98 - inset;
  c.beginPath();
  const start = pt(-half, 0);
  c.moveTo(start.x, start.y);
  for (let i = 0; i <= 24; i++) {
    const a = Math.PI - (i / 24) * Math.PI;
    const q = pt(Math.cos(a) * half, 58 + Math.sin(a) * (rise - 58));
    if (i === 0) {
      const side = pt(-half, 58);
      c.lineTo(side.x, side.y);
    }
    c.lineTo(q.x, q.y);
  }
  const end = pt(half, 0);
  c.lineTo(end.x, end.y);
  c.closePath();
}

function drawTunnel(c) {
  // Schatten auf dem Filz
  contactShadow(c, 100, 636, 180, 30, 0.6);
  c.save();
  tunnelOutline(c);
  c.clip();
  // Grundstoff
  c.fillStyle = '#e6d6b0';
  c.fillRect(-40, 220, 360, 460);
  // Patchwork-Flicken in Reihen, die der Wölbung folgen
  const random = seeded(404);
  const rows = 9;
  for (let row = 0; row < rows; row++) {
    const y0 = 226 + row * 50, y1 = y0 + 52;
    const cols = 6;
    for (let col = 0; col < cols; col++) {
      const bend = Math.sin((row / rows) * Math.PI) * 18;
      const x0 = -40 + col * 62 + (row % 2) * 24 - bend * (col / cols);
      const pts = [
        { x: x0 + random() * 8, y: y0 + random() * 6 },
        { x: x0 + 64 + random() * 8, y: y0 + random() * 8 + bend * 0.2 },
        { x: x0 + 62 + random() * 8, y: y1 + random() * 6 },
        { x: x0 - 2 + random() * 8, y: y1 + random() * 8 - bend * 0.2 },
      ];
      const color = PATCH_COLORS[Math.floor(random() * PATCH_COLORS.length)];
      c.fillStyle = color;
      poly(c, pts);
      c.fill();
      // Stoffmuster
      c.save();
      poly(c, pts);
      c.clip();
      const pattern = Math.floor(random() * 4);
      const ink = shade(color, color === '#e8d9b5' ? -60 : 50, 0.55);
      if (pattern === 0) {
        // Blätter
        c.fillStyle = ink;
        for (let k = 0; k < 6; k++) {
          const lx = x0 + random() * 64, ly = y0 + random() * 50;
          c.beginPath();
          c.ellipse(lx, ly, 6, 2.6, random() * 3, 0, Math.PI * 2);
          c.fill();
        }
      } else if (pattern === 1) {
        // Punkte
        c.fillStyle = ink;
        for (let yy = y0 + 5; yy < y1; yy += 9) for (let xx = x0 + (yy % 2) * 4; xx < x0 + 72; xx += 9) {
          ellipse(c, xx, yy, 1.5, 1.5);
          c.fill();
        }
      } else if (pattern === 2) {
        // Karos
        c.strokeStyle = ink;
        c.lineWidth = 1.2;
        for (let xx = x0; xx < x0 + 72; xx += 10) { c.beginPath(); c.moveTo(xx, y0); c.lineTo(xx, y1 + 8); c.stroke(); }
        for (let yy = y0; yy < y1 + 8; yy += 10) { c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + 72, yy); c.stroke(); }
      } else {
        // Sterne
        c.fillStyle = ink;
        for (let k = 0; k < 4; k++) star(c, x0 + 10 + random() * 50, y0 + 8 + random() * 38, 4);
      }
      c.restore();
      // Naht
      c.strokeStyle = 'rgba(255, 246, 220, 0.75)';
      c.setLineDash([3, 3]);
      c.lineWidth = 1;
      poly(c, pts);
      c.stroke();
      c.setLineDash([]);
      c.strokeStyle = 'rgba(40, 20, 10, 0.35)';
      c.lineWidth = 1.2;
      c.stroke();
    }
  }
  // Licht von rechts oben, Schatten links unten: der Hügel wirkt gewölbt
  const light = c.createRadialGradient(250, 300, 20, 170, 420, 330);
  light.addColorStop(0, 'rgba(255, 236, 190, 0.32)');
  light.addColorStop(0.5, 'rgba(255, 236, 190, 0)');
  light.addColorStop(1, 'rgba(10, 6, 20, 0.55)');
  c.fillStyle = light;
  c.fillRect(-40, 220, 360, 460);
  // Rundung: Ränder dunkler, oben rechts ein Glanz
  c.save();
  tunnelOutline(c);
  c.clip();
  for (const width of [64, 48, 34, 22, 12]) {
    c.strokeStyle = 'rgba(20, 10, 24, 0.08)';
    c.lineWidth = width;
    c.stroke();
  }
  c.restore();
  const sheen = c.createRadialGradient(200, 300, 4, 200, 300, 90);
  sheen.addColorStop(0, 'rgba(255, 244, 214, 0.28)');
  sheen.addColorStop(1, 'rgba(255, 244, 214, 0)');
  c.fillStyle = sheen;
  c.fillRect(100, 200, 200, 200);
  const foot = c.createLinearGradient(0, 560, 0, 665);
  foot.addColorStop(0, 'rgba(0, 0, 0, 0)');
  foot.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  c.fillStyle = foot;
  c.fillRect(-40, 560, 360, 110);
  c.restore();
  // Rand des Stoffs
  c.strokeStyle = 'rgba(40, 20, 10, 0.6)';
  c.lineWidth = 2;
  tunnelOutline(c);
  c.stroke();

  // Watteschnee oben und zwei Tannen
  cottonSnowScreen(c, 150, 250, 70, 18);
  cottonSnowScreen(c, 60, 262, 50, 19);
  cottonSnowScreen(c, 240, 300, 40, 20);
  treeOnScreen(c, 98, 262, 54, 31);
  treeOnScreen(c, 196, 262, 44, 32);

  // Mündung: Ziegelbogen und dunkles Innere
  c.save();
  portalShape(c, -9);
  c.fillStyle = '#8a3a26';
  c.fill();
  portalShape(c, -9);
  c.clip();
  const p = pathAt(PORTAL_NEAR);
  const nx = -p.dz, nz = p.dx;
  const pt = (across, h) => project(p.X + nx * across, p.Z + nz * across, h);
  c.strokeStyle = 'rgba(240, 210, 170, 0.6)';
  c.lineWidth = 1;
  for (let i = 0; i <= 18; i++) {
    const a = Math.PI - (i / 18) * Math.PI;
    const q0 = pt(Math.cos(a) * 40, 58 + Math.sin(a) * 40), q1 = pt(Math.cos(a) * 50, 58 + Math.sin(a) * 50);
    c.beginPath();
    c.moveTo(q0.x, q0.y);
    c.lineTo(q1.x, q1.y);
    c.stroke();
  }
  for (const side of [-1, 1]) {
    for (let h = 8; h < 58; h += 10) {
      const q0 = pt(side * 40, h), q1 = pt(side * 50, h);
      c.beginPath();
      c.moveTo(q0.x, q0.y);
      c.lineTo(q1.x, q1.y);
      c.stroke();
    }
  }
  c.restore();
  portalShape(c);
  const hole = c.createRadialGradient(pt(0, 30).x, pt(0, 30).y, 4, pt(0, 40).x, pt(0, 40).y, 70);
  hole.addColorStop(0, '#000000');
  hole.addColorStop(0.7, '#0b0705');
  hole.addColorStop(1, '#2a1810');
  c.fillStyle = hole;
  c.fill();
  // Schlussstein
  const key = pt(0, 104);
  c.fillStyle = '#d8c7a0';
  c.beginPath();
  c.moveTo(key.x - 7, key.y - 4);
  c.lineTo(key.x + 7, key.y - 4);
  c.lineTo(key.x + 5, key.y + 9);
  c.lineTo(key.x - 5, key.y + 9);
  c.closePath();
  c.fill();
}

function cottonSnowScreen(c, x, y, size, seed) {
  const random = seeded(seed);
  for (let i = 0; i < 10; i++) {
    const px = x + (random() - 0.5) * size * 1.4, py = y + (random() - 0.5) * size * 0.4;
    const r = size * (0.2 + random() * 0.25);
    const g = c.createRadialGradient(px - r * 0.3, py - r * 0.4, 0, px, py, r);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.97)');
    g.addColorStop(0.7, 'rgba(226, 232, 246, 0.85)');
    g.addColorStop(1, 'rgba(200, 210, 230, 0)');
    c.fillStyle = g;
    ellipse(c, px, py, r, r * 0.62);
    c.fill();
  }
}

function treeOnScreen(c, x, y, height, seed) {
  const Z = (y - Y0) / K;
  const X = (x - 640) / scaleAt(Z);
  toyTree(c, X, Z, height, seed);
}

// Formsignal aus Blech (Flügel steht auf Halt)
function semaphore(c, X, Z) {
  const b = project(X, Z), s = b.s;
  contactShadow(c, b.x - 8 * s, b.y + 2, 18 * s, 5 * s, 0.5);
  c.fillStyle = '#2a2622';
  ellipse(c, b.x, b.y, 9 * s, 3.6 * s);
  c.fill();
  // Gittermast
  c.strokeStyle = '#3a3836';
  c.lineWidth = 2.4 * s;
  c.beginPath();
  c.moveTo(b.x - 3 * s, b.y);
  c.lineTo(b.x - 1.6 * s, b.y - 110 * s);
  c.moveTo(b.x + 3 * s, b.y);
  c.lineTo(b.x + 1.6 * s, b.y - 110 * s);
  c.stroke();
  c.lineWidth = 0.8 * s;
  for (let i = 0; i < 10; i++) {
    const y0 = b.y - i * 11 * s, y1 = b.y - (i + 1) * 11 * s;
    c.beginPath();
    c.moveTo(b.x - 3 * s, y0);
    c.lineTo(b.x + 3 * s, y1);
    c.stroke();
  }
  // Flügel: rot-weiß, waagerecht = Halt
  c.save();
  c.translate(b.x + 2 * s, b.y - 100 * s);
  c.fillStyle = '#f2ede2';
  roundedRect(c, 0, -3.4 * s, 34 * s, 6.8 * s, 2 * s);
  c.fill();
  c.fillStyle = '#c0392b';
  c.fillRect(2 * s, -3.4 * s, 9 * s, 6.8 * s);
  c.fillRect(20 * s, -3.4 * s, 9 * s, 6.8 * s);
  c.restore();
  // Lampe
  c.fillStyle = '#1e1c1a';
  roundedRect(c, b.x - 9 * s, b.y - 92 * s, 8 * s, 10 * s, 1.5 * s);
  c.fill();
  c.fillStyle = '#ff5a3a';
  ellipse(c, b.x - 5 * s, b.y - 87 * s, 2.4 * s, 2.4 * s);
  c.fill();
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(b.x - 5 * s, b.y - 87 * s, 0, b.x - 5 * s, b.y - 87 * s, 14 * s);
  g.addColorStop(0, 'rgba(255, 90, 60, 0.6)');
  g.addColorStop(1, 'rgba(255, 90, 60, 0)');
  c.fillStyle = g;
  c.fillRect(b.x - 20 * s, b.y - 102 * s, 30 * s, 30 * s);
  c.restore();
  c.fillStyle = '#2a2622';
  ellipse(c, b.x, b.y - 111 * s, 3 * s, 2 * s);
  c.fill();
}

// Ein Wachsmalstift, den Mira auf dem Filz vergessen hat
function crayon(c, X, Z, angle, color) {
  const b = project(X, Z), s = b.s;
  c.save();
  c.translate(b.x, b.y);
  c.scale(1, 0.6);
  c.rotate(angle);
  contactShadow(c, -4, 6, 34 * s, 7 * s, 0.45);
  const g = c.createLinearGradient(0, -5 * s, 0, 5 * s);
  g.addColorStop(0, shade(color, 60));
  g.addColorStop(0.45, color);
  g.addColorStop(1, shade(color, -50));
  c.fillStyle = g;
  roundedRect(c, -30 * s, -5 * s, 52 * s, 10 * s, 2 * s);
  c.fill();
  c.beginPath();
  c.moveTo(22 * s, -5 * s);
  c.lineTo(34 * s, -1 * s);
  c.lineTo(34 * s, 1 * s);
  c.lineTo(22 * s, 5 * s);
  c.closePath();
  c.fill();
  // Papierhülle
  c.fillStyle = 'rgba(245, 236, 210, 0.92)';
  c.fillRect(-22 * s, -5.2 * s, 30 * s, 10.4 * s);
  c.fillStyle = color;
  c.fillRect(-20 * s, -1.2 * s, 26 * s, 2.4 * s);
  c.restore();
}

// ---------------------------------------------------------------- Vorne: Nummernsteine und Tischkante
function drawFront(c) {
  SLOT_U.slice(0, 7).forEach((u, i) => numberPost(c, pathAt(u).X, ZN + 54, `${i + 1}`));
  toyTree(c, 690, 905, 58, 41);
  toyTree(c, 600, 960, 44, 43);
  cottonSnow(c, 640, 930, 26, 42);
  cottonSnow(c, -200, 900, 22, 44);
  crayon(c, -40, 935, 0.25, '#c0392b');
  crayon(c, 30, 952, -0.5, '#2a63c9');
  crayon(c, 330, 925, 0.9, '#e0a526');
  // Holzkante des Tischs
  const y = project(0, 1000).y;
  const edge = c.createLinearGradient(0, y, 0, 720);
  edge.addColorStop(0, '#9a6638');
  edge.addColorStop(0.12, '#6d4220');
  edge.addColorStop(1, '#3a210e');
  c.fillStyle = edge;
  c.fillRect(0, y, 1280, 720 - y);
  const random = seeded(8);
  c.strokeStyle = 'rgba(30, 14, 4, 0.35)';
  c.lineWidth = 0.8;
  for (let i = 0; i < 9; i++) {
    const yy = y + 4 + random() * (720 - y - 6);
    c.beginPath();
    c.moveTo(0, yy);
    for (let x = 0; x <= 1280; x += 40) c.lineTo(x, yy + Math.sin(x * 0.01 + i) * 1.4);
    c.stroke();
  }
  c.fillStyle = 'rgba(255, 220, 170, 0.35)';
  c.fillRect(0, y, 1280, 1.4);
  // Messingschild von Papa
  const px = 1146, py = y + 16;
  c.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundedRect(c, px - 110, py - 11, 222, 24, 4);
  c.fill();
  c.fillStyle = gold(c, px - 110, py - 12, px + 110, py + 12);
  roundedRect(c, px - 111, py - 13, 222, 24, 4);
  c.fill();
  c.strokeStyle = 'rgba(80, 50, 10, 0.7)';
  c.lineWidth = 0.8;
  roundedRect(c, px - 107, py - 9, 214, 16, 3);
  c.stroke();
  c.fillStyle = '#4a2e0c';
  c.font = `italic 11px ${SERIF}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('Für Mira · Frohe Weihnachten · Papa', px, py - 0.5);
  for (const sx of [px - 103, px + 103]) {
    c.fillStyle = '#7a5a20';
    ellipse(c, sx, py - 1, 1.8, 1.8);
    c.fill();
  }
}

// ============================================================================================
//  Das ganze Bild
// ============================================================================================

// Wie weit ist das Fahrzeug im Tunnel? 'out' | 'entering' | 'inside'
function tunnelState(u, length) {
  u = ((u % RING) + RING) % RING;
  const a = u - length / 2, b = u + length / 2;
  if (b <= PORTAL_NEAR) return 'near';
  if (a < PORTAL_NEAR) return 'entering';
  if (b <= PORTAL_FAR) return 'inside';
  return 'far';
}

//   state = {
//     time, glow,                                      // glow: Lichter an (0 … 1)
//     loco: { u, roll, key },
//     wagons: [{ index, u | pose, roll, hover, lift }],   // u: steht auf dem Gleis, pose: in der Hand
//     target,                                          // Platz, über dem gerade ein Wagen schwebt
//     puffs: [{ x, y, r, a }],
//   }
export function drawRailway(ctx, state) {
  blit(ctx, layer('back', 0, 0, 1280, 720, drawBack));
  twinkle(ctx, state.time);

  // Ziel beim Ziehen: das Gleisstück leuchtet
  if (state.target >= 0) slotGlow(ctx, state.target, state.time);

  const onTrack = [], free = [];
  const loco = { kind: 'loco', u: state.loco.u, length: LOCO_LENGTH, roll: state.loco.roll, key: state.loco.key };
  onTrack.push(loco);
  for (const w of state.wagons) {
    const item = { kind: 'wagon', ...w, length: WAGON_LENGTH };
    if (w.pose) free.push(item); else onTrack.push(item);
  }
  const far = [], near = [], entering = [];
  let chimney = null;
  for (const item of onTrack) {
    const where = tunnelState(item.u, item.length);
    if (where === 'inside') continue;
    item.pose = pathAt(item.u);
    if (where === 'far') far.push(item); else if (where === 'entering') entering.push(item); else near.push(item);
  }
  const draw = (item, cut = null) => {
    if (item.kind === 'loco') {
      const info = drawLoco(ctx, item.pose, { roll: item.roll, glow: state.glow, key: item.key, cut });
      chimney = info.chimney ? { x: info.chimney.x, y: info.chimney.y, facing: info.facing } : null;
    } else {
      drawWagon(ctx, item.index, { ...item.pose, lift: item.lift ?? 0 }, { roll: item.roll ?? 0, glow: state.glow, hover: item.hover ?? 0, target: item.target, cut });
    }
  };
  far.sort((a, b) => a.pose.Z - b.pose.Z).forEach((item) => draw(item));
  blit(ctx, layer('infield', 0, 300, 1280, 330, drawInfield));
  towerLight(ctx, state.time);
  blit(ctx, layer('tunnel', 0, 200, 320, 480, drawTunnel));
  // halb im Tunnel: nur der Teil vor der Mündung (in Fahrzeug-Koordinaten abgeschnitten)
  for (const item of entering) {
    const ahead = PORTAL_NEAR - (((item.u % RING) + RING) % RING);
    const forward = frameFor(item.pose, item.length).flipped ? -1 : 1;
    draw(item, forward > 0 ? [-Infinity, ahead] : [-ahead, Infinity]);
  }
  near.sort((a, b) => a.pose.Z - b.pose.Z).forEach((item) => draw(item));
  blit(ctx, layer('front', 0, 520, 1280, 200, drawFront));

  // Wagen in der Hand (oder auf dem Weg zu ihrem Platz)
  free.sort((a, b) => a.pose.Z - b.pose.Z).forEach((item) => {
    drawWagon(ctx, item.index, item.pose, { roll: 0, glow: state.glow, hover: item.hover ?? 0 });
  });

  // Dampfwölkchen aus Watte
  for (const puff of state.puffs ?? []) {
    const g = ctx.createRadialGradient(puff.x - puff.r * 0.3, puff.y - puff.r * 0.3, 0, puff.x, puff.y, puff.r);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.75 * puff.a})`);
    g.addColorStop(0.6, `rgba(240, 243, 250, ${0.4 * puff.a})`);
    g.addColorStop(1, 'rgba(230, 236, 248, 0)');
    ctx.fillStyle = g;
    ellipse(ctx, puff.x, puff.y, puff.r, puff.r * 0.85);
    ctx.fill();
  }

  // Licht der Lampe im Zimmer: warm in der Mitte, dunkle Ränder
  const light = ctx.createRadialGradient(720, 360, 120, 680, 380, 860);
  light.addColorStop(0, 'rgba(255, 200, 120, 0.05)');
  light.addColorStop(0.55, 'rgba(10, 6, 16, 0.08)');
  light.addColorStop(1, 'rgba(6, 3, 10, 0.62)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, 1280, 720);
  return { chimney };
}

function twinkle(ctx, time) {
  const random = seeded(55);
  for (let i = 0; i < 18; i++) {
    const x = random() * 1280, y = 8 + random() * 80, phase = random() * 6, speed = 0.8 + random() * 1.6;
    const a = Math.max(0, Math.sin(time * speed + phase)) * 0.9;
    if (a < 0.05) continue;
    ctx.fillStyle = `rgba(255, 250, 225, ${a})`;
    ctx.fillRect(x - 0.6, y - 2.4, 1.2, 4.8);
    ctx.fillRect(x - 2.4, y - 0.6, 4.8, 1.2);
  }
}

// Das Turmlicht blinkt langsam (wie draußen)
function towerLight(ctx, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
  const { x, y } = TOWER_LIGHT;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 60);
  g.addColorStop(0, `rgba(255, 236, 170, ${0.35 + 0.5 * pulse})`);
  g.addColorStop(0.25, `rgba(255, 210, 120, ${0.18 + 0.25 * pulse})`);
  g.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 60, y - 60, 120, 120);
  ctx.restore();
}

function slotGlow(ctx, slot, time) {
  const p = pathAt(SLOT_U[slot]);
  const pulse = 0.75 + 0.25 * Math.sin(time * 6);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const a = project(p.X - WAGON_LENGTH / 2, p.Z), b = project(p.X + WAGON_LENGTH / 2, p.Z);
  const c = project(p.X, p.Z);
  const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, (b.x - a.x) * 0.65);
  g.addColorStop(0, `rgba(255, 214, 130, ${0.45 * pulse})`);
  g.addColorStop(1, 'rgba(255, 200, 110, 0)');
  ctx.fillStyle = g;
  ctx.translate(c.x, c.y);
  ctx.scale(1, 0.32);
  ctx.fillRect(-(b.x - a.x), -(b.x - a.x), (b.x - a.x) * 2, (b.x - a.x) * 2);
  ctx.restore();
}

// Bildschirmmitte eines Platzes (am Boden) – zum Ablegen
export function slotPoint(slot) {
  const p = pathAt(SLOT_U[slot]);
  return project(p.X, p.Z);
}
