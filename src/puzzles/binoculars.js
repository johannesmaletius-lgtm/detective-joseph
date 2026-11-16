import { View } from './view.js';
import { drawMarks } from '../ui/cards.js';
import { roundedRect } from '../ui/text.js';

// Nahansicht "Fernglas": Joseph beobachtet den Turm in der Mitte des Gleiskreises.
// Das rote Licht blinkt eine Ziffer im Morsecode (siehe src/effects/morse.js) – unten schreibt
// Joseph mit, was er sieht: Punkt = kurz, Strich = lang.
//
//   const watched = await binoculars.open({ signal, clock: () => scene.outside.time });
//   // true, wenn Joseph das Signal einmal von Anfang bis Ende gesehen hat
//
// signal = morseSignal(…), clock liefert die Zeit, nach der auch das Licht im Abteilfenster blinkt.

const LENSES = [{ x: 510, y: 330 }, { x: 770, y: 330 }];
const LENS_RADIUS = 262;
const HORIZON = 440;
const TOWER = { x: 640, base: HORIZON + 6, top: 205 };

export class Binoculars extends View {
  constructor() {
    super();
    this.signal = null;
    this.clock = () => 0;
    this.time = 0;
    this.lastPhase = 0;
    this.started = false;   // ein Signal hat von vorn begonnen, während Joseph hinsah
    this.watched = false;   // … und er hat es bis zum Ende gesehen
    this.trunks = [];       // Baumstämme, die nah am Zug durchs Bild wischen
    this.nextTrunk = 0.6;
    this.stars = makeStars();
    this.help = 'Punkt = kurzes Licht, Strich = langes Licht  ·  Rechtsklick oder Esc: zurück';
  }

  result() {
    return this.watched;
  }

  onOpen({ signal, clock }) {
    this.signal = signal;
    this.clock = clock;
    this.lastPhase = signal.phase(clock());
    this.started = false;
    this.watched = false;
    this.trunks = [];
  }

  update(dt) {
    super.update(dt);
    if (!this.isOpen) return;
    this.time += dt;
    const phase = this.signal.phase(this.clock());
    if (phase < this.lastPhase) this.started = true; // das Signal beginnt von vorn
    this.lastPhase = phase;
    const end = this.signal.flashes[this.signal.flashes.length - 1].end;
    if (this.started && phase >= end) this.watched = true;

    // Stämme rauschen vorbei (der Zug fährt ja)
    this.nextTrunk -= dt;
    if (this.nextTrunk <= 0) {
      this.trunks.push({ x: -160, width: 50 + Math.random() * 90, speed: 2300 + Math.random() * 900 });
      this.nextTrunk = 0.9 + Math.random() * 2.2;
    }
    for (const trunk of this.trunks) trunk.x += trunk.speed * dt;
    this.trunks = this.trunks.filter((trunk) => trunk.x < 1500);
  }

  draw(ctx) {
    if (!this.isOpen) return;
    const level = this.signal.level(this.clock());
    ctx.save();
    ctx.globalAlpha = this.fadeIn;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1280, 720);

    // Blick durch die beiden Gläser
    ctx.save();
    ctx.beginPath();
    for (const lens of LENSES) {
      ctx.moveTo(lens.x + LENS_RADIUS, lens.y);
      ctx.arc(lens.x, lens.y, LENS_RADIUS, 0, Math.PI * 2);
    }
    ctx.clip();
    // Die Hand zittert, der Wagen schaukelt
    const swayX = Math.sin(this.time * 1.3) * 5 + Math.sin(this.time * 9.7) * 1.2;
    const swayY = Math.sin(this.time * 1.9 + 1) * 4 + Math.sin(this.time * 12.3) * 1;
    ctx.translate(swayX, swayY);
    this.drawLandscape(ctx, level);
    ctx.restore();

