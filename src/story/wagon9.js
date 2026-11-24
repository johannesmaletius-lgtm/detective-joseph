import { SCRATCH_TEXT, drawEyeGlow, drawScratches, drawLevers, drawMirrors, drawPlan, planSpots, traceBeam } from './art/wagon9.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';
import { SPRITE_HEIGHT } from '../player/player.js';

// ============================================================================================
//  WAGEN 9 – Der Spiegelwagen (niemand da)
// ============================================================================================
//
// Der Täter trägt Josephs Sachen. Im Spiegelwagen bewegt sich das Spiegelbild eine Runde zu spät.
//
// DIE RÄTSEL
//   1. Zwei Hebel, links und rechts an der Stirnwand – zu weit auseinander für einen allein.
//      Zieht Joseph einen, springt er zurück. In der NÄCHSTEN Runde, im selben Augenblick, zieht
//      sein Spiegelbild den anderen Hebel (spiegelverkehrt). Die Kratzer an der Wand sagen es in
//      Spiegelschrift: „Er ist eine Runde zu spät.“ (lesbar im Spiegel gegenüber)
//   2. Also: in einer Runde einen Hebel ziehen, nach dem Tunnel zur selben Zeit wieder dort stehen
//      und ziehen, wenn das Spiegelbild den anderen zieht → beide unten → die Standspiegel lassen
//      sich drehen, die Lampe über der Tür klappt auf.
//   3. Lichtstrahl über die vier Standspiegel ins Glasauge der Tür. Lösung: A \, B \, C /, D /.
//   4. Die Tür geht auf. Im großen Spiegel steht für einen Augenblick jemand hinter Joseph.

const HOLD = 3.5; // so lange hält Joseph (oder sein Spiegelbild) einen Hebel unten
const SOLUTION = { A: '\\', B: '\\', C: '/', D: '/' };

