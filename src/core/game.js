import { Screen } from './screen.js';
import { Input } from './input.js';
import { Camera } from './camera.js';
import { Scene } from '../scene/scene.js';
import { Player } from '../player/player.js';
import { TrainSound } from '../audio/trainSound.js';
import { SoundEffects } from '../audio/soundEffects.js';
import { DebugOverlay } from '../debug/debugOverlay.js';
import { Cursor } from '../ui/cursor.js';
import { Inventory } from '../ui/inventory.js';
import { Speech } from '../ui/speech.js';
import { Hints } from '../ui/hints.js';
import { Notebook } from '../ui/notebook.js';
import { CodeLock } from '../ui/codeLock.js';
import { Overlay } from '../ui/overlay.js';
import { Story } from '../story/story.js';
import { ITEMS } from '../story/items.js';
import { DEBUG_AT_START, KEYS, SKIP_INTRO, START_MUTED } from '../config.js';

// Das Herz des Spiels.
//
// Verwaltet Bildschirm, Eingaben, Kamera, Ton, Joseph, die aktuelle Szene, die Benutzeroberfläche
// (Mauszeiger, Inventar, Sprechtexte, Notizbuch …) und die Geschichte. Ruft ca. 60-mal pro Sekunde
// update() (Spiellogik) und draw() (Zeichnen) auf.
//
// Ein Klick geht der Reihe nach an: Karte (Titelbild, Brief …) → Zahlenschloss → Notizbuch →
// Zwischensequenz (Klick überspringt nur den Satz) → Notizbuch-Knopf → Inventar → Abteil.
export class Game {
  constructor(canvas) {
    this.screen = new Screen(canvas);
    this.input = new Input(canvas, this.screen);
    this.camera = new Camera();
    this.player = new Player();
    this.sound = new TrainSound({ muted: START_MUTED });
    this.effects = new SoundEffects(this.sound);
    this.debug = new DebugOverlay(DEBUG_AT_START);
    this.scene = null;
    this.story = null;
    this.lastTime = 0;

    // Benutzeroberfläche
    this.cursor = new Cursor();
    this.inventory = new Inventory();
    this.speech = new Speech();
    this.hints = new Hints();
    this.notebook = new Notebook();
    this.codeLock = new CodeLock();
    this.overlay = new Overlay();
    this.codeLock.onSound = (name) => this.effects.play(name);

    this.input.on('click', (click) => this.handleClick(click));
    this.input.on('key', (key) => this.handleKey(key));
  }

  // Lädt eine Szene samt Bildern, stellt Joseph an seine Startposition und bereitet die Geschichte vor.
  async loadScene(sceneData, script) {
    const scene = new Scene(sceneData);
    await Promise.all([scene.load(), this.player.load(), this.cursor.load(), this.inventory.load(), this.notebook.load()]);
    this.scene = scene;
    this.story = new Story(this, script);
    scene.flags = this.story.flags;
    if (scene.motion) {
      scene.motion.onBump = (strength) => this.sound.clack(strength);
      scene.motion.onSqueal = (duration) => this.sound.squeal(duration);
      scene.motion.onTunnel = (inside) => {
        this.sound.tunnel(inside);
        this.story.onTunnel(inside);
      };
      scene.motion.onLights = (on) => this.effects.play(on ? 'lightsOn' : 'lightsOff');
      this.sound.inTunnel = scene.motion.inTunnel;
    }
    this.camera.reset();
    this.player.enterScene(scene);
  }

