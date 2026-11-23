import { CAN_SPOTS, VALVE_SPOTS, bedsWarm, drawCans, drawFingerWriting, drawGuestList, drawHeating, paintSky } from './art/wagon17.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 17 – Das Gewächshaus (Versteck des anderen Joseph, er selbst nur kurz hinter der Scheibe)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Heizung: Ventil 1 und 2 auf, Ventil 3 (Abfluss nach draußen) zu → alle Beete warm,
//      die Scheiben beschlagen. In der beschlagenen Scheibe: Fingerschrift – der Gießplan
//      („Rose: genau 4 L, nur die zwei Kannen nehmen“).
//   2. Gießkannen 3 l und 5 l → genau 4 l (5 füllen, in die 3 gießen, 3 leeren, Rest (2) in die 3,
//      5 füllen, 3 auffüllen → 4 in der 5). Damit die Rose gießen: Die Blüte öffnet sich,
//      darin ein kleiner Schlüssel.
//   3. Kiste unter dem Pflanztisch: Notizbuch des anderen Joseph mit der Fahrgastliste.
//      Offen: Ilse (5), Tick (11), Moll (12), Mira (15), J. (1) → 5 + 11 + 12 + 15 + 1 = 44 = Türcode.
//
// ERGEBNIS: „Der Letzte ist J. Dann sind alle wieder zusammen.“ Hinter der beschlagenen Scheibe
// läuft der andere Joseph davon.

const DOOR_CODE = '44';

export const wagon17 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'Der Zug ist der Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte. Auch ich, „J.“, saß darin.',
    'Mira, die Tochter des Schaffners, zeigte mir eine Zeichnung: ein Mann mit meiner Mütze führt Leute in den Tunnel. „Das ist Papa. Er bringt alle nach Hause.“',
    'Im Funkraum: Der Schaffner hatte vom Bahnsteig gewarnt – „Weiche 7 falsch“ –, aber niemand im Zug hat es gehört.',
    'Der Tunnel: siebzehn Ticks. Wie lange noch, bis es darin dunkel bleibt?',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 17,
      title: 'Das Gewächshaus',
      lines: [
        'Ein Gewächshaus – mitten im Zug. Warm, feucht, und es riecht nach Erde.',
        'Da unten liegt ein Schlafsack. Hier wohnt jemand.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  setup(story) {
    story.flags.fog = 0;
    story.flags.skyTime = 0;
    story.scene.paintSpot('sky', (ctx) => paintSky(ctx, {
      time: story.flags.skyTime, dark: story.isDark, fog: story.flags.fog, ghost: story.flags.ghost ?? null,
    }));
  },

  update(story, dt) {
    const f = story.flags;
    f.skyTime += dt;
    const target = f.heated ? 1 : 0;
    f.fog += (target - f.fog) * Math.min(1, dt * 0.4);
  },

  hotspots: {
    valve1: { look: 'Ein rotes Ventilrad an der Heizung.', use: (story) => openHeating(story) },
    valve2: { look: 'Ein rotes Ventilrad an der Heizung.', use: (story) => openHeating(story) },
    valve3: { look: 'Ein rotes Ventilrad. Dieses Rohr führt nach draußen.', use: (story) => openHeating(story) },
    radiator: {
      look: (story) => story.say(story.flags.heated ? 'Der Heizkörper ist warm.' : 'Ein Heizkörper. Kalt.'),
      use: (story) => openHeating(story),
    },
    glass: {
      look: (story) => readGlass(story), // Linksklick zeigt dasselbe (Auge-Zeiger)
    },
    cans: {
      look: 'Zwei Gießkannen auf dem Brett: eine kleine mit 3 Litern, eine große mit 5 Litern.',
      use: (story) => water(story),
    },
    rose: {
      look: (story) => story.say(story.flags.roseOpen ? 'Die Rose ist aufgeblüht.' : 'Eine einzelne rote Rosenknospe. Fest geschlossen.'),
      use: (story) => (story.flags.roseOpen ? story.say('Den Schlüssel habe ich schon.') : water(story)),
    },
    box: {
      look: 'Eine kleine Holzkiste unter dem Pflanztisch. Mit einem winzigen Schloss.',
      use: (story) => openBox(story),
      items: { tinyKey: (story) => openBox(story) },
    },
    sleepingBag: {
      look: 'Ein Schlafsack. Noch warm. Hier hat eben noch jemand gelegen.',
      use: 'Hinlegen? Bloß nicht. Nicht einschlafen.',
    },
    table: { look: 'Ein Pflanztisch mit Farnen, Kakteen und Tomaten.', use: 'Erde, Töpfe, Blätter.' },
    beds: {
      look: (story) => story.say(story.flags.heated ? 'Die Beete dampfen. Warm.' : 'Beete mit Kakteen, Tomaten und Farnen. Die Erde ist kalt.'),
    },
    door: {
      look: 'Die Tür nach vorne. Ein Zahlenschloss mit zwei Rädchen. Darüber, mit dem Finger in den Staub geschrieben: „Alle zusammen.“',
      use: (story) => tryDoor(story),
    },
  },

  items: {
    guestList: { look: (story) => readList(story) },
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
//  1. Heizung und beschlagene Scheibe
// ============================================================================================

async function openHeating(story) {
  const f = story.flags;
  if (f.heated) return story.say('Alle Beete sind warm. So bleibt es.');
  if (inTunnel(story)) return story.say('Im Dunkeln drehe ich womöglich das falsche Rad.');
  f.valves ??= [false, false, true];
  const state = { open: f.valves };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawHeating(ctx, view.state),
    spots: VALVE_SPOTS,
    area: { x: 160, y: 80, w: 960, h: 560 },
    help: 'Klicken: Ventil auf- oder zudrehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const i = Number(spot.id.slice(1)) - 1;
      view.state.open[i] = !view.state.open[i];
      story.sound('rotate');
      if (bedsWarm(view.state.open).every(Boolean)) {
        story.sound('water');
        await story.wait(0.8);
        view.close(true);
      }
    },
  });
  if (!done) return;
  f.heated = true;
  await story.say('Es gluckert in den Rohren. Die Beete werden warm …');
  await story.say('… und die Scheiben beschlagen. Da – auf einer Scheibe erscheint Schrift! Jemand hat mit dem Finger darauf geschrieben.');
  story.note('Heizung: Ventil 1 und 2 auf, Ventil 3 (Abfluss) zu. Alle Beete warm, die Scheiben beschlagen – auf einer steht etwas in Fingerschrift.');
}

