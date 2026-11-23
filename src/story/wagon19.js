import {
  BOTTLES, BOTTLE_SPOTS, DEVELOP_SPOT, NEG_SLOTS, TRAY_SPOTS, checkNegatives, drawChemistry, drawContactSheet, drawEnlargement,
  drawExposureTable, drawNegative, negativeTokens, paintTint,
} from './art/wagon19.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 19 – Das Fotolabor (ohne Person)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Kameratasche des Bordfotografen: Zahlenschloss. Im Deckel die Belichtungstabelle, dazu die
//      Notiz „Tunnel, fast kein Licht“ → Blende 2, Zeit 1/15 → 215. Darin ein unentwickelter Film.
//   2. Dunkelkammer in der richtigen Reihenfolge: Vorhang zu, Licht aus, Rotlicht an. Sonst ist der
//      Film verdorben – nach dem Tunnel liegt er wieder in der Tasche (Zeitschleife).
//   3. Drei unbeschriftete Flaschen nach Geruch und halb zerrissener Anleitung in die Schalen:
//      Entwickler = Lauge (seifig) – Stoppbad = Säure (Essig) – Fixierer (Schwefel). Dann entwickeln.
//   4. Kontaktbogen: sechs Negative nach den vorbeigezogenen Tunnellampen ordnen → das letzte Bild
//      kommt in den Vergrößerer: eine Gestalt mit Josephs Mütze allein in der Lok, an Weiche 7,
//      Kilometerstein 24,7 → Türcode 247.
//
// ERGEBNIS: Der Zug ist nicht verunglückt, er ist an Weiche 7 abgebogen. Den Lok-Schlüssel hat der andere Joseph.

export const wagon19 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Der Weihnachtszug vom 24. Dezember erreichte seinen Bahnhof nie. Der Schaffner wartete am Bahnsteig auf seine Frau Martha und seine Tochter Mira.',
    'Im Schaffnerabteil: Weiche 7 ist der Weg aus dem Ring hinaus. Sie lässt sich nur von der Lok aus stellen – und der Lok-Schlüssel fehlt.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 19,
      title: 'Das Fotolabor',
      lines: ['Ein Fotolabor. Schalen, Flaschen, ein Vergrößerer. Und eine Kameratasche an der Wand.'],
    });
  },

  skipIntro: (story) => skipIntro(story),

  setup(story) {
    const f = story.flags;
    f.roomLight = true;
    f.redLight = false;
    f.curtainClosed = false;
    story.scene.paintSpot('tint', (ctx) => paintTint(ctx, { roomLight: f.roomLight || story.isDark, redLight: f.redLight }));
  },

  hotspots: {
    bag: {
      look: (story) => story.say(story.flags.bagOpen ? 'Die Kameratasche. Offen.' : 'Die Kameratasche des Bordfotografen. Ein Zahlenschloss mit drei Rädchen. Im Deckel klebt ein Zettel.'),
      use: (story) => openBag(story),
    },
    switch: {
      look: (story) => story.say(story.flags.roomLight ? 'Der Lichtschalter. Das Licht ist an.' : 'Der Lichtschalter. Das Licht ist aus.'),
      use: (story) => toggle(story, 'roomLight'),
    },
    curtain: {
      look: (story) => story.say(story.flags.curtainClosed ? 'Der Vorhang ist zu. Kein Licht kommt herein.' : 'Ein schwerer Vorhang. Er ist offen.'),
      use: (story) => toggle(story, 'curtainClosed'),
    },
    redLight: {
      look: (story) => story.say(story.flags.redLight ? 'Das Rotlicht leuchtet.' : 'Eine rote Lampe. Aus.'),
      use: (story) => toggle(story, 'redLight'),
    },
    timer: { look: 'Eine Laborzeituhr. Minuten und Sekunden.' },
    bottles: { look: 'Drei Flaschen ohne Etikett.', use: (story) => develop(story) },
    prints: { look: 'Alte Abzüge: der Speisewagen, der Barwagen, eine Weihnachtsfeier. Nichts Neues.' },
    trays: {
      look: 'Drei Entwicklerschalen.',
      use: (story) => develop(story),
      items: { film: (story) => develop(story) },
    },
    enlarger: {
      look: 'Ein Vergrößerer. Damit wird ein Negativ groß auf Papier belichtet.',
      use: (story) => enlarge(story),
      items: { negatives: (story) => enlarge(story) },
    },
    sofa: { look: 'Ein abgewetztes Sofa.', use: 'Nicht hinsetzen. Nicht einschlafen.' },
    door: { look: 'Die Tür nach vorne. Ein Zahlenschloss mit drei Rädchen.', use: (story) => tryDoor(story) },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Schnee und Nacht.'),
      use: (story) => waitForTunnel(story),
    },
  },

  items: {
    film: { look: 'Ein unentwickelter Film. Bloß nicht im Hellen öffnen.' },
    negatives: { look: (story) => sortNegatives(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    const f = story.flags;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      return;
    }
    if (f.filmRuined) {
      f.filmRuined = false;
      f.bagOpen = false;
      await story.idle();
      await story.say('Nach dem Tunnel … die Kameratasche ist wieder zu. Und der Film ist sicher wieder drin. Noch ein Versuch.');
    }
  },
};

