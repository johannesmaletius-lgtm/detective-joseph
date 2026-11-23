// Spielstand von Detective Joseph – liegt im Browser (localStorage) und bleibt auch nach dem Schließen erhalten.
//
// Gespeichert wird pro geschaffter Tür:
//   items    Gegenstände, die Joseph in den nächsten Wagen mitnimmt (nur solche mit keep: true, siehe items.js)
//   notes    seine Notizen aus diesem Wagen – sie stehen in den späteren Wagen weiter im Notizbuch
//   minutes  wie lange es gedauert hat
//
// Ein Wagen, den man mittendrin verlässt, beginnt beim nächsten Mal von vorn (wie die Zeitschleife).
// Klappt das Speichern nicht (z. B. im privaten Fenster), läuft das Spiel trotzdem – es merkt sich dann nur nichts.

const KEY = 'detective-joseph:ringbahn';

export class SaveGame {
  constructor() {
    this.data = { done: {} };
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (stored && typeof stored.done === 'object') this.data = stored;
    } catch {
      // nichts gespeichert oder nicht lesbar → leerer Spielstand
    }
  }

  isDone(door) {
    return Boolean(this.data.done[door]);
  }

  get doneCount() {
    return Object.keys(this.data.done).length;
  }

  // Tür geschafft: merken, was Joseph mitnimmt
  complete(door, { items = [], notes = [], minutes = 0 } = {}) {
    this.data.done[door] = { items, notes, minutes, at: new Date().toISOString() };
    this.write();
  }

  // Was Joseph in Tür `door` mitbringt: die Gegenstände der letzten geschafften Tür davor
  // und alle Notizen der geschafften Türen davor (der Reihe nach)
  carriedInto(door) {
    const earlier = Object.keys(this.data.done).map(Number).filter((d) => d < door).sort((a, b) => a - b);
    const last = earlier.at(-1);
    return {
      items: last ? [...this.data.done[last].items] : [],
      notes: earlier.flatMap((d) => this.data.done[d].notes.map((text) => ({ door: d, text }))),
    };
  }

  reset() {
    this.data = { done: {} };
    this.write();
  }

  write() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Speichern nicht möglich – das Spiel läuft trotzdem weiter
    }
  }
}
