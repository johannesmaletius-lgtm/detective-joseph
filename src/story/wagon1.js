import { TUTORIAL_WAGON1 } from './tutorial.js';

// ============================================================================================
//  WAGEN 1 – „Die Ringbahn“
// ============================================================================================
//
// Joseph wacht in einem Nachtzug auf und weiß nicht, wie er hineingekommen ist. Auf seiner Hand
// steht in seiner eigenen Schrift: NICHT EINSCHLAFEN. Der Zug fährt im Kreis. In jeder Runde geht
// im Tunnel das Licht aus – und danach ist manches wieder so wie vorher.
//
// Das Rätsel dieses Wagens: Die Tür nach vorne hat ein Zahlenschloss. Der Code ist die Zahl der
// Laternen pro Runde – erst links, dann rechts (mit den jetzigen Einstellungen 7 und 8, also 78).
//   1. Brief aus dem Schlitz am Schaltpult nehmen und lesen:
//      „Zähl die Laternen zwischen zwei Tunneln. Erst links, dann rechts.“
//   2. Rucksack durchsuchen → Taschenlampe (leer), Taschenmesser, Fahrkarte
//   3. Messer an der Klappe des Schaltpults → Batterie (der Bildschirm geht aus)
//   4. Batterie + Taschenlampe kombinieren
//   5. Im Tunnel (Licht aus) die Tür ableuchten → eingeritzte Striche: links 7, rechts 8
//      (Wer Geduld hat, zählt stattdessen eine Runde lang die Laternen vor den Fenstern.)
//   6. 78 am Zahlenschloss → die Tür geht auf, Ende von Wagen 1
//
// Jede anklickbare Stelle (siehe hotspots in src/scene/trainCompartment.js) hat hier ihre Reaktionen:
//   look  = Rechtsklick (anschauen)    use = Linksklick (benutzen, nehmen, ansprechen)
//   items = was passiert, wenn man einen Gegenstand aus dem Inventar darauf anwendet
// Eine Reaktion ist ein Satz, eine Liste von Sätzen oder eine Funktion (story) => { … }.
// Die Befehle für Funktionen (say, note, give, …) erklärt src/story/story.js.

const NUMBERS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const FIRST_TUNNEL_IN = 60; // Fahrsekunden in der Runde beim Start: der erste Tunnel kommt nach gut einer Minute

