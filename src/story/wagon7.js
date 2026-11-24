import { BOTTLES, BOTTLE_SPOTS, DOOR_SYMBOLS, drawBottles, drawCoaster, drawPaper } from './art/wagon7.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  WAGEN 7 – Der Barwagen (Herr K. und der Barkeeper)
// ============================================================================================
//
// Endlich: Herr K. Er steht am hinteren Tisch und wartet. Mit Joseph will er nicht reden.
//
// DIE RÄTSEL
//   1. Unauffällig lauschen: Herr K. redet nur, wenn Musik läuft – und nur, wenn ihm niemand
//      zusieht. Münze aus dem Aschenbecher → Musikbox. Zeitung vom Tresen → am hinteren Tisch
//      dahinter verstecken. Dann hört Joseph, was Herr K. dem Barkeeper erzählt.
//   2. Das Übliche: Der Barkeeper hat vergessen, was Herr K. jede Runde trinkt. Drei leere Gläser
//      von den letzten drei Runden (bernsteinfarbener Rest, riecht rauchig) und die Flaschen:
//      Nur beim Whisky („torfig · rauchig“) fehlen genau drei Gläser → Whisky für Herrn K.
//   3. Dafür bekommt Joseph Herrn K.s Bierdeckel: Strichlisten neben den vier Zeichen vom
//      Türschloss aus Wagen 1 (Tunnel 2, Laterne links 6, Laterne rechts 9, Turm 1). Das Schloss
//      der Tür hat dieselben Zeichen, aber in anderer Reihenfolge: Turm, Laterne rechts, Tunnel,
//      Laterne links → 1 9 2 6.
//   4. Kaum ist die Tür offen, ruft der Schaffner: „Fahrgast K., bitte zum Tunnel.“ Herr K. geht.
//      Joseph kann ihn nicht halten – im Dunkeln ist er fort.

const DOOR_CODE = '1926';
const SPEAKER = { x: 460, y: 180 };
const VOICE = '#a6f0b6';
const MUSIC_LENGTH = 45; // Sekunden, die ein Lied läuft

