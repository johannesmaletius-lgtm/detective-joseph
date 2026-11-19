import { FACH_LABELS, SPEAKER_VOICE, WRITER } from '../scene/postCar.js';
import { prepareOtherJoseph } from '../scene/figures.js';
import { LORE_LETTERS, drawLetter, drawTicketCard, roundLetter } from '../ui/cards3.js';
import { VOICES, WINDOW_ITEMS, finishWagon, hintFor, inTunnel, lookOutside, packFor, tunnels, waitForTunnel } from './common.js';

// ============================================================================================
//  WAGEN 5 – Der Postwagen (Beginn von Teil 2)
// ============================================================================================
//
// Fächer voller Briefe – alle in Josephs Schrift, sortiert nach Runden. Der andere Joseph ist hierher
// geflohen. Durch den Lautsprecher spricht Herr Brandt, der Schaffner.
//
// DAS ZIEL: Die Tür zum Schaffnerabteil hat keinen Griff. Brandt öffnet sie von innen – aber nur für eine
// Fahrkarte, die für DIESE Runde gestempelt ist.
//
// DIE RÄTSEL:
//   1. Am Fahrkartenschalter mit Brandt reden: „Fahrkarte, bitte. Gestempelt für diese Runde.“
//   2. Rundenzähler über der Tür ablesen (z. B. 41) – im Fach „41“ der Fächerwand liegt ein Brief mit Fahrkarte.
//      Der Brief sagt: Die Stempelmaschine ist eingetrocknet, Tinte hat nur sein Füller – im Dunkeln am Sortiertisch.
//   3. Auf den Tunnel warten (Postsäcke). Im Dunkeln sitzt der andere Joseph bei Kerzenlicht am Sortiertisch.
//      Ansprechen → er gibt Joseph den Füller.
//   4. Füller an die Stempelmaschine → Tinte im Stempelkissen
//   5. Stempelmaschine: Rädchen auf die Runde vom Zähler stellen, Fahrkarte stempeln
//   6. Fahrkarte am Schalter abgeben – noch in derselben Runde! Dann öffnet Brandt die Tür.
// Nach jedem Tunnel: Der Zähler zählt eins weiter, das Stempelkissen ist wieder trocken, im neuen Fach liegt
// wieder ein Brief mit Fahrkarte. Eine schon gestempelte Fahrkarte gilt dann nicht mehr (neu stempeln geht).
// Nebenbei: In den Fächern 1, 7, 13 und 27 liegen alte Briefe – darin steht, was in Runde 7 schiefging,
// und die ANLEITUNG, wie man den Kreis verlässt.

const FIRST_ROUND = 41;
const LORE = [1, 7, 13, 27];
const TABLE_LETTERS = [
  '„Runde 33: Der Koch hat wieder getanzt. Brandt lebt. Morgen wieder.“',
  '„Runde 35: Kasimir kann jetzt ‚Prost!‘ sagen. Ich habe es ihm beigebracht. Entschuldigung.“',
  '„Runde 38: Das Rollo war oben, aber der Mond kam zu spät. Ich bin eingeschlafen.“',
  '„Runde 39: Ich bin so müde. Er ist noch müder.“',
];

