import { View } from './view.js';
import { drawSymbol } from '../ui/symbols.js';
import { roundedRect, wrapText } from '../ui/text.js';

// Nahansicht "Rätselheft": ein 6 × 6-Zahlenquadrat mit unregelmäßigen Gebieten (Jigsaw-Sudoku).
//
//   const solved = await sudoku.open();   // true, wenn alle Felder richtig ausgefüllt sind
//
// In jede Reihe, jede Spalte und jedes dick umrandete Gebiet gehören die Zahlen 1 bis 6 – jede genau
// einmal. Gedruckt sind nur 7 Zahlen. Das Rätsel hat genau eine Lösung und lässt sich ohne Raten lösen
// (geprüft mit einem Löser, der nur "nur noch eine Zahl passt hierher" und "diese Zahl passt nur noch an
// eine Stelle" benutzt – mit unregelmäßigen Gebieten ist das trotzdem knifflig).
//
// Bedienung: Feld anklicken, dann eine Zahl rechts am Rand (oder Tasten 1–6, Entf/Rückschritt löscht,
// Pfeiltasten wandern). Was man einträgt, bleibt stehen – auch wenn man das Heft zwischendurch weglegt.
// Drei Felder sind rot eingekreist und mit Zeichen markiert: Sie ergeben den Code für den Koffer
// (dessen Rädchen tragen dieselben Zeichen – aber in anderer Reihenfolge, siehe wagon1.js).

