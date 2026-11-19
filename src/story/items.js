import {
  paintBon, paintCrank, paintCrowbar, paintGlass, paintHatpin, paintManifest, paintPadlockKey, paintPhoto, paintRecord,
  paintNoteSheet, paintSeeds, paintVierkant,
} from './itemPaint.js';

// Katalog aller Gegenstände, die Joseph einstecken kann.
//
// name:   so heißt er im Spiel (steht am Mauszeiger)
// image:  Bild im Inventar (128 × 128, transparenter Hintergrund – siehe tools/make-items.mjs)
// paint:  statt image: das Bild wird mit Code gemalt (siehe itemPaint.js)
// look:   was Joseph sagt, wenn man ihn anschaut (Rechtsklick im Inventar)
//
// Was ein Gegenstand in einer bestimmten Situation bewirkt (z. B. Messer + Klappe), steht in der
// Geschichte des jeweiligen Wagens, z. B. src/story/wagon1.js. Dort kann auch stehen, was beim
// Anschauen passiert (z. B. öffnet sich bei den Papierfetzen das Puzzle).

export const ITEMS = {
  letter: {
    name: 'Brief',
    image: 'assets/items/letter.png',
    look: 'Ein Brief, an „J.“ adressiert.',
  },
  key: {
    name: 'Kleiner Schlüssel',
    image: 'assets/items/key.png',
    look: 'Ein kleiner Schlüssel. Auf dem Anhänger steht in meiner Schrift: „Werkzeug“.',
  },
  knife: {
    name: 'Taschenmesser',
    image: 'assets/items/knife.png',
    look: 'Ein altes Taschenmesser. Die Spitze ist stumpf, als hätte jemand damit in Holz geritzt.',
  },
  pieces: {
    name: 'Papierfetzen',
    image: 'assets/items/pieces.png',
    look: 'Fetzen von einem zerrissenen Fahrplan.',
  },
  sheet: {
    name: 'Signaltafel',
    image: 'assets/items/sheet.png',
    look: 'Der zusammengesetzte Fahrplan der Ringbahn – mit den Lichtsignalen des Turms.',
  },
  binoculars: {
    name: 'Fernglas',
    image: 'assets/items/binoculars.png',
    look: 'Ein Fernglas. Damit sehe ich draußen mehr – zum Beispiel den Turm. Ich müsste es nur ans Fenster halten.',
  },
  flashlightEmpty: {
    name: 'Taschenlampe (leer)',
    image: 'assets/items/flashlight-empty.png',
    look: 'Eine Taschenlampe. Im Griff ist Platz für zwei Batterien – beide Fächer sind leer.',
  },
  flashlightHalf: {
    name: 'Taschenlampe (1 von 2 Batterien)',
    image: 'assets/items/flashlight-half.png',
    look: 'Eine Batterie steckt drin, das zweite Fach ist leer. So bleibt sie dunkel.',
  },
  flashlight: {
    name: 'Taschenlampe',
    image: 'assets/items/flashlight.png',
    look: 'Die Taschenlampe geht. Wenn es dunkel wird, schalte ich sie ein.',
  },
  battery: {
    name: 'Batterie',
    image: 'assets/items/battery.png',
    look: 'Eine dicke Batterie. Hoffentlich ist noch Saft drin.',
  },

  // ---------------------------------------------------------------- Wagen 2: Speisewagen
  crank: {
    name: 'Kurbel',
    paint: paintCrank,
    look: 'Eine Handkurbel mit Holzgriff. Sie gehört zu einem Grammophon.',
  },
  record: {
    name: 'Schallplatte „Ringbahn-Walzer“',
    paint: paintRecord,
    look: 'Eine Schallplatte mit rotem Etikett: „Ringbahn-Walzer – zum Tanzen in der Kurve“.',
  },
  glass: {
    name: 'Glas',
    paint: (ctx) => paintGlass(ctx, { wine: 'rgba(232, 200, 110, 0.85)' }),
    look: 'Ein Weinglas vom Tisch 4.',
  },
  poisonGlass: {
    name: 'Glas mit Probe 41',
    paint: (ctx) => paintGlass(ctx, { glowing: true }),
    look: 'Herrn Brandts Rotwein. Im Dunkeln leuchtet er grün. Den trinkt keiner – auch ich nicht.',
  },
  bon: {
    name: 'Bon aus der Küche',
    paint: paintBon,
    look: 'Der Bestellzettel für Tisch 4. Unterschrieben mit „J.“',
  },
  vierkant: {
    name: 'Vierkantschlüssel',
    paint: paintVierkant,
    look: 'Herrn Brandts Vierkantschlüssel. Damit öffnet ein Schaffner im Zug fast jede Tür und jede Klappe.',
  },

  // ---------------------------------------------------------------- Wagen 3: Schlafwagen
  sleepNotes: {
    name: 'Zettel: Frau Adlers Worte',
    paint: paintNoteSheet,
    look: 'Was Frau Adler im Schlaf murmelt.',
  },
  hatpin: {
    name: 'Hutnadel',
    paint: paintHatpin,
    look: 'Eine lange Hutnadel mit violettem Glaskopf. Die Spitze ist zu einem kleinen Haken umgebogen.',
  },

  // ---------------------------------------------------------------- Wagen 4: Gepäckwagen
  crowbar: {
    name: 'Brecheisen',
    paint: paintCrowbar,
    look: 'Ein rotes Brecheisen. Damit bekommt man jede Kiste auf.',
  },
  seeds: {
    name: 'Vogelfutter',
    paint: paintSeeds,
    look: 'Eine Tüte Vogelfutter. „Für Kasimir – nicht mehr als eine Handvoll pro Runde.“',
  },
  manifest: {
    name: 'Frachtliste',
    paint: paintManifest,
    look: 'Die Frachtliste des Gepäckwagens.',
  },
  photo: {
    name: 'Foto',
    paint: paintPhoto,
    look: 'Ein altes Foto: zwei Männer auf einem Bahnsteig. Beide sehen aus wie ich.',
  },
  padlockKey: {
    name: 'Schlüssel „Postwagen“',
    paint: paintPadlockKey,
    look: 'Ein Vorhängeschloss-Schlüssel. Auf dem Anhänger: „Postwagen“.',
  },
};

// Welche Gegenstände sich zu einem neuen verbinden lassen (Reihenfolge egal).
// Der erste wird durch das Ergebnis ersetzt, der zweite verschwindet.
export const COMBINATIONS = [
  {
    items: ['flashlightEmpty', 'battery'],
    result: 'flashlightHalf',
    say: ['Batterie rein …', 'Nichts. Sie braucht zwei – ein Fach ist noch leer.'],
  },
  {
    items: ['flashlightHalf', 'battery'],
    result: 'flashlight',
    say: ['Zweite Batterie rein, Deckel zu …', 'Licht! Die Taschenlampe geht.'],
  },
];

export function findCombination(a, b) {
  return COMBINATIONS.find(({ items }) => (items[0] === a && items[1] === b) || (items[0] === b && items[1] === a));
}
