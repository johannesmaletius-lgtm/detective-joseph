// Kleine Körperbewegungen, die eine Figur menschlich wirken lassen – für Joseph (player.js) und alle anderen
// Figuren (character.js). Die Bilder selbst bleiben unverändert; verformt wird nur beim Zeichnen, und zwar
// immer um die Füße herum (die bleiben fest auf dem Boden).
//
//   Atmen        ein (schneller) – aus (langsamer) – kurze Pause; jeder Atemzug ein wenig anders lang.
//                Nach dem Rennen atmet die Figur ein paar Sekunden schneller und tiefer.
//   Gewicht      im Stehen verlagert sich das Gewicht ganz langsam hin und her (kaum sichtbares Schwanken).
//   Sprechen     unregelmäßiges Nicken auf "Betonungen" statt gleichmäßigem Wippen, dazu leichtes Neigen.
//   Laufen       der Oberkörper neigt sich in Laufrichtung (beim Rennen stärker).
//   Anhalten     beim Stehenbleiben schwingt der Körper kurz nach und federt in den Knien.
//
// Benutzung: life.update(dt, { moving, running, talking, direction }) in jedem Bild,
//            beim Zeichnen nach ctx.translate(Füße): life.apply(ctx).

const TAU = Math.PI * 2;

// Eine gedämpfte Feder: folgt einem Zielwert mit etwas Nachschwingen
class Spring {
  constructor(stiffness, damping) {
    this.k = stiffness;
    this.d = damping;
    this.value = 0;
    this.velocity = 0;
    this.target = 0;
  }

  update(dt) {
    // in kleinen Schritten rechnen, damit die Feder auch bei Rucklern stabil bleibt
    let left = Math.min(dt, 0.1);
    while (left > 0) {
      const h = Math.min(left, 1 / 120);
      const force = this.k * (this.target - this.value) - this.d * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
      left -= h;
    }
  }
}

const smooth = (t) => t * t * (3 - 2 * t);

// Verlauf eines Atemzugs (0 … 1 → 0 … 1): Einatmen 40 %, Ausatmen 45 %, Pause 15 %
function breathCurve(p) {
  if (p < 0.4) return smooth(p / 0.4);
  if (p < 0.85) return 1 - smooth((p - 0.4) / 0.45);
  return 0;
}

export class BodyLife {
  constructor({ breathSeconds = 3.8, breathAmount = 0.008, sway = 0.0035 } = {}) {
    this.breathSeconds = breathSeconds;
    this.breathAmount = breathAmount;
    this.swayAmount = sway;
    this.clock = Math.random() * 20;           // damit nicht alle Figuren im Gleichtakt schwanken
    this.breathPhase = Math.random();
    this.breathLength = breathSeconds;
    this.breath = 0;                           // 0 … 1, wie weit gerade eingeatmet
    this.exertion = 0;                         // 0 … 1, wie außer Atem (nach dem Rennen)
    this.lean = new Spring(55, 9);             // Neigung in Laufrichtung (Bogenmaß), schwingt beim Anhalten nach
    this.dip = new Spring(160, 13);            // Einfedern in den Knien (Anteil der Höhe)
    this.nod = new Spring(120, 11);            // Nicken beim Sprechen
    this.tilt = new Spring(18, 7);             // seitliches Neigen beim Sprechen
    this.nextBeat = 0;
    this.nextTilt = 0;
    this.wasMoving = false;
  }

  update(dt, { moving = false, running = false, talking = false, direction = 0 } = {}) {
    this.clock += dt;

    // Atmen: in Bewegung flacher, nach dem Rennen schneller und tiefer
    this.exertion = running ? Math.min(1, this.exertion + dt * 0.25) : Math.max(0, this.exertion - dt / 7);
    this.breathPhase += dt / (this.breathLength * (1 - 0.45 * this.exertion));
    if (this.breathPhase >= 1) {
      this.breathPhase %= 1;
      this.breathLength = this.breathSeconds * (0.85 + Math.random() * 0.3);
    }
    const depth = (moving ? 0.35 : 1) * (1 + 0.9 * this.exertion);
    this.breath = breathCurve(this.breathPhase) * depth;

    // Laufen: nach vorne lehnen; beim Anhalten schwingt die Feder etwas über das Ziel hinaus zurück
    this.lean.target = moving ? direction * (running ? 0.045 : 0.02) : 0;
    if (this.wasMoving && !moving) this.dip.velocity += running ? 0.16 : 0.09;
    if (!this.wasMoving && moving) this.dip.velocity += 0.05;
    this.wasMoving = moving;

    // Sprechen: Nicken auf unregelmäßige Betonungen, ab und zu den Kopf etwas schief legen
    if (talking && !moving) {
      this.nextBeat -= dt;
      if (this.nextBeat <= 0) {
        this.nod.velocity += 0.22 + Math.random() * 0.28;
        this.nextBeat = 0.22 + Math.random() * 0.55;
        if (Math.random() < 0.15) this.nextBeat += 0.6; // kleine Denkpause
      }
      this.nextTilt -= dt;
      if (this.nextTilt <= 0) {
        this.tilt.target = (Math.random() * 2 - 1) * 0.008;
        this.nextTilt = 0.9 + Math.random() * 1.6;
      }
    } else {
      this.tilt.target = 0;
      this.nextBeat = 0.05;
    }

    this.lean.update(dt);
    this.dip.update(dt);
    this.nod.update(dt);
    this.tilt.update(dt);
  }

  // Gewichtsverlagerung im Stehen: zwei langsame, nicht im Takt laufende Wellen
  get sway() {
    const t = this.clock;
    const amount = this.wasMoving ? 0 : this.swayAmount;
    return amount * (Math.sin((t * TAU) / 8.3) + 0.6 * Math.sin((t * TAU) / 5.3 + 1.7));
  }

  // Verformt die Zeichenfläche; davor muss der Ursprung auf den Füßen liegen (Bild nach oben gezeichnet).
  apply(ctx) {
    const angle = this.lean.value + this.sway + this.tilt.value;
    const stretch = 1 + this.breath * this.breathAmount - this.dip.value * 1.2 - Math.max(0, this.nod.value) * 0.15;
    const widen = 1 + this.breath * this.breathAmount * 0.3;
    // Scherung statt Drehung: die Füße bleiben genau stehen, der Kopf wandert am weitesten
    ctx.transform(widen, 0, -Math.tan(angle), stretch, 0, 0);
  }
}
