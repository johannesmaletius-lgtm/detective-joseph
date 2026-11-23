import {
  BOARD, LAYER, PARCEL_SLOTS, STENCIL_SPOTS, cells, checkNames, crateSpots, drawCrates, drawGiftBox, drawNameTag, drawPaddleAndCard,
  drawParcels, drawStencil, hatchFree, nameTokens, ribbonSpots, startCrates, stencilAligned,
} from './art/wagon20.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 20 – Der Packwagen (4. Advent), mit Mira
// ============================================================================================
//
// DIE RÄTSEL
//   1. Geschenkeberg: sechs Pakete ohne Anhänger den Fahrgästen zuordnen (tickt = Tick, klappert wie
//      Löffel = Bruno, Wolle = Ilse, Papier = Moll, Hutschachtel = K., gluckert = Barkeeper).
//      Erst dann redet Mira über ihr eigenes Paket – „das für Papa“. Es ist nicht im Berg.
//   2. Sternen-Geschenkpapier als Schablone auf die Frachtliste legen und richtig verschieben →
//      „Paket für Papa – unter dem Boden“.
//   3. Kisten von der Bodenluke schieben (Schiebepuzzle). Darunter: Miras Paket.
//   4. Fünf Bänder übereinander – nur das oberste lässt sich lösen (rot, gold, blau, weiß, grün).
//      Darin: eine selbstgebastelte Schaffnerkelle (Türcode 2512 in Kinderschrift) und eine Karte.
//
// ERGEBNIS: „Frohe Weihnachten, Papa.“ – „Ich bin siebzehn. Die Kleine ist verrückt.“
// Joseph behält die Kelle (für den 24.).