export const wagon5 = {
  flags: {},

  prepare(story) {
    story.note('Hinter mir: das Abteil, der Speisewagen, der Schlafwagen, der Gepäckwagen. Im Gepäckwagen stieg ein zweiter Joseph aus dem Schrankkoffer – ich, nach hundert Runden ohne Schlaf. Er ist in den Postwagen gegangen.');
  },

  setup(story) {
    const f = story.flags;
    f.startedAt = performance.now();
    f.packed = packFor(story, ['flashlight', 'vierkant', 'photo']);
    prepareOtherJoseph(story.player);
    refresh(story);
  },

  async intro(story) {
    await arrive(story);
  },

  async skipIntro(story) {
    story.game.overlay.fade = 0;
    await arrive(story, { quick: true });
  },

  itemName(story, id) {
    if (id === 'ticketStamped') return `Fahrkarte (Stempel: Runde ${story.flags.stampRound})`;
    return undefined;
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    door: {
      look: async (story) => {
        await story.say('Die Tür zum Schaffnerabteil. Kein Griff, kein Schlüsselloch.');
        await story.say('Darauf: „Zutritt nur mit gültiger Fahrkarte.“');
      },
      use: (story) => (story.flags.doorOpen ? leave(story) : story.say('Die Tür hat keinen Griff. Die geht nur von innen auf.')),
      items: {
        vierkant: 'Kein Vierkantloch. Die Tür hat überhaupt kein Schloss – sie wird von innen geöffnet.',
        ticketStamped: 'Die Fahrkarte gebe ich am Schalter ab, nicht an der Tür.',
        other: 'An dieser Tür gibt es nichts, wo das hineinpasst.',
      },
    },

    hatch: {
      look: 'Der Fahrkartenschalter. Eine Holzklappe mit einem Schlitz für die Fahrkarte.',
      use: (story) => talkToConductor(story),
      items: {
        ticket: (story) => conductor(story, 'Die ist ja gar nicht gestempelt! Ungültig. Erst stempeln, dann vorzeigen.'),
        ticketStamped: (story) => deliverTicket(story),
        photo: (story) => conductor(story, 'Ein Foto? Sehr hübsch. Ich brauche aber eine Fahrkarte.'),
        other: (story) => conductor(story, 'Was soll ich damit? Fahrkarte, bitte!'),
      },
    },

    speaker: {
      look: 'Ein Lautsprecher. Aus dem kam Herrn Brandts Stimme.',
      use: async (story) => {
        await story.say('Herr Brandt? Hören Sie mich?');
        await conductor(story, 'Am Schalter, Herr Joseph. Am Schalter.');
      },
    },

    counter: {
      look: async (story) => {
        const f = story.flags;
        await story.say(`Ein Rundenzähler. Er zeigt: Runde ${round(story)}.`);
        if (!f.counterSeen) {
          f.counterSeen = true;
          story.note(`Über der Tür hängt ein Rundenzähler. Er zeigt Runde ${round(story)}.`);
        }
      },
    },

    poster: { look: '„Bahnpost – jede Runde pünktlich im Tunnel.“ Im Tunnel kommt also die Post.' },

    shelf: {
      look: (story) => story.say('Die Fächerwand. Zwölf Fächer, beschriftet mit Rundennummern: 1, 7, 13, 27 – und 40 bis 47.'),
      use: (story) => openShelf(story),
      items: {
        ticket: 'Die behalte ich lieber.',
        other: 'Das sortiere ich nicht ein.',
      },
    },

    table: {
      look: async (story) => {
        if (story.flags.writerHere) return story.say('Er sitzt am Sortiertisch und schreibt. Bei Kerzenlicht.');
        await story.say('Der Sortiertisch. Ein Berg Briefe – alle in meiner Schrift. Daneben ein leeres Tintenfass.');
      },
      use: (story) => readTableLetter(story),
      items: {
        pen: 'Ich schreibe ihm nicht. Er weiß ohnehin alles, was ich weiß.',
        other: 'Das lege ich nicht auf den Stapel.',
      },
    },

    writer: {
      look: 'Der andere Joseph. Er schreibt bei Kerzenlicht – und tut so, als sähe er mich nicht.',
      use: (story) => talkToWriter(story),
      items: {
        flashlight: (story) => talkToWriter(story),
        photo: (story) => talkToWriter(story, { photo: true }),
        other: (story) => talkToWriter(story),
      },
    },

    stamp: {
      look: async (story) => {
        await story.say('Eine Stempelmaschine. Auf dem Kopf zwei Rädchen: RUNDE und zwei Ziffern. Und ein roter Hebel.');
        await story.say(story.flags.inked ? 'Das Stempelkissen ist frisch getränkt. Blau.' : 'Das Stempelkissen daneben ist knochentrocken.');
      },
      use: (story) => useStamp(story),
      items: {
        pen: (story) => inkPad(story),
        ticket: (story) => useStamp(story),
        ticketStamped: (story) => useStamp(story),
        other: 'Das stemple ich nicht.',
      },
    },

    sacks: {
      look: 'Postsäcke. Weich genug, um sich draufzusetzen.',
      use: (story) => waitForTunnel(story, { sit: 'Ich setz mich auf die Postsäcke und warte auf den Tunnel. Aber nicht einschlafen …' }),
    },

    window: {
      look: (story) => lookOutside(story),
      use: 'Die Fenster lassen sich nicht öffnen.',
      items: WINDOW_ITEMS,
    },
  },

  items: {
    ticket: { look: (story) => showTicket(story, null) },
    ticketStamped: { look: (story) => showTicket(story, story.flags.stampRound) },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  // ---------------------------------------------------------------- Tunnel
  async onTunnel(story, inside) {
    const f = story.flags;
    if (f.doorOpen) return;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      f.ticketTaken = false;
      f.writerHere = true;
      refresh(story);
      story.sound('latch');
      story.game.closeViewsInDark();
      await story.idle();
      if (!inTunnel(story)) return;
      if (!f.writerSeen) {
        f.writerSeen = true;
        await story.say('Da – am Sortiertisch brennt eine Kerze. Und jemand sitzt davor.');
        story.note('Im Tunnel sitzt der andere Joseph bei Kerzenlicht am Sortiertisch und schreibt.');
      }
      return;
    }
    // Licht wieder an: Er ist weg, das Stempelkissen ist trocken, der Zähler zeigt die neue Runde
    if (!f.writerTalking) f.writerHere = false;
    const wasInked = f.inked;
    f.inked = false;
    f.hatchOpen = false;
    refresh(story);
    await story.idle();
    if (f.doorOpen) return;
    await story.cutscene(async () => {
      await story.wait(0.4);
      if (!f.counterTicked) {
        f.counterTicked = true;
        await story.say(`Der Rundenzähler hat weitergezählt: Runde ${round(story)}.`);
        story.note('Im Tunnel zählt der Rundenzähler eins weiter. Dann ist auch das Stempelkissen wieder trocken, und im Fach der neuen Runde liegt wieder ein Brief.');
      }
      if (wasInked && !f.dryNoted) {
        f.dryNoted = true;
        await story.say('Und das Stempelkissen ist wieder trocken. Natürlich.');
      }
      if (story.has('ticketStamped') && !ticketValid(story) && !f.expiredNoted) {
        f.expiredNoted = true;
        await story.say(`Meine Fahrkarte ist für Runde ${f.stampRound} gestempelt. Jetzt ist Runde ${round(story)}. Abgelaufen.`);
      }
    });
  },
};

