import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 18 (Tür 18): das Schaffnerabteil (der Schaffner nur als Stimme). Nur DATEN – was passiert,
// steht in src/story/wagon18.js. Links Schreibtisch mit Dienstbuch und Schubladenschloss,
// das Schlüsselbrett, rechts Uniform, Gleisplan, Weichenhebel und der verplombte rote Hebel für Weiche 7.

const WINDOWS = [
  { from: 46, to: 142, top: 101, bottom: 294 },
  { from: 418, to: 496, top: 158, bottom: 275 },
  { from: 896, to: 918, top: 160, bottom: 277 },
  { from: 1172, to: 1243, top: 100, bottom: 284 },
];

export const conductorCar = {
  id: 'conductorCar',
  name: 'Schaffnerabteil',
  background: background('assets/scenes/wagon-18/background.webp'),
  outside: outside(WINDOWS),

  hotspots: [
    { id: 'book', name: 'Dienstbuch', area: box(146, 356, 312, 434), walkTo: [420, 600], facing: 'left' },
    { id: 'drawer', name: 'Schublade mit Buchstabenschloss', area: box(150, 470, 302, 540), walkTo: [420, 620], facing: 'left' },
    { id: 'keyboard', name: 'Schlüsselbrett', area: box(198, 102, 384, 312), walkTo: [440, 520], facing: 'left' },
    { id: 'punch', name: 'Lochzange', area: box(338, 312, 424, 392), walkTo: [440, 520], facing: 'left' },
    { id: 'lamp', name: 'Schreibtischlampe', cursor: 'look', area: box(80, 250, 200, 420) },
    { id: 'coat', name: 'Uniform des Schaffners', area: box(752, 132, 872, 412), walkTo: [760, 450], facing: 'right' },
    { id: 'plan', name: 'Gleisplan', area: box(924, 70, 1140, 330), walkTo: [900, 500], facing: 'right' },
    { id: 'levers', name: 'Weichenhebel', area: box(918, 324, 1112, 414), walkTo: [900, 520], facing: 'right' },
    { id: 'redLever', name: 'Roter Hebel', area: box(1020, 300, 1232, 646), walkTo: [960, 640], facing: 'right' },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'talk', area: box(356, 8, 484, 112) },
    { id: 'bin', name: 'Papierkorb', area: box(56, 582, 142, 700), walkTo: [330, 680], facing: 'left' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(556, 116, 722, 400), walkTo: [640, 420], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [540, 404],
      [760, 404],
      [880, 440],
      [930, 520],
      [975, 640],
      [1010, 712],
      [370, 712],
      [480, 622],
      [470, 522],
      [490, 450],
    ],
    holes: [],
  },
};
