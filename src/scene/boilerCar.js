import { background, box, outside, perspective, train, windowSpots, lampDust } from './wagonKit.js';

// Wagen 21 (Tür 21): der Kesselwagen mit dem Heizer. Nur DATEN – was passiert, steht in src/story/wagon21.js.
// Links Kessel mit Manometer, drei Ventilen, Wasserstandsglas, Speisepumpe und Feuertür,
// rechts der Kohlenbunker mit Schaufel und der Spind des Heizers.

const WINDOWS = [
  { from: 44, to: 111, top: 110, bottom: 292 },
  { from: 940, to: 989, top: 169, bottom: 294 },
  { from: 1021, to: 1097, top: 143, bottom: 296 },
  { from: 1145, to: 1240, top: 108, bottom: 236 },
];

export const boilerCar = {
  id: 'boilerCar',
  name: 'Kesselwagen',
  background: background('assets/scenes/wagon-21/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'heizer', name: 'Der Heizer', poses: 'assets/characters/heizer',
      x: 820, y: 600, pose: 'left', size: 1.0,
      walkTo: [700, 600], facing: 'right', color: '#ffb08a',
    },
  ],

  // Glut hinter der Feuertür, Funken, Dampf aus den Rohren (src/effects/ambience.js)
  ambience: [
    lampDust(),
    { kind: 'glow', x: 222, y: 492, radius: 150, color: '255, 110, 40', strength: 0.18, flicker: 'fire' },
    { kind: 'glow', x: 222, y: 492, radius: 70, color: '255, 150, 60', strength: 0.16, flicker: 'fire' },
    { kind: 'sparks', x: 222, y: 600, width: 150, every: 0.45 },
    { kind: 'steam', x: 348, y: 104, size: 18, drift: [12, -26], every: 0.45 },
    { kind: 'steam', x: 838, y: 186, size: 16, drift: [6, -22], every: 0.7, strength: 0.8 },
  ],

  hotspots: [
    { id: 'gauge', name: 'Manometer', area: box(152, 102, 288, 238), walkTo: [470, 600], facing: 'left' },
    { id: 'valves', name: 'Ventile', area: box(120, 250, 390, 372), walkTo: [470, 600], facing: 'left' },
    { id: 'water', name: 'Wasserstandsglas', area: box(378, 156, 442, 312), walkTo: [520, 560], facing: 'left' },
    { id: 'pump', name: 'Speisepumpe', area: box(398, 312, 544, 588), walkTo: [560, 600], facing: 'left' },
    { id: 'firebox', name: 'Feuertür', area: box(56, 372, 356, 624), walkTo: [470, 640], facing: 'left' },
    { id: 'coal', name: 'Kohlenbunker', area: box(800, 296, 1100, 560), walkTo: [760, 560], facing: 'right' },
    { id: 'shovel', name: 'Schaufel', area: box(924, 384, 1046, 650), walkTo: [860, 660], facing: 'right' },
    { id: 'locker', name: 'Spind', area: box(1104, 228, 1266, 700), walkTo: [1000, 680], facing: 'right' },
    { id: 'switches', name: 'Schalter', cursor: 'look', area: box(494, 210, 546, 252) },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: box(560, 130, 734, 494), walkTo: [646, 510], facing: 'back' },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [550, 500],
      [790, 500],
      [800, 560],
      [880, 650],
      [1000, 690],
      [1010, 712],
      [400, 712],
      [460, 640],
      [560, 592],
    ],
    holes: [
      [[780, 580], [860, 580], [860, 615], [780, 615]], // Heizer
    ],
  },
};
