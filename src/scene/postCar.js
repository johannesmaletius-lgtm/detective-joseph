import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 3 (Tür 3): der Postwagen. Nur DATEN – was passiert, steht in src/story/wagon3.js.
// Links die 24 Fächer und die Postsäcke, rechts neben der Tür die Rohrpost-Station,
// rechts der Schreibtisch und der Schrank des Postmeisters.

export const postCar = {
  id: 'postCar',
  name: 'Postwagen',
  background: background('assets/scenes/wagon-03/background.webp'),
  outside: outside([
    { from: 32, to: 128, top: 106, bottom: 342 },
    { from: 931, to: 985, top: 168, bottom: 290 },
    { from: 1024, to: 1098, top: 144, bottom: 295 },
    { from: 1143, to: 1248, top: 109, bottom: 239 },
  ]),

  hotspots: [
    { id: 'holes', name: 'Fächer', area: [[168, 128], [490, 186], [490, 446], [168, 456]], walkTo: [470, 500], facing: 'left' },
    { id: 'bags', name: 'Postsäcke', area: [[0, 470], [180, 440], [450, 440], [450, 540], [380, 600], [230, 720], [0, 720]], walkTo: [450, 600], facing: 'left' },
    { id: 'cabinet', name: 'Schrank des Postmeisters', area: [[1134, 236], [1250, 236], [1250, 690], [1134, 690]], walkTo: [1000, 680], facing: 'right' },
    { id: 'tube', name: 'Rohrpost-Station', area: [[744, 214], [846, 214], [846, 328], [744, 328]], walkTo: [760, 450], facing: 'back' },
    { id: 'sorter', name: 'Briefständer', cursor: 'look', area: [[1044, 330], [1136, 330], [1136, 410], [1044, 410]] },
    { id: 'desk', name: 'Schreibtisch', area: [[800, 340], [1130, 380], [1130, 640], [940, 640], [800, 520]], walkTo: [800, 560], facing: 'right' },
    { id: 'keypad', name: 'Tastenfeld', cursor: 'look', area: [[504, 204], [542, 204], [542, 256], [504, 256]] },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[562, 140], [722, 140], [722, 440], [562, 440]], walkTo: [640, 462], facing: 'back' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[32, 106], [128, 106], [128, 342], [32, 342]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[931, 168], [985, 168], [985, 290], [931, 290]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1024, 144], [1098, 144], [1098, 295], [1024, 295]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1143, 109], [1248, 109], [1248, 239], [1143, 239]] },
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [480, 448],
      [770, 448],
      [776, 525],
      [884, 626],
      [1000, 690],
      [1010, 712],
      [342, 712],
      [422, 615],
      [482, 545],
      [490, 490],
    ],
    holes: [],
  },
};