export const wagon1 = {
  // Merker zu Beginn
  flags: {
    letterInSlot: true, // der Brief steckt im Schlitz am Schaltpult
  },

  tutorial: TUTORIAL_WAGON1,

  setup(story) {
    story.motion.restartAt(FIRST_TUNNEL_IN);
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
      await story.say('Auf meiner Hand steht etwas. In meiner Schrift …');
      await story.card({ kind: 'hand', text: 'NICHT EINSCHLAFEN' });
      await story.say('„Nicht einschlafen.“ Na gut. Ich bin wach. Hellwach.');
    });
    writeFirstNotes(story);
  },

  // Mit ?skipintro in der Adresse: gleich losspielen
  skipIntro(story) {
    writeFirstNotes(story);
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    door: {
      look: async (story) => {
        await story.say('Die Tür zum nächsten Wagen. Ein Zahlenschloss mit zwei Rädchen hängt dran.');
        story.note('Die Tür nach vorne hat ein Zahlenschloss mit zwei Ziffern.');
      },
      use: (story) => tryLock(story),
      items: {
        knife: 'Das Schloss mit dem kleinen Messer aufbrechen? Keine Chance.',
        ticket: 'Die Tür will keine Fahrkarte. Sie will zwei Ziffern.',
        letter: 'Der Brief sagt: Laternen zählen. Die Tür sagt: zwei Ziffern.',
        flashlight: (story) => (story.isDark ? story.say('Ich leuchte die Tür ab … Weiter unten, unter dem gelben Streifen?') : story.say('Bei Licht sieht man hier nichts Besonderes.')),
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
        if (story.flags.screenOff) return story.say('Schwarz. Ohne die Batterie läuft hier gar nichts mehr.');
        if (story.flags.sawSkull) return story.say('Im Tunnel war da ein Totenkopf drauf. Jetzt wieder nur Rauschen.');
        return story.say('Ein kleiner Bildschirm. Nur Rauschen.');
      },
      use: async (story) => {
        if (story.flags.screenOff) return story.say('Tot.');
        await story.say('Ich klopf mal drauf …');
        await story.say('Rauschen bleibt Rauschen.');
      },
    },

    panel: {
      look: async (story) => {
        if (story.flags.coverOpen) return story.say('Die Klappe unten ist offen. Das Batteriefach ist leer.');
        await story.say('Knöpfe, Lämpchen, ein roter Drehknopf. Unten ist eine kleine Klappe – festgeschraubt.');
        story.note('Am Schaltpult unter dem Bildschirm ist eine festgeschraubte Klappe.');
      },
      use: async (story) => {
        if (story.flags.coverOpen) return story.say('Ohne Batterie leuchtet hier nichts mehr.');
        await story.say('Ich drück ein paar Knöpfe. Nichts.');
        await story.say('Interessant ist nur die Klappe unten. Aber die ist festgeschraubt.');
      },
      items: {
        knife: (story) => openCover(story),
        battery: 'Die Batterie wieder reinstecken? Nein, die brauche ich selbst.',
        other: 'Damit bekomme ich die Schrauben nicht auf.',
      },
    },

    backpack: {
      look: (story) => (story.flags.backpackSearched
        ? story.say('Ein leerer Rucksack.')
        : story.say('Ein alter Rucksack an der Wand. Irgendwie kommt er mir bekannt vor …')),
      use: async (story) => {
        if (story.flags.backpackSearched) return story.say('Leer.');
        story.flags.backpackSearched = true;
        await story.say('Mal sehen, was drin ist …');
        story.give('flashlightEmpty');
        story.give('knife');
        story.give('ticket');
        await story.say('Eine Taschenlampe ohne Batterie, ein Taschenmesser und eine Fahrkarte.');
        story.note('Im Rucksack: eine Taschenlampe ohne Batterie, ein Taschenmesser und eine Fahrkarte.');
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

    switches: {
      look: 'Ein Kasten mit Schaltern. Licht, Heizung, Lüftung.',
      use: ['Klick, klick.', 'Nichts passiert. Die Schalter hängen an gar keinem Kabel.'],
    },

    lamp: { look: 'Eine Lampe über der Tür. Sie flackert, wenn wir über Schienenstöße rumpeln.' },
    jar: { look: 'Ein Glas mit grün leuchtender Flüssigkeit. Ich will gar nicht wissen, was das ist.', use: 'Lieber nicht anfassen.' },
    suitcase: { look: 'Ein roter Koffer, ganz oben auf der Ablage – mit einer Kette festgemacht.', use: 'Da komme ich nicht ran. Und die Kette ist dick.' },

    table: {
      look: 'Zwei Flaschen und eine Zigarrenkiste. Alles leer.',
      use: 'Leer. Wer hier saß, hatte Durst – und ist ohne Abschied gegangen.',
    },

    newspaper: {
      look: async (story) => {
        await story.say('Das Datum ist verschmiert.');
        await story.say('Auf jeder Seite dieselbe Schlagzeile: „NACHTZUG SPURLOS VERSCHWUNDEN“.');
        story.note('Zeitung: „Nachtzug spurlos verschwunden“. Das Datum ist verschmiert.');
      },
      use: 'Die nehm ich nicht mit. Aber die Schlagzeile merke ich mir.',
    },

    magazine: {
      look: ['Ein Rätselheft.', 'Alle Rätsel sind schon gelöst … in meiner Handschrift.'],
      use: 'Schon alles gelöst. Von mir. Irgendwann.',
    },

    window: {
      look: (story) => lookOutside(story),
      use: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Die Fenster gehen nicht auf.'),
    },

    papers: { look: 'Zerrissene Fahrpläne. Jemand hat überall Kreise draufgemalt.' },
    extinguisher: { look: 'Ein Feuerlöscher. Geprüft am … unleserlich.', use: 'Hier brennt nichts. Noch nicht.' },
    toolbox: {
      look: 'Eine Werkzeugkiste.',
      use: 'Abgeschlossen. Kein Schlüssel weit und breit.',
      items: { knife: 'Das Schloss ist zu stabil für das kleine Messer.' },
    },
    crate: {
      look: 'Eine schwere Holzkiste.',
      use: 'Zugenagelt.',
      items: { knife: 'Mit dem Messer bekomme ich die Nägel nicht raus.' },
    },

    bench: {
      look: (story) => story.say(story.has('flashlight')
        ? 'Eine durchgesessene Bank. Hier könnte ich auf den nächsten Tunnel warten.'
        : 'Eine durchgesessene Sitzbank. Vielleicht hab ich hier geschlafen.'),
      use: (story) => waitForTunnel(story),
    },
  },

  // ---------------------------------------------------------------- Gegenstände (Rechtsklick im Inventar)
  items: {
    letter: {
      look: async (story) => {
        await story.card({
          kind: 'paper',
          lines: ['Zähl die Laternen zwischen zwei Tunneln.', 'Erst links, dann rechts.', 'Dann kennst du die Zahl.', 'Du hast es schon einmal geschafft.'],
          signature: '– J.',
        });
        if (story.flags.letterRead) return;
        story.flags.letterRead = true;
        await story.say('Das ist … meine Schrift. Aber das hab ich nie geschrieben.');
        await story.say('Oder?');
        story.note('Brief in meiner Schrift: „Zähl die Laternen zwischen zwei Tunneln. Erst links, dann rechts. Dann kennst du die Zahl.“');
      },
    },
    ticket: {
      look: async (story) => {
        await story.say('„RINGBAHN – gültig für 1 Runde.“ Kein Abfahrtsort. Kein Ziel.');
        story.note('Fahrkarte: „Ringbahn – gültig für 1 Runde“. Kein Ziel.');
      },
    },
  },

  async onCombine(story, result) {
    if (result === 'flashlight') {
      story.note('Die Taschenlampe geht. Wenn im Tunnel das Licht ausgeht, kann ich mich damit umsehen.');
    }
  },

  // ---------------------------------------------------------------- Tunnel: Licht aus
  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = (story.flags.tunnels ?? 0) + 1;
      story.game.closeWindowsInDark();
      if (story.flags.tunnels === 1) return firstTunnel(story);
      await story.idle();
      if (!story.has('flashlight')) await story.say('Wieder dunkel. Ohne Licht finde ich hier gar nichts.');
      else if (!story.flags.seenScratches) await story.say('Licht aus – Taschenlampe an.');
      return;
    }
    await afterTunnel(story);
  },
};

