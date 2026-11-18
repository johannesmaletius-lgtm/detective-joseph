import { TUTORIAL_WAGON1 } from './tutorial.js';
import { CameraFeed } from '../puzzles/cameraFeed.js';
import { SUDOKU_CODE, drawCaseFile, drawPuzzlePage, drawSignalCard } from '../ui/cards.js';

// ============================================================================================
//  WAGEN 1 – „Die Ringbahn“
// ============================================================================================
//
// Joseph wacht in einem Nachtzug auf und weiß nicht, wie er hineingekommen ist. Auf seinem Unterarm
// steht in seiner eigenen Schrift: NICHT EINSCHLAFEN. Der Zug fährt im Kreis. In jeder Runde geht
// im Tunnel das Licht aus – und danach ist im Abteil alles wieder so wie vorher. Nur was Joseph
// bei sich trägt, bleibt. Ein früherer Joseph hat deshalb Hinweise hinterlassen, die der Tunnel
// nicht löschen kann.
//
// DAS ZIEL: Die Tür nach vorne hat ein Schloss mit vier Rädchen. Über jedem Rädchen ist ein
// Zeichen eingraviert – zu jedem gehört eine Ziffer:
//
//   Tunnel          5       groß an die Tunnelwand gemalt – zu sehen nur auf dem Bild der Tunnelkamera
//   Laterne links   7       so viele Laternen stehen pro Runde links …
//   Laterne rechts  8       … und rechts (zählen – oder im Dunkeln die Kratzer in der Tür finden)
//   Turm            3       das rote Turmlicht blinkt die Ziffer im Morsecode
//
// DIE RÄTSEL (bis auf den Anfang in beliebiger Reihenfolge):
//   1. Brief aus dem Schlitz lesen → Rucksack: Taschenlampe (leer) und kleiner Schlüssel
//   2. Schlüssel → Werkzeugkiste: Taschenmesser und der erste Papierfetzen
//   3. Sechs Papierfetzen sammeln (Boden ×2, unter der Zeitung, unter der Kiste, Werkzeugkiste,
//      Zigarrenkiste – die geht nur mit dem Messer auf) und zusammensetzen → Signaltafel (Morsetabelle)
//   4. Rätselheft: Zahlenquadrat lösen → drei Ziffern für das Kofferschloss → Fernglas (+ Josephs Akte)
//   5. Fernglas am Fenster: Turmlicht mitschreiben, mit der Signaltafel übersetzen → Ziffer „Turm“
//   6. Verteilerkasten: Kabelstücke drehen, bis das Kamerasignal am Bildschirm ankommt
//      → Bildschirm ansehen: Tunnelkamera → Ziffer „Tunnel“
//   7. Messer an der Klappe des Schaltpults → Batterie. Die Taschenlampe braucht aber ZWEI:
//      Nach dem nächsten Tunnel ist die Klappe wieder zu und die Batterie wieder da – noch einmal holen.
//   8. Im Tunnel (Licht aus) mit der Taschenlampe die Tür ableuchten → Kratzer: Laternen links / rechts
//   9. Vier Ziffern am Türschloss → die Tür geht auf, Ende von Wagen 1
//
// Jede anklickbare Stelle (siehe hotspots in src/scene/trainCompartment.js) hat hier ihre Reaktionen:
//   look  = Rechtsklick (anschauen)    use = Linksklick (benutzen, nehmen, ansprechen)
//   items = was passiert, wenn man einen Gegenstand aus dem Inventar darauf anwendet
// Eine Reaktion ist ein Satz, eine Liste von Sätzen oder eine Funktion (story) => { … }.
// Die Befehle für Funktionen (say, note, give, …) erklärt src/story/story.js.

const NUMBERS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const FIRST_TUNNEL_IN = 60; // Fahrsekunden in der Runde beim Start: der erste Tunnel kommt nach gut einer Minute
const TUNNEL_DIGIT = 5;     // die Ziffer an der Tunnelwand (Kamerabild)
const PIECES = 6;           // in so viele Fetzen ist der Fahrplan zerrissen (siehe src/puzzles/jigsaw.js)
const LOCK_SYMBOLS = ['tunnel', 'lanternLeft', 'lanternRight', 'tower'];

const feed = new CameraFeed({ digit: TUNNEL_DIGIT }); // das Bild der Tunnelkamera

