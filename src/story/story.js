import { ITEMS, findCombination } from './items.js';
import { Tutorial } from './tutorial.js';
import { Scene } from '../scene/scene.js';
import { COLORS } from '../ui/text.js';

// Die Geschichte zur Laufzeit.
//
// Ein Drehbuch (z. B. src/story/wagon1.js) beschreibt, was in einem Wagen passiert. Diese Klasse
// führt es aus und gibt ihm einfache Befehle an die Hand:
//
//   await story.say('Hallo?')           Joseph sagt etwas (wartet, bis der Satz vorbei ist)
//   story.note('…')                     Eintrag ins Notizbuch
//   story.give('knife')                 Gegenstand ins Inventar   (story.has('knife'), story.remove('knife'))
//   story.flags.letterRead = true       Merker setzen – Merker steuern auch, was im Raum zu sehen ist
//   await story.wait(1.5)               warten (Sekunden)
//   await story.cutscene(async () => …) Zwischensequenz: Der Spieler kann so lange nicht eingreifen
//   story.sound('pickup')               Geräusch abspielen (siehe src/audio/soundEffects.js)
//   await story.card({ … })             Karte zeigen: Brief, gezeichnetes Blatt … (siehe src/ui/overlay.js)
//   await story.view('wires')           Nahansicht öffnen: Rätsel, Zahlenschloss … (siehe src/puzzles/)
//   await story.choose(['A', 'B'])      Auswahl im Gespräch: Ergebnis 0, 1 … oder -1 (abgebrochen)
//   await story.speak('…', { at })      jemand anderes spricht (Farbe und Stelle wählbar)
//   await story.goToWagon(2)            durch die Tür in den nächsten Wagen
//
// Außerdem darf ein Drehbuch enthalten:
//   itemName(story, id)                 eigener Name für einen Gegenstand (z. B. "Papierfetzen (3 von 6)")
//   prepare(story)                      wer direkt in diesem Wagen anfängt (Spielstand, ?wagen=3), bekommt hier
//                                       die Sachen, die er aus den Wagen davor hätte
//   hint(story)                         Tipp, wenn der Spieler nicht weiterweiß (Taste H / Notizbuch)
//   update(story, dt)                   wird in jedem Bild aufgerufen
//
// Reaktionen im Drehbuch dürfen ein Text, eine Liste von Texten oder eine Funktion sein:
//   look: 'Nichts Besonderes.'
//   look: ['Erster Satz.', 'Zweiter Satz.']
//   use: async (story) => { … }

const SPEAKER = { x: 452, y: 66 }; // Stimme aus dem Lautsprecher über dem Tisch
const SUBTITLE = { x: 640, y: 664 }; // hier stehen Josephs Sätze, solange eine Nahansicht offen ist
const NOPE = ['Das bringt nichts.', 'Das passt nicht zusammen.', 'Nein, so geht das nicht.'];

export class Story {
  constructor(game, script) {
    this.game = game;
    this.script = script;
    this.flags = { ...script.flags };  // Merker (Spielstand)
    this.events = new Set();           // was schon passiert ist (fürs Tutorial), z. B. 'walked'
    this.tutorial = new Tutorial(script.tutorial ?? []);
    this.busy = 0;                     // > 0: Joseph antwortet gerade – ein Klick überspringt nur den Satz
    this.scenes = 0;                   // > 0: Zwischensequenz läuft
    this.actionId = 0;                 // zählt Aktionen; eine neue Aktion bricht die alte ab
    this.arrival = null;               // wartet darauf, dass Joseph am Ziel ankommt
    this.timers = [];
  }

  // ---------------------------------------------------------------- Abkürzungen
  get player() { return this.game.player; }
  get scene() { return this.game.scene; }
  get motion() { return this.game.scene.motion; }
  get lap() { return this.motion?.lap ?? 1; }
  get isDark() { return this.game.scene.isDark; }
  get isBusy() { return this.busy > 0 || this.scenes > 0; }
  get inCutscene() { return this.scenes > 0; }

