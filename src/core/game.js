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
import { Voices } from '../audio/voices.js';
import { Music, wagonTrack, MENU } from '../audio/music.js';
import { Hints } from '../ui/hints.js';
import { Settings } from '../ui/settings.js';
import { levels } from '../audio/levels.js';
import { Notebook } from '../ui/notebook.js';
import { CodeLock } from '../ui/codeLock.js';
import { Overlay } from '../ui/overlay.js';
import { Jigsaw } from '../puzzles/jigsaw.js';
import { Wires } from '../puzzles/wires.js';
import { Binoculars } from '../puzzles/binoculars.js';
import { Crt } from '../puzzles/crt.js';
import { PictureView } from '../puzzles/picture.js';
import { ArrangeView } from '../puzzles/arrange.js';
import { DialogueView } from '../ui/dialogue.js';
import { Story } from '../story/story.js';
import { ITEMS } from '../story/items.js';
import { Calendar } from '../advent/calendar.js';
import { SaveGame } from '../advent/save.js';
import { canPlay, doorInfo, today } from '../advent/doors.js';
import { DEBUG_ALLOWED, DEBUG_AT_START, FAKE_DATE, KEYS, SKIP_INTRO, START_DOOR, START_MUTED, TEST_MODE } from '../config.js';

// Geräusch → Laut von Joseph [Art, Wahrscheinlichkeit] (siehe Voices.react)
const REACTIONS = {
  success: ['solved', 1],
  unlock: ['solved', 1],
  wrong: ['mistake', 0.7],
  locked: ['mistake', 0.7],
  dread: ['scared', 1],
  shriek: ['scared', 1],
  crash: ['scared', 1],
  derail: ['scared', 1],
  lightsOff: ['scared', 0.2],
  pickup: ['wow', 0.5],
};
const YAWN_AFTER = 75; // Sekunden ohne Eingabe

// Das Herz des Spiels.
//
// Verwaltet Bildschirm, Eingaben, Kamera, Ton, Joseph, die aktuelle Szene, die Benutzeroberfläche
// (Mauszeiger, Inventar, Sprechtexte, Notizbuch …) und die Geschichte. Ruft ca. 60-mal pro Sekunde
// update() (Spiellogik) und draw() (Zeichnen) auf.
//
// Zuerst kommt die Wagenübersicht (src/advent/calendar.js). Wer eine Tür wählt, steigt in diesen Wagen
// (Szene + Drehbuch, siehe src/advent/doors.js). Ist der Wagen geschafft, geht es zurück zum Kalender.
//
// Ein Klick geht der Reihe nach an: Karte (Titelbild, Brief …) → Nahansicht (Zahlenschloss, Rätsel) →
// Notizbuch → Zwischensequenz (Klick überspringt nur den Satz) → Notizbuch-Knopf → Inventar → Abteil.
export class Game {
  constructor(canvas) {
    this.screen = new Screen(canvas);
    this.input = new Input(canvas, this.screen);
    this.camera = new Camera();
    this.player = new Player();
    this.sound = new TrainSound({ muted: START_MUTED || !levels.sound });
    this.effects = new SoundEffects(this.sound);
    this.voices = new Voices(this.sound);
    this.music = new Music(this.sound); // Hintergrundmusik je Wagen (src/audio/music.js)
    this.sound.onLevels = () => this.voices.applyLevels();
    // Joseph reagiert mit kurzen Lauten auf Geräusche (Rätsel gelöst, Fehler, Schreck …)
    this.effects.onPlay = (name) => {
      const [kind, chance] = REACTIONS[name] ?? [];
      if (kind) this.voices.react(kind, chance);
    };
    this.idleTime = 0; // Sekunden ohne Eingabe → Joseph gähnt
    this.debug = new DebugOverlay(DEBUG_AT_START);
    this.scene = null;
    this.story = null;
    this.lastTime = 0;

    // Wagenübersicht und Spielstand
    this.calendar = new Calendar();
    this.save = new SaveGame();
    this.door = null;     // Tür, die gerade gespielt wird
    this.finished = null; // beendet den laufenden Wagen (setzt playDoor)

    // Benutzeroberfläche
    this.cursor = new Cursor();
    this.inventory = new Inventory();
    this.speech = new Speech(this.voices);
    this.hints = new Hints();
    this.notebook = new Notebook();
    this.overlay = new Overlay();
    this.settings = new Settings(this); // Zahnrad oben rechts: Lösungsweg, Ton, Lautstärken

    // Nahansichten: Zahlenschloss und Rätsel (immer höchstens eine ist offen), siehe src/puzzles/
    this.views = {
      lock: new CodeLock(),
      jigsaw: new Jigsaw(),
      wires: new Wires(),
      binoculars: new Binoculars(),
      crt: new Crt(),
      picture: new PictureView(),   // allgemeine Nahansicht mit anklickbaren Stellen (ab Wagen 4)
      arrange: new ArrangeView(),   // Kärtchen ordnen (ab Wagen 4)
      dialogue: new DialogueView(), // Gesprächsauswahl
    };
    for (const view of Object.values(this.views)) {
      view.onSound = (name) => this.effects.play(name);
      view.onSkip = () => this.speech.skip();
    }

    this.input.on('click', (click) => this.handleClick(click));
    this.input.on('release', (point) => {
      this.settings.pointerUp();
      this.view?.pointerUp(point);
    });
    this.input.on('key', (key) => this.handleKey(key));
  }

