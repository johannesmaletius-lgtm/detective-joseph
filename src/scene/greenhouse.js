import { background, perspective, train } from './wagonKit.js';

// Wagen 17 (Tür 17): das Gewächshaus – das Versteck des anderen Joseph. Nur DATEN – was passiert,
// steht in src/story/wagon17.js. Das Glasdach ist im Hintergrundbild durchsichtig; dahinter malt
// das Drehbuch den Nachthimmel mit Schnee (animations: 'sky').

export const greenhouse = {
  id: 'greenhouse',
  name: 'Gewächshaus',
  background: background('assets/scenes/wagon-17/background.webp'),

  animations: [
    { id: 'sky', layer: 'behind', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'rose', name: 'Rosenknospe', area: [[1110, 320], [1200, 320], [1200, 470], [1110, 470]], walkTo: [1000, 640], facing: 'right' },
    { id: 'cans', name: 'Gießkannen', area: [[960, 126], [1170, 126], [1170, 250], [960, 250]], walkTo: [900, 520], facing: 'right' },
    { id: 'valve1', name: 'Ventil', area: [[456, 128], [504, 128], [504, 178], [456, 178]], walkTo: [560, 430], facing: 'left' },
    { id: 'valve2', name: 'Ventil', area: [[902, 130], [948, 130], [948, 180], [902, 180]], walkTo: [800, 450], facing: 'right' },
    { id: 'valve3', name: 'Ventil', area: [[62, 244], [110, 244], [110, 296], [62, 296]], walkTo: [380, 620], facing: 'left' },
    { id: 'radiator', name: 'Heizkörper', area: [[452, 220], [544, 220], [544, 342], [452, 342]], walkTo: [560, 430], facing: 'left' },
    { id: 'box', name: 'Kiste unter dem Tisch', area: [[278, 502], [386, 502], [386, 588], [278, 588]], walkTo: [420, 620], facing: 'left' },
    { id: 'sleepingBag', name: 'Schlafsack', area: [[90, 540], [312, 560], [312, 680], [90, 720]], walkTo: [380, 660], facing: 'left' },
    { id: 'table', name: 'Pflanztisch', area: [[0, 300], [470, 370], [470, 430], [0, 600]], walkTo: [420, 560], facing: 'left' },
    { id: 'beds', name: 'Beete', area: [[800, 340], [1080, 380], [1080, 640], [960, 640], [800, 470]], walkTo: [820, 560], facing: 'right' },
    { id: 'glass', name: 'Glasscheiben', cursor: 'look', area: [[0, 0], [1280, 0], [1280, 120], [0, 120]] },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[556, 116], [722, 116], [722, 404], [556, 404]], walkTo: [640, 420], facing: 'back' },
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [520, 410],
      [790, 410],
      [810, 470],
      [880, 560],
      [960, 640],
      [1020, 712],
      [380, 712],
      [380, 620],
      [420, 540],
      [480, 460],
    ],
    holes: [],
  },
};
