import { COLORS, FONTS, outlinedText } from '../ui/text.js';

// Grundgerüst für alle Nahansichten: Rätsel und Dinge, die man sich aus der Nähe ansieht
// (Puzzle, Verteilerkasten, Fernglas, Bildschirm, Zahlenschloss).
//
//   const result = await view.open({ … });   // wartet, bis die Ansicht wieder geschlossen wird
//
// Eine Nahansicht liegt über dem Abteil. Solange sie offen ist, gehen alle Klicks an sie.
// Rechtsklick, Esc oder ein Klick auf den dunklen Rand schließen sie wieder.
//
// Eine eigene Ansicht überschreibt bei Bedarf:
//   onOpen(options)        beim Öffnen
//   update(dt, mouse)      in jedem Bild
//   draw(ctx)              zeichnen
//   pointerDown(point)     Linksklick      pointerUp(point)   Maustaste losgelassen
//   contains(point)        liegt der Punkt auf der Ansicht? (sonst schließt der Klick sie)
export class View {
  constructor() {
    this.isOpen = false;
    this.age = 0;            // Sekunden, seit die Ansicht geöffnet wurde (zum Einblenden)
    this.resolve = null;
    this.onSound = null;     // (name) – Geräusche, siehe soundEffects.js
    this.onSkip = null;      // () – Sprechtext überspringen (setzt das Spiel)
    this.staysInDark = false; // true: bleibt offen, wenn im Tunnel das Licht ausgeht
    this.help = 'Rechtsklick oder Esc: zurück';
  }

  open(options = {}) {
    this.resolve?.(this.result());
    this.isOpen = true;
    this.age = 0;
    this.onOpen(options);
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close(result = this.result()) {
    if (!this.isOpen) return;
    this.isOpen = false;
    const resolve = this.resolve;
    this.resolve = null;
    resolve?.(result);
  }

  // Ergebnis, wenn der Spieler die Ansicht einfach schließt
  result() {
    return false;
  }

  sound(name) {
    this.onSound?.(name);
  }

  onOpen() {}

  update(dt) {
    if (this.isOpen) this.age += dt;
  }

  handleClick(point, right) {
    if (right || !this.contains(point)) return this.close();
    this.pointerDown(point);
  }

  contains() {
    return true;
  }

  // Ohne eigene Bedienung überspringt ein Klick einfach Josephs Satz (wie im Abteil)
  pointerDown() {
    this.onSkip?.();
  }

  pointerUp() {}

  // Dunkler Schleier über dem Abteil
  drawBackdrop(ctx, darkness = 0.8) {
    ctx.fillStyle = `rgba(6, 3, 2, ${darkness * this.fadeIn})`;
    ctx.fillRect(0, 0, 1280, 720);
  }

  // Zeile ganz unten: wie man die Ansicht bedient
  drawHelp(ctx, text = this.help) {
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    ctx.font = FONTS.small;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    outlinedText(ctx, text, 640, 704, COLORS.joseph, 4);
    ctx.restore();
  }

  // 0 … 1: weiches Einblenden nach dem Öffnen
  get fadeIn() {
    return Math.min(1, this.age / 0.25);
  }
}
