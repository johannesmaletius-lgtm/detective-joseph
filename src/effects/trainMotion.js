// Das Gefühl, dass der Zug fährt – und dass er im Kreis fährt.
//
// - Rumpeln:        das ganze Bild zittert ganz leicht
// - Schienenstöße:  im Takt "ta-dam … ta-dam" ruckelt das Bild kurz (und es klackt, siehe trainSound.js)
// - Schaukeln:      der Wagen federt und wiegt sich – draußen bewegt sich die Welt gegen die Fensterrahmen
// - Tempo:          der Zug wird ganz leicht schneller und wieder langsamer
// - Lampen:         die Deckenlampen leuchten warm und flackern ab und zu
// - Laternen:       draußen zieht ab und zu eine Laterne vorbei – ihr Licht streift quer durch das Abteil
// - Runde:          die Strecke ist ein Kreis. Nach "lap" Fahrsekunden ist der Zug wieder am selben Punkt:
//                   dieselben Laternen an denselben Stellen, und an der Nahtstelle der Runde ein Tunnel.
// - Quietschen:     in der endlosen Kurve quietschen ab und zu die Räder
//
// Alle Einstellungen stehen in der Szenen-Datei unter "train" (z. B. trainCompartment.js).
//
// Wegstrecke wird in FAHRSEKUNDEN gemessen: so weit, wie der Zug bei voller Fahrt in einer Sekunde kommt.

const BUMP_FREQUENCY = 9;   // Hz – wie schnell ein Stoß nachschwingt
const BUMP_DECAY = 0.09;    // Sekunden – wie schnell er abklingt
const AXLE_GAP = 0.13;      // Sekunden zwischen "ta" und "dam" (zwei Achsen)
const LIGHT_LEAD = 0.45;    // Fahrsekunden: so früh fällt das Licht einer Laterne schon ins Abteil
const SWEEPS = {            // Lichtstreifen, die quer durch das Abteil wandern
  lantern: { duration: 0.9, color: '170, 190, 255', strength: 0.14 },
  tunnelLamp: { duration: 0.55, color: '255, 165, 85', strength: 0.07 },
};

export class TrainMotion {
  constructor(settings, { reducedMotion = false } = {}) {
    this.settings = settings;
    this.cruiseSpeed = settings.speed ?? 1;        // 1 = volle Fahrt, 0 = Stillstand
    this.speed = this.cruiseSpeed;                 // aktuelles Tempo (schwankt leicht um cruiseSpeed)
    this.shakeStrength = reducedMotion ? 0 : settings.shake ?? 1;
    this.lapLength = settings.lap;                 // Fahrsekunden für eine Runde
    this.tunnelLamps = { every: settings.tunnel.lampEvery };
    this.distance = settings.startAt ?? 0;         // gefahrene Strecke in Fahrsekunden
    this.lanterns = planLanterns(settings);        // jede Runde an denselben Stellen
    this.time = 0;
    this.nextJoint = 0.6;     // wann der nächste Schienenstoß kommt
    this.bumps = [];          // laufende Stöße (Startzeit + Stärke)
    this.flicker = 0;         // 0 = Lampen normal, 1 = Lampen kurz dunkel
    this.nextFlicker = 8;
    this.sweeps = [];         // Lichtstreifen, die gerade durch das Abteil wandern
    this.nextSqueal = randomBetween(settings.squealEvery);
    this.inTunnel = this.tunnelAt(this.distance);
    this.tunnel = this.inTunnel ? 1 : 0; // weich übergeblendet: 0 = draußen, 1 = ganz im Tunnel
    this.shakeY = 0;          // aktuelle Verschiebung des Bildes in Pixeln
    this.roll = 0;            // Neigung der Welt draußen (Bogenmaß)
    this.bob = 0;             // Verschiebung der Welt draußen nach oben/unten (Pixel)

    // Werden bei den passenden Ereignissen aufgerufen (für die Geräusche, siehe game.js)
    this.onBump = null;       // (Stärke) bei jedem Schienenstoß
    this.onTunnel = null;     // (true/false) beim Hineinfahren und Herausfahren
    this.onSqueal = null;     // (Dauer in Sekunden) wenn die Räder in der Kurve quietschen
  }

  // Die wievielte Runde? Gezählt wird jeweils mitten im Tunnel.
  get lap() {
    return Math.floor(this.distance / this.lapLength) + 1;
  }

  // Wie weit der Zug in der aktuellen Runde ist (Fahrsekunden seit der Mitte des Tunnels)
  get lapTime() {
    return mod(this.distance, this.lapLength);
  }

  // Fahrtrichtung in Grad: dreht sich in jeder Runde einmal ganz herum (für Mond und Sterne)
  get heading() {
    return (this.lapTime / this.lapLength) * 360;
  }

  // Ist an dieser Stelle der Strecke Tunnel? Er liegt genau auf der Nahtstelle der Runde.
  tunnelAt(distance) {
    const { length } = this.settings.tunnel;
    return mod(distance + length / 2, this.lapLength) < length;
  }

