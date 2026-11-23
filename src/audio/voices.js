// Gesprochene Sätze der Figuren (Tondateien unter assets/voices/, erzeugt mit tools/voice-generate.mjs).
// assets/voices/manifest.json ordnet jedem Satz seine Datei zu. Sätze ohne Datei bleiben stumm.
// In der Web-Fassung (tools/build-web.mjs) liegen alle Sätze einer Figur in einer Datei hintereinander;
// dann steht im Manifest { file, start, end } (Sekunden) statt nur der Datei.

const VOLUME = 1;

export class Voices {
  constructor(trainSound) {
    this.trainSound = trainSound; // für den Ton-aus-Schalter
    this.files = {};
    this.audio = null;
    this.timer = null;
    this.sprites = {}; // Datei → Audio (Web-Fassung: eine Datei pro Figur)
    fetch('assets/voices/manifest.json')
      .then((res) => (res.ok ? res.json() : {}))
      .then((files) => {
        this.files = files;
        // Web-Fassung: die Dateien der Figuren schon im Hintergrund laden
        for (const entry of new Set(Object.values(files).map((e) => e.file).filter(Boolean))) this.sprite(entry);
      })
      .catch(() => {});
  }

  has(text) {
    return Boolean(this.files[text]);
  }

  // Spielt den Satz ab. Ergebnis: Promise mit der Länge in Sekunden (oder null, wenn es keine Datei gibt)
  play(text) {
    this.stop();
    const entry = this.files[text];
    if (!entry || this.trainSound.muted) return Promise.resolve(null);
    if (typeof entry === 'object') return this.playPart(entry);
    const audio = new Audio(entry);
    audio.volume = VOLUME;
    this.audio = audio;
    const length = new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', () => resolve(audio.duration), { once: true });
      audio.addEventListener('error', () => resolve(null), { once: true });
    });
    audio.play().catch(() => {});
    return length;
  }

  // Ein Stück aus einer langen Datei abspielen (Web-Fassung). Die Datei wird einmal ganz geladen
  // (als blob:-Adresse), damit das Springen an die Startzeit auf jedem Server klappt.
  sprite(file) {
    return (this.sprites[file] ??= fetch(file)
      .then((res) => res.blob())
      .then((blob) => {
        const audio = new Audio(URL.createObjectURL(blob));
        audio.preload = 'auto';
        return new Promise((resolve) => {
          if (audio.readyState >= 1) resolve(audio);
          else audio.addEventListener('loadedmetadata', () => resolve(audio), { once: true });
        });
      })
      .catch(() => null));
  }

  playPart({ file, start, end }) {
    const token = (this.audio = {}); // Platzhalter, bis die Datei da ist
    this.sprite(file).then((audio) => {
      if (!audio || this.audio !== token) return;
      this.audio = audio;
      audio.volume = VOLUME;
      audio.currentTime = start;
      audio.play().catch(() => {});
      clearTimeout(this.timer);
      this.timer = setTimeout(() => { if (this.audio === audio) this.stop(); }, (end - start) * 1000 + 60);
    });
    return Promise.resolve(end - start);
  }

  stop() {
    clearTimeout(this.timer);
    if (!this.audio) return;
    this.audio.pause?.();
    this.audio = null;
  }
}
