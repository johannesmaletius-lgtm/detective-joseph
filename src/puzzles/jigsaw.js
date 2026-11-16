import { View } from './view.js';
import { pointInPolygon } from '../navigation/geometry.js';
import { SHEET, drawSignalSheet } from '../ui/cards.js';
import { COLORS, FONTS, outlinedText, roundedRect } from '../ui/text.js';

// Rätsel "Zerrissener Fahrplan": Papierfetzen mit der Maus an die richtige Stelle ziehen.
//
//   const complete = await jigsaw.open({ count: 4 });   // so viele Fetzen hat Joseph schon gefunden
//
// Das Blatt (siehe drawSignalSheet in cards.js) ist in 3 × 2 Fetzen mit gezackten Rissen zerlegt.
// Ein Fetzen rastet ein, sobald man ihn nah genug an seinem Platz loslässt. Wer noch nicht alle
// Fetzen hat, kann die vorhandenen schon hinlegen – was liegt, bleibt liegen.

const COLUMNS = 3, ROWS = 2;
const TARGET = { x: 640 - SHEET.width / 2, y: 326 - SHEET.height / 2 }; // hier liegt das fertige Blatt
const SNAP = 30;        // so nah am richtigen Platz rastet ein Fetzen ein (Pixel)
const SHARP = 2;        // Fetzen werden in doppelter Auflösung vorgezeichnet (scharf auf Retina)
const MARGIN = 6;
// In dieser Reihenfolge tauchen die Fetzen auf (Nummern von links oben nach rechts unten)
const FOUND_ORDER = [4, 1, 5, 0, 3, 2];
// Hier liegen die Fetzen am Anfang herum (Mitte des Fetzens) – leicht verdreht
const SCATTER = [
  { x: 176, y: 196, tilt: -0.22 }, { x: 1108, y: 182, tilt: 0.17 }, { x: 168, y: 498, tilt: 0.12 },
  { x: 1112, y: 486, tilt: -0.15 }, { x: 250, y: 344, tilt: 0.3 }, { x: 1040, y: 338, tilt: -0.28 },
];

export class Jigsaw extends View {
  constructor() {
    super();
    this.pieces = cutSheet();
    this.order = [];      // Zeichenreihenfolge: der zuletzt angefasste Fetzen liegt oben
    this.drag = null;     // { piece, dx, dy }
    this.mouse = { x: 0, y: 0 };
    this.complete = false;
    this.completeAge = 0;
    this.sheet = null;    // das ganze Blatt als Bild (entsteht beim ersten Öffnen)
    this.help = 'Fetzen mit gedrückter Maustaste an ihren Platz ziehen  ·  Rechtsklick oder Esc: zurück';
  }

  result() {
    return this.complete;
  }

  get ownedCount() {
    return this.pieces.filter((piece) => piece.owned).length;
  }

  onOpen({ count = 0 }) {
    this.prepare();
    this.drag = null;
    FOUND_ORDER.slice(0, count).forEach((index, i) => {
      const piece = this.pieces[index];
      if (piece.owned) return;
      piece.owned = true;
      const spot = SCATTER[i];
      piece.x = spot.x - piece.center.x;
      piece.y = spot.y - piece.center.y;
      piece.tilt = spot.tilt;
      piece.rest = spot.tilt;
      this.order.push(piece);
    });
  }

  // Legt alle vorhandenen Fetzen an ihren Platz (zum Testen)
  solve() {
    for (const piece of this.pieces) if (piece.owned) this.place(piece);
  }

