import { View } from './view.js';
import { roundedRect } from '../ui/text.js';

// Rätsel "Verteilerkasten" – nach den Regeln von "Net" aus Simon Tathams Puzzle-Sammlung (MIT-Lizenz;
// nur die Regeln sind übernommen, der Code ist neu):
//
//   const solved = await wires.open();     // true, sobald das Netz steht
//
// Das Brett besteht aus 7 × 5 Feldern. Auf jedem Feld liegt ein Kabelstück: Endstück, gerade, Ecke,
// Abzweig oder Kreuzung. Ein Klick dreht es um eine Vierteldrehung. Alles, was mit dem Eingang (links,
// "KAMERA") verbunden ist, leuchtet grün. Gelöst ist das Rätsel erst, wenn
//   – ALLE 35 Stücke zu einem einzigen Netz verbunden sind,
//   – kein Kabel ins Leere zeigt (keine losen Enden, außer Eingang und Ausgang) und
//   – es keine Schleife gibt,
// und der Ausgang (rechts, "BILDSCHIRM") dazugehört. Ein Weg von links nach rechts genügt also nicht.
// Der Stand bleibt erhalten, wenn man die Ansicht zwischendurch schließt.
//
// Das Netz wird beim Start aus einem festen Startwert erzeugt (ein zufälliger Baum über alle Felder),
// dann wird jedes Stück zufällig verdreht. Es ist also immer lösbar und jedes Mal dasselbe Rätsel.

const COLUMNS = 7, ROWS = 5;
const TILE = 78;
const BOARD = { x: 640 - (COLUMNS * TILE) / 2, y: 372 - (ROWS * TILE) / 2 };
const SOURCE_ROW = 2; // der Eingang kommt von links in diese Reihe
const TARGET_ROW = 1; // der Ausgang geht rechts aus dieser Reihe
const SEED = 2024;    // anderer Startwert = anderes Netz

// Anschlüsse eines Kabelstücks als Bits: oben, rechts, unten, links
const UP = 1, RIGHT = 2, DOWN = 4, LEFT = 8;
const SIDES = [
  { bit: UP, dx: 0, dy: -1, opposite: DOWN },
  { bit: RIGHT, dx: 1, dy: 0, opposite: LEFT },
  { bit: DOWN, dx: 0, dy: 1, opposite: UP },
  { bit: LEFT, dx: -1, dy: 0, opposite: RIGHT },
];
// Grundformen (ungedreht): E = Endstück (oben), I = gerade (oben–unten), L = Ecke (oben–rechts),
// T = Abzweig (oben–rechts–unten), X = Kreuzung (alle vier)
const SHAPES = { E: UP, I: UP | DOWN, L: UP | RIGHT, T: UP | RIGHT | DOWN, X: UP | RIGHT | DOWN | LEFT };

function rotate(mask, turns) {
  for (let i = 0; i < turns % 4; i++) mask = ((mask << 1) & 15) | (mask >> 3);
  return mask;
}

// Erzeugt das Netz: zufälliger Spannbaum (Prim) über alle Felder, plus Eingang und Ausgang.
// Ergebnis: für jedes Feld Form und Drehung der Lösung.
function generateNet(seed) {
  const random = seededRandom(seed);
  const masks = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  const inTree = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(false));
  const frontier = [];
  const add = (x, y) => {
    inTree[y][x] = true;
    for (const side of SIDES) {
      const nx = x + side.dx, ny = y + side.dy;
      if (nx >= 0 && nx < COLUMNS && ny >= 0 && ny < ROWS && !inTree[ny][nx]) frontier.push({ x, y, side });
    }
  };
  add(0, SOURCE_ROW);
  while (frontier.length > 0) {
    const { x, y, side } = frontier.splice(Math.floor(random() * frontier.length), 1)[0];
    const nx = x + side.dx, ny = y + side.dy;
    if (inTree[ny][nx]) continue;
    masks[y][x] |= side.bit;
    masks[ny][nx] |= side.opposite;
    add(nx, ny);
  }
  masks[SOURCE_ROW][0] |= LEFT;
  masks[TARGET_ROW][COLUMNS - 1] |= RIGHT;
  return masks.map((row) => row.map((mask) => {
    for (const [shape, base] of Object.entries(SHAPES)) {
      for (let turns = 0; turns < 4; turns++) if (rotate(base, turns) === mask) return { shape, turns };
    }
    throw new Error(`Unbekanntes Kabelstück: ${mask}`);
  }));
}

