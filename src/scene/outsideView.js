import { GAME_WIDTH } from '../config.js';
import { loadImage } from '../core/assets.js';
import { loadAnimation } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';

// Die Außenwelt hinter den Zugfenstern.
//
// Sie wird VOR dem Hintergrundbild gezeichnet und ist nur dort zu sehen, wo das
// Hintergrundbild durchsichtig ist (die ausgeschnittenen Fensterscheiben).
//
// Sie besteht aus Ebenen (von hinten nach vorne). Jede Ebene ist eines von fünf Dingen:
// - ein durchlaufendes Bild   { image, y, speed }      z. B. Wald – zieht mit Perspektive vorbei
// - ein stehendes Bild        { image, x, y }          z. B. der Turm in der Mitte des Kreises
// - der Himmel                { image, y, turning }    dreht sich einmal pro Runde mit
// - ein Ding am Himmel        { image, y, bearing }    z. B. der Mond – wandert, weil der Zug im Kreis fährt
// - eine Frame-Animation      { animation, y }         flach, ohne Perspektive (für eigene gemalte Frames)
//
// PERSPEKTIVE: Das Abteil ist zentral auf einen Fluchtpunkt hin gezeichnet (hinten an der Tür).
// Die Fenster nahe am Fluchtpunkt sind weit weg – durch sie sieht die Landschaft kleiner aus und
// zieht langsamer vorbei. Durch die vorderen, großen Fenster wirkt sie größer und rauscht schneller.
// Dafür wird jedes Fenster in schmale senkrechte Streifen zerlegt, und jeder Streifen bekommt
// seinen eigenen Maßstab. Ein Mast wandert so von Fenster zu Fenster, wird dabei größer und schneller.
//
// Die linke Wagenseite wird so berechnet, die rechte ist dieselbe Rechnung gespiegelt.

const BAND = { top: 80, height: 240 }; // nur in diesem waagerechten Band liegen Fenster
const TUNNEL_SLICE = 2;        // Breite der Streifen, in denen der Tunnel geprüft und gezeichnet wird
const RIGHT_SIDE_SHIFT = 0.37; // die rechte Seite zeigt einen anderen Teil der Landschaft (Anteil der Bildbreite)
const LANTERN_HEIGHT = 112;    // Höhe der Laternen draußen (y beim Referenzabstand)
const TUNNEL_LAMP_HEIGHT = 175;
const TUNNEL_STREAKS = [128, 166, 238, 262]; // vorbeiwischende Fugen der Tunnelwand (y beim Referenzabstand)

export class OutsideView {
  constructor({ vanishingPoint, referenceDistance, windows, layers, windowLight }) {
    this.vanishingPoint = vanishingPoint;
    this.referenceDistance = referenceDistance;
    this.windows = windows.map((window) => ({ ...window, side: window.to <= vanishingPoint.x ? 'left' : 'right', light: 1 }));
    this.layers = layers.map((layer) => ({ ...layer }));
    this.windowLight = windowLight;
    this.train = STANDING;
    this.time = 0;
  }

  async load() {
    await Promise.all(
      this.layers.map(async (layer) => {
        if (layer.image) {
          layer.picture = await loadImage(layer.image);
        } else {
          const animation = await loadAnimation(layer.animation);
          // Jede Wagenseite bekommt einen eigenen Abspieler, damit nicht beide Seiten gleich aussehen.
          const offset = Math.floor(animation.frames.length / 2);
          layer.players = [new AnimationPlayer(animation), new AnimationPlayer(animation, { startFrame: offset })];
        }
      }),
    );
    // Die nächste Ebene (die schnellste) wirft Schatten: Wenn ein Stamm vorbeirauscht, wird es am Fenster kurz dunkler.
    this.nearLayer = this.layers.filter((layer) => layer.speed).sort((a, b) => b.speed - a.speed)[0];
    if (this.nearLayer) this.nearLayer.shadow = measureShadow(this.nearLayer.picture);
    // Einmal rundherum (360°) = Breite des Himmelsbildes. Daran hängt, wie schnell der Mond wandert.
    const sky = this.layers.find((layer) => layer.turning);
    this.pixelsPerDegree = (sky?.picture.width ?? 1024) / 360;
  }

  // train: der fahrende Zug (siehe trainMotion.js) – woher die Außenwelt weiß, wie weit er schon ist
  update(dt, train) {
    this.time += dt;
    this.train = train ?? STANDING;
    for (const layer of this.layers) {
      for (const player of layer.players ?? []) {
        player.speed = this.train.speed;
        player.update(dt);
      }
    }
    this.updateWindowLight(dt);
  }