export const wagon7 = {
  flags: {},
  startItems: ['flashlight', 'knife', 'photo', 'watch'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Das vergiftete Glas im Speisewagen war für Herrn K. Seine Spuren im Schlafwagen führten zum Tunnel.',
    'Foto: Herr K. und der Schaffner, vor einem Weihnachtsbaum. Sie waren Freunde.',
    'Fundbüro: Herrn K.s Sachen werden erst in der nächsten Runde gefunden. Er ist noch da – ich kann ihn warnen!',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 7,
      title: 'Der Barwagen',
      lines: [
        'Der Barwagen. Und da hinten, am Tisch – ein alter Herr mit Hut und rotem Schal.',
        'Das ist er. Herr K.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  update(story) {
    // Die Musikbox spielt, solange das Lied läuft
    const f = story.flags;
    if (!musicOn(story)) return;
    if (story.motion.time >= (f.nextTune ?? 0)) {
      story.sound('jukebox');
      f.nextTune = story.motion.time + 4;
    }
  },

  hotspots: {
    k: {
      look: (story) => story.say(story.flags.metK
        ? 'Herr K. Er starrt auf die Tür, als würde er auf etwas warten.'
        : 'Ein alter Herr mit Hut, Brille, rotem Schal und Spazierstock. Genau wie auf dem Foto.'),
      use: (story) => talkToK(story),
      items: {
        photo: (story) => showPhoto(story),
        drink: (story) => serveDrink(story),
        newspaper: 'Ich halte ihm die Zeitung hin. Er schiebt sie weg. „Kenn ich schon. Jede Runde dieselbe.“',
        watch: async (story) => {
          await story.speakAs('k', 'Meine Uhr! Die hab ich … nein. Die bekomme ich erst noch. Behalt sie, Junge.');
        },
      },
    },
    barkeeper: {
      look: 'Der Barkeeper. Schnurrbart, Weste, ein Tuch über dem Arm. Er poliert dasselbe Glas – schon die ganze Zeit. Neben ihm steht ein Becher Kakao mit Strohhalm. Für wen der wohl ist?',
      use: (story) => talkToBarkeeper(story),
      items: {
        coin: 'Barkeeper: „Behalten Sie die. Die Musikbox will Münzen, nicht ich.“',
        drink: 'Barkeeper: „Nicht für mich! Für Herrn K.“',
      },
    },
    coaster: {
      look: (story) => story.say('Ein Bierdeckel mit lauter Strichen. Und kleinen Zeichen daneben.'),
      use: (story) => takeCoaster(story),
    },
    glasses: {
      look: 'Drei leere Gläser. Schwere, kurze Gläser. Am Boden ein bernsteinfarbener Rest.',
      use: async (story) => {
        story.sound('sniff');
        await story.wait(0.6);
        await story.say('Es riecht … rauchig. Wie ein Kaminfeuer.');
        if (!story.flags.smelled) {
          story.flags.smelled = true;
          story.note('Drei leere Gläser auf dem Tresen (von Herrn K., aus den letzten drei Runden): bernsteinfarbener Rest, riecht rauchig.');
        }
      },
    },
    newspaper: {
      look: 'Eine Zeitung auf dem Tresen. Der „Ringbahn-Kurier“.',
      use: async (story) => {
        story.flags.newspaperTaken = true;
        story.give('newspaper');
        await story.say('Die nehme ich mal mit. Groß genug, um sich dahinter zu verstecken.');
      },
    },
    bottles: {
      look: 'Ein Regal voller Flaschen hinter dem Tresen.',
      use: (story) => openBottles(story),
    },
    barBottles: { look: 'Ein paar Flaschen mit hellem Zeug. Sieht nicht nach dem Üblichen aus.', use: 'Die gehören dem Barkeeper.' },
    ashtray: {
      look: (story) => story.say(story.flags.coinTaken ? 'Ein Aschenbecher. Nur noch Asche.' : 'Ein Aschenbecher. Zwischen der Asche glänzt etwas.'),
      use: async (story) => {
        if (story.flags.coinTaken) return story.say('Nur noch Asche.');
        story.flags.coinTaken = true;
        story.sound('coin');
        story.give('coin');
        await story.say('Eine Münze! Zehn Pfennig.');
      },
    },
    jukebox: {
      look: 'Eine Musikbox. Bunte Lichter, und ein Schild: „Defekt – nur Münzen“.',
      use: (story) => (musicOn(story) ? story.say('Sie spielt gerade.') : story.say('Sie will eine Münze.')),
      items: { coin: (story) => playMusic(story) },
    },
    speaker: { look: 'Ein Lautsprecher an der Wand. Von hier ruft der Schaffner.' },
    backTable: {
      look: 'Der Tisch, an dem Herr K. steht. Eine Lampe, ein Aschenbecher.',
      use: (story) => eavesdrop(story, false),
      items: { newspaper: (story) => eavesdrop(story, true) },
    },
    frontTable: { look: 'Ein runder Tisch mit einer Lampe.', use: 'Hier sitzt niemand.' },
    stools: { look: 'Barhocker mit rotem Polster.', use: 'Wenn ich mich hier hinsetze, sieht mich Herr K. genau.' },
    bar: { look: 'Ein langer Tresen aus poliertem Holz.', use: 'Ich lehne mich an den Tresen. Der Barkeeper nickt mir zu.' },
    door: {
      look: 'Die Tür nach vorne. Ein Schloss mit vier Rädchen – darüber Zeichen: ein Turm, eine Laterne mit Pfeil nach rechts, ein Tunnel, eine Laterne mit Pfeil nach links.',
      use: (story) => tryDoor(story),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Draußen nur Tunnelwand.' : 'Schnee, Wald, der Turm. Und Herr K. spiegelt sich in der Scheibe.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    newspaper: {
      look: async (story) => {
        story.sound('paper');
        await story.card({ draw: drawPaper });
      },
    },
    coaster: { look: (story) => lookCoaster(story) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      return;
    }
    if (story.flags.ending) return;
    // Im Tunnel springt alles zurück: Die Münze liegt wieder im Aschenbecher
    if (story.flags.coinTaken && !story.has('coin')) story.flags.coinTaken = false;
    await story.idle();
    if (story.flags.metK) await story.speakAs('k', 'Noch nicht. Noch hat er mich nicht gerufen.');
  },
};

function musicOn(story) {
  return (story.flags.musicUntil ?? -1) > story.motion.time;
}

// ============================================================================================
//  Herr K.
// ============================================================================================

async function talkToK(story) {
  const f = story.flags;
  if (!f.metK) {
    f.metK = true;
    await story.say('Herr K.? Sie sind Herr K., oder?');
    await story.speakAs('k', 'Hm. Und wenn?');
    await story.say('Sie sind in Gefahr! Jemand hat Ihr Weinglas vergiftet. Und im Tunnel …');
    await story.speakAs('k', 'Ich weiß, Junge. Ich weiß.');
    await story.speakAs('k', 'Lass mich in Ruhe. Ich warte.');
    story.note('Herr K. steht im Barwagen – hierher ist er aus seinem Abteil gegangen, nach vorne. Er weiß, dass er in Gefahr ist, und will nicht mit mir reden. „Ich warte.“ Worauf? Auf den Ruf?');
    return;
  }
  if (f.served) {
    await story.speakAs('k', 'Danke für den Whisky, Junge. Mehr kann ich dir nicht geben als den Deckel.');
    return;
  }
  if (f.overheard) {
    await story.say('Herr K., Sie dürfen nicht zum Tunnel gehen, wenn er ruft!');
    await story.speakAs('k', 'Du hast gelauscht. Hm. Bring mir mein Übliches, dann reden wir.');
    return;
  }
  await story.speakAs('k', pick(['Ich sagte: Lass mich in Ruhe.', 'Hm.', 'Geh spielen, Junge.']));
  if (!f.kSilent) {
    f.kSilent = true;
    await story.say('Mit mir redet er nicht. Vielleicht mit dem Barkeeper?');
  }
}

async function showPhoto(story) {
  if (story.flags.showedPhoto) return story.speakAs('k', 'Steck es weg.');
  story.flags.showedPhoto = true;
  await story.say('Das hier lag in Ihrem Koffer. Sie und der Schaffner.');
  await story.speakAs('k', '… Woher hast du das?');
  await story.speakAs('k', 'Das war eine schöne Feier. Damals. Zwanzig Jahre sind wir zusammen gefahren, er und ich.');
  await story.speakAs('k', 'Ich hab ihm alles beigebracht. Und dann hab ich ihn im Stich gelassen. Leg es weg, Junge. Bitte.');
  story.note('Herr K. wurde ganz still, als ich ihm das Foto gezeigt habe: „Zwanzig Jahre sind wir zusammen gefahren. Ich hab ihm alles beigebracht. Und dann hab ich ihn im Stich gelassen.“');
}

async function serveDrink(story) {
  const f = story.flags;
  story.remove('drink');
  story.sound('glass');
  await story.say('Ihr Übliches, Herr K.');
  await story.speakAs('k', 'Whisky. Rauchig. Wie jede Runde.');
  await story.speakAs('k', 'Du bist hartnäckig, Junge. Das mag ich.');
  await story.speakAs('k', 'Hier – mein Deckel. Hundertacht Runden hab ich darauf gezählt. Mit den Zeichen von der Tür im ersten Wagen.');
  await story.speakAs('k', 'Die Tür da vorne kennt dieselben Zeichen. Du wirst sie brauchen.');
  f.served = true;
  story.give('coaster');
  story.note('Herr K. hat mir für den Whisky seinen Bierdeckel gegeben: Strichlisten neben den vier Zeichen vom Türschloss aus Wagen 1. „Die Tür da vorne kennt dieselben Zeichen.“');
}

// ============================================================================================
//  Barkeeper
// ============================================================================================

async function talkToBarkeeper(story) {
  const f = story.flags;
  for (;;) {
    const topics = [
      { id: 'k', text: 'Was ist mit Herrn K.?', done: f.askedK },
      { id: 'usual', text: 'Was trinkt Herr K.?', done: f.askedUsual, when: Boolean(f.overheard) },
      { id: 'music', text: 'Funktioniert die Musikbox?', done: f.askedMusic },
      { id: 'bye', text: 'Danke.' },
    ].filter((topic) => topic.when !== false);
    const choice = await story.choose(topics);
    const topic = topics[choice]?.id ?? 'bye';
    if (topic === 'bye') return;
    if (topic === 'k') {
      f.askedK = true;
      await story.speakAs('barkeeper', 'Herr K.? Kommt jede Runde. Steht da, wartet, trinkt sein Übliches.');
      await story.speakAs('barkeeper', 'Reden tut er nur, wenn Musik läuft. Und nur mit mir. Wenn ihm einer zuguckt, macht er den Mund nicht auf.');
      story.note('Barkeeper: Herr K. redet nur, wenn Musik läuft – und nur, wenn ihm niemand zusieht.');
    }
    if (topic === 'usual') {
      f.askedUsual = true;
      await story.speakAs('barkeeper', 'Sein Übliches … ach du liebe Zeit. Ich weiß es nicht mehr. Jede Runde vergesse ich es.');
      await story.speakAs('barkeeper', 'Da stehen noch seine drei Gläser von den letzten drei Runden. Und hinten die Flaschen. Bedienen Sie sich – ich hab die Hände voll.');
      story.note('Barkeeper weiß nicht mehr, was Herr K. trinkt. Hinweise: die drei leeren Gläser auf dem Tresen und die Flaschen im Regal.');
    }
    if (topic === 'music') {
      f.askedMusic = true;
      await story.speakAs('barkeeper', 'Die Musikbox? Die spielt nur gegen Münze. Und ich hab keine – im Tresen ist nur Kreide.');
      await story.speakAs('barkeeper', 'Die Gäste lassen manchmal Kleingeld liegen. Überall, nur nicht bei mir.');
    }
  }
}

// ============================================================================================
//  Lauschen
// ============================================================================================

async function playMusic(story) {
  story.remove('coin');
  story.sound('coin');
  await story.wait(0.6);
  story.flags.musicUntil = story.motion.time + MUSIC_LENGTH;
  story.flags.nextTune = 0;
  await story.say('Klick … die Lichter gehen an. Musik!');
  if (!story.flags.musicSaid) {
    story.flags.musicSaid = true;
    story.note('Die Musikbox spielt (die Münze lag im Aschenbecher). Ein Lied dauert etwa eine Dreiviertelminute.');
  }
}

async function eavesdrop(story, hidden) {
  const f = story.flags;
  if (f.overheard) return story.say('Ich habe genug gehört.');
  if (inTunnel(story)) return story.say('Im Dunkeln ist es still.');
  if (!musicOn(story)) {
    await story.say('Ich stelle mich neben den Tisch. Herr K. sagt kein Wort. Der Barkeeper auch nicht.');
    if (f.askedK) await story.say('Ohne Musik redet er nicht.');
    return;
  }
  if (!hidden) {
    await story.say('Ich stelle mich daneben und höre zu …');
    await story.speakAs('k', '…');
    await story.say('Er hat mich bemerkt. Sobald ich hinsehe, schweigt er.');
    if (!f.seenHint) {
      f.seenHint = true;
      story.note('Herr K. schweigt, sobald er merkt, dass ich zuhöre. Ich muss mich verstecken.');
    }
    return;
  }
  f.overheard = true;
  await story.cutscene(async () => {
    await story.say('Ich setze mich und schlage die Zeitung auf. Ich bin gar nicht da …');
    await story.speakAs('barkeeper', 'Das Übliche, Herr K.?');
    await story.speakAs('k', 'Wie jede Runde. Und schreib’s auf meinen Deckel.');
    await story.speakAs('barkeeper', 'Der Junge mit der Fliegerbrille fragt nach Ihnen.');
    await story.speakAs('k', 'Ich weiß. Er will mich retten. Er versteht es noch nicht.');
    await story.speakAs('k', 'Heute ruft er mich. Ich spür’s. Und wenn der Schaffner ruft, dann gehe ich.');
    await story.speakAs('barkeeper', 'Freiwillig?');
    await story.speakAs('k', 'Er war mein Freund. Er bringt uns nach Hause.');
    await story.speakAs('k', 'Einmal hab ich ihn im Stich gelassen. In jener Nacht. Ein zweites Mal nicht.');
    await story.say('Nach Hause? Durch den Tunnel?');
  });
  story.note('Belauscht: Herr K. weiß, dass ihn der Schaffner heute ruft – und er will gehen. „Er war mein Freund. Er bringt uns nach Hause. Einmal hab ich ihn im Stich gelassen. In jener Nacht.“ Sein Übliches lässt er auf seinen Bierdeckel schreiben.');
}

// ============================================================================================
//  Flaschen und Bierdeckel
// ============================================================================================

async function openBottles(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln greife ich womöglich zur falschen Flasche.');
  const f = story.flags;
  await story.view('picture', {
    draw: drawBottles,
    spots: BOTTLE_SPOTS,
    area: { x: 110, y: 90, w: 1060, h: 580 },
    help: 'Klicken: Flasche ansehen und einschenken  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.id === 'emptyGlasses') {
        story.sound('sniff');
        await story.say('Drei leere Gläser von Herrn K. Bernsteinfarbener Rest. Riecht rauchig. Drei Runden, drei Gläser.');
        return;
      }
      const bottle = BOTTLES.find((b) => b.id === spot.id);
      const missing = 10 - bottle.level;
      await story.say(`${bottle.name}. Bis zum ${bottle.level}. Strich voll – ${missing === 1 ? 'ein Glas fehlt' : `${missing} Gläser fehlen`}.`);
      if (!f.askedUsual) return;
      if (story.has('drink') || f.served) return story.say('Herr K. hat sein Glas schon.');
      const choice = await story.choose([`${bottle.name} für Herrn K. einschenken.`, 'Lieber nicht.']);
      if (choice !== 0) return;
      if (bottle.id !== 'whisky') {
        story.sound('wrong');
        await story.speakAs('barkeeper', `${bottle.name}? Hm … ich weiß nicht. Sieht mir nicht nach seinem aus.`);
        f.wrongBottles = (f.wrongBottles ?? 0) + 1;
        return;
      }
      story.sound('glass');
      story.give('drink');
      await story.say('Rauchig, bernsteinfarben, drei Gläser fehlen. Das muss es sein: Whisky.');
      view.close();
    },
  });
}

