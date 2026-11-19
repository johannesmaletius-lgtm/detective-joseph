import { MIRROR_CENTER, MOON_WINDOW } from '../scene/sleepingCar.js';
import { P } from '../scene/wagonPainter.js';
import { VOICES, finishWagon, giveStartItems, hintFor, inTunnel, tunnels, waitForTunnel } from './common.js';

// ============================================================================================
//  WAGEN 3 – Der Schlafwagen
// ============================================================================================
//
// Im unteren Bett schläft Frau Adler (vom Tisch 4 im Speisewagen). Im Schlaf murmelt sie –
// jede Runde ein anderes Stück desselben Satzes:
//   „Das Wort für das Gitter steht im Spiegel, wenn der Mond ins Fenster schaut.
//    Aber nur, wenn das Rollo oben ist.“
//
// DAS ZIEL: Das Gitter zum Gepäckwagen hat ein Buchstabenschloss mit fünf Rädchen: S C H A L.
//
// DIE RÄTSEL:
//   1. Frau Adler zuhören – in jeder Runde (nach jedem Tunnel) kommt ein neues Stück dazu.
//      Die Stücke auf dem Zettel (Rechtsklick im Inventar) in die richtige Reihenfolge bringen.
//   2. Oberes Bett (über die Leiter): ein Zettel vom früheren Joseph – wie man sie weckt.
//   3. Mit der Taschenlampe ins Gesicht leuchten → Frau Adler wacht auf, schreit, zieht die Notbremse.
//      Der Ruck wirft die Hutschachtel von der Gepäckablage → darin: eine Hutnadel mit Haken.
//      (Wach kann man mit ihr reden: über den Mann mit dem Schal, das Wort, ihren Papagei Kasimir.)
//   4. Mit der Hutnadel die abgerissene Schlaufe des Rollos am mittleren rechten Fenster angeln → Rollo hoch.
//   5. Warten, bis der Mond in dieses Fenster schaut (Stuhl: „warten, bis der Mond kommt“).
//      Dann leuchtet im Spiegel ein Wort auf – in Spiegelschrift.
//   6. S C H A L am Gitter → Gepäckwagen.
// Nach jedem Tunnel ist alles wieder wie vorher: Frau Adler schläft, die Hutschachtel steht oben,
// die Notbremse ist verplombt. Nur was Joseph bei sich trägt (die Hutnadel), bleibt.

const CODE = 'SCHAL';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LADY = (() => {
  const [x, y] = P(-170, 82, 0.55);
  return { x: x + 20, y: y - 70 };
})();

// Die Stücke des Satzes in der richtigen Reihenfolge – und was sie in welcher Runde murmelt
export const CHUNKS = ['Das Wort', 'für das Gitter', 'steht im Spiegel,', 'wenn der Mond', 'ins Fenster schaut.', 'Aber nur,', 'wenn das Rollo oben ist.'];
const MURMURS = [
  { chunks: [1, 0], text: '… mmh … für das Gitter … das Wort … das Wort …' },
  { chunks: [2], text: '… steht im Spiegel … im Spiegel … chrr …' },
  { chunks: [4, 3], text: '… ins Fenster schaut … wenn der Mond … mmh …' },
  { chunks: [6, 5], text: '… wenn das Rollo oben ist … aber nur … aber nur …' },
];

