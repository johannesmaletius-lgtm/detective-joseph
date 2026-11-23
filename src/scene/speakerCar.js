import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 10: der Lautsprecherwagen. Nur DATEN – was passiert, steht in src/story/wagon10.js.

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

  animations: [
    { id: 'lights', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'fuses', name: 'Sicherungskasten', area: box(28, 240, 205, 500), walkTo: [330, 640], facing: 'left' },
    { id: 'tapes', name: 'Regal mit Tonbändern', area: box(206, 236, 442, 560), walkTo: [470, 600], facing: 'left' },
    { id: 'boxes', name: 'Kisten', cursor: 'look', area: box(232, 234, 410, 280) },
    { id: 'recorder', name: 'Tonbandgerät', area: box(906, 240, 1100, 432), walkTo: [800, 560], facing: 'right' },
    { id: 'mic', name: 'Mikrofon', area: box(846, 312, 906, 380), walkTo: [790, 600], facing: 'right' },
    { id: 'mixer', name: 'Mischpult', area: box(1000, 350, 1262, 528), walkTo: [860, 660], facing: 'right' },
    { id: 'cabinet', name: 'Schrank mit Vorhängeschloss', area: box(1010, 528, 1262, 718), walkTo: [860, 680], facing: 'right' },
    { id: 'monitor', name: 'Bildschirm', area: box(804, 160, 890, 246), walkTo: [740, 470], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 118, 720, 400), walkTo: [640, 440], facing: 'back' },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: box(108, 0, 246, 108) },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: box(346, 64, 432, 142) },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: box(846, 64, 932, 142) },
    { id: 'horn', name: 'Lautsprecher', cursor: 'look', area: box(1048, 0, 1182, 108) },
    { id: 'panel', name: 'Schalttafel', cursor: 'look', area: box(736, 222, 792, 304) },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [460, 412],
      [830, 412],
      [838, 470],
      [800, 560],
      [860, 632],
      [950, 662],
      [960, 700],
      [340, 700],
      [345, 640],
      [470, 520],
    ],
    holes: [],
  },
};
