import { WAGONS } from './wagons.js';

// Helfer, die die Wagen 4 bis 8 benutzen (die Wagen 2 und 3 nutzen common.js): Tunnel zählen, Zahlwörter, Anfang und Ende eines
// Wagens, auf den Tunnel warten, Tipps.

const NUMBERS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];

// "sieben" / "Sieben"
export function word(count, capital = false) {
  const text = NUMBERS[count] ?? String(count);
  return capital ? text[0].toUpperCase() + text.slice(1) : text;
}

// Wie viele Tunnel Joseph in diesem Wagen schon erlebt hat
export function tunnels(story) {
  return story.flags.tunnels ?? 0;
}

// Ist es dunkel – oder wird es das gerade?
export function inTunnel(story) {
  return story.isDark || story.motion.inTunnel;
}

// Merker für "passiert vor so vielen Tunneln": speichert Tunnel bis dahin + 1
export function stamp(story) {
  return tunnels(story) + 1;
}

export function tunnelsSince(story, flag) {
  return story.flags[flag] ? tunnels(story) + 1 - story.flags[flag] : -1;
}

// Der Anfang eines Wagens: Titelbild, dann wird es hell und Joseph sagt etwas
export async function wagonIntro(story, { number, title, lines = [], firstTunnelIn = 70 }) {
  story.game.overlay.fade = 1;
  await story.cutscene(async () => {
    await story.card({ kind: 'title', title: `Wagen ${number}`, subtitle: title, continueText: 'Klicken zum Starten' });
    story.motion.restartAt(story.motion.lapLength - story.motion.settings.tunnel.length / 2 - firstTunnelIn);
    story.player.facing = story.scene.data.playerStart.facing ?? 'back';
    await story.wait(0.4);
    story.fadeIn(1.8);
    await story.wait(1.2);
    for (const line of lines) await story.say(line);
  });
  story.flags.startedAt = performance.now();
}

// Mit ?skipintro: gleich hell
export function skipIntro(story, firstTunnelIn = 70) {
  story.motion.restartAt(story.motion.lapLength - story.motion.settings.tunnel.length / 2 - firstTunnelIn);
  story.flags.startedAt = performance.now();
}

// Joseph setzt sich und wartet auf den nächsten Tunnel (wie auf der Bank im ersten Abteil)
export async function waitForTunnel(story, line = 'Ich warte kurz auf den Tunnel. Aber nicht einschlafen …') {
  if (inTunnel(story) || story.motion.tunnelAhead < 12) {
    await story.say('Gleich kommt der Tunnel. Jetzt warte ich nicht.');
    return;
  }
  await story.cutscene(async () => {
    await story.say(line);
    await story.fadeOut(1.1);
    story.motion.skipToTunnel(6);
    await story.wait(0.7);
    story.fadeIn(1.1);
    await story.say('Hm?! … Wach bleiben, Joseph. Da kommt der Tunnel.');
  });
}

// Tipps: erst ein Schubs, dann immer deutlicher. goal = { id, lines }
export function hintFor(story, goal) {
  const asked = (story.flags.hintsAsked ??= {});
  const level = Math.min(asked[goal.id] ?? 0, goal.lines.length - 1);
  asked[goal.id] = level + 1;
  return goal.lines[level];
}

// Das Ende eines Wagens: abblenden, Endkarte, dann weiter in den nächsten Wagen (falls es ihn schon gibt)
export async function finishWagon(story, { number, title, lines = [], nextTitle }) {
  await story.fadeOut(1.6);
  const minutes = Math.max(1, Math.round((performance.now() - (story.flags.startedAt ?? performance.now())) / 60000));
  const next = WAGONS[number + 1];
  await story.card({
    kind: 'end',
    title,
    lines: [...lines, `Gelöst in Runde ${story.lap} – nach ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}.`,
      next ? '' : `Weiter geht es ${nextTitle ?? 'im nächsten Wagen'} – bald.`],
    continueText: next ? `Klicken: weiter zu Wagen ${number + 1}` : 'Klicken, um zum Anfang zurückzukehren',
  });
  if (next) await story.goToWagon(number + 1);
  else location.href = location.pathname;
}
