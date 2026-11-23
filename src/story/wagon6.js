import {
  CARD_HOMES, CARD_SLOTS, FOUND_SLIP, INDEX_CARDS, K_ORDER, LOCKER_SPOTS, SHELF_SPOTS, WATCH_SPOTS,
  drawCardBoard, drawFoundSlip, drawIndexCard, drawLockers, drawShelf, drawWatch,
} from './art/wagon6.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 6 – Das Fundbüro (niemand da – nur die Stimme des Schaffners aus dem Trichter)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Klingel: „Fundsachen nur gegen Fundschein. Fundscheine hinter der Klappe.“ Die Klappe im
//      Tresen hat ein Vorhängeschloss mit vier Ziffern.
//   2. Karteikasten: Karten über Fundsachen von Herrn K. – gefunden in Runde 109, 110, 112, 115,
//      also in der Zukunft! Nach Runde geordnet ergeben die Lagernummern den Code: 7 – 2 – 4 – 9.
//      (Zwei Karten gehören anderen und bleiben draußen.)
//   3. Klappe auf → Fundschein. Am Regal Herrn K.s acht Sachen nach den Beschreibungen finden,
//      dann an der Glocke abgeben → „Schließfach zwölf“ → eine stehen gebliebene Taschenuhr.
//   4. Gravur: „Stell mich auf die Tunnelzeit.“ Im Tunnel bleibt die Zeit stehen – auf 00:00
//      (das Kamerabild aus Wagen 1). Uhr auf 12 Uhr stellen und auf den Tunnel warten: Im Dunkeln
//      springt der Deckel auf, innen ist der Türcode eingraviert: 0612.
//
// Ergebnis: Herrn K.s Sachen tauchen erst ab Runde 109 auf – er verschwindet erst im nächsten Tunnel (Ende von Runde 108).
//           Ich kann ihn noch warnen.

const PADLOCK_CODE = '7249';
const DOOR_CODE = '0612';
const HORN = { x: 640, y: 150 };
const VOICE = '#a6f0b6';

