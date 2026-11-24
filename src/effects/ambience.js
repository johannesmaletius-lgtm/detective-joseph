// Kleine Effekte, die einen Wagen lebendig machen – alles im Code gemalt, ganz dezent:
//
//   Schnee      fällt leise hinter allen Fenstern (kommt von selbst, sobald eine Szene "outside" hat)
//               und treibt mit der Fahrt nach außen; im Tunnel ist er weg.
//
// Und was eine Szene unter "ambience" einträgt (Koordinaten im 1280 × 720-Bild):
//   { kind: 'flame', x, y, size }                  Kerzenflamme: x/y = Fuß der Flamme (am Docht), size = Höhe.
//                                                  Liegt über der gemalten Flamme, flackert und hat einen Lichthof.
//   { kind: 'glow', x, y, radius, color, strength, flicker }
//                                                  Lichtschein; flicker: 'candle' (unruhig), 'lamp' (fast ruhig),
//                                                  'fire' (glutrot, pulsierend)
//   { kind: 'steam', x, y, size, drift: [dx, dy], every }
//                                                  Dampfwölkchen, die aus einem Rohr steigen und vergehen
//   { kind: 'sparks', x, y, width, every }         Funken, die aus einer Glut hochfliegen und verglühen
//   { kind: 'dust', x, y, width, height, count }   Staubkörnchen, die im Licht einer Lampe schweben
//   { kind: 'hand', x, y, length, speed, color }   Sekundenzeiger einer Uhr (springt jede Sekunde;
//                                                  speed −1 = läuft rückwärts)
// Jeder Eintrag kann `when: 'merker'` haben (wie hotspots und props).
// Kerzen brennen auch im Tunnel weiter, wenn das elektrische Licht aus ist: Flammen immer, ein Lichtschein
// nur mit `burns: true` (z. B. eine Öllaterne). Sie sparen die Dunkelheit um sich herum aus (lights()).
//
// Alles ist auf Tempo gebaut (iPad): wenige Teilchen, Lichthöfe als einmal vorbereitete Bildchen,
// keine Schatten oder Filter.

const TAU = Math.PI * 2;
const SNOW_DENSITY = 1 / 900; // Flocken je Quadratpixel Fensterfläche
const SNOW_MAX = 140;

export class Ambience {
  constructor(effects = [], { windows = [] } = {}) {
    this.effects = effects.map((effect, i) => ({ ...effect, seed: hash(i + 1), particles: [], wait: 0 }));
    this.time = 0;
    this.snow = makeSnow(windows);
  }

  update(dt, scene) {
    this.time += dt;
    const speed = scene.motion?.speed ?? 0;
    for (const flake of this.snow) {
      const w = flake.window;
      flake.y += flake.fall * dt;
      flake.x += (flake.side * (25 + 140 * speed * flake.depth) + Math.sin(this.time * flake.wobble + flake.phase) * 8) * dt;
      if (flake.y > w.bottom + 4) flake.y = w.top - 4;
      if (flake.x < w.from - 4 || flake.x > w.to + 4) {
        flake.x = flake.side < 0 ? w.to + 2 : w.from - 2; // kommt auf der Seite zur Wagenmitte wieder herein
        flake.y = w.top + Math.random() * (w.bottom - w.top);
      }
    }
    for (const effect of this.effects) {
      if (effect.kind === 'steam') this.updateParticles(effect, dt, effect.every ?? 0.5, spawnSteam);
      else if (effect.kind === 'sparks') this.updateParticles(effect, dt, effect.every ?? 0.35, spawnSpark);
      else if (effect.kind === 'dust' && !effect.particles.length) effect.particles = makeDust(effect);
      else if (effect.kind === 'dust') updateDust(effect, dt);
    }
  }

  updateParticles(effect, dt, every, spawn) {
    effect.wait -= dt;
    if (effect.wait <= 0) {
      effect.particles.push(spawn(effect));
      effect.wait = every * (0.6 + Math.random() * 0.8);
    }
    for (const p of effect.particles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 0.6 * dt;
      if (effect.kind === 'sparks') p.vy += 18 * dt; // werden langsamer, fallen fast zurück
    }
    effect.particles = effect.particles.filter((p) => p.age < p.life);
  }

  // Hinter dem Hintergrundbild: nur der Schnee (sichtbar durch die durchsichtigen Scheiben)
  drawBehind(ctx, scene) {
    if (!this.snow.length) return;
    const visible = 1 - (scene.motion?.tunnel ?? 0);
    if (visible <= 0.02) return;
    ctx.save();
    ctx.fillStyle = '#eef3ff';
    for (const flake of this.snow) {
      ctx.globalAlpha = visible * flake.alpha;
      const s = flake.size;
      ctx.fillRect(flake.x - s / 2, flake.y - s / 2, s, s);
    }
    ctx.restore();
  }

