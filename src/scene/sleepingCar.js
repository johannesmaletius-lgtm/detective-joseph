import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 5: der Schlafwagen. Nur DATEN – was passiert, steht in src/story/wagon5.js.
// Links die Abteile 1–4 (in Abteil 3 schläft Oma Ilse bei offener Tür), rechts die Fenster.

export const sleepingCar = {
  id: 'sleepingCar',
  name: 'Schlafwagen',
  background: background('assets/scenes/wagon-05/background.webp'),
  outside: outside([
    { from: 822, to: 865, top: 193, bottom: 315 },
    { from: 896, to: 952, top: 172, bottom: 328 },
    { from: 992, to: 1072, top: 146, bottom: 342 },
    { from: 1129, to: 1248, top: 108, bottom: 363 },
  ]),

  hotspots: [
    { id: 'drawer', name: 'Schublade unter Ilses Bett', area: [[330, 452], [426, 452], [426, 536], [330, 536]], walkTo: [452, 560], facing: 'left' },
    { id: 'ilse', name: 'Oma Ilse', cursor: 'talk', area: [[316, 280], [432, 280], [432, 450], [316, 450]], walkTo: [452, 560], facing: 'left' },
    { id: 'door1', name: 'Abteil 1', area: [[28, 100], [168, 100], [168, 650], [28, 650]], walkTo: [214, 662], facing: 'left' },
    { id: 'door2', name: 'Abteil 2', area: [[194, 120], [304, 120], [304, 600], [194, 600]], walkTo: [330, 612], facing: 'left' },
    { id: 'door3', name: 'Abteil 3', area: [[432, 190], [488, 190], [488, 506], [432, 506]], walkTo: [500, 524], facing: 'left' },
    { id: 'door4', name: 'Abteil 4', area: [[490, 194], [550, 194], [550, 472], [490, 472]], walkTo: [566, 484], facing: 'left' },
    { id: 'book', name: 'Fahrgastbuch', area: [[956, 362], [1012, 362], [1012, 396], [956, 396]], walkTo: [944, 506], facing: 'right' },
    { id: 'cup', name: 'Tasse', area: [[1006, 348], [1054, 348], [1054, 398], [1006, 398]], walkTo: [944, 506], facing: 'right' },
    { id: 'lamp', name: 'Tischlampe', cursor: 'look', area: [[1024, 270], [1098, 270], [1098, 346], [1024, 346]] },
    { id: 'shadow', name: 'Schatten unter dem Tischchen', area: [[960, 424], [1112, 424], [1112, 548], [960, 548]], walkTo: [1004, 566], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[560, 118], [722, 118], [722, 404], [560, 404]], walkTo: [640, 424], facing: 'back' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[822, 193], [865, 193], [865, 315], [822, 315]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[896, 172], [952, 172], [952, 328], [896, 328]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[992, 146], [1072, 146], [1072, 342], [992, 342]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1129, 108], [1248, 108], [1248, 363], [1129, 363]] },
  ],

  train: train({ squealEvery: [12, 24] }),
  playerStart: { x: 700, y: 640, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [554, 414],
      [800, 414],
      [1010, 522],
      [1200, 642],
      [1222, 700],
      [134, 700],
      [172, 656],
      [302, 606],
      [432, 550],
      [490, 512],
      [550, 476],
    ],
    holes: [],
  },
};
