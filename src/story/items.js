// Katalog aller Gegenstände, die Joseph einstecken kann.
//
// name:   so heißt er im Spiel (steht am Mauszeiger)
// image:  Bild im Inventar (128 × 128, transparenter Hintergrund – siehe tools/make-items.mjs)
// look:   was Joseph sagt, wenn man ihn anschaut (Rechtsklick im Inventar)
//
// Was ein Gegenstand in einer bestimmten Situation bewirkt (z. B. Messer + Klappe), steht in der
// Geschichte des jeweiligen Wagens, z. B. src/story/wagon1.js.

export const ITEMS = {
  letter: {
    name: 'Brief',
    image: 'assets/items/letter.png',
    look: 'Ein Brief, an „J.“ adressiert.',
  },
  knife: {
    name: 'Taschenmesser',
    image: 'assets/items/knife.png',
    look: 'Ein altes Taschenmesser. Die Spitze ist stumpf, als hätte jemand damit in Holz geritzt.',
  },
  ticket: {
    name: 'Fahrkarte',
    image: 'assets/items/ticket.png',
    look: '„RINGBAHN – gültig für 1 Runde.“ Kein Abfahrtsort. Kein Ziel.',
  },
  flashlightEmpty: {
    name: 'Taschenlampe (ohne Batterie)',
    image: 'assets/items/flashlight-empty.png',
    look: 'Eine Taschenlampe. Das Batteriefach ist leer.',
  },
  battery: {
    name: 'Batterie',
    image: 'assets/items/battery.png',
    look: 'Eine dicke Batterie. Hoffentlich ist noch Saft drin.',
  },
  flashlight: {
    name: 'Taschenlampe',
    image: 'assets/items/flashlight.png',
    look: 'Die Taschenlampe geht. Wenn es dunkel wird, schalte ich sie ein.',
  },
};

// Welche Gegenstände sich zu einem neuen verbinden lassen (Reihenfolge egal)
export const COMBINATIONS = [
  {
    items: ['flashlightEmpty', 'battery'],
    result: 'flashlight',
    say: ['Batterie rein, Deckel zu …', 'Licht! Die Taschenlampe geht.'],
  },
];

export function findCombination(a, b) {
  return COMBINATIONS.find(({ items }) => (items[0] === a && items[1] === b) || (items[0] === b && items[1] === a));
}
