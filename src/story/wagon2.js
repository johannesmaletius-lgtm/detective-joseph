import { SEATS, glassBase } from '../scene/diningCar.js';
import { drawBon, drawMenuBoard } from '../ui/cards2.js';
import { VOICES, packFor, WINDOW_ITEMS, finishWagon, hintFor, inTunnel, lookOutside, tunnels, waitForTunnel } from './common.js';

// ============================================================================================
//  WAGEN 2 – Der Speisewagen
// ============================================================================================
//
// Tisch 4 ist gedeckt: vier Gläser, vier Tischkarten – Frau Adler, Herr Brandt (der Schaffner),
// Dr. Corvin und „J.“. Die Gäste sieht man nie. Sie kommen im Tunnel: Im Dunkeln wird angestoßen,
// und Herrn Brandts Rotwein ist vergiftet (Probe 41 – im Dunkeln leuchtet das Glas grün).
// Wenn das Licht wieder angeht, ist Herr Brandt verschwunden. Danach serviert der Koch alles neu.
//
// DAS ZIEL: Die Tür zum Schlafwagen hat ein Vierkantschloss. Den Schlüssel hat Herr Brandt.
//
// DIE RÄTSEL:
//   1. Mit dem Koch reden (Durchreiche hinten links): Er beobachtet die Gläser – „Finger weg!“
//   2. Einen Tunnel abwarten: Stimmen, Anstoßen, ein Glas leuchtet grün, Herr Brandt verschwindet
//   3. Den Koch ablenken: Er liebt den Ringbahn-Walzer. Das Grammophon braucht eine Kurbel
//      (in Herrn Brandts Mantel an der Garderobe) und die richtige Platte (Schublade darunter;
//      auf dem Teller liegt ein Marsch – den hasst der Koch)
//   4. Während der Walzer läuft, tanzt der Koch hinter dem Rollladen: Herrn Brandts Glas nehmen
//      und bis zum Tunnel bei sich behalten
//   5. Im Tunnel: Herr Brandt sucht sein Glas – und lebt. Zum Dank lässt er seinen Vierkant liegen
//   6. Vierkantschlüssel → Tür → Schlafwagen
//   Nebenbei: Der Bon aus der Küche (Koch fragen, nachdem man das Gift gesehen hat) ist von „J.“ unterschrieben.

const POISON_SEAT = 2;
const WALTZ_SECONDS = 42;   // so lange läuft der Walzer (und so lange tanzt der Koch)
const MARCH_SECONDS = 6;
const COOK = { x: 465, y: 205 }; // Stimme aus der Durchreiche
const BAR = { waltz: 1.26, march: 1.2 }; // Länge eines Takts in Sekunden

