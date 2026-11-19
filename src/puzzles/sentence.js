import { View } from './view.js';
import { COLORS, FONTS, drawPaper, roundedRect } from '../ui/text.js';

// Satz-Puzzle: Joseph hat sich aufgeschrieben, was Frau Adler im Schlaf murmelt – jede Runde ein
// anderes Stück desselben Satzes. Hier bringt er die Stücke in die richtige Reihenfolge.
//
//   const done = await story.view('sentence', { chunks: ['Das Wort', 'für das Gitter', …], heard: [0, 3] });
//
// chunks = alle Stücke in der RICHTIGEN Reihenfolge. heard = welche Joseph schon kennt.
// Unten liegen die Kärtchen durcheinander. Klick auf ein Kärtchen: es kommt an das Ende des Satzes.
// Klick auf ein Kärtchen im Satz: es geht zurück. Stehen alle richtig, ist das Rätsel gelöst.

const PAPER = { x: 190, y: 90, width: 900, height: 520 };
const CARD_HEIGHT = 46;
const GAP = 12;

export class Sentence extends View {
  constructor() {
    super();
    this.chunks = [];
    this.heard = [];
    this.placed = [];   // Reihenfolge im Satz (Nummern der Stücke)
    this.order = [];    // Reihenfolge, in der die Kärtchen unten durcheinanderliegen
    this.rects = [];    // wo jedes Kärtchen gerade liegt (zum Anklicken)
    this.solved = 0;
    this.shake = 0;
    this.help = 'Kärtchen anklicken: an den Satz anhängen bzw. zurücklegen  ·  Rechtsklick: zurück';
  }

  onOpen({ chunks, heard }) {
    this.chunks = chunks;
    this.heard = heard;
    this.placed = this.placed.filter((i) => heard.includes(i));
    if (this.order.length !== chunks.length) this.order = shuffle(chunks.map((_, i) => i));
    this.solved = 0;
    this.shake = 0;
  }

  result() {
    return this.solved > 0;
  }

  get complete() {
    return this.placed.length === this.chunks.length;
  }

  pointerDown(point) {
    if (this.solved) return;
    const hit = this.rects.find((r) => point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.height);
    if (!hit || hit.unknown) return;
    if (hit.placed) this.placed = this.placed.filter((i) => i !== hit.index);
    else this.placed.push(hit.index);
    this.sound('paper');
    if (!this.complete) return;
    if (this.placed.every((index, position) => index === position)) {
      this.solved = 0.001;
      this.sound('success');
    } else {
      this.shake = 1;
      this.sound('locked');
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    this.shake = Math.max(0, this.shake - dt * 2.5);
    if (this.solved > 0) {
      this.solved += dt;
      if (this.solved > 1.6) this.close(true);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.8);
    ctx.globalAlpha = this.fadeIn;
    drawPaper(ctx, PAPER.x, PAPER.y, PAPER.width, PAPER.height, -0.006);
    ctx.fillStyle = COLORS.ink;
    ctx.font = FONTS.hand;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Was Frau Adler im Schlaf murmelt:', PAPER.x + 40, PAPER.y + 28);
    ctx.strokeStyle = 'rgba(39, 64, 143, 0.35)';
    ctx.lineWidth = 1.5;
    for (let y = PAPER.y + 126; y < PAPER.y + 300; y += 62) {
      ctx.beginPath();
      ctx.moveTo(PAPER.x + 36, y + CARD_HEIGHT + 4);
      ctx.lineTo(PAPER.x + PAPER.width - 36, y + CARD_HEIGHT + 4);
      ctx.stroke();
    }
    this.rects = [];
    ctx.font = FONTS.speech;
    const wobble = Math.sin(this.shake * 40) * 8 * this.shake;
    // Der Satz, so weit er schon gelegt ist
    this.flow(ctx, this.placed, PAPER.x + 40 + wobble, PAPER.y + 90, PAPER.width - 80, { placed: true });
    // Unten: die übrigen Kärtchen
    ctx.fillStyle = 'rgba(51, 38, 26, 0.65)';
    ctx.font = FONTS.small;
    ctx.fillText('Kärtchen:', PAPER.x + 40, PAPER.y + 318);
    ctx.font = FONTS.speech;
    const rest = this.order.filter((i) => !this.placed.includes(i));
    this.flow(ctx, rest, PAPER.x + 40, PAPER.y + 346, PAPER.width - 80, { placed: false });
    const missing = this.chunks.length - this.heard.length;
    if (missing > 0) {
      ctx.font = FONTS.small;
      ctx.fillStyle = '#7a2a22';
      ctx.fillText(`Es fehlen noch ${missing} Stücke. Sie murmelt jede Runde etwas anderes.`, PAPER.x + 40, PAPER.y + PAPER.height - 40);
    }
    if (this.solved > 0) {
      ctx.font = FONTS.hand;
      ctx.fillStyle = '#2f6b2a';
      ctx.fillText('✓ Das ergibt Sinn!', PAPER.x + PAPER.width - 290, PAPER.y + 30);
    }
    ctx.restore();
    this.drawHelp(ctx);
  }

  // Legt Kärtchen von links nach rechts in Zeilen und merkt sich, wo sie liegen
  flow(ctx, indexes, left, top, width, { placed }) {
    let x = left, y = top;
    for (const index of indexes) {
      const unknown = !this.heard.includes(index);
      const text = unknown ? '? ? ?' : this.chunks[index];
      const w = ctx.measureText(text).width + 28;
      if (x + w > left + width) {
        x = left;
        y += CARD_HEIGHT + 16;
      }
      const rect = { x, y, width: w, height: CARD_HEIGHT, index, placed, unknown };
      this.rects.push(rect);
      roundedRect(ctx, x, y, w, CARD_HEIGHT, 8);
      ctx.fillStyle = unknown ? 'rgba(120, 100, 80, 0.18)' : placed ? '#fff8e4' : '#f2e2b8';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = unknown ? 'rgba(80, 60, 40, 0.3)' : this.solved ? '#2f6b2a' : '#6b4221';
      ctx.stroke();
      ctx.fillStyle = unknown ? 'rgba(80, 60, 40, 0.45)' : '#27408f';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + 14, y + CARD_HEIGHT / 2 + 1);
      ctx.textBaseline = 'top';
      x += w + GAP;
    }
  }
}

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.every((value, i) => value === i)) result.reverse();
  return result;
}
