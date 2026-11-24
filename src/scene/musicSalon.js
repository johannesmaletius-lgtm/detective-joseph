import { background, box, outside, perspective, train, windowSpots } from './wagonKit.js';

// Wagen 12: der Musiksalon mit Herrn Moll. Nur DATEN – was passiert, steht in src/story/wagon12.js.

const WINDOWS = [
  { from: 48, to: 144, top: 114, bottom: 299 },
  { from: 233, to: 283, top: 148, bottom: 285 },
  { from: 312, to: 348, top: 162, bottom: 279 },
  { from: 941, to: 974, top: 162, bottom: 280 },
  { from: 1001, to: 1038, top: 148, bottom: 287 },
  { from: 1136, to: 1234, top: 114, bottom: 308 },
];

export const musicSalon = {
  id: 'musicSalon',
  name: 'Musiksalon',
  background: background('assets/scenes/wagon-12/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'moll', name: 'Herr Moll', poses: 'assets/characters/moll',
      x: 812, y: 470, pose: 'left', size: 1.06,
      walkTo: [700, 500], facing: 'right', color: '#e6d3f0',
    },
  ],

  hotspots: [
    { id: 'musicBox', name: 'Spieldose', area: box(138, 262, 208, 304), walkTo: [470, 560], facing: 'left' },
    { id: 'stand', name: 'Notenständer', area: box(208, 318, 322, 398), walkTo: [470, 560], facing: 'left' },
    { id: 'keys', name: 'Klavier', area: box(110, 396, 404, 492), walkTo: [470, 580], facing: 'left' },
    { id: 'piano', name: 'Klavier', area: box(30, 290, 410, 680), walkTo: [470, 600], facing: 'left' },
    { id: 'bench', name: 'Klavierbank', area: box(244, 474, 448, 610), walkTo: [500, 620], facing: 'left' },
    { id: 'carpet', name: 'Teppichecke', area: box(536, 430, 600, 470), walkTo: [560, 490], facing: 'back' },
    { id: 'gramophone', name: 'Grammophon', area: box(1000, 176, 1144, 372), walkTo: [880, 470], facing: 'right' },
    { id: 'records', name: 'Schallplatten', area: box(1096, 334, 1214, 388), walkTo: [880, 470], facing: 'right' },
    { id: 'flowers', name: 'Blumen', cursor: 'look', area: box(54, 186, 176, 306) },
    { id: 'lamp', name: 'Lampe', cursor: 'look', area: box(186, 196, 258, 300) },
    { id: 'chandelier', name: 'Kronleuchter', cursor: 'look', area: box(570, 0, 710, 110) },
    { id: 'sofa', name: 'Sofa', area: [[790, 300], [1030, 300], [1030, 500], [880, 520], [790, 450]], walkTo: [760, 520], facing: 'right' },
    { id: 'sofa', name: 'Sofa', area: box(946, 380, 1280, 720), walkTo: [860, 640], facing: 'right' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(566, 118, 720, 400), walkTo: [640, 440], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  // Kronleuchter (Kerzen, brennt auch im Tunnel weiter) und Tischlampe flackern leise, Staub schwebt im Licht (src/effects/ambience.js)
  ambience: [
    { kind: 'glow', x: 640, y: 52, radius: 120, color: '255, 205, 130', strength: 0.14, flicker: 'lamp', burns: true, lightRadius: 300 },
    { kind: 'glow', x: 584, y: 38, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 595, y: 31, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 617, y: 25, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 663, y: 25, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 685, y: 31, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 696, y: 38, radius: 14, color: '255, 225, 160', strength: 0.5, flicker: 'candle', burns: true },
    { kind: 'glow', x: 222, y: 232, radius: 70, color: '255, 200, 120', strength: 0.18, flicker: 'candle' },
    { kind: 'dust', x: 560, y: 70, width: 160, height: 160, count: 16 },
    { kind: 'dust', x: 180, y: 255, width: 90, height: 60, count: 6 },
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [540, 412],
      [785, 412],
      [780, 462],
      [890, 540],
      [900, 640],
      [895, 700],
      [470, 700],
      [478, 622],
      [480, 500],
    ],
    holes: [],
  },
};
