import { drawBeamPlan, drawPlaque, drawScratches, mirrorSpots, paintMirrors, tracePath } from './art/wagon9.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 9 – Der Spiegelwagen
// ============================================================================================
//
// DIE RÄTSEL
//   1. Kratzer in der Wand: Spiegelschrift. Im Spiegel gelesen: „Was du tust, tut er in der
//      nächsten Runde – verkehrt herum.“
//   2. Zwei Hebel, die gleichzeitig unten sein müssen (dann öffnet sich die Blende der Deckenlampe).
//      Allein schafft Joseph das nicht. Aber sein Spiegelbild wiederholt in der nächsten Runde,
//      was er getan hat – spiegelverkehrt und zur selben Zeit der Runde: Zieht Joseph rechts,
//      zieht das Spiegelbild eine Runde später links. Dann muss Joseph rechts bereitstehen.
//   3. Der Lichtstrahl der Lampe muss über vier Standspiegel ins Glasauge der Tür (Plan von oben).
//   4. Die Tür geht auf – und im Spiegel steht kurz jemand hinter Joseph.
//
// ERGEBNIS: Es gibt zwei von ihm.

const MIRROR_WINDOW = 6; // Sekunden, die der gespiegelte Hebel unten bleibt
const SOLUTION_START = ['\\', '\\', '/', '\\'];

export const wagon9 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jeder Runde verschwindet im Tunnel ein Fahrgast. Herr K. ging freiwillig, als der Schaffner ihn rief – ich konnte ihn nicht retten.',
    'Im Bordkino: Auf dem letzten Filmbild führt eine Gestalt Herrn K. in den Tunnel. Mit meiner Mütze, meiner Brille, meinem Schal.',
    'Der Täter sieht aus wie ich.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 9,
      title: 'Der Spiegelwagen',
      lines: [
        'Spiegel. Überall Spiegel.',
        'Und überall ich. Nach dem Film im Kino ist das kein schöner Anblick.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  setup(story) {
    story.flags.ghost = 0;
    story.scene.paintSpot('mirror', (ctx) => paintMirrors(ctx, { scene: story.scene, player: story.player, ghost: story.flags.ghost }));
  },

  update(story) {
    const f = story.flags;
    if (!f.pulls?.length || f.shutterOpen) return;
    // Was Joseph in der letzten Runde gezogen hat, zieht jetzt sein Spiegelbild – verkehrt herum
    const now = story.motion.lapTime, lap = story.lap;
    for (const pull of f.pulls) {
      if (pull.lap !== lap - 1 || pull.replayed) continue;
      if (now >= pull.at && now < pull.at + 1.5) {
        pull.replayed = true;
        f.mirrorLever = pull.lever === 'right' ? 'left' : 'right';
        f.mirrorUntil = story.motion.time + MIRROR_WINDOW;
        mirrorPulls(story, f.mirrorLever);
      }
    }
  },

  hotspots: {
    leverLeft: { look: 'Ein Hebel links neben der Tür.', use: (story) => pull(story, 'left') },
    leverRight: { look: 'Ein Hebel rechts neben der Tür.', use: (story) => pull(story, 'right') },
    plaque: {
      look: async (story) => {
        await story.card({ draw: drawPlaque });
        if (!story.flags.plaqueRead) {
          story.flags.plaqueRead = true;
          story.note('Messingschild: Durchgang nur mit Licht im Auge. Die Blende der Lampe öffnet sich, wenn beide Hebel zugleich unten sind.');
        }
      },
    },
    eye: {
      look: (story) => story.say(story.flags.eyeLit ? 'Das Glasauge leuchtet.' : 'Ein Glasauge in der Tür. Es starrt mich an. Darunter ein kleines Messingschild.'),
      use: 'Es lässt sich nicht drehen. Es wartet auf etwas.',
    },
    lamp: {
      look: (story) => story.say(story.flags.shutterOpen ? 'Die Blende ist offen. Ein heller Strahl fällt auf den ersten Standspiegel.' : 'Die Deckenlampe hat eine Blende, wie eine Kamera. Sie ist zu.'),
    },
    stands: {
      look: 'Vier runde Standspiegel auf Messingfüßen. Man kann sie drehen.',
      use: (story) => aimMirrors(story),
    },
    scratches: {
      look: 'Kratzer in der Holzwand. Buchstaben – aber verkehrt herum.',
      use: (story) => readScratches(story, false),
    },
    wallMirror: {
      look: (story) => story.say(story.flags.ghostSeen ? 'Nur ich. Diesmal.' : 'Mein Spiegelbild. Es sieht müde aus.'),
      use: (story) => readScratches(story, true),
    },
    speaker: { look: 'Ein Lautsprecher. Still.' },
    carpet: {
      look: 'Ein roter Teppich, frisch gebürstet.',
      use: (story) => waitForTunnel(story, 'Ich setze mich auf den Teppich und warte auf den Tunnel …'),
    },
    door: {
      look: 'Die Tür nach vorne. Kein Schloss, kein Griff – nur das Glasauge.',
      use: (story) => (story.flags.eyeLit ? ending(story) : story.say('Sie rührt sich nicht. Kein Griff, kein Schloss. Nur dieses Auge.')),
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  async onTunnel(story, inside) {
    if (inside) {
      story.flags.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
    }
  },
};

// ============================================================================================
//  1. Spiegelschrift
// ============================================================================================

async function readScratches(story, inMirror) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich nichts.');
  if (inMirror && !f.scratchesSeen) return story.say('Mein Spiegelbild. Mehr nicht.');
  story.sound('paper');
  await story.card({ draw: (ctx) => drawScratches(ctx, inMirror) });
  if (!inMirror) {
    f.scratchesSeen = true;
    if (!f.scratchesRead) await story.say('Spiegelschrift. Die lese ich am besten in einem Spiegel.');
    return;
  }
  if (f.scratchesRead) return;
  f.scratchesRead = true;
  await story.say('Im Spiegel: „Was du tust, tut er in der nächsten Runde – verkehrt herum.“');
  await story.say('Er? Mein Spiegelbild?');
  story.note('Kratzer in Spiegelschrift: „Was du tust, tut er in der nächsten Runde – verkehrt herum.“');
}

