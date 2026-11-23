import { background, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 10 (Tür 10): der Lautsprecherwagen. Nur DATEN – was passiert, steht in src/story/wagon10.js.
// Links der Sicherungskasten und das Regal mit den Tonbändern, rechts das Tonbandgerät,
// das Mikrofon und das Mischpult (mit Vorhängeschloss). Neben der Tür der Totenkopf-Bildschirm.

const WINDOWS = [
  { from: 17, to: 114, top: 106, bottom: 255 },
  { from: 186, to: 271, top: 138, bottom: 278 },
  { from: 311, to: 373, top: 161, bottom: 252 },
  { from: 932, to: 982, top: 162, bottom: 245 },
  { from: 1022, to: 1101, top: 138, bottom: 256 },
  { from: 1154, to: 1261, top: 108, bottom: 286 },
];

export const speakerCar = {
  id: 'speakerCar',
  name: 'Lautsprecherwagen',
  background: background('assets/scenes/wagon-10/background.webp'),
  outside: outside(WINDOWS),

  hotspots: [
    { id: 'fuses', name: 'Sicherungskasten', area: [[28, 244], [204, 254], [204, 496], [28, 500]], walkTo: [330, 600], facing: 'left' },
    { id: 'toolbox', name: 'Werkzeugkiste', area: [[292, 512], [392, 512], [392, 620], [292, 620]], walkTo: [420, 640], facing: 'left' },
    { id: 'reels', name: 'Regal mit Tonbändern', area: [[220, 280], [440, 280], [440, 560], [220, 560]], walkTo: [450, 520], facing: 'left' },
    { id: 'tape', name: 'Tonbandgerät', area: [[912, 240], [1100, 240], [1100, 430], [912, 430]], walkTo: [820, 520], facing: 'right' },
    { id: 'mixer', name: 'Mischpult', area: [[1000, 350], [1240, 350], [1280, 520], [1000, 520]], walkTo: [900, 640], facing: 'right' },
    { id: 'mixerLock', name: 'Vorhängeschloss', area: [[1112, 540], [1170, 540], [1170, 616], [1112, 616]], walkTo: [900, 640], facing: 'right' },
    { id: 'microphone', name: 'Mikrofon', area: [[852, 314], [904, 314], [904, 610], [852, 610]], walkTo: [800, 560], facing: 'right' },
    { id: 'monitor', name: 'Bildschirm', area: [[804, 168], [890, 168], [890, 246], [804, 246]], walkTo: [760, 440], facing: 'back' },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: [[110, 0], [250, 0], [250, 110], [110, 110]] },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: [[1046, 0], [1190, 0], [1190, 110], [1046, 110]] },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[558, 118], [722, 118], [722, 396], [558, 396]], walkTo: [640, 420], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [470, 400],
      [800, 400],
      [840, 450],
      [830, 560],
      [820, 640],
      [940, 640],
      [990, 712],
      [300, 712],
      [400, 640],
      [440, 560],
      [450, 470],
    ],
    holes: [],
  },
};