async function readGlass(story) {
  const f = story.flags;
  if (!f.heated) return story.say('Glas, Schnee, Nacht. Die Scheiben sind klar.');
  story.sound('paper');
  await story.card({ draw: drawFingerWriting });
  if (f.planRead) return;
  f.planRead = true;
  await story.say('Ein Gießplan. „Rose: genau vier Liter. Nur die zwei Kannen nehmen.“');
  story.note('Fingerschrift auf der beschlagenen Scheibe: Gießplan. Rose: GENAU 4 Liter – nur mit den zwei Kannen (3 l und 5 l).');
}

// ============================================================================================
//  2. Gießkannen und Rose
// ============================================================================================

async function water(story) {
  const f = story.flags;
  if (f.roseOpen) return story.say('Die Rose ist gegossen.');
  if (inTunnel(story)) return story.say('Im Dunkeln verschütte ich alles.');
  const state = { a: 0, b: 0 };
  const done = await story.view('picture', {
    state,
    draw: (ctx, view) => drawCans(ctx, view.state),
    spots: CAN_SPOTS,
    area: { x: 200, y: 70, w: 880, h: 580 },
    help: 'Klicken: füllen, ausleeren, umgießen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      story.sound('water');
      if (spot.id === 'fill3') s.a = 3;
      if (spot.id === 'fill5') s.b = 5;
      if (spot.id === 'empty3') s.a = 0;
      if (spot.id === 'empty5') s.b = 0;
      if (spot.id === 'pour35') {
        const amount = Math.min(s.a, 5 - s.b);
        s.a -= amount;
        s.b += amount;
      }
      if (spot.id === 'pour53') {
        const amount = Math.min(s.b, 3 - s.a);
        s.b -= amount;
        s.a += amount;
      }
      if (spot.id !== 'rose') return;
      if (s.b === 0) return story.say('Die große Kanne ist leer.');
      if (s.b !== 4) {
        await story.say(`${s.b} Liter? Der Plan sagt: genau vier. Die Rose rührt sich nicht.`);
        s.b = 0;
        return;
      }
      s.b = 0;
      view.close(true);
    },
  });
  if (done) await roseBlooms(story);
}

// Wird aufgerufen, wenn die Ansicht mit genau 4 Litern geschlossen wurde
async function roseBlooms(story) {
  const f = story.flags;
  f.roseOpen = true;
  story.sound('success');
  await story.say('Genau vier Liter … Die Knospe öffnet sich, Blatt für Blatt.');
  story.give('tinyKey');
  await story.say('In der Blüte liegt ein winziger Schlüssel!');
  story.note('Mit genau 4 Litern gegossen, hat sich die Rose geöffnet. Darin: ein winziger Schlüssel.');
}

// ============================================================================================
//  3. Die Kiste und die Liste
// ============================================================================================

async function openBox(story) {
  const f = story.flags;
  if (f.boxOpen) return story.say('Die Kiste ist leer. Das Notizbuch habe ich.');
  if (!story.has('tinyKey')) return story.say('Abgeschlossen. Das Schlüsselloch ist winzig.');
  f.boxOpen = true;
  story.remove('tinyKey');
  story.sound('key');
  await story.say('Der winzige Schlüssel passt.');
  story.give('guestList');
  await story.say('Ein Notizbuch. Und darin eine Liste – Fahrgäste, mit Haken dahinter.');
  await readList(story);
}

