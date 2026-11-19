import { SPEAKER_VOICE } from '../scene/conductorCar.js';
import { drawCircleTimetable } from '../ui/cards3.js';
import { VOICES, WINDOW_ITEMS, finishWagon, hintFor, inTunnel, lookOutside, packFor, tunnels, waitForTunnel } from './common.js';

// ============================================================================================
//  WAGEN 6 – Das Schaffnerabteil
// ============================================================================================
//
// Das letzte Abteil des Zuges. Herr Brandt ist nicht hier – er sitzt vorne im Speisewagen und spricht
// über die Sprechanlage. Auf dem Fahrplan ist die Ringbahn ein Kreis, jeder Halt um 23:59.
//
// DAS ZIEL: Den Zug im Tunnel an Weiche 7 anhalten und aussteigen (Tür „Ende des Zuges“).
//
// DIE RÄTSEL:
//   1. Über die Sprechanlage Brandt fragen: Raus aus dem Kreis geht es nur über Weiche 7 im Tunnel.
//      Der Weichenschlüssel hängt im Schlüsselkasten.
//   2. Code des Schlüsselkastens: „Mein Platz. Mein Tisch. Und was mir jede Runde ins Glas gekippt wird.“
//      → Platz 2, Tisch 4, Probe 41 → 2 4 4 1. Darin: der Weichenschlüssel „W7“.
//   3. Weichenschlüssel ins Stellpult. Die Weichen 3, 5 und 9 so stellen, dass die Strecke ab Weiche 7 zur
//      AUSFAHRT führt (W3 geradeaus, W5 und W9 abbiegen). Weiche 7 selbst ist eine Handweiche mit Rückfall.
//   4. Durchsage an den ganzen Zug: Der andere Joseph soll zu Weiche 7 kommen.
//   5. Notbremse im Tunnel ziehen → der Zug hält, die Tür geht auf.
// Nach jedem Tunnel ist der Schlüsselkasten wieder zu (der Schlüssel bleibt in der Tasche).

const KEYBOX_CODE = '2441';

