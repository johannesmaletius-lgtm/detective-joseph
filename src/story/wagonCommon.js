import { isUnlocked, today } from '../advent/doors.js';
import { FAKE_DATE, TEST_MODE } from '../config.js';
import { loadPreview } from './previews.js';

// Helfer, die alle Wagen ab Wagen 4 benutzen: Tunnel zählen, Zahlwörter, Anfang und Ende eines
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
  story.game.overlay.fade = 0;
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
    story.game.voices.react('tired');
    await story.say(line);
    await story.fadeOut(1.1);
    story.motion.skipToTunnel(6);
    await story.wait(0.7);
    story.fadeIn(1.1);
    await story.say('Hm?! … Wach bleiben, Joseph. Da kommt der Tunnel.');
  });
}

// Tipps: zwei leichte Tipps je Rätsel, danach null (dann bietet Taste H den ganzen Lösungsweg an). goal = { id, lines }
export const TIPS_PER_GOAL = 2;
export function hintFor(story, goal) {
  const asked = (story.flags.hintsAsked ??= {});
  const level = asked[goal.id] ?? 0;
  const lines = goal.lines.filter(Boolean).slice(0, TIPS_PER_GOAL);
  if (level >= lines.length) return null;
  asked[goal.id] = level + 1;
  return lines[level];
}

// Das Ende eines Wagens: abblenden, Endkarte, dann zurück zur Wagenübersicht von Detective Joseph (der Spielstand wird gespeichert)
export async function finishWagon(story, { number, title, lines = [], nextTitle }) {
  await story.fadeOut(1.6);
  const minutes = Math.max(1, Math.round((performance.now() - (story.flags.startedAt ?? performance.now())) / 60000));
  const preview = await nextPreview(number);
  await story.card({
    kind: 'end',
    title,
    lines: [...lines, `Gelöst in Runde ${story.lap} – nach ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}.`,
      ...(number < 24 && !preview ? [nextLine(number, nextTitle)] : [])],
    preview,
    continueText: 'Klicken – zurück zu Detective Joseph',
  });
  story.finish();
}

// Vorschau auf den nächsten Wagen (dunkler Bildausschnitt + Satz, siehe previews.js); nach Tür 24 keine.
// „Morgen:“ nur, wenn die nächste Tür wirklich erst morgen aufgeht.
export async function nextPreview(number) {
  const preview = number < 24 ? await loadPreview(number) : null;
  if (!preview) return null;
  const open = isUnlocked(number + 1, today(FAKE_DATE), TEST_MODE);
  return { ...preview, label: open ? 'Als Nächstes' : 'Morgen' };
}

// Schlusszeile der Endkarte: „Morgen …“ nur, wenn die nächste Tür wirklich erst morgen aufgeht
export function nextLine(number, nextTitle = 'im nächsten Wagen') {
  return isUnlocked(number + 1, today(FAKE_DATE), TEST_MODE)
    ? `Die nächste Tür ist schon offen – weiter geht es ${nextTitle}.`
    : `Morgen geht es weiter – ${nextTitle}.`;
}

// Ein Zahlen- oder Buchstabenschloss öffnen. Ergebnis: true, wenn es aufgeht.
//   await tryCode(story, { id: 'door9', code: '2341', digits: 4, wrong: 'Falsch.' })
export async function tryCode(story, { id, code, digits = code.length, style, alphabet, symbols, dark = 'Im Dunkeln sehe ich nichts.', wrong = 'Falsch.' }) {
  if (inTunnel(story)) {
    await story.say(dark);
    return false;
  }
  let tries = 0;
  const opened = await story.codeLock({
    id, digits, style, alphabet, symbols,
    check: (value) => {
      tries += 1;
      return value === code;
    },
  });
  if (!opened && tries > 0 && !inTunnel(story)) {
    story.sound('wrong');
    await story.say(typeof wrong === 'function' ? wrong(story) : wrong);
  }
  return opened;
}

// Wo der Zug in der Runde ist: 0 = gerade aus dem Tunnel heraus, 1 = gleich wieder hinein
export function roundProgress(story) {
  const motion = story.motion;
  const half = motion.settings.tunnel.length / 2;
  return Math.min(1, Math.max(0, (motion.lapTime - half) / (motion.lapLength - 2 * half)));
}

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
