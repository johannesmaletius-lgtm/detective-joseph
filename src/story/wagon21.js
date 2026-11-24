import { START_PRESSURE, TARGET, VALVES, drawBoiler, drawLockerPhoto, valveSpots } from './art/wagon21.js';
import { finishWagon, hintFor, inTunnel, roundProgress, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 21 – Der Kesselwagen, mit dem Heizer
// ============================================================================================
//
// DIE RÄTSEL
//   1. Kesseldruck: Das Manometer steht bei 42 bar (rot). Drei Ventile: rot −8, gelb −5, blau +3.
//      Genau 25 bar (grün) einstellen. Nur mit Rot und Gelb geht es nicht (17 lässt sich aus 8 und 5 nicht
//      zusammensetzen) – man braucht Blau: z. B. gelb 4×, blau 1× (42 − 20 + 3 = 25). Erst dann redet der Heizer.
//   2. Wasserstand: Die Speisepumpe zieht nur, wenn der Zug bergab fährt. Das merkt man daran, dass
//      die Kohlen im Bunker nach vorne rutschen (in der zweiten Hälfte der Runde, kurz). Dann pumpen.
//   3. Spind des Heizers: altes Foto – der Heizer mit einem jungen Schaffner, der aussieht wie Joseph.
//      Dienstnummer am Ärmel: 317 = Türcode.
//
// ERGEBNIS: Der Heizer: „Herr Schaffner, Sie kommen doch jede Runde um halb zwölf hier vorbei,
// mit dem Lok-Schlüssel um den Hals, und gehen nach vorne in die Lok.“ – „Ich bin siebzehn.“
// Jetzt weiß Joseph, wo er den anderen Joseph findet.

const DOWNHILL = [0.62, 0.74]; // Anteil der Runde, in dem es bergab geht

export const wagon21 = {
  flags: {},
  startItems: ['flashlight', 'paddle'],
  recap: [
    'Der Weihnachtszug ist an Weiche 7 abgebogen. Den Lok-Schlüssel hat der andere Joseph – der mit meiner Mütze.',
    'Mira hat mir eine Kelle geschenkt: „Für Papa. Damit du uns nach Hause bringst.“ Und sie nannte mich Papa. Ich bin siebzehn!',
    'Der Tunnel: einundzwanzig Ticks. Noch vier.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 21,
      title: 'Der Kesselwagen',
      lines: [
        'Hitze. Dampf. Ein riesiger Kessel – und ein Mann mit Schaufel.',
        'Der Zeiger am Manometer steht im Roten.',
        'Der Tunnel eben hat einundzwanzig Ticks gedauert. Ich habe mitgezählt.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  update(story) {
    const f = story.flags;
    const p = roundProgress(story);
    const downhill = p >= DOWNHILL[0] && p <= DOWNHILL[1] && !story.motion.inTunnel;
    if (downhill && !f.downhill) {
      f.downhill = true;
      story.sound('slide');
      if (!story.isBusy && f.waterAsked && !f.watered) story.respond('Die Kohlen im Bunker rutschen nach vorne! Es geht bergab – jetzt pumpen!');
    }
    if (!downhill) f.downhill = false;
  },

  hotspots: {
    heizer: {
      look: 'Ein kräftiger Mann mit rotem Halstuch und Ruß im Gesicht. Er schaufelt Kohlen und flucht leise.',
      use: (story) => talkToHeizer(story),
    },
    gauge: {
      look: (story) => story.say(story.flags.pressureOk ? 'Genau 25 bar. Grün.' : 'Das Manometer. Der Zeiger zittert im roten Bereich.'),
      use: (story) => setPressure(story),
    },
    valves: { look: 'Drei Ventile: rot, gelb, blau.', use: (story) => setPressure(story) },
    water: {
      look: (story) => story.say(story.flags.watered ? 'Der Wasserstand ist wieder oben.' : 'Das Wasserstandsglas. Ziemlich leer.'),
    },
    pump: {
      look: 'Die Speisepumpe. Ein langer Hebel – damit kommt Wasser in den Kessel.',
      use: (story) => pump(story),
    },
    firebox: { look: 'Die Feuertür. Dahinter glüht es.', use: 'Viel zu heiß.' },
    coal: {
      look: (story) => story.say(story.flags.downhill ? 'Die Kohlen rutschen nach vorne – es geht bergab!' : 'Ein Bunker voller Kohlen.'),
    },
    shovel: { look: 'Die Schaufel des Heizers.', use: 'Das ist seine. Er schaut schon ganz böse.' },
    locker: {
      look: 'Der Spind des Heizers. Abgeschlossen.',
      use: (story) => (story.flags.lockerOpen ? lookPhoto(story) : story.say('Abgeschlossen. Den Schlüssel hat bestimmt der Heizer.')),
    },
    switches: { look: 'Zwei Schalter. Licht.' },
    door: { look: 'Die Tür nach vorne – zur Lok. Ein Zahlenschloss mit drei Rädchen.', use: (story) => tryDoor(story) },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Funken fliegen am Fenster vorbei.'),
      use: (story) => waitForTunnel(story),
    },
  },

  items: {
    lockerPhoto: { look: (story) => lookPhoto(story) },
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
//  Heizer
// ============================================================================================

async function talkToHeizer(story) {
  const f = story.flags;
  if (!f.pressureOk) {
    if (!f.metHeizer) {
      f.metHeizer = true;
      await story.speakAs('heizer', 'Nicht jetzt! Der Kessel fliegt uns gleich um die Ohren!');
      await story.speakAs('heizer', 'Der Druck muss runter auf fünfundzwanzig. Genau fünfundzwanzig! Rot nimmt acht weg, Gelb fünf, Blau gibt drei dazu.');
      story.note('Heizer: Der Kesseldruck muss auf GENAU 25 bar. Rotes Ventil −8, gelbes −5, blaues +3 je Drehung. Vorher redet er nicht.');
      return;
    }
    return story.speakAs('heizer', 'Erst der Druck! Genau fünfundzwanzig!');
  }
  if (!f.watered) {
    f.waterAsked = true;
    await story.speakAs('heizer', 'Gut gemacht, Junge – äh. Jetzt das Wasser. Der Kessel säuft wie ein Loch.');
    await story.speakAs('heizer', 'Die Pumpe zieht aber nur, wenn wir bergab fahren. Wenn die Kohlen im Bunker nach vorne rutschen, dann – zack – pumpen!');
    if (!f.waterNoted) {
      f.waterNoted = true;
      story.note('Heizer: Die Speisepumpe zieht nur bergab. Wenn die Kohlen im Bunker nach vorne rutschen, sofort pumpen.');
    }
    return;
  }
  if (!f.lockerOpen) {
    f.lockerOpen = true;
    await story.cutscene(async () => {
      story.character('heizer').pose = 'talk';
      await story.speakAs('heizer', 'Ah, das läuft wieder. Danke, Herr Schaffner.');
      await story.say('Herr … Schaffner? Ich bin nicht der Schaffner.');
      await story.speakAs('heizer', 'Na, jetzt machen Sie Witze. Sie kommen doch jede Runde um halb zwölf hier vorbei.');
      await story.speakAs('heizer', 'Mit dem Lok-Schlüssel um den Hals. Und gehen nach vorne in die Lok.');
      await story.say('Ich bin siebzehn!');
      await story.speakAs('heizer', 'Hahaha! Siebzehn! Und ich bin der Weihnachtsmann. Warten Sie, ich zeig Ihnen was.');
      story.sound('creak');
      await story.speakAs('heizer', 'Aus meinem Spind. Sie und ich, damals, vor der alten Lok. Sie waren jung, ja – aber nicht siebzehn.');
      story.give('lockerPhoto');
      story.character('heizer').pose = 'left';
    });
    story.note('Der Heizer nennt mich „Herr Schaffner“: Der Schaffner kommt jede Runde um halb zwölf hier vorbei, mit dem Lok-Schlüssel um den Hals, und geht nach vorne in die Lok. Dort finde ich den anderen Joseph.');
    await lookPhoto(story);
    return;
  }
  await story.speakAs('heizer', 'Halb zwölf, Herr Schaffner. Wie jede Runde.');
}

// ============================================================================================
//  1. Kesseldruck
// ============================================================================================

async function setPressure(story) {
  const f = story.flags;
  if (f.pressureOk) return story.say('Genau 25 bar. Daran drehe ich nichts mehr.');
  if (inTunnel(story)) return story.say('Im Dunkeln drehe ich womöglich am falschen Rad.');
  const state = { pressure: f.pressure ?? START_PRESSURE, turns: f.turns ?? {} };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawBoiler(ctx, view.state),
    spots: valveSpots(),
    area: { x: 220, y: 50, w: 960, h: 620 },
    help: 'Klicken: Ventil eine Drehung weiter  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (spot.id === 'reset') {
        s.pressure = START_PRESSURE;
        s.turns = {};
        story.sound('hiss');
        return;
      }
      const valve = VALVES.find((v) => v.id === spot.id);
      s.turns[valve.id] = (s.turns[valve.id] ?? 0) + 1;
      s.pressure += valve.delta;
      story.sound(valve.delta < 0 ? 'hiss' : 'rotate');
      if (s.pressure < 10) {
        await story.say('Zu wenig Druck! Das Feuer geht fast aus.');
        await story.speakAs('heizer', 'Bist du wahnsinnig? Alles zurück!');
        s.pressure = START_PRESSURE;
        s.turns = {};
        return;
      }
      if (s.pressure === TARGET) {
        await story.wait(0.6);
        view.close(true);
      }
    },
  });
  f.pressure = state.pressure;
  f.turns = state.turns;
  if (!done) return;
  f.pressureOk = true;
  story.sound('success');
  await story.say('Fünfundzwanzig. Genau im Grünen.');
  await story.speakAs('heizer', 'Na also! Jetzt können wir reden.');
}

