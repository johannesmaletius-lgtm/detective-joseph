import { OUT_SPOT, STRIP_SPOTS, drawEvidence, drawStrip, drawTender } from './art/wagon22.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 22 – Die Lok (Führerstand), mit dem anderen Joseph
// ============================================================================================
//
// DIE RÄTSEL
//   1. Fahrtenschreiber: Der Papierstreifen der Unglücksnacht. Bei Kilometer 24,7 (Weiche 7, vom
//      Tunnelfoto) steht die Uhrzeit 23:43 → 2343 öffnet die Luke zum Kohlentender.
//   2. Im Tender verstecken und durch den Spalt warten, bis es genau halb zwölf ist. Um 23:30 kommt
//      er herein, um 23:31 steht er am Pult. Wer zu früh herauskommt, verscheucht ihn; wer zu spät
//      kommt, verpasst ihn. Dann: nächste Runde, noch einmal.
//   3. Ihn zur Rede stellen: die Beweise in der richtigen Reihenfolge vorlegen –
//      Familienfoto (vorher), Pressefoto (jene Nacht), Miras Karte (ihr Wunsch). Falsch: Er geht wortlos.
//
// ERGEBNIS: Er nimmt die Mütze ab – der Schaffner, älter, mit Schnurrbart. „Ich bin du. Der Tunnel ist
// kein Ende, er ist der Ausgang. Und du holst sie mir jede Runde zurück.“ – „Du lügst.“ Er geht.

const HATCH_CODE = '2343';
const ORDER = ['family', 'press', 'card'];
const EVIDENCE = { family: 'Das Familienfoto', press: 'Das Pressefoto', card: 'Miras Karte' };

export const wagon22 = {
  flags: {},
  startItems: ['flashlight', 'paddle', 'familyPhoto', 'pressPhoto'],
  recap: [
    'Der Weihnachtszug ist an Weiche 7 abgebogen (Kilometer 24,7). Den Lok-Schlüssel hat der andere Joseph.',
    'Der Heizer: „Herr Schaffner, Sie kommen doch jede Runde um halb zwölf hier vorbei, mit dem Lok-Schlüssel um den Hals, und gehen nach vorne in die Lok.“',
    'Beweise: das Familienfoto aus der Kapelle, das Pressefoto vom Bahnsteig, Miras Karte.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 22,
      title: 'Die Lok',
      lines: [
        'Der Führerstand. Ganz vorne. Weiter geht es nicht.',
        'Um halb zwölf kommt er hierher. Ich muss mich verstecken.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    recorder: {
      look: 'Ein Fahrtenschreiber. Er zeichnet Geschwindigkeit und Zeit auf – ein langer Papierstreifen.',
      use: (story) => readStrip(story),
    },
    hatch: {
      look: (story) => story.say(story.flags.hatchOpen ? 'Die Luke zum Kohlentender ist offen.' : 'Eine Bodenluke – darunter der Kohlentender. Ein Zahlenschloss mit vier Rädchen.'),
      use: (story) => openHatch(story),
    },
    desk: {
      look: 'Das Fahrpult. Hebel, Ventile, ein Schlüsselloch.',
      use: 'Ohne Lok-Schlüssel rührt sich hier nichts.',
    },
    keyhole: {
      look: 'Das Schlüsselloch für den Lok-Schlüssel. Leer.',
      use: 'Ohne Lok-Schlüssel geht hier gar nichts.',
    },
    clock: { look: 'Eine kleine Uhr im Führerstand. Es ist kurz nach elf.' },
    firebox: { look: 'Die Feuerbüchse. Sie glüht.', use: 'Viel zu heiß.' },
    waterGlass: { look: 'Der Wasserstand. Halb voll.' },
    other: { look: 'Er. Mit meiner Mütze, meiner Brille, meinem Schal.', use: (story) => confront(story) },
    conductor: { look: 'Der Schaffner. Älter. Mit Schnurrbart. Er sieht aus wie ich – in zwanzig Jahren.', use: (story) => story.say('Er sieht mich nur an.') },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Die Schienen glänzen im Mondlicht. Ganz vorne.'),
      use: (story) => waitForTunnel(story),
    },
  },

  items: {
    familyPhoto: { look: (story) => story.card({ draw: (ctx) => drawEvidence(ctx, 'family') }) },
    pressPhoto: { look: (story) => story.card({ draw: (ctx) => drawEvidence(ctx, 'press') }) },
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
//  1. Fahrtenschreiber und Luke
// ============================================================================================

async function readStrip(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Linie nicht.');
  const state = { offset: 0 };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawStrip(ctx, view.state),
    spots: STRIP_SPOTS,
    area: { x: 120, y: 90, w: 1040, h: 560 },
    help: 'Pfeile: Streifen rollen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      s.offset = Math.max(0, Math.min(4, s.offset + (spot.id === 'forward' ? 1 : -1)));
      story.sound('paper');
    },
  });
  if (story.flags.stripRead) return;
  story.flags.stripRead = true;
  await story.say('Der Streifen aus der Weihnachtsnacht. Die Geschwindigkeit bleibt die ganze Zeit oben – niemand hat gebremst.');
  story.note('Fahrtenschreiber vom 24.12.: Kilometer und Uhrzeit, niemand hat gebremst. (Weiche 7 lag bei Kilometer 24,7.)');
}

