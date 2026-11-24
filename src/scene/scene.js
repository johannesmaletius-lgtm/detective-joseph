import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loadImage } from '../core/assets.js';
import { loadAnimation } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';
import { WalkArea } from '../navigation/walkArea.js';
import { pointInPolygon } from '../navigation/geometry.js';
import { TrainMotion } from '../effects/trainMotion.js';
import { Darkness } from '../effects/darkness.js';
import { Ambience } from '../effects/ambience.js';
import { paintCanvas } from '../core/paint.js';
import { OutsideView } from './outsideView.js';
import { Character } from './character.js';

const CLICK_MARKER_DURATION = 0.45; // Sekunden

// Eine Szene = ein Ort im Spiel (z. B. das erste Zugabteil).
//
// Diese Klasse ist für alle Szenen gleich. WAS in einer Szene ist (Hintergrund,
// Laufbereich, Animationen, anklickbare Stellen, Startposition …), steht als reine Daten
// in einer eigenen Datei, z. B. src/scene/trainCompartment.js.
//
// Anklickbare Stellen (hotspots) und kleine Bilder im Raum (props) können Bedingungen haben:
// - when: 'merker'   nur sichtbar, solange dieser Merker im Spielstand gesetzt ist ('!merker' = nicht gesetzt)
// - inDark: true     nur im Dunkeln zu sehen (wenn im Tunnel das Licht aus ist)
// - glows: 'merker'  (nur hotspots) leuchtet selbst und ist deshalb auch im Dunkeln ohne Taschenlampe zu finden,
//                    solange die Bedingung gilt – z. B. der Bildschirm, solange er Strom hat
//
// Hintergrund: entweder ein Bild (background.src) oder mit Code gemalt (background.paint, siehe core/paint.js).
// Kleine Bilder (props) können statt `image` auch `paint: (ctx, scene) => { … }` haben – dann werden sie in
// jedem Bild neu gemalt (z. B. eine schlafende Dame, die atmet). Weitere Angaben für props:
// - depth: y        steht auf dem Boden bei y: Ist Joseph weiter hinten (kleineres y), wird es VOR ihm gezeichnet
// - light: { x, y, radius } oder (scene) => …   leuchtet und bleibt im Dunkeln sichtbar
//
// Vordergrund: Möbel, die im Bild weiter vorne stehen (Sitze, Tische, Kisten …), sind als ausgeschnittene
// Stücke des Hintergrundbilds in assets/scenes/vordergrund.json eingetragen (erzeugt von
// tools/cut-foreground.py). Jedes Stück hat eine Bodenhöhe (depth, bei schräg stehenden Möbeln eine Linie):
// Stehen die Füße einer Figur weiter hinten (kleineres y), wird das Stück über die Figur gelegt. Das Stück wird dabei nicht neu gemalt,
// sondern Pixel für Pixel aus dem schon gezeichneten Bild kopiert (das ausgeschnittene Bild dient nur
// als Schablone) – so gibt es keine Kanten, und was dort gerade liegt (Requisiten, Lichtschein), bleibt.
const FOREGROUND = 'assets/scenes/vordergrund.json';
let foregroundList = null;
function loadForegroundList() {
  foregroundList ??= fetch(FOREGROUND).then((response) => (response.ok ? response.json() : {})).catch(() => ({}));
  return foregroundList;
}
// Stellen, durch die Joseph weitergeht
const EXITS = new Set(['door', 'hatch', 'archLeft', 'archRight', 'ahead']);

export class Scene {
  constructor(data) {
    this.data = data;
    this.walkArea = new WalkArea(data.walkArea);
    this.outside = data.outside ? new OutsideView(data.outside) : null;
    this.motion = data.train
      ? new TrainMotion(data.train, { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches })
      : null;
    this.darkness = new Darkness();
    // kleine Effekte: Schnee hinter den Fenstern, Kerzen, Dampf, Staub … (siehe src/effects/ambience.js)
    this.ambience = new Ambience(data.ambience, { windows: data.outside?.windows ?? [] });
    this.hotspots = (data.hotspots ?? []).map((hotspot) => ({ ...hotspot, area: hotspot.area.map(([x, y]) => ({ x, y })) }));
    this.props = [];      // kleine Bilder im Raum, z. B. der Brief im Schlitz
    this.foreground = []; // Möbel vorne im Bild, hinter denen Figuren vorbeilaufen (siehe oben)
    this.animations = []; // animierte Stellen im Bild, z. B. der Bildschirm
    this.characters = (data.characters ?? []).map((character) => new Character(character)); // andere Figuren
    this.background = null;
    this.clickMarker = null;
    this.flags = {};      // Merker aus dem Spielstand (setzt das Spiel, siehe story.js)
    this.beam = null;     // Lichtkegel der Taschenlampe { x, y } oder null (setzt das Spiel)
    this.time = 0;        // Sekunden seit dem Betreten der Szene (für gemalte Animationen)
  }

