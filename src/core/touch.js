// Bedienung mit dem Finger (iPad, Tablet).
//
// touch.active ist true, solange zuletzt mit Finger oder Stift bedient wurde – mit Maus oder Trackpad
// wird es wieder false. Dann gilt:
//   Tippen = Linksklick   lange drücken = Rechtsklick (anschauen)   Finger ziehen = nur umsehen
//   doppelt tippen = rennen   ✕ oben links = Nahansicht schließen
//
// Alle Texte im Spielbild laufen durch forTouch(): aus „Rechtsklick“ wird „lange drücken“,
// aus „klicken“ „tippen“, Tastenkürzel fallen weg. Dafür sind fillText/measureText des
// Zeichenkontexts umgeleitet (installTouchText) – so muss kein einzelner Text geändert werden.

export const touch = {
  active: typeof matchMedia === 'function' && matchMedia('(hover: none) and (pointer: coarse)').matches,
};

// Ganz bestimmte Sätze zuerst, dann allgemeine Wörter. Jede Ersetzung darf ihr Ergebnis nicht wieder treffen.
const RULES = [
  [/Klicke auf den Boden – Joseph läuft dorthin\. Doppelklick: Er rennt\./g, 'Tippe auf den Boden – Joseph läuft dorthin. Doppelt tippen: Er rennt.'],
  [/Bewege die Maus durchs Abteil\. Wo sich der Zeiger verändert, gibt es etwas zu entdecken – der Name steht daneben\./g,
    'Fahre mit dem Finger übers Bild, ohne loszulassen: Wo es etwas zu entdecken gibt, steht der Name daneben.'],
  [/Fahr mit der Maus an den unteren Bildrand/g, 'Tippe an den unteren Bildrand'],
  [/ \(oben rechts oder Taste N\)/g, ' (oben rechts)'],
  [/Taste H \(oder „Tipp“ im Notizbuch\)/g, '„Tipp“ im Notizbuch'],
  [/der Lichtkegel folgt dem Mauszeiger/g, 'der Lichtkegel folgt deinem Finger'],
  [/wo der Mauszeiger ist/g, 'wo dein Finger ist'],
  [/Klicken oder N: schließen/g, 'Tippen: schließen'],
  [/Notizbuch \(N\)/g, 'Notizbuch'],
  [/Lösungsweg \(H\)/g, 'Lösungsweg'],
  [/mit gedrückter Maustaste /g, 'mit dem Finger '],
  [/Rechtsklick( oder Esc)?: zurück/g, '✕: zurück'],
  [/Rechtsklick zum Lesen/g, 'Lange drücken zum Lesen'],
  [/\(Rechtsklick/g, '(lange drücken'],
  [/Rechtsklick/g, 'Lange drücken'],
  [/Doppelklick/g, 'Doppelt tippen'],
  [/anklicken/g, 'antippen'],
  [/angeklickt/g, 'angetippt'],
  [/Klicke /g, 'Tippe '],
  [/klicke /g, 'tippe '],
  [/Klicken/g, 'Tippen'],
  [/klicken/g, 'tippen'],
  [/Klick: /g, 'Tippen: '],
  [/Klick auf /g, 'Tipp auf '],
];

const cache = new Map();

export function forTouch(text) {
  if (!touch.active || typeof text !== 'string') return text;
  let result = cache.get(text);
  if (result === undefined) {
    result = text;
    for (const [pattern, replacement] of RULES) result = result.replace(pattern, replacement);
    if (cache.size > 5000) cache.clear();
    cache.set(text, result);
  }
  return result;
}

// Leitet die Textausgabe aller Zeichenflächen über forTouch um (einmal beim Start aufrufen)
export function installTouchText() {
  const proto = CanvasRenderingContext2D.prototype;
  for (const name of ['fillText', 'strokeText', 'measureText']) {
    const original = proto[name];
    proto[name] = function (text, ...rest) {
      return original.call(this, forTouch(text), ...rest);
    };
  }
}
