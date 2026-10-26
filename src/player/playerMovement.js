// Bewegt Joseph Schritt für Schritt entlang eines Weges (einer Liste von Wegpunkten).
//
// Das Tempo wird in "Körpergrößen pro Sekunde" angegeben: Steht Joseph weiter hinten
// im Raum, ist er kleiner und bewegt sich auf dem Bildschirm entsprechend langsamer.
// WALK_SPEED passt zur Schrittlänge der Laufanimation – so rutschen die Füße nicht über
// den Boden. Wer es ändert, sollte die fps der Laufanimation anpassen (tools/make-joseph-walk.mjs
// rechnet den passenden Wert aus).
export const WALK_SPEED = 0.7;
export const RUN_SPEED = 1.6;

export class PlayerMovement {
  constructor() {
    this.path = [];
    this.running = false;
  }

  get isMoving() {
    return this.path.length > 0;
  }

  setPath(path, running) {
    this.path = path;
    this.running = running;
  }

  stop() {
    this.path = [];
  }

  // Bewegt Joseph für die Zeit dt weiter.
  // Gibt die neue Blickrichtung zurück ('left', 'right', 'front', 'back') oder null.
  update(dt, player, scene) {
    if (!this.isMoving) return null;

    const { verticalSpeed } = scene.data.perspective;
    const speed = this.running ? RUN_SPEED : WALK_SPEED;
    let stepLeft = scene.characterHeightAt(player.y) * speed * dt; // so weit darf er in diesem Bild
    let facing = null;

    while (stepLeft > 0 && this.path.length > 0) {
      const target = this.path[0];
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      // Nach vorne/hinten ist der Weg im Raum länger, als er auf dem Bildschirm aussieht
      // → senkrechte Bewegungen zählen stärker und werden dadurch langsamer.
      const length = Math.hypot(dx, dy / verticalSpeed);
      if (length > 3) facing = facingFor(dx, dy); // winzige Reststücke ändern die Richtung nicht

      if (length <= stepLeft) {
        player.x = target.x;
        player.y = target.y;
        stepLeft -= length;
        this.path.shift();
      } else {
        player.x += (dx / length) * stepLeft;
        player.y += (dy / length) * stepLeft;
        stepLeft = 0;
      }
    }
    return facing;
  }
}

function facingFor(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'front' : 'back';
}
