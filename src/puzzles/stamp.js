import { View } from './view.js';
import { roundedRect } from '../ui/text.js';

// Die Stempelmaschine im Postwagen aus der Nähe.
//
//   const code = await story.view('stamp', { paper: 'ticket' });   // '41' nach dem Stempeln, sonst null
//
// Zwei Rädchen stellen die Rundennummer ein (Pfeile oder Rädchen anklicken). Der rote Hebel drückt den
// Stempel herunter. paper: 'ticket' (eine Fahrkarte liegt unter dem Stempel) oder 'blank' (nur die Unterlage).

const CENTER = { x: 640, y: 330 };
const WHEEL = { width: 70, height: 96, gap: 18 };
const ARROW = 20;
const LEVER = { x: 900, y: 137, radius: 34 }; // Knauf des Hebels (in Ruhestellung)

export class Stamp extends View {
  constructor() {
    super();
    this.wheels = [{ value: 3, roll: 0 }, { value: 9, roll: 0 }]; // steht anfangs auf „39“
    this.press = 0;     // 0 … 1 … 0: der Stempel geht herunter und wieder hoch
    this.printed = null;
    this.paper = 'blank';
    this.help = 'Pfeile oder Rädchen: Runde einstellen  ·  roter Hebel: stempeln  ·  Rechtsklick: zurück';
  }

  onOpen({ paper = 'blank' } = {}) {
    this.paper = paper;
    this.press = 0;
    this.printed = null;
  }

  result() {
    return this.printed;
  }

  get code() {
    return this.wheels.map((wheel) => wheel.value).join('');
  }

  wheelCenter(i) {
    const total = 2 * WHEEL.width + WHEEL.gap;
    return { x: CENTER.x - total / 2 + WHEEL.width / 2 + i * (WHEEL.width + WHEEL.gap) + 40, y: CENTER.y - 40 };
  }

  pointerDown(point) {
    if (this.press > 0) return;
    for (let i = 0; i < this.wheels.length; i++) {
      const { x, y } = this.wheelCenter(i);
      const up = Math.hypot(point.x - x, point.y - (y - WHEEL.height / 2 - 28)) <= ARROW + 6;
      const down = Math.hypot(point.x - x, point.y - (y + WHEEL.height / 2 + 28)) <= ARROW + 6;
      const onWheel = Math.abs(point.x - x) <= WHEEL.width / 2 && Math.abs(point.y - y) <= WHEEL.height / 2;
      if (up || down || onWheel) {
        const wheel = this.wheels[i];
        const step = down ? -1 : 1;
        wheel.value = (wheel.value + step + 10) % 10;
        wheel.roll = step;
        this.sound('wheel');
        return;
      }
    }
    if (Math.hypot(point.x - LEVER.x, point.y - LEVER.y) <= LEVER.radius + 26 || (point.x > 840 && point.x < 930 && point.y > LEVER.y && point.y < 240)) {
      this.press = 0.001;
      this.sound('stamp');
    }
  }