// ============================================================================================
//  2. Wasser
// ============================================================================================

async function pump(story) {
  const f = story.flags;
  if (f.watered) return story.say('Der Kessel hat genug Wasser.');
  if (!f.pressureOk) return story.say('Erst muss der Druck stimmen, sonst platzt mir hier alles um die Ohren.');
  story.sound('creak');
  if (!f.downhill) {
    await story.say('Ich pumpe … die Pumpe zieht nur Luft.');
    if (!f.waterAsked) await story.say('Vielleicht weiß der Heizer, wie das geht.');
    return;
  }
  f.watered = true;
  story.sound('water');
  await story.say('Jetzt zieht sie! Wasser gluckert in den Kessel. Das Glas füllt sich.');
  await story.speakAs('heizer', 'Bravo! Bergab, genau so.');
  story.note('Wasser im Kessel: bergab gepumpt.');
}

// ============================================================================================
//  3. Foto und Tür
// ============================================================================================

async function lookPhoto(story) {
  await story.card({ draw: drawLockerPhoto });
  if (story.flags.photoSeen) return;
  story.flags.photoSeen = true;
  await story.say('Der Heizer – und ein junger Schaffner. Er sieht aus … wie ich.');
  await story.say('Auf seinem Ärmel ein Abzeichen mit einer Nummer: 317.');
  story.note('Foto aus dem Spind: der Heizer mit einem jungen Schaffner, der aussieht wie ich. Dienstnummer am Ärmel: 317.');
}

