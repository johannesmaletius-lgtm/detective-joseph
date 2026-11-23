import { DOORS, dateText, daysUntil, isUnlocked } from './doors.js';
import { COLORS, FONTS, outlinedText, roundedRect } from '../ui/text.js';

// Der Adventskalender: Die Ringbahn von oben – 24 Wagen auf einem Gleiskreis, in der Mitte der Turm.
// Jeder Wagen ist eine Tür. Gesperrte Wagen sind dunkel, offene leuchten, geschaffte tragen einen Stern.
//
//   const door = await calendar.open({ save, now, test });   // wartet, bis eine Tür gewählt wird

const RING = { x: 640, y: 392, rx: 520, ry: 250 };
const WAGON = { length: 84, width: 40 };
const HIT_RADIUS = 40;
const RESET = { x: 1080, y: 672, width: 180, height: 32 };

export class Calendar {
  constructor() {
    this.isOpen = false;
    this.age = 0;
    this.hovered = null;   // Tür unter der Maus
    this.message = null;   // { text, age } – kurze Meldung in der Mitte
    this.resetArmed = 0;   // > 0: noch einmal klicken löscht den Spielstand
    this.places = placeWagons();
    this.stars = Array.from({ length: 140 }, (_, i) => ({
      x: rand(i * 3) * 1280, y: rand(i * 3 + 1) * 720, size: 0.6 + rand(i * 3 + 2) * 1.4, phase: rand(i) * 6,
    }));
    this.snow = Array.from({ length: 110 }, (_, i) => ({
      x: rand(i * 7) * 1280, y: rand(i * 7 + 1) * 720, size: 1 + rand(i * 7 + 2) * 2.4, speed: 14 + rand(i * 7 + 3) * 30, drift: rand(i * 7 + 4) * 6,
    }));
  }

