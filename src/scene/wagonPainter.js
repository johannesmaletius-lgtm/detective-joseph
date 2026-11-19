import { OUTLINE, glow, grime, horizontal, line, poly, seeded, vertical } from '../core/paint.js';
import { trainCompartment } from './trainCompartment.js';

// Malt das Innere eines Eisenbahnwagens in Zentralperspektive – für die Wagen 2 bis 4.
//
// Alle Wagen haben denselben Grundriss wie das erste Abteil: Der Fluchtpunkt liegt hinten an der Tür
// (640, 206), die Fenster sitzen an denselben Stellen. So passt die fahrende Außenwelt (outsideView.js)
// in jedem Wagen.
//
// RAUMKOORDINATEN: Statt Bildpunkten wird hier in einem kleinen 3D-Raum gezeichnet:
//   X  quer zum Wagen   −257 = linke Wand, 0 = Mitte, 257 = rechte Wand
//   Y  Höhe             0 = Boden, 350 = Decke
//   Z  Tiefe            1 = Rückwand (mit der Tür), kleiner = näher am Betrachter (unterer Bildrand ≈ 0,4)
// P(X, Y, Z) rechnet einen Raumpunkt in einen Bildpunkt um. Was weiter vorne steht (kleines Z),
// erscheint größer. So stehen Tische, Betten und Kisten von selbst richtig im Raum.

export const VANISHING = { x: 640, y: 206 };
export const EYE = 204;            // Augenhöhe (Raumeinheiten über dem Boden)
export const WALL = 257;           // Abstand der Seitenwände von der Mitte
export const CEILING = 350;
export const NEAR = 0.3;           // so weit vorne endet das Bild sicher

export function P(X, Y, Z) {
  return [VANISHING.x + X / Z, VANISHING.y + (EYE - Y) / Z];
}

// Bildpunkt eines Bodenpunkts (für Laufbereich und Standplätze)
export function floor(X, Z) {
  const [x, y] = P(X, 0, Z);
  return [Math.round(x), Math.round(y)];
}

// Die Fensterscheiben – dieselben wie im ersten Abteil (siehe trainCompartment.js)
export const WINDOWS = trainCompartment.outside.windows;

// Außenwelt für einen Wagen: dieselben Ebenen wie im ersten Abteil, auf Wunsch nur ein Teil der Fenster
export function outsideFor(windowIndexes = [0, 1, 2, 3, 4, 5], extra = {}) {
  return { ...trainCompartment.outside, windows: windowIndexes.map((i) => WINDOWS[i]), ...extra };
}

// Fahrgefühl wie im ersten Abteil; Lampen (Lichtschein) je Wagen
export function trainFor(lamps, extra = {}) {
  return { ...trainCompartment.train, lamps, ...extra };
}

// Gleiche Perspektive für Joseph wie im ersten Abteil
export const PERSPECTIVE = trainCompartment.perspective;

