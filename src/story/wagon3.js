import { CAGE, STRANGER, TRUNK } from '../scene/luggageCar.js';
import { P } from '../scene/wagonPainter.js';
import { drawMailLetter, drawManifest, drawPhoto } from '../ui/cards2.js';
import { VOICES, finishWagon, packFor, WINDOW_ITEMS, hintFor, inTunnel, lookOutside, tunnels } from './common.js';

// ============================================================================================
//  WAGEN 3 – Der Gepäckwagen
// ============================================================================================
//
// Koffer, Kisten, Postsäcke – und Kasimir, Frau Adlers Papagei, unter einem Tuch. Kasimir merkt sich
// alles, was er hört. Auch das, was der Mann mit dem Schal vor sich hin murmelt.
//
// DAS ZIEL: Die Schiebetür zum Speisewagen hat ein Vorhängeschloss. Der Schlüssel liegt in Koffer Nr. 7.
//
// DIE RÄTSEL:
//   1. Dienstschrank (hinten links) mit dem Vierkant vom Gitter im Schlafwagen öffnen → Brecheisen und Frachtliste
//   2. Frachtliste lesen: „Kiste 3: Futter für Kasimir“, „Koffer Nr. 7: Detektei J. – Zahlenschloss“
//   3. Kiste 3 mit dem Brecheisen aufhebeln → Vogelfutter
//   4. Das Tuch vom Käfig nehmen, Kasimir füttern → er plappert alles nach, was er gehört hat:
//      „Koffer sieben! Vier – eins – sieben! Psst!“
//   5. Koffer Nr. 7 (unten im Kofferstapel links) mit 4 1 7 öffnen → ein Foto und der Schlüssel zum Speisewagen
//   6. Schlüssel an die Tür → FINALE: Der Zug hält im Tunnel. Aus dem Schrankkoffer steigt der andere Joseph.
// Nebenbei: In den Postsäcken liegt ein Brief aus „Runde 43“ – an Joseph. Im Schrankkoffer klopft es zurück.
// Nach jedem Tunnel: Tuch wieder auf dem Käfig, Kisten zu, Schrank zu, Koffer zu. Mitgenommenes bleibt.

const SUITCASE_CODE = '417';
const PARROT = (() => {
  const [x, y] = P(CAGE.X, CAGE.Y + CAGE.height, CAGE.Z);
  return { x, y: y - 14 };
})();
const STRANGER_VOICE = () => ({ x: STRANGER.x, y: STRANGER.y - 300 });
const PHRASES = [
  'Krah! Nicht einschlafen! Nicht einschlafen!',
  'Tisch vier! Platz zwei! Prost! Krah!',
  'Koffer sieben! Vier – eins – sieben! Psst! Nicht verraten!',
  'Joseph? Bist du noch wach? Krah! Krah!',
];