export const wagon6 = {
  flags: {},

  prepare(story) {
    story.note('Im Speisewagen saß Herr Brandt, der Schaffner, an Tisch 4 auf Platz 2. In seinem Rotwein: Probe 41 – Gift.');
    story.note('Im Postwagen lag eine ANLEITUNG: Den Kreis verlässt man nur im Tunnel an Weiche 7. Notbremse ziehen, dann die Weiche umstellen. Sie springt zurück, sobald man loslässt. Allein geht es nicht.');
  },

  setup(story) {
    const f = story.flags;
    f.startedAt = performance.now();
    f.brakeLit = true;
    f.packed = packFor(story, ['flashlight', 'vierkant', 'photo']);
  },

  async intro(story) {
    await arrive(story);
  },

  async skipIntro(story) {
    story.game.overlay.fade = 0;
    await arrive(story, { quick: true });
  },

  // ---------------------------------------------------------------- Anklickbare Stellen
  hotspots: {
    intercom: {
      look: 'Die Sprechanlage: ein Kasten mit drei Knöpfen und ein Mikrofon am Schwanenhals.',
      use: (story) => talkToBrandt(story),
      items: { other: 'Das kann ich nicht durchs Mikrofon schicken.' },
    },
    speaker: { look: 'Der Lautsprecher der Sprechanlage. Daher kommt Brandts Stimme.' },

    desk: {
      look: 'Das Schaffnerpult. Papiere, ein Stempel, die Sprechanlage.',
      use: async (story) => {
        story.sound('paper');
        await story.say('Der Dienstplan: „Brandt – jede Runde. Ruhetag: keiner.“');
        await story.say('Der arme Mann.');
      },
    },

    chair: {
      look: 'Brandts Stuhl. Durchgesessen.',
      use: (story) => waitForTunnel(story, { sit: 'Ich setz mich kurz auf Brandts Stuhl und warte auf den Tunnel. Nicht einschlafen …' }),
    },

    keybox: {
      look: (story) => (story.flags.keyboxOpen
        ? story.say(story.flags.keyTaken ? 'Der Schlüsselkasten. Ein paar kleine Schlüssel – der große fehlt, den habe ich.' : 'Offen. Ganz rechts hängt ein großer Schlüssel mit rotem Anhänger.')
        : story.say('Der Schlüsselkasten. Ein Zahlenschloss mit vier Rädchen.')),
      use: (story) => openKeybox(story),
      items: {
        vierkant: 'Kein Vierkantschloss. Ein Zahlenschloss.',
        other: 'Damit bekomme ich den Kasten nicht auf.',
      },
    },

    timetable: {
      look: (story) => readTimetable(story),
      use: (story) => readTimetable(story),
    },

    clock: { look: 'Die Dienstuhr zeigt 23:59. Der Minutenzeiger zittert – aber er kommt nie auf die Zwölf.' },

    panel: {
      look: 'Das Stellpult. Ein Gleisbild der Ringbahn, ein paar Hebel und ein Schlüsselschalter.',
      use: (story) => usePanel(story),
      items: {
        switchKey: (story) => usePanel(story, { withKey: true }),
        vierkant: 'Kein Vierkant. In den Schlüsselschalter gehört ein Bartschlüssel.',
        other: 'Das passt nicht in den Schlüsselschalter.',
      },
    },

    coat: {
      look: 'Brandts Mantel, seine Mütze und eine rote Handlaterne.',
      use: async (story) => {
        await story.say('In der Manteltasche: eine Fahrkarte. Gestempelt für … „jede Runde“.');
        await story.say('Der Schaffner hat eine Dauerkarte. Natürlich.');
      },
    },

    brake: {
      look: 'Die Notbremse. „Missbrauch wird bestraft.“ Das kleine Schild leuchtet sogar im Dunkeln.',
      use: (story) => pullBrake(story),
      items: { other: 'Die Notbremse zieht man mit der Hand.' },
    },

    door: {
      look: 'Ende des Zuges. „Ausstieg nur bei Halt.“ Dahinter: die Gleise, auf denen wir gekommen sind. Und kommen werden.',
      use: (story) => (story.flags.doorOpen ? leave(story) : story.say('Der Zug fährt. Hier steige ich nicht aus.')),
      items: {
        vierkant: 'Die Tür ist nicht abgeschlossen. Sie geht nur auf, wenn der Zug steht.',
        other: 'Die Tür geht nur auf, wenn der Zug steht.',
      },
    },

    window: {
      look: (story) => lookOutside(story),
      use: 'Die Fenster lassen sich nicht öffnen.',
      items: WINDOW_ITEMS,
    },
  },

  hint: (story) => hintFor(story, currentGoal(story)),

  // ---------------------------------------------------------------- Tunnel
  async onTunnel(story, inside) {
    const f = story.flags;
    if (f.brakePulled) return;
    if (inside) {
      f.tunnels = tunnels(story) + 1;
      story.game.closeViewsInDark();
      await story.idle();
      if (!inTunnel(story) || f.waitingForBrake || f.brakePulled) return;
      if (!f.darkNoted) {
        f.darkNoted = true;
        await story.say('Licht aus. Nur das Schild an der Notbremse leuchtet.');
      }
      return;
    }
    const changed = f.keyboxOpen;
    f.keyboxOpen = false;
    await story.idle();
    if (changed && !f.resetNoted) {
      f.resetNoted = true;
      await story.say('Der Schlüsselkasten ist wieder zu. Der Schlüssel ist aber noch in meiner Tasche.');
    }
  },
};

function brandt(story, text) {
  story.sound('speaker');
  return story.speak(text, { at: SPEAKER_VOICE });
}