const NET = generateNet(SEED);
// Eine Lösung (Drehungen) – nur zum Testen (wires.arrange(SOLUTION)), das Spiel prüft die Regeln selbst.
export const SOLUTION = NET.map((row) => row.map((tile) => tile.turns));

export class Wires extends View {
  constructor() {
    super();
    const random = seededRandom(SEED + 1);
    this.tiles = NET.map((row) => row.map(({ shape, turns }) => {
      const start = (turns + 1 + Math.floor(random() * 3)) % 4; // nie schon richtig gedreht
      return { shape, turns: start, angle: start * 90, powered: false };
    }));
    this.solved = false;
    this.solvedAge = 0;
    this.time = 0;
    this.help = 'Klick: Kabelstück drehen  ·  alle Stücke verbinden, keine losen Enden, keine Schleifen  ·  Rechtsklick oder Esc: zurück';
    this.trace();
  }

  result() {
    return this.solved;
  }

  // Setzt eine Drehung für jedes Feld (zum Testen: wires.arrange(SOLUTION))
  arrange(turns) {
    this.tiles.forEach((row, y) => row.forEach((tile, x) => {
      tile.turns = turns[y][x];
      tile.angle = tile.turns * 90;
    }));
    this.checkSolved();
  }

  // Welche Anschlüsse hat das Feld in seiner jetzigen Drehung?
  mask(tile) {
    return rotate(SHAPES[tile.shape], tile.turns);
  }

  // Ist dieser Anschluss ein offener Rand des Bretts, der so gewollt ist (Eingang oder Ausgang)?
  isPort(x, y, bit) {
    return (x === 0 && y === SOURCE_ROW && bit === LEFT) || (x === COLUMNS - 1 && y === TARGET_ROW && bit === RIGHT);
  }