  open({ save, now, test = false }) {
    this.save = save;
    this.now = now;
    this.test = test;
    this.isOpen = true;
    this.message = null;
    this.resetArmed = 0;
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  close() {
    this.isOpen = false;
  }

  unlocked(door) {
    return isUnlocked(door, this.now, this.test);
  }

  // Die Tür, die als Nächstes dran ist: die erste offene Tür, die noch nicht geschafft ist
  get current() {
    const open = DOORS.filter(({ door }) => this.unlocked(door) && !this.save.isDone(door));
    return open.length ? open[0].door : null;
  }

  update(dt, mouse) {
    this.age += dt;
    this.resetArmed = Math.max(0, this.resetArmed - dt);
    if (this.message && (this.message.age += dt) > 4) this.message = null;
    for (const flake of this.snow) {
      flake.y += flake.speed * dt;
      flake.x += Math.sin(this.age * 0.6 + flake.drift) * 8 * dt;
      if (flake.y > 724) {
        flake.y = -4;
        flake.x = Math.random() * 1280;
      }
    }
    this.hovered = mouse.inside ? this.doorAt(mouse) : null;
  }

  doorAt(point) {
    let best = null, bestDistance = HIT_RADIUS;
    for (const place of this.places) {
      const distance = Math.hypot(point.x - place.x, point.y - place.y);
      if (distance < bestDistance * place.scale) {
        best = place.door;
        bestDistance = distance / place.scale;
      }
    }
    return best;
  }

  // Text neben dem Mauszeiger
  get label() {
    if (this.test && inside(this.mouse ?? { x: -1, y: -1 }, RESET)) return '';
    const door = this.hovered;
    if (!door) return '';
    const entry = DOORS[door - 1];
    if (this.save.isDone(door)) return `Tür ${door}: ${entry.wagon} – noch einmal spielen`;
    if (!this.unlocked(door)) return `Tür ${door}`;
    return `Tür ${door} öffnen`;
  }

  handleClick(point) {
    this.mouse = point;
    if (this.test && inside(point, RESET)) {
      if (this.resetArmed > 0) {
        this.save.reset();
        this.resetArmed = 0;
        this.say('Spielstand gelöscht.');
      } else {
        this.resetArmed = 3;
      }
      return;
    }
    const door = this.doorAt(point);
    if (!door) return;
    const entry = DOORS[door - 1];
    if (!this.unlocked(door)) {
      const days = daysUntil(door, this.now);
      return this.say(`Tür ${door} öffnet erst am ${dateText(door)}.${days > 1 ? ` Noch ${days} Tage!` : days === 1 ? ' Also morgen!' : ''}`);
    }
    if (!entry.load) return this.say(`Wagen ${door} wird gerade noch gebaut. Bald geht es hier weiter!`);
    this.isOpen = false;
    this.resolve(door);
  }

  say(text) {
    this.message = { text, age: 0 };
  }

  // ---------------------------------------------------------------- Zeichnen
  draw(ctx, mouse) {
    this.mouse = mouse;
    drawSky(ctx, this.stars, this.age);
    drawTrack(ctx);
    const order = [...this.places].sort((a, b) => a.y - b.y); // hinten zuerst
    for (const place of order) {
      if (place.y < RING.y) this.drawWagon(ctx, place);
    }
    this.drawCenter(ctx);
    for (const place of order) {
      if (place.y >= RING.y) this.drawWagon(ctx, place);
    }
    drawSnow(ctx, this.snow);
    if (this.test) this.drawTestBar(ctx, mouse);
  }

  drawWagon(ctx, { door, x, y, angle, scale }) {
    const done = this.save.isDone(door);
    const open = this.unlocked(door);
    const built = Boolean(DOORS[door - 1].load);
    const current = door === this.current;
    const hovered = door === this.hovered;
    const { length, width } = WAGON;

    ctx.save();
    ctx.translate(x, y);
    // Heute dran: warmer, pulsierender Schein
    if (current) {
      const pulse = 0.55 + 0.45 * Math.sin(this.age * 2.6);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 80 * scale);
      glow.addColorStop(0, `rgba(255, 200, 110, ${0.5 * pulse})`);
      glow.addColorStop(1, 'rgba(255, 200, 110, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(-90, -90, 180, 180);
    }
    ctx.scale(scale * (hovered ? 1.08 : 1), scale * (hovered ? 1.08 : 1));
    ctx.rotate(angle);

    // Schatten und Wagenkasten
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    roundedRect(ctx, -length / 2 + 3, -width / 2 + 5, length, width, 8);
    ctx.fill();
    ctx.fillStyle = open ? '#6b2a22' : '#1c1b26';
    roundedRect(ctx, -length / 2, -width / 2, length, width, 8);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = open ? (hovered ? '#ffd88a' : COLORS.brass) : 'rgba(217, 164, 65, 0.28)';
    if (open && !built) ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Dach
    ctx.fillStyle = open ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.03)';
    roundedRect(ctx, -length / 2 + 6, -width / 2 + 6, length - 12, width - 12, 5);
    ctx.fill();
    // Fenster an beiden Seiten
    for (let i = 0; i < 4; i++) {
      const wx = -length / 2 + 12 + i * 18;
      for (const side of [-1, 1]) {
        const wy = side * (width / 2 - 3) - 2;
        if (open) {
          const flicker = 0.75 + 0.25 * Math.sin(this.age * 3 + door * 1.7 + i);
          ctx.fillStyle = `rgba(255, 214, 130, ${flicker})`;
        } else {
          ctx.fillStyle = 'rgba(60, 64, 90, 0.7)';
        }
        ctx.fillRect(wx, wy, 11, 4);
      }
    }
    ctx.restore();

    // Nummer – immer aufrecht, damit man sie lesen kann
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${hovered ? 23 : 21}px "Trebuchet MS", "Avenir Next", "Segoe UI", system-ui, sans-serif`;
    if (open) outlinedText(ctx, String(door), 0, 1, done ? '#fff3cf' : '#ffe2a0', 5);
    else outlinedText(ctx, String(door), 0, 1, 'rgba(170, 165, 190, 0.65)', 4);
    if (done) drawStar(ctx, 26, -20, 9, this.age + door);
    if (!open) drawPadlock(ctx, 24, -16);
    ctx.restore();
  }

  drawCenter(ctx) {
    // Turm mit rotem Licht
    const tx = 640, ty = 470;
    ctx.fillStyle = '#0c0b14';
    ctx.beginPath();
    ctx.moveTo(tx - 10, ty + 40);
    ctx.lineTo(tx - 4, ty - 30);
    ctx.lineTo(tx + 4, ty - 30);
    ctx.lineTo(tx + 10, ty + 40);
    ctx.closePath();
    ctx.fill();
    const blink = Math.max(0, Math.sin(this.age * 2.4)) ** 6;
    const red = ctx.createRadialGradient(tx, ty - 34, 0, tx, ty - 34, 46);
    red.addColorStop(0, `rgba(255, 70, 60, ${0.3 + 0.65 * blink})`);
    red.addColorStop(1, 'rgba(255, 70, 60, 0)');
    ctx.fillStyle = red;
    ctx.fillRect(tx - 46, ty - 80, 92, 92);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = FONTS.title;
    ctx.fillStyle = COLORS.brass;
    ctx.fillText('Detective Joseph', 640, 262);
    ctx.font = FONTS.subtitle;
    ctx.fillStyle = '#c9b48f';
    ctx.fillText('Die Ringbahn  ·  24 Wagen bis Heiligabend', 640, 318);

    ctx.font = FONTS.label;
    ctx.fillStyle = '#e8d6ad';
    ctx.fillText(this.statusText(), 640, 372);

    if (this.message) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.message.age / 0.2, (4 - this.message.age) / 0.5);
      ctx.font = FONTS.speech;
      const width = ctx.measureText(this.message.text).width + 40;
      ctx.fillStyle = 'rgba(20, 12, 7, 0.88)';
      roundedRect(ctx, 640 - width / 2, 536, width, 44, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = COLORS.joseph;
      ctx.fillText(this.message.text, 640, 559);
      ctx.restore();
    }
  }

  statusText() {
    const done = this.save.doneCount;
    if (done === 24) return 'Alle 24 Wagen geschafft. Frohe Weihnachten!';
    const current = this.current;
    if (current) return current === 1 && done === 0 ? 'Steig ein: Klick auf Wagen 1.' : `Heute wartet Wagen ${current} auf dich.`;
    const next = DOORS.find(({ door }) => !this.unlocked(door));
    if (!next) return '';
    const days = daysUntil(next.door, this.now);
    if (next.door === 1) return `Der erste Wagen öffnet am 1. Dezember – noch ${days} ${days === 1 ? 'Tag' : 'Tage'}.`;
    return `Für heute geschafft! Wagen ${next.door} öffnet ${days === 1 ? 'morgen' : `in ${days} Tagen`}.`;
  }

  drawTestBar(ctx, mouse) {
    ctx.save();
    ctx.font = FONTS.hintTitle;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    outlinedText(ctx, 'TEST-MODUS: alle Türen offen  ·  gestrichelt = noch nicht gebaut', 16, 14, '#ff9f8a', 4);
    const hovered = inside(mouse, RESET);
    roundedRect(ctx, RESET.x, RESET.y, RESET.width, RESET.height, 8);
    ctx.fillStyle = this.resetArmed > 0 ? 'rgba(160, 40, 30, 0.85)' : hovered ? 'rgba(80, 30, 20, 0.85)' : 'rgba(30, 18, 12, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = FONTS.small;
    ctx.fillStyle = '#f3e2bf';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.resetArmed > 0 ? 'Wirklich? Noch mal klicken' : 'Spielstand löschen', RESET.x + RESET.width / 2, RESET.y + RESET.height / 2 + 1);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- Hilfen
// Verteilt die 24 Wagen in gleichen Abständen auf dem Gleiskreis (Wagen 1 oben, dann im Uhrzeigersinn)
function placeWagons() {
  const steps = 2000;
  const points = [];
  let total = 0;
  let previous = null;
  for (let i = 0; i <= steps; i++) {
    const t = -Math.PI / 2 + (i / steps) * Math.PI * 2;
    const point = { t, x: RING.x + Math.cos(t) * RING.rx, y: RING.y + Math.sin(t) * RING.ry };
    if (previous) total += Math.hypot(point.x - previous.x, point.y - previous.y);
    point.length = total;
    points.push(point);
    previous = point;
  }
  return DOORS.map(({ door }) => {
    const target = ((door - 1) / DOORS.length) * total;
    const point = points.find((p) => p.length >= target) ?? points[0];
    const angle = Math.atan2(RING.ry * Math.cos(point.t), -RING.rx * Math.sin(point.t));
    const depth = (point.y - (RING.y - RING.ry)) / (2 * RING.ry); // 0 = hinten, 1 = vorne
    return { door, x: point.x, y: point.y, angle, scale: 0.86 + 0.26 * depth };
  });
}

function drawSky(ctx, stars, age) {
  const night = ctx.createLinearGradient(0, 0, 0, 720);
  night.addColorStop(0, '#05040c');
  night.addColorStop(0.6, '#0b0a1a');
  night.addColorStop(1, '#141024');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, 1280, 720);
  for (const star of stars) {
    ctx.fillStyle = `rgba(235, 230, 255, ${0.25 + 0.35 * (0.5 + 0.5 * Math.sin(age * 1.3 + star.phase))})`;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
  // Schnee am Boden innerhalb des Rings
  const ground = ctx.createRadialGradient(RING.x, RING.y + 40, 40, RING.x, RING.y + 40, RING.rx * 1.05);
  ground.addColorStop(0, 'rgba(150, 160, 200, 0.10)');
  ground.addColorStop(1, 'rgba(150, 160, 200, 0)');
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(RING.x, RING.y, RING.rx + 60, RING.ry + 40, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTrack(ctx) {
  const { x, y, rx, ry } = RING;
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.14)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 120; i++) { // Schwellen
    const a = (i / 120) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * (rx - 16), y + Math.sin(a) * (ry - 8));
    ctx.lineTo(x + Math.cos(a) * (rx + 16), y + Math.sin(a) * (ry + 8));
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)';
  for (const grow of [-10, 10]) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx + grow, ry + grow * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSnow(ctx, snow) {
  ctx.fillStyle = 'rgba(240, 244, 255, 0.75)';
  for (const flake of snow) {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStar(ctx, x, y, radius, phase) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(phase * 0.8) * 0.15);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd35c';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3a2208';
  ctx.stroke();
  ctx.restore();
}

function drawPadlock(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(190, 185, 210, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -3, 4, Math.PI, 0);
  ctx.stroke();
  ctx.fillStyle = 'rgba(190, 185, 210, 0.7)';
  ctx.fillRect(-6, -3, 12, 9);
  ctx.restore();
}

function inside(point, { x, y, width, height }) {
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
}

// Feste Zufallszahlen (jedes Mal dieselben Sterne)
function rand(seed) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