export const wagon3 = {
  flags: {},

  prepare(story) {
    story.note('Hinter mir: das erste Abteil und der Schlafwagen. Frau Adler bat mich, nach ihrem Papagei Kasimir zu sehen.');
  },

  setup(story) {
    story.flags.startedAt = performance.now();
    story.flags.packed = packFor(story, ['flashlight', 'vierkant']);
    STRANGER.image = story.player.animations['joseph-idle-front'].frames[0];
  },

  async intro(story) {
    await arrive(story);
  },

  async skipIntro(story) {
    story.game.overlay.fade = 0;
    await arrive(story, { quick: true });
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    door: {
      look: async (story) => {
        await story.say('Eine schwere Schiebetür aus Stahl. Dahinter: der Speisewagen. Davor ein dickes Vorhängeschloss.');
        if (!story.flags.doorLooked) {
          story.flags.doorLooked = true;
          story.note('Gepäckwagen: Die Tür zum Speisewagen hat ein Vorhängeschloss. Ich brauche den Schlüssel.');
        }
      },
      use: (story) => (story.has('padlockKey') ? finale(story) : story.say('Abgeschlossen. Ohne Schlüssel bewegt sich die Tür keinen Zentimeter.')),
      items: {
        padlockKey: (story) => finale(story),
        crowbar: 'Das Vorhängeschloss ist dicker als das Brecheisen.',
        vierkant: 'Kein Vierkantloch. Nur ein Vorhängeschloss.',
        other: 'Das passt nicht ins Schloss.',
      },
    },

    locker: {
      look: (story) => (story.flags.lockerOpen
        ? story.say('Der Dienstschrank steht offen.')
        : story.say('Ein grüner Dienstschrank. „Nur für Zugpersonal“. Mit einem Vierkantschloss.')),
      use: (story) => (story.flags.lockerOpen ? takeFromLocker(story) : story.say('Abgeschlossen. Da gehört ein Vierkantschlüssel rein.')),
      items: {
        vierkant: (story) => openLocker(story),
        crowbar: 'Aufbrechen muss ich ihn nicht – ich habe ja den Vierkant.',
        other: 'Das ist kein Vierkantschlüssel.',
      },
    },

    stack: {
      look: 'Koffer über Koffer. Alle mit Anhängern: „Ringbahnhof“. Und Nummern.',
      use: async (story) => {
        await story.say('Ich sehe mir die Anhänger an … 12, 23, 31, 40 …');
        await story.say('Und ganz unten, vorne: Nummer 7. Mit einem „J.“ auf dem Deckel.');
        story.flags.suitcaseFound = true;
      },
      items: { crowbar: 'Ich will keine fremden Koffer aufbrechen.' },
    },

    suitcase7: {
      look: (story) => (story.flags.suitcaseOpen
        ? story.say('Koffer Nr. 7 – offen. Bis auf ein paar Hemden leer.')
        : story.say('Koffer Nr. 7. Ein „J.“ auf dem Deckel. Und ein Zahlenschloss mit drei Rädchen.')),
      use: (story) => openSuitcase(story),
      items: {
        crowbar: 'Meinen eigenen Koffer aufbrechen? Ich kenne die Zahl bestimmt. Irgendwer kennt sie bestimmt.',
        other: 'Der Koffer will drei Ziffern.',
      },
    },

    ...Object.fromEntries([1, 2, 3, 4].map((number) => [`crate${number}`, {
      look: (story) => (story.flags[`crateOpen${number}`]
        ? story.say(CRATE_CONTENTS[number].look)
        : story.say(`Kiste ${number}. Zugenagelt.`)),
      use: (story) => (story.flags[`crateOpen${number}`]
        ? story.say(CRATE_CONTENTS[number].look)
        : story.say('Zugenagelt. Mit bloßen Händen bekomme ich die Bretter nicht los.')),
      items: {
        crowbar: (story) => openCrate(story, number),
        knife: 'Für die Nägel ist das Messer zu schwach.',
        other: 'Damit bekomme ich die Kiste nicht auf.',
      },
    }])),

    cage: {
      look: (story) => (story.flags.uncovered
        ? story.say('Kasimir. Ein grüner Papagei mit rotem Schopf. Er legt den Kopf schief und mustert mich.')
        : story.say('Ein Käfig unter einem roten Tuch. Darunter raschelt es.')),
      use: (story) => (story.flags.uncovered ? talkToParrot(story) : uncover(story)),
      items: {
        seeds: (story) => feedParrot(story),
        flashlight: 'Ich leuchte niemandem mehr ins Gesicht. Auch keinem Papagei.',
        other: 'Das will Kasimir nicht haben.',
      },
    },

    trunk: {
      look: async (story) => {
        await story.say('Ein Schrankkoffer – groß wie ein Mensch. Auf dem Etikett: NICHT ÖFFNEN.');
        if (story.flags.letterRead) await story.say('„Er versteckt sich im Schrankkoffer.“ …');
      },
      use: (story) => knock(story),
      items: {
        crowbar: (story) => (story.flags.letterRead
          ? story.say('Der Brief sagt: Er kommt erst raus, wenn die Tür zum Speisewagen offen ist. Ich zwinge ihn nicht.')
          : story.say('„NICHT ÖFFNEN.“ Und ehrlich gesagt … will ich das auch nicht.')),
        other: 'Den lasse ich lieber zu.',
      },
    },

    sacks: {
      look: 'Postsäcke. Ein paar Briefe sind herausgefallen.',
      use: (story) => readMail(story),
    },

    stand: { look: 'Eine Kiste mit der Aufschrift „LEBENDE TIERE“. Darauf steht der Käfig.' },
    lamp: { look: 'Eine Lampe an einem langen Kabel. Sie schwingt in der endlosen Kurve hin und her.' },
    window: {
      look: (story) => lookOutside(story),
      use: 'Vergittert.',
      items: WINDOW_ITEMS,
    },
  },

  items: {
    manifest: { look: (story) => readManifest(story) },
    photo: { look: (story) => showPhoto(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  // ---------------------------------------------------------------- Tunnel
  async onTunnel(story, inside) {
    const f = story.flags;
    if (f.finale) return;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      await story.idle();
      if (!inTunnel(story)) return;
      story.sound('knockBack');
      if (!f.knockNoted) {
        f.knockNoted = true;
        await story.say('Da klopft etwas. Im Dunkeln … im Schrankkoffer.');
      }
      return;
    }
    const changed = f.uncovered || f.lockerOpen || f.suitcaseOpen || [1, 2, 3, 4].some((n) => f[`crateOpen${n}`]);
    f.uncovered = false;
    f.lockerOpen = false;
    f.suitcaseOpen = false;
    f.parrotFed = false;
    for (const n of [1, 2, 3, 4]) f[`crateOpen${n}`] = false;
    await story.idle();
    if (changed && !f.resetNoted) {
      f.resetNoted = true;
      await story.cutscene(async () => {
        await story.wait(0.4);
        await story.say('Das Tuch liegt wieder über dem Käfig. Die Kisten sind wieder zugenagelt, der Schrank ist zu.');
        await story.say('Nur was ich eingesteckt habe, ist noch da.');
      });
    }
  },
};

const CRATE_CONTENTS = {
  1: { look: 'Kiste 1: Fahrkarten. Tausende. Alle „gültig für 1 Runde“.' },
  2: { look: 'Kiste 2: Nur Stroh und Holzwolle.' },
  3: { look: 'Kiste 3: Stroh – und wo das Vogelfutter lag, ist jetzt eine Kuhle.' },
  4: { look: 'Kiste 4: Ersatz-Glühbirnen. Hunderte.' },
};

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('slide');
      story.fadeIn(1.6);
      await story.wait(1.4);
      await story.say('Der Gepäckwagen. Koffer, Kisten, Postsäcke … und eine Lampe, die hin und her schwingt.');
      story.sound('squawk');
      await story.speak('Krah?', { at: PARROT, color: VOICES.parrot });
      await story.say('Unter dem Tuch da drüben … das muss Kasimir sein.');
    });
  }
  story.note('Gepäckwagen: Unter einem roten Tuch steht ein Käfig – Kasimir, Frau Adlers Papagei. Hinten ist die Tür zum Speisewagen.');
}

