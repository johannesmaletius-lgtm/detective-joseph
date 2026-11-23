import { conductorCar } from './conductorCar.js';

// Tür 24 (Heiligabend): wieder im Schaffnerabteil (Hintergrund aus Wagen 18). Nur DATEN – was passiert,
// steht in src/story/wagon24.js. Dazu kommt Mira, die am Ende zur Tür hereinschaut.

const KEEP = ['punch', 'coat', 'redLever', 'speaker', 'keyboard', 'book', 'door', 'window', 'plan'];

export const finale = {
  ...conductorCar,
  id: 'finale',
  name: 'Heiligabend',
  characters: [
    {
      id: 'mira', name: 'Mira', poses: 'assets/characters/mira',
      x: 640, y: 440, pose: 'front', size: 0.62, when: 'miraHere',
      walkTo: [640, 520], facing: 'back', color: '#ffc8d8',
    },
  ],
  hotspots: conductorCar.hotspots.filter((h) => KEEP.includes(h.id)),
};