  start() {
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame(this.loop);
    });
    this.story.begin({ skipIntro: SKIP_INTRO });
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
    this.story.update(dt);

    // Taschenlampe: leuchtet im Dunkeln dorthin, wo die Maus ist
    const mouse = this.camera.screenToWorld(this.input.mouse);
    const flashlight = this.scene.darkLevel > 0 && this.inventory.has('flashlight') && this.input.mouse.inside;
    this.scene.beam = flashlight ? mouse : null;

    this.speech.update(dt);
    this.hints.update(dt);
    this.notebook.update(dt);
    this.codeLock.update(dt);
    this.overlay.update(dt);
    this.inventory.update(dt, this.input.mouse);
    this.updateCursor();
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

    // 2) Benutzeroberfläche – bleibt fest auf dem Bildschirm
    this.speech.draw(ctx);
    this.hints.draw(ctx);
    this.inventory.draw(ctx);
    this.notebook.drawButton(ctx, this.notebook.buttonContains(this.input.mouse));
    this.codeLock.draw(ctx);
    this.notebook.drawPage(ctx);
    this.overlay.draw(ctx);
    this.cursor.draw(ctx, this.input.mouse);
    this.debug.drawScreen(ctx, this);
  }

  // Welcher Mauszeiger, welcher Name daneben?
  updateCursor() {
    const mouse = this.input.mouse;
    const selected = this.inventory.selected;
    const item = selected ? this.inventory.images[selected] : null;
    const itemName = selected ? ITEMS[selected].name : '';

    if (this.overlay.blocksInput || this.codeLock.isOpen || this.notebook.isOpen) return this.cursor.set({ kind: 'interact' });
    if (this.story.inCutscene || this.overlay.fade > 0.5) return this.cursor.set({ visible: false });
    if (this.notebook.buttonContains(mouse)) return this.cursor.set({ kind: 'interact', label: 'Notizbuch (N)' });
    if (this.inventory.contains(mouse)) {
      const id = this.inventory.itemAt(mouse);
      const name = id ? ITEMS[id].name : '';
      const label = selected && id && id !== selected ? `${itemName} mit ${name} kombinieren` : name;
      return this.cursor.set({ kind: 'interact', label, item });
    }
    const hotspot = this.scene.hotspotAt(this.camera.screenToWorld(mouse));
    if (hotspot) {
      this.story.event('hovered');
      const label = selected ? `${itemName} mit ${hotspot.name} benutzen` : hotspot.name;
      return this.cursor.set({ kind: hotspot.cursor ?? 'interact', label, item });
    }
    this.cursor.set({ kind: 'walk', label: selected ? itemName : '', item });
  }

  handleClick(click) {
    this.sound.start(); // Browser erlauben Ton erst nach der ersten Eingabe
    if (this.overlay.blocksInput) return this.overlay.handleClick();
    if (this.codeLock.isOpen) return this.codeLock.handleClick(click, click.right);
    if (this.notebook.isOpen) return this.notebook.close();
    if (this.story.isBusy) return this.speech.skip();
    if (this.notebook.buttonContains(click)) return this.story.openNotebook();
    if (this.inventory.contains(click)) return this.clickInventory(click);

    const point = this.camera.screenToWorld(click);
    const hotspot = this.scene.hotspotAt(point);
    const selected = this.inventory.selected;
    if (click.right) {
      if (selected) this.inventory.selected = null; // Rechtsklick lässt den Gegenstand los
      else if (hotspot) this.story.look(hotspot);
      return;
    }
    this.inventory.selected = null;
    if (hotspot && selected) return this.story.useItem(selected, hotspot);
    if (hotspot) return this.story.use(hotspot);

    // Linksklick auf den Boden: Joseph läuft dorthin (Doppelklick: er rennt)
    this.story.cancelAction();
    const target = this.player.walkTo(point, this.scene.walkArea, click.double);
    this.scene.showClickMarker(target);
    this.story.event('walked');
  }

  // Klick auf die Inventarleiste: nehmen, kombinieren oder (Rechtsklick) anschauen
  clickInventory(click) {
    const id = this.inventory.itemAt(click);
    const selected = this.inventory.selected;
    if (click.right) {
      if (id) this.story.lookItem(id);
      else this.inventory.selected = null;
      return;
    }
    if (!id || id === selected) {
      this.inventory.selected = null;
      return;
    }
    if (!selected) {
      this.inventory.selected = id;
      return;
    }
    this.inventory.selected = null;
    this.story.combine(selected, id);
  }

  handleKey(key) {
    this.sound.start();
    if (key === KEYS.toggleDebug) this.debug.toggle();
    if (key === KEYS.toggleGrid) this.debug.toggleGrid();
    if (key === KEYS.toggleSound) this.sound.toggleMute();
    if (key === KEYS.skipToTunnel && this.debug.enabled) this.scene.motion?.skipToTunnel();
    if (key === KEYS.skip) this.speech.skip();
    if (key === KEYS.close) {
      this.codeLock.close(false);
      this.notebook.close();
      this.inventory.selected = null;
    }
    if (key === KEYS.notebook && !this.story.inCutscene && !this.overlay.blocksInput && !this.codeLock.isOpen) {
      if (this.notebook.isOpen) this.notebook.close();
      else this.story.openNotebook();
    }
  }

  // Wenn im Tunnel das Licht ausgeht und Joseph keine Taschenlampe hat, sieht er das Zahlenschloss nicht mehr
  closeWindowsInDark() {
    if (!this.inventory.has('flashlight')) this.codeLock.close(false);
  }
}
