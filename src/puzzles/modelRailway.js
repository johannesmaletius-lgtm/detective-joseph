import { View } from './view.js';
import { COLORS, FONTS, outlinedText } from '../ui/text.js';
import {
  LOCO_LENGTH, LOCO_U, PORTAL_FAR, RING, SLOT_U, WAGON_LENGTH,
  drawRailway, pathAt, slotPoint, unproject, vehicleBounds,
} from '../story/art/railway.js';

// Miras Modellbahn (Wagen 15): vierzehn Blechwagen auf einem Ringgleis.
// Einen Wagen mit gedrückter Maustaste auf einen anderen Platz ziehen – die beiden tauschen.
// Stehen alle in der richtigen Reihenfolge, gehen die Lichter an, die Lok pfeift und der Zug
// fährt eine Runde und bleibt im Tunnel stehen. Erst dann schließt sich die Ansicht (Ergebnis true).
//
//   const solved = await story.view('railway', {
//     start: [9, 3, 12, …],           // welcher Wagen anfangs auf Platz 0, 1, … steht
//     check: (order) => true,         // order[platz] = Nummer des Wagens
//     help: '…',
//   });

const LIFT = 26;          // so hoch wird ein Wagen angehoben
const DROP_RADIUS = 95;   // so nah muss er über einem Platz losgelassen werden
const SETTLE = 0.32;      // Sekunden, bis ein getauschter Wagen an seinem Platz steht
const DRIVE_TIME = 9.5;   // eine Runde
const DRIVE_DISTANCE = RING + (PORTAL_FAR - 6 - (LOCO_U + LOCO_LENGTH / 2)); // bis die Lok im Tunnel steht

export class ModelRailwayView extends View {
  constructor() {
    super();
    this.order = null;    // order[platz] = Wagen (bleibt erhalten, wenn man die Ansicht schließt)
    this.options = {};
    this.mouse = { x: 0, y: 0 };
  }

  onOpen(options) {
    this.options = options;
    this.help = options.help ?? 'Wagen mit gedrückter Maustaste auf einen anderen Platz ziehen (sie tauschen)  ·  Rechtsklick: zurück';
    // bleibt beim Schließen erhalten; schon gelöst (Tür noch einmal gespielt) → wieder durcheinander
    if (!this.order || options.check(this.order)) this.order = [...options.start];
    this.time = 0;
    this.drag = null;           // { wagon, from, dx, dy, x, y, tilt }
    this.moving = [];           // getauschte Wagen auf dem Weg: { wagon, from: {X,Z}, to: slot, t }
    this.hoverLift = new Array(14).fill(0);
    this.phase = 'play';        // play → lights → drive → stand
    this.phaseTime = 0;
    this.distance = 0;
    this.glow = 0;
    this.fast = false;
    this.puffs = [];
    this.puffClock = 0;
    this.lastClack = 0;
    this.chimney = null;
    this.whistled = false;
  }

  result() {
    return this.phase !== 'play';
  }

  // Das Bild deckt alles ab – das Spielzimmer dahinter muss nicht gezeichnet werden
  get covers() {
    return this.fadeIn >= 1;
  }

  // ---------------------------------------------------------------- wo steht was?
  slotOf(wagon) {
    return this.order.indexOf(wagon);
  }

  wagonPose(slot) {
    return pathAt(SLOT_U[slot]);
  }

  wagonAt(point) {
    // vorne (größer auf dem Bildschirm) zuerst prüfen
    const slots = [...this.order.keys()].sort((a, b) => this.wagonPose(b).Z - this.wagonPose(a).Z);
    for (const slot of slots) {
      const b = vehicleBounds(this.wagonPose(slot), WAGON_LENGTH);
      if (point.x >= b.x0 - 2 && point.x <= b.x1 + 2 && point.y >= b.y0 - 2 && point.y <= b.y1 + 4) return slot;
    }
    return -1;
  }

  locoAt(point) {
    const b = vehicleBounds(pathAt(LOCO_U), LOCO_LENGTH);
    return point.x >= b.x0 && point.x <= b.x1 && point.y >= b.y0 && point.y <= b.y1;
  }