export const wagon3 = {
  flags: {
    blind: 1,          // Rollo: 1 = unten … 0 = oben
    hatboxFall: 0,     // Hutschachtel: 0 = oben auf der Ablage … 1 = auf dem Boden
    moonlight: 0,      // wie hell der Mond gerade auf den Spiegel scheint
  },

  prepare(story) {
    giveStartItems(story, ['flashlight', 'knife', 'binoculars', 'sheet', 'letter', 'vierkant']);
    story.note('Hinter mir liegen das erste Abteil und der Speisewagen. Herrn Brandt habe ich das Leben gerettet – und seinen Vierkantschlüssel bekommen.');
  },

  setup(story) {
    story.flags.startedAt = performance.now();
    story.flags.heard = [];
  },

  async intro(story) {
    await arrive(story);
  },

  async skipIntro(story) {
    story.game.overlay.fade = 0;
    await arrive(story, { quick: true });
  },

  update(story, dt) {
    const f = story.flags;
    // Rollo und Hutschachtel bewegen sich weich
    const blindTarget = f.blindUp ? 0 : 1;
    f.blind += Math.sign(blindTarget - f.blind) * Math.min(Math.abs(blindTarget - f.blind), dt * 4);
    if (f.hatboxDown && f.hatboxFall < 1) f.hatboxFall = Math.min(1, f.hatboxFall + dt * 2.2);
    // Mondlicht auf dem Spiegel: nur wenn das Rollo oben ist und der Mond in diesem Fenster steht
    const lit = f.blindUp && !story.motion.inTunnel && story.scene.outside.moonWindow()?.from === MOON_WINDOW.from;
    f.moonlight += ((lit ? 1 : 0) - f.moonlight) * Math.min(1, dt * 1.5);
    if (f.moonlight > 0.6 && !f.moonNoticed && !story.isBusy && !story.game.view) {
      f.moonNoticed = true;
      noticeMoon(story);
    }
    // gelegentlich ein Schnarcher
    f.snoreIn = (f.snoreIn ?? 3) - dt;
    if (f.snoreIn <= 0) {
      f.snoreIn = 5 + Math.random() * 4;
      if (!f.ladyAwake && !story.isDark) story.sound('snore');
    }
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    grate: {
      look: async (story) => {
        await story.say('Ein Gitter vor dem Gepäckwagen. Davor ein Buchstabenschloss mit fünf Rädchen.');
        if (!story.flags.grateLooked) {
          story.flags.grateLooked = true;
          story.note('Schlafwagen: Das Gitter zum Gepäckwagen hat ein Buchstabenschloss – fünf Buchstaben.');
        }
      },
      use: (story) => tryLock(story),
      items: {
        vierkant: 'Kein Vierkantloch. Nur Buchstaben.',
        hatpin: 'Mit der Hutnadel das Schloss knacken? So geschickt bin ich nicht.',
        knife: 'Das Gitter ist aus Stahl. Da hilft kein Taschenmesser.',
      },
    },

    lady: {
      look: (story) => (story.flags.ladyAwake
        ? story.say('Frau Adler sitzt auf der Bettkante und zittert. Sie lässt mich nicht aus den Augen.')
        : story.say('Eine alte Dame mit Nachthaube. Sie schläft tief – und murmelt dabei.')),
      use: (story) => (story.flags.ladyAwake ? talkToLady(story) : visitSleeper(story)),
      items: {
        flashlight: (story) => wakeLady(story),
        other: 'Das stecke ich ihr lieber nicht zu. Sie schläft.',
      },
    },

    hatboxUp: {
      look: 'Ganz oben auf der Gepäckablage: eine Hutschachtel mit Streifen. Viel zu hoch.',
      use: 'Da komme ich nicht ran. Nicht mal von der Leiter aus – die Ablage ist über dem Gang.',
      items: { other: 'Damit komme ich auch nicht höher.' },
    },

    hatboxDown: {
      look: 'Die Hutschachtel. Beim Ruck der Notbremse ist sie heruntergefallen.',
      use: (story) => openHatbox(story),
    },

    ladder: {
      look: 'Eine Leiter zum oberen Bett.',
      use: (story) => climbUp(story),
    },
    upperBunk: {
      look: 'Das obere Bett. Der Vorhang ist halb zugezogen.',
      use: (story) => climbUp(story),
    },
    bunk: {
      look: 'Frau Adlers Bett. Die Decke ist bis zum Kinn hochgezogen.',
      use: (story) => (story.flags.ladyAwake ? talkToLady(story) : visitSleeper(story)),
    },

    blind: {
      look: (story) => (story.flags.blindUp
        ? story.say('Das Rollo ist oben. Draußen: Wald, Schnee – und manchmal der Mond.')
        : story.say('Das Rollo ist unten. Die Zugschlaufe ist abgerissen – oben in der Leiste hängt nur noch ein winziger Ring.')),
      use: async (story) => {
        if (story.flags.blindUp) return story.say('Das bleibt oben.');
        await story.say('Mit den Fingern komme ich nicht an den kleinen Ring. Zu klein, zu weit oben.');
        if (!story.flags.blindNoted) {
          story.flags.blindNoted = true;
          story.note('Das Rollo am mittleren rechten Fenster ist unten. Die Schlaufe ist abgerissen; oben hängt ein winziger Ring. Ich bräuchte etwas Langes, Dünnes mit einem Haken.');
        }
      },
      items: {
        hatpin: (story) => raiseBlind(story),
        knife: 'Mit der Messerspitze erwische ich den Ring nicht. Ich bräuchte einen Haken.',
        vierkant: 'Am Rollo ist kein Vierkantloch.',
        other: 'Damit angle ich den Ring nicht.',
      },
    },

    window: {
      look: 'Ein Rollo. Festgeschraubt – „Nachtruhe im Schlafwagen“.',
      use: 'Festgeschraubt. Da rührt sich nichts.',
      items: { hatpin: 'Dieses Rollo ist festgeschraubt. Nur das mittlere rechts hat eine Schlaufe.' },
    },

    mirror: {
      look: (story) => watchMirror(story),
      use: (story) => watchMirror(story),
      items: { other: 'Den Spiegel will ich nicht zerkratzen.' },
    },

    basin: {
      look: 'Ein kleines Waschbecken. Das Wasser läuft warm – deshalb ist der Spiegel beschlagen.',
      use: 'Ich spritze mir Wasser ins Gesicht. Wach bleiben, Joseph. Wach bleiben.',
    },

    brake: {
      look: (story) => (story.flags.brakePulled
        ? story.say('Der Griff der Notbremse hängt unten, die Plombe ist ab. Gebremst hat der Zug trotzdem nicht.')
        : story.say('Die Notbremse. Verplombt. „Missbrauch wird bestraft.“')),
      use: (story) => (story.flags.brakePulled
        ? story.say('Gezogen ist sie schon. Der Zug fährt einfach weiter.')
        : story.say('Ich bin Detektiv, kein Zugräuber. Die Plombe bleibt dran.')),
      items: { other: 'Die Plombe bleibt dran.' },
    },

    nightTable: {
      look: async (story) => {
        await story.say('Ein blaues Nachtlicht und eine Karaffe Wasser.');
        await story.say('Und ein kleines Foto im Rahmen: Frau Adler mit einem grünen Papagei auf der Schulter.');
        if (!story.flags.photoNoted) {
          story.flags.photoNoted = true;
          story.note('Auf dem Nachttisch: ein Foto von Frau Adler mit einem grünen Papagei.');
        }
      },
      use: 'Ich lasse ihre Sachen lieber in Ruhe.',
    },

    chair: {
      look: 'Ein Stuhl neben dem Nachttisch. Hier kann ich warten.',
      use: (story) => sitDown(story),
    },

    suitcase: {
      look: 'Ein Koffer mit Anhänger: „H. Adler – Ringbahnhof“.',
      use: 'Abgeschlossen. Und es ist nicht meiner.',
    },
  },

  items: {
    sleepNotes: { look: (story) => arrangeSentence(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  // ---------------------------------------------------------------- Tunnel
  async onTunnel(story, inside) {
    const f = story.flags;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      await story.idle();
      if (!inTunnel(story)) return;
      if (f.ladyAwake) {
        await story.cutscene(async () => {
          await story.speak('Oh … der Tunnel. Im Tunnel schlafe ich immer ein. Immer …', { at: LADY, color: VOICES.lady });
        });
      } else if (!f.darkNoted) {
        f.darkNoted = true;
        await story.say('Licht aus. Frau Adler schnarcht einfach weiter.');
      }
      return;
    }
    // Nach dem Tunnel: alles wieder wie vorher
    const wasAwake = f.ladyAwake;
    const boxWasDown = f.hatboxDown;
    f.ladyAwake = false;
    f.brakePulled = false;
    f.hatboxDown = false;
    f.hatboxOpen = false;
    f.hatboxFall = 0;
    await story.idle();
    if ((wasAwake || boxWasDown) && !f.resetNoted) {
      f.resetNoted = true;
      await story.cutscene(async () => {
        await story.wait(0.5);
        await story.say('Frau Adler schläft wieder. Die Notbremse ist verplombt. Und die Hutschachtel steht wieder ganz oben.');
        await story.say('Als wäre nichts gewesen. Nur was ich bei mir trage, bleibt.');
      });
    } else if ((f.heard?.length ?? 0) > 0 && f.heard.length < CHUNKS.length && !story.isBusy) {
      await story.wait(1);
      if (!story.isBusy && !inTunnel(story)) await story.say('Frau Adler murmelt wieder. Klingt anders als vorhin.');
    }
  },
};

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('door');
      story.fadeIn(1.6);
      await story.wait(1.4);
      await story.say('Der Schlafwagen. Dunkel, warm … und jemand schnarcht.');
      await story.speak('… mmh … das Wort … das Wort …', { at: LADY, color: VOICES.lady });
      await story.say('Sie redet im Schlaf.');
    });
  }
  story.note('Schlafwagen: Im unteren Bett schläft eine alte Dame und murmelt im Schlaf. Hinten ist ein Gitter zum Gepäckwagen.');
}

