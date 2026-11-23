import { View } from './view.js';
import { COLORS, FONTS, outlinedText } from '../ui/text.js';

// Allgemeine Nahansicht zum Ordnen: Kärtchen mit der Maus auf Plätze ziehen.
// Für die Tischordnung im Speisewagen, die Karteikarten im Fundbüro, die Filmbilder im Kino …
//
//   const solved = await story.view('arrange', {
//     id: 'seating',                                  // jede Ansicht merkt sich, wo die Kärtchen liegen
//     title: 'Tischordnung',
//     slots: [{ x, y, w, h, label }],                  // Plätze (Mitte bei x + w/2, y + h/2)
//     tokens: [{ id: 'k', w, h, home: { x, y } }],     // Kärtchen (home = Mitte, wo sie anfangs liegen)
//                                                      // … oder slot: 2 (liegt anfangs auf Platz 2)
//     drawBackground: (ctx, view) => { … },
//     drawToken: (ctx, token, x, y, view) => { … },    // x, y = Mitte des Kärtchens
//     check: (placement) => true,                      // placement[slot] = id des Kärtchens oder null
//     partial: false,                                  // true: Plätze dürfen am Ende frei bleiben
//     help: '…',
//   });
//
// Liegen alle Plätze voll und check stimmt, schließt sich die Ansicht von selbst (Ergebnis true).

const SNAP = 70; // so nah muss ein Kärtchen an einem Platz losgelassen werden

export class ArrangeView extends View {
  constructor() {
    super();
    this.memory = {};   // id → { tokenId: { x, y, slot } }
    this.options = {};
    this.tokens = [];
    this.drag = null;   // { token, dx, dy }
    this.solved = 0;    // > 0: richtig – kurz zeigen, dann schließen
    this.mouse = { x: 0, y: 0 };
  }

  onOpen(options) {
    this.options = options;
    this.help = options.help ?? 'Kärtchen mit gedrückter Maustaste auf die Plätze ziehen  ·  Rechtsklick: zurück';
    this.solved = 0;
    this.drag = null;
    const saved = (this.memory[options.id] ??= {});
    this.tokens = options.tokens.map((token) => {
      const slot = options.slots[token.slot];
      const place = saved[token.id] ?? (slot
        ? { x: slot.x + slot.w / 2, y: slot.y + slot.h / 2, slot: token.slot }
        : { x: token.home.x, y: token.home.y, slot: null });
      saved[token.id] = place;
      return { ...token, place };
    });
  }

  // Schon richtig gelegt und dann mit Esc/Rechtsklick geschlossen: zählt trotzdem als gelöst
  result() {
    return this.solved > 0;
  }

  placement() {
    return this.options.slots.map((_, i) => this.tokens.find((token) => token.place.slot === i)?.id ?? null);
  }

  tokenAt(point) {
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const t = this.tokens[i];
      if (Math.abs(point.x - t.place.x) <= t.w / 2 && Math.abs(point.y - t.place.y) <= t.h / 2) return t;
    }
    return null;
  }

  labelAt(point) {
    return this.tokenAt(point)?.label ?? '';
  }

  pointerDown(point) {
    if (this.solved) return;
    const token = this.tokenAt(point);
    if (!token) return this.onSkip?.();
    // nach oben legen
    this.tokens = [...this.tokens.filter((t) => t !== token), token];
    this.drag = { token, dx: token.place.x - point.x, dy: token.place.y - point.y, from: { ...token.place } };
    this.sound('paper');
  }

  pointerUp(point) {
    if (!this.drag) return;
    const { token, from } = this.drag;
    this.drag = null;
    const slots = this.options.slots;
    let best = -1, bestDistance = SNAP;
    slots.forEach((slot, i) => {
      const d = Math.hypot(token.place.x - (slot.x + slot.w / 2), token.place.y - (slot.y + slot.h / 2));
      if (d < bestDistance) {
        best = i;
        bestDistance = d;
      }
    });
    if (best < 0) {
      // daneben: zurück an den eigenen Ablageplatz (oder liegen lassen, wenn auf dem Tisch Platz ist)
      if (from.slot !== null || !token.home) {
        // zurück auf den alten Platz
        Object.assign(token.place, from);
      } else {
        token.place.slot = null;
        if (point.y > 720 - 40 || point.y < 30) Object.assign(token.place, { x: token.home.x, y: token.home.y });
      }
      return;
    }
    const occupant = this.tokens.find((t) => t !== token && t.place.slot === best);
    if (occupant) {
      // tauschen: das andere Kärtchen geht dorthin, wo dieses herkam
      if (from.slot !== null) {
        const s = slots[from.slot];
        Object.assign(occupant.place, { x: s.x + s.w / 2, y: s.y + s.h / 2, slot: from.slot });
      } else if (occupant.home) {
        Object.assign(occupant.place, { x: occupant.home.x, y: occupant.home.y, slot: null });
      } else {
        Object.assign(occupant.place, { x: from.x, y: from.y, slot: null });
      }
    }
    const slot = slots[best];
    Object.assign(token.place, { x: slot.x + slot.w / 2, y: slot.y + slot.h / 2, slot: best });
    this.sound('click');
    const placement = this.placement();
    // partial: true – geprüft wird nach jedem Ablegen, auch wenn noch Plätze frei sind
    if ((this.options.partial || placement.every(Boolean)) && this.options.check(placement)) {
      this.solved = 0.001;
      this.sound('success');
    }
  }

  update(dt, mouse) {
    super.update(dt);
    if (!this.isOpen) return;
    if (mouse) this.mouse = mouse;
    if (this.drag) {
      this.drag.token.place.x = this.mouse.x + this.drag.dx;
      this.drag.token.place.y = this.mouse.y + this.drag.dy;
    }
    if (this.solved) {
      this.solved += dt;
      if (this.solved > 1.4) this.close(true);
    }
  }

  draw(ctx) {
    this.drawBackdrop(ctx, 0.88);
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    this.options.drawBackground?.(ctx, this);
    if (this.options.title) {
      ctx.font = FONTS.subtitle;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      outlinedText(ctx, this.options.title, 640, 44, COLORS.brass, 5);
    }
    for (const slot of this.options.slots) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 230, 170, 0.35)';
      ctx.setLineDash([7, 6]);
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      ctx.restore();
      if (slot.label) {
        ctx.font = FONTS.small;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        outlinedText(ctx, slot.label, slot.x + slot.w / 2, slot.y + slot.h + 6, '#e9d8b0', 4);
      }
    }
    for (const token of this.tokens) {
      ctx.save();
      if (this.drag?.token === token) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 10;
      }
      this.options.drawToken(ctx, token, token.place.x, token.place.y, this);
      ctx.restore();
    }
    if (this.solved) {
      ctx.globalAlpha = Math.min(1, this.solved * 3) * 0.5;
      ctx.fillStyle = 'rgba(140, 255, 160, 0.25)';
      ctx.fillRect(0, 0, 1280, 720);
    }
    ctx.restore();
    this.drawHelp(ctx);
  }
}