function stranger(story, text) {
  story.sound('speaker');
  return story.speak(text, { at: SPEAKER_VOICE, color: VOICES.stranger });
}

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('door');
      story.fadeIn(1.6);
      await story.wait(1.4);
      await story.say('Das Schaffnerabteil. Das letzte Abteil des Zuges.');
      await story.say('… Und niemand da.');
      await brandt(story, 'Willkommen in meinem Abteil, Herr Joseph! Ich selbst sitze vorne im Speisewagen – an Tisch vier, wie jede Runde.');
      await brandt(story, 'Wenn Sie etwas brauchen: Die Sprechanlage steht auf dem Pult.');
    });
  }
  story.note('Schaffnerabteil: das letzte Abteil. Brandt ist im Speisewagen und spricht über die Sprechanlage auf dem Pult. Hinten: Tür „Ende des Zuges – Ausstieg nur bei Halt“ und die Notbremse.');
}

// ============================================================================================
//  Sprechanlage
// ============================================================================================

async function talkToBrandt(story) {
  const f = story.flags;
  story.sound('latch');
  const asked = (f.asked ??= {});
  for (;;) {
    const options = [{ id: 'exit', text: 'Wie komme ich aus dem Kreis heraus?' }];
    if (asked.exit) options.push({ id: 'code', text: 'Wie geht der Schlüsselkasten auf?' });
    options.push({ id: 'other', text: 'Kennen Sie den anderen Joseph?' });
    if (f.routeSolved && !f.announced) options.push({ id: 'announce', text: 'Kann ich eine Durchsage machen – an den ganzen Zug?' });
    options.push({ id: 'bye', text: 'Auf Wiederhören.' });
    const index = await story.choose(options.map((o) => ({ text: o.text, used: asked[o.id] })), 'Sprechanlage');
    const choice = options[index]?.id;
    if (!choice || choice === 'bye') {
      if (choice) await brandt(story, 'Gute Fahrt, Herr Joseph.');
      return;
    }
    asked[choice] = true;
    await story.say(options[index].text);
    if (choice === 'exit') {
      await brandt(story, 'Raus? Aus dem Kreis? … Es gibt eine Weiche. Weiche 7, mitten im Tunnel. Gesperrt seit Runde 1.');
      await brandt(story, 'Der Weichenschlüssel hängt im Schlüsselkasten. Und am Stellpult sehen Sie, wohin die Strecke führt.');
      if (!f.exitInfo) {
        f.exitInfo = true;
        story.note('Brandt: Aus dem Kreis kommt man nur über Weiche 7 im Tunnel. Der Weichenschlüssel hängt im Schlüsselkasten, am Stellpult sieht man die Strecke.');
      }
    } else if (choice === 'code') {
      await brandt(story, 'Vier Ziffern. Die kennt jeder, der mit mir an Tisch vier gesessen hat.');
      await brandt(story, 'Mein Platz. Mein Tisch. Und was mir jede Runde in den Rotwein gekippt wird.');
      await story.say('Sein Platz, sein Tisch … und das Gift.');
      if (!f.codeHint) {
        f.codeHint = true;
        story.note('Code für den Schlüsselkasten (vier Ziffern): Brandts Platz, sein Tisch und was in seinem Glas war.');
      }
    } else if (choice === 'other') {
      await brandt(story, 'Er fährt schwarz, seit Runde 7. Jede Runde kippt er mir etwas ins Glas – und jede Runde retten Sie mich.');
      await brandt(story, 'Ich glaube, er wollte nur, dass Sie meinen Vierkant bekommen. Ein seltsamer Mensch. Ein bisschen wie Sie.');
    } else {
      await brandt(story, 'Der grüne Knopf. Dann hört Sie der ganze Zug.');
      await announce(story);
      return;
    }
  }
}

async function announce(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    story.sound('power');
    await story.wait(0.6);
    await story.say('Achtung, Achtung. Hier spricht Joseph. Der Joseph, der schläft.');
    await story.say('An den anderen Joseph: Ich weiß, wie es geht. Weiche 7, im Tunnel. Ich halte den Zug dort an. Komm hin.');
    await story.wait(1.4);
    await stranger(story, '… Ich habe es hundertmal versucht. Der Hebel springt zurück. Einer bleibt immer im Dunkeln.');
    await story.say('Diesmal nicht. Diesmal sind wir zwei.');
    await story.wait(0.8);
    await stranger(story, '… Weiche 7. Ich warte.');
    f.announced = true;
    story.note('Durchsage: Der andere Joseph wartet an Weiche 7 im Tunnel. Er sagt: Der Hebel springt zurück, einer bleibt immer im Dunkeln.');
  });
}

