import { View } from './view.js';

// Eine allgemeine Nahansicht: ein gezeichnetes Bild mit anklickbaren Stellen.
// Damit sind viele kleine Rätsel gebaut – das Tablett mit den Gläsern, das Flaschenregal, die
// Taschenuhr, der Projektor, die Suchbilder …
//
//   const result = await story.view('picture', {
//     draw: (ctx, view) => { … },                    // zeichnet die Nahansicht (view.age, view.mouse)
//     spots: [{ id: 'glass1', x, y, w, h, label: 'Glas' }],   // Rechtecke … oder Kreise { id, cx, cy, r }
//                                                    // (spots darf auch eine Funktion sein, die die Liste liefert)
//     onClick: async (spot, view) => { … },          // Linksklick auf eine Stelle; view.close(ergebnis) schließt
//     onMiss: async (point, view) => { … },          // (optional) Linksklick daneben, aber auf dem Bild
//     onRelease: (spot, view, point) => { … },       // (optional) Maustaste losgelassen (Ziehen und Ablegen)
//     area: { x, y, w, h },                          // (optional) das Bild – ein Klick daneben schließt
//     update: (dt, view) => { … },                   // (optional) in jedem Bild
//     help: 'Klicken: …',
//     staysInDark: false,
//     opaque: false,                                 // (optional) true: das Bild deckt alles ab
//   });
//
// Solange die Reaktion auf einen Klick läuft (z. B. Joseph spricht), überspringt ein weiterer Klick
// nur den Satz.

export class PictureView extends View {
  constructor() {
    super();
    this.options = {};
    this.mouse = { x: 0, y: 0 };
    this.running = false;
    this.state = {}; // Platz für das Rätsel, z. B. wo die Zeiger einer Uhr stehen
  }

  onOpen(options) {
    this.options = options;
    this.running = false;
    this.state = options.state ?? {};
    this.staysInDark = Boolean(options.staysInDark);
    this.help = options.help ?? 'Klicken: untersuchen  ·  Rechtsklick: zurück';
  }

  // Verdeckt die Ansicht das Abteil ganz (Option opaque)? Dann muss es nicht mitgezeichnet werden.
  get covers() {
    return Boolean(this.options.opaque) && this.fadeIn >= 1;
  }

  get spots() {
    const spots = this.options.spots;
    return (typeof spots === 'function' ? spots(this) : spots) ?? [];
  }

  spotAt(point) {
    return this.spots.find((spot) => (spot.r !== undefined
      ? Math.hypot(point.x - spot.cx, point.y - spot.cy) <= spot.r
      : point.x >= spot.x && point.x <= spot.x + spot.w && point.y >= spot.y && point.y <= spot.y + spot.h)) ?? null;
  }

  // Name der Stelle unter der Maus (steht am Mauszeiger)
  labelAt(point) {
    return this.spotAt(point)?.label ?? '';
  }

  contains(point) {
    const area = this.options.area;
    if (!area) return true;
    return point.x >= area.x && point.x <= area.x + area.w && point.y >= area.y && point.y <= area.y + area.h;
  }

  async pointerDown(point) {
    if (this.running) return this.onSkip?.();
    const spot = this.spotAt(point);
    const action = spot ? this.options.onClick?.(spot, this) : this.options.onMiss?.(point, this);
    if (!action) return;
    this.running = true;
    try {
      await action;
    } finally {
      this.running = false;
    }
  }

  // Maustaste losgelassen (z. B. Ziehen und Ablegen): options.onRelease(spot, view)
  pointerUp(point) {
    if (this.running || !this.isOpen) return;
    const action = this.options.onRelease?.(this.spotAt(point), this, point);
    if (!action) return;
    this.running = true;
    Promise.resolve(action).finally(() => {
      this.running = false;
    });
  }

  update(dt, mouse) {
    super.update(dt);
    if (!this.isOpen) return;
    if (mouse) this.mouse = mouse;
    this.options.update?.(dt, this);
  }

  draw(ctx) {
    this.drawBackdrop(ctx, this.options.backdrop ?? 0.85);
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    this.options.draw?.(ctx, this);
    ctx.restore();
    // Stelle unter der Maus leicht hervorheben
    const spot = !this.running && this.spotAt(this.mouse);
    if (spot && !spot.quiet) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 220, 140, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      if (spot.r !== undefined) {
        ctx.beginPath();
        ctx.arc(spot.cx, spot.cy, spot.r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
      }
      ctx.restore();
    }
    this.drawHelp(ctx);
  }
}
