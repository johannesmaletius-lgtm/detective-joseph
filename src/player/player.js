import { loadAnimations } from '../animation/animation.js';
import { loadImage } from '../core/assets.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';
import { BodyLife } from '../animation/bodyLife.js';
import { PlayerMovement, RUN_SPEED, WALK_SPEED } from './playerMovement.js';

// So groß (in Pixeln) ist Joseph in seinen Bilddateien – daraus wird der Maßstab berechnet.
// Regeln für eigene PNGs (Stehen und Laufen): gleicher Maßstab in allen Bildern, die Füße
// berühren den unteren Bildrand, die Figur steht waagerecht in der Mitte, Hintergrund transparent.
const SPRITE_HEIGHT = 720;

const DIRECTIONS = ['front', 'back', 'left', 'right'];

// Zusatzposen von vorn (assets/characters/joseph/pose-….png, gleicher Maßstab wie front.png).
// Sie machen Joseph beim Herumstehen lebendig: atmen, blinzeln, ab und zu nachdenken.
const POSES = [
  'neutral', 'blinzeln', 'sprechen', 'denken', 'zeigen',
  'links-blinzeln', 'links-sprechen', 'rechts-blinzeln', 'rechts-sprechen', // von der Seite (nur Blinzeln und Sprechen)
];
const SIDE_NAMES = { left: 'links', right: 'rechts' };
const BREATH_SECONDS = 3.6;   // ein Atemzug
const BREATH_AMOUNT = 0.009;  // wie stark sich der Oberkörper hebt (Anteil der Höhe)
const BLINK_SECONDS = [0.1, 0.18];
const THINK_AFTER = [9, 16];  // so lange (Sekunden, zufällig) steht er still, bevor er nachdenkt
const THINK_SECONDS = 2.8;

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
    this.images = {};
    this.talking = false;     // true, solange Joseph spricht (zeigt die Pose "sprechen")
    this.gesture = null;      // { pose, left } – eine Pose, die kurz gezeigt wird
    this.idleTime = 0;        // wie lange er schon steht
    this.life = new BodyLife({ breathSeconds: BREATH_SECONDS, breathAmount: BREATH_AMOUNT, sway: 0.003 });
    this.nextBlink = 2;
    this.blinkLeft = 0;
    this.nextThink = this.randomThinkDelay();
  }

  randomThinkDelay() {
    return THINK_AFTER[0] + Math.random() * (THINK_AFTER[1] - THINK_AFTER[0]);
  }

  // Zeigt eine Pose kurz (z. B. player.showPose('zeigen', 2) beim Hinzeigen) – nur beim Stehen, von vorn.
  showPose(pose, seconds = 2) {
    this.gesture = { pose, left: seconds };
  }

  async load() {
    if (this.animations) return;
    const names = DIRECTIONS.flatMap((direction) => [`joseph-idle-${direction}`, `joseph-walk-${direction}`]);
    this.animations = await loadAnimations(names);
    this.animator = new AnimationPlayer(this.animations['joseph-idle-front']);
    const entries = await Promise.all(POSES.map(async (pose) => [pose, await loadImage(`assets/characters/joseph/pose-${pose}.png`)]));
    this.images = Object.fromEntries(entries);
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
    this.updateIdle(dt);
  }

  // Kleine Lebenszeichen beim Stehen: Atmen läuft immer, Blinzeln und Sprechen von vorn und von der Seite, Nachdenken nur von vorn.
  updateIdle(dt) {
    const moving = this.movement.isMoving;
    const direction = moving ? { left: -1, right: 1 }[this.facing] ?? 0 : 0;
    this.life.update(dt, { moving, running: moving && this.movement.running, talking: this.talking, direction });
    if (this.movement.isMoving) {
      this.idleTime = 0;
      this.gesture = null;
      this.blinkLeft = 0;
      this.lastFacing = this.facing;
      return;
    }
    this.idleTime += dt;
    if (this.facing !== this.lastFacing) this.blinkLeft = 0.12; // beim Umdrehen im Stehen blinzelt man fast immer
    this.lastFacing = this.facing;
    if (this.blinkLeft > 0) this.blinkLeft -= dt;
    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blinkLeft = BLINK_SECONDS[0] + Math.random() * (BLINK_SECONDS[1] - BLINK_SECONDS[0]);
      this.nextBlink = 2 + Math.random() * 4.5;
      if (Math.random() < 0.2) this.nextBlink = 0.35; // manchmal zweimal hintereinander
    }
    if (this.gesture) {
      this.gesture.left -= dt;
      if (this.gesture.left <= 0) this.gesture = null;
    }
    this.nextThink -= dt;
    if (this.nextThink <= 0) {
      this.nextThink = this.randomThinkDelay();
      if (!this.talking && !this.gesture && this.facing === 'front') this.showPose('denken', THINK_SECONDS);
    }
  }

  // Welches Bild gerade gezeigt wird: beim Stehen von vorn eine der Zusatzposen, sonst die Animation
  currentImage() {
    if (this.movement.isMoving || !this.images.neutral) return this.animator.image;
    const side = SIDE_NAMES[this.facing];
    if (side) {
      if (this.talking) return this.images[`${side}-sprechen`];
      if (this.blinkLeft > 0) return this.images[`${side}-blinzeln`];
      return this.animator.image;
    }
    if (this.facing !== 'front') return this.animator.image; // von hinten: nur atmen
    if (this.talking) return this.images.sprechen;
    if (this.gesture) return this.images[this.gesture.pose] ?? this.images.neutral;
    if (this.blinkLeft > 0) return this.images.blinzeln;
    return this.images.neutral;
  }

  // Passende Animation wählen: stehen oder laufen, in der aktuellen Blickrichtung.
  updateAnimation() {
    const walking = this.movement.isMoving;
    const animation = this.animations[`joseph-${walking ? 'walk' : 'idle'}-${this.facing}`];
    // Beim Richtungswechsel im Laufen an derselben Stelle im Schritt weitermachen
    const wasWalking = this.animator.animation.name.startsWith('joseph-walk');
    this.animator.setAnimation(animation, { keepPhase: walking && wasWalking });
    // Die Beine bewegen sich so schnell, wie Joseph gerade wirklich geht (auch beim Anlaufen und Abbremsen)
    this.animator.speed = walking ? this.movement.speed / WALK_SPEED : 1;
  }

  draw(ctx, scene) {
    const height = scene.characterHeightAt(this.y);
    const scale = height / SPRITE_HEIGHT;
    const image = this.currentImage();
    const width = image.width * scale;
    const drawHeight = image.height * scale;

    this.drawShadow(ctx, height);
    // Atmen, Gewicht verlagern, Nicken, Lehnen (src/animation/bodyLife.js) – die Füße bleiben stehen
    ctx.save();
    ctx.translate(this.x, this.y);
    this.life.apply(ctx);
    ctx.drawImage(image, -width / 2, -drawHeight, width, drawHeight);
    ctx.restore();
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