// ============================================================================================
//  Schlüsselkasten, Fahrplan, Stellpult
// ============================================================================================

async function openKeybox(story) {
  const f = story.flags;
  if (f.keyboxOpen) return takeKey(story);
  if (inTunnel(story) && !story.has('flashlight')) return story.say('Im Dunkeln sehe ich die Rädchen nicht.');
  let tries = 0;
  const opened = await story.codeLock({
    id: 'keybox',
    digits: 4,
    style: 'brass',
    check: (code) => {
      tries += 1;
      return code === KEYBOX_CODE;
    },
  });
  if (!opened) {
    if (tries > 0) await story.say(f.codeHint ? 'Falsch. Sein Platz, sein Tisch, und was in seinem Glas war …' : 'Falsch. Vier Ziffern – Brandt weiß sie bestimmt.');
    return;
  }
  f.keyboxOpen = true;
  story.sound('creak');
  await story.say('Auf!');
  await takeKey(story);
}

async function takeKey(story) {
  const f = story.flags;
  if (f.keyTaken) return story.say('Kleine Schlüssel für Abteile und Toiletten. Den großen habe ich schon.');
  f.keyTaken = true;
  story.give('switchKey');
  await story.say('Ein schwerer Bartschlüssel mit rotem Anhänger: „W7 – Handweiche im Tunnel“.');
  story.note('Im Schlüsselkasten (Code 2441): der Weichenschlüssel „W7“.');
}

async function readTimetable(story) {
  const f = story.flags;
  story.sound('paper');
  await story.card({ draw: drawCircleTimetable });
  if (f.timetableRead) return;
  f.timetableRead = true;
  await story.say('Ein Fahrplan wie ein Ziffernblatt. Jeder Halt heißt Ringbahnhof. Jede Abfahrt: 23:59.');
  await story.say('Und oben, im Tunnel: Weiche 7. Ein Abzweig nach draußen. Gesperrt seit Runde 1.');
  story.note('Fahrplan: Die Ringbahn ist ein Kreis, jeder Halt „Ringbahnhof, 23:59“. Im Tunnel zweigt bei Weiche 7 eine Strecke nach draußen ab – gesperrt seit Runde 1.');
}

async function usePanel(story, { withKey = false } = {}) {
  const f = story.flags;
  if (inTunnel(story)) return story.say('Im Dunkeln sehe ich auf dem Gleisbild nichts.');
  if (!f.panelUnlocked) {
    if (!withKey) return story.say('Der Schlüsselschalter ist zu. Ohne Schlüssel rührt sich hier nichts.');
    f.panelUnlocked = true;
    story.sound('key');
    await story.wait(0.5);
    story.sound('power');
    await story.say('Der Weichenschlüssel passt. Das Gleisbild leuchtet auf.');
  }
  if (f.routeSolved) return story.say('Die Fahrstraße ist gestellt. Bis auf Weiche 7 – die muss ich im Tunnel selbst umlegen.');
  const solved = await story.view('switchboard');
  if (!solved) return;
  f.routeSolved = true;
  await story.say('Die Strecke ist frei – bis zur Ausfahrt. Nur Weiche 7 nicht: Handweiche. Mit Rückfall.');
  await story.say('Rückfall … Sie springt also zurück, sobald man loslässt. Wie in der Anleitung.');
  story.note('Stellpult: Weichen 3, 5 und 9 stehen auf Ausfahrt. Weiche 7 ist eine Handweiche mit Rückfall – sie muss im Tunnel vor Ort umgelegt werden und springt zurück, sobald man loslässt.');
}

// ============================================================================================
//  Notbremse und Tür
// ============================================================================================

function missing(story) {
  const f = story.flags;
  if (!f.keyTaken) return 'Ohne den Weichenschlüssel nützt mir ein Halt im Tunnel nichts.';
  if (!f.routeSolved) return 'Erst will ich am Stellpult sehen, wohin Weiche 7 überhaupt führt.';
  if (!f.announced) return 'Und er? Er muss wissen, dass ich komme. Erst eine Durchsage.';
  return null;
}

