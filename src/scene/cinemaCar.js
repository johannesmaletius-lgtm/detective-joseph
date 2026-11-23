import { background, outside, perspective, train } from './wagonKit.js';

// Wagen 8: das Bordkino. Nur DATEN – was passiert, steht in src/story/wagon8.js.
// Die Leinwand ist im Hintergrundbild durchsichtig (Cyan) – dahinter zeichnet das Spiel,
// was der Projektor zeigt (animations: 'screen'). Der Lichtstrahl des Projektors liegt davor ('beam').

export const cinemaCar = {
  id: 'cinemaCar',
  name: 'Bordkino',
  background: background('assets/scenes/wagon-08/background.webp'),
  outside: outside([
    { from: 45, to: 142, top: 105, bottom: 291 },
    { from: 194, to: 276, top: 136, bottom: 282 },
    { from: 312, to: 361, top: 165, bottom: 278 },
    { from: 918, to: 974, top: 162, bottom: 278 },
    { from: 1006, to: 1087, top: 137, bottom: 282 },
    { from: 1137, to: 1240, top: 104, bottom: 283 },
  ]),

  animations: [
    { id: 'screen', layer: 'behind', x: 480, y: 84, width: 324, height: 141 },
    { id: 'beam', layer: 'front', x: 0, y: 0, width: 1280, height: 720 },
  ],

  hotspots: [
    { id: 'ticketSeat', name: 'Abgerissene Kinokarte', when: '!ticketLeftTaken', area: [[266, 470], [316, 470], [316, 502], [266, 502]], walkTo: [400, 600], facing: 'left' },
    { id: 'ticketA', name: 'Kinokarte', area: [[334, 364], [378, 364], [378, 390], [334, 390]], walkTo: [460, 486], facing: 'left' },
    { id: 'ticketB', name: 'Kinokarte', area: [[144, 560], [202, 560], [202, 596], [144, 596]], walkTo: [360, 640], facing: 'left' },
    { id: 'ticketC', name: 'Kinokarte', area: [[894, 362], [936, 362], [936, 386], [894, 386]], walkTo: [800, 500], facing: 'right' },
    { id: 'ticketD', name: 'Kinokarte', area: [[920, 482], [972, 482], [972, 510], [920, 510]], walkTo: [850, 600], facing: 'right' },
    { id: 'canister', name: 'Filmdose', area: [[950, 590], [1094, 590], [1094, 720], [950, 720]], walkTo: [900, 680], facing: 'right' },
    { id: 'projector', name: 'Projektor', area: [[1048, 236], [1268, 236], [1268, 580], [1048, 580]], walkTo: [900, 640], facing: 'right' },
    { id: 'popcorn', name: 'Popcornmaschine', area: [[346, 188], [474, 188], [474, 442], [346, 442]], walkTo: [480, 470], facing: 'left' },
    { id: 'screen', name: 'Leinwand', area: [[483, 87], [801, 87], [801, 222], [483, 222]], walkTo: [640, 470], facing: 'back' },
    { id: 'door', name: 'Tür zum nächsten Wagen', area: [[574, 238], [712, 238], [712, 446], [574, 446]], walkTo: [640, 462], facing: 'back' },
    { id: 'panel', name: 'Schalttafel', cursor: 'look', area: [[734, 244], [782, 244], [782, 356], [734, 356]] },
    { id: 'panel', name: 'Schalttafel', cursor: 'look', area: [[502, 248], [548, 248], [548, 302], [502, 302]] },
    { id: 'seats', name: 'Kinosessel', area: [[0, 290], [440, 290], [440, 440], [340, 600], [310, 700], [0, 700]], walkTo: [400, 620], facing: 'left' },
    { id: 'seats', name: 'Kinosessel', area: [[800, 284], [1050, 284], [1050, 600], [870, 600], [800, 450]], walkTo: [830, 560], facing: 'right' },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[45, 105], [142, 105], [142, 291], [45, 291]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[194, 136], [276, 136], [276, 282], [194, 282]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[918, 162], [974, 162], [974, 278], [918, 278]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1006, 137], [1087, 137], [1087, 282], [1006, 282]] },
    { id: 'window', name: 'Fenster', cursor: 'look', area: [[1137, 104], [1240, 104], [1240, 283], [1137, 283]] },
  ],

  train: train(),
  playerStart: { x: 640, y: 650, facing: 'back' },
  perspective: perspective(),

  walkArea: {
    outline: [
      [515, 454],
      [750, 454],
      [785, 504],
      [825, 604],
      [905, 680],
      [905, 700],
      [370, 700],
      [395, 604],
      [455, 522],
      [490, 474],
    ],
    holes: [],
  },
};
