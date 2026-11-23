// Lädt Bilder für das Spiel.
//
// Jedes Bild wird nur EINMAL geladen und danach aus dem Zwischenspeicher (Cache)
// wiederverwendet – auch wenn mehrere Szenen oder Objekte dasselbe Bild benutzen.
// Geladen wird erst, wenn eine Szene oder Figur ein Bild wirklich braucht.

const cache = new Map();

export function loadImage(src) {
  if (!cache.has(src)) {
    // Bewusst mit dem "load"-Ereignis statt nur image.decode(): decode() wartet in einem
    // Hintergrund-Tab so lange, bis der Tab sichtbar wird – das Spiel würde dort hängen.
    const loading = new Promise((resolve, reject) => {
      const image = new Image();
      // Gleich nach dem Laden entpacken – sonst passiert das erst beim ersten Zeichnen und das Spiel ruckelt.
      // (Höchstens kurz warten: in einem Hintergrund-Tab würde decode() sonst hängen, siehe oben.)
      image.onload = () => {
        const decoded = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
        Promise.race([decoded, new Promise((done) => setTimeout(done, 500))]).then(() => resolve(image));
      };
      image.onerror = () => {
        cache.delete(src); // beim nächsten Versuch neu laden
        reject(new Error(`Bild nicht gefunden oder defekt: ${src}`));
      };
      image.src = src;
    });
    cache.set(src, loading);
  }
  return cache.get(src);
}

// Lädt mehrere Bilder gleichzeitig.
// Beispiel: loadImages({ front: 'a.png', back: 'b.png' }) → { front: <Bild>, back: <Bild> }
export async function loadImages(sources) {
  const entries = await Promise.all(
    Object.entries(sources).map(async ([name, src]) => [name, await loadImage(src)]),
  );
  return Object.fromEntries(entries);
}