// ============================================================================================
//  Dienstschrank, Frachtliste, Kisten
// ============================================================================================

async function openLocker(story) {
  const f = story.flags;
  if (f.lockerOpen) return story.say('Der Schrank ist schon offen.');
  story.sound('key');
  await story.wait(0.6);
  f.lockerOpen = true;
  story.sound('creak');
  await story.say('Der Vierkant vom Gitter passt. Die Türen springen auf.');
  await takeFromLocker(story);
}

async function takeFromLocker(story) {
  const f = story.flags;
  if (f.crowbarTaken && f.manifestTaken) return story.say('Leer. Nur ein paar Haken und Staub.');
  if (!f.crowbarTaken) {
    f.crowbarTaken = true;
    story.give('crowbar');
    await story.say('Ein Brecheisen!');
  }
  if (!f.manifestTaken) {
    f.manifestTaken = true;
    story.give('manifest');
    await story.say('Und ein Klemmbrett: die Frachtliste.');
    story.note('Im Dienstschrank: ein Brecheisen und die Frachtliste des Gepäckwagens.');
  }
}

async function readManifest(story) {
  story.sound('paper');
  await story.card({ draw: drawManifest });
  if (story.flags.manifestRead) return;
  story.flags.manifestRead = true;
  await story.say('Kiste 3: Futter für Kasimir. Koffer Nr. 7: Detektei J. – mit Zahlenschloss.');
  await story.say('Und unten, in blauer Tinte: „Kasimir merkt sich alles. Füttern hilft.“');
  story.note('Frachtliste: Kiste 3 = Futter für Kasimir. Koffer Nr. 7 = „Detektei J.“, Zahlenschloss. Schrankkoffer: NICHT ÖFFNEN. Handschriftlich: „Kasimir merkt sich alles. Füttern hilft.“');
}

