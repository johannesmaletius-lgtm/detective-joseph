// Das Tutorial: Hinweise, die Schritt für Schritt erklären, wie das Spiel funktioniert.
//
// Jeder Schritt hat
//   text:      was im Hinweisschild oben steht
//   done:      wann der Schritt erledigt ist (dann kommt der nächste)
//   show:      (optional) erst zeigen, wenn das zutrifft – z. B. erst, wenn Joseph das Messer hat
//   duration:  (optional) nach so vielen Sekunden von selbst erledigt
//
// Erledigte Schritte werden übersprungen – wer etwas schon von allein gemacht hat, sieht den
// Hinweis dazu gar nicht erst. Während Zwischensequenzen und offener Fenster bleibt das Schild weg.

export const TUTORIAL_WAGON1 = [
  {
    text: 'Klicke auf den Boden – Joseph läuft dorthin. Doppelklick: Er rennt.',
    done: (story) => story.happened('walked'),
  },
  {
    text: 'Bewege die Maus durchs Abteil. Wo sich der Zeiger verändert, gibt es etwas zu entdecken – der Name steht daneben.',
    done: (story) => story.happened('hovered'),
  },
  {
    text: 'Rechtsklick = anschauen. Schau dir zum Beispiel die Tür genauer an.',
    done: (story) => story.happened('looked'),
  },
  {
    text: 'Linksklick = benutzen, nehmen oder ansprechen. Am Schaltpult rechts neben der Tür steckt ein Brief – nimm ihn.',
    done: (story) => story.has('letter'),
  },
  {
    text: 'Fahr mit der Maus an den unteren Bildrand: Dort ist dein Inventar. Rechtsklick auf den Brief = lesen.',
    done: (story) => story.flags.letterRead,
  },
  {
    text: 'Was Joseph herausfindet, schreibt er ins Notizbuch (oben rechts oder Taste N). Wenn du nicht weiterweißt: dort nachsehen!',
    done: (story) => story.happened('openedNotebook'),
  },
  {
    text: 'Sieh dich weiter um. Der Rucksack an der Wand links sieht vielversprechend aus.',
    done: (story) => story.flags.backpackSearched,
  },
  {
    text: 'Gegenstand benutzen: Klicke im Inventar einen Gegenstand an und dann eine Stelle im Abteil. Vielleicht passt das Messer an die Klappe des Schaltpults?',
    show: (story) => story.has('knife'),
    done: (story) => story.happened('usedItem') || story.flags.coverOpen,
  },
  {
    text: 'Kombinieren: Klicke einen Gegenstand im Inventar an und dann einen anderen – zum Beispiel die Batterie und die Taschenlampe.',
    show: (story) => story.has('battery') && story.has('flashlightEmpty'),
    done: (story) => story.has('flashlight'),
  },
  {
    text: 'Tipp: Auf einer Sitzbank kann Joseph bis zum nächsten Tunnel warten.',
    show: (story) => story.has('flashlight') && !story.isDark,
    done: (story) => story.happened('waited') || story.isDark || story.flags.seenScratches,
  },
  {
    text: 'Im Dunkeln leuchtet die Taschenlampe dorthin, wo der Mauszeiger ist. Leuchte die Tür ab!',
    show: (story) => story.has('flashlight') && story.isDark,
    done: (story) => story.flags.seenScratches,
    duration: 14,
  },
  {
    text: 'Den Rest schaffst du allein. Viel Glück, Detective!',
    show: (story) => story.has('flashlight') && !story.isDark,
    duration: 6,
  },
];

export class Tutorial {
  constructor(steps) {
    this.steps = steps.map((step) => ({ ...step, finished: false, shownFor: 0 }));
  }

  update(dt, story, hints) {
    for (const step of this.steps) {
      if (!step.finished && step.done?.(story)) step.finished = true;
    }
    const current = this.steps.find((step) => !step.finished);
    const { overlay, notebook, codeLock } = story.game;
    const paused = story.inCutscene || overlay.blocksInput || overlay.fade > 0.5 || notebook.isOpen || codeLock.isOpen;
    if (!current || paused || !(current.show?.(story) ?? true)) {
      hints.hide();
      return;
    }
    hints.show(current.text);
    current.shownFor += dt;
    if (current.duration && current.shownFor >= current.duration) current.finished = true;
  }
}
