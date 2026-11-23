import {
  KEY_SLOTS, SWITCH_NAMES, checkKeys, drawDutyBook, drawInterlocking, drawKeyBoard, drawKeyToken, drawTelegram, keyTokens, routeFrom, switchSpots,
} from './art/wagon18.js';
import { LETTERS, finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 18 – Das Schaffnerabteil (der Schaffner nur als Stimme)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Dienstbuch: Schichtplan der Weihnachtswoche mit Tauschvermerken. Am 24. hätte J. (der Schaffner)
//      fahren sollen, gab den Dienst aber an Moser ab, und Moser gab ihn weiter an Falk → FALK.
//      Das ist das Wort fürs Buchstabenschloss der Schublade. Darin: Telegramm der Familie und ein
//      Bund mit sieben Schlüsseln.
//   2. Schlüsselbrett: Sieben Schlüssel nach der Form ihres Griffs den acht Umrissen zuordnen.
//      Ein Umriss bleibt leer: „Lok“. Erst wenn alle Schlüssel hängen, ist das Stellwerk frei.
//   3. Stellwerk: Weichen 1–6 so stellen, dass die Fahrstraße aus dem Ring bis Weiche 7 führt
//      (z. B. 1 nach oben, 2 nach rechts, 4 nach rechts, 6 nach rechts). Dann ist die Tür entriegelt.
//   4. Der rote Hebel für Weiche 7 ist verplombt: „Nur von der Lok aus.“ Der Lok-Schlüssel fehlt.
//
// ERGEBNIS: Der Schaffner hatte getauscht, um zu Hause Weihnachten vorzubereiten. Für Weiche 7
// braucht Joseph den Lok-Schlüssel – und der fehlt.

const VOICE = '#a6f0b6';
const SPEAKER = { x: 420, y: 120 };

export const wagon18 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Der Zug ist der Weihnachtszug vom 24. Dezember. Frau und Tochter des Schaffners saßen darin; er selbst wartete am Bahnsteig.',
    'Im Funkraum: Der Schaffner hatte gewarnt – „Weiche 7 falsch“ –, aber niemand im Zug hörte es.',
    'Im Gewächshaus fand ich die Liste des anderen Joseph: „Der Letzte ist J. Dann sind alle wieder zusammen.“',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 18,
      title: 'Das Schaffnerabteil',
      lines: ['Das Abteil des Schaffners. Sein Mantel hängt hier. Seine Mütze.'],
    });
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('Wer ist da in meinem Abteil? …', { at: SPEAKER, color: VOICE });
      await story.speak('Ach. Du bist es. Du bist früh dran, Junge. Sieh dich ruhig um.', { at: SPEAKER, color: VOICE });
      await story.say('Er weiß, wer ich bin. Woher?');
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    book: {
      look: 'Das Dienstbuch des Zugpersonals. Aufgeschlagen bei der Weihnachtswoche.',
      use: (story) => readBook(story),
    },
    drawer: {
      look: (story) => story.say(story.flags.drawerOpen ? 'Die Schublade ist offen.' : 'Eine Schublade mit Buchstabenschloss. Vier Rädchen.'),
      use: (story) => openDrawer(story),
    },
    keyboard: {
      look: (story) => story.say(story.flags.keysHung ? 'Alle Schlüssel hängen. Nur der Haken „Lok“ ist leer.' : 'Ein Schlüsselbrett mit acht Umrissen. Kein einziger Schlüssel hängt daran.'),
      use: (story) => hangKeys(story),
      items: { keyRing: (story) => hangKeys(story) },
    },
    punch: { look: 'Eine schwere Lochzange. Damit knipst der Schaffner Fahrkarten.', use: 'Klick. Ein Loch in die Luft.' },
    lamp: { look: 'Eine grüne Schreibtischlampe.' },
    coat: {
      look: 'Der Mantel des Schaffners. Und seine Mütze …',
      use: async (story) => {
        await story.say('Ich halte mir die Mütze an. Sie passt wie angegossen.');
        await story.say('Merkwürdig. Als wäre es meine.');
      },
    },
    plan: { look: 'Ein Gleisplan unter Glas. Der Ring, Abzweige, Prellböcke – und Weiche 7, der Weg hinaus.', use: (story) => setRoute(story) },
    levers: { look: 'Sechs Weichenhebel. Daneben ein Schild: „Stellwerk“.', use: (story) => setRoute(story) },
    redLever: {
      look: 'Ein großer roter Hebel. Weiche 7. Er ist verplombt – mit Draht und einem Bleisiegel.',
      use: (story) => tryRedLever(story),
    },
    speaker: {
      look: 'Der Lautsprecher. Aus dem ruft er.',
      use: async (story) => {
        story.sound('speaker');
        await story.say('Hallo? Wer sind Sie? Wo sind Sie?');
        await story.speak('Näher, als du denkst, Junge.', { at: SPEAKER, color: VOICE });
      },
    },
    bin: { look: 'Ein Papierkorb. Leer bis auf eine zerknüllte Fahrkarte nach „Ringstadt“.' },
    door: {
      look: (story) => story.say(story.flags.routeSet ? 'Die Tür ist entriegelt.' : 'Die Tür nach vorne. Verriegelt – sie hängt am Stellwerk.'),
      use: (story) => (story.flags.routeSet ? ending(story) : story.say('Verriegelt. Das Stellwerk gibt sie nicht frei.')),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Schnee. Der Turm.'),
      use: (story) => waitForTunnel(story),
    },
  },

  items: {
    telegram: { look: (story) => readTelegram(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },
};

// ============================================================================================
//  1. Dienstbuch und Schublade
// ============================================================================================

async function readBook(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nicht lesen.');
  story.sound('page');
  await story.card({ draw: drawDutyBook });
  if (story.flags.bookRead) return;
  story.flags.bookRead = true;
  await story.say('Am 24. sollte „J.“ fahren. Aber dann wurde getauscht … und noch einmal.');
  story.note('Dienstbuch: Am 24.12. sollte J. (der Schaffner) fahren. Tauschvermerke: J. gab den 24. an Moser, Moser gab ihn an Falk, Falk tauschte den 25. mit J. Wer fuhr am 24.? Der Name öffnet die Schublade.');
}

async function openDrawer(story) {
  const f = story.flags;
  if (f.drawerOpen) return story.say('Leer.');
  const opened = await tryCode(story, {
    id: 'drawer18', code: 'FALK', alphabet: LETTERS, style: 'brass',
    wrong: (s) => (s.flags.bookRead ? 'Falsch. Wer hat den 24. am Ende wirklich gefahren?' : 'Falsch. Vier Buchstaben – ein Name?'),
  });
  if (!opened) return;
  f.drawerOpen = true;
  story.sound('drawer');
  await story.say('F-A-L-K. Auf!');
  story.give('telegram');
  story.give('keyRing');
  await story.say('Ein Telegramm. Und ein Bund mit sieben Schlüsseln.');
  await readTelegram(story);
}

async function readTelegram(story) {
  story.sound('paper');
  await story.card({ draw: drawTelegram });
  if (story.flags.telegramRead) return;
  story.flags.telegramRead = true;
  await story.say('„Warte am Bahnsteig auf uns. Deine Martha und Mira.“');
  await story.say('Er hat getauscht, um zu Hause alles vorzubereiten. Und seine Familie sollte mit diesem Zug nachkommen.');
  story.note('Telegramm an Schaffner J.: Frau Martha und Tochter Mira nehmen den Weihnachtszug am 24.12., Ankunft 23:47. „Warte am Bahnsteig auf uns.“ Er hatte seinen Dienst getauscht, um Weihnachten vorzubereiten.');
}

// ============================================================================================
//  2. Schlüsselbrett
// ============================================================================================

async function hangKeys(story) {
  const f = story.flags;
  if (f.keysHung) return story.say('Alle Schlüssel hängen. Der Haken „Lok“ bleibt leer.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Umrisse nicht.');
  if (!story.has('keyRing')) return story.say('Acht leere Umrisse. Wo sind die Schlüssel?');
  const solved = await story.view('arrange', {
    id: 'keys18',
    title: 'Schlüsselbrett',
    slots: KEY_SLOTS,
    tokens: keyTokens(),
    partial: true,
    drawBackground: drawKeyBoard,
    drawToken: drawKeyToken,
    check: checkKeys,
    help: 'Schlüssel mit gedrückter Maustaste auf den passenden Umriss ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  f.keysHung = true;
  story.remove('keyRing');
  story.sound('latch');
  await story.say('Alle sieben hängen. Klack – irgendwo hinter dem Brett löst sich eine Sperre.');
  await story.say('Nur ein Umriss ist leer. Darunter steht: „Lok“.');
  story.note('Schlüsselbrett: Alle Schlüssel hängen, das Stellwerk ist frei. Nur der Haken „Lok“ ist leer – der Lok-Schlüssel fehlt.');
}

// ============================================================================================
//  3. Stellwerk
// ============================================================================================

async function setRoute(story) {
  const f = story.flags;
  if (f.routeSet) return story.say('Die Fahrstraße bis Weiche 7 steht.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich den Plan nicht.');
  if (!f.keysHung) {
    story.sound('locked');
    return story.say('Die Hebel lassen sich nicht bewegen. Ein Schild: „Gesperrt, solange Schlüssel fehlen.“');
  }
  f.settings ??= { W1: 1, W2: 0, W3: 1, W4: 1, W5: 0, W6: 1 };
  const state = { settings: f.settings };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawInterlocking(ctx, view.state),
    spots: switchSpots(),
    area: { x: 140, y: 70, w: 1000, h: 580 },
    help: 'Klicken: Weiche umstellen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      view.state.settings[spot.id] = 1 - view.state.settings[spot.id];
      story.sound('lever');
      if (routeFrom(view.state.settings).end === 'W7') {
        await story.wait(0.9);
        view.close(true);
      }
    },
  });
  if (!done) return;
  f.routeSet = true;
  story.sound('unlock');
  await story.say('Die Fahrstraße steht – vom Ring bis an Weiche 7. Die Tür ist entriegelt.');
  await story.say('Jetzt fehlt nur noch Weiche 7 selbst. Der rote Hebel.');
  story.note(`Stellwerk: Fahrstraße aus dem Ring bis Weiche 7 gestellt (Weichen: ${SWITCH_NAMES.map((id, i) => `${i + 1}=${f.settings[id] ? 'b' : 'a'}`).join(', ')}). Die Tür ist entriegelt.`);
}