// ============================================================================================
//  Der Rohbau: Boden, Wände, Decke, Rückwand
// ============================================================================================
//
// theme: {
//   wall: ['#…', '#…'],  Farbverlauf der Seitenwände (oben → unten)
//   panel: '#…',         untere Wandverkleidung (bis Y = panelHeight)
//   panelHeight: 110,
//   back: ['#…', '#…'],  Rückwand
//   ceiling: '#…',
//   floor: ['#…', '#…'], Dielen (zwei Holztöne)
//   planks: 40,          Breite der Dielen
//   rail: '#…',          Zierleiste
// }
export function paintShell(ctx, theme) {
  const rand = seeded(theme.seed ?? 7);
  const near = NEAR;

  // Decke
  poly(ctx, [P(-WALL, CEILING, 1), P(WALL, CEILING, 1), P(WALL, CEILING, near), P(-WALL, CEILING, near)], theme.ceiling, { width: 0 });
  // Deckenrippen
  for (const z of [0.95, 0.75, 0.6, 0.5, 0.42, 0.36]) {
    line(ctx, [P(-WALL, CEILING, z), P(WALL, CEILING, z)], 'rgba(20, 10, 4, 0.55)', 6 / z * 0.4);
  }

  // Seitenwände
  for (const side of [-1, 1]) {
    const X = side * WALL;
    const top = P(X, CEILING, near)[1];
    poly(ctx, [P(X, 0, 1), P(X, CEILING, 1), P(X, CEILING, near), P(X, 0, near)], vertical(ctx, top, 720, theme.wall), { width: 0 });
    // untere Verkleidung
    const h = theme.panelHeight ?? 110;
    poly(ctx, [P(X, 0, 1), P(X, h, 1), P(X, h, near), P(X, 0, near)], theme.panel, { width: 0 });
    for (let z = 0.95; z > near; z -= 0.07) { // senkrechte Fugen der Verkleidung
      line(ctx, [P(X, 0, z), P(X, h, z)], 'rgba(20, 10, 4, 0.35)', 2 / z * 0.5);
    }
    line(ctx, [P(X, h, 1), P(X, h, near)], theme.rail ?? '#c99a4a', 7);
    line(ctx, [P(X, h + 4, 1), P(X, h + 4, near)], 'rgba(20, 10, 4, 0.5)', 2);
    // Gepäckablage oben
    if (theme.rack !== false) {
      const y = 280;
      for (const offset of [0, 26, 52]) line(ctx, [P(X - side * offset, y, 0.98), P(X - side * offset, y, near)], '#2b1a10', 5);
      for (const offset of [0, 26, 52]) line(ctx, [P(X - side * offset, y + 2, 0.98), P(X - side * offset, y + 2, near)], 'rgba(200, 170, 120, 0.35)', 1.5);
      for (const z of [0.9, 0.7, 0.55, 0.45]) line(ctx, [P(X, y + 30, z), P(X, y, z), P(X - side * 52, y, z)], '#2b1a10', 4);
    }
    grime(ctx, [P(X, 0, 1), P(X, CEILING, 1), P(X, CEILING, near), P(X, 0, near)], { count: 70, seed: 3 + side, alpha: 0.1, size: [6, 30] });
  }

  // Boden: Dielen laufen zum Fluchtpunkt
  const floorPoly = [P(-WALL, 0, 1), P(WALL, 0, 1), P(WALL, 0, near), P(-WALL, 0, near)];
  poly(ctx, floorPoly, vertical(ctx, 410, 720, theme.floor), { width: 0 });
  const plank = theme.planks ?? 40;
  for (let X = -WALL; X <= WALL; X += plank) {
    line(ctx, [P(X, 0, 1), P(X, 0, near)], 'rgba(30, 14, 6, 0.55)', 2);
  }
  // Stöße der Dielen, versetzt
  for (let X = -WALL, i = 0; X < WALL; X += plank, i++) {
    for (let z = 0.97 - rand() * 0.1; z > near; z -= 0.12 + rand() * 0.1) {
      line(ctx, [P(X, 0, z), P(X + plank, 0, z)], 'rgba(30, 14, 6, 0.45)', 1.6);
    }
    if (i % 2) poly(ctx, [P(X, 0, 1), P(X + plank, 0, 1), P(X + plank, 0, near), P(X, 0, near)], 'rgba(255, 220, 160, 0.04)', { width: 0 });
  }
  grime(ctx, floorPoly, { count: 120, seed: 11, alpha: 0.14, size: [8, 40] });

  // Rückwand
  const [bx0, by0] = P(-WALL, CEILING, 1);
  const [bx1, by1] = P(WALL, 0, 1);
  poly(ctx, [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], vertical(ctx, by0, by1, theme.back), { width: 0 });
  grime(ctx, [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], { count: 40, seed: 5, alpha: 0.1, size: [6, 26] });
  // Kanten
  line(ctx, [P(-WALL, 0, 1), P(-WALL, CEILING, 1), P(WALL, CEILING, 1), P(WALL, 0, 1), P(-WALL, 0, 1)], OUTLINE, 4);
  for (const side of [-1, 1]) {
    line(ctx, [P(side * WALL, 0, 1), P(side * WALL, 0, near)], OUTLINE, 4);
    line(ctx, [P(side * WALL, CEILING, 1), P(side * WALL, CEILING, near)], OUTLINE, 4);
  }
}

