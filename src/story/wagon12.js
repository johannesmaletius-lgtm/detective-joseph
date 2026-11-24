import {
  ENDING, KNOCK_SPOT, MESSAGE, NOTES, SONG, drawKeyboard, drawKnocking, drawRecords, drawScore, keySpots, sleeveSpots,
} from './art/wagon12.js';
import { LETTERS, finishWagon, hintFor, inTunnel, skipIntro, tryCode, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 12 – Der Musiksalon, Herr Moll
// ============================================================================================
//
// Herr Moll summt Bruchstücke eines Liedes, das er nicht vergessen kann – und nicht zu Ende weiß.
//
// DIE RÄTSEL
//   1. Das Notenblatt ist in drei Stücke gerissen: unter dem Polster der Klavierbank, unter der
//      Teppichecke, in der Plattenhülle „Weihnachtsfeier · Zug 24“. Zusammensetzen.
//   2. Über vier Noten stehen Bleistiftkreuze (vom anderen Joseph). Deutsche Notennamen:
//      H – A – Es (= S) – E → „HASE“. Das ist das Wort für das Schloss der Spieldose; darin der
//      Schlüssel für den Tastendeckel des Klaviers.
//   3. Herr Moll spielt nur im Takt der Räder: auf dem Klavierdeckel viermal genau mit den
//      Schienenstößen klopfen. Dann spielt er – bis zum verwischten letzten Takt.
//   4. „Es endet, wie es anfängt. Nur rückwärts.“ Anfang: G A H D → Schluss: D H A G am Klavier.
//      Moll erzählt von der Weihnachtsfeier im Zug, für die Frau und die Tochter des Schaffners.
//      „Seitdem fährt der Zug im Kreis.“ Beim letzten Ton springt die Tür auf.

const KNOCKS = 4;          // so oft muss Joseph im Takt klopfen
const KNOCK_WINDOW = 0.24; // so genau (Sekunden)

export const wagon12 = {
  flags: {},
  startItems: ['flashlight', 'gear'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Eine Gestalt mit meinen Sachen führt die Fahrgäste in den Tunnel. Es gibt zwei von mir.',
    'Der Schaffner ruft die Fahrgäste über den Lautsprecher, und wer seinen Namen hört, geht wie im Schlaf.',
    'Uhrenwagen: Herr Ticks Uhren haben den Ruf übertönt. Er ist geblieben – die erste Rettung. Er gab mir ein Zahnrad: „Das wirst du vorne brauchen.“',
    'Herr Tick misst den Tunnel: Vor hundert Runden dauerte er drei Ticks, jetzt zwölf. Er wird jede Runde länger. Wenn es darin nicht mehr hell wird, kommt keiner mehr heraus.',
  ],

  setup(story) {
    story.flags.joints ??= [];
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 12,
      title: 'Der Musiksalon',
      lines: [
        'Ein Salon mit Klavier und Grammophon.',
        'Und jemand summt. Immer dieselben paar Töne.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    moll: {
      look: 'Ein großer, dünner Herr im Frack. Er summt und bricht immer an derselben Stelle ab.',
      use: (story) => talkMoll(story),
      items: {
        score: (story) => showScore(story),
        score12: 'Herr Moll: „Da fehlt noch ein Stück, Junge.“',
        score1: 'Herr Moll: „Ein Stück … nur ein Stück.“',
        score2: 'Herr Moll: „Ein Stück … nur ein Stück.“',
        score3: 'Herr Moll: „Ein Stück … nur ein Stück.“',
      },
    },
    bench: {
      look: (story) => story.say(story.flags.benchTaken ? 'Die Klavierbank.' : 'Die Klavierbank. Das Polster lässt sich hochklappen.'),
      use: (story) => takePiece(story, 'benchTaken', 'score1', 'Ich klappe das Polster hoch … darunter liegt ein Stück Notenpapier!'),
    },
    carpet: {
      look: (story) => story.say(story.flags.carpetTaken ? 'Die Teppichecke.' : 'Eine Ecke des Teppichs steht hoch, als läge etwas darunter.'),
      use: (story) => takePiece(story, 'carpetTaken', 'score2', 'Unter der Teppichecke: noch ein Stück Notenpapier.'),
    },
    records: {
      look: 'Ein Stapel Schallplatten in bunten Hüllen.',
      use: (story) => records(story),
    },
    gramophone: {
      look: 'Ein Grammophon mit goldenem Trichter.',
      use: 'Es ist keine Platte aufgelegt. Und die Platten in den Hüllen sind alle zerkratzt.',
    },
    musicBox: {
      look: (story) => story.say(story.flags.boxOpen ? 'Die Spieldose ist offen und leer.' : 'Eine kleine Spieldose auf dem Klavier. Ein Schloss mit vier Buchstaben-Rädchen.'),
      use: (story) => openMusicBox(story),
    },
    stand: {
      look: 'Der Notenständer. Leer – bis auf ein paar Bleistiftkrümel.',
      items: { score: (story) => showScore(story) },
    },
    keys: { look: (story) => lookPiano(story), use: (story) => usePiano(story), items: { musicKey: (story) => unlockPiano(story) } },
    piano: { look: (story) => lookPiano(story), use: (story) => usePiano(story), items: { musicKey: (story) => unlockPiano(story) } },
    flowers: { look: 'Rote Rosen und eine weiße Lilie. Sie welken nicht.' },
    lamp: { look: 'Eine kleine Lampe mit Fransen.' },
    chandelier: { look: 'Ein Kronleuchter. Bei jedem Schienenstoß klirren die Kristalle leise.' },
    sofa: {
      look: 'Ein rotes Samtsofa.',
      use: (story) => waitForTunnel(story, 'Ich setze mich kurz aufs Sofa und warte auf den Tunnel …'),
    },
    door: {
      look: (story) => story.say(story.flags.doorOpen ? 'Die Tür ist offen.' : 'Die Tür nach vorne. Statt eines Schlosses: ein Notenschlüssel aus Messing.'),
      use: (story) => (story.flags.doorOpen ? leaveWagon(story) : story.say('Zu. Ein Notenschlüssel statt eines Schlosses. Vielleicht öffnet sie sich mit Musik.')),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnelwand.' : 'Draußen Schnee.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    score: { look: (story) => showScore(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onCombine(story, result) {
    if (result === 'score') {
      story.note('Herrn Molls Notenblatt ist wieder ganz: „Für die Weihnachtsfeier – Zug 24“. Über vier Noten stehen Bleistiftkreuze, der letzte Takt ist verwischt.');
    }
  },

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },

  update(story) {
    // Schienenstöße mitzählen (für das Klopfen im Takt)
    const f = story.flags;
    for (const bump of story.motion.bumps) {
      if (bump.strength === 1 && !bump.counted) {
        bump.counted = true;
        f.joints.push(bump.start);
        if (f.joints.length > 8) f.joints.shift();
      }
    }
  },
};

// ============================================================================================
//  Die drei Stücke des Notenblatts
// ============================================================================================

async function takePiece(story, flag, item, line) {
  const f = story.flags;
  if (f[flag]) return story.say('Da ist nichts mehr.');
  if (inTunnel(story)) return story.say('Im Dunkeln taste ich lieber nicht herum.');
  f[flag] = true;
  story.give(item);
  await story.say(line);
  pieceNote(story);
}

function pieceNote(story) {
  const f = story.flags;
  const count = [f.benchTaken, f.carpetTaken, f.sleeveTaken].filter(Boolean).length;
  if (count === 1) story.note('Ein Stück Notenpapier gefunden – zerrissen. Es gibt noch mehr Stücke.');
}

async function records(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Hüllen nicht lesen.');
  await story.view('picture', {
    draw: (ctx) => drawRecords(ctx, f.sleeveTaken),
    spots: sleeveSpots(),
    area: { x: 160, y: 140, w: 960, h: 420 },
    help: 'Hülle anklicken: hineinsehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.id !== 'xmas') return story.say(`„${spot.title}“. Nur eine zerkratzte Platte.`);
      if (f.sleeveTaken) return story.say('Leer.');
      f.sleeveTaken = true;
      story.give('score3');
      view.close(true);
      await story.say('„Weihnachtsfeier · Zug 24“ … keine Platte drin. Nur ein Stück Notenpapier.');
      pieceNote(story);
    },
  });
}

async function showScore(story) {
  const f = story.flags;
  if (!story.has('score') && !f.boxOpen) return story.say('Erst brauche ich alle drei Stücke.');
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich keine Noten lesen.');
  story.sound('paper');
  await story.card({ draw: (ctx) => drawScore(ctx, { solvedEnding: f.endingPlayed }) });
  if (!f.scoreRead) {
    f.scoreRead = true;
    await story.say('Über vier Noten hat jemand mit Bleistift kleine Kreuze gemacht. In meiner Schrift steht daneben: „H statt B! Es = S“.');
    await story.say('Deutsche Notennamen … aus Noten kann man Wörter machen.');
    story.note('Notenblatt: Bleistiftkreuze über vier Noten. Am Rand, in meiner Schrift: „H statt B! Es = S“ und „Im Takt der Räder spielen.“ Der letzte Takt ist verwischt.');
  }
}

// ============================================================================================
//  Spieldose und Klavier
// ============================================================================================

async function openMusicBox(story) {
  const f = story.flags;
  if (f.boxOpen) return story.say('Leer. Den Schlüssel habe ich.');
  const opened = await tryCode(story, {
    id: 'musicBox',
    code: MESSAGE,
    alphabet: LETTERS,
    dark: 'Im Dunkeln sehe ich die Buchstaben nicht.',
    wrong: (s) => (s.flags.scoreRead ? 'Falsch. Was sagen die Noten mit den Kreuzen?' : 'Falsch. Vier Buchstaben …'),
  });
  if (!opened) return;
  f.boxOpen = true;
  story.sound('unlock');
  story.tone(NOTES.G.freq, { duration: 0.4 });
  story.tone(NOTES.A.freq, { duration: 0.4, delay: 0.35 });
  story.tone(NOTES.H.freq, { duration: 0.5, delay: 0.7 });
  await story.say('HASE. Die Spieldose springt auf und spielt drei Töne …');
  story.give('musicKey');
  await story.say('Darin liegt ein kleiner Schlüssel mit einem Notenschlüssel am Griff.');
  story.note('Die Kreuze im Notenblatt ergeben H – A – S – E: „HASE“. Damit ging die Spieldose auf. Darin: ein kleiner Schlüssel.');
}

function lookPiano(story) {
  const f = story.flags;
  if (!f.pianoOpen) return story.say('Ein altes Klavier. Der Tastendeckel ist abgeschlossen.');
  return story.say(f.endingPlayed ? 'Das Klavier. Das Lied ist zu Ende gespielt.' : 'Das Klavier. Der Deckel ist offen.');
}

async function unlockPiano(story) {
  const f = story.flags;
  story.remove('musicKey');
  f.pianoOpen = true;
  story.sound('unlock');
  await story.say('Der Schlüssel passt. Der Tastendeckel ist offen.');
  await story.speakAs('moll', 'Mein Klavier … offen? Nach so vielen Runden!');
  story.note('Der Tastendeckel des Klaviers ist offen.');
}

async function usePiano(story) {
  const f = story.flags;
  if (!f.pianoOpen) return story.say('Der Tastendeckel ist abgeschlossen. Ein kleines Schlüsselloch mit einem Notenschlüssel daneben.');
  if (!f.mollPlayed) return story.say('Ich kann nicht Klavier spielen. Aber Herr Moll.');
  if (f.endingPlayed) return story.say('Ich lasse das Klavier jetzt in Ruhe.');
  return playEnding(story);
}

// ============================================================================================
//  Herr Moll
// ============================================================================================

async function talkMoll(story) {
  const f = story.flags;
  if (f.endingPlayed) {
    await story.speakAs('moll', 'Seitdem fährt der Zug im Kreis. Und ich spiele, damit ich nicht vergesse, für wen.');
    return;
  }
  if (!f.mollMet) {
    f.mollMet = true;
    await story.speakAs('moll', 'Hm-hm-hmm … hm-hm … und dann … und dann …');
    await story.speakAs('moll', 'Verzeihung. Ich weiß nicht mehr, wie es weitergeht. Seit Ewigkeiten nicht.');
  }
  for (;;) {
    const topics = [
      { id: 'song', text: 'Was ist das für ein Lied?', done: f.askedSong },
      { id: 'play', text: 'Spielen Sie es mir vor?', when: f.askedSong, done: f.mollPlayed },
      { id: 'end', text: 'Wie endet das Lied?', when: f.mollPlayed && !f.endingPlayed },
      { id: 'bye', text: 'Ich sehe mich um.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'song') {
      f.askedSong = true;
      await story.speakAs('moll', 'Ein Weihnachtslied. Ich habe es geschrieben, für einen ganz besonderen Abend.');
      await story.speakAs('moll', 'Das Notenblatt ist zerrissen, irgendwo hier im Salon. Mein Kopf ist ein Sieb.');
    }
    if (topic === 'play') await askToPlay(story);
    if (topic === 'end') {
      await story.speakAs('moll', 'Das Ende … es endet, wie es anfängt. Nur rückwärts. Wie ein Zug, der zurückfährt.');
      await story.speakAs('moll', 'Spiel du es, Junge. Meine Finger finden es nicht.');
      if (!f.endHint) {
        f.endHint = true;
        story.note('Herr Moll: „Das Lied endet, wie es anfängt. Nur rückwärts.“ Den Schluss soll ich am Klavier spielen.');
      }
    }
  }
}

async function askToPlay(story) {
  const f = story.flags;
  if (f.mollPlayed) return story.speakAs('moll', 'Ich habe es dir vorgespielt – bis auf das Ende.');
  if (!f.pianoOpen) {
    await story.speakAs('moll', 'Mein Klavier ist abgeschlossen. Der Schlüssel liegt in der Spieldose.');
    await story.speakAs('moll', 'Und das Wort für die Spieldose … es war etwas, das die Kleine im Arm hielt. Ich weiß es nicht mehr.');
    if (!f.boxHint) {
      f.boxHint = true;
      story.note('Herr Moll: Der Klavierschlüssel liegt in der Spieldose. Das Wort dafür war „etwas, das die Kleine im Arm hielt“. Welche Kleine?');
    }
    return;
  }
  if (!story.has('score') && !f.scoreOnStand) {
    await story.speakAs('moll', 'Ohne Noten? Mein Kopf ist ein Sieb, Junge.');
    return;
  }
  f.scoreOnStand = true;
  await story.speakAs('moll', 'Ich spiele. Aber ich verliere immer den Takt. Klopf ihn mir – so wie die Räder. Ta … dam.');
  await knockRhythm(story);
}

async function knockRhythm(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln … lieber nach dem Tunnel.');
  let hits = 0;
  let lastJoint = null;
  const solved = await story.view('picture', {
    draw: (ctx) => {
      const joint = f.joints.at(-1) ?? -99;
      drawKnocking(ctx, { sinceJoint: story.motion.time - joint, hits, needed: KNOCKS });
    },
    spots: KNOCK_SPOT,
    area: { x: 300, y: 140, w: 680, h: 470 },
    help: 'Im Takt der Schienenstöße klicken  ·  Rechtsklick: zurück',
    onClick: (spot, view) => {
      const t = story.motion.time;
      const nearest = f.joints.reduce((best, j) => (Math.abs(j - t) < Math.abs(best - t) ? j : best), -99);
      story.sound('click');
      if (Math.abs(nearest - t) <= KNOCK_WINDOW && nearest !== lastJoint) {
        hits += 1;
        lastJoint = nearest;
        if (hits >= KNOCKS) {
          story.sound('success');
          setTimeout(() => view.close(true), 500);
        }
      } else {
        hits = 0;
      }
      return null;
    },
  });
  if (!solved) {
    if (!inTunnel(story)) await story.speakAs('moll', 'Nein, nein – im Takt der Räder! Ta … dam … ta … dam.');
    return;
  }
  await mollPlays(story);
}

async function mollPlays(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    const moll = story.character('moll');
    moll.moveTo(470, 590, 2.2);
    await story.wait(2.3);
    moll.pose = 'left';
    await story.speakAs('moll', 'Ja … ja, so!');
    let delay = 0;
    for (const bar of SONG.slice(0, 3)) {
      for (const note of bar) {
        story.tone(NOTES[note.n].freq, { duration: 0.55, delay, gain: 0.13 });
        delay += 0.5;
      }
      delay += 0.15;
    }
    await story.wait(delay + 0.4);
    await story.speakAs('moll', 'Und dann … und dann …');
    await story.speakAs('moll', 'Es ist weg. Der Schluss ist weg. Wie verwischt.');
    moll.moveTo(812, 470, 2.2);
    await story.wait(2.3);
    moll.pose = 'left';
  });
  f.mollPlayed = true;
  story.note('Herr Moll hat sein Lied gespielt, als ich den Takt geklopft habe – bis zum letzten Takt. Den weiß er nicht mehr.');
}

async function playEnding(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Tasten nicht.');
  const played = [];
  let pressed = null;
  let pressedAt = 0;
  const solved = await story.view('picture', {
    draw: (ctx, view) => drawKeyboard(ctx, { pressed, pressAge: view.age - pressedAt, played }),
    spots: keySpots(),
    area: { x: 110, y: 120, w: 1060, h: 520 },
    help: 'Tasten anklicken: spielen  ·  Rechtsklick: zurück',
    onClick: (spot, view) => {
      pressed = Number(spot.id.slice(1));
      pressedAt = view.age;
      story.tone(spot.freq, { duration: 0.7, gain: 0.14 });
      played.push(spot.name);
      if (played.length > 4) played.shift();
      if (played.length === 4 && played.join('') === ENDING.join('')) {
        setTimeout(() => view.close(true), 700);
      }
      return null;
    },
  });
  if (!solved) {
    if (!f.keysTried && !inTunnel(story)) {
      f.keysTried = true;
      await story.say('Vier Töne fehlen am Ende. Welche?');
    }
    return;
  }
  await theStory(story);
}

async function theStory(story) {
  const f = story.flags;
  f.endingPlayed = true;
  await story.cutscene(async () => {
    const moll = story.character('moll');
    moll.pose = 'front';
    await story.speakAs('moll', 'D … H … A … G. Ja! So endet es!');
    let delay = 0;
    for (const bar of SONG) {
      for (const note of bar) {
        story.tone(NOTES[note.n].freq, { duration: 0.6, delay, gain: 0.12 });
        delay += 0.48;
      }
      delay += 0.12;
    }
    await story.wait(delay + 0.6);
    moll.pose = 'talk';
    await story.speakAs('moll', 'Jetzt weiß ich es wieder. Ich habe es an einem Weihnachtsabend gespielt. Hier im Zug. Auf einer Feier.');
    await story.speakAs('moll', 'Für eine junge Frau und ihre kleine Tochter. Die Familie des Schaffners.');
    await story.speakAs('moll', 'Er selbst hatte frei. Er wollte sie am Bahnhof erwarten … mit dem Weihnachtsbaum.');
    await story.speakAs('moll', 'Die Kleine hat mitgesungen. Mit ihrem Stoffhasen im Arm.');
    await story.speakAs('moll', 'Und dann kam der Tunnel. Und der Bahnhof kam nie.');
    moll.pose = 'front';
    await story.speakAs('moll', 'Seitdem fährt der Zug im Kreis.');
    story.sound('unlock');
    f.doorOpen = true;
    await story.wait(0.6);
    await story.say('Beim letzten Ton hat es an der Tür geklickt.');
  });
  story.note('Herr Moll erinnert sich: Er hat das Lied an einem Weihnachtsabend hier im Zug gespielt – für die Frau und die kleine Tochter des Schaffners (mit Stoffhasen). Der Schaffner wollte sie am Bahnhof erwarten. „Seitdem fährt der Zug im Kreis.“');
}

async function leaveWagon(story) {
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Die Familie des Schaffners war in diesem Zug. An Weihnachten.');
    await story.say('Dem Schaffner ist an einem Weihnachtsabend etwas passiert. Und seitdem fährt der Zug im Kreis.');
    await finishWagon(story, {
      number: 12,
      title: 'Ende von Wagen 12',
      lines: ['„Seitdem fährt der Zug im Kreis.“'],
      nextTitle: 'in der Kapelle',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  const pieces = [f.benchTaken, f.carpetTaken, f.sleeveTaken].filter(Boolean).length;
  if (!story.has('score') && !f.boxOpen) {
    if (pieces < 3) {
      return { id: `pieces${pieces}`, lines: [
        'Herrn Molls Notenblatt ist zerrissen. Drei Stücke liegen irgendwo im Salon.',
        !f.benchTaken ? 'Das Polster der Klavierbank lässt sich hochklappen.' : !f.carpetTaken ? 'Eine Teppichecke vorne am Gang steht hoch.' : 'Bei den Schallplatten: In einer Hülle steckt keine Platte.',
      ] };
    }
    return { id: 'combine', lines: ['Ich habe mehrere Stücke eines Notenblatts. Zusammen ergeben sie vielleicht etwas.', 'Die Stücke des Notenblatts zusammensetzen: ein Stück im Inventar anklicken, dann ein anderes.'] };
  }
  if (!f.boxOpen) {
    return { id: 'box', lines: [
      'Das Notenblatt ansehen (Rechtsklick im Inventar). Über vier Noten stehen Kreuze.',
      'Deutsche Notennamen: Die Linie in der Mitte ist das H, darunter A, G, … Das ♭-E heißt „Es“ – also S.',
      'Die Kreuze ergeben H – A – S – E. Das ist das Wort für die Spieldose auf dem Klavier.',
    ] };
  }
  if (!f.pianoOpen) return { id: 'piano', lines: ['In der Spieldose lag ein kleiner Schlüssel. Wo gibt es hier ein kleines Schloss?', 'Den kleinen Schlüssel aus der Spieldose am Klavier benutzen.'] };
  if (!f.mollPlayed) {
    return { id: 'knock', lines: [
      'Herrn Moll bitten, das Lied zu spielen.',
      'Er braucht den Takt: genau dann klicken, wenn die Räder über einen Schienenstoß rumpeln (das Wasser im Glas zittert). Viermal hintereinander.',
    ] };
  }
  if (!f.endingPlayed) {
    return { id: 'ending', lines: [
      'Herrn Moll fragen, wie das Lied endet.',
      '„Es endet, wie es anfängt – nur rückwärts.“ Der erste Takt auf dem Notenblatt: G – A – H – D.',
      'Am Klavier D – H – A – G spielen.',
    ] };
  }
  return { id: 'door', lines: ['Die Tür ist offen.', 'Einfach durch die Tür nach vorne gehen.'] };
}
