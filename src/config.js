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

// Wagenübersicht mit den 24 Türen (siehe src/advent/):
//   ?test               alle 24 Türen offen, unabhängig vom Datum (dazu ein Knopf „Spielstand löschen“)
//   ?datum=2026-12-05   so tun, als wäre heute dieser Tag
//   ?tuer=2             ohne Kalender direkt in diese Tür (gut mit &skipintro)
export const TEST_MODE = params.has('test');
export const FAKE_DATE = params.get('datum');
export const START_DOOR = Number(params.get('tuer') ?? params.get('wagen')) || null; // ?wagen=N geht auch
