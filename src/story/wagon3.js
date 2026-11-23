import {
  COUPLED, DISK_SPOTS, HOLE_SLOTS, SHIFT, SWITCH_X, checkHoles, drawCipherLetter, drawHoles, drawLetterToken,
  drawPostmasterNote, drawTubes, letterTokens, switchSpots,
} from './art/wagon3.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 3 – Der Postwagen (ohne Person)
// ============================================================================================
//
// DIE RÄTSEL
//   1. 24 Fächer, eins pro Runde (römische Zahlen). Acht lose Briefe nach ihrem Rundenstempel
//      einsortieren → vier Fächer bleiben leer: I, IV, VI, IX → Code 1469 für den Schrank des Postmeisters.
//   2. Im Schrank: Dienstanweisung – der Brief an J. steckt in Rohrpost-Leitung 3. Vier Weichen,
//      jede dreht ihre Nachbarn mit (Lichter-aus-Prinzip). Alle müssen gerade stehen.
//   3. Der Brief ist verschlüsselt: „Runde 108, Verschiebung wie die Runde“ → 108 = 4 × 26 + 4,
//      also jeden Buchstaben um 4 zurück. Mit der Chiffrierscheibe lesen.
//      „Morgen verschwindet jemand. Achte auf die Gläser. Das Wort für die Tür: STERN“
//   4. Tür: Buchstabenschloss mit 5 Rädchen → STERN.