async function takeCoaster(story) {
  if (story.has('coaster')) return story.say('Den Deckel habe ich.');
  await story.speakAs('barkeeper', 'Finger weg, das ist der Deckel von Herrn K.! Den gibt nur er selbst her.');
}

async function lookCoaster(story) {
  story.sound('paper');
  await story.card({ draw: drawCoaster });
  if (story.flags.coasterRead) return;
  story.flags.coasterRead = true;
  await story.say('Die Zeichen vom Türschloss aus dem ersten Wagen! Tunnel: zwei Striche. Laterne links: sechs. Laterne rechts: neun. Turm: einer.');
  story.note('Herr K.s Bierdeckel: Tunnel 2, Laterne links 6, Laterne rechts 9, Turm 1.');
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  if (story.flags.doorOpen) return ending(story);
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door7',
    digits: 4,
    symbols: DOOR_SYMBOLS,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0 && !inTunnel(story)) {
      story.sound('wrong');
      await story.say(story.flags.coasterRead ? 'Falsch. Die Zeichen auf der Tür stehen in einer anderen Reihenfolge als auf dem Deckel.' : 'Falsch. Vier Zeichen – wie im ersten Wagen. Aber andere Zahlen.');
    }
    return;
  }
  story.flags.doorOpen = true;
  await ending(story);
}

