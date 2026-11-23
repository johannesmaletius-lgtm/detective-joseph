import {
  CRANK_SPOTS, DIRECTIONS, NEXT_FREQUENCY, TOWER_DIRECTION, drawCrank, drawLogbook, drawMorseBoard, drawRadioLight,
  drawRadioPanel, morseText,
} from './art/wagon16.js';
import { MORSE_DIGITS } from '../effects/morse.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 16 – Der Funkraum (niemand da)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Antenne ausrichten: Die Kurbel dreht die Antenne. Empfang gibt es nur Richtung Turm – und der
//      steht in der Mitte des Kreises, den der Zug fährt, also immer links (in den Fenstern links
//      zu sehen).
//   2. Logbuch: Frequenzen 120, 135, 165, 210, 270 – die Abstände wachsen um 15 (15, 30, 45, 60) →
//      nächste: 270 + 75 = 345 kHz. Am Funkgerät einstellen.
//   3. Der Lautsprecher ist kaputt – Kopfhörer vom Tisch aufsetzen. Morsefunkspruch: „Hier Bahnhof.
//      Zug 24 sofort halten. Weiche 7 falsch. Bitte antworten.“ Am Ende vier Ziffern, die Joseph
//      nicht lesen kann: ..--- ...-- ....- .---- → mit der Morsetafel an der Wand: 2341 (23:41) =
//      Türcode. Die Stimme danach ist die des Schaffners.

const DOOR_CODE = '2341';
const UNIT = 0.11; // Länge eines kurzen Morsezeichens (Sekunden)

