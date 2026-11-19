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
import { Jigsaw } from '../puzzles/jigsaw.js';
import { Wires } from '../puzzles/wires.js';
import { Binoculars } from '../puzzles/binoculars.js';
import { Crt } from '../puzzles/crt.js';
import { Sentence } from '../puzzles/sentence.js';
import { Mirror } from '../puzzles/mirror.js';
import { Choice } from '../ui/choice.js';
import { PictureView } from '../puzzles/picture.js';
import { ArrangeView } from '../puzzles/arrange.js';
import { DialogueView } from '../ui/dialogue.js';
import { Story } from '../story/story.js';
import { WAGONS, loadProgress, saveProgress } from '../story/wagons.js';
import { DEBUG_AT_START, KEYS, SKIP_INTRO, START_MUTED, START_WAGON } from '../config.js';

// Das Herz des Spiels.
//
// Verwaltet Bildschirm, Eingaben, Kamera, Ton, Joseph, die aktuelle Szene, die Benutzeroberfläche
// (Mauszeiger, Inventar, Sprechtexte, Notizbuch …) und die Geschichte. Ruft ca. 60-mal pro Sekunde
// update() (Spiellogik) und draw() (Zeichnen) auf.
//
// Ein Klick geht der Reihe nach an: Karte (Titelbild, Brief …) → Nahansicht (Zahlenschloss, Rätsel) →
// Notizbuch → Zwischensequenz (Klick überspringt nur den Satz) → Notizbuch-Knopf → Inventar → Abteil.
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
    this.overlay = new Overlay();

    // Nahansichten: Zahlenschloss und Rätsel (immer höchstens eine ist offen), siehe src/puzzles/
    this.views = {
      lock: new CodeLock(),
      jigsaw: new Jigsaw(),
      wires: new Wires(),
      binoculars: new Binoculars(),
      crt: new Crt(),
      sentence: new Sentence(),
      mirror: new Mirror(),
      choice: new Choice(),
      picture: new PictureView(),   // allgemeine Nahansicht mit anklickbaren Stellen (ab Wagen 4)
      arrange: new ArrangeView(),   // Kärtchen ordnen (ab Wagen 4)
      dialogue: new DialogueView(), // Gesprächsauswahl
    };
    this.wagon = 1; // Nummer des aktuellen Wagens (siehe src/wagons.js)
    for (const view of Object.values(this.views)) {
      view.onSound = (name) => this.effects.play(name);
      view.onSkip = () => this.speech.skip();
    }

    this.input.on('click', (click) => this.handleClick(click));
    this.input.on('release', (point) => this.view?.pointerUp(point));
    this.input.on('key', (key) => this.handleKey(key));
  }

  // Die Nahansicht, die gerade offen ist (oder null)
  get view() {
    return Object.values(this.views).find((view) => view.isOpen) ?? null;
  }

  // Lädt eine Szene samt Bildern, stellt Joseph an seine Startposition und bereitet die Geschichte vor.
  // Kommt Joseph aus einem anderen Wagen, fährt der Zug einfach weiter (gleiche Stelle, gleiche Runde).
  async loadScene(sceneData, script) {
    const scene = new Scene(sceneData);
    await Promise.all([scene.load(), this.player.load(), this.cursor.load(), this.inventory.load(), this.notebook.load()]);
    const previous = this.scene?.motion;
    this.story?.cancelAction();
    this.closeViews();
    this.notebook.close();
    this.speech.finish();
    this.hints.hide();
    this.inventory.selected = null;
    this.scene = scene;
    this.story = new Story(this, script);
    scene.flags = this.story.flags;
    if (scene.motion) {
      if (previous) scene.motion.continueFrom(previous);
      scene.motion.onBump = (strength) => this.sound.clack(strength);
      scene.motion.onSqueal = (duration) => {
        this.sound.squeal(duration);
        this.story.onSqueal(duration);
      };
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

  // Lädt einen Wagen (1 bis 8, siehe src/story/wagons.js)
  async loadWagon(number) {
    const wagon = WAGONS[number];
    this.wagon = number;
    await this.loadScene(wagon.scene, wagon.script);
  }

  // Joseph geht durch die Tür in den nächsten Wagen. Der Spielstand merkt sich, wie weit er gekommen ist.
  // Die Wagen 2 und 3 nehmen mit, was Joseph bei sich trägt (packFor). Ab Wagen 4 legt das Drehbuch fest,
  // was er dabeihat (startItems) und womit das Notizbuch beginnt (recap).
  async goToWagon(number) {
    const wagon = WAGONS[number];
    if (!wagon) {
      location.href = location.pathname;
      return;
    }
    saveProgress(number);
    this.overlay.fade = 1;
    this.closeViews();
    this.speech.finish();
    if (wagon.script.startItems) {
      this.inventory.clear();
      this.notebook.clear();
    }
    await this.loadWagon(number);
    await this.story.begin();
  }

  start() {
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame(this.loop);
    });
    this.begin();
  }

  // Titelbild – und wer schon weiter war, kann dort weiterspielen
  async begin() {
    const fresh = this.wagon > 1; // direkt in einem späteren Wagen begonnen: Joseph bekommt seine Sachen
    if (SKIP_INTRO) return this.story.begin({ skipIntro: true, fresh });
    this.overlay.fade = 1;
    const saved = loadProgress();
    const offer = !START_WAGON && saved > 1 && WAGONS[saved];
    const options = offer ? ['Neues Spiel', `Weiterspielen: Wagen ${saved} – ${WAGONS[saved].name}`] : null;
    const choice = await this.overlay.showCard({
      kind: 'title',
      title: 'Detective Joseph',
      subtitle: 'Die Ringbahn',
      continueText: options ? 'Wähle aus' : 'Klicken zum Starten',
      options,
    });
    if (offer && choice === 1) {
      await this.loadWagon(saved);
      return this.story.begin({ fresh: true });
    }
    if (offer) saveProgress(1);
    return this.story.begin({ fresh });
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
    this.scene.beam = this.story.beamAt ?? (flashlight ? mouse : null); // in Zwischensequenzen darf die Geschichte selbst leuchten

    this.speech.update(dt);
    this.hints.update(dt);
    this.notebook.update(dt, this.input.mouse);
    for (const view of Object.values(this.views)) view.update(dt, this.input.mouse);
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
    this.hints.draw(ctx);
    this.inventory.draw(ctx);
    this.notebook.drawButton(ctx, this.notebook.buttonContains(this.input.mouse));
    this.view?.draw(ctx);
    this.speech.draw(ctx); // über der Nahansicht: Joseph kommentiert, was er dort sieht
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
    const itemName = selected ? this.story.itemName(selected) : '';

    this.overlay.hover = this.overlay.optionAt(mouse);
    if (this.view && !this.overlay.blocksInput) return this.cursor.set({ kind: 'interact', label: this.view.labelAt?.(mouse) ?? '' });
    if (this.overlay.blocksInput || this.notebook.isOpen) return this.cursor.set({ kind: 'interact' });
    if (this.story.inCutscene || this.overlay.fade > 0.5) return this.cursor.set({ visible: false });
    if (this.notebook.buttonContains(mouse)) return this.cursor.set({ kind: 'interact', label: 'Notizbuch (N)' });
    if (this.inventory.contains(mouse)) {
      const id = this.inventory.itemAt(mouse);
      if (this.inventory.arrowAt(mouse)) return this.cursor.set({ kind: 'interact', label: 'weitere Gegenstände', item });
      const name = id ? this.story.itemName(id) : '';
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
    if (this.overlay.blocksInput) return this.overlay.handleClick(click);
    if (this.view) return this.view.handleClick(click, click.right);
    if (this.notebook.isOpen) {
      if (this.notebook.handleClick(click) === 'hint') this.story.hint();
      return;
    }
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
    const arrow = this.inventory.arrowAt(click);
    if (arrow) return this.inventory.scroll(arrow);
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
      this.view?.close();
      this.notebook.close();
      this.inventory.selected = null;
    }
    const free = !this.story.inCutscene && !this.overlay.blocksInput && !this.view;
    if (key === KEYS.notebook && free) {
      if (this.notebook.isOpen) this.notebook.close();
      else this.story.openNotebook();
    }
    if (key === KEYS.hint && free && !this.story.isBusy) {
      this.notebook.close();
      this.story.hint();
    }
  }

  // Schließt jede offene Nahansicht (z. B. wenn eine Zwischensequenz beginnt)
  closeViews() {
    for (const view of Object.values(this.views)) view.close();
  }

  // Wenn im Tunnel das Licht ausgeht, sieht Joseph die meisten Nahansichten nicht mehr.
  // Offen bleibt, was selbst leuchtet (der Bildschirm) – und das Zahlenschloss, wenn er eine Taschenlampe hat.
  closeViewsInDark() {
    for (const view of Object.values(this.views)) {
      if (view.staysInDark) continue;
      if (view === this.views.lock && this.inventory.has('flashlight')) continue;
      view.close();
    }
  }
}