export const wagon9 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jedem Tunnel springt alles zurück – nur was ich bei mir trage, bleibt. Jede Runde verschwindet ein Fahrgast.',
    'Herr K. ist in Runde 108 im Tunnel verschwunden. Er ging freiwillig, als der Schaffner ihn rief.',
    'Bordkino: Der Film aus dem Tunnel zeigt eine Gestalt mit meiner Mütze, meiner Brille und meinem Schal, die Herrn K. in den Tunnel führt. Der Täter sieht aus wie ich.',
  ],

  setup(story) {
    const f = story.flags;
    f.turns ??= { A: '/', B: '/', C: '\\', D: '\\' };
    f.pulls ??= {};      // Runde → [{ side, t }]
    f.levers = { left: 0, right: 0 };
    story.scene.paintSpot('mirrors', (ctx) => drawMirrors(ctx, {
      figures: reflections(story),
      time: story.motion.time,
      room: story.scene.background,
      live: liveReflection(story),
    }));
    story.scene.paintSpot('levers', (ctx) => {
      drawLevers(ctx, f.levers);
      drawEyeGlow(ctx, f.eyeLit ? 1 : 0, story.motion.time);
    });
  },

  async intro(story) {
    await wagonIntro(story, {
      number: 9,
      title: 'Der Spiegelwagen',
      lines: [
        'Spiegel. Überall Spiegel.',
        'Der Täter trägt meine Mütze, meine Brille, meinen Schal …',
        'Und hier sehe ich mich gleich zehnmal.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    leverLeft: { look: (story) => lookLever(story), use: (story) => pullLever(story, 'left') },
    leverRight: { look: (story) => lookLever(story), use: (story) => pullLever(story, 'right') },

    eye: {
      look: (story) => story.say(story.flags.eyeLit ? 'Das Glasauge leuchtet.' : 'Ein Glasauge in der Tür. Darunter steht: „Ich öffne mich dem Licht.“'),
      use: (story) => story.say(story.flags.eyeLit ? 'Es leuchtet. Die Tür ist offen.' : 'Mit der Taschenlampe? … Nichts. Es will anderes Licht. Das von oben vielleicht.'),
      items: { flashlight: 'Ich leuchte hinein – nichts. Das Auge will ein anderes Licht.' },
    },
    door: {
      look: (story) => story.say(story.flags.eyeLit ? 'Die Tür ist offen.' : 'Kein Griff, kein Schloss. Nur ein Glasauge.'),
      use: (story) => (story.flags.eyeLit ? leaveWagon(story) : story.say('Zu. Kein Griff. Nur dieses Glasauge.')),
    },
    lamp: {
      look: (story) => story.say(story.flags.leversDone ? 'Die Lampe ist aufgeklappt. Ein Lichtstrahl fällt schräg nach unten – auf die Standspiegel.' : 'Eine Lampe über der Tür. Sie hat eine Klappe, die zu ist.'),
    },
    speaker: { look: 'Ein Lautsprecher. Stumm.' },
    panel: { look: 'Ein Kasten mit zwei Lämpchen: „Links“ und „Rechts“. Darunter: „Beide zugleich“.' },
    scratches: {
      look: (story) => readScratches(story, true),
      use: (story) => readScratches(story, true),
    },
    standA: standMirror(),
    standB: standMirror(),
    standC: standMirror(),
    standD: standMirror(),
    mirrorL: {
      look: (story) => lookWallMirror(story, 'left'),
      use: (story) => lookWallMirror(story, 'left'),
    },
    mirrorR: {
      look: (story) => lookWallMirror(story, 'right'),
      use: (story) => lookWallMirror(story, 'right'),
    },
    candles: { look: 'Kerzen. Sie flackern nicht, obwohl der Zug rumpelt.' },
    carpet: {
      look: 'Ein langer roter Teppich bis zur Tür.',
      use: (story) => waitForTunnel(story, 'Ich setze mich auf den Teppich und warte auf den Tunnel …'),
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
    updateLevers(story);
  },
};

function standMirror() {
  return {
    look: (story) => story.say(story.flags.leversDone ? 'Ein Standspiegel. Er lässt sich jetzt drehen.' : 'Ein runder Spiegel auf einem Messingständer. Er ist festgestellt – irgendwo muss es eine Sperre geben.'),
    use: (story) => turnMirrors(story),
  };
}

// ============================================================================================
//  Spiegelbilder
// ============================================================================================

// Joseph, wie er gerade aussieht – für die Wandspiegel
function liveReflection(story) {
  const { player, scene } = story;
  const image = player.currentImage?.();
  if (!image) return null;
  const height = scene.characterHeightAt(player.y) * (image.height / SPRITE_HEIGHT);
  return { image, x: player.x, y: player.y, height };
}

function reflections(story) {
  const f = story.flags;
  const figures = [];
  if (f.ghost) {
    // das verspätete Spiegelbild am anderen Hebel
    const mirror = f.ghost.side === 'left' ? 'standA' : 'standD';
    figures.push({ mirror, alpha: 0.85, dark: 0.35 });
    figures.push({ mirror: f.ghost.side === 'left' ? 'wall2' : 'wall3', alpha: 0.7, dark: 0.45 });
  }
  if (f.reveal) {
    figures.push({ mirror: 'wall5', alpha: 0.9, dark: 0.3 });
    if (f.reveal === 'two') figures.push({ mirror: 'wall5', alpha: 0.85, dark: 0.82, offset: 0.22, scale: 1.06 });
  }
  return figures;
}

// ============================================================================================
//  Hebel und das verspätete Spiegelbild
// ============================================================================================

function now(story) {
  return story.motion.time;
}

function updateLevers(story) {
  const f = story.flags;
  const t = now(story);
  const lapTime = story.motion.lapTime;
  // Das Spiegelbild wiederholt, was Joseph in der letzten Runde getan hat – spiegelverkehrt
  if (!f.leversDone) {
    for (const pull of f.pulls[story.lap - 1] ?? []) {
      if (pull.fired || lapTime < pull.t || lapTime > pull.t + 1) continue;
      pull.fired = true;
      f.ghost = { side: pull.side === 'left' ? 'right' : 'left', until: t + HOLD };
      story.sound('lever');
      if (!f.ghostSeen) noticeGhost(story);
    }
  }
  if (f.ghost && t > f.ghost.until) f.ghost = null;
  const target = {
    left: (f.held?.side === 'left' && t < f.held.until) || f.ghost?.side === 'left' || f.leversDone ? 1 : 0,
    right: (f.held?.side === 'right' && t < f.held.until) || f.ghost?.side === 'right' || f.leversDone ? 1 : 0,
  };
  for (const side of ['left', 'right']) f.levers[side] += (target[side] - f.levers[side]) * 0.35;
  if (!f.leversDone && f.held && t < f.held.until && f.ghost && f.ghost.side !== f.held.side) {
    f.leversDone = true;
    bothLevers(story);
  }
}

async function noticeGhost(story) {
  const f = story.flags;
  f.ghostSeen = true;
  if (story.inCutscene) return;
  const side = f.ghost.side === 'left' ? 'linke' : 'rechte';
  await story.say(`Da! Der ${side} Hebel geht runter – von ganz allein!`);
  await story.say('Und im Spiegel daneben … stehe ich. Und ziehe. Aber ich stehe doch hier!');
  story.note(`Runde ${story.lap}: Der ${side} Hebel ging von allein nach unten – im Spiegel daneben stand ich und zog. Genau wie ich es in der Runde davor am anderen Hebel gemacht habe.`);
}

function lookLever(story) {
  const f = story.flags;
  if (f.leversDone) return story.say('Beide Hebel sind unten und eingerastet.');
  return story.say('Ein schwerer Hebel. Der andere ist auf der anderen Seite der Tür – viel zu weit weg, um beide gleichzeitig zu ziehen.');
}

async function pullLever(story, side) {
  const f = story.flags;
  if (f.leversDone) return story.say('Die Hebel sind unten. Mehr geht nicht.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich den Griff nicht.');
  const t = now(story);
  if (f.held && t < f.held.until) return;
  f.held = { side, until: t + HOLD };
  (f.pulls[story.lap] ??= []).push({ side, t: story.motion.lapTime });
  story.sound('lever');
  f.pullCount = (f.pullCount ?? 0) + 1;
  await story.say(f.pullCount === 1 ? 'Hngh … schwer. Ich halte ihn unten …' : 'Ich ziehe und halte …');
  await story.wait(Math.max(0, f.held.until - now(story)));
  if (f.leversDone) return;
  story.sound('lever');
  if (f.pullCount === 1) {
    await story.say('Er springt zurück. Allein schaffe ich das nicht. Auf dem Kasten steht: „Beide zugleich“.');
    story.note('Spiegelwagen: zwei Hebel, links und rechts der Tür. „Beide zugleich“ – aber sie sind zu weit auseinander für einen allein.');
  } else if (!f.ghostSeen) {
    await story.say('Wieder zurückgesprungen.');
  } else {
    await story.say('Zurückgesprungen. Ich war nicht im selben Augenblick wie mein Spiegelbild.');
  }
}

async function bothLevers(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    story.sound('unlock');
    await story.wait(0.6);
    await story.say('Beide unten! Mein Spiegelbild links, ich rechts – oder umgekehrt.');
    story.sound('latch');
    await story.say('Oben über der Tür klappt die Lampe auf. Ein Lichtstrahl fällt auf die Standspiegel.');
    await story.say('Und die Ständer sind nicht mehr festgestellt.');
  });
  story.note('Mit meinem Spiegelbild zusammen beide Hebel gezogen: Die Lampe über der Tür ist aufgeklappt, die vier Standspiegel lassen sich drehen. Das Glasauge in der Tür „öffnet sich dem Licht“.');
}

// ============================================================================================
//  Kratzer und Spiegel an der Wand
// ============================================================================================

async function readScratches(story, mirrored) {
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich nur Schatten.');
  story.sound('page');
  await story.card({ draw: (ctx) => drawScratches(ctx, mirrored) });
  const f = story.flags;
  if (mirrored && !f.scratchesSeen) {
    f.scratchesSeen = true;
    await story.say('Buchstaben, tief ins Holz geritzt. Alle verkehrt herum – Spiegelschrift.');
    story.note('An der rechten Wand: Kratzer in Spiegelschrift. Im Spiegel gegenüber könnte ich sie lesen.');
  }
  if (!mirrored && !f.scratchesRead) {
    f.scratchesRead = true;
    await story.say(`„${SCRATCH_TEXT.join(' ')}“.`);
    await story.say('Wer ist eine Runde zu spät? … Mein Spiegelbild?');
    story.note(`Die Kratzer, im Spiegel gelesen: „${SCRATCH_TEXT.join(' ')}.“ Meine Schrift.`);
  }
}


async function lookWallMirror(story, side) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln ist der Spiegel schwarz.');
  if (!f.girlSeen) {
    f.girlSeen = true;
    await story.say('Im Spiegel, hinter mir, steht ein kleines Mädchen mit einem Stoffhasen. Sie winkt.');
    await story.say('Ich drehe mich um – niemand. Nur der rote Teppich.');
    story.note('Im Spiegelwagen stand im Spiegel kurz ein kleines Mädchen mit einem Stoffhasen hinter mir und winkte. Als ich mich umdrehte, war niemand da. Derselbe Hase wie im Gepäckwagen?');
    return;
  }
  if (side === 'left' && f.scratchesSeen) return readScratches(story, false);
  if (side === 'left') return story.say('Ein Spiegel mit Goldrahmen. Gegenüber, an der rechten Wand, spiegeln sich ein paar Kratzer.');
  return story.say(f.ghostSeen ? 'Mein Spiegelbild. Es macht, was ich mache. Jetzt gerade jedenfalls.' : 'Ich im Spiegel. Mütze, Brille, Schal. Wie auf dem Film.');
}

