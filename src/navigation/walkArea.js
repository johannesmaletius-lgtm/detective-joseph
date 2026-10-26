import { closestPointOnSegment, distance, pointInPolygon, segmentsCross } from './geometry.js';

const EDGE_TOLERANCE = 0.5; // Punkte so nah (Pixel) am Rand zählen noch als "auf dem Boden"
const CHECK_STEP = 4;       // Abstand (Pixel) der Prüfpunkte beim Test "geht es geradeaus?"

// Der begehbare Bereich einer Szene – das Kollisions-System.
//
// - outline: Umriss des Bodens, auf dem Joseph laufen darf (ein Vieleck)
// - holes:   Hindernisse INNERHALB dieses Bodens (z. B. eine Kiste mitten im Raum)
//
// Joseph läuft nie außerhalb des Umrisses und nie durch ein Hindernis.
// Muss er um etwas herum, sucht findPath() den kürzesten Weg über die Ecken.
export class WalkArea {
  constructor({ outline, holes = [] }) {
    this.outline = outline.map(toPoint);
    this.holes = holes.map((hole) => hole.map(toPoint));

    const polygons = [this.outline, ...this.holes];
    this.edges = polygons.flatMap((polygon) =>
      polygon.map((point, i) => [point, polygon[(i + 1) % polygon.length]]),
    );

    // Alle Ecken sind mögliche Wegpunkte. Welche Ecken man von welchen anderen aus
    // direkt (geradeaus) erreicht, ändert sich nie – das rechnen wir einmal vorab aus.
    this.corners = polygons.flat();
    this.cornerLinks = new Map(
      this.corners.map((a) => [a, this.corners.filter((b) => a !== b && this.canWalkStraight(a, b))]),
    );
  }

  // Liegt der Punkt auf begehbarem Boden?
  contains(point) {
    const inside =
      pointInPolygon(point, this.outline) && !this.holes.some((hole) => pointInPolygon(point, hole));
    return inside || this.distanceToEdge(point) <= EDGE_TOLERANCE;
  }

  distanceToEdge(point) {
    let best = Infinity;
    for (const [a, b] of this.edges) {
      best = Math.min(best, distance(point, closestPointOnSegment(point, a, b)));
    }
    return best;
  }

  // Der nächstgelegene begehbare Punkt. Klickt man z. B. auf einen Sitz,
  // läuft Joseph so nah wie möglich an ihn heran.
  closestPoint(point) {
    if (this.contains(point)) return { x: point.x, y: point.y };
    let best = null;
    let bestDistance = Infinity;
    for (const [a, b] of this.edges) {
      const candidate = closestPointOnSegment(point, a, b);
      const d = distance(point, candidate);
      if (d < bestDistance) {
        best = candidate;
        bestDistance = d;
      }
    }
    return best;
  }

  // Kann Joseph auf gerader Linie von a nach b gehen, ohne den Boden zu verlassen?
  canWalkStraight(a, b) {
    // 1) Die Linie darf keinen Rand kreuzen …
    for (const [c, d] of this.edges) {
      if (segmentsCross(a, b, c, d)) return false;
    }
    // 2) … und jeder Punkt entlang der Linie muss auf dem Boden liegen
    //    (fängt Fälle ab, in denen die Linie genau durch eine Ecke nach draußen führt).
    const steps = Math.ceil(distance(a, b) / CHECK_STEP);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (!this.contains({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
    }
    return true;
  }

  // Sucht den kürzesten Weg von "from" nach "to" (A*-Suche über die Ecken).
  // Ergebnis: Liste von Wegpunkten OHNE den Startpunkt. Der letzte Punkt ist das Ziel
  // (bzw. der nächste begehbare Punkt daneben). Leere Liste = kein Weg möglich.
  findPath(from, to) {
    const start = this.closestPoint(from);
    const goal = this.closestPoint(to);
    if (this.canWalkStraight(start, goal)) return [goal];

    const cornersFromStart = this.corners.filter((corner) => this.canWalkStraight(start, corner));
    const cornersToGoal = new Set(this.corners.filter((corner) => this.canWalkStraight(corner, goal)));
    const neighbors = (node) => {
      if (node === start) return cornersFromStart;
      const linked = this.cornerLinks.get(node);
      return cornersToGoal.has(node) ? [...linked, goal] : linked;
    };

    const costSoFar = new Map([[start, 0]]); // bisher kürzeste Strecke zu jedem Punkt
    const cameFrom = new Map();              // von wo aus wir einen Punkt erreicht haben
    const open = new Set([start]);           // Punkte, die noch untersucht werden
    const estimate = (node) => costSoFar.get(node) + distance(node, goal);

    while (open.size > 0) {
      // den vielversprechendsten offenen Punkt nehmen
      let current = null;
      for (const node of open) {
        if (current === null || estimate(node) < estimate(current)) current = node;
      }
      if (current === goal) return buildPath(cameFrom, goal);
      open.delete(current);

      for (const next of neighbors(current)) {
        const cost = costSoFar.get(current) + distance(current, next);
        if (cost < (costSoFar.get(next) ?? Infinity)) {
          costSoFar.set(next, cost);
          cameFrom.set(next, current);
          open.add(next);
        }
      }
    }
    return [];
  }
}

function toPoint([x, y]) {
  return { x, y };
}

// Geht vom Ziel rückwärts bis zum Start und dreht die Reihenfolge um.
function buildPath(cameFrom, goal) {
  const path = [goal];
  let node = goal;
  while (cameFrom.has(node)) {
    node = cameFrom.get(node);
    path.unshift(node);
  }
  path.shift(); // den Startpunkt weglassen – dort steht Joseph ja schon
  return path;
}
