import { COLORS, FONTS, outlinedText, wrapText } from './text.js';

// Sprechtexte: stehen über dem Kopf dessen, der spricht, und verschwinden nach ein paar Sekunden
// (je länger der Satz, desto länger bleibt er). Ein neuer Satz ersetzt den alten.
//
//   await speech.show('Hallo?', { anchor: () => ({ x, y }), color })
//
// anchor liefert die Stelle über dem Kopf – als Funktion, damit der Text mitläuft, wenn Joseph läuft.

const MAX_WIDTH = 460;
const LINE_HEIGHT = 27;

export class Speech {
  constructor(voices = null) {
    this.voices = voices; // gesprochene Sätze (src/audio/voices.js)
    this.line = null; // { lines, anchor, color, age, duration, resolve }
  }

  get isTalking() {
    return this.line !== null;
  }

  show(text, { anchor, color = COLORS.joseph } = {}) {
    this.finish();
    return new Promise((resolve) => {
      const duration = Math.max(1.7, 1 + text.length * 0.055);
      const line = { text, anchor, color, age: 0, duration, resolve };
      this.line = line;
      // Gibt es den Satz gesprochen, bleibt er stehen, bis die Stimme fertig ist
      this.voices?.play(text).then((length) => {
        if (length) line.duration = Math.max(duration, length + 0.35);
      });
    });
  }

  // Aktuellen Satz sofort beenden (Klick oder Leertaste)
  skip() {
    if (this.line && this.line.age > 0.15) this.finish();
  }

  finish() {
    const line = this.line;
    this.line = null;
    if (line) this.voices?.stop();
    line?.resolve();
  }

  update(dt) {
    if (!this.line) return;
    this.line.age += dt;
    if (this.line.age >= this.line.duration) this.finish();
  }

  draw(ctx) {
    if (!this.line) return;
    const { text, anchor, color, age } = this.line;
    ctx.save();
    ctx.font = FONTS.speech;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, age / 0.12);
    const lines = wrapText(ctx, text, MAX_WIDTH);
    const width = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const point = anchor();
    const x = Math.min(Math.max(point.x, width / 2 + 12), 1280 - width / 2 - 12);
    const bottom = Math.max(point.y, lines.length * LINE_HEIGHT + 16);
    lines.forEach((line, i) => outlinedText(ctx, line, x, bottom - (lines.length - 1 - i) * LINE_HEIGHT, color, 6));
    ctx.restore();
  }
}
