import { View } from './view.js';
import { roundedRect } from '../ui/text.js';

// Nahansicht "Notstrom-Verriegelung" am Schaltpult (Regeln wie das klassische "Lights Out"):
// 5 × 5 Leuchttasten. Ein Druck schaltet die Taste selbst und ihre vier Nachbarn (oben, unten, links,
// rechts) um. Erst wenn alle Lampen dunkel sind, gibt der Magnet die Notstrom-Klappe frei.
//
//   const unlocked = await breaker.open();   // true, sobald alle Lampen aus sind
//   breaker.reset();                         // wieder wie am Anfang (nach jedem Tunnel – Zeitschleife!)
//
// Der Anfangszustand entsteht, indem man die Tasten in START_PRESSES einmal drückt – deshalb ist er
// sicher lösbar: Dieselben neun Tasten noch einmal drücken löst ihn, kürzer geht es nicht (14 Lampen brennen am Anfang).
// Wer die Lösung einmal gefunden hat, kann sie sich merken: Nach dem Tunnel ist das Pult wieder verriegelt.

const SIZE = 5;
const KEY = 66, GAP = 12;
const GRID = { x: 640 - (SIZE * KEY + (SIZE - 1) * GAP) / 2, y: 176 };
const BODY = { x: GRID.x - 90, y: 70, width: SIZE * KEY + (SIZE - 1) * GAP + 180, height: 590 };
export const START_PRESSES = [[0, 1], [0, 3], [1, 0], [1, 4], [2, 2], [3, 1], [4, 0], [4, 3], [4, 4]];

export class Breaker extends View {
  constructor() {
    super();
    this.reset();
    this.help = 'Taste drücken: sie und ihre Nachbarn schalten um  ·  Rechtsklick oder Esc: zurück';
  }

  reset() {
    this.lamps = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    for (const [row, column] of START_PRESSES) this.toggle(row, column);
    this.presses = 0;
    this.unlocked = false;
    this.unlockAge = 0;
  }

  result() {
    return this.unlocked;
  }

  // Zum Testen: alles aus
  solve() {
    this.lamps = this.lamps.map((row) => row.map(() => false));
    this.check();
  }

  toggle(row, column) {
    for (const [dr, dc] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const r = row + dr, c = column + dc;
      if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) this.lamps[r][c] = !this.lamps[r][c];
    }
  }

  check() {
    if (!this.unlocked && this.lamps.every((row) => row.every((lit) => !lit))) {
      this.unlocked = true;
      this.unlockAge = 0;
      this.sound('unlock');
    }
  }

  contains(point) {
    return point.x >= BODY.x && point.x <= BODY.x + BODY.width && point.y >= BODY.y && point.y <= BODY.y + BODY.height;
  }

  pointerDown(point) {
    if (this.unlocked) return;
    const column = Math.floor((point.x - GRID.x) / (KEY + GAP)), row = Math.floor((point.y - GRID.y) / (KEY + GAP));
    if (row < 0 || row >= SIZE || column < 0 || column >= SIZE) return;
    const inKey = (point.x - GRID.x) - column * (KEY + GAP) <= KEY && (point.y - GRID.y) - row * (KEY + GAP) <= KEY;
    if (!inKey) return;
    this.toggle(row, column);
    this.presses += 1;
    this.sound('rotate');
    this.check();
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    if (this.unlocked) {
      this.unlockAge += dt;
      if (this.unlockAge > 1.6) this.close(true);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.8);
    ctx.globalAlpha = this.fadeIn;
    const { x, y, width, height } = BODY;

    // Gehäuse: grünes Blech wie am Schaltpult
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 12;
    const paint = ctx.createLinearGradient(0, y, 0, y + height);
    paint.addColorStop(0, '#4f6f5d');
    paint.addColorStop(1, '#263c33');
    roundedRect(ctx, x, y, width, height, 24);
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();

    // Schild
    roundedRect(ctx, 640 - 190, y + 22, 380, 62, 6);
    ctx.fillStyle = '#d9b25a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3a2610';
    ctx.stroke();
    ctx.fillStyle = '#3a2610';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.fillText('NOTSTROM  ·  VERRIEGELUNG', 640, y + 42);
    ctx.font = '13px "Trebuchet MS", sans-serif';
    ctx.fillText('Klappe wird frei, wenn alle Lampen erloschen sind', 640, y + 66);

    // Tafel mit den Tasten
    roundedRect(ctx, GRID.x - 20, GRID.y - 20, SIZE * KEY + (SIZE - 1) * GAP + 40, SIZE * KEY + (SIZE - 1) * GAP + 40, 14);
    ctx.fillStyle = '#141b17';
    ctx.fill();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const kx = GRID.x + c * (KEY + GAP), ky = GRID.y + r * (KEY + GAP);
        const lit = this.lamps[r][c];
        roundedRect(ctx, kx, ky, KEY, KEY, 12);
        const face = ctx.createRadialGradient(kx + KEY * 0.4, ky + KEY * 0.35, 4, kx + KEY / 2, ky + KEY / 2, KEY * 0.7);
        face.addColorStop(0, lit ? '#fff6c8' : '#3b3a30');
        face.addColorStop(0.45, lit ? '#f2c44a' : '#24231d');
        face.addColorStop(1, lit ? '#9a6412' : '#121210');
        ctx.fillStyle = face;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#070a08';
        ctx.stroke();
        if (lit) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const glow = ctx.createRadialGradient(kx + KEY / 2, ky + KEY / 2, 0, kx + KEY / 2, ky + KEY / 2, KEY);
          glow.addColorStop(0, 'rgba(255, 200, 80, 0.28)');
          glow.addColorStop(1, 'rgba(255, 200, 80, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(kx - KEY / 2, ky - KEY / 2, KEY * 2, KEY * 2);
          ctx.restore();
        }
      }
    }

    // Unten: Magnetriegel mit Anzeige und Schaltzähler
    const ly = GRID.y + SIZE * (KEY + GAP) + 34;
    const open = this.unlocked;
    roundedRect(ctx, 640 - 120, ly, 240, 46, 8);
    ctx.fillStyle = '#0d120f';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9b25a';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(640 - 92, ly + 23, 10, 0, Math.PI * 2);
    ctx.fillStyle = open ? '#57e36f' : '#d0322a';
    ctx.fill();
    ctx.fillStyle = open ? '#9dffb0' : '#ffb0a0';
    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(open ? 'FREIGEGEBEN' : 'VERRIEGELT', 640 - 72, ly + 24);
    ctx.fillStyle = 'rgba(243, 226, 191, 0.55)';
    ctx.font = '13px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`Schaltungen: ${String(this.presses).padStart(3, '0')}`, x + width - 26, y + height - 20);
    ctx.restore();
    this.drawHelp(ctx);
  }
}