export const wagon2 = {
  flags: {
    shutter: 0,          // Rollladen der Durchreiche: 0 = offen (der Koch schaut heraus) … 1 = zu
    shutterTarget: 0,
    record: 'march',     // was auf dem Grammophon liegt
    poisonSeat: POISON_SEAT,
  },

  // Wer direkt hier anfängt, hat die Sachen aus Wagen 1 dabei
  prepare(story) {
    story.note('Wagen 1 liegt hinter mir: Tunnel 5, Laternen 7 und 8, Turm 3. Die Tür ging auf.');
  },

  setup(story) {
    story.flags.startedAt = performance.now();
    story.flags.packed = packFor(story, ['flashlight']);
  },

  async intro(story) {
    await arrive(story);
  },

  async skipIntro(story) {
    story.game.overlay.fade = 0;
    await arrive(story, { quick: true });
  },

  update(story, dt) {
    updateMusic(story, dt);
    const f = story.flags;
    f.shutter += Math.sign(f.shutterTarget - f.shutter) * Math.min(Math.abs(f.shutterTarget - f.shutter), dt * 2.5);
    f.poisonVisible = story.isDark && f.takenSeat !== POISON_SEAT && !f.tipped;
    // Die Gäste erscheinen als Schemen, solange im Tunnel angestoßen wird
    const ghostTarget = f.toasting && story.isDark ? 1 : 0;
    f.ghosts = (f.ghosts ?? 0) + (ghostTarget - (f.ghosts ?? 0)) * Math.min(1, dt * 2);
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    door: {
      look: async (story) => {
        await story.say('Die Tür zum Schlafwagen. Keine Klinke – nur ein Vierkantloch. So eins, für das Schaffner einen Schlüssel haben.');
        if (!story.flags.doorLooked) {
          story.flags.doorLooked = true;
          story.note('Speisewagen: Die Tür zum Schlafwagen hat ein Vierkantschloss. Den Schlüssel hat bestimmt ein Schaffner.');
        }
      },
      use: (story) => (story.has('vierkant') ? openDoor(story) : story.say('Abgeschlossen. Ohne Vierkantschlüssel komme ich hier nicht durch.')),
      items: {
        vierkant: (story) => openDoor(story),
        knife: 'Das Vierkantloch ist viel zu groß für die Messerspitze.',
        crank: 'Die Kurbel ist rund. Das Loch ist eckig.',
        other: 'Das passt nicht ins Vierkantloch.',
      },
    },

    hatch: {
      look: (story) => (story.flags.dancing
        ? story.say('Der Rollladen ist unten. Dahinter trampelt jemand im Walzertakt.')
        : story.say('Die Durchreiche zur Küche. Unter der weißen Mütze funkeln zwei Augen. Sie lassen Tisch 4 nicht los.')),
      use: (story) => talkToCook(story),
      items: {
        glass: 'Zurückgeben? Dann trinkt es nachher doch wieder jemand.',
        poisonGlass: 'Zurückgeben? Dann trinkt es nachher doch wieder jemand.',
        bon: 'Den Bon behalte ich. Er ist ein Beweis.',
        other: 'Das will der Koch bestimmt nicht haben.',
      },
    },

    bell: {
      look: 'Eine Tischglocke aus Messing. „Bitte läuten“.',
      use: async (story) => {
        story.sound('bell');
        await story.wait(0.6);
        if (story.flags.dancing) return story.say('Keine Reaktion. Hinter dem Rollladen wird nur weitergetanzt.');
        await story.speak('Ja, ja! Tisch vier ist doch längst serviert!', { at: COOK, color: VOICES.cook });
        await talkToCook(story);
      },
    },

    menu: {
      look: async (story) => {
        story.sound('paper');
        await story.card({ draw: drawMenuBoard });
        if (story.flags.menuRead) return;
        story.flags.menuRead = true;
        await story.say('Suppe, Braten, Pudding. Jede Runde dasselbe.');
        story.note('Tafel im Speisewagen: Getränke an Tisch 4 – Weißwein, Rotwein, Wasser, Saft.');
      },
    },

    coat: {
      look: async (story) => {
        await story.say('Ein Schaffnermantel, dunkelblau, mit Messingknöpfen. Am Kragen ein Namensschild: BRANDT.');
        if (!story.flags.coatLooked) {
          story.flags.coatLooked = true;
          story.note('An der Garderobe hängt der Mantel des Schaffners. Name: Brandt.');
        }
      },
      use: async (story) => {
        if (story.flags.coatSearched) return story.say('Die Taschen sind leer. Nur die leere Schlüsselschlaufe baumelt da.');
        story.flags.coatSearched = true;
        story.sound('paper');
        await story.say('Mal sehen, was ein Schaffner so in den Taschen hat …');
        story.give('crank');
        await story.say('Eine Kurbel! Die gehört doch zum Grammophon da vorne.');
        await story.say('Und eine leere Schlüsselschlaufe. Hier hing sonst bestimmt sein Vierkantschlüssel. Den hat er wohl bei sich.');
        story.note('In Herrn Brandts Manteltasche: die Kurbel vom Grammophon. Seinen Vierkantschlüssel trägt er wohl bei sich.');
      },
    },

    plant: {
      look: 'Eine Palme. Die Erde riecht nach Rotwein. Hier hat schon jemand sein Glas ausgekippt – und es kam trotzdem wieder.',
      items: {
        poisonGlass: 'Auskippen? Dann gießt der Koch ihm einfach nach. Ich behalte das Glas lieber bei mir.',
        glass: 'Auskippen bringt nichts. Was ich hierlasse, kommt nach dem Tunnel wieder.',
      },
    },

    gramophone: {
      look: (story) => {
        const f = story.flags;
        if (!f.crankOn) return story.say('Ein Grammophon mit großem Messingtrichter. Die Kurbel fehlt – ohne sie dreht sich der Teller nicht.');
        if (f.record === 'waltz') return story.say('Auf dem Teller liegt der Ringbahn-Walzer. Rotes Etikett.');
        return story.say('Auf dem Teller liegt eine Platte mit blauem Etikett: „Marsch der Eisenbahner“.');
      },
      use: (story) => playGramophone(story),
      items: {
        crank: async (story) => {
          story.remove('crank');
          story.flags.crankOn = true;
          story.sound('screw');
          await story.say('Die Kurbel passt genau. Ein paar Umdrehungen – jetzt ist die Feder aufgezogen.');
        },
        record: async (story) => {
          story.remove('record');
          story.flags.record = 'waltz';
          stopMusic(story);
          story.sound('paper');
          await story.say('Den Marsch zurück in die Schublade, den Walzer auf den Teller.');
        },
        other: 'Das gehört nicht aufs Grammophon.',
      },
    },

    drawer: {
      look: 'Eine Schublade unter dem Grammophon.',
      use: async (story) => {
        if (story.flags.recordTaken) return story.say('Nur noch Marschmusik. Platte um Platte.');
        story.sound('creak');
        await story.say('Lauter Schallplatten. Marsch, Marsch, Marsch …');
        story.flags.recordTaken = true;
        story.give('record');
        await story.say('… und ganz unten: der „Ringbahn-Walzer“. Die nehme ich mit.');
      },
    },

    keyOnPlate: {
      look: 'Ein Vierkantschlüssel. Auf Herrn Brandts Teller.',
      use: async (story) => {
        story.flags.keyOnPlate = false;
        story.give('vierkant');
        await story.say('Herrn Brandts Vierkantschlüssel. Danke, Herr Brandt – wo immer Sie jetzt sind.');
        story.note('Ich habe den Vierkantschlüssel des Schaffners. Er öffnet die Tür zum Schlafwagen.');
      },
    },

    ...Object.fromEntries([1, 2, 3, 4].map((seat) => [`glass${seat}`, {
      look: (story) => lookGlass(story, seat),
      use: (story) => takeGlass(story, seat),
      items: {
        glass: (story) => putBack(story),
        poisonGlass: (story) => putBack(story),
        other: 'Das gehört nicht auf den Tisch.',
      },
    }])),

    table: {
      look: async (story) => {
        await story.say('Tisch 4. Vier Gedecke, vier Gläser, vier Tischkarten.');
        await story.say('Frau Adler, Herr Brandt, Dr. Corvin … und „J.“. Der Platz vorne rechts ist für mich gedeckt.');
        if (!story.flags.tableLooked) {
          story.flags.tableLooked = true;
          story.note('Tisch 4 ist gedeckt: Platz 1 Frau Adler, Platz 2 Herr Brandt, Platz 3 Dr. Corvin, Platz 4 „J.“ – das bin wohl ich.');
        }
      },
      use: (story) => waitForTunnel(story, { sit: 'Ich setze mich an meinen Platz und warte auf den Tunnel. Nicht einschlafen …' }),
      items: { glass: (story) => putBack(story), poisonGlass: (story) => putBack(story) },
    },
    bench: {
      look: 'Die Bank hinter Tisch 4. Hier könnte ich auf den nächsten Tunnel warten.',
      use: (story) => waitForTunnel(story, { sit: 'Ich setze mich an Tisch 4 und warte auf den Tunnel. Nicht einschlafen …' }),
    },
    stool: { look: 'Zwei Hocker. Für Dr. Corvin und für mich, nehme ich an.' },
    leftTable: {
      look: 'Ein zweiter Tisch, nur halb gedeckt. Hier sitzt wohl nie jemand.',
      use: 'Leere Teller. Kein Krümel.',
    },
    window: {
      look: (story) => lookOutside(story),
      use: 'Die Fenster gehen nicht auf.',
      items: WINDOW_ITEMS,
    },
  },

  itemName(story, id) {
    if (id === 'glass') return `Glas von Platz ${story.flags.carriedSeat ?? '?'}`;
    return null;
  },

  items: {
    bon: { look: (story) => showBon(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  // ---------------------------------------------------------------- Tunnel
  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      return toast(story);
    }
    return afterTunnel(story);
  },
};

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('door');
      story.fadeIn(1.6);
      await story.wait(1.2);
      await story.say('Ein Speisewagen. Gedeckt für ein Festessen – und niemand da.');
      await story.speak('Ah! Herr J.! Ihr Platz ist bereit. Tisch vier, wie immer!', { at: COOK, color: VOICES.cook });
      await story.say('Wie … immer?');
    });
  }
  story.note('Speisewagen: Tisch 4 ist gedeckt, aber niemand sitzt dort. Aus der Küche ruft ein Koch: „Ihr Platz ist bereit, Herr J. – wie immer.“');
}

