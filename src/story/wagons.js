import { trainCompartment } from '../scene/trainCompartment.js';
import { sleepingCarAdler } from '../scene/sleepingCarAdler.js';
import { luggageCar } from '../scene/luggageCar.js';
import { diningCar } from '../scene/diningCar.js';
import { sleepingCar } from '../scene/sleepingCar.js';
import { lostAndFound } from '../scene/lostAndFound.js';
import { barCar } from '../scene/barCar.js';
import { cinemaCar } from '../scene/cinemaCar.js';
import { wagon1 } from './wagon1.js';
import { wagon2 } from './wagon2.js';
import { wagon3 } from './wagon3.js';
import { wagon4 } from './wagon4.js';
import { wagon5 } from './wagon5.js';
import { wagon6 } from './wagon6.js';
import { wagon7 } from './wagon7.js';
import { wagon8 } from './wagon8.js';

// Die Wagen des Zuges in ihrer Reihenfolge: jeweils der Ort (Szene) und seine Geschichte (Drehbuch).
// Joseph geht durch die Tür im Hintergrund in den nächsten Wagen. Starten mit einem bestimmten Wagen: ?wagen=4
//
// Wagen 2 und 3 nehmen mit, was Joseph noch braucht (packFor in common.js).
// Die Wagen 4 bis 8 legen selbst fest, was Joseph dabeihat (startItems) und was im Notizbuch steht (recap).
export const WAGONS = {
  1: { name: 'Das erste Abteil', scene: trainCompartment, script: wagon1 },
  2: { name: 'Der Schlafwagen (Frau Adler)', scene: sleepingCarAdler, script: wagon2 },
  3: { name: 'Der Gepäckwagen', scene: luggageCar, script: wagon3 },
  4: { name: 'Der Speisewagen', scene: diningCar, script: wagon4 },
  5: { name: 'Der Schlafwagen (Oma Ilse)', scene: sleepingCar, script: wagon5 },
  6: { name: 'Das Fundbüro', scene: lostAndFound, script: wagon6 },
  7: { name: 'Der Barwagen', scene: barCar, script: wagon7 },
  8: { name: 'Das Bordkino', scene: cinemaCar, script: wagon8 },
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
