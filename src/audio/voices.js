// Gesprochene Sätze der Figuren (Tondateien unter assets/voices/, erzeugt mit tools/voice-generate.mjs).
// assets/voices/manifest.json ordnet jedem Satz seine Datei zu. Sätze ohne Datei bleiben stumm.
// In der Web-Fassung (tools/build-web.mjs) liegen die Sätze einer Figur je Wagen in einer Datei hintereinander;
// dann steht im Manifest { file, start, end } (Sekunden) statt nur der Datei.

import { levels } from './levels.js';

const VOLUME = 1;
const REACT_PAUSE = 3000; // ms zwischen zwei Lauten

export class Voices {
  constructor(trainSound) {
    this.trainSound = trainSound; // für den Ton-aus-Schalter
    this.files = {};
    this.audio = null;
    this.timer = null;
    this.sprites = {}; // Datei → Audio (Web-Fassung: eine Datei pro Figur)
    fetch('assets/voices/manifest.json', { cache: 'no-cache' }) // immer die neueste Liste
      .then((res) => (res.ok ? res.json() : {}))
      .then((files) => {
        this.files = files;
        // Web-Fassung: gemeinsame Dateien (Laute …) gleich laden, die eines Wagens erst mit dem Wagen (preloadWagon)
        for (const file of this.spriteFiles()) if (!/-w\d+\./.test(file)) this.sprite(file);
        if (this.wagon) this.preloadWagon(this.wagon);
      })
      .catch(() => {});
  }

  // Läuft gerade ein Satz?
  get playing() {
    const audio = this.audio;
    if (!audio) return false;
    if (audio.paused === undefined) return true; // Web-Fassung: Datei lädt noch
    return !audio.paused && !audio.ended;
  }

  // Ein kurzer Laut von Joseph (tools/joseph-reactions.mjs): solved, think, mistake, wow, scared, tired.
  // chance = Wahrscheinlichkeit; nie über einen laufenden Satz und höchstens alle paar Sekunden.
  react(kind, chance = 1) {
    if (this.trainSound.muted || this.playing || Math.random() > chance) return;
    const now = performance.now();
    if (now - (this.reactedAt ?? -1e9) < REACT_PAUSE) return;
    const keys = Object.keys(this.files).filter((key) => key.startsWith(`~${kind}~`));
    const fresh = keys.filter((key) => key !== this.lastReaction);
    const key = (fresh.length ? fresh : keys)[Math.floor(Math.random() * (fresh.length || keys.length))];
    if (!key) return;
    this.reactedAt = now;
    this.lastReaction = key;
    this.play(key);
  }

  spriteFiles() {
    return new Set(Object.values(this.files).map((e) => e.file).filter(Boolean));
  }

  // Web-Fassung: die Sätze eines Wagens im Hintergrund laden (assets/voices/<figur>-w<nr>.<hash>.mp3)
  preloadWagon(number) {
    this.wagon = number;
    for (const file of this.spriteFiles()) if (file.includes(`-w${number}.`)) this.sprite(file);
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
    audio.volume = VOLUME * levels.voices;
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
      audio.volume = VOLUME * levels.voices;
      audio.currentTime = start;
      audio.play().catch(() => {});
      clearTimeout(this.timer);
      this.timer = setTimeout(() => { if (this.audio === audio) this.stop(); }, (end - start) * 1000 + 60);
    });
    return Promise.resolve(end - start);
  }

  // Regler „Stimmen“ geändert: laufenden Satz gleich anpassen
  applyLevels() {
    if (this.audio && 'volume' in this.audio) this.audio.volume = VOLUME * levels.voices;
  }

  stop() {
    clearTimeout(this.timer);
    if (!this.audio) return;
    this.audio.pause?.();
    this.audio = null;
  }
}
