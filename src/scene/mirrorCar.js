import { background, box, outside, perspective, train } from './wagonKit.js';

// Wagen 9: der Spiegelwagen. Nur DATEN – was passiert, steht in src/story/wagon9.js.
// Keine Fenster: Alle Spiegel (sechs an den Wänden, vier auf Ständern) sind im Hintergrundbild
// durchsichtig (Cyan) – dahinter zeichnet das Spiel, was sie spiegeln (animations: 'mirrors').
// Die beiden Hebel zeichnet das Spiel selbst darüber, wenn sie unten sind ('levers').

export const WALL_MIRRORS = [
  { from: 63, to: 144, top: 114, bottom: 334 },
  { from: 222, to: 276, top: 148, bottom: 326 },
  { from: 323, to: 361, top: 171, bottom: 313 },
  { from: 932, to: 969, top: 170, bottom: 312 },
  { from: 1013, to: 1064, top: 148, bottom: 326 },
  { from: 1125, to: 1197, top: 122, bottom: 335 },
];

export const STAND_MIRRORS = [
  { id: 'A', from: 389, to: 438, top: 268, bottom: 328 },
  { id: 'B', from: 483, to: 528, top: 287, bottom: 338 },
  { id: 'C', from: 766, to: 811, top: 287, bottom: 338 },
  { id: 'D', from: 852, to: 902, top: 268, bottom: 328 },
];

export const mirrorCar = {
  id: 'mirrorCar',
  name: 'Spiegelwagen',
  background: background('assets/scenes/wagon-09/background.webp'),
  // Keine Fenster – die Außenwelt braucht es nur, damit der Zug wie überall fährt (Tunnel, Licht)
  outside: outside([]),

  animations: [
    { id: 'mirrors', layer: 'behind', x: 0, y: 0, width: 1280, height: 720 },
    { id: 'levers', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'leverLeft', name: 'Hebel', area: box(386, 156, 462, 258), walkTo: [470, 450], facing: 'left' },
    { id: 'leverRight', name: 'Hebel', area: box(826, 156, 904, 258), walkTo: [812, 450], facing: 'right' },
    { id: 'eye', name: 'Glasauge', area: box(650, 240, 710, 292), walkTo: [640, 452], facing: 'back' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 120, 720, 404), walkTo: [640, 452], facing: 'back' },
    { id: 'lamp', name: 'Lampe über der Tür', cursor: 'look', area: box(606, 44, 672, 86) },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: box(410, 76, 500, 154) },
    { id: 'panel', name: 'Kasten', cursor: 'look', area: box(758, 86, 856, 134) },
    { id: 'scratches', name: 'Kratzer in der Wand', area: box(1196, 312, 1268, 432), walkTo: [960, 600], facing: 'right' },
    ...STAND_MIRRORS.map((m) => ({ id: `stand${m.id}`, name: 'Standspiegel', area: box(m.from - 6, m.top - 8, m.to + 6, m.bottom + 100), walkTo: [m.from < 640 ? 540 : 740, 470], facing: m.from < 640 ? 'left' : 'right' })),
    { id: 'mirrorL', name: 'Großer Spiegel', area: box(40, 70, 166, 372), walkTo: [400, 640], facing: 'left' },
    { id: 'mirrorL', name: 'Spiegel', area: box(200, 112, 296, 356), walkTo: [400, 560], facing: 'left' },
    { id: 'mirrorL', name: 'Spiegel', area: box(306, 140, 374, 336), walkTo: [440, 500], facing: 'left' },
    { id: 'mirrorR', name: 'Spiegel', area: box(918, 140, 984, 336), walkTo: [840, 500], facing: 'right' },
    { id: 'mirrorR', name: 'Spiegel', area: box(996, 112, 1084, 356), walkTo: [880, 560], facing: 'right' },
    { id: 'mirrorR', name: 'Großer Spiegel', area: box(1106, 80, 1222, 372), walkTo: [900, 640], facing: 'right' },
    { id: 'candles', name: 'Kerzen', cursor: 'look', area: box(4, 150, 50, 270) },
    { id: 'candles', name: 'Kerzen', cursor: 'look', area: box(1220, 150, 1272, 270) },
    { id: 'carpet', name: 'Teppich', cursor: 'look', area: [[560, 412], [720, 412], [860, 720], [420, 720]] },
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [446, 446],
      [834, 446],
      [920, 520],
      [1080, 640],
      [1120, 700],
      [160, 700],
      [220, 620],
      [360, 520],
    ],
    holes: [],
  },
};
