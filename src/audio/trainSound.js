// Fahrgeräusch des Zuges – komplett im Browser erzeugt (Web Audio), ohne Sounddateien.
//
// - tiefes Rumpeln (gefiltertes Rauschen) und leises Rauschen von Fahrtwind und Rädern
// - "Klack" bei jedem Schienenstoß (wird von trainMotion.js ausgelöst)
//
// Browser erlauben Ton erst nach der ersten Eingabe. Deshalb startet der Ton beim ersten
// Klick oder Tastendruck. Taste M schaltet ihn stumm. Später lassen sich hier echte
// Sounddateien (z. B. MP3) einbauen.

const VOLUME = 0.55;

export class TrainSound {
  constructor({ muted = false } = {}) {
    this.context = null;
    this.muted = muted;
  }

  // Darf mehrfach aufgerufen werden – startet nur beim ersten Mal (und nicht, solange stumm).
  start() {
    if (this.muted) return;
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return; // sehr alter Browser: dann eben ohne Ton
    const context = new AudioContext();
    this.context = context;

    this.master = context.createGain();
    this.master.gain.value = VOLUME;
    this.master.connect(context.destination);

    this.brownNoise = createNoiseBuffer(context, 4, true);
    this.whiteNoise = createNoiseBuffer(context, 2, false);

    // Tiefes Rumpeln
    const rumble = this.loopNoise(this.brownNoise);
    const rumbleFilter = lowpass(context, 140);
    const rumbleGain = gain(context, 0.9);
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(this.master);

    // Leises Zischen von Rädern und Fahrtwind
    const hiss = this.loopNoise(this.whiteNoise);
    const hissFilter = context.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 1800;
    hissFilter.Q.value = 0.7;
    hiss.connect(hissFilter).connect(gain(context, 0.05)).connect(this.master);

    // Das Rumpeln schwillt ganz langsam an und ab
    const wobble = context.createOscillator();
    wobble.frequency.value = 0.23;
    const wobbleDepth = gain(context, 0.25);
    wobble.connect(wobbleDepth).connect(rumbleGain.gain);
    wobble.start();
  }

  // Ein Schienenstoß: kurzes metallisches Klacken plus dumpfer Schlag
  clack(strength = 1) {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    const now = context.currentTime;

    const click = context.createBufferSource();
    click.buffer = this.whiteNoise;
    const clickFilter = context.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 900 + Math.random() * 300;
    clickFilter.Q.value = 1.4;
    const clickGain = envelope(context, now, 0.55 * strength, 0.002, 0.08);
    click.connect(clickFilter).connect(clickGain).connect(this.master);
    click.start(now, Math.random() * 1.8, 0.15);

    const thump = context.createOscillator();
    thump.frequency.setValueAtTime(95, now);
    thump.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    const thumpGain = envelope(context, now, 0.45 * strength, 0.004, 0.13);
    thump.connect(thumpGain).connect(this.master);
    thump.start(now);
    thump.stop(now + 0.2);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : VOLUME, this.context.currentTime, 0.05);
    if (!this.muted) this.start();
    return this.muted;
  }

  loopNoise(buffer) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.start();
    return source;
  }
}

// Rauschen als Klangquelle. "Braunes" Rauschen (brown = true) klingt tiefer und weicher.
function createNoiseBuffer(context, seconds, brown) {
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = brown ? last * 3.5 : white * 0.5;
  }
  return buffer;
}

function gain(context, value) {
  const node = context.createGain();
  node.gain.value = value;
  return node;
}

function lowpass(context, frequency) {
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  return filter;
}

// Lautstärke-Hüllkurve: schnell lauter, dann ausklingen
function envelope(context, now, peak, attack, decay) {
  const node = context.createGain();
  node.gain.setValueAtTime(0.0001, now);
  node.gain.exponentialRampToValueAtTime(peak, now + attack);
  node.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return node;
}