    // Rand der Gläser: weicher Schatten nach innen, dunkler Ring
    for (const lens of LENSES) {
      const shade = ctx.createRadialGradient(lens.x, lens.y, LENS_RADIUS * 0.72, lens.x, lens.y, LENS_RADIUS);
      shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
      shade.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(lens.x, lens.y, LENS_RADIUS, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = shade;
      ctx.fillRect(lens.x - LENS_RADIUS, lens.y - LENS_RADIUS, LENS_RADIUS * 2, LENS_RADIUS * 2);
      ctx.restore();
    }

    this.drawNotes(ctx);
    ctx.restore();
    this.drawHelp(ctx);
  }

  drawLandscape(ctx, level) {
    // Nachthimmel mit Sternen
    const sky = ctx.createLinearGradient(0, 40, 0, HORIZON);
    sky.addColorStop(0, '#0b0a24');
    sky.addColorStop(1, '#2c2a5e');
    ctx.fillStyle = sky;
    ctx.fillRect(100, 20, 1080, 640);
    for (const star of this.stars) {
      const twinkle = 0.55 + 0.45 * Math.sin(this.time * star.speed + star.phase);
      ctx.fillStyle = `rgba(230, 235, 255, ${star.brightness * twinkle})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    // Ferne Hügel und Wald
    ctx.fillStyle = '#1b1a40';
    ctx.beginPath();
    ctx.moveTo(100, HORIZON);
    for (let x = 100; x <= 1180; x += 20) ctx.lineTo(x, HORIZON - 34 - 22 * Math.sin(x * 0.006 + 1) - 9 * Math.sin(x * 0.021));
    ctx.lineTo(1180, HORIZON);
    ctx.fill();
    ctx.fillStyle = '#0e0d26';
    ctx.beginPath();
    ctx.moveTo(100, HORIZON + 10);
    for (let x = 100; x <= 1180; x += 9) {
      const tall = 16 + 13 * Math.abs(Math.sin(x * 0.37)) + 7 * Math.sin(x * 0.05);
      ctx.lineTo(x, HORIZON - tall);
      ctx.lineTo(x + 4.5, HORIZON - 4);
    }
    ctx.lineTo(1180, HORIZON + 10);
    ctx.fill();
    // Schneefeld
    const snow = ctx.createLinearGradient(0, HORIZON, 0, 660);
    snow.addColorStop(0, '#3b3d78');
    snow.addColorStop(1, '#6b70b0');
    ctx.fillStyle = snow;
    ctx.fillRect(100, HORIZON, 1080, 240);

    this.drawTower(ctx, level);

    // Roter Schein auf dem Schnee, wenn das Licht an ist
    if (level > 0) {
      const glow = ctx.createRadialGradient(TOWER.x, HORIZON + 30, 0, TOWER.x, HORIZON + 30, 260);
      glow.addColorStop(0, `rgba(255, 60, 50, ${0.2 * level})`);
      glow.addColorStop(1, 'rgba(255, 60, 50, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(TOWER.x - 260, HORIZON, 520, 220);
    }

    // Stämme direkt am Gleis: unscharf und schnell
    for (const trunk of this.trunks) {
      const blur = ctx.createLinearGradient(trunk.x, 0, trunk.x + trunk.width, 0);
      blur.addColorStop(0, 'rgba(5, 4, 14, 0)');
      blur.addColorStop(0.5, 'rgba(5, 4, 14, 0.78)');
      blur.addColorStop(1, 'rgba(5, 4, 14, 0)');
      ctx.fillStyle = blur;
      ctx.fillRect(trunk.x, 0, trunk.width, 720);
    }
  }

  // Gitterturm mit Plattform und rotem Licht an der Spitze
  drawTower(ctx, level) {
    const { x, base, top } = TOWER;
    ctx.save();
    ctx.strokeStyle = '#06050f';
    ctx.fillStyle = '#06050f';
    ctx.lineCap = 'round';
    const halfBase = 46, halfTop = 11;
    const half = (y) => halfTop + ((y - top) / (base - top)) * (halfBase - halfTop);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - halfBase, base);
    ctx.lineTo(x - halfTop, top);
    ctx.moveTo(x + halfBase, base);
    ctx.lineTo(x + halfTop, top);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    const levels = 7;
    for (let i = 0; i < levels; i++) {
      const y0 = top + ((base - top) * i) / levels, y1 = top + ((base - top) * (i + 1)) / levels;
      ctx.beginPath();
      ctx.moveTo(x - half(y0), y0);
      ctx.lineTo(x + half(y1), y1);
      ctx.moveTo(x + half(y0), y0);
      ctx.lineTo(x - half(y1), y1);
      ctx.moveTo(x - half(y1), y1);
      ctx.lineTo(x + half(y1), y1);
      ctx.stroke();
    }
    // Plattform und Lampengehäuse
    ctx.fillRect(x - 26, top - 8, 52, 9);
    ctx.fillRect(x - 3, top - 44, 6, 38);
    ctx.fillRect(x - 12, top - 66, 24, 24);
    // Fenster eines Wärterhäuschens am Fuß – dunkel
    ctx.fillRect(x + 54, base - 30, 44, 30);
    ctx.fillStyle = '#16153a';
    ctx.fillRect(x + 64, base - 22, 12, 10);

    // Das Licht
    const lx = x, ly = top - 54;
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fillStyle = level > 0 ? `rgb(255, ${Math.round(120 + 110 * level)}, ${Math.round(100 + 100 * level)})` : '#3a1014';
    ctx.fill();
    if (level > 0) {
      ctx.globalCompositeOperation = 'lighter';
      for (const [radius, alpha] of [[170, 0.38], [70, 0.6], [24, 0.9]]) {
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
        glow.addColorStop(0, `rgba(255, 60, 45, ${alpha * level})`);
        glow.addColorStop(1, 'rgba(255, 60, 45, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
      }
      // Strahlen
      ctx.strokeStyle = `rgba(255, 110, 90, ${0.35 * level})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + 0.2;
        ctx.beginPath();
        ctx.moveTo(lx + Math.cos(angle) * 30, ly + Math.sin(angle) * 30);
        ctx.lineTo(lx + Math.cos(angle) * 58, ly + Math.sin(angle) * 58);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Zettel am oberen Rand: Joseph schreibt mit
  drawNotes(ctx) {
    const marks = this.signal.marksUntil(this.clock());
    const width = 500, height = 50, x = 640 - width / 2, y = 8;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 16;
    ctx.translate(640, y + height / 2);
    ctx.rotate(-0.008);
    ctx.translate(-640, -(y + height / 2));
    const paper = ctx.createLinearGradient(0, y, 0, y + height);
    paper.addColorStop(0, '#f4e9cc');
    paper.addColorStop(1, '#e4d3a8');
    roundedRect(ctx, x, y, width, height, 5);
    ctx.fillStyle = paper;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#33261a';
    ctx.font = '20px "Noteworthy", "Bradley Hand", "Segoe Print", "Comic Sans MS", cursive';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ich schreibe mit:', x + 18, y + height / 2);
    const left = x + 190;
    if (marks.length > 0) {
      drawMarks(ctx, marks.map((mark) => (mark === 'lang' ? '-' : '.')).join(''), left, y + height / 2, '#27408f', 1.5);
    } else {
      ctx.fillStyle = 'rgba(51, 38, 26, 0.5)';
      ctx.fillText(this.signal.phase(this.clock()) < 0.4 ? '…' : '(Pause – gleich von vorn)', left, y + height / 2);
    }
    ctx.restore();
  }
}

// Sterne: zufällig verteilt, aber jedes Mal gleich
function makeStars() {
  const stars = [];
  let seed = 5;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: 100 + random() * 1080,
      y: 40 + random() * 360,
      size: random() < 0.15 ? 3 : 2,
      brightness: 0.35 + random() * 0.65,
      speed: 1 + random() * 3,
      phase: random() * 6.28,
    });
  }
  return stars;
}
