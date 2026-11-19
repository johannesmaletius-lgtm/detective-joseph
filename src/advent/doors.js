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

// Lädt Szene und Drehbuch eines Wagens erst, wenn die Tür geöffnet wird
function wagon(sceneFile, sceneName, storyFile, storyName) {
  return async () => ({
    scene: (await import(`../scene/${sceneFile}.js`))[sceneName],
    script: (await import(`../story/${storyFile}.js`))[storyName],
  });
}

export const DOORS = [
  {
    door: 1,
    wagon: 'Das Abteil',
    load: async () => ({
      scene: (await import('../scene/trainCompartment.js')).trainCompartment,
      script: (await import('../story/wagon1.js')).wagon1,
    }),
  },
  { door: 2, wagon: 'Gepäckwagen' },
  { door: 3, wagon: 'Postwagen' },
  { door: 4, wagon: 'Speisewagen', load: wagon('diningCar', 'diningCar', 'wagon4', 'wagon4') },
  { door: 5, wagon: 'Schlafwagen', load: wagon('sleepingCar', 'sleepingCar', 'wagon5', 'wagon5') },
  { door: 6, wagon: 'Fundbüro', load: wagon('lostAndFound', 'lostAndFound', 'wagon6', 'wagon6') },
  { door: 7, wagon: 'Barwagen', load: wagon('barCar', 'barCar', 'wagon7', 'wagon7') },
  { door: 8, wagon: 'Bordkino', load: wagon('cinemaCar', 'cinemaCar', 'wagon8', 'wagon8') },
  { door: 9, wagon: 'Spiegelwagen', load: wagon('mirrorCar', 'mirrorCar', 'wagon9', 'wagon9') },
  { door: 10, wagon: 'Lautsprecherwagen', load: wagon('speakerCar', 'speakerCar', 'wagon10', 'wagon10') },
  { door: 11, wagon: 'Uhrenwagen', load: wagon('clockCar', 'clockCar', 'wagon11', 'wagon11') },
  { door: 12, wagon: 'Musiksalon', load: wagon('musicSalon', 'musicSalon', 'wagon12', 'wagon12') },
  { door: 13, wagon: 'Kapelle', load: wagon('chapelCar', 'chapelCar', 'wagon13', 'wagon13') },
  { door: 14, wagon: 'Zeitungswagen', load: wagon('newspaperCar', 'newspaperCar', 'wagon14', 'wagon14') },
  { door: 15, wagon: 'Spielzimmer', load: wagon('playroom', 'playroom', 'wagon15', 'wagon15') },
  { door: 16, wagon: 'Funkraum', load: wagon('radioRoom', 'radioRoom', 'wagon16', 'wagon16') },
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
