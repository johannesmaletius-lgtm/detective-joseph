import { CANDLE_SPOT, OCCUPIED, PADDLE_SPOT, drawFinal, drawPanel, drawSnow, drawWindowRun, panelSpots, stoneAt } from './art/wagon24.js';
import { finishWagon, hintFor, skipIntro, tunnels, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 24 – Heiligabend (Finale): Schaffnerabteil, zu zweit mit dem anderen Joseph in der Lok
// ============================================================================================
//
// DIE RÄTSEL
//   1. Mütze aufsetzen (die Mütze des Schaffners an der Garderobe).
//   2. Letzte Durchsage: an der Lautsprecheranlage nur die Wagen einschalten, in denen noch jemand
//      sitzt – Bruno (4), Ilse (5), Barkeeper (7), Moll (12), Mira (15), Heizer (21) – und dann selbst
//      den Ruf sprechen. Alle gehen ruhig hinaus, Mira als Letzte: „Kommst du nach, Papa?“
//   3. Die Plombe am roten Hebel mit der Lochzange vom Schreibtisch öffnen.
//   4. Am Fenster die Kilometersteine zählen und genau bei 24,7 Miras Kelle heben. Vorne zieht der
//      andere Joseph, hinten Joseph – Weiche 7 springt halb um, der Zug entgleist.
//   5. Schluss: warme Stube, Joseph ist der Schaffner, Mira: „Papa, du bist ja wach! Frohe Weihnachten!“
//      Er zündet die letzte Kerze am Baum an. Die Wanduhr zeigt 23:47.

const VOICE = '#a6f0b6';
const SPEAKER = { x: 420, y: 120 };

export const wagon24 = {
  flags: {},
  startItems: ['flashlight', 'paddle'],
  recap: [
    'Der Tunnel ist kein Ende, er ist der Ausgang. Herr Tick ging hinaus in den Schnee und sagte: „Danke, Junge.“',
    'Ich habe niemanden gerettet. Ich habe sie festgehalten. Die anderen sitzen noch im Zug.',
    'Der andere Joseph ist der Schaffner – ich, nur älter. Weiche 7 lässt sich nur zu zweit stellen: in der Lok und hier am roten Hebel.',
    'Miras Kelle: „Damit du uns nach Hause bringst.“',
    'Der Tunnel: vierundzwanzig Ticks. Bei fünfundzwanzig wird es nicht mehr hell. Es ist so weit.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 24,
      title: 'Heiligabend',
      lines: [
        'Zurück im Schaffnerabteil. Heiligabend.',
        'Vierundzwanzig Ticks im Tunnel. Viel Zeit bleibt nicht mehr.',
        'Diesmal weiß ich, was zu tun ist.',
      ],
      firstTunnelIn: 140,
    });
    await story.cutscene(async () => {
      story.sound('speaker');
      await story.speak('Bist du so weit, Junge? Ich stehe in der Lok. Der Schlüssel steckt.', { at: SPEAKER, color: VOICE });
      await story.say('Ja. Ich bin so weit.');
    });
  },

  skipIntro: (story) => skipIntro(story, 140),

  hotspots: {
    coat: {
      look: (story) => story.say(story.flags.capOn ? 'Der Mantel des Schaffners. Die Mütze habe ich auf.' : 'Der Mantel des Schaffners. Und seine Mütze.'),
      use: (story) => putOnCap(story),
    },
    speaker: {
      look: 'Die Lautsprecheranlage. Von hier ruft man die Fahrgäste.',
      use: (story) => announce(story),
    },
    book: { look: 'Das Dienstbuch. Am 24. Dezember: getauscht.' },
    keyboard: { look: 'Das Schlüsselbrett. Der Haken „Lok“ ist leer – der Schlüssel steckt vorne.' },
    plan: { look: 'Der Gleisplan. Weiche 7 – der Weg aus dem Ring.' },
    punch: {
      look: 'Die Lochzange vom Schreibtisch.',
      use: async (story) => {
        if (story.has('punch') || story.flags.sealCut) return story.say('Die habe ich schon benutzt.');
        story.give('punch');
        await story.say('Die Lochzange. Damit bekomme ich die Plombe auf.');
      },
    },
    redLever: {
      look: (story) => story.say(story.flags.sealCut ? 'Der rote Hebel für Weiche 7. Die Plombe ist ab.' : 'Der rote Hebel für Weiche 7. Verplombt.'),
      use: (story) => (story.flags.sealCut ? watchStones(story) : story.say('Die Plombe hält ihn fest. Ich brauche etwas, um den Draht durchzuknipsen.')),
      items: { punch: (story) => cutSeal(story), paddle: (story) => watchStones(story) },
    },
    window: {
      look: 'Draußen der Tunnel. Und Kilometersteine, einer nach dem anderen.',
      use: (story) => watchStones(story),
      items: { paddle: (story) => watchStones(story) },
    },
    door: { look: 'Die Tür nach hinten. Dort sitzen die anderen.', use: 'Ich bleibe hier. Hier werde ich gebraucht.' },
    mira: { look: 'Mira.', use: (story) => story.speakAs('mira', 'Kommst du nach, Papa?') },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  onTunnel(story, inside) {
    if (inside) story.flags.tunnels = tunnels(story) + 1;
  },
};