// ============================================================================================
//  Frau Adler
// ============================================================================================

function murmur(story) {
  return MURMURS[tunnels(story) % MURMURS.length];
}

async function visitSleeper(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln lasse ich sie lieber schlafen.');
  const index = await story.choose(['Zuhören, was sie murmelt', 'Sie aufwecken', 'Sie schlafen lassen'], 'Frau Adler schläft');
  if (index === 0) return listen(story);
  if (index === 1) {
    await story.say('Frau Adler? Hallo? Aufwachen!');
    story.sound('snore');
    await story.wait(0.8);
    await story.say('Sie schläft wie ein Stein. Rufen hilft nicht.');
    if (!story.flags.wakeNoted) {
      story.flags.wakeNoted = true;
      story.note('Frau Adler wacht nicht auf, wenn ich sie rufe. Sie schläft wie ein Stein.');
    }
  }
}

async function listen(story) {
  const f = story.flags;
  const { chunks, text } = murmur(story);
  await story.say('Ich beuge mich zu ihr hinunter …');
  f.ladyTalking = true;
  await story.speak(text, { at: LADY, color: VOICES.lady });
  f.ladyTalking = false;
  const fresh = chunks.filter((chunk) => !f.heard.includes(chunk));
  if (fresh.length === 0) {
    await story.say(f.heard.length >= CHUNKS.length
      ? 'Das habe ich schon. Ich habe alle Stücke.'
      : 'Das hat sie vorhin schon gesagt. Nach dem nächsten Tunnel murmelt sie bestimmt etwas anderes.');
    return;
  }
  f.heard.push(...fresh);
  if (!story.has('sleepNotes')) {
    story.give('sleepNotes');
    await story.say('Das schreibe ich mir auf.');
    story.note('Frau Adler murmelt im Schlaf Stücke eines Satzes. Ich schreibe sie auf einen Zettel (Rechtsklick auf den Zettel im Inventar).');
  } else {
    story.sound('paper');
    await story.say('Ein neues Stück! Auf den Zettel damit.');
  }
  story.note(`Frau Adler murmelt (Runde ${story.lap}): „${fresh.map((chunk) => CHUNKS[chunk]).join(' … ')}“`);
  if (f.heard.length >= CHUNKS.length) {
    await story.say('Das müssten alle Stücke sein. Jetzt muss ich sie nur noch richtig zusammensetzen.');
  } else if (!f.roundsNoted) {
    f.roundsNoted = true;
    await story.say('Das ist nur ein Stück. Vielleicht murmelt sie in jeder Runde etwas anderes …');
  }
}

