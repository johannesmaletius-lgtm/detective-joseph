import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 4: der Speisewagen. Nur DATEN – was passiert, steht in src/story/wagon4.js.
// Koordinaten im 1280 × 720-Bild (Taste D: Debug-Ansicht, Taste G: Raster).
//
// Die sechs Tische heißen nach ihrer Lage: L = links, R = rechts; H = hinten, M = Mitte, V = vorne.
// Bruno zählt sie „von hinten nach vorne, erst links, dann rechts“: LH = Tisch 1 … RV = Tisch 6.

export const diningCar = {
  id: 'diningCar',
  name: 'Speisewagen',
  background: background('assets/scenes/wagon-04/background.webp'),
  outside: outside([
    { from: 44, to: 142, top: 106, bottom: 300 },
    { from: 192, to: 271, top: 137, bottom: 286 },
    { from: 932, to: 976, top: 161, bottom: 273 },
    { from: 1011, to: 1087, top: 137, bottom: 288 },
    { from: 1138, to: 1240, top: 106, bottom: 304 },
  ]),

  characters: [
    {
      id: 'bruno', name: 'Koch Bruno', poses: 'assets/characters/bruno',
      x: 548, y: 434, pose: 'front', size: 1.02,
      walkTo: [636, 452], facing: 'left', color: '#ffd29a', idle: ['blink', 'busy'],
    },
  ],

  hotspots: [
    // kleine Dinge zuerst
    { id: 'tray', name: 'Gläser auf der Durchreiche', area: [[436, 256], [528, 256], [528, 298], [436, 298]], walkTo: [470, 432], facing: 'back' },
    { id: 'menu', name: 'Speisekarte', area: [[752, 300], [790, 300], [790, 352], [752, 352]], walkTo: [790, 432], facing: 'back' },
    { id: 'register', name: 'Registrierkasse', area: [[772, 178], [894, 178], [894, 294], [772, 294]], walkTo: [826, 432], facing: 'back' },
    { id: 'scarf', name: 'Grüner Schal', area: [[146, 344], [206, 344], [206, 428], [146, 428]], walkTo: [392, 520], facing: 'left' },
    { id: 'goggles', name: 'Fliegerbrille', area: [[1056, 334], [1134, 334], [1134, 368], [1056, 368]], walkTo: [888, 520], facing: 'right' },
    { id: 'coatBrown', name: 'Brauner Mantel', area: [[0, 500], [96, 500], [96, 720], [0, 720]], walkTo: [338, 650], facing: 'left' },
    { id: 'coatGrey', name: 'Grauer Mantel', area: [[1178, 508], [1280, 508], [1280, 720], [1178, 720]], walkTo: [944, 660], facing: 'right' },
    { id: 'towel', name: 'Geschirrtuch', area: [[874, 290], [932, 290], [932, 336], [874, 336]], walkTo: [872, 444], facing: 'right' },
    // die sechs Tische
    { id: 'tableLH', name: 'Tisch hinten links', area: [[272, 322], [424, 322], [424, 382], [272, 382]], walkTo: [430, 432], facing: 'left' },
    { id: 'tableLM', name: 'Tisch Mitte links', area: [[232, 396], [376, 396], [376, 448], [232, 448]], walkTo: [392, 520], facing: 'left' },
    { id: 'tableLV', name: 'Tisch vorne links', area: [[56, 492], [316, 492], [316, 566], [56, 566]], walkTo: [338, 640], facing: 'left' },
    { id: 'tableRH', name: 'Tisch hinten rechts', area: [[864, 326], [1002, 326], [1002, 376], [864, 376]], walkTo: [872, 444], facing: 'right' },
    { id: 'tableRM', name: 'Tisch Mitte rechts', area: [[904, 400], [1108, 400], [1108, 456], [904, 456]], walkTo: [888, 520], facing: 'right' },
    { id: 'tableRV', name: 'Tisch vorne rechts', area: [[964, 496], [1244, 496], [1244, 566], [964, 566]], walkTo: [944, 650], facing: 'right' },
    // Raum
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[558, 116], [722, 116], [722, 404], [558, 404]], walkTo: [640, 426], facing: 'back' },
    { id: 'kitchen', name: 'Küche', area: [[330, 136], [546, 136], [546, 256], [330, 256]], walkTo: [470, 432], facing: 'back' },
    { id: 'cabinet', name: 'Schrank', area: [[744, 294], [902, 294], [902, 412], [744, 412]], walkTo: [826, 432], facing: 'back' },
    { id: 'jar', name: 'Grünes Glas', cursor: 'look', area: [[888, 36], [952, 36], [952, 112], [888, 112]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[44, 106], [142, 106], [142, 300], [44, 300]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[192, 137], [271, 137], [271, 286], [192, 286]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[932, 161], [976, 161], [976, 273], [932, 273]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1011, 137], [1087, 137], [1087, 288], [1011, 288]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1138, 106], [1240, 106], [1240, 304], [1138, 304]] },
  ],

  // Kerzen auf den sechs Tischen, Dampf aus dem Topf in der Küche, Staub unter der Lampe (src/effects/ambience.js)
  ambience: [
    { kind: 'flame', x: 314, y: 301, size: 17 },
    { kind: 'flame', x: 252, y: 355, size: 20 },
    { kind: 'flame', x: 103, y: 436, size: 30 },
    { kind: 'flame', x: 954, y: 302, size: 17 },
    { kind: 'flame', x: 1024, y: 355, size: 20 },
    { kind: 'flame', x: 1174, y: 436, size: 30 },
    { kind: 'glow', x: 418, y: 186, radius: 46, color: '255, 190, 110', strength: 0.22, flicker: 'candle' },
    { kind: 'steam', x: 402, y: 236, size: 12, drift: [4, -18], every: 0.6 },
    { kind: 'dust', x: 585, y: 72, width: 110, height: 150, count: 14 },
  ],

  train: train({ squealEvery: [12, 26] }),
  playerStart: { x: 740, y: 640, facing: 'back' }, // rechts neben Bruno, nicht vor ihm
  perspective: perspective(),

  walkArea: {
    outline: [
      [432, 414],
      [856, 414],
      [866, 452],
      [872, 560],
      [914, 612],
      [914, 700],
      [372, 700],
      [366, 604],
      [400, 530],
      [410, 472],
      [418, 436],
    ],
    holes: [
      [[514, 420], [584, 420], [584, 448], [514, 448]], // Bruno steht hier
    ],
  },
};
