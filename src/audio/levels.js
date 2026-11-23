// Lautstärken aus dem Einstellungsmenü (src/ui/settings.js), im Browser gespeichert.
//   sound   Ton überhaupt an (Taste M)
//   music   Musik an
//   voices, musicVolume, effects   0 … 1

const KEY = 'detective-joseph-einstellungen';
const DEFAULTS = { sound: true, music: true, voices: 1, musicVolume: 1, effects: 1 };

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

export const levels = load();

export function saveLevels() {
  try {
    localStorage.setItem(KEY, JSON.stringify(levels));
  } catch { /* privates Fenster: dann eben nicht gespeichert */ }
}

// Tatsächliche Musiklautstärke (0, wenn die Musik aus ist)
export function musicLevel() {
  return levels.music ? levels.musicVolume : 0;
}
