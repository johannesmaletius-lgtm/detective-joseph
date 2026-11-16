import { COLORS, FONTS, drawPaper, outlinedText, roundedRect, wrapText } from './text.js';

// Alles, was sich über das ganze Bild legt:
// - Abblenden ins Schwarze und wieder zurück
// - Karten, die man wegklickt: Titelbild, Handschrift auf Josephs Hand, ein Brief, das Ende
//
//   await overlay.fadeTo(1, 1.5);                  // 1,5 Sekunden lang schwarz werden
//   await overlay.showCard({ kind: 'paper', lines: ['…'] });
//   await overlay.showCard({ draw: (ctx, card) => { … } });   // selbst gezeichnete Karte (siehe cards.js)

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
    if (card.draw) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(0, 0, 1280, 720);
      card.draw(ctx, card);
    }
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

function drawTitle(ctx, { title, subtitle, age }) {
  const night = ctx.createLinearGradient(0, 0, 0, 720);
  night.addColorStop(0, '#05040c');
  night.addColorStop(1, '#0d0a1c');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, 1280, 720);

  // Die Ringbahn von oben: ein Gleiskreis, in der Mitte das rote Licht des Turms, ein Zug dreht seine Runden
  const cx = 640, cy = 350, rx = 430, ry = 190;
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.22)';
  ctx.lineWidth = 2;
  for (const grow of [-7, 7]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + grow, ry + grow * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.16)';
  for (let i = 0; i < 90; i++) { // Schwellen
    const a = (i / 90) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (rx - 11), cy + Math.sin(a) * (ry - 5));
    ctx.lineTo(cx + Math.cos(a) * (rx + 11), cy + Math.sin(a) * (ry + 5));
    ctx.stroke();
  }
  const turn = age * 0.35;
  for (let i = 0; i < 5; i++) { // fünf erleuchtete Wagen
    const a = turn - i * 0.085;
    const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 26);
    glow.addColorStop(0, `rgba(255, 205, 120, ${i === 0 ? 0.95 : 0.6})`);
    glow.addColorStop(1, 'rgba(255, 205, 120, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 26, y - 26, 52, 52);
  }
  const blink = Math.max(0, Math.sin(age * 2.4)) ** 6;
  const red = ctx.createRadialGradient(cx, cy - 122, 0, cx, cy - 122, 60);
  red.addColorStop(0, `rgba(255, 70, 60, ${0.25 + 0.6 * blink})`);
  red.addColorStop(1, 'rgba(255, 70, 60, 0)');
  ctx.fillStyle = red;
  ctx.fillRect(cx - 60, cy - 182, 120, 120);
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = FONTS.title;
  ctx.fillStyle = COLORS.brass;
  ctx.fillText(title, 640, 320);
  ctx.font = FONTS.subtitle;
  ctx.fillStyle = '#c9b48f';
  ctx.fillText(subtitle, 640, 386);
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

// Ein handgeschriebenes Blatt. Jede Zeile in "lines" ist ein Absatz; das Blatt wächst mit dem Text.
function drawLetter(ctx, { lines, signature }) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.font = FONTS.hand;
  const textWidth = 500;
  const rows = lines.flatMap((line, i) => [...wrapText(ctx, line, textWidth), ...(i < lines.length - 1 ? [''] : [])]);
  const rowHeight = (row) => (row === '' ? 14 : 34);
  const textHeight = rows.reduce((sum, row) => sum + rowHeight(row), 0) + (signature ? 46 : 0);
  const height = Math.max(380, textHeight + 90);
  drawPaper(ctx, 640 - (textWidth + 100) / 2, 348 - height / 2, textWidth + 100, height, -0.02);
  ctx.save();
  ctx.translate(640, 348);
  ctx.rotate(-0.02);
  ctx.fillStyle = COLORS.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let y = -height / 2 + 44;
  for (const row of rows) {
    ctx.fillText(row, -textWidth / 2, y);
    y += rowHeight(row);
  }
  if (signature) {
    ctx.textAlign = 'right';
    ctx.fillText(signature, textWidth / 2, y + 10);
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