// ============================================================================================
//  1. Kameratasche
// ============================================================================================

async function openBag(story) {
  const f = story.flags;
  if (f.bagOpen) return story.say(story.has('film') || f.developed ? 'Leer.' : 'Leer.');
  if (!f.tableSeen) {
    f.tableSeen = true;
    await story.card({ draw: drawExposureTable });
    await story.say('Eine Belichtungstabelle. Und: „Letzte Aufnahme: Tunnel, fast kein Licht.“');
    story.note('Kameratasche: Belichtungstabelle im Deckel. Schloss = Blende, dann Zeit (ohne „1/“). Letzte Aufnahme: Tunnel, fast kein Licht.');
  }
  const opened = await tryCode(story, {
    id: 'bag19', code: '215', style: 'steel',
    wrong: 'Falsch. Fast kein Licht … welche Blende, welche Zeit?',
  });
  if (!opened) return;
  f.bagOpen = true;
  story.sound('unlock');
  story.give('film');
  await story.say('Blende 2, eine Fünfzehntelsekunde. Auf! Darin: ein Film. Nicht entwickelt.');
}

// ============================================================================================
//  2. Dunkelkammer
// ============================================================================================

async function toggle(story, flag) {
  const f = story.flags;
  f[flag] = !f[flag];
  story.sound(flag === 'curtainClosed' ? 'slide' : 'click');
  const lines = {
    roomLight: f.roomLight ? 'Licht an.' : 'Licht aus.',
    curtainClosed: f.curtainClosed ? 'Vorhang zu.' : 'Vorhang auf.',
    redLight: f.redLight ? 'Rotlicht an.' : 'Rotlicht aus.',
  };
  await story.say(lines[flag]);
  if (!f.roomLight && !f.redLight) await story.say('Stockdunkel. Ich sehe meine eigene Hand nicht.');
}

function darkroomReady(f) {
  return f.curtainClosed && !f.roomLight && f.redLight;
}

// ============================================================================================
//  3. Entwickeln
// ============================================================================================

async function develop(story) {
  const f = story.flags;
  if (f.developed) return story.say('Der Film ist entwickelt. Die Negative habe ich.');
  if (inTunnel(story)) return story.say('Im Tunnel warte ich lieber.');
  if (!f.roomLight && !f.redLight) return story.say('Ich sehe nichts. Ohne Rotlicht geht hier gar nichts.');
  f.trays ??= [null, null, null];
  const state = { trays: f.trays, held: null, redLight: f.redLight && !f.roomLight };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawChemistry(ctx, view.state),
    spots: () => [...BOTTLE_SPOTS.filter((s) => !state.trays.includes(s.id)), ...TRAY_SPOTS, DEVELOP_SPOT],
    area: { x: 220, y: 60, w: 1020, h: 600 },
    help: 'Klicken: Flasche nehmen (und riechen), dann in eine Schale gießen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      const bottle = BOTTLES.find((b) => b.id === spot.id);
      if (bottle) {
        s.held = bottle.id;
        story.sound('sniff');
        await story.say(bottle.smell);
        return;
      }
      if (spot.id.startsWith('t')) {
        const i = Number(spot.id.slice(1));
        if (s.held) {
          if (s.trays[i]) return story.say('In der Schale ist schon etwas.');
          s.trays[i] = s.held;
          s.held = null;
          story.sound('water');
        } else if (s.trays[i]) {
          s.trays[i] = null;
          story.sound('water');
          await story.say('Ausgekippt.');
        }
        return;
      }
      // Film entwickeln
      if (!story.has('film')) return story.say('Ich habe keinen Film.');
      if (s.trays.some((t) => !t)) return story.say('Erst alle drei Schalen füllen.');
      if (!darkroomReady(f)) {
        view.close(false);
        f.filmRuined = true;
        story.remove('film');
        story.sound('wrong');
        await story.say(f.roomLight ? 'Ich öffne die Dose – Licht! Der Film ist belichtet. Verdorben.' : !f.curtainClosed ? 'Durch den offenen Vorhang fällt Licht auf den Film. Verdorben!' : 'Ohne Rotlicht? Ich sehe nichts … Der Film rutscht mir weg. Verdorben.');
        await story.say('Vorhang zu, Licht aus, Rotlicht an – das muss stimmen, bevor ich die Dose öffne.');
        if (!f.ruinNoted) {
          f.ruinNoted = true;
          story.note('Dunkelkammer: Vorhang zu, Licht aus, Rotlicht an – erst dann den Film öffnen. Ein verdorbener Film liegt nach dem Tunnel wieder in der Tasche.');
        }
        return;
      }
      const chems = s.trays.map((id) => BOTTLES.find((b) => b.id === id).chem);
      if (chems.join() !== 'dev,stop,fix') {
        story.sound('wrong');
        await story.say('Das Bild wird schwarz und schmierig. Falsche Reihenfolge der Bäder. Zum Glück nur ein Probestreifen.');
        s.trays.fill(null);
        return;
      }
      story.sound('water');
      await story.say('Entwickler, drei Minuten … Stoppbad, eine Minute … Fixierer.');
      view.close(true);
    },
  });
  if (!done) return;
  f.developed = true;
  story.remove('film');
  story.give('negatives');
  await story.say('Ein Streifen Negative. Hell und dunkel vertauscht – ein Tunnel, immer wieder.');
  story.note('Film entwickelt (Entwickler – Stoppbad – Fixierer). Sechs Negative aus einem Tunnel.');
  await sortNegatives(story);
}

