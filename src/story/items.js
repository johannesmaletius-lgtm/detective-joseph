// Katalog aller Gegenstände, die Joseph einstecken kann.
//
// name:   so heißt er im Spiel (steht am Mauszeiger)
// image:  Bild im Inventar (128 × 128, transparenter Hintergrund – siehe tools/make-items.mjs)
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
