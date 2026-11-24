import {
  HOLES, PHOTO, PHOTO_SPOTS, ROWS, SNIPPETS, SOLUTION, START_FILL, crosswordSpots, drawArchive, drawCrossword,
  drawMagnified, drawNewspaper, drawPressPhoto, drawSnippet, snippetSize,
} from './art/wagon14.js';
import { LETTERS, finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 14 – Der Zeitungswagen (niemand da)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Ein Kreuzworträtsel, halb ausgefüllt – in Josephs Handschrift. Fragen zu den Wagen 1–13.
//      Zwei Zeilen sind leer, eine ist falsch (LOKFÜHRER statt SCHAFFNER). Die gelben Kästchen
//      ergeben WEICHE → Buchstabenschloss am Archivschrank.
//   2. Im Archiv: die Zeitung vom 25. Dezember mit Löchern. Die Schnipsel liegen im Papierkorb.
//      Richtig eingesetzt: „WEIHNACHTSZUG IM TUNNEL VERSCHOLLEN“ … „Er wird seitdem vermisst.“
//      (BAHNHOF und „gerettet“ sind falsche Schnipsel.)
//   3. Pressefoto mit der Lupe: Die Bahnhofsuhr zeigt 23:47 → Türcode 2347.

const DOOR_CODE = '2347';

export const wagon14 = {
  flags: {},
  startItems: ['flashlight', 'gear', 'familyPhoto'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Eine Gestalt mit meinen Sachen führt die Fahrgäste in den Tunnel. Der Schaffner ruft sie. Herrn Tick habe ich gerettet.',
    'Herr Moll hat an einem Weihnachtsabend im Zug für die Frau und die Tochter des Schaffners gespielt. „Seitdem fährt der Zug im Kreis.“',
    'Kapelle: „Zum Gedenken an den Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte.“ Auf der Tafel stehen alle Fahrgäste – und J. Im Opferstock lag ein Familienfoto: Der junge Schaffner sieht aus wie ich.',
    'Der Tunnel: vierzehn Ticks. Herr Tick sagt: „Nicht mehr lange. Beeil dich, Junge.“',
  ],

  setup(story) {
    story.flags.fill ??= [...START_FILL];
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 14,
      title: 'Der Zeitungswagen',
      lines: [
        'Zeitungen. Stapelweise.',
        'Wenn dieser Zug an Weihnachten verschwunden ist, dann stand das in der Zeitung.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    crossword: {
      look: 'Ein Kreuzworträtsel auf dem Lesetisch. Halb ausgefüllt – in meiner Handschrift!',
      use: (story) => crossword(story),
    },
    magnifier: {
      look: 'Eine Lupe.',
      use: async (story) => {
        story.flags.magnifierTaken = true;
        story.give('magnifier');
        await story.say('Die nehme ich mit. Ein Detektiv braucht eine Lupe.');
      },
    },
    pencil: { look: 'Ein Bleistift. Fast stumpf.' },
    lamp: { look: 'Eine grüne Leselampe.' },
    basket: {
      look: (story) => story.say(story.flags.snippetsTaken ? 'Der Papierkorb ist leer.' : 'Ein Papierkorb. Darin: lauter kleine, ausgeschnittene Papierstücke.'),
      use: async (story) => {
        const f = story.flags;
        if (f.snippetsTaken) return story.say('Leer.');
        if (inTunnel(story)) return story.say('Im Dunkeln wühle ich da nicht.');
        f.snippetsTaken = true;
        story.give('snippets');
        await story.say('Ausgeschnittene Wörter. Jemand hat sie aus einer Zeitung herausgeschnitten.');
        story.note('Im Papierkorb: ausgeschnittene Wörter aus einer Zeitung.');
      },
    },
    lock: { look: 'Ein Schloss mit sechs Buchstaben-Rädchen.', use: (story) => openArchive(story) },
    cabinet: {
      look: (story) => story.say(story.flags.archiveOpen ? 'Der Archivschrank ist offen.' : 'Der Archivschrank. Viele Schubladen – und ein Schloss mit sechs Buchstaben.'),
      use: (story) => openArchive(story),
    },
    rack: { look: 'Zeitungen auf Holzstangen. Alle vom 24. Dezember. Immer dieselbe Ausgabe.' },
    bundles: { look: 'Zusammengeschnürte Zeitungsbündel. Alle vom 24. Dezember.' },
    globe: { look: 'Ein Globus. Der Bahnhof, zu dem dieser Zug fahren sollte, ist sicher nicht drauf.' },
    chair: {
      look: 'Ein bequemer Ledersessel.',
      use: (story) => waitForTunnel(story, 'Ich setze mich kurz in den Sessel und warte auf den Tunnel …'),
    },
    door: {
      look: 'Die Tür nach vorne. Ein Zahlenschloss mit vier Ziffern.',
      use: (story) => tryDoor(story),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnelwand.' : 'Draußen Schnee.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    holeyPaper: { look: (story) => fixNewspaper(story) },
    snippets: { look: (story) => (story.has('holeyPaper') ? fixNewspaper(story) : story.say('Lauter einzelne Wörter: WEIHNACHTSZUG, TUNNEL, BAHNHOF, gerettet …')) },
    pressPhoto: { look: (story) => readNewspaper(story) },
    familyPhoto: { look: (story) => story.say('Das Familienfoto aus der Kapelle. Der junge Schaffner sieht aus wie ich.') },
    magnifier: { look: 'Die Lupe vom Lesetisch.' },
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
//  Kreuzworträtsel
// ============================================================================================

async function crossword(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nichts lesen.');
  if (!f.crosswordSeen) {
    f.crosswordSeen = true;
    story.note('Kreuzworträtsel auf dem Lesetisch – halb ausgefüllt in meiner Handschrift, mit Fragen zu den Wagen. Die gelben Kästchen ergeben ein Lösungswort.');
  }
  await story.view('picture', {
    draw: (ctx) => drawCrossword(ctx, f.fill),
    spots: crosswordSpots(),
    area: { x: 120, y: 60, w: 1040, h: 600 },
    help: 'Zeile anklicken: nächste Antwort eintragen  ·  Rechtsklick: zurück',
    onClick: async (spot) => {
      // jeder Klick trägt die nächste mögliche Antwort ein
      const row = ROWS[spot.row];
      const current = row.options.indexOf(f.fill[spot.row]);
      f.fill[spot.row] = row.options[(current + 1) % row.options.length];
      story.sound('page');
      return null;
    },
  });
  const word = ROWS.map((row, i) => (f.fill[i] ? f.fill[i][row.key] : '_')).join('');
  if (word === SOLUTION && !f.wordSeen) {
    f.wordSeen = true;
    await story.say('Von oben nach unten: W – E – I – C – H – E. WEICHE.');
    story.note('Kreuzworträtsel gelöst (die falsche Antwort war LOKFÜHRER – es ist der SCHAFFNER, der ruft). Lösungswort: WEICHE.');
  }
}

async function openArchive(story) {
  const f = story.flags;
  if (f.archiveOpen) return archive(story);
  const opened = await tryCode(story, {
    id: 'archive',
    code: SOLUTION,
    alphabet: LETTERS,
    dark: 'Im Dunkeln sehe ich die Buchstaben nicht.',
    wrong: 'Falsch. Sechs Buchstaben …',
  });
  if (!opened) return;
  f.archiveOpen = true;
  story.sound('unlock');
  await story.say('WEICHE. Der Archivschrank ist offen.');
  await archive(story);
}

async function archive(story) {
  const f = story.flags;
  if (f.paperTaken) return story.say('Im Archiv sind nur noch Ausgaben vom 24. Dezember. Immer wieder der 24.');
  await story.card({ draw: drawArchive });
  f.paperTaken = true;
  story.give('holeyPaper');
  story.sound('paper');
  await story.say('Ganz unten, in der Schublade „24. – 25. Dez.“: eine einzige Zeitung vom 25. Dezember!');
  await story.say('Aber jemand hat Wörter herausgeschnitten. Die Schlagzeile ist voller Löcher.');
  story.note('Im Archivschrank: die Zeitung vom 25. Dezember – die einzige! Wörter in der Schlagzeile und im Text sind herausgeschnitten.');
}

// ============================================================================================
//  Die Zeitung vom 25. Dezember
// ============================================================================================

async function fixNewspaper(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nichts lesen.');
  if (!story.has('snippets')) {
    await story.card({ draw: drawNewspaper });
    return story.say('Löcher, wo Wörter fehlen. Die ausgeschnittenen Stücke muss es doch noch irgendwo geben.');
  }
  const solved = await story.view('arrange', {
    id: 'newspaper',
    title: '',
    slots: HOLES.map((hole) => ({ x: hole.x, y: hole.y, w: hole.w, h: hole.h })),
    tokens: SNIPPETS.map((snippet) => ({ id: snippet.id, label: snippet.word, ...snippetSize(snippet), home: snippet.home })),
    drawBackground: drawNewspaper,
    drawToken: drawSnippet,
    check: (placement) => placement.every((id, i) => SNIPPETS.find((s) => s.id === id)?.word === HOLES[i].word),
    help: 'Schnipsel in die Löcher ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  story.remove('snippets');
  story.game.inventory.replace('holeyPaper', 'pressPhoto');
  f.paperFixed = true;
  await story.cutscene(async () => {
    await story.say('„WEIHNACHTSZUG IM TUNNEL VERSCHOLLEN.“');
    await story.say('„Unter den Fahrgästen: Frau und Tochter des Schaffners. Er selbst wartete am Bahnsteig.“');
    story.sound('dread');
    await story.say('„Zeugen sahen ihn in der Nacht allein in den Tunnel laufen. Er wird seitdem vermisst.“');
    await story.say('Deshalb steht „J.“ auf der Tafel. Der Schaffner ist hinterher. In den Tunnel.');
  });
  story.note('Die Zeitung vom 25. Dezember: „Weihnachtszug im Tunnel verschollen.“ Unter den Fahrgästen: Frau und Tochter des Schaffners. Er selbst wartete am Bahnsteig. Zeugen sahen ihn in der Nacht allein in den Tunnel laufen. Er wird seitdem vermisst.');
}

async function readNewspaper(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nichts lesen.');
  await story.view('picture', {
    draw: drawPressPhoto,
    spots: PHOTO_SPOTS,
    area: PHOTO,
    help: 'Klicken: genauer ansehen  ·  Rechtsklick: zurück',
    onClick: async () => {
      if (!story.has('magnifier')) return story.say('Eine Bahnhofsuhr. Viel zu klein – die Zeiger kann ich nicht erkennen. Mit einer Lupe vielleicht.');
      await story.card({ draw: drawMagnified });
      if (!f.clockRead) {
        f.clockRead = true;
        await story.say('Mit der Lupe: Die Bahnhofsuhr zeigt dreiundzwanzig Uhr siebenundvierzig.');
        await story.say('23:47. Die Zeit, zu der der Zug hätte ankommen sollen.');
        story.note('Pressefoto (mit der Lupe): Der Schaffner allein auf dem verschneiten Bahnsteig. Die Bahnhofsuhr zeigt 23:47 – da hätte der Zug ankommen sollen.');
      }
      return null;
    },
  });
  if (!f.photoLooked) {
    f.photoLooked = true;
    await story.say('Das Pressefoto: ein Schaffner allein auf dem Bahnsteig, im Schnee. Über ihm eine große Bahnhofsuhr.');
  }
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  const opened = await tryCode(story, { id: 'door14', code: DOOR_CODE, dark: 'Im Dunkeln sehe ich die Tasten nicht.', wrong: 'Falsch. Vier Ziffern …' });
  if (!opened) return;
  if (!story.flags.paperFixed) return story.say('Offen. Aber erst will ich wissen, was in dieser Zeitung stand.');
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('23:47. Der Zug ist nie angekommen. Und der Schaffner ist in den Tunnel gelaufen.');
    await finishWagon(story, {
      number: 14,
      title: 'Ende von Wagen 14',
      lines: ['„Weihnachtszug im Tunnel verschollen.“', '„Er wird seitdem vermisst.“'],
      nextTitle: 'im Spielzimmer',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.archiveOpen) {
    const filled = f.fill.every(Boolean);
    return { id: filled ? 'wrong' : 'crossword', lines: [
      'Auf dem Lesetisch liegt ein Kreuzworträtsel. Zwei Zeilen sind leer – eine Zeile anklicken, bis die richtige Antwort dasteht.',
      'Eine der schon ausgefüllten Antworten ist falsch. Wer ruft die Fahrgäste zum Tunnel?',
      'Richtig: WHISKY, ILSE, BITTERMANDEL, SCHAFFNER, ZAHNRAD, KLAVIER. Lösungswort WEICHE – für das Schloss am Archivschrank.',
    ] };
  }
  if (!f.paperTaken) return { id: 'archive', lines: ['Im Archivschrank nachsehen.', 'Den Archivschrank öffnen und die Zeitung darin nehmen.'] };
  if (!f.paperFixed) {
    if (!f.snippetsTaken) return { id: 'basket', lines: ['In der Zeitung fehlen Wörter. Jemand hat sie ausgeschnitten – aber wohin damit?', 'Die herausgeschnittenen Wörter … im Papierkorb neben dem Lesetisch.'] };
    return { id: 'fix', lines: [
      'Die Zeitung ansehen (Rechtsklick im Inventar) und die Schnipsel in die Löcher ziehen.',
      'Große Schrift in die Schlagzeile, kleine in den Text. Zwei Schnipsel gehören nicht dazu.',
      '„WEIHNACHTSZUG IM TUNNEL VERSCHOLLEN“ und „Er wird seitdem vermisst“.',
    ] };
  }
  if (!f.clockRead) {
    if (!story.has('magnifier')) return { id: 'magnifier', lines: ['Das Pressefoto ist winzig. Ich bräuchte etwas zum Vergrößern.', 'Auf dem Lesetisch liegt eine Lupe.'] };
    return { id: 'clock', lines: ['Auf dem Pressefoto ist eine Uhr. Mit der Lupe kann ich sie lesen.', 'Die Zeitung ansehen und auf die Bahnhofsuhr im Pressefoto klicken.'] };
  }
  return { id: 'door', lines: ['Die Uhrzeit auf dem Pressefoto – vielleicht ist das der Code.', 'Die Bahnhofsuhr zeigt 23:47. Die Tür will vier Ziffern: 2 – 3 – 4 – 7.'] };
}