  // Verfolgt das Netz vom Eingang aus, merkt sich, welche Felder Strom haben, und prüft die Regeln.
  trace() {
    for (const row of this.tiles) for (const tile of row) tile.powered = false;
    const first = this.tiles[SOURCE_ROW][0];
    if (!(this.mask(first) & LEFT)) return false;
    const queue = [[0, SOURCE_ROW]];
    first.powered = true;
    let looseEnds = 0, links = 0, count = 1;
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const mask = this.mask(this.tiles[y][x]);
      for (const side of SIDES) {
        if (!(mask & side.bit)) continue;
        const neighbour = this.tiles[y + side.dy]?.[x + side.dx];
        if (!neighbour || !(this.mask(neighbour) & side.opposite)) {
          if (!this.isPort(x, y, side.bit)) looseEnds += 1;
          continue;
        }
        links += 1; // jede Verbindung wird von beiden Seiten gezählt
        if (neighbour.powered) continue;
        neighbour.powered = true;
        count += 1;
        queue.push([x + side.dx, y + side.dy]);
      }
    }
    const last = this.tiles[TARGET_ROW][COLUMNS - 1];
    const all = count === COLUMNS * ROWS;
    const noLoops = links / 2 === count - 1;
    return all && noLoops && looseEnds === 0 && last.powered && Boolean(this.mask(last) & RIGHT);
  }

  checkSolved() {
    const connected = this.trace();
    if (connected && !this.solved) {
      this.solved = true;
      this.solvedAge = 0;
      this.sound('power');
    }
  }

  contains(point) {
    return point.x >= BOARD.x - 150 && point.x <= BOARD.x + COLUMNS * TILE + 150 && point.y >= BOARD.y - 70 && point.y <= BOARD.y + ROWS * TILE + 50;
  }

  pointerDown(point) {
    if (this.solved) return;
    const x = Math.floor((point.x - BOARD.x) / TILE), y = Math.floor((point.y - BOARD.y) / TILE);
    const tile = this.tiles[y]?.[x];
    if (!tile) return;
    tile.turns += 1;
    this.sound('rotate');
    this.checkSolved();
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    this.time += dt;
    for (const row of this.tiles) {
      for (const tile of row) tile.angle += (tile.turns * 90 - tile.angle) * Math.min(1, dt * 18);
    }
    if (this.solved) {
      this.solvedAge += dt;
      if (this.solvedAge > 1.7) this.close(true);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx);
    ctx.globalAlpha = this.fadeIn;
    const width = COLUMNS * TILE, height = ROWS * TILE;

    // Kasten: grün lackiertes Blech mit Nieten, darin die dunkle Schalttafel
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 12;
    const paint = ctx.createLinearGradient(0, BOARD.y - 70, 0, BOARD.y + height + 50);
    paint.addColorStop(0, '#5d7a66');
    paint.addColorStop(1, '#2f4a40');
    roundedRect(ctx, BOARD.x - 150, BOARD.y - 70, width + 300, height + 120, 22);
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#120a05';
    ctx.stroke();
    roundedRect(ctx, BOARD.x - 141, BOARD.y - 61, width + 282, height + 102, 16);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.stroke();
    for (const [rx, ry] of [[-128, -48], [width + 128, -48], [-128, height + 28], [width + 128, height + 28]]) rivet(ctx, BOARD.x + rx, BOARD.y + ry);

    // Schild
    roundedRect(ctx, 640 - 150, BOARD.y - 56, 300, 34, 6);
    ctx.fillStyle = '#d9b25a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3a2610';
    ctx.stroke();
    ctx.fillStyle = '#3a2610';
    ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SIGNALVERTEILER  ·  WAGEN 1', 640, BOARD.y - 38);

    // Schalttafel
    ctx.fillStyle = '#17120e';
    roundedRect(ctx, BOARD.x - 10, BOARD.y - 10, width + 20, height + 20, 10);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0a0705';
    ctx.stroke();

    const pulse = 0.75 + 0.25 * Math.sin(this.time * 7);
    const sourceOn = Boolean(this.mask(this.tiles[SOURCE_ROW][0]) & LEFT);
    this.drawPlug(ctx, BOARD.x - 10, BOARD.y + (SOURCE_ROW + 0.5) * TILE, -1, 'KAMERA', true, pulse);
    this.drawPlug(ctx, BOARD.x + width + 10, BOARD.y + (TARGET_ROW + 0.5) * TILE, 1, 'BILDSCHIRM', this.solved, pulse);

    this.tiles.forEach((row, y) => row.forEach((tile, x) => {
      const cx = BOARD.x + (x + 0.5) * TILE, cy = BOARD.y + (y + 0.5) * TILE;
      // Feld
      const plate = ctx.createLinearGradient(0, cy - TILE / 2, 0, cy + TILE / 2);
      plate.addColorStop(0, '#3a3027');
      plate.addColorStop(1, '#261e18');
      roundedRect(ctx, cx - TILE / 2 + 3, cy - TILE / 2 + 3, TILE - 6, TILE - 6, 9);
      ctx.fillStyle = plate;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 225, 170, 0.12)';
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((tile.angle * Math.PI) / 180);
      const lit = tile.powered && (x > 0 || y !== SOURCE_ROW || sourceOn);
      drawWire(ctx, SHAPES[tile.shape], lit, pulse);
      ctx.restore();
    }));

    // Gelöst: kurzes Aufleuchten
    if (this.solved) {
      const flash = Math.max(0, 1 - this.solvedAge / 0.7);
      ctx.fillStyle = `rgba(160, 255, 170, ${0.3 * flash})`;
      roundedRect(ctx, BOARD.x - 10, BOARD.y - 10, width + 20, height + 20, 10);
      ctx.fill();
    }
    ctx.restore();
    this.drawHelp(ctx);
  }

  // Anschluss am Rand der Tafel: Buchse, Kabel nach außen, Schild und Kontrolllampe
  drawPlug(ctx, x, y, direction, label, on, pulse) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0d0907';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + direction * 34, y);
    ctx.stroke();
    ctx.strokeStyle = on ? `rgba(120, 255, 140, ${pulse})` : '#b46a2c';
    ctx.lineWidth = 8;
    ctx.stroke();
    // Lampe
    const lx = x + direction * 74, ly = y;
    ctx.beginPath();
    ctx.arc(lx, ly, 17, 0, Math.PI * 2);
    ctx.fillStyle = '#17120e';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d9b25a';
    ctx.stroke();
    const lamp = ctx.createRadialGradient(lx - 4, ly - 4, 1, lx, ly, 13);
    lamp.addColorStop(0, on ? '#eaffea' : '#ffb0a0');
    lamp.addColorStop(1, on ? '#22b24a' : '#a01f18');
    ctx.beginPath();
    ctx.arc(lx, ly, 12, 0, Math.PI * 2);
    ctx.fillStyle = lamp;
    ctx.fill();
    if (on) {
      const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 46);
      glow.addColorStop(0, `rgba(120, 255, 140, ${0.45 * pulse})`);
      glow.addColorStop(1, 'rgba(120, 255, 140, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 46, ly - 46, 92, 92);
    }
    // Schild
    ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const width = ctx.measureText(label).width + 18;
    roundedRect(ctx, lx - width / 2, ly + 28, width, 24, 5);
    ctx.fillStyle = '#d9b25a';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#3a2610';
    ctx.stroke();
    ctx.fillStyle = '#3a2610';
    ctx.fillText(label, lx, ly + 41);
    ctx.restore();
  }
}

