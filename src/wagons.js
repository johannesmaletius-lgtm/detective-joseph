import { trainCompartment } from './scene/trainCompartment.js';
import { wagon1 } from './story/wagon1.js';
import { diningCar } from './scene/diningCar.js';
import { wagon4 } from './story/wagon4.js';
import { sleepingCar } from './scene/sleepingCar.js';
import { wagon5 } from './story/wagon5.js';

// Alle Wagen, die es schon gibt: Nummer → Szene (Daten) und Drehbuch (Geschichte).
// Starten mit einem bestimmten Wagen: http://localhost:8150/?wagen=4
// Am Ende eines Wagens geht es direkt in den nächsten – wenn es ihn schon gibt.
export const WAGONS = {
  1: { scene: trainCompartment, script: wagon1 },
  4: { scene: diningCar, script: wagon4 },
  5: { scene: sleepingCar, script: wagon5 },
};
