import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 14: der Zeitungswagen. Nur DATEN – was passiert, steht in src/story/wagon14.js.

const WINDOWS = [
  { from: 45, to: 138, top: 104, bottom: 281 },
  { from: 194, to: 271, top: 137, bottom: 273 },
  { from: 933, to: 976, top: 162, bottom: 264 },
  { from: 1011, to: 1087, top: 138, bottom: 262 },
  { from: 1142, to: 1239, top: 104, bottom: 292 },
];

export const newspaperCar = {
  id: 'newspaperCar',
  name: 'Zeitungswagen',
  background: background('assets/scenes/wagon-14/background.webp'),
  outside: outside(WINDOWS),

  animations: [
    { id: 'table', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'crossword', name: 'Kreuzworträtsel', area: box(872, 362, 1064, 422), walkTo: [800, 560], facing: 'right' },
    { id: 'magnifier', name: 'Lupe', when: '!magnifierTaken', area: box(1018, 396, 1116, 444), walkTo: [820, 580], facing: 'right' },
    { id: 'pencil', name: 'Bleistift', cursor: 'look', area: box(946, 414, 1014, 440) },
    { id: 'lamp', name: 'Leselampe', cursor: 'look', area: box(974, 254, 1104, 398) },
    { id: 'basket', name: 'Papierkorb', area: box(934, 512, 1024, 634), walkTo: [820, 620], facing: 'right' },
    { id: 'lock', name: 'Zahlenschloss am Archivschrank', area: box(424, 252, 514, 300), walkTo: [520, 470], facing: 'left' },
    { id: 'cabinet', name: 'Archivschrank', area: box(326, 146, 536, 446), walkTo: [520, 470], facing: 'left' },
    { id: 'rack', name: 'Zeitungsständer', area: box(60, 280, 396, 492), walkTo: [430, 600], facing: 'left' },
    { id: 'bundles', name: 'Zeitungsbündel', area: box(110, 430, 384, 624), walkTo: [430, 640], facing: 'left' },
    { id: 'globe', name: 'Globus', cursor: 'look', area: box(398, 52, 454, 146) },
    { id: 'chair', name: 'Sessel', area: box(748, 264, 980, 520), walkTo: [740, 540], facing: 'right' },
    { id: 'chair', name: 'Sessel', area: box(1020, 320, 1280, 720), walkTo: [900, 660], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 120, 720, 410), walkTo: [640, 440], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [540, 420],
      [740, 420],
      [760, 520],
      [900, 600],
      [960, 700],
      [400, 700],
      [400, 640],
      [450, 520],
      [540, 470],
    ],
    holes: [],
  },
};