// ============================================================================================
//  Der Koch
// ============================================================================================

async function talkToCook(story) {
  const f = story.flags;
  if (f.dancing) return story.say('Der Rollladen ist unten. Dahinter wird im Walzertakt getrampelt. Er hört mich nicht.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Durchreiche nicht mal.');
  f.talkedCook = true;
  const used = (f.cookTopics ??= {});
  const cook = (text) => story.speak(text, { at: COOK, color: VOICES.cook });
  for (;;) {
    const topics = [
      { id: 'who', text: 'Wer sind Sie?' },
      { id: 'guests', text: 'Für wen ist Tisch 4 gedeckt?' },
      { id: 'where', text: 'Wo sind denn die Gäste?' },
      f.doorLooked && { id: 'key', text: 'Wer hat den Schlüssel für die Tür zum Schlafwagen?' },
      { id: 'glasses', text: 'Darf ich mir ein Glas nehmen?' },
      { id: 'music', text: 'Hören Sie gern Musik?' },
      f.sawPoisoning && { id: 'poison', text: 'Herrn Brandts Glas war vergiftet! Wer hat das bestellt?' },
      { id: 'bye', text: 'Bis später.' },
    ].filter(Boolean);
    const index = await story.choose(topics.map((topic) => ({ text: topic.text, used: used[topic.id] })), 'Der Koch');
    const topic = topics[index];
    if (!topic || topic.id === 'bye') {
      if (topic) await cook('Bis gleich, Herr J. Wie immer!');
      return;
    }
    used[topic.id] = true;
    await story.say(topic.text);
    if (topic.id === 'who') {
      await cook('Der Koch! Ich koche. Jede Runde dasselbe: Suppe, Braten, Pudding. Für Tisch vier.');
      await story.say('Und wer isst das alles?');
      await cook('Na, die Herrschaften! Wenn sie kommen.');
    } else if (topic.id === 'guests') {
      await cook('Für Frau Adler, für Herrn Brandt – unseren Schaffner – und für Doktor Corvin.');
      await cook('Und Platz vier ist für Sie, Herr J. Wie immer.');
      story.note('Laut Koch sitzen an Tisch 4: Frau Adler, Herr Brandt (der Schaffner), Dr. Corvin – und ich.');
    } else if (topic.id === 'where') {
      await cook('Die kommen im Tunnel. Wenn es dunkel ist, wird angestoßen.');
      await cook('Und wenn das Licht wieder angeht … fehlt einer. Jede Runde. Aber das geht mich nichts an.');
      story.note('Koch: „Die Gäste kommen im Tunnel. Im Dunkeln wird angestoßen. Wenn das Licht wieder angeht, fehlt einer.“');
    } else if (topic.id === 'key') {
      await cook('Den Vierkant? Den hat Herr Brandt. Der rückt ihn nicht raus. Nicht mal für Sie.');
      story.note('Den Vierkantschlüssel für die Tür hat Herr Brandt, der Schaffner (Platz 2).');
    } else if (topic.id === 'glasses') {
      await cook('Finger weg! Die Gläser sind für die Herrschaften. Ich hab ein Auge drauf. Immer.');
      await story.say('Das glaube ich ihm sofort.');
    } else if (topic.id === 'music') {
      await cook('Musik! Den Ringbahn-Walzer! Wenn der läuft, kann ich nicht stillstehen. Dann muss ich tanzen!');
      await cook('Aber das Grammophon hat keine Kurbel mehr. Herr Brandt hat sie eingesteckt. Er hasst Walzer.');
      if (!f.knowsWaltz) {
        f.knowsWaltz = true;
        story.note('Der Koch liebt den „Ringbahn-Walzer“: Wenn der läuft, muss er tanzen. Die Kurbel vom Grammophon hat Herr Brandt eingesteckt.');
      }
    } else if (topic.id === 'poison') {
      await cook('Vergiftet? Unsinn! Ich serviere nur, was bestellt ist. Hier – lesen Sie selbst!');
      if (!story.has('bon')) {
        story.give('bon');
        await showBon(story);
      }
    }
  }
}