  // Die Nahansicht, die gerade offen ist (oder null)
  get view() {
    return Object.values(this.views).find((view) => view.isOpen) ?? null;
  }

  // Lädt alles, was Kalender und Wagen gemeinsam brauchen (Mauszeiger, Joseph, Inventar, Notizbuch)
  prepare() {
    return Promise.all([this.player.load(), this.cursor.load(), this.inventory.load(), this.notebook.load()]);
  }

  // Abwechselnd: Kalender zeigen, gewählte Tür spielen, zurück zum Kalender
  async run() {
    // ?tuer=N nur, wenn die Tür heute schon offen und an der Reihe ist (sonst wäre die Datumssperre umgangen)
    const startOk = START_DOOR && doorInfo(START_DOOR)?.load && canPlay(START_DOOR, { save: this.save, now: today(FAKE_DATE), test: TEST_MODE });
    if (startOk) await this.playDoor(START_DOOR, { skipIntro: SKIP_INTRO });
    else await this.overlay.showCard({ kind: 'title', title: 'Detective Joseph', subtitle: 'Der Rätsel-Adventskalender von Johannes', continueText: 'Klicken zum Starten' });
    for (;;) {
      this.overlay.fade = 0;
      this.sound.tunnel(false);
      this.music.play(MENU, 0.5); // eigene Musik im Hauptmenü
      const door = await this.calendar.open({ save: this.save, now: today(FAKE_DATE), test: TEST_MODE });
      await this.playDoor(door, { skipIntro: SKIP_INTRO });
    }
  }

  // Eine Tür spielen: Wagen laden, Mitgebrachtes übergeben, warten bis er geschafft ist, Spielstand speichern
  async playDoor(door, { skipIntro = false } = {}) {
    const entry = doorInfo(door);
    this.voices.preloadWagon(door);
    this.music.stop();
    this.music.preload(wagonTrack(door));
    this.overlay.fade = 1;
    this.scene = null;
    const { scene, script } = await entry.load();
    const carried = this.save.carriedInto(door);
    await this.loadScene(scene, script, {
      items: [...new Set([...carried.items, ...(script.startItems ?? [])])],
      notes: carried.notes,
    });
    this.door = door;
    const startedAt = performance.now();
    const done = new Promise((resolve) => {
      this.finished = resolve;
    });
    // Musik erst 2 s nach dem Intro-Text (src/audio/music.js)
    const story = this.story;
    story.begin({ skipIntro }).then(() => {
      if (this.story === story && this.finished) this.music.playWagon(door);
    });
    await done;
    this.music.stop(2.5);
    this.finished = null;
    this.save.complete(door, {
      items: this.inventory.items.filter((id) => ITEMS[id]?.keep),
      notes: this.notebook.entries.filter((entry) => !entry.carried).map((entry) => entry.text),
      minutes: Math.max(1, Math.round((performance.now() - startedAt) / 60000)),
    });
    this.closeViews();
    this.speech.finish();
    this.hints.hide();
  }

  // Vom Drehbuch aufgerufen (story.finish()), wenn der Wagen geschafft ist
  finishDoor() {
    this.finished?.();
  }