// Ein Kabelstück in Grundstellung, Mitte bei (0, 0)
function drawWire(ctx, mask, lit, pulse) {
  const half = TILE / 2 - 3;
  const path = () => {
    ctx.beginPath();
    if (mask === SHAPES.L) {
      ctx.moveTo(0, -half);
      ctx.quadraticCurveTo(0, 0, half, 0); // Ecke als Bogen
    } else {
      for (const side of SIDES) {
        if (!(mask & side.bit)) continue;
        ctx.moveTo(0, 0);
        ctx.lineTo(side.dx * half, side.dy * half);
      }
    }
  };
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';
  if (lit) {
    ctx.save();
    ctx.shadowColor = `rgba(110, 255, 140, ${0.9 * pulse})`;
    ctx.shadowBlur = 16;
    path();
    ctx.strokeStyle = '#0d0907';
    ctx.lineWidth = 17;
    ctx.stroke();
    ctx.restore();
  }
  path();
  ctx.strokeStyle = '#0d0907';
  ctx.lineWidth = 17;
  ctx.stroke();
  path();
  ctx.strokeStyle = lit ? '#6dff8f' : '#b46a2c';
  ctx.lineWidth = 9;
  ctx.stroke();
  path();
  ctx.strokeStyle = lit ? 'rgba(235, 255, 235, 0.85)' : 'rgba(255, 205, 150, 0.5)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Endstück: dicker Stecker in der Mitte. Abzweig und Kreuzung: Lötpunkt.
  if (mask === SHAPES.E) {
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fillStyle = lit ? '#bfffcb' : '#8a4f22';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0d0907';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0d0907';
    ctx.fill();
  } else if (mask === SHAPES.T || mask === SHAPES.X) {
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fillStyle = lit ? '#c8ffd0' : '#d9a86a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0d0907';
    ctx.stroke();
  }
  for (const side of SIDES) {
    if (!(mask & side.bit)) continue;
    ctx.fillStyle = lit ? '#eaffea' : '#e2c08a';
    ctx.fillRect(side.dx * (half - 3) - 4, side.dy * (half - 3) - 4, 8, 8);
  }
}

// Pseudo-Zufallszahlen mit Startwert: gleiche Zahl → jedes Mal dieselbe Folge.
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rivet(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 20, 14, 0.6)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 1.5, y - 1.5, 2.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fill();
}