  contains(point) {
    return point.x > 300 && point.x < 1010 && point.y > 110 && point.y < 660;
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    for (const wheel of this.wheels) wheel.roll -= wheel.roll * Math.min(1, dt * 14);
    if (this.press > 0) {
      this.press += dt * 1.4;
      if (this.press >= 0.5 && !this.printed) this.printed = this.code;
      if (this.press >= 1.9) this.close(this.printed);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.8);
    ctx.globalAlpha = this.fadeIn;

    // Unterlage und Papier
    const down = this.press > 0 ? Math.sin(Math.min(1, this.press) * Math.PI) : 0;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    roundedRect(ctx, 360, 470, 560, 150, 14);
    ctx.fillStyle = '#3a2a1c';
    ctx.fill();
    ctx.restore();
    const paperRect = { x: 470, y: 494, width: 340, height: 104 };
    if (this.paper === 'ticket') drawTicket(ctx, paperRect, this.printed);
    else {
      ctx.fillStyle = '#e8dcc0';
      ctx.fillRect(paperRect.x, paperRect.y, paperRect.width, paperRect.height);
      if (this.printed) drawImprint(ctx, paperRect.x + paperRect.width / 2, paperRect.y + paperRect.height / 2, this.printed);
    }

    // Maschine: Säule und Kopf (bewegt sich beim Stempeln nach unten)
    ctx.fillStyle = '#2a2e32';
    roundedRect(ctx, 820, 160, 46, 330, 8);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    const headY = 150 + down * 120;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    roundedRect(ctx, 420, headY, 430, 200, 24);
    const metal = ctx.createLinearGradient(0, headY, 0, headY + 200);
    metal.addColorStop(0, '#6b4a2a');
    metal.addColorStop(1, '#3e2814');
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    // Schild "RUNDE"
    roundedRect(ctx, 450, headY + 70, 110, 50, 8);
    ctx.fillStyle = '#efe2c0';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#2b2118';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RUNDE', 505, headY + 96);

    // Rädchen
    ctx.save();
    ctx.translate(0, down * 120);
    this.wheels.forEach((wheel, i) => {
      const { x, y } = this.wheelCenter(i);
      ctx.fillStyle = '#1a120c';
      roundedRect(ctx, x - WHEEL.width / 2 - 5, y - WHEEL.height / 2 - 5, WHEEL.width + 10, WHEEL.height + 10, 10);
      ctx.fill();
      ctx.save();
      roundedRect(ctx, x - WHEEL.width / 2, y - WHEEL.height / 2, WHEEL.width, WHEEL.height, 8);
      ctx.clip();
      const face = ctx.createLinearGradient(0, y - WHEEL.height / 2, 0, y + WHEEL.height / 2);
      face.addColorStop(0, '#2b2b2b');
      face.addColorStop(0.5, '#d8d8d0');
      face.addColorStop(1, '#2b2b2b');
      ctx.fillStyle = face;
      ctx.fillRect(x - WHEEL.width / 2, y - WHEEL.height / 2, WHEEL.width, WHEEL.height);
      ctx.font = 'bold 52px "Courier New", monospace';
      for (const offset of [-1, 0, 1]) {
        ctx.fillStyle = offset === 0 ? '#141414' : 'rgba(20, 20, 20, 0.4)';
        ctx.fillText(String((wheel.value + offset + 10) % 10), x, y + (offset + wheel.roll) * 58);
      }
      ctx.restore();
      if (this.press === 0) {
        arrow(ctx, x, y - WHEEL.height / 2 - 28, -1);
        arrow(ctx, x, y + WHEEL.height / 2 + 28, 1);
      }
    });
    ctx.restore();

    // Hebel
    const angle = -0.5 + down * 0.9;
    ctx.save();
    ctx.translate(850, headY + 60);
    ctx.rotate(angle);
    ctx.lineCap = 'round';
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#120a05';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(80, -40);
    ctx.stroke();
    ctx.lineWidth = 11;
    ctx.strokeStyle = '#9aa3ab';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(80, -40, LEVER.radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#b3261e';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    this.drawHelp(ctx);
  }
}

// Die Fahrkarte (auch für die Karte im Inventar-Rechtsklick benutzt, siehe cards3.js)
export function drawTicket(ctx, { x, y, width, height }, printed) {
  ctx.save();
  ctx.fillStyle = '#e9d7a8';
  roundedRect(ctx, x, y, width, height, 8);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#6b4a2a';
  ctx.stroke();
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(x + width * 0.72, y + 6);
  ctx.lineTo(x + width * 0.72, y + height - 6);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#2b2118';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold ${Math.round(height * 0.2)}px "Trebuchet MS", sans-serif`;
  ctx.fillText('RINGBAHN', x + 14, y + height * 0.3);
  ctx.font = `${Math.round(height * 0.14)}px "Courier New", monospace`;
  ctx.fillText('Ringbahnhof → Ringbahnhof', x + 14, y + height * 0.55);
  ctx.fillText('gültig für 1 Runde', x + 14, y + height * 0.78);
  if (printed) drawImprint(ctx, x + width * 0.86, y + height / 2, printed, height / 104);
  ctx.restore();
}

// Blauer Stempelabdruck "RUNDE 41"
export function drawImprint(ctx, x, y, code, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.12);
  ctx.scale(scale, scale);
  ctx.strokeStyle = 'rgba(44, 63, 154, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 44, 34, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(44, 63, 154, 0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('RUNDE', 0, -11);
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText(code, 0, 11);
  ctx.restore();
}

function arrow(ctx, x, y, direction) {
  ctx.beginPath();
  ctx.arc(x, y, ARROW, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1c12';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d9a441';
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 4 * direction);
  ctx.lineTo(x + 9, y - 4 * direction);
  ctx.lineTo(x, y + 7 * direction);
  ctx.closePath();
  ctx.fillStyle = '#d9a441';
  ctx.fill();
}
