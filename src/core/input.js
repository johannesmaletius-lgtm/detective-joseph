import { DOUBLE_CLICK } from '../config.js';
import { touch } from './touch.js';

// Sammelt Maus-, Finger- und Tastatureingaben und meldet sie an das Spiel weiter.
// Alle Positionen sind Bildschirmkoordinaten im 1280 × 720-Bild.
//
// Andere Teile des Spiels melden sich so an:
//   input.on('click', (click) => { ... click.x, click.y, click.double, click.right ... })
//   input.on('release', (point) => { ... })   Maustaste losgelassen (zum Ziehen, z. B. Puzzleteile)
//   input.on('key', (key) => { ... })
//   input.on('gesture', () => { ... })        echte Nutzergeste (hier darf der Browser Ton starten)
//
// Rechtsklick (click.right = true) heißt im Spiel "anschauen". Auf dem Mac geht auch
// ctrl + Klick oder ein Klick mit zwei Fingern auf dem Trackpad.
//
// Mit dem Finger (siehe src/core/touch.js):
//   Tippen = Linksklick (beim Loslassen), lange drücken = Rechtsklick, Finger ziehen = nur umsehen
//   (der Name unter dem Finger erscheint, die Taschenlampe folgt). Ist eine Nahansicht offen
//   (dragMode), verhält sich der Finger wie die Maus: Klick sofort beim Aufsetzen, Ziehen zieht.

const LONG_PRESS = 0.5;   // Sekunden
const MOVE_SLOP = 12;     // so weit (CSS-Pixel) darf der Finger beim Tippen verrutschen

export class Input {
  constructor(canvas, screen) {
    this.mouse = { x: 0, y: 0, inside: false };
    this.listeners = { click: [], release: [], key: [], gesture: [] };
    this.lastClick = null; // für die Doppelklick-Erkennung
    this.press = null;     // Finger, der gerade aufliegt
    this.lastTouchUp = -Infinity;
    this.dragMode = () => false;       // setzt das Spiel: true, solange etwas zum Ziehen offen ist
    this.allowLongPress = () => true;  // setzt das Spiel: darf langes Drücken „anschauen“ heißen?

    canvas.addEventListener('pointermove', (event) => {
      const position = screen.toGame(event.clientX, event.clientY);
      if (event.pointerType === 'mouse') {
        touch.active = false;
        this.mouse = { ...position, inside: true };
        return;
      }
      const press = this.press;
      if (!press || press.id !== event.pointerId) return;
      this.mouse = { ...position, inside: true, down: true };
      if (!press.moved && Math.hypot(event.clientX - press.clientX, event.clientY - press.clientY) > MOVE_SLOP) {
        press.moved = true; // jetzt ist es Ziehen bzw. Umsehen, kein Tippen mehr
      }
    });

    canvas.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') this.mouse.inside = false; // der Finger bleibt „liegen“
    });

    canvas.addEventListener('pointerdown', (event) => {
      const position = screen.toGame(event.clientX, event.clientY);
      if (event.pointerType !== 'mouse') return this.touchDown(event, position, canvas);
      touch.active = false;
      if (event.button !== 0 && event.button !== 2) return; // nur linke und rechte Maustaste
      this.mouse = { ...position, inside: true };
      const right = event.button === 2 || event.ctrlKey;
      canvas.setPointerCapture?.(event.pointerId); // beim Ziehen die Maus auch außerhalb des Bildes verfolgen
      this.emit('click', { ...position, right, double: !right && this.isDoubleClick(position) });
    });

    canvas.addEventListener('pointerup', (event) => {
      const position = screen.toGame(event.clientX, event.clientY);
      if (event.pointerType !== 'mouse') return this.touchUp(event, position, true);
      this.emit('release', position);
    });
    canvas.addEventListener('pointercancel', (event) => {
      if (event.pointerType !== 'mouse') return this.touchUp(event, { x: this.mouse.x, y: this.mouse.y }, false);
      this.emit('release', { x: this.mouse.x, y: this.mouse.y });
    });

    // Das Rechtsklick-Menü des Browsers ausschalten – die rechte Maustaste brauchen wir zum Anschauen.
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    // iPad: kein Zoomen per Doppeltippen, keine Lupe und kein Kopieren-Menü beim langen Drücken
    canvas.addEventListener('touchstart', (event) => event.preventDefault(), { passive: false });

    window.addEventListener('keydown', (event) => {
      if (!event.repeat) this.emit('key', event.key.toLowerCase());
    });

    // Ton darf iOS nur nach einer „echten“ Geste starten (touchend / click / keydown)
    for (const type of ['touchend', 'pointerup', 'click', 'keydown']) {
      window.addEventListener(type, () => this.emit('gesture'), { passive: true });
    }
  }

  touchDown(event, position, canvas) {
    touch.active = true;
    if (this.press) return; // ein zweiter Finger zählt nicht
    canvas.setPointerCapture?.(event.pointerId);
    this.mouse = { ...position, inside: true, down: true };
    const press = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY, start: position, time: performance.now(), moved: false, done: false };
    this.press = press;
    if (this.dragMode()) {
      // Nahansicht: wie mit der Maus – sofort klicken, Ziehen zieht
      press.done = true;
      press.drag = true;
      this.emit('click', { ...position, right: false, double: false });
    }
  }

  touchUp(event, position, tap) {
    const press = this.press;
    if (!press || press.id !== event.pointerId) return;
    this.press = null;
    this.lastTouchUp = performance.now();
    this.mouse = { ...position, inside: true, down: false };
    if (tap && !press.done && !press.moved) {
      this.emit('click', { ...press.start, right: false, double: this.isDoubleClick(press.start) });
    }
    this.emit('release', position);
  }

  // In jedem Bild: Finger lange genug still → anschauen (Rechtsklick)
  update() {
    const press = this.press;
    if (!press || press.done || press.moved) return;
    if (this.holdProgress < 1) return;
    press.done = true;
    if (this.allowLongPress()) this.emit('click', { ...press.start, right: true, double: false });
  }

  // 0 … 1: wie weit das lange Drücken schon ist (für den Ring um den Finger)
  get holdProgress() {
    const press = this.press;
    if (!press || press.done || press.moved || !this.allowLongPress()) return 0;
    return Math.min(1, (performance.now() - press.time) / 1000 / LONG_PRESS);
  }

  // Sekunden seit der Finger zuletzt losgelassen wurde (Name unter dem Finger bleibt kurz stehen)
  get sinceTouchUp() {
    return this.press ? 0 : (performance.now() - this.lastTouchUp) / 1000;
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