// ============================================================================================
//  Hilfen
// ============================================================================================

// Die Runde, die der Zähler zeigt – zählt im Tunnel eins weiter (41 … 47, dann wieder von vorn)
function round(story) {
  return FIRST_ROUND + (tunnels(story) % 7);
}

// Was die Szene wissen muss: Zählerstand und welche Fächer Post haben
function refresh(story) {
  const f = story.flags;
  f.counter = round(story);
  f.filled = f.ticketTaken ? [...LORE] : [...LORE, round(story)];
}

function ticketValid(story) {
  const f = story.flags;
  return story.has('ticketStamped') && f.stampRound === String(round(story)) && f.stampTunnel === tunnels(story);
}

function conductor(story, text) {
  story.sound('speaker');
  return story.speak(text, { at: SPEAKER_VOICE });
}

function stranger(story, text) {
  return story.speak(text, { at: { x: WRITER.x, y: WRITER.y - 360 }, color: VOICES.stranger });
}

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('slide');
      story.fadeIn(1.6);
      await story.wait(1.4);
      await story.say('Der Postwagen. Fächer voller Briefe … und von ihm keine Spur.');
      await story.wait(0.5);
      await conductor(story, 'Achtung, Achtung! Hier spricht der Schaffner. Fahrgäste ohne gültige Fahrkarte melden sich bitte am Schalter.');
      await story.say('Das ist Herrn Brandts Stimme!');
    });
  }
  story.note('Postwagen: Hinten ist die Tür zum Schaffnerabteil, daneben ein Fahrkartenschalter. Aus dem Lautsprecher spricht Herr Brandt, der Schaffner.');
}

