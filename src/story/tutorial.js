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
    duration: 25,
  },
  {
    text: 'Rechtsklick = anschauen. Schau dir zum Beispiel die Tür genauer an.',
    done: (story) => story.happened('looked'),
    duration: 30,
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
    duration: 25,
  },
  {
    text: 'Sieh dich um. Der Rucksack an der Wand links sieht vielversprechend aus.',
    done: (story) => story.flags.backpackSearched,
  },
  {
    text: 'Gegenstand benutzen: Klicke im Inventar einen Gegenstand an und dann eine Stelle im Abteil. Wozu passt wohl der kleine Schlüssel?',
    show: (story) => story.has('key'),
    done: (story) => story.happened('usedItem') || story.flags.toolboxOpen,
  },
  {
    text: 'Manche Gegenstände kann man sich genauer vornehmen: Rechtsklick auf die Papierfetzen im Inventar – versuch sie zusammenzusetzen.',
    show: (story) => (story.flags.pieces ?? 0) >= 2,
    done: (story) => story.happened('openedJigsaw'),
  },
  {
    text: 'Kombinieren: Klicke einen Gegenstand im Inventar an und dann einen anderen – zum Beispiel die Batterie und die Taschenlampe.',
    show: (story) => story.has('battery') && (story.has('flashlightEmpty') || story.has('flashlightHalf')),
    done: (story) => story.happened('combined'),
  },
  {
    text: 'Festgefahren? Taste H (oder „Tipp“ im Notizbuch): Joseph denkt laut nach. Je öfter du fragst, desto deutlicher wird er.',
    show: (story) => story.flags.backpackSearched && story.flags.letterRead,
    done: (story) => story.happened('askedHint'),
    duration: 12,
  },
  {
    text: 'Tipp: Auf einer Sitzbank kann Joseph bis zum nächsten Tunnel warten.',
    show: (story) => (story.flags.tunnels ?? 0) >= 1 && !story.isDark,
    done: (story) => story.happened('waited') || story.flags.seenScratches,
    duration: 12,
  },
  {
    text: 'Im Dunkeln leuchtet die Taschenlampe dorthin, wo der Mauszeiger ist. Leuchte die Tür ab!',
    show: (story) => story.has('flashlight') && story.isDark,
    done: (story) => story.flags.seenScratches,
    duration: 14,
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
    const { overlay, notebook, view } = story.game;
    const paused = story.inCutscene || overlay.blocksInput || overlay.fade > 0.5 || notebook.isOpen || view !== null;
    if (!current || paused || !(current.show?.(story) ?? true)) {
      hints.hide();
      return;
    }
    hints.show(current.text);
    current.shownFor += dt;
    if (current.duration && current.shownFor >= current.duration) current.finished = true;
  }
}
