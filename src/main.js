// Einstiegspunkt: Spiel erzeugen, Wagenübersicht zeigen, loslegen.

import { Game } from './core/game.js';
import { installTouchText } from './core/touch.js';
import { setupDevice } from './core/device.js';

installTouchText(); // mit dem Finger: „tippen“ statt „klicken“ in allen Texten (src/core/touch.js)
setupDevice();      // iPad: Ton, Bildschirm wach, Hinweis „Zum Home-Bildschirm“

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
