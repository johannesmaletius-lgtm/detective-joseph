import { View } from './view.js';
import { roundedRect } from '../ui/text.js';

// Das Stellpult im Schaffnerabteil: ein Gleisbild der Ringbahn mit vier Weichen.
//
//   const solved = await story.view('switchboard');   // true, sobald die Fahrstraße zur Ausfahrt frei ist
//
// Oben im Tunnel liegt Weiche 7 – eine Handweiche, die man nur vor Ort umstellen kann. Hinter ihr kommen
// die Weichen 3, 5 und 9. Ein Klick stellt eine Weiche um. Grün leuchtet die Fahrstraße, die ein Zug nehmen
// würde, der an Weiche 7 abbiegt. Gelöst ist das Rätsel, wenn sie bis zur AUSFAHRT führt.
// Der Stand bleibt erhalten, wenn man die Ansicht zwischendurch schließt.

const PANEL = { x: 170, y: 96, width: 940, height: 520 };
const LOOP = { x: 250, y: 210, width: 450, height: 330, radius: 70 };
const TUNNEL = { from: 360, to: 620 };

// Die Weichen: Lage und wohin ihre beiden Stellungen führen
const SWITCHES = {
  W3: { x: 700, y: 160, straight: { path: [[700, 160], [840, 160]], to: 'W5' }, diverge: { path: [[700, 160], [760, 210], [790, 262]], to: 'siding' } },
  W5: { x: 840, y: 160, straight: { path: [[840, 160], [1040, 160]], to: 'works' }, diverge: { path: [[840, 160], [890, 220], [930, 290]], to: 'W9' } },
  W9: { x: 930, y: 290, straight: { path: [[930, 290], [930, 390], [880, 440], loopJoin()], to: 'loop' }, diverge: { path: [[930, 290], [990, 312], [1066, 312]], to: 'exit' } },
};
const W7 = { x: 560, y: LOOP.y };
const BRANCH = [[W7.x, W7.y], [620, 160], [700, 160]]; // von Weiche 7 zu Weiche 3
const ENDS = {
  siding: { x: 790, y: 262, label: 'Abstellgleis', kind: 'dead' },
  works: { x: 1040, y: 160, label: 'Baustelle', kind: 'dead' },
  loop: { x: loopJoin()[0], y: loopJoin()[1], label: 'zurück in den Kreis', kind: 'loop' },
  exit: { x: 1066, y: 312, label: 'AUSFAHRT', kind: 'exit' },
};
const START = { W3: 'diverge', W5: 'straight', W9: 'straight' };
export const SOLUTION = { W3: 'straight', W5: 'diverge', W9: 'diverge' };

function loopJoin() {
  return [LOOP.x + LOOP.width, 440];
}

export class Switchboard extends View {
  constructor() {
    super();
    this.state = { ...START };
    this.solved = false;
    this.solvedAge = 0;
    this.time = 0;
    this.message = null; // { text, age }
    this.help = 'Weiche anklicken: umstellen  ·  Rechtsklick oder Esc: zurück';
  }

  result() {
    return this.solved;
  }

  // Wohin führt die Fahrstraße ab Weiche 7? Ergebnis: Liste der Strecken und das Ende
  trace() {
    const paths = [BRANCH];
    let node = 'W3';
    for (let i = 0; i < 6 && SWITCHES[node]; i++) {
      const leg = SWITCHES[node][this.state[node]];
      paths.push(leg.path);
      node = leg.to;
    }
    return { paths, end: ENDS[node] };
  }

  contains(point) {
    return point.x >= PANEL.x && point.x <= PANEL.x + PANEL.width && point.y >= PANEL.y && point.y <= PANEL.y + PANEL.height;
  }

