// Zentrale Einstellungen des Spiels.

// Logische Auflösung: Alle Koordinaten im Spiel beziehen sich auf 1280 × 720 –
// egal wie groß das Browserfenster ist. Das Bild wird nur passend skaliert.
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Doppelklick: zwei Klicks innerhalb dieser Zeit (Millisekunden) und
// dieses Abstands (Pixel) zählen als Doppelklick → Joseph rennt.
export const DOUBLE_CLICK = { maxDelay: 350, maxDistance: 30 };

// Tasten
export const KEYS = {
  toggleDebug: 'd', // Laufbereich, Weg und Koordinaten anzeigen
  toggleGrid: 'g',  // Koordinaten-Raster anzeigen
  toggleSound: 'm', // Ton an/aus
  skipToTunnel: 't', // nur in der Debug-Ansicht: Zug springt kurz vor den Tunnel
  notebook: 'n',    // Notizbuch öffnen und schließen
  hint: 'h',        // Joseph gibt einen Tipp
  close: 'escape',  // Fenster schließen, Gegenstand loslassen
  skip: ' ',        // Leertaste: Sprechtext überspringen
};

// Adress-Zusätze zum Testen, z. B. http://localhost:8150/?debug&mute
const params = new URLSearchParams(location.search);
export const DEBUG_AT_START = params.has('debug'); // Debug-Ansicht sofort an
export const START_MUTED = params.has('mute');     // ohne Ton starten
export const SKIP_INTRO = params.has('skipintro'); // ohne Titelbild und Anfangsszene beginnen
