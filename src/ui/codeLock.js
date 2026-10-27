import { COLORS, FONTS, outlinedText, roundedRect } from './text.js';

// Nahansicht eines Zahlenschlosses mit drehbaren Rädchen.
//
//   const opened = await codeLock.open({ digits: 2, check: (code) => code === '79' });
//
// Pfeile drehen die Rädchen, ein Klick auf den Bügel probiert die Zahl aus.
// Rechtsklick, Esc oder ein Klick neben das Schloss schließt die Ansicht wieder.

const CENTER = { x: 640, y: 380 };
const BODY = { width: 300, height: 230 };
const WHEEL = { width: 66, height: 104, gap: 16 };
const ARROW_RADIUS = 20;

export class CodeLock {
  constructor() {
    this.isOpen = false;
    this.wheels = [];
    this.shake = 0;       // wackelt kurz, wenn die Zahl falsch ist
    this.unlocked = 0;    // 0 … 1: Bügel springt auf
    this.onSound = null;  // (name) – für Klickgeräusche, siehe soundEffects.js
  }

  open({ digits = 2, check }) {
    this.isOpen = true;
    this.check = check;
    this.unlocked = 0;
    this.wheels = Array.from({ length: digits }, (_, i) => this.wheels[i] ?? { value: 0, roll: 0 });
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close(opened = false) {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.resolve?.(opened);
    this.resolve = null;
  }

  get code() {
    return this.wheels.map((wheel) => wheel.value).join('');
  }

  // Position eines Rädchens (Mitte)
  wheelCenter(index) {
    const total = this.wheels.length * WHEEL.width + (this.wheels.length - 1) * WHEEL.gap;
    return { x: CENTER.x - total / 2 + WHEEL.width / 2 + index * (WHEEL.width + WHEEL.gap), y: CENTER.y + 30 };
  }

  handleClick(point, right) {
    if (this.unlocked > 0) return;
    if (right) return this.close(false);
    for (let i = 0; i < this.wheels.length; i++) {
      const { x, y } = this.wheelCenter(i);
      const up = Math.hypot(point.x - x, point.y - (y - WHEEL.height / 2 - 30)) <= ARROW_RADIUS + 6;
      const down = Math.hypot(point.x - x, point.y - (y + WHEEL.height / 2 + 30)) <= ARROW_RADIUS + 6;
      const onWheel = Math.abs(point.x - x) <= WHEEL.width / 2 && Math.abs(point.y - y) <= WHEEL.height / 2;
      if (up || down || onWheel) {
        const wheel = this.wheels[i];
        const step = down ? -1 : 1;
        wheel.value = (wheel.value + step + 10) % 10;
        wheel.roll = step;
        this.onSound?.('wheel');
        return;
      }
    }
    if (this.onShackle(point)) {
      if (this.check(this.code)) {
        this.unlocked = 0.001;
        this.onSound?.('unlock');
      } else {
        this.shake = 1;
        this.onSound?.('locked');
      }
      return;
    }
    const insideBody = Math.abs(point.x - CENTER.x) <= BODY.width / 2 + 40 && point.y >= CENTER.y - BODY.height / 2 - 140 && point.y <= CENTER.y + BODY.height / 2 + 30;
    if (!insideBody) this.close(false);
  }

  onShackle(point) {
    const top = CENTER.y - BODY.height / 2;
    return Math.abs(point.x - CENTER.x) <= 110 && point.y >= top - 130 && point.y < top;
  }

  isHovering(point) {
    return this.onShackle(point) ? 'shackle' : null;
  }

  update(dt) {
    if (!this.isOpen) return;
    this.shake = Math.max(0, this.shake - dt * 2.5);
    for (const wheel of this.wheels) wheel.roll -= wheel.roll * Math.min(1, dt * 14);
    if (this.unlocked > 0) {
      this.unlocked += dt * 1.6;
      if (this.unlocked >= 1.4) this.close(true); // kurz offen zeigen, dann zurück ins Abteil
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 3, 2, 0.78)';
    ctx.fillRect(0, 0, 1280, 720);
    const wobble = Math.sin(this.shake * 40) * 9 * this.shake;
    ctx.translate(wobble, 0);

    const top = CENTER.y - BODY.height / 2;
    const lift = Math.min(1, this.unlocked) * 46;

    // Bügel
    ctx.lineCap = 'butt';
    ctx.lineWidth = 34;
    const steel = ctx.createLinearGradient(CENTER.x - 100, 0, CENTER.x + 100, 0);
    steel.addColorStop(0, '#6f777f');
    steel.addColorStop(0.45, '#d8dee3');
    steel.addColorStop(1, '#5d646b');
    ctx.strokeStyle = '#120a05';
    ctx.lineWidth = 42;
    shackle(ctx, top, lift);
    ctx.strokeStyle = steel;
    ctx.lineWidth = 32;
    shackle(ctx, top, lift);

    // Körper
    const brass = ctx.createLinearGradient(0, top, 0, top + BODY.height);
    brass.addColorStop(0, '#e9bd62');
    brass.addColorStop(1, '#8f5f22');
    roundedRect(ctx, CENTER.x - BODY.width / 2, top, BODY.width, BODY.height, 34);
    ctx.fillStyle = brass;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();

    // Rädchen mit Pfeilen
    this.wheels.forEach((wheel, i) => {
      const { x, y } = this.wheelCenter(i);
      ctx.fillStyle = '#1a120c';
      roundedRect(ctx, x - WHEEL.width / 2 - 5, y - WHEEL.height / 2 - 5, WHEEL.width + 10, WHEEL.height + 10, 10);
      ctx.fill();
      ctx.save();
      roundedRect(ctx, x - WHEEL.width / 2, y - WHEEL.height / 2, WHEEL.width, WHEEL.height, 8);
      ctx.clip();
      const metal = ctx.createLinearGradient(0, y - WHEEL.height / 2, 0, y + WHEEL.height / 2);
      metal.addColorStop(0, '#3b342c');
      metal.addColorStop(0.5, '#cbb89a');
      metal.addColorStop(1, '#3b342c');
      ctx.fillStyle = metal;
      ctx.fillRect(x - WHEEL.width / 2, y - WHEEL.height / 2, WHEEL.width, WHEEL.height);
      ctx.font = 'bold 56px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const offset of [-1, 0, 1]) {
        const digit = (wheel.value + offset + 10) % 10; // oben die kleinere, unten die größere Zahl
        ctx.fillStyle = offset === 0 ? '#1d140c' : 'rgba(29, 20, 12, 0.45)';
        ctx.fillText(String(digit), x, y + (offset + wheel.roll) * 62);
      }
      ctx.restore();
      arrow(ctx, x, y - WHEEL.height / 2 - 30, -1);
      arrow(ctx, x, y + WHEEL.height / 2 + 30, 1);
    });

    ctx.font = FONTS.small;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    outlinedText(ctx, 'Pfeile oder Rädchen: Zahl drehen  ·  Bügel: öffnen  ·  Rechtsklick: zurück', CENTER.x, CENTER.y + BODY.height / 2 + 70, COLORS.joseph, 4);
    ctx.restore();
  }
}

function shackle(ctx, top, lift) {
  ctx.beginPath();
  ctx.moveTo(CENTER.x - 90, top + 10 - lift);
  ctx.lineTo(CENTER.x - 90, top - 60 - lift);
  ctx.arc(CENTER.x, top - 60 - lift, 90, Math.PI, 0);
  ctx.lineTo(CENTER.x + 90, top + 10);
  ctx.stroke();
}

function arrow(ctx, x, y, direction) {
  ctx.beginPath();
  ctx.arc(x, y, ARROW_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#2a1c12';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.brass;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 4 * direction);
  ctx.lineTo(x + 9, y - 4 * direction);
  ctx.lineTo(x, y + 7 * direction);
  ctx.closePath();
  ctx.fillStyle = COLORS.brass;
  ctx.fill();
}
