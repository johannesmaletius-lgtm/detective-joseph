import { View } from './view.js';

// Der Spiegel im Schlafwagen aus der Nähe.
//
//   await story.view('mirror', { light: () => 0 … 1, word: 'SCHAL' });
//
// Ohne Mondlicht: ein beschlagener Spiegel, darin dunkel Josephs Umriss.
// Fällt Mondlicht hinein (light > 0), leuchtet ein Wort auf – in Spiegelschrift.
// result(): true, wenn das Wort ganz zu sehen war.

const CENTER = { x: 640, y: 330 };
const RADIUS = { x: 220, y: 262 };

export class Mirror extends View {
  constructor() {
    super();
    this.light = () => 0;
    this.word = '';
    this.seen = 0;     // wie lange das Wort schon deutlich zu sehen ist (Sekunden)
    this.level = 0;    // weich nachgeführtes Mondlicht
  }

  onOpen({ light, word }) {
    this.light = light;
    this.word = word;
    this.seen = 0;
    this.level = light();
  }

  result() {
    return this.seen > 0.8;
  }

  get wordVisible() {
    return this.level > 0.6;
  }

  contains(point) {
    return ((point.x - CENTER.x) / (RADIUS.x + 40)) ** 2 + ((point.y - CENTER.y) / (RADIUS.y + 40)) ** 2 <= 1;
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    this.level += (this.light() - this.level) * Math.min(1, dt * 2);
    if (this.wordVisible) this.seen += dt;
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.82);
    ctx.globalAlpha = this.fadeIn;
    const { x, y } = CENTER;
    // Rahmen
    ctx.beginPath();
    ctx.ellipse(x, y, RADIUS.x + 24, RADIUS.y + 24, 0, 0, Math.PI * 2);
    const brass = ctx.createLinearGradient(x - RADIUS.x, y - RADIUS.y, x + RADIUS.x, y + RADIUS.y);
    brass.addColorStop(0, '#f0cf7a');
    brass.addColorStop(0.5, '#a8772e');
    brass.addColorStop(1, '#6d4a18');
    ctx.fillStyle = brass;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1a0f08';
    ctx.stroke();
    // Glas
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y, RADIUS.x, RADIUS.y, 0, 0, Math.PI * 2);
    ctx.clip();
    const glass = ctx.createLinearGradient(0, y - RADIUS.y, 0, y + RADIUS.y);
    glass.addColorStop(0, '#2f4458');
    glass.addColorStop(1, '#141d27');
    ctx.fillStyle = glass;
    ctx.fillRect(x - RADIUS.x, y - RADIUS.y, RADIUS.x * 2, RADIUS.y * 2);
    // Josephs Spiegelbild: dunkler Umriss mit hellem Schal
    ctx.fillStyle = 'rgba(8, 10, 16, 0.75)';
    ctx.beginPath();
    ctx.ellipse(x + 10, y + 40, 62, 74, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 170, y + RADIUS.y);
    ctx.quadraticCurveTo(x - 150, y + 120, x + 10, y + 120);
    ctx.quadraticCurveTo(x + 170, y + 120, x + 190, y + RADIUS.y);
    ctx.fill();
    ctx.fillStyle = 'rgba(220, 210, 180, 0.22)';
    ctx.beginPath();
    ctx.moveTo(x - 60, y + 118);
    ctx.quadraticCurveTo(x + 10, y + 160, x + 80, y + 118);
    ctx.lineTo(x + 40, y + 210);
    ctx.lineTo(x - 10, y + 150);
    ctx.closePath();
    ctx.fill();
    // Mondlicht
    if (this.level > 0.02) {
      const moon = ctx.createRadialGradient(x - 120, y - 140, 10, x - 60, y - 60, 380);
      moon.addColorStop(0, `rgba(210, 225, 255, ${0.55 * this.level})`);
      moon.addColorStop(1, 'rgba(210, 225, 255, 0)');
      ctx.fillStyle = moon;
      ctx.fillRect(x - RADIUS.x, y - RADIUS.y, RADIUS.x * 2, RADIUS.y * 2);
    }
    // Beschlag
    ctx.fillStyle = 'rgba(225, 232, 240, 0.28)';
    ctx.fillRect(x - RADIUS.x, y - RADIUS.y, RADIUS.x * 2, RADIUS.y * 2);
    for (let i = 0; i < 40; i++) {
      const fx = x - RADIUS.x + ((i * 97) % (RADIUS.x * 2)), fy = y - RADIUS.y + ((i * 53) % (RADIUS.y * 2));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.beginPath();
      ctx.arc(fx, fy, 20 + (i % 5) * 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Das Wort – Spiegelschrift, leuchtet nur im Mondlicht
    const reveal = Math.max(0, (this.level - 0.3) / 0.7);
    if (reveal > 0) {
      ctx.save();
      ctx.translate(x, y - 70);
      ctx.scale(-1, 1);
      ctx.globalAlpha = this.fadeIn * reveal;
      ctx.font = 'bold 92px "Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(200, 225, 255, 0.95)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#eef4ff';
      ctx.fillText(this.word, 0, 0);
      ctx.restore();
    }
    // Glanz
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x - 150, y - 170);
    ctx.lineTo(x - 90, y - 220);
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    this.drawHelp(ctx);
  }
}
