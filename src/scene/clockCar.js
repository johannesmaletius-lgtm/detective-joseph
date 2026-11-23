import { background, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 11 (Tür 11): der Uhrenwagen mit Herrn Tick. Nur DATEN – was passiert, steht in src/story/wagon11.js.
// Links die Standuhr und die Werkbank, rechts oben die Kuckucksuhr, überall Wanduhren.

const WINDOWS = [
  { from: 96, to: 177, top: 132, bottom: 301 },
  { from: 341, to: 381, top: 168, bottom: 275 },
  { from: 899, to: 941, top: 162, bottom: 274 },
  { from: 969, to: 1028, top: 168, bottom: 291 },
  { from: 1142, to: 1213, top: 128, bottom: 309 },
];

export const clockCar = {
  id: 'clockCar',
  name: 'Uhrenwagen',
  background: background('assets/scenes/wagon-11/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'tick', name: 'Herr Tick', poses: 'assets/characters/tick',
      x: 520, y: 520, pose: 'front', size: 0.86,
      walkTo: [620, 540], facing: 'left', color: '#f3d9a0',
    },
  ],

  hotspots: [
    { id: 'grandfather', name: 'Standuhr', area: [[190, 0], [346, 0], [346, 470], [190, 470]], walkTo: [400, 560], facing: 'left' },
    { id: 'cuckoo', name: 'Kuckucksuhr', area: [[988, 0], [1146, 0], [1146, 300], [988, 300]], walkTo: [860, 520], facing: 'right' },
    { id: 'wallClocks', name: 'Wanduhren', area: [[400, 40], [556, 40], [556, 330], [400, 330]], walkTo: [520, 450], facing: 'back' },
    { id: 'wallClocks', name: 'Wanduhren', area: [[726, 40], [960, 40], [960, 340], [726, 340]], walkTo: [760, 450], facing: 'back' },
    { id: 'bench', name: 'Werkbank', area: [[0, 430], [350, 470], [350, 720], [0, 720]], walkTo: [380, 640], facing: 'left' },
    { id: 'glassDome', name: 'Glasglocke mit Zahnrädern', area: [[404, 318], [460, 318], [460, 390], [404, 390]], walkTo: [520, 450], facing: 'left' },
    { id: 'sofa', name: 'Sitzbank', area: [[836, 300], [1280, 300], [1280, 700], [1040, 700], [836, 440]], walkTo: [860, 600], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[560, 116], [724, 116], [724, 400], [560, 400]], walkTo: [640, 420], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 680, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [560, 404],
      [830, 404],
      [840, 450],
      [870, 520],
      [980, 640],
      [1030, 712],
      [360, 712],
      [360, 600],
      [400, 540],
      [460, 500],
      [550, 470],
    ],
    holes: [
      [[480, 500], [570, 500], [570, 540], [480, 540]], // Herr Tick steht hier
    ],
  },
};
