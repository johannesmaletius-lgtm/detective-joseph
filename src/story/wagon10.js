import {
  FUSE_SLOTS, SPEEDS, TAPE_SPOTS, checkFuses, drawFuse, drawFuseBox, drawReelShelf, drawTapeDeck, fuseTokens, reelSpots, tapeCaption,
} from './art/wagon10.js';
import { finishWagon, hintFor, inTunnel, skipIntro, tunnels, waitForTunnel, wagonIntro } from './wagonCommon.js';

// ============================================================================================
//  TÜR 10 – Der Lautsprecherwagen (der Schaffner nur als Stimme)
// ============================================================================================
//
// DIE RÄTSEL
//   1. Kein Strom: Im Sicherungskasten fehlen fünf Sicherungen (in der Werkzeugkiste).
//      Dünner Draht – schwache Sicherung, dicker Draht – starke. Nach Kabeldicke einsetzen.
//   2. Das Band der Runde, in der Herr K. verschwand (Runde 108), aus dem Regal holen.
//   3. Im Tonbandgerät: Geschwindigkeit richtig einstellen (9,5 cm/s, steht am Regal) →
//      „Fahrgast K., bitte zum Tunnel …“ – und danach etwas, das rückwärts klingt.
//   4. Rückwärts abspielen → „… wie die anderen. Elf ist der Nächste.“ → 11 öffnet das Mischpult,
//      darin der Schalter für die Tür.
//
// ERGEBNIS: Der Schaffner ruft die Fahrgäste. Als Nächstes: Wagen 11.

const MIXER_CODE = '11';
const VOICE = '#a6f0b6';

