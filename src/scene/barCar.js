import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 7: der Barwagen. Nur DATEN – was passiert, steht in src/story/wagon7.js.
// Herr K. steht am hinteren Tisch, der Barkeeper hinter dem Tresen (unterhalb der Tresenkante
// unsichtbar: clipBottom).

export const barCar = {
  id: 'barCar',
  name: 'Barwagen',
  background: background('assets/scenes/wagon-07/background.webp'),
  outside: outside([
    { from: 45, to: 141, top: 106, bottom: 329 },
    { from: 321, to: 374, top: 161, bottom: 291 },
    { from: 823, to: 860, top: 179, bottom: 274 },
    { from: 882, to: 937, top: 161, bottom: 283 },
    { from: 1185, to: 1252, top: 109, bottom: 311 },
  ]),

  characters: [
    {
      id: 'k', name: 'Herr K.', poses: 'assets/characters/herr-k',
      x: 470, y: 470, pose: 'right', size: 0.96,
      walkTo: [560, 500], facing: 'left', color: '#d8e0a6', when: '!kGone',
    },
    {
      id: 'barkeeper', name: 'Barkeeper', poses: 'assets/characters/barkeeper',
      x: 1050, y: 476, pose: 'front', size: 1.02, clipBottom: 324,
      walkTo: [780, 560], facing: 'right', color: '#f0c9a0',
    },
  ],

  hotspots: [
    { id: 'coaster', name: 'Bierdeckel', area: [[1120, 378], [1196, 378], [1196, 408], [1120, 408]], walkTo: [790, 560], facing: 'right' },
    { id: 'glasses', name: 'Drei leere Gläser', area: [[1082, 324], [1208, 324], [1208, 378], [1082, 378]], walkTo: [790, 560], facing: 'right' },
    { id: 'newspaper', name: 'Zeitung', when: '!newspaperTaken', area: [[904, 320], [1038, 320], [1038, 374], [904, 374]], walkTo: [790, 560], facing: 'right' },
    { id: 'bottles', name: 'Flaschen', area: [[952, 118], [1148, 118], [1148, 300], [952, 300]], walkTo: [790, 560], facing: 'right' },
    { id: 'barBottles', name: 'Flaschen auf dem Tresen', area: [[790, 252], [890, 252], [890, 318], [790, 318]], walkTo: [750, 480], facing: 'right' },
    { id: 'ashtray', name: 'Aschenbecher', area: [[160, 412], [216, 412], [216, 444], [160, 444]], walkTo: [320, 620], facing: 'left' },
    { id: 'jukebox', name: 'Musikbox', area: [[170, 148], [314, 148], [314, 440], [170, 440]], walkTo: [330, 560], facing: 'left' },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: [[404, 72], [516, 72], [516, 166], [404, 166]] },
    { id: 'backTable', name: 'Tisch hinten', area: [[378, 312], [500, 312], [500, 344], [378, 344]], walkTo: [540, 470], facing: 'left' },
    { id: 'frontTable', name: 'Tisch vorne', area: [[54, 408], [272, 408], [272, 450], [54, 450]], walkTo: [320, 620], facing: 'left' },
    { id: 'stools', name: 'Barhocker', area: [[734, 342], [1040, 342], [1040, 720], [900, 720], [734, 476]], walkTo: [780, 560], facing: 'right' },
    { id: 'bar', name: 'Tresen', area: [[750, 290], [1280, 330], [1280, 460], [1040, 460], [750, 330]], walkTo: [790, 560], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[558, 116], [722, 116], [722, 400], [558, 400]], walkTo: [640, 420], facing: 'back' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[45, 106], [141, 106], [141, 329], [45, 329]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[321, 161], [374, 161], [374, 291], [321, 291]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[823, 179], [860, 179], [860, 274], [823, 274]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[882, 161], [937, 161], [937, 283], [882, 283]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1185, 109], [1252, 109], [1252, 311], [1185, 311]] },
  ],

  train: train(),
  playerStart: { x: 600, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [540, 406],
      [730, 406],
      [738, 480],
      [784, 548],
      [836, 628],
      [878, 700],
      [300, 700],
      [300, 622],
      [312, 528],
      [420, 486],
      [528, 456],
    ],
    holes: [],
  },
};