async function pullBrake(story) {
  const f = story.flags;
  if (f.brakePulled) return story.say('Der Zug steht schon.');
  const reason = missing(story);
  if (reason) {
    await story.say(f.exitInfo ? 'Noch nicht.' : 'Die Notbremse? Und dann? Mitten im Wald stehen bleiben?');
    if (f.exitInfo) await story.say(reason);
    return;
  }
  if (!inTunnel(story)) {
    await story.cutscene(async () => {
      f.waitingForBrake = true;
      await story.say('Halten muss der Zug im Tunnel – an Weiche 7. Ich warte hier, die Hand am Griff.');
      if (story.motion.tunnelAhead > 3) {
        await story.fadeOut(1);
        story.motion.skipToTunnel(1.5);
        await story.wait(0.5);
        story.fadeIn(1);
      }
      for (let i = 0; i < 80 && !story.isDark; i++) await story.wait(0.1);
      await story.say('Jetzt!');
      f.waitingForBrake = false;
    });
  }
  await stopTrain(story);
}

async function stopTrain(story) {
  const f = story.flags;
  await story.cutscene(async () => {
    f.brakePulled = true;
    story.sound('brake');
    story.motion.cruiseSpeed = 0;
    await story.wait(2.4);
    await story.say('Der Zug steht. Mitten im Tunnel.');
    await brandt(story, 'Notbremse im Schaffnerabteil?! … Ach, Sie sind das.');
    await brandt(story, 'Na dann: Gute Reise, Herr Joseph. Und grüßen Sie den anderen von mir.');
    story.sound('unlock');
    await story.wait(0.5);
    story.sound('door');
    f.doorOpen = true;
    await story.say('Die Tür am Ende des Zuges ist aufgesprungen.');
    story.note('Notbremse im Tunnel gezogen: Der Zug steht an Weiche 7, die Tür am Ende des Zuges ist offen.');
  });
  await leave(story);
}

async function leave(story) {
  await story.cutscene(async () => {
    await story.walkTo(640, 421, 'back');
    await story.fadeOut(1);
  });
  await finishWagon(story, { number: 6, next: 7, nextName: 'Tunnel' });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.exitInfo) {
    return { id: 'ask', lines: [
      'Brandt spricht über die Sprechanlage. Ihn frage ich, wie man aus dem Kreis herauskommt.',
      'Linksklick auf die Sprechanlage auf dem Pult.',
    ] };
  }
  if (!f.keyTaken) {
    if (!f.codeHint) return { id: 'codeHint', lines: ['Der Weichenschlüssel hängt im Schlüsselkasten. Wie geht der auf? Brandt fragen.'] };
    return { id: 'keybox', lines: [
      'Brandts Platz, sein Tisch und was in seinem Glas war … das war alles im Speisewagen.',
      'Herr Brandt saß an Tisch 4 auf Platz 2. In seinem Glas: Probe 41.',
      'Der Code für den Schlüsselkasten: 2 – 4 – 4 – 1.',
    ] };
  }
  if (!f.routeSolved) {
    return { id: 'panel', lines: [
      'Mit dem Weichenschlüssel geht bestimmt das Stellpult an.',
      'Weichenschlüssel im Inventar anklicken, dann das Stellpult. Die Weichen so stellen, dass die Strecke zur AUSFAHRT führt.',
      'Am Stellpult: W3 geradeaus, W5 abbiegen, W9 abbiegen.',
    ] };
  }
  if (!f.announced) {
    return { id: 'announce', lines: [
      'Er soll wissen, dass ich komme. Über die Sprechanlage geht vielleicht eine Durchsage.',
      'Sprechanlage: „Kann ich eine Durchsage machen?“',
    ] };
  }
  return { id: 'brake', lines: [
    'Jetzt den Zug im Tunnel anhalten – mit der Notbremse.',
    'Linksklick auf die Notbremse. Ich warte dort auf den Tunnel.',
  ] };
}