// ============================================================================================
//  Lichtstrahl über die Standspiegel
// ============================================================================================

async function turnMirrors(story) {
  const f = story.flags;
  if (!f.leversDone) return story.say('Festgestellt. Er lässt sich keinen Millimeter drehen.');
  if (f.eyeLit) return story.say('Der Strahl trifft das Auge. So bleibt es.');
  if (inTunnel(story)) return story.say('Im Dunkeln ist auch der Lichtstrahl weg.');
  const solved = await story.view('picture', {
    draw: (ctx, view) => drawPlan(ctx, f.turns, { time: view.age ?? 0 }),
    spots: planSpots(),
    area: { x: 290, y: 30, w: 700, h: 680 },
    help: 'Spiegel anklicken: drehen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      f.turns[spot.id] = f.turns[spot.id] === '/' ? '\\' : '/';
      story.sound('mirror');
      if (traceBeam(f.turns).hit) {
        story.sound('success');
        await story.wait(1.1);
        view.close(true);
      }
    },
  });
  if (!solved) {
    if (!f.planSeen && !inTunnel(story)) {
      f.planSeen = true;
      await story.say('Der Strahl kommt von der Lampe und springt von Spiegel zu Spiegel. Er muss das Glasauge in der Tür treffen.');
      story.note('Die vier Standspiegel drehen, bis der Lichtstrahl der Lampe ins Glasauge der Tür fällt.');
    }
    return;
  }
  f.eyeLit = true;
  story.sound('unlock');
  await story.say('Der Strahl trifft das Glasauge! Es leuchtet – und in der Tür klickt es.');
  story.note('Der Lichtstrahl trifft das Glasauge (A \\, B \\, C /, D /). Die Tür ist offen.');
}