  // Was im Dunkeln weiterbrennt: Stellen, an denen die Dunkelheit ausgespart wird (siehe scene.glowingSpots)
  lights(scene) {
    const spots = [];
    for (const effect of this.effects) {
      if (!scene.isActive(effect)) continue;
      const f = flicker(this.time, effect.seed, 'candle');
      if (effect.kind === 'flame') spots.push({ x: effect.x, y: effect.y - effect.size * 0.45, radius: effect.size * 2.6 * f });
      else if (effect.kind === 'glow' && effect.burns) spots.push({ x: effect.x, y: effect.y, radius: effect.radius * 0.9 * f });
    }
    return spots;
  }

  // Vor dem Hintergrund, unter den Figuren
  draw(ctx, scene) {
    const t = this.time;
    for (const effect of this.effects) {
      if (!scene.isActive(effect)) continue;
      switch (effect.kind) {
        case 'flame': drawFlame(ctx, effect, t); break;
        case 'glow': drawGlow(ctx, effect, t); break;
        case 'steam': drawSteam(ctx, effect); break;
        case 'sparks': drawSparks(ctx, effect); break;
        case 'dust': drawDust(ctx, effect, t); break;
        case 'hand': drawHand(ctx, effect, scene.motion?.time ?? t); break;
        default: break;
      }
    }
  }
}

// ---------------------------------------------------------------- Flackern

// weiches, unregelmäßiges Flackern um 1 (Summe von Sinuswellen mit krummen Frequenzen)
function flicker(t, seed, kind = 'candle') {
  const a = Math.sin(t * 7.3 + seed * 6) * 0.5 + Math.sin(t * 12.9 + seed * 11) * 0.3 + Math.sin(t * 2.1 + seed * 3) * 0.6;
  if (kind === 'lamp') return 1 + 0.03 * a;
  if (kind === 'fire') return 1 + 0.12 * a + 0.06 * Math.sin(t * 0.9 + seed);
  return 1 + 0.07 * a;
}

// ---------------------------------------------------------------- Lichthöfe (einmal vorbereitet)

const SPRITES = new Map();
function sprite(color) {
  if (!SPRITES.has(color)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const c = canvas.getContext('2d');
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${color}, 1)`);
    g.addColorStop(0.35, `rgba(${color}, 0.45)`);
    g.addColorStop(1, `rgba(${color}, 0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    SPRITES.set(color, canvas);
  }
  return SPRITES.get(color);
}

function halo(ctx, x, y, radius, color, alpha) {
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.drawImage(sprite(color), x - radius, y - radius, radius * 2, radius * 2);
}

function drawGlow(ctx, { x, y, radius, color = '255, 200, 120', strength = 0.25, flicker: kind = 'lamp', seed }, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const f = flicker(t, seed, kind);
  halo(ctx, x, y, radius * (0.97 + 0.03 * f), color, strength * f);
  ctx.restore();
}

// ---------------------------------------------------------------- Kerzenflamme

// Die Flamme wird einmal als Bildchen vorbereitet (64 × 160) und dann nur noch gestreckt und geneigt –
// ein Farbverlauf je Bild wäre auf dem iPad zu teuer.
let flameSprite = null;
function flameImage() {
  if (flameSprite) return flameSprite;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 160;
  const c = canvas.getContext('2d');
  const h = 150, w = 20;
  c.translate(32, 154);
  const g = c.createLinearGradient(0, 0, 0, -h);
  g.addColorStop(0, 'rgba(255, 150, 60, 0.95)');
  g.addColorStop(0.35, 'rgba(255, 236, 170, 1)');
  g.addColorStop(1, 'rgba(255, 200, 90, 0.9)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, 4);
  c.bezierCurveTo(w, 0, w * 0.8, -h * 0.45, 0, -h);
  c.bezierCurveTo(-w * 0.8, -h * 0.45, -w, 0, 0, 4);
  c.fill();
  c.fillStyle = 'rgba(255, 255, 235, 0.9)'; // heller Kern
  c.beginPath();
  c.ellipse(0, -h * 0.3, w * 0.38, h * 0.22, 0, 0, TAU);
  c.fill();
  flameSprite = canvas;
  return canvas;
}

function drawFlame(ctx, { x, y, size, seed }, t) {
  const f = flicker(t, seed);
  const h = size * (0.97 + 0.5 * (f - 1));
  const sway = Math.sin(t * 3.1 + seed * 9) * 0.6 + Math.sin(t * 7.7 + seed * 4) * 0.4; // Spitze wiegt sich
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  halo(ctx, x, y - size * 0.45, size * 2.6, '255, 170, 80', 0.16 * f);
  halo(ctx, x, y - size * 0.45, size * 1.1, '255, 210, 120', 0.32 * f);
  ctx.restore();

  ctx.save();
  // Bildchen: Docht bei (32, 154), Flamme 150 hoch und 40 breit → auf Höhe h und Breite size·0,64,
  // die Spitze seitlich geneigt
  ctx.translate(x, y);
  ctx.transform(1, 0, (-sway * 0.12 * size) / h, 1, 0, 0);
  ctx.scale((size * 0.32) / 20, h / 150);
  ctx.drawImage(flameImage(), -32, -154);
  ctx.restore();
}

// ---------------------------------------------------------------- Dampf und Funken

function spawnSteam({ x, y, size = 16, drift = [6, -28] }) {
  return {
    x: x + (Math.random() - 0.5) * size * 0.4, y,
    vx: drift[0] * (0.6 + Math.random() * 0.8), vy: drift[1] * (0.7 + Math.random() * 0.6),
    age: 0, life: 2.2 + Math.random() * 1.4, size: size * (0.7 + Math.random() * 0.5),
  };
}

function drawSteam(ctx, effect) {
  const puff = sprite('235, 228, 220');
  ctx.save();
  for (const p of effect.particles) {
    const k = p.age / p.life;
    const r = p.size * (0.6 + 1.6 * k);
    ctx.globalAlpha = 0.22 * Math.sin(Math.PI * Math.min(1, k * 1.3)) * (effect.strength ?? 1);
    ctx.drawImage(puff, p.x - r, p.y - r, r * 2, r * 2);
  }
  ctx.restore();
}

function spawnSpark({ x, y, width = 40 }) {
  return {
    x: x + (Math.random() - 0.5) * width, y,
    vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 45,
    age: 0, life: 0.7 + Math.random() * 0.9,
  };
}

function drawSparks(ctx, effect) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of effect.particles) {
    const k = p.age / p.life;
    const twinkle = 0.7 + 0.3 * Math.sin(p.age * 40 + p.x);
    ctx.globalAlpha = (1 - k) * twinkle;
    ctx.fillStyle = k < 0.4 ? '#ffe39a' : '#ff8a3a';
    const s = 2.2 - k;
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    halo(ctx, p.x, p.y, 5, '255, 140, 60', 0.35 * (1 - k));
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Staub im Licht

function makeDust({ x, y, width, height, count = 14 }) {
  return Array.from({ length: count }, () => ({
    x: x + Math.random() * width, y: y + Math.random() * height,
    vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.3) * 4,
    phase: Math.random() * TAU, size: 0.8 + Math.random() * 1.1,
  }));
}

