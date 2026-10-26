// Kleine Mathe-Helfer für Punkte, Strecken und Vielecke (Polygone).
// Ein Punkt ist { x, y }, ein Polygon ist eine Liste von Punkten.

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Liegt der Punkt innerhalb des Polygons?
// (Man schickt gedanklich einen Strahl nach rechts und zählt, wie oft er den Rand kreuzt:
//  ungerade Anzahl = innen, gerade Anzahl = außen.)
export function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const crossesRow = a.y > point.y !== b.y > point.y;
    if (crossesRow && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

// Der Punkt auf der Strecke a–b, der am nächsten an p liegt.
export function closestPointOnSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  let t = lengthSquared === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

// Kreuzen sich die Strecken a–b und c–d wirklich?
// Nur berühren (z. B. an einer gemeinsamen Ecke) zählt NICHT als Kreuzen.
export function segmentsCross(a, b, c, d) {
  const side1 = side(c, d, a);
  const side2 = side(c, d, b);
  const side3 = side(a, b, c);
  const side4 = side(a, b, d);
  return side1 * side2 < 0 && side3 * side4 < 0;
}

// Auf welcher Seite der Linie a→b liegt p? (> 0 links, < 0 rechts, 0 genau darauf)
function side(a, b, p) {
  const value = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
  return Math.abs(value) < 1e-6 ? 0 : Math.sign(value);
}