export const wagon1 = {
  // Merker zu Beginn
  flags: {
    letterInSlot: true, // der Brief steckt im Schlitz am Schaltpult
    pieces: 0,          // so viele Papierfetzen hat Joseph schon
  },

  tutorial: TUTORIAL_WAGON1,

  setup(story) {
    story.motion.restartAt(FIRST_TUNNEL_IN);
    refreshScreen(story);
  },

  // ---------------------------------------------------------------- Anfang
  async intro(story) {
    story.game.overlay.fade = 1;
    await story.cutscene(async () => {
      await story.card({ kind: 'title', title: 'Detective Joseph', subtitle: 'Die Ringbahn', continueText: 'Klicken zum Starten' });
      story.motion.restartAt(FIRST_TUNNEL_IN); // die Zeit auf dem Titelbild zählt nicht
      story.player.facing = 'front';
      await story.wait(0.6);
      story.fadeIn(2.5);
      await story.wait(1.6);
      await story.say('… Hm?');
      await story.say('Ein Zug. Mitten in der Nacht.');
      await story.say('Wie bin ich hier reingekommen?');
      await story.say('Auf meinem Unterarm steht etwas. In meiner Schrift …');
      await story.card({ kind: 'hand' });
      await story.say('„Nicht einschlafen.“ Na gut. Ich bin wach. Hellwach.');
    });
    start(story);
  },

  // Mit ?skipintro in der Adresse: gleich losspielen
  skipIntro(story) {
    start(story);
  },

  // In jedem Bild: Kamerabild weiterlaufen lassen; reagieren, wenn Joseph darauf etwas entdeckt
  update(story, dt) {
    feed.update(dt);
    if (!story.game.views.crt.isOpen || !cameraOn(story)) return;
    if (story.motion.inTunnel && !story.flags.trainSeen) {
      story.flags.trainSeen = true;
      story.say('Das sind wir! Unser Zug fährt gerade an der Kamera vorbei.');
    }
    if (figureLevel(story) > 0.7 && !story.flags.figureSeen) {
      story.flags.figureSeen = true;
      seeFigure(story);
    }
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    door: {
      look: async (story) => {
        await story.say('Die Tür zum nächsten Wagen. Abgeschlossen – mit einem dicken Messingschloss.');
        await story.say('Vier Rädchen. Über jedem ist ein Zeichen eingraviert: ein Tunnel, eine Laterne mit Pfeil nach links, eine mit Pfeil nach rechts, ein Turm.');
        story.note('Türschloss: vier Rädchen, vier Zeichen – Tunnel, Laterne ←, Laterne →, Turm. Zu jedem Zeichen gehört eine Ziffer.');
      },
      use: (story) => tryLock(story),
      items: {
        knife: 'Das Schloss mit dem kleinen Messer aufbrechen? Keine Chance.',
        key: 'Viel zu klein. Dieses Schloss will keine Schlüssel, es will Ziffern.',
        letter: 'Der Brief sagt: vier Zahlen. Die Tür sagt: vier Zeichen.',
        binoculars: 'So nah brauche ich kein Fernglas.',
        flashlight: (story) => (story.isDark ? story.say('Ich leuchte die Tür ab … Da, weiter unten im Holz!') : story.say('Bei Licht sieht man hier nichts Besonderes.')),
      },
    },

    scratches: {
      look: (story) => readScratches(story),
      use: (story) => readScratches(story),
    },

    letter: {
      look: (story) => (story.flags.letterReturned
        ? story.say('Wieder ein Brief im Schlitz. Derselbe, den ich in der Tasche habe.')
        : story.say('Im Schlitz unter dem Briefsymbol steckt ein Brief.')),
      use: async (story) => {
        if (story.has('letter')) {
          await story.say('Den hab ich schon. Wort für Wort derselbe Brief.');
          return;
        }
        story.flags.letterInSlot = false;
        story.give('letter');
        await story.say('Ein Brief. Adressiert an „J.“');
      },
    },

    screen: {
      look: (story) => {
        if (story.flags.screenOff) return story.say('Schwarz. Ohne die Batterie läuft hier gar nichts.');
        if (story.flags.wiresDone) return story.say('Der Bildschirm zeigt ein Kamerabild. Von nah sehe ich mehr.');
        if (story.flags.sawSkull) return story.say('Im Tunnel war da ein Totenkopf drauf. Jetzt wieder nur Rauschen.');
        return story.say('Ein kleiner Bildschirm. Nur Rauschen.');
      },
      use: (story) => watchScreen(story),
      items: {
        binoculars: 'Der Bildschirm ist einen Meter vor mir. Dafür brauche ich kein Fernglas.',
        knife: 'Am Bildschirm selbst gibt es nichts aufzuschrauben. Aber darunter, am Schaltpult …',
      },
    },

    panel: {
      look: async (story) => {
        if (story.flags.coverOpen) return story.say('Die Klappe unten ist offen. Das Batteriefach ist leer.');
        await story.say('Knöpfe, Lämpchen, ein roter Drehknopf. Unten ist eine kleine Klappe – festgeschraubt. „Notstrom“ steht darauf.');
        story.note('Am Schaltpult unter dem Bildschirm ist eine festgeschraubte Klappe: „Notstrom“.');
      },
      use: async (story) => {
        if (story.flags.coverOpen) return story.say('Ohne Batterie leuchtet hier nichts mehr.');
        await story.say('Ich drück ein paar Knöpfe. Nichts.');
        await story.say('Interessant ist nur die Klappe unten. Aber die ist festgeschraubt.');
      },
      items: {
        knife: (story) => openCover(story),
        key: 'Der Schlüssel ist viel zu klein für diese Schrauben.',
        battery: 'Die Batterie wieder reinstecken? Nein, die brauche ich selbst.',
        other: 'Damit bekomme ich die Schrauben nicht auf.',
      },
    },

    switches: {
      look: async (story) => {
        if (story.flags.wiresDone) return story.say('Der Verteilerkasten. Die Leitung von der Kamera zum Bildschirm steht.');
        await story.say('Ein Blechkasten mit Glasklappe: „Signalverteiler“. Drinnen lauter Kabelstücke – kreuz und quer verdreht.');
        await story.say('Links kommt ein Kabel von „Kamera“, rechts geht eins zum „Bildschirm“. Dazwischen: Chaos.');
        story.note('Verteilerkasten links neben der Tür: Die Leitung von „Kamera“ zu „Bildschirm“ ist unterbrochen – die Kabelstücke sind verdreht.');
      },
      use: (story) => openWires(story),
      items: {
        knife: 'Aufschrauben muss ich hier nichts. Die Klappe geht einfach auf.',
        key: 'Der Kasten ist gar nicht abgeschlossen.',
      },
    },

    backpack: {
      look: (story) => {
        if (!story.flags.backpackSearched) return story.say('Ein alter Rucksack an der Wand. Irgendwie kommt er mir bekannt vor …');
        if (tunnelsSince(story, 'backpackSearched') > 0) return story.say('Der Rucksack ist wieder prall gefüllt. Dabei habe ich ihn doch ausgeräumt …');
        return story.say('Mein Rucksack. Bis auf die Fahrkarte leer.');
      },
      use: async (story) => {
        if (story.flags.backpackSearched) {
          if (tunnelsSince(story, 'backpackSearched') === 0) return story.say('Bis auf die Fahrkarte leer.');
          await story.say('Wieder eine Taschenlampe, wieder ein Schlüssel, wieder die Fahrkarte. Genau dieselben.');
          await story.say('Die hab ich ja schon. Ich lasse sie drin.');
          return;
        }
        story.flags.backpackSearched = tunnels(story) + 1;
        await story.say('Mal sehen, was drin ist …');
        story.give('flashlightEmpty');
        story.give('key');
        await story.say('Eine Taschenlampe – ohne Batterien. Ein kleiner Schlüssel. Und eine Fahrkarte.');
        await story.say('„RINGBAHN – gültig für 1 Runde.“ Kein Abfahrtsort, kein Ziel. Die lasse ich stecken.');
        story.note('Im Rucksack: eine Taschenlampe (braucht zwei Batterien), ein kleiner Schlüssel mit dem Anhänger „Werkzeug“ und eine Fahrkarte: „Ringbahn – gültig für 1 Runde“.');
      },
      items: {
        other: 'Das stecke ich lieber in meine Jackentasche. Im Rucksack bleibt nichts, was ich brauche.',
      },
    },

    toolbox: {
      look: (story) => (story.flags.toolboxOpen
        ? story.say('Die Werkzeugkiste. Ausgeräumt.')
        : story.say('Eine kleine Werkzeugkiste aus Blech. Mit einem Schloss dran.')),
      use: (story) => (story.flags.toolboxOpen
        ? story.say('Leer. Das Messer und den Fetzen hab ich.')
        : story.say('Abgeschlossen. Da müsste ein kleiner Schlüssel rein.')),
      items: {
        key: (story) => openToolbox(story),
        knife: 'Das Messer war doch selbst da drin.',
        other: 'Damit bekomme ich das Schloss nicht auf.',
      },
    },

    cigarbox: {
      look: (story) => (story.flags.pieceCigar
        ? story.say('Die Zigarrenkiste. Leer.')
        : story.say('Eine Zigarrenkiste. Der Deckel klemmt. Wenn ich sie schüttle, raschelt etwas.')),
      use: (story) => (story.flags.pieceCigar
        ? story.say('Leer. Nicht einmal eine Zigarre.')
        : story.say('Der Deckel klemmt. Mit den Fingern bekomme ich ihn nicht auf – ich bräuchte etwas Dünnes, Festes.')),
      items: {
        knife: async (story) => {
          if (story.flags.pieceCigar) return story.say('Die ist schon offen. Und leer.');
          await story.say('Mit der Klinge hebel ich den Deckel auf …');
          story.sound('creak');
          await story.wait(0.6);
          story.flags.pieceCigar = true;
          await addPieces(story, 1, 'Keine Zigarren. Nur ein Papierfetzen.');
        },
        key: 'Die Kiste hat kein Schloss. Der Deckel klemmt einfach.',
      },
    },

    bottles: {
      look: 'Zwei leere Flaschen. Wer hier saß, hatte Durst – und ist ohne Abschied gegangen.',
      use: 'Leer. Bis auf den letzten Tropfen.',
    },

    table: {
      look: 'Ein Klapptisch. Flaschen, eine Zigarrenkiste – als wäre gerade erst jemand aufgestanden.',
      use: 'Am Tisch selbst ist nichts. Aber die Zigarrenkiste darauf …',
    },

    newspaper: {
      look: async (story) => {
        await story.say('Das Datum ist verschmiert.');
        await story.say('Auf jeder Seite dieselbe Schlagzeile: „NACHTZUG SPURLOS VERSCHWUNDEN“.');
        story.note('Zeitung: „Nachtzug spurlos verschwunden“. Das Datum ist verschmiert.');
        if (!story.flags.pieceNews) await story.say('Und unter der Zeitung schaut eine Papierecke hervor.');
      },
      use: async (story) => {
        if (story.flags.pieceNews) return story.say('Die Zeitung nehme ich nicht mit. Aber die Schlagzeile merke ich mir.');
        await story.say('Ich heb die Zeitung mal an …');
        story.flags.pieceNews = true;
        await addPieces(story, 1, 'Darunter lag ein Papierfetzen.');
      },
    },

    papers: {
      look: 'Zerrissenes Papier. Sieht aus wie ein Fahrplan – jemand hat Kreise darauf gemalt und ihn dann zerfetzt.',
      use: async (story) => {
        if (story.flags.pieceFloor) return story.say('Der Rest ist nur noch Konfetti.');
        story.flags.pieceFloor = true;
        await addPieces(story, 2, 'Zwei Fetzen sind groß genug, um etwas zu erkennen. Die nehme ich mit.');
      },
    },

    crate: {
      look: async (story) => {
        await story.say('Eine schwere Kiste. Zugenagelt.');
        if (!story.flags.pieceCrate) await story.say('Darunter klemmt ein Stück Papier.');
      },
      use: async (story) => {
        if (story.flags.pieceCrate) return story.say('Zugenagelt. Und viel zu schwer zum Tragen.');
        await story.say('Ich stemme mich gegen die Kiste …');
        story.sound('creak');
        await story.wait(0.7);
        story.flags.pieceCrate = true;
        await addPieces(story, 1, '… und zieh den Papierfetzen darunter heraus.');
      },
      items: { knife: 'Mit dem Messer bekomme ich die Nägel nicht raus.' },
    },

    magazine: {
      look: (story) => (story.flags.magazineRead
        ? story.say('Das Rätselheft mit dem halb gelösten Zahlenquadrat.')
        : story.say('Ein Rätselheft. Zerlesen, voller Eselsohren.')),
      use: (story) => readMagazine(story),
    },

    suitcase: {
      look: async (story) => {
        if (story.flags.suitcaseOpen) return story.say('Mein Koffer. Offen und leer.');
        await story.say('Ein roter Koffer auf der Gepäckablage, mit einer Kette gesichert.');
        await story.say('An der Kette hängt ein Schloss mit drei Rädchen. Und ein Anhänger: „J.“');
        story.note('Der rote Koffer auf der Ablage trägt einen Anhänger „J.“ – meiner? Er hängt an einer Kette mit Zahlenschloss: drei Ziffern.');
      },
      use: (story) => openSuitcase(story),
      items: {
        knife: 'Die Kette ist fingerdick. Da ist das Messer machtlos.',
        key: 'Das Schloss hat kein Schlüsselloch. Nur drei Rädchen.',
      },
    },

    window: {
      look: (story) => lookOutside(story),
      use: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Die Fenster gehen nicht auf.'),
      items: {
        binoculars: (story) => watchTower(story),
        flashlight: 'Die Scheibe spiegelt nur. Draußen ist es zu weit für die kleine Lampe.',
      },
    },

    speaker: {
      look: 'Ein Lautsprecher für Durchsagen.',
      use: async (story) => {
        await story.say(story.flags.heardAnnouncement ? 'Hallo? Wo liegt dieser Ringbahnhof?' : 'Hallo? Ist da jemand?');
        story.sound('speaker');
        await story.wait(1.2);
        await story.say('Nur ein Knistern.');
      },
    },

    intercom: {
      look: 'Eine Sprechanlage. „LOKFÜHRER“ steht darauf.',
      use: async (story) => {
        await story.say('Hallo, Lokführer? Wohin fahren wir?');
        story.sound('speaker');
        await story.wait(1.2);
        await story.say('Keine Antwort. Nur Rauschen.');
      },
    },

    lamp: { look: 'Eine Lampe über der Tür. Sie flackert, wenn wir über Schienenstöße rumpeln.' },
    jar: {
      look: ['Ein Glas mit grün leuchtender Flüssigkeit.', 'Auf dem Etikett steht: „Probe 41“. Ich will gar nicht wissen, wovon.'],
      use: 'Lieber nicht anfassen.',
    },
    extinguisher: { look: 'Ein Feuerlöscher. Geprüft am … unleserlich.', use: 'Hier brennt nichts. Noch nicht.' },

    bench: {
      look: 'Eine durchgesessene Sitzbank. Hier könnte ich auf den nächsten Tunnel warten.',
      use: (story) => waitForTunnel(story),
    },
  },

  // ---------------------------------------------------------------- Gegenstände (Rechtsklick im Inventar)
  items: {
    letter: { look: (story) => readLetter(story) },
    pieces: { look: (story) => openJigsaw(story) },
    sheet: {
      look: async (story) => {
        story.sound('paper');
        await story.card({ draw: drawSignalCard });
      },
    },
  },

  itemName(story, id) {
    return id === 'pieces' ? `Papierfetzen (${story.flags.pieces} von ${PIECES})` : null;
  },

  async onCombine(story, result) {
    if (result === 'flashlightHalf') {
      story.note('Die Taschenlampe braucht zwei Batterien. Eine habe ich – aber im Fach am Schaltpult war nur diese eine.');
    }
    if (result === 'flashlight') {
      story.note('Die Taschenlampe geht. Wenn im Tunnel das Licht ausgeht, kann ich mich damit umsehen.');
    }
  },

  hint: (story) => nextHint(story),

  // ---------------------------------------------------------------- Tunnel: Licht aus
  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      if (story.flags.tunnels === 1) return firstTunnel(story);
      await story.idle();
      if (!inTunnel(story)) return;
      if (!story.has('flashlight')) await story.say('Wieder dunkel. Ohne Licht finde ich hier gar nichts.');
      else if (!story.flags.seenScratches) await story.say('Licht aus – Taschenlampe an. Der Brief sagt: die Tür!');
      return;
    }
    story.flags.leftTunnelAt = story.motion.time;
    await afterTunnel(story);
  },
};

