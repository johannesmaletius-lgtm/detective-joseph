import {
  CANDLE_SYMBOLS, LANTERN_WORD, PLAQUE_LINES, candleSpots, drawBellNote, drawChapelLight, drawFamilyPhoto,
  drawRubbing, drawSootyPlaque, drawStainedGlass, drawWreathCard, rubSpots,
} from './art/wagon13.js';
import { NOTES } from './art/wagon12.js';
import { LETTERS, finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 13 – Die Kapelle (3. Advent, niemand da)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Adventskranz mit zwölf Kerzen, auf jeder ein Zeichen für einen Wagen (Bank, Koffer, Brief,
//      Weinglas, Bett, Schirm, Whisky, Film, Spiegel, Trichter, Uhr, Note). „Zünde sie an in der
//      Reihenfolge deines Weges“ → Wagen 1 bis 12. Falsch → ein Luftzug, alle aus.
//      Dann springt die Schublade im Altar auf: Papier und Bleistift.
//   2. Die verrußte Gedenktafel abreiben: „Zum Gedenken an den Weihnachtszug vom 24. Dezember, der
//      seinen Bahnhof nie erreichte.“ Namen: Bruno, Ilse, K., Tick, Moll, Lokführer, Funker, Mira …
//      und J.
//   3. Die Laterne vom Ständer am Kranz anzünden und über den Abrieb halten: Durch winzige Löcher im
//      roten Glas fallen vier Lichtpunkte auf H – E – I – M.
//   4. Opferstock: Buchstabenschloss HEIM → das Familienfoto des Schaffners.
//   5. Drei Glocken (groß = G, links klein = H, rechts klein = A) im Anfang von Molls Lied:
//      G – A – H → die Tür geht auf.

const BELL_SONG = ['G', 'A', 'H'];

export const wagon13 = {
  flags: {},
  startItems: ['flashlight', 'gear'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Eine Gestalt mit meinen Sachen führt die Fahrgäste in den Tunnel. Der Schaffner ruft sie. Herrn Tick habe ich gerettet.',
    'Musiksalon: Herr Moll hat sein Lied (G A H D …) an einem Weihnachtsabend hier im Zug gespielt – für die Frau und die kleine Tochter des Schaffners. „Seitdem fährt der Zug im Kreis.“',
  ],

  setup(story) {
    const f = story.flags;
    f.lit ??= [];
    f.rubbed ??= PLAQUE_LINES.map(() => false);
    f.rings ??= [];
    story.scene.paintSpot('glass', (ctx) => drawStainedGlass(ctx));
    story.scene.paintSpot('light', (ctx) => drawChapelLight(ctx, {
      lit: f.lit.length, lanternLit: false, lanternTaken: f.lanternTaken, time: story.motion.time,
    }));
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 13,
      title: 'Die Kapelle',
      lines: [
        'Eine Kapelle. Mitten im Zug.',
        'Ein Adventskranz, drei Glocken … und eine Tafel voller Ruß.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    wreath: {
      look: (story) => story.say(story.flags.wreathDone ? 'Alle zwölf Kerzen brennen.' : 'Ein Adventskranz mit zwölf Kerzen. Auf jeder ist ein kleines Zeichen eingeritzt.'),
      use: (story) => lightCandles(story),
      items: {
        lantern: (story) => lightLantern(story),
        litLantern: 'Die Laterne brennt schon.',
      },
    },
    bellG: bell('G', 'Die große Glocke.'),
    bellH: bell('H', 'Eine kleine Glocke, links.'),
    bellA: bell('A', 'Eine kleine Glocke, rechts.'),
    beam: { look: (story) => readBellNote(story) },
    plaque: {
      look: (story) => lookPlaque(story),
      use: (story) => (story.has('paperPencil') || story.flags.rubbingDone ? rubPlaque(story) : lookPlaque(story)),
      items: {
        paperPencil: (story) => rubPlaque(story),
        litLantern: (story) => lanternOnRubbing(story),
        lantern: 'Erst muss die Laterne brennen.',
        rubbing: (story) => readRubbing(story),
      },
    },
    altar: {
      look: (story) => story.say(story.flags.drawerOpen ? 'Der Altar. Die kleine Schublade ist offen.' : 'Ein Altar mit weißem Tuch. Darunter eine kleine Schublade ohne Griff.'),
      use: (story) => openAltar(story),
    },
    cross: { look: 'Ein schlichtes Holzkreuz.' },
    lilies: { look: 'Weiße Lilien. Sie duften, obwohl sie aus Wachs sind.' },
    offering: {
      look: (story) => story.say(story.flags.offeringOpen ? 'Der Opferstock ist offen.' : 'Ein Opferstock. Statt eines Schlitzes für Münzen: ein Schloss mit vier Buchstaben-Rädchen.'),
      use: (story) => openOffering(story),
    },
    lantern: {
      look: 'Eine Laterne mit Scheiben aus Buntglas. Sie brennt nicht.',
      use: async (story) => {
        story.flags.lanternTaken = true;
        story.give('lantern');
        await story.say('Ich nehme die Laterne. Im roten Glas sind winzige Löcher, wie Nadelstiche.');
      },
    },
    stand: { look: (story) => story.say(story.flags.lanternTaken ? 'Der Ständer. Die Laterne habe ich.' : 'Ein schmiedeeiserner Laternenständer.') },
    wallLamp: { look: 'Eine Wandlaterne. Fest angeschraubt.' },
    pews: {
      look: 'Hölzerne Kirchenbänke.',
      use: (story) => waitForTunnel(story, 'Ich setze mich in die Bank und warte auf den Tunnel …'),
    },
    stained: {
      look: (story) => story.say(story.isDark ? 'Im Tunnel ist das Buntglas schwarz.' : 'Buntglasfenster. Rot, gelb, blau, grün.'),
    },
    door: {
      look: (story) => story.say(story.flags.doorOpen ? 'Die Tür ist offen.' : 'Die Tür nach vorne. Darüber hängen die drei Glocken.'),
      use: (story) => (story.flags.doorOpen ? leaveWagon(story) : story.say('Zu. Kein Schloss, kein Griff. Nur die Glocken darüber.')),
    },
  },

  items: {
    rubbing: { look: (story) => readRubbing(story) },
    familyPhoto: { look: (story) => showPhoto(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },
};

// ============================================================================================
//  Adventskranz
// ============================================================================================

async function lightCandles(story) {
  const f = story.flags;
  if (f.wreathDone) return story.say('Alle zwölf brennen. Schön.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Zeichen nicht.');
  const solved = await story.view('picture', {
    draw: (ctx, view) => drawWreathCard(ctx, f.lit, view.age),
    spots: () => candleSpots().filter((spot) => !f.lit.includes(spot.wagon)),
    area: { x: 160, y: 60, w: 960, h: 620 },
    help: 'Kerze anklicken: anzünden  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      story.sound('match');
      if (spot.wagon !== f.lit.length) {
        f.lit.push(spot.wagon);
        await story.wait(0.5);
        f.lit = [];
        story.sound('sniff');
        await story.say(f.failedCandles ? 'Wieder ein Luftzug. Alle aus.' : 'Ein Luftzug – und alle Kerzen sind aus. Die Reihenfolge stimmt nicht.');
        f.failedCandles = true;
        return;
      }
      f.lit.push(spot.wagon);
      if (f.lit.length === 12) {
        story.sound('success');
        await story.wait(1);
        view.close(true);
      }
    },
  });
  if (!solved) {
    if (!f.wreathSeen && !inTunnel(story)) {
      f.wreathSeen = true;
      await story.say('Auf jeder Kerze ein Zeichen: eine Bank, ein Koffer, ein Brief, ein Glas … Am Kranz hängt ein Kärtchen.');
      story.note('Adventskranz: zwölf Kerzen, jede mit einem Zeichen (Bank, Koffer, Brief, Weinglas, Bett, Schirm, Whisky, Film, Spiegel, Trichter, Uhr, Note). „Zünde sie an in der Reihenfolge deines Weges.“');
    }
    return;
  }
  f.wreathDone = true;
  await story.say('Abteil, Gepäckwagen, Postwagen, Speisewagen … bis zum Musiksalon. Mein ganzer Weg.');
  story.sound('drawer');
  await story.say('Am Altar ist etwas aufgesprungen.');
  story.note('Die zwölf Kerzen brennen – in der Reihenfolge meines Weges, Wagen 1 bis 12. Am Altar ist eine Schublade aufgesprungen.');
}

async function openAltar(story) {
  const f = story.flags;
  if (!f.wreathDone) return story.say('Die Schublade hat keinen Griff. Sie geht nicht auf.');
  if (f.drawerOpen) return story.say('Die Schublade ist leer.');
  f.drawerOpen = true;
  story.give('paperPencil');
  await story.say('In der Schublade: dünnes Papier und ein weicher Bleistift. Ein Zettel: „Für die Tafel.“');
}

// ============================================================================================
//  Gedenktafel
// ============================================================================================

async function lookPlaque(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich nur Schwarz.');
  if (f.rubbingDone) return readRubbing(story);
  await story.card({ draw: drawSootyPlaque });
  if (!f.plaqueSeen) {
    f.plaqueSeen = true;
    await story.say('Eine Gedenktafel. Völlig verrußt. Darunter sind Buchstaben eingraviert, aber ich kann sie nicht lesen.');
    story.note('Die Gedenktafel in der Kapelle ist verrußt. Darunter sind Zeilen eingraviert.');
  }
}

async function rubPlaque(story) {
  const f = story.flags;
  if (f.rubbingDone) return readRubbing(story);
  if (inTunnel(story)) return story.say('Im Dunkeln wird das nichts.');
  const solved = await story.view('picture', {
    draw: (ctx) => drawRubbing(ctx, f.rubbed),
    spots: () => rubSpots().filter((spot) => !f.rubbed[spot.band]),
    area: { x: 200, y: 110, w: 880, h: 500 },
    help: 'Über die Zeilen reiben (anklicken)  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      f.rubbed[spot.band] = true;
      story.sound('rub');
      if (f.rubbed.every(Boolean)) {
        await story.wait(0.8);
        view.close(true);
      }
      return null;
    },
  });
  if (!solved) return;
  f.rubbingDone = true;
  story.remove('paperPencil');
  story.give('rubbing');
  await story.cutscene(async () => {
    await story.say('„Zum Gedenken an den Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte.“');
    await story.say('Bruno. Ilse. K. Tick. Moll. Der Lokführer, der Funker. Mira …');
    story.sound('dread');
    await story.say('… und J.');
    await story.say('J. Wie in den Briefen an mich. Wie … Joseph?');
    await story.say('Alle, die ich hier getroffen habe, saßen in jener Nacht in diesem Zug. Und ich auch?');
  });
  story.note('Abrieb der Gedenktafel: „Zum Gedenken an den Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte.“ Namen: Bruno, Ilse, K., Tick, Moll, der Lokführer, der Funker, Mira … und J.');
}

async function readRubbing(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich es nicht lesen.');
  story.sound('paper');
  await story.card({ draw: (ctx, card) => drawRubbing(ctx, PLAQUE_LINES.map(() => true), { dots: f.dotsSeen, time: card.age ?? 0 }) });
}

// ============================================================================================
//  Laterne
// ============================================================================================

async function lightLantern(story) {
  const f = story.flags;
  if (!f.wreathDone) return story.say('Der Kranz brennt ja noch nicht.');
  story.game.inventory.replace('lantern', 'litLantern');
  story.sound('match');
  await story.say('An einer Kerze angezündet. Die Laterne brennt – und durch die Löcher im roten Glas fallen winzige rote Lichtpunkte.');
}

async function lanternOnRubbing(story) {
  const f = story.flags;
  if (!f.rubbingDone) return story.say('Rote Punkte auf Ruß. Erst müsste ich die Schrift sichtbar machen.');
  if (inTunnel(story)) return story.say('Jetzt im Dunkeln? Lieber nach dem Tunnel.');
  f.dotsSeen = true;
  story.sound('paper');
  await story.card({ draw: (ctx, card) => drawRubbing(ctx, PLAQUE_LINES.map(() => true), { dots: true, time: card.age ?? 0 }) });
  if (!f.wordFound) {
    f.wordFound = true;
    await story.say('Ich halte die Laterne über den Abrieb … vier rote Punkte. Auf genau vier Buchstaben.');
    await story.say('H … E … I … M. HEIM.');
    story.note('Die Laterne über dem Abrieb: Vier rote Lichtpunkte fallen auf H – E – I – M. „HEIM“.');
  }
}

// ============================================================================================
//  Opferstock und Familienfoto
// ============================================================================================

async function openOffering(story) {
  const f = story.flags;
  if (f.offeringOpen) return story.say('Leer. Das Foto habe ich.');
  const opened = await tryCode(story, {
    id: 'offering',
    code: LANTERN_WORD,
    alphabet: LETTERS,
    style: 'steel',
    dark: 'Im Dunkeln sehe ich die Buchstaben nicht.',
    wrong: 'Falsch. Vier Buchstaben.',
  });
  if (!opened) return;
  f.offeringOpen = true;
  story.sound('unlock');
  await story.say('HEIM. Der Opferstock ist offen. Darin liegt ein Foto.');
  story.give('familyPhoto');
  await showPhoto(story);
}

async function showPhoto(story) {
  const f = story.flags;
  story.sound('paper');
  await story.card({ draw: drawFamilyPhoto });
  if (f.photoSeen) return;
  f.photoSeen = true;
  await story.cutscene(async () => {
    await story.say('Ein junger Schaffner. Seine Frau. Eine kleine Tochter mit einem Stoffhasen. Vor einem Weihnachtsbaum.');
    await story.say('Ein Hase … wie im Lied von Herrn Moll.');
    await story.say('Und der Schaffner … er sieht aus wie ich. Nur älter.');
  });
  story.note('Im Opferstock (HEIM): ein Familienfoto. Ein junger Schaffner mit seiner Frau und seiner kleinen Tochter (mit Stoffhasen) vor dem Weihnachtsbaum. Der Schaffner sieht mir seltsam ähnlich.');
}

// ============================================================================================
//  Glocken und Tür
// ============================================================================================

function bell(note, look) {
  return {
    look,
    use: (story) => ringBell(story, note),
  };
}

async function readBellNote(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich den Zettel nicht.');
  story.sound('paper');
  await story.card({ draw: drawBellNote });
  if (!story.flags.bellNote) {
    story.flags.bellNote = true;
    story.note('Zettel am Glockenbalken: „Lasst sie klingen wie das Lied der Feier.“ Darunter: „(groß · klein · klein)“.');
  }
}

async function ringBell(story, note) {
  const f = story.flags;
  const pitch = NOTES[note].freq / 2;
  story.tone(pitch, { duration: 2.4, type: 'sine', gain: 0.18 });
  story.tone(pitch * 2, { duration: 1.4, type: 'sine', gain: 0.06 });
  if (f.doorOpen) return;
  f.rings.push(note);
  if (f.rings.length > 3) f.rings.shift();
  if (f.rings.join('') === BELL_SONG.join('')) {
    f.doorOpen = true;
    await story.wait(1.2);
    story.sound('unlock');
    await story.say('Der Anfang von Herrn Molls Lied! … Und die Tür springt auf.');
    story.note('Die drei Glocken in Molls Melodie geläutet: G (groß) – A (rechts) – H (links). Die Tür ist offen.');
    return;
  }
  if (!f.bellTried) {
    f.bellTried = true;
    await story.say('Ein tiefer, voller Ton. Jede Glocke klingt anders.');
  }
}

async function leaveWagon(story) {
  if (!story.flags.photoSeen) return story.say('Erst will ich wissen, was im Opferstock liegt.');
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Alle Fahrgäste haben in jener Weihnachtsnacht in diesem Zug gesessen.');
    await story.say('Und auf der Tafel steht auch J.');
    await finishWagon(story, {
      number: 13,
      title: 'Ende von Wagen 13',
      lines: ['„Zum Gedenken an den Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte.“', '… und J.'],
      nextTitle: 'im Zeitungswagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.wreathDone) {
    return { id: 'candles', lines: [
      'Der Adventskranz: Auf jeder Kerze ist ein Zeichen. „Zünde sie an in der Reihenfolge deines Weges.“',
      'Jedes Zeichen gehört zu einem Wagen, durch den Joseph gekommen ist: die Bank zum Abteil, der Koffer zum Gepäckwagen, der Brief zum Postwagen …',
      `Reihenfolge: ${CANDLE_SYMBOLS.map((s) => ({ bench: 'Bank', suitcase: 'Koffer', letter: 'Brief', glass: 'Weinglas', bed: 'Bett', umbrella: 'Schirm', whisky: 'Whiskyglas', film: 'Filmrolle', mirror: 'Spiegel', horn: 'Trichter', clock: 'Uhr', note: 'Note' })[s]).join(', ')}.`,
    ] };
  }
  if (!f.drawerOpen) return { id: 'altar', lines: ['Am Altar ist eine Schublade aufgesprungen.'] };
  if (!f.rubbingDone) return { id: 'rub', lines: ['Papier und Bleistift „für die Tafel“: Papier und Bleistift an der verrußten Gedenktafel benutzen und über alle Zeilen reiben.'] };
  if (!f.wordFound) {
    if (!story.has('litLantern')) {
      return { id: 'lantern', lines: [
        'Die Laterne rechts auf dem Ständer hat winzige Löcher im roten Glas.',
        'Die Laterne nehmen und an den brennenden Kerzen des Kranzes anzünden (Laterne auf den Kranz).',
      ] };
    }
    return { id: 'dots', lines: ['Die brennende Laterne an der Tafel benutzen – über dem Abrieb.'] };
  }
  if (!f.offeringOpen) return { id: 'offering', lines: ['Die roten Punkte ergaben HEIM. Der Opferstock hat ein Schloss mit vier Buchstaben.'] };
  if (!f.doorOpen) {
    return { id: 'bells', lines: [
      'Am Glockenbalken hängt ein Zettel: „Lasst sie klingen wie das Lied der Feier.“ Das Lied von Herrn Moll beginnt mit G – A – H.',
      'Die große Glocke ist die tiefste (G). Von den kleinen ist die rechte A, die linke H. Also: groß, rechts, links.',
    ] };
  }
  return { id: 'door', lines: ['Die Tür ist offen.'] };
}
