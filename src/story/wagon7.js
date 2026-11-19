import { OTHER } from '../scene/tunnel.js';
import { prepareOtherJoseph } from '../scene/figures.js';
import { drawDawn } from '../ui/cards3.js';
import { saveProgress } from './wagons.js';
import { VOICES, hintFor, packFor } from './common.js';

// ============================================================================================
//  WAGEN 7 – Der Tunnel (Finale)
// ============================================================================================
//
// Der Zug steht im Tunnel. Joseph ist ausgestiegen und am ganzen Zug entlang nach vorn gelaufen, bis vor
// die Lok. Dort ist Weiche 7 – und dort wartet der andere Joseph.
//
// DAS ZIEL: Den Hebel von Weiche 7 umlegen, sodass er liegen bleibt, und zusammen in den Zug steigen.
//
// DIE RÄTSEL:
//   1. Mit dem anderen Joseph reden.
//   2. Weichenschlüssel „W7“ an den Hebel → das Vorhängeschloss fällt ab.
//   3. Hebel umlegen → Signal grün. Loslassen → er springt zurück (Rückfallweiche). Idee: festbinden!
//      Joseph nimmt seinen Schal ab – aber der ist zu kurz.
//   4. Der andere Joseph glaubt nicht mehr daran. Das Foto aus Koffer Nr. 7 zeigen („Runde 1. Wir zwei.
//      Nie wieder getrennt.“) → er gibt Joseph seinen Schal.
//   5. Beide Schals verknoten und den Hebel damit festbinden → die Weiche bleibt auf Ausfahrt.
//   6. Brandts Vierkant ins Bremsventil der Lok → die Notbremse ist gelöst.
//   7. Zusammen einsteigen → der Zug fährt über Weiche 7 hinaus. Zum ersten Mal geradeaus.

export const wagon7 = {
  flags: {},

  prepare(story) {
    story.note('Im Postwagen: Der andere Joseph hielt in Runde 7 den Hebel von Weiche 7, der Hebel sprang zurück, und er blieb allein im Tunnel. Seitdem schläft er nicht mehr.');
    story.note('Im Schaffnerabteil: Weiche 7 ist eine Handweiche mit Rückfall. Ich habe den Weichenschlüssel und den Zug im Tunnel angehalten.');
  },

  setup(story) {
    const f = story.flags;
    f.startedAt = performance.now();
    f.otherHere = true;
    f.packed = packFor(story, ['flashlight', 'vierkant', 'photo', 'switchKey']);
    prepareOtherJoseph(story.player);
    // Der Zug steht im Tunnel – auch wer direkt hier anfängt (?wagen=7)
    const motion = story.motion;
    if (!motion.inTunnel) motion.continueFrom({ distance: Math.round(motion.distance / motion.lapLength) * motion.lapLength });
    motion.cruiseSpeed = 0;
    story.game.sound.inTunnel = true;
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
    other: {
      look: 'Der andere Joseph. Er sieht aus wie ich – nur hundert Runden müder.',
      use: (story) => talkToOther(story),
      items: {
        photo: (story) => showPhoto(story),
        scarf: (story) => askForScarf(story),
        scarfRope: 'Die Schals gehören an den Hebel, nicht an ihn.',
        flashlight: 'Ich leuchte niemandem mehr ins Gesicht. Schon gar nicht mir selbst.',
        switchKey: (story) => other(story, 'Den Schlüssel brauchst du am Hebel, nicht bei mir.'),
        other: (story) => other(story, 'Was soll ich damit, Joseph?'),
      },
    },

    lever: {
      look: (story) => {
        const f = story.flags;
        if (f.leverTied) return story.say('Festgebunden mit zwei Schals. Die Weiche zeigt zur Ausfahrt.');
        if (f.leverLocked === false) return story.say('Der Hebel von Weiche 7. Er steht auf „Kreis“.');
        return story.say('Der Hebel von Weiche 7. Mit einem Vorhängeschloss gesichert. Auf dem Kasten: „W7“.');
      },
      use: (story) => {
        const f = story.flags;
        if (f.leverTied) return story.say('Der hält. Zwei Schals, doppelter Knoten.');
        if (f.leverLocked !== false) return story.say('Abgeschlossen. Da gehört der Weichenschlüssel hinein.');
        return throwLever(story);
      },
      items: {
        switchKey: (story) => unlockLever(story),
        scarf: (story) => tieShort(story),
        scarfOther: (story) => tieShort(story),
        scarfRope: (story) => tieLever(story),
        vierkant: 'Kein Vierkant – ein Vorhängeschloss.',
        other: 'Damit halte ich den Hebel nicht fest.',
      },
    },

    loco: {
      look: 'Die Lok. Der Scheinwerfer brennt. Vorne am Rahmen sitzt das Bremsventil – die Notbremse hält den ganzen Zug fest.',
      use: (story) => board(story),
      items: {
        vierkant: (story) => releaseBrake(story),
        other: 'Das gehört nicht an die Lok.',
      },
    },

    signal: {
      look: (story) => (story.flags.leverTied
        ? story.say('Das Signal ist grün. Die Ausfahrt ist frei.')
        : story.say('Das Signal für den Abzweig steht auf Rot.')),
    },

    exit: {
      look: 'Da hinten, durch den Durchbruch in der Wand … ist das Morgenlicht?',
      use: 'Zu Fuß? Nein. Der Zug muss da durch – mit uns beiden.',
    },

    camp: {
      look: 'Seine Nische: eine Decke, eine Kerze, ein Stapel Briefe. Hier hat er gewohnt. Hundert Runden lang.',
      use: async (story) => {
        story.sound('paper');
        await story.say('Der oberste Brief: „Runde 99. Er kommt. Diesmal kommt er bis zum Tunnel.“');
      },
    },

    tally: { look: 'Striche, in Fünfer-Bündeln. Ich zähle … hundert. Hundert Runden.' },

    camera: {
      look: async (story) => {
        await story.say('Die Tunnelkamera! Ihr Bild habe ich im ersten Abteil auf dem Bildschirm gesehen.');
        await story.say('Und die Gestalt, die dort durchs Bild lief … das war er.');
      },
    },

    five: { look: 'Die große 5 – die erste Ziffer für die Tür im ersten Abteil. Er hat sie hierher gemalt. Für mich.' },

    track: { look: 'Das Hauptgleis. Es führt in die Dunkelheit – und kommt auf der anderen Seite des Kreises wieder heraus.' },
  },

  hint: (story) => hintFor(story, currentGoal(story)),
};