// ============================================================================================
//  Der Schalter: Herr Brandt
// ============================================================================================

async function talkToConductor(story) {
  const f = story.flags;
  story.sound('knock');
  await story.wait(0.6);
  if (!f.hatchTalked) {
    f.hatchTalked = true;
    story.sound('latch');
    f.hatchOpen = true;
    await conductor(story, 'Schalter ist besetzt. Was kann ich für Sie tun, Herr Joseph?');
  }
  f.hatchOpen = true;
  const asked = (f.asked ??= {});
  const options = [
    'Ich möchte ins Schaffnerabteil.',
    'Herr Brandt? Sind Sie das wirklich?',
    'Haben Sie einen zweiten Joseph gesehen?',
    'Woher kommt die ganze Post?',
    'Bis gleich.',
  ];
  for (;;) {
    const index = await story.choose(options.map((text, i) => ({ text, used: asked[i] })), 'Fahrkartenschalter');
    if (index < 0 || index === 4) break;
    asked[index] = true;
    await story.say(options[index]);
    if (index === 0) {
      await conductor(story, 'Fahrkarte, bitte. Durch den Schlitz. Gestempelt für DIESE Runde – sonst ist sie nichts wert.');
      if (!f.ruleNoted) {
        f.ruleNoted = true;
        story.note('Brandt öffnet die Tür zum Schaffnerabteil nur für eine Fahrkarte, die für diese Runde gestempelt ist. Abgeben am Schalter.');
      }
    } else if (index === 1) {
      await conductor(story, 'Brandt, Schaffner der Ringbahn. Ich weiß, wer Sie sind. Sie haben mir das Leben gerettet – jede Runde wieder.');
      await conductor(story, 'Trotzdem: Vorschrift ist Vorschrift.');
    } else if (index === 2) {
      await conductor(story, 'Der fährt schwarz. Seit Runde 7. Wenn es dunkel wird, sitzt er am Sortiertisch und schreibt. Immer Briefe.');
      if (!f.writerHinted) {
        f.writerHinted = true;
        story.note('Brandt: Der andere Joseph sitzt im Dunkeln (im Tunnel) am Sortiertisch und schreibt Briefe.');
      }
    } else {
      await conductor(story, 'Aus allen Runden. Die Bahnpost bringt sie im Tunnel – auch Briefe, die noch gar nicht geschrieben sind. Fragen Sie mich nicht, wie.');
    }
  }
  f.hatchOpen = false;
  story.sound('latch');
}

async function deliverTicket(story) {
  const f = story.flags;
  const now = String(round(story));
  story.sound('paper');
  await story.say('Hier, meine Fahrkarte.');
  f.hatchOpen = true;
  await story.wait(0.5);
  await conductor(story, `Mal sehen … gestempelt für Runde ${f.stampRound}.`);
  if (!ticketValid(story)) {
    f.hatchOpen = false;
    if (f.stampTunnel === tunnels(story)) await conductor(story, `Wir haben aber Runde ${now}! Falsch gestempelt. Ungültig.`);
    else await conductor(story, `Die ist abgelaufen – wir haben längst Runde ${now}. Ungültig.`);
    story.sound('latch');
    if (!f.wrongNoted) {
      f.wrongNoted = true;
      story.note('Brandt nimmt nur eine Fahrkarte mit dem Stempel der Runde, die gerade läuft (Rundenzähler über der Tür).');
    }
    return;
  }
  story.remove('ticketStamped');
  await conductor(story, `Runde ${now}. Gültig! Willkommen im Schaffnerabteil, Herr Joseph.`);
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.wait(0.6);
    story.sound('door');
    f.doorOpen = true;
    f.hatchOpen = false;
    await story.say('Die Tür springt auf.');
    story.note('Brandt hat die Fahrkarte genommen und die Tür zum Schaffnerabteil geöffnet.');
  });
  await leave(story);
}

