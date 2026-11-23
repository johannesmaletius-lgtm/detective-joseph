import { SET_SPOTS, WALL, drawClockWall, drawSetting, strikesAtCall, wallSpots } from './art/wagon11.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 11 – Der Uhrenwagen (Herr Tick)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Die Uhr finden, die mit dem Mond geht: An der Uhrenwand dreht sich ein Zeiger einmal pro
//      Runde. Damit versteht Joseph die „Mondzeit“ (0:00 nach dem Tunnel, 2:00 beim nächsten).
//   2. Gespräch mit Herrn Tick: 108 Runden gezählt, der Ruf kommt immer um 1:50 Mondzeit.
//      Er hat Angst. Nur etwas Lauteres als die Stimme kann ihn halten.
//   3. Standuhr (doppelt so schnell) und Kuckucksuhr (halb so schnell) so stellen, dass sie genau
//      beim Ruf zur vollen Stunde schlagen. Sie laufen nach dem Tunnel 110 Mondminuten:
//      Standuhr :20 (20 + 220 = 240), Kuckucksuhr :05 (5 + 55 = 60).
//      Dann auf die nächste Runde warten. Stimmt es nicht, hört Tick den Ruf und geht –
//      nach dem Tunnel ist er wieder da (Zeitschleife), und Joseph kann es noch einmal versuchen.
//
// ERGEBNIS: Erste Rettung. Herr Tick gibt Joseph ein Zahnrad: „Das wirst du vorne brauchen.“

const CALL_BEFORE_TUNNEL = 14; // Sekunden vor dem Tunnel kommt der Ruf
const VOICE = '#a6f0b6';
const TICK_HOME = { x: 520, y: 520 };

export const wagon11 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jeder Runde verschwindet im Tunnel ein Fahrgast. Der Schaffner ruft sie über die Lautsprecher – wer den Ruf hört, geht wie im Schlaf.',
    'Auf dem Tonband aus Runde 108, rückwärts: „… wie die anderen. Elf ist der Nächste.“',
    'Ich habe Herrn K. nicht retten können. Diesmal will ich rechtzeitig da sein.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 11,
      title: 'Der Uhrenwagen',
      lines: [
        'Tick, tack, tick, tack. Hunderte Uhren.',
        'Wagen elf. „Elf ist der Nächste.“ Und da steht jemand.',
      ],
      firstTunnelIn: 130,
    });
  },

  skipIntro: (story) => skipIntro(story, 130),

  update(story) {
    const f = story.flags;
    if (f.saved || f.calling) return;
    if (story.motion.tunnelAhead <= CALL_BEFORE_TUNNEL && f.calledLap !== story.lap) {
      f.calledLap = story.lap;
      f.calling = true;
      theCall(story).finally(() => {
        f.calling = false;
      });
    }
  },

  hotspots: {
    tick: {
      look: 'Ein alter Herr mit Lupenbrille und Lederschürze. Er zählt leise mit.',
      use: (story) => talkToTick(story),
    },
    wallClocks: {
      look: 'Wanduhren über Wanduhren. Jede zeigt eine andere Zeit.',
      use: (story) => findMoonClock(story),
    },
    grandfather: {
      look: 'Eine große Standuhr. Herr Tick sagt, sie geht doppelt so schnell.',
      use: (story) => setClocks(story),
    },
    cuckoo: {
      look: 'Eine Kuckucksuhr. Sie geht nur halb so schnell, sagt Herr Tick.',
      use: (story) => setClocks(story),
    },
    bench: {
      look: 'Herrn Ticks Werkbank. Lupen, Pinzetten, Zahnräder.',
      use: 'Hier repariert er Uhren. Ich fasse lieber nichts an.',
    },
    glassDome: { look: 'Unter einer Glasglocke: ein Uhrwerk ohne Gehäuse. Ein Zahnrad fehlt.' },
    sofa: { look: 'Eine lange Sitzbank. Sieht bequem aus. Zu bequem.' },
    door: {
      look: 'Die Tür nach vorne.',
      use: (story) => (story.flags.saved ? ending(story) : story.say('Ich gehe nicht, bevor Herr Tick in Sicherheit ist.')),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Der Mond. Und der Turm.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    const f = story.flags;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      if (f.tickGone) story.character('tick').alpha = 0;
      return;
    }
    if (f.tickGone) {
      // Zeitschleife: Herr Tick ist wieder da
      f.tickGone = false;
      const tick = story.character('tick');
      tick.x = TICK_HOME.x;
      tick.y = TICK_HOME.y;
      tick.pose = 'front';
      tick.alpha = 1;
      await story.idle();
      await story.say('Herr Tick! Er steht wieder da, als wäre nichts gewesen.');
      await story.speakAs('tick', 'Runde … hundertneun? Hundertzehn? Ich habe mich verzählt.');
      if (!f.loopNoted) {
        f.loopNoted = true;
        story.note('Wenn Herr Tick dem Ruf folgt, ist er nach dem Tunnel wieder da. Ich kann es noch einmal versuchen.');
      }
    }
    if (f.clocksSet && f.armedLap === story.lap - 1 && !f.runningSaid) {
      f.runningSaid = true;
      await story.idle();
      await story.say('Die Standuhr tickt. Die Kuckucksuhr auch. Sie laufen.');
    }
  },
};