  async load() {
    const spots = this.data.animations ?? [];
    const { background: bg } = this.data;
    const [background, players, props, foreground] = await Promise.all([
      bg.paint ? paintCanvas(bg.width, bg.height, bg.paint) : loadImage(bg.src),
      Promise.all(spots.map(async (spot) => (spot.animation ? new AnimationPlayer(await loadAnimation(spot.animation)) : null))),
      Promise.all((this.data.props ?? []).map(async (prop) => ({ ...prop, picture: prop.image ? await loadImage(prop.image) : null }))),
      bg.src ? loadForegroundList().then((list) => Promise.all((list[bg.src] ?? []).map(async (piece) => ({ ...piece, mask: await loadImage(piece.image) })))) : [],
      this.outside?.load(),
      ...this.characters.map((character) => character.load()),
    ]);
    this.background = background;
    this.props = props;
    // Stücke in Spielkoordinaten umrechnen (im Bild: Pixel des Hintergrundbilds)
    const zoomX = bg.width / background.width, zoomY = bg.height / background.height;
    this.foreground = foreground.map((piece) => ({
      ...piece,
      x: bg.x + piece.x * zoomX, y: bg.y + piece.y * zoomY,
      width: piece.width * zoomX, height: piece.height * zoomY,
      canvas: document.createElement('canvas'),
    }));
    this.animations = spots.map((spot, i) => ({ ...spot, player: players[i], off: false }));
  }

  // Passt den Mauszeiger jeder Stelle an das an, was ein Linksklick wirklich tut:
  // Kann man dort etwas tun (use) oder einen Gegenstand benutzen (items), zeigt er die Hand –
  // gibt es nur etwas anzuschauen, das Auge. Ein Sprech-Zeiger ('talk') bleibt, wie er ist.
  // Ausgänge (Tür zum nächsten Wagen, Luke, Gänge) zeigen einen Pfeil in die Gehrichtung.
  fitCursors(script) {
    for (const hotspot of this.hotspots) {
      if (hotspot.cursor === 'talk') continue;
      if (EXITS.has(hotspot.id)) {
        hotspot.cursor = { left: 'exitLeft', right: 'exitRight' }[hotspot.facing] ?? 'exit';
        continue;
      }
      const reactions = script?.hotspots?.[hotspot.id] ?? {};
      const canUse = Boolean(reactions.use) || Object.keys(reactions.items ?? {}).length > 0;
      hotspot.cursor = canUse ? 'interact' : 'look';
    }
  }

  // Wie groß (in Pixeln) ist Joseph, wenn seine Füße auf Höhe y stehen?
  // Hinten im Raum (kleines y) wirkt er kleiner, vorne (großes y) größer.
  // Zwischen den beiden Messpunkten "far" und "near" wird gleichmäßig umgerechnet.
  characterHeightAt(y) {
    const { far, near } = this.data.perspective;
    const t = (y - far.y) / (near.y - far.y);
    return Math.max(20, far.height + t * (near.height - far.height));
  }

  // Wie dunkel ist es im Abteil? 0 = Licht an, 1 = Licht aus
  get darkLevel() {
    return this.motion ? 1 - this.motion.lights : 0;
  }

  get isDark() {
    return this.darkLevel > 0.5;
  }

  // Gilt die Bedingung (when / inDark) einer anklickbaren Stelle oder eines Bildes gerade?
  isActive({ when, inDark }) {
    if (inDark && !this.isDark) return false;
    if (!when) return true;
    return when.startsWith('!') ? !this.flags[when.slice(1)] : Boolean(this.flags[when]);
  }

