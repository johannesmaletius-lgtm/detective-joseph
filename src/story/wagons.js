import { trainCompartment } from '../scene/trainCompartment.js';
import { diningCar } from '../scene/diningCar.js';
import { sleepingCar } from '../scene/sleepingCar.js';
import { luggageCar } from '../scene/luggageCar.js';
import { postCar } from '../scene/postCar.js';
import { conductorCar } from '../scene/conductorCar.js';
import { tunnel } from '../scene/tunnel.js';
import { wagon1 } from './wagon1.js';
import { wagon2 } from './wagon2.js';
import { wagon3 } from './wagon3.js';
import { wagon4 } from './wagon4.js';
import { wagon5 } from './wagon5.js';
import { wagon6 } from './wagon6.js';
import { wagon7 } from './wagon7.js';

// Die Wagen des Zuges in ihrer Reihenfolge: jeweils der Ort (Szene) und seine Geschichte (Drehbuch).
// Joseph geht von vorne nach hinten durch – durch die Tür im Hintergrund in den nächsten Wagen.
// Teil 1: Wagen 1–4. Teil 2: Postwagen, Schaffnerabteil – und zuletzt hinaus in den Tunnel.
export const WAGONS = {
  1: { name: 'Das erste Abteil', scene: trainCompartment, script: wagon1 },
  2: { name: 'Der Speisewagen', scene: diningCar, script: wagon2 },
  3: { name: 'Der Schlafwagen', scene: sleepingCar, script: wagon3 },
  4: { name: 'Der Gepäckwagen', scene: luggageCar, script: wagon4 },
  5: { name: 'Der Postwagen', scene: postCar, script: wagon5 },
  6: { name: 'Das Schaffnerabteil', scene: conductorCar, script: wagon6 },
  7: { name: 'Der Tunnel', scene: tunnel, script: wagon7 },
};

// Spielstand: Welchen Wagen hat Joseph zuletzt betreten? (im Browser gespeichert)
const KEY = 'detective-joseph.wagen';

export function saveProgress(number) {
  try {
    localStorage.setItem(KEY, String(number));
  } catch {
    // ohne Speicher (z. B. privates Fenster) geht es auch – dann eben jedes Mal von vorn
  }
}

export function loadProgress() {
  try {
    return Number(localStorage.getItem(KEY)) || 1;
  } catch {
    return 1;
  }
}
