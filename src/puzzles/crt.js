import { View } from './view.js';
import { roundedRect } from '../ui/text.js';

// Nahansicht "Bildschirm": der kleine Röhrenbildschirm über dem Schaltpult, groß.
//
//   await crt.open({
//     mode: () => 'noise',                 // 'off' (kein Strom), 'noise' (Rauschen) oder 'feed' (Kamerabild)
//     picture: () => feed.render({ … }),   // das Kamerabild (siehe cameraFeed.js), nur bei 'feed'
//   });
//
// mode und picture sind Funktionen, weil sich beides ändern kann, während man hinsieht
// (z. B. fährt der Zug in den Tunnel). Die Ansicht bleibt auch im Dunkeln offen – der Bildschirm leuchtet ja.

const BODY = { x: 292, y: 62, width: 696, height: 560 };
const SCREEN = { x: 344, y: 112, width: 472, height: 354 };
const NOISE = { width: 118, height: 88, frames: 6 };

export class Crt extends View {
  constructor() {
    super();
    this.mode = () => 'noise';
    this.picture = () => null;
    this.time = 0;
    this.noise = null;
    this.staysInDark = true;
    this.help = 'Rechtsklick oder Esc: zurück';
  }

  onOpen({ mode, picture }) {
    this.mode = mode;
    this.picture = picture ?? (() => null);
    this.noise ??= makeNoise();
  }

  update(dt) {
    super.update(dt);
    if (this.isOpen) this.time += dt;
  }

  contains(point) {
    return point.x >= BODY.x && point.x <= BODY.x + BODY.width && point.y >= BODY.y && point.y <= BODY.y + BODY.height;
  }

