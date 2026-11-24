import {
  CALL_MINUTE, RATES, SET_SPOTS, TARGET, clockSpots, drawClockWall, drawPendulum, drawRoundClockCard,
  drawSetClock, drawTickNote,
} from './art/wagon11.js';
import { finishWagon, hintFor, inTunnel, roundProgress, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 11 – Der Uhrenwagen, Herr Tick
// ============================================================================================
//
// „Elf ist der Nächste.“ Herr Tick hat 108 Runden gezählt – und Angst.
//
// DIE RÄTSEL
//   1. Welche Uhr geht mit dem Mond? Die Rundenuhr: ein Zeiger, einmal herum pro Runde, oben der
//      Tunnel, ein roter Strich bei 50 – da kommt der Ruf. Erst dann redet Herr Tick.
//   2. Gespräch: 108 Runden, der Ruf kommt immer kurz vor dem Tunnel. Idee: den Ruf übertönen –
//      mit der Standuhr und der Kuckucksuhr. Herrn Ticks Zettel: Standuhr 1½-mal so schnell,
//      Kuckucksuhr halb so schnell, beide schlagen zur vollen Stunde, sie laufen los, wenn der Zug
//      aus dem Tunnel kommt.
//   3. Ausrechnen: Bis zum Ruf vergehen 50 Rundenminuten. Standuhr 75 Minuten → muss auf :45 stehen,
//      Kuckucksuhr 25 Minuten → :35. Stellen, Tunnel abwarten, dann den Ruf abwarten.
//   4. Beide schlagen genau beim Ruf – Herr Tick hört ihn nicht und bleibt. Er schenkt Joseph ein
//      Zahnrad („Das wirst du vorne brauchen.“) und öffnet die Tür.

const MINUTES = 60;

export const wagon11 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Herr K. ist in Runde 108 verschwunden. Eine Gestalt mit meinen Sachen hat ihn in den Tunnel geführt. Es gibt zwei von mir.',
    'Lautsprecherwagen: Der Schaffner ruft die Fahrgäste zum Tunnel, und sie gehen. Auf dem Band rückwärts: „… wie die anderen. Elf ist der Nächste.“',
  ],

  setup(story) {
    const f = story.flags;
    f.set ??= { grandfather: 0, cuckoo: 0 };
    f.running ??= null; // was beim letzten Verlassen des Tunnels eingestellt war
    story.scene.paintSpot('pendulum', (ctx) => drawPendulum(ctx, true, story.motion.time));
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 11,
      title: 'Der Uhrenwagen',
      lines: [
        'Uhren. Hunderte. Und alle ticken anders.',
        '„Elf ist der Nächste.“ Das hier ist Wagen elf.',
        'Der alte Mann dort … der ist der Nächste.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    tick: {
      look: 'Ein alter Uhrmacher mit Lupe im Auge. Er zittert ein bisschen.',
      use: (story) => talkTick(story),
    },
    clocks: {
      look: 'Uhren über Uhren. Manche stehen, manche laufen rückwärts.',
      use: (story) => clockWall(story),
    },
    grandfather: {
      look: 'Eine große Standuhr. Ihr Pendel schwingt. Laut ist sie bestimmt.',
      use: (story) => setClock(story, 'grandfather'),
    },
    cuckoo: {
      look: 'Eine Kuckucksuhr mit einem gelben Vogel. Der Kuckuck ruft zur vollen Stunde.',
      use: (story) => setClock(story, 'cuckoo'),
    },
    dome: { look: 'Unter einer Glasglocke liegen Zahnräder, fein säuberlich sortiert.' },
    bench: {
      look: (story) => story.say(story.flags.noteFound ? 'Herrn Ticks Werkbank.' : 'Eine Werkbank mit Lupe, Pinzetten und Zahnrädern. Unter der Lupe liegt ein Zettel.'),
      use: (story) => readTickNote(story),
    },
    drawer: { look: 'Eine Schublade voller Zahnräder.', use: 'Die gehören Herrn Tick. Ich nehme nichts.' },
    sofa: {
      look: 'Ein langes rotes Sofa.',
      use: (story) => waitOnSofa(story),
    },
    door: {
      look: (story) => story.say(story.flags.doorOpen ? 'Die Tür ist offen.' : 'Die Tür nach vorne. Ein kleines Uhrwerk statt eines Schlosses.'),
      use: (story) => (story.flags.doorOpen ? leaveWagon(story) : story.say(story.flags.saved ? 'Herr Tick wollte sie mir öffnen.' : 'Ein Uhrwerk statt eines Schlosses. Davon verstehe ich nichts – Herr Tick bestimmt.')),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnelwand.' : 'Draußen der Mond. Er wandert langsam von Fenster zu Fenster.'),
      use: (story) => waitOnSofa(story),
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    const f = story.flags;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      if (f.trance) wakeTick(story);
      return;
    }
    // aus dem Tunnel heraus: Die gestellten Uhren laufen los
    f.running = { ...f.set };
    f.callLap = null;
  },

  update(story) {
    watchForCall(story);
  },
};