async function arrangeSentence(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich meinen Zettel nicht lesen.');
  story.sound('paper');
  const done = await story.view('sentence', { chunks: CHUNKS, heard: f.heard ?? [] });
  if (!done || f.sentenceDone) return;
  f.sentenceDone = true;
  await story.say('„Das Wort für das Gitter steht im Spiegel, wenn der Mond ins Fenster schaut. Aber nur, wenn das Rollo oben ist.“');
  story.note('Frau Adlers Satz: „Das Wort für das Gitter steht im Spiegel, wenn der Mond ins Fenster schaut. Aber nur, wenn das Rollo oben ist.“');
  await story.say(f.blindUp ? 'Das Rollo ist schon oben. Jetzt fehlt nur der Mond.' : 'Alle Rollos sind unten. Nur das mittlere rechts hat eine Schlaufe – eine abgerissene.');
}

// Mit der Taschenlampe ins Gesicht: Sie wacht auf, schreit, zieht die Notbremse
async function wakeLady(story) {
  const f = story.flags;
  if (f.ladyAwake) return story.say('Sie ist doch schon wach. Und mehr als genug erschrocken.');
  const lady = (text) => story.speak(text, { at: LADY, color: VOICES.lady });
  await story.cutscene(async () => {
    await story.say('Ich leuchte ihr ins Gesicht …');
    f.ladyAwake = true;
    f.ladyTalking = true;
    story.sound('dread');
    await lady('AAAH! Licht! Der Mann mit dem Schal!! Hilfe! Notbremse!!');
    await story.say('Sie springt aus dem Bett, quer durch den Wagen – an die Notbremse!');
    f.brakePulled = true;
    story.sound('brake');
    for (const [delay, strength] of [[0, 5], [0.25, 4], [0.6, 3], [1.1, 2]]) {
      story.wait(delay).then(() => story.motion.bump(strength));
    }
    story.motion.flickerStart = story.motion.time;
    await story.wait(0.6);
    f.hatboxDown = true;
    await story.wait(0.5);
    story.sound('thud');
    await story.wait(1.2);
    await story.say('Die Räder kreischen … aber der Zug wird nicht langsamer. Kein bisschen.');
    await story.say('Und von der Gepäckablage ist etwas heruntergefallen.');
    await lady('Oh … Sie sind es gar nicht. Sie sehen nur aus wie er. Verzeihung.');
    f.ladyTalking = false;
  });
  if (!f.brakeNoted) {
    f.brakeNoted = true;
    story.note('Mit der Taschenlampe geweckt, hat Frau Adler mich für „den Mann mit dem Schal“ gehalten und die Notbremse gezogen. Der Zug bremst nicht – aber der Ruck hat die Hutschachtel von der Gepäckablage geworfen.');
  }
}

