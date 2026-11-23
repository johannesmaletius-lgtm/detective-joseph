import {
  FUSES, FUSE_HOMES, FUSE_ORDER, FUSE_SLOTS, RECORDER_SPOTS, SPEEDS, drawFuse, drawFuseBox, drawPower,
  drawRecorder, drawTapeShelf, tapeSpots,
} from './art/wagon10.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 10 – Der Lautsprecherwagen (der Schaffner nur als Stimme)
// ============================================================================================
//
// Von hier aus spricht der Schaffner. Hier liegen die Tonbänder aller Runden.
//
// DIE RÄTSEL
//   1. Kein Strom: Die fünf Sicherungen liegen lose daneben. Dickes Kabel = große Sicherung
//      (1 → 6 A, 1,5 → 10 A, 2,5 → 16 A, 4 → 20 A, 6 → 25 A).
//   2. Das Tonband der Runde, in der Herr K. verschwand: 108 (Filmrand im Bordkino).
//   3. Tonbandgerät: Auf der Hülle steht „aufgenommen bei 19“. Bei 19 cm/s: „Fahrgast K., bitte zum
//      Tunnel …“ – und ein Stück, das rückwärts klingt. Richtung „zurück“: „… wie die anderen.
//      Elf ist der Nächste.“
//   4. Schrank unter dem Mischpult: Vorhängeschloss mit zwei Ziffern → 11. Darin der Schalter „Tür“.

const CABINET_CODE = '11';
const RIGHT_SPEED = 2; // 19 cm/s

export const wagon10 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Herr K. ist in Runde 108 im Tunnel verschwunden. Er ging freiwillig, als der Schaffner ihn über den Lautsprecher rief.',
    'Der Film im Bordkino zeigt eine Gestalt mit meiner Mütze, die Herrn K. in den Tunnel führt.',
    'Spiegelwagen: Im Spiegel stand für einen Augenblick jemand hinter mir. Es gibt zwei von mir.',
  ],

  setup(story) {
    const f = story.flags;
    f.recorder ??= { speed: 0, direction: 'forward', playing: false, loaded: false, power: false };
    story.scene.paintSpot('lights', (ctx) => drawPower(ctx, f.power, story.motion.time));
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 10,
      title: 'Der Lautsprecherwagen',
      lines: [
        'Lautsprecher. Mikrofon. Tonbänder.',
        'Von hier aus spricht er also – der Schaffner.',
        'Wenn er Herrn K. gerufen hat, dann gibt es davon vielleicht eine Aufnahme.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    fuses: {
      look: (story) => story.say(story.flags.power ? 'Alle fünf Sicherungen sitzen. Strom ist da.' : 'Der Sicherungskasten ist offen. Fünf leere Fassungen, die Sicherungen liegen lose daneben.'),
      use: (story) => fuseBox(story),
    },
    tapes: {
      look: 'Ein Regal voller Tonbänder. Auf jeder Hülle steht eine Rundennummer.',
      use: (story) => tapeShelf(story),
    },
    boxes: { look: 'Kisten mit Ersatzröhren und Kabeln.' },
    recorder: {
      look: (story) => story.say(story.flags.power ? 'Ein großes Tonbandgerät. Die Lämpchen leuchten.' : 'Ein großes Tonbandgerät. Ohne Strom tut es nichts.'),
      use: (story) => recorder(story),
      items: { tape108: (story) => loadTape(story) },
    },
    mic: {
      look: 'Das Mikrofon für die Durchsagen.',
      use: (story) => speakIntoMic(story),
    },
    mixer: {
      look: 'Ein Mischpult mit Reglern für jeden Wagen. Wagen 1, 2, 3 … bis 24. Die Regler sind alle unten.',
      use: 'Die Regler bewegen sich nicht. Gesperrt – unten am Schrank hängt ein Vorhängeschloss.',
    },
    cabinet: {
      look: (story) => story.say(story.flags.cabinetOpen ? 'Der Schrank ist offen. Drin: ein einzelner großer Schalter mit der Aufschrift „Tür“.' : 'Ein Schrank unter dem Mischpult. Ein Vorhängeschloss mit zwei Rädchen.'),
      use: (story) => openCabinet(story),
    },
    monitor: {
      look: (story) => story.say(story.flags.power ? 'Der Totenkopf auf dem Bildschirm leuchtet grün. Wie in meinem Abteil. Er hört überall mit.' : 'Ein Bildschirm mit einem Totenkopf. Wie in meinem Abteil.'),
    },
    door: {
      look: 'Die Tür nach vorne. Kein Schloss, kein Griff – nur ein Schild: „Öffnung über Mischpult“.',
      use: (story) => (story.flags.doorOpen ? leaveWagon(story) : story.say('Sie geht nicht auf. „Öffnung über Mischpult“.')),
    },
    horn: { look: 'Ein Lautsprechertrichter. Davon gibt es in jedem Wagen einen.' },
    panel: { look: 'Schalter: „Durchsage“, „Alle Wagen“, „Ruf“. Der Ruf-Schalter ist verplombt.' },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnelwand.' : 'Draußen Schnee und der Turm.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },

  update(story) {
    announce(story);
  },
};