export const wagon20 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Der Weihnachtszug ist nicht verunglückt – er ist an Weiche 7 abgebogen. Im Führerstand stand jemand mit meiner Mütze.',
    'Den Lok-Schlüssel hat der andere Joseph.',
    'Mira, die Tochter des Schaffners, ist nicht älter geworden. Sie will nicht ohne ihren Papa nach Hause.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 20,
      title: 'Der Packwagen',
      lines: [
        'Geschenke! Ein ganzer Berg. Keins davon ausgepackt.',
        'Und da steht Mira.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    mira: {
      look: 'Mira. Sie hält ihren Stoffhasen fest und sieht mich an, als würde sie auf etwas warten.',
      use: (story) => talkToMira(story),
    },
    gifts: {
      look: 'Ein Berg Geschenke. Die Anhänger sind abgefallen – sie liegen vorne auf dem Boden.',
      use: (story) => sortParcels(story),
    },
    tags: { look: 'Lose Anhänger mit Namen: Tick, Bruno, Ilse, Moll, K. … und der Barkeeper.', use: (story) => sortParcels(story) },
    lectern: {
      look: 'Die Frachtliste auf dem Pult. Lauter Buchstaben – Kürzel, Nummern, Namen.',
      use: (story) => readList(story, false),
      items: { starPaper: (story) => readList(story, true) },
    },
    paper: {
      look: 'Eine Rolle Geschenkpapier. Mit ausgestanzten Sternen.',
      use: async (story) => {
        if (story.has('starPaper')) return story.say('Ein Stück habe ich schon.');
        story.give('starPaper');
        await story.say('Ich reiße ein Stück ab. Die Sterne sind richtige Löcher.');
      },
    },
    crates: {
      look: (story) => story.say(story.flags.hatchOpen ? 'Die Kisten stehen jetzt neben der Luke.' : 'Kisten, eng nebeneinander. Darunter sehe ich den Rand einer Bodenluke.'),
      use: (story) => moveCrates(story),
    },
    speaker: { look: 'Ein Lautsprecher. Still.' },
    door: { look: 'Die Tür nach vorne. Ein Zahlenschloss mit vier Rädchen.', use: (story) => tryDoor(story) },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Lichterketten spiegeln sich im Fenster.'),
      use: (story) => waitForTunnel(story),
    },
  },

  items: {
    giftBox: { look: (story) => untie(story) },
    paddle: { look: (story) => story.card({ draw: drawPaddleAndCard }) },
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
//  Mira
// ============================================================================================

async function talkToMira(story) {
  const f = story.flags;
  if (f.opened) {
    await story.speakAs('mira', 'Frohe Weihnachten, Papa.');
    return;
  }
  if (!f.parcelsSorted) {
    if (!f.metMira) {
      f.metMira = true;
      await story.speakAs('mira', 'Da bist du ja endlich!');
      await story.say('Ich? Kennen wir uns?');
      await story.speakAs('mira', 'Alle haben ihre Anhänger verloren. Jetzt weiß keiner mehr, welches Geschenk wem gehört.');
      await story.speakAs('mira', 'Wenn alle wieder ihr Geschenk haben, zeig ich dir meins. Versprochen.');
      story.note('Mira im Packwagen: Die Anhänger der Geschenke sind abgefallen. Wenn jedes Paket wieder seinen Namen hat, zeigt sie mir ihr eigenes Geschenk.');
      return;
    }
    await story.speakAs('mira', 'Erst die Anhänger! Du hast es versprochen.');
    return;
  }
  if (!f.miraTold) {
    f.miraTold = true;
    await story.speakAs('mira', 'Jetzt hat jeder wieder seins. Danke!');
    await story.speakAs('mira', 'Meins ist nicht da oben. Ich hab es versteckt, damit es keiner aufmacht. Es ist für Papa.');
    await story.speakAs('mira', 'Wo, steht auf der Frachtliste. Aber nur, wenn man mit Sternen guckt.');
    story.note('Miras Geschenk „für Papa“ ist versteckt. Wo, steht auf der Frachtliste – „wenn man mit Sternen guckt“.');
    return;
  }
  await story.speakAs('mira', f.hatchOpen ? 'Mach es auf! Aber vorsichtig – die Bänder!' : 'Mit Sternen gucken!');
}

// ============================================================================================
//  1. Pakete
// ============================================================================================

async function sortParcels(story) {
  const f = story.flags;
  if (f.parcelsSorted) return story.say('Jedes Paket hat wieder seinen Anhänger.');
  if (inTunnel(story)) return story.say('Im Dunkeln lese ich keine Namen.');
  const solved = await story.view('arrange', {
    id: 'parcels20',
    title: 'Wem gehört welches Paket?',
    slots: PARCEL_SLOTS,
    tokens: nameTokens(),
    drawBackground: drawParcels,
    drawToken: drawNameTag,
    check: checkNames,
    help: 'Anhänger mit gedrückter Maustaste unter die Pakete ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) return;
  f.parcelsSorted = true;
  await story.say('Tick tickt, Brunos Paket klappert, Ilses ist weich, Molls raschelt, K.s ist eine Hutschachtel, und beim Barkeeper gluckert es.');
  await story.speakAs('mira', 'Richtig! Alle!');
  story.note('Alle Pakete haben wieder ihre Anhänger. Mira will mir jetzt ihr Geschenk zeigen.');
}

// ============================================================================================
//  2. Frachtliste und Schablone
// ============================================================================================

async function readList(story, withStencil) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nicht lesen.');
  if (f.listRead) return story.say('„Paket für Papa – unter dem Boden.“');
  const state = { dx: 0, dy: 0, laid: withStencil };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawStencil(ctx, view.state),
    spots: () => (state.laid ? STENCIL_SPOTS : []),
    area: { x: 170, y: 70, w: 940, h: 560 },
    help: state.laid ? 'Pfeile: Schablone verschieben  ·  Rechtsklick: zurück' : 'Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (spot.id === 'left') s.dx = Math.max(-1, s.dx - 1);
      if (spot.id === 'right') s.dx = Math.min(1, s.dx + 1);
      if (spot.id === 'up') s.dy = Math.max(-1, s.dy - 1);
      if (spot.id === 'down') s.dy = Math.min(1, s.dy + 1);
      story.sound('paper');
      if (stencilAligned(s)) {
        await story.wait(0.5);
        await story.say('Jetzt! Durch die Sterne: „Paket für Papa – unter dem Boden.“');
        f.listRead = true;
        story.note('Sternen-Schablone auf der Frachtliste: „PAKET FÜR PAPA – UNTER DEM BODEN“.');
        view.close(true);
      }
    },
  });
  if (!withStencil && !f.listRead) {
    await story.say('Buchstabensalat. „Mit Sternen gucken“, hat Mira gesagt …');
  }
}

