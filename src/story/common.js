// Kleine Helfer, die alle Wagen-Drehbücher (wagon2.js … wagon4.js) gemeinsam benutzen.

const NUMBERS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];

// "sieben" / "Sieben"
export function word(count, capital = false) {
  const text = NUMBERS[count] ?? String(count);
  return capital ? text[0].toUpperCase() + text.slice(1) : text;
}

// Ist es dunkel – oder wird es das gerade (der Zug ist schon im Tunnel, das Licht flackert noch)?
export function inTunnel(story) {
  return story.isDark || story.motion.inTunnel;
}

export function tunnels(story) {
  return story.flags.tunnels ?? 0;
}

// Sitzen und warten, bis der nächste Tunnel kommt
export async function waitForTunnel(story, { sit = 'Ich setz mich kurz und warte auf den Tunnel. Aber nicht einschlafen …' } = {}) {
  if (inTunnel(story) || story.motion.tunnelAhead < 12) {
    await story.say('Gleich kommt der Tunnel. Jetzt setz ich mich nicht hin.');
    return;
  }
  await story.cutscene(async () => {
    await story.say(sit);
    await story.fadeOut(1.2);
    story.motion.skipToTunnel(6);
    await story.wait(0.8);
    story.fadeIn(1.2);
    await story.say('Hm?! … Fast eingenickt.');
    await story.say('NICHT einschlafen, Joseph. Da vorne kommt der Tunnel.');
  });
  story.event('waited');
}

// Tipps: Jedes Ziel hat eine Liste von Sätzen – vom sanften Schubs bis zur Lösung.
// goal = { id, lines }. Wer öfter fragt, bekommt den nächsten, deutlicheren Satz.
export function hintFor(story, { id, lines }) {
  const asked = (story.flags.hintsAsked ??= {});
  const level = Math.min(asked[id] ?? 0, lines.length - 1);
  asked[id] = level + 1;
  return lines[level];
}

// Ein Fenster ansehen – in jedem Wagen ähnlich
export async function lookOutside(story) {
  if (story.isDark) return story.say('Draußen nur schwarze Tunnelwand. Und Lampen, die vorbeihuschen.');
  const looks = (story.flags.windowLooks = (story.flags.windowLooks ?? 0) + 1);
  if (looks % 3 === 1) await story.say('Wald, Schnee, Laternen. Und der Turm mit dem roten Licht – immer an derselben Stelle.');
  else if (looks % 3 === 2) await story.say('Der Mond wandert von Fenster zu Fenster. Wir fahren im Kreis. Immer noch.');
  else await story.say('Draußen ist alles wie in der letzten Runde. Und in der davor.');
}

export const WINDOW_ITEMS = {
  binoculars: (story) => (inTunnel(story)
    ? story.say('Im Tunnel sehe ich nur Wand.')
    : story.say('Der Turm blinkt immer noch sein Zeichen. Kurz, kurz, kurz, lang, lang.')),
  flashlight: 'Die Scheibe spiegelt nur.',
};

// Ende eines Wagens: Karte zeigen, dann in den nächsten Wagen
export async function finishWagon(story, { number, next, nextName }) {
  const minutes = Math.max(1, Math.round((performance.now() - (story.flags.startedAt ?? performance.now())) / 60000));
  await story.card({
    kind: 'end',
    title: `Wagen ${number} geschafft`,
    lines: [`Runde ${story.lap} – nach ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'} in diesem Wagen.`, `Weiter geht es im ${nextName}.`],
    continueText: 'Klicken zum Weiterspielen',
  });
  await story.goToWagon(next);
}

// Beim Betreten eines Wagens: Joseph behält nur, was er noch braucht (keep). Wer direkt in diesem Wagen
// anfängt (Spielstand, ?wagen=3), bekommt genau diese Sachen. Ergebnis: true, wenn etwas zurückblieb.
export function packFor(story, keep) {
  const inventory = story.game.inventory;
  const dropped = inventory.items.filter((id) => !keep.includes(id));
  for (const id of dropped) inventory.remove(id);
  for (const id of keep) inventory.add(id);
  inventory.flash = null;
  inventory.revealTime = 0;
  inventory.offset = 0;
  if (dropped.length > 0) story.game.notebook.add('Was ich nicht mehr brauche, habe ich im letzten Wagen gelassen. Was ich weiß, steht hier im Notizbuch.', story.lap);
  return dropped.length > 0;
}

// Farben für Stimmen
export const VOICES = {
  cook: '#ffb98a',
  ghost: '#bccdff',
  lady: '#f3b8e0',
  parrot: '#9df07a',
  stranger: '#ff8f8f',
};