async function tryRedLever(story) {
  const f = story.flags;
  story.sound('locked');
  await story.say('Ich ziehe – der Hebel rührt sich nicht. Die Plombe hält ihn fest.');
  await story.say('Auf dem Siegel steht: „Weiche 7 – nur von der Lok aus.“');
  if (!f.sealNoted) {
    f.sealNoted = true;
    story.note('Der rote Hebel für Weiche 7 ist verplombt: „Nur von der Lok aus.“ Dafür braucht man den Lok-Schlüssel.');
  }
}

// ============================================================================================
//  Ende
// ============================================================================================

async function ending(story) {
  await story.cutscene(async () => {
    if (!story.flags.sealNoted) await tryRedLever(story);
    story.sound('speaker');
    await story.speak('Weiche sieben stellt man nicht allein, Junge. Und nicht ohne Schlüssel.', { at: SPEAKER, color: VOICE });
    await story.say('Wo ist der Lok-Schlüssel?');
    await story.speak('Da, wo er immer ist.', { at: SPEAKER, color: VOICE });
    story.sound('door');
    await finishWagon(story, {
      number: 18,
      title: 'Ende von Wagen 18',
      lines: ['Der Schaffner hatte seinen Dienst getauscht – seine Familie sollte mit diesem Zug nachkommen.', 'Weiche 7 lässt sich nur von der Lok aus stellen. Der Lok-Schlüssel fehlt.'],
      nextTitle: 'im Fotolabor',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.drawerOpen) {
    if (!f.bookRead) return { id: 'book', lines: ['Die Schublade will einen Namen. Auf dem Schreibtisch liegt das Dienstbuch.'] };
    return { id: 'drawer', lines: [
      'Die Tauschvermerke der Reihe nach durchgehen: Wer hatte am Ende den 24.?',
      'J. gab den 24. an Moser. Moser gab den 24. an Falk. Der dritte Tausch betrifft den 25. – nicht den 24.',
      'FALK.',
    ] };
  }
  if (!f.keysHung) {
    return { id: 'keys', lines: [
      'Die sieben Schlüssel gehören ans Schlüsselbrett – jeder auf den Umriss, der zur Form seines Griffs passt.',
      'Ring zu Ring, Kleeblatt zu Kleeblatt, Herz zu Herz … ein Umriss bleibt leer.',
    ] };
  }
  if (!f.routeSet) {
    return { id: 'route', lines: [
      'Am Gleisplan: Die Fahrstraße muss vom Ring bis zu Weiche 7 führen – nicht an den Prellbock, nicht zurück in den Ring.',
      'Weiche 1 nach oben, Weiche 2 nach rechts, Weiche 4 nach rechts, Weiche 6 nach rechts.',
    ] };
  }
  return { id: 'door', lines: ['Die Tür ist entriegelt.'] };
}
