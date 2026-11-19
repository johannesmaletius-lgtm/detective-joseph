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
//   }]
//
// Eine Figur ist zugleich eine anklickbare Stelle (cursor: 'talk'); ihre Reaktionen stehen im
// Drehbuch unter hotspots mit derselben id.

const POSES = ['front', 'left', 'right', 'talk'];

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
  }

  async load() {
    const entries = await Promise.all(POSES.map(async (pose) => [pose, await loadImage(`${this.data.poses}/${pose}.webp`)]));
    this.images = Object.fromEntries(entries);
  }

  // Wie hoch die Figur auf dem Bildschirm ist
  height(scene) {
    return scene.characterHeightAt(this.y) * this.size;
  }

  image() {
    return this.images[this.talking ? 'talk' : this.pose] ?? this.images.front;
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

  draw(ctx, scene) {
    const image = this.image();
    if (!image || this.alpha <= 0) return;
    const height = this.height(scene);
    // Alle Bilder einer Figur haben ungefähr dieselbe Höhe; gemessen wird an der Vorderansicht
    const scale = height / this.images.front.height;
    const width = image.width * scale;
    const drawHeight = image.height * scale;
    const top = this.y - drawHeight - (this.bounce ?? 0);
    this.box = [
      { x: this.x - width * 0.38, y: top },
      { x: this.x + width * 0.38, y: top },
      { x: this.x + width * 0.38, y: this.y },
      { x: this.x - width * 0.38, y: this.y },
    ];
    ctx.save();
    ctx.globalAlpha = this.alpha;
    drawShadow(ctx, this.x, this.y, height);
    ctx.drawImage(image, this.x - width / 2, top, width, drawHeight);
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
