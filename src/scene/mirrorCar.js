import { background, perspective, train } from './wagonKit.js';

// Wagen 9 (Tür 9): der Spiegelwagen. Nur DATEN – was passiert, steht in src/story/wagon9.js.
// Keine Fenster – nur Spiegel. Die Spiegelflächen im Hintergrundbild sind durchsichtig;
// dahinter malt das Drehbuch den gespiegelten Wagen (animations: 'mirror').

export const mirrorCar = {
  id: 'mirrorCar',
  name: 'Spiegelwagen',
  background: background('assets/scenes/wagon-09/background.webp'),

  animations: [
    { id: 'mirror', layer: 'behind', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'leverLeft', name: 'Linker Hebel', area: [[384, 160], [458, 160], [458, 252], [384, 252]], walkTo: [470, 450], facing: 'back' },
    { id: 'leverRight', name: 'Rechter Hebel', area: [[830, 156], [906, 156], [906, 252], [830, 252]], walkTo: [810, 450], facing: 'back' },
    { id: 'eye', name: 'Glasauge', area: [[646, 238], [704, 238], [704, 292], [646, 292]], walkTo: [640, 440], facing: 'back' },
    { id: 'stands', name: 'Standspiegel', area: [[376, 262], [544, 262], [544, 440], [376, 440]], walkTo: [520, 470], facing: 'left' },
    { id: 'stands', name: 'Standspiegel', area: [[750, 262], [914, 262], [914, 440], [750, 440]], walkTo: [760, 470], facing: 'right' },
    { id: 'scratches', name: 'Kratzer in der Wand', area: [[1192, 312], [1268, 312], [1268, 434], [1192, 434]], walkTo: [960, 600], facing: 'right' },
    { id: 'plaque', name: 'Messingschild', cursor: 'look', area: [[676, 296], [706, 296], [706, 324], [676, 324]] },
    { id: 'speaker', name: 'Lautsprecher', cursor: 'look', area: [[408, 74], [472, 74], [472, 150], [408, 150]] },
    { id: 'lamp', name: 'Deckenlampe', cursor: 'look', area: [[600, 50], [680, 50], [680, 92], [600, 92]] },
    { id: 'wallMirror', name: 'Spiegel', area: [[1104, 80], [1206, 80], [1206, 370], [1104, 370]], walkTo: [960, 600], facing: 'right' },
    { id: 'wallMirror', name: 'Spiegel', area: [[998, 110], [1080, 110], [1080, 350], [998, 350]], walkTo: [940, 560], facing: 'right' },
    { id: 'wallMirror', name: 'Spiegel', area: [[918, 140], [978, 140], [978, 330], [918, 330]], walkTo: [900, 520], facing: 'right' },
    { id: 'wallMirror', name: 'Spiegel', area: [[36, 70], [160, 70], [160, 370], [36, 370]], walkTo: [330, 600], facing: 'left' },
    { id: 'wallMirror', name: 'Spiegel', area: [[200, 110], [288, 110], [288, 350], [200, 350]], walkTo: [350, 560], facing: 'left' },
    { id: 'wallMirror', name: 'Spiegel', area: [[308, 140], [372, 140], [372, 330], [308, 330]], walkTo: [380, 520], facing: 'left' },
    { id: 'carpet', name: 'Teppich', area: [[470, 560], [800, 560], [860, 720], [420, 720]], walkTo: [640, 640], facing: 'front' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[556, 118], [722, 118], [722, 410], [556, 410]], walkTo: [640, 440], facing: 'back' },
  ],

  train: train({ lightsOutInTunnel: true }),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [560, 420],
      [740, 420],
      [760, 446],
      [920, 450],
      [960, 520],
      [1000, 620],
      [1040, 712],
      [240, 712],
      [290, 620],
      [330, 520],
      [370, 450],
      [540, 446],
    ],
    holes: [],
  },
};
