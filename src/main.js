// Einstiegspunkt: Spiel erzeugen, erste Szene mit ihrer Geschichte laden, loslegen.

import { Game } from './core/game.js';
import { trainCompartment } from './scene/trainCompartment.js';
import { wagon1 } from './story/wagon1.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  await game.loadScene(trainCompartment, wagon1);
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