function minuteOfRound(story) {
  return roundProgress(story) * MINUTES;
}

// ============================================================================================
//  Uhren
// ============================================================================================

async function clockWall(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln höre ich sie nur ticken.');
  await story.view('picture', {
    draw: (ctx, view) => drawClockWall(ctx, { progress: roundProgress(story), age: view.age }),
    spots: clockSpots(),
    area: { x: 220, y: 40, w: 840, h: 640 },
    help: 'Uhr anklicken: genauer ansehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.kind === 'moon') {
        view.close(true);
        await foundRoundClock(story);
        return;
      }
      const lines = {
        stopped: 'Die steht still.',
        ticking: 'Die tickt ganz normal. Eine Sekunde pro Sekunde. Mit dem Mond hat die nichts zu tun.',
        backward: 'Die läuft rückwärts!',
        fast: 'Die rast. Einmal herum in zehn Sekunden.',
      };
      await story.say(lines[spot.kind]);
    },
  });
}

async function foundRoundClock(story) {
  const f = story.flags;
  await story.card({ draw: (ctx) => drawRoundClockCard(ctx, roundProgress(story)) });
  if (f.roundClock) return;
  f.roundClock = true;
  await story.say('Diese Uhr hat nur einen Zeiger – mit einem kleinen Mond daran. Er wandert genauso langsam wie der Mond draußen.');
  await story.say('Oben ein Tunnel. Und bei der 50 ein roter Strich.');
  story.note('Die Rundenuhr in Herrn Ticks Wagen: ein Zeiger mit dem Mond, einmal herum pro Runde. Oben der Tunnel (0 und 60), bei 50 ein roter Strich.');
}

async function readTickNote(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich nichts lesen.');
  story.sound('paper');
  await story.card({ draw: drawTickNote });
  if (!f.noteFound) {
    f.noteFound = true;
    story.note('Herrn Ticks Zettel: Standuhr 1½-mal so schnell, Kuckucksuhr halb so schnell. Beide schlagen zur vollen Stunde. Sie laufen los, wenn wir aus dem Tunnel kommen. Der Ruf kommt, wenn die Rundenuhr auf dem roten Strich steht.');
  }
}

async function setClock(story, which) {
  const f = story.flags;
  if (f.saved) return story.say('Sie haben ihre Arbeit getan.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Zeiger nicht.');
  if (!f.planned) {
    if (!f.tickTalked) return story.say('Das ist Herrn Ticks Uhr. Ich frage ihn lieber vorher.');
    return story.say('Eine laute Uhr … Erst überlege ich mit Herrn Tick, was ich vorhabe.');
  }
  await story.view('picture', {
    draw: (ctx) => drawSetClock(ctx, which, f.set[which], true),
    spots: SET_SPOTS,
    area: { x: 320, y: 40, w: 640, h: 640 },
    help: 'Knöpfe anklicken: Minutenzeiger stellen  ·  Rechtsklick: zurück',
    onClick: async (spot) => {
      const step = spot.id === 'plus' ? 5 : -5;
      f.set[which] = (f.set[which] + step + MINUTES) % MINUTES;
      story.sound('tick');
    },
  });
  if (!f.setOnce) {
    f.setOnce = true;
    await story.say('Gestellt. Laut Zettel laufen die Uhren aber erst los, wenn wir aus dem nächsten Tunnel kommen.');
  }
}

// ============================================================================================
//  Herr Tick
// ============================================================================================

