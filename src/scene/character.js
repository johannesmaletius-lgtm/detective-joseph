import { loadImage } from '../core/assets.js';
import { BodyLife } from '../animation/bodyLife.js';

// Eine Figur im Wagen, die nicht Joseph ist (Koch Bruno, Herr K., der Barkeeper …).
//
// Daten in der Szene (siehe z. B. src/scene/diningCar.js):
//   characters: [{
//     id: 'bruno', name: 'Koch Bruno',
//     poses: 'assets/characters/bruno',  // Ordner mit front.webp, left.webp, right.webp, talk.webp
//     x: 760, y: 420,                   // Position der FÜSSE
//     pose: 'left',                     // front, left, right oder talk
//     size: 1.05,                       // Größe im Verhältnis zu Joseph an derselben Stelle
//     walkTo: [700, 440], facing: 'right', // hier stellt sich Joseph zum Sprechen hin
//     color: '#ffd9a0',                 // Farbe seiner Sprechtexte
//     when: 'merker',                   // (optional) nur sichtbar, solange der Merker gesetzt ist
//     idle: ['blink', 'busy'],          // (optional) Zusatzbilder blink.webp und busy.webp im Ordner (nur Pose 'front'):
//     actions: { ears: {                // (optional) kurze Bewegungen aus mehreren Bildern im Ordner, abgespielt mit act('ears', Sekunden):
//       intro: ['ears-1'],              //   einmal zu Beginn (Übergang hinein)
//       loop: ['ears-2', 'ears-3'],     //   im Wechsel, solange die Bewegung dauert
//       outro: ['ears-1'],              //   einmal am Ende (Übergang zurück)
//       frame: 0.16, loopFrame: 0.3, shake: 1.5, // Sekunden pro Bild, Zittern in Pixeln
//       whileTalking: true } },         //   läuft auch weiter, wenn die Figur spricht (sonst bricht Sprechen sie ab)
//     busyAction: 'stir',               // (optional) statt des starren busy.webp diese Bewegung abspielen
//   }]                                  // blinzelt ab und zu und tut ab und zu etwas (Topf rühren, Kragen zupfen …)
//
// Laufen: moveTo(x, y, Sekunden) – hat die Figur Laufbilder (assets/characters/<figur>/walk-left, walk-right,
// walk-front, erzeugt mit tools/make-character-walk.mjs, Übersicht in assets/characters/walk.json), macht sie
// dabei echte Schritte, passend zur Strecke (die Füße rutschen nicht). Sonst gleitet sie wie bisher.
// fade(0, Sekunden) blendet sie aus (z. B. wenn sie durch eine Tür geht).
//
// Eine Figur ist zugleich eine anklickbare Stelle (cursor: 'talk'); ihre Reaktionen stehen im
// Drehbuch unter hotspots mit derselben id.

const POSES = ['front', 'left', 'right', 'talk'];

