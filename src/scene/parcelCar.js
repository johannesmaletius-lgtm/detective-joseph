import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 20 (Tür 20): der Packwagen mit Mira. Nur DATEN – was passiert, steht in src/story/wagon20.js.
// Links der Geschenkeberg mit dem Sessel, vorne lose Anhänger, rechts Kisten über der Bodenluke,
// das Pult mit der Frachtliste und eine Rolle Sternen-Geschenkpapier.

const WINDOWS = [
  { from: 46, to: 140, top: 105, bottom: 295 },
  { from: 196, to: 282, top: 136, bottom: 219 },
  { from: 319, to: 372, top: 161, bottom: 268 },
  { from: 929, to: 976, top: 162, bottom: 272 },
  { from: 1009, to: 1088, top: 138, bottom: 288 },
  { from: 1142, to: 1239, top: 106, bottom: 304 },
];

export const parcelCar = {
  id: 'parcelCar',
  name: 'Packwagen',
  background: background('assets/scenes/wagon-20/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'mira', name: 'Mira', poses: 'assets/characters/mira',
      x: 530, y: 490, pose: 'front', size: 0.66,
      walkTo: [620, 520], facing: 'left', color: '#ffc8d8',
    },
  ],

  hotspots: [
    { id: 'tags', name: 'Lose Anhänger', area: box(210, 620, 410, 720), walkTo: [440, 660], facing: 'left' },
    { id: 'gifts', name: 'Geschenkeberg', area: [[0, 180], [340, 180], [490, 330], [490, 480], [250, 640], [0, 700]], walkTo: [450, 560], facing: 'left' },
    { id: 'crates', name: 'Kisten', area: box(744, 250, 1000, 482), walkTo: [760, 520], facing: 'right' },
    { id: 'lectern', name: 'Pult mit Frachtliste', area: box(980, 280, 1224, 420), walkTo: [920, 560], facing: 'right' },
    { id: 'paper', name: 'Sternen-Geschenkpapier', area: box(1146, 394, 1264, 690), walkTo: [960, 640], facing: 'right' },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: box(406, 72, 500, 156) },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(556, 116, 722, 400), walkTo: [640, 420], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 680, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [500, 404],
      [740, 404],
      [760, 490],
      [900, 500],
      [960, 600],
      [990, 712],
      [420, 712],
      [440, 620],
      [470, 540],
      [490, 470],
    ],
    holes: [
      [[490, 470], [570, 470], [570, 505], [490, 505]], // Mira
    ],
  },
};