async function showBon(story) {
  story.sound('paper');
  await story.card({ draw: drawBon });
  if (story.flags.bonRead) return;
  story.flags.bonRead = true;
  story.sound('dread');
  await story.say('„Platz 2: Rotwein – mit einem Schuss Probe 41.“');
  await story.say('Unterschrieben mit „J.“ … Das ist meine Unterschrift.');
  story.note('Der Bon aus der Küche: „Platz 2: Rotwein – mit einem Schuss Probe 41.“ Unterschrift: „J.“ – in meiner Schrift. Habe ICH das bestellt?!');
}

// ============================================================================================
//  Grammophon und Musik
// ============================================================================================

async function playGramophone(story) {
  const f = story.flags;
  if (!f.crankOn) return story.say('Ohne Kurbel dreht sich nichts. Irgendwer hat sie abgezogen.');
  if (f.music) return story.say('Die Platte läuft doch schon.');
  story.sound('screw');
  await story.wait(0.4);
  startMusic(story, f.record);
  if (f.record === 'march') {
    await story.say('Marschmusik. Laut und schief.');
    await story.wait(0.8);
    if (inTunnel(story)) return;
    await story.speak('Aufhören! Diesen Krach halte ich nicht aus! Wenn schon Musik, dann einen Walzer!', { at: COOK, color: VOICES.cook });
    stopMusic(story);
    await story.say('Schon gut, schon gut. Der Koch mag keine Marschmusik.');
    if (!f.marchNoted) {
      f.marchNoted = true;
      story.note('Auf dem Grammophon liegt ein Marsch – den hasst der Koch. Er will einen Walzer.');
    }
    return;
  }
  // Der Walzer: Der Koch muss tanzen und lässt den Rollladen herunter
  await story.say('Der Ringbahn-Walzer …');
  await story.speak('Mein Walzer!! Oh, da kann ich nicht stillstehen!', { at: COOK, color: VOICES.cook });
  f.dancing = true;
  f.shutterTarget = 1;
  story.sound('shutter');
  await story.wait(0.6);
  await story.say('Er hat den Rollladen heruntergelassen – und tanzt. Jetzt sieht er nicht hin!');
  if (!f.danceNoted) {
    f.danceNoted = true;
    story.note('Wenn der Ringbahn-Walzer läuft, tanzt der Koch hinter dem heruntergelassenen Rollladen – und lässt Tisch 4 aus den Augen. Die Platte läuft nicht lange.');
  }
}

