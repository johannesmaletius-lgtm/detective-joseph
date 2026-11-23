import {
  FILM_ROUND, FOCUS_SPOTS, FOCUS_TARGET, FRAMES, FRAME_SLOTS, blurAmount, drawFilmTable,
  drawFocus, drawFrame, drawFrameScene, drawStill, drawTicket, stillImage,
} from './art/wagon8.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 8 – Das Bordkino (niemand da)
// ============================================================================================
//
// Herr K. ist im Tunnel verschwunden. Im Bordkino läuft „Die letzte Runde“ – gedreht von der
// Kamera im Tunnel.
//
// DIE RÄTSEL
//   1. Eine abgerissene Kinokarte auf einem Sessel, die andere Hälfte ganz unten in der
//      Popcornmaschine. Zusammengesetzt: „Reihe 3, Platz 12“ → Schloss der Filmdose: 312.
//   2. In der Dose: acht auseinandergeschnittene Filmbilder. Der Zug von außen, eine Runde lang:
//      Der Mond wandert von links nach rechts, im letzten Bild fährt der Zug in den Tunnel.
//      Richtig geordnet → Filmrolle.
//   3. Projektor scharf stellen: zwei Zahnräder. Das Objektiv dreht das Bildfenster mit
//      (Objektiv +1 → beide +1, Bildfenster +1 → nur es selbst +2). Ziel: Objektiv 3, Bildfenster 7.
//      Lösung z. B.: Objektiv dreimal (3/3), dann Bildfenster zweimal (3/7).
//   4. Der Film läuft – und das letzte Bild zeigt eine Gestalt mit Josephs Mütze, Brille und
//      Schal, die Herrn K. in den Tunnel führt. Am Filmrand: „Runde 0108“ = Türcode.

const CANISTER_CODE = '312';
const DOOR_CODE = FILM_ROUND;