async function talkToLady(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln erschrecke ich sie nur wieder.');
  const used = (f.ladyTopics ??= {});
  const lady = async (text) => {
    f.ladyTalking = true;
    await story.speak(text, { at: LADY, color: VOICES.lady });
    f.ladyTalking = false;
  };
  for (;;) {
    const topics = [
      { id: 'who', text: 'Wer sind Sie?' },
      { id: 'scarf', text: 'Wer ist der Mann mit dem Schal?' },
      { id: 'word', text: 'Sie murmeln im Schlaf. Was bedeutet das?' },
      { id: 'grate', text: 'Was ist hinter dem Gitter?' },
      f.hatboxDown && { id: 'hatbox', text: 'Gehört Ihnen die Hutschachtel?' },
      { id: 'bye', text: 'Schlafen Sie gut, Frau Adler.' },
    ].filter(Boolean);
    const index = await story.choose(topics.map((topic) => ({ text: topic.text, used: used[topic.id] })), 'Frau Adler');
    const topic = topics[index];
    if (!topic) return;
    used[topic.id] = true;
    await story.say(topic.text);
    if (topic.id === 'bye') {
      await lady('Ich versuche es. Im Tunnel schlafe ich sowieso immer ein.');
      return;
    }
    if (topic.id === 'who') {
      await lady('Henriette Adler. Eigentlich sitze ich im Speisewagen, an Tisch vier. Aber ich bin so müde …');
      await lady('Jede Runde stoßen wir an. Und jede Runde verschwindet einer. Ich will das nicht mehr sehen.');
    } else if (topic.id === 'scarf') {
      await lady('Er sieht aus wie Sie. Nur … müder. Viel müder. Er schläft nie.');
      await lady('Jede Runde leuchtet er mir ins Gesicht und fragt, ob ich das Wort noch weiß.');
      story.note('Frau Adler über den Mann mit dem Schal: „Er sieht aus wie Sie. Nur müder. Er schläft nie.“');
    } else if (topic.id === 'word') {
      await lady('Das Wort? Er hat es in den Spiegel geschrieben – damit er es selbst nicht vergisst.');
      await lady('Und dann hat er mein Rollo heruntergerissen. Damit es keiner lesen kann. Nur im Mondlicht sieht man es.');
      story.note('Frau Adler: Der Mann mit dem Schal hat das Wort in den Spiegel geschrieben. Man sieht es nur im Mondlicht. Er hat das Rollo heruntergerissen.');
    } else if (topic.id === 'grate') {
      await lady('Der Gepäckwagen. Mein Kasimir ist da drin – mein Papagei! Ganz allein im Dunkeln.');
      await lady('Bitte sehen Sie nach ihm. Und geben Sie ihm etwas zu fressen, sonst redet er kein Wort.');
      story.note('Frau Adlers Papagei Kasimir ist im Gepäckwagen. „Geben Sie ihm etwas zu fressen, sonst redet er kein Wort.“');
    } else if (topic.id === 'hatbox') {
      await lady('Ach, die ist heruntergefallen? Nehmen Sie ruhig, was Sie brauchen. Hüte trage ich nachts nicht.');
    }
  }
}

