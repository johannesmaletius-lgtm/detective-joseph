import { loadImage } from '../core/assets.js';
import { COLORS, FONTS, drawPaper, roundedRect, wrapText } from './text.js';

// Josephs Notizbuch: Was er herausgefunden hat, schreibt er hier hinein – sortiert nach Runden.
// In der Geschichte ist es das Einzige, was über die Runden hinweg sicher bleibt.
// Zugleich ist es die Hilfe für Spieler, die nicht weiterwissen.
//
// Knopf oben rechts (oder Taste N) öffnet es, ein Klick schließt es wieder.
// Wird es voll, kann man blättern. Unten links gibt es einen Tipp von Joseph (auch Taste H).

const BUTTON = { x: 1196, y: 10, size: 72 };
const PAGE = { x: 150, y: 70, width: 980, height: 560 };
const LINE_HEIGHT = 27;
const ROWS_PER_PAGE = Math.floor((PAGE.height - 130) / LINE_HEIGHT);
// Knöpfe auf den aufgeschlagenen Seiten
const TIP = { x: PAGE.x + 34, y: PAGE.y + PAGE.height - 52, width: 250, height: 34 };
const PREVIOUS = { x: PAGE.x + PAGE.width / 2 - 150, y: PAGE.y + PAGE.height - 52, width: 120, height: 34 };
const NEXT = { x: PAGE.x + PAGE.width / 2 + 30, y: PAGE.y + PAGE.height - 52, width: 120, height: 34 };

export class Notebook {
  constructor() {
    this.entries = [];   // { lap, text }
    this.unread = 0;
    this.isOpen = false;
    this.icon = null;
    this.pulse = 0;      // kurzes Aufleuchten des Knopfes bei einer neuen Notiz
    this.spread = 0;     // welche Doppelseite aufgeschlagen ist
    this.spreads = 1;    // wie viele es gibt (wird beim Zeichnen gezählt)
    this.mouse = null;   // für das Hervorheben der Knöpfe
  }

  async load() {
    this.icon = await loadImage('assets/ui/notebook.png');
  }

  // Neuer Wagen: Die Notizen aus früheren Wagen bleiben stehen (Überschrift „Wagen 1“, „Wagen 2“ …),
  // die Runden zählen von vorn. notes = [{ door, text }]
  clear(notes = []) {
    this.entries = notes.map(({ door, text }) => ({ text, section: `Wagen ${door}`, carried: true }));
    this.unread = 0;
    this.isOpen = false;
    this.pulse = 0;
    this.spread = 0;
  }

  add(text, lap) {
    if (this.entries.some((entry) => !entry.carried && entry.text === text)) return;
    this.entries.push({ lap, text });
    this.unread += 1;
    this.pulse = 1;
  }

  open() {
    this.isOpen = true;
    this.unread = 0;
    this.spread = Infinity; // die neuesten Einträge zuerst (wird beim Zeichnen auf die letzte Doppelseite gesetzt)
  }

  // Klick ins aufgeschlagene Buch. Ergebnis: 'hint' (Tipp gewünscht) oder nichts.
  handleClick(point) {
    if (inside(point, TIP)) {
      this.close();
      return 'hint';
    }
    if (inside(point, PREVIOUS) && this.spread > 0) this.spread -= 1;
    else if (inside(point, NEXT) && this.spread < this.spreads - 1) this.spread += 1;
    else this.close();
    return null;
  }

  close() {
    this.isOpen = false;
  }

  buttonContains(point) {
    return point.x >= BUTTON.x && point.x <= BUTTON.x + BUTTON.size && point.y >= BUTTON.y && point.y <= BUTTON.y + BUTTON.size;
  }

  update(dt, mouse) {
    this.pulse = Math.max(0, this.pulse - dt * 0.8);
    this.mouse = mouse;
  }