export const wagon10 = {
  flags: {},
  startItems: ['flashlight'],
  recap: [
    'In jeder Runde verschwindet im Tunnel ein Fahrgast. Herr K. verschwand in Runde 108 – er ging freiwillig, als der Schaffner ihn rief.',
    'Auf dem Filmbild im Kino führt jemand mit meiner Mütze Herrn K. in den Tunnel.',
    'Im Spiegelwagen stand jemand hinter mir, der aussah wie ich. Es gibt zwei von mir.',
  ],

  async intro(story) {
    await wagonIntro(story, {
      number: 10,
      title: 'Der Lautsprecherwagen',
      lines: [
        'Trichter, Kabel, Tonbänder. Von hier kommen die Durchsagen.',
        'Von hier hat der Schaffner Herrn K. gerufen.',
      ],
    });
  },

  skipIntro: (story) => skipIntro(story),

  hotspots: {
    fuses: {
      look: (story) => story.say(story.flags.power ? 'Alle fünf Sicherungen sitzen.' : 'Ein Sicherungskasten. Fünf Fassungen – alle leer. Deshalb ist hier alles tot.'),
      use: (story) => insertFuses(story),
      items: { fuseBox: (story) => insertFuses(story) },
    },
    toolbox: {
      look: 'Eine grüne Werkzeugkiste.',
      use: async (story) => {
        if (story.flags.fusesTaken) return story.say('Nur noch Schrauben und Isolierband.');
        story.flags.fusesTaken = true;
        story.sound('drawer');
        story.give('fuseBox');
        await story.say('Ein Kästchen mit Ersatzsicherungen: zwei, sechs, zehn, sechzehn und fünfundzwanzig Ampere.');
      },
    },
    reels: {
      look: 'Ein Regal voller Tonbänder. Auf jedem steht eine Runde.',
      use: (story) => pickReel(story),
    },
    tape: {
      look: (story) => story.say(story.flags.power ? 'Ein Tonbandgerät. Geschwindigkeit, Laufrichtung, Abspielen.' : 'Ein Tonbandgerät. Ohne Strom.'),
      use: (story) => useTape(story),
      items: { reel108: (story) => useTape(story, true), reelWrong: (story) => useTape(story, true) },
    },
    mixer: {
      look: 'Ein Mischpult mit vielen Schiebereglern. Die Klappe darunter ist mit einem Vorhängeschloss gesichert.',
      use: (story) => openMixer(story),
    },
    mixerLock: { look: 'Ein Vorhängeschloss mit zwei Rädchen.', use: (story) => openMixer(story) },
    microphone: {
      look: 'Ein Mikrofon. Hier spricht der Schaffner.',
      use: (story) => story.say(story.flags.power ? 'Ich räuspere mich ins Mikrofon. Aus allen Trichtern: „Hm-hm.“ Lieber nicht.' : 'Kein Strom.'),
    },
    monitor: {
      look: (story) => story.say(story.flags.power ? 'Der Bildschirm mit dem Totenkopf. Derselbe wie im ersten Abteil.' : 'Ein Bildschirm, dunkel. Darauf ein Totenkopf – wie im ersten Abteil.'),
    },
    horn: { look: 'Ein Lautsprecher-Trichter. Von hier hört man die Durchsage in jedem Wagen.' },
    door: {
      look: (story) => story.say(story.flags.doorOpen ? 'Die Tür ist entriegelt.' : 'Die Tür nach vorne. Kein Griff, kein Schloss – sie wird von irgendwo hier aus geöffnet.'),
      use: (story) => (story.flags.doorOpen ? ending(story) : story.say('Zu. Elektrisch verriegelt.')),
    },
    window: {
      look: (story) => story.say(story.isDark ? 'Tunnel.' : 'Schnee, Wald, der Turm.'),
      use: (story) => waitForTunnel(story, 'Ich warte am Fenster auf den Tunnel …'),
    },
  },

  items: {
    reel108: { look: 'Das Tonband aus Runde 108. Die Runde, in der Herr K. verschwand.' },
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
//  1. Sicherungen
// ============================================================================================

async function insertFuses(story) {
  const f = story.flags;
  if (f.power) return story.say('Die Sicherungen sitzen.');
  if (inTunnel(story)) return story.say('Im Dunkeln stecke ich die womöglich falsch rein.');
  if (!story.has('fuseBox')) return story.say('Die Fassungen sind leer. Ich brauche Sicherungen.');
  const solved = await story.view('arrange', {
    id: 'fuses',
    title: 'Sicherungskasten',
    slots: FUSE_SLOTS,
    tokens: fuseTokens(),
    drawBackground: drawFuseBox,
    drawToken: drawFuse,
    check: checkFuses,
    help: 'Sicherungen mit gedrückter Maustaste in die Fassungen ziehen  ·  Rechtsklick: zurück',
  });
  if (!solved) {
    if (!f.fuseTip) {
      f.fuseTip = true;
      await story.say('Im Deckel steht, welche wohin gehört: dünner Draht, schwache Sicherung.');
    }
    return;
  }
  f.power = true;
  story.remove('fuseBox');
  story.sound('power');
  await story.wait(0.5);
  await story.say('Summen. Lämpchen gehen an. Der Bildschirm flackert – Strom!');
  story.note('Strom im Lautsprecherwagen: die fünf Sicherungen nach Drahtdicke eingesetzt.');
}

// ============================================================================================
//  2. Das richtige Band
// ============================================================================================

async function pickReel(story) {
  if (inTunnel(story)) return story.say('Im Dunkeln kann ich die Etiketten nicht lesen.');
  if (story.has('reel108')) return story.say('Das Band aus Runde 108 habe ich.');
  await story.view('picture', {
    draw: drawReelShelf,
    spots: reelSpots(),
    area: { x: 170, y: 110, w: 940, h: 500 },
    help: 'Klicken: Band nehmen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      if (spot.round !== 108) {
        await story.say(`Runde ${spot.round}? Was ist in dieser Runde passiert …? Ich nehme lieber das Band, auf das es ankommt.`);
        return;
      }
      story.sound('pickup');
      story.give('reel108');
      view.close(true);
      await story.say('Runde 108. Die Runde, in der Herr K. verschwand.');
    },
  });
  if (!story.flags.speedNoted) {
    story.flags.speedNoted = true;
    story.note('Am Tonband-Regal steht: Bandgeschwindigkeit 9,5 cm/s.');
  }
}

// ============================================================================================
//  3. + 4. Tonbandgerät
// ============================================================================================

async function useTape(story, inserting = false) {
  const f = story.flags;
  if (!f.power) return story.say('Ohne Strom dreht sich da gar nichts.');
  if (inTunnel(story)) return story.say('Im Dunkeln finde ich die Knöpfe nicht.');
  if (inserting && !f.reelIn) {
    f.reelIn = true;
    story.remove('reel108');
    story.sound('click');
    await story.say('Band eingelegt.');
  }
  const state = { speed: f.speed ?? 3, reverse: f.reverse ?? false, loaded: Boolean(f.reelIn), playing: false, time: 0, caption: '' };
  await story.view('picture', {
    state,
    draw: (ctx, view) => drawTapeDeck(ctx, view.state),
    spots: TAPE_SPOTS,
    area: { x: 300, y: 120, w: 680, h: 500 },
    update: (dt, view) => {
      view.state.time += dt;
    },
    help: 'Klicken: Knopf drehen, Richtung umschalten, abspielen  ·  Rechtsklick: zurück',
    onClick: async (spot, view) => {
      const s = view.state;
      if (spot.id === 'speed') {
        s.speed = (s.speed + 1) % SPEEDS.length;
        f.speed = s.speed;
        story.sound('rotate');
        return;
      }
      if (spot.id === 'direction') {
        s.reverse = !s.reverse;
        f.reverse = s.reverse;
        story.sound('click');
        return;
      }
      if (!s.loaded) return story.say('Erst ein Band einlegen.');
      s.playing = true;
      s.caption = tapeCaption(s.speed, s.reverse);
      story.sound('speaker');
      await story.wait(3.2);
      s.playing = false;
      await react(story, s);
      s.caption = '';
    },
  });
}