// Deckenlampe (Leuchtkörper) mittig an der Decke in Tiefe z
export function paintCeilingLamp(ctx, z, { color = '#ffd27a', width = 70 } = {}) {
  const [x0, y0] = P(-width / 2, CEILING, z);
  const [x1] = P(width / 2, CEILING, z);
  const h = 10 / z;
  poly(ctx, [[x0 - 6 / z, y0], [x1 + 6 / z, y0], [x1, y0 + h], [x0, y0 + h]], '#3b2614', { width: 3 });
  poly(ctx, [[x0 + 4, y0 + h], [x1 - 4, y0 + h], [x1 - 10, y0 + h * 2.2], [x0 + 10, y0 + h * 2.2]], color, { width: 3 });
  glow(ctx, (x0 + x1) / 2, y0 + h * 1.6, 40 / z, '255, 210, 130', 0.5);
}

// ============================================================================================
//  Fenster
// ============================================================================================

// Fensterrahmen malen und die Scheiben durchsichtig ausschneiden (dahinter liegt die Außenwelt).
// options.curtains: Farbe von Vorhängen links und rechts (oder null)
export function paintWindows(ctx, windows, { frame = '#5b3a1e', curtains = null, glassTint = null } = {}) {
  for (const w of windows) {
    const pad = Math.max(8, (w.bottom - w.top) * 0.07);
    roundRect(ctx, w.from - pad, w.top - pad, w.to - w.from + 2 * pad, w.bottom - w.top + 2 * pad, pad * 1.6);
    ctx.fillStyle = frame;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    roundRect(ctx, w.from - pad * 0.45, w.top - pad * 0.45, w.to - w.from + pad * 0.9, w.bottom - w.top + pad * 0.9, pad);
    ctx.strokeStyle = 'rgba(255, 225, 170, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Scheiben ausschneiden
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (const w of windows) {
    roundRect(ctx, w.from, w.top, w.to - w.from, w.bottom - w.top, 8);
    ctx.fillStyle = '#000';
    ctx.fill();
  }
  ctx.restore();
  if (glassTint) {
    for (const w of windows) {
      roundRect(ctx, w.from, w.top, w.to - w.from, w.bottom - w.top, 8);
      ctx.fillStyle = glassTint;
      ctx.fill();
    }
  }
  if (curtains) for (const w of windows) paintCurtains(ctx, w, curtains);
}

function paintCurtains(ctx, w, color) {
  const width = (w.to - w.from) * 0.22;
  const pad = Math.max(8, (w.bottom - w.top) * 0.07);
  for (const side of [-1, 1]) {
    const edge = side < 0 ? w.from - pad - 4 : w.to + pad + 4;
    const inner = edge - side * (width + pad);
    const top = w.top - pad - 6, bottom = w.bottom + pad + 18;
    ctx.beginPath();
    ctx.moveTo(edge, top);
    ctx.lineTo(inner, top);
    ctx.quadraticCurveTo(inner + side * width * 0.2, (top + bottom) / 2, inner - side * 4, bottom - 30);
    ctx.quadraticCurveTo(inner + side * width * 0.4, bottom, edge, bottom);
    ctx.closePath();
    ctx.fillStyle = horizontal(ctx, Math.min(edge, inner), Math.max(edge, inner), [shade(color, -0.25), color, shade(color, 0.2), shade(color, -0.2)]);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
    // Falten
    for (let i = 1; i < 4; i++) {
      const x = edge - side * (width + pad) * (i / 4);
      line(ctx, [[x, top + 6], [x + side * 3, bottom - 20]], 'rgba(20, 5, 5, 0.35)', 2);
    }
    // Raffhalter
    line(ctx, [[edge, (top + bottom) / 2 + 10], [inner + side * 6, (top + bottom) / 2 + 4]], '#d9a441', 4);
  }
  // Stange
  line(ctx, [[w.from - pad - 10, w.top - pad - 8], [w.to + pad + 10, w.top - pad - 8]], '#d9a441', 4);
}

// ============================================================================================
//  Möbel als Kästen im Raum
// ============================================================================================
//
// box(ctx, { x: [X0, X1], y: [Y0, Y1], z: [Znah, Zfern] }, { front, top, side, bottom })
// zeichnet die sichtbaren Seiten eines Quaders: die Vorderseite, die Oberseite (wenn sie unter der
// Augenhöhe liegt), die Unterseite (wenn darüber) und die Seite, die zur Wagenmitte zeigt.
export function box(ctx, { x: [x0, x1], y: [y0, y1], z: [zn, zf] }, colors, { width = 3 } = {}) {
  const c = typeof colors === 'string' ? { front: colors } : colors;
  const front = c.front;
  const top = c.top ?? shade(front, 0.15);
  const side = c.side ?? shade(front, -0.18);
  const bottom = c.bottom ?? shade(front, -0.35);
  // Seite zur Mitte hin
  if (x1 < 0) poly(ctx, [P(x1, y0, zn), P(x1, y1, zn), P(x1, y1, zf), P(x1, y0, zf)], side, { width });
  if (x0 > 0) poly(ctx, [P(x0, y0, zn), P(x0, y1, zn), P(x0, y1, zf), P(x0, y0, zf)], side, { width });
  if (y1 < EYE) poly(ctx, [P(x0, y1, zn), P(x1, y1, zn), P(x1, y1, zf), P(x0, y1, zf)], top, { width });
  if (y0 > EYE) poly(ctx, [P(x0, y0, zn), P(x1, y0, zn), P(x1, y0, zf), P(x0, y0, zf)], bottom, { width });
  poly(ctx, [P(x0, y0, zn), P(x1, y0, zn), P(x1, y1, zn), P(x0, y1, zn)], front, { width });
}

// Ein senkrechtes Rechteck an einer Seitenwand (z. B. ein Bild, ein Schild): Wand X, Höhe y, Tiefe z
export function onSideWall(X, [y0, y1], [zn, zf]) {
  return [P(X, y0, zn), P(X, y1, zn), P(X, y1, zf), P(X, y0, zf)];
}

// Rechteck an der Rückwand (Raumkoordinaten) → Bildrechteck [x, y, Breite, Höhe]
export function onBackWall([X0, X1], [Y0, Y1]) {
  const [x0, y1] = P(X0, Y0, 1);
  const [x1, y0] = P(X1, Y1, 1);
  return [x0, y0, x1 - x0, y1 - y0];
}

// ============================================================================================
//  Kleinkram
// ============================================================================================

export function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

// Farbe heller (amount > 0) oder dunkler (amount < 0) machen. Nur für '#rrggbb'.
export function shade(color, amount) {
  if (!color.startsWith('#') || color.length !== 7) return color;
  const n = parseInt(color.slice(1), 16);
  const channel = (value) => Math.round(amount >= 0 ? value + (255 - value) * amount : value * (1 + amount));
  const r = channel((n >> 16) & 255), g = channel((n >> 8) & 255), b = channel(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export function rivets(ctx, points, radius = 3) {
  for (const [x, y] of points) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 18, 8, 0.7)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 240, 210, 0.5)';
    ctx.fill();
  }
}

// Text auf ein Schild malen (mittig)
export function sign(ctx, text, x, y, { font = 'bold 14px "Trebuchet MS", sans-serif', color = '#f3e2bf', angle = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Ein Rechteck aus Bildpunkten als Umriss für eine anklickbare Stelle
export function rect(x, y, width, height) {
  return [[Math.round(x), Math.round(y)], [Math.round(x + width), Math.round(y)], [Math.round(x + width), Math.round(y + height)], [Math.round(x), Math.round(y + height)]];
}

// Umriss (anklickbare Stelle) eines Quaders: die Hülle seiner Bildpunkte
export function boxArea({ x: [x0, x1], y: [y0, y1], z: [zn, zf] }) {
  const points = [];
  for (const X of [x0, x1]) for (const Y of [y0, y1]) for (const Z of [zn, zf]) points.push(P(X, Y, Z));
  return hull(points).map(([x, y]) => [Math.round(x), Math.round(y)]);
}

function hull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