// Kurz vor jedem Tunnel spricht der Schaffner – aus allen Trichtern
async function announce(story) {
  const f = story.flags;
  const lap = story.lap;
  if (story.motion.tunnelAhead > 16 || story.motion.tunnelAhead < 14 || f.announced === lap) return;
  f.announced = lap;
  if (story.inCutscene || story.game.view) return;
  story.sound('speaker');
  await story.speak(f.power ? '„Nächster Halt: der Tunnel. Bitte bleiben Sie ruhig sitzen.“' : '„Krrrz … Halt … Tunnel … krrz …“', { at: { x: 640, y: 150 } });
}

// ============================================================================================
//  Sicherungen
// ============================================================================================

async function fuseBox(story) {
  const f = story.flags;
  if (f.power) return story.say('Strom ist da. Lieber nichts mehr anfassen.');
  if (inTunnel(story)) return story.say('Im Dunkeln fasse ich da nicht hinein.');
  const solved = await story.view('arrange', {
    id: 'fuses',
    title: 'Sicherungskasten',
    slots: FUSE_SLOTS,
    tokens: FUSES.map((fuse, i) => ({ id: fuse.id, label: `Sicherung ${fuse.amp} A`, w: 168, h: 52, home: FUSE_HOMES[i] })),
    drawBackground: drawFuseBox,
    drawToken: drawFuse,
    check: (placement) => placement.every((id, i) => id === FUSE_ORDER[i]),
    help: 'Sicherungen mit gedrückter Maustaste in die Fassungen ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!f.fusesSeen && !inTunnel(story)) {
      f.fusesSeen = true;
      await story.say('Fünf Kabel, alle verschieden dick. Und fünf Sicherungen von 6 bis 25 Ampere.');
      story.note('Sicherungskasten: Fünf Kabel verschiedener Dicke, fünf lose Sicherungen. Zettel (halb abgerissen): „1 mm² → 6 A, 1,5 mm² → 10 A …“ Zwei Kabelschilder sind abgegriffen.');
    }
    return;
  }
  f.power = true;
  f.recorder.power = true;
  story.sound('power');
  await story.say('Klack – Strom! Überall gehen kleine Lämpchen an.');
  await story.say('Und der Totenkopf auf dem Bildschirm leuchtet grün. Er hört mit.');
  story.note('Die Sicherungen sitzen (dünnes Kabel, kleine Sicherung). Im Lautsprecherwagen ist Strom.');
}

// ============================================================================================
//  Tonbänder
// ============================================================================================

async function tapeShelf(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Nummern nicht lesen.');
  await story.view('picture', {
    draw: (ctx) => drawTapeShelf(ctx, f.tapeTaken),
    spots: () => tapeSpots().filter((spot) => !(f.tapeTaken && spot.round === 108)),
    area: { x: 170, y: 110, w: 940, h: 560 },
    help: 'Band anklicken: nehmen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.round === 108) {
        f.tapeTaken = true;
        story.give('tape108');
        story.sound('pickup');
        view.close(true);
        await story.say('Runde 108. Die Runde, in der Herr K. verschwand.');
        story.note('Im Regal: das Tonband aus Runde 108.');
        return;
      }
      if (spot.round === 110) return story.say('„Runde 110“ – eine leere Spule. Noch nicht aufgenommen.');
      if (spot.round < 100) return story.say(`Runde ${spot.round}. So lange fährt dieser Zug schon im Kreis …`);
      return story.say(`Runde ${spot.round}. Nicht die, die ich suche.`);
    },
  });
  if (!f.shelfSeen && !f.tapeTaken && !inTunnel(story)) {
    f.shelfSeen = true;
    story.note('Tonbandregal: ein Band für jede Runde. Welche Runde suche ich?');
  }
}