// ============================================================================================
//  1. Die Uhr, die mit dem Mond geht
// ============================================================================================

async function findMoonClock(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich keine Zeiger.');
  const state = { time: 0 };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawClockWall(ctx, { lapShare: story.motion.lapTime / story.motion.lapLength, time: view.state.time }),
    spots: wallSpots(),
    area: { x: 120, y: 70, w: 1040, h: 560 },
    update: (dt, view) => {
      view.state.time += dt;
    },
    help: 'Genau hinsehen  ·  Klicken: diese Uhr untersuchen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const clock = WALL.find((c) => c.id === spot.id);
      if (clock.kind === 'stop') return story.say('Die steht still.');
      if (clock.kind === 'run') return story.say('Die tickt ganz normal. Eine Sekunde pro Sekunde.');
      if (f.moonClock) return story.say('Die Monduhr. Einmal herum pro Runde.');
      f.moonClock = true;
      await story.say('Die hier! Nur ein Zeiger, mit einem kleinen Mond daran. Er wandert – genauso wie der Mond von Fenster zu Fenster.');
      await story.say('Einmal herum pro Runde. Oben steht er, wenn wir aus dem Tunnel kommen.');
      story.note('Die Monduhr an der Wand: ein Zeiger, einmal herum pro Runde. Oben = gerade aus dem Tunnel.');
      view.close(true);
    },
  });
}

// ============================================================================================
//  2. Herr Tick
// ============================================================================================

