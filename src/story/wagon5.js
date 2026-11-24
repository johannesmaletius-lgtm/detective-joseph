import { COMPARTMENT_SPOTS, drawCompartment, drawGuestBook, drawPhoto } from './art/wagon5.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 5 – Der Schlafwagen (Oma Ilse schläft in Abteil 3)
// ============================================================================================
//
// Bruno sagte: Herr K. schläft im Schlafwagen, Abteil 4. Aber Abteil 4 ist von innen
// abgeschlossen – der Schlüssel steckt.
//
// DIE RÄTSEL
//   1. Abteil 4: ein Blatt aus dem Fahrgastbuch unter der Tür durchschieben, mit Ilses Stricknadel
//      den Schlüssel von außen herausstoßen – er fällt aufs Blatt – Blatt zurückziehen.
//      Die Stricknadel liegt in Ilses Schublade. Die quietscht und weckt Ilse – außer, die Räder
//      quietschen gerade lauter. Wird Ilse wach, schreit sie und zieht die Notbremse (sie geht nicht).
//   2. Suchbild Abteil 4: sechs Spuren (Hutschachtel leer, Brille, Schuhe, Fußspuren auf Socken,
//      Knopf einer Schaffneruniform, Fahrschein „Runde 108“) → Herr K. ist wie im Schlaf gegangen,
//      nach vorne, Richtung Tunnel – zusammen mit jemandem in Uniform.
//   3. Ilse spricht im Schlaf, nach jedem Tunnel ein Stück mehr:
//      „Er hat den Koffer …“ – „… unter Bett vier …“ – „… der Schlüssel liegt, wo der Mond nicht hinkommt.“
//   4. Wo der Mond nicht hinkommt: der Schatten unter dem Tischchen am Fenster → Kofferschlüssel →
//      Koffer im Bettkasten von Abteil 4 → Foto: Herr K. und der Schaffner, Rückseite „24. 12.“
//   5. Türschloss nach vorne: 2412.

const DOOR_CODE = '2412';
const ILSE = { x: 380, y: 270 }; // hier steht, was Ilse im Schlaf murmelt
const ILSE_COLOR = '#f3c6d8';
const FRAGMENTS = [
  '… er hat den Koffer …',
  '… unter Bett vier … versteckt …',
  '… und der Schlüssel liegt … wo der Mond nicht hinkommt …',
];

