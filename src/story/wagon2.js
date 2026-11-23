import { PILE_X, TAG_ORDER, TAG_SLOTS, drawPage1, drawPages23, drawScale, drawSign, drawStack, drawTag, drawTagBoard, pileSpots, tagTokens } from './art/wagon2.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 2 – Der Gepäckwagen (ohne Person)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Zwölf Kofferanhänger nach Abfahrtszeit ordnen → Anfangsbuchstaben: WEICHE SIEBEN.
//   2. Grüner Koffer mit Buchstabenschloss (6 Rädchen) → WEICHE. Darin Seite 1 der Akte:
//      Seiten 2 und 3 liegen im untersten Koffer des Stapels; Code der Tür = sein Gewicht.
//   3. Kofferstapel umschichten (Türme von Hanoi, 5 Koffer, zwei Kreidefelder, nie groß auf klein).
//      Nach jedem Tunnel steht der Stapel wieder wie vorher.
//   4. Den untersten Koffer auf die Gepäckwaage: 24,7 kg → Türcode 247. Im Koffer: Seiten 2 und 3.
//
// ERGEBNIS: Die Akte ist komplett – „In jeder Runde verschwindet im Tunnel ein Fahrgast.“

const DOOR_CODE = '247';
const CASE_WEIGHT = 24.7;
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const wagon2 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Ich bin in einem Nachtzug aufgewacht, der im Kreis fährt. Nach jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt.',
    'Im ersten Abteil lag meine eigene Akte. Die Hälfte der Seiten fehlt.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 2,
      title: 'Der Gepäckwagen',
      lines: [
        'Der Gepäckwagen. Koffer, Kisten, Anhänger … und niemand da.',
        'Meine Akte ist halb leer. Vielleicht finde ich hier, was fehlt.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    tags: {
      look: 'Ein Brett mit zwölf Kofferanhängern. Städte und Abfahrtszeiten – alles durcheinander.',
      use: (story) => sortTags(story),
    },
    sign: {
      look: async (story) => {
        await story.card({ draw: drawSign });
        await story.say('„Anhänger nach Abfahrt aufhängen – frühe zuerst.“');
      },
    },
    greenCase: {
      look: (story) => story.say(story.flags.greenOpen
        ? 'Der grüne Koffer. Offen und leer.'
        : 'Ein grüner Koffer mit einem Buchstabenschloss. Sechs Rädchen.'),
      use: (story) => openGreenCase(story),
    },
    stack: {
      look: (story) => story.say(story.flags.caseFree
        ? 'Der Stapel ist umgeschichtet.'
        : 'Fünf Koffer übereinander. Der größte ganz unten, die kleinsten oben.'),
      use: (story) => restack(story),
      items: { heavyCase: 'Den schleppe ich nicht wieder zurück.' },
    },
    chalk: {
      look: 'Zwei Rechtecke aus Kreide auf dem Boden. Abstellplätze für Gepäck.',
      use: (story) => restack(story),
    },
    scale: {
      look: 'Eine große Gepäckwaage. Die Nadel steht auf null.',
      use: (story) => openScale(story, false),
      items: { heavyCase: (story) => openScale(story, true) },
    },
    panel: { look: 'Ein Schaltkasten. Nur Sicherungen, nichts Spannendes.' },
    shelves: {
      look: 'Regale voller Koffer und Kisten. Hunderte. Ohne Hinweis suche ich hier ewig.',
      use: 'Hier wühle ich nicht blind herum. Ich brauche einen Hinweis.',
    },
    boxes: { look: 'Kisten bis unter die Decke.' },
    door: {
      look: 'Die Tür nach vorne. Ein Zahlenschloss mit drei Rädchen.',
      use: (story) => tryDoor(story),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnelwand. Schwarz.' : 'Schnee, Wald – und der Turm mit dem roten Licht.'),
      use: (story) => waitForTunnel(story, 'Ich setze mich auf eine Kiste und warte auf den Tunnel …'),
    },
  },

  items: {
    filePage: { look: (story) => readPage1(story) },
    filePages: { look: (story) => readPages23(story) },
    heavyCase: { look: (story) => openHeavyCase(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      return;
    }
    // Der Stapel steht wieder wie vorher – es sei denn, Joseph trägt den untersten Koffer bei sich
    const f = story.flags;
    if (f.piles && !f.caseFree) {
      f.piles = null;
      f.moves = 0;
      await story.idle();
      await story.say('Der Kofferstapel … steht wieder genau wie vorher. Alles zurückgesprungen.');
      if (!f.stackResetSaid) {
        f.stackResetSaid = true;
        story.note('Nach dem Tunnel steht der Kofferstapel wieder wie vorher. Ich muss ihn in einer Runde schaffen.');
      }
    }
  },
};

// ============================================================================================
//  1. Kofferanhänger
// ============================================================================================

