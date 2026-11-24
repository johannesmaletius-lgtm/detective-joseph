import { CUP_X, GLASS_X, SEAT_SLOTS, drawBill, drawMenu, drawNameCard, drawSeatingPlan, drawTray } from './art/wagon4.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 4 – Der Speisewagen (Koch Bruno)
// ============================================================================================
//
// Am Ende von Wagen 3 stand in einem Brief: „Morgen verschwindet jemand. Achte auf die Gläser.“
// Koch Bruno deckt jede Runde für sechs Tische – für Gäste, die nie kommen. Jemand hat die
// Namenskärtchen vertauscht, und Bruno weiß nicht mehr, wer wo sitzt.
//
// DIE RÄTSEL
//   1. Tischordnung: Bruno erinnert sich in Bruchstücken (Gespräch), dazu Spuren an den Stühlen
//      (grüner Strickschal = Frau Ilse, Fliegerbrille = J.). Lösung:
//         Tisch 1 (hinten links)  Herr Tick      Tisch 4 (hinten rechts)  Herr Moll
//         Tisch 2 (Mitte links)   Frau Ilse      Tisch 5 (Mitte rechts)   J.
//         Tisch 3 (vorne links)   Herr K.        Tisch 6 (vorne rechts)   Dame mit Tochter
//   2. Das vergiftete Glas: Im ersten Tunnel schleicht jemand ans Tablett. Danach riecht Glas 3
//      nach Bittermandel. Bruno serviert „von hinten nach vorne, erst links, dann rechts“, Kakao
//      für die, die zu jung für Wein sind (J. an Tisch 5, die Tochter an Tisch 6) → Glas 3 geht an
//      Tisch 3 = Herrn K.
//   3. Bruno lässt niemanden ans Tablett. Nur wenn die Räder in der Kurve quietschen, dreht er sich
//      zum Herd und hält sich die Ohren zu – dann nimmt Joseph Glas 3 und die Rechnung darunter.
//   4. Die Kasse muss stimmen: 7 Personen × (3 + 9 + 2) = 98, Wein 5 × 4 = 20, Kakao 2 × 2 = 4
//      → 122 an der Registrierkasse → die Tür entriegelt sich.
//
// Ergebnis: Das Opfer sollte Herr K. sein.

const SOLUTION = ['tick', 'ilse', 'k', 'moll', 'j', 'lady']; // Tisch 1 … 6
const START = ['k', 'j', 'tick', 'lady', 'moll', 'ilse'];    // so liegen die Kärtchen am Anfang
const NAMES = { tick: 'Herr Tick', ilse: 'Frau Ilse', k: 'Herr K.', moll: 'Herr Moll', j: 'J.', lady: 'Dame mit Tochter' };
const REGISTER_CODE = '122';
const POISON = 2; // das dritte Glas (gezählt ab 0)

