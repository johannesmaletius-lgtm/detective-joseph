// Hintergrundmusik und Hintergrundgeräusche je Wagen (Dateien unter assets/music/ und assets/sfx/,
// erzeugt mit tools/music-generate.mjs).
//
// - ganz leise, damit sie keinen Satz stört
// - startet erst 2 s nach dem Intro-Text (game.playDoor → music.playWagon)
// - wird leiser, sobald jemand spricht, und fast unhörbar in wichtigen Gesprächen
//   (andere Figur spricht, Gesprächsauswahl, Zwischensequenz)
// - im Tunnel dumpfer
// Läuft über denselben Ton-Kanal wie das Fahrgeräusch: Taste M schaltet sie mit stumm.

import { COLORS } from '../ui/text.js';

const MUSIC_LEVEL = 0.16; // Grundlautstärke der Musik (vor dem Gesamtregler in trainSound.js)
const AMBIENCE_LEVEL = 0.3; // Grundlautstärke der Hintergrundgeräusche
const START_DELAY = 2; // Sekunden nach dem Intro
const FADE_IN = 4;
const CROSSFADE = 4; // Musikstücke laufen in Schleife; Anfang und Ende werden überblendet

// Wie leise es wird [Musik, Geräusche]
const DUCK = {
  important: [0.07, 0.35], // eine andere Figur spricht, Gesprächsauswahl, Zwischensequenz mit Text
  talking: [0.4, 0.7], // Joseph sagt etwas
  reading: [0.6, 0.8], // Brief, Karte, Nahansicht
  free: [1, 1],
};

// Hintergrundgeräusche: loop = läuft durchgehend; every = einzelnes Stück alle paar Sekunden;
// until = Merker im Drehbuch, ab dem es aufhört.
const AMBIENCE = {
  4: [{ file: 'speisewagen', gain: 0.8 }],
  11: [{ file: 'uhren', gain: 0.9 }],
  12: [{ file: 'moll-summt', gain: 1.6, every: [16, 28], until: 'mollPlayed' }],
  13: [{ file: 'kapelle', gain: 0.9 }],
  16: [{ file: 'funkraum', gain: 0.7 }],
  17: [{ file: 'gewaechshaus', gain: 0.9 }],
  21: [{ file: 'kessel', gain: 0.8 }],
  22: [{ file: 'lok', gain: 0.7 }],
  23: [{ file: 'wartungsgang', gain: 0.9 }],
};

// Schlussbild in Wagen 24: warme Musik und eine Stube mit Kaminfeuer
export const ENDING = { music: 'ende', ambience: [{ file: 'stube', gain: 0.9 }] };

export function wagonTrack(door) {
  return { music: `wagen-${String(door).padStart(2, '0')}`, ambience: AMBIENCE[door] ?? [] };
}

export class Music {
  constructor(trainSound) {
    this.sound = trainSound;
    this.files = {}; // Datei → Promise<ArrayBuffer>
    this.buffers = {}; // Datei → Promise<AudioBuffer>
    this.track = null; // { music, ambience, startAt }
    this.playing = null; // was gerade im Ton-Kanal läuft
  }

  url(name) {
    return name.startsWith('wagen-') || name === 'ende' ? `assets/music/${name}.mp3` : `assets/sfx/${name}.mp3`;
  }

  // Dateien schon mal laden (beim Öffnen des Wagens)
  preload({ music, ambience = [] }) {
    for (const name of [music, ...ambience.map((a) => a.file)]) {
      if (!name) continue;
      this.files[name] ??= fetch(this.url(name)).then((res) => (res.ok ? res.arrayBuffer() : null)).catch(() => null);
    }
  }

  buffer(name) {
    const context = this.sound.context;
    return (this.buffers[name] ??= (this.files[name] ?? Promise.resolve(null)).then((data) =>
      data ? context.decodeAudioData(data.slice(0)).catch(() => null) : null));
  }

  // Musik eines Wagens: startet erst nach `delay` Sekunden (und erst, wenn der Ton im Browser läuft)
  playWagon(door, delay = START_DELAY) {
    this.play(wagonTrack(door), delay);
  }

  play(track, delay = 0) {
    this.stop(1.5);
    this.preload(track);
    this.track = { ...track, startAt: performance.now() + delay * 1000 };
  }

  // Leise ausblenden
  stop(seconds = 2) {
    this.track = null;
    const playing = this.playing;
    this.playing = null;
    if (!playing) return;
    const now = this.sound.context.currentTime;
    playing.bus.gain.cancelScheduledValues(now);
    playing.bus.gain.setValueAtTime(playing.bus.gain.value, now);
    playing.bus.gain.linearRampToValueAtTime(0, now + seconds);
    clearTimeout(playing.timer);
    setTimeout(() => {
      for (const source of playing.sources) try { source.stop(); } catch { /* schon aus */ }
      playing.bus.disconnect();
    }, seconds * 1000 + 100);
  }