  // Welche anklickbare Stelle liegt unter dem Punkt? Die erste passende in der Liste gewinnt.
  // Im Dunkeln findet Joseph nur etwas, wo seine Taschenlampe hinleuchtet.
  hotspotAt(point) {
    const lit = !this.isDark || Darkness.inBeam(point, this.beam);
    const found = (hotspot) => (lit || (hotspot.glows && this.isActive({ when: hotspot.glows })));
    const people = this.visibleCharacters().sort((a, b) => b.y - a.y); // vorne Stehende zuerst
    return [...people, ...this.hotspots].find((hotspot) => this.isActive(hotspot) && found(hotspot) && pointInPolygon(point, hotspot.area)) ?? null;
  }

  // Figuren, die gerade da sind (when-Bedingung erfüllt, nicht ausgeblendet)
  visibleCharacters() {
    return this.characters.filter((character) => this.isActive(character) && character.alpha > 0.05);
  }

  character(id) {
    return this.characters.find((character) => character.id === id);
  }

  // Mitte einer anklickbaren Stelle (damit Joseph sich dorthin drehen kann)
  static centerOf(hotspot) {
    const xs = hotspot.area.map((p) => p.x), ys = hotspot.area.map((p) => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }

  // Spielt auf einer animierten Stelle (z. B. dem Bildschirm) einmal eine andere Animation ab
  // und kehrt danach zur alten zurück. Wartet, bis sie fertig ist.
  async playOnSpot(id, name, { glowColor, glowStrength } = {}) {
    const spot = this.animations.find((s) => s.id === id);
    const animation = await loadAnimation(name);
    const before = { animation: spot.player.animation, off: spot.off };
    spot.off = false;
    spot.playing = true; // so lange hat die Animation Vorrang vor einem eigenen Bild (paintSpot)
    spot.glowColor = glowColor;
    spot.glowStrength = glowStrength;
    spot.player.setAnimation(animation);
    await new Promise((resolve) => {
      spot.player.onEnd = resolve;
    });
    spot.player.onEnd = null;
    spot.player.setAnimation(before.animation);
    spot.off = before.off;
    spot.playing = false;
    spot.glowColor = spot.glowStrength = undefined;
  }

  // Lässt eine animierte Stelle etwas Eigenes zeigen statt ihrer Animation, z. B. das Kamerabild
  // auf dem Bildschirm. painter = (ctx, x, y, width, height) => { … } oder null (wieder die Animation).
  paintSpot(id, painter, { glowColor } = {}) {
    const spot = this.animations.find((s) => s.id === id);
    if (!spot) return;
    spot.painter = painter;
    spot.painterGlow = painter ? glowColor : undefined;
  }

  // Schaltet eine animierte Stelle aus (z. B. Bildschirm ohne Strom) oder wieder an
  switchSpot(id, on) {
    const spot = this.animations.find((s) => s.id === id);
    if (spot) spot.off = !on;
  }

  // Kleiner Kreis auf dem Boden, der zeigt, wohin Joseph läuft.
  showClickMarker(point) {
    this.clickMarker = { x: point.x, y: point.y, age: 0 };
  }

  update(dt) {
    this.time += dt;
    this.motion?.update(dt);
    this.outside?.update(dt, this.motion);
    for (const spot of this.animations) spot.player?.update(dt);
    for (const character of this.characters) character.update(dt);
    this.ambience.update(dt, this);

    if (this.clickMarker) {
      this.clickMarker.age += dt;
      if (this.clickMarker.age > CLICK_MARKER_DURATION) this.clickMarker = null;
    }
  }

  // Zeichenreihenfolge: was zuerst gezeichnet wird, liegt hinten.
  draw(ctx, player) {
    // 1) alles, was nur durch die durchsichtigen Stellen des Hintergrunds zu sehen ist
    this.outside?.draw(ctx);
    this.ambience.drawBehind(ctx, this);
    this.drawAnimations(ctx, 'behind');

    // 2) das Hintergrundbild
    this.drawBackground(ctx);

    // 3) Dinge davor: kleine Bilder, Animationen, Lichtschein, Klick-Markierung, Joseph und die Figuren –
    //    dazwischen, nach Bodenhöhe sortiert, was vorne auf dem Boden steht (Möbel, Bilder mit depth)
    this.drawProps(ctx, (prop) => prop.depth === undefined);
    this.drawAnimations(ctx, 'front');
    this.drawGlows(ctx);
    this.ambience.draw(ctx, this);
    this.drawClickMarker(ctx);
    this.drawInDepth(ctx, player);

    // 4) Licht und Flackern liegen über allem – auch über Joseph
    this.outside?.drawLight(ctx);
    this.motion?.drawLamps(ctx, GAME_WIDTH, GAME_HEIGHT);
    if (this.darkLevel > 0) {
      const glass = this.outside ? (pane) => this.drawGlass(pane, player) : null;
      this.darkness.draw(ctx, this.darkLevel, { glass, lights: this.glowingSpots(), beam: this.beam });
    }
    this.motion?.drawSweeps(ctx, GAME_HEIGHT);
  }

  // Nur die Fensterscheiben: die Außenwelt, aus der alles weggenommen wird, was im Abteil davor liegt
  // (Wände und Rahmen des Hintergrundbilds, kleine Bilder, Joseph). Für die Dunkelheit im Tunnel.
  drawGlass(ctx, player) {
    this.outside.draw(ctx, { reuse: true }); // die Außenwelt ist in diesem Bild schon gemalt
    ctx.globalCompositeOperation = 'destination-out';
    this.drawBackground(ctx);
    this.drawProps(ctx);
    this.drawFigures(ctx, player);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Das Hintergrundbild wird einmal in genau der Bildschirmgröße vorbereitet. Sonst müsste der Browser
  // das große Bild in jedem einzelnen Bild neu umrechnen – das kostet viel Zeit und lässt das Spiel ruckeln.
  drawBackground(ctx) {
    const { x, y, width, height } = this.data.background;
    const { a: zoomX, d: zoomY } = ctx.getTransform();
    const w = Math.round(width * zoomX), h = Math.round(height * zoomY);
    const source = this.background;
    if (w <= 0 || h <= 0 || (source.width === w && source.height === h)) {
      ctx.drawImage(source, x, y, width, height);
      return;
    }
    if (this.scaledBackground?.source !== source || this.scaledBackground.width !== w || this.scaledBackground.height !== h) {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const scaled = canvas.getContext('2d');
      scaled.imageSmoothingQuality = 'high';
      scaled.drawImage(source, 0, 0, w, h);
      this.scaledBackground = { source, width: w, height: h, canvas };
    }
    ctx.save();
    ctx.imageSmoothingQuality = 'low'; // hat schon die richtige Größe
    ctx.drawImage(this.scaledBackground.canvas, x, y, width, height);
    ctx.restore();
  }

  // Joseph und die anderen Figuren – wer weiter vorne steht (größeres y), wird später gezeichnet
  drawFigures(ctx, player) {
    for (const figure of this.figures(player)) figure.draw(ctx, this);
  }

  figures(player) {
    return [player, ...this.characters.filter((character) => this.isActive(character))].sort((a, b) => a.y - b.y);
  }

  // Figuren, Bilder mit Bodenhöhe (depth) und Vordergrund-Möbel, von hinten nach vorne.
  // Bei gleicher Höhe steht die Figur vorne. Ein Möbelstück kommt direkt nach der vordersten Figur,
  // die hinter ihm steht (bei schräg stehenden Möbeln hängt das davon ab, wo die Figur steht).
  drawInDepth(ctx, player) {
    const figures = this.figures(player);
    const order = figures.map((figure) => ({ y: figure.y, rank: 1, draw: () => figure.draw(ctx, this) }));
    for (const prop of this.props) {
      if (prop.depth !== undefined && this.isActive(prop)) order.push({ y: prop.depth, rank: 0, draw: () => this.drawProp(ctx, prop) });
    }
    for (const piece of this.foreground) {
      const behind = figures.filter((figure) => figure.y < Scene.depthAt(piece, figure.x));
      if (!behind.length || !this.copyPiece(ctx, piece)) continue; // keine Figur dahinter: nichts zu tun
      order.push({ y: Math.max(...behind.map((figure) => figure.y)), rank: 2, draw: () => this.pastePiece(ctx, piece) });
    }
    order.sort((a, b) => a.y - b.y || a.rank - b.rank);
    for (const item of order) item.draw();
  }

  // Bodenhöhe eines Möbelstücks an der Stelle x: eine Zahl oder eine schräge Linie [[x1, y1], [x2, y2]]
  static depthAt(piece, x) {
    if (typeof piece.depth === 'number') return piece.depth;
    const [[x1, y1], [x2, y2]] = piece.depth;
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
  }

  // Merkt sich, wie das Möbelstück gerade im Bild aussieht (genau die Pixel, ausgeschnitten mit der Schablone)
  copyPiece(ctx, piece) {
    const m = ctx.getTransform();
    const { width: cw, height: ch } = ctx.canvas;
    const x0 = Math.max(0, Math.floor(m.a * piece.x + m.e)), y0 = Math.max(0, Math.floor(m.d * piece.y + m.f));
    const x1 = Math.min(cw, Math.ceil(m.a * (piece.x + piece.width) + m.e)), y1 = Math.min(ch, Math.ceil(m.d * (piece.y + piece.height) + m.f));
    if (x1 <= x0 || y1 <= y0) return false;
    const { canvas } = piece;
    if (canvas.width !== x1 - x0 || canvas.height !== y1 - y0) {
      canvas.width = x1 - x0;
      canvas.height = y1 - y0;
    }
    const copy = canvas.getContext('2d');
    copy.setTransform(1, 0, 0, 1, 0, 0);
    copy.globalCompositeOperation = 'copy';
    copy.drawImage(ctx.canvas, x0, y0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    copy.globalCompositeOperation = 'destination-in';
    copy.setTransform(m.a, m.b, m.c, m.d, m.e - x0, m.f - y0);
    copy.drawImage(piece.mask, piece.x, piece.y, piece.width, piece.height);
    piece.at = { x: x0, y: y0 };
    return true;
  }

  pastePiece(ctx, piece) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(piece.canvas, piece.at.x, piece.at.y);
    ctx.restore();
  }

  drawProps(ctx, filter = () => true) {
    for (const prop of this.props) {
      if (this.isActive(prop) && filter(prop)) this.drawProp(ctx, prop);
    }
  }

  drawProp(ctx, prop) {
    ctx.save();
    if (prop.inDark) ctx.globalAlpha = this.darkLevel;
    if (prop.paint) prop.paint(ctx, this);
    else ctx.drawImage(prop.picture, prop.x, prop.y, prop.width, prop.height);
    ctx.restore();
  }

  drawAnimations(ctx, layer) {
    for (const spot of this.animations) {
      if ((spot.layer ?? 'front') !== layer) continue;
      if (spot.off) {
        ctx.fillStyle = '#060807'; // ausgeschaltet: dunkle Mattscheibe
        ctx.fillRect(spot.x, spot.y, spot.width, spot.height);
      } else if (spot.painter && !spot.playing) {
        spot.painter(ctx, spot.x, spot.y, spot.width, spot.height);
      } else {
        spot.player?.draw(ctx, spot.x, spot.y, spot.width, spot.height);
      }
    }
  }

  // Leuchtende Animationen (z. B. der Bildschirm) werfen flackerndes Licht auf ihre Umgebung.
  drawGlows(ctx) {
    for (const spot of this.animations) {
      if (!spot.glow || spot.off) continue;
      const { x, y, radius } = spot.glow;
      const color = spot.glowColor ?? (spot.playing ? undefined : spot.painterGlow) ?? spot.glow.color;
      const strength = spot.glowStrength ?? spot.glow.strength;
      const flicker = 0.6 + 0.4 * Math.abs(Math.sin((spot.player?.frameIndex ?? Math.floor(performance.now() / 70)) * 12.9898)); // je Frame etwas anders
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${color}, ${strength * flicker})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.restore();
    }
  }

  // Was im Dunkeln selbst leuchtet (bleibt in der Dunkelheit ausgespart)
  glowingSpots() {
    const spots = this.animations
      .filter((spot) => spot.glow && !spot.off)
      .map((spot) => ({ x: spot.glow.x, y: spot.glow.y, radius: spot.glow.radius * (spot.glowStrength ? 1.4 : 0.7) }));
    for (const prop of this.props) {
      if (!prop.light || !this.isActive(prop)) continue;
      const light = typeof prop.light === 'function' ? prop.light(this) : prop.light;
      if (light) spots.push(...[].concat(light));
    }
    spots.push(...this.ambience.lights(this)); // Kerzen brennen weiter
    return spots;
  }

  drawClickMarker(ctx) {
    if (!this.clickMarker) return;
    const { x, y, age } = this.clickMarker;
    const progress = age / CLICK_MARKER_DURATION;
    const radius = this.characterHeightAt(y) * (0.05 + 0.05 * progress);

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.translate(x, y);
    ctx.scale(1, 0.4); // flach gedrückt, damit der Kreis auf dem Boden zu liegen scheint
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(20, 10, 4, 0.7)';
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffd36b';
    ctx.stroke();
    ctx.restore();
  }
}
