import { loadImage } from '../core/assets.js';
import { paintIcon } from '../core/paint.js';
import { ITEMS } from '../story/items.js';

// Die Inventarleiste mit 5 Plätzen. Hat Joseph mehr als 5 Gegenstände dabei, erscheinen links und
// rechts kleine Pfeile zum Weiterschieben.
//
// Sie liegt versteckt am unteren Bildrand (nur ihre Oberkante schaut heraus) und fährt herein,
// sobald die Maus an den unteren Rand kommt – oder kurz, wenn Joseph etwas Neues einsteckt.
//
// Linksklick auf einen Gegenstand: Joseph nimmt ihn "in die Hand" (er hängt dann am Mauszeiger).
// Damit auf etwas im Abteil klicken = benutzen, auf einen anderen Gegenstand klicken = kombinieren.

const BAR = 'assets/ui/inventory-bar.png';
const WIDTH = 720;                 // Breite der Leiste im Spielbild
const PEEK = 14;                   // so viele Pixel schauen heraus, wenn sie versteckt ist
const SLOTS = 5;
const SLOT_CENTERS = [307, 491, 676, 859, 1044]; // Mitte der Plätze im Bild der Leiste (x)
const SLOT_CENTER_Y = 128;
const SLOT_SIZE = 130;             // Größe eines Platzes im Bild der Leiste
const SHOW_ZONE = 46;              // so nah am unteren Rand fährt die Leiste heraus
const EDGE = 26;                   // so hoch ist der Nietenstreifen an der Oberkante (Spielpixel)
const ARROW_CENTERS = [214, 1137]; // Mitte der Pfeile zum Weiterschieben im Bild der Leiste (x)
const ARROW_REACH = 34;            // so nah am Pfeil zählt ein Klick (im Bild der Leiste)

export class Inventory {
  constructor() {
    this.items = [];       // Namen der Gegenstände, z. B. ['letter', 'knife']
    this.selected = null;  // Gegenstand, den Joseph gerade "in der Hand" hält
    this.images = {};
    this.bar = null;
    this.slide = 0;        // 0 = versteckt, 1 = ganz herausgefahren
    this.revealTime = 0;   // so lange (Sekunden) bleibt sie noch von selbst draußen
    this.flash = null;     // { index, age }: neu eingesteckter Gegenstand leuchtet kurz auf
    this.offset = 0;       // so viele Gegenstände sind nach links aus der Leiste geschoben
  }

  async load() {
    this.bar = await loadImage(BAR);
    // Gegenstände ab Wagen 4 sind im Code gezeichnet (icon oder paint), die aus Wagen 1 sind Bilder (image)
    const entries = await Promise.all(Object.entries(ITEMS).map(async ([id, item]) => [id, this.images[id] ?? (item.icon ? drawIcon(item.icon) : item.paint ? paintIcon(item.paint) : await loadImage(item.image))]));
    this.images = Object.fromEntries(entries);
  }

  get scale() {
    return WIDTH / this.bar.width;
  }

  get height() {
    return this.bar.height * this.scale;
  }

  get top() {
    const hidden = 720 - PEEK;
    const shown = 720 - this.height;
    return hidden + (shown - hidden) * easeOut(this.slide);
  }

  // Neuer Wagen: leere Leiste – nur mit dem, was Joseph aus früheren Wagen mitbringt
  clear(items = []) {
    this.items = [...items];
    this.selected = null;
    this.offset = 0;
    this.flash = null;
    this.slide = 0;
    this.revealTime = 0;
  }

  has(id) {
    return this.items.includes(id);
  }

  add(id) {
    if (this.has(id)) return;
    this.items.push(id);
    this.flash = { index: this.items.length - 1, age: 0 };
    this.offset = Math.max(0, this.items.length - SLOTS); // das Neue soll zu sehen sein
    this.reveal(2.6);
  }

  remove(id) {
    this.items = this.items.filter((item) => item !== id);
    if (this.selected === id) this.selected = null;
    this.offset = Math.min(this.offset, Math.max(0, this.items.length - SLOTS));
  }

  // Pfeil unter dem Punkt: −1 = nach links schieben, +1 = nach rechts, 0 = kein Pfeil
  arrowAt(point) {
    if (!this.contains(point) || this.items.length <= SLOTS) return 0;
    const left = (1280 - WIDTH) / 2;
    const y = this.top + SLOT_CENTER_Y * this.scale;
    const hit = (cx) => Math.hypot(point.x - (left + cx * this.scale), point.y - y) <= ARROW_REACH * this.scale;
    if (hit(ARROW_CENTERS[0]) && this.offset > 0) return -1;
    if (hit(ARROW_CENTERS[1]) && this.offset < this.items.length - SLOTS) return 1;
    return 0;
  }

  scroll(direction) {
    this.offset = Math.min(Math.max(0, this.offset + direction), Math.max(0, this.items.length - SLOTS));
  }