function other(story, text) {
  return story.speak(text, { at: { x: OTHER.x, y: OTHER.y - 290 }, color: VOICES.stranger });
}

// ============================================================================================
//  Ankommen
// ============================================================================================

async function arrive(story, { quick = false } = {}) {
  story.player.facing = 'back';
  if (!quick) {
    await story.cutscene(async () => {
      await story.wait(0.4);
      story.sound('footsteps');
      story.fadeIn(2);
      await story.wait(1.6);
      await story.say('Ich bin am ganzen Zug entlang nach vorn gelaufen. Am Postwagen vorbei, am Gepäckwagen, am Speisewagen …');
      await story.say('Überall Licht in den Fenstern. Aber niemand schaut heraus.');
      await story.say('Und hier, vor der Lok: Weiche 7.');
      await other(story, 'Du bist gekommen.');
    });
  }
  story.note('Im Tunnel, vor der Lok: Weiche 7. Der andere Joseph wartet dort. Hinten in der Tunnelwand: ein Durchbruch, durch den Licht fällt – die Ausfahrt.');
}

// ============================================================================================
//  Der andere Joseph
// ============================================================================================

async function talkToOther(story) {
  const f = story.flags;
  f.met = true;
  const asked = (f.asked ??= {});
  for (;;) {
    const options = [
      { id: 'why', text: 'Warum bist du im Tunnel geblieben?' },
      { id: 'help', text: 'Hilf mir. Wir fahren zusammen hier raus.' },
    ];
    if (story.has('scarf') && !story.has('scarfOther') && !story.has('scarfRope') && !f.leverTied) options.push({ id: 'scarf', text: 'Gib mir deinen Schal.' });
    options.push({ id: 'led', text: 'Warum hast du mich bis hierher geführt?' });
    options.push({ id: 'bye', text: 'Warte kurz.' });
    const index = await story.choose(options.map((o) => ({ text: o.text, used: asked[o.id] })), 'Der andere Joseph');
    const choice = options[index]?.id;
    if (!choice || choice === 'bye') return;
    asked[choice] = true;
    if (choice === 'scarf') {
      await askForScarf(story);
      continue;
    }
    await story.say(options[index].text);
    if (choice === 'why') {
      await other(story, 'In Runde 7 habe ich den Hebel gehalten. Du bist gefahren. Aber kaum war die Lok drüber, ist er mir aus der Hand gesprungen.');
      await other(story, 'Der Zug fuhr wieder im Kreis. Und ich stand allein im Dunkeln. Seitdem setzt mich der Tunnel nicht mehr zurück.');
      await other(story, 'Ich vergesse nichts. Und ich schlafe nicht.');
    } else if (choice === 'help') {
      if (f.trust) {
        await other(story, 'Ich bin hier, Joseph. Diesmal steige ich mit ein.');
      } else {
        await other(story, 'Zusammen? Einer muss den Hebel halten, während der Zug drüberfährt. Einer bleibt immer hier.');
        await other(story, 'Das war ich. Das bin ich.');
      }
    } else {
      await other(story, 'Weil ich es allein nicht schaffe. Und weil du schlafen darfst – und ich nicht.');
      await other(story, 'Ich wollte, dass wenigstens einer von uns hier rauskommt.');
    }
  }
}

