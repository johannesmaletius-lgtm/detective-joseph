import { DOUBLE_CLICK } from '../config.js';

// Sammelt Maus- und Tastatureingaben und meldet sie an das Spiel weiter.
// Alle Positionen sind Bildschirmkoordinaten im 1280 × 720-Bild.
//
// Andere Teile des Spiels melden sich so an:
//   input.on('click', (click) => { ... click.x, click.y, click.double ... })
//   input.on('key', (key) => { ... })
export class Input {
  constructor(canvas, screen) {
    this.mouse = { x: 0, y: 0, inside: false };
    this.listeners = { click: [], key: [] };
    this.lastClick = null; // für die Doppelklick-Erkennung

    canvas.addEventListener('pointermove', (event) => {
      this.mouse = { ...screen.toGame(event.clientX, event.clientY), inside: true };
    });

    canvas.addEventListener('pointerleave', () => {
      this.mouse.inside = false;
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return; // nur die linke Maustaste (oder ein Fingertipp)
      const position = screen.toGame(event.clientX, event.clientY);
      this.mouse = { ...position, inside: true };
      this.emit('click', { ...position, double: this.isDoubleClick(position) });
    });

    // Das Rechtsklick-Menü des Browsers ausschalten – die rechte Maustaste
    // können wir später für eigene Aktionen verwenden.
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    window.addEventListener('keydown', (event) => {
      if (!event.repeat) this.emit('key', event.key.toLowerCase());
    });
  }

  on(type, callback) {
    this.listeners[type].push(callback);
  }

  emit(type, data) {
    for (const callback of this.listeners[type]) callback(data);
  }

  isDoubleClick(position) {
    const now = performance.now();
    const last = this.lastClick;
    const isDouble =
      last !== null &&
      now - last.time <= DOUBLE_CLICK.maxDelay &&
      Math.hypot(position.x - last.x, position.y - last.y) <= DOUBLE_CLICK.maxDistance;
    this.lastClick = isDouble ? null : { ...position, time: now }; // nach einem Doppelklick neu zählen
    return isDouble;
  }
}
