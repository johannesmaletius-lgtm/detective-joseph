// Spielt eine geladene Animation ab (siehe animation.js).
//
// Beispiel:
//   const noise = new AnimationPlayer(await loadAnimation('tv-noise'));
//   noise.update(dt);                     // in jedem Bild: Zeit weiterlaufen lassen
//   noise.draw(ctx, x, y, width, height); // aktuelles Bild zeichnen
//
// Steuerung: play(), stop(), restart(), speed (1 = normal, 2 = doppelt so schnell),
// onEnd = Funktion, die aufgerufen wird, wenn eine einmalige Animation fertig ist.
export class AnimationPlayer {
  constructor(animation, { playing = true, speed = 1, startFrame = 0 } = {}) {
    this.animation = animation;
    this.playing = playing;
    this.speed = speed;
    this.time = startFrame / animation.fps;
    this.finished = false;
    this.onEnd = null;
  }

  play() {
    this.playing = true;
  }

  stop() {
    this.playing = false;
  }

  restart() {
    this.time = 0;
    this.finished = false;
    this.playing = true;
  }

  // Wechselt zu einer anderen Animation. keepPhase = an derselben Stelle im Ablauf weitermachen
  // (z. B. wenn Joseph beim Laufen die Richtung ändert, damit die Beine nicht springen).
  setAnimation(animation, { keepPhase = false } = {}) {
    if (animation === this.animation) return;
    this.animation = animation;
    if (!keepPhase) this.restart();
  }

  get duration() {
    return this.animation.frames.length / this.animation.fps;
  }

  get frameIndex() {
    const { frames, fps, loop } = this.animation;
    const index = Math.floor(this.time * fps + 1e-6);
    return loop ? index % frames.length : Math.min(index, frames.length - 1);
  }

  get image() {
    return this.animation.frames[this.frameIndex];
  }

  update(dt) {
    if (!this.playing || this.finished) return;
    this.time += dt * this.speed;
    if (this.animation.loop) {
      this.time %= this.duration;
    } else if (this.time >= this.duration) {
      this.finished = true;
      this.onEnd?.();
    }
  }

  // Zeichnet das aktuelle Bild. Ohne Breite/Höhe in Originalgröße.
  draw(ctx, x, y, width = this.image.width, height = this.image.height) {
    ctx.drawImage(this.image, x, y, width, height);
  }
}
