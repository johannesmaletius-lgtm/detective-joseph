// Einstiegspunkt: Spiel erzeugen, den Wagen mit seiner Geschichte laden, loslegen.

import { Game } from './core/game.js';
import { WAGONS } from './wagons.js';
import { START_WAGON } from './config.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  const number = WAGONS[START_WAGON] ? START_WAGON : 1;
  const wagon = WAGONS[number];
  await game.loadScene(wagon.scene, wagon.script);
  game.wagon = number;
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
