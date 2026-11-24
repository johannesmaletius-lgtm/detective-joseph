// Bewegt Joseph Schritt für Schritt entlang eines Weges (einer Liste von Wegpunkten).
//
// Das Tempo wird in "Körpergrößen pro Sekunde" angegeben: Steht Joseph weiter hinten
// im Raum, ist er kleiner und bewegt sich auf dem Bildschirm entsprechend langsamer.
// WALK_SPEED passt zur Schrittlänge der Laufanimation – so rutschen die Füße nicht über
// den Boden. Wer es ändert, sollte die fps der Laufanimation anpassen (tools/make-joseph-walk.mjs
// rechnet den passenden Wert aus).
export const WALK_SPEED = 0.7;
export const RUN_SPEED = 1.6;
// Anlaufen und Abbremsen: niemand steht sofort in vollem Tempo und bleibt auf der Stelle stehen.
const ACCELERATE = 0.22;    // Sekunden bis zum vollen Tempo
const BRAKE_DISTANCE = 0.25; // ab so viel Rest-Strecke (in Körpergrößen) wird langsamer gegangen
const MIN_FACTOR = 0.45;    // langsamer als das wird es dabei nicht (sonst schleicht er die letzten Zentimeter)

export class PlayerMovement {
  constructor() {
    this.path = [];
    this.running = false;
    this.factor = 0;        // 0 … 1, Anteil des vollen Tempos (wächst beim Anlaufen)
    this.speed = 0;         // aktuelles Tempo in Körpergrößen pro Sekunde (für die Laufanimation)
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
    this.factor = 0;
    this.speed = 0;
  }

  // Wie weit es noch bis zum Ziel ist (senkrecht wie unten gewichtet)
  remaining(player, verticalSpeed) {
    let total = 0;
    let from = player;
    for (const point of this.path) {
      total += Math.hypot(point.x - from.x, (point.y - from.y) / verticalSpeed);
      from = point;
    }
    return total;
  }

  // Bewegt Joseph für die Zeit dt weiter.
  // Gibt die neue Blickrichtung zurück ('left', 'right', 'front', 'back') oder null.
  update(dt, player, scene) {
    if (!this.isMoving) {
      this.factor = 0;
      this.speed = 0;
      return null;
    }

    const { verticalSpeed } = scene.data.perspective;
    const height = scene.characterHeightAt(player.y);
    const full = this.running ? RUN_SPEED : WALK_SPEED;
    // Anlaufen, und vor dem Ziel abbremsen (nur am Ende des ganzen Weges, nicht an jeder Ecke)
    this.factor = Math.min(1, this.factor + dt / ACCELERATE);
    const brake = Math.max(MIN_FACTOR, Math.min(1, this.remaining(player, verticalSpeed) / (height * BRAKE_DISTANCE * (full / WALK_SPEED))));
    const factor = Math.max(MIN_FACTOR, Math.min(this.factor, brake));
    this.speed = full * factor;
    let stepLeft = height * this.speed * dt; // so weit darf er in diesem Bild
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