async function sortTags(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Zeiten nicht lesen.');
  if (story.flags.tagsSorted) {
    await story.say('Nach Abfahrt geordnet: W, E, I, C, H, E – S, I, E, B, E, N.');
    return story.say('„Weiche sieben“. Was auch immer das heißen soll.');
  }
  const solved = await story.view('arrange', {
    id: 'tags',
    title: 'Kofferanhänger',
    slots: TAG_SLOTS,
    tokens: tagTokens(),
    drawBackground: drawTagBoard,
    drawToken: drawTag,
    check: (placement) => placement.every((id, i) => id === TAG_ORDER[i]),
    help: 'Anhänger mit gedrückter Maustaste auf die Haken ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  story.flags.tagsSorted = true;
  await story.say('Die frühen zuerst … Wien, Essen, Innsbruck, Chur, Hamburg, Erfurt, Stuttgart …');
  await story.say('Die Anfangsbuchstaben! W-E-I-C-H-E. S-I-E-B-E-N.');
  await story.say('„Weiche sieben“? Eine Weiche ist da, wo sich Gleise teilen. Aber dieser Zug fährt doch nur im Kreis …');
  story.note('Die Kofferanhänger nach Abfahrt geordnet: WEICHE SIEBEN. (Sechs und sechs Buchstaben.)');
}

// ============================================================================================
//  2. Grüner Koffer
// ============================================================================================

async function openGreenCase(story) {
  const f = story.flags;
  if (f.greenOpen) {
    if (!story.has('filePage') && !f.pageRead) return story.say('Leer.');
    return story.say('Leer. Die Aktenseite habe ich.');
  }
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Buchstaben nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'greenCase',
    digits: 6,
    style: 'steel',
    alphabet: LETTERS,
    check: (code) => {
      tries += 1;
      return code === 'WEICHE';
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(f.tagsSorted ? 'Falsch. Sechs Buchstaben … das erste Wort von den Anhängern?' : 'Falsch. Sechs Buchstaben. Irgendwo hier steht bestimmt ein Wort.');
    return;
  }
  f.greenOpen = true;
  story.sound('unlock');
  await story.say('W-E-I-C-H-E. Klick!');
  story.give('filePage');
  await story.say('Ein Blatt Papier. „Akte J. – Seite 1“. Das ist eine Seite aus meiner Akte!');
  await readPage1(story);
}

async function readPage1(story) {
  story.sound('paper');
  await story.card({ draw: drawPage1 });
  if (story.flags.pageRead) return;
  story.flags.pageRead = true;
  await story.say('Meine Schrift. „Ich bin du – nur ein paar Runden früher.“');
  await story.say('Also: den untersten Koffer aus dem Stapel holen, ohne einen großen auf einen kleinen zu stellen. Und ihn wiegen.');
  story.note('Aktenseite 1: Seiten 2 und 3 liegen im untersten Koffer des Stapels. Nie einen größeren Koffer auf einen kleineren stellen, nur die zwei Kreidefelder sind frei. Türcode = Gewicht des untersten Koffers, ohne Komma.');
}

// ============================================================================================
//  3. Kofferstapel
// ============================================================================================

function freshPiles() {
  return [[5, 4, 3, 2, 1], [], []];
}

async function restack(story) {
  const f = story.flags;
  if (f.caseFree) return story.say('Den untersten Koffer habe ich schon.');
  if (inTunnel(story)) return story.say('Im Dunkeln lasse ich womöglich etwas fallen.');
  if (!f.pageRead && !f.stackTried) {
    f.stackTried = true;
    await story.say('Einfach so in fremdem Gepäck wühlen? Erst will ich wissen, wonach ich suche.');
    return;
  }
  f.piles ??= freshPiles();
  f.moves ??= 0;
  const state = { piles: f.piles, held: null, moves: f.moves };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawStack(ctx, view.state),
    spots: pileSpots(),
    area: { x: 80, y: 80, w: 1120, h: 580 },
    help: 'Klicken: obersten Koffer nehmen, dann auf einen anderen Platz klicken  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      const i = Number(spot.id.slice(4));
      if (!s.held) {
        if (!s.piles[i].length) return;
        s.held = { from: i, size: s.piles[i].pop() };
        story.sound('pickup');
        return;
      }
      const top = s.piles[i].at(-1);
      if (top !== undefined && top < s.held.size) {
        s.piles[s.held.from].push(s.held.size);
        s.held = null;
        story.sound('wrong');
        await story.say('Nein! Der größere Koffer würde den kleinen zerdrücken. „Glas!“');
        return;
      }
      s.piles[i].push(s.held.size);
      if (i !== s.held.from) s.moves += 1;
      s.held = null;
      story.sound('thud');
      f.moves = s.moves;
      // Liegt auf dem untersten Koffer nichts mehr?
      if (s.piles[0].length === 1 && s.piles[0][0] === 5) {
        await story.wait(0.4);
        view.close(true);
      }
    },
  });
  // Koffer, der noch in der Hand war, zurücklegen
  if (state.held) state.piles[state.held.from].push(state.held.size);
  if (state.piles[0].length === 1 && state.piles[0][0] === 5 && !f.caseFree) {
    f.caseFree = true;
    story.give('heavyCase');
    await story.say(`Geschafft – in ${state.moves} Zügen! Der unterste Koffer ist frei.`);
    await story.say('Uff, ist der schwer. Mal sehen, was er wiegt.');
    story.note('Den untersten Koffer aus dem Stapel geholt.');
  }
}

