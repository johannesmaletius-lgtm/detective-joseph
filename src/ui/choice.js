import { View } from '../puzzles/view.js';
import { COLORS, FONTS, roundedRect, wrapText } from './text.js';

// Auswahl im Gespräch: Joseph kann aus mehreren Sätzen wählen, was er sagt (oder was er tut).
//
//   const index = await story.choose(['Wer sind Sie?', 'Was gibt es zu essen?', 'Tschüss.']);
//   // index = 0, 1, 2 … oder -1, wenn der Spieler mit Rechtsklick / Esc abbricht
//
// Die Sätze stehen untereinander in einem Kasten am unteren Bildrand. Schon gewählte Sätze
// (options als { text, used: true }) sind etwas blasser.

const WIDTH = 860;
const ROW = 36;
const PAD = 16;

export class Choice extends View {
  constructor() {
    super();
    this.options = [];
    this.hover = -1;
    this.staysInDark = true;
    this.help = '';
  }

  onOpen({ options, title = null }) {
    this.options = options.map((option) => (typeof option === 'string' ? { text: option } : option));
    this.title = title;
    this.hover = -1;
  }

  result() {
    return -1;
  }

  layout(ctx) {
    ctx.font = FONTS.speech;
    const rows = this.options.map((option) => wrapText(ctx, option.text, WIDTH - 2 * PAD - 30));
    const heights = rows.map((lines) => lines.length * 27 + (ROW - 27));
    const total = heights.reduce((sum, h) => sum + h, 0) + 2 * PAD + (this.title ? 30 : 0);
    const top = 690 - total;
    let y = top + PAD + (this.title ? 30 : 0);
    const boxes = rows.map((lines, i) => {
      const box = { x: 640 - WIDTH / 2 + PAD, y, width: WIDTH - 2 * PAD, height: heights[i], lines };
      y += heights[i];
      return box;
    });
    return { top, total, boxes };
  }

  contains() {
    return true;
  }

  pointerDown(point) {
    const index = this.indexAt(point);
    if (index >= 0) {
      this.sound('page');
      this.close(index);
    }
  }

  handleClick(point, right) {
    if (right) return this.close(-1);
    this.pointerDown(point);
  }

  indexAt(point) {
    if (!this.boxes) return -1;
    return this.boxes.findIndex((box) => point.x >= box.x && point.x <= box.x + box.width && point.y >= box.y && point.y <= box.y + box.height);
  }

  update(dt, mouse) {
    super.update(dt);
    if (this.isOpen && mouse) this.hover = this.indexAt(mouse);
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    const { top, total, boxes } = this.layout(ctx);
    this.boxes = boxes;
    const shade = ctx.createLinearGradient(0, top - 80, 0, 720);
    shade.addColorStop(0, 'rgba(6, 3, 2, 0)');
    shade.addColorStop(0.3, 'rgba(6, 3, 2, 0.55)');
    shade.addColorStop(1, 'rgba(6, 3, 2, 0.8)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, top - 80, 1280, 720 - top + 80);
    roundedRect(ctx, 640 - WIDTH / 2, top, WIDTH, total, 12);
    ctx.fillStyle = 'rgba(22, 13, 8, 0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (this.title) {
      ctx.font = FONTS.hintTitle;
      ctx.fillStyle = COLORS.brass;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(this.title.toUpperCase(), 640, top + 12);
    }
    ctx.font = FONTS.speech;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    boxes.forEach((box, i) => {
      const option = this.options[i];
      if (i === this.hover) {
        roundedRect(ctx, box.x, box.y + 2, box.width, box.height - 4, 8);
        ctx.fillStyle = 'rgba(217, 164, 65, 0.18)';
        ctx.fill();
      }
      ctx.fillStyle = i === this.hover ? '#ffe2a0' : option.used ? 'rgba(246, 231, 193, 0.5)' : COLORS.joseph;
      ctx.fillText('›', box.x + 10, box.y + (ROW - 27) / 2 + 1);
      box.lines.forEach((text, row) => ctx.fillText(text, box.x + 30, box.y + (ROW - 27) / 2 + 1 + row * 27));
    });
    ctx.restore();
  }
}