// ============================================================================================
//  Tonbandgerät
// ============================================================================================

async function loadTape(story) {
  const f = story.flags;
  story.remove('tape108');
  f.recorder.loaded = true;
  story.sound('snap');
  await story.say('Band 108 eingelegt. Auf der Hülle stand: „aufgenommen bei 19“.');
  story.note('Tonband 108 liegt im Gerät. Auf der Hülle: „aufgenommen bei 19“.');
  await recorder(story);
}

async function recorder(story) {
  const f = story.flags;
  const r = f.recorder;
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Knöpfe nicht.');
  if (f.reversedHeard) return story.say('Ich habe es gehört. „Elf ist der Nächste.“');
  await story.view('picture', {
    draw: (ctx, view) => drawRecorder(ctx, r, view.age),
    spots: RECORDER_SPOTS,
    area: { x: 250, y: 110, w: 780, h: 600 },
    help: 'Regler anklicken: umstellen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.id === 'speed') {
        r.speed = (r.speed + 1) % SPEEDS.length;
        story.sound('click');
        return;
      }
      if (spot.id === 'direction') {
        r.direction = r.direction === 'back' ? 'forward' : 'back';
        story.sound('click');
        return;
      }
      if (!f.power) return story.say('Nichts. Kein Strom.');
      if (!r.loaded) return story.say('Es ist kein Band eingelegt.');
      await playTape(story, view);
    },
  });
}

async function playTape(story, view) {
  const f = story.flags;
  const r = f.recorder;
  const voice = (text) => story.speak(text, { color: '#f5d7a1' });
  r.playing = true;
  story.sound('tape');
  try {
    if (r.direction === 'back') {
      await story.wait(0.6);
      if (r.speed !== RIGHT_SPEED) {
        await voice(r.speed === 0 ? '„… uuuhhh … wwwoooo …“' : '„… uh … wo … ni …“');
        await story.say('Rückwärts – und zu langsam.');
        return;
      }
      if (!f.forwardHeard) {
        await voice('„… nerednA eid eiw …“');
        await story.say('Rückwärts ergibt es keinen Sinn … oder doch?');
        return;
      }
      await voice('„… wie die anderen.“');
      story.sound('dread');
      await voice('„Elf ist der Nächste.“');
      r.playing = false;
      f.reversedHeard = true;
      view.close(true);
      await story.say('„Elf ist der Nächste.“ Wagen elf. Der nächste Fahrgast sitzt im nächsten Wagen!');
      await story.say('Und das ist SEINE Stimme. Die Stimme des Schaffners. Er ruft sie.');
      story.note('Tonband 108 rückwärts: „… wie die anderen. Elf ist der Nächste.“ Der Schaffner ruft die Fahrgäste. Als Nächstes ist jemand in Wagen 11 dran.');
      return;
    }
    await story.wait(0.6);
    if (r.speed === 0) {
      await voice('„Fffffaaaaaaahhhhrrrr … gggaaaaaasssst …“');
      await story.say('Viel zu langsam. Wie ein Brummbär.');
      return;
    }
    if (r.speed === 1) {
      await voice('„Faaahrgaaast Kaaa … biiitte …“');
      await story.say('Immer noch zu langsam.');
      return;
    }
    await voice('„Fahrgast K., bitte zum Tunnel. Fahrgast K., bitte zum Tunnel.“');
    await voice('„Haben Sie keine Angst. Sie kommen nach Hause …“');
    await voice('„… nerednA eid eiw … etshcäN red tsi flE …“');
    if (!f.forwardHeard) {
      f.forwardHeard = true;
      await story.say('„Fahrgast K., bitte zum Tunnel.“ Das ist der Ruf, dem Herr K. gefolgt ist.');
      await story.say('Aber das Letzte … das klingt, als liefe es rückwärts.');
      story.note('Tonband 108 bei 19 cm/s: „Fahrgast K., bitte zum Tunnel … Haben Sie keine Angst. Sie kommen nach Hause.“ Am Ende ein Stück, das rückwärts klingt.');
    }
  } finally {
    r.playing = false;
  }
}

