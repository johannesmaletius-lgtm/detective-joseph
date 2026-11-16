import { DOUBLE_CLICK } from '../config.js';

// Sammelt Maus- und Tastatureingaben und meldet sie an das Spiel weiter.
// Alle Positionen sind Bildschirmkoordinaten im 1280 × 720-Bild.
//
// Andere Teile des Spiels melden sich so an:
//   input.on('click', (click) => { ... click.x, click.y, click.double, click.right ... })
//   input.on('release', (point) => { ... })   Maustaste losgelassen (zum Ziehen, z. B. Puzzleteile)
//   input.on('key', (key) => { ... })
//
// Rechtsklick (click.right = true) heißt im Spiel "anschauen". Auf dem Mac geht auch
// ctrl + Klick oder ein Klick mit zwei Fingern auf dem Trackpad.
export class Input {
  constructor(canvas, screen) {
    this.mouse = { x: 0, y: 0, inside: false };
    this.listeners = { click: [], release: [], key: [] };
    this.lastClick = null; // für die Doppelklick-Erkennung

    canvas.addEventListener('pointermove', (event) => {
      this.mouse = { ...screen.toGame(event.clientX, event.clientY), inside: true };
    });

    canvas.addEventListener('pointerleave', () => {
      this.mouse.inside = false;
    });

    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 && event.button !== 2) return; // nur linke und rechte Maustaste
      const position = screen.toGame(event.clientX, event.clientY);
      this.mouse = { ...position, inside: true };
      const right = event.button === 2 || event.ctrlKey;
      canvas.setPointerCapture?.(event.pointerId); // beim Ziehen die Maus auch außerhalb des Bildes verfolgen
      this.emit('click', { ...position, right, double: !right && this.isDoubleClick(position) });
    });

    canvas.addEventListener('pointerup', (event) => {
      this.emit('release', screen.toGame(event.clientX, event.clientY));
    });
    canvas.addEventListener('pointercancel', () => this.emit('release', { x: this.mouse.x, y: this.mouse.y }));

    // Das Rechtsklick-Menü des Browsers ausschalten – die rechte Maustaste brauchen wir zum Anschauen.
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
