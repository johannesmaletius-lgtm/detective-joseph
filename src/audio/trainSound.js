// Fahrgeräusch des Zuges – komplett im Browser erzeugt (Web Audio), ohne Sounddateien.
//
// - tiefes Rumpeln (gefiltertes Rauschen) und leises Rauschen von Fahrtwind und Rädern
// - "Klack" bei jedem Schienenstoß, mal etwas mehr links, mal rechts (wird von trainMotion.js ausgelöst)
// - Tunnel: dumpfer Druckstoß beim Hineinfahren, dann lauter und hohl (kurzes Echo)
// - leises, tiefes Schleifen der Räder in der endlosen Kurve
//
// Browser erlauben Ton erst nach der ersten Eingabe. Deshalb startet der Ton beim ersten
// Klick oder Tastendruck. Taste M schaltet ihn stumm. Später lassen sich hier echte
// Sounddateien (z. B. MP3) einbauen.

import { levels, saveLevels } from './levels.js';

const VOLUME = 0.55;

export class TrainSound {
  constructor({ muted = false } = {}) {
    this.context = null;
    this.muted = muted;
    this.inTunnel = false;
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
    // Fahrgeräusch und alle Effekte laufen über diesen Regler (Einstellungen → Effekte); die Musik geht direkt an master
    this.effectsBus = context.createGain();
    this.effectsBus.gain.value = levels.effects;
    this.effectsBus.connect(this.master);

    this.brownNoise = createNoiseBuffer(context, 4, true);
    this.whiteNoise = createNoiseBuffer(context, 2, false);

    // Hall im Tunnel: ein kurzes, dumpfes Echo. Alles, was an "echo" geht, hallt – aber nur im Tunnel.
    this.echo = gain(context, 0);
    const delay = context.createDelay();
    delay.delayTime.value = 0.085;
    const echoFilter = lowpass(context, 1200);
    const feedback = gain(context, 0.45);
    this.echo.connect(delay).connect(echoFilter).connect(feedback).connect(delay);
    echoFilter.connect(this.effectsBus);

    // Fahrgeräusch (Rumpeln + Zischen) – im Tunnel lauter
    this.body = gain(context, 1);
    this.body.connect(this.effectsBus);
    this.body.connect(this.echo);

    // Tiefes Rumpeln
    const rumble = this.loopNoise(this.brownNoise);
    const rumbleFilter = lowpass(context, 140);
    const rumbleGain = gain(context, 0.9);
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(this.body);

    // Leises Zischen von Rädern und Fahrtwind
    const hiss = this.loopNoise(this.whiteNoise);
    const hissFilter = context.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 1800;
    hissFilter.Q.value = 0.7;
    hiss.connect(hissFilter).connect(gain(context, 0.05)).connect(this.body);

    // Das Rumpeln schwillt ganz langsam an und ab
    const wobble = context.createOscillator();
    wobble.frequency.value = 0.23;
    const wobbleDepth = gain(context, 0.25);
    wobble.connect(wobbleDepth).connect(rumbleGain.gain);
    wobble.start();

    if (this.inTunnel) this.tunnel(true, { quiet: true }); // falls der Ton erst im Tunnel startet
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
    const output = this.output((Math.random() - 0.5) * 0.6); // mal etwas mehr links, mal rechts
    click.connect(clickFilter).connect(clickGain).connect(output);
    click.start(now, Math.random() * 1.8, 0.15);

    const thump = context.createOscillator();
    thump.frequency.setValueAtTime(95, now);
    thump.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    const thumpGain = envelope(context, now, 0.45 * strength, 0.004, 0.13);
    thump.connect(thumpGain).connect(output);
    thump.start(now);
    thump.stop(now + 0.2);
  }

  // Tunnel: beim Hineinfahren ein dumpfer Druckstoß, drinnen lauter und hohl, draußen wieder normal.
  tunnel(inside, { quiet = false } = {}) {
    this.inTunnel = inside;
    const context = this.context;
    if (!context) return;
    const now = context.currentTime;
    this.body.gain.setTargetAtTime(inside ? 1.7 : 1, now, inside ? 0.08 : 0.25);
    this.echo.gain.setTargetAtTime(inside ? 0.6 : 0, now, inside ? 0.08 : 0.3);
    if (quiet || context.state !== 'running') return;

    const whoomp = context.createBufferSource();
    whoomp.buffer = this.brownNoise;
    const whoompGain = envelope(context, now, inside ? 1.1 : 0.5, 0.03, 0.7);
    whoomp.connect(lowpass(context, 260)).connect(whoompGain).connect(this.effectsBus);
    whoomp.start(now, Math.random() * 3, 0.8);
  }

  // Räder in der Kurve: leises, tiefes Schleifen (gefiltertes Rauschen, kein heller Ton), das an- und abschwillt
  squeal(duration = 2) {
    const context = this.context;
    if (!context || context.state !== 'running') return;
    const now = context.currentTime;
    const level = gain(context, 0);
    level.gain.setValueAtTime(0, now);
    level.gain.linearRampToValueAtTime(0.09, now + duration * 0.35);
    level.gain.linearRampToValueAtTime(0.07, now + duration * 0.7);
    level.gain.linearRampToValueAtTime(0, now + duration);
    level.connect(this.output(0.2));

    const grind = context.createBufferSource();
    grind.buffer = this.whiteNoise;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.linearRampToValueAtTime(320, now + duration);
    filter.Q.value = 2.5;
    grind.connect(filter).connect(lowpass(context, 700)).connect(level);
    grind.loop = true; // das Rauschen ist kürzer als manche Kurve
    grind.start(now, Math.random() * 0.5);
    grind.stop(now + duration);
  }

  // Ausgang für ein einzelnes Geräusch: etwas links (−1) bis rechts (1), im Tunnel mit Hall
  output(pan) {
    const context = this.context;
    const node = context.createStereoPanner ? context.createStereoPanner() : gain(context, 1);
    if (node.pan) node.pan.value = pan;
    node.connect(this.effectsBus);
    node.connect(this.echo);
    return node;
  }

  // Regler aus dem Einstellungsmenü anwenden (Musik: src/audio/music.js, Stimmen: voices.js lesen selbst nach)
  applyLevels() {
    if (this.effectsBus) this.effectsBus.gain.setTargetAtTime(levels.effects, this.context.currentTime, 0.05);
    this.onLevels?.();
  }

  toggleMute() {
    this.muted = !this.muted;
    levels.sound = !this.muted;
    saveLevels();
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