  // Zeichnet das Blatt und jeden Fetzen einmal in ein eigenes Bild vor
  prepare() {
    if (this.sheet) return;
    this.sheet = document.createElement('canvas');
    this.sheet.width = SHEET.width * SHARP;
    this.sheet.height = SHEET.height * SHARP;
    const sheet = this.sheet.getContext('2d');
    sheet.scale(SHARP, SHARP);
    drawSignalSheet(sheet);

    for (const piece of this.pieces) {
      const { box } = piece;
      piece.image = document.createElement('canvas');
      piece.image.width = (box.width + 2 * MARGIN) * SHARP;
      piece.image.height = (box.height + 2 * MARGIN) * SHARP;
      const ctx = piece.image.getContext('2d');
      ctx.scale(SHARP, SHARP);
      ctx.translate(MARGIN - box.x, MARGIN - box.y);
      ctx.save();
      trace(ctx, piece.outline);
      ctx.clip();
      ctx.drawImage(this.sheet, 0, 0, SHEET.width, SHEET.height);
      // Rissrand: helle Papierfasern
      trace(ctx, piece.outline);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255, 250, 235, 0.75)';
      ctx.stroke();
      ctx.restore();
      trace(ctx, piece.outline);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(70, 45, 20, 0.55)';
      ctx.stroke();
    }
  }

  // Welcher (lose) Fetzen liegt unter dem Punkt? Der oberste gewinnt.
  pieceAt(point) {
    for (let i = this.order.length - 1; i >= 0; i--) {
      const piece = this.order[i];
      if (piece.placed) continue;
      // Punkt in die Koordinaten des Blattes umrechnen (Verschiebung und Drehung des Fetzens zurücknehmen)
      const dx = point.x - (piece.x + piece.center.x), dy = point.y - (piece.y + piece.center.y);
      const cos = Math.cos(-piece.tilt), sin = Math.sin(-piece.tilt);
      const local = { x: piece.center.x + dx * cos - dy * sin, y: piece.center.y + dx * sin + dy * cos };
      if (pointInPolygon(local, piece.outline)) return piece;
    }
    return null;
  }

  pointerDown(point) {
    if (this.complete) return;
    const piece = this.pieceAt(point);
    if (!piece) return;
    this.drag = { piece, dx: point.x - piece.x, dy: point.y - piece.y };
    this.order = [...this.order.filter((other) => other !== piece), piece];
    this.sound('paper');
  }

  pointerUp() {
    if (!this.drag) return;
    const { piece } = this.drag;
    this.drag = null;
    if (Math.hypot(piece.x - TARGET.x, piece.y - TARGET.y) <= SNAP) {
      this.place(piece);
      this.sound('snap');
    } else {
      // nicht aus dem Bild schieben
      piece.x = Math.min(Math.max(piece.x, 30 - piece.box.x), 1250 - piece.box.x - piece.box.width);
      piece.y = Math.min(Math.max(piece.y, 20 - piece.box.y), 650 - piece.box.y - piece.box.height);
    }
  }

  place(piece) {
    piece.placed = true;
    piece.x = TARGET.x;
    piece.y = TARGET.y;
    piece.tilt = 0;
    piece.flash = 1;
    this.order = [piece, ...this.order.filter((other) => other !== piece)]; // liegt jetzt ganz unten
    if (this.pieces.every((other) => other.placed) && !this.complete) {
      this.complete = true;
      this.completeAge = 0;
      this.sound('success');
    }
  }

  update(dt, mouse) {
    super.update(dt);
    if (!this.isOpen) return;
    if (mouse) this.mouse = mouse;
    for (const piece of this.pieces) {
      piece.flash = Math.max(0, piece.flash - dt * 2.2);
      if (piece.placed) continue;
      const dragged = this.drag?.piece === piece;
      const target = dragged ? 0 : piece.rest * 0.5; // in der Hand liegt der Fetzen gerade
      piece.tilt += (target - piece.tilt) * Math.min(1, dt * 12);
      if (dragged) {
        piece.x = this.mouse.x - this.drag.dx;
        piece.y = this.mouse.y - this.drag.dy;
      }
    }
    if (this.complete) {
      this.completeAge += dt;
      if (this.completeAge > 1.9) this.close(true);
    }
  }

  draw(ctx) {
    if (!this.isOpen) return;
    ctx.save();
    this.drawBackdrop(ctx, 0.7);
    ctx.globalAlpha = this.fadeIn;

    // Unterlage: die Sitzbank als Tisch – dunkles Holz
    const wood = ctx.createLinearGradient(0, 30, 0, 670);
    wood.addColorStop(0, '#4a2c18');
    wood.addColorStop(1, '#2f1b0e');
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 30;
    roundedRect(ctx, 26, 16, 1228, 656, 18);
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundedRect(ctx, 26, 16, 1228, 656, 18);
    ctx.clip();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = 2;
    for (let y = 120; y < 672; y += 110) {
      ctx.beginPath();
      ctx.moveTo(26, y);
      ctx.lineTo(1254, y + 6);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255, 200, 140, 0.05)';
    for (let y = 40; y < 672; y += 17) {
      ctx.beginPath();
      ctx.moveTo(26, y);
      ctx.bezierCurveTo(400, y + 8, 800, y - 8, 1254, y + 3);
      ctx.stroke();
    }
    ctx.restore();

    // Platz für das Blatt: gestrichelter Rahmen
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(TARGET.x, TARGET.y, SHEET.width, SHEET.height);
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(239, 226, 192, 0.45)';
    ctx.strokeRect(TARGET.x, TARGET.y, SHEET.width, SHEET.height);
    ctx.restore();

    for (const piece of this.order) {
      const { box, center } = piece;
      const dragged = this.drag?.piece === piece;
      ctx.save();
      ctx.translate(piece.x + center.x, piece.y + center.y);
      ctx.rotate(piece.tilt);
      if (!piece.placed) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = dragged ? 22 : 10;
        ctx.shadowOffsetY = dragged ? 12 : 4;
      }
      ctx.drawImage(piece.image, box.x - MARGIN - center.x, box.y - MARGIN - center.y, box.width + 2 * MARGIN, box.height + 2 * MARGIN);
      ctx.restore();
      if (piece.flash > 0) {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        trace(ctx, piece.outline);
        ctx.fillStyle = `rgba(255, 240, 190, ${0.45 * piece.flash})`;
        ctx.fill();
        ctx.restore();
      }
    }

    // Fertig: Das Blatt leuchtet kurz auf
    if (this.complete) {
      const glow = Math.max(0, 1 - this.completeAge / 1.1);
      ctx.fillStyle = `rgba(255, 244, 200, ${0.35 * glow})`;
      ctx.fillRect(TARGET.x, TARGET.y, SHEET.width, SHEET.height);
    }

    // Zähler
    ctx.font = FONTS.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const owned = this.ownedCount;
    const text = owned < this.pieces.length ? `${owned} von ${this.pieces.length} Fetzen gefunden – der Rest liegt noch irgendwo im Abteil` : 'Alle Fetzen beisammen';
    outlinedText(ctx, text, 640, 62, COLORS.joseph, 4);
    ctx.restore();
    this.drawHelp(ctx);
  }
}