  drawButton(ctx, hovered) {
    if (!this.icon) return;
    const { x, y, size } = BUTTON;
    ctx.save();
    if (this.pulse > 0) {
      const glow = ctx.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size);
      glow.addColorStop(0, `rgba(255, 210, 120, ${0.6 * this.pulse})`);
      glow.addColorStop(1, 'rgba(255, 210, 120, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
    }
    const grow = hovered ? 4 : 0;
    ctx.drawImage(this.icon, x - grow, y - grow, size + 2 * grow, size + 2 * grow);
    if (this.unread > 0) {
      ctx.beginPath();
      ctx.arc(x + size - 8, y + 12, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#c0392b';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2a1408';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = FONTS.hintTitle;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(this.unread), x + size - 8, y + 12);
    }
    ctx.restore();
  }

  // Aufgeschlagenes Notizbuch: links die ersten Einträge, rechts die weiteren
  drawPage(ctx) {
    if (!this.isOpen) return;
    const { x, y, width, height } = PAGE;
    ctx.save();
    ctx.fillStyle = 'rgba(8, 4, 2, 0.72)';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#5a341c';
    roundedRect(ctx, x - 16, y - 14, width + 32, height + 28, 14);
    ctx.fill();
    drawPaper(ctx, x, y, width / 2, height);
    drawPaper(ctx, x + width / 2, y, width / 2, height);
    ctx.fillStyle = 'rgba(60, 35, 15, 0.35)';
    ctx.fillRect(x + width / 2 - 2, y, 4, height); // Falz in der Mitte

    ctx.fillStyle = COLORS.ink;
    ctx.textBaseline = 'top';
    ctx.font = FONTS.hand;
    ctx.fillText('Notizbuch', x + 34, y + 22);

    // Zeilen zusammenstellen: Überschrift je Runde, darunter die Einträge
    ctx.font = FONTS.handSmall;
    const rows = [];
    let heading = null;
    for (const entry of this.entries) {
      const title = entry.section ?? (entry.lap === 0 ? 'Was bisher geschah' : `Runde ${entry.lap}`);
      if (title !== heading) {
        heading = title;
        rows.push({ text: title, heading: true });
      }
      wrapText(ctx, entry.text, width / 2 - 90).forEach((line, i) => rows.push({ text: line, bullet: i === 0 }));
    }
    this.spreads = Math.max(1, Math.ceil(rows.length / (ROWS_PER_PAGE * 2)));
    this.spread = Math.min(this.spread, this.spreads - 1);
    const visible = rows.slice(this.spread * ROWS_PER_PAGE * 2, (this.spread + 1) * ROWS_PER_PAGE * 2);
    visible.forEach((row, i) => {
      const page = i < ROWS_PER_PAGE ? 0 : 1;
      const rx = x + page * (width / 2) + 40;
      const ry = y + (page === 0 ? 72 : 30) + (i % ROWS_PER_PAGE) * LINE_HEIGHT;
      if (row.heading) {
        ctx.fillStyle = '#7a2a22';
        ctx.fillText(row.text, rx, ry);
      } else {
        ctx.fillStyle = COLORS.ink;
        if (row.bullet) ctx.fillText('–', rx, ry);
        ctx.fillText(row.text, rx + 20, ry);
      }
    });
    if (this.entries.length === 0) ctx.fillText('(noch leer)', x + 40, y + 80);

    // Knöpfe: Tipp und Blättern
    this.drawPageButton(ctx, TIP, 'Ich komme nicht weiter (Tipp)', true);
    if (this.spreads > 1) {
      this.drawPageButton(ctx, PREVIOUS, '◀ zurück', this.spread > 0);
      this.drawPageButton(ctx, NEXT, 'weiter ▶', this.spread < this.spreads - 1);
      ctx.font = FONTS.small;
      ctx.fillStyle = 'rgba(51, 38, 26, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.spread + 1} / ${this.spreads}`, x + width / 2, y + height - 78);
      ctx.textAlign = 'left';
    }

    ctx.font = FONTS.small;
    ctx.fillStyle = 'rgba(51, 38, 26, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('Klicken oder N: schließen', x + width - 30, y + height - 42);
    ctx.restore();
  }

  drawPageButton(ctx, button, label, enabled) {
    const hovered = enabled && this.mouse && inside(this.mouse, button);
    ctx.save();
    ctx.globalAlpha = enabled ? 1 : 0.35;
    roundedRect(ctx, button.x, button.y, button.width, button.height, 8);
    ctx.fillStyle = hovered ? 'rgba(122, 42, 34, 0.22)' : 'rgba(122, 42, 34, 0.1)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(122, 42, 34, 0.7)';
    ctx.stroke();
    ctx.font = FONTS.small;
    ctx.fillStyle = '#7a2a22';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, button.x + button.width / 2, button.y + button.height / 2 + 1);
    ctx.restore();
  }
}

function inside(point, { x, y, width, height }) {
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
}