export const wagon6 = {
  flags: {},
  startItems: ['flashlight', 'knife', 'photo'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Speisewagen: Das vergiftete Glas war für Herrn K. bestimmt. Den Wein brachte jemand, der aussieht wie ich.',
    'Schlafwagen: Herr K. war nicht in seinem Abteil. Seine Spuren führen nach vorne, zum Tunnel. Auf seinem Fahrschein: „Runde 108“.',
    'Im Koffer von Herrn K.: ein Foto von ihm und dem Schaffner, vor einem Weihnachtsbaum. „24. 12.“',
    'Wagen 1: Auf dem Kamerabild aus dem Tunnel stand die Uhr still – auf 00:00:00.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 6,
      title: 'Das Fundbüro',
      lines: [
        'Ein Fundbüro. Mitten im Zug.',
        'Hüte, Schirme, Koffer … Was hier wohl alle verloren haben?',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    bell: {
      look: 'Eine Tischglocke aus Messing. „Bitte klingeln.“',
      use: (story) => ringBell(story),
      items: { ticketPad: (story) => ringBell(story) },
    },
    padlock: {
      look: 'Ein Vorhängeschloss an der Klappe im Tresen. Vier Rädchen.',
      use: (story) => openPadlock(story),
      items: { knife: 'Das Schloss ist aus Stahl. Das Messer nicht.' },
    },
    flap: {
      look: (story) => story.say(story.flags.flapOpen ? 'Die Klappe ist offen. Dahinter: die Tür nach vorne.' : 'Eine Klappe im Tresen. Abgeschlossen. Dahinter liegt die Tür nach vorne.'),
      use: (story) => (story.flags.flapOpen ? story.say('Die Klappe ist offen.') : openPadlock(story)),
    },
    index: {
      look: 'Ein Karteikasten mit lauter kleinen Schubladen. „Fundkartei“.',
      use: (story) => openIndex(story),
    },
    counter: {
      look: 'Ein schwerer Holztresen. Ich komme nicht drüber – nur durch die Klappe.',
      use: 'Zu hoch zum Drüberklettern. Und ein Fundbüro hat Regeln.',
    },
    horn: {
      look: 'Ein Messingtrichter über der Tür. Ein Lautsprecher.',
      use: async (story) => {
        await story.say('Hallo? Wer spricht da?');
        story.sound('speaker');
        await story.wait(1);
        if (story.flags.heardVoice) await story.speak('… bitte klingeln …', { at: HORN, color: VOICE });
        else await story.say('Nur ein Knistern.');
      },
    },
    door: {
      look: (story) => story.say(story.flags.flapOpen ? 'Die Tür nach vorne. Ein Tastenfeld mit vier Ziffern.' : 'Die Tür nach vorne – hinter dem Tresen. Ohne die Klappe komme ich nicht hin.'),
      use: (story) => tryDoor(story),
    },
    keypads: { look: 'Schalttafeln mit Knöpfen. Die Beschriftung ist abgegriffen.' },
    lockers: {
      look: 'Zwölf Schließfächer aus Blech, nummeriert von 1 bis 12.',
      use: (story) => openLockers(story),
    },
    shelf: {
      look: 'Ein riesiges Regal voller Fundsachen. Hüte, Schirme, Handschuhe, Teddybären …',
      use: (story) => openShelf(story),
      items: { ticketPad: (story) => openShelf(story) },
    },
    shelfRight: {
      look: 'Noch ein Regal: Teddybär, Fußball, Trompete, eine Laterne. Alles Fundsachen.',
      use: 'Nichts davon gehört Herrn K., glaube ich.',
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Draußen der verschneite Wald. Und der Turm.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    ticketPad: { look: (story) => lookSlip(story) },
    watch: { look: (story) => openWatch(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (!inside) return;
    story.flags.tunnels = tunnels(story) + 1;
    story.game.closeViewsInDark();
    const f = story.flags;
    if (!story.has('watch')) return;
    await story.idle();
    if (f.watchSet && !f.watchOpen) {
      await story.cutscene(async () => {
        await story.wait(0.6);
        story.sound('latch');
        await story.say('Klick! Die Taschenuhr – im Dunkeln leuchtet sie. Und der Deckel springt auf!');
        f.watchOpen = true;
        await story.say(`Innen im Deckel ist etwas eingraviert: „Tür – ${DOOR_CODE.split('').join(' ')}“.`);
      });
      story.note(`Im Tunnel sprang der Deckel der Taschenuhr auf (sie stand auf 12 Uhr). Innen eingraviert: „Tür – ${DOOR_CODE.split('').join(' ')}“.`);
    } else if (!f.watchSet && !f.watchTunnelHint) {
      f.watchTunnelHint = true;
      await story.say('Die Taschenuhr tickt kurz – und steht wieder. Sie steht wohl auf der falschen Zeit.');
    }
  },
};

// ============================================================================================
//  Glocke und Stimme
// ============================================================================================

async function ringBell(story) {
  const f = story.flags;
  story.sound('bell');
  await story.wait(1);
  story.sound('speaker');
  if (f.slipDone && !f.lockerOpen) {
    f.lockerOpen = true;
    await story.speak('Fundschein angenommen. Herr K., Abteil vier. Acht Gegenstände.', { at: HORN, color: VOICE });
    await story.speak('Moment … diese Sachen werden erst in Runde hundertneun gefunden. Sie sind zu früh, junger Mann.', { at: HORN, color: VOICE });
    await story.speak('Für Herrn K. liegt nur eines bereit: Schließfach zwölf.', { at: HORN, color: VOICE });
    story.sound('unlock');
    await story.say('Zu früh? Dann ist Herr K. noch gar nicht verschwunden!');
    story.note('Die Stimme: Herrn K.s Sachen werden erst in Runde 109 gefunden – ich bin zu früh. Für Herrn K. liegt etwas in Schließfach 12.');
    return;
  }
  if (f.lockerOpen) {
    await story.speak('Schließfach zwölf. Schönen Abend noch.', { at: HORN, color: VOICE });
    return;
  }
  if (f.flapOpen && story.has('ticketPad')) {
    await story.speak('Ihr Fundschein ist nicht vollständig. Alle Gegenstände ankreuzen, bitte.', { at: HORN, color: VOICE });
    return;
  }
  f.heardVoice = true;
  await story.speak('Fundbüro der Ringbahn. Fundsachen werden nur gegen ausgefüllten Fundschein herausgegeben.', { at: HORN, color: VOICE });
  await story.speak('Fundscheine liegen hinter der Klappe. Der Schlüssel zur Klappe … steht in der Kartei.', { at: HORN, color: VOICE });
  if (!f.voiceKnown) {
    f.voiceKnown = true;
    await story.say('Diese Stimme … Das ist die Stimme aus den Lautsprechern. Der Schaffner?');
    story.note('Fundbüro, Stimme aus dem Trichter (der Schaffner?): Fundsachen nur gegen Fundschein. Fundscheine hinter der Klappe im Tresen. „Der Schlüssel zur Klappe steht in der Kartei.“');
  }
}

// ============================================================================================
//  Kartei und Vorhängeschloss
// ============================================================================================

async function openIndex(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Karten nicht lesen.');
  if (story.flags.indexDone) return story.say(`Die Karten liegen geordnet. Lager ${PADLOCK_CODE.split('').join(', ')}.`);
  if (!story.flags.indexSeen) {
    story.flags.indexSeen = true;
    await story.say('Karteikarten. Fundsachen, Besitzer, wann und wo gefunden …');
  }
  const solved = await story.view('arrange', {
    id: 'index',
    title: 'Die Fundkartei',
    slots: CARD_SLOTS,
    tokens: INDEX_CARDS.map((card, i) => ({ id: card.id, label: card.thing, w: 200, h: 124, home: CARD_HOMES[i] })),
    drawBackground: drawCardBoard,
    drawToken: drawIndexCard,
    check: (placement) => placement.every((id, i) => id === K_ORDER[i]),
    help: 'Karten mit gedrückter Maustaste auf die Plätze oben ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!story.flags.futureNoticed && !inTunnel(story)) {
      story.flags.futureNoticed = true;
      await story.say('Runde 109, 110, 112 … Herr K.s Sachen werden alle erst in späteren Runden gefunden.');
      story.note('Fundkartei: Herrn K.s Sachen werden erst in Runde 109, 110, 112 und 115 gefunden. Jede Karte hat eine Lagernummer.');
    }
    return;
  }
  story.flags.indexDone = true;
  await story.say('Hut – Runde 109, Lager 7. Schal – 110, Lager 2. Brille – 112, Lager 4. Spazierstock – 115, Lager 9.');
  await story.say('Sieben, zwei, vier, neun.');
  story.note(`Herrn K.s Karteikarten, nach Runden geordnet: Lager 7, 2, 4, 9. Der Schlüssel zur Klappe?`);
}

async function openPadlock(story) {
  if (story.flags.flapOpen) return story.say('Die Klappe ist offen.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'padlock',
    digits: 4,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === PADLOCK_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say(story.flags.heardVoice ? '„Der Schlüssel zur Klappe steht in der Kartei.“ Ich sollte mir die Karteikarten ansehen.' : 'Zu. Vier Ziffern.');
    }
    return;
  }
  story.flags.flapOpen = true;
  story.sound('unlock');
  await story.say('Die Klappe ist auf!');
  story.give('ticketPad');
  await story.say('Gleich dahinter liegt ein Block Fundscheine. Einen nehme ich mit.');
  story.note('Klappe im Tresen offen (Code 7249). Ich habe einen Fundschein: Herrn K.s verlorene Sachen sind darauf beschrieben – ich muss sie im Regal finden und ankreuzen.');
  await lookSlip(story);
}

// ============================================================================================
//  Fundschein und Regal
// ============================================================================================

async function lookSlip(story) {
  story.sound('paper');
  await story.card({ draw: (ctx) => drawFoundSlip(ctx, story.flags.shelfFound ?? []) });
  if (story.flags.slipRead) return;
  story.flags.slipRead = true;
  await story.say('Herr K. hat seine Sachen selbst beschrieben. Als hätte er gewusst, dass er sie verliert.');
  story.note(`Fundschein für Herrn K. – acht Sachen: ${FOUND_SLIP.map(([, d]) => d).join('; ')}.`);
}

async function openShelf(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich da gar nichts.');
  const f = story.flags;
  if (!story.has('ticketPad')) {
    await story.say('So viele Sachen. Ohne zu wissen, was ich suche, finde ich hier nie etwas.');
    return;
  }
  if (f.slipDone) return story.say('Alles angekreuzt. Jetzt den Fundschein an der Glocke abgeben.');
  f.shelfFound ??= [];
  await story.view('picture', {
    draw: (ctx) => drawShelf(ctx, f.shelfFound),
    // Ohne Rahmen und ohne Namen am Mauszeiger – sonst verrät das Suchbild sich selbst
    spots: SHELF_SPOTS.map((spot) => ({ ...spot, name: spot.label, label: '', quiet: true })),
    backdrop: 1,
    help: 'Herrn K.s Sachen suchen (Beschreibungen: Rechtsklick auf den Fundschein im Inventar)  ·  Rechtsklick: zurück',
    onClick: (spot, view) => pickShelf(story, spot, view),
  });
}

async function pickShelf(story, spot, view) {
  const f = story.flags;
  if (f.shelfFound.includes(spot.id)) return story.say('Das habe ich schon angekreuzt.');
  if (!spot.mine) {
    story.sound('wrong');
    return story.say(pick([`${spot.name}? Das steht nicht auf dem Fundschein.`, 'Das gehört bestimmt nicht Herrn K.', `Nein, ${spot.name} passt zu keiner Beschreibung.`]));
  }
  f.shelfFound.push(spot.id);
  story.sound('click');
  const description = FOUND_SLIP.find(([id]) => id === spot.id)[1];
  await story.say(`„${description}“ – ${spot.name}. Angekreuzt.`);
  const count = f.shelfFound.length;
  if (count === 8) {
    f.slipDone = true;
    story.sound('success');
    await story.say('Alle acht! Jetzt den Fundschein abgeben – an der Glocke.');
    story.note('Alle acht Sachen von Herrn K. auf dem Fundschein angekreuzt. Jetzt an der Glocke abgeben.');
    view.close();
  }
}

// ============================================================================================
//  Schließfächer und Taschenuhr
// ============================================================================================

async function openLockers(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Nummern nicht lesen.');
  const f = story.flags;
  await story.view('picture', {
    draw: (ctx) => drawLockers(ctx, f.watchTaken ? [12] : []),
    spots: LOCKER_SPOTS,
    area: { x: 360, y: 50, w: 560, h: 620 },
    help: 'Klicken: Schließfach öffnen  ·  Rechtsklick: zurück',
    onClick: async (spot) => {
      const n = Number(spot.id.slice(6));
      if (n !== 12 || !f.lockerOpen) {
        story.sound('locked');
        return story.say(n === 12 ? 'Schließfach zwölf. Abgeschlossen.' : `Schließfach ${n}. Abgeschlossen.`);
      }
      if (f.watchTaken) return story.say('Leer. Die Taschenuhr habe ich.');
      f.watchTaken = true;
      story.sound('door');
      story.give('watch');
      await story.say('Schließfach zwölf ist offen! Darin: eine goldene Taschenuhr. Sie steht.');
      await story.say('Auf der Rückseite eingraviert: „Stell mich auf die Tunnelzeit.“');
      story.note('In Schließfach 12: eine goldene Taschenuhr, die steht. „Für K. – dein Schaffner.“ Rückseite: „Stell mich auf die Tunnelzeit.“');
    },
  });
}

async function openWatch(story) {
  const f = story.flags;
  f.hours ??= 9;
  f.minutes ??= 35;
  await story.view('picture', {
    draw: (ctx) => drawWatch(ctx, { hours: f.hours, minutes: f.minutes, open: f.watchOpen, code: DOOR_CODE }),
    spots: f.watchOpen ? [] : WATCH_SPOTS,
    staysInDark: true,
    help: f.watchOpen ? 'Rechtsklick: zurück' : 'Stellräder anklicken: Uhr stellen  ·  Rechtsklick: zurück',
    onClick: async (spot) => {
      story.sound('wheel');
      if (spot.id === 'hours') f.hours = (f.hours % 12) + 1;
      else f.minutes = (f.minutes + 5) % 60;
      const wasSet = f.watchSet;
      f.watchSet = f.hours === 12 && f.minutes === 0;
      if (f.watchSet && !wasSet && !f.watchSetSaid) {
        f.watchSetSaid = true;
        await story.say('Zwölf Uhr. Null Uhr. Wie die Uhr auf dem Kamerabild im Tunnel.');
        story.note('Taschenuhr auf 12 Uhr gestellt – die Zeit, auf der im Tunnel alles stehen bleibt. Jetzt auf den Tunnel warten?');
      }
    },
  });
}

// ============================================================================================
//  Tür
// ============================================================================================

async function tryDoor(story) {
  const f = story.flags;
  if (!f.flapOpen) return story.say('Die Tür ist hinter dem Tresen. Erst muss die Klappe auf.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Tasten nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door6',
    digits: 4,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say('Falsch. Die Tür bleibt zu.');
    }
    return;
  }
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Offen! Seine Sachen tauchen erst ab Runde 109 auf. Dann verschwindet er erst im nächsten Tunnel – am Ende von Runde 108.');
    await story.say('Dann ist er noch irgendwo im Zug. Und ich kann ihn noch warnen!');
    story.note('Herrn K.s Sachen tauchen erst ab Runde 109 auf: Er verschwindet erst im nächsten Tunnel, am Ende von Runde 108. Ich kann ihn noch warnen!');
    await finishWagon(story, {
      number: 6,
      title: 'Ende von Wagen 6',
      lines: ['Herr K. verschwindet erst morgen. Joseph kann ihn noch warnen.'],
      nextTitle: 'im Barwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.heardVoice && !f.flapOpen) return { id: 'bell', lines: ['Auf dem Tresen steht eine Glocke: „Bitte klingeln.“'] };
  if (!f.flapOpen) {
    if (!f.indexDone) {
      return { id: 'index', lines: [
        '„Der Schlüssel zur Klappe steht in der Kartei.“ Der Karteikasten steht rechts auf dem Tresen.',
        'Nur Herrn K.s Karten gehören auf die Plätze – in der Reihenfolge, in der seine Sachen gefunden werden (nach Runde).',
        'Hut (Runde 109), Schal (110), Brille (112), Spazierstock (115). Die Lagernummern der Reihe nach sind der Code.',
      ] };
    }
    return { id: 'padlock', lines: ['Die Lagernummern der Karten von Herrn K., der Reihe nach: 7, 2, 4, 9 – das Vorhängeschloss an der Klappe.'] };
  }
  if (!f.slipDone) {
    return { id: 'shelf', lines: [
      'Auf dem Fundschein sind Herrn K.s Sachen beschrieben. Das große Regal links ansehen und die acht Sachen finden.',
      'Zum Gruß lüftet man den Hut. Rot um den Hals: der Schal. Rauch nach dem Essen: die Pfeife. Das Geschenk mit rotem Siegel ist ein Päckchen.',
    ] };
  }
  if (!f.lockerOpen) return { id: 'give', lines: ['Der Fundschein ist ausgefüllt. Abgeben: an der Glocke klingeln.'] };
  if (!f.watchTaken) return { id: 'locker', lines: ['Die Stimme sagte: Schließfach zwölf. Die Schließfächer sind rechts an der Wand.'] };
  if (!f.watchOpen) {
    if (!f.watchSet) {
      return { id: 'watch', lines: [
        '„Stell mich auf die Tunnelzeit.“ Welche Uhrzeit ist im Tunnel?',
        'Im ersten Abteil zeigte das Kamerabild aus dem Tunnel eine Uhr, die stillstand: 00:00:00.',
        'Rechtsklick auf die Taschenuhr, dann an den Rädern drehen, bis sie genau 12 Uhr zeigt.',
      ] };
    }
    return { id: 'wait', lines: ['Die Uhr steht auf der Tunnelzeit. Jetzt auf den Tunnel warten – am Fenster.'] };
  }
  return { id: 'door', lines: [`Im Deckel der Uhr steht der Türcode: ${DOOR_CODE}. Die Tür ist hinter der offenen Klappe.`] };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
