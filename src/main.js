// Einstiegspunkt: Spiel erzeugen, erste Szene laden, loslegen.

import { Game } from './core/game.js';
import { trainCompartment } from './scene/trainCompartment.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  await game.loadScene(trainCompartment);
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
