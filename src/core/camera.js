// Die Kamera bestimmt, welcher Ausschnitt der Spielwelt zu sehen ist.
//
// - Kein Zoom: 1 Pixel der Spielwelt = 1 Pixel im 1280 × 720-Bild.
// - Das erste Zugabteil passt komplett ins Bild, deshalb bleibt die Kamera bei (0, 0).
//   Für spätere, breitere Szenen kann sie seitlich verschoben werden.
// - shakeY: kleines Zittern nach oben/unten (der fahrende Zug rumpelt), nur wenige Pixel.
// - Die Benutzeroberfläche (z. B. das Inventar) wird OHNE Kamera gezeichnet und bleibt
//   dadurch immer ruhig an derselben Stelle auf dem Bildschirm.
export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.shakeY = 0;
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.shakeY = 0;
  }

  // Beim Zeichnen der Spielwelt: alles um die Kameraposition verschieben.
  apply(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y) + this.shakeY);
  }

  // Bildschirmposition (z. B. ein Mausklick) → Position in der Spielwelt
  screenToWorld(point) {
    return { x: point.x + this.x, y: point.y + this.y - this.shakeY };
  }
}
