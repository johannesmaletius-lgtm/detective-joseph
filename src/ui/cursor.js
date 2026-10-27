import { loadImages } from '../core/assets.js';
import { FONTS, COLORS, outlinedText } from './text.js';

// Der Mauszeiger. Er zeigt, was ein Klick bewirkt:
//   Zeigefinger = laufen   Auge = anschauen   Hand = benutzen/nehmen   Sprechblase = sprechen
// Hält Joseph gerade einen Gegenstand "in der Hand", hängt dieser am Zeiger.
// Daneben steht der Name dessen, was unter dem Zeiger liegt.
//
// Der Zeiger wird ins Spielbild gezeichnet (der normale Mauszeiger ist ausgeblendet, siehe style.css).

const SIZE = 46; // Höhe in Spielpixeln

// hot = die Stelle im Bild, die genau auf der Mausposition liegt (Anteil von Breite/Höhe)
const KINDS = {
  walk: { src: 'assets/ui/cursors/walk.png', hot: [0.46, 0.03] }, // Fingerspitze
  look: { src: 'assets/ui/cursors/look.png', hot: [0.5, 0.5] },
  interact: { src: 'assets/ui/cursors/interact.png', hot: [0.5, 0.45] },
  talk: { src: 'assets/ui/cursors/talk.png', hot: [0.5, 0.5] },
};

export class Cursor {
  constructor() {
    this.images = null;
    this.kind = 'walk';
    this.label = '';
    this.item = null;     // Bild des Gegenstands, der gerade am Zeiger hängt
    this.visible = true;
  }

  async load() {
    this.images = await loadImages(Object.fromEntries(Object.entries(KINDS).map(([kind, { src }]) => [kind, src])));
  }

  // Wird in jedem Bild vom Spiel gesetzt
  set({ kind = 'walk', label = '', item = null, visible = true }) {
    this.kind = kind;
    this.label = label;
    this.item = item;
    this.visible = visible;
  }

  draw(ctx, mouse) {
    if (!mouse.inside || !this.visible || !this.images) return;
    ctx.save();
    if (this.item) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(this.item, mouse.x - 26, mouse.y - 26, 52, 52);
      ctx.globalAlpha = 1;
    } else {
      const image = this.images[this.kind];
      const height = SIZE;
      const width = (image.width / image.height) * height;
      const [hx, hy] = KINDS[this.kind].hot;
      ctx.drawImage(image, mouse.x - hx * width, mouse.y - hy * height, width, height);
    }
    if (this.label) {
      ctx.font = FONTS.label;
      ctx.textBaseline = 'top';
      const width = ctx.measureText(this.label).width;
      const x = Math.min(Math.max(mouse.x - width / 2, 8), 1272 - width);
      const y = mouse.y + (this.item ? 30 : 28) > 690 ? mouse.y - 52 : mouse.y + (this.item ? 30 : 28);
      outlinedText(ctx, this.label, x, y, COLORS.joseph, 4);
    }
    ctx.restore();
  }
}
