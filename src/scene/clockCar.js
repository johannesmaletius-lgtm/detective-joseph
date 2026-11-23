import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 11: der Uhrenwagen mit Herrn Tick. Nur DATEN – was passiert, steht in src/story/wagon11.js.

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
      x: 742, y: 468, pose: 'left', size: 0.86,
      walkTo: [640, 500], facing: 'right', color: '#f3d9a4', when: '!tickGone',
    },
  ],

  animations: [
    { id: 'pendulum', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'grandfather', name: 'Standuhr', area: box(196, 10, 352, 440), walkTo: [420, 560], facing: 'left' },
    { id: 'cuckoo', name: 'Kuckucksuhr', area: box(986, 0, 1152, 300), walkTo: [860, 470], facing: 'right' },
    { id: 'clocks', name: 'Wanduhren', area: box(400, 60, 560, 268), walkTo: [600, 450], facing: 'back' },
    { id: 'clocks', name: 'Wanduhren', area: box(726, 60, 900, 340), walkTo: [700, 450], facing: 'back' },
    { id: 'clocks', name: 'Wanduhren', area: box(0, 0, 90, 320), walkTo: [420, 600], facing: 'left' },
    { id: 'clocks', name: 'Wanduhren', area: box(1160, 0, 1280, 300), walkTo: [860, 470], facing: 'right' },
    { id: 'dome', name: 'Glasglocke mit Zahnrädern', area: box(408, 318, 462, 396), walkTo: [600, 470], facing: 'left' },
    { id: 'bench', name: 'Werkbank', area: box(0, 430, 356, 640), walkTo: [440, 620], facing: 'left' },
    { id: 'drawer', name: 'Schublade mit Zahnrädern', area: box(160, 636, 346, 720), walkTo: [440, 660], facing: 'left' },
    { id: 'sofa', name: 'Sofa', area: [[836, 310], [1270, 310], [1270, 680], [1080, 680], [880, 500]], walkTo: [840, 560], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 118, 720, 400), walkTo: [640, 440], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [562, 410],
      [830, 410],
      [850, 460],
      [880, 520],
      [1000, 640],
      [1010, 700],
      [360, 700],
      [372, 600],
      [452, 540],
      [560, 520],
    ],
    holes: [],
  },
};