function startMusic(story, record) {
  const f = story.flags;
  f.music = record;
  f.musicTime = 0;
  f.musicBar = 0;
}

function stopMusic(story) {
  story.flags.music = false;
}

// In jedem Bild: Takt für Takt Musik spielen; wenn die Platte zu Ende ist, kommt der Koch zurück
function updateMusic(story, dt) {
  const f = story.flags;
  if (!f.music) return;
  const length = f.music === 'waltz' ? WALTZ_SECONDS : MARCH_SECONDS;
  const bar = BAR[f.music];
  if (f.musicTime >= f.musicBar * bar) {
    story.sound(f.music, f.musicBar);
    if (f.dancing) story.sound('stomp');
    f.musicBar += 1;
  }
  f.musicTime += dt;
  if (f.musicTime < length) return;
  stopMusic(story);
  if (f.dancing) endDance(story);
}

async function endDance(story) {
  const f = story.flags;
  f.dancing = false;
  await story.wait(0.8);
  f.shutterTarget = 0;
  story.sound('shutter');
  await story.wait(0.5);
  if (story.isBusy) return;
  await story.speak('Hach … Schön war das. So – wieder an die Arbeit!', { at: COOK, color: VOICES.cook });
  if (story.flags.takenSeat === POISON_SEAT && !story.flags.saved) {
    await story.say('Er sieht wieder hin. Aber Herrn Brandts Glas habe ich. Jetzt nur noch auf den Tunnel warten.');
  }
}