const N = 6;
// Die Gebiete (gleicher Buchstabe = gleiches Gebiet)
export const REGIONS = [
  'aaabbb',
  'acabbd',
  'ccabdd',
  'cceedd',
  'ceeffd',
  'eeffff',
].map((row) => row.split(''));
// Gedruckte Zahlen (0 = leer)
const GIVEN = [
  [0, 0, 5, 0, 0, 4],
  [0, 0, 0, 0, 0, 3],
  [2, 0, 0, 0, 5, 0],
  [0, 0, 0, 0, 0, 0],
  [6, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
];
// Die Lösung – nur zur Kontrolle und für die Tipps; das Spiel prüft die Regeln selbst.
export const SOLUTION = [
  [3, 6, 5, 2, 1, 4],
  [1, 4, 2, 5, 6, 3],
  [2, 1, 4, 3, 5, 6],
  [5, 3, 6, 1, 4, 2],
  [6, 5, 3, 4, 2, 1],
  [4, 2, 1, 6, 3, 5],
];
// Eingekreiste Felder mit ihrem Zeichen
export const CIRCLES = [
  { row: 3, column: 2, symbol: 'tower' },
  { row: 1, column: 1, symbol: 'tunnel' },
  { row: 4, column: 4, symbol: 'moon' },
];
// Der Wert eines eingekreisten Feldes (für Kofferschloss und Tipps)
export function circledValue(symbol) {
  const circle = CIRCLES.find((c) => c.symbol === symbol);
  return SOLUTION[circle.row][circle.column];
}

const PAGE = { x: 350, y: 22, width: 580, height: 650 };
const CELL = 64;
const GRID = { x: PAGE.x + 34, y: PAGE.y + 196 };
const PAD = { x: PAGE.x + 450, y: GRID.y + 4, size: 46, gap: 8 }; // Zahlenknöpfe am Rand

const PRINT = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const HAND = '"Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
const INK = '#2b2118';
const BLUE_INK = '#27408f';
const RED_PENCIL = '#b3261e';

export class Sudoku extends View {
  constructor() {
    super();
    this.entries = GIVEN.map((row) => row.map((value) => value));
    this.selected = { row: 3, column: 3 };
    this.solved = false;
    this.flash = 0;
    this.help = 'Feld anklicken, dann Zahl wählen (oder Tasten 1–6, Entf löscht)  ·  Rechtsklick oder Esc: zurück';
  }

  result() {
    return this.solved;
  }

  get full() {
    return this.entries.every((row) => row.every(Boolean));
  }

  // Zum Testen: alles richtig eintragen
  solve() {
    this.entries = SOLUTION.map((row) => [...row]);
    this.check();
  }

  given(row, column) {
    return GIVEN[row][column] !== 0;
  }

  contains(point) {
    return point.x >= PAGE.x && point.x <= PAGE.x + PAGE.width && point.y >= PAGE.y && point.y <= PAGE.y + PAGE.height;
  }

  pointerDown(point) {
    const column = Math.floor((point.x - GRID.x) / CELL), row = Math.floor((point.y - GRID.y) / CELL);
    if (row >= 0 && row < N && column >= 0 && column < N) {
      this.selected = { row, column };
      this.sound('wheel');
      return;
    }
    const button = this.padAt(point);
    if (button !== null) this.enter(button);
  }

  // Welcher Knopf am Rand liegt unter dem Punkt? 1–6 oder 0 (= löschen)
  padAt(point) {
    for (let i = 0; i <= N; i++) {
      const { x, y } = this.padButton(i);
      if (point.x >= x && point.x <= x + PAD.size && point.y >= y && point.y <= y + PAD.size) return i === N ? 0 : i + 1;
    }
    return null;
  }

  padButton(i) {
    return { x: PAD.x + (i % 2) * (PAD.size + PAD.gap), y: PAD.y + Math.floor(i / 2) * (PAD.size + PAD.gap) };
  }

  keyDown(key) {
    if (/^[1-6]$/.test(key)) return this.enter(Number(key)), true;
    if (key === 'backspace' || key === 'delete' || key === '0') return this.enter(0), true;
    const moves = { arrowup: [-1, 0], arrowdown: [1, 0], arrowleft: [0, -1], arrowright: [0, 1] };
    if (moves[key]) {
      const [dr, dc] = moves[key];
      this.selected = { row: (this.selected.row + dr + N) % N, column: (this.selected.column + dc + N) % N };
      return true;
    }
    return false;
  }

  enter(value) {
    const { row, column } = this.selected;
    if (this.given(row, column)) {
      this.sound('locked');
      return;
    }
    this.entries[row][column] = value;
    this.sound('paper');
    this.check();
  }

  // Gelöst, wenn jede Reihe, Spalte und jedes Gebiet 1–6 genau einmal enthält
  check() {
    const units = [];
    for (let i = 0; i < N; i++) {
      units.push(this.entries[i]);
      units.push(this.entries.map((row) => row[i]));
    }
    const regions = {};
    REGIONS.forEach((row, r) => row.forEach((id, c) => (regions[id] ??= []).push(this.entries[r][c])));
    units.push(...Object.values(regions));
    const ok = this.full && units.every((unit) => new Set(unit).size === N);
    if (ok && !this.solved) {
      this.solved = true;
      this.flash = 1;
      this.sound('success');
    }
    if (!ok) this.solved = false;
  }

  update(dt) {
    super.update(dt);
    this.flash = Math.max(0, this.flash - dt * 0.8);
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.8);
    ctx.globalAlpha = this.fadeIn;
    const { x, y, width, height } = PAGE;

    // Papier
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    const paper = ctx.createLinearGradient(0, y, 0, y + height);
    paper.addColorStop(0, '#f3ecd8');
    paper.addColorStop(1, '#e2d6b6');
    ctx.fillStyle = paper;
    ctx.fillRect(x, y, width, height);
    ctx.restore();

    // Kopfzeile und Regeln
    ctx.fillStyle = INK;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = `bold 13px ${PRINT}`;
    ctx.fillText('RÄTSELFREUND  ·  Heft für lange Fahrten', x + 34, y + 38);
    ctx.textAlign = 'right';
    ctx.fillText('Seite 41  ·  ★★★★★', x + width - 34, y + 38);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    line(ctx, x + 34, y + 48, x + width - 34, y + 48);
    ctx.textAlign = 'left';
    ctx.font = `bold 28px ${PRINT}`;
    ctx.fillText('Verwinkeltes Zahlenquadrat', x + 34, y + 88);
    ctx.font = `14px ${PRINT}`;
    wrapText(ctx, 'In jede Reihe, in jede Spalte und in jedes der sechs dick umrandeten Gebiete gehören die Zahlen 1 bis 6 – jede genau einmal. Für Könner: nur sieben Zahlen sind vorgegeben.', width - 68)
      .forEach((row, i) => ctx.fillText(row, x + 34, y + 116 + i * 19));

    this.drawGrid(ctx);
    this.drawPad(ctx);

    // Rand: Josephs Notizen
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = BLUE_INK;
    ctx.font = `22px ${HAND}`;
    ctx.save();
    ctx.translate(PAD.x, PAD.y + 262);
    ctx.rotate(-0.06);
    ctx.fillText('Koffer!', 0, 0);
    ctx.restore();
    ctx.font = `17px ${HAND}`;
    ['Nicht raten.', '', 'NICHT', 'einschlafen.'].forEach((row, i) => ctx.fillText(row, PAD.x, PAD.y + 300 + i * 24));
    ctx.fillStyle = INK;
    ctx.font = `12px ${PRINT}`;
    ctx.fillText('Die Auflösung steht im nächsten Heft.', x + 34, y + height - 18);
    ctx.textAlign = 'right';
    ctx.fillText('– 41 –', x + width - 34, y + height - 18);

    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255, 244, 200, ${0.35 * this.flash})`;
      ctx.fillRect(GRID.x, GRID.y, CELL * N, CELL * N);
    }
    ctx.restore();
    this.drawHelp(ctx);
  }

  drawGrid(ctx) {
    const size = CELL * N;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(GRID.x, GRID.y, size, size);
    // Auswahl
    const { row: sr, column: sc } = this.selected;
    ctx.fillStyle = 'rgba(39, 64, 143, 0.14)';
    ctx.fillRect(GRID.x + sc * CELL, GRID.y + sr * CELL, CELL, CELL);
    // dünne Linien
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    for (let i = 1; i < N; i++) {
      line(ctx, GRID.x + i * CELL, GRID.y, GRID.x + i * CELL, GRID.y + size);
      line(ctx, GRID.x, GRID.y + i * CELL, GRID.x + size, GRID.y + i * CELL);
    }
    // dicke Linien zwischen verschiedenen Gebieten
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (c < N - 1 && REGIONS[r][c] !== REGIONS[r][c + 1]) line(ctx, GRID.x + (c + 1) * CELL, GRID.y + r * CELL, GRID.x + (c + 1) * CELL, GRID.y + (r + 1) * CELL);
        if (r < N - 1 && REGIONS[r][c] !== REGIONS[r + 1][c]) line(ctx, GRID.x + c * CELL, GRID.y + (r + 1) * CELL, GRID.x + (c + 1) * CELL, GRID.y + (r + 1) * CELL);
      }
    }
    ctx.strokeRect(GRID.x, GRID.y, size, size);
    // Zahlen
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const value = this.entries[r][c];
        if (!value) continue;
        const cx = GRID.x + c * CELL + CELL / 2, cy = GRID.y + r * CELL + CELL / 2;
        if (this.given(r, c)) {
          ctx.font = `bold 36px ${PRINT}`;
          ctx.fillStyle = INK;
          ctx.fillText(String(value), cx, cy + 2);
        } else {
          ctx.font = `38px ${HAND}`;
          ctx.fillStyle = BLUE_INK;
          ctx.fillText(String(value), cx + 1, cy + 2);
        }
      }
    }
    // Eingekreiste Felder (roter Stift) mit Zeichen
    for (const { row, column, symbol } of CIRCLES) {
      const cx = GRID.x + column * CELL + CELL / 2, cy = GRID.y + row * CELL + CELL / 2;
      ctx.strokeStyle = RED_PENCIL;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 25, 23, 0.3, 0.3, Math.PI * 2 + 0.7);
      ctx.stroke();
      ctx.fillStyle = 'rgba(243, 236, 216, 0.9)';
      ctx.beginPath();
      ctx.arc(cx + 19, cy - 19, 14, 0, Math.PI * 2);
      ctx.fill();
      drawSymbol(ctx, symbol, cx + 19, cy - 19, 24, RED_PENCIL);
    }
  }

  drawPad(ctx) {
    ctx.save();
    ctx.fillStyle = INK;
    ctx.font = `bold 12px ${PRINT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Bleistift:', PAD.x, PAD.y - 10);
    for (let i = 0; i <= N; i++) {
      const { x, y } = this.padButton(i);
      roundedRect(ctx, x, y, PAD.size, PAD.size, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(43, 33, 24, 0.6)';
      ctx.stroke();
      ctx.fillStyle = i === N ? RED_PENCIL : BLUE_INK;
      ctx.font = i === N ? `bold 15px ${PRINT}` : `30px ${HAND}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i === N ? 'weg' : String(i + 1), x + PAD.size / 2, y + PAD.size / 2 + 2);
    }
    ctx.restore();
  }
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}
