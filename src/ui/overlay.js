import { COLORS, FONTS, drawPaper, outlinedText, roundedRect, wrapText } from './text.js';

// Alles, was sich über das ganze Bild legt:
// - Abblenden ins Schwarze und wieder zurück
// - Karten, die man wegklickt: Titelbild, Handschrift auf Josephs Hand, ein Brief, das Ende
//
//   await overlay.fadeTo(1, 1.5);                  // 1,5 Sekunden lang schwarz werden
//   await overlay.showCard({ kind: 'paper', lines: ['…'] });

export class Overlay {
  constructor() {
    this.fade = 0;      // 0 = klar, 1 = ganz schwarz
    this.fading = null; // { from, to, duration, age, resolve }
    this.card = null;   // { kind, …, age, resolve }
  }

  get blocksInput() {
    return this.card !== null;
  }

  fadeTo(target, duration = 1) {
    this.fading?.resolve();
    return new Promise((resolve) => {
      this.fading = { from: this.fade, to: target, duration, age: 0, resolve };
    });
  }

  showCard(card) {
    this.card?.resolve();
    return new Promise((resolve) => {
      this.card = { ...card, age: 0, resolve };
    });
  }

  // Ein Klick schließt die Karte (erst nach einer kleinen Pause, damit man sie nicht aus Versehen überspringt)
  handleClick() {
    if (!this.card || this.card.age < 0.6) return;
    const { resolve } = this.card;
    this.card = null;
    resolve();
  }

  update(dt) {
    if (this.fading) {
      const f = this.fading;
      f.age += dt;
      const t = Math.min(1, f.age / f.duration);
      this.fade = f.from + (f.to - f.from) * t;
      if (t >= 1) {
        this.fading = null;
        f.resolve();
      }
    }
    if (this.card) this.card.age += dt;
  }

  draw(ctx) {
    if (this.fade > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fade})`;
      ctx.fillRect(0, 0, 1280, 720);
    }
    const card = this.card;
    if (!card) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, card.age / 0.35);
    if (card.kind === 'title') drawTitle(ctx, card);
    if (card.kind === 'hand') drawHand(ctx, card);
    if (card.kind === 'paper') drawLetter(ctx, card);
    if (card.kind === 'end') drawEnd(ctx, card);
    if (card.age > 1.2) {
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(card.age * 3);
      ctx.font = FONTS.small;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      outlinedText(ctx, card.continueText ?? 'Klicken zum Weiterspielen', 640, 690, COLORS.joseph, 4);
    }
    ctx.restore();
  }
}

function drawTitle(ctx, { title, subtitle }) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = FONTS.title;
  ctx.fillStyle = COLORS.brass;
  ctx.fillText(title, 640, 310);
  ctx.font = FONTS.subtitle;
  ctx.fillStyle = '#c9b48f';
  ctx.fillText(subtitle, 640, 380);
}

// Schrift auf Josephs Handrücken: eine gezeichnete Hand (Handrücken, vier Finger, Daumen)
function drawHand(ctx, { text }) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.save();
  ctx.translate(600, 400);
  ctx.rotate(-0.1);
  const skin = ctx.createLinearGradient(0, -220, 0, 200);
  skin.addColorStop(0, '#e6bb93');
  skin.addColorStop(1, '#b07a52');
  const parts = [
    ...[[-150, -30], [-55, -48], [40, -46], [130, -24]].map(([x, angle]) => ({ x, y: -150, width: 78, height: 230, angle: angle / 300 })),
    { x: 230, y: 40, width: 80, height: 190, angle: 1.0 },  // Daumen
    { x: -10, y: 40, width: 420, height: 250, angle: 0, radius: 90 }, // Handrücken
  ];
  for (const pass of ['outline', 'fill']) {
    for (const part of parts) {
      ctx.save();
      ctx.translate(part.x, part.y);
      ctx.rotate(part.angle);
      roundedRect(ctx, -part.width / 2, -part.height / 2, part.width, part.height, part.radius ?? part.width / 2.2);
      if (pass === 'outline') {
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#3a2112';
        ctx.stroke();
      } else {
        ctx.fillStyle = skin;
        ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.font = FONTS.handBig;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(30, 40, 90, 0.9)';
  const fit = Math.min(1, 350 / ctx.measureText(text).width); // passt auf den Handrücken
  ctx.scale(fit, fit);
  ctx.fillText(text, -10 / fit, 60 / fit);
  ctx.restore();
}

function drawLetter(ctx, { lines, signature }) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  drawPaper(ctx, 370, 110, 540, 460, -0.03);
  ctx.save();
  ctx.translate(640, 340);
  ctx.rotate(-0.03);
  ctx.font = FONTS.hand;
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const rows = lines.flatMap((line) => wrapText(ctx, line, 440));
  rows.forEach((row, i) => ctx.fillText(row, -220, -180 + i * 40));
  if (signature) {
    ctx.textAlign = 'right';
    ctx.fillText(signature, 220, 150);
  }
  ctx.restore();
}

function drawEnd(ctx, { title, lines }) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = FONTS.title;
  ctx.fillStyle = COLORS.brass;
  ctx.fillText(title, 640, 270);
  ctx.font = FONTS.subtitle;
  ctx.fillStyle = '#c9b48f';
  lines.forEach((line, i) => ctx.fillText(line, 640, 350 + i * 42));
}