// ============================================================================================
//  Die Gläser
// ============================================================================================

const SEAT_NAMES = { 1: 'Frau Adler', 2: 'Herr Brandt', 3: 'Dr. Corvin', 4: 'J.' };
const DRINKS = { 1: 'Weißwein', 2: 'Rotwein', 3: 'Wasser', 4: 'Orangensaft' };

async function lookGlass(story, seat) {
  const f = story.flags;
  if (story.isDark && seat === POISON_SEAT && f.takenSeat !== seat) {
    await story.say('Herrn Brandts Glas leuchtet grün. Wie das Glas im ersten Abteil – „Probe 41“.');
    return;
  }
  if (f.takenSeat === seat) return story.say(`Das Glas von Platz ${seat} habe ich bei mir. Nur die Tischkarte steht noch da: ${SEAT_NAMES[seat]}.`);
  if (f.tipped === seat) return story.say('Umgekippt und leer. Die Tischkarte liegt flach: Herr Brandt.');
  const extra = seat === POISON_SEAT && f.sawPoisoning ? ' Das Glas, das im Dunkeln grün geleuchtet hat.' : seat === 4 ? ' Mein Platz.' : '';
  await story.say(`Platz ${seat}: ${SEAT_NAMES[seat]}. ${DRINKS[seat]}.${extra}`);
}

function carriesGlass(story) {
  return story.has('glass') || story.has('poisonGlass');
}

async function takeGlass(story, seat) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln greife ich nicht nach fremden Gläsern.');
  if (f.tipped === seat) return story.say('Umgekippt und leer. Da ist nichts mehr zu holen.');
  if (f.takenSeat === seat) return story.say('Das Glas von diesem Platz habe ich schon.');
  if (carriesGlass(story)) return story.say('Ich habe schon ein Glas in der Hand. Mehr kann ich nicht tragen, ohne zu kleckern.');
  if (f.shutter < 0.6) {
    await story.speak('Finger weg! Die Gläser sind für die Herrschaften!', { at: COOK, color: VOICES.cook });
    await story.say('Der Koch lässt den Tisch keine Sekunde aus den Augen.');
    if (!f.watchedNoted) {
      f.watchedNoted = true;
      story.note('Der Koch beobachtet Tisch 4 durch die Durchreiche. Solange er hinsieht, darf ich kein Glas anfassen. Ich muss ihn ablenken.');
    }
    return;
  }
  f.takenSeat = seat;
  f.carriedSeat = seat;
  story.give(seat === POISON_SEAT ? 'poisonGlass' : 'glass');
  if (seat === POISON_SEAT) {
    await story.say('Herrn Brandts Rotwein. Den nehme ich mit.');
    await story.say('Was ich bei mir trage, bleibt bei mir – auch im Tunnel. Dann kann ihn keiner trinken.');
  } else {
    await story.say(`Das Glas von Platz ${seat}. ${DRINKS[seat]}.`);
  }
}

async function putBack(story) {
  const f = story.flags;
  story.remove('glass');
  story.remove('poisonGlass');
  if (f.takenSeat) f.takenSeat = null;
  story.sound('pickup');
  await story.say('Ich stelle das Glas zurück an seinen Platz.');
}

// ============================================================================================
//  Tunnel: Im Dunkeln wird angestoßen
// ============================================================================================

function seatVoice(seat) {
  const [x, y] = glassBase(seat);
  return { x: x - 10, y: y - 150 };
}

