import { Scene } from '../scene/scene.js';
import { DOORS, doorInfo } from '../advent/doors.js';
import { TEST_MODE } from '../config.js';
import { COLORS, outlinedText, roundedRect, wrapText } from './text.js';

// Erinnerung: einen früheren Wagen kurz ansehen (Zahnrad → „Frühere Wagen ansehen“).
//
// Der laufende Wagen bleibt dabei stehen (Zug, Geschichte, Zeit) und läuft danach genau dort weiter.
// Gezeigt wird der frühere Wagen so, wie er am Anfang aussah: wer da ist, was da ist. Mit der Maus
// erscheinen die Namen, ein Klick zeigt, was Joseph dazu sagt. Benutzen kann man dort nichts.

const SANS = '"Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif';
const BACK = { x: 1010, y: 14, width: 256, height: 46 };
const PICKER = { x: 140, y: 70, width: 1000, height: 580 };
const CELL = { width: 232, height: 52, gap: 12, columns: 4 };

// Unsichtbarer Platzhalter für Joseph (er ist in der Erinnerung nicht zu sehen)
const NOBODY = { x: -1000, y: 0, draw() {} };

// Ein Drehbuch-Befehl, der alles schluckt: So lassen sich die „anschauen“-Texte eines Wagens
// abspielen, ohne dass dort wirklich etwas passiert. Nur say() wird mitgeschrieben.
function silentStory(lines) {
  const flags = {};
  const noop = () => Promise.resolve();
  return new Proxy({ flags, lap: 0, tunnelCount: 0 }, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'then') return undefined;
      if (prop === 'say' || prop === 'speakAs' || prop === 'speak') {
        return (...args) => {
          const text = args.find((arg) => typeof arg === 'string');
          if (text) lines.push(text);
          return Promise.resolve();
        };
      }
      if (prop === 'has') return () => false;
      return noop;
    },
  });
}

export class Memory {
  constructor(game) {
    this.game = game;
    this.picking = false;   // Auswahl der Wagen ist offen
    this.visit = null;      // { door, name, scene, script } – der Wagen, der gerade angesehen wird
    this.loading = false;
    this.caption = null;    // { title, lines } – was Joseph zu der angeklickten Stelle sagt
    this.mouse = { x: -1, y: -1 };
  }

  get isOpen() {
    return this.picking || this.loading || Boolean(this.visit);
  }

  // Welche Wagen darf man ansehen? Alle geschafften vor dem jetzigen (im Test: alle davor)
  doors() {
    const current = this.game.door ?? 0;
    return DOORS.filter(({ door, load }) => load && door < current && (TEST_MODE || this.game.save.isDone(door)));
  }

  get possible() {
    const game = this.game;
    return this.doors().length > 0 && !game.story?.inCutscene && !game.story?.isBusy && !game.overlay.blocksInput;
  }

  openPicker() {
    this.picking = true;
    this.caption = null;
    this.game.closeViews();
    this.game.notebook.close();
    this.game.inventory.selected = null;
  }

  close() {
    this.picking = false;
    this.visit = null;
    this.caption = null;
  }

  async show(door) {
    this.picking = false;
    this.loading = true;
    try {
      const entry = doorInfo(door);
      const { scene: data, script } = await entry.load();
      const scene = new Scene(data);
      scene.fitCursors(script);
      await scene.load();
      scene.flags = {};
      if (this.loading) this.visit = { door, name: entry.wagon, scene, script };
    } catch (error) {
      console.error('Erinnerung konnte nicht geladen werden', error);
      this.picking = true;
    }
    this.loading = false;
  }

  // Was Joseph beim Anschauen sagt (nur Texte; Rätsel und Merker spielen keine Rolle)
  async describe(spot) {
    const reactions = this.visit.script.hotspots?.[spot.id] ?? {};
    const lines = [];
    const look = reactions.look ?? (typeof reactions.use === 'string' ? reactions.use : null);
    try {
      if (typeof look === 'string') lines.push(look);
      else if (Array.isArray(look)) lines.push(...look.filter((line) => typeof line === 'string'));
      else if (typeof look === 'function') await Promise.race([look(silentStory(lines), spot), new Promise((r) => setTimeout(r, 300))]);
    } catch {
      // der Text hängt von Dingen ab, die es in der Erinnerung nicht gibt – dann eben nur der Name
    }
    this.caption = { title: spot.name ?? '', lines: lines.slice(0, 3) };
  }

  // ---------------------------------------------------------------- Eingaben
  handleClick(click) {
    if (this.loading) return;
    if (this.picking) return this.clickPicker(click);
    if (click.right || inside(click, BACK)) return this.close();
    const spot = this.visit.scene.hotspotAt(click);
    if (spot) this.describe(spot);
    else this.caption = null;
  }

  clickPicker(click) {
    if (click.right) return this.close();
    const cell = this.cells().find((c) => inside(click, c));
    if (cell) return this.show(cell.door);
    if (inside(click, this.backFromPicker()) || !inside(click, PICKER)) this.close();
  }

  handleKey() {
    // Esc: aus der Erinnerung zurück zur Auswahl, aus der Auswahl zurück in den Wagen
    if (this.visit) {
      this.visit = null;
      this.caption = null;
      this.picking = true;
    } else this.close();
  }

  label() {
    if (this.picking) {
      const cell = this.cells().find((c) => inside(this.mouse, c));
      return cell ? `Wagen ${cell.door} ansehen` : '';
    }
    if (!this.visit) return '';
    if (inside(this.mouse, BACK)) return '';
    return this.visit.scene.hotspotAt(this.mouse)?.name ?? '';
  }

