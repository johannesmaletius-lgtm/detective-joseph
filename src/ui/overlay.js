import { COLORS, FONTS, drawPaper, outlinedText, roundedRect, wrapText } from './text.js';
import { loadImage } from '../core/assets.js';

// Alles, was sich über das ganze Bild legt:
// - Abblenden ins Schwarze und wieder zurück
// - Karten, die man wegklickt: Titelbild, Handschrift auf Josephs Arm, ein Brief, das Ende
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
    if (card.kind === 'hand') drawHand(ctx);
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

// Josephs Arm mit der Schrift auf dem Handgelenk (gezeichnetes Bild, weißer Hintergrund ist transparent).
// Das Bild ist vorab geladen; solange es fehlt, bleibt der Bildschirm nur schwarz.
const HAND_IMAGE = 'assets/ui/hand-inscription.png';
let handImage = null;
loadImage(HAND_IMAGE).then((image) => { handImage = image; }).catch(() => {});

// Der Text steckt schon im Bild ("Nicht einschlafen"), deshalb wird "text" hier nicht mehr gezeichnet.
function drawHand(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
  ctx.fillRect(0, 0, 1280, 720);
  if (!handImage) return;
  const w = 880, h = (handImage.height / handImage.width) * w;
  ctx.drawImage(handImage, 640 - w / 2, 360 - h / 2, w, h);
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