async function toast(story) {
  const f = story.flags;
  const saving = f.takenSeat === POISON_SEAT && !f.saved;
  const ghost = (seat, text) => story.speak(text, { at: seatVoice(seat), color: VOICES.ghost });
  f.brandtGone = Boolean(f.saved); // nach seiner Rettung sitzt Herr Brandt nicht mehr am Tisch
  await story.cutscene(async () => {
    try {
      await toastScene();
    } finally {
      f.toasting = false;
    }
  });

  async function toastScene() {
    await story.wait(0.4);
    f.toasting = true;
    if (!f.firstDark) {
      f.firstDark = true;
      await story.say(saving ? 'Licht aus. Jetzt kommt es drauf an …' : 'Licht aus … an Tisch 4 sitzen Schatten! Und ein Glas leuchtet grün.');
    }
    if (saving) {
      await ghost(1, 'Auf die Ringbahn!');
      await ghost(2, 'Moment – wo ist mein Glas?');
      story.sound('clink');
      await ghost(2, 'Sie da, mit der Lampe! Sie haben es? Riechen Sie mal: Probe 41!');
      await ghost(2, 'Sie haben mir das Leben gerettet. Hier – mein Vierkant. Für die Tür.');
      story.sound('key');
      f.saved = true;
      f.keyOnPlate = true;
      f.brandtGone = true;
      return;
    }
    if (f.saved) {
      await ghost(1, 'Auf die Ringbahn!');
      story.sound('clink');
      await ghost(3, 'Zum Wohl!');
      return;
    }
    await ghost(1, 'Auf die Ringbahn!');
    await ghost(2, 'Und auf die nächste Runde!');
    await ghost(3, 'Zum Wohl!');
    story.sound('clink');
    await story.wait(0.9);
    story.sound('gasp');
    await ghost(2, 'Was … ist … das …');
    await story.wait(0.6);
    f.tipped = POISON_SEAT;
    f.brandtGone = true;
    f.sawPoisoning = true;
    await story.say('Herr Brandt?!');
  }
}

async function afterTunnel(story) {
  const f = story.flags;
  await story.idle();
  if (f.saved && !f.savedNoted) {
    f.savedNoted = true;
    await story.cutscene(async () => {
      await story.wait(0.5);
      await story.say('Das Licht ist wieder da. Die Plätze sind leer – aber auf Herrn Brandts Teller liegt etwas. Sein Vierkantschlüssel!');
      await story.say('Er hat nichts getrunken – und ist trotzdem verschwunden. Aber diesmal lebend, glaube ich.');
    });
    story.remove('poisonGlass');
    f.takenSeat = null;
    story.note('Ich hatte Herrn Brandts Glas bei mir, als der Tunnel kam. Er hat sein Glas gesucht – und mir zum Dank im Dunkeln seinen Vierkantschlüssel hingelegt. Das Giftglas habe ich weggestellt.');
    return;
  }
  if (f.tipped) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      if (!f.poisonNoted) {
        await story.say('Das Licht ist wieder an. Platz 2: das Glas umgekippt, die Tischkarte umgefallen.');
        await story.say('Herr Brandt hat getrunken – und ist verschwunden. Sein Glas hat im Dunkeln grün geleuchtet …');
      } else {
        await story.say('Wieder Platz 2. Wieder Herr Brandt.');
      }
      if (f.carriedSeat && carriesGlass(story) && f.carriedSeat !== POISON_SEAT) await story.say('Ich hatte das falsche Glas in der Hand.');
    });
    if (!f.poisonNoted) {
      f.poisonNoted = true;
      story.note('Im Tunnel stießen Stimmen an: Frau Adler, Herr Brandt, Dr. Corvin. Herrn Brandts Rotwein (Platz 2) leuchtete grün – Probe 41. Er röchelte, und als das Licht anging, war er fort.');
    }
    await story.wait(2.2);
    if (inTunnel(story)) return;
    await story.cutscene(async () => {
      story.sound('bell');
      story.flags.emptyTable = true;
      await story.speak('Tisch vier wird neu serviert! Wie jede Runde!', { at: COOK, color: VOICES.cook });
      story.sound('clink');
      f.tipped = null;
      f.takenSeat = null;
      story.flags.emptyTable = false;
      if (!f.resetNoted) {
        f.resetNoted = true;
        await story.say('Alles wieder da. Auch Herrn Brandts Glas. Und das Gift darin, wette ich.');
        story.note('Nach dem Tunnel serviert der Koch alles neu – auch das vergiftete Glas an Platz 2. Wenn ich das Glas vom Tisch nehme und beim nächsten Tunnel bei mir trage …');
      }
    });
    return;
  }
  // Nach dem Tunnel steht auf dem Tisch wieder alles – auch das Glas, das Joseph bei sich trägt
  f.takenSeat = null;
}