  // ---------------------------------------------------------------- Befehle für das Drehbuch
  say(text) {
    return this.game.speech.show(text, { anchor: () => (this.game.view ? SUBTITLE : this.headOf(this.player)) });
  }

  // Jemand anderes spricht, z. B. die Lautsprecherstimme
  speak(text, { at = SPEAKER, color = COLORS.speaker } = {}) {
    return this.game.speech.show(text, { anchor: () => (this.game.view ? SUBTITLE : at), color });
  }

  note(text) {
    this.game.notebook.add(text, this.lap);
    this.sound('page');
  }

  give(id) {
    this.game.inventory.add(id);
    this.sound('pickup');
  }

  remove(id) {
    this.game.inventory.remove(id);
  }

  has(id) {
    return this.game.inventory.has(id);
  }

  sound(name, ...args) {
    this.game.effects.play(name, ...args);
  }

  // Für das Tutorial: merken, dass etwas passiert ist
  event(name) {
    this.events.add(name);
  }

  happened(name) {
    return this.events.has(name);
  }

  wait(seconds) {
    return new Promise((resolve) => this.timers.push({ left: seconds, resolve }));
  }

  // Wartet, bis keine Zwischensequenz mehr läuft
  async idle() {
    while (this.isBusy) await this.wait(0.1);
  }

  async cutscene(play) {
    this.cancelAction();
    this.game.closeViews();
    this.player.movement.stop();
    this.game.inventory.selected = null;
    this.scenes += 1;
    try {
      await play();
    } finally {
      this.scenes -= 1;
    }
  }

  fadeOut(seconds = 1) {
    return this.game.overlay.fadeTo(1, seconds);
  }

  fadeIn(seconds = 1) {
    return this.game.overlay.fadeTo(0, seconds);
  }

  card(card) {
    return this.game.overlay.showCard(card);
  }

  codeLock(options) {
    return this.game.views.lock.open(options);
  }

  // Öffnet eine Nahansicht (siehe game.views) und wartet, bis sie wieder geschlossen wird
  view(name, options) {
    return this.game.views[name].open(options);
  }

  // Auswahl im Gespräch (siehe src/ui/choice.js)
  async choose(options, title) {
    this.busy += 1;
    try {
      return await this.game.views.choice.open({ options, title });
    } finally {
      this.busy -= 1;
    }
  }

  goToWagon(number) {
    return this.game.goToWagon(number);
  }

  // So heißt ein Gegenstand gerade (das Drehbuch darf den Namen aus dem Katalog überschreiben)
  itemName(id) {
    return this.script.itemName?.(this, id) ?? ITEMS[id].name;
  }

  // Tipp von Joseph, wenn der Spieler nicht weiterweiß
  async hint() {
    if (this.isBusy) return;
    this.event('askedHint');
    await this.respond(this.script.hint?.(this) ?? 'Ich sehe mich am besten noch einmal gründlich um.');
  }

  // Joseph läuft zu einem Punkt. Ergebnis: true = angekommen, false = unterwegs abgebrochen
  walkTo(x, y, facing) {
    this.arrival?.resolve(false);
    this.player.walkTo({ x, y }, this.scene.walkArea);
    return new Promise((resolve) => {
      this.arrival = { resolve, facing };
    });
  }

  // Joseph dreht sich zu einem Punkt hin
  faceToward(point) {
    const dx = point.x - this.player.x;
    if (Math.abs(dx) > 110) this.player.facing = dx > 0 ? 'right' : 'left';
    else this.player.facing = point.y < this.player.y ? 'back' : 'front';
  }

  // Stelle über dem Kopf einer Figur (für Sprechtexte)
  headOf(figure) {
    return { x: figure.x, y: figure.y - this.scene.characterHeightAt(figure.y) - 12 };
  }

  // ---------------------------------------------------------------- Ablauf
  async begin({ skipIntro = false, fresh = false } = {}) {
    if (fresh) await this.script.prepare?.(this);
    await this.script.setup?.(this);
    if (skipIntro) await this.script.skipIntro?.(this);
    else await this.script.intro?.(this);
  }