  draw(ctx) {
    if (!this.isOpen) return;
    const mode = this.mode();
    ctx.save();
    this.drawBackdrop(ctx, 0.84);
    ctx.globalAlpha = this.fadeIn;
    this.drawBody(ctx, mode);

    // Mattscheibe
    const { x, y, width, height } = SCREEN;
    ctx.save();
    roundedRect(ctx, x, y, width, height, 34);
    ctx.clip();
    ctx.fillStyle = '#050706';
    ctx.fillRect(x, y, width, height);
    if (mode === 'noise') {
      const frame = this.noise[Math.floor(this.time * 16) % this.noise.length];
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(frame, x, y, width, height);
      ctx.imageSmoothingEnabled = true;
      const roll = ((this.time * 120) % (height + 160)) - 80;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.fillRect(x, y + roll, width, 60);
    } else if (mode === 'feed') {
      const picture = this.picture();
      if (picture) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(picture, x, y, width, height);
        ctx.imageSmoothingEnabled = true;
      }
    }
    if (mode !== 'off') {
      // Zeilen der Bildröhre
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      for (let line = y; line < y + height; line += 4) ctx.fillRect(x, line, width, 1.5);
    }
    // dunkle Ecken und eine Spiegelung auf dem gewölbten Glas
    const corners = ctx.createRadialGradient(x + width / 2, y + height / 2, height * 0.35, x + width / 2, y + height / 2, width * 0.72);
    corners.addColorStop(0, 'rgba(0, 0, 0, 0)');
    corners.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = corners;
    ctx.fillRect(x, y, width, height);
    const shine = ctx.createLinearGradient(x, y, x + width * 0.6, y + height * 0.7);
    shine.addColorStop(0, 'rgba(255, 255, 255, 0.13)');
    shine.addColorStop(0.35, 'rgba(255, 255, 255, 0.02)');
    shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shine;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
    ctx.restore();
    this.drawHelp(ctx);
  }

  // Gehäuse: grünes Blech mit rostigem Rahmen, rechts Lautsprecher und Knöpfe, unten ein Schild
  drawBody(ctx, mode) {
    const { x, y, width, height } = BODY;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 14;
    roundedRect(ctx, x, y, width, height, 30);
    ctx.fillStyle = '#b05c2a';
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    const paint = ctx.createLinearGradient(0, y, 0, y + height);
    paint.addColorStop(0, '#4f6f5d');
    paint.addColorStop(1, '#2a4238');
    roundedRect(ctx, x + 14, y + 14, width - 28, height - 28, 20);
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    // Kratzer und Rost
    ctx.strokeStyle = 'rgba(176, 92, 42, 0.35)';
    ctx.lineWidth = 3;
    for (const [x0, y0, x1, y1] of [[330, 520, 372, 532], [860, 96, 900, 90], [700, 590, 760, 596]]) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // Rahmen der Mattscheibe und ihr Lichtschein
    const s = SCREEN;
    roundedRect(ctx, s.x - 16, s.y - 16, s.width + 32, s.height + 32, 44);
    ctx.fillStyle = '#131a17';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#070a08';
    ctx.stroke();
    if (mode !== 'off') {
      const color = mode === 'feed' ? '110, 255, 150' : '210, 225, 240';
      const glow = ctx.createRadialGradient(s.x + s.width / 2, s.y + s.height / 2, s.height * 0.4, s.x + s.width / 2, s.y + s.height / 2, s.width * 0.85);
      glow.addColorStop(0, `rgba(${color}, 0.22)`);
      glow.addColorStop(1, `rgba(${color}, 0)`);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = glow;
      ctx.fillRect(x, y, width, height);
      ctx.restore();
    }

    // Rechts: Lautsprecherschlitze, zwei Drehknöpfe, Kontrolllampe
    const cx = 902;
    for (let i = 0; i < 9; i++) {
      roundedRect(ctx, cx - 44, 128 + i * 15, 88, 7, 3.5);
      ctx.fillStyle = '#0f1613';
      ctx.fill();
    }
    for (const [ky, color] of [[318, '#b0342a'], [398, '#d9b25a']]) {
      ctx.beginPath();
      ctx.arc(cx, ky, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#131a17';
      ctx.fill();
      const knob = ctx.createRadialGradient(cx - 8, ky - 8, 2, cx, ky, 24);
      knob.addColorStop(0, '#ffffff55');
      knob.addColorStop(0.25, color);
      knob.addColorStop(1, '#1b0f0a');
      ctx.beginPath();
      ctx.arc(cx, ky, 23, 0, Math.PI * 2);
      ctx.fillStyle = knob;
      ctx.fill();
      ctx.strokeStyle = '#f3e2bf';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, ky);
      ctx.lineTo(cx + 12, ky - 16);
      ctx.stroke();
    }
    const on = mode !== 'off';
    ctx.beginPath();
    ctx.arc(cx, 458, 9, 0, Math.PI * 2);
    ctx.fillStyle = on ? '#57e36f' : '#3a1512';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();

    // Unten: Messingschild
    roundedRect(ctx, 344, 512, 472, 66, 8);
    ctx.fillStyle = '#d9b25a';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#3a2610';
    ctx.stroke();
    ctx.fillStyle = '#3a2610';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText('RINGBAHN  ·  BILDFUNK', 580, 534);
    ctx.font = '14px "Trebuchet MS", sans-serif';
    ctx.fillText('Signal über den Verteilerkasten  ·  Notstrom: Batterie (Klappe unten)', 580, 560);
  }
}

// Ein paar Bilder Rauschen (schwarz-weiße Punkte), die schnell nacheinander gezeigt werden
function makeNoise() {
  const frames = [];
  for (let i = 0; i < NOISE.frames; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = NOISE.width;
    canvas.height = NOISE.height;
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(NOISE.width, NOISE.height);
    for (let p = 0; p < NOISE.width * NOISE.height; p++) {
      const value = Math.random() < 0.5 ? 20 + Math.random() * 60 : 120 + Math.random() * 135;
      image.data[p * 4] = value;
      image.data[p * 4 + 1] = value;
      image.data[p * 4 + 2] = value * 1.04;
      image.data[p * 4 + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    frames.push(canvas);
  }
  return frames;
}