// ============================================================================================
//  Hutschachtel, oberes Bett, Rollo
// ============================================================================================

async function openHatbox(story) {
  const f = story.flags;
  if (story.has('hatpin')) {
    f.hatboxOpen = true;
    return story.say('Nur noch der Hut mit den Federn. Der steht mir nicht.');
  }
  story.sound('paper');
  f.hatboxOpen = true;
  await story.say('Ein Hut mit drei Federn …');
  story.give('hatpin');
  await story.say('… und eine lange Hutnadel. Die Spitze ist zu einem kleinen Haken umgebogen.');
  story.note('In Frau Adlers Hutschachtel: eine Hutnadel, deren Spitze zu einem Haken umgebogen ist.');
}

async function climbUp(story) {
  const f = story.flags;
  await story.say('Ich klettere die Leiter hoch …');
  if (f.pillowNote) return story.say('Im oberen Bett liegt niemand. Unter dem Kissen war nur der Zettel.');
  f.pillowNote = true;
  await story.say('Niemand da. Aber unter dem Kopfkissen steckt ein Zettel.');
  story.sound('paper');
  await story.card({
    kind: 'paper',
    lines: [
      'Joseph. Die alte Dame redet im Schlaf – jede Runde ein anderes Stück. Hör zu und schreib mit.',
      'Rufen weckt sie nicht. Licht schon. Aber dann zieht sie die Notbremse.',
      'Das Wort im Spiegel habe ICH geschrieben. Und ich habe das Rollo heruntergerissen. Es tut mir leid.',
    ],
    signature: '– J.',
  });
  await story.say('Wieder meine Schrift.');
  story.note('Zettel im oberen Bett, in meiner Schrift: „Sie redet im Schlaf – jede Runde ein anderes Stück. Rufen weckt sie nicht, Licht schon. Dann zieht sie die Notbremse. Das Wort im Spiegel habe ich geschrieben.“');
}