async function talkToTick(story) {
  const f = story.flags;
  if (f.saved) return story.speakAs('tick', 'Danke, Junge. Ich höre die Uhren – und nichts anderes. Herrlich.');
  if (f.tickGone) return story.say('Er ist fort. Wie im Schlaf zum Tunnel gegangen.');
  for (;;) {
    const topics = [
      { id: 'who', text: 'Wer sind Sie?', done: f.askedWho },
      { id: 'call', text: 'Sie haben Angst vor dem Ruf?', done: f.askedCall, when: Boolean(f.askedWho) },
      { id: 'when', text: 'Wann genau kommt der Ruf?', done: f.askedWhen, when: Boolean(f.askedCall) },
      { id: 'clocks', text: 'Was ist mit der Standuhr und der Kuckucksuhr?', done: f.askedClocks, when: Boolean(f.askedCall) },
      { id: 'bye', text: 'Bis gleich.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'who') {
      f.askedWho = true;
      await story.speakAs('tick', 'Tick. Uhrmacher. Ich zähle die Runden, Junge. Hundertacht habe ich gezählt. Hundertacht!');
      await story.speakAs('tick', 'Und jede Runde fehlt einer mehr.');
    }
    if (topic === 'call') {
      f.askedCall = true;
      await story.speakAs('tick', 'Angst? Ich zittere! Herr K. ist fort. Ich weiß, dass ich der Nächste bin.');
      await story.speakAs('tick', 'Wenn die Stimme ruft, gehen meine Füße von allein. Man hört sie – und dann hört man nichts anderes mehr.');
      await story.speakAs('tick', 'Wenn nur etwas lauter wäre als diese Stimme. Genau in dem Moment.');
      story.note('Herr Tick: 108 Runden gezählt. Wenn der Ruf kommt, gehen seine Füße von allein. Nur etwas Lauteres als die Stimme – genau in dem Moment – könnte ihn halten.');
    }
    if (topic === 'when') {
      f.askedWhen = true;
      await story.speakAs('tick', 'Immer um ein Uhr fünfzig Mondzeit. Zehn Minuten, bevor der Tunnel kommt.');
      await story.speakAs('tick', 'Die Mondzeit zeigt dir die Monduhr da an der Wand. Eine Runde sind zwei Mondstunden.');
      story.note('Der Ruf kommt immer um 1:50 Mondzeit (eine Runde = 2 Mondstunden, 0:00 direkt nach dem Tunnel).');
    }
    if (topic === 'clocks') {
      f.askedClocks = true;
      await story.speakAs('tick', 'Die Standuhr geht doppelt so schnell, die Kuckucksuhr halb so schnell. Ich bekomme sie nicht repariert.');
      await story.speakAs('tick', 'Und im Tunnel bleiben alle Uhren stehen. Danach laufen sie wieder los.');
      await story.speakAs('tick', 'Laut sind sie aber, die beiden! Wenn die zur vollen Stunde schlagen, hört man sein eigenes Wort nicht.');
      story.note('Standuhr: doppelt so schnell, Gong zur vollen Stunde. Kuckucksuhr: halb so schnell, Kuckuck zur vollen Stunde. Im Tunnel bleiben die Uhren stehen, danach laufen sie los.');
    }
  }
}

// ============================================================================================
//  3. Uhren stellen
// ============================================================================================

async function setClocks(story) {
  const f = story.flags;
  if (f.saved) return story.say('Die Uhren haben ihre Arbeit getan.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Zeiger nicht.');
  const state = { grand: f.grand ?? 0, cuckoo: f.cuckoo ?? 30 };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawSetting(ctx, view.state),
    spots: SET_SPOTS,
    area: { x: 120, y: 60, w: 1040, h: 600 },
    help: 'Klicken: Minutenzeiger stellen  ·  Rechtsklick: fertig',
    onClick: async (spot, view) => {
      const s = view.state;
      const step = spot.id.endsWith('Plus') ? 5 : 55;
      if (spot.id.startsWith('g')) s.grand = (s.grand + step) % 60;
      else s.cuckoo = (s.cuckoo + step) % 60;
      story.sound('tick');
    },
  });
  const changed = state.grand !== f.grand || state.cuckoo !== f.cuckoo;
  f.grand = state.grand;
  f.cuckoo = state.cuckoo;
  if (!changed && f.clocksSet) return;
  f.clocksSet = true;
  f.armedLap = story.lap;
  f.runningSaid = false;
  await story.say(`Standuhr auf ${String(f.grand).padStart(2, '0')}, Kuckucksuhr auf ${String(f.cuckoo).padStart(2, '0')}. Nach dem nächsten Tunnel laufen sie los.`);
}

// ============================================================================================
//  Der Ruf
// ============================================================================================