  // ---------------------------------------------------------------- Zeichnen (hinter dem Hintergrund)
  // Die Außenwelt entsteht zuerst in einem eigenen Zwischenbild, in dem alle Streifen genau auf
  // ganzen Pixeln liegen (sonst gäbe es feine Nähte). Erst das fertige Bild wird geneigt und verschoben.
  draw(ctx) {
    const buffer = this.prepareBuffer(ctx);
    const outside = buffer.getContext('2d');
    const zoom = buffer.width / GAME_WIDTH;
    outside.setTransform(zoom, 0, 0, zoom, 0, -BAND.top * zoom);
    outside.clearRect(0, BAND.top, GAME_WIDTH, BAND.height);
    this.drawWorld(outside);

    // Der Wagen schaukelt und federt – draußen bewegt sich die Welt deshalb leicht gegen die Fensterrahmen.
    const { x: vx, y: vy } = this.vanishingPoint;
    ctx.save();
    ctx.translate(vx, vy + this.train.bob);
    ctx.rotate(this.train.roll);
    ctx.translate(-vx, -vy);
    ctx.drawImage(buffer, 0, BAND.top, GAME_WIDTH, BAND.height);
    ctx.restore();
  }

  // Zwischenbild in ganzzahliger Vergrößerung (1× oder 2×, je nach Bildschirm)
  prepareBuffer(ctx) {
    const zoom = Math.min(2, Math.max(1, Math.round(ctx.getTransform().a)));
    if (this.buffer?.width !== GAME_WIDTH * zoom) {
      this.buffer = document.createElement('canvas');
      this.buffer.width = GAME_WIDTH * zoom;
      this.buffer.height = BAND.height * zoom;
    }
    return this.buffer;
  }

  drawWorld(ctx) {
    for (const layer of this.layers) {
      if (layer.turning) {
        this.drawSky(ctx, layer);
      } else if (layer.bearing !== undefined) {
        this.drawSkyObject(ctx, layer);
      } else if (layer.animation) {
        this.forEachSide(ctx, (windows, side) => layer.players[side === 'left' ? 0 : 1].draw(ctx, 0, layer.y));
      } else if (layer.speed === undefined) {
        this.drawStanding(ctx, layer);
      } else {
        this.forEachSide(ctx, (windows, side) => windows.forEach((window) => this.drawPassing(ctx, layer, window, side)));
      }
    }

    this.forEachSide(ctx, (windows, side) => {
      for (const window of windows) {
        this.drawLanterns(ctx, window, side);
        this.drawTunnel(ctx, window, side);
      }
    });
  }

  // Ruft draw(windows, side) einmal für die linke und einmal für die rechte Seite auf. Die rechte Seite
  // wird gespiegelt gezeichnet: Dann gilt für beide dieselbe Rechnung (Fluchtpunkt rechts vom Fenster).
  forEachSide(ctx, draw) {
    const mirrorX = 2 * this.vanishingPoint.x;
    draw(this.windows.filter((window) => window.side === 'left'), 'left');

    ctx.save();
    ctx.translate(mirrorX, 0);
    ctx.scale(-1, 1);
    const mirrored = this.windows
      .filter((window) => window.side === 'right')
      .map((window) => ({ ...window, from: mirrorX - window.to, to: mirrorX - window.from }));
    draw(mirrored, 'right');
    ctx.restore();
  }

  // Durchlaufendes Bild mit Perspektive, Streifen für Streifen.
  // Ein Streifen im Abstand d vom Fluchtpunkt zeigt die Landschaft im Maßstab d / Referenzabstand.
  drawPassing(ctx, layer, window, side) {
    const { x: vx, y: vy } = this.vanishingPoint;
    const ref = this.referenceDistance;
    const { picture, speed, y } = layer;
    const scroll = this.train.distance * speed + (side === 'right' ? RIGHT_SIDE_SHIFT * picture.width : 0);
    const step = sliceWidth(speed, window.to - window.from);
    for (let x = window.from; x < window.to; x += step) {
      const right = Math.min(x + step, window.to);
      // Wo im Bildstreifen liegen die linke und die rechte Kante dieses Streifens?
      const sourceFrom = (ref * ref) / (vx - x) + scroll;
      const sourceTo = (ref * ref) / (vx - right) + scroll;
      const scale = (vx - (x + right) / 2) / ref;
      const top = vy + (y - vy) * scale; // um den Horizont herum vergrößert bzw. verkleinert
      drawWrapped(ctx, picture, sourceFrom, sourceTo - sourceFrom, x, top, right - x, picture.height * scale);
    }
  }

  // Der Himmel steht nicht still: Weil der Zug im Kreis fährt, dreht er sich einmal pro Runde.
  drawSky(ctx, layer) {
    for (const window of this.windows) {
      const start = window.from - this.skyOffset(window.side);
      drawWrapped(ctx, layer.picture, start, window.to - window.from, window.from, layer.y, window.to - window.from, layer.picture.height);
    }
  }