// ============================================================================================
//  Abläufe
// ============================================================================================

function writeFirstNotes(story) {
  story.note('Aufgewacht in einem Nachtzug. Keine Ahnung, wie ich hergekommen bin.');
  story.note('Auf meiner Hand, in meiner Schrift: NICHT EINSCHLAFEN.');
}

// Das Zahlenschloss an der Tür
async function tryLock(story) {
  let tries = 0;
  const opened = await story.codeLock({
    digits: 2,
    check: (code) => {
      tries += 1;
      return code === lanternCode(story);
    },
  });
  if (opened) return openDoor(story);
  if (story.isDark || tries === 0) return;
  story.flags.lockTries = (story.flags.lockTries ?? 0) + tries;
  if (story.flags.lockTries >= 3 && !story.flags.lockHint) {
    story.flags.lockHint = true;
    await story.say('Hundert Möglichkeiten. Raten dauert ewig.');
    await story.say(story.flags.letterRead ? 'Der Brief sagt: Laternen zählen. Erst links, dann rechts.' : 'Irgendwo hier muss ein Hinweis sein.');
  } else {
    await story.say('Nichts. Das Schloss bleibt zu.');
  }
}

// Der Code für die Tür: Laternen pro Runde links, dann rechts (siehe trainMotion.js, planLanterns)
function lanternCode(story) {
  return `${story.motion.lanternCount('left')}${story.motion.lanternCount('right')}`;
}

// "sieben" / "Sieben"
function word(count, capital = false) {
  const text = NUMBERS[count] ?? String(count);
  return capital ? text[0].toUpperCase() + text.slice(1) : text;
}