// ============================================================================================
//  Kleine Helfer
// ============================================================================================

function start(story) {
  story.flags.startedAt = performance.now();
  story.note('Aufgewacht in einem Nachtzug. Keine Ahnung, wie ich hergekommen bin.');
  story.note('Auf meinem Unterarm, in meiner Schrift: Nicht einschlafen.');
}

// Ist es dunkel – oder wird es das gerade (der Zug ist schon im Tunnel, das Licht flackert noch)?
function inTunnel(story) {
  return story.isDark || story.motion.inTunnel;
}

function tunnels(story) {
  return story.flags.tunnels ?? 0;
}

// Wie viele Tunnel seit einem Ereignis vergangen sind. Der Merker speichert dafür "Tunnel bis dahin + 1".
function tunnelsSince(story, flag) {
  return tunnels(story) + 1 - story.flags[flag];
}

// "sieben" / "Sieben"
function word(count, capital = false) {
  const text = NUMBERS[count] ?? String(count);
  return capital ? text[0].toUpperCase() + text.slice(1) : text;
}

// Das Turmsignal (siehe blink.morse in src/scene/trainCompartment.js)
function towerSignal(story) {
  return story.scene.outside.signals.tower;
}

// Die vier Ziffern für die Tür: Tunnel, Laternen links, Laternen rechts, Turm
function doorCode(story) {
  return `${TUNNEL_DIGIT}${story.motion.lanternCount('left')}${story.motion.lanternCount('right')}${towerSignal(story).digits}`;
}