async function ending(story) {
  const f = story.flags;
  f.ending = true;
  const k = story.character('k');
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Turm eins, Laterne rechts neun, Tunnel zwei, Laterne links sechs. Offen!');
    await story.wait(0.6);
    story.sound('speaker');
    await story.speak('… Fahrgast K. … bitte zum Tunnel … Fahrgast K. …', { at: SPEAKER, color: VOICE });
    k.pose = 'front';
    await story.speakAs('k', 'Da ist er. Er ruft mich.');
    await story.say('Nein! Herr K., bleiben Sie hier!');
    await story.speakAs('k', 'Wenn der Schaffner ruft, gehe ich, Junge. Das habe ich ihm versprochen.');
    story.faceToward({ x: 640, y: 300 });
    const walking = k.moveTo(640, 420, 3.2);
    await story.wait(1.2);
    await story.say('Warten Sie! Ich – ich halte ihn fest!');
    story.motion.skipToTunnel(0.6);
    await walking;
    await story.wait(1.4);
    story.sound('footsteps');
    k.alpha = 0;
    f.kGone = true;
    while (story.motion.inTunnel) await story.wait(0.2);
    await story.wait(1.2);
    await story.say('Herr K.?');
    await story.say('… Weg. Nur sein Hut liegt noch auf dem Boden. Dann ist er auch weg.');
    story.sound('dread');
    await story.say('Ich stand direkt neben ihm. Und ich konnte ihn nicht retten.');
    story.note('Der Schaffner rief „Fahrgast K., bitte zum Tunnel“. Herr K. ging freiwillig – im Dunkeln war er fort. Ich konnte ihn nicht retten.');
    await finishWagon(story, {
      number: 7,
      title: 'Ende von Wagen 7',
      lines: ['Herr K. ist verschwunden. Joseph konnte ihn nicht retten.'],
      nextTitle: 'im Bordkino',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.metK) return { id: 'k', lines: ['Da hinten steht Herr K. Ich muss ihn warnen.', 'Zum hinteren Tisch gehen und Herrn K. ansprechen.'] };
  if (!f.overheard) {
    if (!f.askedK) return { id: 'askK', lines: ['Herr K. redet nicht mit mir. Vielleicht weiß der Barkeeper, wie man an ihn herankommt.', 'Den Barkeeper anklicken und nach Herrn K. fragen.'] };
    const music = musicOn(story);
    if (!music && !story.has('coin')) {
      return { id: 'coin', lines: [
        'Herr K. redet nur bei Musik. Die Musikbox will eine Münze.',
        'Die Gäste lassen manchmal Kleingeld liegen. Der Aschenbecher auf dem Tisch vorne links …',
        'Ist die Münze verbraucht? Nach dem nächsten Tunnel liegt sie wieder im Aschenbecher. Am Fenster kann ich warten.',
      ] };
    }
    if (!music) return { id: 'jukebox', lines: ['Ich habe eine Münze. Und hier steht doch eine Musikbox.', 'Die Münze in die Musikbox: Münze im Inventar anklicken, dann die Musikbox.'] };
    if (!story.has('newspaper')) {
      return { id: 'hide', lines: [
        'Die Musik läuft. Aber wenn Herr K. merkt, dass ich zuhöre, schweigt er. Ich muss mich verstecken.',
        'Auf dem Tresen liegt eine Zeitung. Groß genug, um sich dahinter zu verstecken.',
      ] };
    }
    return { id: 'listen', lines: ['Hinter einer Zeitung fällt man nicht auf. Wo könnte ich mithören?', 'Musik läuft, Zeitung habe ich: Zeitung im Inventar anklicken, dann den Tisch, an dem Herr K. steht.'] };
  }
  if (!f.served) {
    if (!f.askedUsual) return { id: 'usual', lines: ['Herr K. will „sein Übliches“. Den Barkeeper fragen, was das ist.', 'Den Barkeeper anklicken und nach dem Üblichen fragen.'] };
    if (!story.has('drink')) {
      return { id: 'bottle', lines: [
        'Die drei leeren Gläser auf dem Tresen: Wie sieht der Rest aus, wie riecht er? Und welche Flasche passt dazu?',
        'Der Rest ist bernsteinfarben und riecht rauchig. Drei Runden, drei Gläser – bei welcher Flasche fehlen genau drei?',
        'Der Whisky: „torfig · rauchig“, und es fehlen genau drei Gläser.',
      ] };
    }
    return { id: 'serve', lines: ['Ich habe Herrn K.s Getränk. Jetzt muss es nur noch zu ihm.', 'Den Whisky Herrn K. geben: Glas im Inventar anklicken, dann Herrn K.'] };
  }
  if (!f.coasterRead) return { id: 'coaster', lines: ['Herr K. hat mir seinen Bierdeckel gegeben. Steht etwas darauf?', 'Herrn K.s Bierdeckel ansehen: Rechtsklick auf den Bierdeckel im Inventar.'] };
  return { id: 'door', lines: [
    'Die Tür hat dieselben vier Zeichen wie der Bierdeckel – aber in anderer Reihenfolge.',
    'Auf der Tür: Turm, Laterne rechts, Tunnel, Laterne links. Auf dem Deckel: Turm 1, Laterne rechts 9, Tunnel 2, Laterne links 6.',
  ] };
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
