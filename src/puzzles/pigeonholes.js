import { View } from './view.js';
import { COLORS, FONTS, outlinedText, roundedRect } from '../ui/text.js';

// Die Fächerwand im Postwagen aus der Nähe: zwölf Fächer, jedes mit einer Rundennummer.
//
//   const label = await story.view('pigeonholes', { labels: [[1, 7, …], …], filled: [1, 7, 41], current: 41 });
//
// labels  = Beschriftung der Fächer (Reihen von oben nach unten)
// filled  = in welchen Fächern Post liegt (dort ragt ein Brief heraus)
// current = welche Runde der Zähler gerade zeigt (das Fach ist etwas heller)
// Ergebnis: die Nummer des angeklickten Fachs – oder null, wenn der Spieler die Ansicht schließt.

const CELL = { width: 168, height: 128, gap: 14 };
const BOARD = { x: 640 - (4 * CELL.width + 3 * CELL.gap) / 2, y: 120 };

export class Pigeonholes extends View {
  constructor() {
    super();
    this.labels = [];
    this.filled = [];
    this.current = null;
    this.hover = null;
    this.help = 'Fach anklicken: hineinsehen  ·  Rechtsklick oder Esc: zurück';
  }

  onOpen({ labels, filled = [], current = null }) {
    this.labels = labels;
    this.filled = filled;
    this.current = current;
    this.hover = null;
  }

  result() {
    return null;
  }

  cellAt(point) {
    for (let r = 0; r < this.labels.length; r++) {
      for (let c = 0; c < this.labels[r].length; c++) {
        const x = BOARD.x + c * (CELL.width + CELL.gap), y = BOARD.y + r * (CELL.height + CELL.gap);
        if (point.x >= x && point.x <= x + CELL.width && point.y >= y && point.y <= y + CELL.height) return this.labels[r][c];
      }
    }
    return null;
  }

  contains(point) {
    return point.x > BOARD.x - 40 && point.x < 1280 - BOARD.x + 40 && point.y > BOARD.y - 60 && point.y < BOARD.y + 3 * (CELL.height + CELL.gap) + 20;
  }

  update(dt, mouse) {
    super.update(dt);
    if (this.isOpen && mouse) this.hover = this.cellAt(mouse);
  }

  pointerDown(point) {
    const label = this.cellAt(point);
    if (label === null) return;
    this.sound('paper');
    this.close(label);
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.82);
    ctx.globalAlpha = this.fadeIn;
    const width = 4 * CELL.width + 3 * CELL.gap, height = 3 * CELL.height + 2 * CELL.gap;
    // Holzrahmen
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    roundedRect(ctx, BOARD.x - 26, BOARD.y - 54, width + 52, height + 80, 12);
    ctx.fillStyle = '#5a3a1e';
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    ctx.fillStyle = '#e8d6a0';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('POST NACH RUNDEN', 640, BOARD.y - 28);

    this.labels.forEach((row, r) => row.forEach((label, c) => {
      const x = BOARD.x + c * (CELL.width + CELL.gap), y = BOARD.y + r * (CELL.height + CELL.gap);
      const inside = ctx.createLinearGradient(0, y, 0, y + CELL.height);
      inside.addColorStop(0, '#0e0805');
      inside.addColorStop(1, label === this.current ? '#3a2814' : '#22160c');
      ctx.fillStyle = inside;
      ctx.fillRect(x, y, CELL.width, CELL.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = label === this.hover ? '#ffd36b' : '#2a1a0c';
      ctx.strokeRect(x, y, CELL.width, CELL.height);
      if (this.filled.includes(label)) {
        // ein Brief ragt heraus
        ctx.save();
        ctx.translate(x + CELL.width / 2, y + CELL.height - 44);
        ctx.rotate(-0.06);
        ctx.fillStyle = '#f4ead2';
        ctx.fillRect(-56, -26, 112, 52);
        ctx.strokeStyle = '#6b4a2a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-56, -26, 112, 52);
        ctx.beginPath();
        ctx.moveTo(-56, -26);
        ctx.lineTo(0, 4);
        ctx.lineTo(56, -26);
        ctx.stroke();
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(30, -20, 18, 22);
        ctx.restore();
      }
      // Schildchen
      roundedRect(ctx, x + CELL.width / 2 - 34, y + CELL.height - 18, 68, 26, 4);
      ctx.fillStyle = '#efe2c0';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#120a05';
      ctx.stroke();
      ctx.fillStyle = '#3a1e10';
      ctx.font = 'bold 17px "Courier New", monospace';
      ctx.fillText(String(label), x + CELL.width / 2, y + CELL.height - 4);
    }));
    if (this.hover !== null) {
      ctx.font = FONTS.label;
      outlinedText(ctx, `Fach „Runde ${this.hover}“`, 640, BOARD.y + height + 52, COLORS.joseph, 4);
    }
    ctx.restore();
    this.drawHelp(ctx);
  }
}
