import { background, box, outside, perspective, train, windowSpots, lampDust } from './wagonKit.js';

// Wagen 22 (Tür 22): der Führerstand der Lok. Nur DATEN – was passiert, steht in src/story/wagon22.js.
// Links der Fahrtenschreiber und die Luke zum Kohlentender (mit Zahlenschloss), in der Mitte der Kessel,
// rechts das Fahrpult mit dem Schlüsselloch für den Lok-Schlüssel.

const WINDOWS = [
  { from: 46, to: 145, top: 109, bottom: 301 },
  { from: 231, to: 308, top: 150, bottom: 254 },
  { from: 1137, to: 1239, top: 109, bottom: 301 },
];

export const locomotive = {
  id: 'locomotive',
  name: 'Die Lok',
  background: background('assets/scenes/wagon-22/background.webp'),
  outside: outside(WINDOWS),

  characters: [
    {
      id: 'other', name: 'Der andere Joseph', poses: 'assets/characters/anderer-joseph',
      x: 820, y: 620, pose: 'right', size: 1.0, when: 'otherHere',
      walkTo: [640, 640], facing: 'right', color: '#e0c8a0',
    },
    {
      id: 'conductor', name: 'Der Schaffner', poses: 'assets/characters/schaffner',
      x: 820, y: 620, pose: 'front', size: 1.0, when: 'capOff', idle: ['blink'],
      walkTo: [640, 640], facing: 'right', color: '#e0c8a0',
    },
  ],

  // Glut in der Feuerbüchse, Funken, Dampf aus den Rohrverbindungen (src/effects/ambience.js)
  ambience: [
    lampDust(),
    { kind: 'glow', x: 640, y: 385, radius: 170, color: '255, 110, 40', strength: 0.17, flicker: 'fire' },
    { kind: 'glow', x: 640, y: 385, radius: 85, color: '255, 150, 60', strength: 0.15, flicker: 'fire' },
    { kind: 'sparks', x: 640, y: 492, width: 170, every: 0.4 },
    { kind: 'steam', x: 470, y: 118, size: 14, drift: [-8, -22], every: 0.6 },
    { kind: 'steam', x: 858, y: 100, size: 14, drift: [8, -20], every: 0.75 },
  ],

  hotspots: [
    { id: 'recorder', name: 'Fahrtenschreiber', area: box(150, 236, 412, 392), walkTo: [460, 600], facing: 'left' },
    { id: 'hatch', name: 'Luke zum Kohlentender', area: [[0, 560], [380, 560], [370, 720], [0, 720]], walkTo: [460, 660], facing: 'left' },
    { id: 'desk', name: 'Fahrpult', area: box(850, 214, 1250, 630), walkTo: [820, 600], facing: 'right' },
    { id: 'keyhole', name: 'Schlüsselloch', area: box(1020, 446, 1066, 500), walkTo: [880, 620], facing: 'right' },
    { id: 'clock', name: 'Uhr', area: box(714, 160, 782, 230), walkTo: [700, 540], facing: 'back' },
    { id: 'firebox', name: 'Feuerbüchse', area: box(486, 140, 820, 500), walkTo: [640, 540], facing: 'back' },
    { id: 'waterGlass', name: 'Wasserstand', cursor: 'look', area: box(402, 150, 448, 300) },
    ...windowSpots(WINDOWS),
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [430, 510],
      [830, 510],
      [840, 600],
      [905, 655],
      [960, 712],
      [380, 712],
      [400, 620],
    ],
    holes: [],
  },
};
