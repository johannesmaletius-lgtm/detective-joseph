import {
  FIGURES, FIGURE_SLOTS, MINI, MINI_SLOTS, MINI_TOKENS, drawDollhouseInside, drawFigure, drawMini, drawMiraDrawing,
  drawRailwayTable, drawToyGlow, figuresCorrect,
} from './art/wagon15.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 15 – Das Spielzimmer, Mira
// ============================================================================================
//
// Mira ist sieben – und das schon sehr lange. Sie ist die Tochter des Schaffners.
//
// DIE RÄTSEL
//   1. „Ich sehe was, was du nicht siehst“ – drei Runden: die Trommel („rot und rund und macht
//      Bumm“), das Schaukelpferd („es reitet und reitet und kommt nie an“), das Fenster („dunkel,
//      alle gehen hinein, keiner kommt heraus“ – nicht der Spielzeugtunnel, der echte draußen).
//   2. Die Modellbahn: 14 Mini-Wagen in der Reihenfolge der Wagen 1–14 hinter die Lok setzen
//      (Zeichen in den Fensterchen: Bank, Koffer, Brief … Kreuz, Zeitung). Dann fährt die Bahn in
//      den Spielzeugtunnel und hält; darin ein kleiner roter Schlüssel.
//   3. Puppenhaus-Bahnhof: Figuren aufstellen wie in jener Nacht (Pressefoto/Zeitung): der
//      Schaffner auf den Bahnsteig, Frau und Mädchen in den Zug. Koch und Hund gehören nicht dazu.
//      Im Fach: Miras Zeichnung. Rückseite: „Die Tür-Geheimzahl ist Heiligabend!“ → 2412.

const DOOR_CODE = '2412';
const ISPY = [
  { answer: 'drum', clue: '… und das ist rot und rund und macht BUMM.', wrong: 'Nein! Rot und rund und BUMM!' },
  { answer: 'horse', clue: '… und das reitet und reitet und kommt nie an.', wrong: 'Nein! Es reitet und reitet und kommt nie an. Wie wir.' },
  { answer: 'window', clue: '… und das ist ganz dunkel. Da gehen alle hinein, und keiner kommt wieder heraus.', wrong: 'Nein. Dunkel. Alle gehen hinein. Keiner kommt heraus.' },
];

