import { View } from '../puzzles/view.js';
import { roundedRect } from './text.js';
import { drawSymbol } from './symbols.js';

// Nahansicht eines Zahlenschlosses mit drehbaren Rädchen.
//
//   const opened = await codeLock.open({
//     id: 'door',                                   // jedes Schloss merkt sich seine Rädchen
//     digits: 4,
//     symbols: ['tunnel', 'lanternLeft', 'lanternRight', 'tower'],  // (optional) Zeichen über den Rädchen
//     style: 'brass',                               // 'brass' (Messing) oder 'steel' (Stahl, z. B. am Koffer)
//     check: (code) => code === '5783',
//   });
//
// Pfeile drehen die Rädchen, ein Klick auf den Bügel probiert die Zahl aus.
// Rechtsklick, Esc oder ein Klick neben das Schloss schließt die Ansicht wieder.

const CENTER = { x: 640, y: 390 };
const WHEEL = { width: 66, height: 104, gap: 16 };
const ARROW_RADIUS = 20;

const STYLES = {
  brass: { top: '#e9bd62', bottom: '#8f5f22', engraving: '#5a3a12', plate: 'rgba(255, 236, 170, 0.28)' },
  steel: { top: '#b9c2c9', bottom: '#59626b', engraving: '#2c333a', plate: 'rgba(255, 255, 255, 0.22)' },
};

export class CodeLock extends View {
  constructor() {
    super();
    this.states = {};     // id → Rädchen (bleiben stehen, wenn man das Schloss später wieder ansieht)
    this.wheels = [];
    this.symbols = null;
    this.style = STYLES.brass;
    this.shake = 0;       // wackelt kurz, wenn die Zahl falsch ist
    this.unlocked = 0;    // 0 … 1: Bügel springt auf
    this.staysInDark = false;
    this.help = 'Pfeile oder Rädchen: Zahl drehen  ·  Bügel: öffnen  ·  Rechtsklick: zurück';
  }

  onOpen({ id = 'lock', digits = 2, check, symbols = null, style = 'brass' }) {
    this.check = check;
    this.unlocked = 0;
    this.shake = 0;
    this.symbols = symbols;
    this.style = STYLES[style] ?? STYLES.brass;
    this.states[id] ??= Array.from({ length: digits }, () => ({ value: 0, roll: 0 }));
    this.wheels = this.states[id];
  }

  get code() {
    return this.wheels.map((wheel) => wheel.value).join('');
  }

  // Maße des Schlosskörpers – breiter bei mehr Rädchen, höher mit Zeichen
  get body() {
    const wheelsWidth = this.wheels.length * WHEEL.width + (this.wheels.length - 1) * WHEEL.gap;
    const width = Math.max(300, wheelsWidth + 96);
    const height = this.symbols ? 300 : 236;
    return { width, height, top: CENTER.y - height / 2, wheelsWidth };
  }

  // Position eines Rädchens (Mitte)
  wheelCenter(index) {
    const { wheelsWidth, top, height } = this.body;
    return {
      x: CENTER.x - wheelsWidth / 2 + WHEEL.width / 2 + index * (WHEEL.width + WHEEL.gap),
      y: top + height - 30 - 30 - WHEEL.height / 2 - 6,
    };
  }

  contains(point) {
    const { width, height, top } = this.body;
    return Math.abs(point.x - CENTER.x) <= width / 2 + 40 && point.y >= top - 150 && point.y <= top + height + 30;
  }

  pointerDown(point) {
    if (this.unlocked > 0) return;
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
        this.sound('wheel');
        return;
      }
    }
    if (this.onShackle(point)) {
      if (this.check(this.code)) {
        this.unlocked = 0.001;
        this.sound('unlock');
      } else {
        this.shake = 1;
        this.sound('locked');
      }
    }
  }

  onShackle(point) {
    const { top } = this.body;
    return Math.abs(point.x - CENTER.x) <= 110 && point.y >= top - 130 && point.y < top;
  }

  update(dt) {
    super.update(dt);
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
    this.drawBackdrop(ctx, 0.78);
    ctx.globalAlpha = this.fadeIn;
    const wobble = Math.sin(this.shake * 40) * 9 * this.shake;
    ctx.translate(wobble, 0);

    const { width, height, top } = this.body;
    const lift = Math.min(1, this.unlocked) * 46;

    // Bügel
    ctx.lineCap = 'butt';
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
    const metal = ctx.createLinearGradient(0, top, 0, top + height);
    metal.addColorStop(0, this.style.top);
    metal.addColorStop(1, this.style.bottom);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    roundedRect(ctx, CENTER.x - width / 2, top, width, height, 34);
    ctx.fillStyle = metal;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    // Lichtkante oben und Nieten in den Ecken
    roundedRect(ctx, CENTER.x - width / 2 + 9, top + 9, width - 18, height - 18, 26);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.stroke();
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      rivet(ctx, CENTER.x + dx * (width / 2 - 24), top + height / 2 + dy * (height / 2 - 24));
    }

    // Rädchen mit Pfeilen, darüber die eingravierten Zeichen
    this.wheels.forEach((wheel, i) => {
      const { x, y } = this.wheelCenter(i);
      if (this.symbols?.[i]) {
        const sy = y - WHEEL.height / 2 - 30 - ARROW_RADIUS - 34;
        roundedRect(ctx, x - 29, sy - 27, 58, 54, 9);
        ctx.fillStyle = this.style.plate;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.style.engraving;
        ctx.stroke();
        drawSymbol(ctx, this.symbols[i], x, sy, 36, this.style.engraving);
      }
      ctx.fillStyle = '#1a120c';
      roundedRect(ctx, x - WHEEL.width / 2 - 5, y - WHEEL.height / 2 - 5, WHEEL.width + 10, WHEEL.height + 10, 10);
      ctx.fill();
      ctx.save();
      roundedRect(ctx, x - WHEEL.width / 2, y - WHEEL.height / 2, WHEEL.width, WHEEL.height, 8);
      ctx.clip();
      const face = ctx.createLinearGradient(0, y - WHEEL.height / 2, 0, y + WHEEL.height / 2);
      face.addColorStop(0, '#3b342c');
      face.addColorStop(0.5, '#cbb89a');
      face.addColorStop(1, '#3b342c');
      ctx.fillStyle = face;
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
    ctx.restore();
    this.drawHelp(ctx);
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

function rivet(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(40, 24, 8, 0.55)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 1.5, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
}

function arrow(ctx, x, y, direction) {
  ctx.beginPath();
  ctx.arc(x, y, ARROW_RADIUS, 0, Math.PI * 2);
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