// ============================================================================================
//  Ende: zwei von ihm
// ============================================================================================

async function leaveWagon(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    story.player.facing = 'right';
    f.reveal = 'one';
    await story.say('Noch ein letzter Blick in den großen Spiegel …');
    await story.wait(0.8);
    f.reveal = 'two';
    story.sound('dread');
    await story.wait(1.4);
    await story.say('Da! Hinter mir! Jemand mit Mütze …');
    f.reveal = 'one';
    story.player.facing = 'front';
    await story.wait(0.7);
    await story.say('… niemand. Hier ist niemand.');
    story.player.facing = 'right';
    await story.wait(0.5);
    f.reveal = null;
    await story.say('Mein Spiegelbild ist eine Runde zu spät. Und das, was hinter mir stand, war gar nicht im Wagen.');
    await story.say('Es gibt zwei von mir.');
    story.note('Im großen Spiegel stand für einen Augenblick jemand hinter mir – mit meiner Mütze. Als ich mich umdrehte, war niemand da. Es gibt zwei von mir.');
    story.sound('door');
    await finishWagon(story, {
      number: 9,
      title: 'Ende von Wagen 9',
      lines: ['„Es gibt zwei von mir.“'],
      nextTitle: 'im Lautsprecherwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.leversDone) {
    if (!f.pullCount) return { id: 'pull', lines: ['An der Stirnwand sind zwei Hebel. Was passiert, wenn ich einen ziehe?', 'Einen der beiden Hebel an der Stirnwand ziehen und dann in den Spiegel schauen.'] };
    if (!f.scratchesRead) {
      return { id: 'scratches', lines: [
        'Rechts an der Wand sind Kratzer. Was steht da?',
        'Die Kratzer sind in Spiegelschrift. Im Spiegel gegenüber (linke Wand) kann man sie lesen.',
      ] };
    }
    if (!f.ghostSeen) {
      return { id: 'ghost', lines: [
        '„Er ist eine Runde zu spät.“ Was macht mein Spiegelbild in der nächsten Runde?',
        'Einen Hebel ziehen, dann bis nach dem nächsten Tunnel warten (z. B. auf dem Teppich) und genau zur selben Zeit die Hebel beobachten.',
      ] };
    }
    return { id: 'both', lines: [
      'Das Spiegelbild zieht in der nächsten Runde den ANDEREN Hebel – genau in dem Augenblick, in dem ich in der Runde davor gezogen habe.',
      'In einer Runde den rechten Hebel ziehen und merken, wann. Nach dem Tunnel rechtzeitig wieder am rechten Hebel stehen: Wenn der linke von allein runtergeht, sofort rechts ziehen.',
    ] };
  }
  if (!f.eyeLit) {
    return { id: 'beam', lines: [
      'Die Standspiegel lassen sich jetzt drehen. Der Lichtstrahl soll ins Glasauge der Tür.',
      'Vom Licht aus: A schickt den Strahl nach links zu B, B nach oben zu C, C nach rechts zu D, D nach oben ins Auge.',
      'A und B wie „\\“, C und D wie „/“.',
    ] };
  }
  return { id: 'door', lines: ['Die Tür ist offen. Hindurchgehen.', 'Einfach durch die Tür nach vorne gehen.'] };
}