async function react(story, s) {
  const f = story.flags;
  if (s.speed !== 1) {
    await story.say(s.speed === 0 ? 'Viel zu langsam. Wie ein Bär im Winterschlaf.' : 'Viel zu schnell! Wie ein Eichhörnchen.');
    return;
  }
  if (!s.reverse) {
    await story.speak('Fahrgast K., bitte zum Tunnel …', { color: VOICE });
    if (!f.heardCall) {
      f.heardCall = true;
      await story.say('Die Stimme des Schaffners. Und danach … dieses Gemurmel. Das klingt, als liefe es rückwärts.');
      story.note('Band Runde 108 bei 9,5 cm/s: „Fahrgast K., bitte zum Tunnel …“ – danach Gemurmel, das rückwärts klingt.');
    }
    return;
  }
  await story.speak('… wie die anderen. Elf ist der Nächste.', { color: VOICE });
  if (!f.heardSecret) {
    f.heardSecret = true;
    await story.say('„Elf ist der Nächste.“ Das hat er nicht laut gesagt. Er hat es rückwärts aufs Band gesprochen.');
    await story.say('Der Schaffner ruft die Fahrgäste. Und als Nächstes Wagen elf?');
    story.note('Rückwärts: „… wie die anderen. Elf ist der Nächste.“ Der Schaffner ruft die Fahrgäste – als Nächstes Wagen 11.');
  }
}

// ============================================================================================
//  Mischpult, Tür und Ende
// ============================================================================================

async function openMixer(story) {
  const f = story.flags;
  if (f.doorOpen) return story.say('Der Türschalter steht auf „Auf“.');
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich die Zahlen nicht.');
  if (f.mixerOpen) return flipDoor(story);
  let tries = 0;
  const opened = await story.codeLock({
    id: 'mixer10',
    digits: 2,
    style: 'steel',
    check: (code) => {
      tries += 1;
      return code === MIXER_CODE;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(f.heardSecret ? 'Falsch. „Elf ist der Nächste“ …' : 'Falsch. Zwei Ziffern.');
    return;
  }
  f.mixerOpen = true;
  story.sound('unlock');
  await story.say('Elf. Die Klappe ist auf.');
  await flipDoor(story);
}

async function flipDoor(story) {
  if (!story.flags.power) return story.say('Ein Schalter: „Tür“. Aber ohne Strom tut er nichts.');
  story.flags.doorOpen = true;
  story.sound('latch');
  await story.say('Ein Kippschalter: „Tür“. Klack – die Tür ist entriegelt.');
}

async function ending(story) {
  await story.cutscene(async () => {
    story.sound('door');
    await story.say('Wer den Ruf hört, geht. Wie im Schlaf. So war es bei Herrn K.');
    await story.say('Und als Nächstes ist Wagen elf dran. Diesmal komme ich nicht zu spät.');
    await finishWagon(story, {
      title: 'Ende von Wagen 10',
      lines: ['Der Schaffner ruft die Fahrgäste. Rückwärts auf dem Band: „Elf ist der Nächste.“'],
      nextTitle: 'im Uhrenwagen',
    });
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.power) {
    if (!story.has('fuseBox')) return { id: 'fusesFind', lines: ['Hier ist alles ohne Strom. Im Sicherungskasten fehlen die Sicherungen – vielleicht in der Werkzeugkiste?'] };
    return { id: 'fuses', lines: [
      'Die Sicherungen nach der Dicke der Kabel einsetzen: dünner Draht, schwache Sicherung.',
      'Von oben nach unten: 16 A, 6 A, 25 A, 2 A, 10 A.',
    ] };
  }
  if (!f.reelIn && !story.has('reel108')) return { id: 'reel', lines: ['Im Regal liegt für jede Runde ein Band. Herr K. verschwand in Runde 108.'] };
  if (!f.reelIn) return { id: 'insert', lines: ['Das Band ins Tonbandgerät: Band im Inventar anklicken, dann das Tonbandgerät.'] };
  if (!f.heardCall) return { id: 'speed', lines: ['Die Geschwindigkeit muss stimmen. Am Regal steht sie: 9,5 cm/s.'] };
  if (!f.heardSecret) return { id: 'reverse', lines: ['Das Gemurmel am Ende klingt rückwärts. Den Schalter auf „RÜCK“ stellen und noch einmal abspielen.'] };
  if (!f.doorOpen) return { id: 'mixer', lines: ['„Elf ist der Nächste.“ Das Mischpult hat ein Schloss mit zwei Rädchen: 1 und 1.'] };
  return { id: 'door', lines: ['Die Tür ist entriegelt.'] };
}