// ============================================================================================
//  4. Kontaktbogen und Vergrößerer
// ============================================================================================

async function sortNegatives(story) {
  const f = story.flags;
  if (f.sorted) return story.say('Geordnet. Das letzte Bild gehört in den Vergrößerer.');
  const solved = await story.view('arrange', {
    id: 'negatives19',
    title: 'Kontaktbogen',
    slots: NEG_SLOTS,
    tokens: negativeTokens(),
    drawBackground: drawContactSheet,
    drawToken: drawNegative,
    check: checkNegatives,
    help: 'Negative mit gedrückter Maustaste in die Reihe ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  f.sorted = true;
  await story.say('Je tiefer im Tunnel, desto weniger Lampen liegen noch vor der Kamera. Das letzte Bild: keine Lampe mehr – nur die Weiche.');
  story.note('Negative geordnet. Das letzte Bild zeigt die Stelle kurz vor Weiche 7 – ab in den Vergrößerer.');
}

async function enlarge(story) {
  const f = story.flags;
  if (!f.sorted) return story.say(f.developed ? 'Erst die Negative ordnen – welches ist das letzte?' : 'Ohne Negativ gibt es nichts zu vergrößern.');
  if (!f.roomLight && !f.redLight) return story.say('Ich sehe nichts.');
  story.sound('click');
  await story.card({ draw: drawEnlargement });
  if (f.enlarged) return;
  f.enlarged = true;
  await story.cutscene(async () => {
    await story.say('Die Lok im Tunnel. Die Gleise teilen sich – Weiche 7. Der Zug biegt ab.');
    await story.say('Er ist nicht verunglückt. Er ist abgebogen!');
    await story.say('Und im Führerstand … jemand mit meiner Mütze. Allein am Hebel. Der Lok-Schlüssel steckt.');
    await story.say('Am Gleis ein Kilometerstein: 24,7.');
  });
  story.note('Vergrößertes Tunnelfoto: Der Zug ist an Weiche 7 abgebogen, nicht verunglückt. Im Führerstand eine Gestalt mit meiner Mütze, der Lok-Schlüssel steckt. Kilometerstein 24,7.');
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  const opened = await tryCode(story, {
    id: 'door19', code: '247',
    wrong: (s) => (s.flags.enlarged ? 'Falsch. Der Kilometerstein …' : 'Falsch. Drei Ziffern.'),
  });
  if (!opened) return;
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Zwei, vier, sieben. Offen.');
    await story.say('Der Lok-Schlüssel ist nicht verloren. Er hat ihn. Der andere Joseph.');
    story.sound('door');
    await finishWagon(story, {
      number: 19,
      title: 'Ende von Wagen 19',
      lines: ['Der Zug ist nicht verunglückt – er ist an Weiche 7 abgebogen.', 'Den Lok-Schlüssel hat der andere Joseph.'],
      nextTitle: 'im Packwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.bagOpen && !f.developed) {
    return { id: 'bag', lines: [
      'Die Kameratasche an der Wand: Im Deckel steht eine Belichtungstabelle.',
      '„Fast kein Licht“: Blende 2, Zeit 1/15. Ohne „1/“ → 2, 1, 5.',
    ] };
  }
  if (!f.developed) {
    if (!darkroomReady(f)) {
      return { id: 'dark', lines: [
        'Den Film nur in der Dunkelkammer öffnen. Was gehört dazu?',
        'Vorhang zu, Licht aus, Rotlicht an.',
      ] };
    }
    return { id: 'chem', lines: [
      'Die Schalen füllen: an den Flaschen riechen und die zerrissene Anleitung lesen.',
      'Laugen fühlen sich an wie Seife, Essig ist eine Säure. Was übrig bleibt, ist der Fixierer.',
      'Schale 1: seifig (braun) – Schale 2: Essig (gelblich) – Schale 3: Schwefel (klar). Dann „Film entwickeln“.',
    ] };
  }
  if (!f.sorted) return { id: 'sort', lines: [
    'Im Negativ sind die hellen Lampen dunkle Punkte. Je tiefer der Zug im Tunnel ist, desto weniger Lampen liegen noch vor ihm.',
    'Erst das Bild mit fünf Lampen vorn, dann vier, drei, zwei, eine – zuletzt keine (dort teilt sich das Gleis).',
  ] };
  if (!f.enlarged) return { id: 'enlarge', lines: ['Das letzte Negativ in den Vergrößerer: den Vergrößerer links benutzen.'] };
  return { id: 'door', lines: ['Der Kilometerstein auf dem Foto: 24,7 → 247.'] };
}