async function askForScarf(story) {
  const f = story.flags;
  if (f.trust) return other(story, 'Den hast du doch schon.');
  await story.say('Gib mir deinen Schal. Für den Hebel.');
  await other(story, 'Meinen Schal? Ein Schal hält keine Weiche. Glaub mir – ich habe alles versucht.');
  await story.say('Einer nicht. Aber zwei?');
  await other(story, '… Du redest wie früher. Wie damals, ganz am Anfang.');
  if (!f.scarfAsked) {
    f.scarfAsked = true;
    story.note('Er will mir seinen Schal nicht geben – er glaubt nicht mehr daran. „Du redest wie früher. Wie damals, ganz am Anfang.“');
  }
}

async function showPhoto(story) {
  const f = story.flags;
  if (f.trust) return other(story, 'Ich weiß. Wir zwei.');
  await story.cutscene(async () => {
    f.met = true;
    story.sound('paper');
    await story.say('Erinnerst du dich? Runde 1. Wir zwei auf dem Bahnsteig.');
    await story.wait(0.8);
    await other(story, '„Nie wieder getrennt.“ … Das habe ich auf das Foto geschrieben.');
    await other(story, 'Ich habe es vergessen. Ausgerechnet ich, der nie etwas vergisst.');
    await story.wait(0.8);
    await other(story, 'Gut. Hier – mein Schal. Wenn du meinst, dass zwei halten, was einer nicht hält.');
    story.give('scarfOther');
    f.trust = true;
    story.note('Ich habe ihm das Foto aus Runde 1 gezeigt. Er hat mir seinen Schal gegeben. „Diesmal steige ich mit ein.“');
  });
}

// ============================================================================================
//  Weiche 7
// ============================================================================================

async function unlockLever(story) {
  const f = story.flags;
  if (f.leverLocked === false) return story.say('Das Schloss ist schon ab.');
  story.sound('key');
  await story.wait(0.6);
  story.sound('unlock');
  f.leverLocked = false;
  await story.say('Der Weichenschlüssel passt. Das Vorhängeschloss fällt in den Schotter.');
  story.note('Der Hebel von Weiche 7 ist aufgeschlossen.');
}

async function throwLever(story) {
  const f = story.flags;
  const first = !f.leverTried;
  await story.cutscene(async () => {
    await story.say('Ich lege mich gegen den Hebel …');
    story.sound('lever');
    await story.wait(0.6);
    f.leverHeld = true;
    await story.say('Die Zungen schwenken um. Das Signal springt auf Grün!');
    await story.wait(0.4);
    await story.say('Und jetzt … loslassen.');
    story.sound('springBack');
    f.leverHeld = false;
    await story.wait(0.6);
    await story.say('Zurückgesprungen! Sobald ich loslasse, steht die Weiche wieder auf „Kreis“.');
    f.leverTried = true;
    if (!first) return;
    await other(story, 'Siehst du? Einer muss ihn halten, während der Zug drüberfährt. Und der bleibt hier. So war es in Runde 7.');
    await story.say('Dann binden wir ihn eben fest. Mit … meinem Schal!');
    story.give('scarf');
    story.note('Weiche 7 springt zurück, sobald man loslässt. Idee: den Hebel festbinden – mit meinem Schal.');
  });
}

async function tieShort(story) {
  const f = story.flags;
  if (f.leverLocked !== false) return story.say('Erst muss das Schloss ab.');
  await story.say('Ich knote den Schal an den Hebel und ziehe ihn zur Schwelle hinunter …');
  await story.say('Zu kurz. Bis zum Ring an der Schwelle fehlt ein ganzes Stück. Ein zweiter Schal würde reichen.');
  if (!f.shortNoted) {
    f.shortNoted = true;
    story.note('Ein Schal ist zu kurz, um den Hebel festzubinden. Mit zwei Schals würde es reichen – er trägt auch einen.');
  }
}

async function tieLever(story) {
  const f = story.flags;
  if (f.leverLocked !== false) return story.say('Erst muss das Schloss ab.');
  await story.cutscene(async () => {
    await story.say('Ich lege den Hebel um …');
    story.sound('lever');
    await story.wait(0.6);
    f.leverHeld = true;
    await story.say('… und binde ihn fest. Zwei Schals, doppelter Knoten, am Ring an der Schwelle.');
    story.remove('scarfRope');
    f.leverTied = true;
    f.leverHeld = false;
    await story.wait(0.6);
    await story.say('Ich lasse los …');
    await story.wait(1.2);
    story.sound('success');
    await story.say('Er hält!');
    await other(story, '… Es hält. Nach hundert Runden.');
    story.note('Der Hebel von Weiche 7 ist mit unseren beiden Schals festgebunden. Das Signal ist grün.');
    if (!f.brakeReleased) await other(story, 'Jetzt muss nur noch die Notbremse los. Das Ventil an der Lok – mit einem Vierkant.');
  });
}

