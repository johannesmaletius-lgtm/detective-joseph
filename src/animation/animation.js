import { loadImage } from '../core/assets.js';
import { ANIMATIONS } from './animations.js';

const loaded = new Map();

// Lädt alle Bilder einer Animation aus dem Katalog (animations.js).
// Jede Animation wird nur einmal geladen – danach kommt sie aus dem Zwischenspeicher.
// Ergebnis: { name, fps, loop, frames: [Bild, Bild, …] }
export function loadAnimation(name) {
  if (!loaded.has(name)) {
    const definition = ANIMATIONS[name];
    if (!definition) throw new Error(`Unbekannte Animation: ${name} (fehlt in src/animation/animations.js)`);

    const sources = Array.from({ length: definition.frameCount }, (_, i) =>
      definition.path.replace('{frame}', String(i + 1).padStart(3, '0')),
    );
    const loading = Promise.all(sources.map(loadImage)).then((frames) => ({
      name,
      fps: definition.fps,
      loop: definition.loop,
      frames,
    }));
    loaded.set(name, loading);
  }
  return loaded.get(name);
}

// Lädt mehrere Animationen gleichzeitig: ['a', 'b'] → { a: …, b: … }
export async function loadAnimations(names) {
  const animations = await Promise.all(names.map(loadAnimation));
  return Object.fromEntries(names.map((name, i) => [name, animations[i]]));
}
