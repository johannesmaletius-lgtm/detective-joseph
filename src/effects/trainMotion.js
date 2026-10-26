// Das Gefühl, dass der Zug fährt.
//
// - Rumpeln:        das ganze Bild zittert ganz leicht
// - Schienenstöße:  im Takt "ta-dam … ta-dam" ruckelt das Bild kurz (und es klackt, siehe trainSound.js)
// - Lampen:         die Deckenlampen leuchten warm und flackern ab und zu
// - Laternen:       draußen zieht ab und zu eine Laterne vorbei – ihr Licht blitzt durch die
//                   Fenster und streift quer durch das Abteil
//
// Alle Einstellungen stehen in der Szenen-Datei unter "train" (z. B. trainCompartment.js).

const BUMP_FREQUENCY = 9;   // Hz – wie schnell ein Stoß nachschwingt
const BUMP_DECAY = 0.09;    // Sekunden – wie schnell er abklingt
const AXLE_GAP = 0.13;      // Sekunden zwischen "ta" und "dam" (zwei Achsen)
const SWEEP_DURATION = 0.9; // Sekunden, die das Laternenlicht durch das Abteil wandert

export class TrainMotion {
  constructor(settings, { reducedMotion = false } = {}) {
    this.settings = settings;
    this.speed = settings.speed ?? 1;              // 1 = volle Fahrt, 0 = Stillstand
    this.shakeStrength = reducedMotion ? 0 : settings.shake ?? 1;
    this.time = 0;
    this.nextJoint = 0.6;     // wann der nächste Schienenstoß kommt
    this.bumps = [];          // laufende Stöße (Startzeit + Stärke)
    this.flicker = 0;         // 0 = Lampen normal, 1 = Lampen kurz dunkel
    this.nextFlicker = 8;
    this.sweeps = [];         // Laternenlicht, das gerade vorbeizieht
    this.nextSweep = 3;
    this.onBump = null;       // wird bei jedem Stoß aufgerufen (für das Klack-Geräusch)
    this.shakeY = 0;          // aktuelle Verschiebung des Bildes in Pixeln
  }

  update(dt) {
    this.time += dt;
    const t = this.time;

    // Schienenstöße: "ta" … "dam"
    if (this.speed > 0 && t >= this.nextJoint) {
      this.bump(1);
      this.bumps.push({ start: t + AXLE_GAP, strength: 0.8, pending: true });
      this.nextJoint = t + this.settings.railJointInterval / this.speed;
    }
    for (const bump of this.bumps) {
      if (bump.pending && t >= bump.start) {
        bump.pending = false;
        this.onBump?.(bump.strength);
      }
    }
    this.bumps = this.bumps.filter((bump) => t - bump.start < BUMP_DECAY * 6);

    // Zittern = feines Dauerrumpeln + nachschwingende Stöße
    let shake = 0.35 * Math.sin(t * 2 * Math.PI * 13) + 0.25 * Math.sin(t * 2 * Math.PI * 7.3 + 1);
    for (const bump of this.bumps) {
      const age = t - bump.start;
      if (age >= 0) shake += 1.6 * bump.strength * Math.exp(-age / BUMP_DECAY) * Math.sin(age * 2 * Math.PI * BUMP_FREQUENCY);
    }
    this.shakeY = shake * this.shakeStrength * this.speed;

    // Lampenflackern: kurze Aussetzer bei Stößen und ab und zu ein doppeltes Flackern
    if (t >= this.nextFlicker) {
      this.flickerStart = t;
      this.nextFlicker = t + 10 + Math.random() * 18;
    }
    const sinceFlicker = t - (this.flickerStart ?? -99);
    const doubleFlicker = sinceFlicker < 0.35 ? (sinceFlicker < 0.08 || (sinceFlicker > 0.16 && sinceFlicker < 0.24) ? 1 : 0.3) : 0;
    const bumpDip = this.bumps.reduce((dip, bump) => {
      const age = t - bump.start;
      return age >= 0 && age < 0.06 ? Math.max(dip, 0.35 * bump.strength) : dip;
    }, 0);
    this.flicker = Math.max(doubleFlicker, bumpDip);

    // Vorbeiziehende Laternen, abwechselnd auf beiden Seiten
    if (this.speed > 0 && t >= this.nextSweep) {
      const [min, max] = this.settings.lanternEvery;
      this.sweeps.push({ start: t, side: Math.random() < 0.5 ? 'left' : 'right' });
      this.nextSweep = t + (min + Math.random() * (max - min)) / this.speed;
    }
    this.sweeps = this.sweeps.filter((sweep) => t - sweep.start < SWEEP_DURATION);
  }

  bump(strength) {
    this.bumps.push({ start: this.time, strength });
    this.onBump?.(strength);
  }

  // Hinter dem Hintergrund (nur in den Fensterscheiben sichtbar): das Licht einer Laterne huscht vorbei.
  drawBehind(ctx) {
    for (const sweep of this.sweeps) {
      const progress = (this.time - sweep.start) / 0.35; // in den Fenstern ist sie schnell vorbei
      if (progress > 1) continue;
      // links zieht die Landschaft nach links, rechts nach rechts
      const x = sweep.side === 'left' ? 400 - progress * 420 : 880 + progress * 420;
      glow(ctx, x, 200, 120, [225, 232, 255], 0.75 * Math.sin(Math.PI * progress), 'lighter');
    }
  }

  // Über allem (auch über Joseph): Lampenlicht, Flackern und Lichtstreifen der Laternen.
  drawFront(ctx, width, height) {
    const lampLevel = 1 - this.flicker;
    for (const lamp of this.settings.lamps) {
      glow(ctx, lamp.x, lamp.y, lamp.radius, [255, 196, 110], lamp.strength * lampLevel, 'screen');
    }
    if (this.flicker > 0) {
      ctx.fillStyle = `rgba(12, 6, 20, ${0.22 * this.flicker})`;
      ctx.fillRect(0, 0, width, height);
    }
    for (const sweep of this.sweeps) {
      const progress = (this.time - sweep.start) / SWEEP_DURATION;
      // Das Licht fällt durch die Fenster der einen Seite und wandert über die gegenüberliegende Seite nach vorne.
      const x = sweep.side === 'left' ? 560 + progress * 820 : 720 - progress * 820;
      const band = ctx.createLinearGradient(x - 170, 0, x + 170, 0);
      const alpha = 0.14 * Math.sin(Math.PI * progress);
      band.addColorStop(0, 'rgba(170, 190, 255, 0)');
      band.addColorStop(0.5, `rgba(170, 190, 255, ${alpha})`);
      band.addColorStop(1, 'rgba(170, 190, 255, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = band;
      ctx.fillRect(x - 170, 0, 340, height);
      ctx.restore();
    }
  }
}

// Weicher, runder Lichtschein
function glow(ctx, x, y, radius, [r, g, b], alpha, blend) {
  if (alpha <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}
