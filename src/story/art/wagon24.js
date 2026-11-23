import { INK, PRINT, SERIF, drawPicture, glow, line, picture, text } from './common.js';

// Gezeichnetes für Tür 24 (Heiligabend): Lautsprecheranlage mit 24 Wagen, der Blick aus dem Fenster
// auf die Kilometersteine, das Entgleisen und das Schlussbild (ChatGPT-Bild) mit Wanduhr und Kerze.

// ---------------------------------------------------------------- Lautsprecheranlage
// In diesen Wagen sitzt noch jemand: Bruno (4), Ilse (5), Barkeeper (7), Moll (12), Mira (15), Heizer (21).
export const OCCUPIED = [4, 5, 7, 12, 15, 21];
const NAMES = ['Abteil', 'Gepäck', 'Post', 'Speise', 'Schlaf', 'Fundbüro', 'Bar', 'Kino', 'Spiegel', 'Lautspr.', 'Uhren', 'Musik',
  'Kapelle', 'Zeitung', 'Spielzi.', 'Funk', 'Gewächsh.', 'Schaffner', 'Foto', 'Pack', 'Kessel', 'Lok', 'Gang', '—'];

// Drehpunkt jedes Kippschalters und Mitte seines Schildchens im Bild lautsprecher.webp (1672 × 941)
const S = 1280 / 1672;
const PANEL = 'assets/closeups/lautsprecher.webp';
function switchAt(n) {
  const i = n - 1;
  const row = Math.floor(i / 8), col = i % 8;
  const x = row < 2 ? 372 + col * 134.7 : 397 + col * 147.7;
  const y = [135, 320, 500][row];
  const plate = [211, 398, 580][row];
  return { x: x * S, y: y * S, plate: plate * S };
}

function switchRect(n) {
  const s = switchAt(n);
  return { x: s.x - 42, y: s.y - 44, w: 84, h: s.plate + 16 - (s.y - 44) };
}

export function panelSpots() {
  return [
    ...Array.from({ length: 23 }, (_, i) => ({ id: `w${i + 1}`, ...switchRect(i + 1), label: `Wagen ${i + 1}` })),
    { id: 'speak', cx: 705 * S, cy: 740 * S, r: 72, label: 'Durchsage sprechen' },
  ];
}

