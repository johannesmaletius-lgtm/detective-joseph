// Lichtsignale: Das rote Licht auf dem Turm blinkt eine Ziffer im Morsecode – immer wieder.
//
//   const signal = morseSignal('3', 0.34);      // Ziffer(n) und Länge eines kurzen Zeichens in Sekunden
//   signal.level(time)                          // 0 = dunkel … 1 = hell
//   signal.marksUntil(time)                     // z. B. ['kurz', 'kurz'] – was in dieser Runde schon geblinkt hat
//
// Kurz = 1 Einheit, lang = 3 Einheiten, dazwischen 1 Einheit Pause, am Ende eine lange Pause.

export const MORSE_DIGITS = {
  1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....',
  6: '-....', 7: '--...', 8: '---..', 9: '----.', 0: '-----',
};

const PAUSE_UNITS = 9; // Pause, bevor das Signal von vorn beginnt

export function morseSignal(digits, unit = 0.34) {
  const flashes = []; // { start, end, long }
  let t = 0;
  for (const digit of String(digits)) {
    for (const mark of MORSE_DIGITS[digit]) {
      const length = (mark === '-' ? 3 : 1) * unit;
      flashes.push({ start: t, end: t + length, long: mark === '-' });
      t += length + unit;
    }
    t += 2 * unit; // etwas mehr Abstand zwischen zwei Ziffern
  }
  const duration = t + PAUSE_UNITS * unit;

  return {
    digits: String(digits),
    flashes,
    duration,
    // Stelle im Ablauf (Sekunden seit Beginn des Signals)
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
    marksUntil(time) {
      const p = this.phase(time);
      return flashes.filter((flash) => flash.end <= p).map((flash) => (flash.long ? 'lang' : 'kurz'));
    },
  };
}