  // Lädt eine Szene samt Bildern, stellt Joseph an seine Startposition und bereitet die Geschichte vor.
  // carried = was Joseph aus früheren Wagen mitbringt: { items: ['flashlight'], notes: [{ door, text }] }.
  // Ohne carried (Teil 1, durch die Tür in den nächsten Wagen) behält Joseph Inventar und Notizbuch,
  // und der Zug fährt einfach weiter (gleiche Stelle, gleiche Runde).
  async loadScene(sceneData, script, carried = null) {
    const scene = new Scene(sceneData);
    scene.fitCursors(script);
    await Promise.all([scene.load(), this.prepare()]);
    const previous = this.scene?.motion;
    this.story?.cancelAction();
    this.closeViews();
    this.notebook.close();
    this.speech.finish();
    this.hints.hide();
    this.inventory.selected = null;
    if (carried) {
      this.inventory.clear(carried.items);
      this.notebook.clear(carried.notes);
    }
    this.overlay.card = null;
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

  start() {
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame(this.loop);
    });
    this.run();
  }

  // Ist gerade der Kalender zu sehen (oder wird ein Wagen geladen)?
  get inCalendar() {
    return this.calendar.isOpen || !this.scene;
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
    if (this.inCalendar) {
      this.calendar.update(dt, this.input.mouse);
      this.overlay.update(dt);
      this.music.update(dt, this);
      this.settings.update(dt, this.input.mouse);
      const onSettings = this.calendar.isOpen && this.settings.contains(this.input.mouse);
      const label = onSettings ? this.settings.labelAt(this.input.mouse) : this.calendar.isOpen ? this.calendar.label : '';
      this.cursor.set({ kind: 'interact', label, visible: this.calendar.isOpen || this.overlay.blocksInput });
      return;
    }
    this.scene.update(dt);
    this.camera.shakeY = this.scene.motion?.shakeY ?? 0; // der Zug rumpelt
    this.player.update(dt, this.scene);
    this.story.update(dt);

    // Lange nichts getan: Joseph gähnt
    this.idleTime = this.story.isBusy || this.view || this.overlay.blocksInput || this.settings.isOpen ? 0 : this.idleTime + dt;
    if (this.idleTime > YAWN_AFTER) {
      this.idleTime = 0;
      this.voices.react('tired');
    }

    // Taschenlampe: leuchtet im Dunkeln dorthin, wo die Maus ist
    const mouse = this.camera.screenToWorld(this.input.mouse);
    const flashlight = this.scene.darkLevel > 0 && this.inventory.has('flashlight') && this.input.mouse.inside;
    this.scene.beam = this.story.beamAt ?? (flashlight ? mouse : null); // in Zwischensequenzen darf die Geschichte selbst leuchten

    this.music.update(dt, this);
    this.speech.update(dt);
    this.hints.update(dt);
    this.notebook.update(dt, this.input.mouse);
    for (const view of Object.values(this.views)) view.update(dt, this.input.mouse);
    this.overlay.update(dt);
    this.inventory.update(dt, this.input.mouse);
    this.settings.update(dt, this.input.mouse);
    this.updateCursor();
    this.debug.update(dt);
  }

  draw() {
    const ctx = this.screen.beginFrame();
    if (this.inCalendar) {
      if (this.calendar.isOpen) this.calendar.draw(ctx, this.input.mouse);
      else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 1280, 720);
      }
      this.overlay.draw(ctx);
      if (this.calendar.isOpen) this.settings.draw(ctx);
      this.cursor.draw(ctx, this.input.mouse);
      return;
    }

    // 1) Spielwelt – wird mit der Kamera verschoben (nicht nötig, wenn eine Nahansicht sie ganz verdeckt)
    if (!this.view?.covers) {
      ctx.save();
      this.camera.apply(ctx);
      this.scene.draw(ctx, this.player);
      this.debug.drawWorld(ctx, this);
      ctx.restore();
    }

    // 2) Benutzeroberfläche – bleibt fest auf dem Bildschirm
    this.hints.draw(ctx);
    this.inventory.draw(ctx);
    this.notebook.drawButton(ctx, this.notebook.buttonContains(this.input.mouse));
    this.view?.draw(ctx);
    this.speech.draw(ctx); // über der Nahansicht: Joseph kommentiert, was er dort sieht
    this.notebook.drawPage(ctx);
    this.overlay.draw(ctx);
    if (this.overlay.fade < 0.5) this.settings.draw(ctx);
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
    if (this.overlay.fade < 0.5 && (this.settings.isOpen || this.settings.gearContains(mouse))) {
      return this.cursor.set({ kind: 'interact', label: this.settings.labelAt(mouse) });
    }
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
    this.idleTime = 0;
    this.sound.start(); // Browser erlauben Ton erst nach der ersten Eingabe
    this.effects.prepareSamples();
    const settingsVisible = this.inCalendar ? this.calendar.isOpen : this.overlay.fade < 0.5;
    if (settingsVisible && !click.right && this.settings.handleClick(click)) return;
    if (settingsVisible && this.settings.isOpen) return;
    if (this.overlay.blocksInput) return this.overlay.handleClick(click);
    if (this.inCalendar) return this.calendar.isOpen && !click.right ? this.calendar.handleClick(click) : undefined;
    if (this.view) return this.view.handleClick(click, click.right);
    if (this.notebook.isOpen) {
      if (this.notebook.handleClick(click) === 'hint') {
        this.notebook.close();
        this.story.hint();
      }
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
    this.idleTime = 0;
    this.sound.start();
    this.effects.prepareSamples();
    if (key === KEYS.close && this.settings.isOpen) return this.settings.close();
    if (this.inCalendar) {
      if (key === KEYS.toggleSound) this.sound.toggleMute();
      return;
    }
    if (key === KEYS.toggleDebug && DEBUG_ALLOWED) this.debug.toggle();
    if (key === KEYS.toggleGrid && DEBUG_ALLOWED) this.debug.toggleGrid();
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
      this.settings.close();
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