export const wagon5 = {
  flags: {},
  startItems: ['flashlight', 'knife'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Speisewagen: Jemand hat im Tunnel ein Weinglas vergiftet. Es war für Herrn K. bestimmt.',
    'Bruno: Den Wein brachte ein junger Mann mit Schal und Fliegerbrille. Wie ich.',
    'Herr K. schläft im Schlafwagen, Abteil 4. Ich muss ihn finden.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 5,
      title: 'Der Schlafwagen',
      lines: [
        'Der Schlafwagen. Leise schnarcht jemand.',
        'Abteil 4 – da soll Herr K. schlafen.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    ilse: {
      look: (story) => story.say('Eine alte Dame schläft tief und fest. Eine Schlafbrille auf der Stirn, ein Lächeln im Gesicht.'),
      use: (story) => visitIlse(story),
      items: {
        flashlight: 'Ihr ins Gesicht leuchten? Dann wacht sie garantiert auf.',
        needle: 'Die lege ich ihr nachher zurück. Versprochen.',
      },
    },

    drawer: {
      look: (story) => story.say(story.flags.needleTaken
        ? 'Die Schublade unter Ilses Bett. Wolle, Strickzeug.'
        : 'Eine Schublade unter Ilses Bett. Aus dem Spalt schaut grüne Wolle heraus.'),
      use: (story) => openDrawer(story),
      items: { knife: 'Die Schublade ist nicht abgeschlossen. Sie klemmt nur – und sie quietscht bestimmt.' },
    },

    door1: { look: 'Abteil 1. Leer.', use: 'Leer. Das Bett ist frisch bezogen, als hätte nie jemand darin geschlafen.' },
    door2: { look: 'Abteil 2. Leer.', use: 'Auch leer. Auf dem Kissen liegt ein Pfefferminzbonbon. Für niemanden.' },
    door3: { look: 'Abteil 3 – die Tür steht offen. Da schläft die alte Dame.', use: 'Die Tür steht schon offen. Ich will Ilse nicht stören.' },

    door4: {
      look: async (story) => {
        if (story.flags.room4Open) return story.say('Abteil 4. Die Tür ist offen. Herrn K.s Abteil.');
        await story.say('Abteil 4. Abgeschlossen. Ich schaue durchs Schlüsselloch … dunkel. Der Schlüssel steckt von innen!');
        if (story.flags.pageUnder) await story.say('Unter der Tür liegt mein Blatt Papier.');
        story.flags.keyholeSeen = true;
        story.note('Abteil 4 (Herr K.) ist abgeschlossen. Der Schlüssel steckt von innen im Schloss. Unter der Tür ist ein Spalt.');
      },
      use: (story) => useDoor4(story),
      items: {
        page: (story) => slidePage(story),
        needle: (story) => pokeKey(story),
        roomKey: (story) => openRoom4(story),
        knife: 'Das Messer ist zu dick fürs Schlüsselloch. Ich bräuchte etwas Langes, Dünnes.',
        flashlight: 'Ich leuchte durchs Schlüsselloch: Der Schlüssel steckt von innen.',
      },
    },

    book: {
      look: 'Ein dickes Buch auf dem Tischchen: „Fahrgastbuch“.',
      use: (story) => readGuestBook(story),
    },
    cup: { look: 'Eine Tasse Tee. Noch warm. Wer hat sie hier abgestellt?', use: 'Fremden Tee trinke ich nicht. Erst recht nicht in diesem Zug.' },
    lamp: { look: 'Eine kleine Tischlampe mit Messingschirm. Sie wirft einen dunklen Schatten unter das Tischchen.' },

    shadow: {
      look: (story) => story.say('Unter dem Tischchen ist es stockdunkel. Hier fällt nie Mondlicht hin – das Tischchen steht immer im Weg.'),
      use: (story) => searchShadow(story),
      items: {
        flashlight: (story) => searchShadow(story, true),
      },
    },

    moonlight: {
      look: async (story) => {
        if (story.isDark) return story.say('Im Tunnel ist es überall dunkel.');
        await story.say('Mondlicht fällt durch die Fenster auf den Boden. Helle Flecken – nur unter dem Tischchen nicht.');
        story.flags.moonNoticed = true;
      },
    },

    door: {
      look: 'Die Tür nach vorne. Ein Zahlenschloss mit vier Rädchen.',
      use: (story) => tryDoor(story),
    },

    window: {
      look: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Der Mond wandert von Fenster zu Fenster. Sein Licht malt helle Flecken auf den Boden.'),
      use: (story) => waitForTunnel(story, 'Ich lehne mich ans Fenster und warte auf den Tunnel …'),
    },
  },

  items: {
    photo: { look: (story) => lookPhoto(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      return;
    }
    await story.idle();
    // Im Tunnel springt alles zurück: das Blatt unter der Tür ist weg
    if (story.flags.pageUnder) {
      story.flags.pageUnder = false;
      story.flags.keyOnPage = false; // der Schlüssel steckt wieder im Schloss
      await story.say('Mein Blatt unter der Tür von Abteil 4 ist weg. Der Tunnel hat es geschluckt.');
    }
    if (story.flags.heard >= 1 && story.flags.heard <= tunnels(story) && story.flags.heard < FRAGMENTS.length) {
      await story.wait(0.5);
      story.speak('… mmh … Koffer …', { at: ILSE, color: ILSE_COLOR });
      await story.wait(0.4);
      await story.say('Ilse murmelt wieder im Schlaf. Ich sollte genau hinhören.');
    }
  },
};

// ============================================================================================
//  Oma Ilse
// ============================================================================================

async function visitIlse(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln stolpere ich nur über ihre Pantoffeln.');
  const choice = await story.choose(['Ganz still zuhören.', 'Sie vorsichtig wecken.', 'Lieber in Ruhe lassen.']);
  if (choice === 0) return listen(story);
  if (choice === 1) return wakeIlse(story);
}

async function listen(story) {
  const f = story.flags;
  const heard = f.heard ?? 0;
  const available = Math.min(FRAGMENTS.length, tunnels(story) + 1); // nach jedem Tunnel ein Stück mehr
  await story.say('Ich beuge mich zu ihr hinunter …');
  story.sound('page');
  if (heard >= available) {
    if (heard >= FRAGMENTS.length) {
      if (!f.dreamHeard) {
        f.dreamHeard = true;
        await story.speak('… Mira, Schätzchen … schlaf noch ein bisschen … gleich sind wir bei Papa …', { at: ILSE, color: ILSE_COLOR });
        await story.say('Mira? Wer ist Mira? Und wer ist Papa?');
        story.note('Ilse murmelt im Schlaf: „Mira, Schätzchen … gleich sind wir bei Papa.“ Wer ist Mira?');
        return;
      }
      await story.speak('… chrrr … pfffff …', { at: ILSE, color: ILSE_COLOR });
      await story.say('Sie hat alles gesagt: Er hat den Koffer unter Bett vier versteckt, und der Schlüssel liegt, wo der Mond nicht hinkommt.');
      return;
    }
    await story.speak(FRAGMENTS[heard - 1] ?? '… chrrr …', { at: ILSE, color: ILSE_COLOR });
    await story.say('Immer wieder dieselben Worte. Vielleicht sagt sie in der nächsten Runde mehr.');
    return;
  }
  const fragment = FRAGMENTS[heard];
  await story.speak(fragment, { at: ILSE, color: ILSE_COLOR });
  f.heard = heard + 1;
  if (f.heard === 1) {
    await story.say('Sie spricht im Schlaf. „Er hat den Koffer …“ – und dann nichts mehr.');
    story.note('Oma Ilse spricht im Schlaf: „… er hat den Koffer …“. Vielleicht sagt sie nach dem nächsten Tunnel mehr.');
  } else if (f.heard === 2) {
    await story.say('Unter Bett vier! Abteil 4 – das ist Herrn K.s Abteil.');
    story.note('Ilse, zweite Runde: „… unter Bett vier … versteckt …“');
  } else {
    await story.say('Wo der Mond nicht hinkommt … Der Mond wandert doch überall hin. Fast überall.');
    story.note('Ilse, dritte Runde: „… und der Schlüssel liegt … wo der Mond nicht hinkommt …“ Zusammen: Er hat den Koffer unter Bett vier versteckt, und der Schlüssel liegt, wo der Mond nicht hinkommt.');
  }
}

async function wakeIlse(story) {
  await story.cutscene(async () => {
    await story.say('Entschuldigung … Frau Ilse?');
    await ilseWakes(story);
  });
}

// Ilse wacht auf, schreit und zieht die Notbremse – die nicht funktioniert
async function ilseWakes(story) {
  story.sound('shriek');
  await story.speak('AAAH! Ein Einbrecher! Hilfe!', { at: ILSE, color: ILSE_COLOR });
  story.sound('brake');
  await story.speak('Die Notbremse! Ich ziehe die Notbremse!', { at: ILSE, color: ILSE_COLOR });
  await story.wait(1);
  await story.say('Nichts passiert. Der Zug fährt einfach weiter.');
  await story.speak('… sie geht nicht … sie ging noch nie …', { at: ILSE, color: ILSE_COLOR });
  if (!story.flags.woke) {
    await story.speak('… Joseph? Ach, du bist es, Junge. Du trägst ja meinen Schal … chrrr …', { at: ILSE, color: ILSE_COLOR });
    await story.say('Und schon schläft sie wieder. … IHREN Schal?');
    await story.say('Den hab ich doch … ich weiß gar nicht, woher ich den habe.');
  } else {
    await story.say('Und schon schläft sie wieder. Als wäre nichts gewesen.');
  }
  if (!story.flags.woke) {
    story.flags.woke = true;
    story.note('Wenn Ilse aufwacht, schreit sie und zieht die Notbremse. Die funktioniert nicht – und Ilse schläft sofort wieder ein. Vorher hat sie mich „Joseph“ genannt: „Du trägst ja meinen Schal.“ Ich weiß nicht, woher ich meinen Schal habe.');
  }
}

async function openDrawer(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Schublade nicht.');
  if (story.flags.needleTaken) return story.say('Nur Wolle. Die Stricknadel habe ich.');
  if (!story.squealing) {
    await story.say('Ich ziehe ganz vorsichtig …');
    story.sound('creak');
    await story.wait(0.4);
    await story.cutscene(async () => {
      await story.say('Quiiiietsch.');
      await ilseWakes(story);
    });
    if (!story.flags.drawerHint) {
      story.flags.drawerHint = true;
      await story.say('Die Schublade quietscht wie verrückt. Ich müsste sie aufziehen, wenn etwas anderes noch lauter ist.');
      story.note('Ilses Schublade quietscht und weckt sie auf. Ich muss sie öffnen, wenn etwas noch lauter ist.');
    }
    return;
  }
  story.sound('drawer');
  story.flags.needleTaken = true;
  story.give('needle');
  await story.say('Die Räder kreischen – und die Schublade gleich mit. Ilse schläft weiter.');
  await story.say('Wolle, Strickzeug – und eine lange Stricknadel. Die leihe ich mir.');
  story.note('Aus Ilses Schublade: eine lange Stricknadel (das Quietschen der Räder hat das Quietschen der Schublade übertönt).');
}

// ============================================================================================
//  Abteil 4
// ============================================================================================

async function readGuestBook(story) {
  story.sound('page');
  await story.card({ draw: drawGuestBook });
  if (!story.flags.bookRead) {
    story.flags.bookRead = true;
    story.note('Fahrgastbuch: Abteil 3 Frau Ilse („bitte nicht wecken“), Abteil 4 Herr K. Die Notbremse ist außer Betrieb.');
  }
  if (story.has('page') || story.flags.pageUnder) return;
  await story.say('Das Papier ist ganz dünn. Hinten sind lauter leere Seiten …');
  story.sound('paper');
  story.give('page');
  await story.say('Ich reiße eine leere Seite heraus. Wer weiß, wofür sie gut ist.');
}

async function useDoor4(story) {
  if (story.flags.room4Open) return openCompartment(story);
  if (story.flags.keyOnPage && story.flags.pageUnder) {
    story.sound('paper');
    story.flags.pageUnder = false;
    story.flags.keyOnPage = false;
    story.give('roomKey');
    story.give('page');
    await story.say('Ganz langsam ziehe ich das Blatt zurück … und mit ihm den Schlüssel!');
    story.note('Mit Blatt und Stricknadel habe ich den Schlüssel von Abteil 4 herausgeholt.');
    return;
  }
  await story.say('Abgeschlossen. Der Schlüssel steckt innen.');
}

async function slidePage(story) {
  if (story.flags.room4Open) return story.say('Die Tür ist doch offen.');
  story.remove('page');
  story.flags.pageUnder = true;
  story.sound('paper');
  await story.say('Ich schiebe das Blatt unter der Tür durch – genau unter das Schlüsselloch.');
}

async function pokeKey(story) {
  if (story.flags.room4Open) return story.say('Die Tür ist doch offen.');
  if (story.flags.keyOnPage) return story.say('Der Schlüssel liegt schon auf dem Blatt. Jetzt nur noch vorsichtig ziehen.');
  if (!story.flags.pageUnder) {
    await story.say('Wenn ich den Schlüssel jetzt herausstoße, fällt er drinnen auf den Boden. Dann komme ich nie dran.');
    await story.say('Ich brauche etwas, worauf er fallen kann – und das ich dann unter der Tür hervorziehe.');
    return;
  }
  story.sound('key');
  await story.wait(0.5);
  story.flags.keyOnPage = true;
  await story.say('Ich stochere mit der Nadel im Schlüsselloch … pling! Der Schlüssel ist gefallen – hoffentlich aufs Blatt.');
}

async function openRoom4(story) {
  if (story.flags.room4Open) return openCompartment(story);
  story.sound('key');
  await story.wait(0.5);
  story.flags.room4Open = true;
  story.sound('door');
  await story.say('Der Schlüssel dreht sich. Die Tür geht auf.');
  await openCompartment(story);
}

// Das Suchbild: Abteil 4 aus der Nähe
async function openCompartment(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich da drin nichts.');
  const f = story.flags;
  f.found ??= [];
  if (!f.compartmentSeen) {
    f.compartmentSeen = true;
    await story.say('Herr K.? … Niemand da. Das Bett ist zerwühlt und kalt.');
  }
  await story.view('picture', {
    draw: (ctx) => drawCompartment(ctx, f.found),
    spots: COMPARTMENT_SPOTS,
    backdrop: 1,
    help: 'Spuren suchen: Klicken untersucht  ·  Rechtsklick: zurück',
    onClick: (spot) => inspect(story, spot),
  });
}

const REMARKS = {
  hatbox: ['Eine Hutschachtel. Leer.', 'Den Hut hat er also mitgenommen.'],
  glasses: ['Seine Brille liegt auf den Büchern.', 'Ohne Brille sieht er doch kaum etwas. Wer geht ohne Brille los?'],
  shoes: ['Seine Schuhe, ordentlich nebeneinander.', 'Er ist auf Socken gegangen. Mitten im Winter.'],
  footprints: ['Feuchte Fußspuren. Socken – vom Bett zur Tür.', 'Sie führen nach vorne. Richtung Lok … Richtung Tunnel.'],
  button: ['Ein Messingknopf mit einem Flügelrad darauf.', 'Der stammt von einer Schaffneruniform. Herr K. trägt keine Uniform.'],
  ticket: ['Ein Fahrschein, in die Zeitung gesteckt: „Ringbahn – gültig für 1 Runde“.', 'Entwertet. Mit Stempel: „Runde 108“.'],
  coat: ['Sein Mantel hängt noch am Haken. Mit rotem Schal.'],
  cup: ['Eine Tasse mit kaltem Tee. Halb ausgetrunken.'],
  window: ['Der Mond scheint herein. Aufs Bett – aber nicht unters Bett.'],
};

async function inspect(story, spot) {
  const f = story.flags;
  if (spot.id === 'bedDrawer') return openSuitcase(story);
  const first = !f.found.includes(spot.id);
  if (first) f.found.push(spot.id);
  for (const line of REMARKS[spot.id]) await story.say(line);
  const clues = COMPARTMENT_SPOTS.filter((s) => s.clue && f.found.includes(s.id)).length;
  if (first && spot.clue && clues === 6 && !f.searchDone) {
    f.searchDone = true;
    story.sound('success');
    await story.say('Ohne Brille, ohne Schuhe, ohne Mantel – aber mit Hut. Mitten in der Nacht.');
    await story.say('Als wäre er im Schlaf aufgestanden und einfach losgegangen. Nach vorne, zum Tunnel.');
    await story.say('Und jemand in Schaffneruniform war bei ihm.');
    story.note('Abteil 4, sechs Spuren: leere Hutschachtel, Brille, Schuhe, Fußspuren auf Socken Richtung Tunnel, Knopf einer Schaffneruniform, Fahrschein „Runde 108“. Herr K. ist wie im Schlaf losgegangen – freiwillig, nach vorne zum Tunnel. Jemand in Uniform war dabei.');
  }
}

async function openSuitcase(story) {
  const f = story.flags;
  if (f.suitcaseOpen) return story.say('Der Koffer im Bettkasten ist leer. Das Foto habe ich.');
  if (!f.bedDrawerSeen) {
    f.bedDrawerSeen = true;
    story.sound('drawer');
    await story.say('Im Bettkasten unter dem Bett liegt ein kleiner Koffer.');
    if (f.heard >= 2) await story.say('„Er hat den Koffer unter Bett vier versteckt.“ Das ist er!');
  }
  if (!story.has('suitcaseKey')) {
    await story.say('Abgeschlossen. Ein winziges Schlüsselloch.');
    story.note('Unter dem Bett in Abteil 4 liegt ein kleiner, abgeschlossener Koffer.');
    return;
  }
  f.suitcaseOpen = true;
  story.sound('key');
  story.remove('suitcaseKey');
  await story.wait(0.5);
  await story.say('Der kleine Schlüssel passt! Im Koffer … nur ein Foto.');
  story.give('photo');
  await lookPhoto(story);
}

async function searchShadow(story, withLight = false) {
  const f = story.flags;
  if (f.keyFound) return story.say('Unter dem Tischchen ist nichts mehr.');
  if (!f.heard || f.heard < 3) {
    await story.say(withLight ? 'Ich leuchte unter das Tischchen. Staub. Ein paar Krümel.' : 'Nur Schatten und Staub.');
    if (f.heard >= 1) await story.say('Ich weiß noch nicht, wonach ich suche.');
    return;
  }
  await story.say('Wo der Mond nicht hinkommt … Unter das Tischchen fällt nie Mondlicht.');
  story.sound('pickup');
  f.keyFound = true;
  story.give('suitcaseKey');
  await story.say('Da, ganz hinten an der Wand, mit Klebeband befestigt: ein winziger Schlüssel!');
  story.note('Unter dem Tischchen am Fenster, wo nie Mondlicht hinfällt, klebte ein kleiner Kofferschlüssel.');
}

async function lookPhoto(story) {
  story.sound('paper');
  await story.card({ draw: drawPhoto });
  if (story.flags.photoSeen) return;
  story.flags.photoSeen = true;
  await story.say('Herr K. und der Schaffner. Seite an Seite, vor einem Weihnachtsbaum.');
  await story.say('Sie kennen sich. Gut sogar. Auf der Rückseite: „K. und ich – Weihnachtsfeier im Speisewagen. 24. 12. – dein Schaffner.“');
  story.note('Im Koffer von Herrn K.: ein Foto von ihm und dem Schaffner, Seite an Seite vor einem Weihnachtsbaum. Rückseite: „K. und ich – Weihnachtsfeier im Speisewagen. 24. 12. – dein Schaffner.“');
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door5',
    digits: 4,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say(story.flags.photoSeen ? 'Falsch. Vier Ziffern … ein Datum vielleicht?' : 'Falsch. Ich habe noch keine Ahnung, welche Zahl das sein soll.');
    }
    return;
  }
  if (!story.flags.searchDone) {
    await story.say('Offen! Aber erst will ich wissen, was mit Herrn K. passiert ist. Sein Abteil muss voller Spuren sein.');
    return;
  }
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Die Tür ist offen. Herr K. ist nach vorne gegangen – ich gehe hinterher.');
    await finishWagon(story, {
      number: 5,
      title: 'Ende von Wagen 5',
      lines: ['Ein Foto: Herr K. und der Schaffner – Freunde.', 'Herr K. ist wie im Schlaf nach vorne gegangen. Ist er schon fort – oder noch im Zug?'],
      nextTitle: 'im Fundbüro',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.room4Open) {
    if (!f.keyholeSeen) return { id: 'door4', lines: ['Herr K. schläft in Abteil 4. Ich sollte mir die Tür ansehen.', 'Zur Tür von Abteil 4 gehen und das Schlüsselloch ansehen.'] };
    const missing = [];
    if (!story.has('page') && !f.pageUnder && !f.keyOnPage) missing.push('page');
    if (!f.needleTaken) missing.push('needle');
    if (missing.includes('page')) {
      return { id: 'page', lines: [
        'Der Schlüssel steckt innen. Ein alter Trick: etwas Flaches unter der Tür durchschieben, den Schlüssel herausstoßen, das Flache zurückziehen.',
        'Auf dem Tischchen am Fenster liegt ein Fahrgastbuch mit dünnem Papier.',
      ] };
    }
    if (missing.includes('needle')) {
      return { id: 'needle', lines: [
        'Ich brauche etwas Langes, Dünnes, um den Schlüssel aus dem Schloss zu stoßen. Ilse strickt …',
        'In der Schublade unter Ilses Bett liegt Strickzeug. Aber die Schublade quietscht.',
        'Wenn die Räder in der Kurve quietschen, hört Ilse die Schublade nicht. Genau dann aufziehen.',
      ] };
    }
    return { id: 'trick', lines: [
      'Der Schlüssel steckt innen im Schloss. Fällt er heraus, müsste ich ihn irgendwie auffangen …',
      'Blatt und Stricknadel habe ich. Erst das Blatt unter die Tür von Abteil 4 schieben, dann mit der Nadel den Schlüssel herausstoßen, dann die Tür anklicken.',
    ] };
  }
  if (!f.searchDone) {
    return { id: 'search', lines: [
      'In Herrn K.s Abteil muss es Spuren geben. Sechs Stück. Ich sehe mir alles genau an.',
      'Kleine Dinge zählen: etwas auf dem Bücherstapel, etwas auf dem Boden vor dem Bett, etwas in der Zeitung.',
    ] };
  }
  if (!(f.heard >= 3)) {
    return { id: `ilse${f.heard ?? 0}`, lines: [
      'Ilse murmelt im Schlaf. Ganz still zuhören – nach jedem Tunnel sagt sie ein Stück mehr.',
      'Ilse zuhören, dann am Fenster auf den Tunnel warten, dann wieder zuhören.',
    ] };
  }
  if (!f.keyFound) {
    return { id: 'shadow', lines: [
      '„Wo der Mond nicht hinkommt.“ Das Mondlicht malt helle Flecken auf den Boden. Wo nicht?',
      'Unter das Tischchen am Fenster fällt nie Mondlicht.',
    ] };
  }
  if (!f.suitcaseOpen) return { id: 'suitcase', lines: ['Was hat Ilse im Schlaf über den Koffer gesagt?', '„Den Koffer unter Bett vier.“ In Abteil 4 den Bettkasten unter dem Bett ansehen.'] };
  return { id: 'door', lines: [
    'Die Tür nach vorne will vier Ziffern. Auf dem Foto steht ein Datum.',
    'Rückseite des Fotos: 24. 12. – also 2412.',
  ] };
}