export function drawPanel(ctx, { on }) {
  drawPicture(ctx, PANEL, 0, 0, 1280, 720);
  const image = picture(PANEL);
  const ready = image.complete && image.naturalWidth;
  for (let n = 1; n <= 23; n++) {
    const s = switchAt(n);
    // Schildchen: Nummer und Wagen
    text(ctx, `${n} ${NAMES[n - 1]}`, s.x, s.plate + 4, { font: `bold 11px ${PRINT}`, color: '#3a2410', align: 'center' });
    if (!on.includes(n)) continue;
    // eingeschaltet: Schalter senkrecht gespiegelt, der Hebel zeigt nach oben
    if (ready) {
      const hw = 38, hh = 43;
      const sx = image.naturalWidth / 1280;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1, -1);
      ctx.drawImage(image, (s.x - hw) * sx, (s.y - hh) * sx, hw * 2 * sx, hh * 2 * sx, -hw, -hh, hw * 2, hh * 2);
      ctx.restore();
    }
    glow(ctx, s.x + 30, s.y - 30, 18, '120, 255, 140', 0.8);
    ctx.fillStyle = '#7dff8a';
    ctx.beginPath();
    ctx.arc(s.x + 30, s.y - 30, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- Kilometersteine am Fenster
// t = Sekunden seit Beginn. Alle 1,6 s zieht ein Stein vorbei: 23,9 · 24,1 · … · 24,7 …
export const STONE_EVERY = 1.6;
export function stoneAt(t) {
  const index = Math.floor(t / STONE_EVERY);
  const phase = (t % STONE_EVERY) / STONE_EVERY;
  return { km: (23.9 + index * 0.2).toFixed(1).replace('.', ','), phase };
}

export const PADDLE_SPOT = { id: 'paddle', x: 960, y: 560, w: 250, h: 120, label: 'Miras Kelle heben!' };

// Fensterausschnitt (Blick hinaus in den Tunnel)
const WIN = { x: 150, y: 64, w: 980, h: 452 };
const SPEED = { wall: 420, ground: 980 }; // Pixel pro Sekunde: die Wand weiter weg, das Gleis ganz nah

// Kleiner, fester Zufall (immer dieselben Werte für dieselbe Zahl)
function noise(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Der Blick aus dem Fenster: gemauerter Tunnel, Lampen, Kabel, Schotter, Gleis – und die Kilometersteine.
// derail = Sekunden seit dem Hebelzug (oder null): dann rüttelt, kippt und sprüht alles.
export function drawWindowRun(ctx, { t, raised, derail = null }) {
  const d = derail ?? -1;
  const chaos = d < 0 ? 0 : Math.min(1, d / 2.2);           // 0 … 1: wie wild es zugeht
  const shake = 1.6 + chaos * 26;
  const jx = (noise(Math.floor(t * 30)) - 0.5) * shake * (d < 0 ? 0.4 : 1);
  const jy = Math.sin(t * 31) * shake * 0.5 + (noise(Math.floor(t * 30) + 7) - 0.5) * shake * 0.6;
  const tilt = chaos * chaos * 0.2;

  // ---- Wand des Schaffnerabteils (dunkles, poliertes Holz) ----
  const wall = ctx.createLinearGradient(0, 0, 0, 720);
  wall.addColorStop(0, '#2a160c');
  wall.addColorStop(0.5, '#3b2012');
  wall.addColorStop(1, '#1e0f07');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 720);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 40; x < 1280; x += 160) line(ctx, x, 0, x, 720);
  glow(ctx, 640, 300, 700, '255, 170, 90', 0.08);

  ctx.save();
  ctx.translate(640 + jx, 290 + jy);
  ctx.rotate(tilt);
  ctx.translate(-640, -290);

  // ---- Blick hinaus ----
  ctx.save();
  roundRect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 34);
  ctx.clip();
  drawTunnel(ctx, t, d);
  drawStone(ctx, t);
  if (d >= 0) drawSparks(ctx, t, d);
  // Spiegelung in der Scheibe, Beschlag am Rand
  const glass = ctx.createLinearGradient(WIN.x, WIN.y, WIN.x + WIN.w, WIN.y + WIN.h);
  glass.addColorStop(0, 'rgba(255, 230, 200, 0.10)');
  glass.addColorStop(0.35, 'rgba(255, 230, 200, 0)');
  glass.addColorStop(0.55, 'rgba(255, 230, 200, 0.05)');
  glass.addColorStop(0.6, 'rgba(255, 230, 200, 0)');
  ctx.fillStyle = glass;
  ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  const fog = ctx.createRadialGradient(640, 290, 260, 640, 290, 640);
  fog.addColorStop(0, 'rgba(200, 210, 220, 0)');
  fog.addColorStop(1, 'rgba(200, 210, 220, 0.16)');
  ctx.fillStyle = fog;
  ctx.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
  if (d > 1.5) drawCracks(ctx, Math.min(1, (d - 1.5) / 0.5));
  ctx.restore();

  // ---- Fensterrahmen aus Messing, Vorhänge, Fensterbank ----
  ctx.save();
  roundRect(ctx, WIN.x, WIN.y, WIN.w, WIN.h, 34);
  ctx.lineWidth = 26;
  ctx.strokeStyle = '#6b4a1c';
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#c9a24c';
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 240, 190, 0.6)';
  roundRect(ctx, WIN.x - 4, WIN.y - 4, WIN.w + 8, WIN.h + 8, 38);
  ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const x = WIN.x + 20 + (i * (WIN.w - 40)) / 13;
    rivet(ctx, x, WIN.y - 1);
    rivet(ctx, x, WIN.y + WIN.h + 1);
  }
  ctx.restore();
  curtain(ctx, 30, 1, t, chaos);
  curtain(ctx, 1250, -1, t, chaos);
  // Fensterbank
  const sill = ctx.createLinearGradient(0, 528, 0, 560);
  sill.addColorStop(0, '#7a4a24');
  sill.addColorStop(1, '#3a200e');
  ctx.fillStyle = sill;
  ctx.fillRect(110, 528, 1060, 30);
  ctx.fillStyle = 'rgba(255, 220, 160, 0.25)';
  ctx.fillRect(110, 528, 1060, 3);
  ctx.restore();

  // ---- Miras Kelle (liegt bereit oder wird gehoben) ----
  drawPaddle(ctx, raised, t, d);

  if (d < 0) {
    text(ctx, '„Bei 24,7 – nicht früher, nicht später.“', 520, 612, { font: `italic 22px ${SERIF}`, color: '#f1e0b8', align: 'center' });
  }

  // ---- Weißer Blitz am Ende ----
  if (d > 2.6) {
    ctx.fillStyle = `rgba(255, 250, 240, ${Math.min(1, (d - 2.6) / 0.45)})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function rivet(ctx, x, y) {
  const g = ctx.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, 5);
  g.addColorStop(0, '#fff2c0');
  g.addColorStop(1, '#7a5a20');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function curtain(ctx, x, dir, t, chaos) {
  const sway = Math.sin(t * 1.3) * 4 + chaos * Math.sin(t * 9) * 30;
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const fx = x + dir * i * 26;
    const g = ctx.createLinearGradient(fx - 14, 0, fx + 14, 0);
    g.addColorStop(0, '#4a0d10');
    g.addColorStop(0.5, '#9c2228');
    g.addColorStop(1, '#4a0d10');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(fx - 16, 20);
    ctx.quadraticCurveTo(fx + sway * 0.3, 300, fx - 16 + sway, 560);
    ctx.lineTo(fx + 16 + sway, 560);
    ctx.quadraticCurveTo(fx + 30 + sway * 0.3, 300, fx + 16, 20);
    ctx.closePath();
    ctx.fill();
  }
  // Raffhalter aus Messing
  ctx.fillStyle = '#c9a24c';
  ctx.fillRect(x + dir * 20 - 40, 300, 80, 10);
  ctx.restore();
  ctx.fillStyle = '#2a1408';
  ctx.fillRect(0, 0, 1280, 22);
}

// Der Tunnel draußen: gewölbte Ziegelwand, Lampen in festen Abständen, Kabel, Schotter und Gleis
function drawTunnel(ctx, t, d) {
  const { x, y, w, h } = WIN;
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#07060a');
  sky.addColorStop(0.45, '#1c1612');
  sky.addColorStop(0.75, '#120e0b');
  sky.addColorStop(1, '#090706');
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);

  // Ziegel (Wand, mittlere Entfernung)
  const wallTop = y + 30, wallBottom = y + 300;
  const off = (t * SPEED.wall) % 64;
  for (let row = 0, yy = wallTop; yy < wallBottom; row++, yy += 22) {
    const shift = row % 2 ? 32 : 0;
    for (let xx = x - 64 - off + shift; xx < x + w + 64; xx += 64) {
      const n = noise(Math.floor((xx + t * SPEED.wall) / 64) * 13 + row * 7);
      const v = 34 + n * 22;
      ctx.fillStyle = `rgb(${v + 14}, ${v}, ${v - 8})`;
      ctx.fillRect(xx + 2, yy + 2, 60, 18);
    }
  }
  // Wölbung: oben und unten dunkler
  const vault = ctx.createLinearGradient(0, wallTop, 0, wallBottom);
  vault.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  vault.addColorStop(0.35, 'rgba(0, 0, 0, 0.25)');
  vault.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  vault.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = vault;
  ctx.fillRect(x, wallTop, w, wallBottom - wallTop);

  // Kabel an der Wand
  ctx.strokeStyle = 'rgba(20, 16, 12, 0.95)';
  ctx.lineWidth = 4;
  for (const cy of [wallTop + 150, wallTop + 162]) {
    ctx.beginPath();
    for (let xx = x; xx <= x + w; xx += 20) {
      const sag = Math.sin(((xx + t * SPEED.wall) / 180) * Math.PI) * 5;
      if (xx === x) ctx.moveTo(xx, cy + sag);
      else ctx.lineTo(xx, cy + sag);
    }
    ctx.stroke();
  }

  // Tunnellampen (in festen Abständen, mit Lichtkegel auf der Wand)
  const spacing = 300;
  const lampOff = (t * SPEED.wall) % spacing;
  for (let lx = x - lampOff + spacing; lx < x + w + spacing; lx += spacing) {
    const id = Math.floor((lx + t * SPEED.wall) / spacing);
    const dead = noise(id * 3.3) < 0.18;
    const flicker = dead ? 0 : 0.85 + noise(Math.floor(t * 20) + id) * 0.15 + (d > 0 ? Math.sin(t * 40) * 0.3 : 0);
    const ly = wallTop + 70;
    if (flicker > 0) {
      glow(ctx, lx, ly + 60, 190, '255, 190, 110', 0.22 * flicker);
      glow(ctx, lx, ly, 46, '255, 225, 160', 0.9 * flicker);
    }
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(lx - 10, ly - 18, 20, 8);
    ctx.fillStyle = flicker > 0 ? '#ffe3a0' : '#3a3530';
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fill();
    // Bewegungsunschärfe im Licht
    if (flicker > 0) {
      const streak = ctx.createLinearGradient(lx - 60, 0, lx + 10, 0);
      streak.addColorStop(0, 'rgba(255, 220, 150, 0)');
      streak.addColorStop(1, `rgba(255, 220, 150, ${0.35 * flicker})`);
      ctx.fillStyle = streak;
      ctx.fillRect(lx - 60, ly - 4, 70, 8);
    }
  }

  // Schotterbett und Gleis (ganz nah, sehr schnell)
  const groundTop = y + 330;
  const ballast = ctx.createLinearGradient(0, groundTop, 0, y + h);
  ballast.addColorStop(0, '#2b2620');
  ballast.addColorStop(1, '#14110e');
  ctx.fillStyle = ballast;
  ctx.fillRect(x, groundTop, w, y + h - groundTop);
  const gOff = (t * SPEED.ground) % 46;
  for (let xx = x - gOff; xx < x + w + 46; xx += 46) {
    const n = noise(Math.floor((xx + t * SPEED.ground) / 46));
    ctx.fillStyle = `rgba(${70 + n * 40}, ${62 + n * 30}, ${52 + n * 20}, 0.55)`;
    ctx.fillRect(xx, groundTop + 50 + n * 40, 38, 6); // verwischte Schwellenköpfe
  }
  // Schiene im Licht
  ctx.fillStyle = '#5b5550';
  ctx.fillRect(x, groundTop + 34, w, 9);
  ctx.fillStyle = 'rgba(255, 220, 170, 0.55)';
  ctx.fillRect(x, groundTop + 34, w, 2);
}

// Der Kilometerstein, der gerade vorbeizieht (ganz vorn, leicht verwischt)
function drawStone(ctx, t) {
  const { km, phase } = stoneAt(t);
  const sx = WIN.x + WIN.w + 90 - phase * (WIN.w + 260);
  const top = WIN.y + 262;
  for (let ghost = 3; ghost >= 0; ghost--) {
    ctx.globalAlpha = ghost === 0 ? 1 : 0.12;
    const gx = sx + ghost * 16;
    const body = ctx.createLinearGradient(gx - 46, 0, gx + 46, 0);
    body.addColorStop(0, '#9c978c');
    body.addColorStop(0.35, '#ece8dc');
    body.addColorStop(1, '#a7a296');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(gx - 46, top + 150);
    ctx.lineTo(gx - 46, top + 40);
    ctx.arc(gx, top + 40, 46, Math.PI, 0);
    ctx.lineTo(gx + 46, top + 150);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx - 34, top + 44, 68, 40);
  text(ctx, km, sx, top + 74, { font: `bold 30px ${SERIF}`, color: INK, align: 'center' });
  text(ctx, 'km', sx, top + 104, { font: `16px ${SERIF}`, color: 'rgba(43, 33, 24, 0.7)', align: 'center' });
  // Licht der Zugfenster streift den Stein
  glow(ctx, sx, top + 70, 90, '255, 210, 140', 0.18);
}

// Funken der Räder beim Entgleisen
function drawSparks(ctx, t, d) {
  const count = Math.floor(30 + Math.min(1, d / 1.5) * 140);
  for (let i = 0; i < count; i++) {
    const life = (t * 2.2 + noise(i)) % 1;
    const sx = WIN.x + noise(i * 2.1) * WIN.w;
    const sy = WIN.y + WIN.h - 20 - life * (120 + noise(i * 5.7) * 260);
    const len = 10 + noise(i * 9.1) * 26;
    ctx.strokeStyle = `rgba(255, ${180 + noise(i) * 70}, 90, ${1 - life})`;
    ctx.lineWidth = 2;
    line(ctx, sx, sy, sx - len, sy + len * 0.35);
  }
  glow(ctx, 640, WIN.y + WIN.h, 520, '255, 170, 60', 0.25 + Math.sin(t * 50) * 0.1);
}

// Sprünge im Glas
function drawCracks(ctx, amount) {
  const cx = 820, cy = 210;
  ctx.strokeStyle = `rgba(235, 240, 245, ${0.7 * amount})`;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + noise(i) * 0.4;
    const len = (120 + noise(i * 4.4) * 260) * amount;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    let px = cx, py = cy;
    for (let k = 1; k <= 4; k++) {
      px = cx + Math.cos(a + (noise(i * 10 + k) - 0.5) * 0.4) * (len * k) / 4;
      py = cy + Math.sin(a + (noise(i * 20 + k) - 0.5) * 0.4) * (len * k) / 4;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 26 * amount, 0, Math.PI * 2);
  ctx.stroke();
}

// Miras Pappkelle: rot-weiße Scheibe am Stiel. Liegt auf der Fensterbank – oder wird hochgehalten.
function drawPaddle(ctx, raised, t, d) {
  ctx.save();
  if (raised) {
    const wobble = d >= 0 ? Math.sin(t * 22) * 0.12 : 0;
    ctx.translate(1085, 470);
    ctx.rotate(-0.15 + wobble);
    ctx.fillStyle = '#c9a070';
    ctx.fillRect(-8, 0, 16, 190);
    disc(ctx, 0, -70, 80);
    // Hand (Ärmel der Schaffnerjacke)
    ctx.fillStyle = '#1f2a44';
    ctx.fillRect(-34, 150, 68, 80);
    ctx.fillStyle = '#e2b48c';
    ctx.beginPath();
    ctx.ellipse(0, 150, 26, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const pulse = 0.5 + Math.sin(t * 4) * 0.5;
    glow(ctx, PADDLE_SPOT.x + 125, PADDLE_SPOT.y + 60, 150, '255, 210, 120', 0.12 + pulse * 0.1);
    ctx.translate(PADDLE_SPOT.x + 70, PADDLE_SPOT.y + 66);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#c9a070';
    ctx.fillRect(40, -8, 150, 16);
    ctx.scale(1, 0.8);
    disc(ctx, 0, 0, 52);
    ctx.restore();
    ctx.save();
    text(ctx, 'Kelle heben!', PADDLE_SPOT.x + 175, PADDLE_SPOT.y + 30, { font: `bold 20px ${PRINT}`, color: '#ffe7a0', align: 'center' });
  }
  ctx.restore();
}

function disc(ctx, x, y, r) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x + 4, y + 6, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c4262e';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f4efe4';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  // Miras Kinderschrift und ein Stern
  text(ctx, '2512', x, y + 7, { font: `bold ${Math.round(r * 0.32)}px ${PRINT}`, color: '#c4262e', align: 'center' });
}

// ---------------------------------------------------------------- Stille, Schnee
// Nach dem Entgleisen: Schnee fällt auf Schwarz, langsam erscheinen draußen die Lichter.
export function drawSnow(ctx, { time }) {
  ctx.fillStyle = '#05060a';
  ctx.fillRect(0, 0, 1280, 720);
  const reveal = Math.max(0, Math.min(1, (time - 1.5) / 5));
  if (reveal > 0) {
    ctx.save();
    ctx.globalAlpha = reveal * 0.55;
    ctx.filter = 'blur(2px)';
    drawPicture(ctx, 'assets/photos/ausgang.webp', 0, 0, 1280, 720);
    ctx.restore();
  }
  for (let i = 0; i < 220; i++) {
    const depth = 0.3 + noise(i * 1.7) * 0.7;
    const speed = 30 + depth * 70;
    const sx = (noise(i) * 1400 + Math.sin(time * 0.6 + i) * 24 * depth) % 1300 - 10;
    const sy = ((noise(i * 3.1) * 760 + time * speed) % 760) - 20;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + depth * 0.55})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 0.8 + depth * 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // weich vom weißen Blitz ins Dunkel
  if (time < 1.2) {
    ctx.fillStyle = `rgba(255, 250, 240, ${1 - time / 1.2})`;
    ctx.fillRect(0, 0, 1280, 720);
  }
}

// ---------------------------------------------------------------- Schlussbild
// Wanduhr (der ovale Rahmen) zeigt 23:47; oben auf dem Baum die letzte, noch nicht brennende Kerze.
export const FINAL_Y = -10;
export const CANDLE_SPOT = { id: 'candle', x: 528, y: 10, w: 46, h: 80, label: 'Die letzte Kerze anzünden' };

export function drawFinal(ctx, { lit, time }) {
  drawPicture(ctx, 'assets/photos/schluss.webp', 0, FINAL_Y, 1280, 853);
  // Zifferblatt in den ovalen Rahmen
  const cx = 708, cy = 125 + FINAL_Y;
  ctx.fillStyle = '#f2e6c8';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 52, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
    line(ctx, cx + Math.cos(a) * 40, cy + Math.sin(a) * 48, cx + Math.cos(a) * 48, cy + Math.sin(a) * 57);
  }
  const ma = -Math.PI / 2 + 47 / 60 * Math.PI * 2;
  const ha = -Math.PI / 2 + (11 + 47 / 60) / 12 * Math.PI * 2;
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  line(ctx, cx, cy, cx + Math.cos(ha) * 26, cy + Math.sin(ha) * 30);
  ctx.lineWidth = 3;
  line(ctx, cx, cy, cx + Math.cos(ma) * 40, cy + Math.sin(ma) * 48);
  ctx.lineCap = 'butt';
  // Kerze
  if (lit) {
    const flicker = 1 + Math.sin(time * 18) * 0.12;
    glow(ctx, 551, 40 + FINAL_Y, 60 * flicker, '255, 210, 120', 0.7);
    ctx.fillStyle = '#ffd36b';
    ctx.beginPath();
    ctx.ellipse(551, 38 + FINAL_Y, 6, 14 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