async function theCall(story) {
  const f = story.flags;
  const tick = story.character('tick');
  const running = f.clocksSet && f.armedLap < story.lap;
  const grandOk = running && strikesAtCall(f.grand, 2);
  const cuckooOk = running && strikesAtCall(f.cuckoo, 0.5);
  await story.idle();
  await story.cutscene(async () => {
    story.sound('speaker');
    if (grandOk && cuckooOk) {
      story.sound('gong');
      story.sound('cuckoo');
      await story.speak('Fahrgast T…  — BONG! — KUCKUCK! — BONG! — KUCKUCK! —', { color: VOICE });
      story.sound('gong');
      await story.wait(0.6);
      story.sound('cuckoo');
      await story.wait(0.8);
      f.saved = true;
      await saved(story);
      return;
    }
    if (running && (grandOk || cuckooOk)) {
      story.sound(grandOk ? 'gong' : 'cuckoo');
      await story.speak(`Fahrgast Tick, bitte zum Tunnel … ${grandOk ? '(BONG!)' : '(KUCKUCK!)'}`, { color: VOICE });
      await story.say(`Nur die ${grandOk ? 'Standuhr' : 'Kuckucksuhr'} hat geschlagen! Das war nicht laut genug.`);
    } else {
      await story.speak('Fahrgast Tick, bitte zum Tunnel …', { color: VOICE });
      if (running) await story.say('Die Uhren schlagen nicht! Ich habe sie falsch gestellt.');
    }
    tick.pose = 'right';
    await story.speakAs('tick', 'Ja … ich komme …');
    await story.say('Herr Tick! Bleiben Sie hier!');
    const walk = tick.moveTo(640, 420, 3.4);
    await walk;
    story.motion.skipToTunnel(1.2);
    f.tickGone = true;
    while (story.motion.inTunnel || story.isDark) await story.wait(0.2);
  });
  if (!f.saved && !f.callNoted) {
    f.callNoted = true;
    story.note('Der Ruf kam kurz vor dem Tunnel: „Fahrgast Tick, bitte zum Tunnel …“ Herr Tick ging wie im Schlaf zur Tür.');
  }
}

async function saved(story) {
  await story.wait(0.5);
  await story.speakAs('tick', '… Was? Wo bin ich? Ich stehe ja noch hier!');
  await story.speakAs('tick', 'Ich habe die Stimme nicht gehört. Nur Gong und Kuckuck!');
  await story.say('Sie sind geblieben, Herr Tick!');
  await story.speakAs('tick', 'Junge … du hast mich gerettet. Den Ersten seit hundertacht Runden.');
  await story.speakAs('tick', 'Hier. Ein Zahnrad. Das wirst du vorne brauchen. Frag mich nicht, woher ich das weiß – ich weiß es eben.');
  story.give('gear');
  story.note('Herr Tick ist gerettet – die Uhren haben den Ruf übertönt. Er hat mir ein Zahnrad gegeben: „Das wirst du vorne brauchen.“');
}

// ============================================================================================
//  Ende
// ============================================================================================

async function ending(story) {
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Die erste Rettung. Endlich habe ich jemanden halten können.');
    await story.speakAs('tick', 'Pass auf dich auf, Junge. Und vergiss das Zahnrad nicht.');
    await finishWagon(story, {
      title: 'Ende von Wagen 11',
      lines: ['Herr Tick ist gerettet – die erste Rettung.', 'Er hat Joseph ein Zahnrad gegeben: „Das wirst du vorne brauchen.“'],
      nextTitle: 'im Musiksalon',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (f.saved) return { id: 'door', lines: ['Herr Tick ist gerettet. Weiter durch die Tür.'] };
  if (!f.askedCall) return { id: 'talk', lines: ['Da steht Herr Tick. Mit ihm reden.'] };
  if (!f.moonClock) {
    return { id: 'moon', lines: [
      'An der Uhrenwand geht eine Uhr mit dem Mond. Ich muss nur lange genug hinsehen.',
      'Stehende Uhren und normale Uhren bringen nichts. Gesucht ist der Zeiger, der sich langsam, aber stetig dreht.',
    ] };
  }
  if (!f.askedWhen || !f.askedClocks) return { id: 'ask', lines: ['Herrn Tick fragen, wann genau der Ruf kommt – und was mit Standuhr und Kuckucksuhr ist.'] };
  return { id: 'set', lines: [
    'Beide Uhren müssen genau beim Ruf zur vollen Stunde schlagen. Sie laufen nach dem Tunnel los – bis zum Ruf sind es 110 Mondminuten.',
    'Die Standuhr ist doppelt so schnell: In 110 Minuten rückt sie 220 Minuten vor. Die Kuckucksuhr nur 55. Auf welche Minute muss ich sie stellen, damit sie dann bei :00 sind?',
    'Standuhr auf :20 (20 + 220 = 240 = vier volle Stunden), Kuckucksuhr auf :05 (5 + 55 = 60). Dann auf den Tunnel warten – und auf den Ruf.',
  ] };
}