async function tryDoor(story) {
  const opened = await tryCode(story, {
    id: 'door21', code: '317',
    wrong: (s) => (s.flags.photoSeen ? 'Falsch. Die Nummer am Ärmel …' : 'Falsch. Drei Ziffern.'),
  });
  if (!opened) return;
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Drei, eins, sieben. Offen. Dahinter: die Lok.');
    await story.say('Halb zwölf. Mit dem Lok-Schlüssel um den Hals. Dann warte ich dort auf ihn.');
    story.sound('door');
    await finishWagon(story, {
      number: 21,
      title: 'Ende von Wagen 21',
      lines: ['Der Heizer: „Herr Schaffner, Sie kommen doch jede Runde um halb zwölf hier vorbei, mit dem Lok-Schlüssel um den Hals.“', 'Joseph weiß jetzt, wo er den anderen Joseph findet.'],
      nextTitle: 'in der Lok',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.pressureOk) {
    return { id: 'pressure', lines: [
      'Der Heizer redet erst, wenn der Druck genau bei 25 bar steht. Von 42 runter auf 25 – also 17 weniger.',
      'Mit 8ern und 5ern allein kommt man nie auf genau 17. Blau gibt 3 dazu – dann sind es 20 weniger.',
      'Gelb viermal (−20), Blau einmal (+3).',
    ] };
  }
  if (!f.waterAsked) return { id: 'talk', lines: ['Jetzt mit dem Heizer reden.', 'Den Heizer anklicken und mit ihm sprechen.'] };
  if (!f.watered) {
    return { id: 'water', lines: [
      'Die Pumpe zieht nur bergab. Wenn die Kohlen nach vorne rutschen, sofort die Speisepumpe benutzen.',
      'Neben der Pumpe stehen bleiben und warten. Bergab geht es im letzten Drittel der Runde, eine Weile vor dem Tunnel.',
    ] };
  }
  if (!f.lockerOpen) return { id: 'talk2', lines: ['Noch einmal mit dem Heizer reden.', 'Den Heizer anklicken und mit ihm sprechen.'] };
  return { id: 'door', lines: ['Auf dem Foto aus dem Spind – am Ärmel steht eine Nummer.', 'Die Dienstnummer am Ärmel auf dem Foto: 317.'] };
}