// ---------------------------------------------------------------- Das Blatt zerreißen
// Ein Raster aus 3 × 2 Feldern, dessen innere Ecken und Kanten zufällig (aber jedes Mal gleich)
// verschoben werden. Nachbarn teilen sich dieselbe Risskante – deshalb passen sie genau zusammen.
function cutSheet() {
  const random = seededRandom(11);
  const jitter = (amount) => (random() - 0.5) * 2 * amount;
  const corners = []; // corners[spalte][reihe]
  for (let i = 0; i <= COLUMNS; i++) {
    corners.push([]);
    for (let j = 0; j <= ROWS; j++) {
      const inner = { x: i > 0 && i < COLUMNS, y: j > 0 && j < ROWS };
      corners[i].push({
        x: (i * SHEET.width) / COLUMNS + (inner.x ? jitter(26) : 0),
        y: (j * SHEET.height) / ROWS + (inner.y ? jitter(22) : 0),
      });
    }
  }
  // Risskante zwischen zwei Ecken: am Blattrand gerade, im Inneren gezackt
  const tear = (from, to, straight) => {
    const points = [from];
    if (!straight) {
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      const nx = -(to.y - from.y) / length, ny = (to.x - from.x) / length;
      const steps = Math.round(length / 18);
      for (let s = 1; s < steps; s++) {
        const t = s / steps, offset = jitter(7);
        points.push({ x: from.x + (to.x - from.x) * t + nx * offset, y: from.y + (to.y - from.y) * t + ny * offset });
      }
    }
    points.push(to);
    return points;
  };
  const across = []; // across[reihe][spalte]: waagerechte Kanten
  for (let j = 0; j <= ROWS; j++) {
    across.push([]);
    for (let i = 0; i < COLUMNS; i++) across[j].push(tear(corners[i][j], corners[i + 1][j], j === 0 || j === ROWS));
  }
  const down = []; // down[spalte][reihe]: senkrechte Kanten
  for (let i = 0; i <= COLUMNS; i++) {
    down.push([]);
    for (let j = 0; j < ROWS; j++) down[i].push(tear(corners[i][j], corners[i][j + 1], i === 0 || i === COLUMNS));
  }

  const pieces = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLUMNS; i++) {
      const outline = [
        ...across[j][i],
        ...down[i + 1][j].slice(1),
        ...[...across[j + 1][i]].reverse().slice(1),
        ...[...down[i][j]].reverse().slice(1, -1),
      ];
      const xs = outline.map((p) => p.x), ys = outline.map((p) => p.y);
      const box = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
      pieces.push({
        outline,
        box,
        center: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        x: 0, y: 0, tilt: 0, rest: 0, flash: 0,
        owned: false,
        placed: false,
        image: null,
      });
    }
  }
  return pieces;
}

function trace(ctx, outline) {
  ctx.beginPath();
  outline.forEach((point, i) => (i === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
  ctx.closePath();
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