async function openHatch(story) {
  const f = story.flags;
  if (f.hatchOpen) return hide(story);
  const opened = await tryCode(story, {
    id: 'hatch22', code: HATCH_CODE, style: 'steel',
    wrong: (s) => (s.flags.stripRead ? 'Falsch. Welche Uhrzeit steht bei Kilometer 24,7?' : 'Falsch. Vier Ziffern – eine Uhrzeit?'),
  });
  if (!opened) return;
  f.hatchOpen = true;
  story.sound('creak');
  await story.say('Dreiundzwanzig Uhr dreiundvierzig. Genau da ist der Zug an Weiche 7 abgebogen. Die Luke ist auf.');
  await hide(story);
}

// ============================================================================================
//  2. Warten im Tender
// ============================================================================================

async function hide(story) {
  const f = story.flags;
  if (f.caught) return story.say('Ich muss mich nicht mehr verstecken.');
  await story.say('Ich klettere in den Tender und ziehe die Luke fast zu. Durch den Spalt sehe ich den Führerstand.');
  const state = { minute: 24, seconds: 0 };
  const result = await story.view('picture', {
    state,
    backdrop: 1,
    draw: (ctx, view) => drawTender(ctx, { ...view.state, background: story.scene.background }),
    spots: [OUT_SPOT],
    help: 'Warten … und im richtigen Moment herauskommen  ·  Rechtsklick: zurück',
    update: (dt, view) => {
      const s = view.state;
      s.seconds += dt * 30; // eine Minute alle zwei Sekunden
      if (s.seconds >= 60) {
        s.seconds -= 60;
        s.minute += 1;
        if (s.minute === 30) story.sound('door');
        if (s.minute === 31) story.sound('key');
        if (s.minute >= 33) view.close('late');
      }
    },
    onClick: async (spot, view) => view.close(view.state.minute < 30 ? 'early' : view.state.minute < 31 ? 'early2' : 'ok'),
  });
  if (result === false) return story.say('Ich klettere wieder hinaus. Noch ist es nicht so weit.');
  if (result !== 'ok') return missed(story, result);
  f.caught = true;
  f.otherHere = true;
  story.player.x = 560;
  story.player.y = 640;
  story.player.facing = 'right';
  await story.cutscene(async () => {
    await story.say('Halb zwölf. Er steckt den Schlüssel ins Schloss – jetzt!');
    story.sound('creak');
    await story.say('Stehen bleiben!');
    story.character('other').pose = 'left';
    await story.speakAs('other', '…');
    await story.say('Ich weiß, wer du bist. Oder – ich weiß, was du tust. Du holst sie. Einen nach dem anderen.');
  });
  story.note('In der Lok: Um halb zwölf kam er mit dem Lok-Schlüssel. Ich habe ihn erwischt. Jetzt muss ich ihm die Beweise vorlegen – in der richtigen Reihenfolge.');
  await confront(story);
}

async function missed(story, how) {
  await story.cutscene(async () => {
    if (how === 'early') {
      await story.say('Ich klettere hinaus – zu früh! Die Tür geht auf, er sieht mich …');
      await story.say('… und weg ist er. Zurück in den Zug.');
    } else if (how === 'early2') {
      await story.say('Er kommt gerade herein – und sieht mich, bevor er am Pult ist. Er dreht sich um und rennt.');
    } else {
      await story.say('Zu spät! Er hat den Schlüssel schon wieder abgezogen und ist fort.');
    }
    await story.fadeOut(1);
    story.motion.skipToTunnel(1);
    await story.wait(2.2);
    story.fadeIn(1);
    await story.say('Neue Runde. Gleiche Zeit. Noch einmal – genau um halb zwölf, wenn er am Pult steht.');
  });
  if (!story.flags.timingNoted) {
    story.flags.timingNoted = true;
    story.note('Im Tender warten: Um 23:30 kommt er herein, um 23:31 steckt er den Schlüssel ins Pult. Dann – und nicht früher – herauskommen.');
  }
}

// ============================================================================================
//  3. Die Beweise
// ============================================================================================