// ============================================================================================
//  4. Waage und Koffer
// ============================================================================================

async function openScale(story, withCase) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Skala nicht lesen.');
  const state = { shown: 0, loaded: withCase, target: withCase ? CASE_WEIGHT : 0 };
  if (withCase) story.sound('thud');
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawScale(ctx, view.state),
    spots: [],
    area: { x: 240, y: 40, w: 800, h: 640 },
    update: (dt, view) => {
      const s = view.state;
      s.shown += (s.target - s.shown) * Math.min(1, dt * 2.2);
    },
    help: 'Rechtsklick: zurück',
  });
  if (!withCase) return story.say(story.has('heavyCase') ? 'Leer zeigt sie null. Ich muss den Koffer drauflegen.' : 'Null Kilo. Ich müsste etwas drauflegen.');
  await story.say('Vierundzwanzig Komma sieben Kilo.');
  if (!story.flags.weighed) {
    story.flags.weighed = true;
    await story.say('„Sein Gewicht ist der Code – ohne Komma.“ Also zwei, vier, sieben.');
    story.note('Der unterste Koffer wiegt 24,7 kg → Türcode 247.');
  }
}

async function openHeavyCase(story) {
  if (story.flags.pagesFound) return story.say('Der Koffer ist leer. Die Seiten habe ich.');
  story.sound('unlock');
  await story.say('Die Schnallen gehen auf. Ganz unten, unter alten Decken …');
  story.flags.pagesFound = true;
  story.give('filePages');
  await story.say('Zwei Seiten. Seite 2 und Seite 3!');
  await readPages23(story);
}

async function readPages23(story) {
  story.sound('paper');
  await story.card({ draw: drawPages23 });
  if (story.flags.pagesRead) return;
  story.flags.pagesRead = true;
  await story.say('„In jeder Runde verschwindet im Tunnel ein Fahrgast.“');
  await story.say('Das habe ich geschrieben? Ich erinnere mich an nichts davon.');
  story.note('Aktenseiten 2 und 3: IN JEDER RUNDE VERSCHWINDET IM TUNNEL EIN FAHRGAST. Im Postwagen liegt ein Brief für mich.');
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door2',
    digits: 3,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(story.flags.weighed ? 'Falsch. Zwei, vier, sieben …' : 'Falsch. Drei Ziffern – ich habe noch keine Ahnung, welche.');
    return;
  }
  await ending(story);
}

async function ending(story) {
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Zwei, vier, sieben. Offen!');
    if (!story.flags.pagesRead) {
      await story.say('Halt – erst sehe ich nach, was im Koffer ist.');
      if (story.has('heavyCase')) await openHeavyCase(story);
    }
    await story.say('Meine Akte ist jetzt vollständig. Und sie sagt: Jede Runde verschwindet jemand.');
    await story.say('Wenn das stimmt … dann passiert es heute Nacht wieder.');
    story.sound('door');
    await finishWagon(story, {
      title: 'Ende von Wagen 2',
      lines: ['Die Akte ist komplett: In jeder Runde verschwindet im Tunnel ein Fahrgast.'],
      nextTitle: 'im Postwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.greenOpen) {
    if (!f.tagsSorted) {
      return { id: 'tags', lines: [
        'Der grüne Koffer will ein Wort mit sechs Buchstaben. Das Brett mit den Anhängern links sieht nach einem Rätsel aus.',
        'Das Schild neben der Tür sagt: Anhänger nach Abfahrt aufhängen – frühe zuerst.',
        'Die Anhänger nach Uhrzeit sortieren, die früheste nach links. Dann die Anfangsbuchstaben lesen.',
      ] };
    }
    return { id: 'green', lines: ['WEICHE SIEBEN – sechs Buchstaben für den grünen Koffer: WEICHE.'] };
  }
  if (!f.caseFree) {
    return { id: 'stack', lines: [
      'Seite 1 sagt: Die fehlenden Seiten liegen im untersten Koffer des Stapels.',
      'Immer nur den obersten Koffer bewegen, nie einen größeren auf einen kleineren. Platz: der Stapel und zwei Kreidefelder.',
      'Erst die drei kleinsten Koffer auf ein Kreidefeld bringen (das braucht sieben Züge), dann den vierten auf das andere Feld.',
      'Klein auf Feld rechts, mittel auf Feld links, klein auf mittel. Dritter auf Feld rechts. Klein auf den Stapel, mittel auf Feld rechts, klein auf Feld rechts. Dann den vierten auf Feld links.',
    ] };
  }
  if (!f.weighed) return { id: 'weigh', lines: ['Den Koffer wiegen: Koffer im Inventar anklicken, dann die Gepäckwaage.'] };
  if (!f.pagesRead) return { id: 'pages', lines: ['Was ist im Koffer? Rechtsklick auf den Koffer im Inventar.'] };
  return { id: 'door', lines: ['24,7 kg, ohne Komma: 247 – das ist der Code für die Tür.'] };
}