// ============================================================================================
//  1. Mütze
// ============================================================================================

async function putOnCap(story) {
  const f = story.flags;
  if (f.capOn) return story.say('Die Mütze sitzt.');
  f.capOn = true;
  story.sound('pickup');
  await story.say('Ich setze die Mütze des Schaffners auf. Sie passt. Natürlich passt sie.');
  story.note('Ich trage die Mütze des Schaffners.');
}

// ============================================================================================
//  2. Die letzte Durchsage
// ============================================================================================

async function announce(story) {
  const f = story.flags;
  if (f.announced) return story.say('Sie sind alle gegangen. Der Zug ist leer.');
  if (!f.capOn) return story.say('Erst die Mütze. Wenn ich sie rufe, dann als Schaffner.');
  f.on ??= [];
  const state = { on: f.on };
  const result = await story.view('picture', {
    state,
    draw: (ctx, view) => drawPanel(ctx, view.state),
    spots: panelSpots(),
    area: { x: 150, y: 70, w: 980, h: 600 },
    help: 'Klicken: Wagen ein- oder ausschalten, dann Durchsage sprechen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (spot.id === 'speak') {
        const missing = OCCUPIED.filter((n) => !s.on.includes(n));
        const wrong = s.on.filter((n) => !OCCUPIED.includes(n));
        if (!s.on.length) return story.say('Erst die Wagen einschalten, in denen noch jemand sitzt.');
        if (wrong.length) {
          story.sound('wrong');
          return story.say(`In Wagen ${wrong[0]} sitzt doch niemand mehr. Wen soll ich da rufen?`);
        }
        if (missing.length) {
          story.sound('wrong');
          return story.say(`Es fehlt noch jemand. ${missing.length === 1 ? 'Ein Wagen' : `${missing.length} Wagen`} – ich darf niemanden zurücklassen.`);
        }
        view.close(true);
        return;
      }
      const n = Number(spot.id.slice(1));
      s.on = s.on.includes(n) ? s.on.filter((m) => m !== n) : [...s.on, n];
      f.on = s.on;
      story.sound('click');
    },
  });
  if (result !== true) return;
  f.announced = true;
  await theCall(story);
}

// Mira: in der Tür (hinten) und neben Joseph
const MIRA_DOOR = [648, 410];
const MIRA_SPOT = [790, 520];

async function theCall(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    story.sound('speaker');
    await story.say('Ich drücke den Knopf und spreche:');
    await story.speak('„Liebe Fahrgäste. Hier spricht der Schaffner.“', { at: SPEAKER, color: VOICE });
    await story.speak('„Bruno. Ilse. Herr Moll. Mira. Und alle anderen. Bitte zum Tunnel.“', { at: SPEAKER, color: VOICE });
    await story.speak('„Es ist Zeit, nach Hause zu gehen.“', { at: SPEAKER, color: VOICE });
    story.sound('footsteps');
    await story.wait(0.8);
    await story.say('Schritte im ganzen Zug. Ruhige Schritte. Einer nach dem anderen gehen sie nach hinten, zum Tunnel.');
    await story.say('Bruno mit seiner Schürze. Der Barkeeper. Herr Moll. Der Heizer, der mir zuzwinkert.');
    await story.say('Oma Ilse mit ihrem Strickzeug. Im Vorbeigehen zupft sie mir den Schal zurecht: „Steht dir immer noch, Junge.“');
    // Mira kommt durch die Tür herein und läuft zu Joseph
    const mira = story.character('mira');
    await story.walkTo(600, 610, 'right');
    mira.moveTo(...MIRA_DOOR, 0);
    mira.alpha = 0;
    f.miraHere = true;
    story.sound('door');
    mira.fade(1, 0.5);
    await mira.moveTo(...MIRA_SPOT, 2.4);
    mira.pose = 'front';
    story.faceToward(mira);
    await story.speakAs('mira', 'Papa?');
    await story.speakAs('mira', 'Kommst du nach, Papa?');
    await story.say('Papa. Zum ersten Mal klingt das Wort nicht falsch.');
    await story.say('… Ja, Mira. Ich komme nach. Versprochen.');
    await story.speakAs('mira', 'Dann geh ich schon mal vor. Mama wartet.');
    // … und läuft zurück zur Tür, hinaus zum Tunnel
    const going = mira.moveTo(...MIRA_DOOR, 2.6);
    await story.wait(1.9);
    await mira.fade(0, 0.6);
    await going;
    f.miraHere = false;
    mira.alpha = 1;
    mira.pose = 'front';
  });
  story.note('Die letzte Durchsage: Alle Fahrgäste sind ruhig zum Tunnel gegangen. Mira als Letzte: „Kommst du nach, Papa?“ – „Ja. Versprochen.“');
}