async function leave(story) {
  await story.cutscene(async () => {
    await story.walkTo(640, 418, 'back');
    await story.fadeOut(1);
  });
  await finishWagon(story, { number: 5, next: 6, nextName: 'Schaffnerabteil' });
}

// ============================================================================================
//  Fächer, Briefe, Fahrkarte
// ============================================================================================

async function openShelf(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Nummern an den Fächern nicht lesen.');
  const label = await story.view('pigeonholes', { labels: FACH_LABELS, filled: f.filled, current: round(story) });
  if (label === null) return;
  if (LORE.includes(label)) return readLore(story, label);
  if (label === round(story)) return takeRoundLetter(story);
  if (label < round(story)) return story.say(`Leer. Die Post für Runde ${label} hat schon jemand abgeholt. Vermutlich ich.`);
  return story.say(`Leer. Die Post für Runde ${label} ist noch nicht da.`);
}

async function readLore(story, label) {
  const f = story.flags;
  story.sound('paper');
  await story.card({ draw: (ctx) => drawLetter(ctx, LORE_LETTERS[label]) });
  const read = (f.loreRead ??= {});
  if (read[label]) return;
  read[label] = true;
  if (label === 1) {
    await story.say('Zwei Detektive. Wir zwei – wie auf dem Foto.');
    story.note('Fach 1: In Runde 1 sind wir zu zweit eingestiegen. „Ein Kreis hat keinen Ausgang“, sagte der Schaffner.');
  } else if (label === 7) {
    story.sound('dread');
    await story.say('Er hat den Hebel gehalten … und ist allein im Dunkeln geblieben. Deshalb schläft er nicht mehr.');
    story.note('Fach 7: In Runde 7 haben wir es an der Weiche im Tunnel versucht. Er hielt den Hebel, der Hebel sprang zurück – und er blieb allein im Tunnel. Seitdem setzt ihn der Tunnel nicht mehr zurück.');
  } else if (label === 13) {
    await story.say('Er erinnert sich für uns beide. Was für ein Freund.');
    story.note('Fach 13: Er schreibt mir jede Runde. Er sagt, ich soll vergessen dürfen.');
  } else {
    await story.say('Eine Anleitung! Weiche 7, im Tunnel. Notbremse. Und: Allein geht es nicht.');
    story.note('Fach 27 – ANLEITUNG: Den Kreis verlässt man nur im Tunnel an Weiche 7. Notbremse ziehen, dann die Weiche umstellen. Sie springt zurück, sobald man loslässt. Allein geht es nicht.');
  }
}

async function takeRoundLetter(story) {
  const f = story.flags;
  if (f.ticketTaken) return story.say('Leer. Den Brief dieser Runde habe ich schon.');
  f.ticketTaken = true;
  refresh(story);
  story.sound('paper');
  await story.card({ draw: (ctx) => drawLetter(ctx, roundLetter(round(story))) });
  const replaced = story.has('ticket') || story.has('ticketStamped');
  story.remove('ticket');
  story.remove('ticketStamped');
  story.give('ticket');
  if (replaced) await story.say('Eine neue Fahrkarte. Die alte werfe ich weg.');
  if (!f.letterRead) {
    f.letterRead = true;
    await story.say('Eine Fahrkarte – noch ohne Stempel. Und Tinte gibt es nur in seinem Füller.');
    story.note(`Im Fach „${round(story)}“ (die Runde vom Zähler) lag ein Brief mit einer Fahrkarte. Die Stempelmaschine ist eingetrocknet – Tinte hat nur sein Füller. „Im Dunkeln sitze ich am Sortiertisch.“`);
  }
}

