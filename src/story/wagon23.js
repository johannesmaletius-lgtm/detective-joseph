import { drawPicture } from './art/common.js';
import { DARK_JUNCTION } from '../scene/serviceTunnel.js';
import { finishWagon, hintFor, skipIntro, tunnels, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 23 – Der Wartungsgang im Tunnel, mit Herrn Tick
// ============================================================================================
//
// DIE RÄTSEL
//   1. Diesmal hört Herr Tick den Ruf und geht wie im Schlaf in den Wartungsgang. Wer ihm ohne
//      Kopfhörer (aus dem Funkraum) folgt, gerät selbst in den Bann → Kopfhörer aufsetzen.
//   2. Der dunkle Gang verzweigt sich. An jeder Abzweigung hat der andere Joseph ein Kreidezeichen
//      hinterlassen – die vier Zeichen vom Türschloss aus Wagen 1:
//      Laterne links = links, Tunnel = geradeaus, Laterne rechts = rechts, Turm = am Ziel (das Tor).
//      Wer falsch abbiegt, verliert Herrn Tick und muss zurück zum Anfang.
//   3. Am Gittertor fehlt ein Zahnrad: Herrn Ticks Zahnrad aus Wagen 11 („Das wirst du vorne brauchen“).
//
// ERGEBNIS: Draußen Schnee und Bahnhofslichter. Herr Tick geht hinaus, wird mit jedem Schritt älter
// und lächelt: „Danke, Junge.“ Joseph versteht: Der Tunnel ist wirklich der Ausgang.

const PATH = ['archLeft', 'ahead', 'archRight', 'ahead', 'archLeft', 'archRight']; // die sechs Abzweigungen vor dem Tor
const GATE = PATH.length; // nach der letzten Abzweigung steht man vor dem Tor
const VOICE = '#a6f0b6';

export const wagon23 = {
  flags: { junction: 0 },
  startItems: ['flashlight', 'paddle', 'gear', 'headphones'],
  recap: [
    'Der andere Joseph ist der Schaffner – älter, mit Schnurrbart. „Ich bin du. Der Tunnel ist kein Ende, er ist der Ausgang. Und du holst sie mir jede Runde zurück.“',
    'Ich habe ihm gesagt, dass er lügt.',
    'Herr Tick hat mir ein Zahnrad gegeben: „Das wirst du vorne brauchen.“ Aus dem Funkraum habe ich Kopfhörer.',
    'Der Tunnel: dreiundzwanzig Ticks. Noch zwei.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 23,
      title: 'Der Wartungsgang',
      lines: ['Dreiundzwanzig Ticks Dunkelheit. Noch zwei.'],
      firstTunnelIn: 140,
    });
    await theCall(story);
  },

  async skipIntro(story) {
    skipIntro(story, 140);
    await theCall(story);
  },

  hotspots: {
    tick: {
      look: 'Herr Tick. Er geht wie im Schlaf. Seine Augen sind offen, aber er sieht nichts.',
      use: async (story) => {
        await story.say('Herr Tick! Hören Sie mich?');
        await story.speakAs('tick', '… nach Hause … ich komme …');
      },
    },
    chalk: {
      look: (story) => story.say(signLine(story)),
      use: (story) => story.say(signLine(story)),
      items: { flashlight: (story) => lightChalk(story) },
    },
    archLeft: { look: 'Ein dunkler Seitengang nach links.', use: (story) => go(story, 'archLeft') },
    archRight: { look: 'Ein dunkler Seitengang nach rechts.', use: (story) => go(story, 'archRight') },
    ahead: { look: 'Der Hauptgang führt weiter geradeaus.', use: (story) => go(story, 'ahead') },
    lamps: { look: 'Tunnellampen, in festen Abständen. Wie auf den Filmbildern im Kino.' },
    gate: {
      look: (story) => story.say(story.flags.junction >= GATE ? 'Ein Gittertor. Dahinter – Schnee? Im Mechanismus fehlt ein Zahnrad.' : 'Ganz hinten ein Gittertor. Aber dazwischen liegen noch Abzweigungen.'),
      use: (story) => (story.flags.junction >= GATE ? story.say('Es klemmt. Im Mechanismus fehlt ein Zahnrad.') : go(story, 'ahead')),
      items: { gear: (story) => insertGear(story) },
    },
    gearGap: {
      look: 'Eine leere Achse. Hier fehlt ein Zahnrad.',
      use: (story) => story.say('Hier gehört ein Zahnrad hin.'),
      items: { gear: (story) => insertGear(story) },
    },
  },

  items: {
    headphones: {
      look: (story) => putOnHeadphones(story),
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  onTunnel(story, inside) {
    if (inside) story.flags.tunnels = tunnels(story) + 1;
  },
};

// ============================================================================================
//  Der Ruf und die Kopfhörer
// ============================================================================================

async function theCall(story) {
  const f = story.flags;
  // Herr Tick kommt von vorne rechts und geht wie im Schlaf an Joseph vorbei in den Gang
  const tick = story.character('tick');
  const spot = [tick.data.x, tick.data.y];
  tick.moveTo(1190, 716, 0);
  f.tickHere = true;
  await story.cutscene(async () => {
    story.sound('speaker');
    const walking = tick.moveTo(...spot, 4.2);
    await story.speak('… Fahrgast Tick … bitte zum Tunnel …', { at: { x: 640, y: 120 }, color: VOICE });
    await story.say('Nein! Herr Tick hat den Ruf gehört. Er geht einfach los – hier in den Wartungsgang.');
    await walking;
    tick.pose = 'front';
    await story.speakAs('tick', '… ich komme …');
    await story.say('Und die Stimme … sie zieht auch an mir. Meine Füße werden schwer …');
  });
  story.note('Herr Tick hat den Ruf gehört und geht wie im Schlaf durch den Wartungsgang. Die Stimme zieht auch an mir.');
}

async function putOnHeadphones(story) {
  const f = story.flags;
  if (f.headphonesOn) return story.say('Die Kopfhörer sitzen. Ich höre nur noch Rauschen.');
  f.headphonesOn = true;
  story.sound('static');
  await story.say('Ich setze die Kopfhörer aus dem Funkraum auf. Rauschen – und die Stimme ist weg.');
  await story.say('Jetzt kann ich ihm folgen, ohne selbst einzuschlafen.');
  story.note('Kopfhörer auf: Die Stimme erreicht mich nicht mehr.');
}

// ============================================================================================
//  Die Abzweigungen
// ============================================================================================

const SIGN_WORDS = {
  archLeft: 'eine Laterne mit Pfeil nach links',
  ahead: 'ein Tunnel',
  archRight: 'eine Laterne mit Pfeil nach rechts',
};

function signLine(story) {
  const n = story.flags.junction;
  if (n >= GATE) return 'Ein Kreidezeichen: der Turm. Das Ziel?';
  if (n === DARK_JUNCTION && story.flags.chalkLit !== n) return 'Hier ist die Lampe kaputt. Die Wand ist stockdunkel – ich sehe kein Zeichen.';
  const first = n === 0 ? ' Das Zeichen vom Türschloss in Wagen 1.' : '';
  return `Ein Kreidezeichen: ${SIGN_WORDS[PATH[n]]}.${first}`;
}

async function lightChalk(story) {
  const f = story.flags;
  if (f.junction === DARK_JUNCTION) {
    f.chalkLit = f.junction;
    story.sound('click');
    await story.say('Taschenlampe an … da ist es!');
  }
  await story.say(signLine(story));
}

async function go(story, way) {
  const f = story.flags;
  if (!f.headphonesOn) {
    await story.cutscene(async () => {
      await story.say('Ich gehe ihm nach … die Stimme … so müde …');
      await story.fadeOut(1.2);
      await story.wait(0.8);
      story.player.x = 640;
      story.player.y = 680;
      f.junction = 0;
      story.fadeIn(1);
      await story.say('Wo bin ich? … Ich saß auf dem Boden. Fast wäre ich eingeschlafen. Ich brauche etwas gegen diese Stimme.');
    });
    if (!f.voiceNoted) {
      f.voiceNoted = true;
      story.note('Ohne Schutz vor der Stimme schlafe ich ein. Die Kopfhörer aus dem Funkraum!');
    }
    return;
  }
  if (f.junction >= GATE) {
    if (way === 'ahead') return story.say('Hier ist das Tor. Weiter geht es nur hindurch.');
    return story.say('Nein. Das Turmzeichen – hier ist das Ziel. Das Tor.');
  }
  if (way !== PATH[f.junction]) {
    await story.cutscene(async () => {
      await story.say('Hier entlang …');
      await story.fadeOut(0.8);
      await story.wait(0.6);
      story.player.x = 640;
      story.player.y = 680;
      f.junction = 0;
      f.chalkLit = null;
      story.fadeIn(0.8);
      await story.say('Sackgasse. Und die Lampen hingen ganz unregelmäßig. Ich habe Herrn Tick verloren – zurück zum Anfang.');
    });
    if (!f.lostNoted) {
      f.lostNoted = true;
      story.note('Im Wartungsgang falsch abgebogen und Herrn Tick verloren. Die Kreidezeichen des anderen Joseph zeigen den Weg – es sind die Zeichen vom Türschloss aus Wagen 1.');
    }
    return;
  }
  await story.cutscene(async () => {
    story.sound('footsteps');
    await story.fadeOut(0.7);
    f.junction += 1;
    story.player.x = 640;
    story.player.y = 680;
    story.player.facing = 'back';
    await story.wait(0.5);
    story.fadeIn(0.7);
    await story.say(f.junction >= GATE ? 'Da vorne ist Herr Tick – am Gittertor! Und an der Wand: wieder ein Zeichen.'
      : f.junction === DARK_JUNCTION ? 'Herr Tick ist noch vor mir. Hier ist es dunkel – die Lampe an dieser Abzweigung ist kaputt.'
        : 'Herr Tick ist noch vor mir. Die nächste Abzweigung. Wieder ein Zeichen an der Wand.');
  });
}

// ============================================================================================
//  Das Tor
// ============================================================================================

async function insertGear(story) {
  const f = story.flags;
  if (f.junction < GATE) return story.say('So weit bin ich noch nicht.');
  f.gearIn = true;
  story.remove('gear');
  story.sound('click');
  await story.cutscene(async () => {
    await story.say('„Das wirst du vorne brauchen.“ Herrn Ticks Zahnrad. Es passt genau.');
    story.sound('chain');
    for (let i = 0; i < 30; i++) {
      f.gearTurn = (f.gearTurn ?? 0) + 0.1;
      await story.wait(0.04);
    }
    story.sound('creak');
    await story.say('Die Zahnräder greifen ineinander – das Gitter hebt sich!');
    await story.fadeOut(1.2);
    await story.card({ draw: drawExit });
    await story.say('Schnee. Ein Feld. Und weit hinten die Lichter eines Bahnhofs.');
    await story.speakAs('tick', 'Ach … wie die Luft riecht. Nach Schnee.');
    await story.say('Herr Tick geht hinaus. Mit jedem Schritt wird er ein bisschen älter. Sein Rücken krümmt sich, seine Haare werden weiß. Er bekommt seine Jahre zurück.');
    await story.speakAs('tick', 'Jetzt weiß ich es wieder. Meine Tochter. Sie wartet am Bahnsteig. Sie hat immer gewartet.');
    await story.say('Weit hinten, über dem Bahnhof, leuchtet eine Uhr. Dreiundzwanzig Uhr siebenundvierzig.');
    await story.speakAs('tick', 'Danke, Junge.');
    await story.say('Er lächelt. Und dann ist er zwischen den Schneeflocken verschwunden.');
    await story.say('Der Tunnel ist wirklich der Ausgang. Ich habe niemanden gerettet. Ich habe sie festgehalten.');
    await story.say('Und die anderen sitzen noch im Zug.');
    story.note('Hinter dem Tor: Schnee und die Lichter eines Bahnhofs. Herr Tick ging hinaus, wurde mit jedem Schritt älter – er bekam seine Jahre zurück – und erinnerte sich: Seine Tochter wartet am Bahnsteig. Die Bahnhofsuhr zeigte 23:47. „Danke, Junge.“ Der Tunnel ist der Ausgang. Ich habe niemanden gerettet – ich habe sie festgehalten. Die anderen sitzen noch im Zug.');
    // Am Tor steckt ein Brief des anderen Joseph: warum es am Ende Weiche 7 braucht
    story.sound('paper');
    await story.card({
      kind: 'paper',
      lines: [
        'Joseph. Jetzt hast du es gesehen. Der Tunnel ist der Ausgang.',
        'Aber nicht für jeden. Wer ruft, muss bleiben – die Nacht lässt den nicht gehen, der die anderen hinausschickt. Deshalb bin ich noch hier.',
        'Wenn alle draußen sind, bleiben nur wir zwei. Dann muss der Zug selbst aus dem Ring: Weiche 7. Danach fährt hier nie wieder einer im Kreis, und die Nacht holt niemanden mehr.',
        'Allein habe ich es hundertmal versucht. Sie springt nur um, wenn vorne und hinten gleichzeitig gezogen wird.',
        'Morgen. Ruf sie hinaus. Dann der rote Hebel. Bei 24,7.',
      ],
      signature: '– J.',
    });
    story.note('Brief am Tor, in meiner Schrift: „Wer ruft, muss bleiben.“ Wenn alle draußen sind, bleiben nur er und ich. Dann muss der Zug selbst aus dem Ring – Weiche 7, vorne in der Lok und hinten am roten Hebel gleichzeitig. Danach holt die Nacht niemanden mehr. „Morgen. Ruf sie hinaus. Bei 24,7.“');
    await finishWagon(story, {
      number: 23,
      title: 'Ende von Wagen 23',
      lines: ['Herr Tick ist hinausgegangen: „Danke, Junge.“', 'Der Tunnel ist wirklich der Ausgang – aber die anderen sitzen noch im Zug.'],
      nextTitle: 'an Heiligabend',
    });
  });
}

function drawExit(ctx) {
  drawPicture(ctx, 'assets/photos/ausgang.webp', 0, 0, 1280, 720);
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.headphonesOn) return { id: 'phones', lines: ['Die Stimme im Tunnel zieht an mir. Ich muss sie irgendwie ausblenden.', 'Die Stimme zieht auch an mir. Etwas, das die Ohren zuhält … die Kopfhörer aus dem Funkraum (Rechtsklick im Inventar).'] };
  if (f.junction < GATE) {
    return { id: 'maze', lines: [
      'An jeder Abzweigung ist ein Kreidezeichen an der linken Wand – die Zeichen vom Türschloss aus Wagen 1.',
      'Laterne links: links abbiegen. Tunnel: geradeaus. Laterne rechts: rechts abbiegen. Wo die Lampe kaputt ist: Taschenlampe auf die Wand.',
      'Der ganze Weg: links, geradeaus, rechts, geradeaus, links, rechts.',
    ] };
  }
  return { id: 'gear', lines: ['Das Gittertor hat einen Zahnradmechanismus. Fehlt da etwas?', 'Im Tor fehlt ein Zahnrad. Herrn Ticks Zahnrad im Inventar anklicken, dann die leere Achse.'] };
}