  // Ein einzelnes Ding am Himmel (der Mond) in Richtung "bearing" (Grad).
  // Es wandert mit dem Himmel und taucht nacheinander in allen Fenstern auf.
  drawSkyObject(ctx, layer) {
    const { x: vx } = this.vanishingPoint;
    const ref = this.referenceDistance;
    // Richtung vom Zug aus: 0° = geradeaus, 90° = links, −90° = rechts, ±180° = hinten
    const relative = mod(layer.bearing - this.train.heading + 180, 360) - 180;
    const x = relative > 0
      ? vx - ref - (relative - 90) * this.pixelsPerDegree
      : vx + ref + (-relative - 90) * this.pixelsPerDegree;
    ctx.drawImage(layer.picture, x - layer.picture.width / 2, layer.y - layer.picture.height / 2);
  }

  // Wohin der Himmel auf einer Seite gerade verschoben ist. Genau seitlich (90°) blickt man im
  // Referenzabstand vom Fluchtpunkt hinaus.
  skyOffset(side) {
    const { x: vx } = this.vanishingPoint;
    const ref = this.referenceDistance;
    const sideways = side === 'left' ? vx - ref + 90 * this.pixelsPerDegree : vx + ref - 90 * this.pixelsPerDegree;
    return sideways + this.train.heading * this.pixelsPerDegree;
  }

  // Steht still – nur in den Fenstern zu sehen. Optional mit blinkendem Licht (z. B. auf dem Turm).
  drawStanding(ctx, layer) {
    ctx.drawImage(layer.picture, layer.x, layer.y);
    if (!layer.blink) return;
    const { x, y, color, every } = layer.blink;
    const phase = (this.time % every) / every;
    const on = phase < 0.2 ? Math.sin((Math.PI * phase) / 0.2) : 0; // kurz aufleuchten, dann lange dunkel
    if (on > 0) {
      glow(ctx, layer.x + x, layer.y + y, 16, color, 0.55 * on, 'lighter');
      glow(ctx, layer.x + x, layer.y + y, 2.5, [255, 210, 200], on, 'lighter');
    }
  }

  // Laternen an der Strecke: Ihr Licht kommt am Fluchtpunkt herein und huscht dann immer schneller nach außen.
  drawLanterns(ctx, window, side) {
    const { lanterns, lapLength } = this.train;
    if (!this.nearLayer || !lanterns) return;
    for (const lantern of lanterns) {
      if (lantern.side !== side) continue;
      const ahead = mod(lantern.at - this.train.distance, lapLength); // Fahrsekunden bis zur Laterne
      this.drawPassingLight(ctx, window, ahead, LANTERN_HEIGHT, 120, [225, 232, 255], 0.75);
    }
  }

  // Im Tunnel: dunkle Wand mit vorbeiwischenden Fugen statt Landschaft, links eine Reihe Lampen.
  drawTunnel(ctx, window, side) {
    const train = this.train;
    if (!this.nearLayer || !train.tunnelAt) return;
    const { x: vx, y: vy } = this.vanishingPoint;
    const ref = this.referenceDistance;
    let wall = null;
    for (let x = window.from; x < window.to; x += TUNNEL_SLICE) {
      const distance = vx - x - TUNNEL_SLICE / 2;
      if (!train.tunnelAt(train.distance + this.aheadAt(distance))) continue;
      if (!wall) {
        // Fast schwarz – nur oben spiegeln sich schwach die warmen Lampen des Abteils in der Scheibe.
        wall = ctx.createLinearGradient(0, window.top, 0, window.bottom);
        wall.addColorStop(0, '#1e1214');
        wall.addColorStop(0.35, '#09070f');
        wall.addColorStop(1, '#07050c');
      }
      const scale = distance / ref;
      ctx.fillStyle = wall;
      ctx.fillRect(x, window.top - 12, TUNNEL_SLICE, window.bottom - window.top + 24);
      ctx.fillStyle = 'rgba(70, 60, 90, 0.35)';
      for (const streak of TUNNEL_STREAKS) ctx.fillRect(x, vy + (streak - vy) * scale, TUNNEL_SLICE, Math.max(1, 2 * scale));
    }
    if (side !== 'left') return;
    const { every } = train.tunnelLamps;
    const first = Math.ceil((train.distance + this.aheadAt(vx - window.from)) / every) * every;
    for (let at = first; at - train.distance < this.aheadAt(vx - window.to); at += every) {
      if (train.tunnelAt(at)) this.drawPassingLight(ctx, window, at - train.distance, TUNNEL_LAMP_HEIGHT, 34, [255, 170, 80], 0.9);
    }
  }