// ============================================================================================
//  2. Die Hebel
// ============================================================================================

async function pull(story, lever) {
  const f = story.flags;
  if (f.shutterOpen) return story.say('Die Blende ist offen. Die Hebel brauche ich nicht mehr.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich den Griff nicht.');
  story.sound('latch');
  const other = lever === 'right' ? 'left' : 'right';
  if (f.mirrorLever === other && (f.mirrorUntil ?? 0) > story.motion.time) {
    f.shutterOpen = true;
    await story.cutscene(async () => {
      await story.say(`Ich ziehe ${lever === 'right' ? 'rechts' : 'links'} – und gegenüber hält mein Spiegelbild den anderen Hebel!`);
      story.sound('unlock');
      await story.wait(0.6);
      await story.say('Klack! Oben an der Lampe … die Blende öffnet sich. Ein Lichtstrahl fällt in den Wagen.');
      await story.say('Ich habe mir selbst geholfen. Über eine Runde hinweg.');
    });
    story.note('Beide Hebel waren zugleich unten: ich rechts, mein Spiegelbild links (eine Runde, nachdem ich rechts gezogen hatte). Die Blende der Lampe ist offen.');
    return;
  }
  f.pulls ??= [];
  f.pulls = f.pulls.filter((p) => p.lap >= story.lap - 1);
  f.pulls.push({ lever, at: story.motion.lapTime, lap: story.lap });
  await story.say(pickLine(f));
  if (!f.leverNoted) {
    f.leverNoted = true;
    story.note('Die Hebel neben der Tür federn sofort zurück. Beide gleichzeitig ziehen – allein komme ich nicht an beide.');
  }
}

function pickLine(f) {
  const lines = [
    'Klack. Der Hebel federt sofort zurück. Allein bewegt er nichts.',
    'Wieder nichts. Beide gleichzeitig – aber ich habe nur zwei Hände und die Hebel sind drei Meter auseinander.',
    'Klack. Zurück.',
  ];
  f.leverTries = (f.leverTries ?? 0) + 1;
  return lines[Math.min(f.leverTries - 1, lines.length - 1)];
}

// Das Spiegelbild zieht den Hebel, den Joseph in der letzten Runde auf der anderen Seite gezogen hat
async function mirrorPulls(story, lever) {
  story.sound('latch');
  if (story.isBusy) return;
  const side = lever === 'left' ? 'linken' : 'rechten';
  await story.respond(async () => {
    await story.say(`Da! Im Spiegel … mein Spiegelbild zieht am ${side} Hebel!`);
    await story.say(`Und der ${side} Hebel ist wirklich unten! Schnell – den anderen!`);
  });
  if (!story.flags.mirrorNoted) {
    story.flags.mirrorNoted = true;
    story.note(`Mein Spiegelbild hat den ${side} Hebel gezogen – genau zu der Zeit der Runde, zu der ich in der Runde davor den anderen gezogen habe. Er bleibt ein paar Sekunden unten.`);
  }
}

