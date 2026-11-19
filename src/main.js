// Einstiegspunkt: Spiel erzeugen, ersten Wagen laden, loslegen.
// Mit ?wagen=2 (3, 4) in der Adresse beginnt das Spiel gleich in einem späteren Wagen.

import { Game } from './core/game.js';
import { START_WAGON } from './config.js';
import { WAGONS } from './story/wagons.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  await game.loadWagon(WAGONS[START_WAGON] ? START_WAGON : 1);
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
