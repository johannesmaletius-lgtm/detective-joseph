import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 2 (Tür 2): der Gepäckwagen. Nur DATEN – was passiert, steht in src/story/wagon2.js.
// Links das Brett mit den zwölf Kofferanhängern, hinten rechts der Kofferstapel mit den zwei
// Kreidefeldern davor, rechts der grüne Koffer und die große Gepäckwaage.

export const baggageCar = {
  id: 'baggageCar',
  name: 'Gepäckwagen',
  background: background('assets/scenes/wagon-02/background.webp'),
  outside: outside([
    { from: 27, to: 125, top: 104, bottom: 319 },
    { from: 326, to: 384, top: 164, bottom: 285 },
    { from: 916, to: 974, top: 164, bottom: 285 },
    { from: 1015, to: 1092, top: 138, bottom: 302 },
    { from: 1142, to: 1252, top: 102, bottom: 269 },
  ]),
  hotspots: [
    { id: 'tags', name: 'Brett mit Kofferanhängern', area: [[160, 120], [314, 120], [314, 400], [160, 400]], walkTo: [400, 540], facing: 'left' },
    { id: 'stack', name: 'Kofferstapel', area: [[748, 204], [904, 204], [904, 418], [748, 418]], walkTo: [760, 480], facing: 'right' },
    { id: 'chalk', name: 'Kreidefelder', area: [[752, 424], [964, 424], [964, 474], [752, 474]], walkTo: [740, 500], facing: 'right' },
    { id: 'greenCase', name: 'Grüner Koffer', area: [[964, 300], [1102, 300], [1102, 502], [964, 502]], walkTo: [900, 520], facing: 'right' },
    { id: 'scale', name: 'Gepäckwaage', area: [[1104, 212], [1262, 212], [1262, 520], [1190, 520], [1190, 540], [1260, 680], [920, 680], [920, 540], [1104, 520]], walkTo: [880, 610], facing: 'right' },
    { id: 'panel', name: 'Schaltkasten', cursor: 'look', area: [[422, 186], [466, 186], [466, 240], [422, 240]] },
    { id: 'sign', name: 'Schild', cursor: 'look', area: [[512, 202], [546, 202], [546, 248], [512, 248]] },
    { id: 'shelves', name: 'Regale', area: [[0, 330], [160, 330], [160, 400], [330, 400], [480, 300], [480, 420], [330, 480], [300, 700], [0, 700]], walkTo: [400, 580], facing: 'left' },
    { id: 'boxes', name: 'Kisten oben', cursor: 'look', area: [[780, 30], [1280, 0], [1280, 90], [780, 150]] },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[556, 116], [736, 116], [736, 402], [556, 402]], walkTo: [646, 424], facing: 'back' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[22, 98], [128, 98], [128, 322], [22, 322]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[322, 158], [388, 158], [388, 288], [322, 288]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[912, 158], [978, 158], [978, 290], [912, 290]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1010, 136], [1095, 136], [1095, 302], [1010, 302]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1138, 100], [1252, 100], [1252, 268], [1138, 268]] },
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [492, 408],
      [744, 412],
      [744, 480],
      [920, 486],
      [950, 520],
      [900, 560],
      [880, 640],
      [870, 700],
      [300, 700],
      [330, 600],
      [380, 520],
      [450, 450],
    ],
    holes: [],
  },
};
