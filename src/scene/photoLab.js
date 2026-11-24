import { background, box, outside, perspective, train, windowSpots, lampDust } from './wagonKit.js';

// Wagen 19 (Tür 19): das Fotolabor. Nur DATEN – was passiert, steht in src/story/wagon19.js.
// Links der Vergrößerer, an der Wand die Kameratasche und die Lichtschalter, neben der Tür ein
// Vorhang, rechts Flaschen, Laborzeituhr, Rotlicht und die drei Schalen.

const WINDOWS = [
  { from: 46, to: 142, top: 106, bottom: 302 },
  { from: 196, to: 274, top: 137, bottom: 300 },
  { from: 313, to: 368, top: 161, bottom: 301 },
  { from: 1140, to: 1239, top: 107, bottom: 308 },
  { from: 1140, to: 1239, top: 330, bottom: 438 },
];

export const photoLab = {
  id: 'photoLab',
  name: 'Fotolabor',
  background: background('assets/scenes/wagon-19/background.webp'),
  outside: outside(WINDOWS),

  animations: [
    { id: 'tint', layer: 'over', x: 0, y: 0, width: 1280, height: 720 },
  ],

  // kleine Effekte (src/effects/ambience.js)
  ambience: [
    { ...lampDust(), when: 'roomLight' }, // Staub nur im Licht der Deckenlampe
  ],

  hotspots: [
    { id: 'bag', name: 'Kameratasche', area: box(404, 174, 502, 366), walkTo: [500, 500], facing: 'left' },
    { id: 'switch', name: 'Lichtschalter', area: box(494, 204, 548, 248), walkTo: [540, 470], facing: 'back' },
    { id: 'curtain', name: 'Vorhang', area: box(722, 96, 806, 472), walkTo: [740, 480], facing: 'right' },
    { id: 'redLight', name: 'Rotlicht', area: box(1018, 140, 1092, 248), walkTo: [860, 560], facing: 'right' },
    { id: 'timer', name: 'Laborzeituhr', area: box(928, 168, 1012, 248), walkTo: [860, 560], facing: 'right' },
    { id: 'bottles', name: 'Flaschen', area: box(826, 184, 922, 250), walkTo: [860, 560], facing: 'right' },
    { id: 'prints', name: 'Abzüge an der Leine', area: box(868, 276, 1084, 374), walkTo: [860, 560], facing: 'right' },
    { id: 'trays', name: 'Entwicklerschalen', area: box(858, 376, 1236, 516), walkTo: [860, 600], facing: 'right' },
    { id: 'enlarger', name: 'Vergrößerer', area: box(196, 168, 418, 444), walkTo: [470, 560], facing: 'left' },
    { id: 'sofa', name: 'Sofa', area: box(0, 320, 300, 700), walkTo: [420, 640], facing: 'left' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(560, 120, 722, 460), walkTo: [640, 480], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [480, 462],
      [790, 462],
      [802, 520],
      [858, 600],
      [862, 712],
      [380, 712],
      [500, 650],
      [495, 540],
    ],
    holes: [],
  },
};
