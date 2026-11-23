import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 15: das Spielzimmer mit Mira. Nur DATEN – was passiert, steht in src/story/wagon15.js.

const WINDOWS = [
  { from: 40, to: 138, top: 103, bottom: 308 },
  { from: 182, to: 258, top: 134, bottom: 294 },
  { from: 288, to: 335, top: 158, bottom: 285 },
  { from: 936, to: 983, top: 161, bottom: 288 },
  { from: 1018, to: 1092, top: 137, bottom: 286 },
  { from: 1141, to: 1240, top: 104, bottom: 300 },
];

export const playroom = {
  id: 'playroom',
  name: 'Spielzimmer',
  background: background('assets/scenes/wagon-15/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'mira', name: 'Mira', poses: 'assets/characters/mira',
      x: 772, y: 560, pose: 'left', size: 0.62,
      walkTo: [650, 590], facing: 'right', color: '#ffd1dc',
    },
  ],

  animations: [
    { id: 'toys', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'toyTunnel', name: 'Spielzeugtunnel', area: box(92, 318, 268, 420), walkTo: [500, 560], facing: 'left' },
    { id: 'railway', name: 'Modellbahn', area: [[0, 380], [470, 380], [470, 470], [380, 560], [0, 560]], walkTo: [500, 580], facing: 'left' },
    { id: 'dolls', name: 'Puppen', cursor: 'look', area: box(366, 132, 462, 214) },
    { id: 'teddy', name: 'Teddybär', cursor: 'look', area: box(462, 132, 528, 214) },
    { id: 'plush', name: 'Stofftiere', cursor: 'look', area: box(366, 220, 528, 294) },
    { id: 'books', name: 'Bücher', cursor: 'look', area: box(366, 300, 450, 360) },
    { id: 'drum', name: 'Trommel', area: box(452, 302, 524, 362), walkTo: [560, 470], facing: 'left' },
    { id: 'desk', name: 'Kindertisch', area: box(752, 258, 912, 432), walkTo: [760, 470], facing: 'right' },
    { id: 'wallLamp', name: 'Wandlampe', cursor: 'look', area: box(796, 128, 862, 206) },
    { id: 'horse', name: 'Schaukelpferd', area: box(818, 372, 1082, 616), walkTo: [780, 600], facing: 'right' },
    { id: 'dollhouse', name: 'Puppenhaus-Bahnhof', area: box(944, 196, 1276, 512), walkTo: [900, 520], facing: 'right' },
    { id: 'top', name: 'Kreisel', cursor: 'look', area: box(1018, 612, 1100, 706) },
    { id: 'blocks', name: 'Bauklötze', cursor: 'look', area: box(1130, 650, 1280, 720) },
    { id: 'boxes', name: 'Spielzeugkisten', cursor: 'look', area: box(56, 606, 300, 720) },
    { id: 'shelfTop', name: 'Kisten', cursor: 'look', area: box(150, 0, 330, 76) },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 116, 720, 410), walkTo: [640, 440], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [548, 420],
      [740, 420],
      [770, 470],
      [800, 560],
      [840, 640],
      [1000, 680],
      [1000, 712],
      [340, 712],
      [380, 600],
      [480, 540],
    ],
    holes: [],
  },
};