async function openCrate(story, number) {
  const f = story.flags;
  if (f[`crateOpen${number}`]) return story.say('Die ist schon offen.');
  await story.say('Das Brecheisen unter das Brett … und hebeln!');
  story.sound('creak');
  await story.wait(0.6);
  f[`crateOpen${number}`] = true;
  if (number === 3) {
    if (story.has('seeds')) return story.say('Stroh. Das Vogelfutter habe ich schon.');
    story.give('seeds');
    await story.say('Unter dem Stroh: eine Tüte Vogelfutter. „Für Kasimir – nicht mehr als eine Handvoll pro Runde.“');
    story.note('In Kiste 3 lag Vogelfutter für Kasimir.');
    return;
  }
  await story.say(CRATE_CONTENTS[number].look);
}

// ============================================================================================
//  Kasimir
// ============================================================================================

async function uncover(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln lasse ich das Tuch lieber drauf.');
  story.sound('paper');
  f.uncovered = true;
  await story.wait(0.3);
  story.sound('flutter');
  await story.wait(0.3);
  await parrot(story, 'Krah! Nicht einschlafen! Nicht einschlafen!');
  if (!f.firstSquawk) {
    f.firstSquawk = true;
    await story.say('Woher kennt der Vogel die Schrift auf meinem Arm?!');
    story.note('Kasimir, der Papagei, krächzt: „Nicht einschlafen!“ – wie die Schrift auf meinem Unterarm. Wer hat ihm das beigebracht?');
  }
}

async function parrot(story, text) {
  story.flags.parrotTalking = true;
  story.sound('squawk');
  await story.speak(text, { at: PARROT, color: VOICES.parrot });
  story.flags.parrotTalking = false;
}

async function talkToParrot(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich ihn nicht mal.');
  for (;;) {
    const index = await story.choose(['Hallo, Kasimir.', 'Was hast du gehört, Kasimir?', 'Wer hat dir „Nicht einschlafen“ beigebracht?', 'Tschüss, Kasimir.'], 'Kasimir');
    if (index < 0 || index === 3) {
      if (index === 3) await parrot(story, 'Tschüss! Tschüss! Krah!');
      return;
    }
    if (index === 0) {
      await story.say('Hallo, Kasimir.');
      await parrot(story, 'Hallo, Joseph! Hallo, Joseph! Krah!');
      await story.say('Er kennt meinen Namen.');
    } else if (index === 1) {
      await story.say('Was hast du gehört, Kasimir?');
      if (f.parrotFed) await recite(story);
      else {
        await parrot(story, 'Hunger! Hunger! Krah!');
        if (!f.hungerNoted) {
          f.hungerNoted = true;
          story.note('Kasimir redet nur von Hunger. Frau Adler sagte: „Geben Sie ihm etwas zu fressen, sonst redet er kein Wort.“');
        }
      }
    } else {
      await story.say('Wer hat dir „Nicht einschlafen“ beigebracht?');
      await parrot(story, 'Joseph! Joseph! Jede Runde! Krah!');
      await story.say('… Ich?');
    }
  }
}

async function feedParrot(story) {
  const f = story.flags;
  if (!f.uncovered) return story.say('Erst einmal das Tuch abnehmen.');
  if (inTunnel(story)) return story.say('Im Dunkeln verstreue ich das Futter nur.');
  if (f.parrotFed) return parrot(story, 'Satt! Satt! Krah!');
  f.parrotFed = true;
  await story.say('Eine Handvoll Körner für dich, Kasimir.');
  f.parrotEating = true;
  story.sound('flutter');
  await story.wait(1.8);
  f.parrotEating = false;
  await recite(story);
}

// Gefüttert plappert Kasimir alles nach, was er gehört hat – auch die Zahl für den Koffer
async function recite(story) {
  const f = story.flags;
  for (const phrase of PHRASES) {
    await parrot(story, phrase);
    await story.wait(0.2);
  }
  if (!f.codeHeard) {
    f.codeHeard = true;
    await story.say('„Koffer sieben – vier, eins, sieben.“ Das hat er von jemandem gehört, der nicht wollte, dass man es weitersagt.');
    story.note('Kasimir plappert nach, was er gehört hat: „Tisch vier! Platz zwei! Prost!“ und „Koffer sieben! Vier – eins – sieben! Psst!“');
  }
}