export const wagon8 = {
  flags: {},
  startItems: ['flashlight', 'knife', 'photo', 'watch', 'coaster'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Herr K. sollte vergiftet werden. Den Wein brachte jemand, der aussieht wie ich.',
    'Barwagen: Der Schaffner rief „Fahrgast K., bitte zum Tunnel“. Herr K. ging freiwillig – „Er bringt uns nach Hause.“ Im Dunkeln war er fort. Ich konnte ihn nicht retten.',
  ],

  setup(story) {
    showScreen(story);
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 8,
      title: 'Das Bordkino',
      lines: [
        'Ein Kino. Im Zug.',
        'Herr K. … Ich stand direkt neben ihm. Und dann war er weg.',
        'Wenn es hier eine Kamera im Tunnel gibt, dann vielleicht auch einen Film davon.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    ticketSeat: {
      look: 'Auf dem Sessel liegt eine halbe Kinokarte. Abgerissen.',
      use: async (story) => {
        story.flags.ticketLeftTaken = true;
        story.give('ticketLeft');
        await story.say('Eine halbe Kinokarte: „Bordkino Ringbahn – Die letzte Runde – Reihe 3 …“ Der Rest fehlt.');
        story.note('Auf einem Kinosessel lag eine halbe Kinokarte: „Reihe 3 …“ – die andere Hälfte fehlt.');
      },
    },
    ticketA: seatTicket('Reihe 1, Platz 4. Entwertet in Runde 105.'),
    ticketB: seatTicket('Reihe 4, Platz 1. Entwertet in Runde 99.'),
    ticketC: seatTicket('Reihe 1, Platz 9. Entwertet in Runde 107. Eine Kinderkarte.'),
    ticketD: seatTicket('Reihe 2, Platz 11. Entwertet in Runde 102.'),

    popcorn: {
      look: 'Eine Popcornmaschine. Das Popcorn darin ist steinhart.',
      use: async (story) => {
        if (story.flags.ticketRightTaken) return story.say('Nur noch hartes Popcorn.');
        await story.say('Ich wühle im Popcorn … ganz unten … da ist was!');
        story.flags.ticketRightTaken = true;
        story.give('ticketRight');
        await story.say('Die andere Hälfte einer Kinokarte. „… Platz 12“.');
      },
    },

    canister: {
      look: (story) => story.say(story.flags.canisterOpen ? 'Die Filmdosen. Offen und leer.' : 'Ein Stapel Filmdosen. Die oberste hat ein Zahlenschloss mit drei Rädchen. Darauf steht: „Nur für den Platz des Vorführers“.'),
      use: (story) => openCanister(story),
      items: { ticket: (story) => openCanister(story), knife: 'Das Blech ist zu dick.' },
    },

    projector: {
      look: (story) => story.say(story.flags.reelLoaded ? 'Der Projektor. Die Filmrolle ist eingelegt.' : 'Ein alter Filmprojektor mit zwei großen Spulen. Leer.'),
      use: (story) => useProjector(story),
      items: {
        reel: (story) => loadReel(story),
        frames: 'Die Bilder sind noch lose. Erst muss ich sie in die richtige Reihenfolge bringen und zusammenkleben.',
      },
    },

    screen: {
      look: (story) => lookScreen(story),
      use: (story) => lookScreen(story),
    },

    door: {
      look: 'Die Tür nach vorne. Ein Tastenfeld mit vier Ziffern.',
      use: (story) => tryDoor(story),
    },
    panel: { look: 'Schalter und Lämpchen. „Saallicht“, „Vorhang“, „Ton“.' },
    seats: {
      look: 'Rote Kinosessel. Auf ein paar liegen Kinokarten.',
      use: 'Ich setze mich nicht. Nicht einschlafen, Joseph.',
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Draußen Schnee. Der Mond, der Turm.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    ticket: {
      look: async (story) => {
        story.sound('paper');
        await story.card({ draw: drawTicket });
        if (!story.flags.ticketRead) {
          story.flags.ticketRead = true;
          story.note('Die Kinokarte, zusammengesetzt: „Die letzte Runde – Reihe 3, Platz 12“.');
        }
      },
    },
    frames: { look: (story) => arrangeFrames(story) },
  },

  async onCombine(story, result) {
    if (result === 'ticket' && !story.flags.ticketRead) {
      story.flags.ticketRead = true; // sonst steht dieselbe Notiz beim Lesen der Karte ein zweites Mal im Notizbuch
      story.note('Die Kinokarte, zusammengesetzt: „Die letzte Runde – Reihe 3, Platz 12“.');
    }
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },
};

function seatTicket(text) {
  return {
    look: 'Eine Kinokarte auf dem Sessel.',
    use: (story) => story.say(`„${text}“ Nicht meine.`),
  };
}

// ============================================================================================
//  Leinwand und Lichtstrahl
// ============================================================================================

// Was auf der Leinwand zu sehen ist: leer, der laufende Film oder das Standbild
function showScreen(story) {
  const f = story.flags;
  story.scene.paintSpot('screen', (ctx, x, y, w, h) => {
    if (f.projecting === undefined) {
      const pale = ctx.createLinearGradient(x, y, x, y + h);
      pale.addColorStop(0, '#5a5b5e');
      pale.addColorStop(1, '#3c3d40');
      ctx.fillStyle = pale;
      ctx.fillRect(x, y, w, h);
      return;
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, w, h);
    if (f.projecting === 'still') {
      const image = stillImage();
      if (image) {
        // mittig zuschneiden (Leinwand ist breiter als das Bild)
        const sh = image.width * (h / w);
        ctx.drawImage(image, 0, (image.height - sh) / 2, image.width, sh, x, y, w, h);
      }
    } else {
      ctx.save();
      ctx.filter = 'grayscale(1)';
      drawFrameScene(ctx, x + w * 0.12, y, w * 0.76, h, f.projecting);
      ctx.restore();
    }
    // Filmkörnung
    ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.random() * 0.04})`;
    ctx.fillRect(x, y, w, h);
  });
  story.scene.paintSpot('beam', (ctx) => {
    if (f.projecting === undefined) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const beam = ctx.createLinearGradient(1080, 468, 640, 150);
    beam.addColorStop(0, 'rgba(255, 245, 220, 0.35)');
    beam.addColorStop(1, 'rgba(255, 245, 220, 0.04)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(1066, 456);
    ctx.lineTo(1066, 482);
    ctx.lineTo(801, 222);
    ctx.lineTo(483, 222);
    ctx.lineTo(483, 87);
    ctx.lineTo(801, 87);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

// ============================================================================================
//  Filmdose und Filmbilder
// ============================================================================================

async function openCanister(story) {
  const f = story.flags;
  if (f.canisterOpen) return story.say('Leer. Die Filmbilder habe ich.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'canister',
    digits: 3,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === CANISTER_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say(story.flags.ticketRead ? 'Falsch. „Nur für den Platz des Vorführers“ … Reihe und Platz?' : '„Nur für den Platz des Vorführers.“ Welcher Platz?');
    }
    return;
  }
  f.canisterOpen = true;
  story.sound('unlock');
  await story.say('Reihe 3, Platz 12. Die Dose ist auf!');
  story.give('frames');
  await story.say('Ein Film – aber zerschnitten. Acht einzelne Bilder, durcheinander.');
  story.note('In der Filmdose (Code 312): acht zerschnittene Filmbilder. Ich muss sie in die richtige Reihenfolge bringen.');
}

async function arrangeFrames(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Bilder nicht.');
  const solved = await story.view('arrange', {
    id: 'frames',
    title: 'Die acht Filmbilder',
    slots: FRAME_SLOTS,
    tokens: FRAMES.map((frame, i) => ({ id: frame.id, label: `Filmbild`, w: 240, h: 150, slot: i })),
    drawBackground: drawFilmTable,
    drawToken: drawFrame,
    check: (placement) => placement.every((id, i) => FRAMES.find((f) => f.id === id).step === i),
    help: 'Bilder mit gedrückter Maustaste auf einen anderen Platz ziehen (sie tauschen)  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!story.flags.framesSeen && !inTunnel(story)) {
      story.flags.framesSeen = true;
      await story.say('Der Zug von außen, bei Nacht. Auf jedem Bild steht der Mond woanders.');
      story.note('Die Filmbilder zeigen den Zug von außen. Auf jedem Bild steht der Mond an einer anderen Stelle – und auf einem fährt der Zug in einen Tunnel.');
    }
    return;
  }
  story.flags.framesDone = true;
  story.game.inventory.replace('frames', 'reel');
  story.sound('combine');
  await story.say('Der Mond wandert von links nach rechts, die Laternen ziehen vorbei – und am Ende der Tunnel. Eine ganze Runde.');
  await story.say('Zusammengeklebt. Jetzt ist es eine Filmrolle.');
  story.note('Die Filmbilder sind geordnet (eine Runde: der Mond wandert von links nach rechts, zuletzt der Tunnel) und zu einer Filmrolle zusammengeklebt.');
}

// ============================================================================================
//  Projektor
// ============================================================================================

async function loadReel(story) {
  story.remove('reel');
  story.flags.reelLoaded = true;
  story.sound('snap');
  await story.say('Rolle auf die Spule, Film durch das Bildfenster … eingefädelt.');
  await useProjector(story);
}

async function useProjector(story) {
  const f = story.flags;
  if (!f.reelLoaded) return story.say('Ohne Film zeigt der Projektor nichts.');
  if (f.filmShown) return story.say('Ich will den Film nicht noch mal sehen.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Räder nicht.');
  f.focus ??= { a: 0, b: 0 };
  f.projecting = 'still';
  story.sound('projector');
  const focused = await story.view('picture', {
    draw: (ctx) => drawFocus(ctx, f.focus, stillImage()),
    spots: FOCUS_SPOTS,
    area: { x: 160, y: 50, w: 960, h: 640 },
    help: 'Räder anklicken: weiterdrehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      story.sound('wheel');
      if (spot.id === 'a') {
        f.focus.a = (f.focus.a + 1) % 8;
        f.focus.b = (f.focus.b + 1) % 8;
      } else {
        f.focus.b = (f.focus.b + 2) % 8;
      }
      if (blurAmount(f.focus) === 0) {
        story.sound('success');
        await story.wait(0.8);
        view.close(true);
      } else if (!f.focusTalk) {
        f.focusTalk = true;
        await story.say('Das große Rad dreht das kleine mit. Und das kleine springt immer zwei Zähne weiter.');
      }
    },
  });
  if (!focused) {
    f.projecting = undefined;
    if (!f.focusTried && !inTunnel(story)) {
      f.focusTried = true;
      await story.say('Alles verschwommen. Ich muss den Projektor scharf stellen.');
      story.note('Projektor: Das Bild ist unscharf. Zwei Räder: Das Objektiv dreht das Bildfenster mit, das Bildfenster springt allein immer zwei weiter.');
    }
    return;
  }
  await playFilm(story);
}

async function playFilm(story) {
  const f = story.flags;
  f.filmShown = true;
  await story.cutscene(async () => {
    story.faceToward({ x: 640, y: 150 });
    story.player.facing = 'back';
    await story.say('Scharf! Der Film läuft …');
    for (let step = 0; step < 8; step++) {
      f.projecting = step;
      story.sound('projector');
      await story.wait(1.3);
    }
    f.projecting = 'still';
    story.sound('dread');
    await story.wait(1.2);
    await story.say('Das ist im Tunnel. Ein alter Mann mit Hut, Mantel und Stock – Herr K.!');
    await story.say('Und neben ihm, Hand in Hand … eine Gestalt mit Mütze, Fliegerbrille und Schal.');
    await story.say('Das … das bin ich.');
    await story.say('Der Täter sieht aus wie ich.');
    await story.wait(0.8);
    story.sound('door');
    await story.say('Hinter mir geht die Tür auf. Schritte. Ich ducke mich zwischen die Sitze.');
    story.sound('footsteps');
    await story.wait(1.2);
    await story.say('Jemand steht im Gang. Ich sehe nur seine Stiefel. Braune Stiefel mit Messingschnallen. Meine Stiefel.');
    await story.say('Er sieht lange zur Leinwand. Dann sagt er leise: „Noch nicht, Junge. Noch nicht.“');
    story.sound('door');
    await story.wait(0.8);
    await story.say('… Weg. Er wusste, dass ich hier bin. Und er hat mich gehen lassen.');
  });
  story.note('Der Film aus dem Tunnel: Eine Gestalt mit meiner Mütze, meiner Fliegerbrille und meinem Schal führt Herrn K. an der Hand in den Tunnel. Der Täter sieht aus wie ich. Danach stand er hinter mir im Kino – „Noch nicht, Junge. Noch nicht.“ Er hat mich gehen lassen.');
}

async function lookScreen(story) {
  if (!story.flags.filmShown) {
    await story.say(story.flags.reelLoaded ? 'Die Leinwand. Der Projektor ist bereit – ich muss ihn nur noch einschalten.' : 'Eine leere Leinwand.');
    return;
  }
  await story.view('picture', { draw: drawStill, spots: [], help: 'Rechtsklick: zurück', backdrop: 0.9 });
  if (!story.flags.edgeRead) {
    story.flags.edgeRead = true;
    await story.say(`Am Filmrand steht etwas: „Kamera Tunnel – Runde ${FILM_ROUND}“.`);
    story.note(`Am Rand des letzten Filmbilds: „Ringbahn · Kamera Tunnel · Runde ${FILM_ROUND}“.`);
  }
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Tasten nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door8',
    digits: 4,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say('Falsch. Vier Ziffern …');
    }
    return;
  }
  if (!story.flags.filmShown) {
    await story.say('Offen. Aber erst will ich wissen, was mit Herrn K. passiert ist.');
    return;
  }
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Runde 108. Die Runde, in der Herr K. verschwand.');
    await story.say('Wer auch immer das ist – er trägt meine Sachen. Ich finde ihn.');
    await finishWagon(story, {
      number: 8,
      title: 'Ende von Wagen 8',
      lines: ['„Der Täter sieht aus wie ich.“'],
      nextTitle: 'im Spiegelwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.canisterOpen) {
    if (!story.has('ticket')) {
      const halves = Number(Boolean(f.ticketLeftTaken)) + Number(Boolean(f.ticketRightTaken));
      if (halves < 2) {
        return { id: `halves${halves}`, lines: [
          'Die Filmdose vorne rechts hat ein Zahlenschloss: „Nur für den Platz des Vorführers“. Auf den Sesseln liegen Kinokarten.',
          f.ticketLeftTaken ? 'Die andere Hälfte der Karte … wo stöbert man im Kino herum? In der Popcornmaschine!' : 'Auf einem Sessel links liegt eine abgerissene Kinokarte.',
        ] };
      }
      return { id: 'combine', lines: ['Die beiden Hälften der Kinokarte zusammensetzen: eine Hälfte im Inventar anklicken, dann die andere.'] };
    }
    return { id: 'canister', lines: ['Auf der Kinokarte stehen Reihe 3 und Platz 12. Das Schloss der Filmdose hat drei Rädchen: 3 – 1 – 2.'] };
  }
  if (!f.framesDone) {
    return { id: 'frames', lines: [
      'Die acht Filmbilder ordnen: Rechtsklick auf die Filmbilder im Inventar.',
      'Eine Runde lang wandert der Mond von links nach rechts. Und am Ende jeder Runde kommt der Tunnel.',
      'Das Bild mit dem Mond ganz links kommt zuerst, das mit dem Tunnel zuletzt.',
    ] };
  }
  if (!f.filmShown) {
    if (!f.reelLoaded) return { id: 'reel', lines: ['Die Filmrolle in den Projektor einlegen: Filmrolle im Inventar anklicken, dann den Projektor.'] };
    return { id: 'focus', lines: [
      'Der Projektor muss scharf gestellt werden. Das große Rad dreht das kleine mit.',
      `Das Bild wird scharf bei Objektiv ${FOCUS_TARGET.a} und Bildfenster ${FOCUS_TARGET.b}. Das Bildfenster allein springt immer zwei weiter.`,
      'Von 0/0 aus: dreimal das Objektiv (3/3), dann zweimal das Bildfenster (3/7).',
    ] };
  }
  if (!f.edgeRead) return { id: 'edge', lines: ['Das letzte Bild auf der Leinwand genauer ansehen – vielleicht steht am Filmrand etwas.'] };
  return { id: 'door', lines: [`Am Filmrand stand „Runde ${FILM_ROUND}“. Die Tür will vier Ziffern.`] };
}