  update(dt) {
    for (const timer of this.timers) timer.left -= dt;
    const due = this.timers.filter((timer) => timer.left <= 0);
    this.timers = this.timers.filter((timer) => timer.left > 0);
    for (const timer of due) timer.resolve();

    if (this.arrival && !this.player.movement.isMoving) {
      const { resolve, facing } = this.arrival;
      this.arrival = null;
      if (facing) this.player.facing = facing;
      resolve(true);
    }
    this.script.update?.(this, dt);
    this.tutorial.update(dt, this, this.game.hints);
  }

  // Eine neue Aktion des Spielers bricht die alte ab (z. B. das Hinlaufen zu etwas anderem)
  cancelAction() {
    this.actionId += 1;
    this.arrival?.resolve(false);
    this.arrival = null;
  }

  // ---------------------------------------------------------------- Was bei Klicks passiert
  // Rechtsklick auf etwas im Raum: Joseph bleibt stehen, dreht sich hin und sagt etwas dazu.
  async look(hotspot) {
    this.cancelAction();
    this.player.movement.stop();
    this.faceToward(Scene.centerOf(hotspot));
    this.event('looked');
    await this.respond(this.reaction(hotspot.id, 'look') ?? 'Nichts Besonderes.');
  }

  // Linksklick auf etwas im Raum: hinlaufen, dann benutzen / nehmen / ansprechen
  async use(hotspot) {
    if (!(await this.approach(hotspot))) return;
    this.event('used');
    const fallback = hotspot.cursor === 'talk' ? ['Hallo?', '…'] : hotspot.cursor === 'look' ? this.reaction(hotspot.id, 'look') : null;
    await this.respond(this.reaction(hotspot.id, 'use') ?? fallback ?? 'Das bringt nichts.');
  }

  // Gegenstand aus dem Inventar auf etwas im Raum anwenden
  async useItem(item, hotspot) {
    if (!(await this.approach(hotspot))) return;
    const reactions = this.script.hotspots?.[hotspot.id]?.items ?? {};
    const reaction = reactions[item] ?? reactions.other;
    if (reaction) this.event('usedItem');
    await this.respond(reaction ?? pick(NOPE));
  }

  // Rechtsklick auf einen Gegenstand im Inventar
  async lookItem(item) {
    this.event('lookedItem');
    await this.respond(this.script.items?.[item]?.look ?? ITEMS[item].look);
  }

  // Zwei Gegenstände im Inventar miteinander verbinden
  async combine(a, b) {
    const recipe = findCombination(a, b);
    if (!recipe) return this.respond('Das passt nicht zusammen.');
    for (const id of recipe.items) if (id !== recipe.items[0]) this.remove(id);
    this.game.inventory.replace(recipe.items[0], recipe.result);
    this.sound('combine');
    this.event('combined');
    await this.respond(recipe.say);
    await this.script.onCombine?.(this, recipe.result);
  }

  async openNotebook() {
    this.game.notebook.open();
    this.sound('page');
    this.event('openedNotebook');
  }

  // Ereignisse vom Zug (Tunnel, Licht)
  onTunnel(inside) {
    this.script.onTunnel?.(this, inside);
  }

  // ---------------------------------------------------------------- Hilfen
  reaction(id, verb) {
    return this.script.hotspots?.[id]?.[verb];
  }

  // Zu einer anklickbaren Stelle laufen. false, wenn der Spieler inzwischen etwas anderes angeklickt hat.
  async approach(hotspot) {
    this.cancelAction();
    const action = this.actionId;
    if (hotspot.walkTo) {
      const arrived = await this.walkTo(hotspot.walkTo[0], hotspot.walkTo[1], hotspot.facing);
      if (!arrived) return false;
    } else {
      this.player.movement.stop();
      this.faceToward(Scene.centerOf(hotspot));
    }
    return action === this.actionId;
  }

  // Führt eine Reaktion aus (Text, Liste von Texten oder Funktion). Solange sie läuft, ist Joseph beschäftigt.
  async respond(reaction) {
    this.busy += 1;
    try {
      if (typeof reaction === 'function') await reaction(this);
      else for (const line of [].concat(reaction)) await this.say(line);
    } finally {
      this.busy -= 1;
    }
  }
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
