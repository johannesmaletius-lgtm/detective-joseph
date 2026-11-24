import { background, box, outside, perspective, train } from './wagonKit.js';

// Wagen 13: die Kapelle. Nur DATEN – was passiert, steht in src/story/wagon13.js.
// Die Buntglasfenster sind im Hintergrundbild durchsichtig (Magenta) – das Spiel malt das Buntglas
// selbst dahinter ('glass'). Kerzenschein und Laterne liegen davor ('light').

export const STAINED = [
  { from: 55, to: 118, top: 175, bottom: 393 },
  { from: 174, to: 221, top: 211, bottom: 389 },
  { from: 262, to: 296, top: 239, bottom: 387 },
  { from: 989, to: 1021, top: 238, bottom: 386 },
  { from: 1063, to: 1108, top: 211, bottom: 389 },
  { from: 1164, to: 1227, top: 175, bottom: 395 },
];

export const chapelCar = {
  id: 'chapelCar',
  name: 'Kapelle',
  background: background('assets/scenes/wagon-13/background.webp'),
  outside: outside([]),

  animations: [
    { id: 'glass', layer: 'behind', x: 0, y: 0, width: 1280, height: 720 },
    { id: 'light', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  // Die beiden Wandlaternen flackern, Staub tanzt in ihrem Licht (src/effects/ambience.js).
  // Kranzkerzen und Standlaterne gehören zum Rätsel – die malt src/story/art/wagon13.js.
  ambience: [
    { kind: 'glow', x: 272, y: 90, radius: 70, color: '255, 180, 90', strength: 0.2, flicker: 'candle', burns: true },
    { kind: 'glow', x: 272, y: 92, radius: 20, color: '255, 225, 150', strength: 0.45, flicker: 'candle' },
    { kind: 'glow', x: 1006, y: 90, radius: 70, color: '255, 180, 90', strength: 0.2, flicker: 'candle', burns: true },
    { kind: 'glow', x: 1006, y: 92, radius: 20, color: '255, 225, 150', strength: 0.45, flicker: 'candle' },
    { kind: 'dust', x: 222, y: 110, width: 100, height: 90, count: 8 },
    { kind: 'dust', x: 956, y: 110, width: 100, height: 90, count: 8 },
  ],

  hotspots: [
    { id: 'wreath', name: 'Adventskranz', area: box(420, 0, 862, 132), walkTo: [640, 560], facing: 'back' },
    { id: 'bellG', name: 'Große Glocke', area: box(602, 140, 682, 226), walkTo: [640, 540], facing: 'back' },
    { id: 'bellH', name: 'Kleine Glocke', area: box(544, 160, 590, 212), walkTo: [600, 540], facing: 'back' },
    { id: 'bellA', name: 'Kleine Glocke', area: box(694, 160, 752, 226), walkTo: [680, 540], facing: 'back' },
    { id: 'beam', name: 'Glockenbalken', cursor: 'look', area: box(462, 134, 820, 168) },
    { id: 'plaque', name: 'Gedenktafel', area: box(328, 204, 500, 372), walkTo: [560, 560], facing: 'left' },
    { id: 'altar', name: 'Altar', area: box(752, 336, 942, 404), walkTo: [740, 560], facing: 'right' },
    { id: 'cross', name: 'Kreuz', cursor: 'look', area: box(812, 214, 878, 334) },
    { id: 'lilies', name: 'Lilien', cursor: 'look', area: box(750, 250, 812, 336) },
    { id: 'lilies', name: 'Lilien', cursor: 'look', area: box(870, 250, 944, 336) },
    { id: 'offering', name: 'Opferstock', area: box(986, 510, 1156, 704), walkTo: [860, 640], facing: 'right' },
    { id: 'lantern', name: 'Laterne', when: '!lanternTaken', area: box(1112, 378, 1196, 500), walkTo: [860, 600], facing: 'right' },
    { id: 'stand', name: 'Laternenständer', cursor: 'look', area: box(1140, 330, 1230, 720) },
    { id: 'wallLamp', name: 'Wandlaterne', cursor: 'look', area: box(238, 26, 302, 146) },
    { id: 'wallLamp', name: 'Wandlaterne', cursor: 'look', area: box(978, 26, 1042, 146) },
    { id: 'pews', name: 'Kirchenbank', area: box(0, 404, 506, 704), walkTo: [520, 640], facing: 'left' },
    { id: 'pews', name: 'Kirchenbank', area: box(764, 404, 986, 704), walkTo: [760, 640], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(548, 236, 724, 520), walkTo: [640, 540], facing: 'back' },
    ...STAINED.map((w) => ({ id: 'stained', name: 'Buntglasfenster', cursor: 'look', area: box(w.from - 10, w.top - 40, w.to + 10, w.bottom + 10) })),
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective({ far: { y: 530, height: 255 }, near: { y: 700, height: 400 } }),

  walkArea: {
    outline: [
      [565, 528],
      [718, 528],
      [765, 600],
      [800, 700],
      [480, 700],
      [515, 600],
    ],
    holes: [],
  },
};