function updateDust(effect, dt) {
  const { x, y, width, height } = effect;
  for (const p of effect.particles) {
    p.x += (p.vx + Math.sin(p.phase + p.y * 0.05) * 2) * dt;
    p.y += p.vy * dt;
    if (p.x < x) p.x += width; else if (p.x > x + width) p.x -= width;
    if (p.y < y) p.y += height; else if (p.y > y + height) p.y -= height;
  }
}

function drawDust(ctx, effect, t) {
  const { x, y, width, height } = effect;
  const cx = x + width / 2, cy = y + height / 2;
  ctx.save();
  ctx.fillStyle = effect.color ?? '#fff1cf';
  for (const p of effect.particles) {
    // am Rand des Lichtkegels unsichtbar, in der Mitte am hellsten; funkelt leicht
    const dx = (p.x - cx) / (width / 2), dy = (p.y - cy) / (height / 2);
    const inside = Math.max(0, 1 - (dx * dx + dy * dy));
    ctx.globalAlpha = inside * (0.35 + 0.3 * Math.sin(t * 1.7 + p.phase)) * (effect.strength ?? 1);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- Sekundenzeiger

function drawHand(ctx, { x, y, length, speed = 1, color = 'rgba(150, 30, 20, 0.9)', seed }, t) {
  // springt einmal je Sekunde, mit einem kleinen Nachfedern
  const s = t * Math.abs(speed) + seed * 60;
  const whole = Math.floor(s);
  const frac = s - whole;
  const step = whole + Math.min(1, frac / 0.08) + (frac < 0.25 ? 0.15 * Math.sin(frac * 40) * (1 - frac * 4) : 0);
  const angle = (Math.sign(speed) * step * TAU) / 60;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1, length * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, length * 0.22);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1.2, length * 0.08), 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- Schnee

function makeSnow(windows) {
  const area = windows.reduce((sum, w) => sum + (w.to - w.from) * (w.bottom - w.top), 0);
  const count = Math.min(SNOW_MAX, Math.round(area * SNOW_DENSITY));
  const flakes = [];
  for (let i = 0; i < count; i++) {
    // Fenster nach Fläche auswählen
    let pick = Math.random() * area;
    const window = windows.find((w) => (pick -= (w.to - w.from) * (w.bottom - w.top)) <= 0) ?? windows[0];
    const depth = Math.random(); // 0 = weit weg (klein, langsam), 1 = nah
    flakes.push({
      window,
      side: (window.from + window.to) / 2 < 640 ? -1 : 1,
      x: window.from + Math.random() * (window.to - window.from),
      y: window.top + Math.random() * (window.bottom - window.top),
      depth,
      size: 1 + depth * 1.6,
      alpha: 0.35 + depth * 0.45,
      fall: 14 + depth * 26,
      wobble: 0.8 + Math.random() * 1.2,
      phase: Math.random() * TAU,
    });
  }
  return flakes;
}

// fester „Zufall“ je Eintrag, damit nicht alle Kerzen im Gleichtakt flackern
function hash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
