import { background, box, outside, perspective, train, windowSpots, lampDust } from './wagonKit.js';

// Wagen 16: der Funkraum. Nur DATEN – was passiert, steht in src/story/wagon16.js.

const WINDOWS = [
  { from: 47, to: 141, top: 106, bottom: 292 },
  { from: 198, to: 258, top: 138, bottom: 271 },
  { from: 259, to: 284, top: 155, bottom: 278 },
  { from: 323, to: 374, top: 162, bottom: 272 },
  { from: 1011, to: 1086, top: 139, bottom: 264 },
  { from: 1139, to: 1239, top: 106, bottom: 289 },
];

export const radioRoom = {
  id: 'radioRoom',
  name: 'Funkraum',
  background: background('assets/scenes/wagon-16/background.webp'),
  outside: outside(WINDOWS),

  animations: [
    { id: 'radio', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  // kleine Effekte (src/effects/ambience.js)
  ambience: [
    lampDust(),
  ],

  hotspots: [
    { id: 'crank', name: 'Antennenkurbel', area: box(60, 290, 344, 640), walkTo: [430, 620], facing: 'left' },
    { id: 'antenna', name: 'Antennenmast', cursor: 'look', area: box(236, 0, 372, 288) },
    { id: 'radio', name: 'Funkgerät', area: box(900, 226, 1204, 404), walkTo: [800, 600], facing: 'right' },
    { id: 'morseKey', name: 'Morsetaste', area: box(848, 352, 962, 422), walkTo: [780, 580], facing: 'right' },
    { id: 'headphones', name: 'Kopfhörer', when: '!headphonesTaken', area: box(1064, 368, 1172, 452), walkTo: [820, 610], facing: 'right' },
    { id: 'logbook', name: 'Logbuch', area: box(930, 424, 1142, 516), walkTo: [820, 620], facing: 'right' },
    { id: 'mug', name: 'Kaffeetasse', cursor: 'look', area: box(1168, 438, 1242, 508) },
    { id: 'board', name: 'Morsetafel', area: box(794, 144, 966, 296), walkTo: [700, 460], facing: 'right' },
    { id: 'drawers', name: 'Schubladen', cursor: 'look', area: box(1100, 548, 1244, 720) },
    { id: 'chair', name: 'Stuhl', area: box(768, 394, 970, 680), walkTo: [740, 640], facing: 'right' },
    { id: 'bench', name: 'Sitzbank', area: box(288, 248, 532, 532), walkTo: [480, 560], facing: 'left' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 118, 720, 404), walkTo: [640, 440], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [540, 412],
      [760, 412],
      [755, 470],
      [730, 560],
      [740, 712],
      [380, 712],
      [380, 600],
      [440, 540],
      [536, 520],
    ],
    holes: [],
  },
};