async function showTicket(story, printed) {
  story.sound('paper');
  await story.card({ draw: (ctx) => drawTicketCard(ctx, printed) });
  if (printed && printed !== String(round(story))) await story.say(`Gestempelt für Runde ${printed}. Der Zähler zeigt ${round(story)}.`);
}

async function readTableLetter(story) {
  const f = story.flags;
  if (f.writerHere) return talkToWriter(story);
  const index = (f.tableLetter = ((f.tableLetter ?? -1) + 1) % TABLE_LETTERS.length);
  story.sound('paper');
  await story.say('Ich ziehe einen Brief aus dem Stapel …');
  await story.say(TABLE_LETTERS[index]);
}

// ============================================================================================
//  Stempelmaschine
// ============================================================================================

async function inkPad(story) {
  const f = story.flags;
  if (f.inked) return story.say('Das Stempelkissen ist schon blau.');
  if (inTunnel(story)) return story.say('Im Dunkeln kleckere ich nur.');
  story.sound('screw');
  await story.wait(0.4);
  f.inked = true;
  await story.say('Ich schraube den Füller auf und träufle die Tinte ins Stempelkissen …');
  await story.say('Blau. Das sollte reichen.');
  if (!f.inkNoted) {
    f.inkNoted = true;
    story.note('Mit der Tinte aus seinem Füller ist das Stempelkissen wieder blau – bis zum nächsten Tunnel.');
  }
}

async function useStamp(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln stemple ich nur daneben.');
  if (!f.inked) {
    await story.say('Das Stempelkissen ist eingetrocknet. Ohne Tinte druckt der Stempel nichts.');
    if (f.letterRead && !story.has('pen')) await story.say('Tinte hat nur noch sein Füller.');
    return;
  }
  const hadTicket = story.has('ticket') || story.has('ticketStamped');
  const code = await story.view('stamp', { paper: hadTicket ? 'ticket' : 'blank' });
  if (!code) return;
  if (!hadTicket) return story.say(`Ein blauer Abdruck auf der Unterlage: RUNDE ${code}. Funktioniert. Jetzt fehlt nur noch eine Fahrkarte.`);
  const restamped = story.has('ticketStamped');
  story.remove('ticket');
  story.remove('ticketStamped');
  f.stampRound = code;
  f.stampTunnel = tunnels(story);
  story.give('ticketStamped');
  f.expiredNoted = false;
  await story.say(restamped ? `Neuer Stempel drüber: Runde ${code}.` : `Gestempelt: Runde ${code}.`);
  if (f.counterSeen && code !== String(round(story))) await story.say(`Moment … der Zähler zeigt aber ${round(story)}.`);
}

// ============================================================================================
//  Der andere Joseph am Sortiertisch
// ============================================================================================