// ============================================================================================
//  Lok: Bremse lösen, einsteigen, das Ende
// ============================================================================================

async function releaseBrake(story) {
  const f = story.flags;
  if (f.brakeReleased) return story.say('Die Bremse ist schon gelöst.');
  story.sound('key');
  await story.wait(0.5);
  story.sound('hiss');
  f.brakeReleased = true;
  await story.say('Herrn Brandts Vierkant passt ins Bremsventil. Eine halbe Drehung …');
  await story.say('Zischhh. Die Notbremse ist gelöst.');
  story.note('Mit Brandts Vierkant habe ich die Notbremse an der Lok gelöst.');
  if (!f.leverTied) await other(story, 'Steig noch nicht ein! Sonst fährt er wieder im Kreis.');
}

async function board(story) {
  const f = story.flags;
  if (!f.brakeReleased) return story.say('Die Notbremse hält den Zug fest. Das Bremsventil sitzt bombenfest – da gehört ein Vierkant hinein.');
  if (!f.leverTied) return story.say('Wenn ich jetzt einsteige, fährt der Zug wieder im Kreis. Erst die Weiche.');
  if (!f.trust) return story.say('Ohne ihn fahre ich nicht. Nie wieder getrennt.');
  await story.cutscene(async () => {
    await story.say('Komm. Wir steigen ein.');
    f.otherFacing = 'front';
    await other(story, 'Und wenn es nicht hält?');
    await story.say('Dann fahren wir eben noch eine Runde. Zusammen.');
    await other(story, '… Zusammen.');
    story.sound('footsteps');
    await story.fadeOut(1.6);
    f.otherHere = false;
    story.sound('trainStart');
    await story.wait(1.5);
    await story.card({ draw: (ctx, card) => drawDawn(ctx, Math.min(1, card.age / 7)) });
    await story.card({
      kind: 'end',
      title: 'Ende',
      lines: [
        'Zum ersten Mal fährt der Zug geradeaus – hinaus in den Morgen.',
        'Detective Joseph hat seinen schwierigsten Fall gelöst: sich selbst.',
        'Und dann, endlich, schlafen sie ein. Alle beide.',
      ],
      continueText: 'Klicken, um zum Titelbild zurückzukehren',
    });
    saveProgress(1);
    location.reload();
  });
}

// ============================================================================================
//  Tipps
// ============================================================================================

function currentGoal(story) {
  const f = story.flags;
  if (!f.met) return { id: 'talk', lines: ['Er wartet an der Weiche. Ich rede mit ihm.', 'Linksklick auf den anderen Joseph.'] };
  if (f.leverLocked !== false) {
    return { id: 'unlock', lines: [
      'Der Weichenhebel hat ein Vorhängeschloss. Ich habe den Weichenschlüssel „W7“.',
      'Weichenschlüssel im Inventar anklicken, dann den Weichenhebel.',
    ] };
  }
  if (!f.leverTried) return { id: 'lever', lines: ['Jetzt den Hebel umlegen.', 'Linksklick auf den Weichenhebel.'] };
  if (!f.leverTied && !story.has('scarfOther') && !story.has('scarfRope')) {
    return { id: 'trust', lines: [
      'Mein Schal ist zu kurz. Zwei würden reichen – er trägt auch einen.',
      'Er glaubt nicht mehr daran. Vielleicht erinnert ihn etwas an früher … an Runde 1.',
      'Das Foto aus Koffer Nr. 7 im Inventar anklicken, dann den anderen Joseph.',
    ] };
  }
  if (!f.leverTied && !story.has('scarfRope')) return { id: 'combine', lines: ['Zwei Schals – die knote ich zusammen.', 'Meinen Schal im Inventar anklicken, dann seinen.'] };
  if (!f.leverTied) return { id: 'tie', lines: ['Mit den verknoteten Schals den Hebel festbinden.', 'Die Schals im Inventar anklicken, dann den Weichenhebel.'] };
  if (!f.brakeReleased) {
    return { id: 'brake', lines: [
      'Die Notbremse hält den Zug noch fest. Vorne an der Lok ist das Bremsventil.',
      'Brandts Vierkant passt ins Bremsventil: Vierkant im Inventar anklicken, dann die Lok.',
    ] };
  }
  return { id: 'board', lines: ['Jetzt einsteigen – zusammen.', 'Linksklick auf die Lok.'] };
}