  // Ein Licht direkt an der Strecke, "ahead" Fahrsekunden voraus: wo und wie groß es im Fenster erscheint.
  drawPassingLight(ctx, window, ahead, height, radius, color, strength) {
    if (ahead <= 0) return;
    const { x: vx, y: vy } = this.vanishingPoint;
    const ref = this.referenceDistance;
    const distance = (ref * ref) / (ahead * this.nearLayer.speed);
    const x = vx - distance;
    if (x < window.from - radius || x > window.to + radius) return;
    const scale = distance / ref;
    glow(ctx, x, vy + (height - vy) * scale, radius * scale, color, strength, 'lighter');
  }

  // Wie viele Fahrsekunden voraus man durch einen Streifen im Abstand d vom Fluchtpunkt sieht
  // (gemessen an der nächsten Ebene: Masten, Stämme, Tunnelwand).
  aheadAt(distance) {
    const ref = this.referenceDistance;
    return (ref * ref) / (distance * this.nearLayer.speed);
  }

  // ---------------------------------------------------------------- Fensterlicht (vor dem Hintergrund)
  // Kaltes Mondlicht fällt durch die Fenster auf Wände und Sitze. Rauscht draußen ein Stamm vorbei,
  // flackert es kurz dunkel; im Tunnel ist es ganz weg.
  updateWindowLight(dt) {
    const near = this.nearLayer;
    if (!near || !this.windowLight) return;
    const { x: vx } = this.vanishingPoint;
    const ref = this.referenceDistance;
    for (const window of this.windows) {
      const distance = window.side === 'left' ? vx - (window.from + window.to) / 2 : (window.from + window.to) / 2 - vx;
      const shift = window.side === 'right' ? RIGHT_SIDE_SHIFT * near.picture.width : 0;
      const at = (ref * ref) / distance + this.train.distance * near.speed + shift;
      const shade = near.shadow[Math.floor(mod(at, near.shadow.length))];
      const target = (1 - 0.8 * shade) * (1 - this.train.tunnel);
      window.light += (target - window.light) * Math.min(1, dt * 25);
    }
  }

  drawLight(ctx) {
    if (!this.windowLight) return;
    const { color, strength } = this.windowLight;
    for (const window of this.windows) {
      const height = window.bottom - window.top;
      const x = (window.from + window.to) / 2;
      glow(ctx, x, window.top + height * 0.6, height * 0.9, color, strength * window.light, 'screen');
    }
  }
}

// Solange keine Zugdaten da sind: ein stehender Zug.
const STANDING = { distance: 0, speed: 0, heading: 0, roll: 0, bob: 0, tunnel: 0 };

// Wie fein die Perspektive gerechnet wird: Schnelle, nahe Ebenen (Masten, Leitungen) brauchen
// schmale Streifen, mittlere (Wald) breitere. Ferne, langsame Ebenen bekommen einen einzigen
// Maßstab pro Fenster – da sieht man keinen Unterschied, spart aber viel Rechenzeit.
function sliceWidth(speed, windowWidth) {
  if (speed >= 500) return 3;
  if (speed >= 100) return 6;
  return windowWidth;
}

// Zeichnet einen Ausschnitt eines endlos wiederholten Bildes. Läuft der Ausschnitt über den
// rechten Bildrand hinaus, wird der Rest vom linken Bildrand genommen.
function drawWrapped(ctx, picture, sourceX, sourceWidth, x, y, width, height) {
  const start = mod(sourceX, picture.width);
  const first = Math.min(sourceWidth, picture.width - start);
  const firstWidth = (width * first) / sourceWidth;
  ctx.drawImage(picture, start, 0, first, picture.height, x, y, firstWidth, height);
  if (first < sourceWidth) {
    ctx.drawImage(picture, 0, 0, sourceWidth - first, picture.height, x + firstWidth, y, width - firstWidth, height);
  }
}

// Wie stark verdeckt jede Spalte des Bildes die Sicht? 0 = frei, 1 = ganz verdeckt.
// Gemessen wird nur die obere Hälfte (Stämme und Masten), nicht Büsche und Schnee am Boden.
function measureShadow(picture) {
  const canvas = document.createElement('canvas');
  canvas.width = picture.width;
  canvas.height = picture.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(picture, 0, 0);
  const { data } = context.getImageData(0, 0, picture.width, picture.height);
  const shadow = new Float32Array(picture.width);
  const rows = Math.floor(picture.height / 2);
  for (let x = 0; x < picture.width; x++) {
    let sum = 0;
    for (let y = 0; y < rows; y++) sum += data[(y * picture.width + x) * 4 + 3];
    shadow[x] = sum / (255 * rows);
  }
  return shadow;
}

// Weicher, runder Lichtschein
function glow(ctx, x, y, radius, [r, g, b], alpha, blend) {
  if (alpha <= 0 || radius <= 0) return;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function mod(value, length) {
  return ((value % length) + length) % length;
}