// ============================================================================================
//  3. Kisten über der Luke
// ============================================================================================

async function moveCrates(story) {
  const f = story.flags;
  if (f.hatchOpen) return story.say(story.has('giftBox') || f.opened ? 'Die Luke ist leer.' : 'Die Luke ist frei.');
  if (inTunnel(story)) return story.say('Im Dunkeln quetsche ich mir die Finger.');
  if (!f.listRead) return story.say('Schwere Kisten. Warum sollte ich die herumschieben?');
  f.crates ??= startCrates();
  const state = { crates: f.crates };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawCrates(ctx, view.state),
    spots: () => crateSpots(state.crates),
    area: { x: BOARD.x - 30, y: BOARD.y - 30, w: BOARD.cell * 5 + 60, h: BOARD.cell * 5 + 90 },
    help: 'Klicken: Kiste schieben  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const crate = view.state.crates.find((c) => c.id === spot.id);
      const mouse = view.mouse;
      const forward = crate.dir === 'h' ? mouse.x > spot.x + spot.w / 2 : mouse.y > spot.y + spot.h / 2;
      const step = forward ? 1 : -1;
      const moved = { ...crate, col: crate.col + (crate.dir === 'h' ? step : 0), row: crate.row + (crate.dir === 'v' ? step : 0) };
      const inside = cells(moved).every(([x, y]) => x >= 0 && y >= 0 && x < 5 && y < 5);
      const free = cells(moved).every(([x, y]) => !view.state.crates.some((c) => c !== crate && cells(c).some(([cx, cy]) => cx === x && cy === y)));
      if (!inside || !free) {
        story.sound('thud');
        return;
      }
      Object.assign(crate, moved);
      story.sound('slide');
      if (hatchFree(view.state.crates)) {
        await story.wait(0.6);
        view.close(true);
      }
    },
  });
  if (!done) return;
  f.hatchOpen = true;
  story.sound('creak');
  await story.say('Die Luke ist frei! Ich ziehe sie auf …');
  story.give('giftBox');
  await story.say('Ein kleines Paket. „Für Papa“. Mit fünf bunten Bändern.');
  await story.speakAs('mira', 'Das ist meins! Mach es auf!');
}

// ============================================================================================
//  4. Die Bänder
// ============================================================================================