// ============================================================================================
//  Koffer Nr. 7, Post, Schrankkoffer
// ============================================================================================

async function openSuitcase(story) {
  const f = story.flags;
  if (f.suitcaseOpen) return story.say(story.has('padlockKey') ? 'Bis auf ein paar Hemden leer. Foto und Schlüssel habe ich.' : 'Offen.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'suitcase7',
    digits: 3,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === SUITCASE_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      await story.say(f.codeHeard ? 'Falsch. Was hat Kasimir gesagt? Koffer sieben …' : 'Falsch. Drei Ziffern – die müsste mir jemand verraten.');
    }
    return;
  }
  f.suitcaseOpen = true;
  story.sound('unlock');
  await story.say('Auf! Hemden … ein Kulturbeutel … das sind meine Sachen.');
  if (story.has('padlockKey')) return;
  story.give('photo');
  story.give('padlockKey');
  await story.say('Ein Foto. Und ein Schlüssel mit Anhänger: „Speisewagen“.');
  await showPhoto(story);
  story.note('In Koffer Nr. 7 (meinem): der Schlüssel zum Speisewagen – und ein Foto aus „Runde 1“: zwei Männer, die beide aussehen wie ich.');
}

async function showPhoto(story) {
  story.sound('paper');
  await story.card({ draw: drawPhoto });
  if (story.flags.photoSeen) return;
  story.flags.photoSeen = true;
  story.sound('dread');
  await story.say('Zwei Männer auf dem Bahnsteig. Beide mit Schal. Beide … ich.');
  await story.say('„Runde 1. Wir zwei. Nie wieder getrennt.“');
}

async function readMail(story) {
  const f = story.flags;
  story.sound('paper');
  if (!f.mailFound) {
    f.mailFound = true;
    await story.say('Lauter Briefe. Auf allen Briefmarken: Runde 41, Runde 42 … Und einer ist an mich adressiert.');
  }
  await story.card({ draw: drawMailLetter });
  if (f.letterRead) return;
  f.letterRead = true;
  await story.say('Abgestempelt in „Runde 43“. Diese Runde hat noch gar nicht angefangen.');
  story.note('In den Postsäcken: ein Brief an mich, abgestempelt „Runde 43“: „Er versteckt sich im Schrankkoffer. Er kommt erst raus, wenn die Tür zum Speisewagen offen ist. Hab keine Angst vor ihm. Er ist nur müde.“');
}

async function knock(story) {
  const f = story.flags;
  await story.say('Ich klopfe an den Schrankkoffer.');
  story.sound('knock');
  await story.wait(1.2);
  story.sound('knockBack');
  await story.wait(0.9);
  await story.say(f.knocked ? 'Wieder. Zweimal. Als würde mir jemand antworten.' : 'Es klopft zurück. Zweimal.');
  if (!f.knocked) {
    f.knocked = true;
    story.note('Ich habe an den Schrankkoffer geklopft – und von drinnen hat es zurückgeklopft.');
  }
}

// ============================================================================================
//  Finale: Die Tür zum Speisewagen
// ============================================================================================