// ============================================================================================
//  Brief und Tür
// ============================================================================================

async function readLetter(story) {
  story.sound('paper');
  await story.card({
    kind: 'paper',
    lines: [
      'Joseph. Du hast wieder alles vergessen.',
      'Die Tür will vier Zahlen. Ich habe sie dort versteckt, wo der Tunnel sie nicht löschen kann.',
      'Die Laternen sind gezählt und in die Tür geritzt – du siehst sie erst, wenn das Licht aus ist.',
      'Der Turm spricht. Im Tunnel wacht ein Auge.',
      'Fang beim Rucksack an. Und merk dir: Was du bei dir trägst, bleibt.',
    ],
    signature: '– J.',
  });
  if (story.flags.letterRead) return;
  story.flags.letterRead = true;
  await story.say('Das ist … meine Schrift. Aber das hab ich nie geschrieben.');
  await story.say('Oder?');
  story.note('Brief in meiner Schrift: Die Tür will vier Zahlen. „Die Laternen sind in die Tür geritzt – zu sehen erst, wenn das Licht aus ist. Der Turm spricht. Im Tunnel wacht ein Auge. Fang beim Rucksack an. Was du bei dir trägst, bleibt.“');
}

// Das Schloss an der Tür: vier Rädchen, vier Zeichen
async function tryLock(story) {
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door',
    digits: 4,
    symbols: LOCK_SYMBOLS,
    check: (code) => {
      tries += 1;
      return code === doorCode(story);
    },
  });
  if (opened) return openDoor(story);
  if (inTunnel(story) || tries === 0) return;
  story.flags.lockTries = (story.flags.lockTries ?? 0) + tries;
  if (story.flags.lockTries >= 3 && !story.flags.lockHint) {
    story.flags.lockHint = true;
    await story.say('Zehntausend Möglichkeiten. Raten dauert ewig.');
    await story.say('Jedes Zeichen steht für eine Ziffer: Tunnel, Laterne links, Laterne rechts, Turm. Ich muss sie finden.');
  } else {
    await story.say('Nichts. Das Schloss bleibt zu.');
  }
}

// Code richtig: Die Tür geht auf, Ende von Wagen 1
async function openDoor(story) {
  await story.cutscene(async () => {
    story.flags.doorOpen = true;
    const left = story.motion.lanternCount('left'), right = story.motion.lanternCount('right');
    await story.say(`Tunnel ${word(TUNNEL_DIGIT)}. ${word(left, true)} Laternen links, ${word(right)} rechts. Und der Turm sagt: ${word(Number(towerSignal(story).digits))}.`);
    await story.say('Ich hab mir den Weg selbst hinterlassen. Ich war also wirklich schon einmal hier …');
    story.sound('door');
    await story.wait(1);
    await story.fadeOut(1.6);
    story.note('Die Tür ist offen. Weiter nach vorne – zum Speisewagen.');
    const minutes = Math.max(1, Math.round((performance.now() - story.flags.startedAt) / 60000));
    await story.card({
      kind: 'end',
      title: 'Ende von Wagen 1',
      lines: [`Joseph ist in Runde ${story.lap} durch die Tür gegangen – nach ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}.`, 'Weiter geht es im Speisewagen – bald.'],
      continueText: 'Klicken, um noch einmal von vorn zu spielen',
    });
    location.reload();
  });
}

// ============================================================================================
//  Werkzeugkiste, Papierfetzen, Signaltafel
// ============================================================================================

async function openToolbox(story) {
  if (story.flags.toolboxOpen) return story.say('Die ist schon offen.');
  story.sound('key');
  await story.wait(0.6);
  story.flags.toolboxOpen = true;
  story.remove('key');
  await story.say('Der Schlüssel passt!');
  story.give('knife');
  await story.say('Ein Taschenmesser. Die Spitze ist ganz stumpf.');
  await addPieces(story, 1, 'Und ganz unten klemmt ein Papierfetzen.');
  story.note('In der Werkzeugkiste: ein Taschenmesser mit stumpfer Spitze.');
}