const CABINET_CODE = '1469';
const DOOR_WORD = 'STERN';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const wagon3 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Der Zug fährt im Kreis. Nach jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt.',
    'Meine Akte ist komplett: In jeder Runde verschwindet im Tunnel ein Fahrgast.',
    'Auf Seite 3 stand: Im Postwagen liegt ein Brief für mich.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 3,
      title: 'Der Postwagen',
      lines: [
        'Der Postwagen. Säcke voller Briefe, und Fächer bis unter die Decke.',
        'Irgendwo hier liegt ein Brief für mich.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    holes: {
      look: (story) => story.say(story.flags.holesSorted
        ? 'Alles einsortiert. Leer bleiben die Fächer I, IV, VI und IX.'
        : 'Vierundzwanzig Fächer, mit römischen Zahlen beschriftet. In manchen liegt Post, viele sind leer.'),
      use: (story) => sortLetters(story),
    },
    bags: {
      look: 'Postsäcke, prall gefüllt. Ganz oben ein Korb mit acht losen Briefen.',
      use: async (story) => {
        await story.say('Acht lose Briefe, jeder mit einem runden Stempel: „Runde 14“, „Runde 3“, „Runde 21“ …');
        await story.say('Die gehören in die Fächer.');
      },
    },
    cabinet: {
      look: (story) => story.say(story.flags.cabinetOpen
        ? 'Der Schrank des Postmeisters. Offen.'
        : 'Der Schrank des Postmeisters. Ein Vorhängeschloss mit vier Zahlen.'),
      use: (story) => openCabinet(story),
    },
    tube: {
      look: 'Eine Rohrpost-Station. Messingrohre führen von hier durch den ganzen Wagen.',
      use: (story) => openTubes(story),
    },
    desk: {
      look: 'Der Schreibtisch des Postmeisters. Stempel, Stempelkissen, eine grüne Lampe.',
      use: async (story) => {
        story.sound('stamp');
        await story.say('Stempel: „Runde“ und eine Zahl zum Drehen. Jeder Brief bekommt hier die Runde, in der er ankam.');
      },
    },
    keypad: { look: 'Ein Tastenfeld. Die Tasten sind verklebt. Das ist nicht das Schloss der Tür.' },
    sorter: { look: 'Ein Briefständer. Leer bis auf Formulare.' },
    door: {
      look: 'Die Tür nach vorne. Ein Buchstabenschloss mit fünf Rädchen.',
      use: (story) => tryDoor(story),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Nur Tunnel.' : 'Schnee und Wald. Der Turm blinkt.'),
      use: (story) => waitForTunnel(story, 'Ich setze mich auf einen Postsack und warte auf den Tunnel …'),
    },
  },

  items: {
    postNote: { look: (story) => readNote(story) },
    cipherLetter: { look: (story) => readLetter(story) },
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
//  1. Fächer
// ============================================================================================

async function sortLetters(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Stempel nicht lesen.');
  if (story.flags.holesSorted) return story.say('Fertig sortiert. Leer bleiben I, IV, VI und IX.');
  const solved = await story.view('arrange', {
    id: 'holes',
    title: 'Die Fächer des Postwagens',
    slots: HOLE_SLOTS,
    tokens: letterTokens(),
    partial: true,
    drawBackground: drawHoles,
    drawToken: drawLetterToken,
    check: checkHoles,
    help: 'Briefe mit gedrückter Maustaste in die Fächer ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  story.flags.holesSorted = true;
  await story.say('Jeder Brief in seiner Runde. Und vier Fächer bleiben leer: Eins, vier, sechs und neun.');
  await story.say('In diesen Runden kam keine Post an. Oder jemand hat sie herausgenommen.');
  story.note('Fächer nach Runden sortiert: leer bleiben I, IV, VI, IX → 1, 4, 6, 9.');
}

// ============================================================================================
//  2. Schrank und Rohrpost
// ============================================================================================

async function openCabinet(story) {
  const f = story.flags;
  if (f.cabinetOpen) return story.say(story.has('postNote') ? 'Leer. Die Dienstanweisung habe ich.' : 'Leer.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Zahlen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'cabinet3',
    digits: 4,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === CABINET_CODE;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(f.holesSorted ? 'Falsch. Die leeren Fächer, der Reihe nach …' : 'Falsch. Der Postmeister hat sich den Code bestimmt irgendwo hier gemerkt.');
    return;
  }
  f.cabinetOpen = true;
  story.sound('unlock');
  await story.say('Eins, vier, sechs, neun. Auf!');
  story.give('postNote');
  await story.say('Eine Dienstanweisung vom Postmeister.');
  await readNote(story);
}

async function readNote(story) {
  story.sound('paper');
  await story.card({ draw: drawPostmasterNote });
  if (story.flags.noteRead) return;
  story.flags.noteRead = true;
  await story.say('Der Brief an J. steckt in der Rohrpost. Leitung 3. Das ist die Station rechts neben der Tür.');
  story.note('Dienstanweisung: Der Brief an J. (Runde 108) steckt in Rohrpost-Leitung 3. Alle vier Weichen müssen gerade stehen – jede dreht ihre Nachbarn mit.');
}

async function openTubes(story) {
  const f = story.flags;
  if (f.letterArrived) return story.say('Die Leitung ist leer. Den Brief habe ich.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Weichen nicht.');
  f.switches ??= [false, true, true, false];
  const state = { open: f.switches, capsule: null };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawTubes(ctx, view.state),
    spots: () => (state.capsule !== null ? [] : [...switchSpots(), { id: 'send', x: 1030, y: 300, w: 80, h: 120, label: 'Rohrpost anfordern' }]),
    area: { x: 150, y: 110, w: 980, h: 500 },
    help: 'Klicken: Weiche drehen  ·  rechts: Rohrpost anfordern  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (spot.id === 'send') {
        if (!f.noteRead) return story.say('Was soll ich anfordern? Ich weiß ja nicht einmal, was in der Leitung steckt.');
        story.sound('hiss');
        const blocked = s.open.findIndex((open) => !open);
        const stop = blocked < 0 ? 1060 : SWITCH_X[blocked];
        for (let x = 220; x <= stop; x += 20) {
          s.capsule = x;
          await story.wait(0.03);
        }
        if (blocked >= 0) {
          await story.say(`Fump … Die Büchse bleibt an Weiche ${blocked + 1} hängen und rutscht zu den Fundsachen.`);
          s.capsule = null;
          return;
        }
        story.sound('thud');
        await story.wait(0.4);
        view.close(true);
        return;
      }
      const i = Number(spot.id.slice(1));
      for (const j of COUPLED[i]) s.open[j] = !s.open[j];
      story.sound('rotate');
    },
  });
  if (state.capsule === 1060 && !f.letterArrived) {
    f.letterArrived = true;
    story.give('cipherLetter');
    await story.say('Fump! Die Büchse ist da. Darin: ein Brief. „An J.“');
    await readLetter(story);
  }
}