  // Fahrsekunden bis zur nächsten Tunneleinfahrt
  get tunnelAhead() {
    return mod(this.lapLength - this.settings.tunnel.length / 2 - this.lapTime, this.lapLength);
  }

  // Zum Ausprobieren (Debug, Taste T): ein paar Sekunden vor den Tunnel springen
  skipToTunnel() {
    this.distance += mod(this.tunnelAhead - 4, this.lapLength);
    this.sweeps = [];
  }

  update(dt) {
    this.time += dt;
    const t = this.time;

    // Tempo und Strecke
    this.speed = this.cruiseSpeed * (1 + 0.035 * Math.sin((t * 2 * Math.PI) / 27) + 0.015 * Math.sin((t * 2 * Math.PI) / 11 + 1));
    const before = this.distance;
    this.distance += dt * this.speed;

    // Tunnel
    const inTunnel = this.tunnelAt(this.distance);
    if (inTunnel !== this.inTunnel) {
      this.inTunnel = inTunnel;
      this.onTunnel?.(inTunnel);
    }
    this.tunnel += ((inTunnel ? 1 : 0) - this.tunnel) * Math.min(1, dt * 5);

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
    const sway = this.shakeStrength * this.speed;
    this.shakeY = shake * sway;

    // Der Wagen wiegt sich langsam in den Federn. Die Welt draußen bewegt sich dabei gegen
    // das Abteil – deshalb auch gegen das Zittern (das Abteil zittert, die Landschaft nicht).
    this.roll = sway * (0.0032 * Math.sin(t * 2 * Math.PI * 0.43) + 0.0014 * Math.sin(t * 2 * Math.PI * 0.71 + 2));
    this.bob = sway * 1.2 * Math.sin(t * 2 * Math.PI * 0.9 + 0.5) - 1.6 * this.shakeY;

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

    // Laternen: ihr Licht fällt ins Abteil, kurz bevor sie auf Höhe der Fenster sind
    for (const lantern of this.lanterns) {
      if (passed(before, this.distance, lantern.at - LIGHT_LEAD, this.lapLength)) {
        this.sweeps.push({ kind: 'lantern', side: lantern.side, start: t });
      }
    }
    // Im Tunnel: Lampen an der linken Tunnelwand
    const { every } = this.tunnelLamps;
    if (inTunnel && Math.floor(this.distance / every) > Math.floor(before / every)) {
      this.sweeps.push({ kind: 'tunnelLamp', side: 'left', start: t });
    }
    this.sweeps = this.sweeps.filter((sweep) => t - sweep.start < SWEEPS[sweep.kind].duration);

    // Räder quietschen in der Kurve
    if (this.speed > 0 && t >= this.nextSqueal) {
      this.onSqueal?.(1.5 + Math.random() * 2);
      this.nextSqueal = t + randomBetween(this.settings.squealEvery);
    }
  }

  bump(strength) {
    this.bumps.push({ start: this.time, strength });
    this.onBump?.(strength);
  }

  // Über allem (auch über Joseph): Lampenlicht, Flackern und Lichtstreifen von Laternen und Tunnellampen.
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
      const { duration, color, strength } = SWEEPS[sweep.kind];
      const progress = (this.time - sweep.start) / duration;
      // Das Licht fällt durch die Fenster der einen Seite und wandert über die gegenüberliegende Seite nach vorne.
      const x = sweep.side === 'left' ? 560 + progress * 820 : 720 - progress * 820;
      const band = ctx.createLinearGradient(x - 170, 0, x + 170, 0);
      const alpha = strength * Math.sin(Math.PI * progress);
      band.addColorStop(0, `rgba(${color}, 0)`);
      band.addColorStop(0.5, `rgba(${color}, ${alpha})`);
      band.addColorStop(1, `rgba(${color}, 0)`);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = band;
      ctx.fillRect(x - 170, 0, 340, height);
      ctx.restore();
    }
  }
}

// Wo in der Runde Laternen stehen – zufällig verteilt, aber jede Runde gleich (fester Startwert).
function planLanterns({ lap, tunnel, lanternEvery: [min, max] }) {
  const rand = seededRandom(4);
  const lanterns = [];
  for (let at = tunnel.length / 2 + min * rand(); at < lap - tunnel.length / 2 - 2; at += min + rand() * (max - min)) {
    lanterns.push({ at, side: rand() < 0.5 ? 'left' : 'right' });
  }
  return lanterns;
}

// Ist der Zug zwischen "from" und "to" an der Stelle "at" (in jeder Runde) vorbeigekommen?
function passed(from, to, at, lap) {
  return Math.floor((to - at) / lap) > Math.floor((from - at) / lap);
}

function randomBetween([min, max]) {
  return min + Math.random() * (max - min);
}

// Pseudo-Zufallszahlen mit Startwert: gleiche Zahl → jedes Mal dieselbe Folge.
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mod(value, length) {
  return ((value % length) + length) % length;
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
