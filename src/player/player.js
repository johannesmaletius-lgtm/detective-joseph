import { loadAnimations } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';
import { PlayerMovement, RUN_SPEED, WALK_SPEED } from './playerMovement.js';

// So groß (in Pixeln) ist Joseph in seinen Bilddateien – daraus wird der Maßstab berechnet.
// Regeln für eigene PNGs (Stehen und Laufen): gleicher Maßstab in allen Bildern, die Füße
// berühren den unteren Bildrand, die Figur steht waagerecht in der Mitte, Hintergrund transparent.
const SPRITE_HEIGHT = 720;

const DIRECTIONS = ['front', 'back', 'left', 'right'];

// Joseph – die Spielfigur.
//
// Er hat für jede Blickrichtung zwei Animationen (siehe src/animation/animations.js):
// "joseph-idle-…" (steht) und "joseph-walk-…" (läuft, 8 Bilder). Beim Rennen läuft
// dieselbe Laufanimation einfach schneller ab.
export class Player {
  constructor() {
    this.x = 0; // Position der FÜSSE in der Spielwelt
    this.y = 0;
    this.facing = 'front';
    this.movement = new PlayerMovement();
    this.animations = null;
    this.animator = null;
  }

  async load() {
    if (this.animations) return;
    const names = DIRECTIONS.flatMap((direction) => [`joseph-idle-${direction}`, `joseph-walk-${direction}`]);
    this.animations = await loadAnimations(names);
    this.animator = new AnimationPlayer(this.animations['joseph-idle-front']);
  }

  enterScene(scene) {
    const start = scene.data.playerStart;
    this.x = start.x;
    this.y = start.y;
    this.facing = start.facing ?? 'front';
    this.movement.stop();
    this.updateAnimation();
  }

  // Joseph soll zu einem Punkt laufen. Liegt der Punkt nicht auf dem Boden, läuft er
  // so nah wie möglich heran. Gibt zurück, wo er tatsächlich ankommen wird.
  walkTo(point, walkArea, running = false) {
    const path = walkArea.findPath({ x: this.x, y: this.y }, point);
    this.movement.setPath(path, running);
    return path.length > 0 ? path[path.length - 1] : { x: this.x, y: this.y };
  }

  update(dt, scene) {
    const facing = this.movement.update(dt, this, scene);
    if (facing) this.facing = facing;
    this.updateAnimation();
    this.animator.update(dt);
  }

  // Passende Animation wählen: stehen oder laufen, in der aktuellen Blickrichtung.
  updateAnimation() {
    const walking = this.movement.isMoving;
    const animation = this.animations[`joseph-${walking ? 'walk' : 'idle'}-${this.facing}`];
    // Beim Richtungswechsel im Laufen an derselben Stelle im Schritt weitermachen
    const wasWalking = this.animator.animation.name.startsWith('joseph-walk');
    this.animator.setAnimation(animation, { keepPhase: walking && wasWalking });
    this.animator.speed = walking && this.movement.running ? RUN_SPEED / WALK_SPEED : 1;
  }

  draw(ctx, scene) {
    const height = scene.characterHeightAt(this.y);
    const scale = height / SPRITE_HEIGHT;
    const image = this.animator.image;
    const width = image.width * scale;
    const drawHeight = image.height * scale;

    this.drawShadow(ctx, height);
    ctx.drawImage(image, this.x - width / 2, this.y - drawHeight, width, drawHeight);
  }

  // Weicher, flacher Schatten unter den Füßen
  drawShadow(ctx, height) {
    const radius = height * 0.17;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(1, 0.24);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    gradient.addColorStop(0, 'rgba(20, 8, 2, 0.5)');
    gradient.addColorStop(1, 'rgba(20, 8, 2, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