  // In jedem Bild: starten, wenn es so weit ist, und die Lautstärke ans Geschehen anpassen
  update(dt, game) {
    const context = this.sound.context;
    if (!context || context.state !== 'running') return;
    if (this.track && !this.playing && performance.now() >= this.track.startAt) this.begin(this.track);
    const playing = this.playing;
    if (!playing) return;
    const now = context.currentTime;

    // Musik in Schleife: kurz vor dem Ende das nächste Mal überblendet starten
    if (playing.loop && now >= playing.loop.end - CROSSFADE - 0.5) this.loopMusic(playing, playing.loop.end - CROSSFADE);

    // einzelne Geräusche ab und zu (Herr Moll summt …)
    for (const part of playing.every) {
      if (part.until && game.story?.flags[part.until]) continue;
      if (now < part.next) continue;
      this.once(playing, part, now);
    }

    const [musicDuck, ambienceDuck] = DUCK[mood(game)];
    playing.music.gain.setTargetAtTime(MUSIC_LEVEL * musicDuck, now, musicDuck < 0.2 ? 0.25 : 0.6);
    playing.ambience.gain.setTargetAtTime(AMBIENCE_LEVEL * ambienceDuck, now, 0.6);
    const tunnel = this.sound.inTunnel;
    playing.filter.frequency.setTargetAtTime(tunnel ? 650 : 18000, now, 0.4);
  }

  begin(track) {
    const context = this.sound.context;
    const bus = context.createGain(); // zum Ein- und Ausblenden des Ganzen
    bus.gain.setValueAtTime(0, context.currentTime);
    bus.gain.linearRampToValueAtTime(1, context.currentTime + FADE_IN);
    const filter = context.createBiquadFilter(); // im Tunnel dumpf
    filter.type = 'lowpass';
    filter.frequency.value = 18000;
    bus.connect(filter).connect(this.sound.master);
    const music = context.createGain();
    music.gain.value = MUSIC_LEVEL * 0.07;
    music.connect(bus);
    const ambience = context.createGain();
    ambience.gain.value = AMBIENCE_LEVEL * 0.35;
    ambience.connect(bus);
    const playing = { bus, filter, music, ambience, sources: new Set(), loop: null, every: [] };
    this.playing = playing;

    if (track.music) {
      this.buffer(track.music).then((buffer) => {
        if (!buffer || this.playing !== playing) return;
        playing.loop = { buffer, end: 0 };
        this.loopMusic(playing, context.currentTime);
      });
    }
    for (const part of track.ambience ?? []) {
      this.buffer(part.file).then((buffer) => {
        if (!buffer || this.playing !== playing) return;
        if (part.every) {
          playing.every.push({ ...part, buffer, next: context.currentTime + 3 + Math.random() * 4 });
          return;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const level = context.createGain();
        level.gain.value = part.gain ?? 1;
        source.connect(level).connect(playing.ambience);
        source.start(context.currentTime, Math.random() * buffer.duration);
        playing.sources.add(source);
      });
    }
  }

  // Ein Durchlauf des Musikstücks, mit weichem Anfang und Ende
  loopMusic(playing, at) {
    const context = this.sound.context;
    const { buffer } = playing.loop;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const level = context.createGain();
    const end = at + buffer.duration;
    level.gain.setValueAtTime(0, at);
    level.gain.linearRampToValueAtTime(1, at + CROSSFADE);
    level.gain.setValueAtTime(1, end - CROSSFADE);
    level.gain.linearRampToValueAtTime(0, end);
    source.connect(level).connect(playing.music);
    source.start(at);
    playing.sources.add(source);
    source.onended = () => playing.sources.delete(source);
    playing.loop.end = end;
  }

  once(playing, part, now) {
    const context = this.sound.context;
    const source = context.createBufferSource();
    source.buffer = part.buffer;
    const level = context.createGain();
    level.gain.value = part.gain ?? 1;
    source.connect(level).connect(playing.ambience);
    source.start(now);
    playing.sources.add(source);
    source.onended = () => playing.sources.delete(source);
    const [min, max] = part.every;
    part.next = now + part.buffer.duration + min + Math.random() * (max - min);
  }
}

// Was gerade passiert – danach richtet sich, wie leise die Musik wird
function mood(game) {
  const line = game.speech.line;
  const story = game.story;
  if (game.views.dialogue?.isOpen) return 'important';
  if (line && line.color !== COLORS.joseph) return 'important'; // eine andere Figur oder der Lautsprecher
  if (line && story?.inCutscene) return 'important';
  if (line || game.voices.playing) return 'talking';
  if (game.view || game.overlay.card) return 'reading';
  return 'free';
}