export const wagon15 = {
  flags: {},
  startItems: ['flashlight', 'gear', 'familyPhoto', 'pressPhoto'],
  recap: [
    'Jede Runde verschwindet ein Fahrgast. Eine Gestalt mit meinen Sachen führt sie in den Tunnel. Der Schaffner ruft sie.',
    'Kapelle: Alle Fahrgäste saßen in der Weihnachtsnacht in diesem Zug. Auf der Gedenktafel stehen auch Mira und J. Das Familienfoto zeigt den Schaffner mit Frau und Tochter.',
    'Zeitung vom 25.12.: „Weihnachtszug im Tunnel verschollen.“ Frau und Tochter des Schaffners waren im Zug, er selbst wartete am Bahnsteig. Er lief in der Nacht allein in den Tunnel und wird seitdem vermisst.',
    'Der Tunnel: fünfzehn Ticks. Jedes Mal bleibt es ein bisschen länger dunkel.',
  ],

  setup(story) {
    story.scene.paintSpot('toys', (ctx) => drawToyGlow(ctx, story.flags.trainRan, story.motion.time));
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 15,
      title: 'Das Spielzimmer',
      lines: [
        'Ein Spielzimmer. Puppen, eine Modellbahn, ein Schaukelpferd …',
        'Und ein kleines Mädchen mit einem Stoffhasen.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    mira: {
      look: 'Ein Mädchen, vielleicht sieben. Zöpfe, grünes Kleid – und ein Stoffhase im Arm. Wie auf dem Familienfoto.',
      use: (story) => talkMira(story),
      items: {
        familyPhoto: (story) => showPhotoToMira(story),
        pressPhoto: 'Mira: „Das ist Papa! Am Bahnhof. Er wartet auf uns.“',
        drawing: 'Mira: „Die ist für dich. Behalte sie.“',
      },
    },
    drum: spot('drum', 'Eine rote Kindertrommel.', 'Bumm. Bumm-bumm.'),
    horse: spot('horse', 'Ein Schaukelpferd mit roter Satteldecke.', 'Es schaukelt. Und schaukelt.'),
    window: {
      look: (story) => ispyOr(story, 'window', () => story.say(story.isDark ? 'Draußen der Tunnel. Schwarz.' : 'Draußen Schnee. Irgendwo vorne ist der Tunnel.')),
      use: (story) => ispyOr(story, 'window', () => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …')),
    },
    toyTunnel: {
      look: (story) => ispyOr(story, 'toyTunnel', () => story.say(story.flags.keyTaken ? 'Der Spielzeugtunnel. Leer.' : story.flags.trainRan ? 'Die Bahn steht im Tunnel. Da drin glänzt etwas!' : 'Ein Tunnel aus Pappmaché, mit Flicken bemalt.')),
      use: (story) => ispyOr(story, 'toyTunnel', () => takeToyKey(story)),
    },
    railway: {
      look: (story) => ispyOr(story, 'railway', () => story.say('Eine Modellbahn mit Lok und Bergen. Vierzehn kleine Wagen stehen kreuz und quer.')),
      use: (story) => ispyOr(story, 'railway', () => railway(story)),
    },
    dolls: { look: (story) => ispyOr(story, 'dolls', () => story.say('Zwei Puppen mit Zöpfen.')) },
    teddy: { look: (story) => ispyOr(story, 'teddy', () => story.say('Ein Teddy mit roter Schleife.')) },
    plush: { look: (story) => ispyOr(story, 'plush', () => story.say('Ein Hase, eine Katze, ein Hund. Der Hase sieht aus wie der in Miras Arm.')) },
    books: { look: (story) => ispyOr(story, 'books', () => story.say('Kinderbücher. „Die kleine Lok“, „Weihnachten im Schnee“.')) },
    desk: { look: (story) => ispyOr(story, 'desk', () => story.say('Ein Kindertisch mit Buntstiften. Daran hat Mira gemalt.')) },
    wallLamp: { look: (story) => ispyOr(story, 'wallLamp', () => story.say('Eine Wandlampe.')) },
    dollhouse: {
      look: (story) => ispyOr(story, 'dollhouse', () => story.say(story.flags.houseOpen ? 'Der Puppenhaus-Bahnhof. Die Vorderwand ist offen.' : 'Ein Puppenhaus – ein kleiner Bahnhof mit Uhr. Die Vorderwand hat ein Schlüsselloch.')),
      use: (story) => ispyOr(story, 'dollhouse', () => dollhouse(story)),
      items: { toyKey: (story) => openDollhouse(story) },
    },
    top: { look: (story) => ispyOr(story, 'top', () => story.say('Ein bunter Kreisel.')) },
    blocks: { look: (story) => ispyOr(story, 'blocks', () => story.say('Bauklötze.')) },
    boxes: { look: (story) => ispyOr(story, 'boxes', () => story.say('Spielzeugkisten.')) },
    shelfTop: { look: (story) => ispyOr(story, 'shelfTop', () => story.say('Kisten auf der Ablage.')) },
    door: {
      look: (story) => ispyOr(story, 'door', () => story.say('Die Tür nach vorne. Ein Zahlenschloss mit vier Ziffern.')),
      use: (story) => ispyOr(story, 'door', () => tryDoor(story)),
    },
  },

  items: {
    drawing: { look: (story) => showDrawing(story) },
    pressPhoto: { look: 'Die Zeitung vom 25. Dezember. Auf dem Foto: der Schaffner allein auf dem Bahnsteig. Seine Frau und seine Tochter saßen im Zug.' },
    familyPhoto: { look: 'Das Familienfoto: der junge Schaffner, seine Frau, die kleine Tochter mit dem Stoffhasen.' },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },
};

function spot(id, look, use) {
  return {
    look: (story) => ispyOr(story, id, () => story.say(look)),
    use: (story) => ispyOr(story, id, () => story.say(use)),
  };
}

// ============================================================================================
//  Ich sehe was, was du nicht siehst
// ============================================================================================

// Läuft gerade das Spiel, ist jeder Klick ein Rateversuch
async function ispyOr(story, id, otherwise) {
  const f = story.flags;
  if (f.ispyRound === undefined || f.ispyDone) return otherwise();
  const round = ISPY[f.ispyRound];
  if (id === round.answer) {
    story.sound('success');
    f.ispyRound += 1;
    if (f.ispyRound >= ISPY.length) {
      f.ispyDone = true;
      await story.speakAs('mira', 'Ja … das Fenster. Da draußen ist der Tunnel. Da fahren wir jede Runde hinein.');
      await story.speakAs('mira', 'Mama ist schon hindurchgegangen. Ganz am Anfang. Ich warte auf Papa.');
      await story.speakAs('mira', 'Du kannst gut sehen. Dann kannst du mir helfen. Meine Bahn fährt nicht mehr – die Wagen sind ganz durcheinander.');
      await story.speakAs('mira', 'Papa hat sie immer richtig hingestellt. So, wie der echte Zug fährt.');
      story.note('Mira: Ihre Mama ist „ganz am Anfang“ durch den Tunnel gegangen, sie wartet auf ihren Papa. Ihre Modellbahn fährt nicht – die Wagen stehen durcheinander. „Papa hat sie immer richtig hingestellt. So, wie der echte Zug fährt.“');
      return;
    }
    await story.speakAs('mira', f.ispyRound === 1 ? 'Richtig! Noch mal!' : 'Richtig! Noch einmal. Das letzte.');
    await story.speakAs('mira', 'Ich sehe was, was du nicht siehst …');
    await story.speakAs('mira', ISPY[f.ispyRound].clue);
    return;
  }
  if (id === 'toyTunnel' && round.answer === 'window') {
    await story.speakAs('mira', 'Nein, nicht der kleine! Der große. Der echte.');
    return;
  }
  await story.speakAs('mira', round.wrong);
}

async function talkMira(story) {
  const f = story.flags;
  if (f.ispyRound !== undefined && !f.ispyDone) {
    await story.speakAs('mira', 'Du musst raten! Zeig drauf!');
    await story.speakAs('mira', ISPY[f.ispyRound].clue);
    return;
  }
  if (!f.miraMet) {
    f.miraMet = true;
    await story.speakAs('mira', 'Hallo. Ich bin Mira. Ich bin sieben.');
    await story.speakAs('mira', 'Schon ganz lange.');
    await story.say('Sie hat den Stoffhasen vom Familienfoto im Arm. Das ist die Tochter des Schaffners!');
    await story.say('… Und der Hase hat ein Schlappohr. Der saß im Gepäckwagen. Und das Mädchen im Spiegel …');
    await story.speakAs('mira', 'Das ist Hoppel. Wir haben dich schon ganz oft gesehen. Du hast uns nur nie bemerkt.');
    story.note('Im Spielzimmer: Mira, sieben Jahre alt – „schon ganz lange“. Sie hat den Stoffhasen vom Familienfoto (Hoppel, mit Schlappohr – der aus dem Gepäckwagen). Sie war das Mädchen im Spiegel. Sie ist die Tochter des Schaffners.');
  }
  for (;;) {
    const topics = [
      { id: 'play', text: 'Wollen wir etwas spielen?', when: !f.ispyDone && f.ispyRound === undefined },
      { id: 'papa', text: 'Wo ist dein Papa?', done: f.askedPapa },
      { id: 'cap', text: 'Warum schaust du mich so an?', when: f.askedPapa, done: f.askedCap },
      { id: 'bye', text: 'Ich sehe mich um.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'play') {
      f.ispyRound = 0;
      await story.speakAs('mira', 'Ja! Ich sehe was, was du nicht siehst …');
      await story.speakAs('mira', ISPY[0].clue);
      await story.say('Ich soll darauf zeigen. Also anklicken.');
      return;
    }
    if (topic === 'papa') {
      f.askedPapa = true;
      await story.speakAs('mira', 'Papa ist immer unterwegs. Er bringt alle nach Hause, einen nach dem anderen.');
      await story.speakAs('mira', 'Und wenn alle zu Hause sind, holt er mich.');
    }
    if (topic === 'cap') {
      f.askedCap = true;
      await story.speakAs('mira', 'Du hast die gleiche Mütze wie Papa. Und den gleichen Schal.');
      await story.speakAs('mira', 'Den hat Oma Ilse gestrickt. Oma schläft immer. Sie ist so müde.');
      await story.say('Oma Ilse … die alte Dame aus dem Schlafwagen? Woher habe ich eigentlich meinen Schal?');
      await story.say('… Und die gleiche Mütze wie der Täter im Film.');
      story.note('Mira: Ich habe die gleiche Mütze und den gleichen Schal wie ihr Papa. Den Schal hat Oma Ilse gestrickt – Ilse aus dem Schlafwagen ist Miras Oma.');
    }
  }
}

async function showPhotoToMira(story) {
  await story.speakAs('mira', 'Das sind wir! Mama, Papa und ich. Und Hoppel.');
  await story.speakAs('mira', 'Das war an Weihnachten. Bevor wir mit dem Zug gefahren sind.');
}

// ============================================================================================
//  Modellbahn
// ============================================================================================

async function railway(story) {
  const f = story.flags;
  if (f.trainRan) return story.say('Die Bahn ist in den Tunnel gefahren und dort stehen geblieben.');
  if (!f.ispyDone) return story.speakAs('mira', 'Das ist meine Bahn! Erst spielen wir was.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die kleinen Zeichen nicht.');
  const solved = await story.view('arrange', {
    id: 'railway',
    title: 'Die Modellbahn',
    slots: MINI_SLOTS,
    tokens: MINI_TOKENS.map((token) => ({ id: token.id, label: 'Wagen', w: 120, h: 84, slot: token.slot })),
    drawBackground: drawRailwayTable,
    drawToken: drawMini,
    check: (placement) => placement.every((id, i) => id === `mini${i}`),
    help: 'Wagen mit gedrückter Maustaste auf einen anderen Platz ziehen (sie tauschen)  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!f.railwaySeen && !inTunnel(story)) {
      f.railwaySeen = true;
      await story.say('In jedem kleinen Wagen ist ein winziges Zeichen: eine Bank, ein Koffer, ein Brief … wie auf dem Adventskranz.');
      story.note('Modellbahn: 14 kleine Wagen, in jedem ein winziges Zeichen (Bank, Koffer, Brief, Glas …, Kreuz, Zeitung). „So, wie der echte Zug fährt.“');
    }
    return;
  }
  f.trainRan = true;
  await story.cutscene(async () => {
    story.sound('toyTrain');
    await story.say('Abteil, Gepäckwagen, Postwagen … Kapelle, Zeitungswagen. Genau mein Weg.');
    await story.speakAs('mira', 'Sie fährt! Sie fährt!');
    await story.wait(1.2);
    await story.say('Die Bahn fährt in den Spielzeugtunnel … und bleibt drin stehen.');
    await story.speakAs('mira', 'Sie bleibt immer im Tunnel stehen. Wie der echte Zug.');
  });
  story.note(`Die Modellbahn fährt (Wagen 1–14 in der richtigen Reihenfolge: ${MINI.length} Wagen). Sie ist in den Spielzeugtunnel gefahren und dort stehen geblieben.`);
}

async function takeToyKey(story) {
  const f = story.flags;
  if (!f.trainRan) return story.say('Ein Tunnel aus Pappmaché. Innen ist es dunkel.');
  if (f.keyTaken) return story.say('Leer.');
  f.keyTaken = true;
  story.give('toyKey');
  await story.say('Im Tunnel, unter dem letzten Wagen: ein kleiner roter Schlüssel!');
  await story.speakAs('mira', 'Der ist für den Bahnhof!');
}

// ============================================================================================
//  Puppenhaus-Bahnhof
// ============================================================================================

async function openDollhouse(story) {
  const f = story.flags;
  story.remove('toyKey');
  f.houseOpen = true;
  story.sound('unlock');
  await story.say('Der Schlüssel passt. Die Vorderwand des Bahnhofs klappt auf.');
  await dollhouse(story);
}

async function dollhouse(story) {
  const f = story.flags;
  if (!f.houseOpen) return story.say('Die Vorderwand ist zu. Ein kleines Schlüsselloch.');
  if (f.drawingFound) return story.say('Die Figuren stehen, wie es in jener Nacht war.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Figuren nicht.');
  const solved = await story.view('arrange', {
    id: 'dollhouse',
    title: 'Im Puppenhaus-Bahnhof',
    slots: FIGURE_SLOTS,
    tokens: FIGURES.map((figure) => ({ id: figure.id, label: figure.name, w: 96, h: 150, home: figure.home })),
    drawBackground: drawDollhouseInside,
    drawToken: drawFigure,
    check: figuresCorrect,
    help: 'Figuren auf den Bahnsteig oder in den Zug ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!f.dollhouseSeen && !inTunnel(story)) {
      f.dollhouseSeen = true;
      await story.speakAs('mira', 'Stell sie so hin, wie es war. In der Nacht.');
      story.note('Puppenhaus-Bahnhof: ein Bahnsteig, ein Zug mit zwei Fenstern, fünf Figuren. Mira: „Stell sie so hin, wie es war. In der Nacht.“');
    }
    return;
  }
  f.drawingFound = true;
  await story.cutscene(async () => {
    await story.say('Der Schaffner wartet auf dem Bahnsteig. Seine Frau und seine Tochter sitzen im Zug. Wie in der Zeitung.');
    story.sound('drawer');
    await story.say('Unter dem Bahnsteig springt ein kleines Fach auf. Darin: eine Zeichnung.');
    await story.speakAs('mira', 'Die habe ich gemalt. Für dich.');
  });
  story.give('drawing');
  await showDrawing(story);
}

async function showDrawing(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Zeichnung nicht.');
  story.sound('paper');
  await story.card({ draw: (ctx) => drawMiraDrawing(ctx) });
  if (!f.drawingSeen) {
    f.drawingSeen = true;
    await story.cutscene(async () => {
      await story.say('Ein großer, schwarzer Tunnel. Ein Mann mit Mütze und weißem Schal führt Leute hinein, einen nach dem anderen.');
      await story.speakAs('mira', 'Das ist Papa. Er bringt alle nach Hause.');
      story.sound('dread');
      await story.say('Mütze. Weißer Schal. Wie die Gestalt im Film. Wie … ich.');
    });
    story.note('Miras Zeichnung: Ein Mann mit Mütze und weißem Schal führt Leute in den Tunnel. Mira: „Das ist Papa. Er bringt alle nach Hause.“');
  }
  await story.card({ draw: (ctx) => drawMiraDrawing(ctx, { back: true }) });
  if (!f.backSeen) {
    f.backSeen = true;
    story.note('Auf der Rückseite von Miras Zeichnung: „Für Papa – Die Tür-Geheimzahl ist Heiligabend!“');
  }
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  const opened = await tryCode(story, {
    id: 'door15',
    code: DOOR_CODE,
    dark: 'Im Dunkeln sehe ich die Tasten nicht.',
    wrong: (s) => (s.flags.backSeen ? 'Falsch. Heiligabend … welcher Tag ist das?' : 'Falsch. Vier Ziffern …'),
  });
  if (!opened) return;
  if (!story.flags.drawingSeen) return story.say('Offen. Aber Mira wollte mir noch etwas zeigen.');
  await story.cutscene(async () => {
    story.sound('door');
    await story.speakAs('mira', 'Tschüss! Kommst du wieder?');
    await story.say('Ich … ja. Bestimmt.');
    await story.say('Der Schaffner führt die Fahrgäste in den Tunnel. Mit meiner Mütze und meinem Schal.');
    await finishWagon(story, {
      number: 15,
      title: 'Ende von Wagen 15',
      lines: ['„Das ist Papa. Er bringt alle nach Hause.“'],
      nextTitle: 'im Funkraum',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.ispyDone) {
    if (f.ispyRound === undefined) return { id: 'mira', lines: ['Mit Mira reden. Vielleicht will sie spielen.'] };
    const round = ISPY[f.ispyRound];
    const answers = { drum: 'die Trommel im Regal', horse: 'das Schaukelpferd', window: 'ein Fenster – dahinter liegt irgendwo der echte Tunnel' };
    return { id: `ispy${f.ispyRound}`, lines: [`Mira sagt: ${round.clue} Auf das Gesuchte klicken.`, `Gemeint ist ${answers[round.answer]}.`] };
  }
  if (!f.trainRan) {
    return { id: 'railway', lines: [
      'Die Modellbahn auf dem Tisch links. „So, wie der echte Zug fährt.“',
      'In jedem kleinen Wagen ist ein Zeichen – wie auf dem Adventskranz in der Kapelle. Dazu ein Kreuz (Kapelle) und eine Zeitung.',
      'Reihenfolge hinter der Lok: Bank, Koffer, Brief, Weinglas, Bett, Schirm, Whisky, Film, Spiegel, Trichter, Uhr, Note, Kreuz, Zeitung.',
    ] };
  }
  if (!f.keyTaken) return { id: 'key', lines: ['Die Bahn steht im Spielzeugtunnel. Dort nachsehen.'] };
  if (!f.houseOpen) return { id: 'house', lines: ['Der rote Schlüssel passt in den Puppenhaus-Bahnhof rechts.'] };
  if (!f.drawingFound) {
    return { id: 'figures', lines: [
      '„Stell sie so hin, wie es war. In der Nacht.“ Wie war es laut Zeitung vom 25. Dezember?',
      'Der Schaffner wartete auf dem Bahnsteig. Seine Frau und seine Tochter saßen im Zug. Koch und Hund gehören nicht dazu.',
    ] };
  }
  return { id: 'door', lines: ['„Die Tür-Geheimzahl ist Heiligabend!“ – der 24.12. Die Tür will vier Ziffern: 2 – 4 – 1 – 2.'] };
}
