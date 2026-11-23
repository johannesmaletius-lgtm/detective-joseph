// Einstiegspunkt: Spiel erzeugen, Adventskalender zeigen, loslegen.

import { Game } from './core/game.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  await game.prepare();
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
