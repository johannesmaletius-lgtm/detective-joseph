import { trainCompartment } from './trainCompartment.js';

// Bausteine, die in allen Wagen gleich sind: Außenwelt, Zugfahrt, Lampen, Perspektive.
// Die Hintergründe der Wagen 2–24 sind alle nach derselben Vorlage gemalt (1536 × 1024, Fluchtpunkt
// hinten an der Tür, drei Lampen an der Decke) – deshalb passen dieselben Einstellungen überall.
//
// Die Fensterrechtecke gibt tools/prepare-wagons.py aus, wenn es die Bilder vorbereitet.

// Hintergrundbild 1536 × 1024 → 1280 × 853, etwas nach oben geschoben (wie im ersten Abteil)
export function background(src) {
  return { src, x: 0, y: -40, width: 1280, height: 853 };
}

// Die Landschaft hinter den Fenstern – dieselben Ebenen wie im ersten Abteil, nur andere Fenster.
// Der Turm blinkt in den anderen Wagen keine Ziffer mehr, nur noch gleichmäßig.
export function outside(windows, { vanishingPoint = { x: 640, y: 210 }, referenceDistance = 400 } = {}) {
  const layers = trainCompartment.outside.layers.map((layer) => (layer.id === 'tower'
    ? { ...layer, blink: { x: layer.blink.x, y: layer.blink.y, color: layer.blink.color, every: 1.6 } }
    : { ...layer }));
  return {
    vanishingPoint,
    referenceDistance,
    windows,
    layers,
    windowLight: { ...trainCompartment.outside.windowLight },
  };
}

// Die Zugfahrt im Kreis (siehe src/effects/trainMotion.js) – wie im ersten Abteil
export function train(overrides = {}) {
  return { ...trainCompartment.train, ...overrides };
}

// So groß ist Joseph hinten und vorne im Wagen
export function perspective(overrides = {}) {
  return { ...trainCompartment.perspective, ...overrides };
}
