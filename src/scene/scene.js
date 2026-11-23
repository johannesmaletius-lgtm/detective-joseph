import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { loadImage } from '../core/assets.js';
import { loadAnimation } from '../animation/animation.js';
import { AnimationPlayer } from '../animation/animationPlayer.js';
import { WalkArea } from '../navigation/walkArea.js';
import { pointInPolygon } from '../navigation/geometry.js';
import { TrainMotion } from '../effects/trainMotion.js';
import { Darkness } from '../effects/darkness.js';
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
export class Scene {
  constructor(data) {
    this.data = data;
    this.walkArea = new WalkArea(data.walkArea);
    this.outside = data.outside ? new OutsideView(data.outside) : null;
    this.motion = data.train
      ? new TrainMotion(data.train, { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches })
      : null;
    this.darkness = new Darkness();
    this.hotspots = (data.hotspots ?? []).map((hotspot) => ({ ...hotspot, area: hotspot.area.map(([x, y]) => ({ x, y })) }));
    this.props = [];      // kleine Bilder im Raum, z. B. der Brief im Schlitz
    this.animations = []; // animierte Stellen im Bild, z. B. der Bildschirm
    this.characters = (data.characters ?? []).map((character) => new Character(character)); // andere Figuren
    this.background = null;
    this.clickMarker = null;
    this.flags = {};      // Merker aus dem Spielstand (setzt das Spiel, siehe story.js)
    this.beam = null;     // Lichtkegel der Taschenlampe { x, y } oder null (setzt das Spiel)
  }

  async load() {
    const spots = this.data.animations ?? [];
    const [background, players, props] = await Promise.all([
      loadImage(this.data.background.src),
      Promise.all(spots.map(async (spot) => (spot.animation ? new AnimationPlayer(await loadAnimation(spot.animation)) : null))),
      Promise.all((this.data.props ?? []).map(async (prop) => ({ ...prop, picture: await loadImage(prop.image) }))),
      this.outside?.load(),
      ...this.characters.map((character) => character.load()),
    ]);
    this.background = background;
    this.props = props;
    this.animations = spots.map((spot, i) => ({ ...spot, player: players[i], off: false }));
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
    this.motion?.update(dt);
    this.outside?.update(dt, this.motion);
    for (const spot of this.animations) spot.player?.update(dt);
    for (const character of this.characters) character.update(dt);

    if (this.clickMarker) {
      this.clickMarker.age += dt;
      if (this.clickMarker.age > CLICK_MARKER_DURATION) this.clickMarker = null;
    }
  }

  // Zeichenreihenfolge: was zuerst gezeichnet wird, liegt hinten.
  draw(ctx, player) {
    // 1) alles, was nur durch die durchsichtigen Stellen des Hintergrunds zu sehen ist
    this.outside?.draw(ctx);
    this.drawAnimations(ctx, 'behind');

    // 2) das Hintergrundbild
    const { x, y, width, height } = this.data.background;
    ctx.drawImage(this.background, x, y, width, height);

    // 3) Dinge davor: kleine Bilder, Animationen, Lichtschein, Klick-Markierung, Joseph
    this.drawProps(ctx);
    this.drawAnimations(ctx, 'front');
    this.drawGlows(ctx);
    this.drawClickMarker(ctx);
    this.drawFigures(ctx, player);

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
    this.outside.draw(ctx);
    ctx.globalCompositeOperation = 'destination-out';
    const { x, y, width, height } = this.data.background;
    ctx.drawImage(this.background, x, y, width, height);
    this.drawProps(ctx);
    this.drawFigures(ctx, player);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Joseph und die anderen Figuren – wer weiter vorne steht (größeres y), wird später gezeichnet
  drawFigures(ctx, player) {
    const figures = [player, ...this.characters.filter((character) => this.isActive(character))];
    figures.sort((a, b) => a.y - b.y);
    for (const figure of figures) figure.draw(ctx, this);
  }

  drawProps(ctx) {
    for (const prop of this.props) {
      if (!this.isActive(prop)) continue;
      ctx.save();
      if (prop.inDark) ctx.globalAlpha = this.darkLevel;
      ctx.drawImage(prop.picture, prop.x, prop.y, prop.width, prop.height);
      ctx.restore();
    }
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
    return this.animations
      .filter((spot) => spot.glow && !spot.off)
      .map((spot) => ({ x: spot.glow.x, y: spot.glow.y, radius: spot.glow.radius * (spot.glowStrength ? 1.4 : 0.7) }));
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