export const wagon16 = {
  flags: {},
  startItems: ['flashlight', 'gear', 'familyPhoto', 'pressPhoto', 'drawing'],
  recap: [
    'Jede Runde verschwindet ein Fahrgast. Eine Gestalt mit meiner Mütze und meinem Schal führt sie in den Tunnel. Der Schaffner ruft sie.',
    'Der Weihnachtszug vom 24. Dezember ist im Tunnel verschollen. Frau und Tochter des Schaffners saßen darin, er wartete am Bahnsteig und lief in der Nacht allein in den Tunnel.',
    'Spielzimmer: Mira ist die Tochter des Schaffners. Ihre Zeichnung: Ein Mann mit meiner Mütze führt Leute in den Tunnel. „Das ist Papa. Er bringt alle nach Hause.“',
  ],

  setup(story) {
    const f = story.flags;
    f.direction ??= 0;
    story.scene.paintSpot('radio', (ctx) => drawRadioLight(ctx, f.tuned, story.motion.time));
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 16,
      title: 'Der Funkraum',
      lines: [
        'Ein Funkraum. Ein Funkgerät mit Röhren, eine Morsetaste, ein Logbuch.',
        'Wenn in jener Nacht jemand gefunkt hat, dann hier.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    crank: {
      look: 'Eine große Kurbel mit einer Scheibe. Sie dreht den Antennenmast auf dem Dach.',
      use: (story) => turnAntenna(story),
    },
    antenna: { look: 'Der Antennenmast geht durchs Dach.' },
    radio: {
      look: (story) => story.say(story.flags.tuned ? 'Das Funkgerät ist auf 345 kHz eingestellt.' : 'Ein Funkgerät mit Röhren. Der Lautsprecher ist eingedrückt.'),
      use: (story) => useRadio(story),
      items: { headphones: (story) => useRadio(story) },
    },
    morseKey: {
      look: 'Eine Morsetaste.',
      use: (story) => answerMorse(story),
    },
    headphones: {
      look: 'Kopfhörer, an das Funkgerät angeschlossen.',
      use: async (story) => {
        story.flags.headphonesTaken = true;
        story.give('headphones');
        await story.say('Die Kopfhörer. Das Kabel ist lang genug.');
      },
    },
    logbook: {
      look: 'Das Funklogbuch.',
      use: (story) => readLogbook(story),
    },
    mug: { look: 'Eine Tasse Kaffee. Noch warm. Seit ewig noch warm.' },
    board: {
      look: 'An der Wand: eine Tafel mit Morsezeichen.',
      use: (story) => readBoard(story),
    },
    drawers: { look: 'Schubladen voller Ersatzröhren.' },
    chair: {
      look: 'Der Stuhl des Funkers.',
      use: (story) => waitForTunnel(story, 'Ich setze mich auf den Stuhl des Funkers und warte auf den Tunnel …'),
    },
    bench: {
      look: 'Eine rote Sitzbank.',
      use: (story) => waitForTunnel(story, 'Ich setze mich kurz und warte auf den Tunnel …'),
    },
    door: {
      look: 'Die Tür nach vorne. Ein Zahlenschloss mit vier Ziffern.',
      use: (story) => tryDoor(story),
    },
    window: {
      look: (story) => lookWindow(story),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    headphones: { look: 'Die Kopfhörer des Funkers. Wer sie aufhat, hört nichts anderes mehr.' },
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
//  Fenster und Antenne
// ============================================================================================

async function lookWindow(story) {
  if (story.isDark) return story.say('Tunnelwand.');
  const f = story.flags;
  if (story.player.x < 640) {
    await story.say('Links draußen: der Turm mit dem roten Licht. Er steht immer dort – mitten in dem Kreis, den wir fahren.');
    if (!f.towerSeen) {
      f.towerSeen = true;
      story.note('Den Turm sieht man nur in den Fenstern links. Er steht in der Mitte des Kreises, um den der Zug fährt – vom Zug aus also immer links.');
    }
    return;
  }
  return story.say('Rechts draußen: Wald und Schnee. Kein Turm.');
}

async function turnAntenna(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Scheibe nicht.');
  await story.view('picture', {
    draw: (ctx, view) => drawCrank(ctx, f.direction, view.age),
    spots: CRANK_SPOTS,
    area: { x: 240, y: 80, w: 800, h: 580 },
    help: 'Kurbel anklicken: Antenne ein Stück weiterdrehen  ·  Rechtsklick: zurück',
    onClick: async () => {
      f.direction = (f.direction + 1) % DIRECTIONS.length;
      story.sound('rotate');
      if (f.direction === TOWER_DIRECTION && !f.antennaFound) {
        f.antennaFound = true;
        story.sound('static');
        await story.say('Die Nadel schlägt aus! Antenne nach links – zum Turm.');
      }
      return null;
    },
  });
  if (f.direction === TOWER_DIRECTION && f.antennaFound && !f.antennaNoted) {
    f.antennaNoted = true;
    story.note('Die Antenne zeigt nach links, zum Turm in der Mitte des Kreises. Jetzt ist der Empfang gut.');
  } else if (!f.crankSeen && f.direction !== TOWER_DIRECTION) {
    f.crankSeen = true;
    story.note('Antennenkurbel: Die Scheibe zeigt, wohin die Antenne vom Zug aus zeigt. Je nach Richtung ist der Empfang besser oder schlechter.');
  }
}

// ============================================================================================
//  Logbuch, Morsetafel
// ============================================================================================

async function readLogbook(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nicht lesen.');
  story.sound('page');
  await story.card({ draw: drawLogbook });
  if (!f.logRead) {
    f.logRead = true;
    await story.say('Jede Stunde eine neue Frequenz: 120, 135, 165, 210, 270 … Die von 23 Uhr ist verwischt.');
    await story.say('Und: „22:50 – Weihnachtsfeier im Speisewagen. Alle hin! Funk bleibt kurz unbesetzt.“');
    story.note('Funklogbuch vom 24. Dezember: Frequenzen 18 Uhr 120, 19 Uhr 135, 20 Uhr 165, 21 Uhr 210, 22 Uhr 270 kHz – die für 23 Uhr ist verwischt. „22:50 – Weihnachtsfeier im Speisewagen. Funk bleibt kurz unbesetzt.“ Darunter ein verwischter Eintrag „23:4…“.');
  }
}

async function readBoard(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Tafel nicht.');
  story.sound('paper');
  await story.card({ draw: drawMorseBoard });
  if (!story.flags.boardRead) {
    story.flags.boardRead = true;
    await story.say('Die Morsezeichen für die Ziffern. So eine Tafel hatte ich schon im ersten Abteil.');
  }
}

// ============================================================================================
//  Funkgerät
// ============================================================================================

async function useRadio(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Knöpfe nicht.');
  if (f.messageHeard) return replayDigits(story);
  if (!f.tuned) {
    const opened = await tryCode(story, {
      id: 'frequency',
      code: NEXT_FREQUENCY,
      style: 'steel',
      dark: 'Im Dunkeln sehe ich die Skala nicht.',
      wrong: (s) => (s.flags.logRead ? 'Nur Rauschen. Welche Frequenz käme nach 270?' : 'Nur Rauschen.'),
    });
    if (!opened) return;
    f.tuned = true;
    story.sound('static');
    await story.say('345 kHz. Das Rauschen ändert sich …');
  }
  if (f.direction !== TOWER_DIRECTION) {
    story.sound('static');
    return story.say('Nur Rauschen. Der Empfang ist zu schwach – die Antenne zeigt in die falsche Richtung.');
  }
  if (!story.has('headphones')) {
    return story.say('Da ist etwas! Ganz leise … aber der Lautsprecher ist kaputt. Ich brauche die Kopfhörer.');
  }
  await playMessage(story);
}

async function playMessage(story) {
  const f = story.flags;
  let light = false;
  const panel = { frequency: NEXT_FREQUENCY, antenna: true, listening: true };
  await story.cutscene(async () => {
    await story.say('Ich setze die Kopfhörer auf …');
    story.game.views.picture.open({ draw: (ctx, view) => drawRadioPanel(ctx, { ...panel, light, time: view.age }), spots: [], help: '', onMiss: () => { story.game.speech.skip(); } });
    const words = [
      '„HIER BAHNHOF …“',
      '„ZUG 24 SOFORT HALTEN …“',
      '„WEICHE 7 FALSCH …“',
      '„BITTE ANTWORTEN …“',
    ];
    for (const word of words) {
      beep(story, '.-..-.--.', (on) => { light = on; });
      await story.say(`Piep, piep-piep … ${word}`);
    }
    await story.say('Und dann noch etwas. Vier Zeichen. Die kann ich nicht lesen.');
    for (const digit of DOOR_CODE) {
      await beep(story, MORSE_DIGITS[digit], (on) => { light = on; }, 0.2);
      await story.wait(0.6);
    }
    await story.say(`Ich schreibe sie auf: ${morseText(DOOR_CODE)}`);
    story.sound('static');
    await story.speak('„… hier Bahnhof … bitte … meine Familie ist in diesem Zug … bitte antworten …“', { color: '#f5d7a1' });
    await story.say('Diese Stimme … das ist der Schaffner. Die Stimme aus den Lautsprechern.');
    await story.say('Er hat gewarnt. Vom Bahnsteig aus. Aber hier saß niemand am Funk – alle waren bei der Weihnachtsfeier.');
    story.game.views.picture.close();
  });
  f.messageHeard = true;
  story.note('Funkspruch auf 345 kHz, in Morsezeichen: „Hier Bahnhof. Zug 24 sofort halten. Weiche 7 falsch. Bitte antworten.“ Danach die Stimme des Schaffners: „Meine Familie ist in diesem Zug.“ Niemand hat geantwortet – alle waren bei der Weihnachtsfeier.');
  story.note(`Am Ende des Funkspruchs vier Ziffern in Morsezeichen: ${morseText(DOOR_CODE)}`);
}

// Spielt Morsezeichen als Töne ab. onLight(true/false) für das Lämpchen. Ergebnis: Promise, wenn fertig.
function beep(story, code, onLight, unit = UNIT) {
  let t = 0;
  const timers = [];
  for (const mark of code) {
    const length = (mark === '-' ? 3 : 1) * unit;
    story.tone(760, { duration: length, type: 'sine', gain: 0.08, delay: t });
    timers.push(setTimeout(() => onLight(true), t * 1000));
    timers.push(setTimeout(() => onLight(false), (t + length) * 1000));
    t += length + unit;
  }
  return new Promise((resolve) => setTimeout(resolve, t * 1000));
}

async function replayDigits(story) {
  await story.say(`Nur noch Rauschen. Am Ende waren es diese vier Zeichen: ${morseText(DOOR_CODE)}`);
}

async function answerMorse(story) {
  const f = story.flags;
  if (!f.messageHeard) {
    story.tone(760, { duration: 0.12, type: 'sine', gain: 0.08 });
    return story.say('Piep. Eine Morsetaste. Aber wem soll ich etwas senden?');
  }
  for (let i = 0; i < 3; i++) story.tone(760, { duration: 0.12, type: 'sine', gain: 0.08, delay: i * 0.25 });
  await story.say('Ich antworte: „Hier Zug 24! Wir hören euch!“ …');
  story.sound('static');
  await story.say('Nichts. Das ist keine Verbindung. Das ist ein Echo von damals.');
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  const opened = await tryCode(story, {
    id: 'door16',
    code: DOOR_CODE,
    dark: 'Im Dunkeln sehe ich die Tasten nicht.',
    wrong: (s) => (s.flags.messageHeard ? 'Falsch. Die vier Morsezeichen vom Ende des Funkspruchs …' : 'Falsch. Vier Ziffern …'),
  });
  if (!opened) return;
  if (!story.flags.messageHeard) return story.say('Offen. Aber erst will ich wissen, was hier gefunkt wurde.');
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('23:41. Sechs Minuten, bevor der Zug ankommen sollte, hat er gewarnt.');
    await story.say('„Weiche 7 falsch.“ Niemand hat es gehört.');
    await finishWagon(story, {
      number: 16,
      title: 'Ende von Wagen 16',
      lines: ['„Hier Bahnhof. Zug 24 sofort halten. Weiche 7 falsch. Bitte antworten.“', 'Niemand hat geantwortet.'],
      nextTitle: 'im Gewächshaus',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (f.direction !== TOWER_DIRECTION) {
    return { id: 'antenna', lines: [
      'Die Kurbel links dreht die Antenne. Wohin muss sie zeigen?',
      'Durch die Fenster links sieht man den Turm. Er steht in der Mitte des Kreises, den der Zug fährt.',
      'Die Kurbel so oft drehen, bis der Zeiger auf „links“ steht.',
    ] };
  }
  if (!f.tuned) {
    return { id: 'frequency', lines: [
      'Im Logbuch stehen die Frequenzen für jede Stunde. Die für 23 Uhr ist verwischt.',
      '120, 135, 165, 210, 270: Die Abstände sind 15, 30, 45, 60 – der nächste ist 75.',
      'Am Funkgerät 345 einstellen.',
    ] };
  }
  if (!f.messageHeard) {
    if (!story.has('headphones')) return { id: 'headphones', lines: ['Der Lautsprecher des Funkgeräts ist kaputt. Auf dem Tisch liegen Kopfhörer.'] };
    return { id: 'listen', lines: ['Das Funkgerät benutzen – mit den Kopfhörern.'] };
  }
  if (!f.boardRead) return { id: 'board', lines: ['Die vier Morsezeichen am Ende … an der Wand hängt eine Morsetafel.'] };
  return { id: 'door', lines: [
    'Die vier Zeichen mit der Morsetafel übersetzen. Zwei Punkte und drei Striche ist eine 2.',
    '..--- ...-- ....- .---- = 2 – 3 – 4 – 1. Das ist der Türcode.',
  ] };
}
