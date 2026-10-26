// Kleiner Webserver für die Entwicklung – ganz ohne zusätzliche Pakete.
//
// Starten:  npm start        (oder: node server.js)
// Öffnen:   http://localhost:8150
//
// Warum ein Server? Das Spiel besteht aus vielen einzelnen JavaScript-Dateien (Modulen).
// Browser laden solche Module aus Sicherheitsgründen nicht direkt von der Festplatte,
// sondern nur über eine Adresse wie http://localhost.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 8150;
const ROOT = dirname(fileURLToPath(import.meta.url)); // der Projektordner

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

const server = http.createServer(async (request, response) => {
  let path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (path.endsWith('/')) path += 'index.html';

  // Nur Dateien aus dem Projektordner ausliefern
  const file = join(ROOT, normalize(path));
  if (!file.startsWith(ROOT)) {
    response.writeHead(403);
    response.end();
    return;
  }

  try {
    const content = await readFile(file);
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': 'no-store', // nach jeder Änderung immer die neueste Version laden
    });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Nicht gefunden: ${path}`);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} ist schon belegt – läuft das Spiel vielleicht schon? Öffne http://localhost:${PORT}`);
  } else {
    throw error;
  }
});

server.listen(PORT, () => {
  console.log(`Detective Joseph läuft auf http://localhost:${PORT}  (Beenden: ctrl + C)`);
});