// ============================================================================================
//  Mikrofon, Schrank, Tür
// ============================================================================================

async function speakIntoMic(story) {
  if (!story.flags.power) return story.say('Ohne Strom bleibt es stumm.');
  await story.say('Hallo? … Ist da jemand?');
  story.sound('speaker');
  await story.speak('„Hallo? … Ist da jemand?“', { at: { x: 640, y: 150 }, color: '#f2e6c4' });
  await story.say('Meine eigene Stimme aus allen Trichtern. Gruselig.');
}

async function openCabinet(story) {
  const f = story.flags;
  if (f.cabinetOpen) return flipDoorSwitch(story);
  const opened = await tryCode(story, {
    id: 'cabinet10',
    code: CABINET_CODE,
    style: 'steel',
    dark: 'Im Dunkeln sehe ich die Rädchen nicht.',
    wrong: (s) => (s.flags.reversedHeard ? 'Falsch. Wer ist der Nächste?' : 'Falsch. Zwei Ziffern …'),
  });
  if (!opened) return;
  f.cabinetOpen = true;
  await story.say('Elf! Das Schloss ist auf.');
  await story.say('Im Schrank: ein großer Schalter. Darauf steht „Tür“.');
  await flipDoorSwitch(story);
}

async function flipDoorSwitch(story) {
  const f = story.flags;
  if (f.doorOpen) return story.say('Der Schalter steht auf „offen“.');
  if (!f.power) return story.say('Ich lege den Schalter um … nichts. Kein Strom.');
  f.doorOpen = true;
  story.sound('lever');
  await story.wait(0.4);
  story.sound('unlock');
  await story.say('Klack. Vorne an der Tür klickt es.');
  story.note('Im Schrank unter dem Mischpult (Code 11): der Schalter „Tür“. Die Tür ist offen.');
}

async function leaveWagon(story) {
  if (!story.flags.reversedHeard) return story.say('Erst will ich wissen, was auf dem Band ist.');
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Der Schaffner ruft die Fahrgäste. Und wer den Ruf hört, geht.');
    await story.say('Elf ist der Nächste. Diesmal bin ich vorher da.');
    await finishWagon(story, {
      number: 10,
      title: 'Ende von Wagen 10',
      lines: ['„… wie die anderen. Elf ist der Nächste.“'],
      nextTitle: 'im Uhrenwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.power) {
    return { id: 'fuses', lines: [
      'Hier ist nirgends Strom. Der Sicherungskasten links ist offen.',
      'Dünnes Kabel – kleine Sicherung, dickes Kabel – große Sicherung.',
      'Von oben nach unten: 4 mm² → 20 A, 1 → 6 A, 6 → 25 A, 1,5 → 10 A, 2,5 → 16 A.',
    ] };
  }
  if (!f.tapeTaken) {
    return { id: 'tape', lines: [
      'Im Regal liegt für jede Runde ein Tonband. Welche Runde ist wichtig?',
      'Herr K. verschwand in Runde 108 – das stand am Filmrand im Bordkino.',
    ] };
  }
  if (!f.recorder.loaded) return { id: 'load', lines: ['Das Tonband ins Tonbandgerät rechts einlegen: Band im Inventar anklicken, dann das Gerät.'] };
  if (!f.forwardHeard) {
    return { id: 'speed', lines: [
      'Das Band läuft zu langsam. Auf der Hülle stand, mit welcher Geschwindigkeit es aufgenommen wurde.',
      '„Aufgenommen bei 19“ – den linken Regler auf 19 stellen, Richtung „vor“, dann abspielen.',
    ] };
  }
  if (!f.reversedHeard) {
    return { id: 'reverse', lines: [
      'Das Ende klang rückwärts. Das Gerät kann auch rückwärts abspielen.',
      'Mittlerer Regler auf „zurück“, Geschwindigkeit 19 lassen, abspielen.',
    ] };
  }
  if (!f.cabinetOpen) return { id: 'cabinet', lines: ['„Elf ist der Nächste.“ Das Schloss am Schrank unter dem Mischpult hat zwei Rädchen: 1 – 1.'] };
  return { id: 'door', lines: ['Der Schalter im Schrank öffnet die Tür. Dann hindurch.'] };
}
