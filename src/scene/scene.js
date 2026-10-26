import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loadImage } from '../core/assets.js';
import { loadAnimation } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';
import { WalkArea } from '../navigation/walkArea.js';
import { TrainMotion } from '../effects/trainMotion.js';
import { OutsideView } from './outsideView.js';

const CLICK_MARKER_DURATION = 0.45; // Sekunden

// Eine Szene = ein Ort im Spiel (z. B. das erste Zugabteil).
//
// Diese Klasse ist für alle Szenen gleich. WAS in einer Szene ist (Hintergrund,
// Laufbereich, Animationen, Startposition …), steht als reine Daten in einer eigenen
// Datei, z. B. src/scene/trainCompartment.js.
export class Scene {
  constructor(data) {
    this.data = data;
    this.walkArea = new WalkArea(data.walkArea);
    this.outside = data.outside ? new OutsideView(data.outside) : null;
    this.motion = data.train
      ? new TrainMotion(data.train, { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches })
      : null;
    this.animations = []; // animierte Stellen im Bild, z. B. der Bildschirm
    this.background = null;
    this.clickMarker = null;
  }

  async load() {
    const spots = this.data.animations ?? [];
    const [background, players] = await Promise.all([
      loadImage(this.data.background.src),
      Promise.all(spots.map(async (spot) => new AnimationPlayer(await loadAnimation(spot.animation)))),
      this.outside?.load(),
    ]);
    this.background = background;
    this.animations = spots.map((spot, i) => ({ ...spot, player: players[i] }));
  }

  // Wie groß (in Pixeln) ist Joseph, wenn seine Füße auf Höhe y stehen?
  // Hinten im Raum (kleines y) wirkt er kleiner, vorne (großes y) größer.
  // Zwischen den beiden Messpunkten "far" und "near" wird gleichmäßig umgerechnet.
  characterHeightAt(y) {
    const { far, near } = this.data.perspective;
    const t = (y - far.y) / (near.y - far.y);
    return Math.max(20, far.height + t * (near.height - far.height));
  }

  // Kleiner Kreis auf dem Boden, der zeigt, wohin Joseph läuft.
  showClickMarker(point) {
    this.clickMarker = { x: point.x, y: point.y, age: 0 };
  }

  update(dt) {
    this.motion?.update(dt);
    this.outside?.update(dt, this.motion?.speed ?? 0);
    for (const spot of this.animations) spot.player.update(dt);

    if (this.clickMarker) {
      this.clickMarker.age += dt;
      if (this.clickMarker.age > CLICK_MARKER_DURATION) this.clickMarker = null;
    }
  }

  // Zeichenreihenfolge: was zuerst gezeichnet wird, liegt hinten.
  draw(ctx, player) {
    // 1) alles, was nur durch die durchsichtigen Stellen des Hintergrunds zu sehen ist
    this.outside?.draw(ctx);
    this.motion?.drawBehind(ctx);
    this.drawAnimations(ctx, 'behind');

    // 2) das Hintergrundbild
    const { x, y, width, height } = this.data.background;
    ctx.drawImage(this.background, x, y, width, height);

    // 3) Dinge davor: Animationen, Lichtschein, Klick-Markierung, Joseph
    this.drawAnimations(ctx, 'front');
    this.drawGlows(ctx);
    this.drawClickMarker(ctx);
    player.draw(ctx, this);

    // 4) Licht und Flackern liegen über allem – auch über Joseph
    this.motion?.drawFront(ctx, GAME_WIDTH, GAME_HEIGHT);
  }

  drawAnimations(ctx, layer) {
    for (const spot of this.animations) {
      if ((spot.layer ?? 'front') === layer) spot.player.draw(ctx, spot.x, spot.y, spot.width, spot.height);
    }
  }

  // Leuchtende Animationen (z. B. der Bildschirm) werfen flackerndes Licht auf ihre Umgebung.
  drawGlows(ctx) {
    for (const spot of this.animations) {
      if (!spot.glow) continue;
      const { x, y, radius, color, strength } = spot.glow;
      const flicker = 0.6 + 0.4 * Math.abs(Math.sin(spot.player.frameIndex * 12.9898)); // je Frame etwas anders
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color}, ${strength * flicker})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    }
  }

  drawClickMarker(ctx) {
    if (!this.clickMarker) return;
    const { x, y, age } = this.clickMarker;
    const progress = age / CLICK_MARKER_DURATION;
    const radius = this.characterHeightAt(y) * (0.05 + 0.05 * progress);

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.translate(x, y);
    ctx.scale(1, 0.4); // flach gedrückt, damit der Kreis auf dem Boden zu liegen scheint
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(20, 10, 4, 0.7)';
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffd36b';
    ctx.stroke();
    ctx.restore();
  }
}
