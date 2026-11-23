import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 6: das Fundbüro. Nur DATEN – was passiert, steht in src/story/wagon6.js.
// Ein Tresen trennt den Raum: Die Tür nach vorne liegt dahinter, die Klappe im Tresen ist mit
// einem Vorhängeschloss gesichert. Den Schaffner hört man nur aus dem Trichter über der Tür.

export const lostAndFound = {
  id: 'lostAndFound',
  name: 'Fundbüro',
  background: background('assets/scenes/wagon-06/background.webp'),
  outside: outside([
    { from: 240, to: 310, top: 132, bottom: 297 },
    { from: 342, to: 388, top: 200, bottom: 292 },
    { from: 979, to: 1059, top: 128, bottom: 298 },
  ]),

  props: [],

  hotspots: [
    { id: 'bell', name: 'Tischglocke', area: [[460, 322], [534, 322], [534, 388], [460, 388]], walkTo: [500, 560], facing: 'back' },
    { id: 'padlock', name: 'Vorhängeschloss', when: '!flapOpen', area: [[616, 380], [660, 380], [660, 428], [616, 428]], walkTo: [640, 560], facing: 'back' },
    { id: 'flap', name: 'Klappe im Tresen', area: [[544, 356], [736, 356], [736, 422], [544, 422]], walkTo: [640, 560], facing: 'back' },
    { id: 'index', name: 'Karteikasten', area: [[734, 292], [866, 292], [866, 384], [734, 384]], walkTo: [790, 560], facing: 'back' },
    { id: 'counter', name: 'Tresen', area: [[414, 384], [882, 384], [882, 532], [414, 532]], walkTo: [640, 560], facing: 'back' },
    { id: 'horn', name: 'Lautsprecher', cursor: 'talk', area: [[592, 46], [688, 46], [688, 128], [592, 128]], walkTo: [640, 560], facing: 'back' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[578, 160], [702, 160], [702, 356], [578, 356]], walkTo: [640, 560], facing: 'back' },
    { id: 'keypads', name: 'Schalttafeln', cursor: 'look', area: [[486, 206], [558, 206], [558, 256], [486, 256]] },
    { id: 'keypads', name: 'Schalttafeln', cursor: 'look', area: [[714, 210], [746, 210], [746, 262], [714, 262]] },
    { id: 'lockers', name: 'Schließfächer', area: [[1086, 80], [1258, 80], [1258, 660], [1086, 640]], walkTo: [1040, 640], facing: 'right' },
    { id: 'shelf', name: 'Regal mit Fundsachen', area: [[30, 56], [334, 56], [334, 520], [30, 690]], walkTo: [300, 640], facing: 'left' },
    { id: 'shelfRight', name: 'Regal', area: [[776, 110], [956, 110], [956, 300], [880, 300], [880, 420], [776, 290]], walkTo: [900, 560], facing: 'right' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[240, 132], [310, 132], [310, 297], [240, 297]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[342, 200], [388, 200], [388, 292], [342, 292]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[979, 128], [1059, 128], [1059, 298], [979, 298]] },
  ],

  train: train(),
  playerStart: { x: 640, y: 660, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [360, 542],
      [925, 542],
      [1040, 614],
      [1052, 700],
      [180, 700],
      [270, 614],
    ],
    holes: [],
  },
};
