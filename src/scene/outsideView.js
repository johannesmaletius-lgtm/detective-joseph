import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loadImage } from '../core/assets.js';
import { loadAnimation } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';

// Die Außenwelt hinter den Zugfenstern.
//
// Sie wird VOR dem Hintergrundbild gezeichnet und ist nur dort zu sehen, wo das
// Hintergrundbild durchsichtig ist (die ausgeschnittenen Fensterscheiben).
//
// Sie besteht aus Ebenen (von hinten nach vorne). Jede Ebene ist eines von drei Dingen:
// - ein stehendes Bild             { image, x, y }          z. B. Himmel mit Mond
// - ein durchlaufendes Bild        { image, y, speed }      z. B. Wald (Pixel pro Sekunde)
// - eine Frame-Animation           { animation, y }         z. B. vorbeirauschende Stämme
// Nahe Dinge ziehen schneller vorbei als ferne – das erzeugt den Eindruck von Tiefe (Parallaxe).
//
// Die Landschaft zieht auf der linken Wagenseite nach links und auf der rechten nach rechts
// vorbei. Dafür wird die rechte Seite gespiegelt gezeichnet.
export class OutsideView {
  constructor({ sides, layers }) {
    this.sides = sides;
    this.layers = layers.map((layer) => ({ ...layer }));
    this.distance = 0; // wie weit der Zug schon gefahren ist
  }

  async load() {
    await Promise.all(
      this.layers.map(async (layer) => {
        if (layer.image) {
          layer.picture = await loadImage(layer.image);
        } else {
          const animation = await loadAnimation(layer.animation);
          // Jede Wagenseite bekommt einen eigenen Abspieler, damit nicht beide Seiten gleich aussehen.
          layer.players = this.sides.map((side) => new AnimationPlayer(animation, { startFrame: side.frameOffset ?? 0 }));
        }
      }),
    );
  }

  // speed: 1 = volle Fahrt, 0 = Zug steht
  update(dt, speed) {
    this.distance += dt * speed;
    for (const layer of this.layers) {
      for (const player of layer.players ?? []) {
        player.speed = speed;
        player.update(dt);
      }
    }
  }

  draw(ctx) {
    this.sides.forEach((side, sideIndex) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(side.from, 0, side.to - side.from, GAME_HEIGHT);
      ctx.clip();

      for (const layer of this.layers) {
        if (layer.image && layer.speed === undefined) {
          ctx.drawImage(layer.picture, layer.x ?? 0, layer.y); // steht still, wird nicht gespiegelt
          continue;
        }
        ctx.save();
        // Bereich der Seite in "ungespiegelten" Koordinaten
        let from = side.from;
        let to = side.to;
        if (side.mirror) {
          ctx.translate(GAME_WIDTH, 0);
          ctx.scale(-1, 1);
          [from, to] = [GAME_WIDTH - side.to, GAME_WIDTH - side.from];
        }
        if (layer.image) {
          // durchlaufendes Bild: nebeneinander wiederholen und verschieben
          const width = layer.picture.width;
          const shift = (this.distance * layer.speed + (side.phase ?? 0)) % width;
          for (let x = from - shift; x < to; x += width) ctx.drawImage(layer.picture, Math.floor(x), layer.y);
        } else {
          layer.players[sideIndex].draw(ctx, from, layer.y);
        }
        ctx.restore();
      }
      ctx.restore();
    });
  }
}