  // Platz unter dem gehaltenen Wagen (oder −1)
  targetSlot() {
    if (!this.drag) return -1;
    let best = -1, bestDistance = DROP_RADIUS;
    for (let slot = 0; slot < SLOT_U.length; slot++) {
      const p = slotPoint(slot);
      const d = Math.hypot(p.x - this.drag.groundX, p.y - this.drag.groundY);
      if (d < bestDistance) {
        best = slot;
        bestDistance = d;
      }
    }
    return best;
  }

  labelAt(point) {
    if (this.phase !== 'play') return '';
    if (this.drag) return 'Wagen';
    if (this.wagonAt(point) >= 0) return 'Wagen';
    if (this.locoAt(point)) return 'Lok';
    return '';
  }

  // ---------------------------------------------------------------- Maus
  pointerDown(point) {
    if (this.phase !== 'play') {
      this.fast = true; // Klick während der Fahrt: schneller
      return;
    }
    const slot = this.wagonAt(point);
    if (slot < 0) {
      if (this.locoAt(point)) this.sound('click');
      return this.onSkip?.();
    }
    const wagon = this.order[slot];
    this.moving = this.moving.filter((m) => m.wagon !== wagon);
    const ground = slotPoint(slot);
    this.drag = {
      wagon, from: slot,
      dx: ground.x - point.x, dy: ground.y - point.y,
      groundX: ground.x, groundY: ground.y,
      tilt: 0, lift: 0,
    };
    this.sound('click');
  }

  pointerUp() {
    if (!this.drag) return;
    const { wagon, from } = this.drag;
    const target = this.targetSlot();
    const here = unproject(this.drag.groundX, this.drag.groundY);
    this.drag = null;
    if (target < 0 || target === from) {
      // zurück auf den eigenen Platz
      this.moving.push({ wagon, from: { X: here.X, Z: here.Z, lift: LIFT }, to: from, t: 0 });
      return;
    }
    const other = this.order[target];
    this.order[target] = wagon;
    this.order[from] = other;
    const otherAt = pathAt(SLOT_U[target]);
    this.moving.push({ wagon, from: { X: here.X, Z: here.Z, lift: LIFT }, to: target, t: 0 });
    this.moving.push({ wagon: other, from: { X: otherAt.X, Z: otherAt.Z, lift: 0 }, to: from, t: 0, hop: true });
    this.sound('toyClack');
    if (this.options.check(this.order)) {
      this.phase = 'lights';
      this.phaseTime = 0;
    }
  }

  // ---------------------------------------------------------------- Ablauf
  update(dt, mouse) {
    super.update(dt);
    if (!this.isOpen) return;
    if (mouse) this.mouse = mouse;
    this.time += dt;

    if (this.drag) {
      const gx = this.mouse.x + this.drag.dx, gy = this.mouse.y + this.drag.dy;
      // leicht schräg, wenn man ihn schnell bewegt
      const vx = (gx - this.drag.groundX) / Math.max(dt, 1 / 120);
      this.drag.tilt += (Math.max(-1, Math.min(1, vx / 900)) - this.drag.tilt) * Math.min(1, dt * 10);
      this.drag.groundX = gx;
      this.drag.groundY = gy;
      this.drag.lift = Math.min(LIFT, this.drag.lift + dt * 220);
    }
    for (const m of this.moving) m.t = Math.min(1, m.t + dt / SETTLE);
    this.moving = this.moving.filter((m) => m.t < 1);

    // Wagen unter der Maus heben sich ein wenig
    const hovered = this.phase === 'play' && !this.drag ? this.wagonAt(this.mouse) : -1;
    for (let slot = 0; slot < 14; slot++) {
      const goal = slot === hovered ? 1 : 0;
      this.hoverLift[slot] += (goal - this.hoverLift[slot]) * Math.min(1, dt * 12);
    }

    if (this.phase === 'play') return;
    const speed = this.fast ? 4 : 1;
    this.phaseTime += dt * speed;
    if (this.phase === 'lights') {
      this.glow = Math.min(1, this.phaseTime / 0.6);
      if (this.phaseTime > 0.25 && !this.whistled) {
        this.whistled = true;
        this.sound('toyWhistle');
      }
      if (this.phaseTime > 1.1 && this.moving.length === 0) {
        this.phase = 'drive';
        this.phaseTime = 0;
      }
    } else if (this.phase === 'drive') {
      const t = Math.min(1, this.phaseTime / DRIVE_TIME);
      // sanft anfahren und bremsen
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const before = this.distance;
      this.distance = DRIVE_DISTANCE * eased;
      // Schienenstöße
      if (Math.floor(this.distance / (WAGON_LENGTH + 8)) !== Math.floor(before / (WAGON_LENGTH + 8))) this.sound('toyClack');
      // Wattewölkchen aus dem Schornstein
      this.puffClock += (this.distance - before);
      if (this.chimney && this.puffClock > 38) {
        this.puffClock = 0;
        this.puffs.push({ x: this.chimney.x, y: this.chimney.y - 2, r: 6, a: 1, vx: -this.chimney.facing * (14 + Math.random() * 10), life: 0 });
      }
      if (t >= 1) {
        this.phase = 'stand';
        this.phaseTime = 0;
      }
    } else if (this.phase === 'stand') {
      this.glow = Math.max(0.4, 1 - this.phaseTime * 0.5);
      if (this.phaseTime > 1.2) this.close(true);
    }
    for (const puff of this.puffs) {
      puff.life += dt;
      puff.y -= dt * (46 - puff.life * 14);
      puff.x += puff.vx * dt;
      puff.r += dt * (24 - puff.life * 8);
      puff.a = Math.max(0, 1 - puff.life / 1.6);
    }
    this.puffs = this.puffs.filter((p) => p.a > 0);
  }