  pointerDown(point) {
    if (this.solved) return;
    if (Math.hypot(point.x - W7.x, point.y - W7.y) < 30) {
      this.message = { text: 'Weiche 7 ist eine Handweiche – sie lässt sich nur vor Ort im Tunnel umstellen.', age: 0 };
      this.sound('locked');
      return;
    }
    for (const [id, sw] of Object.entries(SWITCHES)) {
      if (Math.hypot(point.x - sw.x, point.y - sw.y) < 30) {
        this.state[id] = this.state[id] === 'straight' ? 'diverge' : 'straight';
        this.sound('latch');
        if (this.trace().end.kind === 'exit') {
          this.solved = true;
          this.solvedAge = 0;
          this.sound('power');
        }
        return;
      }
    }
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    this.time += dt;
    if (this.message) {
      this.message.age += dt;
      if (this.message.age > 3.5) this.message = null;
    }
    if (this.solved) {
      this.solvedAge += dt;
      if (this.solvedAge > 3) this.close(true);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.82);
    ctx.globalAlpha = this.fadeIn;
    // Pult
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    roundedRect(ctx, PANEL.x, PANEL.y, PANEL.width, PANEL.height, 18);
    ctx.fillStyle = '#26302a';
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    roundedRect(ctx, PANEL.x + 20, PANEL.y + 20, PANEL.width - 40, PANEL.height - 80, 10);
    ctx.fillStyle = '#121a16';
    ctx.fill();
    ctx.fillStyle = '#e8d6a0';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('STELLPULT RINGBAHN', PANEL.x + 40, PANEL.y + 46);

    // der Kreis
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    roundedRect(ctx, LOOP.x, LOOP.y, LOOP.width, LOOP.height, LOOP.radius);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#8a9088';
    ctx.stroke();
    // Tunnel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(TUNNEL.from, LOOP.y - 18, TUNNEL.to - TUNNEL.from, 36);
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(TUNNEL.from, LOOP.y - 18, TUNNEL.to - TUNNEL.from, 36);
    ctx.fillStyle = '#c9cfd4';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TUNNEL', (TUNNEL.from + TUNNEL.to) / 2 - 60, LOOP.y);
    // Turm in der Mitte, Zug unten
    ctx.fillStyle = Math.sin(this.time * 3) > 0 ? '#ff4a3a' : '#5a1a14';
    ctx.beginPath();
    ctx.arc(LOOP.x + LOOP.width / 2, LOOP.y + LOOP.height / 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9cfd4';
    ctx.fillText('TURM', LOOP.x + LOOP.width / 2, LOOP.y + LOOP.height / 2 + 22);
    ctx.fillStyle = '#e8c74a';
    roundedRect(ctx, LOOP.x + 140, LOOP.y + LOOP.height - 9, 90, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#c9cfd4';
    ctx.fillText('ZUG', LOOP.x + 185, LOOP.y + LOOP.height + 24);

    // alle Strecken grau, dann die Fahrstraße grün
    const { paths, end } = this.trace();
    const drawPath = (path, color, width) => {
      ctx.beginPath();
      path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    };
    drawPath(BRANCH, '#5a6058', 8);
    for (const sw of Object.values(SWITCHES)) {
      drawPath(sw.straight.path, '#5a6058', 8);
      drawPath(sw.diverge.path, '#5a6058', 8);
    }
    const lit = end.kind === 'exit' ? '#7dff8a' : end.kind === 'loop' ? '#ffd36b' : '#ff7a5a';
    for (const path of paths) drawPath(path, lit, 5);

    // Enden
    for (const e of Object.values(ENDS)) {
      if (e.kind === 'dead') {
        ctx.fillStyle = '#b3261e';
        ctx.fillRect(e.x - 4, e.y - 14, 8, 28);
      }
      ctx.fillStyle = e === end ? lit : '#c9cfd4';
      ctx.font = e.kind === 'exit' ? 'bold 16px "Courier New", monospace' : '13px "Courier New", monospace';
      ctx.textAlign = e.kind === 'exit' ? 'left' : 'center';
      const dy = e.kind === 'exit' ? 0 : e.kind === 'loop' ? 22 : 30;
      ctx.fillText(e.label, e.x + (e.kind === 'exit' ? 6 : e.kind === 'loop' ? 112 : 0), e.y + dy);
    }
    // Weiche 7: Hand
    const blink = Math.sin(this.time * 5) > 0;
    switchKnob(ctx, W7.x, W7.y, blink ? '#ff5a3a' : '#5a1a14');
    ctx.fillStyle = '#ff9a8a';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('W7 · HAND', W7.x, W7.y + 34);
    // die anderen Weichen
    for (const [id, sw] of Object.entries(SWITCHES)) {
      switchKnob(ctx, sw.x, sw.y, '#e8c74a');
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(id, sw.x, sw.y + 1);
    }
    // Statuszeile
    ctx.textAlign = 'left';
    ctx.font = 'bold 17px "Courier New", monospace';
    const status = end.kind === 'exit'
      ? 'Fahrstraße frei bis AUSFAHRT – nur W7 fehlt: Handweiche, Rückfall!'
      : end.kind === 'loop' ? 'Fahrstraße führt zurück in den Kreis.' : `Fahrstraße endet: ${end.label} (Prellbock).`;
    ctx.fillStyle = lit;
    ctx.fillText(status, PANEL.x + 40, PANEL.y + PANEL.height - 30);
    if (this.message) {
      ctx.globalAlpha = Math.min(1, (3.5 - this.message.age) * 2) * this.fadeIn;
      ctx.fillStyle = '#ff9a8a';
      ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.message.text, 640, PANEL.y + 80);
    }
    ctx.restore();
    this.drawHelp(ctx);
  }
}

function switchKnob(ctx, x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, 17, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#120a05';
  ctx.stroke();
}