// ============================================================================================
//  3. Der verschlüsselte Brief
// ============================================================================================

async function readLetter(story) {
  const f = story.flags;
  const state = { turn: f.turn ?? 0 };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawCipherLetter(ctx, view.state),
    spots: DISK_SPOTS,
    help: 'Pfeile: Chiffrierscheibe drehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      s.turn = (s.turn + (spot.id === 'right' ? 1 : 25)) % 26;
      f.turn = s.turn;
      story.sound('wheel');
      if (s.turn === SHIFT && !f.decoded) {
        f.decoded = true;
        await story.wait(0.3);
        await story.say('Jetzt! Vier Buchstaben zurück – hundertacht Runden sind vier ganze Alphabete und noch vier.');
        await story.say('„Morgen verschwindet jemand. Achte auf die Gläser.“');
        await story.say('„Das Wort für die Tür: Stern.“ Unterschrieben: „Dein J.“');
        story.note('Der Brief an J. (Runde 108, um 4 verschoben): „Morgen verschwindet jemand. Achte auf die Gläser. Das Wort für die Tür: STERN. Dein J.“');
      }
    },
  });
  if (!f.decoded && !f.letterSeen) {
    f.letterSeen = true;
    await story.say('Lauter Buchstabensalat. „Verschiebung: wie die Runde“ – und die Runde ist hundertacht.');
  }
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Buchstaben nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door3',
    digits: 5,
    alphabet: LETTERS,
    check: (code) => {
      tries += 1;
      return code === DOOR_WORD;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(story.flags.decoded ? 'Falsch. S-T-E-R-N …' : 'Falsch. Fünf Buchstaben.');
    return;
  }
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('S-T-E-R-N. Offen.');
    await story.say('„Morgen verschwindet jemand. Achte auf die Gläser.“ Wer schreibt mir diese Briefe – in meiner eigenen Schrift?');
    story.sound('door');
    await finishWagon(story, {
      number: 3,
      title: 'Ende von Wagen 3',
      lines: ['Der Brief an J.: „Morgen verschwindet jemand. Achte auf die Gläser.“'],
      nextTitle: 'im Speisewagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.cabinetOpen) {
    if (!f.holesSorted) {
      return { id: 'holes', lines: [
        'Der Schrank des Postmeisters will vier Ziffern. Und in den Fächern fehlt Post.',
        'Die losen Briefe in die Fächer sortieren: Der Stempel sagt die Runde, das Fach hat die Runde als römische Zahl.',
        'I = 1, V = 5, X = 10. IV = 4, IX = 9, XIV = 14, XIX = 19, XXI = 21. Welche Fächer bleiben am Ende leer?',
      ] };
    }
    return { id: 'cabinet', lines: ['Leer bleiben die Fächer I, IV, VI und IX – das ist der Code für den Schrank: 1469.'] };
  }
  if (!f.letterArrived) {
    return { id: 'tubes', lines: [
      'Der Brief steckt in der Rohrpost – die Station rechts neben der Tür.',
      'Alle vier Weichen müssen gerade stehen. Jede Weiche dreht ihre Nachbarn mit – ausprobieren und mitzählen.',
      'Von krumm-gerade-gerade-krumm aus: Weiche 2 und Weiche 3 je einmal drehen. Dann rechts die Rohrpost anfordern.',
    ] };
  }
  if (!f.decoded) {
    return { id: 'decode', lines: [
      'Der Brief: Rechtsklick auf ihn im Inventar. „Verschiebung: wie die Runde“ – Runde 108.',
      'Das Alphabet hat 26 Buchstaben. 108 geteilt durch 26 … Rest 4. Die Scheibe um 4 drehen.',
    ] };
  }
  return { id: 'door', lines: ['Das Wort für die Tür steht im Brief: STERN.'] };
}