async function finale(story) {
  const f = story.flags;
  const motion = story.motion;
  const stranger = (text) => story.speak(text, { at: STRANGER_VOICE(), color: VOICES.stranger });
  f.finale = true;
  await story.cutscene(async () => {
    story.sound('key');
    await story.wait(0.7);
    await story.say('Der Schlüssel passt. Das Schloss fällt ab.');
    story.sound('slide');
    f.doorOpen = true;
    await story.wait(1.2);
    await story.say('Ein Spalt. Dahinter ist es kalt und dunkel …');
    story.sound('creak');
    await story.wait(0.5);
    f.trunkOpen = true;
    story.faceToward({ x: P(TRUNK.x[0], 100, 0.8)[0], y: P(TRUNK.x[0], 100, 0.8)[1] });
    await parrot(story, 'Er kommt! Er kommt! Krah!');
    // Der Zug fährt in den Tunnel – und bleibt darin stehen
    motion.skipToTunnel(0.4);
    for (let i = 0; i < 40 && !story.isDark; i++) await story.wait(0.1);
    motion.cruiseSpeed = 0;
    await story.say('Licht aus. Und … der Zug hält. Mitten im Tunnel.');
    story.sound('footsteps');
    await story.wait(1.4);
    f.strangerVisible = true;
    story.beamAt = { x: STRANGER.x, y: STRANGER.y - 220 };
    story.sound('dread');
    await story.wait(0.8);
    await stranger('Du bist zu früh, Joseph.');
    await story.say('Wer … bist du?');
    await stranger('Leuchte mir ruhig ins Gesicht. Wie bei der alten Dame.');
    await story.say('Das … bin ja ich.');
    await stranger('Ich bin du. Nach hundert Runden ohne Schlaf.');
    await stranger('Ich habe die Briefe geschrieben. Die Laternen in die Tür geritzt. Den Vierkant ans Gitter gehängt – damit du hierher findest.');
    await story.say('Du hast mich die ganze Zeit hierher geführt?!');
    await stranger('Jede Runde. Und jede Runde warst du schneller, als ich dachte. Du warst immer der Bessere von uns beiden.');
    await stranger('Hör zu: Morgen verschwindet jemand. Achte auf die Gläser.');
    await stranger('Aber nicht heute. Schlaf jetzt, Joseph.');
    await story.say('Nein! NICHT einschlafen!');
    story.beamAt = null;
    f.strangerVisible = false;
    story.sound('footsteps');
    await story.wait(1.2);
    story.sound('slide');
    await story.wait(1.4);
    motion.cruiseSpeed = 1;
    for (let i = 0; i < 160 && (story.isDark || motion.inTunnel); i++) await story.wait(0.1);
    await story.wait(0.6);
    await story.say('Er ist weg. Durch die Tür – in den Speisewagen.');
    await parrot(story, 'Nicht einschlafen! Nicht einschlafen!');
    await story.say('Keine Sorge, Kasimir. Ich bin wach. Hellwach.');
    story.note('Aus dem Schrankkoffer stieg ein zweiter Joseph – ich, nach hundert Runden ohne Schlaf. Er hat die Briefe geschrieben und die Kratzer geritzt. Bevor er nach vorne in den Speisewagen verschwand, sagte er: „Morgen verschwindet jemand. Achte auf die Gläser.“');
    await story.fadeOut(2);
  });
  await finishWagon(story, { number: 3, next: 4, nextName: 'Speisewagen' });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (story.has('padlockKey')) return { id: 'door', lines: ['Der Schlüssel aus meinem Koffer gehört an die Tür zum Speisewagen.'] };
  if (!f.manifestTaken) {
    return { id: 'locker', lines: [
      'Die Tür zum Speisewagen hat ein Vorhängeschloss. Wo könnte der Schlüssel sein?',
      'Hinten links steht ein Dienstschrank mit Vierkantschloss. Der Vierkant aus dem Schlafwagen passt bestimmt.',
    ] };
  }
  if (!f.manifestRead) return { id: 'manifest', lines: ['Die Frachtliste sollte ich lesen: Rechtsklick auf die Frachtliste im Inventar.'] };
  if (f.codeHeard) {
    return { id: 'suitcase', lines: [
      'Kasimir hat es verraten: Koffer sieben – vier, eins, sieben.',
      'Koffer Nr. 7 steht ganz unten im Kofferstapel links. Das Schloss: 4 – 1 – 7.',
    ] };
  }
  if (!f.uncovered) {
    return { id: 'cover', lines: [
      'Frau Adler bat mich, nach Kasimir zu sehen. Er sitzt unter dem Tuch.',
      'Linksklick auf den Käfig: das Tuch abnehmen.',
    ] };
  }
  if (!story.has('seeds')) {
    return { id: 'seeds', lines: [
      'Kasimir hat Hunger. Laut Frachtliste ist sein Futter in Kiste 3.',
      'Die Kisten sind zugenagelt. Mit dem Brecheisen aus dem Dienstschrank geht Kiste 3 auf.',
    ] };
  }
  return { id: 'feed', lines: [
    '„Kasimir merkt sich alles. Füttern hilft.“ Ich sollte ihn füttern.',
    'Vogelfutter im Inventar anklicken, dann den Käfig.',
  ] };
}