// ============================================================================================
//  Tür
// ============================================================================================

async function openDoor(story) {
  if (!story.has('vierkant')) return story.say('Ich brauche einen Vierkantschlüssel.');
  await story.cutscene(async () => {
    story.sound('key');
    await story.wait(0.7);
    await story.say('Der Vierkant passt. Eine halbe Drehung …');
    await story.speak('Gute Fahrt, Herr J.! Bis zur nächsten Runde!', { at: COOK, color: VOICES.cook });
    await story.say('Der nächste Wagen: der Schlafwagen. Leise jetzt.');
    story.sound('door');
    await story.wait(0.8);
    await story.fadeOut(1.4);
    story.note('Mit Herrn Brandts Vierkant ging die Tür zum Schlafwagen auf.');
  });
  await finishWagon(story, { number: 2, next: 3, nextName: 'Schlafwagen' });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (story.has('vierkant')) return { id: 'door', lines: ['Mit dem Vierkantschlüssel an die Tür zum Schlafwagen.'] };
  if (f.keyOnPlate) return { id: 'plate', lines: ['Auf Herrn Brandts Teller liegt sein Vierkantschlüssel. Den sollte ich nehmen.'] };
  if (!f.talkedCook) {
    return { id: 'cook', lines: [
      'Hinten links ist die Durchreiche zur Küche. Der Koch dort weiß bestimmt mehr.',
      'Linksklick auf die Durchreiche: Dann kann ich mit dem Koch reden.',
    ] };
  }
  if (!f.sawPoisoning) {
    return { id: 'tunnel', lines: [
      'Der Koch sagt: Die Gäste kommen im Tunnel. Ich sollte abwarten, was dann an Tisch 4 passiert.',
      'An Tisch 4 (oder auf der Bank dahinter) kann ich mich setzen und auf den Tunnel warten.',
    ] };
  }
  if (story.has('poisonGlass')) {
    return { id: 'hold', lines: [
      'Herrn Brandts Glas habe ich. Jetzt muss ich es nur bis zum nächsten Tunnel bei mir behalten.',
      'An Tisch 4 kann ich auf den Tunnel warten.',
    ] };
  }
  const distract = [
    'Herrn Brandts Glas ist vergiftet. Wenn es im Tunnel nicht auf dem Tisch steht, kann er es nicht trinken.',
    'Was ich bei mir trage, nimmt mir der Tunnel nicht weg. Aber der Koch passt auf die Gläser auf – ich muss ihn ablenken.',
  ];
  if (!f.knowsWaltz) return { id: 'music', lines: [...distract, 'Ich sollte den Koch fragen, was er gern mag – zum Beispiel Musik.'] };
  if (!f.crankOn && !story.has('crank')) {
    return { id: 'crank', lines: [...distract, 'Der Koch liebt Walzer. Das Grammophon braucht eine Kurbel – Herr Brandt hat sie eingesteckt.', 'Herrn Brandts Mantel hängt hinten links an der Garderobe. In der Tasche steckt die Kurbel.'] };
  }
  if (!f.crankOn) return { id: 'crankOn', lines: ['Die Kurbel gehört ans Grammophon: Kurbel im Inventar anklicken, dann das Grammophon.'] };
  if (f.record !== 'waltz') {
    return { id: 'record', lines: [
      'Auf dem Grammophon liegt ein Marsch. Der Koch will einen Walzer.',
      f.recordTaken ? 'Den Walzer habe ich: Schallplatte im Inventar anklicken, dann das Grammophon.' : 'In der Schublade unter dem Grammophon liegen noch mehr Platten.',
    ] };
  }
  return { id: 'take', lines: [
    'Wenn der Walzer läuft, tanzt der Koch und sieht nicht hin.',
    'Grammophon anstellen, dann schnell das Glas von Platz 2 (Herr Brandt, Rotwein) nehmen – und bis zum Tunnel behalten.',
  ] };
}
