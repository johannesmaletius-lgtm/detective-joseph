import { trainCompartment } from '../scene/trainCompartment.js';
import { diningCar } from '../scene/diningCarTeil1.js';
import { sleepingCar } from '../scene/sleepingCarTeil1.js';
import { luggageCar } from '../scene/luggageCar.js';
import { wagon1 } from './wagon1.js';
import { wagon2 } from './teil1Wagon2.js';
import { wagon3 } from './teil1Wagon3.js';
import { wagon4 } from './teil1Wagon4.js';

// Die Wagen des Zuges in ihrer Reihenfolge: jeweils der Ort (Szene) und seine Geschichte (Drehbuch).
// Joseph geht von vorne nach hinten durch – durch die Tür im Hintergrund in den nächsten Wagen.
export const WAGONS = {
  1: { name: 'Das erste Abteil', scene: trainCompartment, script: wagon1 },
  2: { name: 'Der Speisewagen', scene: diningCar, script: wagon2 },
  3: { name: 'Der Schlafwagen', scene: sleepingCar, script: wagon3 },
  4: { name: 'Der Gepäckwagen', scene: luggageCar, script: wagon4 },
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