// Joseph findet Papierfetzen und sagt etwas dazu
async function addPieces(story, count, line) {
  const first = story.flags.pieces === 0;
  story.flags.pieces += count;
  if (story.has('pieces')) {
    story.sound('paper');
    story.game.inventory.reveal(2);
  } else {
    story.give('pieces');
  }
  await story.say(line);
  if (story.flags.pieces >= PIECES) {
    await story.say('Sechs Fetzen. Das müssten alle sein – jetzt kann ich sie zusammensetzen.');
    story.note('Ich habe alle sechs Fetzen des zerrissenen Fahrplans.');
  } else if (first) {
    await story.say('Ein Stück von einem Fahrplan. Solche Fetzen liegen hier überall – ich sollte sie sammeln.');
    story.note('Im Abteil liegen die Fetzen eines zerrissenen Fahrplans verstreut: am Boden, unter Dingen, in Dingen.');
  }
}

// Rechtsklick auf die Papierfetzen: das Puzzle
async function openJigsaw(story) {
  story.event('openedJigsaw');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Fetzen nicht.');
  story.sound('paper');
  const complete = await story.view('jigsaw', { count: story.flags.pieces });
  if (!complete) {
    if (story.flags.pieces < PIECES && !inTunnel(story)) await story.say(`Da fehlen noch Stücke. Ich habe erst ${word(story.flags.pieces)} von ${word(PIECES)}.`);
    return;
  }
  if (story.flags.jigsawDone) return;
  story.flags.jigsawDone = true;
  story.game.inventory.replace('pieces', 'sheet');
  await story.say('Ein Fahrplan der Ringbahn. Abfahrt: Ringbahnhof. Ankunft: Ringbahnhof.');
  await story.say('Die Strecke ist ein Kreis – mit einem Turm genau in der Mitte.');
  await story.say('Und rechts eine Tabelle: „Lichtsignale des Turms“. Für jede Ziffer ein Blinkzeichen.');
  story.note('Der Fahrplan ist zusammengesetzt (Signaltafel im Inventar): Die Ringbahn fährt im Kreis um einen Turm. Der Turm blinkt Ziffern – die Tabelle steht auf der Signaltafel.');
}

// ============================================================================================
//  Rätselheft, Koffer, Fernglas
// ============================================================================================

async function readMagazine(story) {
  story.sound('paper');
  await story.card({ draw: drawPuzzlePage });
  if (story.flags.magazineRead) return;
  story.flags.magazineRead = true;
  await story.say('Alle Rätsel im Heft sind gelöst – in meiner Handschrift.');
  await story.say('Nur das letzte nicht. Drei Felder sind eingekreist, und am Rand steht: „Koffer“.');
  story.note('Rätselheft, letzte Seite: ein halb gelöstes Zahlenquadrat (1 bis 4, jede Zahl einmal pro Reihe, Spalte und Kästchen). Drei Felder sind eingekreist – ①, ②, ③ – daneben steht „Koffer“.');
}

async function openSuitcase(story) {
  if (story.flags.suitcaseOpen) return story.say('Der Koffer ist leer. Fernglas und Akte hab ich.');
  await story.say('Ich steige auf die Bank … so komme ich ran.');
  story.sound('chain');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'suitcase',
    digits: 3,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === SUDOKU_CODE;
    },
  });
  if (!opened) {
    if (tries === 0 || inTunnel(story)) return;
    await story.say('Falsch. Die Kette hält.');
    await story.say(story.flags.magazineRead
      ? 'Im Rätselheft stand „Koffer“ neben drei eingekreisten Feldern. Die muss ich ausrechnen.'
      : 'Drei Ziffern. Wenn der Koffer mir gehört, habe ich sie mir bestimmt irgendwo aufgeschrieben.');
    return;
  }
  story.flags.suitcaseOpen = true;
  story.sound('chain');
  await story.say('Das Schloss springt auf!');
  story.give('binoculars');
  await story.say('Ein Fernglas. Und eine Akte – mit meinem Zeichen drauf.');
  await story.card({ draw: drawCaseFile });
  await story.say('Meine eigene Akte. Ich ermittle in diesem Zug … und stecke selbst drin fest.');
  story.note('Im Koffer: ein Fernglas und meine Detektivakte. Fall „Der verschwundene Nachtzug“ – ungelöst. Darin steht: „Er kommt im Tunnel. Jede Runde.“ und „Im Tunnel hängt eine Kamera – der Verteilerkasten!“');
}

async function lookOutside(story) {
  if (story.isDark) return story.say('Draußen nur schwarze Tunnelwand. Und Lampen, die vorbeihuschen.');
  const looks = (story.flags.windowLooks = (story.flags.windowLooks ?? 0) + 1);
  if (looks === 1) {
    await story.say('Draußen Wald und Schnee. Ab und zu fliegt eine Laterne vorbei.');
    await story.say('Und da hinten ein Turm mit rotem Licht. Der steht immer an derselben Stelle.');
  } else if (looks === 2) {
    await story.say('Der Turm bewegt sich wirklich nie. Und der Mond wandert von Fenster zu Fenster …');
    await story.say('Als würden wir im Kreis fahren.');
    story.note('Draußen steht ein Turm mit rotem Licht immer an derselben Stelle, der Mond wandert. Fährt der Zug im Kreis?');
  } else if (!story.flags.towerSeen) {
    await story.say('Das rote Licht auf dem Turm blinkt nicht gleichmäßig. Mal kurz, mal lang …');
    await story.say(story.has('binoculars') ? 'Mit dem Fernglas könnte ich es genau erkennen.' : 'Mit bloßem Auge erkenne ich das nicht. Zu weit weg.');
  } else {
    await story.say('Wald, Schnee, Laternen. Immer wieder dieselben.');
  }
}

// Fernglas am Fenster: das Turmlicht beobachten
async function watchTower(story) {
  if (inTunnel(story)) return story.say('Im Tunnel sehe ich nur Wand.');
  const signal = towerSignal(story);
  const watching = story.view('binoculars', { signal, clock: () => story.scene.outside.time });
  if (!story.flags.towerLooked) {
    story.flags.towerLooked = true;
    await story.say('Der Turm – ganz nah. Das rote Licht blinkt … mal kurz, mal lang.');
  }
  const watched = await watching;
  if (inTunnel(story)) return;
  if (!watched) {
    if (!story.flags.towerSeen) await story.say('Ich sollte länger hinsehen – bis das Signal einmal ganz durchgelaufen ist.');
    return;
  }
  if (story.flags.towerSeen) return;
  story.flags.towerSeen = true;
  const marks = signal.flashes.map((flash) => (flash.long ? 'lang' : 'kurz'));
  story.note(`Turmlicht durchs Fernglas: ${marks.join(' – ')}. Dann eine Pause, dann wieder von vorn.`);
  await story.say(`${marks.join(', ')}. Immer dasselbe Zeichen.`.replace(/^./, (letter) => letter.toUpperCase()));
  await story.say(story.flags.jigsawDone
    ? 'Das kann ich auf der Signaltafel nachschlagen.'
    : 'Das ist ein Signal. Aber ohne Tabelle kann ich es nicht lesen.');
}