async function readList(story) {
  const f = story.flags;
  story.sound('paper');
  await story.card({ draw: drawGuestList });
  if (f.listRead) return;
  f.listRead = true;
  await story.cutscene(async () => {
    await story.say('„Wer ist schon zu Hause.“ Abgehakt: die Frau des Schaffners, Runde eins. Bis Herr K., Runde 108.');
    await story.say('Offen: Ilse, Tick, Moll, Mira … und J.');
    await story.say('„Der Letzte ist J. Dann sind alle wieder zusammen.“ Das ist seine Liste. Die Liste des anderen.');
    await story.say('Auf der letzten Seite eine Tabelle: „Tunnel. Runde 1: drei Ticks. Runde 60: sieben. Runde 109: elf. Danach jede Runde einer mehr …“');
    await story.say('Darunter, dick unterstrichen: „Bei fünfundzwanzig wird es nicht mehr hell. Beeil dich, Junge.“');
    await story.say('„Beeil dich, Junge.“ Das ist für mich geschrieben.');
    story.sound('dread');
    story.player.facing = 'right';
    for (let x = 1300; x > -120; x -= 22) {
      story.flags.ghost = x;
      await story.wait(0.03);
    }
    story.flags.ghost = null;
    await story.say('Da! Hinter der beschlagenen Scheibe! Jemand rennt weg – mit meiner Mütze!');
    await story.say('Weg. Er war die ganze Zeit hier.');
  });
  story.note('Notizbuch des anderen Joseph: „Wer ist schon zu Hause“. Abgehakt bis Herr K. (Runde 108). Offen: Ilse (Wagen 5), Tick (11), Moll (12), Mira (15, „will nicht ohne Papa“), J. (Wagen 1). Ohne Wagennummer darunter: „Personal (Bruno, Barkeeper, Heizer): ganz zum Schluss.“ – „Der Letzte ist J. Dann sind alle wieder zusammen.“');
  story.note('Letzte Seite im Notizbuch: Der Tunnel wird jede Runde länger (Runde 1: drei Ticks, Runde 109: elf, danach jede Runde einer mehr). „Bei fünfundzwanzig wird es nicht mehr hell. Beeil dich, Junge.“ Der Tunnel dauert jetzt siebzehn Ticks.');
}

// ============================================================================================
//  Tür und Ende
// ============================================================================================

async function tryDoor(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'door17',
    digits: 2,
    check: (code) => {
      tries += 1;
      return code === DOOR_CODE;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(story.flags.listRead ? 'Falsch. Die Wagen der offenen Namen … zusammengezählt?' : 'Falsch. Zwei Ziffern.');
    return;
  }
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.say('Fünf, elf, zwölf, fünfzehn und eins: vierundvierzig. Offen.');
    await story.say('„Zu Hause“. Er holt sie nach Hause, einen nach dem anderen. Und ich bin der Letzte.');
    story.sound('door');
    await finishWagon(story, {
      number: 17,
      title: 'Ende von Wagen 17',
      lines: ['Die Liste des anderen Joseph: „Der Letzte ist J. Dann sind alle wieder zusammen.“'],
      nextTitle: 'im Schaffnerabteil',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.heated) {
    return { id: 'heat', lines: [
      'Hier ist es kalt. An der Heizung sind drei rote Ventile.',
      'Alle vier Beete müssen warm werden. Ventil 3 führt nach draußen – damit läuft das warme Wasser weg.',
      'Ventil 1 und 2 auf, Ventil 3 zu.',
    ] };
  }
  if (!f.planRead) return { id: 'glass', lines: ['Die Scheiben sind beschlagen. Auf einer steht etwas – Rechtsklick auf das Glas oben.'] };
  if (!f.roseOpen) {
    return { id: 'cans', lines: [
      'Genau 4 Liter für die Rose, mit einer 3-Liter- und einer 5-Liter-Kanne.',
      'Erst 2 Liter abmessen: 5er füllen, in die 3er gießen – in der 5er bleiben 2.',
      '5er füllen, in die 3er gießen, 3er ausleeren, 5er in die 3er (jetzt 2 drin), 5er füllen, in die 3er gießen bis voll → 4 Liter in der 5er. Rose gießen.',
    ] };
  }
  if (!f.listRead) return { id: 'box', lines: ['Der winzige Schlüssel passt zur Kiste unter dem Pflanztisch.'] };
  return { id: 'door', lines: [
    'Zwei Ziffern. Auf der Liste stehen hinter den offenen Namen Wagennummern.',
    '5 + 11 + 12 + 15 + 1 = 44.',
  ] };
}