  update(dt, mouse) {
    this.mouse = mouse;
    const scene = this.visit?.scene;
    if (!scene) return;
    // Nur die Landschaft und die Figuren bewegen sich – der Zug fährt hier nicht in den Tunnel
    scene.time += dt;
    for (const spot of scene.animations) spot.player?.update(dt);
    for (const character of scene.characters) character.update(dt);
  }

  // ---------------------------------------------------------------- Zeichnen
  cells() {
    const doors = this.doors();
    const left = PICKER.x + (PICKER.width - (CELL.columns * CELL.width + (CELL.columns - 1) * CELL.gap)) / 2;
    return doors.map(({ door, wagon }, i) => ({
      door,
      wagon,
      x: left + (i % CELL.columns) * (CELL.width + CELL.gap),
      y: PICKER.y + 96 + Math.floor(i / CELL.columns) * (CELL.height + CELL.gap * 0.6),
      width: CELL.width,
      height: CELL.height,
    }));
  }

  backFromPicker() {
    return { x: PICKER.x + PICKER.width / 2 - 140, y: PICKER.y + PICKER.height - 64, width: 280, height: 44 };
  }

  draw(ctx) {
    if (this.visit) this.drawVisit(ctx);
    else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, 1280, 720);
    }
    if (this.picking) this.drawPicker(ctx);
    if (this.loading) {
      ctx.font = `bold 24px ${SANS}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      outlinedText(ctx, 'Joseph erinnert sich …', 640, 360, COLORS.joseph);
    }
  }

  drawVisit(ctx) {
    const { scene, door, name } = this.visit;
    ctx.save();
    try {
      scene.draw(ctx, NOBODY);
    } catch {
      scene.drawBackground(ctx);
    }
    ctx.restore();

    // wie eine alte Erinnerung: leicht ausgeblichen, dunkler Rand
    ctx.save();
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.55)';
    ctx.fillRect(0, 0, 1280, 720);
    ctx.restore();
    const vignette = ctx.createRadialGradient(640, 360, 300, 640, 360, 780);
    vignette.addColorStop(0, 'rgba(20, 12, 4, 0)');
    vignette.addColorStop(1, 'rgba(20, 12, 4, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1280, 720);

    // Titel oben links, Zurück-Knopf oben rechts
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.font = `bold 24px ${SANS}`;
    outlinedText(ctx, `Erinnerung – Wagen ${door}: ${name}`, 24, 37, COLORS.brass);
    ctx.font = `16px ${SANS}`;
    outlinedText(ctx, 'So sah es am Anfang aus. Klick: anschauen · Rechtsklick oder Esc: zurück', 24, 68, '#f3e2bf', 4);
    this.drawButton(ctx, BACK, `Zurück zu Wagen ${this.game.door}`);

    if (this.caption) this.drawCaption(ctx);
  }

  drawCaption(ctx) {
    const { title, lines } = this.caption;
    const width = 860, x = 640 - width / 2;
    ctx.font = `20px ${SANS}`;
    const wrapped = (lines.length ? lines : ['(Dazu fällt mir nichts mehr ein.)']).flatMap((line) => wrapText(ctx, line, width - 40));
    const height = 54 + wrapped.length * 28;
    const y = 700 - height;
    roundedRect(ctx, x, y, width, height, 12);
    ctx.fillStyle = 'rgba(24, 14, 8, 0.92)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.85)';
    ctx.stroke();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.brass;
    ctx.font = `bold 19px ${SANS}`;
    ctx.fillText(title, x + 20, y + 26);
    ctx.fillStyle = '#f3e2bf';
    ctx.font = `20px ${SANS}`;
    wrapped.forEach((line, i) => ctx.fillText(line, x + 20, y + 56 + i * 28));
  }

  drawPicker(ctx) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    roundedRect(ctx, PICKER.x, PICKER.y, PICKER.width, PICKER.height, 14);
    ctx.fillStyle = 'rgba(24, 14, 8, 0.96)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.85)';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLORS.brass;
    ctx.font = `bold 26px ${SANS}`;
    ctx.fillText('Frühere Wagen ansehen', 640, PICKER.y + 36);
    ctx.fillStyle = 'rgba(243, 226, 191, 0.8)';
    ctx.font = `16px ${SANS}`;
    ctx.fillText(`Nur kurz nachsehen – Wagen ${this.game.door} wartet so lange und geht danach genau hier weiter.`, 640, PICKER.y + 66);

    for (const cell of this.cells()) this.drawButton(ctx, cell, `${cell.door} · ${cell.wagon}`, true, 17);
    this.drawButton(ctx, this.backFromPicker(), `Zurück zu Wagen ${this.game.door}`);
    ctx.restore();
  }

  drawButton(ctx, box, label, light = false, size = 18) {
    const hovered = inside(this.mouse, box);
    roundedRect(ctx, box.x, box.y, box.width, box.height, 8);
    ctx.fillStyle = light
      ? (hovered ? 'rgba(217, 164, 65, 0.95)' : 'rgba(217, 164, 65, 0.7)')
      : (hovered ? 'rgba(120, 60, 50, 0.95)' : 'rgba(90, 45, 38, 0.9)');
    ctx.fill();
    ctx.fillStyle = light ? '#2a1a0e' : '#f3e2bf';
    ctx.font = `bold ${size}px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, box.x + box.width / 2, box.y + box.height / 2 + 1);
  }
}

function inside(p, box) {
  return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}
