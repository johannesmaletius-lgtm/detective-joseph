// Lichtsignale: Das rote Licht auf dem Turm blinkt ein Wort im Morsealphabet – immer wieder.
//
//   const signal = morseSignal('DREI', 0.3);    // Text (Buchstaben und Ziffern) und Länge eines kurzen Zeichens in Sekunden
//   signal.level(time)                          // 0 = dunkel … 1 = hell
//   signal.phase(time)                          // Sekunden seit Beginn des Signals
//
// Wie beim echten Morsen: kurz = 1 Einheit, lang = 3 Einheiten, zwischen zwei Zeichen eines Buchstabens
// 1 Einheit Pause, zwischen zwei Buchstaben 3 Einheiten, am Ende eine lange Pause, dann von vorn.
// Wer mitschreiben will, muss also auch auf die Pausen achten.

export const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
  6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----',
};

const LETTER_GAP = 3;  // Einheiten Pause zwischen zwei Buchstaben
const PAUSE_UNITS = 12; // Pause, bevor das Signal von vorn beginnt

// Text → Morsezeichen, Buchstaben durch " / " getrennt, z. B. 'DREI' → '-.. / .-. / . / ..'
export function toMorse(text) {
  return [...String(text).toUpperCase()].filter((letter) => MORSE[letter]).map((letter) => MORSE[letter]).join(' / ');
}

export function morseSignal(text, unit = 0.3) {
  const letters = [...String(text).toUpperCase()].filter((letter) => MORSE[letter]);
  const flashes = []; // { start, end, long, letter }
  let t = 0;
  letters.forEach((letter, index) => {
    for (const mark of MORSE[letter]) {
      const length = (mark === '-' ? 3 : 1) * unit;
      flashes.push({ start: t, end: t + length, long: mark === '-', letter: index });
      t += length + unit;
    }
    t += (LETTER_GAP - 1) * unit;
  });
  const duration = t + PAUSE_UNITS * unit;

  return {
    text: letters.join(''),
    morse: toMorse(text),
    flashes,
    duration,
    phase: (time) => ((time % duration) + duration) % duration,
    level(time) {
      const p = this.phase(time);
      for (const flash of flashes) {
        if (p >= flash.start && p < flash.end) {
          const edge = Math.min(p - flash.start, flash.end - p);
          return Math.min(1, edge / 0.05); // ganz kurz weich an- und ausgehen
        }
      }
      return 0;
    },
  };
}