// Welche Figur welche Laufbilder hat (einmal geladen, für alle Figuren)
let walkIndex = null;
function loadWalkIndex() {
  walkIndex ??= fetch('assets/characters/walk.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return walkIndex;
}

// Lebenszeichen: alle Figuren atmen, verlagern das Gewicht, nicken beim Sprechen, lehnen sich beim Laufen
// nach vorn und federn beim Anhalten nach (src/animation/bodyLife.js). Blinzeln und "beschäftigt" nur mit data.idle.
const BREATH_SECONDS = 3.9;
const BREATH_AMOUNT = 0.007;
const BLINK_SECONDS = [0.1, 0.18];
const BUSY_EVERY = [5, 11];  // so lange (Sekunden, zufällig) steht die Figur still, bevor sie etwas tut
const BUSY_SECONDS = [2.2, 3.8];
const ACCELERATE = 0.3;      // so lange (Sekunden) braucht eine Figur, um loszulaufen bzw. abzubremsen

const between = ([a, b]) => a + Math.random() * (b - a);

// Anteil der Strecke nach Anteil der Zeit: anlaufen – gleichmäßig gehen – abbremsen
function walkProgress(t, duration) {
  const ramp = Math.min(ACCELERATE / duration, 0.3);
  const top = 1 / (1 - ramp); // Höchsttempo, damit die ganze Strecke in der Zeit geschafft wird
  if (t < ramp) return (0.5 * top * t * t) / ramp;
  if (t > 1 - ramp) return 1 - (0.5 * top * (1 - t) ** 2) / ramp;
  return 0.5 * top * ramp + top * (t - ramp);
}

export class Character {
  constructor(data) {
    this.data = data;
    this.id = data.id;
    this.name = data.name;
    this.x = data.x;
    this.y = data.y;
    this.pose = data.pose ?? 'front';
    this.size = data.size ?? 1;
    this.alpha = 1;          // zum Ein- und Ausblenden
    this.talking = false;    // solange die Figur spricht, zeigt sie die Pose "talk"
    this.images = {};
    this.walk = null;        // { from, to, duration, age, resolve, view }
    this.walkFrames = {};    // { left: [Bilder], right: [...], front: [...] }
    this.walkMeta = null;
    this.stepPhase = 0;      // 0 … 1 = ein Durchlauf der Laufbilder (zwei Schritte)
    this.fadeTween = null;   // { from, to, duration, age, resolve }
    this.lastHeight = 300;   // zuletzt gezeichnete Höhe (für die Schrittlänge)
    this.cursor = data.cursor ?? 'talk';
    this.walkTo = data.walkTo;
    this.facing = data.facing;
    this.when = data.when;
    this.isCharacter = true;
    this.life = new BodyLife({ breathSeconds: BREATH_SECONDS * (0.9 + Math.random() * 0.2), breathAmount: BREATH_AMOUNT });
    this.nextBlink = 1 + Math.random() * 3;
    this.blinkLeft = 0;
    this.nextBusy = this.randomBusyDelay();
    this.busyLeft = 0;
  }

  randomBusyDelay() {
    return between(BUSY_EVERY);
  }

  async load() {
    const entries = await Promise.all(POSES.map(async (pose) => [pose, await loadImage(`${this.data.poses}/${pose}.webp`)]));
    this.images = Object.fromEntries(entries);
    for (const name of this.data.idle ?? []) this.images[name] = await loadImage(`${this.data.poses}/${name}.webp`);
    const actionFrames = Object.values(this.data.actions ?? {}).flatMap((a) => [...(a.intro ?? []), ...(a.loop ?? []), ...(a.outro ?? [])]);
    for (const name of new Set(actionFrames)) this.images[name] = await loadImage(`${this.data.poses}/${name}.webp`);
    const folder = this.data.poses.split('/').pop();
    const meta = (await loadWalkIndex())[folder];
    if (!meta) return;
    this.walkMeta = meta;
    await Promise.all(['left', 'right', 'front'].filter((view) => meta[view]).map(async (view) => {
      const frames = Array.from({ length: meta.frames }, (_, i) => `${this.data.poses}/walk-${view}/frame_${String(i + 1).padStart(3, '0')}.webp`);
      this.walkFrames[view] = await Promise.all(frames.map((src) => loadImage(src)));
    }));
  }

  // Wie hoch die Figur auf dem Bildschirm ist
  height(scene) {
    return scene.characterHeightAt(this.y) * this.size;
  }

  image() {
    const frames = this.walk && this.walkFrames[this.walk.view];
    if (frames) return frames[Math.floor(this.stepPhase * frames.length) % frames.length];
    if (this.action) return this.images[this.actionFrame()] ?? this.images.front;
    if (this.talking) return this.images.talk ?? this.images.front;
    if (this.pose === 'front' && !this.walk) {
      if (this.busyLeft > 0 && this.images.busy) return this.images.busy;
      if (this.blinkLeft > 0 && this.images.blink) return this.images.blink;
    }
    return this.images[this.pose] ?? this.images.front;
  }

  // Umriss (für Klicks): das Rechteck um die Figur
  get area() {
    return this.box ?? [];
  }

  // Läuft (oder gleitet, ohne Laufbilder) in "seconds" Sekunden zu einem Punkt. Sehr kurze Zeiten = hinstellen.
  moveTo(x, y, seconds = 1.5) {
    this.walk?.resolve();
    this.walk = null;
    if (seconds <= 0.15) {
      this.x = x;
      this.y = y;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const dx = x - this.x, dy = y - this.y;
      // Blickrichtung: seitlich, außer es geht fast gerade nach vorne (auf die Kamera zu)
      let view = dx > 0 ? 'right' : 'left';
      if (Math.abs(dx) < 3) view = this.pose === 'left' || this.pose === 'right' ? this.pose : 'right';
      if (dy > 0 && Math.abs(dy) > 1.4 * Math.abs(dx) && this.walkFrames.front) view = 'front';
      if (!this.walkMeta) view = Math.abs(dx) > 4 ? view : this.pose; // ohne Laufbilder: wie früher gleiten
      this.walk = { from: { x: this.x, y: this.y }, to: { x, y }, duration: seconds, age: 0, resolve, view };
      this.pose = view;
      this.stepPhase = 0;
    });
  }

  // Spielt eine Bewegung aus data.actions ab (Übergang hinein, Wiederholung für "seconds", Übergang zurück).
  // Läuft schon eine, wird sie nur verlängert. Fertig, wenn die Figur wieder normal steht.
  act(name, seconds = 2) {
    const def = this.data.actions?.[name];
    if (!def) return Promise.resolve();
    const intro = def.intro ?? [], outro = def.outro ?? [];
    const frame = def.frame ?? 0.16;
    if (this.action?.name === name && this.action.age < this.action.loopEnd) {
      this.action.loopEnd = Math.max(this.action.loopEnd, this.action.age + seconds);
      this.action.end = this.action.loopEnd + outro.length * frame;
      return this.action.done;
    }
    this.action?.resolve();
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    const loopStart = intro.length * frame;
    const loopEnd = loopStart + Math.max(0, seconds);
    this.action = { name, def, age: 0, loopStart, loopEnd, end: loopEnd + outro.length * frame, resolve, done };
    return done;
  }

  actionFrame() {
    const { def, age, loopStart, loopEnd } = this.action;
    const frame = def.frame ?? 0.16;
    if (age < loopStart) return def.intro[Math.floor(age / frame)];
    if (age < loopEnd && def.loop?.length) return def.loop[Math.floor((age - loopStart) / (def.loopFrame ?? frame)) % def.loop.length];
    const outro = def.outro ?? [];
    return outro[Math.min(outro.length - 1, Math.floor((age - loopEnd) / frame))] ?? def.loop?.[0];
  }

  updateAction(dt) {
    const a = this.action;
    if (!a) return;
    a.age += dt;
    if (a.age >= a.end) {
      this.action = null;
      a.resolve();
    }
  }

  // Ein- oder ausblenden (alpha 0 … 1)
  fade(to, seconds = 0.6) {
    this.fadeTween?.resolve();
    return new Promise((resolve) => {
      this.fadeTween = { from: this.alpha, to, duration: seconds, age: 0, resolve };
    });
  }

  update(dt) {
    this.updateAction(dt);
    this.updateIdle(dt);
    this.updateFade(dt);
    if (!this.walk) return;
    const w = this.walk;
    w.age += dt;
    const t = Math.min(1, w.age / w.duration);
    const s = walkProgress(t, w.duration);
    const x = w.from.x + (w.to.x - w.from.x) * s;
    const y = w.from.y + (w.to.y - w.from.y) * s;
    // Schritte passend zur Strecke: ein Durchlauf (zwei Schritte) = 2 × Schrittlänge
    const stride = this.walkMeta?.[w.view]?.stride ?? 0.2;
    this.stepPhase = (this.stepPhase + Math.hypot(x - this.x, y - this.y) / (2 * stride * this.lastHeight)) % 1;
    this.x = x;
    this.y = y;
    const gliding = !this.walkFrames[w.view];
    this.bounce = gliding && t < 1 ? Math.abs(Math.sin(w.age * 9)) * 4 * Math.min(1, s * 6, (1 - s) * 6) : 0;
    if (t >= 1) {
      this.walk = null;
      this.bounce = 0;
      w.resolve();
    }
  }

  updateFade(dt) {
    const f = this.fadeTween;
    if (!f) return;
    f.age += dt;
    const t = Math.min(1, f.age / f.duration);
    this.alpha = f.from + (f.to - f.from) * t;
    if (t >= 1) {
      this.fadeTween = null;
      f.resolve();
    }
  }

  updateIdle(dt) {
    const w = this.walk;
    const direction = w && w.view !== 'front' ? Math.sign(w.to.x - w.from.x) : 0;
    this.life.update(dt, { moving: !!w, talking: this.talking, direction });
    if (this.action && (this.walk || (this.talking && !this.action.def.whileTalking))) {
      this.action.resolve();
      this.action = null;
    }
    if (this.walk || this.talking || this.action) {
      this.blinkLeft = 0;
      this.busyLeft = 0;
      return;
    }
    if (this.blinkLeft > 0) this.blinkLeft -= dt;
    if (this.busyLeft > 0) this.busyLeft -= dt;
    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blinkLeft = between(BLINK_SECONDS);
      this.nextBlink = 2 + Math.random() * 4.5;
      if (Math.random() < 0.15) this.nextBlink = 0.3; // manchmal zweimal hintereinander
    }
    this.nextBusy -= dt;
    if (this.nextBusy <= 0) {
      const seconds = between(BUSY_SECONDS);
      this.nextBusy = this.randomBusyDelay() + seconds;
      if (this.data.busyAction && this.pose === 'front') this.act(this.data.busyAction, seconds);
      else this.busyLeft = seconds;
    }
  }

  draw(ctx, scene) {
    const image = this.image();
    if (!image || this.alpha <= 0) return;
    const height = this.height(scene);
    this.lastHeight = height;
    // Alle Bilder einer Figur haben ungefähr dieselbe Höhe; gemessen wird an der Vorderansicht
    const scale = height / this.images.front.height;
    const width = image.width * scale;
    const drawHeight = image.height * scale;
    const top = this.y - drawHeight - (this.bounce ?? 0);
    // Klickfläche nach dem Standbild (Laufbilder sind breiter, weil die Beine Platz brauchen)
    const boxWidth = (this.images[this.pose] ?? this.images.front).width * scale;
    // clipBottom: die Figur steht hinter etwas (z. B. hinter dem Tresen) – unterhalb dieser Linie unsichtbar
    const bottom = Math.min(this.y, this.data.clipBottom ?? this.y);
    this.box = [
      { x: this.x - boxWidth * 0.38, y: top },
      { x: this.x + boxWidth * 0.38, y: top },
      { x: this.x + boxWidth * 0.38, y: bottom },
      { x: this.x - boxWidth * 0.38, y: bottom },
    ];
    ctx.save();
    if (this.data.clipBottom) {
      ctx.beginPath();
      ctx.rect(0, 0, 1280, this.data.clipBottom);
      ctx.clip();
    }
    ctx.globalAlpha = this.alpha;
    if (!this.data.clipBottom) drawShadow(ctx, this.x, this.y, height);
    ctx.translate(this.x, top + drawHeight);
    const shake = this.action && this.action.age >= this.action.loopStart && this.action.age < this.action.loopEnd ? this.action.def.shake ?? 0 : 0;
    if (shake) ctx.translate((Math.random() - 0.5) * 2 * shake, (Math.random() - 0.5) * shake);
    this.life.apply(ctx);
    ctx.drawImage(image, -width / 2, -drawHeight, width, drawHeight);
    ctx.restore();
  }

  // Stelle über dem Kopf (für Sprechtexte)
  head(scene) {
    return { x: this.x, y: this.y - this.height(scene) - 14 };
  }
}

function drawShadow(ctx, x, y, height) {
  const radius = height * 0.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.22);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, 'rgba(20, 8, 2, 0.5)');
  gradient.addColorStop(1, 'rgba(20, 8, 2, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