// ============================================================================================
//  3. Der Lichtstrahl
// ============================================================================================

async function aimMirrors(story) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln ist kein Strahl zu sehen.');
  if (f.eyeLit) return story.say('Der Strahl trifft das Auge. So bleibt es.');
  f.tilt ??= [...SOLUTION_START];
  const state = { tilt: f.tilt, time: 0 };
  const solved = await story.view('picture', {
    state,
    draw: (ctx, view) => {
      if (f.shutterOpen) drawBeamPlan(ctx, view.state);
      else drawBeamPlan(ctx, { ...view.state, tilt: view.state.tilt, dark: true });
    },
    spots: mirrorSpots(),
    area: { x: 280, y: 40, w: 720, h: 640 },
    update: (dt, view) => {
      view.state.time += dt;
    },
    help: 'Klicken: Spiegel drehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const i = Number(spot.id.slice(1)) - 1;
      view.state.tilt[i] = view.state.tilt[i] === '/' ? '\\' : '/';
      story.sound('rotate');
      if (f.shutterOpen && tracePath(view.state.tilt).hit) {
        await story.wait(0.8);
        view.close(true);
      }
    },
  });
  if (!f.shutterOpen) {
    await story.say('Ohne Licht bringt das Drehen nichts. Die Blende der Lampe ist zu.');
    return;
  }
  if (!solved) return;
  f.eyeLit = true;
  story.sound('success');
  await story.say('Der Strahl springt von Spiegel zu Spiegel … und trifft das Glasauge!');
  await story.say('Klick. Irgendwo in der Tür löst sich ein Riegel.');
  story.note('Der Lichtstrahl trifft das Glasauge. Die Tür ist entriegelt.');
}

// ============================================================================================
//  Ende
// ============================================================================================

async function ending(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    await story.say('Die Tür ist offen. Endlich raus aus diesem Spiegelkabinett.');
    story.player.facing = 'right';
    story.sound('dread');
    for (let t = 0; t <= 1; t += 0.05) {
      f.ghost = t;
      await story.wait(0.04);
    }
    await story.wait(0.6);
    await story.say('… Moment.');
    await story.say('Im großen Spiegel rechts. Hinter mir. Da steht jemand. Mit meiner Mütze.');
    story.player.facing = 'front';
    f.ghost = 0;
    f.ghostSeen = true;
    await story.wait(0.8);
    await story.say('Niemand. Hier ist niemand.');
    await story.say('Aber ich habe ihn gesehen. Er sah aus wie ich – nur älter.');
    await story.say('Es gibt zwei von mir.');
    story.note('Im Spiegel stand kurz jemand hinter mir – mit meiner Mütze. Als ich mich umdrehte, war niemand da. Es gibt zwei von mir.');
    story.sound('door');
    await finishWagon(story, {
      title: 'Ende von Wagen 9',
      lines: ['Im Spiegel stand jemand hinter Joseph. Es gibt zwei von ihm.'],
      nextTitle: 'im Lautsprecherwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.shutterOpen) {
    if (!f.plaqueRead) return { id: 'plaque', lines: ['Unter dem Glasauge an der Tür hängt ein kleines Messingschild. Rechtsklick darauf.'] };
    if (!f.scratchesRead) {
      return { id: 'scratch', lines: [
        'Beide Hebel gleichzeitig – allein unmöglich. Rechts an der Wand sind Kratzer.',
        'Die Kratzer sind Spiegelschrift. Erst ansehen, dann einen der Spiegel daneben benutzen.',
      ] };
    }
    return { id: 'levers', lines: [
      'Was ich tue, tut mein Spiegelbild in der nächsten Runde – verkehrt herum. Also zur selben Zeit der Runde, aber am anderen Hebel.',
      'Den rechten Hebel ziehen. Dann auf den Tunnel warten. In der nächsten Runde zieht mein Spiegelbild zur selben Zeit den linken.',
      'Rechts ziehen, dann auf dem Teppich auf den Tunnel warten. Danach rechts am Hebel stehen bleiben. Sobald das Spiegelbild links zieht: sofort rechts ziehen!',
    ] };
  }
  if (!f.eyeLit) {
    return { id: 'beam', lines: [
      'Der Strahl der Lampe muss über die vier Standspiegel ins Glasauge.',
      'Vom ersten Spiegel nach links, dann nach unten, dann quer nach rechts, dann hinauf zum Auge.',
      'Spiegel 1, 2 und 4 so: „/“. Spiegel 3 so: „\\“.',
    ] };
  }
  return { id: 'door', lines: ['Das Auge leuchtet. Die Tür ist offen.'] };
}

