import { ITEMS, findCombination } from './items.js';
import { Tutorial } from './tutorial.js';
import { Scene } from '../scene/scene.js';
import { COLORS } from '../ui/text.js';
import { SOLUTIONS } from './solutions.js';
import { drawSolutionPage, solutionPages } from '../ui/solutionCard.js';

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
//   story.finish()                      Wagen geschafft: Spielstand speichern, zurück zur Wagenübersicht
//
// Außerdem darf ein Drehbuch festlegen:
//   startItems: ['flashlight']          Gegenstände, die Joseph zu Beginn sicher dabeihat (zusätzlich zu dem,
//                                       was er aus dem letzten geschafften Wagen mitbringt, siehe items.js: keep)
//   await story.choose(['A', 'B'])      Auswahl im Gespräch: Ergebnis 0, 1 … oder -1 (abgebrochen)
//   await story.speak('…', { at })      jemand anderes spricht (Farbe und Stelle wählbar)
//
// Außerdem darf ein Drehbuch enthalten:
//   itemName(story, id)                 eigener Name für einen Gegenstand (z. B. "Papierfetzen (3 von 6)")
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
  async say(text) {
    this.player.talking = true;
    this.player.gesture = null;
    try {
      await this.game.speech.show(text, { anchor: () => (this.game.view ? SUBTITLE : this.headOf(this.player)) });
    } finally {
      this.player.talking = false;
    }
  }

  // Eine Figur im Wagen spricht (siehe src/scene/character.js) – solange zeigt sie ihre Sprech-Pose
  async speakAs(id, text) {
    const character = this.scene.character(id);
    character.talking = true;
    try {
      await this.game.speech.show(text, {
        anchor: () => (this.game.view ? SUBTITLE : character.head(this.scene)),
        color: character.data.color ?? COLORS.speaker,
      });
    } finally {
      character.talking = false;
    }
  }

  character(id) {
    return this.scene.character(id);
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

  // Ein Ton (Klavier, Glocke, Morsepiepen …): story.tone(440, { duration: 0.5 })
  tone(frequency, options) {
    this.game.effects.note(frequency, options);
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

  // Wagen geschafft (meist nach der Abschlusskarte): Der Spielstand wird gespeichert, dann kommt der Kalender
  finish() {
    this.game.finishDoor();
  }

  // Der Wagen (die Tür), der gerade gespielt wird (1–24)
  get door() {
    return this.game.door;
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

  // Gesprächsauswahl: Ergebnis = Nummer der Antwort (0, 1, …) oder -1, wenn der Spieler abbricht
  // Gibt es die gewählte Frage gesprochen (assets/voices/), stellt Joseph sie laut.
  async choose(options) {
    const choice = await this.game.views.dialogue.open({ options });
    const option = options[choice];
    const text = typeof option === 'string' ? option : option?.text;
    if (text && this.game.voices.has(text)) await this.say(text);
    return choice;
  }

  // So heißt ein Gegenstand gerade (das Drehbuch darf den Namen aus dem Katalog überschreiben)
  itemName(id) {
    return this.script.itemName?.(this, id) ?? ITEMS[id].name;
  }

  // Taste H: der komplette Lösungsweg des Wagens (src/story/solutions.js). Ohne Eintrag: Josephs Tipp.
  async hint() {
    if (this.isBusy) return;
    this.event('askedHint');
    this.game.voices.react('think');
    const steps = SOLUTIONS[this.door];
    if (!steps) {
      await this.respond(this.script.hint?.(this) ?? 'Ich sehe mich am besten noch einmal gründlich um.');
      return;
    }
    const pages = solutionPages(steps);
    this.busy++;
    try {
      for (const [index, page] of pages.entries()) {
        await this.card({ draw: (ctx) => drawSolutionPage(ctx, { door: this.door, page, index, count: pages.length }) });
      }
    } finally {
      this.busy--;
    }
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
    for (const id of this.script.startItems ?? []) this.game.inventory.add(id);
    this.game.inventory.revealTime = 0;
    // Was bisher geschah – nur, wenn keine Notizen aus früheren Wagen mitgekommen sind (z. B. im Test-Modus)
    if (!this.game.notebook.entries.some((entry) => entry.carried)) {
      for (const text of this.script.recap ?? []) this.game.notebook.add(text, 0);
    }
    this.game.notebook.unread = 0;
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

  // Ereignisse vom Zug (Tunnel, Licht, quietschende Räder)
  onTunnel(inside) {
    this.script.onTunnel?.(this, inside);
  }

  onSqueal(duration) {
    this.squealUntil = this.motion.time + duration;
    this.script.onSqueal?.(this, duration);
  }

  // Quietschen die Räder gerade? (Dann hört und sieht niemand genau hin.)
  get squealing() {
    return (this.squealUntil ?? 0) > (this.motion?.time ?? 0);
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