// ============================================================================================
//  3. Plombe, 4. Kilometerstein und Kelle
// ============================================================================================

async function cutSeal(story) {
  const f = story.flags;
  if (!f.announced) return story.say('Erst müssen alle aus dem Zug. Vorher stelle ich keine Weiche.');
  f.sealCut = true;
  story.remove('punch');
  story.sound('snap');
  await story.say('Knips. Der Draht ist durch, das Bleisiegel fällt zu Boden.');
  story.sound('speaker');
  await story.speak('Ich bin bereit. Wenn du die Kelle hebst, ziehe ich. Bei 24,7 – nicht früher, nicht später.', { at: SPEAKER, color: VOICE });
  story.note('Plombe ab. Der andere Joseph zieht in der Lok, sobald ich die Kelle hebe – genau bei Kilometer 24,7.');
}

async function watchStones(story) {
  const f = story.flags;
  if (!f.announced) return story.say('Erst müssen alle Fahrgäste aus dem Zug.');
  if (!f.sealCut) return story.say('Der rote Hebel ist noch verplombt. Erst die Plombe ab.');
  const state = { t: 0, raised: false, derail: null };
  const sounds = new Set();
  const once = (name, at) => {
    if (state.derail >= at && !sounds.has(name + at)) {
      sounds.add(name + at);
      story.sound(name);
    }
  };
  const result = await story.view('picture', {
    state,
    backdrop: 1,
    draw: (ctx, view) => drawWindowRun(ctx, view.state),
    spots: () => (state.raised ? [] : [PADDLE_SPOT]),
    help: 'Kilometersteine zählen – bei 24,7 die Kelle heben  ·  Rechtsklick: zurück',
    update: (dt, view) => {
      const s = view.state;
      s.t += dt;
      if (s.derail !== null) {
        // Das Entgleisen: Hebel, Bremsen, Krachen – dann weißer Blitz und Stille
        s.derail += dt;
        once('lever', 0);
        once('brake', 0.5);
        once('crash', 1.4);
        once('crash', 2.3);
        if (s.derail > 3.3) view.close('ok');
        return;
      }
      if (s.t > 8.4 && !s.raised) view.close('missed');
    },
    onClick: async (spot, view) => {
      const s = view.state;
      s.raised = true;
      const { km, phase } = stoneAt(s.t);
      if (km !== '24,7' || phase <= 0.15 || phase >= 0.85) {
        view.close(`wrong:${km}`);
        return;
      }
      s.derail = 0;
      await story.say('Vierundzwanzig Komma sieben. Jetzt!');
      if (view.isOpen) await story.say('Weiche 7 springt halb um. Der Zug bäumt sich auf, kreischt – und kippt.');
    },
  });
  // Ein Rechtsklick mitten im Entgleisen hält es nicht mehr auf
  if (state.derail !== null) return finale(story);
  if (result === false) return;
  story.sound('wrong');
  await story.say(result === 'missed' ? 'Zu spät! Der Stein ist vorbei.' : `Bei ${result.slice(6)}? Falsch! Ich habe die Kelle zu ${Number(result.slice(6).replace(',', '.')) < 24.7 ? 'früh' : 'spät'} gehoben.`);
  story.sound('speaker');
  await story.speak('Ruhig, Junge. Noch wird es hell. Noch eine Runde. Bei 24,7.', { at: SPEAKER, color: VOICE });
}

// ============================================================================================
//  5. Schluss
// ============================================================================================

