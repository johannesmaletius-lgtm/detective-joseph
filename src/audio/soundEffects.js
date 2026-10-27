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

  play(name) {
    const context = this.sound.context;
    if (!context || context.state !== 'running') return;
    EFFECTS[name]?.(this, context.currentTime);
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
};

// Lautstärke-Hüllkurve: schnell lauter, dann ausklingen
function envelope(context, time, peak, attack, decay) {
  const node = context.createGain();
  node.gain.setValueAtTime(0.0001, time);
  node.gain.exponentialRampToValueAtTime(peak, time + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
  return node;
}