// ============================================================================================
//  Verteilerkasten, Bildschirm, Tunnelkamera
// ============================================================================================

// Zeigt der Bildschirm gerade das Kamerabild?
function cameraOn(story) {
  return Boolean(story.flags.wiresDone) && !story.flags.screenOff;
}

// Bildschirm im Abteil passend zum Spielstand: aus, Rauschen oder Kamerabild
function refreshScreen(story) {
  story.scene.switchSpot('skullScreen', !story.flags.screenOff);
  const painter = (ctx, x, y, width, height) => ctx.drawImage(feed.render(feedState(story)), x, y, width, height);
  story.scene.paintSpot('skullScreen', cameraOn(story) ? painter : null, { glowColor: '110, 255, 150' });
}

function feedState(story) {
  return { train: story.motion.tunnel, figure: figureLevel(story) };
}

// Kurz nachdem der Zug durch den Tunnel ist, steht dort jemand vor der Kamera (0 = niemand … 1 = deutlich)
function figureLevel(story) {
  const since = story.motion.time - (story.flags.leftTunnelAt ?? -99);
  if (story.motion.inTunnel || since < 0.8 || since > 8) return 0;
  return Math.min(1, (since - 0.8) / 0.8, (8 - since) / 1.2);
}

async function openWires(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Kabel nicht.');
  if (story.flags.wiresDone) return story.say('Die Leitung steht. Lieber nichts mehr anfassen.');
  const watching = story.view('wires');
  if (!story.flags.wiresLooked) {
    story.flags.wiresLooked = true;
    await story.say('Wenn ich die Kabelstücke richtig drehe, reicht die Leitung vielleicht von der Kamera bis zum Bildschirm.');
  }
  if (!(await watching)) return;
  story.flags.wiresDone = true;
  refreshScreen(story);
  story.sound('success');
  if (story.flags.screenOff) {
    await story.say('Die Lampe ist grün – das Signal steht. Aber der Bildschirm ist tot.');
    await story.say('Ohne seine Batterie zeigt er gar nichts.');
  } else {
    story.faceToward({ x: 847, y: 208 });
    await story.say('Die Lampe ist grün – das Signal steht!');
    await story.say('Und drüben auf dem Bildschirm … da ist ein Bild.');
  }
  story.note('Verteilerkasten repariert: Das Signal der Kamera kommt jetzt am Bildschirm an.');
}

// Bildschirm aus der Nähe ansehen
async function watchScreen(story) {
  if (story.flags.screenOff) return story.say('Schwarz. Ohne die Batterie läuft hier gar nichts.');
  const mode = () => (story.flags.screenOff ? 'off' : story.flags.wiresDone ? 'feed' : 'noise');
  const watching = story.view('crt', { mode, picture: () => feed.render(feedState(story)) });
  if (!story.flags.wiresDone) {
    if (!story.flags.noiseSeen) {
      story.flags.noiseSeen = true;
      await story.say('Nur Rauschen. Kein Signal.');
      await story.say('Auf dem Schild steht: „Signal über den Verteilerkasten“.');
      story.note('Der Bildschirm zeigt nur Rauschen. Auf seinem Schild: „Signal über den Verteilerkasten“ – und: „Notstrom: Batterie (Klappe unten)“.');
    }
  } else if (!story.flags.feedSeen) {
    story.flags.feedSeen = true;
    await story.say('Eine Kamera. Sie hängt in einem Tunnel …');
    await story.say(`An der Tunnelwand steht eine riesige ${word(TUNNEL_DIGIT, true)}.`);
    await story.say('Und die Uhr im Bild steht still: 00:00:00.');
    story.note(`Kamerabild aus dem Tunnel („Im Tunnel wacht ein Auge“): An der Tunnelwand steht groß die Ziffer ${TUNNEL_DIGIT}. Die Uhr im Bild steht auf 00:00:00.`);
  }
  await watching;
}

// Auf dem Kamerabild steht jemand im Tunnel
async function seeFigure(story) {
  story.sound('dread');
  await story.say('Da … da steht jemand. Mitten im Tunnel!');
  await story.say('Er sieht direkt in die Kamera. Und er trägt … meinen Schal?');
  story.note('Auf dem Kamerabild: Kaum war der Zug durch den Tunnel, stand dort jemand und sah in die Kamera. Er trug einen Schal wie meinen.');
}

// ============================================================================================
//  Schaltpult: Klappe, Batterie – und der Trick mit dem Tunnel
// ============================================================================================

// Messer an der Klappe des Schaltpults → Batterie (der Bildschirm geht aus)
async function openCover(story) {
  if (story.flags.coverOpen) return story.say('Die Klappe ist schon offen. Das Fach ist leer.');
  if (story.has('flashlight')) return story.say('Meine Taschenlampe hat ihre zwei Batterien. Diese hier bleibt drin – sonst geht der Bildschirm aus.');
  if (story.has('battery')) return story.say('Ich habe schon eine lose Batterie in der Tasche. Erst einmal die verbauen.');
  const again = (story.flags.batteries ?? 0) > 0;
  await story.say(again ? 'Die Schrauben sitzen wieder fest. Also noch einmal …' : 'Die Messerspitze passt in die Schrauben …');
  story.sound('screw');
  await story.wait(0.9);
  story.flags.coverOpen = true;
  story.flags.screenOff = true;
  story.flags.batteries = (story.flags.batteries ?? 0) + 1;
  refreshScreen(story);
  story.give('battery');
  if (again) {
    await story.say('Und wieder liegt eine Batterie im Fach. Dieselbe wie vorhin – und doch eine zweite.');
    await story.say('Was ich bei mir trage, bleibt. Was ich hierlasse, kommt wieder.');
    story.note('Hinter der Klappe lag nach dem Tunnel wieder eine Batterie. Jetzt habe ich zwei.');
  } else {
    await story.say('Klappe auf – und da drin: eine Batterie!');
    await story.say('Oh. Der Bildschirm ist aus.');
    story.note('Hinter der Klappe am Schaltpult steckte eine Batterie. Ohne sie ist der Bildschirm aus.');
  }
}

