// Gesprochene Sätze der Figuren (Tondateien unter assets/voices/, erzeugt mit tools/voice-generate.mjs).
// assets/voices/manifest.json ordnet jedem Satz seine Datei zu. Sätze ohne Datei bleiben stumm.

const VOLUME = 1;

export class Voices {
  constructor(trainSound) {
    this.trainSound = trainSound; // für den Ton-aus-Schalter
    this.files = {};
    this.audio = null;
    fetch('assets/voices/manifest.json')
      .then((res) => (res.ok ? res.json() : {}))
      .then((files) => { this.files = files; })
      .catch(() => {});
  }

  has(text) {
    return Boolean(this.files[text]);
  }

  // Spielt den Satz ab. Ergebnis: Promise mit der Länge in Sekunden (oder null, wenn es keine Datei gibt)
  play(text) {
    this.stop();
    const file = this.files[text];
    if (!file || this.trainSound.muted) return Promise.resolve(null);
    const audio = new Audio(file);
    audio.volume = VOLUME;
    this.audio = audio;
    const length = new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', () => resolve(audio.duration), { once: true });
      audio.addEventListener('error', () => resolve(null), { once: true });
    });
    audio.play().catch(() => {});
    return length;
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio = null;
  }
}
