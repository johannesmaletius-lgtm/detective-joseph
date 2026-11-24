import { loadImages } from '../core/assets.js';
import { FONTS, COLORS, outlinedText } from './text.js';
import { touch } from '../core/touch.js';

// Der Mauszeiger. Er zeigt, was ein Klick bewirkt:
//   Zeigefinger = anklicken (benutzen/nehmen)   Auge = nur anschauen   Pfeil = weitergehen (Tür, Luke, Gang)
//   Sprechblase = sprechen   kleiner Ring = auf den Boden klicken, Joseph läuft dorthin
// Hält Joseph gerade einen Gegenstand "in der Hand", hängt dieser am Zeiger.
// Daneben steht der Name dessen, was unter dem Zeiger liegt.
//
// Der Zeiger wird ins Spielbild gezeichnet (der normale Mauszeiger ist ausgeblendet, siehe style.css).

const SIZE = 46; // Höhe in Spielpixeln

// hot = die Stelle im Bild, die genau auf der Mausposition liegt (Anteil von Breite/Höhe)
// turn = Drehung des Bildes (Pfeil nach links/rechts)
const KINDS = {
  interact: { src: 'assets/ui/cursors/walk.png', hot: [0.46, 0.03] }, // Fingerspitze
  look: { src: 'assets/ui/cursors/look.png', hot: [0.5, 0.5] },
  talk: { src: 'assets/ui/cursors/talk.png', hot: [0.5, 0.5] },
  exit: { src: 'assets/ui/cursors/exit.png', hot: [0.5, 0.5] },
  exitLeft: { src: 'assets/ui/cursors/exit.png', hot: [0.5, 0.5], turn: -Math.PI / 2 },
  exitRight: { src: 'assets/ui/cursors/exit.png', hot: [0.5, 0.5], turn: Math.PI / 2 },
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

  // input: src/core/input.js (Maus- bzw. Fingerposition, langes Drücken)
  draw(ctx, input) {
    const mouse = input.mouse;
    if (!mouse.inside || !this.visible || !this.images) return;
    if (touch.active) return this.drawTouch(ctx, input);
    ctx.save();
    if (this.item) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(this.item, mouse.x - 26, mouse.y - 26, 52, 52);
      ctx.globalAlpha = 1;
    } else if (this.kind === 'walk') {
      drawWalkRing(ctx, mouse);
    } else {
      const { hot: [hx, hy], turn = 0 } = KINDS[this.kind] ?? KINDS.interact;
      const image = this.images[this.kind] ?? this.images.interact;
      const height = SIZE;
      const width = (image.width / image.height) * height;
      ctx.save();
      ctx.translate(mouse.x, mouse.y);
      ctx.rotate(turn);
      ctx.drawImage(image, -hx * width, -hy * height, width, height);
      ctx.restore();
    }
    this.drawLabel(ctx, mouse);
    ctx.restore();
  }

  // Mit dem Finger: kein Zeiger. Der Name steht, solange der Finger liegt (und kurz danach),
  // ein Ring zeigt das lange Drücken, ein gehaltener Gegenstand bleibt dort, wo zuletzt getippt wurde.
  drawTouch(ctx, input) {
    const mouse = input.mouse;
    ctx.save();
    if (this.item) {
      ctx.globalAlpha = 0.85;
      ctx.drawImage(this.item, mouse.x - 26, mouse.y - 60, 52, 52);
      ctx.globalAlpha = 1;
    }
    const hold = input.holdProgress;
    if (hold > 0.2) {
      const t = (hold - 0.2) / 0.8;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(20, 12, 7, 0.6)';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = COLORS.brass;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 34, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
      ctx.stroke();
    }
    const since = input.sinceTouchUp;
    if (since < 1.6) {
      ctx.globalAlpha = Math.min(1, (1.6 - since) / 0.4);
      this.drawLabel(ctx, { x: mouse.x, y: mouse.y - 70 }); // über dem Finger, sonst verdeckt er den Namen
    }
    ctx.restore();
  }

  drawLabel(ctx, mouse) {
    if (this.label) {
      ctx.font = FONTS.label;
      ctx.textBaseline = 'top';
      const width = ctx.measureText(this.label).width;
      const x = Math.min(Math.max(mouse.x - width / 2, 8), 1272 - width);
      const y = mouse.y + (this.item ? 30 : 28) > 690 ? mouse.y - 52 : mouse.y + (this.item ? 30 : 28);
      outlinedText(ctx, this.label, x, y, COLORS.joseph, 4);
    }
  }
}

// Boden: ein kleiner Messing-Ring – „hierhin laufen“, ohne wie ein Klickziel auszusehen
function drawWalkRing(ctx, mouse) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(20, 12, 7, 0.75)';
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = COLORS.brass;
  ctx.stroke();
}