async function talkTick(story) {
  const f = story.flags;
  if (f.trance) return story.say('Er hört mich nicht. Er geht einfach.');
  if (f.saved) return tickAfter(story);
  if (!f.roundClock) {
    if (!f.tickMet) {
      f.tickMet = true;
      await story.speakAs('tick', 'Psst! Hörst du sie? Alle ticken. Aber nur eine geht richtig.');
      await story.speakAs('tick', 'Wer nicht weiß, welche meiner Uhren mit dem Mond geht, mit dem rede ich nicht. Keine Zeit, keine Zeit.');
      story.note('Herr Tick redet erst mit mir, wenn ich weiß, welche seiner Uhren „mit dem Mond geht“.');
      return;
    }
    return story.speakAs('tick', 'Welche Uhr geht mit dem Mond, hm? Keine Zeit!');
  }
  if (!f.tickTalked) {
    f.tickTalked = true;
    await story.speakAs('tick', 'Die Rundenuhr! Du hast sie gefunden. Dann bist du einer, der zählt.');
    await story.speakAs('tick', 'Ich zähle auch. Hundertacht Runden. Hundertacht Mal derselbe Abend.');
  }
  for (;;) {
    const topics = [
      { id: 'call', text: 'Wann kommt der Ruf?', done: f.askedCall },
      { id: 'fear', text: 'Sie haben Angst, oder?', done: f.askedFear },
      { id: 'drown', text: 'Was, wenn Sie den Ruf gar nicht hören?', when: f.askedCall && f.askedFear, done: f.planned },
      { id: 'clocks', text: 'Wie gehen Ihre Uhren genau?', when: f.planned },
      { id: 'bye', text: 'Ich kümmere mich darum.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'call') {
      f.askedCall = true;
      await story.speakAs('tick', 'Immer kurz vor dem Tunnel. Wenn meine Rundenuhr auf dem roten Strich steht – bei fünfzig.');
      await story.speakAs('tick', 'Dann sagt er einen Namen. Und wer seinen Namen hört, der steht auf und geht. Wie im Schlaf.');
      story.note('Herr Tick: Der Ruf kommt immer, wenn die Rundenuhr auf 50 steht. Wer seinen Namen hört, geht wie im Schlaf.');
    }
    if (topic === 'fear') {
      f.askedFear = true;
      await story.speakAs('tick', 'Angst? … Mein Wagen ist der elfte. Ich habe die Wagen gezählt, und die Runden, und die Leute, die fehlen.');
      await story.speakAs('tick', 'Ich bin der Nächste. Das weiß ich seit hundertacht Runden.');
    }
    if (topic === 'drown') {
      f.planned = true;
      await story.say('Wenn Sie Ihren Namen gar nicht hören – dann gehen Sie auch nicht.');
      await story.speakAs('tick', 'Nicht hören … Laut müsste es sein. Genau in dem Augenblick!');
      await story.speakAs('tick', 'Meine Standuhr! Und die Kuckucksuhr! Die sind laut. Aber sie gehen falsch, alle beide. Auf meinem Zettel an der Werkbank steht, wie.');
      await story.speakAs('tick', 'Rechne du, Junge. Meine Hände zittern zu sehr.');
      story.note('Plan: Standuhr und Kuckucksuhr sollen genau beim Ruf schlagen und ihn übertönen. Wie sie falsch gehen, steht auf Herrn Ticks Zettel an der Werkbank.');
    }
    if (topic === 'clocks') {
      await story.speakAs('tick', 'Die Standuhr ist anderthalbmal so schnell, die Kuckucksuhr nur halb so schnell. Beide schlagen zur vollen Stunde.');
      await story.speakAs('tick', 'Und sie laufen erst, wenn wir aus dem Tunnel kommen. Im Tunnel bleibt alles stehen.');
    }
  }
}

async function tickAfter(story) {
  await story.speakAs('tick', 'Ich bin noch da. Hundertneun Runden. Danke, Junge.');
  await story.speakAs('tick', 'Komisch nur … manchmal denke ich, draußen wartet jemand auf mich.');
  await story.speakAs('tick', 'Und ich weiß nicht mehr, wie alt ich bin. Jede Runde vergesse ich ein Stück. Als würde das Vergessen mir die Jahre wegnehmen.');
}

// ============================================================================================
//  Der Ruf
// ============================================================================================

async function waitOnSofa(story) {
  const f = story.flags;
  if (story.motion.tunnelAhead < 12 || inTunnel(story)) return story.say('Gleich kommt der Tunnel. Jetzt setze ich mich nicht.');
  const minute = minuteOfRound(story);
  // Nach dem Ruf: bis zum Tunnel warten. Kurz davor: nicht mehr hinsetzen.
  // Vorher wird nie über den Ruf hinweggesprungen – sonst kämen Ruf und Warten durcheinander.
  if (f.saved || f.callLap === story.lap || minute >= CALL_MINUTE) return waitForTunnel(story, 'Ich setze mich kurz und warte auf den Tunnel …');
  if (minute >= CALL_MINUTE - 4) return story.say('Gleich kommt der Ruf. Jetzt setze ich mich nicht.');
  await story.cutscene(async () => {
    await story.say(story.flags.roundClock ? 'Ich setze mich und behalte die Rundenuhr im Auge …' : 'Ich setze mich kurz hin. Herr Tick wird immer unruhiger …');
    await story.fadeOut(1);
    const motion = story.motion;
    const half = motion.settings.tunnel.length / 2;
    const target = half + ((CALL_MINUTE - 3) / MINUTES) * (motion.lapLength - 2 * half);
    motion.distance += target - motion.lapTime;
    await story.wait(0.5);
    story.fadeIn(1);
    await story.say(story.flags.roundClock ? 'Gleich steht der Zeiger auf dem roten Strich.' : 'Gleich passiert etwas. Ich spüre es.');
  });
}

function watchForCall(story) {
  const f = story.flags;
  if (f.saved || f.callLap === story.lap || inTunnel(story)) return;
  if (minuteOfRound(story) < CALL_MINUTE) return;
  f.callLap = story.lap;
  theCall(story);
}

async function theCall(story) {
  const f = story.flags;
  const running = f.running;
  const strikes = {
    grandfather: running?.grandfather === TARGET.grandfather,
    cuckoo: running?.cuckoo === TARGET.cuckoo,
  };
  story.game.closeViews();
  await story.cutscene(async () => {
    story.sound('speaker');
    if (strikes.grandfather) story.sound('chime');
    if (strikes.cuckoo) setTimeout(() => story.sound('cuckoo'), 400);
    if (strikes.grandfather && strikes.cuckoo) {
      await story.speak('„Fahrg– DONG! – KUCKUCK! – DONG! – … Tunnel.“', { at: { x: 640, y: 120 } });
      setTimeout(() => story.sound('chime'), 200);
      await story.wait(0.6);
      await saved(story);
      return;
    }
    const half = strikes.grandfather || strikes.cuckoo;
    await story.speak(half ? '„Fahrgast DONG …, bitte zum Tunnel.“' : '„Fahrgast Tick, bitte zum Tunnel. Fahrgast Tick …“', { at: { x: 640, y: 120 } });
    f.trance = true;
    const tick = story.character('tick');
    tick.pose = 'front';
    await story.speakAs('tick', half ? '… Tick … das bin ich …' : 'Ja … ich komme …');
    tick.pose = 'right';
    tick.moveTo(640, 430, 4);
    await story.say('Herr Tick! Nein!');
    await story.walkTo(640, 470, 'back');
    await story.say('Ich halte ihn am Ärmel fest. Er zieht trotzdem weiter, wie im Schlaf …');
    if (!f.planned) {
      if (!f.firstCall) {
        f.firstCall = true;
        story.note(`Runde ${story.lap}: Der Ruf! „Fahrgast Tick, bitte zum Tunnel.“ Herr Tick ging wie im Schlaf zur Tür. Ich habe ihn festgehalten, bis der Tunnel kam.`);
      }
    } else if (half) {
      story.note('Nur eine Uhr hat beim Ruf geschlagen. Das reicht nicht – Herr Tick hat seinen Namen trotzdem gehört.');
    } else if (!f.failedOnce) {
      f.failedOnce = true;
      story.note('Keine der beiden Uhren hat genau beim Ruf geschlagen. Herr Tick ging wie im Schlaf zur Tür.');
    }
    await story.fadeOut(1.2);
    if (!inTunnel(story)) story.motion.skipToTunnel(1);
    await story.wait(0.4);
    story.fadeIn(0.8);
  });
}

async function wakeTick(story) {
  const f = story.flags;
  f.trance = false;
  const tick = story.character('tick');
  await story.wait(1.5);
  tick.moveTo(742, 468, 0.1);
  tick.pose = 'left';
  await story.wait(5);
  if (!story.inCutscene) {
    await story.speakAs('tick', 'Was … Wo war ich? … Schon wieder eine Runde. Beinahe, Junge. Beinahe.');
  }
}

async function saved(story) {
  const f = story.flags;
  f.saved = true;
  const tick = story.character('tick');
  tick.pose = 'front';
  await story.speakAs('tick', 'Was … hat er gerufen? Ich habe nichts verstanden!');
  await story.speakAs('tick', 'Ich habe nichts verstanden – und ich bin noch hier!');
  await story.say('Die Uhren haben ihn übertönt. Genau beim Ruf.');
  await story.speakAs('tick', 'Hundertneun Runden. Die erste, in der niemand gegangen ist.');
  await story.speakAs('tick', 'Aber hör zu, Junge. Ich zähle nicht nur die Runden. Ich zähle auch den Tunnel.');
  await story.speakAs('tick', 'Vor hundert Runden war er nach drei Ticks vorbei. Heute dauert er elf. Er wird jede Runde länger.');
  await story.speakAs('tick', 'Irgendwann wird es im Tunnel nicht mehr hell. Dann kommt keiner mehr heraus. Nie mehr.');
  await story.say('Wie lange noch?');
  await story.speakAs('tick', 'Nicht mehr lange. Beeil dich, Junge.');
  story.note('Herr Tick misst den Tunnel: Vor hundert Runden dauerte er drei Ticks, heute elf. Er wird jede Runde länger. Wenn es darin nicht mehr hell wird, kommt keiner mehr heraus. „Nicht mehr lange. Beeil dich.“');
  await story.speakAs('tick', 'Hier, Junge. Das ist für dich. Ein Zahnrad aus meiner besten Uhr.');
  story.give('gear');
  await story.speakAs('tick', 'Das wirst du vorne brauchen.');
  await story.say('Vorne? Wo vorne?');
  await story.speakAs('tick', 'Und die Tür – warte. Das Uhrwerk dort kenne ich.');
  tick.pose = 'right';
  story.sound('unlock');
  f.doorOpen = true;
  await story.wait(0.6);
  tick.pose = 'talk';
  await story.speakAs('tick', 'Offen. Geh nur.');
  story.note('Die erste Rettung! Standuhr (:45) und Kuckucksuhr (:35) haben genau beim Ruf geschlagen. Herr Tick hat seinen Namen nicht gehört und ist geblieben. Er hat mir ein Zahnrad geschenkt: „Das wirst du vorne brauchen.“');
}

async function leaveWagon(story) {
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Herr Tick ist noch da. Die erste Runde, in der niemand verschwunden ist.');
    await story.say('Vielleicht kann ich sie alle retten.');
    await finishWagon(story, {
      number: 11,
      title: 'Ende von Wagen 11',
      lines: ['Die erste Rettung.', '„Das wirst du vorne brauchen.“'],
      nextTitle: 'im Musiksalon',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.roundClock) {
    return { id: 'moon', lines: [
      'Herr Tick will wissen, welche Uhr „mit dem Mond geht“. Die Wanduhren genauer ansehen.',
      'Der Mond wandert in einer Runde einmal ganz herum. Gesucht ist eine Uhr, die genauso langsam geht.',
      'Es ist die Uhr oben rechts – mit dem kleinen Mond am Zeiger.',
    ] };
  }
  if (!f.planned) return { id: 'talk', lines: ['Mit Herrn Tick reden: Wann kommt der Ruf? Hat er Angst?', 'Danach fragen, was wäre, wenn er den Ruf gar nicht hört.'] };
  if (!f.noteFound) return { id: 'note', lines: ['Auf Herrn Ticks Werkbank liegt ein Zettel, wie seine Uhren gehen.', 'Herrn Ticks Werkbank ansehen – der Zettel erklärt, wie die Uhren gehen.'] };
  if (!f.saved) {
    const correct = f.set.grandfather === TARGET.grandfather && f.set.cuckoo === TARGET.cuckoo;
    if (!correct) {
      return { id: 'set', lines: [
        'Vom Tunnel bis zum Ruf vergehen 50 Rundenminuten. Die Uhren laufen ab dem Tunnel los und sollen genau beim Ruf eine volle Stunde erreichen.',
        'Die Standuhr schafft in 50 Rundenminuten 75 Minuten, die Kuckucksuhr 25 Minuten. Wie viele Minuten vor der vollen Stunde müssen sie also stehen?',
        'Standuhr auf :45 stellen (45 + 75 = 120, volle Stunde), Kuckucksuhr auf :35 (35 + 25 = 60).',
      ] };
    }
    const armed = f.running?.grandfather === TARGET.grandfather && f.running?.cuckoo === TARGET.cuckoo;
    if (!armed) return { id: 'tunnel', lines: ['Die Uhren stehen jetzt richtig. Fehlt nur noch, dass sie loslaufen.', 'Die Uhren stehen richtig, laufen aber erst nach dem nächsten Tunnel los. Auf den Tunnel warten (Fenster).'] };
    return { id: 'wait', lines: ['Alles ist bereit. Jetzt heißt es: Geduld.', 'Jetzt bis zum Ruf warten – am schnellsten auf dem Sofa.'] };
  }
  return { id: 'door', lines: ['Herr Tick hat die Tür geöffnet.', 'Einfach durch die Tür nach vorne gehen.'] };
}
