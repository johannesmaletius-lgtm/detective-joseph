// Katalog aller Frame-Animationen (PNG-Sequenzen) im Spiel.
//
// path:        Speicherort der Bilder – {frame} wird durch 001, 002, 003 … ersetzt
// frameCount:  Anzahl der Bilder
// fps:         Bilder pro Sekunde
// loop:        true = Endlosschleife, false = einmal abspielen, dann auf dem letzten Bild stehen bleiben
//
// Eigene Animation einbauen: Bilder als frame_001.png, frame_002.png … in einen Ordner legen
// und hier einen Eintrag ergänzen. Geladen wird eine Animation erst, wenn sie gebraucht wird.

export const ANIMATIONS = {
  // Kleiner Bildschirm im Zugabteil: schwarz-weißes Rauschen
  'tv-noise': { path: 'assets/animations/tv-noise/frame_{frame}.png', frameCount: 20, fps: 15, loop: true },

  // Derselbe Bildschirm: Rauschen → grün → Totenkopf erscheint → Rauschen (einmal, im Tunnel)
  // Ausgeschnitten aus assets/reference/screen-animation/screen-frames-sheet.webp
  'tv-skull': { path: 'assets/animations/tv-skull/frame_{frame}.png', frameCount: 15, fps: 6, loop: false },

  // Joseph steht (je ein Bild pro Blickrichtung)
  'joseph-idle-front': { path: 'assets/characters/joseph/front.png', frameCount: 1, fps: 1, loop: true },
  'joseph-idle-back': { path: 'assets/characters/joseph/back.png', frameCount: 1, fps: 1, loop: true },
  'joseph-idle-left': { path: 'assets/characters/joseph/left.png', frameCount: 1, fps: 1, loop: true },
  'joseph-idle-right': { path: 'assets/characters/joseph/right.png', frameCount: 1, fps: 1, loop: true },

  // Joseph läuft (8 Bilder = zwei Schritte). Beim Rennen spielt player.js sie schneller ab.
  'joseph-walk-front': { path: 'assets/characters/joseph/walk-front/frame_{frame}.png', frameCount: 8, fps: 10, loop: true },
  'joseph-walk-back': { path: 'assets/characters/joseph/walk-back/frame_{frame}.png', frameCount: 8, fps: 10, loop: true },
  'joseph-walk-left': { path: 'assets/characters/joseph/walk-left/frame_{frame}.png', frameCount: 8, fps: 10, loop: true },
  'joseph-walk-right': { path: 'assets/characters/joseph/walk-right/frame_{frame}.png', frameCount: 8, fps: 10, loop: true },
};