async function confront(story) {
  const f = story.flags;
  if (!f.caught || f.revealed) return;
  const shown = [];
  while (shown.length < ORDER.length) {
    const left = ORDER.filter((id) => !shown.includes(id));
    const options = left.map((id) => ({ id, text: `${EVIDENCE[id]} vorlegen.` }));
    const choice = await story.choose(options);
    if (choice < 0) {
      await story.say('Ich muss ihm etwas zeigen. Sonst geht er.');
      continue;
    }
    const id = options[choice].id;
    await story.card({ draw: (ctx) => drawEvidence(ctx, id) });
    if (id !== ORDER[shown.length]) {
      await story.cutscene(async () => {
        await story.speakAs('other', '…');
        await story.say('Er schüttelt nur den Kopf. Und geht wortlos an mir vorbei.');
        f.otherHere = false;
        f.caught = false;
        await story.fadeOut(1);
        story.motion.skipToTunnel(1);
        await story.wait(2.2);
        story.fadeIn(1);
        await story.say('Nächste Runde. Die Reihenfolge muss stimmen: Wie war es vorher, was geschah in jener Nacht – und was wünscht sich Mira?');
      });
      if (!f.orderNoted) {
        f.orderNoted = true;
        story.note('Die Beweise in der falschen Reihenfolge – er ging wortlos. Erst das Vorher, dann jene Nacht, dann Miras Wunsch.');
      }
      return;
    }
    shown.push(id);
    const lines = {
      family: 'Das bist du. Mit deiner Frau und deiner Tochter. Vor dem Weihnachtsbaum.',
      press: 'Und das bist du am Bahnsteig. In der Nacht, als der Zug nicht kam.',
      card: '„Für Papa. Damit du uns nach Hause bringst.“ Von Mira.',
    };
    await story.say(lines[id]);
  }
  await reveal(story);
}

async function reveal(story) {
  const f = story.flags;
  f.revealed = true;
  await story.cutscene(async () => {
    await story.wait(0.6);
    story.sound('dread');
    await story.say('Er hebt langsam die Hand … und nimmt die Mütze ab.');
    f.otherHere = false;
    f.capOff = true;
    await story.wait(0.8);
    await story.say('Graue Schläfen. Ein Schnurrbart. Ein älteres Gesicht. Das Gesicht vom Familienfoto.');
    await story.say('Der Schaffner.');
    await story.speakAs('conductor', 'Ich bin du, Junge.');
    await story.speakAs('conductor', 'Der Tunnel ist kein Ende. Er ist der Ausgang.');
    await story.speakAs('conductor', 'Wer durchgeht, kommt nach Hause. Wird wieder älter. Lebt weiter.');
    await story.speakAs('conductor', 'Und du holst sie mir jede Runde zurück.');
    await story.say('Du lügst.');
    await story.speakAs('conductor', 'Halb zwölf. Wie jede Runde.');
    story.sound('key');
    await story.say('Er zieht den Lok-Schlüssel ab, steckt ihn ein – und geht an mir vorbei. Einfach so.');
    const conductor = story.character('conductor');
    await conductor.moveTo(1180, 600, 2.6);
    f.capOff = false;
    story.sound('door');
    story.note('Er nahm die Mütze ab: der Schaffner, älter, mit Schnurrbart. „Ich bin du. Der Tunnel ist kein Ende, er ist der Ausgang. Und du holst sie mir jede Runde zurück.“ Ich sagte: „Du lügst.“ Er ging mit dem Lok-Schlüssel.');
    await finishWagon(story, {
      number: 22,
      title: 'Ende von Wagen 22',
      lines: ['„Ich bin du. Der Tunnel ist kein Ende, er ist der Ausgang. Und du holst sie mir jede Runde zurück.“', '„Du lügst.“'],
      nextTitle: 'im Wartungsgang',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.hatchOpen) {
    return { id: 'hatch', lines: [
      'Die Luke zum Kohlentender will vier Ziffern. Der Fahrtenschreiber zeigt Kilometer und Uhrzeiten aus jener Nacht.',
      'Weiche 7 lag bei Kilometer 24,7 (das Tunnelfoto). Welche Uhrzeit steht dort? Den Streifen weiterrollen.',
      '23:43 → 2343.',
    ] };
  }
  if (!f.caught) {
    return { id: 'wait', lines: [
      'Im Tender verstecken und warten: Er kommt um halb zwölf.',
      'Um 23:30 geht die Tür auf, um 23:31 steckt er den Schlüssel ins Pult. Erst dann herauskommen.',
    ] };
  }
  return { id: 'evidence', lines: [
    'Die Beweise in der richtigen Reihenfolge: wie es vorher war, was in jener Nacht geschah, und was Mira sich wünscht.',
    'Familienfoto, dann Pressefoto, dann Miras Karte.',
  ] };
}
