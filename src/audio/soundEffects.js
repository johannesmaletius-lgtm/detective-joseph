// Kurze Geräusche für die Geschichte – im Browser erzeugt (Web Audio), ohne Sounddateien.
// Sie benutzen denselben Ton-Kanal wie das Fahrgeräusch (trainSound.js): Taste M schaltet alles
// stumm, und im Tunnel hallen sie mit.
//
//   effects.play('pickup')
//
// Später lassen sich hier echte Sounddateien einbauen.

export class SoundEffects {
  constructor(trainSound) {
    this.sound = trainSound;
  }

  play(name, ...args) {
    const context = this.sound.context;
    if (!context || context.state !== 'running') return;
    this.onPlay?.(name);
    EFFECTS[name]?.(this, context.currentTime, ...args);
  }

  // Ein einzelner Ton, z. B. eine Klaviertaste oder ein Morsepiepen (ab Wagen 9)
  //   effects.note(440, { duration: 0.6, type: 'triangle', gain: 0.12, delay: 0 })
  note(frequency, { duration = 0.6, type = 'triangle', gain = 0.12, delay = 0 } = {}) {
    const context = this.sound.context;
    if (!context || context.state !== 'running') return;
    const t = context.currentTime + delay;
    this.tone(t, { frequency, type, gain, duration });
    if (type === 'triangle') this.tone(t, { frequency: frequency * 2, type: 'sine', gain: gain * 0.25, duration: duration * 0.6 });
  }

  // Gefiltertes Rauschen: Rascheln, Klicken, Zischen, Poltern
  noise(time, { duration = 0.1, type = 'bandpass', frequency = 1000, q = 1, gain = 0.3, attack = 0.004, pan = 0, brown = false }) {
    const context = this.sound.context;
    const source = context.createBufferSource();
    source.buffer = brown ? this.sound.brownNoise : this.sound.whiteNoise;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const level = envelope(context, time, gain, attack, duration);
    source.connect(filter).connect(level).connect(this.sound.output(pan));
    const length = attack + duration + 0.05;
    source.loop = length > source.buffer.duration;
    source.start(time, Math.random() * Math.max(0, source.buffer.duration - length), length);
  }

  // Ein Ton, der optional von einer Tonhöhe zur anderen gleitet
  tone(time, { frequency = 440, to = frequency, type = 'sine', duration = 0.2, gain = 0.2, attack = 0.005, pan = 0 }) {
    const context = this.sound.context;
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(to, time + attack + duration);
    const level = envelope(context, time, gain, attack, duration);
    oscillator.connect(level).connect(this.sound.output(pan));
    oscillator.start(time);
    oscillator.stop(time + attack + duration + 0.05);
  }
}