export const wagon4 = {
  flags: {},
  startItems: ['flashlight', 'knife'],
  recap: [
    'Wagen 1: Aufgewacht in einem Nachtzug, der im Kreis fährt. In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt.',
    'Meine eigene Akte: Fall „Der verschwundene Nachtzug“. Im Tunnel verschwindet jede Runde ein Fahrgast.',
    'Wagen 3: Ein Brief an J. aus „Runde 108“: „Morgen verschwindet jemand. Achte auf die Gläser.“',
  ],

  setup(story) {
    story.flags.cluesHeard = 0;
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 4,
      title: 'Der Speisewagen',
      lines: [
        'Der Speisewagen. Es riecht nach Braten und Kerzenwachs.',
        '„Achte auf die Gläser“, stand in dem Brief. Hier stehen jede Menge Gläser.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    bruno: {
      look: (story) => story.say(story.flags.metBruno
        ? 'Bruno. Er rührt in seinen Töpfen, als käme gleich der ganze Zug zum Essen.'
        : 'Ein Koch mit gewaltigem Schnurrbart. Er sieht aus, als hätte er seit Jahren nicht geschlafen.'),
      use: (story) => talkToBruno(story),
      items: {
        poisonGlass: (story) => showGlassToBruno(story),
        bill: 'Bruno: „Meine Rechnung! Rechnen müssen Sie selbst, junger Mann – ich hab zu tun.“',
        menu: 'Bruno: „Die Karte kenne ich auswendig. Seit hundert Runden dieselbe.“',
        flashlight: 'Ich leuchte ihm nicht ins Gesicht. Er hat ein Messer in der Hand.',
        knife: 'Lieber nicht. Bruno hat das größere Messer.',
      },
    },

    tray: {
      look: (story) => story.say(story.flags.glassTaken
        ? 'Die Gläser auf der Durchreiche. Eins fehlt – das habe ich.'
        : 'Auf der Durchreiche steht ein Tablett: fünf Gläser Rotwein, zwei Tassen Kakao.'),
      use: (story) => openTray(story),
    },

    menu: {
      look: 'Eine Speisekarte, am Schrank festgesteckt.',
      use: (story) => readMenu(story),
    },

    register: {
      look: async (story) => {
        await story.say('Eine prächtige Registrierkasse aus Messing. Drei Zahlenrädchen, eine Kurbel.');
        if (story.flags.registerOpen) await story.say('Die Kasse stimmt. Die Tür ist entriegelt.');
        else if (story.flags.heardRegisterRule) await story.say('„Die Tür geht erst auf, wenn die Kasse stimmt“, sagt Bruno.');
      },
      use: (story) => useRegister(story),
      items: {
        bill: (story) => useRegister(story),
        knife: 'Die Kasse aufbrechen? Bruno steht direkt daneben.',
      },
    },

    door: {
      look: 'Die Tür nach vorne. Kein Schloss, kein Griff – nur ein Riegel, der mit einem Kabel zur Kasse führt.',
      use: (story) => tryDoor(story),
      items: { knife: 'Der Riegel sitzt innen. Da komme ich nicht ran.' },
    },

    scarf: {
      look: async (story) => {
        await story.say('Ein grüner Schal über der Stuhllehne. Selbstgestrickt – und noch nicht fertig. Die Stricknadeln stecken noch drin.');
        story.flags.sawScarf = true;
        story.note('Am Tisch Mitte links (Tisch 2) hängt ein halb fertiger, grüner Strickschal.');
      },
      use: 'Der gehört jemandem, der gerne strickt. Ich lasse ihn hängen.',
    },
    goggles: {
      look: async (story) => {
        await story.say('Eine Fliegerbrille, über die Stuhllehne gehängt. Genau wie meine …');
        await story.say('Ich taste nach meiner Stirn. Meine ist noch da. Dann gehört die hier … einem anderen J.?');
        story.flags.sawGoggles = true;
        story.note('Am Tisch Mitte rechts (Tisch 5) hängt eine Fliegerbrille – genau wie meine.');
      },
      use: 'Ich habe schon eine. Ich lasse sie hängen.',
    },
    coatBrown: { look: 'Ein brauner Wollmantel. In der Tasche nur Krümel.', use: 'Nur Krümel in den Taschen.' },
    coatGrey: {
      look: 'Ein grauer Damenmantel. In der Tasche ein kleiner, roter Kinderhandschuh und ein Zettel: „Mira – nicht wieder den Hasen liegen lassen! Papa wartet am Bahnsteig.“',
      use: 'Ein Kinderhandschuh in der Manteltasche. Eine Mutter mit Kind also.',
    },
    towel: { look: 'Ein Geschirrtuch. Brunos wahrscheinlich.', use: 'Das gehört in die Küche.' },

    tableLH: table(0),
    tableLM: table(1),
    tableLV: table(2),
    tableRH: table(3),
    tableRM: table(4),
    tableRV: table(5),

    kitchen: {
      look: 'Brunos Küche: Töpfe, Pfannen, ein Herd, auf dem etwas brodelt. Es riecht wunderbar.',
      use: 'Bruno würde mich mit dem Kochlöffel verjagen.',
    },
    cabinet: { look: 'Ein Schrank voller Tischdecken und Kerzen.', use: 'Tischdecken, Servietten, Kerzen. Nichts für mich.' },
    jar: { look: 'Wieder ein Glas mit grün leuchtender Flüssigkeit. „Probe 41“. Wie im ersten Abteil.' },
    window: {
      look: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Draußen Schnee, Wald – und der Turm mit dem roten Licht. Immer derselbe.'),
      use: (story) => waitForTunnel(story, 'Ich schaue kurz hinaus und warte auf den Tunnel …'),
    },
  },

  items: {
    bill: { look: (story) => readBill(story) },
    menu: { look: (story) => readMenu(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  onSqueal(story) {
    if (story.flags.registerOpen) return;
    story.character('bruno').act('ears', Math.max(0.5, story.squealUntil - story.motion.time));
    if (!story.flags.squealSeen && story.flags.trayGuarded && !story.isBusy) {
      story.flags.squealSeen = true;
      story.respond(async () => {
        await story.speakAs('bruno', 'Aaah, dieses Quietschen! Meine armen Ohren!');
        await story.say('Er dreht sich zum Herd und hält sich die Ohren zu. Jetzt sieht er nicht zum Tablett …');
      });
    }
  },

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      if (story.flags.tunnels === 1) {
        await story.idle();
        story.sound('footsteps');
        await story.wait(1.2);
        story.sound('glass');
        await story.speakAs('bruno', 'He! Wer ist da an meinem Tablett?!');
        await story.say('Da war jemand! Direkt neben mir, im Dunkeln.');
      }
      return;
    }
    // nach dem Tunnel: Das Glas, das Joseph mitgenommen hat, steht wieder auf dem Tablett
    if (story.flags.tunnels === 1) {
      story.flags.poisoned = true;
      await story.idle();
      await story.speakAs('bruno', 'Licht! Na also. Wo war ich … ach ja, der Wein.');
      story.note('Im ersten Tunnel war jemand im Dunkeln an Brunos Tablett mit den Gläsern.');
    }
    if (story.flags.glassTaken && !story.flags.glassBack) {
      story.flags.glassBack = true;
      await story.idle();
      await story.say('Auf dem Tablett stehen wieder fünf Gläser. Das dritte ist zurück – obwohl ich es bei mir trage.');
    }
  },
};

// ============================================================================================
//  Bruno
// ============================================================================================

async function talkToBruno(story) {
  const f = story.flags;
  if (!f.metBruno) {
    f.metBruno = true;
    await story.say('Guten Abend …?');
    await story.speakAs('bruno', 'Ah! Ein Gast! Endlich! Bruno, Koch des Speisewagens. Setzen Sie sich, setzen Sie sich!');
    await story.speakAs('bruno', 'Ach nein, warten Sie – die Kärtchen! Jemand hat alle Namenskärtchen vertauscht.');
    await story.speakAs('bruno', 'Und ich weiß nicht mehr, wer wo sitzt. Jede Runde decke ich neu, und jede Runde vergesse ich es wieder.');
    story.note('Koch Bruno deckt sechs Tische fürs Weihnachtsmenü. Jemand hat die Namenskärtchen vertauscht – Bruno weiß nicht mehr, wer wo sitzt.');
  }
  for (;;) {
    const topics = [
      { id: 'who', text: 'Wer sitzt denn wo?', done: f.cluesHeard >= 6 },
      { id: 'order', text: 'Wie servieren Sie den Wein?', done: f.heardOrder, when: Boolean(f.seatingDone) },
      { id: 'door', text: 'Wie komme ich durch die Tür nach vorne?', done: f.heardRegisterRule },
      { id: 'guests', text: 'Wo sind Ihre Gäste?', done: f.askedGuests },
      { id: 'bye', text: 'Ich sehe mich weiter um.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'who') await brunoRemembers(story);
    if (topic === 'order') await brunoOrder(story);
    if (topic === 'door') await brunoDoor(story);
    if (topic === 'guests') await brunoGuests(story);
  }
}

// Bruno erinnert sich in Bruchstücken – bei jeder Frage an zwei mehr
const CLUES = [
  {
    say: ['Herr Tick sitzt hinten – so nah an der Tür wie möglich. Er will immer als Erster raus.', 'Und auf der Küchenseite, damit er sein Essen als Erster bekommt.'],
    note: 'Bruno: Herr Tick sitzt hinten (nah an der Tür) und auf der Küchenseite (links).',
  },
  {
    say: ['Herr Moll sitzt Herrn Tick genau gegenüber, über den Gang. Die beiden streiten jede Runde über den Takt der Räder.'],
    note: 'Bruno: Herr Moll sitzt Herrn Tick genau gegenüber, auf der anderen Seite des Gangs.',
  },
  {
    say: ['Frau Ilse strickt. Immer. Sogar zwischen Suppe und Braten. Immer grüne Wolle.'],
    note: 'Bruno: Frau Ilse strickt immer – mit grüner Wolle.',
  },
  {
    say: ['Die Dame mit ihrer Kleinen sitzt auf der rechten Seite, weit weg vom Küchendunst.', 'Aber nicht neben Herrn Moll! Der summt beim Essen, das kann die Kleine nicht leiden.'],
    note: 'Bruno: Die Dame mit Tochter sitzt rechts – aber nicht direkt neben Herrn Moll.',
  },
  {
    say: ['Der junge Herr J. trägt eine Fliegerbrille. So wie Sie, ha!', 'Er bekommt Kakao. Für Wein ist er zu jung – siebzehn, glaube ich.'],
    note: 'Bruno: J. trägt eine Fliegerbrille wie ich. Er ist erst siebzehn und bekommt Kakao statt Wein.',
  },
  {
    say: ['Und Herr K.? Der sagt jede Runde: „Mir egal, wo ich sitze.“ Er nimmt den Platz, der übrig bleibt.'],
    note: 'Bruno: Herr K. nimmt den Platz, der übrig bleibt.',
  },
];

async function brunoRemembers(story) {
  const f = story.flags;
  if (f.cluesHeard >= CLUES.length) {
    await story.speakAs('bruno', 'Mehr weiß ich nicht. Steht doch alles in Ihrem Büchlein, oder?');
    return;
  }
  await story.speakAs('bruno', 'Wer wo sitzt … Lassen Sie mich nachdenken …');
  for (const clue of CLUES.slice(f.cluesHeard, f.cluesHeard + 2)) {
    for (const line of clue.say) await story.speakAs('bruno', line);
    story.note(clue.note);
  }
  f.cluesHeard = Math.min(CLUES.length, f.cluesHeard + 2);
  if (f.cluesHeard < CLUES.length) await story.speakAs('bruno', 'Da war noch mehr … fragen Sie mich gleich noch mal.');
  else {
    await story.speakAs('bruno', 'Das ist alles. Ordnen Sie die Kärtchen? Meine Hände sind voller Bratensoße.');
    story.note('Die Kärtchen liegen auf den Tischen. Wenn ich auf einen Tisch klicke, kann ich sie neu verteilen.');
  }
}

async function brunoOrder(story) {
  story.flags.heardOrder = true;
  await story.speakAs('bruno', 'Immer gleich: Die Gläser stehen auf dem Tablett in der Reihenfolge, in der ich sie bringe.');
  await story.speakAs('bruno', 'Von hinten nach vorne, erst die linke Seite, dann die rechte. Wer zu jung für Wein ist, kriegt Kakao – der kommt zuletzt.');
  story.note('Bruno serviert die fünf Weingläser vom Tablett der Reihe nach: von hinten nach vorne, erst links, dann rechts. Wer Kakao bekommt, wird beim Wein übersprungen.');
  await checkVictim(story);
}

async function brunoDoor(story) {
  story.flags.heardRegisterRule = true;
  await story.speakAs('bruno', 'Die Tür? Die geht erst auf, wenn die Kasse stimmt. Vorschrift vom Schaffner!');
  await story.speakAs('bruno', 'Das ganze Weihnachtsmenü, für alle Gäste, auf Heller und Pfennig. Die Rechnung schreibe ich, sobald ich weiß, wer wo sitzt.');
  story.note('Bruno: Die Tür nach vorne geht erst auf, wenn die Kasse stimmt – die Summe des ganzen Weihnachtsmenüs für alle Gäste.');
}

async function brunoGuests(story) {
  story.flags.askedGuests = true;
  await story.speakAs('bruno', 'Die kommen gleich! … Glaube ich.');
  await story.speakAs('bruno', 'Wissen Sie, manchmal kommt es mir vor, als hätte ich dieses Essen schon hundertmal gekocht. Für niemanden.');
  await story.say('Hundertmal dasselbe Essen. Wie die Runden.');
}

async function showGlassToBruno(story) {
  if (story.flags.showedGlass) return story.speakAs('bruno', 'Nehmen Sie das weg! Ich will es nicht sehen!');
  story.flags.showedGlass = true;
  await story.say('Bruno, riechen Sie mal. Das ist das Glas für Tisch drei.');
  story.sound('sniff');
  await story.wait(0.8);
  await story.speakAs('bruno', 'Bittermandel?! In MEINEM Wein?');
  await story.speakAs('bruno', 'Der Wein … den hat mir ein junger Mann gebracht. Mit Schal und Fliegerbrille. „Ein Geschenk vom Schaffner, für Tisch drei“, hat er gesagt.');
  await story.say('Ein junger Mann mit Schal und Fliegerbrille? Das klingt wie … ich.');
  story.note('Bruno: Den Wein brachte ihm ein junger Mann mit Schal und Fliegerbrille – „ein Geschenk vom Schaffner, für Tisch drei“. Das klingt wie ich.');
}

// ============================================================================================
//  Tische und Tischordnung
// ============================================================================================

function table(index) {
  return {
    look: async (story) => {
      const card = currentCard(story, index);
      await story.say(`Tisch ${index + 1}. Gedeckt für ${index === 5 ? 'zwei' : 'einen'}. Auf dem Kärtchen steht: „${NAMES[card]}“.`);
      if (!story.flags.seatingDone && !story.flags.cardsNoticed) {
        story.flags.cardsNoticed = true;
        await story.say('Bruno sagt, die Kärtchen sind vertauscht.');
      }
    },
    use: (story) => openSeating(story),
  };
}

function currentCard(story, index) {
  const placement = story.flags.seatingDone ? SOLUTION : (story.game.views.arrange.memory.seating ? placementFromMemory(story) : START);
  return placement[index];
}

function placementFromMemory(story) {
  const memory = story.game.views.arrange.memory.seating;
  return SEAT_SLOTS.map((_, i) => Object.keys(memory).find((id) => memory[id].slot === i) ?? START[i]);
}

async function openSeating(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Kärtchen nicht lesen.');
  if (story.flags.seatingDone) return story.say('Die Kärtchen liegen richtig. Bruno ist glücklich.');
  if (!story.flags.metBruno) await story.say('Namenskärtchen. Vielleicht weiß der Koch, wer wo sitzt.');
  const solved = await story.view('arrange', {
    id: 'seating',
    title: 'Die Namenskärtchen',
    slots: SEAT_SLOTS,
    tokens: START.map((id, i) => ({ id, label: NAMES[id], w: 120, h: 44, slot: i })),
    drawBackground: drawSeatingPlan,
    drawToken: drawNameCard,
    check: (placement) => placement.every((id, i) => id === SOLUTION[i]),
    help: 'Kärtchen mit gedrückter Maustaste auf einen anderen Tisch ziehen (sie tauschen die Plätze)  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  story.flags.seatingDone = true;
  await story.cutscene(async () => {
    await story.say('So müsste es stimmen.');
    await story.speakAs('bruno', 'Ja! JA! Genau so! Herr Tick hinten links, Frau Ilse, dann Herr K. vorne links …');
    await story.speakAs('bruno', 'Herr Moll, der junge J., und vorne rechts die Dame mit der Kleinen. Jetzt weiß ich es wieder!');
    await story.speakAs('bruno', 'Dann schreibe ich schnell die Rechnung … so … und unter das Tablett damit, wie immer.');
  });
  story.note('Tischordnung gelöst: Tisch 1 Herr Tick, 2 Frau Ilse, 3 Herr K. (vorne links), 4 Herr Moll, 5 J., 6 Dame mit Tochter. Bruno hat die Rechnung unter das Tablett gelegt.');
  await checkVictim(story);
}

// ============================================================================================
//  Tablett, Gläser, Rechnung
// ============================================================================================

async function openTray(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln stoße ich nur die Gläser um.');
  const f = story.flags;
  const spots = () => [
    ...GLASS_X.map((x, i) => (i === POISON && f.glassTaken && !f.glassBack ? null : { id: `glass${i}`, x: x - 46, y: 290, w: 92, h: 190, label: `Glas ${i + 1}` })).filter(Boolean),
    ...CUP_X.map((x, i) => ({ id: `cup${i}`, x: x - 44, y: 400, w: 96, h: 90, label: 'Kakao' })),
    ...(f.seatingDone && !f.billTaken ? [{ id: 'bill', x: 640, y: 470, w: 100, h: 50, label: 'Rechnung' }] : []),
  ];
  await story.view('picture', {
    draw: (ctx) => drawTray(ctx, { taken: f.glassTaken && !f.glassBack, bill: f.seatingDone && !f.billTaken }),
    spots,
    area: { x: 120, y: 150, w: 1040, h: 470 },
    help: 'Klicken: an einem Glas riechen oder es nehmen  ·  Rechtsklick: zurück',
    onClick: (spot, view) => clickTray(story, spot, view),
  });
}

async function clickTray(story, spot, view) {
  const f = story.flags;
  if (spot.id.startsWith('cup')) return story.say('Heißer Kakao. Riecht nach Weihnachten.');
  const index = Number(spot.id.slice(5));
  // Nehmen geht nur, wenn Bruno nicht hinsieht
  const take = spot.id === 'bill' || (index === POISON && f.poisoned && f.sniffedPoison);
  if (take) {
    if (!story.squealing) {
      f.trayGuarded = true;
      view.close();
      await story.speakAs('bruno', 'Finger weg von meinem Tablett! Das geht gleich raus!');
      if (!f.squealSeen) await story.say('Er lässt das Tablett keine Sekunde aus den Augen. Ich muss warten, bis er abgelenkt ist.');
      story.note('Bruno lässt mich nichts vom Tablett nehmen. Ich muss abwarten, bis er abgelenkt ist.');
      return;
    }
    if (spot.id === 'bill') return takeBill(story);
    return takeGlass(story);
  }
  story.sound('sniff');
  await story.wait(0.6);
  if (index === POISON && f.poisoned) {
    f.sniffedPoison = true;
    story.sound('dread');
    await story.say('Rotwein … und noch etwas. Bittermandel!');
    await story.say('Das ist Gift. Jemand hat Glas drei vergiftet – im Dunkeln, im Tunnel.');
    story.note('Glas 3 auf Brunos Tablett riecht nach Bittermandel: Gift! Wer bekommt dieses Glas?');
    await checkVictim(story);
    return;
  }
  await story.say(f.poisoned ? 'Ganz normaler Rotwein.' : 'Rotwein. Riecht ganz normal.');
}

async function takeGlass(story) {
  const f = story.flags;
  if (story.has('poisonGlass')) return story.say('Das Giftglas habe ich schon.');
  f.glassTaken = true;
  f.glassBack = false;
  story.sound('glass');
  story.give('poisonGlass');
  await story.say('Schnell – das Giftglas weg! Bruno merkt nichts.');
  if (f.seatingDone && !f.billTaken) await story.say('Und darunter klemmt die Rechnung.');
}

async function takeBill(story) {
  story.flags.billTaken = true;
  story.sound('paper');
  story.give('bill');
  await story.say('Die Rechnung! Bruno hält sich immer noch die Ohren zu.');
  story.note('Ich habe Brunos Rechnung. Die Summe ist verwischt – ich muss sie selbst ausrechnen.');
}

// Hat Joseph alles beisammen, um zu sagen, wer das Giftglas bekommen hätte?
async function checkVictim(story) {
  const f = story.flags;
  if (f.victimKnown || !f.seatingDone || !f.sniffedPoison || !f.heardOrder) return;
  f.victimKnown = true;
  await story.cutscene(async () => {
    await story.say('Glas eins an Tisch eins, Herr Tick. Glas zwei an Frau Ilse. Glas drei an Tisch drei, vorne links …');
    story.sound('dread');
    await story.say('Herr K. Das vergiftete Glas ist für Herrn K.!');
  });
  story.note('Das Giftglas (Glas 3) geht an Tisch 3 – an Herrn K. Jemand will Herrn K. loswerden.');
}

async function readMenu(story) {
  story.sound('paper');
  await story.card({ draw: drawMenu });
  if (story.flags.menuRead) return;
  story.flags.menuRead = true;
  if (!story.has('menu')) story.give('menu');
  story.note('Speisekarte: Suppe 3, Braten 9, Pudding 2, Rotwein 4, Kakao 2, Kaffee 1 Mark. Wein nur für Erwachsene.');
}

async function readBill(story) {
  story.sound('paper');
  await story.card({ draw: drawBill });
  if (story.flags.billRead) return;
  story.flags.billRead = true;
  await story.say('Die Summe ist verwischt. Rotwein, wie passend.');
  story.note('Rechnung: 6 Tische, an jedem 1 Gast, an Tisch 6 die Dame mit Tochter. Für jeden Suppe, Braten, Pudding und ein Getränk (Wein oder Kakao). Die Summe ist verwischt.');
}

// ============================================================================================
//  Kasse und Tür
// ============================================================================================

async function useRegister(story) {
  if (story.flags.registerOpen) return story.say('Die Kasse stimmt schon. Die Tür ist offen.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'register',
    digits: 3,
    check: (code) => {
      tries += 1;
      return code === REGISTER_CODE;
    },
  });
  if (opened) {
    story.flags.registerOpen = true;
    story.sound('register');
    await story.wait(0.8);
    story.sound('unlock');
    await story.speakAs('bruno', 'Hundertzweiundzwanzig Mark! Die Kasse stimmt! Hören Sie? Die Tür ist auf.');
    story.note('Die Kasse stimmt: 122 Mark. Die Tür nach vorne ist entriegelt.');
    return;
  }
  if (tries === 0 || inTunnel(story)) return;
  story.sound('wrong');
  await story.speakAs('bruno', story.flags.billRead ? 'Falsch! Rechnen Sie noch mal nach – für jeden Gast!' : 'Was tippen Sie da? Erst die Rechnung, dann die Kasse!');
}

async function tryDoor(story) {
  if (!story.flags.registerOpen) {
    await story.say('Zu. Der Riegel rührt sich nicht.');
    if (!story.flags.heardRegisterRule) await story.say('Ein Kabel führt vom Riegel zur Registrierkasse. Seltsam.');
    return;
  }
  if (!story.flags.victimKnown) {
    await story.say('Die Tür ist offen. Aber erst will ich wissen, wem das Gift gilt.');
    return;
  }
  await story.cutscene(async () => {
    await story.speakAs('bruno', 'Sie gehen? Aber das Essen …');
    await story.say('Bruno – wenn Herr K. kommt: Geben Sie ihm kein Glas von diesem Tablett.');
    await story.speakAs('bruno', 'Herr K.? Der schläft doch im Schlafwagen, Abteil vier. Er kommt jede Runde zu spät.');
    story.note('Herr K. schläft im Schlafwagen, Abteil 4. Ich muss ihn finden, bevor er sein Glas trinkt.');
    story.sound('door');
    await story.wait(0.8);
    await finishWagon(story, {
      number: 4,
      title: 'Ende von Wagen 4',
      lines: ['Das vergiftete Glas war für Herrn K. bestimmt.'],
      nextTitle: 'im Schlafwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.metBruno) return { id: 'bruno', lines: ['Der Koch steht neben der Küche. Vielleicht weiß er etwas über die Gläser.'] };
  if (!f.seatingDone) {
    if (f.cluesHeard < 6) {
      return { id: `clues${f.cluesHeard}`, lines: [
        'Bruno weiß nicht mehr, wer wo sitzt. Wenn ich ihn frage, fällt ihm vielleicht mehr ein.',
        'Bruno mehrmals fragen: „Wer sitzt denn wo?“ – bei jeder Frage erinnert er sich an mehr.',
      ] };
    }
    return { id: 'seating', lines: [
      'Brunos Erinnerungen stehen im Notizbuch. Dazu die Dinge an den Stühlen: der grüne Strickschal, die Fliegerbrille.',
      'Frau Ilse strickt mit grüner Wolle → Tisch 2. J. trägt eine Fliegerbrille → Tisch 5. Herr Tick sitzt hinten auf der Küchenseite → Tisch 1, Herr Moll gegenüber → Tisch 4.',
      'Die Dame mit Tochter sitzt rechts, aber nicht neben Herrn Moll → Tisch 6. Herr K. bekommt den letzten Platz → Tisch 3. Auf einen Tisch klicken und die Kärtchen tauschen.',
    ] };
  }
  if (!f.poisoned) {
    return { id: 'tunnel', lines: [
      '„Achte auf die Gläser.“ Noch riechen alle Gläser normal. Vielleicht passiert etwas im Tunnel.',
      'Am Fenster kann ich auf den Tunnel warten.',
    ] };
  }
  if (!f.sniffedPoison) return { id: 'sniff', lines: ['Im Tunnel war jemand am Tablett. Ich sollte noch einmal an den Gläsern riechen.'] };
  if (!f.heardOrder) return { id: 'order', lines: ['Glas 3 ist vergiftet. Aber wer bekommt es? Bruno fragen, wie er den Wein serviert.'] };
  if (!f.billTaken) {
    return { id: 'bill', lines: [
      'Unter dem Tablett liegt Brunos Rechnung. Aber Bruno passt auf.',
      'Wenn die Räder in der Kurve quietschen, hält Bruno sich die Ohren zu. Genau dann ans Tablett!',
      'Das Tablett öffnen und warten, bis das Quietschen kommt – dann schnell auf die Rechnung klicken.',
    ] };
  }
  if (!f.registerOpen) {
    return { id: 'register', lines: [
      'Die Kasse muss stimmen. Auf der Rechnung steht, was jeder bekommt, auf der Speisekarte stehen die Preise.',
      'Wie viele Personen? Sechs Tische, an Tisch 6 zwei. Jeder bekommt Suppe, Braten und Pudding: 3 + 9 + 2 = 14 Mark.',
      'Kakao bekommen die, die zu jung für Wein sind: J. (siebzehn) und die Tochter. Alle anderen bekommen Wein.',
      '7 × 14 = 98. Dazu 5 × Wein zu 4 = 20 und 2 × Kakao zu 2 = 4. Zusammen 122.',
    ] };
  }
  return { id: 'door', lines: ['Die Kasse stimmt. Die Tür nach vorne ist offen.'] };
}
