import { COLORS, FONTS, roundedRect, wrapText } from './text.js';

// Tutorial-Hinweis: ein kleines Schild oben in der Mitte des Bildes.
// Welcher Hinweis wann erscheint, steht in src/story/tutorial.js.

const WIDTH = 600;

export class Hints {
  constructor() {
    this.text = null;
    this.shown = 0;    // 0 = unsichtbar, 1 = ganz sichtbar (weich ein- und ausgeblendet)
    this.next = null;  // Text, der nach dem Ausblenden erscheint
  }

  show(text) {
    if (text === this.text && !this.next) return;
    if (!this.text) this.text = text;
    else this.next = text;
  }

  hide() {
    this.next = null;
    if (this.text) this.next = '';
  }

  update(dt) {
    if (this.next !== null) {
      this.shown = Math.max(0, this.shown - dt * 5);
      if (this.shown === 0) {
        this.text = this.next || null;
        this.next = null;
      }
    } else if (this.text) {
      this.shown = Math.min(1, this.shown + dt * 4);
    }
  }

  draw(ctx) {
    if (!this.text || this.shown <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.shown;
    ctx.font = FONTS.hint;
    const lines = wrapText(ctx, this.text, WIDTH - 40);
    const height = 36 + lines.length * 23;
    const x = (1280 - WIDTH) / 2;
    const y = 14 - (1 - this.shown) * 10;
    ctx.fillStyle = 'rgba(20, 12, 7, 0.86)';
    roundedRect(ctx, x, y, WIDTH, height, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = FONTS.hintTitle;
    ctx.fillStyle = COLORS.brass;
    ctx.fillText('TUTORIAL', 640, y + 9);
    ctx.font = FONTS.hint;
    ctx.fillStyle = '#f3e2bf';
    lines.forEach((line, i) => ctx.fillText(line, 640, y + 28 + i * 23));
    ctx.restore();
  }
}
