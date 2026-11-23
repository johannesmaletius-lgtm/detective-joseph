// Die 24 Türen des Adventskalenders „Die Ringbahn“ (siehe docs/adventskalender.md).
//
// Jede Tür ist ein Wagen. Ein Wagen besteht aus
//   - einer Szene (nur Daten: Bild, Laufbereich, anklickbare Stellen …), z. B. src/scene/trainCompartment.js
//   - einem Drehbuch (was dort passiert), z. B. src/story/wagon1.js
// Beides wird erst geladen, wenn die Tür geöffnet wird (load). Türen ohne load sind noch nicht gebaut.
//
// wagon = Name des Wagens. Er erscheint im Kalender erst, wenn die Tür geschafft ist – vorher bleibt er eine Überraschung.

export const YEAR = 2026;
export const MONTH = 11; // Dezember (JavaScript zählt die Monate ab 0)

export const DOORS = [
  {
    door: 1,
    wagon: 'Das Abteil',
    load: async () => ({
      scene: (await import('../scene/trainCompartment.js')).trainCompartment,
      script: (await import('../story/wagon1.js')).wagon1,
    }),
  },
  {
    door: 2,
    wagon: 'Gepäckwagen',
    load: async () => ({
      scene: (await import('../scene/baggageCar.js')).baggageCar,
      script: (await import('../story/wagon2.js')).wagon2,
    }),
  },
  {
    door: 3,
    wagon: 'Postwagen',
    load: async () => ({
      scene: (await import('../scene/postCar.js')).postCar,
      script: (await import('../story/wagon3.js')).wagon3,
    }),
  },
  {
    door: 4,
    wagon: 'Speisewagen',
    load: async () => ({
      scene: (await import('../scene/diningCar.js')).diningCar,
      script: (await import('../story/wagon4.js')).wagon4,
    }),
  },
  {
    door: 5,
    wagon: 'Schlafwagen',
    load: async () => ({
      scene: (await import('../scene/sleepingCar.js')).sleepingCar,
      script: (await import('../story/wagon5.js')).wagon5,
    }),
  },
  {
    door: 6,
    wagon: 'Fundbüro',
    load: async () => ({
      scene: (await import('../scene/lostAndFound.js')).lostAndFound,
      script: (await import('../story/wagon6.js')).wagon6,
    }),
  },
  {
    door: 7,
    wagon: 'Barwagen',
    load: async () => ({
      scene: (await import('../scene/barCar.js')).barCar,
      script: (await import('../story/wagon7.js')).wagon7,
    }),
  },
  {
    door: 8,
    wagon: 'Bordkino',
    load: async () => ({
      scene: (await import('../scene/cinemaCar.js')).cinemaCar,
      script: (await import('../story/wagon8.js')).wagon8,
    }),
  },
  {
    door: 9,
    wagon: 'Spiegelwagen',
    load: async () => ({
      scene: (await import('../scene/mirrorCar.js')).mirrorCar,
      script: (await import('../story/wagon9.js')).wagon9,
    }),
  },
  { door: 10, wagon: 'Lautsprecherwagen' },
  { door: 11, wagon: 'Uhrenwagen' },
  { door: 12, wagon: 'Musiksalon' },
  { door: 13, wagon: 'Kapelle' },
  { door: 14, wagon: 'Zeitungswagen' },
  { door: 15, wagon: 'Spielzimmer' },
  { door: 16, wagon: 'Funkraum' },
  { door: 17, wagon: 'Gewächshaus' },
  { door: 18, wagon: 'Schaffnerabteil' },
  { door: 19, wagon: 'Fotolabor' },
  { door: 20, wagon: 'Packwagen' },
  { door: 21, wagon: 'Kesselwagen' },
  { door: 22, wagon: 'Die Lok' },
  { door: 23, wagon: 'Wartungsgang' },
  { door: 24, wagon: 'Heiligabend' },
];

export function doorInfo(door) {
  return DOORS.find((entry) => entry.door === door) ?? null;
}

// Ab diesem Tag (0 Uhr, Uhrzeit des Rechners) lässt sich die Tür öffnen
export function opensOn(door) {
  return new Date(YEAR, MONTH, door);
}

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

// "Samstag, 5. Dezember"
export function dateText(door) {
  return `${WEEKDAYS[opensOn(door).getDay()]}, ${door}. Dezember`;
}

// Heute – oder zum Ausprobieren ein anderes Datum aus der Adresse (?datum=2026-12-05)
export function today(fakeDate) {
  if (fakeDate) {
    const [y, m, d] = fakeDate.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d, 12);
  }
  return new Date();
}

// Darf die Tür heute geöffnet werden? Im Test-Modus (?test) gehen alle Türen auf.
export function isUnlocked(door, now, test = false) {
  return test || now >= opensOn(door);
}

// Ganze Tage bis zur Tür (0 = heute oder schon offen)
export function daysUntil(door, now) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((opensOn(door) - start) / 86400000));
}