  // ---------------------------------------------------------------- Zeichnen
  draw(ctx) {
    if (!this.covers) this.drawBackdrop(ctx, 0.92);
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    const roll = this.distance;
    const wagons = [];
    const target = this.targetSlot();
    for (let slot = 0; slot < 14; slot++) {
      const wagon = this.order[slot];
      if (this.drag?.wagon === wagon) continue;
      const move = this.moving.find((m) => m.wagon === wagon);
      if (move) {
        const to = pathAt(SLOT_U[move.to]);
        const e = 1 - Math.pow(1 - move.t, 3);
        const arc = Math.sin(move.t * Math.PI) * (move.hop ? 30 : 8);
        wagons.push({
          index: wagon,
          pose: {
            X: move.from.X + (to.X - move.from.X) * e,
            Z: move.from.Z + (to.Z - move.from.Z) * e,
            dx: to.dx, dz: to.dz,
            lift: move.from.lift * (1 - e) + arc,
          },
        });
        continue;
      }
      // der Wagen, mit dem getauscht würde, leuchtet bläulich
      const swapWith = this.drag && slot === target && target !== this.drag.from;
      wagons.push({
        index: wagon,
        u: SLOT_U[slot] + this.distance,
        roll,
        lift: this.phase === 'play' ? this.hoverLift[slot] * 4 : 0,
        hover: swapWith ? 0.75 + 0.25 * Math.sin(this.time * 8) : this.phase === 'play' ? this.hoverLift[slot] : 0,
        target: swapWith,
      });
    }
    if (this.drag) {
      const ground = unproject(this.drag.groundX, this.drag.groundY);
      const home = pathAt(SLOT_U[this.drag.from]);
      const angle = this.drag.tilt * 0.18;
      wagons.push({
        index: this.drag.wagon,
        hover: 1,
        pose: { X: ground.X, Z: ground.Z, dx: home.dx * Math.cos(angle), dz: Math.sin(angle), lift: this.drag.lift },
      });
    }
    const info = drawRailway(ctx, {
      time: this.time,
      glow: this.glow,
      loco: { u: LOCO_U + this.distance, roll, key: this.distance / 40 },
      wagons,
      target: this.drag && target !== this.drag.from ? target : -1,
      puffs: this.puffs,
    });
    this.chimney = info.chimney;

    ctx.font = FONTS.subtitle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    outlinedText(ctx, this.options.title ?? 'Die Modellbahn', 640, 44, COLORS.brass, 5);
    ctx.restore();
    if (this.phase === 'play') this.drawHelp(ctx);
    else this.drawHelp(ctx, 'Klicken: schneller');
  }
}