async function talkToWriter(story, { photo = false } = {}) {
  const f = story.flags;
  if (!f.writerHere) return;
  f.writerTalking = true;
  try {
    story.sound('scribble');
    if (f.metWriter) {
      await stranger(story, story.has('pen') ? 'Du hast den Füller. Geh zum Schalter, Joseph. Brandt wartet nicht ewig.' : 'Schon wieder du.');
      if (!story.has('pen')) await givePen(story);
    } else {
      f.metWriter = true;
      await stranger(story, 'Du bist schnell. Schneller als die letzten Male.');
      await story.say('Du schreibst die Briefe.');
      await stranger(story, 'Jede Runde einen. Im Dunkeln, damit du mich nicht siehst. Du siehst mich trotzdem.');
      if (photo) {
        await story.say('Schau. Runde 1. Wir zwei.');
        await stranger(story, 'Das Foto … Steck es weg. Nicht hier.');
      }
      const asked = {};
      const options = ['Warum hast du Brandt vergiftet?', 'Komm mit mir.', 'Gib mir deinen Füller.'];
      for (;;) {
        const index = await story.choose(options.map((text, i) => ({ text, used: asked[i] })), 'Der andere Joseph');
        if (index < 0 || index === 2) break;
        asked[index] = true;
        await story.say(options[index]);
        if (index === 0) {
          await stranger(story, 'Damit du seinen Vierkant bekommst. Ohne Vierkant kein Dienstschrank, kein Brecheisen, kein Koffer Nr. 7.');
          await stranger(story, 'Ich habe dich bis hierher geführt. Wie einen Zug auf Schienen.');
        } else {
          await stranger(story, 'Mitkommen? Wohin denn? Es gibt kein Wohin. Nur Runden.');
        }
      }
      await givePen(story);
    }
    await stranger(story, 'Ich warte im Tunnel. Wie immer.');
    story.sound('lightsOff');
    f.writerHere = false;
    await story.say('Er hat die Kerze ausgeblasen. Weg ist er.');
  } finally {
    f.writerTalking = false;
  }
}

async function givePen(story) {
  const f = story.flags;
  await story.say('Ich brauche deinen Füller. Für die Stempelmaschine.');
  await stranger(story, 'Nimm ihn. Ich habe genug geschrieben.');
  story.give('pen');
  if (!f.penNoted) {
    f.penNoted = true;
    story.note('Der andere Joseph hat mir seinen Füller gegeben. Damit bekomme ich Tinte ins Stempelkissen.');
  }
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  const now = round(story);
  if (!f.hatchTalked) {
    return { id: 'hatch', lines: [
      'Hinten neben der Tür ist ein Fahrkartenschalter. Da frage ich mal nach.',
      'Linksklick auf den Fahrkartenschalter.',
    ] };
  }
  if (ticketValid(story)) {
    return { id: 'deliver', lines: [
      'Die gestempelte Fahrkarte muss an den Schalter – bevor der nächste Tunnel kommt.',
      'Fahrkarte im Inventar anklicken, dann den Fahrkartenschalter.',
    ] };
  }
  if (!story.has('ticket') && !story.has('ticketStamped')) {
    return { id: 'ticket', lines: [
      'Eine Fahrkarte … Vielleicht liegt in den Fächern Post für mich.',
      'Die Fächer sind nach Runden beschriftet. Welche Runde gerade ist, zeigt der Zähler über der Tür.',
      `Im Fach „${now}“ der Fächerwand liegt diese Runde ein Brief für mich.`,
    ] };
  }
  if (!story.has('pen')) {
    return { id: 'pen', lines: [
      'Die Stempelmaschine ist eingetrocknet. Tinte hat nur sein Füller.',
      'Er sitzt im Dunkeln am Sortiertisch. Ich muss auf den Tunnel warten – auf den Postsäcken kann ich sitzen.',
      'Im Tunnel den anderen Joseph am Sortiertisch ansprechen (die Kerze zeigt, wo er ist).',
    ] };
  }
  if (!f.inked) {
    return { id: 'ink', lines: [
      'Das Stempelkissen ist trocken. Der Füller hat Tinte.',
      'Füller im Inventar anklicken, dann die Stempelmaschine.',
    ] };
  }
  if (story.has('ticketStamped')) {
    return { id: 'restamp', lines: [
      'Die Fahrkarte gilt nicht für diese Runde. Ich muss sie neu stempeln – mit der Zahl vom Rundenzähler.',
      `Der Rundenzähler zeigt ${now}. Stempelmaschine auf ${now} stellen und noch einmal stempeln.`,
    ] };
  }
  return { id: 'stamp', lines: [
    'Jetzt die Fahrkarte stempeln: die Stempelmaschine benutzen.',
    `Die Rädchen auf die Runde vom Zähler stellen – ${now} – und den roten Hebel drücken.`,
  ] };
}
