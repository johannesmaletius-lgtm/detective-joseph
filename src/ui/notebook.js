import { loadImage } from '../core/assets.js';
import { COLORS, FONTS, drawPaper, roundedRect, wrapText } from './text.js';

// Josephs Notizbuch: Was er herausgefunden hat, schreibt er hier hinein – sortiert nach Runden.
// In der Geschichte ist es das Einzige, was über die Runden hinweg sicher bleibt.
// Zugleich ist es die Hilfe für Spieler, die nicht weiterwissen.
//
// Knopf oben rechts (oder Taste N) öffnet es, ein Klick schließt es wieder.

const BUTTON = { x: 1196, y: 10, size: 72 };
const PAGE = { x: 150, y: 70, width: 980, height: 560 };

export class Notebook {
  constructor() {
    this.entries = [];   // { lap, text }
    this.unread = 0;
    this.isOpen = false;
    this.icon = null;
    this.pulse = 0;      // kurzes Aufleuchten des Knopfes bei einer neuen Notiz
  }

  async load() {
    this.icon = await loadImage('assets/ui/notebook.png');
  }

  add(text, lap) {
    if (this.entries.some((entry) => entry.text === text)) return;
    this.entries.push({ lap, text });
    this.unread += 1;
    this.pulse = 1;
  }

  open() {
    this.isOpen = true;
    this.unread = 0;
  }

  close() {
    this.isOpen = false;
  }

  buttonContains(point) {
    return point.x >= BUTTON.x && point.x <= BUTTON.x + BUTTON.size && point.y >= BUTTON.y && point.y <= BUTTON.y + BUTTON.size;
  }

  update(dt) {
    this.pulse = Math.max(0, this.pulse - dt * 0.8);
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
    let lap = null;
    for (const entry of this.entries) {
      if (entry.lap !== lap) {
        lap = entry.lap;
        rows.push({ text: `Runde ${lap}`, heading: true });
      }
      wrapText(ctx, entry.text, width / 2 - 90).forEach((line, i) => rows.push({ text: line, bullet: i === 0 }));
    }
    const lineHeight = 27;
    const perPage = Math.floor((height - 100) / lineHeight);
    const visible = rows.slice(Math.max(0, rows.length - perPage * 2)); // zu viele? die ältesten weglassen
    visible.forEach((row, i) => {
      const page = i < perPage ? 0 : 1;
      const rx = x + page * (width / 2) + 40;
      const ry = y + (page === 0 ? 72 : 30) + (i % perPage) * lineHeight;
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

    ctx.font = FONTS.small;
    ctx.fillStyle = 'rgba(51, 38, 26, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('Klicken oder N: schließen', x + width - 30, y + height - 30);
    ctx.restore();
  }
}
