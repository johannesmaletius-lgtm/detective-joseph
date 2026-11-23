import { loadImage } from '../core/assets.js';

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
//   }]                                  // blinzelt ab und zu und tut ab und zu etwas (Topf rühren, Kragen zupfen …)
//
// Eine Figur ist zugleich eine anklickbare Stelle (cursor: 'talk'); ihre Reaktionen stehen im
// Drehbuch unter hotspots mit derselben id.

const POSES = ['front', 'left', 'right', 'talk'];

// Lebenszeichen beim Herumstehen: alle Figuren atmen; blinzeln und "beschäftigt" nur mit data.idle
const BREATH_SECONDS = 3.9;
const BREATH_AMOUNT = 0.007;
const BLINK_SECONDS = 0.14;
const BUSY_EVERY = [5, 11];  // so lange (Sekunden, zufällig) steht die Figur still, bevor sie etwas tut
const BUSY_SECONDS = 3;

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
    this.walk = null;        // { from, to, duration, age, resolve }
    this.cursor = data.cursor ?? 'talk';
    this.walkTo = data.walkTo;
    this.facing = data.facing;
    this.when = data.when;
    this.isCharacter = true;
    this.clock = Math.random() * 10; // damit nicht alle Figuren im Gleichtakt atmen
    this.nextBlink = 1 + Math.random() * 3;
    this.blinkLeft = 0;
    this.nextBusy = this.randomBusyDelay();
    this.busyLeft = 0;
  }

  randomBusyDelay() {
    return BUSY_EVERY[0] + Math.random() * (BUSY_EVERY[1] - BUSY_EVERY[0]);
  }

  async load() {
    const entries = await Promise.all(POSES.map(async (pose) => [pose, await loadImage(`${this.data.poses}/${pose}.webp`)]));
    this.images = Object.fromEntries(entries);
    for (const name of this.data.idle ?? []) this.images[name] = await loadImage(`${this.data.poses}/${name}.webp`);
  }

  // Wie hoch die Figur auf dem Bildschirm ist
  height(scene) {
    return scene.characterHeightAt(this.y) * this.size;
  }

  image() {
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

  // Gleitet zu einem Punkt (einfach, ohne Laufanimation – die Figuren haben nur Standbilder)
  moveTo(x, y, seconds = 1.5) {
    this.walk?.resolve();
    return new Promise((resolve) => {
      this.walk = { from: { x: this.x, y: this.y }, to: { x, y }, duration: seconds, age: 0, resolve };
      if (Math.abs(x - this.x) > 4) this.pose = x > this.x ? 'right' : 'left';
    });
  }

  update(dt) {
    this.updateIdle(dt);
    if (!this.walk) return;
    const w = this.walk;
    w.age += dt;
    const t = Math.min(1, w.age / w.duration);
    this.x = w.from.x + (w.to.x - w.from.x) * t;
    this.y = w.from.y + (w.to.y - w.from.y) * t;
    this.bounce = Math.abs(Math.sin(w.age * 9)) * 4 * (t < 1 ? 1 : 0);
    if (t >= 1) {
      this.walk = null;
      this.bounce = 0;
      w.resolve();
    }
  }

  updateIdle(dt) {
    this.clock += dt;
    if (this.walk || this.talking) {
      this.blinkLeft = 0;
      this.busyLeft = 0;
      return;
    }
    if (this.blinkLeft > 0) this.blinkLeft -= dt;
    if (this.busyLeft > 0) this.busyLeft -= dt;
    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blinkLeft = BLINK_SECONDS;
      this.nextBlink = 2.5 + Math.random() * 3.5;
    }
    this.nextBusy -= dt;
    if (this.nextBusy <= 0) {
      this.nextBusy = this.randomBusyDelay() + BUSY_SECONDS;
      this.busyLeft = BUSY_SECONDS;
    }
  }

  draw(ctx, scene) {
    const image = this.image();
    if (!image || this.alpha <= 0) return;
    const height = this.height(scene);
    // Alle Bilder einer Figur haben ungefähr dieselbe Höhe; gemessen wird an der Vorderansicht
    const scale = height / this.images.front.height;
    const width = image.width * scale;
    const drawHeight = image.height * scale;
    const top = this.y - drawHeight - (this.bounce ?? 0);
    // clipBottom: die Figur steht hinter etwas (z. B. hinter dem Tresen) – unterhalb dieser Linie unsichtbar
    const bottom = Math.min(this.y, this.data.clipBottom ?? this.y);
    this.box = [
      { x: this.x - width * 0.38, y: top },
      { x: this.x + width * 0.38, y: top },
      { x: this.x + width * 0.38, y: bottom },
      { x: this.x - width * 0.38, y: bottom },
    ];
    ctx.save();
    if (this.data.clipBottom) {
      ctx.beginPath();
      ctx.rect(0, 0, 1280, this.data.clipBottom);
      ctx.clip();
    }
    ctx.globalAlpha = this.alpha;
    if (!this.data.clipBottom) drawShadow(ctx, this.x, this.y, height);
    // Atmen: minimal nach oben dehnen, die Füße bleiben stehen
    const breath = this.walk ? 0 : (Math.sin((this.clock * Math.PI * 2) / BREATH_SECONDS) * 0.5 + 0.5) * BREATH_AMOUNT;
    ctx.translate(this.x, top + drawHeight);
    ctx.scale(1, 1 + breath);
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
