import { Screen } from './screen.js';
import { Input } from './input.js';
import { Camera } from './camera.js';
import { Scene } from '../scene/scene.js';
import { Player } from '../player/player.js';
import { TrainSound } from '../audio/trainSound.js';
import { DebugOverlay } from '../debug/debugOverlay.js';
import { DEBUG_AT_START, KEYS, START_MUTED } from '../config.js';

// Das Herz des Spiels.
//
// Verwaltet Bildschirm, Eingaben, Kamera, Ton, Joseph und die aktuelle Szene und ruft
// ca. 60-mal pro Sekunde update() (Spiellogik) und draw() (Zeichnen) auf.
export class Game {
  constructor(canvas) {
    this.screen = new Screen(canvas);
    this.input = new Input(canvas, this.screen);
    this.camera = new Camera();
    this.player = new Player();
    this.sound = new TrainSound({ muted: START_MUTED });
    this.debug = new DebugOverlay(DEBUG_AT_START);
    this.scene = null;
    this.lastTime = 0;

    this.input.on('click', (click) => this.handleClick(click));
    this.input.on('key', (key) => this.handleKey(key));
  }

  // Lädt eine Szene samt Bildern und stellt Joseph an seine Startposition.
  async loadScene(sceneData) {
    const scene = new Scene(sceneData);
    await Promise.all([scene.load(), this.player.load()]);
    if (scene.motion) scene.motion.onBump = (strength) => this.sound.clack(strength);
    this.scene = scene;
    this.camera.reset();
    this.player.enterScene(scene);
  }

  start() {
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame(this.loop);
    });
  }

  loop = (time) => {
    // Vergangene Zeit seit dem letzten Bild in Sekunden. Höchstens 0,05 s, damit Joseph
    // nach einem Tab-Wechsel nicht plötzlich ein großes Stück weiterspringt.
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  };

  update(dt) {
    this.scene.update(dt);
    this.camera.shakeY = this.scene.motion?.shakeY ?? 0; // der Zug rumpelt
    this.player.update(dt, this.scene);
    this.debug.update(dt);
  }

  draw() {
    const ctx = this.screen.beginFrame();

    // 1) Spielwelt – wird mit der Kamera verschoben
    ctx.save();
    this.camera.apply(ctx);
    this.scene.draw(ctx, this.player);
    this.debug.drawWorld(ctx, this);
    ctx.restore();

    // 2) Benutzeroberfläche – bleibt fest auf dem Bildschirm (später: Inventar, Cursor)
    this.debug.drawScreen(ctx, this);
  }

  // Linksklick: Joseph läuft zur angeklickten Stelle (Doppelklick: er rennt).
  // Später prüfen wir hier zuerst, ob ein Gegenstand angeklickt wurde.
  handleClick(click) {
    this.sound.start(); // Browser erlauben Ton erst nach der ersten Eingabe
    const point = this.camera.screenToWorld(click);
    const target = this.player.walkTo(point, this.scene.walkArea, click.double);
    this.scene.showClickMarker(target);
  }

  handleKey(key) {
    this.sound.start();
    if (key === KEYS.toggleDebug) this.debug.toggle();
    if (key === KEYS.toggleGrid) this.debug.toggleGrid();
    if (key === KEYS.toggleSound) this.sound.toggleMute();
  }
}