// ============================================================================================
//  Tunnel
// ============================================================================================

// Im Dunkeln mit der Taschenlampe an der Tür gefunden
async function readScratches(story) {
  const left = story.motion.lanternCount('left'), right = story.motion.lanternCount('right');
  await story.say('Kratzer im Holz. Frisch – im Lampenlicht sieht man sie gar nicht.');
  await story.say(`${word(left, true)} Striche, ein Pfeil nach links. ${word(right, true)} Striche, ein Pfeil nach rechts.`);
  if (!story.flags.seenScratches) {
    story.flags.seenScratches = true;
    story.note(`In die Tür geritzt: ${left} Striche mit Pfeil nach links, ${right} Striche mit Pfeil nach rechts. Die Laternen!`);
  }
  await story.say(`Die Laternen: ${word(left)} links, ${word(right)} rechts. Zwei Zeichen vom Türschloss.`);
  if (story.has('knife')) await story.say('Und die Spitze meines Messers ist stumpf … Das hab ich selbst geritzt.');
}

// Auf der Bank sitzen und warten, bis der nächste Tunnel kommt
async function waitForTunnel(story) {
  if (inTunnel(story) || story.motion.tunnelAhead < 12) {
    await story.say('Gleich kommt der Tunnel. Jetzt setz ich mich nicht hin.');
    return;
  }
  await story.cutscene(async () => {
    await story.say('Ich setz mich kurz und warte auf den Tunnel. Aber nicht einschlafen …');
    await story.fadeOut(1.2);
    story.motion.skipToTunnel(6);
    await story.wait(0.8);
    story.fadeIn(1.2);
    await story.say('Hm?! … Fast eingenickt.');
    await story.say('NICHT einschlafen, Joseph. Da vorne kommt der Tunnel.');
  });
  story.event('waited');
}

// Der erste Tunnel: Licht aus, Schritte im Dunkeln, der Totenkopf.
// Nur der Schreck am Anfang ist eine Zwischensequenz – danach kann man sich mit der Taschenlampe umsehen.
async function firstTunnel(story) {
  await story.cutscene(async () => {
    await story.wait(0.3);
    await story.say('Was …?! Das Licht!');
    story.sound('footsteps');
    await story.wait(2.2);
    story.sound('latch');
  });
  story.sound('tv');
  const skull = story.scene.playOnSpot('skullScreen', 'tv-skull', { glowColor: '120, 255, 140', glowStrength: 0.6 });
  await story.say('Ist da jemand?!');
  await story.say(story.flags.screenOff ? 'Der Bildschirm … ohne Batterie?!' : 'Und der Bildschirm …?!');
  await skull;
  story.flags.sawSkull = true;
  story.note('Im Tunnel ging das Licht aus. Jemand ist im Dunkeln an mir vorbei, Richtung Tür. Und auf dem Bildschirm: ein Totenkopf.');
}

// Nach dem Tunnel: Licht wieder an – und im Abteil ist alles wieder an seinem Platz.
async function afterTunnel(story) {
  // Was Joseph weggenommen hat, ist wieder da
  const letterBack = !story.flags.letterInSlot;
  const batteryBack = Boolean(story.flags.coverOpen);
  story.flags.letterInSlot = true;
  story.flags.coverOpen = false;
  story.flags.screenOff = false;
  refreshScreen(story);

  await story.idle();
  const count = tunnels(story);
  if (count === 1) {
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('… nächster Halt: Ringbahnhof …');
      await story.say('Ringbahnhof? Nie gehört.');
    });
    story.flags.heardAnnouncement = true;
  } else if (count === 3) {
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('… nächster Halt: Ringbahnhof …');
      await story.say('Schon wieder. Wir halten nie.');
    });
  } else if (count === 5) {
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('… Joseph? … Bist du noch wach? …');
      await story.say('Das war … meine Stimme.');
    });
    story.note('Aus dem Lautsprecher kam meine eigene Stimme: „Joseph? Bist du noch wach?“');
  }

  if (letterBack && !story.flags.letterReturned) {
    story.flags.letterReturned = true;
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.faceToward({ x: 765, y: 205 });
      await story.say('Moment. Da steckt wieder ein Brief im Schlitz.');
      await story.say('Aber den hab ich doch in der Tasche …');
    });
    story.note('Nach dem Tunnel steckte der Brief wieder im Schlitz, obwohl ich ihn bei mir trage. Springt im Tunnel alles zurück – nur nicht das, was ich bei mir habe?');
  }
  if (batteryBack && !story.flags.batteryReturned) {
    story.flags.batteryReturned = true;
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.faceToward({ x: 820, y: 280 });
      await story.say('Der Bildschirm läuft wieder?!');
      await story.say('Und die Klappe am Schaltpult ist wieder zugeschraubt. Als hätte ich sie nie geöffnet.');
      await story.say('Wenn alles zurückspringt … dann steckt dahinter jetzt wieder eine Batterie.');
    });
    story.note('Nach dem Tunnel war die Klappe am Schaltpult wieder zugeschraubt und der Bildschirm lief wieder – obwohl ich die Batterie bei mir trage. Dann liegt dahinter jetzt noch eine!');
  }
}

// ============================================================================================
//  Tipps (Taste H oder „Tipp“ im Notizbuch): erst ein Schubs, dann immer deutlicher
// ============================================================================================

function nextHint(story) {
  const { id, lines } = currentGoal(story);
  const asked = (story.flags.hintsAsked ??= {});
  const level = Math.min(asked[id] ?? 0, lines.length - 1);
  asked[id] = level + 1;
  return lines[level];
}