  // Ersetzt einen Gegenstand an derselben Stelle (z. B. leere Taschenlampe → Taschenlampe)
  replace(id, newId) {
    const index = this.items.indexOf(id);
    if (index < 0) return this.add(newId);
    this.items[index] = newId;
    this.flash = { index, age: 0 };
    this.offset = Math.min(Math.max(this.offset, index - SLOTS + 1), index);
    this.reveal(2);
  }

  reveal(seconds) {
    this.revealTime = Math.max(this.revealTime, seconds);
  }

  update(dt, mouse) {
    this.revealTime = Math.max(0, this.revealTime - dt);
    const mouseNear = mouse.inside && (mouse.y > 720 - SHOW_ZONE || (this.slide > 0.5 && this.containsBar(mouse)));
    const target = mouseNear || this.revealTime > 0 ? 1 : 0;
    this.slide += Math.sign(target - this.slide) * Math.min(Math.abs(target - this.slide), dt * 7);
    if (this.flash) {
      this.flash.age += dt;
      if (this.flash.age > 1.2) this.flash = null;
    }
  }

  get isOpen() {
    return this.slide > 0.6;
  }

  // Die Leiste "zählt" erst ein Stück unter ihrer Oberkante: Der schmale Nietenstreifen oben lässt Klicks
  // durch, damit man Dinge am Boden (z. B. das zerrissene Papier) auch bei offener Leiste erreicht.
  containsBar(point) {
    const left = (1280 - WIDTH) / 2;
    return point.x >= left && point.x <= left + WIDTH && point.y >= this.top + EDGE;
  }

  // Liegt der Punkt auf der (herausgefahrenen) Leiste?
  contains(point) {
    return this.isOpen && this.containsBar(point);
  }

  // Welcher Gegenstand liegt unter dem Punkt? (Name oder null)
  itemAt(point) {
    if (!this.contains(point)) return null;
    const index = this.slotRects().findIndex((r) => point.x >= r.x && point.x <= r.x + r.size && point.y >= r.y && point.y <= r.y + r.size);
    return index < 0 ? null : this.items[this.offset + index] ?? null;
  }

  slotRects() {
    const left = (1280 - WIDTH) / 2;
    const size = SLOT_SIZE * this.scale;
    return SLOT_CENTERS.map((cx) => ({
      x: left + cx * this.scale - size / 2,
      y: this.top + SLOT_CENTER_Y * this.scale - size / 2,
      size,
    }));
  }

  // Pfeile zum Weiterschieben (nur bei mehr als 5 Gegenständen)
  drawArrows(ctx, left) {
    if (this.items.length <= SLOTS) return;
    const y = this.top + SLOT_CENTER_Y * this.scale;
    [-1, 1].forEach((direction, i) => {
      const active = direction < 0 ? this.offset > 0 : this.offset < this.items.length - SLOTS;
      const x = left + ARROW_CENTERS[i] * this.scale;
      ctx.save();
      ctx.globalAlpha = active ? 1 : 0.25;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#2a1c12';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d9a441';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 3 * direction, y - 6);
      ctx.lineTo(x + 5 * direction, y);
      ctx.lineTo(x - 3 * direction, y + 6);
      ctx.closePath();
      ctx.fillStyle = '#d9a441';
      ctx.fill();
      ctx.restore();
    });
  }

  draw(ctx) {
    if (!this.bar) return;
    const left = (1280 - WIDTH) / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 18;
    ctx.drawImage(this.bar, left, this.top, WIDTH, this.height);
    ctx.restore();
    if (this.slide <= 0.02) return;

    this.drawArrows(ctx, left);
    this.slotRects().forEach((rect, slot) => {
      const index = this.offset + slot;
      const id = this.items[index];
      if (!id) return;
      const flash = this.flash?.index === index ? 1 - this.flash.age / 1.2 : 0;
      if (flash > 0) {
        const glow = ctx.createRadialGradient(rect.x + rect.size / 2, rect.y + rect.size / 2, 0, rect.x + rect.size / 2, rect.y + rect.size / 2, rect.size * 0.7);
        glow.addColorStop(0, `rgba(255, 220, 140, ${0.55 * flash})`);
        glow.addColorStop(1, 'rgba(255, 220, 140, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(rect.x - 10, rect.y - 10, rect.size + 20, rect.size + 20);
      }
      ctx.save();
      if (id === this.selected) ctx.globalAlpha = 0.3; // hängt gerade am Mauszeiger
      const inset = rect.size * 0.08;
      ctx.drawImage(this.images[id], rect.x + inset, rect.y + inset, rect.size - 2 * inset, rect.size - 2 * inset);
      ctx.restore();
    });
  }
}

function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

// Zeichnet ein Gegenstandsbild (128 × 128) mit einer Zeichenfunktion icon(ctx)
function drawIcon(icon) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  icon(ctx);
  return canvas;
}