async function untie(story) {
  const f = story.flags;
  if (f.opened) return story.say('Leer. Die Kelle und die Karte habe ich.');
  f.ribbons ??= [...LAYER];
  const state = { left: f.ribbons };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawGiftBox(ctx, view.state),
    spots: () => ribbonSpots(state.left),
    area: { x: 280, y: 90, w: 720, h: 560 },
    help: 'Klicken: Band lösen (nur das oberste geht)  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (s.left[0] !== spot.id) {
        story.sound('wrong');
        await story.say('Es klemmt. Da liegt noch ein anderes Band drüber.');
        return;
      }
      s.left.shift();
      story.sound('paper');
      if (!s.left.length) {
        await story.wait(0.4);
        view.close(true);
      }
    },
  });
  if (!done) return;
  f.opened = true;
  story.remove('giftBox');
  story.give('paddle');
  await story.say('Alle fünf Bänder ab. Darin: eine Kelle aus Pappe, rot und weiß. Und eine Karte.');
  await story.card({ draw: drawPaddleAndCard });
  await story.cutscene(async () => {
    await story.say('„Für Papa. Damit du uns nach Hause bringst. Deine Mira.“');
    await story.say('Auf der Kelle steht in Kinderschrift: zwei, fünf, eins, zwei.');
    await story.speakAs('mira', 'Frohe Weihnachten, Papa.');
    await story.say('Papa? Ich bin siebzehn. Ich kann niemandes Vater sein.');
    await story.say('Die Kleine ist verrückt.');
    await story.speakAs('mira', 'Behalt sie. Du brauchst sie noch.');
  });
  story.note('In Miras Paket: eine selbstgebastelte Schaffnerkelle (darauf „2512“) und eine Karte: „Für Papa. Damit du uns nach Hause bringst. Deine Mira.“ Sie hat „Frohe Weihnachten, Papa“ zu mir gesagt. Ich behalte die Kelle.');
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  const opened = await tryCode(story, {
    id: 'door20', code: '2512',
    wrong: (s) => (s.flags.opened ? 'Falsch. Was steht auf der Kelle?' : 'Falsch. Vier Ziffern.'),
  });
  if (!opened) return;
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Zwei, fünf, eins, zwei. Der fünfundzwanzigste Zwölfte. Der erste Weihnachtstag – da wollten sie zusammen zu Hause sein.');
    await story.speakAs('mira', 'Bis bald, Papa!');
    story.sound('door');
    await finishWagon(story, {
      number: 20,
      title: 'Ende von Wagen 20',
      lines: ['Mira: „Frohe Weihnachten, Papa.“ Joseph: „Ich bin siebzehn. Die Kleine ist verrückt.“', 'Er behält Miras Kelle.'],
      nextTitle: 'im Kesselwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.metMira) return { id: 'mira', lines: ['Mit Mira reden.'] };
  if (!f.parcelsSorted) {
    return { id: 'parcels', lines: [
      'Die Anhänger unter die passenden Pakete. Wer hat mir unterwegs was gezeigt? Uhren, Löffel, Wolle, Noten, ein Hut, Flaschen …',
      'Genau hinsehen: ein Kästchen mit Aufziehloch, eine Löffelspitze, ein grüner Wollfaden, Notenlinien an der Ecke, eine runde Schachtel, ein Flaschenhals. Ein Anhänger bleibt übrig.',
      'Aufziehloch = Herr Tick, Löffel = Bruno, Wolle = Ilse, Notenblatt = Moll, Hutschachtel = Herr K., Flasche = Barkeeper. Der Heizer bekommt hier nichts.',
    ] };
  }
  if (!f.miraTold) return { id: 'mira2', lines: ['Mira noch einmal ansprechen.'] };
  if (!f.listRead) {
    return { id: 'stencil', lines: [
      '„Mit Sternen gucken“: Die Rolle Geschenkpapier rechts hat ausgestanzte Sterne.',
      'Ein Stück Sternenpapier nehmen und auf die Frachtliste am Pult legen (Papier anklicken, dann das Pult). Dann verschieben, bis Wörter erscheinen.',
      'Die Schablone um eins nach rechts schieben.',
    ] };
  }
  if (!f.hatchOpen) {
    return { id: 'crates', lines: [
      'Unter dem Boden: Unter den Kisten rechts ist eine Bodenluke. Die Kisten müssen von der Luke weg.',
      'Die lange Kiste auf der Luke muss nach rechts – dafür muss die stehende Kiste daneben nach oben. Und dafür muss erst Platz darüber sein.',
      'Die stehende Kiste ganz links oben nach oben, die liegende in der Mitte nach links, die stehende über der Luke-Kiste zweimal nach oben, dann die Kiste auf der Luke zweimal nach rechts.',
    ] };
  }
  if (!f.opened) return { id: 'ribbons', lines: ['Miras Paket ansehen (Rechtsklick im Inventar). Nur das oberste Band geht ab: rot, dann gold, blau, weiß, grün.'] };
  return { id: 'door', lines: ['Auf der Kelle steht der Code: 2512.'] };
}
