// Einstiegspunkt: Spiel erzeugen, Adventskalender zeigen (oder mit ?teil1 die ältere Fassung), loslegen.

import { Game } from './core/game.js';
import { START_WAGON, TEIL1 } from './config.js';
import { WAGONS } from './story/teil1.js';

const status = document.getElementById('status');

try {
  const game = new Game(document.getElementById('game-canvas'));
  if (TEIL1) await game.loadWagon(WAGONS[START_WAGON] ? START_WAGON : 1);
  else await game.prepare();
  status.hidden = true;
  game.start();

  // Zum Ausprobieren in der Browser-Konsole, z. B.: game.player.x
  window.game = game;
} catch (error) {
  status.textContent = `Das Spiel konnte nicht starten: ${error.message}`;
  console.error(error);
}