async function raiseBlind(story) {
  const f = story.flags;
  if (f.blindUp) return story.say('Das Rollo ist schon oben.');
  await story.say('Mit dem Haken der Hutnadel angle ich nach dem kleinen Ring …');
  await story.wait(0.6);
  story.sound('blind');
  f.blindUp = true;
  await story.wait(0.4);
  await story.say('Hab ihn! Das Rollo schnellt hoch.');
  story.note('Mit der Hutnadel habe ich das Rollo am mittleren rechten Fenster hochgezogen. Jetzt kann der Mond hereinscheinen.');
  if (f.moonlight > 0.5) return;
  await story.say(f.sentenceDone ? 'Jetzt muss nur noch der Mond in dieses Fenster schauen.' : 'Draußen Schnee und Wald. Und der Mond wandert, Runde um Runde.');
}

// ============================================================================================
//  Spiegel und Mond
// ============================================================================================

async function noticeMoon(story) {
  story.sound('shimmer');
  await story.respond(async () => {
    story.faceToward({ x: MIRROR_CENTER.x, y: MIRROR_CENTER.y });
    await story.say('Der Mond scheint durchs Fenster – quer durch den Wagen, genau auf den Spiegel!');
  });
}

async function watchMirror(story) {
  const f = story.flags;
  if (story.isDark) return story.say('Im Dunkeln sehe ich im Spiegel gar nichts.');
  const watching = story.view('mirror', { light: () => f.moonlight, word: CODE });
  if (f.moonlight < 0.5) {
    await story.say('Beschlagen. Ich sehe nur mich selbst – müde und verschwommen.');
    if (f.sentenceDone) await story.say('Das Wort steht im Spiegel, wenn der Mond ins Fenster schaut …');
  }
  const seen = await watching;
  if (!seen || f.wordSeen) return;
  f.wordSeen = true;
  story.sound('dread');
  await story.say('Ein Wort im Mondlicht – in Spiegelschrift. Von rechts nach links: S … C … H … A … L.');
  await story.say('SCHAL.');
  story.note('Im Mondlicht stand im Spiegel ein Wort in Spiegelschrift: SCHAL. Fünf Buchstaben – wie am Gitter.');
}

// Auf dem Stuhl warten: auf den Tunnel – oder bis der Mond in das freie Fenster schaut
async function sitDown(story) {
  const f = story.flags;
  const options = ['Bis zum nächsten Tunnel warten'];
  if (f.blindUp) options.push('Warten, bis der Mond ins Fenster schaut');
  options.push('Lieber nicht');
  const index = await story.choose(options, 'Warten');
  if (options[index] === 'Bis zum nächsten Tunnel warten') return waitForTunnel(story, { sit: 'Ich setz mich und warte auf den Tunnel. Nicht einschlafen …' });
  if (options[index] === 'Warten, bis der Mond ins Fenster schaut') return waitForMoon(story);
}

async function waitForMoon(story) {
  if (story.flags.moonlight > 0.5) return story.say('Der Mond scheint doch gerade herein!');
  const motion = story.motion;
  const outside = story.scene.outside;
  let ahead = null;
  for (let d = 0.5; d < motion.lapLength; d += 0.25) {
    const heading = (((motion.lapTime + d) % motion.lapLength) / motion.lapLength) * 360;
    if (outside.moonWindow(heading)?.from === MOON_WINDOW.from) {
      ahead = d;
      break;
    }
  }
  if (ahead === null) return story.say('Der Mond kommt nicht. Seltsam.');
  if (ahead > motion.tunnelAhead) {
    await story.say('Vorher kommt noch der Tunnel.');
    return waitForTunnel(story, { sit: 'Ich setz mich und warte. Erst der Tunnel, dann der Mond. Nicht einschlafen …' });
  }
  await story.cutscene(async () => {
    await story.say('Ich setz mich und sehe zum Fenster. Der Mond wandert … ganz langsam …');
    await story.fadeOut(1);
    motion.advance(Math.max(0, ahead - 0.5));
    await story.wait(0.6);
    story.fadeIn(1);
    await story.wait(0.8);
  });
}