async function finale(story) {
  const f = story.flags;
  // Stille, Schnee – und langsam die Lichter draußen
  story.game.speech.finish();
  const snow = { time: 0 };
  const falling = story.view('picture', {
    state: snow,
    backdrop: 1,
    draw: (ctx, view) => drawSnow(ctx, view.state),
    spots: [],
    help: '',
    update: (dt, view) => {
      view.state.time += dt;
    },
    onMiss: () => story.game.speech.skip(),
  });
  story.game.views.picture.age = 1; // sofort ganz zeigen – sonst blitzt kurz das Abteil zwischen Weiß und Schnee auf
  story.scenes += 1; // wie eine Zwischensequenz: Joseph läuft nicht los
  try {
    await story.wait(1.8);
    if (story.game.views.picture.isOpen) await story.say('Stille.');
    await story.wait(0.8);
    if (story.game.views.picture.isOpen) await story.say('Schnee.');
    await story.wait(1.2);
    if (story.game.views.picture.isOpen) await story.say('Irgendwo in der Stille greift eine Hand nach meiner. Eine ältere Hand. Sie fühlt sich an wie meine eigene.');
    await story.wait(1.0);
  } finally {
    story.scenes -= 1;
  }
  story.game.views.picture.close();
  await falling;
  story.game.overlay.fade = 0;
  // Erst erzählt Joseph, wo er aufgewacht ist – danach lässt sich die letzte Kerze anzünden.
  // (Früher kamen diese Sätze nur bei einem Klick neben die Kerze und gingen leicht verloren.)
  const state = { lit: false, time: 0, ready: false };
  const shown = story.view('picture', {
    state,
    backdrop: 1,
    draw: (ctx, view) => drawFinal(ctx, view.state),
    spots: () => (state.lit || !state.ready ? [] : [CANDLE_SPOT]),
    update: (dt, view) => {
      view.state.time += dt;
    },
    help: 'Klicken: die letzte Kerze anzünden',
    onClick: async (spot, view) => {
      view.state.lit = true;
      story.sound('match');
      await story.wait(1.2);
      await story.say('Frohe Weihnachten.');
      await story.wait(1.5);
      view.close(true);
    },
    onMiss: () => {
      story.game.speech.skip();
    },
  });
  await story.wait(1.6);
  if (!f.finalSaid) {
    f.finalSaid = true;
    for (const line of [
      'Eine warme Stube. Ein Weihnachtsbaum. Und ich – in meinem Sessel, mit Schnurrbart.',
      'Ich erinnere mich. An alles. An Martha, an Mira, an die Nacht am Bahnsteig. Ich bin nicht mehr zwei.',
      'Mira: „Papa, du bist ja wach! Frohe Weihnachten!“ Und in der Tür steht Martha und lacht.',
      'Aus der Küche ruft Oma Ilse, die Plätzchen sind fertig. Am Haken hängt meine Uniform – und darüber ein weißer Schal.',
      'Die Wanduhr zeigt 23:47. Die Zeit, zu der der Zug ankommen sollte. Jetzt ist er angekommen.',
      'Oben auf dem Baum brennt eine Kerze noch nicht.',
    ]) {
      if (!story.game.views.picture.isOpen) break;
      await story.say(line);
    }
  }
  state.ready = true;
  await shown;
  story.note('Ich bin zu Hause – und nicht mehr zwei. Mira, Martha, Oma Ilse, der Weihnachtsbaum. Die Wanduhr zeigt 23:47 – der Zug ist angekommen. Frohe Weihnachten.');
  await story.cutscene(async () => {
    await finishWagon(story, {
      number: 24,
      title: 'Frohe Weihnachten',
      lines: ['Die Ringbahn ist angekommen – um 23:47 Uhr, am Heiligabend.', 'Danke fürs Mitspielen, 24 Tage lang.'],
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.capOn) return { id: 'cap', lines: ['Die Mütze des Schaffners hängt an der Garderobe.'] };
  if (!f.announced) {
    return { id: 'announce', lines: [
      'An der Lautsprecheranlage (der Trichter oben links) nur die Wagen einschalten, in denen noch jemand sitzt.',
      'Wer ist noch im Zug? Koch Bruno, Oma Ilse, der Barkeeper, Herr Moll, Mira und der Heizer. Herr K. und Herr Tick sind schon draußen.',
      'Wagen 4, 5, 7, 12, 15 und 21.',
    ] };
  }
  if (!f.sealCut) return { id: 'seal', lines: ['Die Plombe am roten Hebel: Die Lochzange liegt auf dem Schreibtisch. Lochzange nehmen, dann auf den Hebel anwenden.'] };
  return { id: 'paddle', lines: ['Am roten Hebel oder am Fenster die Kilometersteine zählen und genau bei 24,7 die Kelle heben.'] };
}
