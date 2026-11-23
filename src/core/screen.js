import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const MAX_ZOOM = 2; // höchstens 2 echte Pixel pro Spielpixel

// Kümmert sich um die Zeichenfläche (Canvas).
//
// Das Spiel rechnet immer in 1280 × 720 "logischen" Pixeln. Die Zeichenfläche selbst
// bekommt so viele echte Pixel, wie sie auf dem Bildschirm groß ist (inklusive
// Retina-Schärfe) – dadurch bleibt das Bild in jeder Fenstergröße scharf.
export class Screen {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;

    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    window.addEventListener('resize', () => this.resize()); // z. B. beim Browser-Zoom
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    // Mehr als doppelte Auflösung (2560 × 1440) bringt keine Schärfe mehr – die Bilder sind nicht feiner
    // gemalt –, kostet auf großen Retina-Bildschirmen aber sehr viel Rechenzeit. Deshalb ist dort Schluss.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, (MAX_ZOOM * this.width) / Math.max(1, rect.width));
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  // Vor jedem Bild aufrufen: rechnet auf 1280 × 720 um und löscht das alte Bild.
  beginFrame() {
    const { ctx, canvas } = this;
    ctx.setTransform(canvas.width / this.width, 0, 0, canvas.height / this.height, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, this.width, this.height);
    return ctx;
  }

  // Rechnet eine Position im Browserfenster (z. B. vom Mausklick) in Spielkoordinaten um.
  toGame(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * this.width,
      y: ((clientY - rect.top) / rect.height) * this.height,
    };
  }
}