// ============================================================================================
//  Gitter
// ============================================================================================

async function tryLock(story) {
  let tries = 0;
  const opened = await story.codeLock({
    id: 'grate',
    digits: CODE.length,
    alphabet: LETTERS,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === CODE;
    },
  });
  if (opened) return openGrate(story);
  if (tries === 0 || inTunnel(story)) return;
  await story.say(story.flags.wordSeen ? 'Falsch. Das Wort aus dem Spiegel – rückwärts gelesen!' : 'Nichts. Fünf Buchstaben – raten bringt hier nichts.');
}

async function openGrate(story) {
  await story.cutscene(async () => {
    story.flags.grateOpen = true;
    story.sound('chain');
    await story.say('S – C – H – A – L. Das Schloss springt auf.');
    await story.speak('… Kasimir … pass auf Kasimir auf …', { at: LADY, color: VOICES.lady });
    await story.say('Mach ich, Frau Adler. Schlafen Sie gut.');
    story.sound('slide');
    await story.wait(1);
    await story.fadeOut(1.4);
    story.note('Das Gitter zum Gepäckwagen ging mit dem Wort SCHAL auf.');
  });
  await finishWagon(story, { number: 3, next: 4, nextName: 'Gepäckwagen' });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  const heard = f.heard?.length ?? 0;
  if (f.wordSeen) {
    return { id: 'grate', lines: ['Das Wort aus dem Spiegel gehört ans Gitter: S – C – H – A – L.'] };
  }
  if (heard === 0) {
    return { id: 'listen', lines: [
      'Die alte Dame murmelt im Schlaf. Ich sollte genau hinhören.',
      'Linksklick auf Frau Adler, dann „Zuhören“.',
    ] };
  }
  if (heard < CHUNKS.length) {
    return { id: `more${heard}`, lines: [
      'Sie murmelt nur Stücke eines Satzes. In jeder Runde vielleicht ein anderes?',
      'Nach jedem Tunnel noch einmal zuhören. Auf dem Stuhl neben dem Nachttisch kann ich auf den Tunnel warten.',
    ] };
  }
  if (!f.sentenceDone) {
    return { id: 'sentence', lines: [
      'Ich habe alle Stücke auf meinem Zettel. Rechtsklick auf den Zettel im Inventar – dann die Stücke ordnen.',
      'Der Satz fängt mit „Das Wort“ an und hört mit „wenn das Rollo oben ist.“ auf.',
    ] };
  }
  if (!f.blindUp) {
    if (!story.has('hatpin')) {
      return { id: 'hatpin', lines: [
        'Das Rollo am mittleren rechten Fenster muss hoch. Die Schlaufe ist abgerissen – ich bräuchte etwas Langes mit einem Haken.',
        'Ganz oben auf der Gepäckablage steht eine Hutschachtel. In Hutschachteln gibt es Hutnadeln. Wenn sie nur herunterfiele …',
        f.pillowNote ? 'Der Zettel aus dem oberen Bett sagt: Licht weckt sie – und dann zieht sie die Notbremse. Ein ordentlicher Ruck …' : 'Im oberen Bett (über die Leiter) liegt vielleicht ein Hinweis.',
        'Taschenlampe im Inventar anklicken, dann Frau Adler: Sie wacht auf und zieht die Notbremse. Der Ruck wirft die Hutschachtel herunter.',
      ] };
    }
    return { id: 'blind', lines: ['Mit dem Haken der Hutnadel komme ich an den Ring des Rollos: Hutnadel im Inventar anklicken, dann das mittlere rechte Fenster.'] };
  }
  return { id: 'moon', lines: [
    'Das Rollo ist oben. Jetzt muss der Mond in dieses Fenster schauen – dann in den Spiegel sehen.',
    'Auf dem Stuhl kann ich warten, bis der Mond kommt. Dann den Spiegel hinten rechts ansehen.',
  ] };
}