// Messer an der Klappe des Schaltpults → Batterie
async function openCover(story) {
  if (story.flags.coverOpen) return story.say('Die Klappe ist schon offen.');
  await story.say('Die Messerspitze passt in die Schrauben …');
  story.sound('screw');
  await story.wait(0.9);
  story.flags.coverOpen = true;
  story.flags.screenOff = true;
  story.scene.switchSpot('skullScreen', false);
  story.give('battery');
  await story.say('Klappe auf – und da drin: eine Batterie!');
  await story.say('Oh. Der Bildschirm ist aus.');
}

// Im Dunkeln mit der Taschenlampe an der Tür gefunden
async function readScratches(story) {
  const left = story.motion.lanternCount('left'), right = story.motion.lanternCount('right');
  await story.say('Kratzer im Holz. Frisch – im Lampenlicht sieht man sie gar nicht.');
  await story.say(`${word(left, true)} Striche, ein Pfeil nach links. ${word(right, true)} Striche, ein Pfeil nach rechts.`);
  if (!story.flags.seenScratches) {
    story.flags.seenScratches = true;
    story.note(`In die Tür geritzt: links ${left} Striche, rechts ${right} Striche.`);
  }
  await story.say(story.flags.letterRead ? `Links, dann rechts … die Laternen! ${word(left, true)} und ${word(right)}.` : `${word(left, true)} und ${word(right)}. Aber wofür?`);
  if (story.has('knife')) await story.say('Die Spitze meines Messers ist stumpf … Hab ich das etwa selbst geritzt?');
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
  } else if (story.flags.letterRead && !story.flags.seenScratches) {
    await story.say('Laternen zählen, zwischen zwei Tunneln – links und rechts getrennt. Das braucht Geduld.');
  } else {
    await story.say('Wald, Schnee, Laternen. Immer wieder dieselben.');
  }
}

// Auf der Bank sitzen und warten, bis der nächste Tunnel kommt
async function waitForTunnel(story) {
  if (story.isDark || story.motion.tunnelAhead < 12) {
    await story.say('Gleich kommt der Tunnel. Jetzt setz ich mich nicht hin.');
    return;
  }
  await story.cutscene(async () => {
    await story.say('Ich setz mich kurz. Aber nicht einschlafen …');
    await story.fadeOut(1.2);
    story.motion.skipToTunnel(5);
    await story.wait(0.8);
    story.fadeIn(1.2);
    await story.say('Hm?! … Fast eingenickt.');
    await story.say('NICHT einschlafen, Joseph.');
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

// Nach dem Tunnel: Licht wieder an – und manches ist wieder wie vorher
async function afterTunnel(story) {
  await story.idle();
  if (story.flags.tunnels === 1) {
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('… nächster Halt: Ringbahnhof …');
      await story.say('Ringbahnhof? Nie gehört.');
    });
    story.flags.heardAnnouncement = true;
  }
  if (!story.flags.letterInSlot && !story.flags.letterReturned) {
    story.flags.letterInSlot = true;
    story.flags.letterReturned = true;
    await story.wait(0.6);
    await story.cutscene(async () => {
      story.faceToward({ x: 765, y: 205 });
      await story.say('Moment. Da steckt wieder ein Brief im Schlitz.');
      await story.say('Aber den hab ich doch in der Tasche …');
    });
    story.note('Nach dem Tunnel steckte der Brief wieder im Schlitz, obwohl ich ihn bei mir trage. Springt im Tunnel alles zurück – nur nicht das, was ich bei mir habe?');
  }
}

// Code richtig: Die Tür geht auf, Ende von Wagen 1
async function openDoor(story) {
  await story.cutscene(async () => {
    story.flags.doorOpen = true;
    const left = story.motion.lanternCount('left'), right = story.motion.lanternCount('right');
    await story.say(`${word(left, true)} links, ${word(right)} rechts.`);
    await story.say('Ich hab es also wirklich schon einmal geschafft …');
    story.sound('door');
    await story.wait(1);
    await story.fadeOut(1.6);
    story.note('Die Tür ist offen. Weiter nach vorne – zum Speisewagen.');
    await story.card({
      kind: 'end',
      title: 'Ende von Wagen 1',
      lines: [`Joseph ist in Runde ${story.lap} durch die Tür gegangen.`, 'Weiter geht es im Speisewagen – bald.'],
      continueText: 'Klicken, um noch einmal von vorn zu spielen',
    });
    location.reload();
  });
}