// Die einzelnen Geräusche. t = Startzeit.
const EFFECTS = {
  // Etwas einstecken: Rascheln und ein weiches "Plopp"
  pickup(fx, t) {
    fx.noise(t, { frequency: 3200, q: 0.8, gain: 0.16, duration: 0.12 });
    fx.tone(t + 0.04, { frequency: 520, to: 780, type: 'triangle', gain: 0.12, duration: 0.14 });
  },
  // Rädchen am Zahlenschloss
  wheel(fx, t) {
    fx.noise(t, { frequency: 4200, q: 4, gain: 0.25, duration: 0.03 });
  },
  // Schloss bleibt zu: metallisches Rütteln
  locked(fx, t) {
    for (let i = 0; i < 3; i++) fx.noise(t + i * 0.07, { frequency: 2400, q: 6, gain: 0.3, duration: 0.05 });
    fx.tone(t, { frequency: 180, to: 120, type: 'square', gain: 0.05, duration: 0.2 });
  },
  // Schloss springt auf
  unlock(fx, t) {
    fx.noise(t, { frequency: 1800, q: 5, gain: 0.4, duration: 0.06 });
    fx.tone(t + 0.02, { frequency: 900, to: 1400, type: 'triangle', gain: 0.12, duration: 0.25 });
  },
  // Schwere Tür gleitet auf
  door(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 500, gain: 0.5, attack: 0.3, duration: 1.2, brown: true });
    fx.noise(t + 1.3, { frequency: 700, q: 3, gain: 0.4, duration: 0.15 });
  },
  // Schritte im Dunkeln, die von links nach rechts an Joseph vorbeigehen
  footsteps(fx, t) {
    for (let i = 0; i < 6; i++) {
      const pan = -0.8 + (i / 5) * 1.6;
      fx.noise(t + i * 0.36, { type: 'lowpass', frequency: 320, gain: 0.55, duration: 0.09, pan, brown: true });
      fx.noise(t + i * 0.36 + 0.02, { frequency: 1500, q: 2, gain: 0.06, duration: 0.05, pan });
    }
  },
  // Klick einer Türklinke
  latch(fx, t) {
    fx.noise(t, { frequency: 2000, q: 8, gain: 0.35, duration: 0.04, pan: 0.2 });
    fx.noise(t + 0.12, { frequency: 900, q: 5, gain: 0.3, duration: 0.06, pan: 0.2 });
  },
  // Licht geht aus: elektrisches Klacken, das Summen erstirbt
  lightsOff(fx, t) {
    fx.noise(t, { frequency: 900, q: 3, gain: 0.35, duration: 0.05 });
    fx.tone(t, { frequency: 120, to: 40, type: 'sawtooth', gain: 0.06, duration: 0.6 });
  },
  // Licht geht wieder an: kurzes Summen
  lightsOn(fx, t) {
    fx.tone(t, { frequency: 60, to: 120, type: 'sawtooth', gain: 0.05, attack: 0.1, duration: 0.5 });
    fx.noise(t + 0.18, { frequency: 900, q: 3, gain: 0.2, duration: 0.04 });
  },
  // Der Bildschirm springt an: Rauschen und Brummen
  tv(fx, t) {
    fx.noise(t, { frequency: 5000, q: 0.5, gain: 0.18, attack: 0.02, duration: 2.2, pan: 0.4 });
    fx.tone(t, { frequency: 50, to: 50, type: 'sawtooth', gain: 0.05, attack: 0.05, duration: 2.2, pan: 0.4 });
  },
  // Knistern aus dem Lautsprecher
  speaker(fx, t) {
    for (let i = 0; i < 14; i++) fx.noise(t + i * 0.11 + Math.random() * 0.05, { frequency: 2600, q: 1.5, gain: 0.07 + Math.random() * 0.08, duration: 0.04, pan: -0.4 });
  },
  // Notizbuch aufschlagen: Papier wischt
  page(fx, t) {
    fx.noise(t, { frequency: 2600, q: 0.7, gain: 0.12, attack: 0.05, duration: 0.18 });
  },
  // Zwei Dinge zusammenstecken
  combine(fx, t) {
    fx.noise(t, { frequency: 2500, q: 6, gain: 0.3, duration: 0.04 });
    fx.noise(t + 0.15, { frequency: 1600, q: 6, gain: 0.3, duration: 0.05 });
  },
  // Metallklappe aufschrauben
  screw(fx, t) {
    for (let i = 0; i < 4; i++) fx.noise(t + i * 0.12, { frequency: 3000 + i * 200, q: 5, gain: 0.18, duration: 0.05 });
    fx.noise(t + 0.6, { frequency: 1200, q: 4, gain: 0.3, duration: 0.08 });
  },
  // Kabelstück im Verteilerkasten drehen: trockenes Klacken
  rotate(fx, t) {
    fx.noise(t, { frequency: 1900, q: 7, gain: 0.3, duration: 0.035 });
    fx.noise(t + 0.03, { frequency: 700, q: 3, gain: 0.16, duration: 0.05 });
  },
  // Strom fließt: Summen, das hochläuft, dann ein Relais
  power(fx, t) {
    fx.tone(t, { frequency: 70, to: 220, type: 'sawtooth', gain: 0.07, attack: 0.05, duration: 0.7 });
    fx.tone(t + 0.1, { frequency: 440, to: 880, type: 'sine', gain: 0.06, attack: 0.05, duration: 0.6 });
    fx.noise(t + 0.75, { frequency: 1500, q: 6, gain: 0.35, duration: 0.05 });
  },
  // Puzzleteil rastet ein: Papier klatscht auf den Tisch
  snap(fx, t) {
    fx.noise(t, { frequency: 1400, q: 1.2, gain: 0.3, duration: 0.06 });
    fx.noise(t, { type: 'lowpass', frequency: 260, gain: 0.3, duration: 0.07, brown: true });
  },
  // Papier raschelt (Fetzen aufheben, Heft aufschlagen)
  paper(fx, t) {
    fx.noise(t, { frequency: 3400, q: 0.6, gain: 0.14, attack: 0.03, duration: 0.14 });
    fx.noise(t + 0.13, { frequency: 2400, q: 0.8, gain: 0.1, attack: 0.03, duration: 0.16 });
  },
  // Kette rasselt
  chain(fx, t) {
    for (let i = 0; i < 7; i++) fx.noise(t + i * 0.06 + Math.random() * 0.03, { frequency: 3200 + Math.random() * 1800, q: 9, gain: 0.16, duration: 0.05, pan: -0.5 });
  },
  // Deckel oder Kiste wird aufgehebelt: Holz knarzt
  creak(fx, t) {
    fx.tone(t, { frequency: 150, to: 310, type: 'sawtooth', gain: 0.06, attack: 0.05, duration: 0.4 });
    fx.noise(t + 0.4, { type: 'lowpass', frequency: 420, gain: 0.4, duration: 0.09, brown: true });
  },
  // Schlüssel dreht sich im Schloss
  key(fx, t) {
    fx.noise(t, { frequency: 3600, q: 8, gain: 0.2, duration: 0.03 });
    fx.noise(t + 0.16, { frequency: 2100, q: 7, gain: 0.28, duration: 0.04 });
    fx.noise(t + 0.3, { frequency: 900, q: 4, gain: 0.3, duration: 0.07 });
  },
  // Rätsel gelöst: drei helle Töne nach oben
  success(fx, t) {
    [523, 659, 784].forEach((frequency, i) => {
      fx.tone(t + i * 0.11, { frequency, type: 'triangle', gain: 0.11, duration: 0.32 });
      fx.tone(t + i * 0.11, { frequency: frequency * 2, type: 'sine', gain: 0.04, duration: 0.22 });
    });
  },
  // ---------------------------------------------------------------- Wagen 2 bis 4
  // Tischglocke: „Ding!“
  bell(fx, t) {
    fx.tone(t, { frequency: 2093, type: 'sine', gain: 0.16, duration: 1.4 });
    fx.tone(t, { frequency: 2637, type: 'sine', gain: 0.07, duration: 1.1 });
    fx.tone(t, { frequency: 4186, type: 'sine', gain: 0.03, duration: 0.6 });
  },
  // Gläser stoßen an
  clink(fx, t) {
    for (const [delay, frequency, pan] of [[0, 3100, -0.3], [0.05, 3500, 0.2], [0.13, 2900, 0.4]]) {
      fx.tone(t + delay, { frequency, type: 'sine', gain: 0.07, duration: 0.5, pan });
      fx.tone(t + delay, { frequency: frequency * 1.51, type: 'sine', gain: 0.03, duration: 0.3, pan });
    }
  },
  // Jemand ringt nach Luft – und etwas fällt um
  gasp(fx, t) {
    fx.noise(t, { frequency: 900, q: 1.5, gain: 0.18, attack: 0.05, duration: 0.5, pan: 0.4 });
    fx.noise(t + 0.9, { type: 'lowpass', frequency: 300, gain: 0.5, duration: 0.2, brown: true, pan: 0.4 });
    fx.tone(t + 0.95, { frequency: 2600, to: 2400, type: 'sine', gain: 0.05, duration: 0.4, pan: 0.4 });
  },
  // Ein Takt Walzer (3/4): Bass – Akkord – Akkord, darüber die Melodie. bar = Nummer des Takts
  waltz(fx, t, bar = 0) {
    const beat = 0.42;
    const chords = [[196, 247, 294], [196, 247, 294], [220, 262, 330], [147, 185, 220]];
    const bass = [98, 98, 110, 73];
    const melody = [[392, 494, 587], [523, 494, 440], [440, 523, 659], [587, 494, 392]];
    const i = bar % 4;
    fx.tone(t, { frequency: bass[i], type: 'triangle', gain: 0.1, duration: 0.35, pan: -0.5 });
    for (const beatIndex of [1, 2]) {
      for (const frequency of chords[i]) fx.tone(t + beatIndex * beat, { frequency, type: 'triangle', gain: 0.03, duration: 0.18, pan: -0.5 });
    }
    melody[i].forEach((frequency, n) => fx.tone(t + n * beat, { frequency, type: 'square', gain: 0.025, duration: 0.34, pan: -0.5 }));
    fx.noise(t, { frequency: 6000, q: 0.5, gain: 0.02, duration: beat * 3, pan: -0.5 }); // Knistern der Platte
  },
  // Ein Takt Marschmusik (laut und schief)
  march(fx, t, bar = 0) {
    const beat = 0.3;
    const melody = [[523, 523, 659, 523], [784, 659, 523, 392], [440, 494, 523, 587], [659, 587, 523, 523]];
    melody[bar % 4].forEach((frequency, n) => {
      fx.tone(t + n * beat, { frequency: frequency * 1.012, type: 'sawtooth', gain: 0.03, duration: 0.2, pan: -0.5 });
      if (n % 2 === 0) fx.noise(t + n * beat, { type: 'lowpass', frequency: 200, gain: 0.35, duration: 0.1, brown: true, pan: -0.5 });
    });
  },
  // Rollladen rasselt herunter oder hoch
  shutter(fx, t) {
    for (let i = 0; i < 9; i++) fx.noise(t + i * 0.045, { frequency: 1800 + i * 90, q: 3, gain: 0.12, duration: 0.03, pan: -0.4 });
    fx.noise(t + 0.45, { type: 'lowpass', frequency: 500, gain: 0.3, duration: 0.07, brown: true, pan: -0.4 });
  },
  // Schritte im Takt: jemand tanzt in der Küche
  stomp(fx, t) {
    for (const delay of [0, 0.42, 0.84]) fx.noise(t + delay, { type: 'lowpass', frequency: 180, gain: delay ? 0.12 : 0.22, duration: 0.07, brown: true, pan: -0.5 });
  },
  // Die Notbremse: Kreischen der Räder, ein Ruck
  brake(fx, t) {
    fx.tone(t, { frequency: 2200, to: 1500, type: 'sawtooth', gain: 0.05, attack: 0.1, duration: 2.6 });
    fx.tone(t, { frequency: 3300, to: 2500, type: 'square', gain: 0.02, attack: 0.1, duration: 2.4 });
    fx.noise(t, { frequency: 2500, q: 2, gain: 0.12, attack: 0.1, duration: 2.6 });
    fx.noise(t + 0.4, { type: 'lowpass', frequency: 160, gain: 0.6, duration: 0.5, brown: true });
  },
  // Etwas fällt herunter (Hutschachtel)
  thud(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 240, gain: 0.55, duration: 0.18, brown: true });
    fx.noise(t + 0.02, { frequency: 1200, q: 1, gain: 0.1, duration: 0.08 });
  },
  // leises Schnarchen
  snore(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 260, gain: 0.12, attack: 0.5, duration: 0.9, brown: true, pan: -0.5 });
    fx.tone(t + 0.1, { frequency: 70, to: 62, type: 'sawtooth', gain: 0.025, attack: 0.4, duration: 0.9, pan: -0.5 });
  },
  // Rollo schnellt hoch
  blind(fx, t) {
    for (let i = 0; i < 6; i++) fx.noise(t + i * 0.035, { frequency: 2600 - i * 200, q: 2, gain: 0.12, duration: 0.03, pan: 0.5 });
    fx.noise(t + 0.24, { frequency: 900, q: 3, gain: 0.25, duration: 0.05, pan: 0.5 });
  },
  // Spiegel / etwas Magisches erscheint
  shimmer(fx, t) {
    [1319, 1568, 1976, 2637].forEach((frequency, i) => fx.tone(t + i * 0.09, { frequency, type: 'sine', gain: 0.05, duration: 0.9 }));
  },
  // Papagei: „Krah!“
  squawk(fx, t) {
    fx.tone(t, { frequency: 1500, to: 2400, type: 'sawtooth', gain: 0.05, duration: 0.08, pan: 0.5 });
    fx.tone(t + 0.09, { frequency: 2300, to: 1300, type: 'sawtooth', gain: 0.06, duration: 0.18, pan: 0.5 });
    fx.noise(t, { frequency: 3000, q: 2, gain: 0.08, duration: 0.25, pan: 0.5 });
  },
  // Flügelschlagen
  flutter(fx, t) {
    for (let i = 0; i < 8; i++) fx.noise(t + i * 0.07, { frequency: 1400, q: 0.8, gain: 0.1, duration: 0.04, pan: 0.5 });
  },
  // Klopfen an Holz
  knock(fx, t) {
    for (const delay of [0, 0.22, 0.44]) {
      fx.noise(t + delay, { frequency: 700, q: 3, gain: 0.35, duration: 0.05 });
      fx.noise(t + delay, { type: 'lowpass', frequency: 220, gain: 0.3, duration: 0.06, brown: true });
    }
  },
  // Antwort von drinnen: dumpfer
  knockBack(fx, t) {
    for (const delay of [0, 0.3]) fx.noise(t + delay, { type: 'lowpass', frequency: 260, gain: 0.35, duration: 0.07, brown: true, pan: 0.5 });
  },
  // Schwere Schiebetür
  slide(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 400, gain: 0.3, attack: 0.1, duration: 1.2, brown: true });
    fx.noise(t, { frequency: 1600, q: 4, gain: 0.05, attack: 0.1, duration: 1.1 });
    fx.noise(t + 1.25, { type: 'lowpass', frequency: 200, gain: 0.5, duration: 0.15, brown: true });
  },
  // Etwas Wichtiges entdeckt: ein tiefer, unheimlicher Ton
  dread(fx, t) {
    fx.tone(t, { frequency: 98, to: 92, type: 'sawtooth', gain: 0.07, attack: 0.3, duration: 1.8 });
    fx.tone(t, { frequency: 147, to: 139, type: 'sine', gain: 0.07, attack: 0.3, duration: 1.8 });
  },

  // ---- ab Wagen 4
  // leises Klicken (Kärtchen ablegen, Auswahl)
  click(fx, t) {
    fx.noise(t, { frequency: 2600, q: 3, gain: 0.14, duration: 0.025 });
  },
  // falsch: ein dumpfes Brummen
  wrong(fx, t) {
    fx.tone(t, { frequency: 150, to: 120, type: 'square', gain: 0.05, duration: 0.25 });
  },
  // Gläser klirren
  glass(fx, t) {
    fx.tone(t, { frequency: 2350, type: 'sine', gain: 0.07, duration: 0.6 });
    fx.tone(t + 0.01, { frequency: 3520, type: 'sine', gain: 0.04, duration: 0.45 });
  },
  // Joseph schnuppert
  sniff(fx, t) {
    fx.noise(t, { frequency: 1800, q: 0.7, gain: 0.08, duration: 0.18, attack: 0.05 });
    fx.noise(t + 0.28, { frequency: 2000, q: 0.7, gain: 0.08, duration: 0.22, attack: 0.05 });
  },
  // Tischglocke: "Ding!"
  bell(fx, t) {
    fx.tone(t, { frequency: 1760, type: 'sine', gain: 0.16, duration: 1.4 });
    fx.tone(t, { frequency: 4400, type: 'sine', gain: 0.05, duration: 0.7 });
  },
  // Registrierkasse: Rattern und Klingeln
  register(fx, t) {
    for (let i = 0; i < 5; i++) fx.noise(t + i * 0.06, { frequency: 1500, q: 5, gain: 0.18, duration: 0.03 });
    fx.tone(t + 0.36, { frequency: 2093, type: 'triangle', gain: 0.14, duration: 0.9 });
    fx.noise(t + 0.4, { type: 'lowpass', frequency: 600, gain: 0.35, duration: 0.15, brown: true });
  },
  // Schublade
  drawer(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 700, gain: 0.25, duration: 0.35, attack: 0.05, brown: true });
  },
  // Musikbox: eine kleine Melodie
  jukebox(fx, t) {
    const melody = [392, 440, 494, 587, 494, 440, 392, 330, 349, 392, 440, 392];
    melody.forEach((frequency, i) => {
      fx.tone(t + i * 0.32, { frequency, type: 'triangle', gain: 0.07, duration: 0.28 });
      if (i % 2 === 0) fx.tone(t + i * 0.32, { frequency: frequency / 2, type: 'sine', gain: 0.05, duration: 0.5 });
    });
  },
  // Münze fällt
  coin(fx, t) {
    fx.tone(t, { frequency: 3100, type: 'sine', gain: 0.08, duration: 0.15 });
    fx.tone(t + 0.12, { frequency: 2900, type: 'sine', gain: 0.06, duration: 0.15 });
    fx.noise(t + 0.25, { frequency: 2500, q: 6, gain: 0.12, duration: 0.05 });
  },
  // Filmprojektor rattert
  projector(fx, t) {
    for (let i = 0; i < 24; i++) fx.noise(t + i * 0.055, { frequency: 2200, q: 3, gain: 0.09, duration: 0.02 });
  },
  // Ein Schrei (Oma Ilse wacht auf) – ein hoher, kurzer Ton
  shriek(fx, t) {
    fx.tone(t, { frequency: 880, to: 1320, type: 'sawtooth', gain: 0.05, attack: 0.05, duration: 0.5 });
  },
  // Spiegel/Glas klirrt leise
  mirror(fx, t) {
    fx.tone(t, { frequency: 2637, type: 'sine', gain: 0.06, duration: 0.9 });
    fx.tone(t + 0.05, { frequency: 3520, type: 'sine', gain: 0.04, duration: 0.7 });
  },
  // Schwerer Hebel rastet ein
  lever(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 500, gain: 0.35, duration: 0.18, brown: true });
    fx.noise(t + 0.16, { frequency: 2400, q: 4, gain: 0.2, duration: 0.04 });
  },
  // Rauschen aus dem Lautsprecher oder Funkgerät
  static(fx, t) {
    fx.noise(t, { frequency: 3000, q: 0.4, gain: 0.08, duration: 1.2, attack: 0.1 });
  },
  // Tonband spult
  tape(fx, t) {
    fx.tone(t, { frequency: 300, to: 1400, type: 'sawtooth', gain: 0.025, duration: 0.8, attack: 0.05 });
    fx.noise(t, { frequency: 1800, q: 1, gain: 0.05, duration: 0.8 });
  },
  // Uhr schlägt: tiefer Gong
  chime(fx, t) {
    fx.tone(t, { frequency: 196, type: 'sine', gain: 0.2, duration: 2.2 });
    fx.tone(t, { frequency: 392, type: 'sine', gain: 0.08, duration: 1.6 });
    fx.tone(t, { frequency: 587, type: 'sine', gain: 0.04, duration: 1.0 });
  },
  // Kuckuck!
  cuckoo(fx, t) {
    fx.tone(t, { frequency: 784, type: 'sine', gain: 0.14, duration: 0.25 });
    fx.tone(t + 0.3, { frequency: 622, type: 'sine', gain: 0.14, duration: 0.35 });
  },
  // Ticken
  tick(fx, t) {
    fx.noise(t, { frequency: 4200, q: 8, gain: 0.12, duration: 0.02 });
  },
  // Streichholz
  match(fx, t) {
    fx.noise(t, { frequency: 3500, q: 0.8, gain: 0.16, duration: 0.25, attack: 0.01 });
    fx.noise(t + 0.1, { type: 'lowpass', frequency: 900, gain: 0.1, duration: 0.5, brown: true });
  },
  // Kirchenglocke
  churchBell(fx, t) {
    fx.tone(t, { frequency: 330, type: 'sine', gain: 0.18, duration: 2.6 });
    fx.tone(t, { frequency: 660, type: 'sine', gain: 0.07, duration: 2 });
    fx.tone(t, { frequency: 830, type: 'sine', gain: 0.04, duration: 1.2 });
  },
  // Bleistift reibt über Papier
  rub(fx, t) {
    fx.noise(t, { frequency: 2600, q: 0.6, gain: 0.07, duration: 0.3, attack: 0.04 });
  },
  // Schere
  scissors(fx, t) {
    fx.noise(t, { frequency: 5200, q: 3, gain: 0.12, duration: 0.05 });
    fx.noise(t + 0.12, { frequency: 4800, q: 3, gain: 0.12, duration: 0.05 });
  },
  // Spielzeugzug
  toyTrain(fx, t) {
    for (let i = 0; i < 10; i++) fx.noise(t + i * 0.12, { frequency: 1600, q: 4, gain: 0.07, duration: 0.03 });
    fx.tone(t + 1.2, { frequency: 1046, type: 'square', gain: 0.03, duration: 0.3 });
  },
  // Notbremse: Rucken und Zischen
  brake(fx, t) {
    fx.noise(t, { type: 'lowpass', frequency: 300, gain: 0.5, duration: 0.3, brown: true });
    fx.noise(t + 0.2, { frequency: 5000, q: 0.5, gain: 0.12, duration: 1.4, attack: 0.1 });
  },
  // Standuhr: tiefer Gong
  gong(fx, t) {
    fx.tone(t, { frequency: 196, type: 'sine', gain: 0.2, duration: 2.6 });
    fx.tone(t, { frequency: 392, type: 'sine', gain: 0.06, duration: 1.6 });
  },
  // Morse-Piepton (lang oder kurz)
  beep(fx, t, long = false) {
    fx.tone(t, { frequency: 760, type: 'sine', gain: 0.09, duration: long ? 0.36 : 0.12, attack: 0.005 });
  },
  // Dampf oder Rohrpost zischt
  hiss(fx, t) {
    fx.noise(t, { frequency: 6000, q: 0.5, gain: 0.14, duration: 1.2, attack: 0.08 });
  },
  // Stempel
  stamp(fx, t) {
    fx.noise(t, { frequency: 900, q: 1.5, gain: 0.3, duration: 0.06 });
  },
  // Wasser plätschert
  water(fx, t) {
    for (let i = 0; i < 8; i++) fx.noise(t + i * 0.07, { frequency: 1200 + (i % 3) * 400, q: 4, gain: 0.07, duration: 0.06 });
  },
  // Entgleisen: Kreischen, Krachen
  crash(fx, t) {
    fx.noise(t, { frequency: 4000, q: 2, gain: 0.2, duration: 1.2, attack: 0.05 });
    fx.noise(t + 0.9, { type: 'lowpass', frequency: 260, gain: 0.7, duration: 1.6, brown: true });
  },
};

// Lautstärke-Hüllkurve: schnell lauter, dann ausklingen
function envelope(context, time, peak, attack, decay) {
  const node = context.createGain();
  node.gain.setValueAtTime(0.0001, time);
  node.gain.exponentialRampToValueAtTime(peak, time + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  return node;
}