// Woran Joseph gerade arbeiten sollte – und was er dazu sagt, wenn man ihn mehrmals fragt
function currentGoal(story) {
  const f = story.flags;
  const left = story.motion.lanternCount('left'), right = story.motion.lanternCount('right');

  if (!story.has('letter') && !f.letterRead) {
    return { id: 'letter', lines: ['Am Schaltpult rechts neben der Tür steckt ein Brief. Damit sollte ich anfangen.'] };
  }
  if (!f.letterRead) return { id: 'read', lines: ['Den Brief sollte ich erst einmal lesen: Rechtsklick auf den Brief im Inventar.'] };
  if (!f.backpackSearched) return { id: 'backpack', lines: ['Der Brief sagt: Fang beim Rucksack an. Er hängt links an der Wand.'] };
  if (!f.toolboxOpen) {
    return { id: 'toolbox', lines: [
      'Im Rucksack war ein kleiner Schlüssel. Auf dem Anhänger steht „Werkzeug“.',
      'Links vor dem Sessel steht eine kleine Werkzeugkiste aus Blech. Schlüssel im Inventar anklicken, dann die Kiste.',
    ] };
  }
  if (f.pieces < PIECES) {
    const missing = [
      !f.pieceFloor && 'Vorne links auf dem Boden liegt zerrissenes Papier. Das sollte ich aufheben.',
      !f.pieceNews && 'Auf der linken Sitzbank liegt eine Zeitung. Darunter schaut eine Papierecke hervor.',
      !f.pieceCrate && 'Unter der Kiste vorne rechts klemmt ein Stück Papier.',
      !f.pieceCigar && 'In der Zigarrenkiste auf dem Tisch raschelt etwas. Der Deckel klemmt – mit der Messerklinge ginge er auf.',
    ].filter(Boolean);
    return { id: `pieces${f.pieces}`, lines: ['Überall liegen Fetzen eines Fahrplans: am Boden, unter Dingen, in Dingen. Sechs müssten es sein.', missing[0]] };
  }
  if (!f.jigsawDone) {
    return { id: 'jigsaw', lines: [
      'Ich habe alle sechs Fetzen. Rechtsklick auf die Papierfetzen im Inventar, dann kann ich sie zusammensetzen.',
      'Die Fetzen mit gedrückter Maustaste in den gestrichelten Rahmen ziehen. Am besten mit den Ecken anfangen – die haben zwei gerade Kanten.',
    ] };
  }
  if (!f.suitcaseOpen) {
    return { id: 'suitcase', lines: [
      'Der rote Koffer auf der Gepäckablage trägt mein Zeichen. Für sein Schloss brauche ich drei Ziffern.',
      'Auf der rechten Sitzbank liegt ein Rätselheft. Auf der letzten Seite steht „Koffer“ – neben drei eingekreisten Feldern.',
      'Das Zahlenquadrat: In der zweiten Reihe fehlt nur noch die 2, ganz rechts. Dann bleibt rechts oben nur die 3 – und so geht es weiter.',
      'Die eingekreisten Felder der Reihe nach: ① ist 2, ② ist 4, ③ ist 3.',
    ] };
  }
  if (!f.wiresDone) {
    return { id: 'wires', lines: [
      'Der Brief sagt: Im Tunnel wacht ein Auge. In meiner Akte steht: eine Kamera – und der Verteilerkasten. Das ist der Blechkasten links neben der Tür.',
      'Im Verteilerkasten die Kabelstücke drehen, bis eine grüne Leitung vom Eingang „Kamera“ links bis zum Ausgang „Bildschirm“ rechts reicht.',
      'Vom Eingang erst nach oben, oben entlang zwei Felder nach rechts, in der mittleren Spalte zwei Felder nach unten, ein Feld nach links, eins nach unten – und dann unten entlang bis ganz rechts und hoch zum Ausgang.',
    ] };
  }
  if (!f.feedSeen) {
    return { id: 'feed', lines: [f.screenOff
      ? 'Das Signal steht, aber der Bildschirm ist aus – seine Batterie habe ich in der Tasche. Nach dem nächsten Tunnel ist alles wieder an seinem Platz. Auf einer Sitzbank kann ich warten.'
      : 'Das Signal steht. Ich sollte mir den Bildschirm rechts neben der Tür aus der Nähe ansehen.'] };
  }
  if (!f.towerSeen) {
    return { id: 'tower', lines: [
      'Der Brief sagt: Der Turm spricht. Sein rotes Licht blinkt – mit dem Fernglas könnte ich es genau sehen.',
      'Fernglas im Inventar anklicken, dann ein Fenster. Und so lange hinsehen, bis das Signal einmal ganz durchgelaufen ist.',
    ] };
  }
  if (!story.has('flashlight')) {
    if (story.has('battery')) return { id: 'combine', lines: ['Die Batterie gehört in die Taschenlampe: Batterie im Inventar anklicken, dann die Taschenlampe.'] };
    if (!f.batteries) {
      return { id: 'battery1', lines: [
        'Für den dunklen Tunnel brauche ich Licht. Die Taschenlampe braucht Batterien – am Schaltpult ist unten eine Klappe: „Notstrom“.',
        'Die Messerspitze passt in die Schrauben der Klappe: Taschenmesser im Inventar anklicken, dann das Schaltpult.',
      ] };
    }
    if (f.coverOpen) {
      return { id: 'battery2wait', lines: [
        'Die Taschenlampe braucht eine zweite Batterie. Aber das Fach am Schaltpult ist leer …',
        'Der Brief sagt: Was du bei dir trägst, bleibt. Und der Rest? Der Brief im Schlitz war nach dem Tunnel wieder da …',
        'Im Tunnel springt alles zurück – auch die Batterie hinter der Klappe. Auf einer Sitzbank kann ich auf den Tunnel warten.',
      ] };
    }
    return { id: 'battery2', lines: [
      'Die Klappe am Schaltpult ist wieder zugeschraubt. Ob dahinter wieder eine Batterie liegt?',
      'Noch einmal mit dem Taschenmesser die Klappe am Schaltpult öffnen – dann habe ich die zweite Batterie.',
    ] };
  }
  if (!f.seenScratches) {
    return { id: 'scratches', lines: [
      'Der Brief sagt: Die Laternen sind in die Tür geritzt – zu sehen erst, wenn das Licht aus ist. Im Tunnel geht es aus. Auf einer Sitzbank kann ich darauf warten.',
      'Im Tunnel mit der Taschenlampe die Tür ableuchten – der Lichtkegel folgt dem Mauszeiger. Die Kratzer sind in der unteren Hälfte, unter dem gelb-schwarzen Streifen.',
      `Oder ich zähle selbst: eine ganze Runde lang die Laternen, links und rechts getrennt. Es sind ${left} und ${right}.`,
    ] };
  }
  return { id: 'door', lines: [
    'Ich habe alles beisammen: Tunnel, Laterne links, Laterne rechts, Turm. Es steht in meinem Notizbuch – jetzt zur Tür.',
    f.jigsawDone
      ? 'Das Turmlicht muss ich noch übersetzen: Blinkzeichen aus dem Notizbuch mit der Signaltafel vergleichen (Rechtsklick auf die Signaltafel).'
      : 'Für das Turmlicht brauche ich die Tabelle vom Fahrplan.',
    `Tunnel: ${TUNNEL_DIGIT}. Laternen links: ${left}. Laternen rechts: ${right}. Und das Turmlicht (${towerSignal(story).flashes.map((flash) => (flash.long ? 'lang' : 'kurz')).join('-')}) ist die ${towerSignal(story).digits}.`,
  ] };
}
