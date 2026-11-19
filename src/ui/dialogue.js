import { View } from '../puzzles/view.js';
import { COLORS, FONTS, roundedRect, wrapText } from './text.js';

// Gesprächsauswahl: unten erscheint eine Liste, was Joseph sagen oder fragen kann.
//
//   const choice = await story.choose(['Was kochen Sie?', 'Wer sitzt hier?', 'Tschüss.']);
//   // choice = 0, 1, 2 … oder -1 (Rechtsklick / Esc: Gespräch beenden)
//
// Schon gewählte Fragen erscheinen etwas blasser (options als { text, done: true }).

const PANEL = { x: 150, width: 980, bottom: 700, padding: 18, row: 34 };

export class DialogueView extends View {
  constructor() {
    super();
    this.options = [];
    this.mouse = { x: 0, y: 0 };
    this.staysInDark = true;
    this.help = '';
  }

  onOpen({ options }) {
    this.options = options.map((option) => (typeof option === 'string' ? { text: option } : option));
  }

  result() {
    return -1;
  }

  layout(ctx) {
    ctx.font = FONTS.speech;
    const rows = this.options.map((option) => wrapText(ctx, option.text, PANEL.width - PANEL.padding * 2 - 30));
    const height = rows.reduce((sum, lines) => sum + lines.length * 28 + 8, 0) + PANEL.padding * 2;
    let y = PANEL.bottom - height + PANEL.padding;
    return {
      top: PANEL.bottom - height,
      height,
      items: rows.map((lines, i) => {
        const item = { index: i, lines, y, h: lines.length * 28 + 8 };
        y += item.h;
        return item;
      }),
    };
  }

  itemAt(point) {
    if (!this.lastLayout) return null;
    return this.lastLayout.items.find((item) => point.x >= PANEL.x && point.x <= PANEL.x + PANEL.width && point.y >= item.y && point.y < item.y + item.h) ?? null;
  }

  contains() {
    return true;
  }

  pointerDown(point) {
    if (this.age < 0.25) return;
    const item = this.itemAt(point);
    if (item) {
      this.sound('click');
      this.close(item.index);
    }
  }

  update(dt, mouse) {
    super.update(dt);
    if (mouse) this.mouse = mouse;
  }

  draw(ctx) {
    const layout = (this.lastLayout = this.layout(ctx));
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    ctx.fillStyle = 'rgba(12, 7, 4, 0.82)';
    roundedRect(ctx, PANEL.x, layout.top, PANEL.width, layout.height, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    const hovered = this.itemAt(this.mouse);
    ctx.font = FONTS.speech;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const item of layout.items) {
      const option = this.options[item.index];
      const active = hovered === item;
      ctx.fillStyle = active ? '#ffe39a' : option.done ? 'rgba(246, 231, 193, 0.5)' : COLORS.joseph;
      ctx.fillText(active ? '▸' : '·', PANEL.x + PANEL.padding, item.y + 4);
      item.lines.forEach((line, i) => ctx.fillText(line, PANEL.x + PANEL.padding + 26, item.y + 4 + i * 28));
    }
    ctx.restore();
  }
}
